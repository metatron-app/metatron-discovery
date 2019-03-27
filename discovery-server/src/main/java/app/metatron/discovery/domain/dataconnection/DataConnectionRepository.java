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

package app.metatron.discovery.domain.dataconnection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Set;

import app.metatron.discovery.domain.workspace.Workspace;

/**
 * DataConnectionRepository
 */
@RepositoryRestResource(path = "connections",
    itemResourceRel = "connection", collectionResourceRel = "connections",
    excerptProjection = DataConnectionProjections.defaultProjection.class)
public interface DataConnectionRepository extends JpaRepository<DataConnection, String>,
                                                  QueryDslPredicateExecutor<DataConnection> {

  @RestResource(exported = false)
  @Query("SELECT DISTINCT dc.createdBy FROM DataConnection dc where dc.createdBy IS NOT NULL")
  List<String> findDistinctCreatedBy();

  @RestResource(exported = false)
  @Query("SELECT dc.workspaces FROM DataConnection dc where dc.id = :id")
  Set<Workspace> findWorkspacesInDataConnection(@Param("id") String id);
}
