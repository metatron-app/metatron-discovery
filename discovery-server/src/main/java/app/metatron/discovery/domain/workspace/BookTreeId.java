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

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 * Created by kyungtaak on 2016. 12. 21..
 */
@Embeddable
public class BookTreeId implements Serializable {
  /**
   * 상위 Book Id
   */
  @Column(name="book_ancestor")
  String ancestor;

  /**
   * 하위 Book Id
   */
  @Column(name="book_descendant")
  String descendant;

  public BookTreeId() {
  }

  public BookTreeId(String ancestor, String descendant) {
    this.ancestor = ancestor;
    this.descendant = descendant;
  }

  public String getAncestor() {
    return ancestor;
  }

  public void setAncestor(String ancestor) {
    this.ancestor = ancestor;
  }

  public String getDescendant() {
    return descendant;
  }

  public void setDescendant(String descendant) {
    this.descendant = descendant;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    BookTreeId that = (BookTreeId) o;

    if (!ancestor.equals(that.ancestor)) return false;
    return descendant.equals(that.descendant);

  }

  @Override
  public int hashCode() {
    int result = ancestor.hashCode();
    result = 31 * result + descendant.hashCode();
    return result;
  }
}
