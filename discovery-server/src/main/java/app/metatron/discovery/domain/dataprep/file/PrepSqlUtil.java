package app.metatron.discovery.domain.dataprep.file;

import com.google.common.collect.Lists;

import org.apache.hadoop.conf.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_PARSE_SQL;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;

public class PrepSqlUtil extends PrepFileUtil {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepSqlUtil.class);

  private static void readSql(Reader reader, int limitRows, Integer manualColCnt, boolean onlyCount,
                               PrepParseResult result) {
    Integer colCnt = manualColCnt != null ? manualColCnt : null;

    String line;

    BufferedReader br = new BufferedReader(reader);

    try {
      result.colNames = Lists.newArrayList("SQL_STATEMENTS");

      while ((line = br.readLine()) != null && result.totalRows < limitRows) {
        if (onlyCount) {
          result.totalRows++;
          continue;
        }
        String[] row = { line.toString() };
        result.grid.add(row);
      }
    } catch (IOException e) {
      e.printStackTrace();
      throw datasetError(MSG_DP_ALERT_FAILED_TO_PARSE_SQL);
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

    LOGGER.debug("PrepSqlUtil.parse(): strUri={} conf={}", strUri, conf);

    Reader reader = PrepSqlUtil.getReader(strUri, conf, onlyCount, result);
    readSql(reader, limitRows, manualColCnt, onlyCount, result);

    return result;
  }

  public static PrepParseResult parse(String strUri, int limitRows, Integer manualColCnt, Configuration conf) {
    return parse(strUri, limitRows, manualColCnt, conf, false);
  }
}
