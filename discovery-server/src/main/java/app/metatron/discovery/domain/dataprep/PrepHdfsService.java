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

package app.metatron.discovery.domain.dataprep;

import java.io.File;
import org.apache.hadoop.conf.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PrepHdfsService {
  @Autowired(required = false)
  PrepProperties prepProperties;

  private Configuration hadoopConf = null;

  public String getUploadPath() {
    return prepProperties.getStagingBaseDir(true) + File.separator + PrepProperties.dirUpload;
  }

  public Configuration getConf() {
    if (hadoopConf == null) {
      hadoopConf = PrepUtil.getHadoopConf(prepProperties.getHadoopConfDir(true));

    }
    return hadoopConf;
  }
}
