/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.user.org;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.user.DirectoryProfile;

/**
 * Organization entity
 */
@Entity
@Table(name = "user_org", indexes = {
        @Index(name = "i_user_org_code", columnList = "org_code")
})
public class Organization extends AbstractHistoryEntity implements MetatronDomain<String> {

  public static final String DEFAULT_ORGANIZATION_CODE = "DEFAULT_ORG";

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  @Column(name = "org_name")
  @NotBlank
  @Size(max = 150)
  String name;

  @Column(name = "org_desc", length = 1000)
  @Size(max = 900)
  String description;

  @Column(name = "org_code")
  @NotBlank
  @Size(max = 20)
  String code;

  @Column(name = "org_user_count")
  Integer userCount = 0;

  @Column(name = "org_group_count")
  Integer groupCount = 0;

  @OneToMany(mappedBy = "organization",
          cascade = {CascadeType.ALL},
          fetch = FetchType.EAGER,
          orphanRemoval = true)
  @BatchSize(size = 50)
  List<OrganizationMember> members = Lists.newArrayList();

  public Organization() {
  }

  @JsonCreator
  public Organization(@JsonProperty("name") String name,
          @JsonProperty("description") String description,
          @JsonProperty("code") String code) {
    this.name = name;
    this.description = description;
    this.code = code;
  }

  public void update(Organization organization) {
    this.name = organization.getName();
    this.description = organization.getDescription();
  }

  public void addMember(OrganizationMember member) {
    if (members == null) {
      members = Lists.newArrayList();
    }
    member.setOrganization(this);
    members.add(member);

    if (member.getType() == DirectoryProfile.Type.USER) {
      userCount++;
    } else {
      groupCount++;
    }
  }

  public void removeMember(OrganizationMember member) {
    if (members == null) {
      return;
    }
    member.setOrganization(null);
    members.remove(member);

    if (member.getType() == DirectoryProfile.Type.USER) {
      userCount--;
    } else {
      groupCount--;
    }
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

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public Integer getUserCount() {
    return userCount;
  }

  public void setUserCount(Integer userCount) {
    this.userCount = userCount;
  }

  public Integer getGroupCount() {
    return groupCount;
  }

  public void setGroupCount(Integer groupCount) {
    this.groupCount = groupCount;
  }

  public List<OrganizationMember> getMembers() {
    return members;
  }

  public void setMembers(List<OrganizationMember> members) {
    this.members = members;
  }
}
