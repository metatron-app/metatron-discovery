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

package app.metatron.discovery.domain.workbench.hive;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.security.UserGroupInformation;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.io.OutputStream;
import java.security.PrivilegedExceptionAction;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import app.metatron.discovery.common.exception.MetatronException;

@Repository
public class DataTableHiveRepository {

  public String saveToHdfs(HivePersonalDatasource hivePersonalDataSource, Path path, DataTable dataTable, String tablePartitionColumn) {
    final String hiveAdminUser = hivePersonalDataSource.getAdminName();
    FileSystem fs = null;
    try {
      fs = getFileSystem(hivePersonalDataSource.getHdfsConfPath(), hiveAdminUser);
      if (!fs.exists(path)) {
        try {
          fs.mkdirs(path);
        } catch (IOException e) {
          String errorMessage = String.format("failed make user query result directory to HDFS : %s", path.toString());
          throw new MetatronException(errorMessage, e);
        }
      }

      final String fileId = UUID.randomUUID().toString();
      Path recordsFile = new Path(path, String.format("%s.dat", fileId));
      try (OutputStream out = fs.create(recordsFile)) {
        for (Map<String, Object> record : dataTable.getRecords()) {
          String newRecord = dataTable.getFields().stream()
              .map(field ->  {
                if(field.equalsIgnoreCase(tablePartitionColumn)) {
                  return Optional.ofNullable(String.valueOf(record.get(field))).orElse("").trim().replaceAll(" ", "_");
                } else {
                  return Optional.ofNullable(String.valueOf(record.get(field))).orElse("");
                }
              }).collect(Collectors.joining("\001")) + "\n";

          out.write(newRecord.getBytes());
        }
      } catch (Exception e) {
        String errorMessage = String.format("failed write file to HDFS : %s", recordsFile.toString());
        throw new MetatronException(errorMessage, e);
      }

      return recordsFile.toString();
    } catch (Exception e) {
      String errorMessage = "failed write file to HDFS";
      throw new MetatronException(errorMessage, e);
    } finally {
      if (fs != null) {
        try {
          fs.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }

  }

  private FileSystem getFileSystem(String hdfsConfigurationPath, String remoteUser) throws IOException, InterruptedException {
    final Configuration conf = getHdfsConfiguration(hdfsConfigurationPath);
    UserGroupInformation ugi = UserGroupInformation.createRemoteUser(remoteUser);
    return ugi.doAs((PrivilegedExceptionAction<FileSystem>) () -> FileSystem.get(conf));
  }

  private Configuration getHdfsConfiguration(String hdfsConfigurationPath) {
    final Configuration conf = new Configuration();
    conf.addResource(new Path(String.format("%s/core-site.xml", hdfsConfigurationPath)));
    conf.addResource(new Path(String.format("%s/hdfs-site.xml", hdfsConfigurationPath)));

    return conf;
  }

}
