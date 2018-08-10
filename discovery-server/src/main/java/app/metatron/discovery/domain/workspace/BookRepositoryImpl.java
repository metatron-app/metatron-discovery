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

import com.facebook.presto.jdbc.internal.guava.collect.Lists;
import com.querydsl.jpa.JPQLQuery;

import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.List;

public class BookRepositoryImpl extends QueryDslRepositorySupport implements BookRepositoryExtends {

  public BookRepositoryImpl() {
    super(Book.class);
  }

  public List<Book> findRootBooksInWorkspace(String workspaceId, String... type) {
    QBook qBook = QBook.book;

    JPQLQuery query = from(qBook)
        .where(qBook.workspace.id.eq(workspaceId), qBook.folderId.eq("ROOT"));

    // book type 지정시 첫번째 index 에 null 값이 포함되는 경우 발생
    if(type.length > 0 && type[0] != null) {
      List<String> types = Lists.newArrayList(type);
      types.add("folder");
      query.where(qBook.type.in(types));
    }

    return query.fetch();
  }

  @Override
  public List<Book> findOnlySubBooks(String bookId, String... type) {
    return makeQueryOnlySubBooksByType(bookId, type).fetch();
  }

  @Override
  public Long countOnlySubBooks(String bookId, String... type) {
    return makeQueryOnlySubBooksByType(bookId, type).fetchCount();
  }

  private JPQLQuery makeQueryOnlySubBooksByType(String bookId, String... type) {

    QBook qBook = QBook.book;
    QBookTree qBookTree = QBookTree.bookTree;

    JPQLQuery query = from(qBook, qBookTree);
    query.select(qBook);
    query.where(qBook.id.eq(qBookTree.id.descendant),
                qBookTree.id.ancestor.eq(bookId),
                qBookTree.depth.gt(0),
                qBookTree.depth.lt(2));

    // book type 지정시 첫번째 index 에 null 값이 포함되는 경우 발생
    if(type.length > 0 && type[0] != null) {
      List<String> types = Lists.newArrayList(type);
      types.add("folder");
      query.where(qBook.type.in(types));
    }

    return query;
  }
}
