/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine.monitoring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

@RepositoryRestResource(path = "monitoring", itemResourceRel = "monitoring"
    , collectionResourceRel = "monitorings", excerptProjection = EngineMonitoringProjections.DefaultProjection.class)
public interface EngineMonitoringRepository extends JpaRepository<EngineMonitoring, String>
    , QueryDslPredicateExecutor<EngineMonitoring> {

  @RestResource(exported = false)
  List<EngineMonitoring> findByHostnameAndPortAndType(String hostname, String port, String type);

  @RestResource(exported = false)
  @Query("SELECT MIN(status) as low_status, MAX(status) as max_status, em.type from EngineMonitoring em group by em.type")
  List<Object[]> findServerListByStatus();

  @RestResource(exported = false)
  @Query("SELECT em from EngineMonitoring em where em.type IN (:types)")
  List<EngineMonitoring> findByType(@Param("types") List<String> types);
}
