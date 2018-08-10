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

import java.util.List;

public interface BookRepositoryExtends {
  /**
   * Type 별 Workspace 내 최상위 Book 목록 가져오기
   * @param bookId
   * @param type
   * @return
   */
  List<Book> findRootBooksInWorkspace(String bookId, String... type);

  /**
   * Type 별 Book(Folder) 하위 목록 가져오기
   *
   * @param bookId
   * @param type
   * @return
   */
  List<Book> findOnlySubBooks(String bookId, String... type);

  /**
   * Type 별 Book(Folder) 하위 목록 수 가져오기
   *
   * @param bookId
   * @param type
   * @return
   */
  Long countOnlySubBooks(String bookId, String... type);
}
