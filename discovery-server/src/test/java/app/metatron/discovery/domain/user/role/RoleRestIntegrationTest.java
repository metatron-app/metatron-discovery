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

package app.metatron.discovery.domain.user.role;

import com.google.common.collect.Lists;

import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class RoleRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void findRoleList() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forListView")
      .param("scope", "GLOBAL")
//      .param("sort", "name,desc")
      .log().all()
    .when()
      .get("/api/roles")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void findRoleDetail() {

    String roleId = "ROLE_SYSTEM_PRIVATE_USER";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forDetailView")
      .log().all()
    .when()
      .get("/api/roles/{id}", roleId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }


  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void crudRole() {

    TestUtils.printTestTitle("1. Role 생성");

    Role role1 = new Role("role", "PERM_SYSTEM_MANAGE_USER",
                          "PERM_SYSTEM_MANAGE_SYSTEM",
                          "PERM_SYSTEM_MANAGE_DATASOURCE");
    role1.setScope(Role.RoleScope.GLOBAL);

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(role1)
      .log().all()
    .when()
      .post("/api/roles");

    res.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. RoleSet 생성 확인");

    String roleId = from(res.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","withPermission")
      .log().all()
    .when()
      .get("/api/roles/{id}", roleId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. RoleSet 수정");

    Role updateRole = new Role("updated role", "PERM_SYSTEM_MANAGE_USER",
                                  "PERM_SYSTEM_MANAGE_DATASOURCE",
                                  "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE");
    updateRole.setScope(Role.RoleScope.GLOBAL);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(updateRole)
      .log().all()
    .when()
      .put("/api/roles/{id}", roleId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("4. RoleSet 수정 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forDetailView")
      .log().all()
    .when()
      .get("/api/roles/{id}", roleId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("5. Role 삭제");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .delete("/api/roles/{id}", roleId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("6. RoleSet 삭제 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/roles/{id}", roleId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER"})
  public void getRoleByName() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("name", "TEST_GROUP")
    .when()
      .get("/api/roles/search/names")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql("/sql/test_group_list.sql")
  public void addAndDeleteRoleDirectory() {

    String dirGroupId = "group_test_02";
    String dirUserName1 = "metatron";
    String dirUserName2 = "polaris";

    TestUtils.printTestTitle("1. Create Role");

    Role role = new Role("test roles");

    // @formatter:off
    Response roleRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(role)
    .when()
      .post("/api/roles");
    roleRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String roleId = from(roleRes.asString()).get("id");

    TestUtils.printTestTitle("2. Add Role Directories");

    Map<String, Object> dirAdd1Req1 = Maps.newHashMap();
    dirAdd1Req1.put("directoryId", dirUserName1);
    dirAdd1Req1.put("type", "USER");
    dirAdd1Req1.put("op", "add");

    Map<String, Object> dirAdd2Req1 = Maps.newHashMap();
    dirAdd2Req1.put("directoryId", dirGroupId);
    dirAdd2Req1.put("type", "GROUP");
    dirAdd2Req1.put("op", "add");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(dirAdd1Req1, dirAdd2Req1))
      .log().all()
    .when()
      .patch("/api/roles/{roleId}/directories", roleId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/roles/{roleId}/directories", roleId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Edit Role Directories");

    // 그룹 구성원 1 명 삭제
    Map<String, Object> dirRemoveReq2 = Maps.newHashMap();
    dirRemoveReq2.put("directoryId", dirGroupId);
    dirRemoveReq2.put("type", "GROUP");
    dirRemoveReq2.put("op", "remove");

    Map<String, Object> dirAddReq2 = Maps.newHashMap();
    dirAddReq2.put("directoryId", dirUserName2);
    dirAddReq2.put("type", "USER");
    dirAddReq2.put("op", "add");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(dirRemoveReq2, dirAddReq2))
      .log().all()
    .when()
      .put("/api/roles/{roleId}/directories", roleId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/roles/{roleId}", roleId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

}
