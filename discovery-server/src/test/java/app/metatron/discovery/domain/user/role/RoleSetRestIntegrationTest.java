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
import com.google.common.collect.Maps;

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
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceBuilder;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.hamcrest.Matchers.is;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class RoleSetRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql(value = "/sql/test_roleset.sql")
  public void findRoleSetList() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forListView")
      .param("scope", "private")
//      .param("nameContains","test")
//      .param("searchDateBy", "created")
//      .param("from", "2017-09-10T00:00:00.0Z")
//      .param("to", "2017-09-15T00:00:00.0Z")
      .param("sort", "name,desc")
      .log().all()
    .when()
      .get("/api/rolesets")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql(value = "/sql/test_roleset.sql")
  public void findWorkspacesOnRoleSet() {

    String roleSetId = "TEST_ROLE_SET";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forSimpleListView")
//      .param("nameContains","test")
//      .param("searchDateBy", "created")
//      .param("from", "2017-09-10T00:00:00.0Z")
//      .param("to", "2017-09-15T00:00:00.0Z")
//      .param("sort", "name,desc")
      .log().all()
    .when()
      .get("/api/rolesets/{id}/workspaces", roleSetId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql(value = "/sql/test_roleset.sql")
  public void findRoleSetDetail() {

    String roleSetsId = "TEST_CUSTOM_ROLE_SET";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forDetailView")
      .log().all()
    .when()
      .get("/api/rolesets/{id}", roleSetsId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }


  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void crudRoleSet() {

    TestUtils.printTestTitle("1. RoleSet 생성");

    Role role1 = new Role("role1", "PERM_WORKSPACE_MANAGE_WORKSPACE",
                          "PERM_WORKSPACE_MANAGE_FOLDER",
                          "PERM_WORKSPACE_VIEW_WORKBOOK",
                          "PERM_WORKSPACE_EDIT_WORKBOOK",
                          "PERM_WORKSPACE_MANAGE_WORKBOOK",
                          "PERM_WORKSPACE_VIEW_NOTEBOOK",
                          "PERM_WORKSPACE_EDIT_NOTEBOOK",
                          "PERM_WORKSPACE_MANAGE_NOTEBOOK",
                          "PERM_WORKSPACE_VIEW_WORKBENCH",
                          "PERM_WORKSPACE_EDIT_WORKBENCH",
                          "PERM_WORKSPACE_MANAGE_WORKBENCH");

    Role role2 = new Role("role2",
                          "PERM_WORKSPACE_VIEW_WORKBOOK",
                          "PERM_WORKSPACE_EDIT_WORKBOOK",
                          "PERM_WORKSPACE_MANAGE_WORKBOOK",
                          "PERM_WORKSPACE_VIEW_NOTEBOOK",
                          "PERM_WORKSPACE_EDIT_NOTEBOOK",
                          "PERM_WORKSPACE_MANAGE_NOTEBOOK",
                          "PERM_WORKSPACE_VIEW_WORKBENCH",
                          "PERM_WORKSPACE_EDIT_WORKBENCH",
                          "PERM_WORKSPACE_MANAGE_WORKBENCH");
    role2.setDefaultRole(true);

    Role role3 = new Role("role3",
                          "PERM_WORKSPACE_VIEW_WORKBOOK",
                          "PERM_WORKSPACE_VIEW_NOTEBOOK",
                          "PERM_WORKSPACE_VIEW_WORKBENCH");

    RoleSet roleSet = new RoleSet();
    roleSet.setName("role set name");
    roleSet.setDescription("role set desc");
    roleSet.setScope(RoleSet.RoleSetScope.PUBLIC);
    roleSet.setRoles(Lists.newArrayList(role1, role2, role3));

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(roleSet)
      .log().all()
    .when()
      .post("/api/rolesets");

    res.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. RoleSet 생성 확인");

    String roleSetId = from(res.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forDetailView")
      .log().all()
    .when()
      .get("/api/rolesets/{id}", roleSetId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. RoleSet 수정");

    RoleSet updateRoleSet = new RoleSet();
    updateRoleSet.setName("role set name!!!");
    updateRoleSet.setDescription("role set desc!!!");
    updateRoleSet.setScope(RoleSet.RoleSetScope.PUBLIC);
    updateRoleSet.setRoles(Lists.newArrayList(role2, role3));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(updateRoleSet)
      .log().all()
    .when()
      .put("/api/rolesets/{id}", roleSetId)
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
      .get("/api/rolesets/{id}", roleSetId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("5. RoleSet 삭제");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(updateRoleSet)
      .log().all()
    .when()
      .delete("/api/rolesets/{id}", roleSetId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("6. RoleSet 삭제 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forDetailView")
      .log().all()
    .when()
      .get("/api/rolesets/{id}", roleSetId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void copyRoleSet() {

    TestUtils.printTestTitle("1. RoleSet 생성");

    Role role1 = new Role("role1", "PERM_WORKSPACE_MANAGE_WORKSPACE",
                          "PERM_WORKSPACE_MANAGE_FOLDER",
                          "PERM_WORKSPACE_VIEW_WORKBOOK",
                          "PERM_WORKSPACE_EDIT_WORKBOOK",
                          "PERM_WORKSPACE_MANAGE_WORKBOOK",
                          "PERM_WORKSPACE_VIEW_NOTEBOOK",
                          "PERM_WORKSPACE_EDIT_NOTEBOOK",
                          "PERM_WORKSPACE_MANAGE_NOTEBOOK",
                          "PERM_WORKSPACE_VIEW_WORKBENCH",
                          "PERM_WORKSPACE_EDIT_WORKBENCH",
                          "PERM_WORKSPACE_MANAGE_WORKBENCH");

    Role role2 = new Role("role2",
                          "PERM_WORKSPACE_VIEW_WORKBOOK",
                          "PERM_WORKSPACE_EDIT_WORKBOOK",
                          "PERM_WORKSPACE_MANAGE_WORKBOOK",
                          "PERM_WORKSPACE_VIEW_NOTEBOOK",
                          "PERM_WORKSPACE_EDIT_NOTEBOOK",
                          "PERM_WORKSPACE_MANAGE_NOTEBOOK",
                          "PERM_WORKSPACE_VIEW_WORKBENCH",
                          "PERM_WORKSPACE_EDIT_WORKBENCH",
                          "PERM_WORKSPACE_MANAGE_WORKBENCH");
    role2.setDefaultRole(true);

    Role role3 = new Role("role3",
                          "PERM_WORKSPACE_VIEW_WORKBOOK",
                          "PERM_WORKSPACE_VIEW_NOTEBOOK",
                          "PERM_WORKSPACE_VIEW_WORKBENCH");

    RoleSet roleSet = new RoleSet();
    roleSet.setName("role set name");
    roleSet.setDescription("role set desc");
    roleSet.setScope(RoleSet.RoleSetScope.PUBLIC);
    roleSet.setRoles(Lists.newArrayList(role1, role2, role3));

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(roleSet)
      .log().all()
    .when()
      .post("/api/rolesets");

    res.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. RoleSet 생성 확인");

    String roleSetId = from(res.asString()).get("id");

    // @formatter:off
    Response copiedRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(roleSet)
      .log().all()
    .when()
      .post("/api/rolesets/{id}/copy", roleSetId);

    copiedRes.then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. RoleSet 생성 확인");

    String copiedRoleSetId = from(copiedRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forDetailView")
      .log().all()
    .when()
      .get("/api/rolesets/{id}", copiedRoleSetId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  public void updateRoleSetWithGroupMember() {

    TestUtils.printTestTitle("1. RoleSet 생성");

    Role role1 = new Role("role1", "PERM_WORKSPACE_MANAGE_WORKSPACE",
                          "PERM_WORKSPACE_MANAGE_FOLDER");

    Role role2 = new Role("role2",
                          "PERM_WORKSPACE_MANAGE_WORKBOOK",
                          "PERM_WORKSPACE_MANAGE_NOTEBOOK",
                          "PERM_WORKSPACE_MANAGE_WORKBENCH");
    role2.setDefaultRole(true);

    Role role3 = new Role("role3",
                          "PERM_WORKSPACE_VIEW_WORKBOOK",
                          "PERM_WORKSPACE_VIEW_NOTEBOOK",
                          "PERM_WORKSPACE_VIEW_WORKBENCH");

    RoleSet roleSet = new RoleSet();
    roleSet.setName("role set name");
    roleSet.setDescription("role set desc");
    roleSet.setScope(RoleSet.RoleSetScope.PUBLIC);
    roleSet.setRoles(Lists.newArrayList(role1, role2, role3));

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(roleSet)
      .log().all()
    .when()
      .post("/api/rolesets");

    res.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String roleSetId = from(res.asString()).get("id");

    TestUtils.printTestTitle("2. 공유 Workspace 생성");

    Workspace testWorkspace1 = new WorkspaceBuilder()
        .name("workspace1")
        .description("workspace1 desc")
        .publicType(Workspace.PublicType.SHARED)
        .build();

    // @formatter:off
    Response workspaceRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(testWorkspace1)
      .log().all()
    .when()
      .post("/api/workspaces");
    workspaceRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .body("name", is(testWorkspace1.getName()))
      .log().all();
    // @formatter:on

    String workspaceId = from(workspaceRes.asString()).get("id");

    TestUtils.printTestTitle("3. 생성한 RoleSet 연결");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body("/api/workspaces/" + workspaceId)
      .contentType("text/uri-list")
    .when()
      .patch("/api/rolesets/{roleSetId}/workspaces", roleSetId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("4. Workspace member 추가");

    Map<String, Object> targetMap1 = Maps.newHashMap();
    targetMap1.put("op", "add");
    targetMap1.put("memberId", "metatron");
    targetMap1.put("memberType", "USER");
    targetMap1.put("role", "role1");

    Map<String, Object> targetMap2 = Maps.newHashMap();
    targetMap2.put("op", "add");
    targetMap2.put("memberId", "admin");
    targetMap2.put("memberType", "USER");
    targetMap2.put("role", "role2");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(Lists.newArrayList(targetMap1, targetMap2))
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .log().all()
    .when()
      .put("/api/workspaces/{id}/members", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("5. RoleSet 수정");

    Role role4 = new Role("role_update", "PERM_WORKSPACE_MANAGE_WORKSPACE",
                          "PERM_WORKSPACE_MANAGE_FOLDER");

    Role role5 = new Role("role5", "PERM_WORKSPACE_MANAGE_WORKSPACE",
                          "PERM_WORKSPACE_MANAGE_FOLDER");

    role5.setDefaultRole(true);
    role2.setDefaultRole(null);


    Map<String, String> mapper = Maps.newHashMap();
    mapper.put("role1", "role_update");
    mapper.put("role2", "");

    RoleSet updateRoleSet = new RoleSet();
    updateRoleSet.setName("role set name!!!");
    updateRoleSet.setDescription("role set desc!!!");
    updateRoleSet.setScope(RoleSet.RoleSetScope.PUBLIC);
    updateRoleSet.setRoles(Lists.newArrayList(role4, role2, role5));
    updateRoleSet.setMapper(mapper);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(updateRoleSet)
      .log().all()
    .when()
      .put("/api/rolesets/{id}", roleSetId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("6. RoleSet 수정 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection","forDetailView")
      .log().all()
    .when()
      .get("/api/rolesets/{id}", roleSetId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("7. Member 확인");
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{id}/members", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

}
