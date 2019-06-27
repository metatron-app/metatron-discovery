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
import com.google.common.collect.Sets;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.activities.ActivityStreamService;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.QDataSource;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupRepository;
import app.metatron.discovery.domain.user.group.GroupService;
import app.metatron.discovery.domain.user.role.Role;
import app.metatron.discovery.domain.user.role.RoleRepository;
import app.metatron.discovery.domain.user.role.RoleService;
import app.metatron.discovery.domain.user.role.RoleSet;
import app.metatron.discovery.domain.user.role.RoleSetRepository;
import app.metatron.discovery.domain.user.role.RoleSetService;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.EnumUtils;

import static app.metatron.discovery.domain.workspace.Workspace.PublicType.SHARED;

/**
 * Created by kyungtaak on 2017. 7. 23..
 */
@Component
@Transactional(readOnly = true)
public class WorkspaceService {

  private static Logger LOGGER = LoggerFactory.getLogger(WorkspaceService.class);

  @Autowired
  ActivityStreamService activityStreamService;

  @Autowired
  GroupService groupService;

  @Autowired
  GroupRepository groupRepository;

  @Autowired
  RoleService roleService;

  @Autowired
  RoleSetService roleSetService;

  @Autowired
  CachedUserService cachedUserService;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  WorkspaceRepository workspaceRepository;

  @Autowired
  WorkspaceMemberRepository workspaceMemberRepository;

  @Autowired
  WorkspaceFavoriteRepository workspaceFavoriteRepository;

  @Autowired
  RoleSetRepository roleSetRepository;

  @Autowired
  RoleRepository roleRepository;

  @Transactional
  public Workspace createWorkspaceByUserCreation(User user, boolean ifExistThrowException) {

    // 워크스페이스 생성(등록된 워크스페이스가 없을 경우 생성)
    Workspace checkedWorkspace = workspaceRepository.findPrivateWorkspaceByOwnerId(user.getUsername());
    if(checkedWorkspace != null) {
      if (ifExistThrowException ) {
        throw new RuntimeException("Workspace already exist.");
      } else {
        return checkedWorkspace;
      }
    }

    Workspace createWorkspace = new Workspace();
    createWorkspace.setPublicType(Workspace.PublicType.PRIVATE);
    createWorkspace.setName(user.getFullName() + " Workspace");
    createWorkspace.setOwnerId(user.getUsername());

    if(StringUtils.isNotEmpty(user.getWorkspaceType())
        && Workspace.workspaceTypes.contains(user.getWorkspaceType())) {
      createWorkspace.setType(user.getWorkspaceType());
    } else {
      createWorkspace.setType(Workspace.workspaceTypes.get(0)); // "DEFAULT" 셋팅
    }

    return workspaceRepository.saveAndFlush(createWorkspace);

  }

  /**
   * Workspace 접근 시간 지정
   */
  @Transactional
  public void updateLastAccessedTime(String workspaceId) {
    workspaceRepository.updateLastAccessedTime(workspaceId);
  }

  /**
   * 사용자 삭제시 Workspace 처리
   */
  @Transactional
  public void disableWorkspaceAndMember(String username, Map<String, String> delegateePair) {
    // Workspace Owner 인 경우 처리, 위임자 정보가 없는 경우, 전체 Inactive 시킴
    if(MapUtils.isEmpty(delegateePair)) {
      workspaceRepository.updateInactiveWorkspaceAndChangeKnownOwnerId(username, Workspace.PublicType.PRIVATE, Workspace.PublicType.SHARED);
    } else {
      // 개인 워크스페이스만 비활성화 시킵니다
      workspaceRepository.updateInactiveWorkspaceOfOwner(username, Workspace.PublicType.PRIVATE);
      // TODO: delegateePair 를 통해 위임합니다
    }

    // Workspace Member 로 포함된 경우 삭제
    workspaceMemberRepository.deleteByMemberIds(Lists.newArrayList(username));

    // Workspace Favorite 삭제
    workspaceFavoriteRepository.deleteByUsername(username);
  }

  /**
   * 사용자 삭제시 Workspace 삭제
   */
  @Transactional
  public void deleteWorkspaceAndMember(String username) {
    // PRIVATE workspace 삭제
    Workspace workspace = workspaceRepository.findPrivateWorkspaceByOwnerId(username);
    if(workspace == null) {
      LOGGER.warn("Fail to find private workspace : {}", username);
    } else {
      workspaceRepository.delete(workspace);
    }

    // Workspace Member 로 포함된 경우 삭제
    workspaceMemberRepository.deleteByMemberIds(Lists.newArrayList(username));

    // Workspace Favorite 삭제
    workspaceFavoriteRepository.deleteByUsername(username);
  }

