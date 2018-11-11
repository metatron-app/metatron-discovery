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

package app.metatron.discovery.common.fileloader;

import com.google.common.collect.Lists;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static app.metatron.discovery.common.fileloader.FileLoaderProperties.RemoteType.SSH;

@Component
public class FileLoaderFactory {

  private static final Logger LOGGER = LoggerFactory.getLogger(FileLoaderFactory.class);

  @Autowired
  SshFileLoader sshFileLoader;

  @Autowired
  SharedFileLoader sharedFileLoader;

  @Autowired
  LocalFileLoader localFileLoader;

  public FileLoaderFactory() {
  }

  private FileLoader getFileLoader(FileLoaderProperties.RemoteType remoteType) {
    switch (remoteType) {
      case SSH:
        return sshFileLoader;
      case SHARED:
        return sharedFileLoader;
      case LOCAL:
        return localFileLoader;
      case HDFS:
      default:
        throw new RuntimeException("Not support type of file loader");
    }
  }

  public List<String> put(FileLoaderProperties properties, String... paths) {
    return getFileLoader(properties.getRemoteType()).put(properties, paths);
  }

  public List<String> put(String targetHostName, FileLoaderProperties properties, String... paths) {
    return put(targetHostName, properties, Lists.newArrayList(paths), null, false);
  }

  public List<String> put(String targetHostName, FileLoaderProperties properties, List<String> sourcePaths, List<String> targetNames, boolean checkSrcFile) {
    if(properties.getRemoteType() == SSH && StringUtils.isNotEmpty(targetHostName)) {
      properties = properties.targetHostProperties(targetHostName);
    }
    return getFileLoader(properties.getRemoteType()).put(properties, sourcePaths, targetNames, checkSrcFile);
  }

  public List<String> get(FileLoaderProperties properties, String... file) {
    return getFileLoader(properties.getRemoteType()).get(properties, file);
  }
}
