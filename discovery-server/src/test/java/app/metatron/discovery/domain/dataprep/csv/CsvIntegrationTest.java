/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.dataprep.csv;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import com.facebook.presto.jdbc.internal.jackson.core.JsonProcessingException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestExecutionListeners;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class CsvIntegrationTest extends AbstractRestIntegrationTest {
  private static final Logger LOGGER = LoggerFactory.getLogger(CsvIntegrationTest.class);

  @Autowired(required = false)
  PrepProperties prepProperties;

  String strHdfsUriCrime;

  @Before
  public void setUp() {
    strHdfsUriCrime = prepareCsvOnHdfs("csv/crime.csv");
  }

  private Configuration getHadoopConf() {
    Configuration hadoopConf = new Configuration();
    String hadoopConfDir = prepProperties.getHadoopConfDir(true);

    hadoopConf.addResource(new Path(hadoopConfDir + File.separator + "core-site.xml"));
    hadoopConf.addResource(new Path(hadoopConfDir + File.separator + "hdfs-site.xml"));

    return hadoopConf;
  }

  private String prepareCsvOnHdfs(String localRelPath) {
    String strLocalUri = CommonsCsvTest.buildStrUrlFromResourceDir("csv/crime.csv");
    String strHdfsUri = String.format("%s/test_output/%s", prepProperties.getStagingBaseDir(true), localRelPath);
    FSDataOutputStream hos;
    FileSystem hdfsFs;
    URI uri;

    try {
      uri = new URI(strLocalUri);
      File file = new File(uri);
      FileInputStream fis = new FileInputStream(file);
      InputStreamReader reader = PrepCsvUtil.getReaderAfterDetectingCharset(fis, strLocalUri);

      uri = new URI(strHdfsUri);
      Path path = new Path(uri);
      hdfsFs = FileSystem.get(getHadoopConf());
      hos = hdfsFs.create(path);

      org.apache.commons.io.IOUtils.copy(reader, hos);

      fis.close();
      hos.close();
      reader.close();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_NOT_FOUND, strLocalUri);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strHdfsUri);
    } catch (IOException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_ACCESS_HDFS_PATH, strHdfsUri);
    }

    return strHdfsUri;
  }

  @Test
  public void test_hdfs() throws JsonProcessingException {
    PrepCsvParseResult result = PrepCsvUtil.parse(strHdfsUriCrime, ",", 10000, getHadoopConf(), false);

    LOGGER.debug("colNames={}", result.colNames);
    LOGGER.debug("maxColCnt={}", result.maxColCnt);

    DataFrame df = new DataFrame();
    df.setByGrid(result.grid, result.colNames);
    df.show();
  }

  @Test
  public void test_hdfs_header() throws JsonProcessingException {
    PrepCsvParseResult result = PrepCsvUtil.parse(strHdfsUriCrime, ",", 10000, getHadoopConf(), true);

    LOGGER.debug("colNames={}", result.colNames);
    LOGGER.debug("maxColCnt={}", result.maxColCnt);

    DataFrame df = new DataFrame();
    df.setByGrid(result);
    df.show();
  }
}