  public Integer countAvailableWorkspaces(String workspaceId) {

    BooleanBuilder builder = new BooleanBuilder();
    QDataSource dataSource = QDataSource.dataSource;

    // 전체 공개 Sub-Query
    BooleanExpression published = dataSource.id
        .in(JPAExpressions.select(dataSource.id)
                          .from(dataSource)
                          .where(dataSource.published.eq(true)));

    // Workspace 내 포함된 Datasource 조회 Sub-Query
    BooleanExpression workspaceContains = dataSource.id
        .in(JPAExpressions.select(dataSource.id)
                          .from(dataSource)
                          .innerJoin(dataSource.workspaces)
                          .where(dataSource.workspaces.any().id.eq(workspaceId)));

    builder = builder.andAnyOf(workspaceContains, published);

    long count = dataSourceRepository.count(builder);

    return (int) count;
  }

  /**
   *
   * @param workbookId
   * @param workspaceId
   * @return
   */
  public boolean checkWorkBookCopyToWorkspace(String workbookId, String workspaceId) {

    List<String> dataSourceIdInWorkbook = dataSourceRepository.findIdsByWorkbookInNotPublic(workbookId);

    List<String> dataSourceIdInWorkspace = dataSourceRepository.findIdsByWorkspaceIn(workspaceId);

    return CollectionUtils.containsAll(dataSourceIdInWorkspace, dataSourceIdInWorkbook);
  }

  @Transactional
  public void updateMembers(Workspace workspace, List<CollectionPatch> patches) {

    // RoleSet 이 없는 경우 기본 RoleSet 지정
    if (CollectionUtils.isEmpty(workspace.getRoleSets())) {
      workspace.addRoleSet(roleSetService.getDefaultRoleSet());
    }

    Map<String, Role> roleMap = workspace.getRoleMap();
    Map<String, WorkspaceMember> memberMap = workspace.getMemberIdMap();
    for (CollectionPatch patch : patches) {
      String memberId = patch.getValue("memberId");
      switch (patch.getOp()) {
        case ADD:
        case REPLACE:
          if (!validateCollectionPatchForMember(patch, roleMap)) {
            continue;
          }

          if (memberMap.containsKey(memberId)) {
            memberMap.get(memberId).setRole(patch.getValue("role"));
            LOGGER.debug("Replaced member in workspace({}) : {}, {}", workspace.getId(), memberId, patch.getValue("role"));
          } else {
            workspace.getMembers().add(new WorkspaceMember(patch, workspace, this.cachedUserService));
            LOGGER.debug("Added member in workspace({}) : {}, {}", workspace.getId(), memberId, patch.getValue("role"));
          }

          break;
        case REMOVE:
          if (memberMap.containsKey(memberId)) {
            workspace.getMembers().remove(memberMap.get(memberId));
            LOGGER.debug("Deleted member in workspace({}) : {}", workspace.getId(), memberId);
            // 즐겨찾기가 등록되어 있는 경우 삭제
            workspaceFavoriteRepository.deleteByUsernameAndWorkspaceId(memberId, workspace.getId());
          }
          break;
        default:
          break;
      }
    }

    workspaceRepository.save(workspace);

  }


  private boolean validateCollectionPatchForMember(CollectionPatch patch, Map<String, Role> roleMap) {

    // Required 'MemberId' property
    String memberId = patch.getValue("memberId");
    if (StringUtils.isEmpty(memberId)) {
      LOGGER.debug("memberId required.");
      return false;
    }

    // Checking valid member type.
    WorkspaceMember.MemberType memberType = null;
    if (patch.getValue("memberType") != null) {
      memberType = EnumUtils.getUpperCaseEnum(WorkspaceMember.MemberType.class, patch.getValue("memberType"));
      if (memberType == null) {
        LOGGER.debug("Invalid memberType(user/group).");
        return false;
      }

      DirectoryProfile profile = cachedUserService.findProfileByMemberType(memberId, memberType);
      if (profile == null) {
        LOGGER.debug("Unknown member {}({}).", memberId, memberType);
        return false;
      }
    }

    // Required 'role' property, checking valid role name.
    String roleName = patch.getValue("role");
    if (StringUtils.isNotEmpty(roleName)) {
      if (!roleMap.containsKey(roleName)) {
        LOGGER.debug("Unknown role name {}.", roleName);
        return false;
      }
    }

    return true;
  }

