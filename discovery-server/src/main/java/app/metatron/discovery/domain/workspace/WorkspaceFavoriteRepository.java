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
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * The interface Book repository.
 */
@RepositoryRestResource(exported = false)
public interface WorkspaceFavoriteRepository extends JpaRepository<WorkspaceFavorite, Long> {

  @Query("SELECT wf.workspaceId FROM WorkspaceFavorite wf WHERE wf.username = :username")
  Set<String> findWorkspaceIdByUsername(@Param("username") String username);

  @Query("SELECT case when count(wf.workspaceId) > 0 then true else false end " +
      "FROM WorkspaceFavorite wf WHERE wf.workspaceId = :workspaceId AND wf.username = :username")
  Boolean isFavoritWorkspace(@Param("workspaceId") String workspaceId, @Param("username") String username);

  Long countDistinctByWorkspaceId(String workspaceId);

  @Transactional
  void deleteByUsername(String username);

  @Transactional
  void deleteByUsernameAndWorkspaceId(String username, String workspaceId);

  @Transactional
  void deleteByWorkspaceId(String workspaceId);
}
