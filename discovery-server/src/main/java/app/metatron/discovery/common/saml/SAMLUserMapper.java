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

import org.opensaml.saml2.core.Attribute;
import org.springframework.security.saml.SAMLCredential;

import java.util.Optional;

import app.metatron.discovery.domain.user.User;

public abstract class SAMLUserMapper {
  public abstract User createUser(SAMLCredential credential);

  public String getAttributeValue(SAMLCredential credential, String attributeName){
    String returnValue = null;
    if(credential != null && credential.getAttributes() != null){
      Optional<Attribute> foundAttribute = credential.getAttributes().stream()
              .filter(attribute -> attribute.getName().equals(attributeName))
              .findFirst();

      if(foundAttribute.isPresent()){
        returnValue = credential.getAttributeAsString(foundAttribute.get().getName());
      }
    }

    return returnValue;
  }
}
