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

public class DataLineageLinkedEdge {

  private String fromTable;

  private String fromColumn;

  private String toTable;

  private String toColumn;

  private String path;

  private String predicate;

  private String sqlFile;
  private String workflowName;
  private Long workflowId;
  private Long depth;

  public String getFromTable() {
    return fromTable;
  }

  public void setFromTable(String fromTable) {
    this.fromTable = fromTable;
  }

  public String getFromColumn() {
    return fromColumn;
  }

  public void setFromColumn(String fromColumn) {
    this.fromColumn = fromColumn;
  }

  public String getToTable() {
    return toTable;
  }

  public void setToTable(String toTable) {
    this.toTable = toTable;
  }

  public String getToColumn() {
    return toColumn;
  }

  public void setToColumn(String toColumn) {
    this.toColumn = toColumn;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public String getPredicate() {
    return predicate;
  }

  public void setPredicate(String predicate) {
    this.predicate = predicate;
  }

  public String getSqlFile() {
    return sqlFile;
  }

  public void setSqlFile(String sqlFile) {
    this.sqlFile = sqlFile;
  }

  public String getWorkflowName() {
    return workflowName;
  }

  public void setWorkflowName(String workflowName) {
    this.workflowName = workflowName;
  }

  public Long getWorkflowId() {
    return workflowId;
  }

  public void setWorkflowId(Long workflowId) {
    this.workflowId = workflowId;
  }

  public Long getDepth() {
    return depth;
  }

  public void setDepth(Long depth) {
    this.depth = depth;
  }

  @Override
  public String toString() {
    return "DataLineageLinkedEdge{" +
            "fromTable='" + fromTable + '\'' +
            ", fromColumn='" + fromColumn + '\'' +
            ", toTable='" + toTable + '\'' +
            ", toColumn='" + toColumn + '\'' +
            ", path='" + path + '\'' +
            ", predicate='" + predicate + '\'' +
            ", sqlFile='" + sqlFile + '\'' +
            ", workflowName='" + workflowName + '\'' +
            ", workflowId=" + workflowId +
            ", depth=" + depth +
            '}';
  }
}
