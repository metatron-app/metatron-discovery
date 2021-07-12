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

package app.metatron.discovery.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.apache.commons.lang3.StringUtils;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.CommonLocalVariable;

/**
 * Created by kyungtaak on 2016. 1. 6..
 */
@MappedSuperclass
public abstract class AbstractTenantEntity extends AbstractHistoryEntity{

  @Column(name = "org_code")
  @Size(max = 20)
  protected String orgCode;

  public AbstractTenantEntity() {
    // empty constructor
  }

  @PrePersist
  public void prePersist() {
    super.prePersist();

    if (StringUtils.isEmpty(this.orgCode)) {
      CommonLocalVariable.TenantAuthority tenantAuthority = CommonLocalVariable.getLocalVariable().getTenantAuthority();
      this.setOrgCode(tenantAuthority.getOrgCode());
    }
  }

  @PreUpdate
  public void preUpdate() {
    super.preUpdate();

    if (StringUtils.isEmpty(this.orgCode)) {
      CommonLocalVariable.TenantAuthority tenantAuthority = CommonLocalVariable.getLocalVariable().getTenantAuthority();
      this.setOrgCode(tenantAuthority.getOrgCode());
    }
  }

  @JsonIgnore
  public String getOrgCode() {
    return orgCode;
  }

  public void setOrgCode(String orgCode) {
    this.orgCode = orgCode;
  }
}
