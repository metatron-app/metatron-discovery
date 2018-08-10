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

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 8. 30..
 */
@RepositoryRestResource(exported = false, excerptProjection = DataSourceAliasProjections.DefaultProjection.class)
public interface DataSourceAliasRepository extends JpaRepository<DataSourceAlias, Long>,
    QueryDslPredicateExecutor<DataSourceAlias> {

  List<DataSourceAlias> findByDashBoardId(String dashboardId);

  DataSourceAlias findDistinctByDataSourceIdAndDashBoardIdAndFieldName(String dataSourceId, String dashboardId, String fieldName);
}
