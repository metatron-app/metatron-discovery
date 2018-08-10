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

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang.StringUtils;

import java.io.Serializable;
import java.util.Map;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.datasource.DataSource;

public class JoinMapping implements Serializable {

  /**
   * Join Type
   */
  @NotNull
  JoinType type;

  /**
   * 데이터 소스 Name
   */
  String name;

  /**
   * 데이터 소스 Name Alias, 하위 Join 수행시 namespace 로 활용
   */
  String joinAlias;

  /**
   * Join 할 Mutliple KeyMap, key : Mater Key , value : Lookup Key
   */
  Map<String, String> keyPair;

  /**
   * 하위에 조인할 join 정보
   */
  JoinMapping join;

  /**
   * Biz. Logic 용 객체(스펙과 관련 없음)
   */
  @JsonIgnore
  app.metatron.discovery.domain.datasource.DataSource metaDataSource;

  public JoinMapping(
      @JsonProperty("name") String name,
      @JsonProperty("joinAlias") String joinAlias,
      @JsonProperty("type") String type,
      @JsonProperty("keyPair") Map<String, String> keyPair,
      @JsonProperty("join") JoinMapping join) {

    if(StringUtils.isEmpty(name)) {
      throw new IllegalArgumentException("'name' properties required ");
    }

    this.name = name;
    this.joinAlias = StringUtils.isEmpty(joinAlias) ? name : joinAlias;
    this.type = JoinType.valueOf(Preconditions.checkNotNull(type).toUpperCase());
    this.keyPair = keyPair;
    this.join = join;
  }

  public JoinType getType() {
    return type;
  }

  public void setType(JoinType type) {
    this.type = type;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Map<String, String> getKeyPair() {
    return keyPair;
  }

  public void setKeyPair(Map<String, String> keyPair) {
    this.keyPair = keyPair;
  }

  public JoinMapping getJoin() {
    return join;
  }

  public void setJoin(JoinMapping join) {
    this.join = join;
  }

  public String getJoinAlias() {
    return joinAlias;
  }

  public void setJoinAlias(String joinAlias) {
    this.joinAlias = joinAlias;
  }

  public DataSource getMetaDataSource() {
    return metaDataSource;
  }

  public void setMetaDataSource(DataSource metaDataSource) {
    this.metaDataSource = metaDataSource;
  }

  /**
   * 연결(Join) 타입
   */
  public enum JoinType {
    INNER,
    LEFT_OUTER,
    RIGHT_OUTER, // Not Supported
    FULL         // Not Supported
  }
}
