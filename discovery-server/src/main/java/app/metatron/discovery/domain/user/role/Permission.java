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

import com.google.common.collect.Sets;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import org.hibernate.annotations.GenericGenerator;
import org.springframework.security.core.GrantedAuthority;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;

import static javax.persistence.CascadeType.MERGE;

/**
 * Created by kyungtaak on 2016. 1. 7..
 */
@Entity
@Table(name = "permissions")
public class Permission extends AbstractHistoryEntity implements MetatronDomain<Long>, GrantedAuthority {

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Column(name = "id")
  Long id;

  @Column(name = "perm_name")
  String name;

  @Column(name = "perm_domain")
  @Enumerated(EnumType.STRING)
  DomainType domain;

  @ManyToMany(mappedBy = "permissions", cascade = {MERGE})
  @JsonBackReference
  Set<Role> roles = Sets.newHashSet();

  public Permission() {
    // Empty Constructor
  }

  public Permission(String name) {
    this.name = name;
    this.domain = DomainType.SYSTEM;
  }

  public Permission(String name, DomainType domain) {
    this.name = name;
    this.domain = domain;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public DomainType getDomain() {
    return domain;
  }

  public void setDomain(DomainType domain) {
    this.domain = domain;
  }

  public Set<Role> getRoles() {
    return roles;
  }

  public void setRoles(Set<Role> roles) {
    this.roles = roles;
  }

  @Override
  public String toString() {
    return "Permission{" +
            "id=" + id +
            ", name='" + name + '\'' +
            '}';
  }

  @JsonIgnore
  @Override
  public String getAuthority() {
    return getName();
  }

  public enum DomainType {
    SYSTEM, WORKSPACE
  }
}
