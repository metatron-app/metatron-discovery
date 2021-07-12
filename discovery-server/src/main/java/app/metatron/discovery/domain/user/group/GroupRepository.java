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

package app.metatron.discovery.domain.user.group;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

import app.metatron.discovery.domain.context.ContextDomainRepository;

/**
 * Created by kyungtaak on 2016. 1. 7..
 */
@RepositoryRestResource(path = "groups", itemResourceRel = "group", collectionResourceRel = "groups",
    excerptProjection = GroupProjections.DefaultProjection.class)
public interface GroupRepository extends JpaRepository<Group, String>,
    QueryDslPredicateExecutor<Group>, GroupRepositoryExtends, ContextDomainRepository {

  Group findByName(String name);

  Group findByPredefinedAndDefaultGroup(Boolean predefined, Boolean defaultGroup);

  Group findByPredefinedAndDefaultGroupAndIdIn(Boolean predefined, Boolean defaultGroup, List<String> ids);

  @Query("select g from Group g join g.members m where m.memberId = ?1")
  List<Group> findJoinedGroups(String memberId);
}
