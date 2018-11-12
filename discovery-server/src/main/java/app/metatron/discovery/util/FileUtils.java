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

package app.metatron.discovery.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 *
 */
public class FileUtils {

  private static final Logger LOGGER = LoggerFactory.getLogger(FileUtils.class);

  public static boolean existFile(Path filePath) {
    if(filePath == null) {
      return false;
    }

    return filePath.toFile().exists();
  }

  /**
   * Delete files.
   */
  public static void deleteFiles(List<String> files) {
    for (String file : files) {
      deleteFile(file);
    }
  }

  /**
   * Delete file.
   */
  public static void deleteFile(String file) {
    Path filePath = Paths.get(file);
    try {
      Files.deleteIfExists(filePath);
    } catch (IOException e) {
      LOGGER.warn("Fail to delete file : {}", file);
    }
  }

}
