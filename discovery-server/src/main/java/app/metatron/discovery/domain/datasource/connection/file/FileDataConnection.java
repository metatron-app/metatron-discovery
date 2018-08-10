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

package app.metatron.discovery.domain.datasource.connection.file;

import javax.persistence.MappedSuperclass;

import app.metatron.discovery.domain.datasource.connection.DataConnection;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
@MappedSuperclass
public abstract class FileDataConnection extends DataConnection {

  public FileDataConnection() {
    super();
    this.setType(SourceType.FILE);
    this.setHostname("");
  }
}
