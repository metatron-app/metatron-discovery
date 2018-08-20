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
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Map;

@Service
public class PrepHdfsService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepHdfsService.class);

    @Value("${polaris.dataprep.hadoopConfDir:#{NULL}}")
    private String hadoopConfDir;

    @Value("${polaris.dataprep.stagingBaseDir:#{NULL}}")
    private String stagingBaseDir;

    private String uploadHdfsPath = null;
    private String snapshotHdfsPath = null;
    private String previewHdfsPath = null;

    private String uploadDirectory = "uploads";
    private String snapshotDirectory = "snapshots";
    private String previewDirectory = "previews";

    private Configuration hadoopConf = null;

    private String getUploadPath() {
        if(null==uploadHdfsPath) {
            if (true == this.stagingBaseDir.endsWith(File.separator)) {
                uploadHdfsPath = this.stagingBaseDir + uploadDirectory;
            } else {
                uploadHdfsPath = this.stagingBaseDir + File.separator + uploadDirectory;
            }
        }
        return uploadHdfsPath;
    }

    private String getSnapshotPath() {
        if(null==snapshotHdfsPath) {
            if (true == this.stagingBaseDir.endsWith(File.separator)) {
                snapshotHdfsPath = this.stagingBaseDir + snapshotDirectory;
            } else {
                snapshotHdfsPath = this.stagingBaseDir + File.separator + snapshotDirectory;
            }
        }
        return snapshotHdfsPath;
    }

    private String getPreviewPath() {
        if(null==previewHdfsPath) {
            if (true == this.stagingBaseDir.endsWith(File.separator)) {
                previewHdfsPath = this.stagingBaseDir + previewDirectory;
            } else {
                previewHdfsPath = this.stagingBaseDir + File.separator + previewDirectory;
            }
        }
        return previewHdfsPath;
    }

    public Configuration getConf() {
        if(null==hadoopConf) {
            hadoopConf = new Configuration();
            if(null!=hadoopConfDir) {
                hadoopConf.addResource(new Path(hadoopConfDir + File.separator + "core-site.xml"));
                hadoopConf.addResource(new Path(hadoopConfDir + File.separator + "hdfs-site.xml"));
            }
        }
        return hadoopConf;
    }

    public Map<String, Object> checkHdfs() {
        Map<String, Object> result = Maps.newHashMap();

        result.put("stagingBaseDir", stagingBaseDir);
        result.put("checkConnection", false);
        if(null!=stagingBaseDir) {
            try {
                Configuration conf = this.getConf();
                FileSystem fs = FileSystem.get(conf);

                Path pathStagingBase = new Path(stagingBaseDir);
                if (false==fs.exists(pathStagingBase)) {
                    result.put("checkStatus", stagingBaseDir + " does not exist");
                } else if (false==fs.isDirectory(pathStagingBase)) {
                    result.put("checkStatus", stagingBaseDir + " is not a directory");
                } else {
                    result.put("checkConnection", true);
                }
            } catch (Exception e) {
            }
        }

        return result;
    }

    public String moveLocalToHdfs(String localFilePath, String fileKey) {
        String hdfsFilePath = null;

        Map<String, Object> check = checkHdfs();
        if(check.get("checkConnection").equals(true)) {
            try {
                Configuration conf = this.getConf();
                FileSystem fs = FileSystem.get(conf);

                String uploadPath = this.getUploadPath();
                if(null!=uploadPath) {
                    hdfsFilePath = uploadPath + File.separator + fileKey;
                    Path pathLocalFile = new Path(localFilePath);
                    Path pathStagingBase = new Path(hdfsFilePath);
                    fs.copyFromLocalFile(true,true,pathLocalFile,pathStagingBase);
                }
            } catch (Exception e) {
                LOGGER.error("moveLocalToHdfs(): caught an exception: ", e);
                hdfsFilePath = null;
            }
        }
        return hdfsFilePath;
    }
}
