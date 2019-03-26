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

package app.metatron.discovery.domain.datasource;

import app.metatron.discovery.domain.context.ContextDomainRepository;
import app.metatron.discovery.domain.workspace.Workspace;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Set;

/**
 * DataSourceRepository
 */
@RepositoryRestResource(path = "datasources", itemResourceRel = "datasource"
    , collectionResourceRel = "datasources", excerptProjection = DataSourceProjections.DefaultProjection.class)
public interface DataSourceRepository extends JpaRepository<DataSource, String>,
    QueryDslPredicateExecutor<DataSource>,
    ContextDomainRepository<DataSource>,
    DataSourceRepositoryExtends,
    DataSourceSearchRepository {

  /**
   * fake!! http://stackoverflow.com/questions/25201306/implementing-custom-methods-of-spring-data-repository-and-exposing-them-through
   *
   * for search
   */
  @RestResource(path = "keyword")
  @Query("select ds from DataSource ds where ds.id= :q")
  Page<DataSource> searchByKeyword(@Param("q") String keywords, Pageable pageable);

  @RestResource(path = "query")
  @Query("select ds from DataSource ds where ds.id= :q")
    // fake!!
  Page<DataSource> searchByQuery(@Param("q") String query, Pageable pageable);

  @RestResource(exported = false)
  @Query(value = "SELECT ds FROM DataSource ds LEFT JOIN FETCH ds.fields where ds.id = :id")
  DataSource findByIdIncludeChild(@Param("id") String id);

  @RestResource(exported = false)
  @Query(value = "SELECT ds FROM DataSource ds LEFT JOIN FETCH ds.connection where ds.id = :id")
  DataSource findByIdIncludeConnection(@Param("id") String id);

  @RestResource(exported = false)
  @Query(value = "SELECT distinct ds FROM DataSource ds LEFT JOIN FETCH ds.fields")
  List<DataSource> findAllIncludeChild();

  @RestResource(exported = false)
  @Query("SELECT distinct ds FROM DataSource ds LEFT JOIN FETCH ds.fields where ds.id in :ids")
  List<DataSource> findByIdsIncludeChild(@Param("ids") List ids);

  @RestResource(exported = false)
  List<DataSource> findByDsType(DataSource.DataSourceType dsType);

  /**
   * Size History 배치잡에서 활용 용도
   */
  @RestResource(exported = false)
  Page<DataSource> findByDsTypeAndConnTypeAndStatus(DataSource.DataSourceType dsType,
                                                    DataSource.ConnectionType connType,
                                                    DataSource.Status status, Pageable page);


  @RestResource(exported = false)
  @Query("SELECT ds FROM DataSource ds " +
      "WHERE ds.dsType <> 'JOIN' " +
      "AND ds.connType <> 'LINK' " +
      "AND ds.status <> 'PREPARING' " +
      "AND ds.srcType IS NOT NULL")
  Page<DataSource> findByDataSourceForCheck(Pageable page);

  @RestResource(path = "multiple", rel = "findFieldsByDataSourceId")
  @Query("SELECT ds FROM DataSource ds WHERE ds.id IN (:ids)")
  List<DataSource> findByDataSourceMultipleIds(@Param("ids") List<String> dsIds);

  @RestResource(path = "typeof", rel = "findDataSourceByType")
  @Query("SELECT ds FROM DataSource ds WHERE ds.dsType = :type")
  Page<DataSource> findByDataSourcePerType(@Param("type") DataSource.DataSourceType dataSourceType, Pageable page);

  @RestResource(path = "type", rel = "findDataSourceByTypeInWorkspace")
  @Query("SELECT ds FROM DataSource ds INNER JOIN ds.workspaces ws WHERE ws.id = :workspaceId AND ds.dsType = :dsType")
  List<DataSource> findByDataSourceInWorkspace(@Param("workspaceId") String workspaceId,
                                               @Param("dsType") DataSource.DataSourceType dataSourceType);

  @RestResource(exported = false)
  @Query("SELECT ds FROM DataSource ds WHERE " +
      "(ds.id IN ( SELECT ds1.id FROM DataSource ds1 INNER JOIN ds1.workspaces ws WHERE ws.id = :workspaceId) " +
      "OR ds.id IN ( SELECT ds2.id FROM DataSource ds2 WHERE ds2.published = TRUE)) " +
      "ORDER BY modifiedTime DESC")
  Page<DataSource> findDataSourcesInWorkspace(@Param("workspaceId") String workspaceId, Pageable pageable);

  @RestResource(exported = false)
  List<DataSource> findByEngineNameStartingWith(String name);

  @RestResource(exported = false)
  @Query("SELECT ds FROM DataSource ds LEFT JOIN FETCH ds.connection WHERE ds.engineName = :engineName")
  DataSource findByEngineName(@Param("engineName") String engineName);

  @RestResource(exported = false)
  @Query("SELECT ds.id FROM DataSource ds WHERE ds.engineName = :engineName")
  String findIdByEngineName(@Param("engineName") String engineName);

  @RestResource(exported = false)
  @Query("SELECT ds.engineName FROM DataSource ds WHERE ds.status = 'ENABLED'")
  List<String> findEngineNameByAll();

  @RestResource(exported = false)
  List<DataSource> findByIdIn(List<String> ids);

  @RestResource(exported = false)
  @Query("SELECT DISTINCT ds.createdBy FROM DataSource ds where ds.createdBy IS NOT NULL")
  List<String> findDistinctCreatedBy();

  @RestResource(exported = false)
  @Query("SELECT DISTINCT ds.createdBy FROM DataSource ds where ds.dsType in (:dsTypes) and ds.createdBy IS NOT NULL")
  List<String> findDistinctCreatedBy(@Param("dsTypes") DataSource.DataSourceType... dsTypes);

  @RestResource(exported = false)
  @Query("SELECT DISTINCT ds.workspaces FROM DataSource ds where ds.id = :id")
  Set<Workspace> findWorkspacesInDataSource(@Param("id") String id);
}
