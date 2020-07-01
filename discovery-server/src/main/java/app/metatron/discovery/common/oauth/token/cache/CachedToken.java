/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.common.oauth.token.cache;

import java.io.Serializable;
import java.util.Date;

/**
 *
 */
public class CachedToken implements Serializable {
  public String username;
  public String clientId;
  public String userIp;

  public String accessToken;
  public String refreshToken;
  public Date expiration;

  public CachedToken() {
  }

  public CachedToken(String username, String clientId) {
    this.username = username;
    this.clientId = clientId;
  }

  public CachedToken(String username, String clientId, String userIp, String accessToken) {
    this.username = username;
    this.clientId = clientId;
    this.userIp = userIp;
    this.accessToken = accessToken;
  }

  public CachedToken(String username, String clientId, String userIp, String accessToken, String refreshToken, Date expiration) {
    this.username = username;
    this.clientId = clientId;
    this.userIp = userIp;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiration = expiration;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getClientId() {
    return clientId;
  }

  public void setClientId(String clientId) {
    this.clientId = clientId;
  }

  public String getUserIp() {
    return userIp;
  }

  public void setUserIp(String userIp) {
    this.userIp = userIp;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public void setAccessToken(String accessToken) {
    this.accessToken = accessToken;
  }

  public String getRefreshToken() {
    return refreshToken;
  }

  public void setRefreshToken(String refreshToken) {
    this.refreshToken = refreshToken;
  }

  public Date getExpiration() {
    return expiration;
  }

  public void setExpiration(Date expiration) {
    this.expiration = expiration;
  }
}
