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

package app.metatron.discovery.domain.auth;

import java.io.Serializable;

public class OauthClientInformation implements Serializable {

  String redirectUri;

  String clientName;

  String faviconPath;

  String smallLogoFilePath;

  String smallLogoDesc;

  String logoFilePath;

  String backgroundFilePath;

  String autoApprove;

  String copyrightHtml;

  public String getRedirectUri() {
    return redirectUri;
  }

  public void setRedirectUri(String redirectUri) {
    this.redirectUri = redirectUri;
  }

  public String getClientName() {
    return clientName;
  }

  public void setClientName(String clientName) {
    this.clientName = clientName;
  }

  public String getFaviconPath() {
    return faviconPath;
  }

  public void setFaviconPath(String faviconPath) {
    this.faviconPath = faviconPath;
  }

  public String getSmallLogoFilePath() {
    return smallLogoFilePath;
  }

  public void setSmallLogoFilePath(String smallLogoFilePath) {
    this.smallLogoFilePath = smallLogoFilePath;
  }

  public String getSmallLogoDesc() {
    return smallLogoDesc;
  }

  public void setSmallLogoDesc(String smallLogoDesc) {
    this.smallLogoDesc = smallLogoDesc;
  }

  public String getLogoFilePath() {
    return logoFilePath;
  }

  public void setLogoFilePath(String logoFilePath) {
    this.logoFilePath = logoFilePath;
  }

  public String getBackgroundFilePath() {
    return backgroundFilePath;
  }

  public void setBackgroundFilePath(String backgroundFilePath) {
    this.backgroundFilePath = backgroundFilePath;
  }

  public String getAutoApprove() {
    return autoApprove;
  }

  public void setAutoApprove(String autoApprove) {
    this.autoApprove = autoApprove;
  }

  public String getCopyrightHtml() {
    return copyrightHtml;
  }

  public void setCopyrightHtml(String copyrightHtml) {
    this.copyrightHtml = copyrightHtml;
  }

}
