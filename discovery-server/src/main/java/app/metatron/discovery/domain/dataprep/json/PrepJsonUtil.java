package app.metatron.discovery.domain.dataprep.json;

import app.metatron.discovery.domain.dataprep.csv.PrepCsvParseResult;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.csv.*;
import org.apache.commons.io.ByteOrderMark;
import org.apache.commons.io.input.BOMInputStream;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;

public class PrepJsonUtil {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepJsonUtil.class);

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
  public static PrepJsonParseResult parseJSON(String strUri, String strDelim, int limitRows, Configuration conf, boolean header) {
    PrepJsonParseResult result = new PrepJsonParseResult();
    BufferedReader reader;
    URI uri;

    LOGGER.debug("PrepSnapshotService.parseJSON(): strUri={} strDelim={} conf={}", strUri, strDelim, conf);

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
          his = hdfsFs.open(path);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_HDFS_PATH, strUri);
        }

        reader = new BufferedReader(new InputStreamReader(his));
        break;

      case "file":
        File file = new File(uri);

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
    int rowNo = 0;

    try {
      while((line = reader.readLine())!=null && rowNo <limitRows) {
        Map<String, String> jsonRow = mapper.readValue(line, new TypeReference<Map<String, String>>(){});
        if(rowNo==0) {
          result.colNames = new ArrayList<>(jsonRow.keySet());
          result.maxColCnt = jsonRow.size();
        }

        String[] row = jsonRow.values().toArray(new String[0]);
        result.grid.add(row);
        rowNo++;
      }


    } catch (IOException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_CSV,
              String.format("%s (delimiter: %s)", strUri, strDelim));
    }

    return result;
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
}
