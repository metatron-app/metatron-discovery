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

package app.metatron.discovery.domain.tag;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

import app.metatron.discovery.common.entity.DomainType;

/**
 * Created by kyungtaak on 2016. 8. 30..
 */
@RepositoryRestResource(path = "tags", itemResourceRel = "tag", collectionResourceRel = "tags",
    excerptProjection = TagProjections.DefaultProjection.class)
public interface TagRepository extends JpaRepository<Tag, String>,
    QueryDslPredicateExecutor<Tag>, TagRepositoryExtends {

  @Query("SELECT new app.metatron.discovery.domain.tag.TagTreeDTO(t.id, t.name, count(d)) " +
      "FROM Tag AS t " +
      "LEFT JOIN t.domains d " +
      "where t.scope = :scope " +
      "AND t.domainType = :domainType " +
      "AND d.domainId IN (SELECT id from Metadata)" +
      "AND UPPER(t.name) LIKE CONCAT('%', UPPER(:nameContains), '%') " +
      "GROUP BY t.id, t.name")
  List<TagTreeDTO> findTagsAndCountWithMetadatas(@Param("scope") Tag.Scope scope, @Param("domainType") DomainType domainType, @Param("nameContains") String nameContains);

}
