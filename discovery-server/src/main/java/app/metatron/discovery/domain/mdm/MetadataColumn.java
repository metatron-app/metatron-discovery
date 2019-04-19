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

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.support.DefaultFormattingConversionService;

import java.net.URI;

import javax.persistence.*;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.entity.Spec;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

@Entity
@Table(name = "mdm_metadata_column")
public class MetadataColumn implements MetatronDomain<Long>  {

  /**
   * ID
   */
  @Column(name = "id")
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  private Long id;

  /**
   * The physical type of column
   */
  @Column(name = "column_physical_type")
  private String physicalType;

  /**
   * The physical name of column
   */
  @Column(name = "column_physical_name")
  @NotBlank
  private String physicalName;


  /**
   * The name of column
   */
  @Column(name = "column_name")
  private String name;


  /**
   * The type of column
   */
  @Column(name = "column_type")
  @Enumerated(EnumType.STRING)
  private LogicalType type;

  /**
   * The description of column
   */
  @Column(name = "column_desc", length = 1000)
  private String description;

  /**
   * Reference field of datasource
   */
  @Column(name = "column_field_ref")
  private Long fieldRef;

  @Column(name = "column_field_role")
  private Field.FieldRole role;

  /**
   * Sequence for column alignment
   */
  @Column(name = "column_seq")
  private Long seq;

