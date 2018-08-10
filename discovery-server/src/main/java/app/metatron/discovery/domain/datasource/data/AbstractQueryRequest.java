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

package app.metatron.discovery.domain.datasource.data;


import com.google.common.collect.Lists;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.data.alias.Alias;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;

public abstract class AbstractQueryRequest implements QueryRequest {

  /**
   * 질의할 데이터 소스 정보
   *
   */
  protected DataSource dataSource;

  /**
   * 쿼리 개별 설정
   */
  protected Map<String, Object> context;

  /**
   * Optional, 필드값 Alias 를 활용시 참조할 Reference ID
   *
   */
  protected String valueAliasRef;

  protected List<Alias> aliases;

  public AbstractQueryRequest() {
  }

  public AbstractQueryRequest(DataSource dataSource, Map<String, Object> context) {

    if(dataSource == null) {
      throw new IllegalArgumentException("dataSource name or DataSourceSpec required.");
    }

    this.dataSource = dataSource;
    this.context = context;
  }

  @Override
  public <T> T getContextValue(String key) {
    if(context == null) {
      return null;
    }
    return (T) context.get(key);
  }

  public void setDataSource(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @Override
  public DataSource getDataSource() {
    return dataSource;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  @Override
  public Map<String, Object> getContext() {
    return context;
  }

  @Override
  public String getValueAliasRef() {
    return valueAliasRef;
  }

  public void setValueAliasRef(String valueAliasRef) {
    this.valueAliasRef = valueAliasRef;
  }

  public List<Alias> getAliases() {
    return aliases;
  }

  public void setAliases(List<Alias> aliases) {
    this.aliases = aliases;
  }

  @Override
  public void addAlias(Alias alias) {
    if(aliases == null) {
      aliases = Lists.newArrayList();
    }

    aliases.add(alias);
  }
}
