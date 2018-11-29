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

package app.metatron.discovery.domain.mdm.catalog;

/**
 * Created by kyungtaak on 2016. 12. 20..
 */

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

/**
 * The interface Book repository.
 */
@RepositoryRestResource(path = "catalogs", itemResourceRel = "catalog", collectionResourceRel = "catalogs",
                        excerptProjection = CatalogProjections.DefaultProjection.class)
public interface CatalogRepository extends JpaRepository<Catalog, String>,
    QueryDslPredicateExecutor<Catalog>,
    CatalogRepositoryExtends {

  @RestResource(exported = false)
  @Query("SELECT c FROM Catalog c, CatalogTree ct WHERE c.id = ct.id.descendant AND ct.id.ancestor = :catalogId AND ct.depth > 0")
  List<Catalog> findAllSubCatalogs(@Param("catalogId") String catalogId);

//  @RestResource(exported = false)
//  @Query("SELECT c FROM Catalog c WHERE c.parentId = null ORDER BY c.name ASC")
//  List<Catalog> findRootSubCatalogs();

  @RestResource(exported = false)
  @Query("SELECT c FROM Catalog c, CatalogTree ct WHERE c.id = ct.id.descendant AND ct.id.ancestor = :catalogId AND ct.depth > 0 ORDER BY c.name ASC")
  List<Catalog> findSubCatalogs(@Param("catalogId") String catalogId);

  @RestResource(exported = false)
  @Query("SELECT c FROM Catalog c, CatalogTree ct WHERE c.id = ct.id.ancestor AND ct.id.descendant = :catalogId ORDER BY ct.depth desc")
  List<Catalog> findAllAncestors(@Param("catalogId") String catalogId);

  /**
   * Check duplicated catalog name
   *
   * @param name
   * @return
   */
  @RestResource(exported = false)
  @Query("SELECT count(c) FROM Catalog c WHERE c.name = :name AND c.parentId = :parentId")
  Long countByCatalogNameAndParentId(@Param("name") String name, @Param("parentId") String parentId);

  @RestResource(exported = false)
  @Query("SELECT count(c) FROM Catalog c WHERE c.name = :name")
  Long countByCatalogName(@Param("name") String name);
}
