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

import app.metatron.discovery.domain.activities.ActivityStream;
import app.metatron.discovery.domain.activities.ActivityStreamService;
import app.metatron.discovery.domain.images.Image;
import app.metatron.discovery.domain.images.ImageRepository;
import app.metatron.discovery.domain.revision.MetatronRevisionEntity;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupMember;
import app.metatron.discovery.domain.user.group.GroupMemberRepository;
import app.metatron.discovery.domain.user.group.GroupRepository;
import app.metatron.discovery.domain.user.role.RoleRepository;
import app.metatron.discovery.util.PolarisUtils;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.hibernate.envers.query.AuditQuery;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class UserService {

  private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);

  @Autowired
  UserRepository userRepository;

  @Autowired
  GroupRepository groupRepository;

  @Autowired
  GroupMemberRepository groupMemberRepository;

  @Autowired
  RoleRepository roleRepository;

  @Autowired
  ImageRepository imageRepository;

  @Autowired
  ActivityStreamService activityStreamService;

  @Autowired
  UserProperties userProperties;

  @Autowired
  EntityManager entityManager;

  @Autowired
  PasswordEncoder passwordEncoder;

  public boolean checkDuplicated(DuplicatedTarget target, String value) {
    Long count = 0L;
    switch (target) {
      case USERNAME:
        count = userRepository.countByUsername(value);
        break;
      case EMAIL:
        count = userRepository.countByEmail(value);
        break;
    }

    return (count > 0) ? true : false;
  }

  public void updateUserImage(String username) {

    List<Image> targetImages = imageRepository.findByDomainAndItemIdOrderByModifiedTimeDesc("user", username);
    if (CollectionUtils.isEmpty(targetImages)) {
      return;
    }

    if (targetImages.size() == 1) {
      targetImages.get(0).setEnabled(true);
      imageRepository.save(targetImages.get(0));
    } else {
      // 여러번 사진을 업로드한 경우
      for (int i = 0; i < targetImages.size(); i++) {
        if (i == 0) {
          targetImages.get(i).setEnabled(true);
          imageRepository.save(targetImages.get(i));
        } else {
          imageRepository.delete(targetImages.get(i));
        }
      }
    }
  }

  public void deleteUserImage(String username) {

    List<Image> targetImages = imageRepository.findByDomainAndItemIdOrderByModifiedTimeDesc("user", username);

    if (CollectionUtils.isEmpty(targetImages)) {
      return;
    }

    imageRepository.delete(targetImages);
  }

  @Transactional
  public void setUserToGroups(User user, List<String> groupNames) {

    //user's all group
    List<Group> groupList = groupRepository.findJoinedGroups(user.getUsername());
    List<String> groupNameList = groupList.stream().map(group -> group.getName()).collect(Collectors.toList());
    System.out.println("as-is groupNameList = " + groupNameList);

    //removed group name
    List<String> removedGroup = groupNameList.stream()
                                             .filter(beforeGroupName -> !groupNames.contains(beforeGroupName))
                                             .collect(Collectors.toList());
    System.out.println("removedGroup = " + removedGroup);

    //newly added group name
    List<String> addedGroup = groupNames.stream()
                                        .filter(newGroupName -> !groupNameList.contains(newGroupName))
                                        .collect(Collectors.toList());
    System.out.println("addedGroup = " + addedGroup);

//    if(clear) {
//      groupMemberRepository.deleteByMemberIds(Lists.newArrayList(user.getUsername()));
//    }

    for (String removedGroupName : removedGroup) {
      Group group = groupRepository.findByName(removedGroupName);
      if(group == null) {
        LOGGER.debug("Group({}) not found. skip!", removedGroupName);
        continue;
      }

      List<GroupMember> groupMembers = group.getMembers();
      if(groupMembers != null && !groupMembers.isEmpty()){
        GroupMember groupMember = groupMemberRepository.findByGroupAndMemberId(group, user.getUsername());
        if(groupMember != null){
          group.removeGroupMember(groupMember);
        }
      }
    }

    for (String addedGroupName : addedGroup) {
      Group group = groupRepository.findByName(addedGroupName);
      if(group == null) {
        LOGGER.debug("Group({}) not found. skip!", addedGroupName);
        continue;
      }

      group.addGroupMember(new GroupMember(user.getUsername(), user.getFullName()));
    }
  }

  public DateTime getLastAccessTime(String username){
    ActivityStream activityStream = activityStreamService.getLastAccessActivity(username);
    if(activityStream != null){
      return activityStream.getPublishedTime();
    }
    return null;
  }

  public enum DuplicatedTarget {
    USERNAME, EMAIL
  }

  public Boolean validateUserPassword(String username, User user){
    String password = user.getPassword();
    String confirmPassword = user.getConfirmPassword();

    if(StringUtils.isEmpty(password) || StringUtils.isEmpty(confirmPassword)){
      throw new UserException(UserErrorCodes.INVALID_PASSWORD_PARAMETER,
                              "User password parameter not valid ( " + user.getPassword() + "," + user.getConfirmPassword() + ")");
    }

    //password not matched
    if(!password.equals(confirmPassword)){
      throw new UserException(UserErrorCodes.PASSWORD_NOT_MATCHED, "Password not matched");
    }

    return validatePassword(username, password);
  }

  public Boolean validatePassword(String username, String password) {
    if(StringUtils.isEmpty(password)){
      throw new UserException(UserErrorCodes.INVALID_PASSWORD_PARAMETER,
                              "User password parameter not valid ( " + password + " )");
    }

    //check password strength
    String passwordStrengthExpr = userProperties.getPassword().getStrength().getPasswordRegExp();
    Pattern passwordStrengthPattern = Pattern.compile(passwordStrengthExpr);
    Matcher matcher = passwordStrengthPattern.matcher(password);
    Boolean strengthMatcher = matcher.matches();
    if(!strengthMatcher){
      throw new UserException(UserErrorCodes.INVALID_PASSWORD_STRENGTH, "Invalid password strength");
    }

    //similar with id
    if(password.contains(username)){
      throw new UserException(UserErrorCodes.PASSWORD_SIMILAR_ID, "Password contains username");
    }

    return true;
  }

  public Boolean getMatchedPreviousPassword(String username, String password){
    int countOfHistory = userProperties.getPassword().getCountOfHistory();
    if(countOfHistory > 0){
      //getting password change history
      List<Map<String, Object>> passwordChangeHistoryList = getUpdatedPasswordList(username, countOfHistory);
      for(Map<String, Object> historyMap : passwordChangeHistoryList){
        String prevPassword = historyMap.get("password").toString();
        if(passwordEncoder.matches(password, prevPassword)){
          throw new UserException(UserErrorCodes.PASSWORD_USED_PAST, "Password used in the past");
        }
      }
    }

    return false;
  }

  public DateTime getLastPasswordUpdatedDate(String username){
    AuditReader auditReader = AuditReaderFactory.get(entityManager);
    AuditQuery userAuditQuery = auditReader.createQuery()
                                               .forRevisionsOfEntityWithChanges(User.class, true)
                                               .add(AuditEntity.property("username").eq(username))
                                               .add(AuditEntity.property("password").hasChanged())
                                               .addOrder(AuditEntity.revisionNumber().desc())
                                               .setMaxResults(1);
    try{
      Object[] lastUpdatedUserRevision = (Object[]) userAuditQuery.getSingleResult();
      MetatronRevisionEntity revisionEntity = (MetatronRevisionEntity) lastUpdatedUserRevision[1];
      return new DateTime(revisionEntity.getRevisionDate());
    } catch (NoResultException e){
      LOGGER.debug("User({}) has no password change revision.", username);
    }

    User user = userRepository.findByUsername(username);

    if(user != null){
      return user.getModifiedTime();
    }

    return null;
  }

  public List<Map<String, Object>> getUpdatedPasswordList(String username, int limit){
    AuditReader auditReader = AuditReaderFactory.get(entityManager);
    AuditQuery userAuditQuery = auditReader.createQuery()
                                           .forRevisionsOfEntityWithChanges(User.class, true)
                                           .add(AuditEntity.property("username").eq(username))
                                           .add(AuditEntity.property("password").hasChanged())
                                           .addOrder(AuditEntity.revisionNumber().desc());
    if(limit > 0){
      userAuditQuery.setMaxResults(limit);
    }

    List<Object[]> userAuditList = userAuditQuery.getResultList();
    List historyList = new ArrayList();
    userAuditList.stream().forEach(objectArr -> {
      User userEntity = (User) objectArr[0];
      MetatronRevisionEntity revisionEntity = (MetatronRevisionEntity) objectArr[1];
      RevisionType revisionType = (RevisionType) objectArr[2];

      Map<String, Object> revisionMap = new HashMap<>();
      revisionMap.put("createdTime", revisionEntity.getRevisionDate());
      revisionMap.put("username", userEntity.getUsername());
      revisionMap.put("modifiedBy", revisionEntity.getUsername());
      revisionMap.put("password", userEntity.getPassword());
      revisionMap.put("revisionType", revisionType);
      revisionMap.put("revisionId", revisionEntity.getId());
      historyList.add(revisionMap);
    });
    return historyList;
  }

  public String createTemporaryPassword(String username) {
    int passwordLength = Math.max(0, userProperties.getPassword().getStrength().getMinLength());
    String temporaryPassword = PolarisUtils.createTemporaryPassword(passwordLength);
    while(true) {
      try {
        validatePassword(username, temporaryPassword);
        break;
      } catch (UserException e) {
        temporaryPassword = PolarisUtils.createTemporaryPassword(passwordLength);
      }
    }
    return temporaryPassword;
  }

  public Integer addFailCount(String username) {
    if (userProperties.getPassword().getLockCount() != null) {
      User user = userRepository.findByUsername(username);
      if (user != null) {
        user.setFailCnt(user.getFailCnt() + 1);
        userRepository.saveAndFlush(user);
        return user.getFailCnt();
      }
    }
    return null;
  }

  public void initFailCount(String username) {
    if (userProperties.getPassword().getLockCount() != null) {
      User user = userRepository.findByUsername(username);
      if (user != null) {
        user.setFailCnt(null);
        userRepository.saveAndFlush(user);
      }
    }
  }

}
