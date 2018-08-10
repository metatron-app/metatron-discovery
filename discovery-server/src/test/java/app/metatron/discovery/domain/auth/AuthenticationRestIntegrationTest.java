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

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;

/**
 * Created by kyungtaak on 2017. 7. 4..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class AuthenticationRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void getPermissions() {
    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/auth/system/permissions");

    createResponse.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void checkPermissions() {
    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("permissions", "PERM_SYSTEM_WRITE_DATASOURCE,PERM_TEST")
    .when()
      .get("/api/auth/system/permissions/check");

    createResponse.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

}
