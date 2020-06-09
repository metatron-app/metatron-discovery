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

package app.metatron.discovery.domain.user.org;

import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.user.DirectoryProfile;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Objects;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;
import static com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY;

/**
 * Organization Member Entity
 */
@Entity
@Table(name = "user_org_member", indexes = {
        @Index(name = "i_org_member_id", columnList = "member_id")
})
public class OrganizationMember implements MetatronDomain<Long> {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
  @GenericGenerator(name = "native", strategy = "native")
  @Column(name = "id")
  Long id;

  @Column(name = "member_id")
  @NotNull
  @JsonProperty(access = WRITE_ONLY)
  String memberId;

  @Column(name = "member_name")
  @JsonProperty(access = READ_ONLY)
  String memberName;

  @Column(name = "member_type")
  @Enumerated(EnumType.STRING)
  DirectoryProfile.Type type;

  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
  @JoinColumn(name = "org_id")
  @JsonBackReference
  Organization organization;

  @Transient
  DirectoryProfile profile;

  public OrganizationMember() {
    // Empty Constructor
  }

  public OrganizationMember(String memberId, String memberName, DirectoryProfile.Type type) {
    this.memberId = memberId;
    this.memberName = memberName;
    this.type = type;
  }

  @Override
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getMemberId() {
    return memberId;
  }

  public void setMemberId(String memberId) {
    this.memberId = memberId;
  }

  public String getMemberName() {
    return memberName;
  }

  public void setMemberName(String memberName) {
    this.memberName = memberName;
  }

  public DirectoryProfile.Type getType() {
    return type;
  }

  public void setType(DirectoryProfile.Type type) {
    this.type = type;
  }

  public Organization getOrganization() {
    return organization;
  }

  public void setOrganization(Organization organization) {
    this.organization = organization;
  }

  public DirectoryProfile getProfile() {
    return profile;
  }

  public void setProfile(DirectoryProfile profile) {
    this.profile = profile;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    OrganizationMember that = (OrganizationMember) o;
    return id.equals(that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
