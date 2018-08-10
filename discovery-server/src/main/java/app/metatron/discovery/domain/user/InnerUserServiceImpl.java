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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.BeanIds;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import app.metatron.discovery.domain.user.role.RoleService;

/**
 * 사용자 정보 처리 서비스, Spring Security 에서 활용
 */
@Component(BeanIds.USER_DETAILS_SERVICE)
@Transactional(readOnly = true)
public class InnerUserServiceImpl implements UserDetailsService {

  private static final Logger LOGGER = LoggerFactory.getLogger(InnerUserServiceImpl.class);

  @Autowired
  UserRepository userRepository;

  @Autowired
  RoleService roleService;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

    User user = userRepository.findByUsername(username);

    if (user == null) {
      throw new UsernameNotFoundException(username + " not found.");
    }

    user.setRoleService(roleService);

    // 권한 정보 미리 로드
    user.getAuthorities();

    LOGGER.debug("Load User info. : " + user);

    return user;
  }

}
