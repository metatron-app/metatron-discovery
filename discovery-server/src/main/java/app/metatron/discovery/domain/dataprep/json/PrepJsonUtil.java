package app.metatron.discovery.domain.dataprep.json;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;

import app.metatron.discovery.domain.dataprep.PrepUtil;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Types;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletOutputStream;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.ContentSummary;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepJsonUtil {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepJsonUtil.class);

  /**
   * @param strUri      URI as String (to be java.net.URI)
   * @param limitRows   Read not more than this
   * @param conf        Hadoop configuration which is mandatory when the url's protocol is hdfs
   * @param onlyCount   If true, just fill result.totalRows and result.totalBytes
   *
   * @return PrepCsvParseResult: grid, header, maxColCnt
   *
   *  Sorry for so many try-catches. Sacrificed readability for end-users' usability.
   */
  public static PrepJsonParseResult parseJson(String strUri, int limitRows, Integer columnCount, Configuration conf, boolean onlyCount) {
    PrepJsonParseResult result = new PrepJsonParseResult();
    BufferedReader reader;
    URI uri;

    LOGGER.debug("PrepSnapshotService.parseJson(): strUri={} conf={}", strUri, conf);

    try {
      uri = new URI(strUri);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strUri);
    }

    switch (uri.getScheme()) {
      case "hdfs":
        if (conf == null) {
          throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
        }
        Path path = new Path(uri);

        FileSystem hdfsFs;
        try {
          hdfsFs = FileSystem.get(conf);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_GET_HDFS_FILE_SYSTEM, strUri);
        }

        FSDataInputStream his;
        try {
          if (onlyCount) {
            ContentSummary cSummary = hdfsFs.getContentSummary(path);
            result.totalBytes = cSummary.getLength();
          }

          his = hdfsFs.open(path);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_HDFS_PATH, strUri);
        }

        reader = new BufferedReader(new InputStreamReader(his));
        break;

      case "file":
        File file = new File(uri);
        if (onlyCount) {
          result.totalBytes = file.length();
        }

        FileInputStream fis;
        try {
          fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_LOCAL_PATH, strUri);
        }

        reader = new BufferedReader(new InputStreamReader(fis));
        break;

      default:
        throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
    }

    ObjectMapper mapper = new ObjectMapper();
    String line = "";

    try {
      result.colNames = Lists.newArrayList();
      result.maxColCnt = 0;
      StringBuffer sb = new StringBuffer();
      while((line = reader.readLine())!=null && result.totalRows <limitRows) {
        Map<String, Object> jsonRow = null;

        try {
          sb.append(line);
          jsonRow = mapper.readValue(sb.toString(), new TypeReference<Map<String, Object>>() {
          });
          sb.delete(0,sb.length());
        } catch (JsonParseException e) {
          LOGGER.debug("Incomplete JSON string.", e);
          continue;
        }

        if (onlyCount) {
          result.totalRows++;
          continue;
        }

        for(String jsonKey : jsonRow.keySet()) {
          if( result.colNames.contains(jsonKey) == false ) {
            result.colNames.add(jsonKey);
          }
        }

        int colCnt = result.colNames.size();
        if(columnCount!=null) {
          colCnt = columnCount;
        }
        result.maxColCnt = colCnt;

        String[] row = new String[result.maxColCnt];
        for(int i=0; i<result.maxColCnt; i++ ) {
          String colName = result.colNames.get(i);
          if( jsonRow.containsKey(colName) == true ) {
            Object obj = jsonRow.get(colName);
            row[i] = (obj==null)?null:obj.toString();
          }
        }
        result.grid.add(row);
      }
    } catch (IOException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_JSON, strUri);
    }

    return result;
  }

  public static PrepJsonParseResult parseJson(String strUri, int limitRows, Integer columnCount, Configuration conf) {
    return parseJson(strUri, limitRows, columnCount, conf, false);
  }

  /**
   * @param strUri      URI as String (to be java.net.URI)
   * @param limitRows   Read not more than this
   * @param conf        Hadoop configuration which is mandatory when the url's protocol is hdfs
   *
   * @return Long: total Row count
   *
   *  Sorry for so many try-catches. Sacrificed readability for end-users' usability.
   */
  public static Map<String, Long> countJson(String strUri, int limitRows, Configuration conf) {
    Map<String, Long> mapTotal = new HashMap();
    PrepJsonParseResult result = parseJson(strUri, limitRows, null, conf, true);
    mapTotal.put("totalRows", result.totalRows);
    mapTotal.put("totalBytes", result.totalBytes);
    return mapTotal;
  }

  /**
   * @param strUri      URI as String (to be java.net.URI)
   * @param conf        Hadoop configuration which is mandatory when the url's protocol is hdfs
   *
   *  header will be false for table-type snapshots.
   */
  public static PrintWriter getJsonPrinter(String strUri, Configuration conf) {
    PrintWriter printWriter;
    URI uri;

    try {
      uri = new URI(strUri);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strUri);
    }

    switch (uri.getScheme()) {
      case "hdfs":
        if (conf == null) {
          throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
        }
        Path path = new Path(uri);

        FileSystem hdfsFs;
        try {
          hdfsFs = FileSystem.get(conf);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_GET_HDFS_FILE_SYSTEM, strUri);
        }

        FSDataOutputStream hos;
        try {
          hos = hdfsFs.create(path);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_HDFS_PATH, strUri);
        }

        printWriter = new PrintWriter(new BufferedWriter( new OutputStreamWriter(hos)));
        break;

      case "file":
        File file = new File(uri);
        File dirParent = file.getParentFile();
        if(dirParent==null) {
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_LOCAL_PATH, strUri);
        }
        if(false==dirParent.exists()) {
          if(false==dirParent.mkdirs()) {
            throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_LOCAL_PATH, strUri);
          }
        }

        FileOutputStream fos;
        try {
          fos = new FileOutputStream(file);
        } catch (FileNotFoundException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_LOCAL_PATH, strUri);
        }

        printWriter = new PrintWriter(new BufferedWriter( new OutputStreamWriter(fos)));
        break;

      default:
        throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
    }

    return printWriter;
  }

  /**
   * @param rs    hive query result-set
   * @param outputStream    outputStream for file writing
   * @param dbName   dbName needed for column name generating
   *
   *  Sorry for so many try-catches. Sacrificed readability for end-users' usability.
   */
  public static void writeHiveTableAsJSON(ResultSet rs, ServletOutputStream outputStream, String dbName) {
    try {
      ResultSetMetaData rsmd = rs.getMetaData();
      int columnCount = rsmd.getColumnCount();
      String[] columnNames = new String[columnCount+1];
      int[] columnTypes = new int[columnCount+1];
      StringBuffer sb;
      for (int columnIdx = 1; columnIdx <= columnCount; columnIdx++) {
        String colName = rsmd.getColumnName(columnIdx);
        if (colName.startsWith(dbName + ".")) {
          colName = colName.substring(dbName.length() + 1);
        }
        colName = "\""+colName.replaceAll("\"","\\\"")+"\"";
        columnNames[columnIdx] = colName;

        int colType = rsmd.getColumnType(columnIdx);
        columnTypes[columnIdx] = colType;
      }

      while (rs.next()) {
        sb = new StringBuffer();
        sb.append("{");
        for (int columnIdx = 1; columnIdx <= columnCount; columnIdx++) {
          String columnValue = rs.getString(columnIdx);
          if (1 < columnIdx) {
            sb.append(",");
          }
          sb.append(columnNames[columnIdx]);
          sb.append(":");
          sb.append(escapeForJSON(columnValue, columnTypes[columnIdx]));
        }
        sb.append("}\n");
        outputStream.write(sb.toString().getBytes());
      }
    }  catch (Exception e) {
      LOGGER.error("Failed to write hive table as CSV file : {}", e.getMessage());
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }
  }

  private static String escapeForJSON(String value, int colType) {
    if(colType == Types.DOUBLE || colType == Types.BIGINT || colType == Types.BOOLEAN) {
      return value;
    }
    if(value.contains("\"")) {
      value = value.replaceAll("\"","\\\\\"");
    }

    return "\"" + value + "\"";
  }
}
