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

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;

import app.metatron.discovery.domain.MetatronDomain;

@Entity
@Table(name="data_lineage_table")
public class DataLineageTable implements MetatronDomain<Long> {

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Column(name = "id")
  Long id;

  @Column(name="schema_name")
  String schemaName;

  @Column(name="table_name")
  String tableName;

  @Column(name="col_name")
  String colName;

  @Column(name="data_type")
  String dataType;

  @Column(name="comment")
  @Lob
  String comment;

  @Column(name="info_type")
  @Enumerated(EnumType.STRING)
  InfoType infoType;

  public enum InfoType{
    COLUMN, DETAILED, STORAGE, PARTITION
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getSchemaName() {
    return schemaName;
  }

  public void setSchemaName(String schemaName) {
    this.schemaName = schemaName;
  }

  public String getTableName() {
    return tableName;
  }

  public void setTableName(String tableName) {
    this.tableName = tableName;
  }

  public String getColName() {
    return colName;
  }

  public void setColName(String colName) {
    this.colName = colName;
  }

  public String getDataType() {
    return dataType;
  }

  public void setDataType(String dataType) {
    this.dataType = dataType;
  }

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }

  public InfoType getInfoType() {
    return infoType;
  }

  public void setInfoType(InfoType infoType) {
    this.infoType = infoType;
  }

  @Override
  public String toString() {
    return "DataLineageTable{" +
            "id=" + id +
            ", schemaName='" + schemaName + '\'' +
            ", tableName='" + tableName + '\'' +
            ", colName='" + colName + '\'' +
            ", dataType='" + dataType + '\'' +
            ", comment='" + comment + '\'' +
            ", infoType=" + infoType +
            '}';
  }
}
