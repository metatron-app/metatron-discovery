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

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.common.Mailer;
import app.metatron.discovery.domain.images.Image;
import app.metatron.discovery.domain.images.ImageRepository;
import app.metatron.discovery.domain.user.group.GroupService;
import app.metatron.discovery.domain.user.org.OrganizationService;
import app.metatron.discovery.domain.workspace.WorkspaceService;
import app.metatron.discovery.util.AuthUtils;

/**
 * Created by kyungtaak on 2016. 5. 14..
 */
@RepositoryEventHandler(User.class)
public class UserEventHandler {

  @Autowired
  GroupService groupService;

  @Autowired
  OrganizationService orgService;

  @Autowired
  WorkspaceService workspaceService;

  @Autowired
  UserRepository userRepository;

  @Autowired
  ImageRepository imageRepository;

  @Autowired
  Mailer mailer;

  @Autowired
  UserProperties userProperties;

  @HandleBeforeCreate
  public void checkCreateAuthorityAndImage(User user) {

    if (userRepository.countByUsername(user.getUsername()) > 0) {
      throw new UserException("duplicate user");
    }

    // Set to request status when registering the first user
    user.setStatus(User.Status.REQUESTED);

    // Processing the user image
    if (StringUtils.isNotEmpty(user.getImageUrl())) {
      updateImages(user.getUsername());
    }

    // Add Organization
    String orgCode = CommonLocalVariable.getLocalVariable().getTenantAuthority().getOrgCode();
    orgService.addMembers(Lists.newArrayList(orgCode), user.getUsername(), user.getFullName(), DirectoryProfile.Type.USER);
  }

  @HandleBeforeSave
  @PreAuthorize("(authentication.name == #user.id) " +
          "or hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  public void checkUpdateAuthorityAndImage(User user) {
    // 이미지 처리
    if(StringUtils.isNotEmpty(user.getImageUrl())) {
      updateImages(user.getId());
    }
  }

  @HandleAfterSave
  @PreAuthorize("(authentication.name == #user.id) ")
  public void checkUpdateImage(User user) {
    //사용자 이미지 수정시 user 정보 갱신
    AuthUtils.refreshAuth(user);
  }

  @HandleBeforeDelete
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  public void checkDeleteAuthority(User user) {
  }

  private void updateImages(String id) {
    List<Image> targetImages = imageRepository.findByDomainAndItemIdOrderByModifiedTimeDesc("user", id);
    if(CollectionUtils.isEmpty(targetImages)) {
      return;
    }

    if(targetImages.size() == 1) {
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

}
