package app.metatron.discovery.domain.dataprep.csv;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.io.ByteOrderMark;
import org.apache.commons.io.input.BOMInputStream;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;

public class PrepCsvUtil {

  private static InputStreamReader getReaderAfterDetectingCharset(InputStream is, String strUri) {
    InputStreamReader reader;
    String charset = null;

    BOMInputStream bis = new BOMInputStream(is, true, ByteOrderMark.UTF_8, ByteOrderMark.UTF_16LE, ByteOrderMark.UTF_16BE, ByteOrderMark.UTF_32LE, ByteOrderMark.UTF_32BE);

    try {
      if (bis.hasBOM() == false) {
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

    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
  }


  /**
   * @param strUri      URI as String (to be java.net.URI)
   * @param strDelim    Delimiter as String (to be Char)
   * @param limitRows   Read not more than this
   * @param conf        Hadoop configuration which is mandatory when the url's protocol is hdfs
   * @param header      If true, fill PrepCsvParseResult.colNames with the header line, then skip it
   *
   * @return PrepCsvParseResult: grid, header, maxColCnt
   *
   *  Sorry for so many try-catches. Sacrificed readability for end-users' usability.
   */
  public static PrepCsvParseResult parse(String strUri, String strDelim, int limitRows, Configuration conf, boolean header) {
    PrepCsvParseResult result = new PrepCsvParseResult();
    char delim = getUnescapedDelimiter(strDelim);
    Reader reader;
    URI uri;

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

        FSDataInputStream his = null;
        try {
          his = hdfsFs.open(path);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_ACCESS_HDFS_PATH, strUri);
        }

        reader = getReaderAfterDetectingCharset(his, strUri);
        break;

      case "file":
        File file = new File(uri);

        FileInputStream fis = null;
        try {
          fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_ACCESS_HDFS_PATH, strUri);
        }

        reader = getReaderAfterDetectingCharset(fis, strUri);
        break;

      default:
        throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
    }

    // get colNames
    CSVParser parser;
    try {
      parser = CSVParser.parse(reader, CSVFormat.RFC4180.withDelimiter(delim));
    } catch (IOException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_CSV,
                                 String.format("%s (delimiter: %s)", strUri, strDelim));
    }

    for (CSVRecord csvRow : parser) {
      int colCnt = csvRow.size();
      result.maxColCnt = Math.max(result.maxColCnt, colCnt);

      String[] row = new String[colCnt];
      for (int i = 0; i < colCnt; i++) {
        row[i] = csvRow.get(i);
      }

      if (header) {
        result.colNames.addAll(Arrays.asList(row));
        header = false;
        continue;
      }

      result.grid.add(row);

      if (result.grid.size() == limitRows) {
        break;
      }
    }

    return result;
  }
}
