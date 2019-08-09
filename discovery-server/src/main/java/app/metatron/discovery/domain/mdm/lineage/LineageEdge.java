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

  @Column(name = "fr_meta_name")
  private String frMetaName;

  @Column(name = "to_meta_name")
  private String toMetaName;

  @Column(name = "fr_col_name")
  private String frColName;

  @Column(name = "to_col_name")
  private String toColName;

  @Column(name = "tier")
  private Long tier;

  @Lob
  @Column(name = "description")
  private String desc;

  public LineageEdge() {
  }

  public LineageEdge(String frMetaId, String toMetaId, String frMetaName, String toMetaName,
      Long tier, String desc) {
    this();
    this.frMetaId = frMetaId;
    this.toMetaId = toMetaId;
    this.frMetaId = frMetaId;
    this.toMetaId = toMetaId;
    this.frMetaName = frMetaName;
    this.toMetaName = toMetaName;
    this.frColName = frColName;
    this.toColName = toColName;
    this.tier = tier;
    this.desc = desc;
  }

  public LineageEdge(String frMetaId, String toMetaId, String frMetaName, String toMetaName,
      String frColName, String toColName, Long tier, String desc) {
    this(frMetaId, toMetaId, frMetaName, toMetaName, tier, desc);
    this.frColName = frColName;
    this.toColName = toColName;
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

  public String getFrMetaName() {
    return frMetaName;
  }

  public void setFrMetaName(String frMetaName) {
    this.frMetaName = frMetaName;
  }

  public String getToMetaName() {
    return toMetaName;
  }

  public void setToMetaName(String toMetaName) {
    this.toMetaName = toMetaName;
  }

  public String getFrColName() {
    return frColName;
  }

  public void setFrColName(String frColName) {
    this.frColName = frColName;
  }

  public String getToColName() {
    return toColName;
  }

  public void setToColName(String toColName) {
    this.toColName = toColName;
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
        ", frMetaName='" + frMetaName + '\'' +
        ", toMetaName='" + toMetaName + '\'' +
        ", frColName='" + frColName + '\'' +
        ", toColName='" + toColName + '\'' +
        ", tier=" + tier +
        ", desc='" + desc + '\'' +
        '}';
  }
}
