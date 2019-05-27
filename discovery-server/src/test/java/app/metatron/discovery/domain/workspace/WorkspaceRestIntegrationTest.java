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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.util.MimeType;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.activities.spec.ActivityGenerator;
import app.metatron.discovery.domain.activities.spec.ActivityObject;
import app.metatron.discovery.domain.activities.spec.ActivityStreamV2;
import app.metatron.discovery.domain.notebook.SampleDataGenerator;
import app.metatron.discovery.util.JsonPatch;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.iterableWithSize;

/**
 * Created by kyungtaak on 2016. 1. 30..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class WorkspaceRestIntegrationTest extends AbstractRestIntegrationTest {

  private WebSocketStompClient stompClient;

  private WebSocketHttpHeaders webSocketHttpHeaders = new WebSocketHttpHeaders();

  private MappingJackson2MessageConverter jackson2MessageConverter;

  @Before
  public void setUp() {
    RestAssured.port = serverPort;

    List<Transport> transports = Lists.newArrayList(new WebSocketTransport(new StandardWebSocketClient()));

    this.stompClient = new WebSocketStompClient(new SockJsClient(transports));
    this.jackson2MessageConverter = new MappingJackson2MessageConverter();
    this.jackson2MessageConverter.setObjectMapper(GlobalObjectMapper.getDefaultMapper());
    this.stompClient.setMessageConverter(this.jackson2MessageConverter);
  }

  /**
   * 워크스페이스 상세조회 > 노트북 서버 설정
   */
  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql({"/sql/add_notebook_connector.sql"})
  public void crConnectorsInWorkspace() {

    String workspaceId = "ws-03";
    /**
     * 워크스페이스 상세조회 > 노트북 서버 설정 > 등록 가능한 서버 목록 조회
     */
    TestUtils.printTestTitle("1. 등록 가능한 서버 목록 조회");
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
       .get("/api/connectors")
    .then()
       .statusCode(HttpStatus.SC_OK)
       .log().all();
    // @formatter:on

    /**
     * 워크스페이스 상세조회 > 노트북 서버 설정 > 서버 선택 후 등록
     */
    TestUtils.printTestTitle("2. 서버 선택 후 등록");
    String cids = "notebook-jupyter-00" + "," + "notebook-zeppelin-00";
    //    String cids = "notebook-jupyter-00";
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/workspaces/{wid}/connectors/{cids}", workspaceId, cids)
    .then()
      .log().all();
//    given()
//      .auth().oauth2(oauth_token)
//      .contentType("text/uri-list")
//      .body("/api/connectors/" + connectorId)
//    .when()
//      .put("/api/workspaces/{id}/connectors", workspaceId)
//    .then()
//      .statusCode(HttpStatus.SC_NO_CONTENT)
//      .log().all();
    // @formatter:on

    /**
     * 워크스페이스 상세조회 > 노트북 서버 설정 > 현재 등록된 서버 목록 조회
     */
    TestUtils.printTestTitle("3. 현재 등록된 서버 목록 조회");
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forSummaryListView")
    .when()
      .get("/api/workspaces/{id}/connectors", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  /**
   * 워크스페이스 > 대시보드 > 차트 > 사용자 모델 > 사용자 모델 조회 팝업 > 모델추가 > 모델 선택 리스트
   */
  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql({"/sql/add_notebook_connector.sql"})
  public void findNotebookBookModelList() {
    SampleDataGenerator sample = new SampleDataGenerator(oauth_token);
    // create notebooks
    String r_notebook_id = sample.createNotebook("notebook-test-setUp-r", "R");
    // create notebook_models
    String approval_model_id = sample.createNotebookModel("model-test-setUp-r-html", "HTML", r_notebook_id);
    String approval_model_id_json = sample.createNotebookModel("model-test-setUp-r-json", "JSON", r_notebook_id);
    sample.updateNotebookModel(approval_model_id, "APPROVAL");
    sample.updateNotebookModel(approval_model_id_json, "APPROVAL");

    String workspaceId = "ws-03";
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forSummaryListView")
      .param("size", "10")
    .when()
       .get("/api/workspaces/{id}/nbmodels", workspaceId)
    .then()
       .statusCode(HttpStatus.SC_OK)
       .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql(value = "/sql/test_workbook.sql")
  public void findMyWorkspace() throws JsonProcessingException {

    // @formatter:off
    Response roleRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/workspaces/my");
    roleRes.then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void patchFavoriteMyWorkspaceList() throws JsonProcessingException {

    String sharedWorkspaceId = "ws-03";

    TestUtils.printTestTitle("1. Shared Workspace 목록 조회 <Paging>");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
      .param("size", "5")
    .when()
      .get("/api/workspaces/my/public")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. 즐겨 찾기 지정 후 확인");

    // @formatter:off
    Response roleRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/workspaces/{id}/favorite", sharedWorkspaceId);
    roleRes.then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("onlyFavorite", "true")
      .param("projection", "forListView")
      .param("size", "5")
    .when()
      .get("/api/workspaces/my/public")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2-1. forDetailView projection");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/workspaces/{id}", sharedWorkspaceId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2-2. forHeaderView projection");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forHeaderView")
      .param("size", "5")
    .when()
      .get("/api/workspaces/my/public")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. 즐겨 찾기 해제후 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/workspaces/{id}/favorite", sharedWorkspaceId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("onlyFavorite", "true")
      .param("projection", "default")
      .param("size", "5")
    .when()
      .get("/api/workspaces/my/public")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql({"/sql/test_shared_workspace_list.sql", "/sql/test_datasource_list.sql"})
  public void workspaceListForLinkedDataSource() throws JsonProcessingException {

    String targetDataSourceId = "ds-test-03";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("publicType", "private")
//      .param("nameContains", "Workspace2")
      .param("linkedType", "datasource")
      .param("linkedId", targetDataSourceId)
      .param("projection", "forListView")
      .param("size", "10")
      .param("sort", "modifiedTime,desc")
      .param("sort", "name,asc")
    .when()
      .get("/api/workspaces")
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces.length", greaterThan(0))
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql({"/sql/test_shared_workspace_list.sql", "/sql/test_linked_connection.sql"})
  public void workspaceListForLinkedConnection() throws JsonProcessingException {

    String targetConnectionId = "conn-02";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("publicType", "private")
//      .param("nameContains", "Workspace2")
      .param("linkedType", "connection")
//      .param("linkedId", targetConnectionId)
//      .param("onlyLinked", true)
      .param("projection", "forListView")
      .param("size", "10")
      .param("sort", "modifiedTime,desc")
      .param("sort", "name,asc")
      .log().all()
    .when()
      .get("/api/workspaces")
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces.length", greaterThan(0))
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql({"/sql/test_import_workspace_list.sql"})
  public void workspaceListImportAvailable() throws JsonProcessingException {

    //    String workbookId = "wb-001";
    String workbookId = "wb-002";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
//      .param("excludes", "ws-02")
      .param("projection", "forTreeView")
//      .param("size", "10")
//      .param("sort", "modifiedTime,desc")
//      .param("sort", "name,asc")
      .log().all()
    .when()
      .get("/api/workspaces/import/books/{workbookId}/available", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void myWorkspaceListForListView() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
//      .param("myWorkspace", "true")
//      .param("nameContains", "Workspace2")
      .param("projection", "forListView")
//      .param("size", "10")
//      .param("sort", "modifiedTime,desc")
//      .param("sort", "name,asc")
    .when()
      .get("/api/workspaces/my/public")
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces.length", greaterThan(0))
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void findMyPublicWorkspaces() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
//      .param("myWorkspace", "false")
//      .param("published", "true")
//      .param("nameContains", "Workspace")
      .param("projection", "forListView")
      .param("size", "10")
      .param("sort", "modifiedTime,desc")
//      .param("sort", "name,asc")
      .log().all()
    .when()
      .get("/api/workspaces/my/public")
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces.length", greaterThan(0))
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void findWorkspacesByAdmin() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("username", "polaris")
      .param("onlyOwner", "false")
      .param("published", "false")
      .param("active", "true")
      .param("publicType", "shared")
      .param("nameContains", "Workspace")
      .param("projection", "forListView")
//      .param("searchDateBy", "lastAccessed")
//      .param("from", "2017-11-11T00:00:00.0Z")
//      .param("to", "2017-11-30T00:00:00.0Z")
      .param("size", "10")
      .param("sort", "modifiedTime,desc")
//      .param("sort", "name,asc")
      .log().all()
    .when()
      .get("/api/workspaces/byadmin")
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces.length", greaterThan(0))
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void activateWorkspace() throws JsonProcessingException {

    String workspaceId = "ws-0001";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/workspaces/{id}/activate/{status}", workspaceId, "inactive")
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
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on


  }


  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void delegateWorkspace() throws JsonProcessingException {

    String workspaceId = "ws-0001";
    String ownerId = "polaris";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/workspaces/{id}/delegate/{ownername}", workspaceId, ownerId)
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
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void delegate_workspace_with_non_existent_user() {

    String workspaceId = "ws-0001";
    String ownerId = "EMPTY_USER_ID";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/workspaces/{id}/delegate/{ownername}", workspaceId, ownerId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_BAD_REQUEST);
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void delegate_workspace_owner_to_users_not_exist_in_the_workspace_member_list() {

    String workspaceId = "ws-0001";
    String ownerId = "guest";

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .log().all()
            .when()
            .post("/api/workspaces/{id}/delegate/{ownername}", workspaceId, ownerId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_BAD_REQUEST);
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void updateLastAccessWorkspace() throws JsonProcessingException {

    String workspaceId = "ws-0001";
    String messageDestination = "/message/workspaces/%s/accessed";

    StompHeaders stompHeaders = new StompHeaders();
    stompHeaders.set("X-AUTH-TOKEN", oauth_token);

    StompSession session = null;
    try {
      session = stompClient
          .connect("ws://localhost:{port}/stomp", webSocketHttpHeaders, stompHeaders, new StompSessionHandlerAdapter() {}, serverPort)
          .get(3, SECONDS);
    } catch (Exception e) {
      e.printStackTrace();
    }

    StompHeaders stompSendHeaders = new StompHeaders();
    stompSendHeaders.setDestination(String.format(messageDestination, workspaceId));
    stompSendHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.send(stompSendHeaders, null);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  /**
   * 워크스페이스 > 노트북 생성하는 화면 호출 시 > 데이터소스 선택 목록 정보
   * (데이터 타입 default 조건이 데이터소스 이므로, 데이터소스 목록을 화면 로딩 시점에서 바로 호출한다.
   */
  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_datasource_in_workspace.sql")
  public void findAvailableDataSourcesInWorkspace() throws JsonProcessingException {

    String workspaceId = "ws-02";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
//      .param("onlyPublic", true)
      .param("status", "enabled,disabled")
      .param("projection", "forListInWorkspaceView")
      .param("nameContains", "test")
      .param("sort", "linkedWorkspaces,desc")
      .param("sort", "modifiedTime,asc")
      .param("sort", "name,desc")
      .log().all()
    .when()
      .get("/api/workspaces/{id}/datasources", workspaceId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_shared_workspace_list.sql")
  public void findWorkspaceMembers() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
    .when()
      .post("/api/workspaces/members/refresh")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    String workspaceId = "ws-0001";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("type", "all")
      .param("nameContains", "po")
    .when()
      .get("/api/workspaces/{id}/members", workspaceId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_WORKSPACE_MANAGE_WORKSPACE"})
  @Sql("/sql/test_workbook.sql")
  public void findDashboardsInWorkspace() throws JsonProcessingException {

    String workspaceId = "ws-02";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
      .param("sort", "name,desc")
      .param("nameContains", "test")
    .when()
      .get("/api/workspaces/{id}/dashboards", workspaceId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  public void deleteWorkspaceMember() throws JsonProcessingException {

    Map<String, Object> tagetMap1 = Maps.newHashMap();
    tagetMap1.put("memberId", "metatron");
    tagetMap1.put("memberType", "USER");
    tagetMap1.put("role", "WORKSPACE_ADMIN");

    List<JsonPatch> patches = Lists.newArrayList(
        //        new JsonPatch(JsonPatch.Operations.REMOVE, "/members/[memberId == 'metatron']")
        new JsonPatch(JsonPatch.Operations.REMOVE, "/members/0")
    );

    System.out.println("Body : " + patches);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType("application/json-patch+json")
      .accept(ContentType.JSON)
      .body(patches)
    .when()
      .patch("/api/workspaces/{id}", "ws-03")
    .then()
//      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
    .when()
      .get("/api/workspaces/{id}/members", "ws-03")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  public void createWorkspaceWithSharedInfo() throws JsonProcessingException {

    TestUtils.printTestTitle("1. 최초 공유 Workspace 생성");

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

    TestUtils.printTestTitle("2. 공유 Workspace 생성 후 최초 Member 추가 및 확인");

    Map<String, Object> tagetMap1 = Maps.newHashMap();
    tagetMap1.put("op", "add");
    tagetMap1.put("memberId", "metatron");
    tagetMap1.put("memberType", "USER");
    tagetMap1.put("role", "WORKSPACE_ADMIN");

    Map<String, Object> tagetMap2 = Maps.newHashMap();
    tagetMap2.put("op", "add");
    tagetMap2.put("memberId", "ROLE_SYSTEM_SUPERVISOR");
    tagetMap2.put("memberType", "GROUP");
    tagetMap2.put("role", "WORKSPACE_VIEWER");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(Lists.newArrayList(tagetMap1, tagetMap2))
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .log().all()
    .when()
      .put("/api/workspaces/{id}/members", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // 확인
    // @formatter:off
    Response membersRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{id}/members", workspaceId);
    membersRes.then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Member 수정/삭제 및 확인");

    Map<String, Object> tagetMap3 = Maps.newHashMap();
    tagetMap3.put("op", "replace");
    tagetMap3.put("memberId", "metatron");
    tagetMap3.put("role", "WORKSPACE_VIEWER");

    Map<String, Object> tagetMap4 = Maps.newHashMap();
    tagetMap4.put("op", "remove");
    tagetMap4.put("memberId", "ROLE_SYSTEM_SUPERVISOR");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(Lists.newArrayList(tagetMap3, tagetMap4))
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .log().all()
    .when()
      .patch("/api/workspaces/{id}/members", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

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

    TestUtils.printTestTitle("4. 최종 공유 워크스페이스 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
//      .param("myWorkspace", true)
      .param("projection", "forListView")
    .when()
      .get("/api/workspaces/my/public")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql(value = "/sql/test_roleset.sql")
  public void createWorkspaceWithRoleSet() throws JsonProcessingException {

    String roleSetId = "TEST_ROLE_SET";
    String roleSetLink = "/api/rolesets/" + roleSetId;

    TestUtils.printTestTitle("1. 최초 Workspace 생성시 RoleSet 지정");

    Workspace createWorkspace = new WorkspaceBuilder()
        .name("workspace1")
        .description("workspace1 desc")
        .publicType(Workspace.PublicType.SHARED)
        .build();

    Map<String, Object> reqMap = Maps.newHashMap();
    reqMap.put("name", "workspace1");
    reqMap.put("description", "description1");
    reqMap.put("publicType", "SHARED");
    reqMap.put("roleSets", Lists.newArrayList(roleSetLink));

    // @formatter:off
    Response workspaceRes =
    given()
      .auth().oauth2(oauth_token)
      .body(reqMap)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/workspaces");
    workspaceRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .body("name", is(createWorkspace.getName()))
      .log().all();
    // @formatter:on

    String workspaceId = from(workspaceRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get(roleSetLink)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  public void createWorkspaceWithContext() throws JsonProcessingException {

    TestUtils.printTestTitle("1. 최초 Workspace 생성시 Context 지정");

    Workspace createWorkspace = new WorkspaceBuilder()
        .name("workspace1")
        .description("workspace1 desc")
        .publicType(Workspace.PublicType.SHARED)
        .build();

    Map<String, String> contexts = Maps.newHashMap();
    contexts.put("prop1", "value1");
    contexts.put("prop2", "value2");

    createWorkspace.setContexts(GlobalObjectMapper.writeValueAsString(contexts));

    // @formatter:off
    Response workspaceRes =
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(createWorkspace))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/workspaces");
    workspaceRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .body("name", is(createWorkspace.getName()))
      .log().all();
    // @formatter:on

    String workspaceId = from(workspaceRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Workspace 수정시 Context 수정");

    Workspace updateWorkspace = new WorkspaceBuilder()
        .name("workspace1-update context")
        .build();

    Map<String, String> updateContexts = Maps.newHashMap();
    updateContexts.put("prop1", "value1 - updated");
    updateContexts.put("prop3", "value3");

    updateWorkspace.setContexts(GlobalObjectMapper.writeValueAsString(updateContexts));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(updateWorkspace))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .patch("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("name", is(updateWorkspace.getName()))
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/workspaces/{id}", workspaceId)
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
//      .param("domainProjection", "forDetailView")
      .log().all()
    .when()
      .get("/api/contexts/domains/{domainType}", "workspace")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }


  @Test
  @OAuthRequest(username = "admin", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  //  @OAuthRequest(username = "guest", value = {"SYSTEM_GUEST"})
  @Sql(value = {"/sql/test_workbook.sql"})
  public void findWorkspaceWithDetailView() {

    // @Sql 내 데이터 기반 구성
    String workspaceId = "ws-10";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("projection", "forDetailView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", any(String.class))
//      .body("workBooks", hasSize(3))
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql(value = "/sql/test_workbook.sql")
  public void findBookInWorkspaceTreeView() {

    // @Sql 내 데이터 기반 구성
    String workspaceId = "ws-02";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("bookType", "workbook")
      .param("projection", "forTreeView")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workspaces/{id}/books/{bookId}", workspaceId, "wb-folder-001")
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", any(String.class))
//      .body("workBooks", hasSize(3))
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql(value = "/sql/test_linked_connection.sql")
  public void findConnectionInWorkspace() {

    // @Sql 내 데이터 기반 구성
    List<Map<String, Object>> testMaps = new ArrayList<>();
    Map testMap;

    testMap = new HashMap();
    testMap.put("workspaceId", "ws-00");
    testMap.put("expectSize", 2);
    testMaps.add(testMap);

    testMap = new HashMap();
    testMap.put("workspaceId", "ws-02");
    testMap.put("expectSize", 3);
    testMaps.add(testMap);

    testMap = new HashMap();
    testMap.put("workspaceId", "ws-03");
    testMap.put("expectSize", 4);
    testMaps.add(testMap);

    testMap = new HashMap();
    testMap.put("workspaceId", "ws-05");
    testMap.put("expectSize", 1);
    testMaps.add(testMap);

    // @formatter:off
    for(Map testCaseMap : testMaps){
      given()
        .auth().oauth2(oauth_token)
        .param("projection", "list")
        .contentType(ContentType.JSON)
        .log().all()
      .when()
        .get("/api/workspaces/{id}/connections", testCaseMap.get("workspaceId"))
      .then()
        .statusCode(HttpStatus.SC_OK)
        .log().all()
        .body("_embedded.connections", iterableWithSize((int) testCaseMap.get("expectSize")));
    }
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql(value = "/sql/test_workbook.sql")
  public void findWorkspaceStat() {

    // @Sql 내 데이터 기반 구성
    String workspaceId = "ws-02";

    String messageDestination = "/message/activities/add";

    StompHeaders stompHeaders = new StompHeaders();
    stompHeaders.set("X-AUTH-TOKEN", oauth_token);

    //    StompSession session = null;
    StompSession session = null;
    try {
      session = stompClient
          .connect("ws://localhost:{port}/stomp", webSocketHttpHeaders, stompHeaders, new StompSessionHandlerAdapter() {}, serverPort)
          .get(3, SECONDS);

    } catch (Exception e) {
      e.printStackTrace();
    }

    ActivityStreamV2 activityStreamV2 = new ActivityStreamV2(null, null,
                                                             "View", null, null,
                                                             new ActivityObject(workspaceId, "WORKSPACE"), null,
                                                             new ActivityGenerator("WEBAPP", ""),
                                                             DateTime.now());

    StompHeaders stompSendHeaders = new StompHeaders();
    stompSendHeaders.setContentType(new MimeType("application", "json", Charset.forName("UTF-8")));
    stompSendHeaders.setDestination(messageDestination);
    stompSendHeaders.set("X-AUTH-TOKEN", oauth_token);

    System.out.println(GlobalObjectMapper.writeValueAsString(activityStreamV2));

    session.send(stompSendHeaders, activityStreamV2);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("timeUnit", "day")
      .param("from", "2017-11-11T00:00:00.0Z")
      .param("to", "2018-11-30T00:00:00.0Z")
      .log().all()
    .when()
      .get("/api/workspaces/{id}/statistics", workspaceId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", any(String.class))
//      .body("workBooks", hasSize(3))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql(value = "/sql/test_roleset.sql")
  public void addRoleSetInWorkspace() {
    // @Sql 내 데이터 기반 구성
    String workspaceId = "ws-test-01";
    String addRoleSetName = "__DEFAULT";

    // @formatter:off
    Response addRoleSetRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/workspaces/{id}/rolesets/{roleSetName}", workspaceId, addRoleSetName);
    addRoleSetRes.then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql(value = "/sql/test_roleset.sql")
  public void changeRoleSetInWorkspace() {
    // @Sql 내 데이터 기반 구성
    String workspaceId = "ws-test-01";
    String fromRoleSetName = "테스트 커스텀 롤셋";
    String toRoleSetName = "테스트 롤셋";

    Map<String, String> mapper = Maps.newHashMap();
    //    mapper.put("WORKSPACE_TEST_EDITOR", "WORKSPACE_VIEWER");

    // @formatter:off
    Response addRoleSetRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("defaultRoleName", "WORKSPACE_ADMIN")
      .body(mapper)
      .log().all()
    .when()
      .put("/api/workspaces/{id}/rolesets/{roleSetName}/to/{toRoleSetName}", workspaceId, fromRoleSetName, toRoleSetName);
    addRoleSetRes.then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/workspaces/{id}/members", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/workspaces/{id}", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_SHARED_WORKSPACE"})
  @Sql(value = "/sql/test_roleset.sql")
  public void deleteRoleSetInWorkspace() {
    // @Sql 내 데이터 기반 구성
    String workspaceId = "ws-test-01";
    String deleteRoleSetName = "TEST_GENERAL";

    // @formatter:off
    Response addRoleSetRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .delete("/api/workspaces/{id}/rolesets/{roleSetName}", workspaceId, deleteRoleSetName);
    addRoleSetRes.then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/workspaces/{id}/members", workspaceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

}
