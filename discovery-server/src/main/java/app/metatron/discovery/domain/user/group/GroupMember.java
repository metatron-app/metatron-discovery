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

package app.metatron.discovery.domain.user.group;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.UserProfile;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;
import static com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY;

/**
 * Created by kyungtaak on 2016. 1. 5..
 */
@Entity
@Table(name = "user_group_member", indexes = {
    @Index(name = "i_user_member_id", columnList = "member_id")
})
public class GroupMember implements MetatronDomain<Long> {

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
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

  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
  @JoinColumn(name = "group_id")
  @JsonBackReference
  Group group;

  @JsonIgnore
  UserProfile profile;

  public GroupMember() {
    // Empty Constructor
  }

  public GroupMember(String memberId, String memberName) {
    this.memberId = memberId;
    this.memberName = memberName;
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

  public Group getGroup() {
    return group;
  }

  public void setGroup(Group group) {
    this.group = group;
  }

  public UserProfile getProfile(CachedUserService service) {
    if(profile == null) {
      profile = service.findUserProfile(this.memberId);
    }
    return profile;
  }
}
