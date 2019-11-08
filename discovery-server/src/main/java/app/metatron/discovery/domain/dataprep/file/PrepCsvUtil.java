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

  private String strDelim;
  private char charDelim;
  private Character quoteChar;
  private Character escape;
  private boolean header;

  private int limitRows;
  private Integer manualColCnt;
  private Configuration hadoopConf;

  private boolean onlyCount;

  private CSVParser parser;

  public PrepCsvUtil() {
  }

  private char getUnescapedDelimiter(String strDelim) {
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

  private PrepCsvUtil(String strDelim, Character quoteChar, Character escape, boolean header, int limitRows,
          Integer manualColCnt, Configuration hadoopConf, boolean onlyCount) {
    this.strDelim = strDelim;
    charDelim = getUnescapedDelimiter(strDelim);

    this.quoteChar = quoteChar;
    this.escape = escape;
    this.header = header;

    this.limitRows = limitRows;
    this.manualColCnt = manualColCnt;
    this.hadoopConf = hadoopConf;

    this.onlyCount = onlyCount;

    parser = null;
  }

  /**
   * The default base instance:
   * strDelim = ,
   * quoteChar = "
   * escape = null
   * header = false
   */
  public static final PrepCsvUtil DEFAULT = new PrepCsvUtil(",", '"', null, false, 1000, null, null, false);


  /**
   * @param strDelim A delimiter is provided as a String for the room of escaped characters, like "\t", "\002", etc.
   * @return this
   */
  public PrepCsvUtil withDelim(String strDelim) {
    return new PrepCsvUtil(strDelim, quoteChar, escape, header, limitRows, manualColCnt, hadoopConf, onlyCount);
  }

  /**
   * @param quoteChar Default is '"'. Sometimes, some files need to be parsed without any quote.
   * @return this
   */
  public PrepCsvUtil withQuoteChar(Character quoteChar) {
    return new PrepCsvUtil(strDelim, quoteChar, escape, header, limitRows, manualColCnt, hadoopConf, onlyCount);
  }

  /**
   * @param escape Default is null. Sometimes, some files made assuming this is '\' or sth like that.
   * @return this
   */
  public PrepCsvUtil withEscape(Character escape) {
    return new PrepCsvUtil(strDelim, quoteChar, escape, header, limitRows, manualColCnt, hadoopConf, onlyCount);
  }

  /**
   * @param header If true, skip the first line and put into result.header instead.
   * @return this
   */
  public PrepCsvUtil withHeader(boolean header) {
    return new PrepCsvUtil(strDelim, quoteChar, escape, header, limitRows, manualColCnt, hadoopConf, onlyCount);
  }

  /**
   * @param limitRows Read not more than this
   * @return this
   */
  public PrepCsvUtil withLimitRows(int limitRows) {
    return new PrepCsvUtil(strDelim, quoteChar, escape, header, limitRows, manualColCnt, hadoopConf, onlyCount);
  }

  /**
   * @param manualColCnt Column count from UI (set manually for misreading cases)
   * @return this
   */
  public PrepCsvUtil withManualColCnt(Integer manualColCnt) {
    return new PrepCsvUtil(strDelim, quoteChar, escape, header, limitRows, manualColCnt, hadoopConf, onlyCount);
  }

  /**
   * @param hadoopConf Hadoop configuration which is mandatory when the url's protocol is hdfs
   * @return this
   */
  public PrepCsvUtil withHadoopConf(Configuration hadoopConf) {
    return new PrepCsvUtil(strDelim, quoteChar, escape, header, limitRows, manualColCnt, hadoopConf, onlyCount);
  }

  /**
   * @param onlyCount If true, just fill result.totalRows and result.totalBytes
   * @return this
   */
  public PrepCsvUtil withOnlyCount(boolean onlyCount) {
    return new PrepCsvUtil(strDelim, quoteChar, escape, header, limitRows, manualColCnt, hadoopConf, onlyCount);
  }

  /**
   * @param strUri URI as String (to be java.net.URI)
   * @return PrepParseResult: grid, colNames
   */
  public PrepParseResult parse(String strUri) {
    PrepParseResult result = new PrepParseResult();

    LOGGER.debug(
            "PrepCsvUtil.parse(): strUri={} delim={} quoteChar={} header={} limitRows={} manualColCnt={} hadoopConf={}",
            strUri, strDelim, quoteChar, header, limitRows, manualColCnt, hadoopConf);

    Reader reader = getReader(strUri, hadoopConf, onlyCount, result);

    try {
      // \", "" both become " by default
      LOGGER.debug("Call CSVParser.parse(): strDelim={}", strDelim);
      parser = CSVParser
              .parse(reader, CSVFormat.DEFAULT.withEscape(escape).withDelimiter(charDelim).withQuote(quoteChar));
    } catch (IOException e) {
      e.printStackTrace();
      throw datasetError(MSG_DP_ALERT_FAILED_TO_PARSE_CSV, String.format("%s (delimiter: %s)", strUri, strDelim));
    }

    readCsv(onlyCount, result);

    LOGGER.debug("PrepCsvUtil.parse(): end");
    return result;
  }


  private void readCsv(boolean onlyCount, PrepParseResult result) {
    assert parser != null;
    Integer colCnt = manualColCnt != null ? manualColCnt : null;

    LOGGER.debug("readCsv(): limitRows={} onlyCount={} manualColCnt={}", limitRows, onlyCount, manualColCnt);

    Iterator<CSVRecord> iter = parser.iterator();

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

  public Map<String, Long> countCsvFile(String strUri) {
    Map<String, Long> mapTotal = new HashMap();

    PrepParseResult result = parse(strUri);
    mapTotal.put("totalRows", result.totalRows);
    mapTotal.put("totalBytes", result.totalBytes);
    return mapTotal;
  }

  /**
   * @param strUri URI as String (to be java.net.URI)
   */
  public CSVPrinter getPrinter(String strUri) {
    LOGGER.debug("PrepCsvUtil.getPrinter(): strUri={} hadoopConf={}", strUri, hadoopConf);

    Writer writer = getWriter(strUri, hadoopConf);

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
