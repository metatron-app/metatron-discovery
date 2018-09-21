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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.workspace.folder.Folder;
import app.metatron.discovery.domain.workspace.folder.FolderRepository;

import static app.metatron.discovery.domain.workspace.BookProjections.BookProjectionType.LIST;

/**
 * Created by kyungtaak on 2016. 12. 21..
 */
@Component
@Transactional(readOnly = true)
public class BookTreeService {

  private static Logger LOGGER = LoggerFactory.getLogger(BookTreeService.class);

  @Autowired
  BookRepository bookRepository;

  @Autowired
  BookTreeRepository bookTreeRepository;

  @Autowired
  FolderRepository folderRepository;

  BookComparator comparator;

  public BookTreeService() {
    this.comparator = new BookComparator();
  }

  public List<Book> findRootBooks(String workspaceId) {

    List<Book> rootBooks = bookRepository.findRootBooksInWorkspace(workspaceId);
    rootBooks.sort(comparator);
    for (Book book : rootBooks) {
      if (book instanceof Folder) {
        Folder folder = (Folder) book;
        List<Book> books = bookRepository.findOnlySubBooks(folder.getId());
        books.sort(comparator);
        folder.setBooks(books);
      }
    }

    return rootBooks;
  }

  public List<Book> findDecendantBooks(String folderId) {
    List<Book> books = bookRepository.findOnlySubBooks(folderId);
    books.sort(comparator);

    return books;
  }

  public List<Book> findSubBooks(String bookId, boolean isRoot, String... type) {

    List<Book> books;
    if (isRoot) {
      books = bookRepository.findRootBooksInWorkspace(bookId, type);
    } else {
      books = bookRepository.findOnlySubBooks(bookId, type);
    }
    // Folder가 최상단으로 오도록 조정
    books.sort(comparator);

    // 하위 Book 중 Folder Type 인 경우 하위 Book 들이 존재하는지 체크
    for (Book book : books) {
      if (book instanceof Folder) {
        Folder folder = (Folder) book;
        folder.setHasSubBooks(
            bookRepository.countOnlySubBooks(folder.getId(), type) > 0 ? true : false
        );
      }
    }
    return books;
  }

  public List<Map<String, Object>> findSubBooksInfoForView(String bookId, boolean isRoot,
                                                           BookProjections.BookProjectionType type,
                                                           String bookType) {
    List<Book> books = findSubBooks(bookId, isRoot, bookType);

    return books.stream().map(book -> {
      if (type == LIST) {
        return book.listViewProjection();
      } else {
        return book.treeViewProjection();
      }
    }).collect(Collectors.toList());

  }

  public List<Map<String, String>> findBookHierarchies(String bookId) {
    List<Book> books = bookRepository.findAllAncestorBooks(bookId);

    return books.stream()
                .map(book -> {
                  Map<String, String> map = Maps.newHashMap();
                  map.put("id", book.getId());
                  map.put("name", book.getName());
                  return map;
                })
                .collect(Collectors.toList());
  }

  @Transactional
  public void createSelfTree(Book book) {
    BookTree tree = new BookTree(book.getId(), book.getId(), 0);
    bookTreeRepository.save(tree);
  }

  @Transactional
  public void createTree(Book book) {
    List<BookTree> bookTrees = Lists.newArrayList();
    bookTrees.add(new BookTree(book.getId(), book.getId(), 0));

    if (Folder.ROOT.equals(book.getFolderId())) {
      bookTreeRepository.save(bookTrees);
      return;
    }

    Folder folder = folderRepository.findOne(book.getFolderId());
    if (folder == null) {
      throw new IllegalArgumentException("Invalid Folder : " + book.getFolderId());
    }

    List<BookTree> ancestors = bookTreeRepository.findByIdDescendant(folder.getId());

    for (BookTree ancestor : ancestors) {
      bookTrees.add(new BookTree(ancestor.getId().getAncestor(), book.getId(), ancestor.getDepth() + 1));
    }

    bookTreeRepository.save(bookTrees);
  }

  @Transactional
  public void editTree(Book book) {
    List<BookTree> bookTrees = Lists.newArrayList();
    List<String> deleteDescendants = Lists.newArrayList();

    if ("ROOT".equals(book.getFolderId())) {

      List<BookTree> descendants = bookTreeRepository.findDescendantNotAncenstor(book.getId());
      for (BookTree bookTree : descendants) {
        deleteDescendants.add(bookTree.getId().getDescendant());
        bookTrees.add(new BookTree(book.getId(), bookTree.getId().getDescendant(), bookTree.getDepth()));
      }

    } else {

      Folder folder = folderRepository.findOne(book.getFolderId());
      if (folder == null) {
        throw new IllegalArgumentException("Invalid Folder : " + book.getFolderId());
      }

      List<BookTree> ancestors = bookTreeRepository.findByIdDescendant(folder.getId());
      Map<String, Integer> depthMap = Maps.newHashMap();
      int depth;
      for (BookTree ancestor : ancestors) {
        depth = ancestor.getDepth() + 1;
        bookTrees.add(new BookTree(ancestor.getId().getAncestor(), book.getId(), depth));
        depthMap.put(ancestor.getId().getAncestor(), depth);
      }

      List<BookTree> descendants = bookTreeRepository.findDescendantNotAncenstor(book.getId());
      for (BookTree bookTree : descendants) {
        deleteDescendants.add(bookTree.getId().getDescendant());
        depthMap.forEach((ancestor, i) ->
                             bookTrees.add(new BookTree(ancestor, bookTree.getId().getDescendant(), i + bookTree.getDepth()))
        );
      }
    }

    // Empty IN clause 발생 상황 회의(mysql 의 경우 오류 발생)
    bookTreeRepository.deleteEditedBookTree(deleteDescendants.isEmpty() ? null : deleteDescendants,
                                            book.getId());

    bookTreeRepository.save(bookTrees);
  }

  @Transactional
  public void deleteTree(Book book) {
    // delete sub-book
    List<BookTree> descendants = bookTreeRepository.findDescendantNotAncenstor(book.getId());
    if (descendants.size() > 0) {
      for (BookTree bookTree : descendants) {
        String descendantId = bookTree.getId().getDescendant();
        bookRepository.delete(descendantId);
        bookTreeRepository.deteleAllBookTree(descendantId);
      }
    }

    bookTreeRepository.deteleAllBookTree(book.getId());
  }

  public class BookComparator implements Comparator<Book> {

    @Override
    public int compare(Book book1, Book book2) {

      if (book1 instanceof Folder && !(book2 instanceof Folder)) {
        return -1;
      } else if (!(book1 instanceof Folder) && book2 instanceof Folder) {
        return 1;
      }

      return book1.getName().compareTo(book2.getName());
    }
  }
}
