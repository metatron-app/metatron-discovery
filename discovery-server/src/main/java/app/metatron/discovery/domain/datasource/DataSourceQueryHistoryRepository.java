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

import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 8. 30..
 */
@RepositoryRestResource(exported = false, path = "datasourcequeryhistories", itemResourceRel = "datasourcequeryhistory"
        , collectionResourceRel = "datasourcequeryhistories")
public interface DataSourceQueryHistoryRepository extends JpaRepository<DataSourceQueryHistory, String>,
    JpaSpecificationExecutor<DataSourceQueryHistory>,
    QueryDslPredicateExecutor<DataSourceQueryHistory> {

  @RestResource(exported = false)
  Page<DataSourceQueryHistory> findByDataSourceIdOrderByModifiedTimeDesc(String dataSourceId, Pageable pageable);

  @RestResource(exported = false)
  @Query("select year(h.modifiedTime), month(h.modifiedTime), day(h.modifiedTime), hour(h.modifiedTime), count(h.id) " +
          "from DataSourceQueryHistory h " +
          "where h.dataSourceId = :dataSourceId AND h.modifiedTime > :criteriaTime " +
          "group by year(h.modifiedTime), month(h.modifiedTime), day(h.modifiedTime), hour(h.modifiedTime) " +
          "order by year(h.modifiedTime), month(h.modifiedTime), day(h.modifiedTime), hour(h.modifiedTime) asc ")
  List<Object> findByQueryCountPerHour(@Param("dataSourceId") String dataSourceId,
                                       @Param("criteriaTime") DateTime criteriaTime);

  @RestResource(exported = false)
  @Query("select u.fullName, count(h.id) " +
          "from DataSourceQueryHistory h, User u " +
          "where h.dataSourceId = :dataSourceId AND h.modifiedTime > :criteriaTime AND h.createdBy = u.username " +
          "group by h.createdBy, u.fullName " +
          "order by h.createdBy")
  // 사용자별 질의분포 차트에 name 으로 표시해야 해서 query 수정.
  List<Object> findByQueryCountPerUser(@Param("dataSourceId") String dataSourceId,
                                       @Param("criteriaTime") DateTime criteriaTime);

  @RestResource(exported = false)
  @Query("select " +
          "case when (h.elapsedTime <= 3000 and h.elapsedTime > 0) then 'Within 3 Seconds'  " +
          "when (h.elapsedTime <= 10000 and h.elapsedTime > 3000) then 'Within 10 Seconds'  " +
          "when (h.elapsedTime <= 60000 and h.elapsedTime > 10000) then 'Within 1 Minutes'  " +
          "when (h.elapsedTime > 60000) then 'More' else 'More' end, count(h.id) " +
          "from DataSourceQueryHistory h " +
          "where h.dataSourceId = :dataSourceId AND h.modifiedTime > :criteriaTime " +
          "group by " +
          "case when (h.elapsedTime <= 3000 and h.elapsedTime > 0) then 'Within 3 Seconds'  " +
          "when (h.elapsedTime <= 10000 and h.elapsedTime > 3000) then 'Within 10 Seconds'  " +
          "when (h.elapsedTime <= 60000 and h.elapsedTime > 10000) then 'Within 1 Minutes'  " +
          "when (h.elapsedTime > 60000) then 'More' else 'More' end")
  List<Object> findByQueryCountPerElapsedTime(@Param("dataSourceId") String dataSourceId,
                                              @Param("criteriaTime") DateTime criteriaTime);

  @Modifying
  @Transactional
  @Query("DELETE FROM DataSourceQueryHistory h WHERE h.dataSourceId = :dataSourceId")
  void deleteQueryHistoryById(@Param("dataSourceId") String dataSourceId);
}
