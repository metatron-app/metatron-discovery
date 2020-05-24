/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.audit;

import org.hibernate.envers.RevisionType;

import java.util.Set;

import app.metatron.discovery.domain.revision.MetatronRevisionEntity;

/**
 * Audit for domain
 */
public class DomainAudit {
  Object domain;
  MetatronRevisionEntity revInfo;
  RevisionType revType;
  Set<String> properties;

  public DomainAudit() {
  }

  public DomainAudit(Object domain, MetatronRevisionEntity revInfo, RevisionType revType, Set<String> properties) {
    this.domain = domain;
    this.revInfo = revInfo;
    this.revType = revType;
    this.properties = properties;
  }

  public Object getDomain() {
    return domain;
  }

  public void setDomain(Object domain) {
    this.domain = domain;
  }

  public MetatronRevisionEntity getRevInfo() {
    return revInfo;
  }

  public void setRevInfo(MetatronRevisionEntity revInfo) {
    this.revInfo = revInfo;
  }

  public RevisionType getRevType() {
    return revType;
  }

  public void setRevType(RevisionType revType) {
    this.revType = revType;
  }

  public Set<String> getProperties() {
    return properties;
  }

  public void setProperties(Set<String> properties) {
    this.properties = properties;
  }
}
