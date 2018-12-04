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
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 9. 3..
 */
@RepositoryRestResource(exported = false, path = "sizehistories", itemResourceRel = "sizehistory"
        , collectionResourceRel = "sizehistories")
public interface DataSourceSizeHistoryRepository extends JpaRepository<DataSourceSizeHistory, String> {

  Page<DataSourceSizeHistory> findByDataSourceIdOrderByCreatedTimeDesc(String dataSourcdId, Pageable pageable);

  @Modifying
  @Transactional
  @Query("DELETE FROM DataSourceSizeHistory h WHERE h.dataSourceId = :dataSourceId and h.createdTime < :time")
  void deleteHistroy(@Param("dataSourceId") String dataSourceId, @Param("time") DateTime dateTime);

  @Modifying
  @Transactional
  @Query("DELETE FROM DataSourceSizeHistory h WHERE h.dataSourceId = :dataSourceId")
  void deleteHistoryById(@Param("dataSourceId") String dataSourceId);

  @Query("select year(h.createdTime), month(h.createdTime), day(h.createdTime), hour(h.createdTime), avg(h.size) " +
          "from DataSourceSizeHistory h " +
          "where h.dataSourceId = :dataSourceId AND h.modifiedTime > :criteriaTime " +
          "group by year(h.createdTime), month(h.createdTime), day(h.createdTime), hour(h.createdTime) " +
          "order by year(h.createdTime), month(h.createdTime), day(h.createdTime), hour(h.createdTime) asc ")
  List<Object> findByAvgSizePerHour(@Param("dataSourceId") String dataSourceId,
                                    @Param("criteriaTime") DateTime criteriaTime);

}
