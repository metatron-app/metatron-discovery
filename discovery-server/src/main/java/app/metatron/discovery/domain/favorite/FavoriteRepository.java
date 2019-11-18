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

package app.metatron.discovery.domain.favorite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

import app.metatron.discovery.common.entity.DomainType;

@RepositoryRestResource(path = "favorites", itemResourceRel = "favorite", collectionResourceRel = "favorites")
public interface FavoriteRepository extends JpaRepository<Favorite, String> {

  List<Favorite> findByCreatedByAndDomainTypeAndTargetIdIn(String createdBy, DomainType domainType, List<String> targetIds);
  List<Favorite> findByDomainTypeAndTargetIdIn(DomainType domainType, List<String> targetIds);
  List<Favorite> findByCreatedByAndDomainType(String createdBy, DomainType domainType);
  Page<Favorite> findByCreatedByAndDomainType(String createdBy, DomainType domainType, Pageable pageable);
}
