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

import com.google.common.collect.Maps;
import java.io.File;
import java.io.IOException;
import java.util.Map;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PrepHdfsService {
  @Autowired(required = false)
  PrepProperties prepProperties;

  private String uploadHdfsPath = null;

  private Configuration hadoopConf = null;

  public String getUploadPath() {
    if (uploadHdfsPath == null && prepProperties.getStagingBaseDir(true) != null) {
      String stagingBaseDir = prepProperties.getStagingBaseDir(true);
      uploadHdfsPath = stagingBaseDir + File.separator + PrepProperties.dirUpload;
    }
    return uploadHdfsPath;
  }

  public Configuration getConf() {
    if (hadoopConf == null) {
      hadoopConf = PrepUtil.getHadoopConf(prepProperties.getHadoopConfDir(true));

    }
    return hadoopConf;
  }

  public Map<String, Object> checkHdfs() {
    Map<String, Object> result = Maps.newHashMap();

    try {
      String stagingBaseDir = prepProperties.getStagingBaseDir(false);    // FIXME: after implementing specifying upload locations
      result.put("stagingBaseDir", stagingBaseDir);
      result.put("checkConnection", false);
      if (stagingBaseDir != null) {
        Configuration conf = this.getConf();
        FileSystem fs = FileSystem.get(conf);
        Path pathStagingBase = new Path(stagingBaseDir);
        if (fs.exists(pathStagingBase) == false) {
          result.put("checkStatus", stagingBaseDir + " does not exist");
        } else if (fs.isDirectory(pathStagingBase) == false) {
          result.put("checkStatus", stagingBaseDir + " is not a directory");
        } else {
          result.put("checkConnection", true);
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    return result;
  }
}
