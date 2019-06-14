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
import app.metatron.discovery.domain.mdm.MetadataColumn;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name="mdm_metadata_col_dep")
public class MetadataColDep extends AbstractHistoryEntity {
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  @Lob
  @Column(name = "desc")
  private String desc;

  @OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.ALL})
  @JoinColumn(name = "upstream_id", referencedColumnName = "id")
  private MetadataColumn upstream;

  @OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.ALL})
  @JoinColumn(name = "downstream_id", referencedColumnName = "id")
  private MetadataColumn downstream;

  @ManyToOne(fetch = FetchType.LAZY, cascade = { CascadeType.MERGE })
  @JoinColumn(name = "meta_dep_id", referencedColumnName = "id")
  private MetadataDep metadataDep;

  public MetadataColDep() {}

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

  public MetadataColumn getUpstream() {
    return upstream;
  }

  public void setUpstream(MetadataColumn upstream) {
    this.upstream = upstream;
  }

  public MetadataColumn getDownstream() {
    return downstream;
  }

  public void setDownstream(MetadataColumn downstream) {
    this.downstream = downstream;
  }

  public MetadataDep getMetadataDep() {
    return metadataDep;
  }

  public void setMetadataDep(
      MetadataDep metadataDep) {
    this.metadataDep = metadataDep;
  }

  @Override
  public String toString() {
    return "MetadataColDep{" +
        "id='" + id + '\'' +
        ", desc='" + desc + '\'' +
        ", upstream=" + upstream +
        ", downstream=" + downstream +
        ", metadataDep=" + metadataDep +
        '}';
  }
}