  /**
   * 워크스페이스 내에서 접속한 Member 및 Member가 포함된 Group 의 역할을 전달 (for Projection)
   */
  public List<WorkspaceMember> myRoles(String workspaceId, String ownerId) {

    String currentUser = AuthUtils.getAuthUserName();

    if (currentUser.equals(ownerId)) {
      return null;
    }

    // Workspace 내 멤버 여부 확인하고 Role 명 가져오기
    List<String> joinedIds = groupService.getJoinedGroups(currentUser).stream()
                                         .map(Group::getName)
                                         .collect(Collectors.toList());
    joinedIds.add(currentUser);

    List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceIdAndMemberIds(workspaceId, joinedIds);

    return members;

  }

  /**
   * Workspace Permission 목록 가져오기 (for Projection)
   *
   * @return Permission 목록
   */
  public Set<String> getPermissions(Workspace workspace) {

    String currentUser = AuthUtils.getAuthUserName();
    // Owner 는 모든 권한을 가짐
    if (currentUser.equals(workspace.getOwnerId())) {
      return WorkspacePermissions.allPermissions();
    }

    // Workspace 내 멤버 여부 확인하고 Role 명 가져오기
    List<String> joinedIds = groupService.getJoinedGroups(currentUser).stream()
                                         .map(Group::getId)
                                         .collect(Collectors.toList());
    joinedIds.add(currentUser);

    List<String> roleNames = workspaceMemberRepository.findRoleNameByMemberIdsAndWorkspaceId(joinedIds, workspace.getId());

    // 멤버가 아닌 경우 빈값 노출
    if (CollectionUtils.isEmpty(roleNames)) {
      return Sets.newHashSet();
    }

    if (CollectionUtils.isEmpty(workspace.getRoleSets())) {
      workspace.addRoleSet(roleSetService.getDefaultRoleSet());
    }

    return roleSetRepository.getPermissionsByRoleSetAndRoleName(workspace.getRoleSets(), roleNames);
  }

  /**
   * Workspace 내 RoleSet 추가
   *
   * @return Permission 목록
   */
  @Transactional
  public void addRoleSet(Workspace workspace, String roleSetName) {

    RoleSet addRoleSet = roleSetRepository.findByName(roleSetName);
    if (addRoleSet == null) {
      throw new ResourceNotFoundException(roleSetName);
    }

    List<RoleSet> roleSets = workspace.getRoleSets();

    if (roleSets.contains(addRoleSet)) {
      throw new IllegalArgumentException("Already added roleset.");
    }

    // RoleSet 추가
    roleSets.add(addRoleSet);

    workspaceRepository.save(workspace);
  }

  /**
   * Workspace 내 RoleSet 변경
   *
   * @return Permission 목록
   */
  @Transactional
  public void changeRoleSet(Workspace workspace, String from, String to, String defaultRoleName, Map<String, String> mapper) {

    RoleSet fromRoleSet = null;
    RoleSet defaultRoleSet = roleSetService.getDefaultRoleSet();
    // RoleSet 이 없는 경우 fromRoleSet 이 Default rolset 인지 확인
    List<RoleSet> roleSets = workspace.getRoleSets();
    if (CollectionUtils.isEmpty(roleSets)) {
      if (defaultRoleSet.getName().equals(from)) {
        fromRoleSet = defaultRoleSet;
      } else {
        throw new BadRequestException("Invalid fromRoleSet name.");
      }
    } else {
      fromRoleSet = roleSets.stream()
                            .filter(roleSet -> from.equals(roleSet.getName()))
                            .findFirst()
                            .orElseThrow(() -> new BadRequestException("fromRoleSet(" + from + ") not found in lined workspace"));
    }

    RoleSet toRoleSet = roleSetRepository.findByName(to);
    if (fromRoleSet == null) {
      throw new BadRequestException("toRoleSet(" + to + ") not found.");
    }

    workspace.removeRoleSet(fromRoleSet);
    workspace.addRoleSet(toRoleSet);

    workspaceRepository.saveAndFlush(workspace);

    /*
      Mapper 처리 부분
     */

    // mapper 를 통한 workspace member role 업데이트
    Role toDefaultRole = getDefaultRole(defaultRoleName, Lists.newArrayList(toRoleSet));

    if (MapUtils.isEmpty(mapper)) { // mapper 정보가 없는 경우 default role로 변경
      for (Role role : fromRoleSet.getRoles()) {
        workspaceMemberRepository.updateMemberRoleInWorkspace(workspace, role.getName(), toDefaultRole.getName());
      }
    } else {

      List<String> fromRoleNames = fromRoleSet.getRoleNames();
      List<String> toRoleNames = toRoleSet.getRoleNames();
      String toDefaultRoleName = toDefaultRole.getName();

      for (String fromRoleName : mapper.keySet()) {
        if (!fromRoleNames.contains(fromRoleName)) {
          continue;
        }

        // toRoleName 이 존재하지 않으면 기본 RoleName 으로 변경
        String toRoleName = mapper.get(fromRoleName);
        if (!toRoleNames.contains(toRoleName)) {
          toRoleName = toDefaultRoleName;
        }

        workspaceMemberRepository.updateMemberRoleInWorkspace(workspace, fromRoleName, toRoleName);

        fromRoleNames.remove(fromRoleName);
      }

      if (!fromRoleNames.isEmpty()) {
        // 포함되지 않은 from RoleSet 의 member role 을 to RoleSet 기본 Role Name 으로 일괄 변경
        workspaceMemberRepository.updateMultiMemberRoleInWorkspace(workspace, fromRoleSet.getRoleNames(), toDefaultRoleName);
      }

    }
  }

