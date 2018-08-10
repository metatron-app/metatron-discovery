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

package app.metatron.discovery.domain.workbook;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.domain.AbstractHistoryEntity;

/**
 * Created by kyungtaak on 2017. 4. 19..
 */
@Entity
@Table(name = "configuration")
public class DefaultConfiguration extends AbstractHistoryEntity {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  @Column(name = "conf_profile")
  private String profile;

  @Column(name = "conf_domain")
  @Enumerated(EnumType.STRING)
  private DomainType domain;

  @Column(name = "conf_type")
  private String type;

  @Column(name = "conf_spec", length = 65535, columnDefinition = "TEXT")
  private String spec;

  public DefaultConfiguration() {
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getProfile() {
    return profile;
  }

  public void setProfile(String profile) {
    this.profile = profile;
  }

  public DomainType getDomain() {
    return domain;
  }

  public void setDomain(DomainType domain) {
    this.domain = domain;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getSpec() {
    return spec;
  }

  public void setSpec(String spec) {
    this.spec = spec;
  }

  public enum DomainType {
    CHART
  }
}
