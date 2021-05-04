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

import app.metatron.discovery.domain.datasource.ingestion.BatchPeriod;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;

/**
 * 배치 수집 방식 정의
 */
@JsonTypeName("batch")
public class BatchIngestionInfo extends JdbcIngestionInfo implements IngestionInfo {

  /**
   * 증감분(Incremental) / 전체(All) 정의 가능
   */
  IngestionScope range;

  /**
   * 배치 주기 정보
   */
  BatchPeriod period;

  public BatchIngestionInfo() {
  }

  @Override
  public void update(IngestionInfo ingestionInfo) {
    // Not supported yet
  }

  public BatchIngestionInfo(IngestionScope range) {
    this.range = range;
  }

  public BatchIngestionInfo(IngestionScope range, BatchPeriod period) {
    this.range = range;
    this.period = period;
  }

  public IngestionScope getRange() {
    return range;
  }

  public void setRange(IngestionScope range) {
    this.range = range;
  }

  public BatchPeriod getPeriod() {
    return period;
  }

  public void setPeriod(BatchPeriod period) {
    this.period = period;
  }

  public enum IngestionScope {
    ALL,            // 전체
    INCREMENTAL     // 증분값
  }
}
