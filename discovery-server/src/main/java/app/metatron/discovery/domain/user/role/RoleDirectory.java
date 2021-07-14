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

package app.metatron.discovery.domain.user.role;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.apache.commons.lang3.StringUtils;
import org.codehaus.jackson.annotate.JsonBackReference;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;
import org.joda.time.DateTime;
import org.springframework.data.rest.core.annotation.RestResource;

import javax.persistence.*;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.UserProfile;
import app.metatron.discovery.domain.user.org.Organization;

@Entity
@Table(name = "role_directory")
@Audited(withModifiedFlag = true, targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
public class RoleDirectory {

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Column(name = "id")
  Long id;

  @Column(name = "directory_id")
  String directoryId;

  @Column(name = "directory_name")
  String directoryName;

  @Column(name = "directory_type")
  @Enumerated(EnumType.STRING)
  DirectoryProfile.Type type;

  @Column(name = "created_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime createdTime;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "role_id")
  @JsonBackReference
  @RestResource(exported = false)
  Role role;

  @Transient
  DirectoryProfile profile;

  @Column(name = "org_code")
  protected String orgCode;

  public RoleDirectory() {
  }

  public RoleDirectory(Role role, DirectoryProfile profile) {
    this.role = role;
    this.profile = profile;
    if(profile instanceof UserProfile) {
      this.type = DirectoryProfile.Type.USER;
    } else {
      this.type = DirectoryProfile.Type.GROUP;
    }
    this.directoryId = profile.getId();
    this.directoryName = profile.getName();
  }

  @PrePersist
  public void prePersist() {
    if (StringUtils.isEmpty(this.orgCode)) {
      CommonLocalVariable.TenantAuthority tenantAuthority = CommonLocalVariable.getLocalVariable().getTenantAuthority();
      String orgCode = StringUtils.defaultIfEmpty(tenantAuthority.getOrgCode(), Organization.DEFAULT_ORGANIZATION_CODE);
      this.setOrgCode(orgCode);
    }
    createdTime = DateTime.now();
  }

  @PreUpdate
  public void preUpdate() {
    if (StringUtils.isEmpty(this.orgCode)) {
      CommonLocalVariable.TenantAuthority tenantAuthority = CommonLocalVariable.getLocalVariable().getTenantAuthority();
      String orgCode = StringUtils.defaultIfEmpty(tenantAuthority.getOrgCode(), Organization.DEFAULT_ORGANIZATION_CODE);
      this.setOrgCode(orgCode);
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getDirectoryId() {
    return directoryId;
  }

  public void setDirectoryId(String directoryId) {
    this.directoryId = directoryId;
  }

  public String getDirectoryName() {
    return directoryName;
  }

  public void setDirectoryName(String directoryName) {
    this.directoryName = directoryName;
  }

  public DirectoryProfile.Type getType() {
    return type;
  }

  public void setType(DirectoryProfile.Type type) {
    this.type = type;
  }

  public DateTime getCreatedTime() {
    return createdTime;
  }

  public void setCreatedTime(DateTime createdTime) {
    this.createdTime = createdTime;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }

  public DirectoryProfile getProfile() {
    return profile;
  }

  public void setProfile(DirectoryProfile profile) {
    this.profile = profile;
  }

  @JsonIgnore
  public String getOrgCode() {
    return orgCode;
  }

  public void setOrgCode(String orgCode) {
    this.orgCode = orgCode;
  }
}