  /**
   * Linked Column Dictionary
   */
  @RestResource(path = "dictionary")
  @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE})
  @JoinColumn(name = "dictionary_id", referencedColumnName = "id")
  @JsonBackReference("column_dictionary")
  private ColumnDictionary dictionary;

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
   * Linked Metadata
   */
  @ManyToOne(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE })
  @JoinColumn(name = "meta_id")
  @JsonBackReference("column_metadata")
  private Metadata metadata;

  /**
   * Linked Code Table
   */
  @RestResource(path = "codetable")
  @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE})
  @JoinColumn(name = "table_id", referencedColumnName = "id")
  @JsonBackReference("column_codetable")
  private CodeTable codeTable;

  public MetadataColumn() {
  }

  public MetadataColumn(Field field, Metadata metadata) {
    this.physicalName = field.getName();
    this.physicalType = field.getType().name();
    this.name = field.getLogicalName();
    this.type = field.getLogicalType();
    this.description = field.getDescription();
    this.format = field.getFormat();
    this.fieldRef = field.getId();
    this.role = field.getRole();
    this.seq = field.getSeq();
    this.metadata = metadata;
  }

  public MetadataColumn(CollectionPatch patch, DefaultFormattingConversionService defaultConversionService) {
    if(patch.hasProperty("physicalType")) this.physicalType = patch.getValue("physicalType");
    if(patch.hasProperty("physicalName")) this.physicalName = patch.getValue("physicalName");
    if(patch.hasProperty("name")) this.name = patch.getValue("name");
    if (patch.hasProperty("seq")) this.seq = patch.getLongValue("seq");
    if(patch.hasProperty("type")) {
      this.type = SearchParamValidator.enumUpperValue(LogicalType.class, patch.getValue("type"), "type");
    }
    if (patch.hasProperty("role")) {
      this.role = SearchParamValidator.enumUpperValue(Field.FieldRole.class, patch.getValue("role"), "role");
    }
    if(patch.hasProperty("description")) this.description = patch.getValue("description");
    if(patch.hasProperty("format")) {
      FieldFormat format = GlobalObjectMapper.getDefaultMapper().convertValue(patch.getValue("format"), FieldFormat.class);
      this.format = GlobalObjectMapper.writeValueAsString(format);
    }
    if(patch.hasProperty("dictionary")) {
      URI uri = URI.create(patch.getValue("dictionary"));
      ColumnDictionary dictionary = defaultConversionService.convert(uri, ColumnDictionary.class);
      dictionary.addColumn(this);
      this.dictionary = dictionary;
    }
    if(patch.hasProperty("codeTable")) {
      URI uri = URI.create(patch.getValue("codeTable"));
      CodeTable codeTable = defaultConversionService.convert(uri, CodeTable.class);
      codeTable.addColumn(this);
      this.codeTable = codeTable;
    }
  }

  public void updateColumn(CollectionPatch patch, DefaultFormattingConversionService defaultConversionService) {
    if(patch.hasProperty("physicalType")) this.physicalType = patch.getValue("physicalType");
    if(patch.hasProperty("physicalName")) this.physicalName = patch.getValue("physicalName");
    if(patch.hasProperty("name")) this.name = patch.getValue("name");
    if (patch.hasProperty("seq")) this.seq = patch.getLongValue("seq");
    if(patch.hasProperty("type")) {
      this.type = SearchParamValidator.enumUpperValue(LogicalType.class, patch.getValue("type"), "type");
    }
    if (patch.hasProperty("role")) {
      this.role = SearchParamValidator.enumUpperValue(Field.FieldRole.class, patch.getValue("role"), "role");
    }
    if(patch.hasProperty("description")) this.description = patch.getValue("description");
    if(patch.hasProperty("format")) {
      FieldFormat format = GlobalObjectMapper.getDefaultMapper().convertValue(patch.getValue("format"), FieldFormat.class);
      this.format = GlobalObjectMapper.writeValueAsString(format);
    }
    if(patch.hasProperty("dictionary")) {
      String dictionaryUriStr = patch.getValue("dictionary");
      if(StringUtils.isNotEmpty(dictionaryUriStr)) {
        URI uri = URI.create(dictionaryUriStr);
        ColumnDictionary dictionary = defaultConversionService.convert(uri, ColumnDictionary.class);
        if(this.dictionary != null) this.dictionary.removeColumn(this);
        dictionary.addColumn(this);
        this.dictionary = dictionary;
      } else {
        if(this.dictionary != null) this.dictionary.removeColumn(this);
        this.dictionary = null;
      }

    }
    if(patch.hasProperty("codeTable")) {
      String codeTableUriStr = patch.getValue("codeTable");
      if(StringUtils.isNotEmpty(codeTableUriStr)) {
        URI uri = URI.create(codeTableUriStr);
        CodeTable codeTable = defaultConversionService.convert(uri, CodeTable.class);
        if(this.codeTable != null) this.codeTable.removeColumn(this);
        codeTable.addColumn(this);
        this.codeTable = codeTable;
      } else {
        if(this.codeTable != null) this.codeTable.removeColumn(this);
        this.codeTable = null;
      }
    }
  }

  public void updateColumn(Field field) {
    this.name = field.getLogicalName();
    this.type = field.getLogicalType();
    this.format = field.getFormat();
    this.description = field.getDescription();
    this.seq = field.getSeq();
  }

  @Override
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public LogicalType getType() {
    return type;
  }

  public void setType(LogicalType type) {
    this.type = type;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getPhysicalType() {
    return physicalType;
  }

  public void setPhysicalType(String physicalType) {
    this.physicalType = physicalType;
  }

  public String getPhysicalName() {
    return physicalName;
  }

  public void setPhysicalName(String physicalName) {
    this.physicalName = physicalName;
  }

  public Long getFieldRef() {
    return fieldRef;
  }

  public void setFieldRef(Long fieldRef) {
    this.fieldRef = fieldRef;
  }

  public Field.FieldRole getRole() {
    return role;
  }

  public void setRole(Field.FieldRole role) {
    this.role = role;
  }

  public Long getSeq() {
    return seq;
  }

  public void setSeq(Long seq) {
    this.seq = seq;
  }

  public ColumnDictionary getDictionary() {
    return dictionary;
  }

  public void setDictionary(ColumnDictionary dictionary) {
    this.dictionary = dictionary;
  }

  public String getFormat() {
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  public CodeTable getCodeTable() {
    return codeTable;
  }

  public void setCodeTable(CodeTable codeTable) {
    this.codeTable = codeTable;
  }

  public Metadata getMetadata() {
    return metadata;
  }

  public void setMetadata(Metadata metadata) {
    this.metadata = metadata;
  }

  @JsonIgnore
  public FieldFormat getFieldFormat() {
    if(StringUtils.isNotEmpty(format)){
      return GlobalObjectMapper.readValue(format, FieldFormat.class);
    }
    return null;
  }

  @Override
  public String toString() {
    return "MetadataColumn{" +
        "id=" + id +
        ", name='" + name + '\'' +
        ", type=" + type +
        ", description='" + description + '\'' +
        ", physicalType='" + physicalType + '\'' +
        ", physicalName='" + physicalName + '\'' +
        '}';
  }
}
