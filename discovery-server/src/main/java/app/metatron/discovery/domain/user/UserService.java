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

import org.apache.commons.collections4.CollectionUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import javax.transaction.Transactional;

import app.metatron.discovery.domain.activities.ActivityStream;
import app.metatron.discovery.domain.activities.ActivityStreamService;
import app.metatron.discovery.domain.images.Image;
import app.metatron.discovery.domain.images.ImageRepository;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupMember;
import app.metatron.discovery.domain.user.group.GroupMemberRepository;
import app.metatron.discovery.domain.user.group.GroupRepository;
import app.metatron.discovery.domain.user.role.RoleRepository;

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
  public void setUserToGroups(User user, List<String> groupNames, boolean clear) {

    if(clear) {
      groupMemberRepository.deleteByMemberIds(Lists.newArrayList(user.getUsername()));
    }

    for (String groupName : groupNames) {
      Group group = groupRepository.findByName(groupName);
      if(group == null) {
        LOGGER.debug("Group({}) not found. skip!", groupName);
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
}
