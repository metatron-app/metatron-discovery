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

package app.metatron.discovery.domain.mdm;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.common.entity.Spec;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

@Entity
@Table(name = "mdm_column_dictionary")
public class ColumnDictionary extends AbstractHistoryEntity implements MetatronDomain<String> {

  /**
   * ID
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  /**
   * The name of column
   */
  @Column(name = "column_name")
  @NotBlank
  @Size(max = 150)
  private String name;

  /**
   * The logical name of column
   */
  @Column(name = "column_logical_name")
  @NotBlank
  @Size(max = 150)
  private String logicalName;

  /**
   * The description of column
   */
  @Column(name = "column_desc", length = 1000)
  @Size(max = 900)
  private String description;

  /**
   * Suggested full column Name
   */
  @Column(name = "column_sgst_name")
  private String suggestionName;

  /**
   * Suggested short column Name
   */
  @Column(name = "column_sgst_shortname")
  private String suggestionShortName;

  /**
   * The data type of column
   */
  @Column(name = "column_data_type")
  @Enumerated(EnumType.STRING)
  @NotNull
  private DataType dataType;

  /**
   * The logical type of column
   */
  @Column(name = "column_logical_type")
  @Enumerated(EnumType.STRING)
  @NotNull
  private LogicalType logicalType;

  /**
   * Column format
   */
  @Column(name = "column_format", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = FieldFormat.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String format;

  /**
   * Linked Code Table
   */
  @RestResource(path = "codetable")
  @ManyToOne(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH })
  @JoinColumn(name = "table_id", referencedColumnName = "id")
  @JsonBackReference("dictionary_codeTable")
  private CodeTable codeTable;

  /**
   * Linked MetadataColumn
   */
  @OneToMany(mappedBy = "dictionary", cascade = {CascadeType.MERGE})
  private List<MetadataColumn> columns;

  @PreRemove
  private void removeColumnDictFromChilds(){
    columns.forEach(metadataColumn -> {
      if(metadataColumn.getDictionary().id.equals(this.id)){
        metadataColumn.setDictionary(null);
      }
    });
  }


  public ColumnDictionary() {
  }

  public void addColumn(MetadataColumn column) {
    if(this.columns == null) {
      this.columns = Lists.newArrayList();
    }

    this.columns.add(column);
  }

  public void removeColumn(MetadataColumn column) {
    if(this.columns == null) {
      return;
    }

    this.columns.remove(column);
  }

  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getLogicalName() {
    return logicalName;
  }

  public void setLogicalName(String logicalName) {
    this.logicalName = logicalName;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getSuggestionName() {
    return suggestionName;
  }

  public void setSuggestionName(String suggestionName) {
    this.suggestionName = suggestionName;
  }

  public String getSuggestionShortName() {
    return suggestionShortName;
  }

  public void setSuggestionShortName(String suggestionShortName) {
    this.suggestionShortName = suggestionShortName;
  }

  public DataType getDataType() {
    return dataType;
  }

  public void setDataType(DataType dataType) {
    this.dataType = dataType;
  }

  public LogicalType getLogicalType() {
    return logicalType;
  }

  public void setLogicalType(LogicalType logicalType) {
    this.logicalType = logicalType;
  }

  public CodeTable getCodeTable() {
    return codeTable;
  }

  public void setCodeTable(CodeTable codeTable) {
    this.codeTable = codeTable;
  }

  public String getFormat() {
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  public List<MetadataColumn> getColumns() {
    return columns;
  }

  public void setColumns(List<MetadataColumn> columns) {
    this.columns = columns;
  }

  @Override
  public String toString() {
    return "ColumnDictionary{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", logicalName='" + logicalName + '\'' +
        ", description='" + description + '\'' +
        ", dataType=" + dataType +
        ", logicalType=" + logicalType +
        "} " + super.toString();
  }
}
