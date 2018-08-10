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

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.domain.CollectionPatch;

@Entity
@Table(name = "mdm_code_value_pair")
public class CodeValuePair {

  /**
   * ID
   */
  @Column(name = "id")
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  private Long id;

  @Column(name = "code_table_code")
  private String code;

  @Column(name = "code_table_value")
  private String value;

  @Column(name = "code_table_desc")
  private String description;

  public CodeValuePair() {
  }

  public CodeValuePair(String code, String value, String description) {
    this.code = code;
    this.value = value;
    this.description = description;
  }

  public CodeValuePair(CollectionPatch patch) {
    this.code = patch.getValue("code");
    this.value = patch.getValue("value");
    this.description = patch.getValue("description");
  }

  public void updateCodeValuePair(CollectionPatch patch) {
    if(patch.hasProperty("code")) this.code = patch.getValue("code");
    if(patch.hasProperty("value")) this.value = patch.getValue("value");
    if(patch.hasProperty("description")) this.description = patch.getValue("description");
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    CodeValuePair that = (CodeValuePair) o;

    return id.equals(that.id);
  }

  @Override
  public int hashCode() {
    return id.hashCode();
  }

  @Override
  public String toString() {
    return "CodeTablePair{" +
        "id=" + id +
        ", code='" + code + '\'' +
        ", value='" + value + '\'' +
        ", description='" + description + '\'' +
        '}';
  }
}
