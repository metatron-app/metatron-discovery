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

package app.metatron.discovery.common.saml;

import org.springframework.security.saml.SAMLCredential;

import app.metatron.discovery.domain.user.User;

public class SAMLAzureUserMapper extends SAMLUserMapper{

  @Override
  public User createUser(SAMLCredential samlCredential) {
    User metatronUser = new User();
    if(samlCredential != null){
      metatronUser.setTel(getAttributeValue(samlCredential, "mobilePhone"));
      metatronUser.setFullName(getAttributeValue(samlCredential, "displayName"));
      metatronUser.setEmail(getAttributeValue(samlCredential, "email"));
    }
    return metatronUser;
  }
}
