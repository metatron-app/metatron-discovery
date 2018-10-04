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

package app.metatron.discovery.domain.workspace;

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
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

/**
 *
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class BookRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
  public void createWorkBookInWorkspaceShouldReturnWorkspaceInfo() {

    String workspaceId = "ws-02";

    // Folder 신규 생성
    Map<String, Object> folder1Req = Maps.newHashMap();
    folder1Req.put("type", "folder");
    folder1Req.put("name", "folder1_test");
    folder1Req.put("description", "folder_descriptions");
    folder1Req.put("workspace", "/api/workspaces/" + workspaceId);
    // @formatter:off
    Response folder1Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder1Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder1Id = from(folder1Res.asString()).get("id");

    folder1Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성
    Map<String, Object> folder2Req = Maps.newHashMap();
    folder2Req.put("type", "folder");
    folder2Req.put("name", "folder2_test");
    folder2Req.put("description", "folder_descriptions");
    folder2Req.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    Response folder2Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder2Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder2Id = from(folder2Res.asString()).get("id");

    folder2Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on



    // WorkBook 신규 생성
    Map<String, Object> workbookReq = Maps.newHashMap();
    workbookReq.put("type", "workbook");
    workbookReq.put("name", "workbook-test");
    workbookReq.put("workspace", "/api/workspaces/" + workspaceId);
    workbookReq.put("folderId", folder1Id);

    // @formatter:off
    Response workbookRes =
    given()
      .auth().oauth2(oauth_token)
      .body(workbookReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books");

    String workbookId = from(workbookRes.asString()).get("id");

    workbookRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Notebook 신규 생성
    Map<String, Object> notebookReq = Maps.newHashMap();
    notebookReq.put("type", "notebook");
    notebookReq.put("name", "notebook_test");
    notebookReq.put("refId", "ref0000001");
    notebookReq.put("connector", "/api/connectors/" + "notebook-zeppelin-01");
    notebookReq.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(notebookReq)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
    .when()
      .post("/api/books")
    .then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    //
    // 이동 확인

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/books/{bookId}/move/{folderId}", workbookId, folder2Id)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NO_CONTENT);
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "withSubBooks")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{workspace_id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on



    //
    // 삭제확인

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(notebookReq)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/books/" + folder2Id)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forListView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{workspace_id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
  public void moveToRootFolder() {

    String workspaceId = "ws-02";

    // Folder 신규 생성
    Map<String, Object> folder1Req = Maps.newHashMap();
    folder1Req.put("type", "folder");
    folder1Req.put("name", "folder1_test");
    folder1Req.put("description", "folder_descriptions");
    folder1Req.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    Response folder1Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder1Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder1Id = from(folder1Res.asString()).get("id");

    folder1Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성
    Map<String, Object> folder2Req = Maps.newHashMap();
    folder2Req.put("type", "folder");
    folder2Req.put("name", "folder2_test");
    folder2Req.put("description", "folder_descriptions");
    folder2Req.put("folderId", folder1Id);
    folder2Req.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    Response folder2Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder2Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder2Id = from(folder2Res.asString()).get("id");

    folder2Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성
    Map<String, Object> folder3Req = Maps.newHashMap();
    folder3Req.put("type", "folder");
    folder3Req.put("name", "folder3_test");
    folder3Req.put("description", "folder_descriptions");
    folder3Req.put("folderId", folder2Id);
    folder3Req.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    Response folder3Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder3Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder3Id = from(folder3Res.asString()).get("id");

    folder3Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // WorkBook 신규 생성
    Map<String, Object> workbookReq = Maps.newHashMap();
    workbookReq.put("type", "workbook");
    workbookReq.put("name", "workbook-test");
    workbookReq.put("workspace", "/api/workspaces/" + workspaceId);
    workbookReq.put("folderId", folder3Id);

    // @formatter:off
    Response workbookRes =
    given()
      .auth().oauth2(oauth_token)
      .body(workbookReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books");

    String workbookId = from(workbookRes.asString()).get("id");

    workbookRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    //
    // 이동 확인

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books/{bookId}/move", workbookId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forTreeView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{workspace_id}", workspaceId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    //
    // folder 하위

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forListView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/books/{folderId}", folder2Id)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  @Sql("/sql/test_workbook.sql")
  public void moveBookToFolder() {

    String orginalBookIds = "wb-001,wb-002";
    String folderId = "wb-folder-001";

    // @formatter:off
    Response response =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books/{bookId}/move/{folderId}", orginalBookIds, folderId);
    response
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
    .when()
      .get("/api/books/{id}", folderId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  @Sql("/sql/test_workbook.sql")
  public void moveBookToWorkspace() {

    String orginalBookId = "wb-001";
    String workspaceId = "ws-03";

    // @formatter:off
    Response response =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .queryParam("toWorkspace", workspaceId)
    .when()
      .post("/api/books/{bookId}/move", orginalBookId);
    response
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
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  @Sql("/sql/test_workbook.sql")
  public void copyBook() {

    String orginalBookId = "wb-001";

    // @formatter:off
    Response response =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books/{bookId}/copy", orginalBookId);
    response
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    String id = from(response.asString()).get("id");


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/books/{id}", id)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forDetailView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{workspace_id}", "ws-02")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  @Sql("/sql/test_workbook.sql")
  public void copyBookToWorkspace() {

    String orginalBookId = "wb-001";
    String toWorkspace = "ws-00";

    // @formatter:off
    Response response =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .queryParam("toWorkspace", toWorkspace)
      .log().all()
    .when()
      .post("/api/books/{bookId}/copy", orginalBookId);
    response
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    String id = from(response.asString()).get("id");


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/books/{id}", id)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forDetailView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{workspace_id}", toWorkspace)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
  public void showBookInSubFolder() {

    String workspaceId = "ws-02";

    // Folder 신규 생성 1
    Map<String, Object> folder1Req = Maps.newHashMap();
    folder1Req.put("type", "folder");
    folder1Req.put("name", "folder1_test");
    folder1Req.put("description", "folder_descriptions");
    folder1Req.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    Response folder1Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder1Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    folder1Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String folder1Id = from(folder1Res.asString()).get("id");

    // Folder 신규 생성 2
    Map<String, Object> folder2Req = Maps.newHashMap();
    folder2Req.put("type", "folder");
    folder2Req.put("name", "folder2_test");
    folder2Req.put("description", "folder_descriptions");
    folder2Req.put("workspace", "/api/workspaces/" + workspaceId);
    folder2Req.put("folderId", folder1Id);

    // @formatter:off
    Response folder2Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder2Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder2Id = from(folder2Res.asString()).get("id");

    folder2Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // WorkBook 신규 생성
    Map<String, Object> workbookReq = Maps.newHashMap();
    workbookReq.put("type", "workbook");
    workbookReq.put("name", "workbook-test");
    workbookReq.put("workspace", "/api/workspaces/" + workspaceId);
    workbookReq.put("folderId", folder2Id);

    // @formatter:off
    Response workbookRes =
    given()
      .auth().oauth2(oauth_token)
      .body(workbookReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books");

    String workbookId = from(workbookRes.asString()).get("id");

    workbookRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // WorkBench 신규 생성
    Map<String, Object> workbenchReq = Maps.newHashMap();
    workbenchReq.put("type", "workbench");
    workbenchReq.put("name", "workbench-test");
    workbenchReq.put("workspace", "/api/workspaces/" + workspaceId);
    workbenchReq.put("folderId", folder2Id);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(workbenchReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    //
    // folder 하위

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forListWithWorkspaceView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/books/{folderId}", folder2Id)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
  public void showOrderdFolderAndBookInSubFolder() {

    String workspaceId = "ws-02";

    // WorkBook 신규 생성 - ROOT1
    Map<String, Object> workbookRootReq = Maps.newHashMap();
    workbookRootReq.put("type", "workbook");
    workbookRootReq.put("name", "workbook-test");
    workbookRootReq.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(workbookRootReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성 1 - ROOT
    Map<String, Object> folderRootReq = Maps.newHashMap();
    folderRootReq.put("type", "folder");
    folderRootReq.put("name", "folder9_test");
    folderRootReq.put("description", "folder_descriptions");
    folderRootReq.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(folderRootReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성 - ROOT 1
    Map<String, Object> folder1Req = Maps.newHashMap();
    folder1Req.put("type", "folder");
    folder1Req.put("name", "folder1_test");
    folder1Req.put("description", "folder_descriptions");
    folder1Req.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    Response folder1Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder1Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder1Id = from(folder1Res.asString()).get("id");

    folder1Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // WorkBook 신규 생성 - Folder 1 하위
    Map<String, Object> workbookReq = Maps.newHashMap();
    workbookReq.put("type", "workbook");
    workbookReq.put("name", "workbook-test");
    workbookReq.put("workspace", "/api/workspaces/" + workspaceId);
    workbookReq.put("folderId", folder1Id);

    // @formatter:off
    Response workbookRes =
    given()
      .auth().oauth2(oauth_token)
      .body(workbookReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books");

    String workbookId = from(workbookRes.asString()).get("id");

    workbookRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성 - Folder 1 하위
    Map<String, Object> folder2Req = Maps.newHashMap();
    folder2Req.put("type", "folder");
    folder2Req.put("name", "folder2_test");
    folder2Req.put("description", "folder_descriptions");
    folder2Req.put("workspace", "/api/workspaces/" + workspaceId);
    folder2Req.put("folderId", folder1Id);

    // @formatter:off
    Response folder2Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder2Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder2Id = from(folder2Res.asString()).get("id");

    folder2Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성 1 - ROOT
    Map<String, Object> folderRoot1Req = Maps.newHashMap();
    folderRoot1Req.put("type", "folder");
    folderRoot1Req.put("name", "folder1_test");
    folderRoot1Req.put("description", "folder_descriptions");
    folderRoot1Req.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(folderRoot1Req)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forListView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{workspace_id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
  public void deleteMultipleBooks() {

    String workspaceId = "ws-02";

    // WorkBook 신규 생성 - ROOT1
    Map<String, Object> workbookRootReq = Maps.newHashMap();
    workbookRootReq.put("type", "workbook");
    workbookRootReq.put("name", "workbook-test");
    workbookRootReq.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    Response workBookRootRes =
    given()
      .auth().oauth2(oauth_token)
      .body(workbookRootReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books");

    workBookRootRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String workbookRootId = from(workBookRootRes.asString()).get("id");

    // Folder 신규 생성 1 - ROOT
    Map<String, Object> folderRootReq = Maps.newHashMap();
    folderRootReq.put("type", "folder");
    folderRootReq.put("name", "folder9_test");
    folderRootReq.put("description", "folder_descriptions");
    folderRootReq.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(folderRootReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성 - ROOT 1
    Map<String, Object> folder1Req = Maps.newHashMap();
    folder1Req.put("type", "folder");
    folder1Req.put("name", "folder1_test");
    folder1Req.put("description", "folder_descriptions");
    folder1Req.put("workspace", "/api/workspaces/" + workspaceId);

    // @formatter:off
    Response folder1Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder1Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder1Id = from(folder1Res.asString()).get("id");

    folder1Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // WorkBook 신규 생성 - Folder 1 하위
    Map<String, Object> workbookReq = Maps.newHashMap();
    workbookReq.put("type", "workbook");
    workbookReq.put("name", "workbook-test");
    workbookReq.put("workspace", "/api/workspaces/" + workspaceId);
    workbookReq.put("folderId", folder1Id);

    // @formatter:off
    Response workbookRes =
    given()
      .auth().oauth2(oauth_token)
      .body(workbookReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/books");

    String workbookId = from(workbookRes.asString()).get("id");

    workbookRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // Folder 신규 생성 - Folder 1 하위
    Map<String, Object> folder2Req = Maps.newHashMap();
    folder2Req.put("type", "folder");
    folder2Req.put("name", "folder2_test");
    folder2Req.put("description", "folder_descriptions");
    folder2Req.put("workspace", "/api/workspaces/" + workspaceId);
    folder2Req.put("folderId", folder1Id);

    // @formatter:off
    Response folder2Res =
      given()
        .auth().oauth2(oauth_token)
        .body(folder2Req)
        .contentType(ContentType.JSON)
      .when()
        .post("/api/books");

    String folder2Id = from(folder2Res.asString()).get("id");

    folder2Res.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/books/" + folder1Id)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
//      .param("projection", "forListView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{workspace_id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  @Sql("/sql/test_workbook.sql")
  public void findDashboardInFolder() {

    String targetId = "wb-folder-001";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forListView")
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/books/{folderId}/dashboards", targetId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }
}
