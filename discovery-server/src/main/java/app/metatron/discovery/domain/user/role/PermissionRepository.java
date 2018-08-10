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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Set;

/**
 * Created by kyungtaak on 2016. 1. 7..
 */
@RepositoryRestResource(path = "permissions",
    itemResourceRel = "permission", collectionResourceRel = "permissions",
    excerptProjection = PermissionProjections.DefaultRoleProjection.class)
public interface PermissionRepository extends JpaRepository<Permission, Long> {

  @RestResource(path = "names")
  Permission findByName(String name);

  @RestResource(path = "domains")
  Page<Permission> findByDomain(Permission.DomainType domain, Pageable pageable);

  @Override
  @RestResource(exported = false)
  Page<Permission> findAll(Pageable pageable);

  @Override
  @RestResource(exported = false)
  List<Permission> findAll();

  @Override
  @RestResource(exported = false)
  void delete(Long aLong);

  @Override
  @RestResource(exported = false)
  void delete(Permission entity);

  @Override
  @RestResource(exported = false)
  Permission save(Permission entity);

  @RestResource(exported = false)
  @Query("SELECT perm FROM Permission perm JOIN perm.roles roles WHERE roles.name = :name AND roles.scope = :scope")
  Set<Permission> findByRoleNameAndScope(@Param("name") String name, @Param("scope") Role.RoleScope scope);

  @RestResource(exported = false)
  Set<Permission> findByNameInAndDomain(List<String> names, Permission.DomainType domain);

  @RestResource(exported = false)
  @Query("SELECT distinct perm.name FROM Permission perm JOIN perm.roles roles WHERE roles.name IN :name")
  Set<String> findPermissionNameByRoleNames(@Param("name") List<String> name);
}
