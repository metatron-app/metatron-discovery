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

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.apache.commons.collections4.CollectionUtils;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.mdm.catalog.Catalog;
import app.metatron.discovery.domain.mdm.source.MetadataSource;

@Entity
@Table(name="mdm_metadata")
public class Metadata extends AbstractHistoryEntity implements MetatronDomain<String> {

  /**
   * ID
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  /**
   * The name of metadata
   */
  @Column(name = "meta_name")
  @NotBlank
  @Size(max = 150)
  private String name;

  /**
   * The description of metadata
   */
  @Column(name = "meta_desc", length = 1000)
  @Size(max = 900)
  private String description;

  @Column(name = "meta_source_type")
  @Enumerated(EnumType.STRING)
  private SourceType sourceType;

  @OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.ALL})
  @JoinColumn(name = "source_id", referencedColumnName = "id")
  private MetadataSource source;

  /**
   *
   */
  @OneToMany(mappedBy = "metadata", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @BatchSize(size = 50)
  private List<MetadataColumn> columns;

  /**
   * Linked catalog
   */
  @ManyToMany(cascade = {CascadeType.MERGE})
  @JoinTable(name = "catalog_metadata",
      joinColumns = @JoinColumn(name = "meta_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "catalog_id", referencedColumnName = "id"))
  @BatchSize(size = 50)
  private List<Catalog> catalogs;

  @Transient
  List<String> tags;

  public Metadata() {
  }

  public Metadata(DataSource dataSource) {

    MetadataSource metadataSource = new MetadataSource(SourceType.ENGINE, dataSource.getId(), dataSource.getName());

    this.name = dataSource.getName();
    this.description = dataSource.getName();
    this.sourceType = SourceType.ENGINE;
    this.source = metadataSource;

    List<MetadataColumn> columns = Lists.newArrayList();
    for (Field field : dataSource.getFields()) {
      columns.add(new MetadataColumn(field, this));
    }

    this.columns = columns;
  }

  @JsonIgnore
  public Map<Long, MetadataColumn> getColumnMap() {
    return columns.stream()
                .collect(Collectors.toMap(MetadataColumn::getId, column -> column));
  }

  @JsonIgnore
  public Map<Long, MetadataColumn> getFieldRefMap() {
    return columns.stream()
                  .collect(Collectors.toMap(MetadataColumn::getFieldRef, column -> column));
  }

  @JsonIgnore
  public Map<String, MetadataColumn> getColumnMapByPhysicalName() {
    return columns.stream()
                  .collect(Collectors.toMap(MetadataColumn::getPhysicalName, column -> column));
  }

  public void updateFromDataSource(DataSource dataSource, boolean includeFields) {
    this.name = dataSource.getName();
    this.description = dataSource.getDescription();

    this.source.setName(dataSource.getName());

    if (includeFields) {
      updateColumnFromField(dataSource);
    }
  }

  public void updateColumnFromField(DataSource dataSource) {
    Map<Long, Field> fieldMap = dataSource.getFieldMap();
    Set<Long> unusedFieldId = fieldMap.keySet();

    for (MetadataColumn column : this.columns) {
      Long fieldId = column.getFieldRef();
      if (fieldId == null || !fieldMap.containsKey(fieldId)) {
        continue;
      }

      column.updateColumn(fieldMap.get(fieldId));
      unusedFieldId.remove(fieldId);
    }

    if (CollectionUtils.isNotEmpty(unusedFieldId)) {
      for (Long fieldId : unusedFieldId) {
        Field field = fieldMap.get(fieldId);
        this.columns.add(new MetadataColumn(field, this));
      }
    }
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

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public SourceType getSourceType() {
    return sourceType;
  }

  public void setSourceType(SourceType sourceType) {
    this.sourceType = sourceType;
  }

  public MetadataSource getSource() {
    return source;
  }

  public void setSource(MetadataSource source) {
    this.source = source;
  }

  public List<MetadataColumn> getColumns() {
    return columns;
  }

  public void setColumns(List<MetadataColumn> columns) {
    this.columns = columns;
  }

  public List<Catalog> getCatalogs() {
    return catalogs;
  }

  public void setCatalogs(List<Catalog> catalogs) {
    this.catalogs = catalogs;
  }

  public List<String> getTags() {
    return tags;
  }

  public void setTags(List<String> tags) {
    this.tags = tags;
  }

  @Override
  public String toString() {
    return "Metadata{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", description='" + description + '\'' +
        ", sourceType=" + sourceType +
        "} " + super.toString();
  }

  public enum SourceType {
    ENGINE, JDBC, STAGEDB
  }

}
