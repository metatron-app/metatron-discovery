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

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.search.annotations.Analyze;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.FieldBridge;
import org.hibernate.search.annotations.Fields;
import org.hibernate.search.annotations.Indexed;
import org.hibernate.search.annotations.SortableField;
import org.hibernate.search.annotations.Store;
import org.hibernate.search.bridge.builtin.BooleanBridge;
import org.hibernate.search.bridge.builtin.EnumBridge;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.bridge.PredefinedRoleBridge;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.context.ContextEntity;
import app.metatron.discovery.domain.user.DirectoryProfile;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;
import static com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY;

/**
 * Created by kyungtaak on 2016. 1. 5..
 */
@Entity
@Table(name = "roles")
@Indexed
public class Role extends AbstractHistoryEntity implements MetatronDomain<String>, GrantedAuthority, ContextEntity {

  public static String PREDEFINED_GROUP_ADMIN = "SYSTEM_ADMIN";
  public static String PREDEFINED_GROUP_SUPER = "SYSTEM_SUPERVISOR";
  public static String PREDEFINED_GROUP_USER = "SYSTEM_USER";

  public static String PREDEFINED_ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
  public static String PREDEFINED_ROLE_SYSTEM_DATA_MANAGER = "ROLE_SYSTEM_DATA_MANAGER";
  public static String PREDEFINED_ROLE_SYSTEM_WORKSPACE_MANAGER = "ROLE_SYSTEM_WORKSPACE_MANAGER";
  public static String PREDEFINED_ROLE_SYSTEM_SHARED_USER = "ROLE_SYSTEM_SHARED_USER";
  public static String PREDEFINED_ROLE_SYSTEM_PRIVATE_USER = "ROLE_SYSTEM_PRIVATE_USER";
  public static String PREDEFINED_ROLE_SYSTEM_GUEST = "ROLE_SYSTEM_GUEST";

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  @Column(name = "role_name")
  @FieldBridge(impl = PredefinedRoleBridge.class)
  @Fields({
      @Field(name = "name", analyze = Analyze.YES, store = Store.YES),
      @Field(name = "name.sort", analyze = Analyze.NO, store = Store.NO)
  })
  @SortableField(forField = "name.sort")
  @NotBlank
  @Size(max = 150)
  String name;

  @Column(name = "role_desc", length = 1000)
  @Size(max = 900)
  String description;

  @Column(name = "role_scope")
  @Enumerated(EnumType.STRING)
  @Field(analyze = Analyze.NO, store = Store.YES)
  @FieldBridge(impl = EnumBridge.class)
  RoleScope scope;

  @Column(name = "role_predefined")
  @Field(analyze = Analyze.NO, store = Store.YES)
  @FieldBridge(impl = BooleanBridge.class)
  @SortableField
  Boolean predefined;

  /**
   * Workspace 내 RoleSet 에 포함된 경우, Admin. Role 인 경우
   */
  @Column(name = "role_is_admin")
  Boolean adminRole;

  /**
   * Workspace 내 RoleSet 에 포함된 경우, Default Role 인 경우
   */
  @Column(name = "role_is_default")
  Boolean defaultRole;

  @Column(name = "role_user_count")
  Integer userCount = 0;

  @Column(name = "role_group_count")
  Integer groupCount = 0;

  @Column(name = "role_seq")
  @JsonProperty(access = READ_ONLY)
  Integer seq = 0;

  @JsonIgnore
  @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @JoinTable(name = "role_perm",
      joinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "perm_id", referencedColumnName = "id"))
  @BatchSize(size = 10)
  Set<Permission> permissions = Sets.newHashSet();

  @OneToMany(mappedBy = "role", cascade = { CascadeType.ALL }, orphanRemoval = true)
  @BatchSize(size = 100)
  @RestResource(exported = false)
  @JsonIgnore
  Set<RoleDirectory> directories = Sets.newHashSet();

