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

package app.metatron.discovery.domain.mdm.catalog;

import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.mdm.Metadata;

/**
 * Catalog of metadata
 */
@Entity
@Table(name="mdm_catalog")
public class Catalog extends AbstractHistoryEntity {

  public static final String ROOT = "ROOT";

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  @Column(name = "catalog_name", nullable = false)
  @NotBlank
  @Size(max = 150)
  private String name;

  @Column(name = "catalog_desc", length = 1000)
  @Size(max = 900)
  private String description;

  @Column(name = "catalog_parent_id")
  private String parentId;

  /**
   * Linked metadata
   */
  @ManyToMany(cascade = {CascadeType.MERGE})
  @JoinTable(name = "catalog_metadata",
      joinColumns = @JoinColumn(name = "catalog_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "meta_id", referencedColumnName = "id"))
  @BatchSize(size = 50)
  @RestResource(path = "metadatas")
  private List<Metadata> metadatas;

  public Catalog() {
  }

  public Catalog copyOf(Optional<String> catalogId) {
    Catalog catalog = new Catalog();
    catalog.setParentId(catalogId.isPresent() ? catalogId.get() : this.parentId);
    if(catalogId.isPresent() && catalogId.get().equals(this.parentId)) {
      catalog.setName("Copy of " + this.name);
    } else {
      catalog.setName(this.name);
    }
    catalog.setDescription(this.description);

    return catalog;
  }

  @JsonIgnore
  public Map<String, Object> getTreeView(CatalogService catalogService) {
    Map<String, Object> treeView = Maps.newLinkedHashMap();
    treeView.put("id", this.id);
    treeView.put("name", this.name);
    treeView.put("countOfChild", catalogService.countSubCatalogs(this.id));
    return treeView;
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

  public String getParentId() {
    return parentId;
  }

  public void setParentId(String parentId) {
    this.parentId = parentId;
  }

  public List<Metadata> getMetadatas() {
    return metadatas;
  }

  public void setMetadatas(List<Metadata> metadatas) {
    this.metadatas = metadatas;
  }

  @Override
  public String toString() {
    return "Catalog{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", description='" + description + '\'' +
        "} " + super.toString();
  }
}
