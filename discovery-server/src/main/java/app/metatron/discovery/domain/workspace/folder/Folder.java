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

package app.metatron.discovery.domain.workspace.folder;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.lang3.NotImplementedException;

import java.util.List;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import app.metatron.discovery.domain.workspace.Book;
import app.metatron.discovery.domain.workspace.Workspace;

/**
 * Created by kyungtaak on 2016. 12. 20..
 */
@Entity
@Table(name = "book_folder")
@JsonTypeName("folder")
@DiscriminatorValue("folder")
public class Folder extends Book {

  public static final String ROOT = "ROOT";

  public static final String HIERARCHY_SEP = "\u2015";

  @Column(name = "fd_permission")
  String permission;

  @Transient
  List<Book> books;

  @Transient
  @JsonIgnore
  boolean hasSubBooks;

  public Folder() {
    // Empty Constructor
  }

  @Override
  public Book copyOf(Workspace parent, boolean addPrefix) {
    throw new NotImplementedException("TODO");
  }

  @Override
  public Map<String, Object> listViewProjection() {
    Map<String, Object> projection = super.listViewProjection();
    projection.put("type", "folder");
    projection.put("hasSubBooks", hasSubBooks);

    return projection;
  }

  @Override
  public Map<String, Object> treeViewProjection() {
    Map<String, Object> projection = super.treeViewProjection();
    projection.put("type", "folder");
    projection.put("hasSubBooks", hasSubBooks);
    return projection;
  }

  public String getPermission() {
    return permission;
  }

  public void setPermission(String permission) {
    this.permission = permission;
  }

  public List<Book> getBooks() {
    return books;
  }

  public void setBooks(List<Book> books) {
    this.books = books;
  }

  public boolean isHasSubBooks() {
    return hasSubBooks;
  }

  public void setHasSubBooks(boolean hasSubBooks) {
    this.hasSubBooks = hasSubBooks;
  }
}
