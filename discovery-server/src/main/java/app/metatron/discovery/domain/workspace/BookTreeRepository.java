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

package app.metatron.discovery.domain.workspace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 12. 21..
 */
public interface BookTreeRepository extends JpaRepository<BookTree, BookTreeId> {

  List<BookTree> findByIdDescendant(String descendant);

  @Query("SELECT b FROM BookTree b WHERE b.id.ancestor = :ancestor AND b.id.descendant <> :ancestor")
  List<BookTree> findDescendantNotAncenstor(@Param("ancestor") String ancestor);

  @Modifying
  @Query("DELETE FROM BookTree b WHERE (b.id.descendant IN :descendants AND b.id.ancestor <> :ancestor AND b.depth > 0) OR (b.id.descendant = :ancestor AND b.id.ancestor <> :ancestor)")
  void deleteEditedBookTree(@Param("descendants") List<String> descendants, @Param("ancestor") String ancestor);

  @Modifying
  @Query("DELETE FROM BookTree b WHERE b.id.ancestor = :bookId OR b.id.descendant = :bookId")
  void deteleAllBookTree(@Param("bookId") String bookId);
}
