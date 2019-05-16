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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Optional;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.notebook.Notebook;
import app.metatron.discovery.domain.notebook.NotebookConnector;
import app.metatron.discovery.domain.notebook.NotebookRepository;
import app.metatron.discovery.domain.notebook.connector.HttpRepository;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.DashBoardPredicate;
import app.metatron.discovery.domain.workbook.DashboardRepository;
import app.metatron.discovery.domain.workbook.WorkBook;
import app.metatron.discovery.domain.workspace.folder.Folder;

/**
 * Created by kyungtaak on 2016. 12. 21..
 */
@RepositoryRestController
public class BookController {

  private static Logger LOGGER = LoggerFactory.getLogger(BookController.class);

  @Autowired
  BookService bookService;

  @Autowired
  BookTreeService bookTreeService;


  @Autowired
  BookRepository bookRepository;

  @Autowired
  DashboardRepository dashboardRepository;

  @Autowired
  NotebookRepository notebookRepository;

  @Autowired
  HttpRepository httpRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @RequestMapping(path = "/books/{bookId}/dashboards", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findBooksInWorkspace(@PathVariable("bookId") String bookId,
                                         @RequestParam(value = "nameContains", required = false) String nameContains,
                                         Pageable pageable,
                                         PersistentEntityResourceAssembler resourceAssembler) {

    Book book = bookRepository.findOne(bookId);
    if(book == null) {
      throw new ResourceNotFoundException(bookId);
    }

    final Page<DashBoard> pages;
    if(book instanceof WorkBook) {
      pages = dashboardRepository.findAll(DashBoardPredicate.searchListInWorkBook(bookId, nameContains), pageable);
    } else if(book instanceof Folder) {
      pages = dashboardRepository.findAll(DashBoardPredicate.searchListInFolder(bookId, nameContains), pageable);
    } else {
      throw new BadRequestException("Not supported item. Only choose Folder or Workbook item");
    }

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(pages, resourceAssembler));
  }

  @RequestMapping(path = {"/books/{bookIds}/move", "/books/{bookIds}/move/{folderId}"}, method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> move(@PathVariable("bookIds") List<String> bookIds,
                                              @PathVariable("folderId") Optional<String> folderId,
                                              @RequestParam("toWorkspace") Optional<String> toWorkspace) {

    if(folderId.isPresent() && bookRepository.findOne(folderId.get()) == null) {
      throw new ResourceNotFoundException(folderId.get());
    }

    if(folderId.isPresent() && Folder.ROOT.equals(folderId.get())) {
      folderId = Optional.empty();
    }

    for (String bookId : bookIds) {
      Book targetBook = bookRepository.findOne(bookId);
      if(targetBook == null) {
        continue;
      }

      bookService.move(targetBook, folderId, toWorkspace);

    }

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = {"/books/{bookId}/copy", "/books/{bookId}/copy/{folderId}"}, method = RequestMethod.POST)
  public ResponseEntity<?> copyBook(@PathVariable("bookId") String bookId,
                                    @PathVariable("folderId") Optional<String> folderId,
                                    @RequestParam("toWorkspace") Optional<String> toWorkspace,
                                    PersistentEntityResourceAssembler resourceAssembler) {

    Book book = bookRepository.findOne(bookId);
    if(book == null) {
      return ResponseEntity.notFound().build();
    }

    if(folderId.isPresent() && bookRepository.findOne(folderId.get()) == null) {
      throw new ResourceNotFoundException(folderId.get());
    }

    if(folderId.isPresent() && Folder.ROOT.equals(folderId.get())) {
      folderId = Optional.empty();
    }

    if(!(book instanceof WorkBook)) {
      throw new RuntimeException("Not supported book type.");
    }

    WorkBook copiedBook = bookService.copy(book, folderId, toWorkspace);

    return ResponseEntity.ok(resourceAssembler.toResource(copiedBook));

  }

  @RequestMapping(path = "/books/{bookIds}", method = RequestMethod.DELETE)
  public @ResponseBody ResponseEntity<?> multiDelete(@PathVariable("bookIds") List<String> bookIds) {
    for(String bookId : bookIds) {
      Book book = bookRepository.findOne(bookId);
      if(book == null) {
        LOGGER.warn("Fail to find book : {}", bookId);
        continue;
      } else if(book.getType().equals("notebook")) {
        Notebook notebook = notebookRepository.findOne(bookId);
        NotebookConnector connector = notebook.getConnector();
        connector.setHttpRepository(httpRepository);
        connector.deleteNotebook(notebook.getaLink());
        notebookRepository.delete(notebook);
      }
      bookRepository.delete(book);
      bookTreeService.deleteTree(book);
    }

    return ResponseEntity.noContent().build();
  }
}
