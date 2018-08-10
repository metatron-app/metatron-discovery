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

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * Created by kyungtaak on 2016. 12. 21..
 */
@Entity
@Table(name = "book_tree")
public class BookTree {

  @EmbeddedId
  BookTreeId id;

  /**
   * 상위/하위간 Tree Depth(Length)
   */
  @Column(name="book_depth")
  Integer depth;

  public BookTree() {
  }

  public BookTree(String ancestor, String descendant, Integer depth) {
    this.id = new BookTreeId(ancestor, descendant);
    this.depth = depth;
  }

  public BookTreeId getId() {
    return id;
  }

  public void setId(BookTreeId id) {
    this.id = id;
  }

  public Integer getDepth() {
    return depth;
  }

  public void setDepth(Integer depth) {
    this.depth = depth;
  }
}
