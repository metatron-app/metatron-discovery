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

import java.util.List;

public interface FileLoader {

  List<String> put(FileLoaderProperties properties, String... paths);

  List<String> put(FileLoaderProperties properties, List<String> sourcePaths, List<String> targetNames, boolean checkSrcFile);

  List<String> get(FileLoaderProperties properties, String... paths);
}
