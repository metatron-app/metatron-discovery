package app.metatron.discovery.domain.dataprep.etl;

import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_LIMIT_ROWS;
import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_CSV;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.snapshotError;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.file.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.file.PrepJsonUtil;
import app.metatron.discovery.domain.dataprep.file.PrepParseResult;
import app.metatron.discovery.domain.dataprep.service.PrSnapshotService;
import app.metatron.discovery.domain.dataprep.teddy.ColumnDescription;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.util.PrepUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import org.apache.commons.csv.CSVPrinter;
import org.apache.hadoop.conf.Configuration;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    String storedUri = (String) snapshotInfo.get("storedUri");

    switch (PrSnapshot.getFileFormatByUri(storedUri)) {
      case CSV:
        writeCsv(ssId, storedUri, df);
        break;
      case JSON:
        writeJson(ssId, storedUri, df);
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
          ColumnDescription colDesc = df.getColDesc(colno);
          Object obj = row.get(colno);

          if (colDesc.getType() == ColumnType.TIMESTAMP && obj != null) {
            printer.print(getDateTimeStr(colDesc, obj));
          } else {
            printer.print(obj);
          }
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

  private String getDateTimeStr(ColumnDescription colDesc, Object dt) {
    String fmt = colDesc.getTimestampStyle();
    return ((DateTime) dt).toString(fmt, Locale.ENGLISH);
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
          ColumnDescription colDesc = df.getColDesc(colno);
          Object obj = row.get(colno);

          if (colDesc.getType() == ColumnType.TIMESTAMP && obj != null) {
            jsonRow.put(df.getColName(colno), getDateTimeStr(colDesc, obj));
          } else {
            jsonRow.put(df.getColName(colno), obj);
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
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_CLOSE_CSV, e.getMessage());
    }

    if (errmsg != null) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_WRITE_CSV, errmsg);
    }

    return df.rows.size();
  }
}
