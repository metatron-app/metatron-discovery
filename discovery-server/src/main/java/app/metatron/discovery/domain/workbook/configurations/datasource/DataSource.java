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

package app.metatron.discovery.domain.workbook.configurations.datasource;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type",
    defaultImpl = SingleDataSource.class)
@JsonSubTypes({
    @JsonSubTypes.Type(value = DefaultDataSource.class, name = "default"),
    @JsonSubTypes.Type(value = MappingDataSource.class, name = "mapping"),
    @JsonSubTypes.Type(value = MultiDataSource.class, name = "multi")
})
public abstract class DataSource implements Serializable {

  String name;

  /**
   * 임시 데이터 소스 여부
   */
  Boolean temporary;

  /**
   * Biz. Logic 용 객체(스펙과 관련 없음)
   */
  @JsonIgnore
  app.metatron.discovery.domain.datasource.DataSource metaDataSource;

  public DataSource() {
    // Empty Constructor
  }

  public DataSource(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Boolean getTemporary() {
    return temporary;
  }

  public void setTemporary(Boolean temporary) {
    this.temporary = temporary;
  }

  public app.metatron.discovery.domain.datasource.DataSource getMetaDataSource() {
    return metaDataSource;
  }

  public void setMetaDataSource(app.metatron.discovery.domain.datasource.DataSource metaDataSource) {
    this.metaDataSource = metaDataSource;
  }
}
