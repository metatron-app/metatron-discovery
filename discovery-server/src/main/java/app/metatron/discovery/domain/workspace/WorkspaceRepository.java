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

import java.util.List;

import app.metatron.discovery.domain.context.ContextDomainRepository;

/**
 * The interface Workspace repository.
 */
@RepositoryRestResource(path = "workspaces", itemResourceRel = "workspace"
        , collectionResourceRel = "workspaces", excerptProjection = WorkspaceProjections.DefaultProjection.class)
public interface WorkspaceRepository extends JpaRepository<Workspace, String>,
                                            QueryDslPredicateExecutor<Workspace>,
                                            ContextDomainRepository<Workspace>,
                                            WorkspaceRepositoryExtends {

  /**
   * 개인 사용자가 소유하고 있는 Workspace 조회
   * @param userId 사용자 ID
   * @return
   */
  @RestResource(path = "private", rel = "findPrivateWorkspaceByOwnerId")
  @Query("SELECT ws FROM Workspace ws WHERE ws.ownerId = :userId AND ws.publicType='PRIVATE'")
  Workspace findPrivateWorkspaceByOwnerId(@Param("userId") String userId);

  /**
   * 사용자가 공유하거나 공유 받은 Workspace 목록 조회 <br/>
   *
   * @param username 사용자 ID
   * @return
   */
  @RestResource(exported = false)
  @Query("SELECT ws FROM Workspace ws WHERE " +
          "ws.id IN ( SELECT ws1.id FROM Workspace ws1 INNER JOIN ws1.members t WHERE t.memberId IN :targets ) " +
          "OR ws.id IN ( SELECT ws2.id FROM Workspace ws2 WHERE ws.ownerId = :username ) ORDER BY ws.publicType ASC, ws.name ASC")
  List<Workspace> findMyWorkspaces(@Param("username") String username, @Param("targets") List<String> targets);

  /**
   * 사용자가 공유하거나 공유 받은 Workspace ID 목록 조회 <br/>
   *
   * @param username 사용자 ID
   * @return
   */
  @RestResource(exported = false)
  @Query("SELECT ws FROM Workspace ws " +
      "WHERE ws.id IN ( SELECT ws1.id FROM Workspace ws1 INNER JOIN ws1.members t WHERE t.memberId IN :targets ) " +
      "OR ws.id IN ( SELECT ws2.id FROM Workspace ws2 WHERE ws2.ownerId = :username AND ws2.publicType = 'SHARED' ) " +
      "ORDER BY ws.publicType ASC, ws.name ASC")
  Page<Workspace> findMyPublicWorkspaces(@Param("username") String username,
                                         @Param("targets") List<String> targets,
                                         Pageable pageable);

  @RestResource(exported = false)
  @Query("SELECT ws FROM WorkspaceFavorite wf, Workspace ws " +
      "WHERE wf.workspaceId = ws.id AND  wf.username = :username " +
      "ORDER BY ws.name ASC")
  Page<Workspace> findMyPublicWorkspacesWithFavorite(@Param("username") String username,
                                                     Pageable pageable);

  @Transactional
  @Modifying
  @Query("UPDATE Workspace ws SET ws.lastAccessedTime = CURRENT_TIMESTAMP WHERE ws.id = :workspaceId")
  void updateLastAccessedTime(@Param("workspaceId") String workspaceId);

  @Transactional
  @Modifying
  @Query("UPDATE Workspace ws SET ws.active = false WHERE ws.ownerId = :ownerId AND ws.publicType IN (:publicTypes)")
  void updateInactiveWorkspaceOfOwner(@Param("ownerId") String ownerId,
                                      @Param("publicTypes") Workspace.PublicType... publicType);

  @Transactional
  @Modifying
  @Query("UPDATE Workspace ws SET ws.active = false, ws.ownerId = concat(:ownerId, '_deleted') WHERE ws.ownerId = :ownerId AND ws.publicType IN (:publicTypes)")
  void updateInactiveWorkspaceAndChangeKnownOwnerId(@Param("ownerId") String ownerId,
                                      @Param("publicTypes") Workspace.PublicType... publicType);

  @Query("SELECT ws.id FROM Workspace ws INNER JOIN ws.roleSets rs WHERE rs.id = :roleSetId")
  List<String> findIdByRoleSetId(@Param("roleSetId") String roleSetId);

  @Override
  @RestResource(exported = false)
  List<Workspace> findAll();

  @Override
  @RestResource(exported = false)
  Page<Workspace> findAll(Pageable pageable);
}