  /**
   * Workspace 내 RoleSet 삭제
   *
   * @return Permission 목록
   */
  @Transactional
  public void deleteRoleSet(Workspace workspace, String roleSetName, String defaultRoleName) {

    RoleSet deleteRoleSet = roleSetRepository.findByName(roleSetName);
    if (deleteRoleSet == null) {
      throw new ResourceNotFoundException(roleSetName);
    }

    List<RoleSet> roleSets = workspace.getRoleSets();

    if (roleSets.contains(deleteRoleSet)) {
      roleSets.remove(deleteRoleSet);
    } else {
      throw new IllegalArgumentException("Already added roleset.");
    }

    // 삭제하고 RoleSet이 하나도 없는 경우 지정
    if (roleSets.size() == 0) {
      roleSets.add(roleSetService.getDefaultRoleSet());
    }

    workspaceRepository.saveAndFlush(workspace);

    // Default Role 을 통해 삭제할 RoleSet내  지정된 Workspace Member Role 업데이트
    Role defaultRole = getDefaultRole(defaultRoleName, roleSets);

    List<String> targetRoleNames = deleteRoleSet.getRoles().stream()
                                                .map(role -> role.getName())
                                                .collect(Collectors.toList());

    workspaceMemberRepository.updateMultiMemberRoleInWorkspace(workspace, targetRoleNames, defaultRole.getName());

  }

  private Role getDefaultRole(String defaultRoleName, List<RoleSet> roleSets) {

    final List<Role> roles = Lists.newArrayList();
    roleSets.forEach(roleSet -> {
      roles.addAll(roleSet.getRoles());
    });

    Role defaultRole = roles.stream()
                            .filter(r -> r.equals(defaultRoleName))
                            .findFirst().orElse(null);

    if (defaultRole == null) {
      defaultRole = roles.stream()
                         .filter(r -> r.getDefaultRole())
                         .findFirst().orElseThrow(() -> new IllegalArgumentException("default role not found"));
    }

    return defaultRole;
  }

  public Map<String, Object> getStatistics(Workspace workspace,
                                           TimeFieldFormat.TimeUnit timeUnit,
                                           DateTime from, DateTime to, boolean accumulated) {
    Map<String, Long> countBookByType = workspaceRepository.countByBookType(workspace);
    Double avgDashboardByWorkBook = workspaceRepository.avgDashBoardByWorkBook(workspace);
    Long countFavoriteWorkspace = workspaceFavoriteRepository.countDistinctByWorkspaceId(workspace.getId());

    // 접속 이력 통계 구하기
    Map<String, Long> viewCountByTime = activityStreamService
        .getWorkspaceViewByDateTime(workspace.getId(), timeUnit, from, to);

    // 누적 옵션 추가
    List<Long> viewCountValues;
    if(accumulated) {
      viewCountValues = Lists.newArrayList();
      Long tempValue = 0L;
      for (Long viewCountValue : viewCountByTime.values()) {
        tempValue += viewCountValue;
        viewCountValues.add(tempValue);
      }
    } else {
      viewCountValues = Lists.newArrayList(viewCountByTime.values());
    }


    MatrixResponse<String, Long> matrix = new MatrixResponse<>(Lists.newArrayList(viewCountByTime.keySet()),
                                                               Lists.newArrayList(new MatrixResponse.Column("Count", viewCountValues)));

    Map<String, Object> statMap = Maps.newLinkedHashMap();
    statMap.put("countBookByType", countBookByType);
    statMap.put("avgDashboardByWorkBook", avgDashboardByWorkBook);
    statMap.put("countFavoriteWorkspace", countFavoriteWorkspace);
    statMap.put("viewCountByTime", matrix);

    return statMap;
  }

