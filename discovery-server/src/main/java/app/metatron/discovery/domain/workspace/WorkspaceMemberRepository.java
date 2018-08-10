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

/**
 * Created by kyungtaak on 2016. 12. 20..
 */

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * The interface Book repository.
 */
@RepositoryRestResource(exported = false, itemResourceRel = "member", collectionResourceRel = "members",
    excerptProjection = WorkspaceMemberProjections.DefaultProjection.class)
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long>,
    WorkspaceMemberRepositoryExtends,
    QueryDslPredicateExecutor<WorkspaceMember> {

  @Transactional
  @Modifying
  @Query("UPDATE WorkspaceMember wm SET wm.memberName = :memberName WHERE wm.memberId = :memberId")
  void updateMemberName(@Param("memberId") String memberId,
                        @Param("memberName") String memberName);

  @Transactional
  @Modifying
  @Query("DELETE FROM WorkspaceMember wm WHERE wm.memberId IN (:memberIds)")
  void deleteByMemberIds(@Param("memberIds") List<String> memberIds);

  @Transactional
  @Modifying
  @Query("UPDATE WorkspaceMember wm SET wm.role = :roleName WHERE wm.workspace = :workspace AND wm.role = :targetRoleName")
  void updateMemberRoleInWorkspace(@Param("workspace") Workspace workspace,
                                   @Param("targetRoleName") String targetRoleName,
                                   @Param("roleName") String roleName);

  @Transactional
  @Modifying
  @Query("UPDATE WorkspaceMember wm SET wm.role = :roleName WHERE wm.workspace = :workspace AND wm.role IN (:targetRoleNames)")
  void updateMultiMemberRoleInWorkspace(@Param("workspace") Workspace workspace,
                                        @Param("targetRoleNames") List<String> targetRoleNames,
                                        @Param("roleName") String roleName);


  @Transactional
  @Modifying(clearAutomatically = true)
  @Query("UPDATE WorkspaceMember wm SET wm.role = :roleName WHERE wm.workspace.id IN (:workspaceIds) AND wm.role = :targetRoleName")
  void updateMultiMemberRoleInWorkspaces(@Param("workspaceIds") List<String> workspaceIds,
                                         @Param("targetRoleName") String targetRoleName,
                                         @Param("roleName") String roleName);

}
