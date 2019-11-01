package app.metatron.discovery.domain.dataprep.etl;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.hadoop.conf.Configuration;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeoutException;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.file.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.file.PrepJsonUtil;
import app.metatron.discovery.domain.dataprep.file.PrepParseResult;
import app.metatron.discovery.domain.dataprep.file.PrepSqlUtil;
import app.metatron.discovery.domain.dataprep.service.PrSnapshotService;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.util.PrepUtil;

import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_LIMIT_ROWS;
import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_CSV;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_JSON;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_SQL;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_JSON;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_SQL;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.snapshotError;

@Service
public class TeddyFileService {

  private static Logger LOGGER = LoggerFactory.getLogger(TeddyExecutor.class);

  @Autowired
  PrSnapshotService snapshotService;

  private String hadoopConfDir;
  private Configuration hadoopConf = null;
  private Integer limitRows = null;

  public void setPrepPropertiesInfo(Map<String, Object> prepPropertiesInfo) {
    hadoopConfDir = (String) prepPropertiesInfo.get(HADOOP_CONF_DIR);
    limitRows = (Integer) prepPropertiesInfo.get(ETL_LIMIT_ROWS);

    if (hadoopConfDir != null) {
      hadoopConf = PrepUtil.getHadoopConf(hadoopConfDir);
    }
  }

  public void createSnapshot(DataFrame df, Map<String, Object> snapshotInfo)
          throws JsonProcessingException, TimeoutException, TeddyException, SQLException,
          URISyntaxException, ClassNotFoundException {
    LOGGER.info("createUriSnapshot(): started");

    String ssId = (String) snapshotInfo.get("ssId");
    String ssName = (String) snapshotInfo.get("ssName");
    String storedUri = (String) snapshotInfo.get("storedUri");

    switch (PrSnapshot.getFileFormatByUri(storedUri)) {
      case CSV:
        writeCsv(ssId, storedUri, df);
        break;
      case JSON:
        writeJson(ssId, storedUri, df);
        break;
      case SQL:
        writeSql(ssId, ssName, storedUri, df);
        break;
    }

    LOGGER.info("createUriSnapshot() finished: totalLines={}", df.rows.size());
  }

  public DataFrame loadCsvFile(String dsId, String strUri, String delimiter, Integer manualColCnt)
          throws URISyntaxException {
    DataFrame df = new DataFrame();

    LOGGER.debug("loadCsvFile(): dsId={} strUri={} delemiter={}", dsId, strUri, delimiter);

    PrepParseResult result = PrepCsvUtil.parse(strUri, delimiter, limitRows, manualColCnt, hadoopConf);
    df.setByGrid(result);

    LOGGER.debug("loadCsvFile(): done");
    return df;
  }

  public DataFrame loadJsonFile(String dsId, String strUri, Integer manualColCnt)
          throws URISyntaxException {
    DataFrame df = new DataFrame();

    LOGGER.debug("loadJsonFile(): dsId={} strUri={}", dsId, strUri);

    PrepParseResult result = PrepJsonUtil.parse(strUri, limitRows, manualColCnt, hadoopConf);
    df.setByGrid(result);

    LOGGER.debug("loadJsonFile(): done");
    return df;
  }

  public int writeCsv(String ssId, String strUri, DataFrame df) {
    CSVPrinter printer = PrepCsvUtil.getPrinter(strUri, hadoopConf);
    String errmsg = null;

    try {
      for (int colno = 0; colno < df.getColCnt(); colno++) {
        printer.print(df.getColName(colno));
      }
      printer.println();

      for (int rowno = 0; rowno < df.rows.size(); snapshotService.cancelCheck(ssId, ++rowno)) {
        Row row = df.rows.get(rowno);
        for (int colno = 0; colno < df.getColCnt(); ++colno) {
          printer.print(row.get(colno));
        }
        printer.println();
      }
    } catch (IOException e) {
      errmsg = e.getMessage();
    }

    try {
      printer.close(true);
    } catch (IOException e) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_CLOSE_CSV, e.getMessage());
    }

    if (errmsg != null) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_WRITE_CSV, errmsg);
    }

    return df.rows.size();
  }

  public int writeJson(String ssId, String strUri, DataFrame df) {
    LOGGER.debug("TeddyExecutor.wirteJSON(): strUri={} hadoopConfDir={}", strUri, hadoopConfDir);
    PrintWriter printWriter = PrepJsonUtil.getPrinter(strUri, hadoopConf);
    ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
    String errmsg = null;

    try {
      for (int rowno = 0; rowno < df.rows.size(); snapshotService.cancelCheck(ssId, ++rowno)) {
        Row row = df.rows.get(rowno);
        Map<String, Object> jsonRow = new LinkedHashMap();

        for (int colno = 0; colno < df.getColCnt(); ++colno) {
          if (df.getColType(colno).equals(ColumnType.TIMESTAMP)) {
            if (row.get(colno) == null) {
              jsonRow.put(df.getColName(colno), row.get(colno));
            } else {
              jsonRow.put(df.getColName(colno), ((DateTime) row.get(colno))
                      .toString(df.getColTimestampStyle(colno), Locale.ENGLISH));
            }
          } else {
            jsonRow.put(df.getColName(colno), row.get(colno));
          }
        }

        String json = mapper.writeValueAsString(jsonRow);
        printWriter.println(json);
      }
    } catch (IOException e) {
      errmsg = e.getMessage();
    }

    try {
      printWriter.close();
    } catch (Exception e) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_CLOSE_JSON, e.getMessage());
    }

    if (errmsg != null) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_WRITE_JSON, errmsg);
    }

    return df.rows.size();
  }

  public int writeSql(String ssId, String ssName, String strUri, DataFrame df) {
    Writer writer = PrepSqlUtil.getWriter(strUri, hadoopConf);
    String errmsg = null;
    String tblname = StringEscapeUtils.escapeSql( ssName.replaceAll("_.+","") );

    try {
      for (int rowno = 0; rowno < df.rows.size(); snapshotService.cancelCheck(ssId, ++rowno)) {

        List<String> columnList = Lists.newArrayList();
        List<String> valuesList = Lists.newArrayList();

        Row row = df.rows.get(rowno);
        for (int colno = 0; colno < df.getColCnt(); ++colno) {
          if (row.get(colno) == null) {
            continue;
          } else {
            String value = null;
            try {
              ColumnType colType = df.getColType(colno);
              if (colType == ColumnType.BOOLEAN || colType == ColumnType.DOUBLE || colType == ColumnType.LONG) {
                value = row.get(colno).toString();
              } else if (df.getColType(colno).equals(ColumnType.TIMESTAMP)) {
                value = "\"" + ((DateTime) row.get(colno)).toString(df.getColTimestampStyle(colno), Locale.ENGLISH) + "\"";
              } else {
                value = "\"" + row.get(colno).toString() + "\"";
              }
            } catch (Exception e) {
              value = null; // casting failure
            }

            if(value==null) { continue; }

            columnList.add("`" + df.getColName(colno) + "`");
            valuesList.add(value);
          }
        }

        String sql = "INSERT INTO `" + tblname + "` ("
            + String.join(",",columnList)
            + ") VALUES ("
            + String.join(",",valuesList)
            + ");\n";
        writer.write(sql);
      }
    } catch (IOException e) {
      errmsg = e.getMessage();
    }

    try {
      writer.close();
    } catch (IOException e) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_CLOSE_SQL, e.getMessage());
    }

    if (errmsg != null) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_WRITE_SQL, errmsg);
    }

    return df.rows.size();
  }
}
