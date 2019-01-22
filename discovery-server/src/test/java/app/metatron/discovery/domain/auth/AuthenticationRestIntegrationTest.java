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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.test.context.TestExecutionListeners;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.assertj.core.api.Assertions.assertThat;

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


  @Test
  public void authProxyUser() throws IOException {
    // given
    Response responseByAdminAuth =
        given()
            .queryParam("username", "admin")
            .queryParam("password", "admin")
            .queryParam("client_id", "polaris_trusted")
            .queryParam("client_secret", "secret")
            .queryParam("grant_type", "password")
            .queryParam("scope", "read write")
            .when().log().all()
            .post("/oauth/token");

    responseByAdminAuth.then().statusCode(HttpStatus.SC_OK).log().all();

    final String adminAuthToken = String.format("%s %s", responseByAdminAuth.getBody().jsonPath().getString("token_type"),
        responseByAdminAuth.getBody().jsonPath().getString("access_token"));

    // when
    Response response =
        given()
            .queryParam("username", "metatron")
            .header("Authorization", adminAuthToken)
            .when().log().all().get("/api/oauth/proxy-user");
    response.then().statusCode(HttpStatus.SC_OK).log().all();

    // then
    Map<String, Object> result = from(response.asString()).get();

    assertThat((String)result.get("access_token")).isNotEmpty();
    assertThat((String)result.get("token_type")).isEqualTo("bearer");
    assertThat((String)result.get("refresh_token")).isNotEmpty();
    assertThat((String)result.get("scope")).isEqualTo("read write");
    assertThat((String)result.get("jti")).isNotEmpty();

    Jwt jwt = JwtHelper.decode((String) result.get("access_token"));
    System.out.println(jwt.getClaims());
    HashMap<String,Object> jsonObject = new ObjectMapper().readValue(jwt.getClaims(), HashMap.class);
    assertThat((String)jsonObject.get("user_name")).isEqualTo("metatron");
    assertThat((List<String>)jsonObject.get("authorities"))
        .contains("PERM_SYSTEM_MANAGE_SHARED_WORKSPACE", "__SHARED_USER", "PERM_SYSTEM_VIEW_WORKSPACE", "PERM_SYSTEM_MANAGE_PRIVATE_WORKSPACE", "__PRIVATE_USER");
  }

  @Test
  public void authProxyUser_when_unsigned_user() throws IOException {
    // given
    Response responseByAdminAuth =
        given()
            .queryParam("username", "admin")
            .queryParam("password", "admin")
            .queryParam("client_id", "polaris_trusted")
            .queryParam("client_secret", "secret")
            .queryParam("grant_type", "password")
            .queryParam("scope", "read write")
        .when().log().all()
            .post("/oauth/token");

    responseByAdminAuth.then().statusCode(HttpStatus.SC_OK).log().all();

    final String adminAuthToken = String.format("%s %s", responseByAdminAuth.getBody().jsonPath().getString("token_type"),
        responseByAdminAuth.getBody().jsonPath().getString("access_token"));

    // when
    Response response =
        given()
            .queryParam("username", "ymyoo")
            .header("Authorization", adminAuthToken)
        .when().log().all().get("/api/oauth/proxy-user");
    response.then().statusCode(HttpStatus.SC_OK).log().all();

    // then
    Map<String, Object> result = from(response.asString()).get();

    assertThat((String)result.get("access_token")).isNotEmpty();
    assertThat((String)result.get("token_type")).isEqualTo("bearer");
    assertThat((String)result.get("refresh_token")).isNotEmpty();
    assertThat((String)result.get("scope")).isEqualTo("read write");
    assertThat((String)result.get("jti")).isNotEmpty();

    Jwt jwt = JwtHelper.decode((String) result.get("access_token"));
    System.out.println(jwt.getClaims());
    HashMap<String,Object> jsonObject = new ObjectMapper().readValue(jwt.getClaims(), HashMap.class);
    assertThat((String)jsonObject.get("user_name")).isEqualTo("ymyoo");
  }

}
