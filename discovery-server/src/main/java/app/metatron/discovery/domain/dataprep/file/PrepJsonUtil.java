package app.metatron.discovery.domain.dataprep.file;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.hadoop.conf.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Reader;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Types;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletOutputStream;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_JSON;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_JSON_FOR_EMPTY;
import static app.metatron.discovery.domain.dataprep.file.PrepFileUtil.getWriter;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;

public class PrepJsonUtil {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepJsonUtil.class);

  private static void readJson(Reader reader, int limitRows, Integer manualColCnt, boolean onlyCount,
          PrepParseResult result) {
    Integer colCnt = manualColCnt != null ? manualColCnt : null;

    ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
    String line;

    BufferedReader br = new BufferedReader(reader);

    try {
      result.colNames = null;
      StringBuffer sb = new StringBuffer();
      while ((line = br.readLine()) != null && result.totalRows < limitRows) {
        Map<String, Object> jsonRow = null;

        try {
          sb.append(line);
          jsonRow = mapper.readValue(sb.toString(), new TypeReference<Map<String, Object>>() {
          });
          sb.delete(0, sb.length());
        } catch (JsonParseException e) {
          LOGGER.debug("Incomplete JSON string.", e);
          continue;
        }

        if (onlyCount) {
          result.totalRows++;
          continue;
        }

        if( result.colNames==null ) {
          result.colNames = Lists.newArrayList();
          for (String jsonKey : jsonRow.keySet()) {
            if (result.colNames.contains(jsonKey) == false) {
              result.colNames.add(jsonKey);
            }
          }

          if (colCnt == null) {
            colCnt = result.colNames.size();
          } else {
            int createIndex = 0;
            while(result.colNames.size()<colCnt) {
              String colName = null;
              while( colName==null || result.colNames.contains(colName) ) {
                colName = "column_"+String.valueOf(createIndex++);
              }
              result.colNames.add(colName);
            }
          }

          if(colCnt==0) {
            throw datasetError(MSG_DP_ALERT_FAILED_TO_PARSE_JSON_FOR_EMPTY);
          }
        }

        String[] row = new String[colCnt];
        for (int i = 0; i < colCnt; i++) {
          String colName = result.colNames.get(i);
          if (jsonRow.containsKey(colName) == true) {
            Object obj = jsonRow.get(colName);
            row[i] = (obj == null) ? null : obj.toString();
          }
        }
        result.grid.add(row);
      }
    } catch (IOException e) {
      e.printStackTrace();
      throw datasetError(MSG_DP_ALERT_FAILED_TO_PARSE_JSON);
    }

  }

  /**
   * @param strUri URI as String (to be java.net.URI)
   * @param limitRows Read not more than this
   * @param manualColCnt Manually set column count from UI
   * @param conf Hadoop configuration which is mandatory when the url's protocol is hdfs
   * @param onlyCount If true, just fill result.totalRows and result.totalBytes
   * @return PrepParseResult: grid, colNames
   */
  public static PrepParseResult parse(String strUri, int limitRows, Integer manualColCnt, Configuration conf,
          boolean onlyCount) {
    PrepParseResult result = new PrepParseResult();

    LOGGER.debug("PrepJsonUtil.parse(): strUri={} conf={}", strUri, conf);

    Reader reader = PrepFileUtil.getReader(strUri, conf, onlyCount, result);
    readJson(reader, limitRows, manualColCnt, onlyCount, result);

    return result;
  }

  public static PrepParseResult parse(String strUri, int limitRows, Integer manualColCnt, Configuration conf) {
    return parse(strUri, limitRows, manualColCnt, conf, false);
  }

  /**
   * @param strUri URI as String (to be java.net.URI)
   * @param limitRows Read not more than this
   * @param conf Hadoop configuration which is mandatory when the url's protocol is hdfs
   * @return Long: total Row count
   *
   * Sorry for so many try-catches. Sacrificed readability for end-users' usability.
   */
  public static Map<String, Long> countJson(String strUri, int limitRows, Configuration conf) {
    Map<String, Long> mapTotal = new HashMap();
    PrepParseResult result = parse(strUri, limitRows, null, conf, true);
    mapTotal.put("totalRows", result.totalRows);
    mapTotal.put("totalBytes", result.totalBytes);
    return mapTotal;
  }

  /**
   * @param strUri URI as String (to be java.net.URI)
   * @param conf Hadoop configuration which is mandatory when the url's protocol is hdfs
   *
   * header will be false for table-type snapshots.
   */
  public static PrintWriter getPrinter(String strUri, Configuration conf) {
    LOGGER.debug("PrepJsonUtil.getJsonPrinter(): strUri={} conf={}", strUri, conf);

    return new PrintWriter(new BufferedWriter(getWriter(strUri, conf)));
  }

  /**
   * @param rs hive query result-set
   * @param outputStream outputStream for file writing
   * @param dbName dbName needed for column name generating
   *
   * Sorry for so many try-catches. Sacrificed readability for end-users' usability.
   */
  public static void writeHiveTableAsJSON(ResultSet rs, ServletOutputStream outputStream, String dbName) {
    try {
      ResultSetMetaData rsmd = rs.getMetaData();
      int columnCount = rsmd.getColumnCount();
      String[] columnNames = new String[columnCount + 1];
      int[] columnTypes = new int[columnCount + 1];
      StringBuffer sb;
      for (int columnIdx = 1; columnIdx <= columnCount; columnIdx++) {
        String colName = rsmd.getColumnName(columnIdx);
        if (colName.startsWith(dbName + ".")) {
          colName = colName.substring(dbName.length() + 1);
        }
        colName = "\"" + colName.replaceAll("\"", "\\\"") + "\"";
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
    } catch (Exception e) {
      LOGGER.error("Failed to write hive table as CSV file : {}", e.getMessage());
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }
  }

  private static String escapeForJSON(String value, int colType) {
    if (colType == Types.DOUBLE || colType == Types.BIGINT || colType == Types.BOOLEAN) {
      return value;
    }
    if (value.contains("\"")) {
      value = value.replaceAll("\"", "\\\\\"");
    }

    return "\"" + value + "\"";
  }
}
