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

package app.metatron.discovery.domain.workbook;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.comment.Comment;
import app.metatron.discovery.domain.comment.CommentRepository;

import static app.metatron.discovery.common.entity.DomainType.WORKBOOK;

@RepositoryRestController
public class WorkbookController {

  private static Logger LOGGER = LoggerFactory.getLogger(WorkbookController.class);

  @Autowired
  WorkBookRepository workBookRepository;

  @Autowired
  DashboardRepository dashboardRepository;

  @Autowired
  CommentRepository commentRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @RequestMapping(path = "/workbooks/{workbookId}/dashboards", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findDashBoardList(
      @PathVariable("workbookId") String workbookId,
      @RequestParam(value = "datasources", required = false) List<String> datasourceIds,
      @RequestParam(value = "nameContains", required = false) String nameContains,
      @RequestParam(value = "includeHidden", required = false) boolean includeHidden,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    WorkBook workbook = workBookRepository.findOne(workbookId);
    if(workbook == null) {
      throw new ResourceNotFoundException(workbookId);
    }

    // 기본 정렬 조건 셋팅
    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                                new Sort(Sort.Direction.ASC, "seq", "name"));
    }

    Page<DashBoard> dashBoards = dashboardRepository.findAll(
        DashBoardPredicate.searchListInWorkBook(workbookId, datasourceIds, nameContains, includeHidden), pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(dashBoards, resourceAssembler));
  }

  @RequestMapping(path = "/workbooks/{workbookId}/dashboards", method = RequestMethod.PATCH)
  public @ResponseBody
  ResponseEntity<?> patchDashBoardsInWorkBook(
      @PathVariable("workbookId") String workbookId, @RequestBody List<CollectionPatch> patches) {

    WorkBook workbook = workBookRepository.findOne(workbookId);
    if(workbook == null) {
      throw new ResourceNotFoundException(workbookId);
    }

    Map<String, DashBoard> dashBoardMap = workbook.getDashBoardIdMap();
    for (CollectionPatch patch : patches) {
      String id = patch.getValue("id");
      switch (patch.getOp()) {
        case ADD:
          throw new UnsupportedOperationException("Unsupported action included.");
        case REPLACE:
          if (!dashBoardMap.containsKey(id)) {
            LOGGER.debug("Not found workbook({}) : {}", workbook.getId(), id);
            break;
          }

          patch.patchEntity(dashBoardMap.get(id), "name", "description", "hiding", "seq");

          break;
        case REMOVE:
          if(dashBoardMap.containsKey(id)) {
            workbook.getDashBoards().remove(dashBoardMap.get(id));
            LOGGER.debug("Deleted dashboard in workbook({}) : {}", workbook.getId(), id);
          }
          break;
        default:
          break;
      }
    }

    workBookRepository.save(workbook);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/workbooks/{workbookId}/comments", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findCommentList(
      @PathVariable("workbookId") String workbookId,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    Page<Comment> comments = commentRepository.findByDomainTypeAndDomainIdOrderByCreatedTimeDesc(
        WORKBOOK, workbookId, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(comments, resourceAssembler));
  }

  @RequestMapping(path = "/workbooks/{workbookId}/comments/{commentId}", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findCommentInWorkbook(
      @PathVariable("workbookId") String workbookId,
      @PathVariable("commentId") Long commentId,
      PersistentEntityResourceAssembler resourceAssembler) {

    Comment persistComment = validateComment(workbookId, commentId);

    return ResponseEntity.ok(resourceAssembler.toResource(persistComment));
  }

  @RequestMapping(path = "/workbooks/{workbookId}/comments", method = RequestMethod.POST)
  public @ResponseBody
  ResponseEntity<?> createComments(@PathVariable("workbookId") String workbookId,
                                 @RequestBody Comment comment) {

    comment.setDomainType(WORKBOOK);
    comment.setDomainId(workbookId);

    commentRepository.saveAndFlush(comment);

    final URI location = ServletUriComponentsBuilder
        .fromCurrentServletMapping().path("/api/workbooks/{workbookId}/comments/{commentId}").build()
        .expand(workbookId, comment.getId()).toUri();

    return ResponseEntity.created(location).build();
  }

  @RequestMapping(path = "/workbooks/{workbookId}/comments/{commentId}",
      method = { RequestMethod.PUT, RequestMethod.PATCH })
  public @ResponseBody
  ResponseEntity<?> saveComments(@PathVariable("workbookId") String workbookId,
                                 @PathVariable("commentId") Long commentId,
                                 @RequestBody Comment comment) {

    Comment persistComment = validateComment(workbookId, commentId);
    persistComment.setContents(comment.getContents());

    commentRepository.saveAndFlush(comment);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/workbooks/{workbookId}/comments/{commentId}",
      method = { RequestMethod.DELETE })
  public @ResponseBody
  ResponseEntity<?> saveComments(@PathVariable("workbookId") String workbookId,
                                 @PathVariable("commentId") Long commentId) {

    Comment persistComment = validateComment(workbookId, commentId);

    commentRepository.delete(persistComment);

    return ResponseEntity.noContent().build();
  }

  private Comment validateComment(String workbookId, Long commentId) {

    Comment persistComment = commentRepository.findOne(commentId);
    if(persistComment == null) {
      throw new ResourceNotFoundException(commentId + "");
    }

    if(!(persistComment.getDomainType() == WORKBOOK
        && workbookId.equals(persistComment.getDomainId()))) {
      throw new ResourceNotFoundException("Comment not included in the workbook.");
    }

    return persistComment;
  }

  @RequestMapping(path = "/workbooks/{workbookId}/dashboards/seq", method = RequestMethod.PATCH)
  public @ResponseBody
  ResponseEntity<?> patchDashboardSeq(@PathVariable("workbookId") String workbookId,
                                      @RequestBody Map<String, Integer> seqMap) {

    WorkBook workbook = workBookRepository.findOne(workbookId);
    if(workbook == null) {
      throw new ResourceNotFoundException(workbookId);
    }

    if(MapUtils.isEmpty(seqMap)) {
      throw new IllegalArgumentException("Seq list required.");
    }

    List<DashBoard> dashBoards = workbook.getDashBoards();
    if(CollectionUtils.isNotEmpty(dashBoards)) {
      dashBoards.forEach(dashBoard -> {
        if(seqMap.containsKey(dashBoard.getId())) {
          dashBoard.setSeq(seqMap.get(dashBoard.getId()));
        }
      });
    }

    workBookRepository.save(workbook);

    return ResponseEntity.noContent().build();
  }

}
