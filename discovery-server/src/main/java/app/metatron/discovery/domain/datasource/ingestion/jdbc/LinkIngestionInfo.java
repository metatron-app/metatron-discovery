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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;

/**
 *
 */
@JsonTypeName("link")
public class LinkIngestionInfo extends JdbcIngestionInfo implements IngestionInfo {

  /**
   * Expired time (seconds)
   */
  Integer expired = 600;

  @JsonIgnore
  List<String> resultPaths;

  @JsonIgnore
  String queryId;

  public LinkIngestionInfo() {
    // Empty Constructor
  }

  @Override
  public void update(IngestionInfo ingestionInfo) {
    // Not supported yet
  }

  public Integer getExpired() {
    return expired;
  }

  public void setExpired(Integer expired) {
    this.expired = expired;
  }

  public List<String> getResultPaths() {
    return resultPaths;
  }

  public void setResultPaths(List<String> resultPaths) {
    this.resultPaths = resultPaths;
  }

  public String getQueryId() {
    return queryId;
  }

  public void setQueryId(String queryId) {
    this.queryId = queryId;
  }

}
