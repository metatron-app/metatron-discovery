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

package app.metatron.discovery.domain.user;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.querydsl.core.types.Predicate;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.Period;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URI;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.Mailer;
import app.metatron.discovery.common.StatLogger;
import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.images.Image;
import app.metatron.discovery.domain.images.ImageService;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupMember;
import app.metatron.discovery.domain.user.group.GroupService;
import app.metatron.discovery.domain.user.org.OrganizationService;
import app.metatron.discovery.domain.user.role.RoleRepository;
import app.metatron.discovery.domain.user.role.RoleService;
import app.metatron.discovery.domain.user.role.RoleSetRepository;
import app.metatron.discovery.domain.user.role.RoleSetService;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceMemberRepository;
import app.metatron.discovery.domain.workspace.WorkspaceService;
import app.metatron.discovery.util.AuthUtils;

import static app.metatron.discovery.domain.user.UserService.DuplicatedTarget.EMAIL;
import static app.metatron.discovery.domain.user.UserService.DuplicatedTarget.USERNAME;
import static app.metatron.discovery.domain.user.org.Organization.DEFAULT_ORGANIZATION_CODE;

/**
 *
 */
@RepositoryRestController
public class UserController {

  private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

  @Autowired
  RoleService roleService;

  @Autowired
  GroupService groupService;

  @Autowired
  OrganizationService orgService;

  @Autowired
  RoleSetService roleSetService;

  @Autowired
  WorkspaceService workspaceService;

  @Autowired
  ImageService imageService;

  @Autowired
  UserRepository userRepository;

  @Autowired
  WorkspaceMemberRepository workspaceMemberRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  RoleSetRepository roleSetRepository;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  CachedUserService cachedUserService;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  UserService userService;

  @Autowired
  Mailer mailer;

  @Autowired
  PasswordEncoder passwordEncoder;

  @Autowired
  UserProperties userProperties;

