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
@Table(name = "mdm_lineage_edge")
public class LineageEdge extends AbstractHistoryEntity {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "edge_id")
  private String edgeId;

  @Column(name = "fr_meta_id")
  private String frMetaId;

  @Column(name = "to_meta_id")
  private String toMetaId;

  @Column(name = "tier")
  private Long tier;

  @Lob
  @Column(name = "description")
  private String desc;

  public LineageEdge() {
  }

  public LineageEdge(String frMetaId, String toMetaId, Long tier, String desc) {
    this.frMetaId = frMetaId;
    this.toMetaId = toMetaId;
    this.tier = tier;
    this.desc = desc;
  }

  public String getEdgeId() {
    return edgeId;
  }

  public void setEdgeId(String edgeId) {
    this.edgeId = edgeId;
  }

  public String getFrMetaId() {
    return frMetaId;
  }

  public void setFrMetaId(String frMetaId) {
    this.frMetaId = frMetaId;
  }

  public String getToMetaId() {
    return toMetaId;
  }

  public void setToMetaId(String toMetaId) {
    this.toMetaId = toMetaId;
  }

  public Long getTier() {
    return tier;
  }

  public void setTier(Long tier) {
    this.tier = tier;
  }

  public String getDesc() {
    return desc;
  }

  public void setDesc(String desc) {
    this.desc = desc;
  }

  @Override
  public String toString() {
    return "LineageEdge{" +
        "edgeId='" + edgeId + '\'' +
        ", frMetaId='" + frMetaId + '\'' +
        ", toMetaId='" + toMetaId + '\'' +
        ", tier=" + tier +
        ", desc='" + desc + '\'' +
        '}';
  }
}
