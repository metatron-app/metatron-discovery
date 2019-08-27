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

import com.google.common.collect.Lists;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.util.AuthUtils;

@Entity
@Table(name="tag")
public class Tag implements MetatronDomain<String> {

  /**
   * ID
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  @Column(name = "tag_name")
  @NotNull
  String name;

  @Column(name = "tag_scope")
  @NotNull
  @Enumerated(EnumType.STRING)
  Scope scope;

  @Column(name = "tag_domain")
  @Enumerated(EnumType.STRING)
  DomainType domainType;

  @Column(name = "created_by")
  String createdBy;

  @Column(name = "created_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime createdTime;

  @OneToMany(mappedBy = "tag", cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE})
  List<TagDomain> domains;

  public Tag() {
  }

  public Tag(String name, Scope scope, DomainType domainType) {
    this.name = name;
    this.scope = scope;
    this.domainType = domainType;
  }

  @PrePersist
  public void prePersist() {
    createdBy = AuthUtils.getAuthUserName();
    createdTime = DateTime.now();
  }

  public void addTagDomain(TagDomain tagDomain) {
    if(domains == null) {
      domains = Lists.newArrayList();
    }
    tagDomain.setTag(this);

    domains.add(tagDomain);
  }

  public void removeTagDomain(TagDomain tagDomain) {
    if(domains == null) {
      return;
    }

    domains.remove(tagDomain);
  }

  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Scope getScope() {
    return scope;
  }

  public void setScope(Scope scope) {
    this.scope = scope;
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

  public List<TagDomain> getDomains() {
    return domains;
  }

  public void setDomains(List<TagDomain> domains) {
    this.domains = domains;
  }

  @Override
  public String toString() {
    return "Tag{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", scope=" + scope +
        ", domainType=" + domainType +
        '}';
  }

  public enum Scope {
    GLOBAL, DOMAIN
  }
}
