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

package app.metatron.discovery.domain.workspace;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.EnumUtils;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.group.Group;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;
import static com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY;

/**
 * Created by kyungtaak on 2017. 1. 22..
 */
@Entity
@Table(name = "workspace_member")
public class WorkspaceMember implements MetatronDomain<Long> {

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Column(name = "id")
  Long id;

  @Column(name = "member_id")
  @NotNull
  @JsonProperty(access = WRITE_ONLY)
  String memberId;

  @Column(name = "member_type")
  @Enumerated(EnumType.STRING)
  @JsonProperty(access = WRITE_ONLY)
  @NotNull
  MemberType memberType;

  @Column(name = "member_name")
  @JsonProperty(access = READ_ONLY)
  String memberName;

  @Column(name = "member_role")
  String role;

  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
  @JoinColumn(name = "ws_id")
  @JsonBackReference
  Workspace workspace;

  public WorkspaceMember() {
  }

  public WorkspaceMember(CollectionPatch patch, Workspace workspace) {
    this(patch, workspace, null);
  }

  public WorkspaceMember(CollectionPatch patch, Workspace workspace, CachedUserService cachedUserService) {
    this.memberId = patch.getValue("memberId");
    this.memberType = EnumUtils.getEnum(MemberType.class, ((String) patch.getValue("memberType")).toUpperCase());
    this.role = patch.getValue("role");
    this.workspace = workspace;

    // 사용자/그룹 정보를 미리 넣어둡니다
    if(cachedUserService != null) {
      if(this.memberType == MemberType.GROUP) {
        Group group = cachedUserService.findGroup(memberId);
        if(group == null) this.memberName = group.getName();
      } else {
        User user = cachedUserService.findUser(memberId);
        if (user != null) this.memberName = user.getFullName();
      }
    }
  }

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

  public MemberType getMemberType() {
    return memberType;
  }

  public void setMemberType(MemberType memberType) {
    this.memberType = memberType;
  }

  public String getMemberName() {
    return memberName;
  }

  public void setMemberName(String memberName) {
    this.memberName = memberName;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public Workspace getWorkspace() {
    return workspace;
  }

  public void setWorkspace(Workspace workspace) {
    this.workspace = workspace;
  }

  public enum MemberType {
    GROUP, USER
  }

}
