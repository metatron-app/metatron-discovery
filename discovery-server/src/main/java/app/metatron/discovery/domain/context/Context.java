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

package app.metatron.discovery.domain.context;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import app.metatron.discovery.common.entity.DomainType;

@Entity
@Table(name = "context")
public class Context {

  @Column(name = "id")
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  Long id;

  @Column(name = "context_domain_type")
  @Enumerated(EnumType.STRING)
  DomainType domainType;

  @Column(name = "context_domain_id")
  String domainId;

  @Column(name = "context_key")
  String key;

  @Column(name = "context_value")
  String value;

  @Transient
  Object domain;

  public Context() {
  }

  public Context(DomainType domainType, String domainId, String key, String value) {
    this.domainType = domainType;
    this.domainId = domainId;
    this.key = key;
    this.value = value;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public DomainType getDomainType() {
    return domainType;
  }

  public void setDomainType(DomainType domainType) {
    this.domainType = domainType;
  }

  public String getDomainId() {
    return domainId;
  }

  public void setDomainId(String domainId) {
    this.domainId = domainId;
  }

  public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  public Object getDomain() {
    return domain;
  }

  public void setDomain(Object domain) {
    this.domain = domain;
  }

  @Override
  public String toString() {
    return "Context{" +
        "id=" + id +
        ", domainType=" + domainType +
        ", domainId='" + domainId + '\'' +
        ", key='" + key + '\'' +
        ", value='" + value + '\'' +
        '}';
  }
}
