package app.metatron.discovery.domain.dataprep.file;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.configError;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.snapshotError;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_CANNOT_GET_HDFS_FILE_SYSTEM;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_LOCAL_PATH;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_HDFS_PATH;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_LOCAL_PATH;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import com.ibm.icu.text.CharsetDetector;
import com.ibm.icu.text.CharsetMatch;
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
import java.nio.charset.Charset;
import org.apache.commons.io.ByteOrderMark;
import org.apache.commons.io.input.BOMInputStream;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.ContentSummary;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepFileUtil {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepFileUtil.class);

  // All the code that used to call this function have been changed to use PrepCsvUtil.parse()
  // Only LineageEdegController.java:file_upload() uses this.
  // After change that code to use PrepCsvUtil.parse(), delete this function.
  // In addition, PrepCsvUtil.parse() will be modified a little to use CommonCsvProcess.loadStream()
  public static InputStreamReader getReaderAfterDetectingCharset(InputStream is, String strUri) {
    InputStreamReader reader;
    String charset = null;

    BOMInputStream bis = new BOMInputStream(is, false, ByteOrderMark.UTF_8, ByteOrderMark.UTF_16LE,
            ByteOrderMark.UTF_16BE, ByteOrderMark.UTF_32LE, ByteOrderMark.UTF_32BE);

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
      throw PrepException
              .create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_CHARSET, charset);
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

  private static InputStreamReader getReaderWithCharset(InputStream is, String strUri, String charset) {
    InputStreamReader reader;

    try {
      reader = new InputStreamReader(is, charset);
    } catch (IOException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_READ_CSV,
              String.format("%s (charset: %s)", strUri, charset));
    }

    return reader;
  }

  // Almost same to CommonsCsvProcessor.detectingCharset()
  // We have to unify both codes.
  private static String detectingCharset(InputStream is, String strUri) {

    CharsetDetector detector;
    CharsetMatch match;

    try {
      byte[] byteData = new byte[is.available()];
      is.read(byteData);
      is.close();

      detector = new CharsetDetector();

      detector.setText(byteData);
      match = detector.detect();
      String charset = match.getName();

      if (!Charset.isSupported(charset)) {
        throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,
                PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_CHARSET, charset);
      }

      return charset;
    } catch (IOException e) {
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_FAILED_TO_READ_CSV, strUri);
    }

  }

  public static Reader getReader(String strUri, Configuration conf, boolean onlyCount, PrepParseResult result) {
    Reader reader;
    URI uri;
    String charset;

    try {
      uri = new URI(strUri);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      throw PrepException
              .create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strUri);
    }

    switch (uri.getScheme()) {
      case "hdfs":
        if (conf == null) {
          throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
                  MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
        }
        Path path = new Path(uri);

        FileSystem hdfsFs;
        try {
          hdfsFs = FileSystem.get(conf);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,
                  MSG_DP_ALERT_CANNOT_GET_HDFS_FILE_SYSTEM, strUri);
        }

        FSDataInputStream his;
        FSDataInputStream dhis;
        try {
          if (onlyCount) {
            ContentSummary cSummary = hdfsFs.getContentSummary(path);
            result.totalBytes = cSummary.getLength();
          }

          his = hdfsFs.open(path);
          dhis = hdfsFs.open(path);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,
                  PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_HDFS_PATH, strUri);
        }

        charset = detectingCharset(dhis, strUri);
        reader = getReaderWithCharset(his, strUri, charset);
        break;

      case "file":
        File file = new File(uri);
        if (onlyCount) {
          result.totalBytes = file.length();
        }

        FileInputStream fis;
        FileInputStream dfis;
        try {
          fis = new FileInputStream(file);
          dfis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,
                  MSG_DP_ALERT_CANNOT_READ_FROM_LOCAL_PATH, strUri);
        }

        charset = detectingCharset(dfis, strUri);
        reader = getReaderWithCharset(fis, strUri, charset);
        break;

      default:
        throw PrepException
                .create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME,
                        strUri);
    }

    return reader;
  }

  // public for tests
  public static OutputStreamWriter getWriterUtf8(OutputStream os) {
    OutputStreamWriter writer;
    String charset = "UTF-8";

    try {
      writer = new OutputStreamWriter(os, charset);
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
      throw PrepException
              .create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_CHARSET, charset);
    }

    return writer;
  }

  public static Writer getWriter(String strUri, Configuration conf) {
    Writer writer;
    URI uri;

    try {
      uri = new URI(strUri);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      throw snapshotError(MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strUri);
    }

    switch (uri.getScheme()) {
      case "hdfs":
        if (conf == null) {
          throw configError(MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
        }
        Path path = new Path(uri);

        FileSystem hdfsFs;
        try {
          hdfsFs = FileSystem.get(conf);
        } catch (IOException e) {
          e.printStackTrace();
          throw snapshotError(MSG_DP_ALERT_CANNOT_GET_HDFS_FILE_SYSTEM, strUri);
        }

        FSDataOutputStream hos;
        try {
          hos = hdfsFs.create(path);
        } catch (IOException e) {
          e.printStackTrace();
          throw snapshotError(MSG_DP_ALERT_CANNOT_WRITE_TO_HDFS_PATH, strUri);
        }

        writer = getWriterUtf8(hos);
        break;

      case "file":
        File file = new File(uri);
        File dirParent = file.getParentFile();
        if (dirParent == null) {
          throw snapshotError(MSG_DP_ALERT_CANNOT_WRITE_TO_LOCAL_PATH, strUri);
        }
        if (!dirParent.exists()) {
          if (!dirParent.mkdirs()) {
            throw snapshotError(MSG_DP_ALERT_CANNOT_WRITE_TO_LOCAL_PATH, strUri);
          }
        }

        FileOutputStream fos;
        try {
          fos = new FileOutputStream(file);
        } catch (FileNotFoundException e) {
          e.printStackTrace();
          throw snapshotError(MSG_DP_ALERT_CANNOT_READ_FROM_LOCAL_PATH, strUri);
        }

        writer = getWriterUtf8(fos);
        break;

      default:
        throw snapshotError(MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
    }

    return writer;
  } // end of getWriter()
}
