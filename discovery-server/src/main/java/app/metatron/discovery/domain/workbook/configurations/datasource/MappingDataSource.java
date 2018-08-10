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

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.codehaus.jackson.annotate.JsonCreator;
import org.codehaus.jackson.annotate.JsonProperty;
import org.codehaus.jackson.annotate.JsonTypeName;

import java.util.List;

@JsonTypeName("mapping")
public class MappingDataSource extends DataSource {

  List<JoinMapping> joins;

  public MappingDataSource() {
  }

  @JsonCreator
  public MappingDataSource(
      @JsonProperty("name") String name,
      @JsonProperty("joins") List<JoinMapping> joins) {
    super(name);

    if (CollectionUtils.isEmpty(joins)) {
      throw new IllegalArgumentException("'joins' required");
    }
    this.joins = joins;
  }

  public app.metatron.discovery.domain.datasource.DataSource findMetaDataSourceByRef(String ref) {
    if (StringUtils.isEmpty(ref)) {
      return getMetaDataSource();
    }

    if (name.equals(ref)) {
      return getMetaDataSource();
    }

    app.metatron.discovery.domain.datasource.DataSource dataSource = null;
    for (JoinMapping join : joins) {
      dataSource = findInJoinMapping(join, ref);
      if(dataSource != null) {
        break;
      }
    }

    return dataSource;
  }

  public app.metatron.discovery.domain.datasource.DataSource findInJoinMapping(JoinMapping joinMapping, String ref) {

    StringBuilder joinRef = new StringBuilder();
    if (StringUtils.isNotEmpty(joinMapping.getJoinAlias())) {
      joinRef.append(joinMapping.getJoinAlias()).append(".");
    }
    joinRef.append(joinMapping.getName());

    if (ref.equals(joinRef.toString())) {
      return joinMapping.getMetaDataSource();
    }

    if(joinMapping.getJoin() != null) {
      return findInJoinMapping(joinMapping.getJoin(), ref);
    }

    return null;
  }

  public List<JoinMapping> getJoins() {
    return joins;
  }

  public void setJoins(List<JoinMapping> joins) {
    this.joins = joins;
  }

  @Override
  public String toString() {
    return "MappingDataSource{" +
        "joins=" + joins +
        ", name='" + name +
        "} ";
  }
}
