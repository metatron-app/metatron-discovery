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
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.transaction.annotation.Transactional;

import app.metatron.discovery.domain.context.ContextDomainRepository;

/**
 * Created by kyungtaak on 2016. 1. 7..
 */
@RepositoryRestResource(path = "roles", itemResourceRel = "role", collectionResourceRel = "roles",
    excerptProjection = RoleProjections.DefaultRoleProjection.class)
public interface RoleRepository extends JpaRepository<Role, String>, QueryDslPredicateExecutor<Role>,
                                        RoleSearchRepository, RoleRepositoryExtends, ContextDomainRepository {

  @RestResource(path = "keyword")
  @Query("select r from Role r where r.id= :q")  // fake!! http://stackoverflow.com/questions/25201306/implementing-custom-methods-of-spring-data-repository-and-exposing-them-through
  Page<Role> searchByKeyword(@Param("q") String keywords, Pageable pageable);

  @RestResource(path = "query")
  @Query("select r from Role r where r.id= :q")  // fake!!
  Page<Role> searchByQuery(@Param("q") String query, Pageable pageable);

  @RestResource(path = "names")
  Role findByName(@Param("name") String name);

  @RestResource(path = "scopes")
  Page<Role> findByScope(@Param("scope") Role.RoleScope scope, Pageable pageable);

  @RestResource(exported = false)
  Long countByScopeAndName(Role.RoleScope scope, String name);

  @RestResource(exported = false)
  Long countByRoleSetAndName(RoleSet roleSet, String name);

  @RestResource(exported = false)
  Role findByScopeAndName(@Param("scope") Role.RoleScope scope, @Param("name") String name);

  @RestResource(exported = false)
  @Query("SELECT role FROM Role role JOIN FETCH role.permissions perms WHERE role.name = :name AND role.scope = :scope")
  Role findByNameAndScopeWithPermissions(@Param("name") String name, @Param("scope") Role.RoleScope scope);

  @Transactional
  @Modifying(clearAutomatically = true)
  @Query("DELETE FROM Role role WHERE role.roleSet = :roleSet")
  void deleteRoleInRoleSet(@Param("roleSet") RoleSet roleSet);

}