//  @JsonIgnore
//  @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
//  @JoinTable(name = "user_role",
//      joinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"),
//      inverseJoinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"))
//  Set<User> users = Sets.newHashSet();
//
//  @JsonIgnore
//  @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
//  @JoinTable(name = "group_role",
//      joinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"),
//      inverseJoinColumns = @JoinColumn(name = "group_id", referencedColumnName = "id"))
//  Set<Group> groups = Sets.newHashSet();

  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
  @JoinColumn(name = "role_set_id")
  @JsonBackReference
  RoleSet roleSet;

  @Transient
  @JsonProperty(access = WRITE_ONLY)
  private List<String> permissionNames;

  /**
   * Spring data rest 제약으로 인한 Dummy Property.
   *  - Transient 어노테이션 구성시 HandleBeforeSave 에서 인식 못하는 문제 발생
   */
  @Column(name = "workspace_contexts", length = 10000)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String contexts;

  public Role() {
    // Empty Constructor
  }

  public Role(String name) {
    this.name = name;
  }

  public Role(String name, String... permNames) {
    this.name = name;
    this.permissionNames = Lists.newArrayList(permNames);
  }

  public Role copyOf() {

    return new Role();
  }

  @JsonIgnore
  public List<String> getAllPermissionNames() {
    if(permissions == null) {
      return null;
    }

    return permissions.stream()
                      .map(Permission::getName)
                      .collect(Collectors.toList());
  }

  public boolean checkPermission(String permName) {

    Preconditions.checkNotNull(permName);

    if (permName.equals(this.name)) {
      return true;
    }

    if (CollectionUtils.isEmpty(this.permissions)) {
      return false;
    }

    for (Permission perm : this.permissions) {
      if (permName.equals(perm.getName())) {
        return true;
      }
    }

    return false;
  }

  public void savePermissions(Set<Permission> permissions) {

    if (this.permissions != null) {
      this.permissions.clear();
    }

    this.permissions = permissions;
  }

  public void addDirectory(RoleDirectory directory) {
    if(directories == null) {
      directories = Sets.newLinkedHashSet();
    }
    directories.add(directory);
    directory.setRole(this);

    // Count 처리
    if(directory.getType() == DirectoryProfile.Type.USER) {
      userCount++;
    } else {
      groupCount++;
    }
  }

  public void removeDirectory(RoleDirectory directory) {
    if(directory == null) {
      return;
    }

    if(directories == null) {
      return;
    }

    directories.remove(directory);
    directory.setRole(null);

    // Count 처리
    if(directory.getType() == DirectoryProfile.Type.USER) {
      userCount--;
    } else {
      groupCount--;
    }
  }

  @JsonIgnore
  public Map<String,RoleDirectory> getDirectoryMap() {
    if(directories == null) {
      return Maps.newHashMap();
    }

    return directories.stream()
                      .collect(Collectors.toMap(RoleDirectory::getDirectoryId,
                                                directory -> directory));
  }

  @Override
  public Map<String, String> getContextMap() {
    if(StringUtils.isEmpty(this.contexts)) {
      return null;
    }

    return GlobalObjectMapper.readValue(this.contexts, Map.class);
  }

  @JsonIgnore
  @Override
  public String getAuthority() {
    return getName();
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

  public RoleScope getScope() {
    return scope;
  }

  public void setScope(RoleScope scope) {
    this.scope = scope;
  }

  public Boolean getPredefined() {
    return predefined;
  }

  public void setPredefined(Boolean predefined) {
    this.predefined = predefined;
  }

  public Boolean getAdminRole() {
    return adminRole;
  }

  public void setAdminRole(Boolean adminRole) {
    this.adminRole = adminRole;
  }

  public Boolean getDefaultRole() {
    return defaultRole;
  }

  public void setDefaultRole(Boolean defaultRole) {
    this.defaultRole = defaultRole;
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

  public Integer getSeq() {
    return seq;
  }

  public void setSeq(Integer seq) {
    this.seq = seq;
  }

  public Set<Permission> getPermissions() {
    return permissions;
  }

  public void setPermissions(Set<Permission> permissions) {
    this.permissions = permissions;
  }

  public Set<RoleDirectory> getDirectories() {
    return directories;
  }

  public void setDirectories(Set<RoleDirectory> directories) {
    this.directories = directories;
  }

  //  public Set<User> getUsers() {
//    return users;
//  }
//
//  public Set<Group> getGroups() {
//    return groups;
//  }
//
//  public void setGroups(Set<Group> groups) {
//    this.groups = groups;
//  }
//
//  public void setUsers(Set<User> users) {
//    this.users = users;
//  }

  public RoleSet getRoleSet() {
    return roleSet;
  }

  public void setRoleSet(RoleSet roleSet) {
    this.roleSet = roleSet;
  }

  public String getContexts() {
    return contexts;
  }

  public void setContexts(String contexts) {
    this.contexts = contexts;
  }

  public List<String> getPermissionNames() {
    return permissionNames;
  }

  public void setPermissionNames(List<String> permissionNames) {
    this.permissionNames = permissionNames;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    Role role = (Role) o;

    return id.equals(role.id);
  }

  @Override
  public int hashCode() {
    return id.hashCode();
  }

  @Override
  public String toString() {
    return "Role{" +
        "name='" + name + '\'' +
        ", scope=" + scope +
        ", adminRole=" + adminRole +
        ", defaultRole=" + defaultRole +
        "} " + super.toString();
  }

  public enum RoleScope {
    GLOBAL, WORKSPACE
  }
}