  public Page<Workspace> getPublicWorkspaces(Boolean onlyFavorite,
                                             Boolean myWorkspace,
                                             Boolean published,
                                             String nameContains,
                                             Pageable pageable){
    String username = AuthUtils.getAuthUserName();

    Predicate publicWorkspacePredicate = getPublicWorkspacePredicate(onlyFavorite, myWorkspace, published, nameContains);

    // 결과 질의
    Page<Workspace> publicWorkspaces = workspaceRepository.findAll(publicWorkspacePredicate, pageable);

    // Favorite 여부 처리
    if (onlyFavorite) {
      publicWorkspaces.forEach(publicWorkspace -> publicWorkspace.setFavorite(true));
    } else {
      Set<String> favoriteWorkspaceIds = workspaceFavoriteRepository.findWorkspaceIdByUsername(username);
      for (Workspace publicWorkspace : publicWorkspaces) {
        if (favoriteWorkspaceIds.contains(publicWorkspace.getId())) {
          publicWorkspace.setFavorite(true);
        } else {
          publicWorkspace.setFavorite(false);
        }
      }
    }

    return publicWorkspaces;
  }

  public List<Workspace> getPublicWorkspaces(Boolean onlyFavorite,
                                             Boolean myWorkspace,
                                             Boolean published,
                                             String nameContains){
    String username = AuthUtils.getAuthUserName();

    Predicate publicWorkspacePredicate = getPublicWorkspacePredicate(onlyFavorite, myWorkspace, published, nameContains);

    // 결과 질의
    List<Workspace> publicWorkspaces = (List) workspaceRepository.findAll(publicWorkspacePredicate);

    // Favorite 여부 처리
    if (onlyFavorite) {
      publicWorkspaces.forEach(publicWorkspace -> publicWorkspace.setFavorite(true));
    } else {
      Set<String> favoriteWorkspaceIds = workspaceFavoriteRepository.findWorkspaceIdByUsername(username);
      for (Workspace publicWorkspace : publicWorkspaces) {
        if (favoriteWorkspaceIds.contains(publicWorkspace.getId())) {
          publicWorkspace.setFavorite(true);
        } else {
          publicWorkspace.setFavorite(false);
        }
      }
    }

    return publicWorkspaces;
  }

  private Predicate getPublicWorkspacePredicate(Boolean onlyFavorite,
                                                Boolean myWorkspace,
                                                Boolean published,
                                                String nameContains){
    String username = AuthUtils.getAuthUserName();

    List<String> targets = Lists.newArrayList(username);
    targets.addAll(groupRepository.findGroupIdsByMemberId(username));

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspace workspace = QWorkspace.workspace;
    QWorkspaceFavorite workspaceFavorite = QWorkspaceFavorite.workspaceFavorite;

    builder.and(workspace.publicType.eq(SHARED));

    Predicate pOwnerEq = null;
    if(myWorkspace != null) {
      pOwnerEq = myWorkspace ? workspace.ownerId.eq(username) : workspace.ownerId.ne(username);
    }
    Predicate pPublished = null;
    if(published != null) {
      pPublished = published ? builder.and(workspace.published.isTrue())
              : builder.andAnyOf(workspace.published.isNull(), workspace.published.isFalse());
    }

    if (onlyFavorite) {
      BooleanExpression favorite = workspace.id
              .in(JPAExpressions.select(workspace.id)
                      .from(workspace, workspaceFavorite)
                      .where(workspace.id.eq(workspaceFavorite.workspaceId).and(workspaceFavorite.username.eq(username))));
      builder.and(favorite);

      if (myWorkspace != null) {
        builder.and(pOwnerEq);
      }

      if (published != null) {
        builder.and(pPublished);
      }
    } else {

      BooleanExpression memberIn = workspace.id
              .in(JPAExpressions.select(workspace.id)
                      .from(workspace)
                      .innerJoin(workspace.members)
                      .where(workspace.members.any().memberId.in(targets)));
      if (myWorkspace != null) {
        if(published == null) {
          if(myWorkspace) {
            builder.and(pOwnerEq);
          } else {
            builder.andAnyOf(memberIn, workspace.published.isTrue());
          }
        } else {
          builder.and(pOwnerEq);
          builder.and(pPublished);

          if(!myWorkspace) {
            builder.and(memberIn);
          }
        }
      } else {
        if (published == null) {
          builder.andAnyOf(memberIn, workspace.ownerId.eq(username), workspace.published.isTrue());
        } else {
          builder.and(pPublished);
        }

      }
    }

    if (StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(workspace.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }
}

