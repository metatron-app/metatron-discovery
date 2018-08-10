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

package app.metatron.discovery.domain.audit;


import com.querydsl.core.annotations.QueryProjection;

public class AuditStatsDto {
  private String keyword;
  private Audit.AuditStatus auditStatus;
  private Long count;
  private Long sumMemorySeconds;
  private Long sumVCoreSeconds;

  public static String SORT_QUERY = "query";
  public static String SORT_QUEUE = "queue";
  public static String SORT_STATUS_COUNT = "status";
  public static String SORT_SUM_MEMORY = "incrementMemorySeconds";
  public static String SORT_SUM_VCORE = "incrementVcoreSeconds";

  @QueryProjection
  public AuditStatsDto(String keyword) {
    this.keyword = keyword;
  }

  @QueryProjection
  public AuditStatsDto(String keyword, Long count) {
    this.keyword = keyword;
    this.count = count;
  }

  @QueryProjection
  public AuditStatsDto(String keyword, Audit.AuditStatus auditStatus, Long count) {
    this.keyword = keyword;
    this.auditStatus = auditStatus;
    this.count = count;
  }

  @QueryProjection
  public AuditStatsDto(String queue, Long count, Long sumMemorySeconds, Long sumVCoreSeconds) {
    this.keyword = queue;
    this.count = count;
    this.sumVCoreSeconds = sumVCoreSeconds;
    this.sumMemorySeconds = sumMemorySeconds;
  }

  public String getKeyword() {
    return keyword;
  }

  public void setKeyword(String keyword) {
    this.keyword = keyword;
  }

  public Audit.AuditStatus getAuditStatus() {
    return auditStatus;
  }

  public void setAuditStatus(Audit.AuditStatus auditStatus) {
    this.auditStatus = auditStatus;
  }

  public Long getCount() {
    return count;
  }

  public void setCount(Long count) {
    this.count = count;
  }

  public Long getSumMemorySeconds() {
    return sumMemorySeconds;
  }

  public void setSumMemorySeconds(Long sumMemorySeconds) {
    this.sumMemorySeconds = sumMemorySeconds;
  }

  public Long getSumVCoreSeconds() {
    return sumVCoreSeconds;
  }

  public void setSumVCoreSeconds(Long sumVCoreSeconds) {
    this.sumVCoreSeconds = sumVCoreSeconds;
  }

  @Override
  public String toString() {
    return "AuditStatsDto{" +
            "keyword='" + keyword + '\'' +
            ", auditStatus=" + auditStatus +
            ", count=" + count +
            ", sumMemorySeconds=" + sumMemorySeconds +
            ", sumVCoreSeconds=" + sumVCoreSeconds +
            '}';
  }
}
