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

package app.metatron.discovery.domain.workbook;

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

import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.comment.Comment;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

/**
 * Created by kyungtaak on 2016. 1. 30..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class WorkBookRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void createWorkBookInWorkspaceShouldReturnWorkspaceInfo() {

    String workspaceId = "ws-02";

    Object body = new WorkBookBuilder()
        .name("workbook-test")
        .workspace(workspaceId)
        .toJson(true)
        .build();

    System.out.println("Requst Body: " + body);

    // @formatter:off
    Response workBookRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(body)
    .when()
      .post("/api/books");

    workBookRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String workBookId = from(workBookRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/workbooks/{id}", workBookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_WORKSPACE_ADMIN"})
  @Sql("/sql/test_workbook.sql")
  public void getWorkBookDetailProjection() {

    String workbookId = "wb-001";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/workbooks/{id}", workbookId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_WORKSPACE_ADMIN"})
  @Sql("/sql/test_workbook.sql")
  public void getDashBoardListInWorkBook() {

    String workbookId = "wb-003";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
      .param("includeHidden", "false")
//      .param("datasources", "ds-test-01,ds-test-02")
//      .param("nameContains", "test1")
      .param("sort", "name,desc")
      .param("sort", "seq,desc")
      .param("sort", "modifiedTime,desc")
      .log().all()
    .when()
      .get("/api/workbooks/{id}/dashboards", workbookId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_WORKSPACE_ADMIN"})
  @Sql("/sql/test_workbook.sql")
  public void patchWorkBookProperties() {

    String workbookId = "wb-001";
    String patchName = "patched name";
    String patchDesc = "patched description";

    TestUtils.printTestTitle("Patch workbook!");

    Map<String, Object> body = Maps.newHashMap();
    body.put("name", patchName);
    body.put("description", patchDesc);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(body)
    .when()
      .patch("/api/workbooks/{id}", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/workbooks/{id}", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void deleteWorkBook() {

    String workbookId = "wb-001";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
    .when()
      .delete("/api/workbooks/{id}", workbookId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workbooks/{id}", workbookId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void managementWorkBookComments() {
    String workbookId = "wb-001";

    TestUtils.printTestTitle("1. Comment 등록");

    String createComment = "코멘트테스트";
    // @formatter:off
    Response response =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(new Comment(createComment))
      .log().all()
    .when()
      .post("/api/workbooks/{id}/comments", workbookId);
    response.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String commentUrl = response.getHeader("Location");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workbooks/{id}/comments", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Comment 수정");

    String updateComment = "코멘트 업데이트 테스트";
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(new Comment(updateComment))
      .log().all()
    .when()
      .patch(commentUrl)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get(commentUrl)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Comment 삭제 및 목록 조회");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
    .when()
      .delete(commentUrl)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workbooks/{id}/comments", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void patchDashBoardsInWorkBook() {

    String workbookId = "wb-001";

    TestUtils.printTestTitle("2. 실제 영향을 받는 변경범위만 수정 요청");

    CollectionPatch patch1 = new CollectionPatch();
    patch1.setOp(CollectionPatch.CollectionAction.REPLACE);
    patch1.add("id", "db-003");
    patch1.add("seq", 4);
    patch1.add("hiding", true);

    CollectionPatch patch2 = new CollectionPatch();
    patch2.setOp(CollectionPatch.CollectionAction.REPLACE);
    patch2.add("id", "db-004");
    patch2.add("seq", 3);
    patch2.add("hiding", true);

    List<CollectionPatch> collectionPatches = Lists.newArrayList(
      patch1, patch2
    );

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(collectionPatches)
      .log().all()
    .when()
      .patch("/api/workbooks/{workbookId}/dashboards", workbookId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. 수정 적용 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forDetailView")
    .when()
      .get("/api/workbooks/{id}", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void patchDashBoardSequenceInWorkBook() {

    String workbookId = "wb-001";

    TestUtils.printTestTitle("1. @OrderBy 어노테이션 적용 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forDetailView")
    .when()
      .get("/api/workbooks/{id}", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. 실제 영향을 받는 변경범위만 수정 요청");

    Map<String, Integer> reqMap = Maps.newHashMap();
    reqMap.put("db-004", 1);
    reqMap.put("db-002", 2);
    reqMap.put("db-003", 3);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqMap)
      .log().all()
    .when()
      .patch("/api/workbooks/{workbookId}/dashboards/seq", workbookId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. 수정 적용 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forDetailView")
    .when()
      .get("/api/workbooks/{id}", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

}
