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

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.domain.AbstractTenantEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.workspace.Workspace;

@Entity
@Table(name = "role_set")
 public class  RoleSet extends AbstractTenantEntity implements MetatronDomain<String> {

  public static String ROLESET_ID_DEFAULT = "DEFAULT_ROLE_SET";

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  @Column(name = "role_set_name")
  @NotBlank
  @Size(max = 150)
  String name;

  @Column(name = "role_set_desc")
  @Size(max = 900)
  String description;

  /**
   * RoleSet 범위(Workspace 내 PRIVATE, 공통 사용가능한 PUBLIC)
   */
  @Column(name = "role_set_scope")
  @Enumerated(EnumType.STRING)
  RoleSetScope scope;

  @Column(name = "role_set_predefined")
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  Boolean predefined;

  /**
   * 화면내에서 수정할 수 없도록 구성하는 플래그
   */
  @Column(name = "role_read_only")
  Boolean readOnly;

  /**
   * 연결된 workspace 개수
   */
  @Column(name = "role_set_linked")
//  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  Integer linkedWorkspaces = 0;

  @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinTable(name = "role_set_workspace",
      joinColumns = @JoinColumn(name = "rs_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "ws_id", referencedColumnName = "id"))
  @BatchSize(size = 50)
  Set<Workspace> workspaces;

  @OneToMany(mappedBy = "roleSet", cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.REMOVE})
  @OrderBy("seq ASC")
  List<Role> roles;

  @Transient
  @JsonProperty
  Map<String,String> mapper;

  public RoleSet() {
  }

  public RoleSet copyOf() {
    RoleSet roleSet = new RoleSet();

    String copiedName = StringUtils.truncate("Copy of " + name, 150);
    roleSet.setName(copiedName);
    roleSet.setDescription(description);
    roleSet.setScope(scope);

    if(CollectionUtils.isNotEmpty(roles)) {
      List<Role> copyRoles = Lists.newArrayList();
      for (Role role : roles) {
        Role copyRole = new Role(role.getName());

        copyRole.setDefaultRole(role.getDefaultRole());

        if(CollectionUtils.isNotEmpty(role.getPermissions())) {
          List<String> permNames = role.getPermissions().stream()
                                       .map(permission -> permission.getName())
                                       .collect(Collectors.toList());
          copyRole.setPermissionNames(permNames);
        }

        copyRoles.add(copyRole);
      }

      roleSet.setRoles(copyRoles);
    }

    return roleSet;
  }


  public void plusLink() {
    if(linkedWorkspaces == null) {
      linkedWorkspaces = 0;
    }
    linkedWorkspaces++;
  }

  public void minusLink() {
    if(linkedWorkspaces == null) {
      linkedWorkspaces = 0;
    }

    if(linkedWorkspaces == 0) {
      return;
    }

    linkedWorkspaces--;
  }

  public void addWorkspace(Workspace workspace) {
    if(workspaces == null) {
      workspaces = Sets.newLinkedHashSet();
    }
    workspaces.add(workspace);
    linkedWorkspaces++;
  }

  @JsonIgnore
  public List<String> getRoleNames() {

    if(CollectionUtils.isEmpty(roles)) {
      return Lists.newArrayList();
    }

    return roles.stream()
                .map(role -> role.getName())
                .collect(Collectors.toList());
  }

  @JsonIgnore
  public Role getAdminRole() {

    if(CollectionUtils.isEmpty(roles)) {
      return null;
    }

    Optional<Role> adminRole = roles.stream()
                          .filter(role -> BooleanUtils.isTrue(role.getAdminRole()))
                          .findFirst();

    return adminRole.orElse(null);
  }

  @JsonIgnore
  public Role getDefaultRole() {

    if(CollectionUtils.isEmpty(roles)) {
      return null;
    }

    Optional<Role> defaultRole = roles.stream()
                                      .filter(role -> BooleanUtils.isTrue(role.getDefaultRole()))
                                      .findFirst();


    return defaultRole.orElse(null);
  }

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

  public RoleSetScope getScope() {
    return scope;
  }

  public void setScope(RoleSetScope scope) {
    this.scope = scope;
  }

  public Boolean getPredefined() {
    return predefined;
  }

  public void setPredefined(Boolean predefined) {
    this.predefined = predefined;
  }

  public Boolean getReadOnly() {
    return readOnly;
  }

  public void setReadOnly(Boolean readOnly) {
    this.readOnly = readOnly;
  }

  public Integer getLinkedWorkspaces() {
    return linkedWorkspaces;
  }

  public void setLinkedWorkspaces(Integer linkedWorkspaces) {
    this.linkedWorkspaces = linkedWorkspaces;
  }

  public Set<Workspace> getWorkspaces() {
    return workspaces;
  }

  public void setWorkspaces(Set<Workspace> workspaces) {
    this.workspaces = workspaces;
  }

  public List<Role> getRoles() {
    return roles;
  }

  public void setRoles(List<Role> roles) {
    if(this.roles != null) {
      for (Role role : this.roles) {
        role.setRoleSet(null);
      }
      this.roles.clear();
    }
    this.roles = roles;
  }

  public Map<String, String> getMapper() {
    return mapper;
  }

  public void setMapper(Map<String, String> mapper) {
    this.mapper = mapper;
  }

  public enum RoleSetScope {
    PUBLIC, PRIVATE
  }
}