  /**
   * User 목록 조회
   */
  @RequestMapping(path = "/users", method = RequestMethod.GET)
  public ResponseEntity<?> findUsers(@RequestParam(value = "level", required = false) String level,
          @RequestParam(value = "active", required = false) Boolean active,
          @RequestParam(value = "status", required = false) List<String> status,
          @RequestParam(value = "nameContains", required = false) String nameContains,
          @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
          @RequestParam(value = "from", required = false)
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
          @RequestParam(value = "to", required = false)
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
          Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    List<User.Status> reqStatus = null;
    if (CollectionUtils.isNotEmpty(status)) {
      reqStatus = Lists.newArrayList();
      for (String s : status) {
        reqStatus.add(SearchParamValidator.enumUpperValue(User.Status.class, s, "status"));
      }
    }

    // Get Predicate
    Predicate searchPredicated = UserPredicate
            .searchList(level, active, reqStatus, nameContains, searchDateBy, from, to);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
              new Sort(Sort.Direction.ASC, "fullName"));
    }

    Page<User> users = userRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(users, resourceAssembler));

  }

  /**
   * User 상세 조회
   */
  @RequestMapping(path = "/users/{username:.+}", method = RequestMethod.GET)
  public ResponseEntity<?> findDetailUser(@PathVariable("username") String username,
          PersistentEntityResourceAssembler resourceAssembler) {

    User user = userRepository.findByUsername(username);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(resourceAssembler.toResource(user));

  }

  /**
   * User 삭제
   */
  @Transactional
  @PreAuthorize("authentication.name == #username or hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/users/{username:.+}", method = RequestMethod.DELETE)
  public ResponseEntity<?> deleteUser(@PathVariable("username") String username) {

    User user = userRepository.findByUsername(username);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }

    userRepository.delete(user);

    // Delete images related with the user
    if (StringUtils.isNotEmpty(user.getImageUrl())) {
      imageService.deleteImage(Image.DOMAIN_USER, user.getId());
    }

    // Delete created workspaces, and leave joined workspaces
    workspaceService.deleteWorkspaceAndMember(user.getUsername());

    // Delete the member in joined groups
    groupService.deleteGroupMember(user.getUsername());

    // Delete the member of organizations
    orgService.deleteOrgMembers(user.getUsername());

    // Delete if there is user information stored in the cache
    cachedUserService.removeCachedUser(user.getUsername());

    return ResponseEntity.noContent().build();
  }

  /**
   * User 자신에 의해 사용자 정보 수정
   */
  @Transactional
  @PreAuthorize("authentication.name == #username")
  @RequestMapping(path = "/users/{username:.+}", method = RequestMethod.PATCH)
  public ResponseEntity<?> updateUser(@PathVariable("username") String username, @RequestBody User user) {

    User updatedUser = userRepository.findByUsername(username);
    if (updatedUser == null) {
      throw new ResourceNotFoundException(username);
    }

    if (!username.equals(AuthUtils.getAuthUserName())) {
      throw new UserException("Fail to update permission. only user(" + username + ") can update.");
    }

    if (user.getPassword() != null) {
      //check password changed
      if (!passwordEncoder.matches(updatedUser.getPassword(), user.getPassword())) {
        //if config minimum password change date exist..
        if (StringUtils.isNotEmpty(userProperties.getPassword().getMinimumUsePeriod())) {
          //parse to period
          Period minimumUsePeriod = Period.parse(userProperties.getPassword().getMinimumUsePeriod());
          LOGGER.debug("minimumUsePeriod : {}", minimumUsePeriod);

          //getting last update datetime
          DateTime passwordChangedDate = userService.getLastPasswordUpdatedDate(username);
          LOGGER.debug("{}'s passwordChangedDate : {}", username, passwordChangedDate);
          if (minimumUsePeriod != null && passwordChangedDate != null) {

            //must user password period
            DateTime mustUsePasswordDate = passwordChangedDate.plus(minimumUsePeriod);
            LOGGER.debug("{} must use password to {}", username, mustUsePasswordDate);
            if (DateTime.now().getMillis() < mustUsePasswordDate.getMillis()) {
              //user cannot update password
              LOGGER.debug("{} cannot change password.", username);
              throw new UserException(UserErrorCodes.PASSWORD_USE_PERIOD_NOT_PASSED,
                      "The minimum password usage period has not passed.(" + mustUsePasswordDate + ")");
            }
          }
        }

        //check password validation
        userService.validateUserPassword(username, user);

        //check matched previous password
        userService.getMatchedPreviousPassword(username, user.getPassword());

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        updatedUser.setPassword(encodedPassword);
      }
    }

    if (user.getFullName() != null) {
      updatedUser.setFullName(user.getFullName());
    }
    if (user.getEmail() != null) {
      updatedUser.setEmail(user.getEmail());
    }
    if (user.getTel() != null) {
      updatedUser.setTel(user.getTel());
    }
    if (user.getImageUrl() != null) {
      if (StringUtils.isBlank(user.getImageUrl())) {
        userService.deleteUserImage(updatedUser.getUsername());
        updatedUser.setImageUrl(null);
      } else {
        userService.updateUserImage(updatedUser.getUsername());
        updatedUser.setImageUrl(user.getImageUrl());
      }
    }

    userRepository.saveAndFlush(updatedUser);

    // user 정보 갱신
    updatedUser.setRoleService(roleService);
    AuthUtils.refreshAuth(updatedUser);
    cachedUserService.removeCachedUser(username);

    // Workspace Member 이름 갱신
    workspaceMemberRepository.updateMemberName(updatedUser.getUsername(), updatedUser.getFullName());

    return ResponseEntity.ok(updatedUser);

  }

  /**
   * 사용자 가입 요청
   */
  @RequestMapping(path = "/users/signup", method = RequestMethod.POST)
  public ResponseEntity<?> createUserBySignup(@RequestBody User user) {

    // Check if username is duplicate
    if (userService.checkDuplicated(USERNAME, user.getUsername())) {
      throw new UserException(UserErrorCodes.DUPLICATED_USERNAME_CODE, "Duplicated username : " + user.getUsername());
    }

    // Check if e-mail is duplicate
    if (userService.checkDuplicated(EMAIL, user.getEmail())) {
      throw new UserException(UserErrorCodes.DUPLICATED_EMAIL_CODE, "Duplicated e-mail : " + user.getEmail());
    }

    //password expr check
    userService.validateUserPassword(user.getUsername(), user);

    // check user org code if exist
    if(user.getOrgCodes() != null && user.getOrgCodes().size() > 0) {
      for(String orgCode : user.getOrgCodes()){
        if(!orgService.checkDuplicatedCode(orgCode)){
          throw new UserException(UserErrorCodes.ORGANIZATION_NOT_VALID, "Not valid Org Code : " + orgCode);
        }
      }

      user.setRequestOrgCodes(GlobalObjectMapper.writeValueAsString(user.getOrgCodes()));
    }

    if (StringUtils.isBlank(user.getFullName())) {
      user.setFullName(user.getUsername());
    }

    if (StringUtils.isNotBlank(user.getImageUrl())) {
      userService.updateUserImage(user.getUsername());
    }

    if (user.getPassword() != null) {
      String encodedPassword = passwordEncoder.encode(user.getPassword());
      user.setPassword(encodedPassword);
    }

    user.setStatus(User.Status.REQUESTED);

    userRepository.save(user);

    mailer.sendSignUpRequestMail(user, false);

    return ResponseEntity.created(URI.create("")).build();
  }

  /**
   * 최초 접속시 패스워드 수정
   */
  @RequestMapping(path = "/users/password", method = RequestMethod.POST)
  public ResponseEntity<?> updateInitialUser(@RequestBody User user) {

    User updatedUser = userRepository.findByUsername(user.getUsername());
    if (updatedUser == null) {
      throw new ResourceNotFoundException(user.getUsername());
    }

    if (!(User.Status.INITIAL.equals(updatedUser.getStatus()) || User.Status.EXPIRED.equals(updatedUser.getStatus()))) {
      throw new UserException("Fail to update password. Only for initial access or expired users.");
    }

    if (!passwordEncoder.matches(user.getInitialPassword(), updatedUser.getPassword())) {
      throw new UserException(UserErrorCodes.INITIAL_PASSWORD_NOT_MATCHED,
              "Fail to update password. It does not match the initial password.");
    }

    updatedUser.setStatus(User.Status.ACTIVATED);
    if (user.getPassword() != null) {
      userService.validateUserPassword(user.getUsername(), user);
      String encodedPassword = passwordEncoder.encode(user.getPassword());
      updatedUser.setPassword(encodedPassword);
    }

    userRepository.saveAndFlush(updatedUser);

    return ResponseEntity.ok(updatedUser);

  }

  /**
   * 관리자용 사용자 등록
   */
  @Transactional
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/users/manual", method = RequestMethod.POST)
  public ResponseEntity<?> createUserByAdmin(@RequestBody User user) {

    String userEmail = user.getEmail();

    // Check if username is duplicate
    if (userService.checkDuplicated(USERNAME, user.getUsername())) {
      throw new UserException(UserErrorCodes.DUPLICATED_USERNAME_CODE, "Duplicated username : " + user.getUsername());
    }

    // Check if e-mail is duplicate
    if (StringUtils.isNotEmpty(userEmail) && userService.checkDuplicated(EMAIL, user.getEmail())) {
      throw new UserException(UserErrorCodes.DUPLICATED_EMAIL_CODE, "Duplicated e-mail : " + user.getEmail());
    }

    if (StringUtils.isBlank(user.getFullName())) {
      user.setFullName(user.getUsername());
    }

    if (StringUtils.isNotBlank(user.getImageUrl())) {
      userService.updateUserImage(user.getUsername());
    }

    // If password is not specified without mail transmission, the system generates password
    if (!user.getPassMailer() || StringUtils.isEmpty(user.getPassword())) {
      String temporaryPassword = userService.createTemporaryPassword(user.getUsername());
      user.setPassword(temporaryPassword);

      StatLogger.generateTempPassword("User Creation", user.getUsername(), temporaryPassword);
    }

    //encode password
    String decryptedPassword = user.getPassword();
    String encodedPassword = passwordEncoder.encode(user.getPassword());
    user.setPassword(encodedPassword);

    user.setStatus(User.Status.ACTIVATED);

    // If there is no group information, specify the default group
    if (CollectionUtils.isNotEmpty(user.getGroupNames())) {
      userService.setUserToGroups(user, user.getGroupNames());
    } else {
      Group defaultGroup = groupService.getDefaultGroup();
      if (defaultGroup == null) {
        LOGGER.warn("Default group not found.");
      } else {
        defaultGroup.addGroupMember(new GroupMember(user.getUsername(), user.getFullName()));
      }
    }

    // Create Workspace (create if there is no registered workspace)
    Workspace createdWorkspace = workspaceService.createWorkspaceByUserCreation(user, false);

    userRepository.save(user);

    // Add Organization
    String orgCode = CommonLocalVariable.getLocalVariable().getTenantAuthority().getOrgCode();
    orgService.addMembers(Lists.newArrayList(orgCode), user.getUsername(), user.getFullName(), DirectoryProfile.Type.USER);

    if (!user.getPassMailer()) {
      mailer.sendSignUpApprovedMail(user, true, decryptedPassword);
    }

    Map<String, Object> responseMap = Maps.newHashMap();
    responseMap.put("username", user.getUsername());
    responseMap.put("privateWorkspace", "/api/workspaces/" + createdWorkspace.getId());

    return ResponseEntity.created(URI.create("")).body(responseMap);
  }

  /**
   * 관리자용 사용자 정보 업데이트
   */
  @Transactional
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/users/{username}/manual", method = RequestMethod.PUT)
  public ResponseEntity<?> updateUserByAdmin(@PathVariable("username") String username, @RequestBody User user) {

    User updatedUser = userRepository.findByUsername(username);

    if (updatedUser == null) {
      return ResponseEntity.notFound().build();
    }

    if(user.getGroupNames() != null && user.getGroupNames().size() > 0){
      userService.setUserToGroups(updatedUser, user.getGroupNames());
    }

    if (StringUtils.isNotBlank(user.getFullName())) {
      updatedUser.setFullName(user.getFullName());
    }

    if (StringUtils.isNotBlank(user.getEmail())) {
      updatedUser.setEmail(user.getEmail());
    }

    if (StringUtils.isNotBlank(user.getTel())) {
      updatedUser.setTel(user.getTel());
    }

    if (StringUtils.isBlank(user.getImageUrl()) && StringUtils.isNotBlank(updatedUser.getImageUrl())) {
      userService.deleteUserImage(updatedUser.getUsername());
      updatedUser.setImageUrl(null);
    }

    if (StringUtils.isNotBlank(user.getImageUrl())) {
      userService.updateUserImage(username);
      updatedUser.setImageUrl(user.getImageUrl());
    }

    updatedUser.setStatus(User.Status.ACTIVATED);
    if (user.getPassword() != null) {
      userService.validateUserPassword(username, user);
      String encodedPassword = passwordEncoder.encode(user.getPassword());
      updatedUser.setPassword(encodedPassword);
    }

    userRepository.saveAndFlush(updatedUser);

    // user 정보 갱신
    if (AuthUtils.getAuthUserName().equals(updatedUser.getUsername())) {
      updatedUser.setRoleService(roleService);
      AuthUtils.refreshAuth(updatedUser);
    }

    // Cache 저장 정보 갱신
    cachedUserService.removeCachedUser(username);

    // Workspace Member 이름 갱신
    workspaceMemberRepository.updateMemberName(updatedUser.getUsername(), updatedUser.getFullName());

    return ResponseEntity.ok(updatedUser);
  }

  /**
   * @param additionalInfo
   * @return
   */
  @RequestMapping(path = "/users/password/reset", method = RequestMethod.POST)
  public ResponseEntity<?> resetPassword(@RequestBody Map<String, Object> additionalInfo) {

    if (!additionalInfo.containsKey("email")) {
      throw new BadRequestException("E-mail address required");
    }

    String email = (String) additionalInfo.get("email");
    User user = userRepository.findByEmail(email);
    if (user == null) {
      throw new BadRequestException("User not found by email( " + email + " )");
    }

    String temporaryPassword = userService.createTemporaryPassword(user.getUsername());
    String encodedPassword = passwordEncoder.encode(temporaryPassword);
    user.setPassword(encodedPassword);
    StatLogger.generateTempPassword("Rest Password", user.getUsername(), temporaryPassword);

    user.setStatus(User.Status.INITIAL);
    user.setFailCnt(null);

    userRepository.saveAndFlush(user);

    boolean isAdmin = false;
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null) {
      isAdmin = true;
    }

    mailer.sendPasswordResetMail(user, temporaryPassword, isAdmin);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/users/password/validate", method = RequestMethod.POST)
  public ResponseEntity<?> validatePassword(@RequestBody User user) {

    if (StringUtils.isNotEmpty(user.getInitialPassword())) {
      User updatedUser = userRepository.findByUsername(user.getUsername());
      if (updatedUser == null) {
        throw new ResourceNotFoundException(user.getUsername());
      } else if (!passwordEncoder.matches(user.getInitialPassword(), updatedUser.getPassword())) {
        throw new UserException(UserErrorCodes.INITIAL_PASSWORD_NOT_MATCHED,
                "Fail to update password. It does not match the initial password.");
      }
    } else {
      userService.validatePassword(user.getUsername(), user.getPassword());
    }

    return ResponseEntity.ok(true);
  }

  /**
   * @param username
   * @param additionalInfo
   * @return
   */
  @RequestMapping(path = "/users/{username}/check/password", method = RequestMethod.POST)
  public ResponseEntity<?> checkPassword(@PathVariable("username") String username,
          @RequestBody Map<String, Object> additionalInfo) {

    if (!additionalInfo.containsKey("password")) {
      throw new BadRequestException("password required");
    }

    String password = (String) additionalInfo.get("password");
    User user = userRepository.findByUsername(username);
    if (user == null) {
      throw new ResourceNotFoundException(username);
    }

    Map<String, Boolean> matched = Maps.newHashMap();
    matched.put("matched", passwordEncoder.matches(password, user.getPassword()));

    return ResponseEntity.ok(matched);
  }

  /**
   * @param target
   * @param value
   * @return
   */
  @RequestMapping(path = "/users/{target}/{value}/duplicated", method = RequestMethod.GET)
  public ResponseEntity<?> checkDuplicatedValue(@PathVariable("target") String target,
          @PathVariable("value") String value) {

    UserService.DuplicatedTarget targetType = SearchParamValidator
            .enumUpperValue(UserService.DuplicatedTarget.class, target, "target");

    Map<String, Boolean> duplicated = Maps.newHashMap();
    duplicated.put("duplicated", userService.checkDuplicated(targetType, value));

    return ResponseEntity.ok(duplicated);

  }

  /**
   * 가입 승인
   */
  @Transactional
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/users/{username}/approved", method = RequestMethod.POST)
  public ResponseEntity<?> approvedJoinedUser(@PathVariable("username") String username) {
    User user = userRepository.findByUsername(username);
    if (user == null) {
      throw new ResourceNotFoundException(username);
    }

    user.setStatus(User.Status.ACTIVATED);

    // Add Organization
    List<String> orgCodes = null;
    if(StringUtils.isNotEmpty(user.getRequestOrgCodes())){
      orgCodes = GlobalObjectMapper.readListValue(user.getRequestOrgCodes(), String.class);
    }
    if(orgCodes == null || orgCodes.size() < 1) {
      orgCodes = Lists.newArrayList(DEFAULT_ORGANIZATION_CODE);
    }
    for(String orgCode : orgCodes){
      orgService.addMembers(Lists.newArrayList(orgCode), user.getUsername(), user.getFullName(), DirectoryProfile.Type.USER);
    }

    // 기본 그룹에 포함
    Group defaultGroup = groupService.getDefaultGroup(orgCodes.get(0));
    if (defaultGroup == null) {
      LOGGER.warn("Default group not found.");
    } else {
      defaultGroup.addGroupMember(new GroupMember(user.getUsername(), user.getFullName()));
    }

    // 워크스페이스 생성(등록된 워크스페이스가 없을 경우 생성)
    workspaceService.createWorkspaceByUserCreation(user, false);

    mailer.sendSignUpApprovedMail(user, false, null);

    return ResponseEntity.noContent().build();
  }

  /**
   * 가입 승인 반려
   */
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/users/{username}/rejected", method = RequestMethod.POST)
  public ResponseEntity<?> rejectedJoinedUser(@PathVariable("username") String username,
          @RequestBody Map<String, Object> additionalInfo) {
    User user = userRepository.findByUsername(username);
    if (user == null) {
      throw new ResourceNotFoundException(username);
    }

    user.setStatus(User.Status.REJECTED);
    user.setStatusMessage((String) additionalInfo.get("message"));

    userRepository.save(user);

    mailer.sendSignUpDeniedMail(user);

    return ResponseEntity.noContent().build();
  }

  /**
   * 사용자 상태 변경, 관리자(사용자 변경) 권한만 처리 가능
   */
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/users/{username}/status/{status}", method = RequestMethod.POST)
  public ResponseEntity<?> changeStatus(@PathVariable("username") String username,
          @PathVariable("status") String status) {

    User user = userRepository.findByUsername(username);
    if (user == null) {
      throw new ResourceNotFoundException(username);
    }

    User.Status reqStatus = SearchParamValidator
            .enumUpperValue(User.Status.class, status, "status");

    switch (reqStatus) {
      case ACTIVATED:
        if (user.getStatus() == User.Status.ACTIVATED) {
          throw new UserException("Already activated user.");
        }
        user.setFailCnt(null);
        user.setStatus(User.Status.ACTIVATED);
        break;
      case LOCKED:
        if (user.getStatus() == User.Status.LOCKED) {
          throw new RuntimeException("Already inactivated user.");
        }
        user.setStatus(User.Status.LOCKED);
        break;
      case DELETED:
        if (user.getStatus() == User.Status.DELETED) {
          throw new RuntimeException("Already deleted user.");
        }
        user.setStatus(User.Status.DELETED);

        // 캐시에 저장되어 있는 User 정보가 있다면 삭제
        cachedUserService.removeCachedUser(user.getUsername());
        break;
      default:
        throw new BadRequestException("Unsupported status. choose 'activate' or 'locked'");
    }

    userRepository.save(user);

    return ResponseEntity.noContent().build();
  }

}
