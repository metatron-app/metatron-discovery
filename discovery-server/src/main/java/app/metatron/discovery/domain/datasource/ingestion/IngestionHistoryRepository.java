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

package app.metatron.discovery.domain.datasource.ingestion;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 8. 13..
 */
@RepositoryRestResource(exported = false)
public interface IngestionHistoryRepository extends JpaRepository<IngestionHistory, Long> {

  @RestResource(exported = false)
  Page<IngestionHistory> findByDataSourceIdOrderByModifiedTimeDesc(String dataSourceId, Pageable pageable);

  @RestResource(exported = false)
  Page<IngestionHistory> findByDataSourceIdAndStatusOrderByModifiedTimeDesc(String dataSourceId,
                                                                            IngestionHistory.IngestionStatus status,
                                                                            Pageable pageable);

  @RestResource(exported = false)
  List<IngestionHistory> findByDataSourceIdAndStatus(String dataSourceId, IngestionHistory.IngestionStatus status);

  @RestResource(exported = false)
  List<IngestionHistory> findByStatus(IngestionHistory.IngestionStatus status);

  @Transactional
  @Modifying
  @Query("DELETE FROM IngestionHistory history WHERE history.dataSourceId = :dataSourceId")
  void deteleHistoryByDataSourceId(@Param("dataSourceId") String dataSourceId);
}
