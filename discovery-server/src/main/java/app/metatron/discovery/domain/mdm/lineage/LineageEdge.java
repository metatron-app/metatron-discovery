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
@Table(name = "lineage_edge")
public class LineageEdge extends AbstractHistoryEntity {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "edge_id")
  private String edgeId;

  @Column(name = "upstream_meta_id")
  private String upstreamMetaId;

  @Column(name = "downstream_meta_id")
  private String downstreamMetaId;

  @Lob
  @Column(name = "description")
  private String description;

  public LineageEdge() {
  }

  public LineageEdge(String upstreamMetaId, String downstreamMetaId, String description) {
    this();
    this.upstreamMetaId = upstreamMetaId;
    this.downstreamMetaId = downstreamMetaId;
    this.description = description;
  }

  public String getEdgeId() {
    return edgeId;
  }

  public void setEdgeId(String edgeId) {
    this.edgeId = edgeId;
  }

  public String getUpstreamMetaId() {
    return upstreamMetaId;
  }

  public void setUpstreamMetaId(String upstreamMetaId) {
    this.upstreamMetaId = upstreamMetaId;
  }

  public String getDownstreamMetaId() {
    return downstreamMetaId;
  }

  public void setDownstreamMetaId(String downstreamMetaId) {
    this.downstreamMetaId = downstreamMetaId;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  @Override
  public String toString() {
    return "LineageEdge{" +
        "edgeId='" + edgeId + '\'' +
        ", upstreamMetaId='" + upstreamMetaId + '\'' +
        ", downstreamMetaId='" + downstreamMetaId + '\'' +
        ", description='" + description + '\'' +
        '}';
  }
}
