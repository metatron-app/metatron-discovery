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

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 12. 21..
 */
public interface CatalogTreeRepository extends JpaRepository<CatalogTree, CatalogTreeId> {

  List<CatalogTree> findByIdDescendant(String descendant);

  @Query("SELECT b FROM CatalogTree b WHERE b.id.ancestor = :ancestor AND b.id.descendant <> :ancestor")
  List<CatalogTree> findDescendantNotAncenstor(@Param("ancestor") String ancestor);

  @Modifying
  @Query("DELETE FROM CatalogTree b WHERE (b.id.descendant IN :descendants AND b.id.ancestor <> :ancestor AND b.depth > 0) OR (b.id.descendant = :ancestor AND b.id.ancestor <> :ancestor)")
  void deleteEditedTree(@Param("descendants") List<String> descendants, @Param("ancestor") String ancestor);

  @Modifying
  @Query("DELETE FROM CatalogTree b WHERE b.id.ancestor = :bookId OR b.id.descendant = :bookId")
  void deteleAllTree(@Param("bookId") String bookId);
}
