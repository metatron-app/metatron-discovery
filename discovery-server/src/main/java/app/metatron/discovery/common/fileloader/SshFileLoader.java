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

import org.apache.commons.collections4.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.util.SshUtils;

import static java.util.stream.Collectors.toList;

@Component
public class SshFileLoader implements FileLoader {

  private static final Logger LOGGER = LoggerFactory.getLogger(SshFileLoader.class);

  @Override
  public List<String> put(FileLoaderProperties properties, String... targets) {
    return put(properties, Lists.newArrayList(targets), null, false);
  }

  @Override
  public List<String> put(FileLoaderProperties properties, List<String> sourcePaths, List<String> targetNames, boolean checkSrcFile) {

    Map<String, EngineProperties.Host> hosts = properties.getHosts();

    if (MapUtils.isEmpty(hosts)) {
      LOGGER.debug("This is localhost.");
      return sourcePaths;
    }

    String remoteHostname;
    EngineProperties.Host remoteInfo;
    String remoteDir = properties.getRemotePathWithoutScheme();
    for (String key : hosts.keySet()) {
      remoteHostname = key;
      remoteInfo = hosts.get(key);

      SshUtils.copyLocalToRemoteFileByScp(sourcePaths,
                                          targetNames,
                                          remoteDir,
                                          remoteHostname,
                                          remoteInfo.getPort(),
                                          remoteInfo.getUsername(),
                                          remoteInfo.getPassword(),
                                          checkSrcFile);
    }

    return Lists.newArrayList(sourcePaths).stream()
                .map(s -> properties.getRemoteDir() + File.separator + Paths.get(s).getFileName())
                .collect(toList());
  }

  @Override
  public List<String> get(FileLoaderProperties properties, String... file) {
    return null;
  }
}
