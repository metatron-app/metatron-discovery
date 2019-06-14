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
@Table(name="mdm_metadata_dep")
public class MetadataDep extends AbstractHistoryEntity {
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  @Lob
  @Column(name = "desc")
  private String desc;

  @Column(name = "upstream_id")
  private String upstreamId;

  @Column(name = "downstream_id")
  private String downstreamId;

  public MetadataDep() {

  }

  public MetadataDep(String desc, String upstreamId, String downstreamId) {
    this();
    this.desc = desc;
    this.upstreamId = upstreamId;
    this.downstreamId = downstreamId;
  }


  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getDesc() {
    return desc;
  }

  public void setDesc(String desc) {
    this.desc = desc;
  }

  public String getUpstreamId() {
    return upstreamId;
  }

  public void setUpstreamId(String upstreamId) {
    this.upstreamId = upstreamId;
  }

  public String getDownstreamId() {
    return downstreamId;
  }

  public void setDownstreamId(String downstreamId) {
    this.downstreamId = downstreamId;
  }

  @Override
  public String toString() {
    return "MetadataDep{" +
        "id='" + id + '\'' +
        ", desc='" + desc + '\'' +
        ", upstreamId='" + upstreamId + '\'' +
        ", downstreamId='" + downstreamId + '\'' +
        '}';
  }
}
