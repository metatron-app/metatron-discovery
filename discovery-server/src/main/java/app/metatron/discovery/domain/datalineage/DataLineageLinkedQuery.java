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

package app.metatron.discovery.domain.datalineage;

import org.joda.time.DateTime;

import java.util.List;

public class DataLineageLinkedQuery extends DataLineageLinkedEntity {

  public DataLineageLinkedQuery(){
    super();
    this.setType("SQL");
  }

  private Long dataLineageId;

  private List<String> predicates;

  private DateTime timestamp;

  private String sqlFile;

  private Long workFlowId;

  private String workFlowName;

  public Long getDataLineageId() {
    return dataLineageId;
  }

  public void setDataLineageId(Long dataLineageId) {
    this.dataLineageId = dataLineageId;
  }

  public List<String> getPredicates() {
    return predicates;
  }

  public void setPredicates(List<String> predicates) {
    this.predicates = predicates;
  }

  public DateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(DateTime timestamp) {
    this.timestamp = timestamp;
  }

  public String getSqlFile() {
    return sqlFile;
  }

  public void setSqlFile(String sqlFile) {
    this.sqlFile = sqlFile;
  }

  public Long getWorkFlowId() {
    return workFlowId;
  }

  public void setWorkFlowId(Long workFlowId) {
    this.workFlowId = workFlowId;
  }

  public String getWorkFlowName() {
    return workFlowName;
  }

  public void setWorkFlowName(String workFlowName) {
    this.workFlowName = workFlowName;
  }

  @Override
  public String toString() {
    return "DataLineageLinkedQuery{" +
            "dataLineageId=" + dataLineageId +
            ", predicates=" + predicates +
            ", timestamp=" + timestamp +
            ", sqlFile='" + sqlFile + '\'' +
            ", workFlowId=" + workFlowId +
            ", workFlowName='" + workFlowName + '\'' +
            ", id='" + id + '\'' +
            ", type='" + type + '\'' +
            ", name='" + name + '\'' +
            ", xPos=" + xPos +
            ", yPos=" + yPos +
            '}';
  }
}
