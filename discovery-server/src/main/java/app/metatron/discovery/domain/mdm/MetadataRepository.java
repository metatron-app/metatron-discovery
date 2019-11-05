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
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.history.RevisionRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 8. 30..
 */
@RepositoryRestResource(path = "metadatas", itemResourceRel = "metadata", collectionResourceRel = "metadatas",
    excerptProjection = MetadataProjections.DefaultProjection.class)
public interface MetadataRepository extends JpaRepository<Metadata, String>,
    QueryDslPredicateExecutor<Metadata>, MetadataRepositoryExtends, RevisionRepository<Metadata, String, Long> {

  List<Metadata> findTop10ByOrderByCreatedTimeDesc();

  List<Metadata> findByIdIn(List<String> ids);

  <T> List<T> findTop5ByCreatedByOrderByCreatedTimeDesc(String createdBy, Class<T> type);
}
