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

package app.metatron.discovery.domain.tag;

import com.fasterxml.jackson.annotation.JsonBackReference;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import java.io.Serializable;

import javax.persistence.*;

import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.util.AuthUtils;

@Entity
@Table(name="tag_domain")
public class TagDomain implements Serializable {

  /**
   * ID
   */
  @Column(name = "id")
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  Long id;

  @Column(name = "domain_id")
  String domainId;

  @Column(name = "domain_type")
  @Enumerated(EnumType.STRING)
  DomainType domainType;

  @Column(name = "created_by")
  String createdBy;

  @Column(name = "created_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime createdTime;

  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
  @JoinColumn(name = "tag_id")
  @JsonBackReference
  Tag tag;

  public TagDomain() {
  }

  public TagDomain(DomainType domainType, String domainId) {
    this.domainType = domainType;
    this.domainId = domainId;
  }

  @PrePersist
  public void prePersist() {
    createdBy = AuthUtils.getAuthUserName();
    createdTime = DateTime.now();
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getDomainId() {
    return domainId;
  }

  public void setDomainId(String domainId) {
    this.domainId = domainId;
  }

  public DomainType getDomainType() {
    return domainType;
  }

  public void setDomainType(DomainType domainType) {
    this.domainType = domainType;
  }

  public String getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(String createdBy) {
    this.createdBy = createdBy;
  }

  public DateTime getCreatedTime() {
    return createdTime;
  }

  public void setCreatedTime(DateTime createdTime) {
    this.createdTime = createdTime;
  }

  public Tag getTag() {
    return tag;
  }

  public void setTag(Tag tag) {
    this.tag = tag;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    TagDomain tagDomain = (TagDomain) o;

    if (!domainId.equals(tagDomain.domainId)) return false;
    if (domainType != tagDomain.domainType) return false;
    return tag.equals(tagDomain.tag);
  }

  @Override
  public int hashCode() {
    int result = domainId.hashCode();
    result = 31 * result + domainType.hashCode();
    result = 31 * result + tag.hashCode();
    return result;
  }

  @Override
  public String toString() {
    return "TagDomain{" +
        "id=" + id +
        ", domainId='" + domainId + '\'' +
        ", domainType=" + domainType +
        ", createdBy='" + createdBy + '\'' +
        ", createdTime=" + createdTime +
        ", tag=" + tag +
        '}';
  }
}
