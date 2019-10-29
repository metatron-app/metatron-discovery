package app.metatron.discovery.domain.dataprep.file;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_CSV;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_MALFORMED_DELIMITER;
import static app.metatron.discovery.domain.dataprep.file.PrepFileUtil.getReader;
import static app.metatron.discovery.domain.dataprep.file.PrepFileUtil.getWriter;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.snapshotError;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import javax.servlet.ServletOutputStream;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.csv.QuoteMode;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.hadoop.conf.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepCsvUtil {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepCsvUtil.class);

  private static void readCsv(CSVParser parser, int limitRows, Integer manualColCnt, boolean header, boolean onlyCount,
          PrepParseResult result) {
    LOGGER.debug("readCsv(): limitRows={} header={} onlyCount={}", limitRows, header, onlyCount);

    Iterator<CSVRecord> iter = parser.iterator();
    Integer colCnt = manualColCnt != null ? manualColCnt : null;

    while (true) {
      CSVRecord csvRow;

      try {
        if (!iter.hasNext()) {
          break;
        }
        csvRow = iter.next();
      } catch (IllegalStateException e) {
        e.printStackTrace();
        // suppress
        continue;
      } catch (NoSuchElementException e) {
        e.printStackTrace();
        // suppress
        continue;
      }

      if (colCnt == null) {
        colCnt = csvRow.size();
      }

      if (header) {
        result.colNames = new ArrayList(colCnt);
        for (int i = 0; i < colCnt; i++) {
          result.colNames.add(csvRow.get(i));
        }
        header = false;
        continue;
      }

      if (onlyCount) {
        result.totalRows++;
        continue;
      }

      String[] row = new String[colCnt];
      for (int i = 0; i < colCnt; i++) {
        if (i < csvRow.size()) {
          row[i] = csvRow.get(i);
        } else {
          row[i] = null;
        }
      }

      result.grid.add(row);

      if (result.grid.size() == limitRows) {
        break;
      }
    }
    LOGGER.debug("readCsv(): limitRows={} header={} onlyCount={}", limitRows, header, onlyCount);
  }

  private static char getUnescapedDelimiter(String strDelim) {
    assert strDelim.length() != 0;

    if (strDelim.length() == 1) {
      return strDelim.charAt(0);
    }

    String unescaped = StringEscapeUtils.unescapeJava(strDelim);
    if (unescaped.length() == 1) {
      return unescaped.charAt(0);
    }

    throw datasetError(MSG_DP_ALERT_MALFORMED_DELIMITER, HADOOP_CONF_DIR);
  }

  /**
   * @param strUri URI as String (to be java.net.URI)
   * @param strDelim Delimiter as String (to be Char)
   * @param limitRows Read not more than this
   * @param manualColCnt Manually set column count from UI
   * @param conf Hadoop configuration which is mandatory when the url's protocol is hdfs
   * @param header If true, skip the first line and put into result.header instead.
   * @param onlyCount If true, just fill result.totalRows and result.totalBytes
   * @return PrepParseResult: grid, colNames
   */
  public static PrepParseResult parse(String strUri, String strDelim, int limitRows, Integer manualColCnt,
          Configuration conf, boolean header, boolean onlyCount) {
    PrepParseResult result = new PrepParseResult();

    LOGGER.debug("PrepCsvUtil.parse(): strUri={} strDelim={} limitRows={} conf={}", strUri, strDelim, limitRows, conf);

    Reader reader = getReader(strUri, conf, onlyCount, result);

    char delim = getUnescapedDelimiter(strDelim);
    CSVParser parser;
    try {
      // \", "" both become " by default
      LOGGER.debug("Call CSVParser.parse(): strDelim={}", delim);
      parser = CSVParser.parse(reader, CSVFormat.DEFAULT.withDelimiter(delim).withEscape('\\'));
    } catch (IOException e) {
      e.printStackTrace();
      throw datasetError(MSG_DP_ALERT_FAILED_TO_PARSE_CSV, String.format("%s (delimiter: %s)", strUri, strDelim));
    }

    readCsv(parser, limitRows, manualColCnt, header, onlyCount, result);

    LOGGER.debug("PrepCsvUtil.parse(): end");
    return result;
  }

  public static PrepParseResult parse(String strUri, String strDelim, int limitRows, Configuration conf) {
    return parse(strUri, strDelim, limitRows, null, conf, false, false);
  }

  public static PrepParseResult parse(String strUri, String strDelim, int limitRows, Configuration conf,
          boolean header) {
    return parse(strUri, strDelim, limitRows, null, conf, header, false);
  }

  public static PrepParseResult parse(String strUri, String strDelim, int limitRows, Integer columnCount,
          Configuration conf) {
    return parse(strUri, strDelim, limitRows, columnCount, conf, false, false);
  }

  public static PrepParseResult parse(String strUri, String strDelim, int limitRows, Integer columnCount,
          Configuration conf, boolean header) {
    return parse(strUri, strDelim, limitRows, columnCount, conf, header, false);
  }

  public static Map<String, Long> countCsv(String strUri, String strDelim, int limitRows, Configuration conf) {
    Map<String, Long> mapTotal = new HashMap();
    PrepParseResult result = parse(strUri, strDelim, limitRows, null, conf, false, true);
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
  public static CSVPrinter getPrinter(String strUri, Configuration conf) {
    LOGGER.debug("PrepCsvUtil.getPrinter(): strUri={} conf={}", strUri, conf);

    Writer writer = getWriter(strUri, conf);

    CSVPrinter printer;
    try {
      printer = new CSVPrinter(writer, CSVFormat.RFC4180.withQuoteMode(QuoteMode.ALL_NON_NULL));
    } catch (IOException e) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_WRITE_CSV, strUri);
    }

    return printer;
  }

  public static void writeHiveTableAsCSV(ResultSet rs, ServletOutputStream outputStream, String dbName) {
    try {
      ResultSetMetaData rsmd = rs.getMetaData();
      int columnCount = rsmd.getColumnCount();
      StringBuffer sb = new StringBuffer();
      for (int columnIdx = 1; columnIdx <= columnCount; columnIdx++) {
        String colName = rsmd.getColumnName(columnIdx);
        if (colName.startsWith(dbName + ".")) {
          colName = colName.substring(dbName.length() + 1);
        }
        if (columnIdx > 1) {
          sb.append(",");
        }
        sb.append(escapeCsvField(colName));
      }
      outputStream.write(sb.toString().getBytes());
      while (rs.next()) {
        sb = new StringBuffer();
        sb.append("\n");
        for (int columnIdx = 1; columnIdx <= columnCount; columnIdx++) {
          String columnValue = rs.getString(columnIdx);
          if (columnCount > 1) {
            sb.append(",");
          }
          sb.append(escapeCsvField(columnValue));
        }
        outputStream.write(sb.toString().getBytes());
      }
    } catch (Exception e) {
      LOGGER.error("Failed to write hive table as CSV file : {}", e.getMessage());
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }
  }

  private static String escapeCsvField(String value) {
    if (value.contains("\"") || value.contains(",")) {
      value = value.replaceAll("\"", "\\\"");
      return "\"" + value + "\"";
    }
    return value;
  }
}
