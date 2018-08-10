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

import java.util.List;

public class DataLineageLinkedTable extends DataLineageLinkedEntity{

  public DataLineageLinkedTable(){
    super();
    this.setType("TABLE");
  }

  public DataLineageLinkedTable(String databaseName, String tableName){
    super();
    this.databaseName = databaseName;
    this.tableName = tableName;
  }

  private String databaseName;

  private String tableName;

  private List<DataLineageLinkedColumn> columns;

  private Long dataLineageTableId;

  public List<DataLineageLinkedColumn> getColumns() {
    return columns;
  }

  public void setColumns(List<DataLineageLinkedColumn> columns) {
    this.columns = columns;
  }

  public String getDatabaseName() {
    return databaseName;
  }

  public void setDatabaseName(String databaseName) {
    this.databaseName = databaseName;
  }

  public String getTableName() {
    return tableName;
  }

  public void setTableName(String tableName) {
    this.tableName = tableName;
  }

  public Long getDataLineageTableId() {
    return dataLineageTableId;
  }

  public void setDataLineageTableId(Long dataLineageTableId) {
    this.dataLineageTableId = dataLineageTableId;
  }

  @Override
  public String toString() {
    return "DataLineageLinkedTable{" +
            "columns=" + columns +
            ", id='" + id + '\'' +
            ", type='" + type + '\'' +
            ", name='" + name + '\'' +
            ", xPos=" + xPos +
            ", yPos=" + yPos +
            '}';
  }
}
