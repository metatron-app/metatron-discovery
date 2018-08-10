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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Component
public class SharedFileLoader implements FileLoader {

  private static final Logger LOGGER = LoggerFactory.getLogger(SharedFileLoader.class);
  
  @Override
  public List<String> put(FileLoaderProperties properties, String... paths) {

    List<String> loadPaths = Lists.newArrayList();
    for(String path : paths) {
      Path sourcePath = getPath(path);
      String remotePathStr = properties.getRemotePath(sourcePath.getFileName().toString());
      Path remotePath = getPath(remotePathStr);

      if(sourcePath.compareTo(remotePath) != 0) {
        try {
          Files.copy(sourcePath, remotePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
          LOGGER.error("Fail to copy local files to shared directory({})", remotePathStr);
          throw new RuntimeException("Fail to copy local files to shared directory : " + remotePathStr);
        }
      }
      LOGGER.error("Successfully copy local files({}) to shared directory({})", path, remotePathStr);
      loadPaths.add(remotePathStr);
    }

    return loadPaths;
  }

  @Override
  public List<String> get(FileLoaderProperties properties, String... file) {
    return null;
  }

  public Path getPath(String path) {
    URI uri = URI.create(path);
    if(uri.getScheme() == null) {
      return Paths.get(URI.create("file://" + path));
    }
    return Paths.get(uri);
  }
}
