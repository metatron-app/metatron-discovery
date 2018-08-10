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

package app.metatron.discovery.common.oauth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by kyungtaak on 2017. 6. 12..
 */
@Component
@ConfigurationProperties(prefix = "polaris.oauth2")
public class OauthProperties {

  String privateKey;

  String publicKey;

  List<Matcher> permitAll;

  public OauthProperties() {
  }

  public String getPrivateKey() {
    return privateKey;
  }

  public void setPrivateKey(String privateKey) {
    this.privateKey = privateKey;
  }

  public String getPublicKey() {
    return publicKey;
  }

  public void setPublicKey(String publicKey) {
    this.publicKey = publicKey;
  }

  public List<Matcher> getPermitAll() {
    return permitAll;
  }

  public void setPermitAll(List<Matcher> permitAll) {
    this.permitAll = permitAll;
  }

  public static class Matcher {
    HttpMethod method;
    String api;

    public Matcher() {
    }

    public HttpMethod getMethod() {
      return method;
    }

    public void setMethod(HttpMethod method) {
      this.method = method;
    }

    public String getApi() {
      return api;
    }

    public void setApi(String api) {
      this.api = api;
    }
  }
}
