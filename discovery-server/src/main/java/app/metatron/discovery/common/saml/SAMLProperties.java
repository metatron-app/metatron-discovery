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

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "polaris.saml")
public class SAMLProperties {
  List<SamlMetadata> idp;
  String entityId;
  List<String> idpName;
  String entityBaseUrl;
  boolean requestSigned;
  SamlContext samlContext;
  String userMapperClass;

  public List<SamlMetadata> getIdp() {
    return idp;
  }

  public void setIdp(List<SamlMetadata> idp) {
    this.idp = idp;
  }

  public List<String> getIdpName() {
    return idpName;
  }

  public void setIdpName(List<String> idpName) {
    this.idpName = idpName;
  }

  public String getEntityId() {
    return entityId;
  }

  public void setEntityId(String entityId) {
    this.entityId = entityId;
  }

  public String getEntityBaseUrl() {
    return entityBaseUrl;
  }

  public void setEntityBaseUrl(String entityBaseUrl) {
    this.entityBaseUrl = entityBaseUrl;
  }

  public boolean isRequestSigned() {
    return requestSigned;
  }

  public void setRequestSigned(boolean requestSigned) {
    this.requestSigned = requestSigned;
  }

  public SamlContext getSamlContext() {
    return samlContext;
  }

  public void setSamlContext(SamlContext samlContext) {
    this.samlContext = samlContext;
  }

  public String getUserMapperClass() {
    return userMapperClass;
  }

  public void setUserMapperClass(String userMapperClass) {
    this.userMapperClass = userMapperClass;
  }

  public static class SamlMetadata{
    String name;
    String type;
    String url;
    boolean metadataTrustCheck;
    boolean metadataRequireSignature;

    public SamlMetadata() {
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getType() {
      return type;
    }

    public void setType(String type) {
      this.type = type;
    }

    public String getUrl() {
      return url;
    }

    public boolean isMetadataTrustCheck() {
      return metadataTrustCheck;
    }

    public void setMetadataTrustCheck(boolean metadataTrustCheck) {
      this.metadataTrustCheck = metadataTrustCheck;
    }

    public boolean isMetadataRequireSignature() {
      return metadataRequireSignature;
    }

    public void setMetadataRequireSignature(boolean metadataRequireSignature) {
      this.metadataRequireSignature = metadataRequireSignature;
    }

    public void setUrl(String url) {
      this.url = url;
    }
    
    
  }

  public static class SamlContext{
    //https://docs.spring.io/autorepo/docs/spring-security-saml/1.0.x/reference/html/configuration-advanced.html
    String serverName;
    String scheme;
    int serverPort;
    boolean includeServerPortInRequestURL;
    String contextPath;

    public SamlContext() {
    }

    public String getServerName() {
      return serverName;
    }

    public void setServerName(String serverName) {
      this.serverName = serverName;
    }

    public String getScheme() {
      return scheme;
    }

    public void setScheme(String scheme) {
      this.scheme = scheme;
    }

    public int getServerPort() {
      return serverPort;
    }

    public void setServerPort(int serverPort) {
      this.serverPort = serverPort;
    }

    public boolean isIncludeServerPortInRequestURL() {
      return includeServerPortInRequestURL;
    }

    public void setIncludeServerPortInRequestURL(boolean includeServerPortInRequestURL) {
      this.includeServerPortInRequestURL = includeServerPortInRequestURL;
    }

    public String getContextPath() {
      return contextPath;
    }

    public void setContextPath(String contextPath) {
      this.contextPath = contextPath;
    }
  }
}
