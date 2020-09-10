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

package app.metatron.discovery.domain.user;

import com.google.common.collect.Sets;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.sk.idcube.common.security.AccountInfoSecurity;
import com.sk.idcube.common.security.IDCubeSecurity;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.search.annotations.Analyze;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.FieldBridge;
import org.hibernate.search.annotations.Fields;
import org.hibernate.search.annotations.Indexed;
import org.hibernate.search.annotations.SortableField;
import org.hibernate.search.annotations.Store;
import org.hibernate.search.bridge.builtin.EnumBridge;
import org.hibernate.validator.constraints.Email;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Table;
import javax.persistence.Transient;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.user.role.Permission;
import app.metatron.discovery.domain.user.role.Role;
import app.metatron.discovery.domain.user.role.RoleService;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY;
import static org.hibernate.search.annotations.Index.NO;

/**
 * 사용자 모델 정의 <br/>
 * Spring Security 에서 제공하는 User 모델(UserDetails) 확장 구현
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "i_user_name", columnList = "user_name"),
    @Index(name = "i_user_email", columnList = "user_email"),
    @Index(name = "i_user_username_status", columnList = "user_name,user_status")
})
@Indexed
public class User extends AbstractHistoryEntity implements UserDetails, MetatronDomain<String> {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  @Column(name = "user_name", length = 50)
  @Field(analyze = Analyze.NO, store = Store.YES)
  @NotBlank
  private String username;

  @JsonProperty(access = WRITE_ONLY)
  @Column(name = "user_password", length = 200)
  private String password;

  @Column(name = "user_full_name")
  @Fields({
      @Field(analyze = Analyze.YES, store = Store.YES),
      @Field(name = "sortFullName", analyze = Analyze.NO, store = Store.NO, index = NO)
  })
  @SortableField(forField = "sortFullName")
  private String fullName;

  @Column(name = "user_email")
  @Field(analyze = Analyze.NO, store = Store.YES)
  private String email;

  @Column(name = "user_tel")
  @Field(analyze = Analyze.YES, store = Store.YES)
  private String tel;

  /**
   * use flag
   */
  @Column(name = "user_status")
  @Enumerated(EnumType.STRING)
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  @Field(analyze = Analyze.NO, store = Store.YES)
  @FieldBridge(impl = EnumBridge.class)
  private Status status;

  @Column(name = "user_status_msg", length = 3000)
  private String statusMessage;

  @Column(name = "user_origin")
  private String userOrigin;

  /**
   * User Image Url
   */
  @Column(name = "user_image_Url")
  private String imageUrl;

  @Transient
  @JsonProperty(access = WRITE_ONLY)
  private List<String> groupNames;

  @Transient
  @JsonProperty(access = WRITE_ONLY)
  private List<String> roleNames;

  @Transient
  @JsonProperty(access = WRITE_ONLY)
  private Boolean passMailer = false;

  @Transient
  @JsonProperty(access = WRITE_ONLY)
  private String roleSetName;

  @Transient
  @JsonProperty(access = WRITE_ONLY)
  private String workspaceType;

  @Transient
  private RoleService roleService;

  public User() {
  }

  public User(String username, String password) {
    this.username = username;
    this.password = password;
  }

  @JsonIgnore
  @Transient
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    Set<GrantedAuthority> authorities = Sets.newHashSet();

    List<Role> roles = getRoles();
    Set<Permission> permissions = Sets.newHashSet();
    for (Role role : roles) {
      if(CollectionUtils.isEmpty(role.getPermissions())) {
        continue;
      }
      permissions.addAll(role.getPermissions());
    }

    authorities.addAll(roles);
    authorities.addAll(permissions);

    return authorities;
  }

  @JsonIgnore
  @Transient
  public List<Role> getRoles() {
    return roleService.getRolesByUsername(username);
  }

  @JsonIgnore
  @Transient
  public Set<Permission> getPermissions() {
    Set<Permission> permissions = Sets.newHashSet();

    List<Role> roles = getRoles();
    for (Role role : roles) {
      if(CollectionUtils.isEmpty(role.getPermissions())) {
        continue;
      }
      permissions.addAll(role.getPermissions());
    }

    return permissions;
  }

  public void setRoleService(RoleService roleService) {
    this.roleService = roleService;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  @Override
  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  @Override
  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getTel() {
    if(StringUtils.isEmpty(this.tel)) {
      return tel;
    }
    try {
      IDCubeSecurity security = new AccountInfoSecurity();
      return security.decrypt(tel);
    } catch (Exception e) {
      return tel;
    }
  }

  public String getEncryptedTel() {
    return this.tel;
  }

  public void setTel(String tel) {
    this.tel = tel;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public String getStatusMessage() {
    return statusMessage;
  }

  public void setStatusMessage(String statusMessage) {
    this.statusMessage = statusMessage;
  }

  @Override
  @JsonIgnore
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  @JsonIgnore
  public boolean isAccountNonExpired() {
    return status == Status.EXPIRED ? false : true;
  }

  @Override
  @JsonIgnore
  public boolean isAccountNonLocked() {
    return status == Status.LOCKED ? false : true;
  }

  @Override
  public boolean isEnabled() {
    return status == Status.ACTIVATED ? true : false;
  }

  public List<String> getRoleNames() {
    return roleNames;
  }

  public void setRoleNames(List<String> roleNames) {
    this.roleNames = roleNames;
  }

  public List<String> getGroupNames() {
    return groupNames;
  }

  public void setGroupNames(List<String> groupNames) {
    this.groupNames = groupNames;
  }

  public Boolean getPassMailer() {
    return passMailer;
  }

  public void setPassMailer(Boolean passMailer) {
    this.passMailer = passMailer;
  }

  public String getRoleSetName() {
    return roleSetName;
  }

  public void setRoleSetName(String roleSetName) {
    this.roleSetName = roleSetName;
  }

  public String getWorkspaceType() {
    return workspaceType;
  }

  public void setWorkspaceType(String workspaceType) {
    this.workspaceType = workspaceType;
  }

  public String getUserOrigin() {
    return userOrigin;
  }

  public void setUserOrigin(String userOrigin) {
    this.userOrigin = userOrigin;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    User user = (User) o;

    return id != null ? id.equals(user.id) : user.id == null;
  }

  @Override
  public int hashCode() {
    return id != null ? id.hashCode() : 0;
  }

  @Override
  public String toString() {
    return "User{" +
            "id='" + id + '\'' +
            ", username='" + username + '\'' +
            ", fullName='" + fullName + '\'' +
            ", tel='" + tel + '\'' +
            ", status=" + status +
            ", imageUrl='" + imageUrl + '\'' +
            "} " + super.toString();
  }

  public enum Status {
    REJECTED,
    EXPIRED,
    LOCKED,
    DELETED,
    REQUESTED,
    ACTIVATED
  }

}
