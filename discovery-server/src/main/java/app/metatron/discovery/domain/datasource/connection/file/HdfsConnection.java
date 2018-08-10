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

import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

/**
 * Created by kyungtaak on 2017. 3. 10..
 */
@Entity
@DiscriminatorValue("HDFS")
@JsonTypeName("HDFS")
public class HdfsConnection extends FileDataConnection {

  private static final String HDFS_URL_PREFIX = "hdfs://";

  @Override
  public String getConnectUrl() {
    return null;
  }

  @Override
  public String makeConnectUrl(boolean includeDatabase) {
    return null;
  }

  @Override
  public String getImplementor() {
    return "HDFS";
  }
}
