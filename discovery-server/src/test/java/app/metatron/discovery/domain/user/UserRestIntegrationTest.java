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
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.io.File;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.hamcrest.Matchers.equalTo;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class UserRestIntegrationTest extends AbstractRestIntegrationTest {

  // 개인이 확인 할 수 있는 이메일 주소 기재
  // test_user_list.sql 내 USER_EMAIL 란에도 수정 필요
  String testEmail = "kyungtaak@gmail.com";

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  /**
   * 사용자 목록 조회 테스트
   */
  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql("/sql/test_user_list.sql")
  public void getUserList() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
//      .param("level", "SYSTEM_ADMIN")
//      .param("status","requested,rejected")
//      .param("active",true)
//      .param("nameContains","user")
//      .param("searchDateBy", "created")
//      .param("from", "2017-09-10T00:00:00.0Z")
//      .param("to", "2017-09-15T00:00:00.0Z")
      .param("sort", "fullName,desc")
      .log().all()
    .when()
      .get("/api/users")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  /**
   * 사용자 상세 조회
   */
  @Test
//  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER"})
  @Sql("/sql/test_group_list.sql")
  public void getDetailUser() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/users/{username}", "polaris")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
//  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER"})
  public void duplicatedValue() {

    String username = "polaris1";

    // @formatter:off
    given()
//      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
    .when()
      .get("/api/users/username/{value}/duplicated", username)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("duplicated", equalTo(false))
      .log().all();
    // @formatter:on

    String email = "polaris@metatron.com";

    // @formatter:off
    given()
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
    .when()
      .get("/api/users/email/{value}/duplicated", email)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("duplicated", equalTo(true))
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER"})
  @Sql("/sql/test_mail_user.sql")
  public void resetPassword() {

    Map<String, Object> reqMap = Maps.newHashMap();
    reqMap.put("email" , testEmail);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqMap)
      .log().all()
    .when()
      .post("/api/users/password/reset")
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on
  }

  /**
   * 사용자 암호가일치하는 체크
   */
  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER"})
  public void checkUserPassword() {

    String username ="polaris";

    Map<String, Object> reqMap = Maps.newHashMap();
    reqMap.put("password" , "polaris1");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqMap)
    .when()
      .post("/api/users/{username}/check/password", username)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("matched", equalTo(false))
      .log().all();
    // @formatter:on
  }

  /**
   * 이미지 등록, 사용자 등록/수정, Thumbnail 가져오는 절차
   */
  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void createAndPatchUserAndImage() {

    /**
     * Upload image.
     */
    String username = "polaris";
    String domain = "user";
    File file = new File("./src/test/resources/images/cr7.jpg");

    // @formatter:off
    Response res =
    given()
      .accept(ContentType.JSON)
      .multiPart("file", file)
      .formParam("itemId", username)
      .formParam("domain", domain)
    .when()
      .post("/api/images/upload");

    res.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    String imgUrl = from(res.asString()).get("imageUrl");

    /**
     * 이미지 수정
     */
    Map<String, String> updateParam = Maps.newHashMap();
    updateParam.put("imageUrl", imgUrl);

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

    /**
     * 이미지 Thumbnail 로드
     */
    // @formatter:off
    Response imageResult =
    given()
      .accept("image/*")
      .param("url", imgUrl + "/thumbnail")
    .when()
      .get("/api/images/load/url");

    imageResult.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  /**
   * 관리자 사용자 등록/수정 절차
   */
  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql(value = "/sql/test_group_list.sql")
  public void createAndUpdateUserManually() {

    // 가입 신청
    //
    String username = "test";
    List<String> groupNames = Lists.newArrayList("group-admin-01", "group-super-01");

    Map<String, Object> reqMap = Maps.newHashMap();
    reqMap.put("username" , username);
    reqMap.put("password", "test");
    reqMap.put("email", testEmail);
    reqMap.put("groupNames", groupNames);
    reqMap.put("passMailer", true);

    // @formatter:off
    Response createdUserRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqMap)
    .when()
      .post("/api/users/manual");
    createdUserRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // 가입 수정
    Map<String, Object> reqUpdateMap = Maps.newHashMap();
    reqUpdateMap.put("password", "test2");
    reqUpdateMap.put("email", "test2@test1.test1");
    reqUpdateMap.put("groupNames", Lists.newArrayList("group-super-01", "group-user-01"));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(reqUpdateMap)
    .when()
      .put("/api/users/{username}/manual", username)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/users/{username}", username)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  /**
   * 관리자 사용자 등록시 RoleSet 지정
   */
  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql(value = "/sql/test_roleset.sql")
  public void createUserWithRoleSetManually() {

    // 가입 신청
    //
    String username = "test";

    Map<String, Object> reqMap = Maps.newHashMap();
    reqMap.put("username", username);
    reqMap.put("password", "test");
    reqMap.put("email", testEmail);
    reqMap.put("groupNames", Lists.newArrayList("SYSTEM_ADMIN", "SYSTEM_USER"));
    reqMap.put("roleSetName", "TEST_ROLE_SET");

    // @formatter:off
    Response createdUserRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqMap)
      .log().all()
    .when()
      .post("/api/users/manual");
    createdUserRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on
  }

  /**
   * 가입신청 및 승인 절차 테스트
   */
  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void createUserAndApprovedOrRejected() {

    // 가입 신청
    //
    String username = "testuser";
    User user = new User(username, "testuser");
    user.setFullName("TEST");
    user.setEmail(testEmail);

    // @formatter:off
    given()
      .contentType(ContentType.JSON)
      .body(user)
    .when()
      .post("/api/users/signup")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // 반려 or 승인 처리
    //

    Map<String, Object> req = Maps.newHashMap();
    req.put("message", "test message");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(req)
    .when()
      .post("/api/users/{username}/approved", username)
    .then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    // 사용자 정보 확인
    //
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/users/{username}", username)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  /**
   * 사용자 상태 변경 테스트
   */
  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void changeUserStatus() {

    // 비활성 처리
    //
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
    .when()
      .post("/api/users/{username}/status/{status}", "polaris", "locked")
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    // 사용자 정보 확인
    //
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/users/{username}", "polaris")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("status", equalTo("LOCKED"))
      .log().all();
    // @formatter:on

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchUserByKeyword() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .param("q", "a*")
    .when()
      .get("/api/users/search/keyword")
    .then()
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchUserByQuery() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
//      .param("sort", "name,desc")
      .param("q", "+((id:pol* OR name:pol*) AND status:ACTIVATED AND modifiedTime.ymd:[2017-01-02 TO 2017-04-30])")
      .param("sort", "modifiedTime,desc")
      .param("projection", "forListView")
    .when()
      .get("/api/users/search/query")
    .then()
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchRoleByKeyword() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .param("q", "*a*")
    .when()
      .get("/api/roles/search/keyword")
    .then()
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql("/sql/test_user_delete.sql")
  public void removeUserById() {

    // @formatter:off
    given()
        .auth().oauth2(oauth_token)
        .accept(ContentType.JSON)
        .contentType(ContentType.JSON)
    .when()
        .delete("/api/users/{username}", "al.lee")
    .then()
        .statusCode(HttpStatus.SC_NO_CONTENT);

    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/users/{username}", "al.lee")
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

}
