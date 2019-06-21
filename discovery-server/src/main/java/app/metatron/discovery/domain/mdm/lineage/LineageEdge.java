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

package app.metatron.discovery.domain.mdm.lineage;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name="lineage_edge")
public class LineageEdge extends AbstractHistoryEntity {
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "edge_id")
  private String edgeId;

  @Column(name = "from_meta_id")
  private String fromMetaId;

  @Column(name = "to_meta_id")
  private String toMetaId;

  @Lob
  @Column(name = "description")
  private String description;

  public LineageEdge() {}

  public LineageEdge(String fromMetaId, String toMetaId, String description) {
    this();
    this.fromMetaId = fromMetaId;
    this.toMetaId = toMetaId;
    this.description = description;
  }

  public String getEdgeId() {
    return edgeId;
  }

  public void setEdgeId(String edgeId) {
    this.edgeId = edgeId;
  }

  public String getFromMetaId() {
    return fromMetaId;
  }

  public void setFromMetaId(String fromMetaId) {
    this.fromMetaId = fromMetaId;
  }

  public String getToMetaId() {
    return toMetaId;
  }

  public void setToMetaId(String toMetaId) {
    this.toMetaId = toMetaId;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  private boolean same(String a, String b) {
    return a == null ? false : a.equals(b);
  }

  public boolean equals(LineageEdge edge) {
    return same(this.fromMetaId, fromMetaId) && same(this.toMetaId, toMetaId) && same(this.description, description);
  }

  public int hashcode() {
    int prime = 31;
    int hashCode = 1;

    hashCode = prime * hashCode + ((fromMetaId == null) ? 0 : fromMetaId.hashCode());
    hashCode = prime * hashCode + ((toMetaId == null) ? 0 : toMetaId.hashCode());
    return prime * hashCode + ((description == null) ? 0 : description.hashCode());
  }

  @Override
  public String toString() {
    return "LineageEdge{" +
        "edgeId='" + edgeId + '\'' +
        ", fromMetaId='" + fromMetaId + '\'' +
        ", toMetaId='" + toMetaId + '\'' +
        ", description='" + description + '\'' +
        '}';
  }
}
