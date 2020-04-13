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

package app.metatron.discovery.domain.user;

import com.facebook.presto.jdbc.internal.guava.collect.Lists;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.io.File;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.hamcrest.Matchers.equalTo;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class UserPasswordRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void updatePasswordByUser() {

    String username = "polaris";

    /**
     * password update by user-self
     */
    TestUtils.printTestTitle("Password update valid case");
    Map<String, String> updateParam = Maps.newHashMap();
    updateParam.put("password", "metatron$$00");
    updateParam.put("confirmPassword", "metatron$$00");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(updateParam)
    .when()
      .patch("/api/users/{username}", username)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void updatePasswordByUserNotMatched() {

    String username = "polaris";

    TestUtils.printTestTitle("Password update not matched");
    Map<String, String> updateParam = Maps.newHashMap();
    updateParam.put("password", "metatron$$00");
    updateParam.put("confirmPassword", "polaris$$00");

    // @formatter:off
    Response resp1 = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .patch("/api/users/{username}", username)
        .then()
        .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
        .log().all()
        .extract().response();
    // @formatter:on

    String errorCode = from(resp1.asString()).get("code");
    System.out.println("errorCode = " + errorCode);
    Assert.assertEquals(errorCode, UserErrorCodes.PASSWORD_NOT_MATCHED.errorCode);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void updatePasswordByUserSimilarWithId() {

    String username = "polaris";

    TestUtils.printTestTitle("Password update not matched");
    Map<String, String> updateParam = Maps.newHashMap();
    updateParam.put("password", "polaris$$00");
    updateParam.put("confirmPassword", "polaris$$00");

    // @formatter:off
    Response resp1 = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .patch("/api/users/{username}", username)
        .then()
        .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
        .log().all()
        .extract().response();
    // @formatter:on

    String errorCode = from(resp1.asString()).get("code");
    System.out.println("errorCode = " + errorCode);
    Assert.assertEquals(errorCode, UserErrorCodes.PASSWORD_SIMILAR_ID.errorCode);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void updatePasswordByUserStrength() {

    String username = "polaris";

    TestUtils.printTestTitle("Password repeated 3");
    Map<String, String> updateParam = Maps.newHashMap();
    updateParam.put("password", "$$aaabbcc00");
    updateParam.put("confirmPassword", "$$aaabbcc00");

    // @formatter:off
    given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .patch("/api/users/{username}", username)
        .then()
        .statusCode(HttpStatus.SC_OK)
        .log().all()
        .extract().response();
    // @formatter:on

    TestUtils.printTestTitle("Password repeated 4 more");
    updateParam = Maps.newHashMap();
    updateParam.put("password", "$$aaaabbcc00");
    updateParam.put("confirmPassword", "$$aaaabbcc00");

    // @formatter:off
    given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .patch("/api/users/{username}", username)
        .then()
        .statusCode(HttpStatus.SC_OK)
        .log().all()
        .extract().response();
    // @formatter:on

    TestUtils.printTestTitle("Password repeated 5 more");
    updateParam = Maps.newHashMap();
    updateParam.put("password", "$$aaaaabbcc00");
    updateParam.put("confirmPassword", "$$aaaaabbcc00");

    // @formatter:off
    Response resp = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .patch("/api/users/{username}", username)
        .then()
        .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
        .log().all()
        .extract().response();
    // @formatter:on

    String errorCode = from(resp.asString()).get("code");
    System.out.println("errorCode = " + errorCode);
    Assert.assertEquals(errorCode, UserErrorCodes.INVALID_PASSWORD_STRENGTH.errorCode);

    TestUtils.printTestTitle("Password not contained char");
    updateParam = Maps.newHashMap();
    updateParam.put("password", "123456789!!");
    updateParam.put("confirmPassword", "123456789!!");

    // @formatter:off
    resp = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .patch("/api/users/{username}", username)
        .then()
        .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
        .log().all()
        .extract().response();
    // @formatter:on

    errorCode = from(resp.asString()).get("code");
    System.out.println("errorCode = " + errorCode);
    Assert.assertEquals(errorCode, UserErrorCodes.INVALID_PASSWORD_STRENGTH.errorCode);

    TestUtils.printTestTitle("Password not contained numeric");
    updateParam = Maps.newHashMap();
    updateParam.put("password", "abcdefghijk$$");
    updateParam.put("confirmPassword", "abcdefghijk$$");

    // @formatter:off
    resp = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .patch("/api/users/{username}", username)
        .then()
        .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
        .log().all()
        .extract().response();
    // @formatter:on

    errorCode = from(resp.asString()).get("code");
    System.out.println("errorCode = " + errorCode);
    Assert.assertEquals(errorCode, UserErrorCodes.INVALID_PASSWORD_STRENGTH.errorCode);

    TestUtils.printTestTitle("Password not contained special char");
    updateParam = Maps.newHashMap();
    updateParam.put("password", "abcdefghijk11");
    updateParam.put("confirmPassword", "abcdefghijk11");

    // @formatter:off
    resp = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .patch("/api/users/{username}", username)
        .then()
        .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
        .log().all()
        .extract().response();
    // @formatter:on

    errorCode = from(resp.asString()).get("code");
    System.out.println("errorCode = " + errorCode);
    Assert.assertEquals(errorCode, UserErrorCodes.INVALID_PASSWORD_STRENGTH.errorCode);
  }

  @Test
  public void signupUserValid() {
    Map<String, String> updateParam = Maps.newHashMap();
    updateParam.put("username", "testuser");
    updateParam.put("fullName", "TESTUSE");
    updateParam.put("password", "$$aaabbcc00");
    updateParam.put("confirmPassword", "$$aaabbcc00");

    // @formatter:off
    given()
      .contentType(ContentType.JSON)
      .body(updateParam)
    .when()
      .post("/api/users/signup")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on


  }

  @Test
  public void signupUserInvalid() {
    Map<String, String> updateParam = Maps.newHashMap();
    updateParam.put("username", "testuser22");
    updateParam.put("fullName", "TESTUSE22");
    updateParam.put("password", "aaabbcc00");
    updateParam.put("confirmPassword", "$$aaaaabbcc00");

    // @formatter:off
    Response resp =  given()
        .contentType(ContentType.JSON)
        .body(updateParam)
        .when()
        .post("/api/users/signup")
        .then()
        .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
        .log().all()
        .extract().response();
    // @formatter:on

    String errorCode = from(resp.asString()).get("code");
    System.out.println("errorCode = " + errorCode);
    Assert.assertEquals(errorCode, UserErrorCodes.PASSWORD_NOT_MATCHED.errorCode);
  }

}
