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

import org.opensaml.saml2.core.AuthnStatement;
import org.opensaml.ws.message.encoder.MessageEncodingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.saml.SAMLCredential;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SAMLTokenConverter extends JwtAccessTokenConverter {
  private static final Logger LOGGER = LoggerFactory.getLogger(SAMLTokenConverter.class);

  @Override
  public OAuth2AccessToken enhance(OAuth2AccessToken accessToken, OAuth2Authentication authentication) {

    //SAMLCredential 정보를 Token에 추가
    if(accessToken instanceof DefaultOAuth2AccessToken){
      LOGGER.debug("accessToken : {}", accessToken);
      Authentication userAuthentication = authentication.getUserAuthentication();
      if(userAuthentication != null){
        if(userAuthentication.getCredentials() != null && userAuthentication.getCredentials() instanceof SAMLCredential){
          try{

            SAMLAuthenticationInfo samlAuthenticationInfo = new SAMLAuthenticationInfo(userAuthentication);
            SAMLCredential samlCredential = (SAMLCredential) userAuthentication.getCredentials();

            Map<String, Object> samlAdditionalMap = new HashMap<>();

            Map<String, Object> attributeMap = new HashMap<>();
            for(Map attrMap : samlAuthenticationInfo.getAttributes()){
              attributeMap.put((String) attrMap.get("name"), attrMap.get("value"));
            }
            samlAdditionalMap.put("attribute", attributeMap);

            Map<String, Object> credentialMap = new HashMap<>();
            credentialMap.put("remoteEntityID", samlCredential.getRemoteEntityID());
            credentialMap.put("localEntityID", samlCredential.getLocalEntityID());

            List<String> sessionIndexs = new ArrayList<>();
            for (AuthnStatement statement : samlCredential.getAuthenticationAssertion().getAuthnStatements()) {
              sessionIndexs.add(statement.getSessionIndex());
            }
            credentialMap.put("sessionIndexs", sessionIndexs);

            HashMap<String, String> nameIDMap = new HashMap<>();
            nameIDMap.put("Format", samlCredential.getNameID().getFormat());
            nameIDMap.put("NameQualifier", samlCredential.getNameID().getNameQualifier());
            nameIDMap.put("SPNameQualifier", samlCredential.getNameID().getSPNameQualifier());
            nameIDMap.put("SPProvidedID", samlCredential.getNameID().getSPProvidedID());
            nameIDMap.put("Value", samlCredential.getNameID().getValue());
            credentialMap.put("nameID", nameIDMap);

//            samlAdditionalMap.put("credential", credentialMap);

            ((DefaultOAuth2AccessToken) accessToken).setAdditionalInformation(samlAdditionalMap);
          } catch (MessageEncodingException e){
            e.printStackTrace();
          }
        }
      }
    }

    return super.enhance(accessToken, authentication);
  }
}
