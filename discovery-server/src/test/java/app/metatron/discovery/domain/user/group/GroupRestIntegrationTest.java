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

package app.metatron.discovery.domain.user.group;

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

import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.user.role.Role;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class GroupRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql("/sql/test_group_list.sql")
  public void findGroups() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forListView")
//      .param("nameContains", "admin")
//      .param("searchDateBy", "created")
//      .param("from", "2017-09-10T00:00:00.0Z")
//      .param("to", "2017-09-15T00:00:00.0Z")
      .param("sort", "memberCount,desc")
//      .param("sort", "createdTime,desc")
      .log().all()
    .when()
      .get("/api/groups")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void createGroup() {

    Role role = new Role("test group");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(role)
    .when()
      .post("/api/groups")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql("/sql/test_group_list.sql")
  public void updateGroup() {

    String groupId = "group_test_01";
    String updateGroupName = "update test 01";

    Map<String, Object> reqUpdateMap = Maps.newHashMap();
    reqUpdateMap.put("name", updateGroupName);
    reqUpdateMap.put("description", "group description");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqUpdateMap)
    .when()
      .put("/api/groups/{groupId}", groupId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("name", equalTo(updateGroupName))
      .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql("/sql/test_group_list.sql")
  public void deleteGroup() {

    String groupId = "group_test_01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/groups/{groupId}", groupId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/groups/{groupId}", groupId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void checkDuplicatedGroupName() {

    String groupName = "test group";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/groups/name/{id}/duplicated", groupName)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("duplicated", is(false))
      .log().all();
    // @formatter:on

    Role role = new Role(groupName);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(role)
    .when()
      .post("/api/groups")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/groups/name/{id}/duplicated", groupName)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("duplicated", is(true))
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void createGroupWithContext() throws JsonProcessingException {

    TestUtils.printTestTitle("1. 최초 Group 생성시 Context 지정");

    Role createRole = new Role("group with Context");

    Map<String, String> contexts = com.google.common.collect.Maps.newHashMap();
    contexts.put("prop1", "value1");
    contexts.put("prop2", "value2");

    createRole.setContexts(GlobalObjectMapper.writeValueAsString(contexts));

    // @formatter:off
    Response workspaceRes =
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(createRole))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/groups");
    workspaceRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .body("name", is(createRole.getName()))
      .log().all();
    // @formatter:on

    String workspaceId = from(workspaceRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forGroupDetailView")
      .log().all()
    .when()
      .get("/api/groups/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Group 수정시 Context 수정");

    Role updateRole = new Role("group with Context - updated");

    Map<String, String> updateContexts = com.google.common.collect.Maps.newHashMap();
    updateContexts.put("prop1", "value1 - updated");
    updateContexts.put("prop3", "value3");

    updateRole.setContexts(GlobalObjectMapper.writeValueAsString(updateContexts));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(updateRole))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .patch("/api/groups/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("name", is(updateRole.getName()))
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forGroupDetailView")
      .log().all()
    .when()
      .get("/api/groups/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Context key/value 값을 통해 Domain(workspace) 값을 로드");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("key", "prop1")
//      .param("value", "value1 - updated")
      .param("domainProjection", "forGroupListView")
      .log().all()
    .when()
      .get("/api/contexts/domains/{domainType}", "group")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql("/sql/test_group_list.sql")
  public void findGroupMember() {

    String groupId = "group_test_01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
    .when()
      .get("/api/groups/{groupId}/members", groupId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all()
      .body("_embedded.members", hasSize(2));
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void addAndDeleteGroupMember() {

    // 테스트용 그룹 생성
    Role role = new Role("test group");

    // @formatter:off
    Response groupRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(role)
    .when()
      .post("/api/groups");
    groupRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String groupId = from(groupRes.asString()).get("id");

    // 그룹 구성원 2 명 추가
    Map<String, Object> memberAdd1Req1 = Maps.newHashMap();
    memberAdd1Req1.put("memberId", "metatron");
    memberAdd1Req1.put("op", "add");

    Map<String, Object> memberAdd2Req1 = Maps.newHashMap();
    memberAdd2Req1.put("memberId", "admin");
    memberAdd2Req1.put("op", "add");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(memberAdd1Req1, memberAdd2Req1))
      .log().all()
    .when()
      .patch("/api/groups/{groupId}/members", groupId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/groups/{groupId}/members", groupId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all()
      .body("_embedded.members", hasSize(2));
    // @formatter:on

    // 그룹 구성원 1 명 추가
    Map<String, Object> memberRemoveReq2 = Maps.newHashMap();
    memberRemoveReq2.put("memberId", "metatron");
    memberRemoveReq2.put("op", "remove");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(memberRemoveReq2))
    .when()
      .put("/api/groups/{groupId}/members", groupId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/groups/{groupId}/members", groupId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("_embedded.members", hasSize(1))
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_search_groups.sql")
  public void searchGroupByKeyword() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/admin/reindex")
    .then()
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
//      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .param("projection", "forGroupList")
      .param("sort", "modifiedTime,desc")
      .param("q", "테스트*")
      .param("page", 0)
      .param("size", 10)
    .when()
      .get("/api/groups/search/keyword")
    .then()
      .log().all();
    // @formatter:on
  }

}
