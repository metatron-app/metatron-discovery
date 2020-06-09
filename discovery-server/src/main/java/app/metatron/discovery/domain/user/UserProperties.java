/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.user;

import org.apache.commons.lang3.BooleanUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Properties related with user
 */
@Component
@ConfigurationProperties(prefix = "polaris.user")
public class UserProperties {

  Boolean useOrganization;

  UserPasswordProperties password;

  public UserProperties() {
  }

  public Boolean getUseOrganization() {
    return BooleanUtils.isTrue(useOrganization);
  }

  public void setUseOrganization(Boolean useOrganization) {
    this.useOrganization = useOrganization;
  }

  public UserPasswordProperties getPassword() {
    if (password == null) {
      password = new UserPasswordProperties();
    }
    return password;
  }

  public void setPassword(UserPasswordProperties password) {
    this.password = password;
  }
}
