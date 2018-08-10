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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;

/**
 * "Summary" 쿼리용 Request 객체
 *
 * @author Kyungtaak Noh
 * @since 1.1
 */
public class SummaryQueryRequest extends AbstractQueryRequest implements QueryRequest {

  /**
   * 기존 정의되어 있는 Field 외 가상 필드 정의
   */
  List<UserDefinedField> userFields;

  /**
   * 통계정보를 확인할 field 명
   */
  List<Field> fields;


  public SummaryQueryRequest() {
    // Empty Constructor
  }

  @JsonCreator
  public SummaryQueryRequest(
      @JsonProperty("dataSource") DataSource dataSource,
      @JsonProperty("fields") List<Field> fields,
      @JsonProperty("customFields") List<UserDefinedField> userFields,
      @JsonProperty("context") Map<String, Object> context) {

    super(dataSource, context);

    if(dataSource instanceof MappingDataSource) {
      throw new IllegalArgumentException("Not supported mapping datasource.");
    }

    this.dataSource = dataSource;
    this.fields = fields;
    this.userFields = userFields;
  }

  public SummaryQueryRequest(DataSource dataSource, List<Field> fields) {
    this(dataSource, fields, null, null);
  }

  public DataSource getDataSource() {
    return dataSource;
  }

  public void setDataSource(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public List<Field> getFields() {
    return fields;
  }

  public void setFields(List<Field> fields) {
    this.fields = fields;
  }

  public List<UserDefinedField> getUserFields() {
    if(userFields == null) {
      return Lists.newArrayList();
    }
    return userFields;
  }

  public void setUserFields(List<UserDefinedField> userFields) {
    this.userFields = userFields;
  }

  @Override
  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }
}
