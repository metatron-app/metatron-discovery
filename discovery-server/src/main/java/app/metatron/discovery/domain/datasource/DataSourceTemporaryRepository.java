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
 *
 */
@RepositoryRestResource(exported = false)
public interface DataSourceTemporaryRepository extends JpaRepository<DataSourceTemporary, String> {

  Page<DataSourceTemporary> findByStatusAndNextExpireTimeBefore(DataSourceTemporary.LoadStatus status, DateTime dateTime, Pageable pageable);

  List<DataSourceTemporary> findByDataSourceIdAndFiltersOrderByModifiedTimeDesc(String dataSourceId, String filters);

  List<DataSourceTemporary> findByDataSourceIdOrderByModifiedTimeDesc(String dataSourceId);

  List<DataSourceTemporary> findByStatus(DataSourceTemporary.LoadStatus status);

  DataSourceTemporary findByName(String name);

  @Transactional
  @Modifying
  @Query("DELETE FROM DataSourceTemporary dt WHERE dt.id IN (:temporaryIds)")
  void deteleTemporaryByIds(@Param("temporaryIds") List<String> temporaryIds);

  @Transactional
  @Modifying
  @Query("UPDATE DataSourceTemporary dt SET dt.status = :status WHERE dt.id IN (:temporaryIds)")
  void updateTemporaryStatusByIds(@Param("temporaryIds") List<String> temporaryIds,
                                   @Param("status") DataSourceTemporary.LoadStatus status);
}
