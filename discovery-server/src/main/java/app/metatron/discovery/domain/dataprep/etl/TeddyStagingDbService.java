package app.metatron.discovery.domain.dataprep.etl;

import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_LIMIT_ROWS;
import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_MAX_FETCH_SIZE;
import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_HOSTNAME;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_METASTORE_URI;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_PASSWORD;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_PORT;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_USERNAME;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.TABLE_CREATING;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.snapshotError;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_COMPRESSION;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_FORMAT;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.service.PrSnapshotService;
import app.metatron.discovery.domain.dataprep.teddy.ColumnDescription;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.util.HiveInfo;
import app.metatron.discovery.domain.dataprep.util.PrepUtil;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TeddyStagingDbService {

  private static Logger LOGGER = LoggerFactory.getLogger(TeddyExecutor.class);

  @Autowired
  TeddyFileService fileService;

  @Autowired
  PrSnapshotService snapshotService;

  @Autowired
  TeddyExecCallback callback;

  private String hadoopConfDir;
  private Configuration hadoopConf = null;
  private Integer limitRows = null;
  private Integer maxFetchSize = null;

  String hiveHostname;
  Integer hivePort;
  String hiveUsername;
  String hivePassword;
  String hiveMetastoreUri;

  public void setPrepPropertiesInfo(Map<String, Object> prepPropertiesInfo) {
    hadoopConfDir = (String) prepPropertiesInfo.get(HADOOP_CONF_DIR);
    limitRows = (Integer) prepPropertiesInfo.get(ETL_LIMIT_ROWS);
    maxFetchSize = (Integer) prepPropertiesInfo.get(ETL_MAX_FETCH_SIZE);

    hiveHostname = (String) prepPropertiesInfo.get(STAGEDB_HOSTNAME);
    hivePort = (Integer) prepPropertiesInfo.get(STAGEDB_PORT);
    hiveUsername = (String) prepPropertiesInfo.get(STAGEDB_USERNAME);
    hivePassword = (String) prepPropertiesInfo.get(STAGEDB_PASSWORD);
    hiveMetastoreUri = (String) prepPropertiesInfo.get(STAGEDB_METASTORE_URI);

    if (hadoopConfDir != null) {
      hadoopConf = PrepUtil.getHadoopConf(hadoopConfDir);
    }
  }

  /**
   * NOTE: Teddy Engine does not support partitioning.
   *
   * @param df Teddy DataFrame
   * @param snapshotInfo map from transform service
   */
  public void createSnapshot(DataFrame df, Map<String, Object> snapshotInfo)
          throws TeddyException, SQLException, IOException, ClassNotFoundException,
          TimeoutException, URISyntaxException {
    LOGGER.info("hadoopConfDir={}", hadoopConfDir);
    LOGGER.info("hive: hostname={} port={} username={}", hiveHostname, hivePort, hiveUsername);

    LOGGER.info("run(): adding hadoop config files (if exists): " + hadoopConfDir);

    df.checkAlphaNumericalColNames();

    String ssId = (String) snapshotInfo.get("ssId");
    HiveInfo hiveInfo = new HiveInfo(snapshotInfo);

    // TODO: Why should lines with null values be omitted?
    writeExternalFile(ssId, df, hiveInfo);

    callback.updateStatus(ssId, TABLE_CREATING);
    makeHiveTable(ssId, df, hiveInfo);
  }

  private String processArray(ColumnDescription colDesc) {
    ColumnType uniformSubType = colDesc.hasUniformSubType();
    String strType;

    switch (uniformSubType) {
      case STRING:
        strType = "array<string>";
        break;
      case LONG:
        strType = "array<bigint>";
        break;
      case DOUBLE:
        strType = "array<double>";
        break;
      case BOOLEAN:
        strType = "array<boolean>";
        break;
      case TIMESTAMP:
        strType = "array<timestamp>";
        break;
      default:
        StringBuffer sb = new StringBuffer();
        sb.append("struct<");
        for (int i = 0; i < colDesc.getArrColDesc().size(); i++) {
          ColumnDescription subColDesc = colDesc.getArrColDesc().get(i);
          if (i > 0) {
            sb.append(",");
          }
          sb.append(String.format("c%d:%s", i, fromColumnTypetoHiveType(subColDesc.getType(), subColDesc)));
        }
        strType = sb.append(">").toString();
        break;
    }
    return strType;
  }

  private String processMap(ColumnDescription colDesc) {
    StringBuffer sb = new StringBuffer();
    sb.append("struct<");

    List<String> keys = colDesc.getMapColDesc().keySet().stream().collect(Collectors.toList());
    for (int i = 0; i < keys.size(); i++) {
      String key = keys.get(i);
      ColumnDescription subColDesc = colDesc.getMapColDesc().get(key);
      if (i > 0) {
        sb.append(",");
      }
      sb.append(String.format("%s:%s", key, fromColumnTypetoHiveType(subColDesc.getType(), subColDesc)));
    }
    return sb.append(">").toString();
  }

  public String fromColumnTypetoHiveType(ColumnType colType, ColumnDescription colDesc) {
    switch (colType) {
      case STRING:
        return "string";
      case LONG:
        return "bigint";
      case DOUBLE:
        return "double";
      case BOOLEAN:
        return "boolean";
      case TIMESTAMP:
        return "timestamp";
      case ARRAY:
        return processArray(colDesc);
      case MAP:
        return processMap(colDesc);
      case UNKNOWN:
        assert false : colType;
    }
    return null;
  }

  private String buildCreateTableSql(String ssId, DataFrame df, HiveInfo hiveInfo) throws IOException {
    LOGGER.debug("buildCreateTableStmt(): start: ssId={} dsName={} hiveInfo={}", ssId, df.dsName, hiveInfo);

    StringBuffer sbSql = new StringBuffer(String.format("CREATE EXTERNAL TABLE %s (", getFullTblName(hiveInfo)));

    for (int colno = 0; colno < df.getColCnt(); colno++) {
      sbSql.append(String.format("`%s` ", df.getColName(colno)));
      sbSql.append(fromColumnTypetoHiveType(df.getColType(colno), df.getColDesc(colno)));
      sbSql.append(", ");
    }

    sbSql.setLength(sbSql.length() - 2);  // remove ", "
    sbSql.append(")");

    switch (hiveInfo.format) {
      case CSV:
        // By the method below, we cannot designate the quote character.
        // We cannot prevent the comma from spliting even if it's inside quotes.
        // Instead, we can preserve the types. (cf. see the other method)
        sbSql.append(String.format(
                " ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE LOCATION '%s'",
                getFullExtDir(hiveInfo)));

        // By the method below, we can designate the quote character.
        // But all the columns loose their types and become strings.
        //        String quote = "\"";
        //        String slash = "\\";
        //        createTable.append(" ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde' ");
        //        createTable.append("WITH SERDEPROPERTIES (");
        //        createTable.append(String.format("%sseparatorChar%s = %s%s,%s, ", quote, quote, quote, slash, quote));        // "separatorChar" = "\,",
        //        createTable.append(String.format("%squoteChar%s     = %s%s%s%s", quote, quote, quote, slash, quote, quote));  // "quoteChar"     = "\""
        //        createTable.append(")");
        //        createTable.append(String.format(" STORED AS TEXTFILE LOCATION '%s'", location));
        break;

      case ORC:
        sbSql.append(String.format(
                " STORED AS ORC LOCATION '%s' TBLPROPERTIES (\"orc.compress\"=\"%s\")",
                getFullExtDir(hiveInfo), hiveInfo.compression.name()));
        break;
    }

    return sbSql.toString();
  }

  private Statement getHiveStatement() throws SQLException, ClassNotFoundException {
    DataConnection hiveConn = new DataConnection();

    hiveConn.setImplementor("HIVE");
    hiveConn.setHostname(hiveHostname);
    hiveConn.setPort(Integer.valueOf(hivePort));
    hiveConn.setUsername(hiveUsername);
    hiveConn.setPassword(hivePassword);
    hiveConn.setUrl(hiveMetastoreUri);

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(hiveConn);
    Statement stmt;
    Connection conn;
    try {
      conn = jdbcDataAccessor.getConnection();
      conn.setAutoCommit(false);
      stmt = conn.createStatement();
      stmt.setFetchSize(maxFetchSize);
    } catch (SQLException e) {
      LOGGER.error(String.format("getHiveStatement(): SQLException occurred: connStr=%s username=%s password=%s",
              jdbcDataAccessor.getDialect().getConnectUrl(hiveConn), hiveConn.getUsername(), hiveConn.getPassword()),
              e);
      throw e;
    }
    return stmt;
  }


  public void makeHiveTable(String ssId, DataFrame df, HiveInfo hiveInfo)
          throws IOException, SQLException, ClassNotFoundException {
    LOGGER.debug("makeHiveTable(): start: ssId={} dsName={} hiveInfo={}", ssId, df.dsName, hiveInfo);

    String crSql = buildCreateTableSql(ssId, df, hiveInfo);
    String drSql = "DROP TABLE IF EXISTS " + getFullTblName(hiveInfo);
    LOGGER.info("makeHiveTable(): create table statement=" + crSql);

    Statement hiveStmt = getHiveStatement();

    try {
      hiveStmt.execute(drSql);
    } catch (SQLException e) {
      // suppress the exception (table not found)
    }

    try {
      hiveStmt.execute(crSql);
    } catch (SQLException e) {
      LOGGER.error("makeHiveTable(): failed to create table: sql=" + crSql);
      throw e;
    }
    LOGGER.trace("makeHiveTable(): end");
  }

  private String getFullTblName(HiveInfo hiveInfo) {
    return hiveInfo.dbName + "." + hiveInfo.tblName;
  }

  private String getFullExtDir(HiveInfo hiveInfo) throws IOException {
    return getFullExtDir(hiveInfo, false);
  }

  private String getFullExtDir(HiveInfo hiveInfo, boolean truncate) throws IOException {
    FileSystem fs = FileSystem.get(hadoopConf);

    Path dir = new Path(hiveInfo.extHdfsDir + "/" + hiveInfo.dbName + "/" + hiveInfo.tblName);
    if (truncate && fs.exists(dir)) {
      fs.delete(dir, true);
    }
    return dir.toString();
  }

  private void writeExternalFile(String ssId, DataFrame df, HiveInfo hiveInfo) throws IOException {
    LOGGER.debug("writeExternalFile(): start: ssId={} dsName={} hiveInfo={}", ssId, df.dsName, hiveInfo);

    HIVE_FILE_FORMAT format = hiveInfo.format;
    HIVE_FILE_COMPRESSION compression = hiveInfo.compression;

    String fullExtDir = getFullExtDir(hiveInfo, true);

    Integer[] rowCnt = new Integer[2];

    switch (format) {
      case CSV:
        String strUri = fullExtDir + File.separator + "part-00000-" + ssId + ".csv";
        rowCnt[0] = fileService.writeCsv(ssId, strUri, df);
        break;
      case ORC:
        checkColNameCase(df);
        Path file = new Path(fullExtDir + File.separator + "part-00000-" + ssId + ".orc");
        TeddyOrcWriter orcWriter = new TeddyOrcWriter();
        rowCnt = orcWriter.writeOrc(df, hadoopConf, file, compression);
        break;
    }

    saveSuccessFile(hiveInfo);
    updateLineageInfo(ssId, rowCnt);
    callback.updateSnapshot(ssId, "totalLines", String.valueOf(rowCnt[0]));

    LOGGER.trace("writeExternalFile(): end");
  }

  private void updateLineageInfo(String ssId, Integer[] rowCnt) throws JsonProcessingException {
    ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();

    if (rowCnt[1] != null && rowCnt[1] > 0) {
      Map<String, Object> lineageInfo = snapshotService.getSnapshotLineageInfo(ssId);
      lineageInfo.put("excludedLines", rowCnt[1]);
      callback.updateSnapshot(ssId, "lineageInfo", mapper.writeValueAsString(lineageInfo));
    }
  }

  private void saveSuccessFile(HiveInfo hiveInfo) throws IOException {
    FileSystem fs = FileSystem.get(hadoopConf);
    String fullExtDir = getFullExtDir(hiveInfo);

    Path success = new Path(fullExtDir + File.separator + "_SUCCESS");
    Path byTeddy = new Path(fullExtDir + File.separator + "_BY_TEDDY");

    FSDataOutputStream fin = fs.create(success);
    fin.close();
    fin = fs.create(byTeddy);
    fin.close();
  }

  private void checkColNameCase(DataFrame df) {
    for (int i = 0; i < df.getColCnt(); i++) {
      String colName = df.getColName(i);
      if (!colName.equals(colName.toLowerCase())) {
        throw snapshotError(PrepMessageKey.MSG_DP_ALERT_INVALID_SNAPSHOT_NAME, colName);
      }
    }
  }

  public DataFrame loadHiveTable(String dsId, String sql) throws SQLException, ClassNotFoundException, TeddyException {
    LOGGER.debug(String.format("loadHiveTable(): dsId=%s sql=%s", dsId, sql));

    Statement stmt = getHiveStatement();
    stmt.setFetchSize(maxFetchSize);
    DataFrame df = new DataFrame();

    df.setByJDBC(stmt, sql, limitRows);

    LOGGER.trace("loadHiveTable(): end");
    return df;
  }
}
