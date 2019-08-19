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

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResource;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.Resources;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.net.URI;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionPredicate;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSource.ConnectionType;
import app.metatron.discovery.domain.datasource.DataSource.DataSourceType;
import app.metatron.discovery.domain.datasource.DataSourcePredicate;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.notebook.NoteBookConnectorPredicate;
import app.metatron.discovery.domain.notebook.NotebookConnector;
import app.metatron.discovery.domain.notebook.NotebookConnectorRepository;
import app.metatron.discovery.domain.notebook.NotebookModel;
import app.metatron.discovery.domain.notebook.NotebookModelRepository;
import app.metatron.discovery.domain.notebook.QNotebook;
import app.metatron.discovery.domain.notebook.QNotebookModel;
import app.metatron.discovery.domain.notebook.connector.HttpRepository;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupRepository;
import app.metatron.discovery.domain.user.role.RoleService;
import app.metatron.discovery.domain.user.role.RoleSet;
import app.metatron.discovery.domain.user.role.RoleSetService;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.DashBoardPredicate;
import app.metatron.discovery.domain.workbook.DashboardRepository;
import app.metatron.discovery.domain.workbook.WorkBook;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.ProjectionUtils;

import static app.metatron.discovery.domain.workspace.Workspace.PublicType.PRIVATE;
import static java.util.stream.Collectors.toList;


/**
 *
 */
@RepositoryRestController
public class WorkspaceController {

  private static Logger LOGGER = LoggerFactory.getLogger(WorkspaceController.class);

  @Autowired
  CachedUserService cachedUserService;

  @Autowired
  WorkspaceService workspaceService;

  @Autowired
  RoleService roleService;

  @Autowired
  RoleSetService roleSetService;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  WorkspaceRepository workspaceRepository;

  @Autowired
  BookRepository bookRepository;

  @Autowired
  DashboardRepository dashBoardRepository;

  @Autowired
  WorkspaceMemberRepository workspaceMemberRepository;

  @Autowired
  WorkspaceFavoriteRepository workspaceFavoriteRepository;

  @Autowired
  GroupRepository groupRepository;

  @Autowired
  WorkspacePagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  NotebookModelRepository notebookModelRepository;

  @Autowired
  NotebookConnectorRepository notebookConnectorRepository;

  @Autowired
  HttpRepository httpRepository;

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  ProjectionFactory projectionFactory;

  WorkspaceProjections workspaceProjections = new WorkspaceProjections();

  public WorkspaceController() {
  }

