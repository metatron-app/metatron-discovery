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

package app.metatron.discovery.domain.workspace;

import com.google.common.collect.Lists;

import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

import java.util.List;
import java.util.Map;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.workspace.folder.Folder;

/**
 * Created by kyungtaak on 2016. 12. 20..
 */

@Entity
@Table(name = "book")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "type")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
public abstract class Book extends AbstractHistoryEntity implements MetatronDomain<String> {

  public static List<String> SEARCHABLE_BOOKS = Lists.newArrayList("workbook", "notebook", "workbench");

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  protected String id;

  @Column(name = "type", insertable = false, updatable = false)
  protected String type;

  @Column(name = "book_name", nullable = false)
  @NotBlank
  @Size(max = 150)
  protected String name;

  @Column(name = "book_desc", length = 1000)
  @Size(max = 900)
  protected String description;

  @Column(name = "book_favorite")
  protected Boolean favorite;

  @Column(name = "book_tag", length = 2000)
  @Size(max = 2000)
  protected String tag;

  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
  @JoinColumn(name = "ws_id")
  @JsonBackReference(value = "workspace-book")
  protected Workspace workspace;

  @Column(name = "book_folder_id")
  @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
  protected String folderId = Folder.ROOT;

  /**
   * BookList 조회시 Projection내 BookType 지정 용도로 활용
   */
  @Transient
  @JsonIgnore
  protected String bookType;

  public abstract Book copyOf(Workspace parent, boolean addPrefix);

  protected Map<String, Object> listViewProjection() {
    Map<String, Object> projection = Maps.newHashMap();
    projection.put("id", id);
    projection.put("name", name);
    projection.put("description", description);
    projection.put("favorite", favorite);
    projection.put("tag", tag);
    projection.put("createdTime", super.getCreatedTime());
    projection.put("modifiedTime", super.getModifiedTime());

    return projection;
  }

  protected Map<String, Object> treeViewProjection() {
    Map<String, Object> projection = Maps.newHashMap();
    projection.put("id", id);
    projection.put("name", name);

    return projection;
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

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public Boolean getFavorite() {
    return favorite;
  }

  public void setFavorite(Boolean favorite) {
    this.favorite = favorite;
  }

  public String getTag() {
    return tag;
  }

  public void setTag(String tag) {
    this.tag = tag;
  }

  public Workspace getWorkspace() {
    return workspace;
  }

  public void setWorkspace(Workspace workspace) {
    this.workspace = workspace;
  }

  public String getFolderId() {
    return folderId;
  }

  public void setFolderId(String folderId) {
    this.folderId = folderId;
  }

  public String getBookType() {
    return bookType;
  }

  public void setBookType(String bookType) {
    this.bookType = bookType;
  }
}
