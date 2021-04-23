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

package app.metatron.discovery.domain.datasource.ingestion.jdbc;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;

/**
 * Ad-hoc 성격의 단일 수집 방식 정의
 */
@JsonTypeName("single")
public class SingleIngestionInfo extends JdbcIngestionInfo implements IngestionInfo {

  IngestionScope scope;

  public SingleIngestionInfo() {
  }

  public SingleIngestionInfo(IngestionScope scope) {
    this.scope = scope;
  }

  @Override
  public void update(IngestionInfo ingestionInfo) {
    // Not supported yet
  }

  public IngestionScope getScope() {
    return scope;
  }

  public void setScope(IngestionScope scope) {
    this.scope = scope;
  }

  public enum IngestionScope {
    ALL,    // 전체
    ROW    // First Row 사이즈 지정
  }

}