  /**
   *
   * @param resourceAssembler
   * @return
   */
  @RequestMapping(path = "/workspaces/my", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findMyWorkspace(PersistentEntityResourceAssembler resourceAssembler) {

    Workspace myWorkspace = workspaceRepository.findPrivateWorkspaceByOwnerId(AuthUtils.getAuthUserName());

    if (myWorkspace == null) {
      myWorkspace = new Workspace();
      myWorkspace.setId("GUEST_WORKSPACE");
      myWorkspace.setName("Guest Workspace");
      myWorkspace.setOwnerId(AuthUtils.getAuthUserName());
    }

    return ResponseEntity.ok(resourceAssembler.toResource(myWorkspace));
  }

  /**
   *
   * @param resourceAssembler
   * @return
   */
  @RequestMapping(path = "/workspaces/my/all", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findMyWorkspaceList(PersistentEntityResourceAssembler resourceAssembler) {

    String username = AuthUtils.getAuthUserName();
    List<String> targets = Lists.newArrayList(username);
    targets.addAll(groupRepository.findGroupIdsByMemberId(username));

    List<Workspace> myWorkspaces = workspaceRepository.findMyWorkspaces(username, targets);

    List<PersistentEntityResource> resources = myWorkspaces.stream()
                                                           .map((workspace) -> resourceAssembler.toResource(workspace))
                                                           .collect(toList());

    return ResponseEntity.ok(new Resources(resources));
  }

  /**
   *
   * @param onlyFavorite
   * @param myWorkspace
   * @param nameContains
   * @param pageable
   * @param resourceAssembler
   * @return
   * */
  @RequestMapping(path = "/workspaces/my/public", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findPublicWorkspaceList(
      @RequestParam(required = false) boolean onlyFavorite,
      @RequestParam(required = false) Boolean myWorkspace,
      @RequestParam(required = false) Boolean published,
      @RequestParam(required = false) String nameContains,
      @RequestParam(value = "projection", required = false, defaultValue = "default") String projection,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    Page<Workspace> publicWorkspaces = workspaceService.getPublicWorkspaces(
        onlyFavorite, myWorkspace, published, nameContains, pageable);

    //return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(publicWorkspaces, resourceAssembler));
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(ProjectionUtils.toPageResource(projectionFactory,
                                                                                                    workspaceProjections.getProjectionByName(projection),
                                                                                                    publicWorkspaces)));
  }

  @RequestMapping(path = "/workspaces", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findWorkspaces(
      @RequestParam(required = false) String publicType,
      @RequestParam(required = false) String linkedType,
      @RequestParam(required = false) String linkedId,
      @RequestParam(required = false) boolean onlyLinked,
      @RequestParam(required = false) String nameContains,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    Workspace.PublicType type = SearchParamValidator.enumUpperValue(Workspace.PublicType.class,
                                                                    publicType, "publicType");

    if (onlyLinked) {
      SearchParamValidator.checkNull(linkedType, "linkType");
      SearchParamValidator.checkNull(linkedId, "linkedId");

      Page<Workspace> workspaces = workspaceRepository
          .findAll(WorkspacePredicate.searchPublicTypeAndNameContainsAndLink(type, nameContains, linkedType, linkedId), pageable);

      long totalWorkspaces = workspaceRepository.count(WorkspacePredicate.searchPublicTypeAndNameContains(type, nameContains));

      workspaces.getContent().forEach(workspace -> workspace.setLinked(true));

      return ResponseEntity.ok(this.pagedResourcesAssembler
                                   .toWorkspaceResource(workspaces,
                                                        new WorkspacePagedResources
                                                            .WorkspaceMetadata(workspaces.getTotalElements(),
                                                                               totalWorkspaces),
                                                        resourceAssembler));

    } else {
      Page<Workspace> workspaces = workspaceRepository
          .findAll(WorkspacePredicate.searchPublicTypeAndNameContainsAndActive(type, nameContains, true), pageable);

      // 특정 데이터 소스에 연결된 Workspace 찾기
      List<String> linkedWorkspaceIds = null;

      if (StringUtils.isNotEmpty(linkedId)) {

        SearchParamValidator.checkNull(linkedType, "linkType");

        switch (linkedType.toUpperCase()) {
          case "DATASOURCE":
            linkedWorkspaceIds = workspaceRepository.findWorkspaceIdByLinkedDataSource(linkedId, type, nameContains);
            break;
          case "CONNECTION":
            linkedWorkspaceIds = workspaceRepository.findWorkspaceIdByLinkedConnection(linkedId, type, nameContains);
            break;
          case "CONNECTOR":
            linkedWorkspaceIds = Lists.newArrayList();
            break;
          default:
            throw new BadRequestException("Not supported type of link. choose one of datasource, connection, connector");
        }

        for (Workspace workspace : workspaces.getContent()) {
          if (linkedWorkspaceIds.contains(workspace.getId())) {
            workspace.setLinked(true);
          } else {
            workspace.setLinked(false);
          }
        }
      } else {
        workspaces.forEach(workspace -> workspace.setLinked(false));
      }
      return ResponseEntity.ok(this.pagedResourcesAssembler
                                   .toWorkspaceResource(workspaces,
                                                        new WorkspacePagedResources
                                                            .WorkspaceMetadata(linkedWorkspaceIds == null ? 0 : linkedWorkspaceIds.size(),
                                                                               workspaces.getTotalElements()),
                                                        resourceAssembler));
    }
  }

  @RequestMapping(path = "/workspaces/byadmin", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findWorkspacesByAdmin(
      @RequestParam(value = "username", required = false) String username,
      @RequestParam(value = "onlyOwner", required = false) Boolean onlyOwner,
      @RequestParam(value = "publicType", required = false) String publicType,
      @RequestParam(value = "published", required = false) Boolean published,
      @RequestParam(value = "active", required = false) Boolean active,
      @RequestParam(value = "nameContains", required = false) String nameContains,
      @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
      @RequestParam(value = "from", required = false)
      @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
      @RequestParam(value = "to", required = false)
      @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    List<String> memberIds = Lists.newArrayList();
    if (StringUtils.isNotEmpty(username)) {
      memberIds.add(username);
      memberIds.addAll(groupRepository.findGroupIdsByMemberId(username));
    }

    Workspace.PublicType type = SearchParamValidator.enumUpperValue(Workspace.PublicType.class,
                                                                    publicType, "publicType");

    Page<Workspace> workspaces = workspaceRepository
        .findAll(WorkspacePredicate.searchWorkspaceList(username, memberIds, onlyOwner,
                                                        published, active,
                                                        type, nameContains,
                                                        searchDateBy, from, to),
                 pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(workspaces, resourceAssembler));
  }


  /**
   *
   * @param id
   * @param pageable
   * @param resourceAssembler
   * @return
   */
  @RequestMapping(path = "/workspaces/{id}/nbmodels", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findNotebookModelsInWorkspace(@PathVariable("id") String id,
                                                  Pageable pageable,
                                                  PersistentEntityResourceAssembler resourceAssembler) {
    QNotebookModel notebookModel = QNotebookModel.notebookModel;
    QNotebook notebook = QNotebook.notebook;

    BooleanBuilder builder = new BooleanBuilder();
    BooleanExpression workspaceContains = notebookModel.id
        .in(JPAExpressions.select(notebookModel.id)
                          .from(notebookModel, notebook)
                          .where(notebookModel.notebook.id.eq(notebook.id)
                                                          .and(notebook.workspace.id.eq(id))
                                                          .and(notebookModel.statusType.eq(NotebookModel.StatusType.APPROVAL))));
    builder.and(workspaceContains);

    Page<NotebookModel> models = notebookModelRepository.findAll(builder, pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(models, resourceAssembler));
  }

  /**
   *
   *
   * @param workspaceId
   * @param type
   * @param onlyPublic
   * @param nameContains
   * @param pageable
   * @param resourceAssembler
   * @return
   */
  @RequestMapping(path = "/workspaces/{workspaceId}/datasources", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findDataSourcesInWorkspace(@PathVariable("workspaceId") String workspaceId,
                                               @RequestParam(required = false) String type,
                                               @RequestParam(required = false) String connType,
                                               @RequestParam(required = false) Boolean onlyPublic,
                                               @RequestParam(required = false) List<String> status,
                                               @RequestParam(required = false) String nameContains,
                                               Pageable pageable,
                                               PersistentEntityResourceAssembler resourceAssembler) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      return ResponseEntity.notFound().build();
    }

    List<DataSource.Status> statuses = Lists.newArrayList();
    if (CollectionUtils.isNotEmpty(status)) {
      for (String aStatus : status) {
        statuses.add(SearchParamValidator.enumUpperValue(DataSource.Status.class, aStatus, "status"));
      }
    }

    // Source Type 별 조회
    DataSourceType sourceType = null;
    if (StringUtils.isNotEmpty(type)) {
      sourceType = SearchParamValidator.enumUpperValue(DataSourceType.class, type, "type");
    }

    // Connection Type 별 조회
    ConnectionType connectionType = null;
    if (StringUtils.isNotEmpty(connType)) {
      connectionType = SearchParamValidator.enumUpperValue(ConnectionType.class, connType, "connType");
    }

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "name"));
    }

    Page<DataSource> dataSources = dataSourceRepository.findAll(
        DataSourcePredicate.searchDatasourcesInWorkspace(
            workspace, sourceType, connectionType, statuses, onlyPublic, nameContains),
        pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(dataSources, resourceAssembler));
  }

  @RequestMapping(path = "/workspaces/{id}/connections", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findConnectionsInWorkspace(@PathVariable("id") String id,
                                               @RequestParam(value = "name", required = false) String name,
                                               @RequestParam(value = "implementor", required = false) String implementor,
                                               @RequestParam(value = "authenticationType", required = false) String authenticationType,
                                               Pageable pageable) {

    LOGGER.debug("name = {}", name);
    LOGGER.debug("implementor = {}", implementor);
    LOGGER.debug("authenticationType = {}", authenticationType);
    LOGGER.debug("workspaceId = {}", id);
    LOGGER.debug("pageable = {}", pageable);

    DataConnection.AuthenticationType authenticationTypeValue = null;
    if (StringUtils.isNotEmpty(authenticationType)) {
      authenticationTypeValue = SearchParamValidator
          .enumUpperValue(DataConnection.AuthenticationType.class, authenticationType, "authenticationType");
    }

    // Get Predicate
    Predicate searchPredicated = DataConnectionPredicate
        .searchListForWorkspace(name, implementor, authenticationTypeValue, id);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "name"));
    }
    Page<DataConnection> connections = dataConnectionRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(connections));
  }

  /**
   * @param workspaceId workspace Id
   */
  @RequestMapping(path = "/workspaces/{workspaceId}/connectors", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findConnectorsWithLinkedWorkspace(@PathVariable("workspaceId") String workspaceId,
                                                      @RequestParam(value = "type", required = false) String type,
                                                      Pageable pageable,
                                                      PersistentEntityResourceAssembler resourceAssembler) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "name"));
    }

    Predicate searchPredicated = NoteBookConnectorPredicate.searchAvailableConnectorInWorkspace(workspace, type);

    Page<NotebookConnector> connectors = notebookConnectorRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(connectors, resourceAssembler));
  }

  /**
   * @param wid  workspace Id
   * @param cids notebook-connectors Id
   */
  @RequestMapping(path = "/workspaces/{wid}/connectors/{cids}", method = RequestMethod.POST)
  public @ResponseBody
  ResponseEntity<?> addConnectorsInWorkspace(
      @PathVariable("wid") String wid,
      @PathVariable("cids") List<String> cids) {

    Workspace workspace = workspaceRepository.findOne(wid);
    if (workspace == null) {
      return ResponseEntity.notFound().build();
    }
    workspace.setConnectors(Collections.emptySet());
    Set<NotebookConnector> updateConnectors = new HashSet<>();
    for (String cid : cids) {
      NotebookConnector connector = notebookConnectorRepository.findOne(cid);
      if (connector == null) {
        throw new RuntimeException("Connector not found");
      }
      updateConnectors.add(connector);
      if (connector.getType().equals("jupyter")) {
        connector.setHttpRepository(httpRepository);
        connector.createDirectory(workspace.getId());
      }
    }
    workspace.setConnectors(updateConnectors);
    workspaceRepository.saveAndFlush(workspace);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/workspaces/{workspaceId}/books/{bookId}", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findBooksInWorkspace(@PathVariable("workspaceId") String workspaceId,
                                         @PathVariable("bookId") String bookId,
                                         @RequestParam(required = false) String bookType,
                                         PersistentEntityResourceAssembler resourceAssembler) {

    if (StringUtils.isNotEmpty(bookType) && !Book.SEARCHABLE_BOOKS.contains(bookType.toLowerCase())) {
      throw new IllegalArgumentException("Invalid widget type. choose " + Book.SEARCHABLE_BOOKS);
    }

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      return ResponseEntity.notFound().build();
    }

    if ("ROOT".equalsIgnoreCase(bookId)) {
      workspace.setBookType(bookType); // 타입별 조회 위함
      return ResponseEntity.ok(resourceAssembler.toResource(workspace));
    }

    Book book = bookRepository.findOne(bookId);
    if (book == null) {
      throw new ResourceNotFoundException(bookId);
    }
    book.setBookType(bookType); // 타입별 조회 위함


    return ResponseEntity.ok(resourceAssembler.toResource(book));
  }

  @RequestMapping(path = "/workspaces/{workspaceId}/dashboards", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findDashBoardsInWorkspace(@PathVariable("workspaceId") String workspaceId,
                                              @RequestParam(required = false) String nameContains,
                                              Pageable pageable,
                                              PersistentEntityResourceAssembler resourceAssembler) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    Page<DashBoard> dashBoards = dashBoardRepository.findAll(
        DashBoardPredicate.searchListInWorkspace(workspaceId, nameContains), pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(dashBoards, resourceAssembler));
  }

  @RequestMapping(path = "/workspaces/{workspaceId}/statistics", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findWorkspaceStatistics(@PathVariable("workspaceId") String workspaceId,
                                            @RequestParam(value = "timeUnit", required = false) String timeUnit,
                                            @RequestParam(value = "accumulated", required = false, defaultValue = "true") Boolean accumulated,
                                            @RequestParam(value = "from", required = false)
                                            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                            @RequestParam(value = "to", required = false)
                                            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    TimeFieldFormat.TimeUnit unit = null;
    if (StringUtils.isNotEmpty(timeUnit)) {
      unit = SearchParamValidator
          .enumUpperValue(TimeFieldFormat.TimeUnit.class, timeUnit, "timeUnit");
    } else {
      unit = TimeFieldFormat.TimeUnit.DAY;
    }

    DateTime now = DateTime.now();
    if (from == null) {
      from = now.minusMonths(1);
    }

    if (to == null) {
      to = now;
    }

    return ResponseEntity.ok(workspaceService.getStatistics(workspace, unit, from, to, accumulated));
  }

  /**
   *
   *
   * @param publicType
   * @param nameContains
   * @param pageable
   * @param resourceAssembler
   * @return
   */
  @RequestMapping(path = "/workspaces/import/books/{bookId}/available", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findWorkspacesToMoveOrCopy(@PathVariable("bookId") String bookId,
                                               @RequestParam(required = false) List<String> excludes,
                                               @RequestParam(required = false) String publicType,
                                               @RequestParam(required = false) String nameContains,
                                               Pageable pageable,
                                               PersistentEntityResourceAssembler resourceAssembler) {

    Book book = bookRepository.findOne(bookId);
    if (book == null || !(book instanceof WorkBook)) {
      throw new ResourceNotFoundException(bookId);
    }

    if (CollectionUtils.isEmpty(excludes)) {
      excludes = Lists.newArrayList(book.getWorkspace().getId());
    }

    Workspace.PublicType pubType = SearchParamValidator.enumUpperValue(Workspace.PublicType.class, publicType, "publicType");

    // Workbook 내 대시보드에 연결되어 있는 데이터 소스(공개 데이터 소스 제외)
    List<String> dataSourceIds;
    if (book instanceof WorkBook) {
      dataSourceIds = dataSourceRepository.findIdsByWorkbookInNotPublic(bookId);
    } else {
      dataSourceIds = Lists.newArrayList();
    }

    List<String> perms = WorkspacePermissions.editPermissions(book);

    String username = AuthUtils.getAuthUserName();
    List<String> targets = Lists.newArrayList(username);
    targets.addAll(groupRepository.findGroupIdsByMemberId(username));

    // 사용자가 접근(편집) 가능한 Workspace 목록
    List<String> joinedWorkspaceIds = workspaceRepository
        .findMyWorkspaceIdsByPermission(username, targets, perms.toArray(new String[perms.size()]));

    if (joinedWorkspaceIds.size() > 0 && CollectionUtils.isNotEmpty(excludes)) {
      joinedWorkspaceIds.removeAll(excludes);
    }

    Page<Workspace> results;
    if (CollectionUtils.isEmpty(dataSourceIds) && CollectionUtils.isEmpty(joinedWorkspaceIds)) {
      // dataSourceIds, joinedWorkspaceIds 둘다 0 인 케이스는 질의 불필요
      results = new PageImpl(Collections.emptyList(), pageable, 0);
    } else {
      results = workspaceRepository.findAll(
          WorkspacePredicate.searchWorkbookImportAvailable(dataSourceIds, joinedWorkspaceIds, pubType, nameContains), pageable);
    }

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(results, resourceAssembler));
  }

  @RequestMapping(path = "/workspaces/members/refresh", method = RequestMethod.POST)
  public @ResponseBody
  ResponseEntity<?> refreshMembers() {

    int pageNum = 0;
    int size = 50;

    PageRequest pageRequest = null;
    Page<WorkspaceMember> page = null;
    do {
      pageRequest = new PageRequest(pageNum, size);
      List<WorkspaceMember> members = Lists.newArrayList();

      page = workspaceMemberRepository.findAll(pageRequest);

      for (WorkspaceMember member : page) {
        // 사용자/그룹 정보를 미리 넣어둡니다
        if (member.getMemberType() == WorkspaceMember.MemberType.GROUP) {
          Group group = cachedUserService.findGroup(member.getMemberId());
          if (group != null) member.setMemberName(group.getName());
        } else {
          User user = cachedUserService.findUser(member.getMemberId());
          if (user != null) member.setMemberName(user.getFullName());
        }
        members.add(member);
      }

      workspaceMemberRepository.save(members);

      pageNum++;

    } while (page.hasNext());

    return ResponseEntity.noContent().build();
  }


  @RequestMapping(path = "/workspaces/{id}/members", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findMemebersInWorkspace(@PathVariable("id") String id,
                                            @RequestParam(required = false, defaultValue = "all") String type,
                                            @RequestParam(required = false) String nameContains,
                                            @RequestParam(required = false) List<String> roles,
                                            Pageable pageable,
                                            PersistentEntityResourceAssembler resourceAssembler) {

    Workspace workspace = workspaceRepository.findOne(id);
    if (workspace == null) {
      return ResponseEntity.notFound().build();
    }

    List<WorkspaceMember.MemberType> memberTypes = null;
    if ("all".equalsIgnoreCase(type)) {
      memberTypes = Lists.newArrayList(WorkspaceMember.MemberType.USER, WorkspaceMember.MemberType.GROUP);
    } else if ("user".equalsIgnoreCase(type)) {
      memberTypes = Lists.newArrayList(WorkspaceMember.MemberType.USER);
    } else if ("group".equalsIgnoreCase(type)) {
      memberTypes = Lists.newArrayList(WorkspaceMember.MemberType.GROUP);
    } else {
      throw new IllegalArgumentException("Unsupported value of 'type' property. choose [all, user, group]");
    }

    if (pageable.getSort() == null) {
      Sort sort = new Sort(Sort.Direction.ASC, "memberType", "memberName");
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }

    Page<WorkspaceMember> members = workspaceMemberRepository
        .findAll(WorkspaceMemberPredicate.searchWorkspaceMember(workspace, memberTypes, roles, nameContains), pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(members, resourceAssembler));
  }

  /**
   *
   * @param id
   * @param patches
   * @return
   */
  @RequestMapping(path = "/workspaces/{id}/members", method = {RequestMethod.PATCH, RequestMethod.PUT})
  public @ResponseBody
  ResponseEntity<?> patchMemebersInWorkspace(
      @PathVariable("id") String id, @RequestBody List<CollectionPatch> patches) {

    Workspace workspace = workspaceRepository.findOne(id);
    if (workspace == null) {
      return ResponseEntity.notFound().build();
    }

    workspaceService.updateMembers(workspace, patches);

    return ResponseEntity.noContent().build();
  }

  /**
   *
   * @param id
   * @param memberIds
   * @return
   */
  @RequestMapping(path = "/workspaces/{id}/members/{memberIds}", method = RequestMethod.DELETE)
  public @ResponseBody
  ResponseEntity<?> deleteMemebersInWorkspace(
      @PathVariable("id") String id, @PathVariable("memberId") List<String> memberIds) {

    if (workspaceRepository.findOne(id) == null) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.noContent().build();
  }

  /**
   *
   * @param request
   * @param id
   * @return
   */
  @RequestMapping(path = "/workspaces/{id}/favorite", method = {RequestMethod.POST, RequestMethod.DELETE})
  public @ResponseBody
  ResponseEntity<?> saveFavoriteWorkspace(HttpServletRequest request, @PathVariable("id") String id) {

    if (workspaceRepository.findOne(id) == null) {
      return ResponseEntity.notFound().build();
    }

    if ("POST".equals(request.getMethod())) {
      workspaceFavoriteRepository.save(new WorkspaceFavorite(AuthUtils.getAuthUserName(), id));
    } else if ("DELETE".equals(request.getMethod())) {
      workspaceFavoriteRepository.deleteByUsernameAndWorkspaceId(AuthUtils.getAuthUserName(), id);
    } else {
      throw new IllegalArgumentException("Not supported method.");
    }

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/workspaces/{id}/delegate/{owner:.+}", method = RequestMethod.POST)
  public ResponseEntity<?> delegateWorkspace(@PathVariable("id") String workspaceId,
                                             @PathVariable("owner") String owner) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    final User user = cachedUserService.findUser(owner);
    if (user == null) {
      throw new BadRequestException("Invalid username of owner : " + owner);
    }
    if (!workspace.checkMemberExistByUserName(user)) {
      throw new BadRequestException("Invalid username of owner : " + owner);
    }

    // Owner 변경
    workspace.setOwnerId(owner);

    // 변경할 Owner 가 Workspace member 였다면 제거
    if (CollectionUtils.isNotEmpty(workspace.getMembers())) {
      Optional<WorkspaceMember> originalMember = workspace.getMembers().stream()
                                                          .filter(member ->
                                                                      (member.getMemberType() == WorkspaceMember.MemberType.USER) && owner.equals(member.getMemberId()))
                                                          .findFirst();
      originalMember.ifPresent(workspaceMember -> workspace.getMembers().remove(workspaceMember));
    }

    workspaceRepository.save(workspace);

    return ResponseEntity.noContent().build();
  }

  /**
   * Workspace 활성화 여부 지정
   */
  @RequestMapping(path = "/workspaces/{id}/activate/{status:active|inactive}", method = RequestMethod.POST)
  public ResponseEntity<?> activateWorkspace(@PathVariable("id") String workspaceId,
                                             @PathVariable("status") String status) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    // 추가적인 Action 이 있을 경우
    if ("inactive".equals(status)) {
      workspace.setActive(false);
    } else {
      workspace.setActive(true);
    }

    workspaceRepository.save(workspace);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/workspaces/{id}/rolesets", method = RequestMethod.POST)
  public ResponseEntity<?> addRoleSetForWorkspace(@PathVariable("id") String workspaceId,
                                                  @RequestBody RoleSet roleSet) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    roleSet.addWorkspace(workspace);
    roleSet.setScope(RoleSet.RoleSetScope.PRIVATE);

    RoleSet addRoleSet = roleSetService.createRoleSet(roleSet);

    return ResponseEntity.created(URI.create("")).body(addRoleSet);

  }

  @RequestMapping(path = "/workspaces/{id}/rolesets/{roleSetName}", method = RequestMethod.POST)
  public ResponseEntity<?> setWorkspaceRoleSet(@PathVariable("id") String workspaceId,
                                               @PathVariable("roleSetName") String roleSetName) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    workspaceService.addRoleSet(workspace, roleSetName);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/workspaces/{id}/rolesets/{roleSetName}/to/{toRoleSetName}",
      method = {RequestMethod.PUT, RequestMethod.PATCH})
  public ResponseEntity<?> changeWorkspaceRoleSet(@PathVariable("id") String workspaceId,
                                                  @PathVariable("roleSetName") String roleSetName,
                                                  @PathVariable("toRoleSetName") String toRoleSetName,
                                                  @RequestParam(required = false) String defaultRoleName,
                                                  @RequestBody(required = false) Map<String, String> mapper) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    workspaceService.changeRoleSet(workspace, roleSetName, toRoleSetName, defaultRoleName, mapper);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/workspaces/{id}/rolesets/{roleSetName}", method = RequestMethod.DELETE)
  public ResponseEntity<?> deleteWorkspaceRoleSet(@PathVariable("id") String workspaceId,
                                                  @PathVariable("roleSetName") String roleSetName,
                                                  @RequestParam(required = false) String defaultRoleName) {

    Workspace workspace = workspaceRepository.findOne(workspaceId);
    if (workspace == null) {
      throw new ResourceNotFoundException(workspaceId);
    }

    workspaceService.deleteRoleSet(workspace, roleSetName, defaultRoleName);

    return ResponseEntity.noContent().build();
  }

  /**
   *
   */
  public class WorkspaceListComparator implements Comparator<Workspace> {

    @Override
    public int compare(Workspace w1, Workspace w2) {

      if (w1.getPublicType() == PRIVATE && w2.getPublicType() != PRIVATE) {
        return -1;
      } else if (w1.getPublicType() != PRIVATE && w2.getPublicType() == PRIVATE) {
        return 1;
      }

      return w1.getName().compareTo(w2.getName());
    }
  }

}
