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

package app.metatron.discovery.domain.mdm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 *
 */
@RepositoryRestResource(exported = false)
public interface MetadataPopularityRepository extends JpaRepository<MetadataPopularity, String>,
    QueryDslPredicateExecutor<MetadataPopularity> {

  MetadataPopularity findByTypeAndMetadataId(MetadataPopularity.PopularityType type, String metadataId);

  MetadataPopularity findByTypeAndMetadataIdAndSourceId(MetadataPopularity.PopularityType type, String metadataId, String sourceId);

  MetadataPopularity findByTypeAndMetaColumnId(MetadataPopularity.PopularityType type, Long metaColumnId);

  MetadataPopularity findByTypeAndMetadataIdAndSourceIdAndMetaColumnId(MetadataPopularity.PopularityType type, String metadataId, String sourceId, Long metaColumnId);

  @Query("SELECT MAX(m.score) FROM MetadataPopularity m WHERE m.type = :type")
  Optional<Long> findByMaxScore(@Param("type") MetadataPopularity.PopularityType type);

  @Modifying
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Query("DELETE FROM MetadataPopularity")
  void delelteAllPopularity();
}
