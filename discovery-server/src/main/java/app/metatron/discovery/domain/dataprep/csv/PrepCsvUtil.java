package app.metatron.discovery.domain.dataprep.csv;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import javax.servlet.ServletOutputStream;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.csv.QuoteMode;
import org.apache.commons.io.ByteOrderMark;
import org.apache.commons.io.input.BOMInputStream;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.ContentSummary;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepCsvUtil {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepCsvUtil.class);

  // public for tests
  public static InputStreamReader getReaderAfterDetectingCharset(InputStream is, String strUri) {   // strUri is only for debugging
    InputStreamReader reader;
    String charset = null;

    BOMInputStream bis = new BOMInputStream(is, false, ByteOrderMark.UTF_8, ByteOrderMark.UTF_16LE, ByteOrderMark.UTF_16BE, ByteOrderMark.UTF_32LE, ByteOrderMark.UTF_32BE);

    try {
      if (bis.hasBOM() == false || bis.hasBOM(ByteOrderMark.UTF_8)) {
        charset = "UTF-8";
      } else if (bis.hasBOM(ByteOrderMark.UTF_16LE) || bis.hasBOM(ByteOrderMark.UTF_16BE)) {
        charset = "UTF-16";
      } else if (bis.hasBOM(ByteOrderMark.UTF_32LE) || bis.hasBOM(ByteOrderMark.UTF_32BE)) {
        charset = "UTF-32";
      }

      reader = new InputStreamReader(bis, charset);
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_CHARSET, charset);
    } catch (NullPointerException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNKNOWN_BOM);
    } catch (IOException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_READ_CSV,
                                 String.format("%s (charset: %s)", strUri, charset));
    }

    return reader;
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

    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_DELIMITER, HADOOP_CONF_DIR);
  }


  /**
   * @param strUri      URI as String (to be java.net.URI)
   * @param strDelim    Delimiter as String (to be Char)
   * @param limitRows   Read not more than this
   * @param conf        Hadoop configuration which is mandatory when the url's protocol is hdfs
   * @param header      If true, skip the first line and put into result.header instead.
   * @param onlyCount   If true, just fill result.totalRows and result.totalBytes
   *
   * @return PrepCsvParseResult: grid, header, maxColCnt
   *
   *  Sorry for so many try-catches. Sacrificed readability for end-users' usability.
   */
  public static PrepCsvParseResult parse(String strUri, String strDelim, int limitRows, Integer columnCount, Configuration conf, boolean header, boolean onlyCount) {
    PrepCsvParseResult result = new PrepCsvParseResult();
    Reader reader;
    URI uri;

    LOGGER.debug("PrepCsvUtil.parse(): strUri={} strDelim={} conf={}", strUri, strDelim, conf);

    char delim = getUnescapedDelimiter(strDelim);

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

        reader = getReaderAfterDetectingCharset(his, strUri);
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

        reader = getReaderAfterDetectingCharset(fis, strUri);
        break;

      default:
        throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
    }

    CSVParser parser;
    try {
      parser = CSVParser.parse(reader, CSVFormat.DEFAULT.withDelimiter(delim).withEscape('\\'));  // \", "" both become " by default
    } catch (IOException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_CSV,
                                 String.format("%s (delimiter: %s)", strUri, strDelim));
    }

    Iterator<CSVRecord> iter = parser.iterator();

    while (true) {
      CSVRecord csvRow;

      try {
        if (!iter.hasNext()) {
          break;
        }
      } catch (IllegalStateException e) {
        e.printStackTrace();
        // suppress
      }

      try {
        csvRow = iter.next();
      } catch (IllegalStateException e) {
        e.printStackTrace();
        // suppress
        continue;
      }

      int colCnt = csvRow.size();
      colCnt = Math.max(result.maxColCnt, colCnt);
      if(columnCount!=null) {
        colCnt = columnCount;
      }
      result.maxColCnt = colCnt;

      if (header && colCnt<=csvRow.size()) {
        result.colNames = new ArrayList();
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
        if(i<csvRow.size()) {
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

    return result;
  }

  public static PrepCsvParseResult parse(String strUri, String strDelim, int limitRows, Configuration conf) {
    return parse(strUri, strDelim, limitRows, null, conf, false, false);
  }

  public static PrepCsvParseResult parse(String strUri, String strDelim, int limitRows, Configuration conf, boolean header) {
    return parse(strUri, strDelim, limitRows, null, conf, header, false);
  }

  public static PrepCsvParseResult parse(String strUri, String strDelim, int limitRows, Integer columnCount, Configuration conf) {
    return parse(strUri, strDelim, limitRows, columnCount, conf, false, false);
  }

  public static PrepCsvParseResult parse(String strUri, String strDelim, int limitRows, Integer columnCount, Configuration conf, boolean header) {
    return parse(strUri, strDelim, limitRows, columnCount, conf, header, false);
  }

  public static Map<String,Long> countCsv(String strUri, String strDelim, int limitRows, Configuration conf) {
    Map<String, Long> mapTotal = new HashMap();
    PrepCsvParseResult result = parse(strUri, strDelim, limitRows, null, conf, false, true);
    mapTotal.put("totalRows", result.totalRows);
    mapTotal.put("totalBytes", result.totalBytes);
    return mapTotal;
  }

  // public for tests
  public static OutputStreamWriter getWriter(OutputStream os) {
    OutputStreamWriter writer;
    String charset = "UTF-8";

    try {
      writer = new OutputStreamWriter(os, charset);
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_CHARSET, charset);
    }

    return writer;
  }

  /**
   * @param strUri      URI as String (to be java.net.URI)
   * @param conf        Hadoop configuration which is mandatory when the url's protocol is hdfs
   *
   *  header will be false for table-type snapshots.
   */
  public static CSVPrinter getPrinter(String strUri, Configuration conf) {
    Writer writer;
    URI uri;

    LOGGER.debug("PrepCsvUtil.getPrinter(): strUri={} conf={}", strUri, conf);

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

        writer = getWriter(hos);
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

        writer = getWriter(fos);
        break;

      default:
        throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
    }

    CSVPrinter printer;
    try {
      printer = new CSVPrinter(writer, CSVFormat.RFC4180.withQuoteMode(QuoteMode.ALL_NON_NULL));
    } catch (IOException e) {
      throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV, strUri);
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
        //int colType = rsmd.getColumnType(columnIdx);
        if (1 < columnIdx) {
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
          if (1 < columnIdx) {
            sb.append(",");
          }
          sb.append(escapeCsvField(columnValue));
        }
        outputStream.write(sb.toString().getBytes());
      }
    }  catch (Exception e) {
      LOGGER.error("Failed to write hive table as CSV file : {}", e.getMessage());
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }
  }

  private static String escapeCsvField(String value) {
    if( value.contains("\"") || value.contains(",") ) {
      value=value.replaceAll("\"","\\\"");
      return "\"" + value + "\"";
    }
    return value;
  }
}
