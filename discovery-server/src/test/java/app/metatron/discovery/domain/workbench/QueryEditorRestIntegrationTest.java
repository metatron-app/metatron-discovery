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

package app.metatron.discovery.domain.workbench;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.hamcrest.Matchers;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.workspace.folder.Folder;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@Sql({"/sql/workbench.sql"})
public class QueryEditorRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void createQueryEditor() {

    String workbenchId = "workbench-03";
    int order = 0;
    String query = "select * from sales";
    String name = "Query Editor 1";

    Object body = new QueryEditorBuilder()
      .name(name)
      .order(order)
      .workbench(workbenchId)
      .query(query)
      .toJson(true)
      .build();

    // @formatter:off
    Response queryEditorRes =
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(body).log().all()
      .when()
        .post("/api/queryeditors");

    queryEditorRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String queryEditorId = from(queryEditorRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/queryeditors/{id}", queryEditorId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readQueryEditor() {
    String queryEditorId = "query-01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/queryeditors/{id}", queryEditorId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readQueryEditors() {
    String workbenchId = "workbench-01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workbenchs/{id}/queryeditors", workbenchId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }
  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readQueryEditorWithQueryHistories() {
    String queryEditorId = "query-01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forQueryHistory")
    .when()
      .get("/api/queryeditors/{id}", queryEditorId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void updateQueryEditor() {

    String queryEditorId = "query-01";

    String patchedName = "Query Name New";

    Map<String, Object> patchedBody = new HashMap<>();
    patchedBody.put("name", patchedName);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(patchedBody)
    .when()
      .patch("/api/queryeditors/{id}", queryEditorId)
    .then()
      .log().all()
      .statusCode(org.apache.http.HttpStatus.SC_OK);
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/queryeditors/{id}", queryEditorId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK)
      .body("name", Matchers.is(patchedName));
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void updateNonExistQueryEditor() {

    String queryEditorId = "query-01-a";

    String patchedName = "Query Name New";

    Map<String, Object> patchedBody = new HashMap<>();
    patchedBody.put("name", patchedName);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(patchedBody)
    .when()
      .patch("/api/queryeditors/{id}", queryEditorId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NOT_FOUND);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void deleteQueryEditor() {
    String queryEditorId = "query-01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/queryeditors/{id}", queryEditorId)
    .then()
      .body("id", Matchers.is(queryEditorId))
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/queryeditors/{id}", queryEditorId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/queryeditors/{id}", queryEditorId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void runSingleQueryWithInvalidQuery() {
    String queryEditorId = "query-01";
    String webSocketId = "test1";
    queryEditorId = "eb6bd70b-7988-421c-a517-e7e21caa861e";

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("query", "select * from sales");
    reqMap.put("webSocketId", webSocketId);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(reqMap)
      .log().all()
    .when()
      .post("/api/queryeditors/{id}/query/run", queryEditorId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
    ;
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void runSingleQueryWithInvalidQueryEditorId() {
    String queryEditorId = "query-01ttt";

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("query", "select * from sales");
    reqMap.put("webSocketId", "test");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(reqMap)
      .log().all()
    .when()
      .post("/api/queryeditors/{id}/query/run", queryEditorId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NOT_FOUND)
    ;
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void runHiveSingleQuery() {

    String queryEditorId = "query-01";
    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("query", "select * from default.sales limit 1;");
    reqMap.put("webSocketId", "test");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(reqMap)
      .log().all()
    .when()
      .post("/api/queryeditors/{id}/query/run", queryEditorId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK)
    ;
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
      .param("sort", "id,asc")
    .when()
      .get("/api/queryeditors/{id}/queryhistories", queryEditorId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK)
    ;
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void runHiveMultiQuery() {

    String queryEditorId = "query-01";
    QueryRunRequest req = new QueryRunRequest();
    req.setQuery("use default;select * from sales limit 1;select * from sales limit 2;");
    req.setWebSocketId("test");

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("query", "use default;select * from sales limit 1;select * from sales limit 2;");
    reqMap.put("webSocketId", "test");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(reqMap)
      .log().all()
    .when()
      .post("/api/queryeditors/{id}/query/run", queryEditorId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK)
    ;
    // @formatter:on

    // @formatter:off
//    given()
//      .auth().oauth2(oauth_token)
//      .contentType(ContentType.JSON)
//      .param("projection", "forListView")
//      .param("sort", "id,asc")
//    .when()
//      .get("/api/queryeditors/{id}/queryhistories", queryEditorId)
//    .then()
//      .log().all()
//      .statusCode(HttpStatus.SC_OK);
//    ;
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void runQueryDuringExecuteQuery(){
    CountDownLatch latch = new CountDownLatch(1);

    new Thread(() -> {
      String query = "select t1.city as c1\n" +
              "from sales t1\n" +
              "left outer join (select * from sales) t2 on (t1.city = t2.city)\n" +
              "group by c1\n" +
              ";" +
              "" +
              "select * from sales limit 2;";
      String queryEditorId = "query-02";
      Map<String, Object> reqMap = new HashMap<>();
      reqMap.put("query", query);
      reqMap.put("webSocketId", "test");

      // @formatter:off
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .body(reqMap)
        .log().all()
      .when()
        .post("/api/queryeditors/{id}/query/run", queryEditorId)
      .then()
        .log().all()
        .statusCode(HttpStatus.SC_OK)
      ;

      latch.countDown();
    }).start();

    try{
      System.out.println("======thread..");
      Thread.sleep(3000);
      System.out.println("======thread..sleep..");

      String query = "select * from sales limit 1;";

      String queryEditorId = "query-02";
      Map<String, Object> reqMap = new HashMap<>();
      reqMap.put("query", query);
      reqMap.put("webSocketId", "test");

      // @formatter:off
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .body(reqMap)
        .log().all()
      .when()
        .post("/api/queryeditors/{id}/query/run", queryEditorId)
      .then()
        .log().all()
        .statusCode(HttpStatus.SC_BAD_REQUEST)
      ;

      latch.await();

      System.out.println("Test Completed.");
    } catch(Exception e){

    }


  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void cancelQueryMysql(){
    CountDownLatch latch = new CountDownLatch(1);

    new Thread(() -> {
      String query = "use sample;" +
              "select * from sales limit 1;" +
              "select * from sales limit 1;" +
              "select t1.city as c1\n" +
              "from sales t1\n" +
              "left outer join (select * from sales) t2 on (t1.city = t2.city)\n" +
              "group by c1\n" +
              ";" +
              "" +
              "select * from sales limit 2;";
      String queryEditorId = "query-02";
      Map<String, Object> reqMap = new HashMap<>();
      reqMap.put("query", query);
      reqMap.put("webSocketId", "test");

      // @formatter:off
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .body(reqMap)
        .log().all()
      .when()
        .post("/api/queryeditors/{id}/query/run", queryEditorId)
      .then()
        .log().all()
        .statusCode(HttpStatus.SC_OK)
      ;

      latch.countDown();
    }).start();

    try{
      System.out.println("======thread..");
      Thread.sleep(3000);
      System.out.println("======thread..sleep..");

      String query = "select * from sales limit 1;";

      String queryEditorId = "query-02";
      Map<String, Object> reqMap = new HashMap<>();
      reqMap.put("query", query);
      reqMap.put("webSocketId", "test");

      // @formatter:off
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .body(reqMap)
        .log().all()
      .when()
        .post("/api/queryeditors/{id}/query/cancel", queryEditorId)
      .then()
        .log().all()
        .statusCode(HttpStatus.SC_NO_CONTENT)
      ;

      latch.await();

      System.out.println("Test Completed.");
    } catch(Exception e){

    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void cancelQueryHive(){
    CountDownLatch latch = new CountDownLatch(1);

    new Thread(() -> {
      int i = 1;
      String query = "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";";

      String queryEditorId = "query-01";
      Map<String, Object> reqMap = new HashMap<>();
      reqMap.put("query", query);
      reqMap.put("webSocketId", "test");

      // @formatter:off
      given()
              .auth().oauth2(oauth_token)
              .contentType(ContentType.JSON)
              .accept(ContentType.JSON)
              .body(reqMap)
              .log().all()
              .when()
              .post("/api/queryeditors/{id}/query/run", queryEditorId)
              .then()
              .log().all()
              .statusCode(HttpStatus.SC_OK)
      ;

      latch.countDown();
    }).start();

    try{
      System.out.println("======thread..");
      Thread.sleep(10000);
      System.out.println("======thread..sleep..");

      String queryEditorId = "query-02";
      Map<String, Object> reqMap = new HashMap<>();
      reqMap.put("webSocketId", "test");

      // @formatter:off
      given()
              .auth().oauth2(oauth_token)
              .contentType(ContentType.JSON)
              .accept(ContentType.JSON)
              .body(reqMap)
              .log().all()
              .when()
              .post("/api/queryeditors/{id}/query/cancel", queryEditorId)
              .then()
              .log().all()
              .statusCode(HttpStatus.SC_NO_CONTENT)
      ;

      latch.await();

      System.out.println("Test Completed.");
    } catch(Exception e){

    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void cancelQueryPresto(){
    CountDownLatch latch = new CountDownLatch(1);

    new Thread(() -> {
      int i = 1;
      String query = "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "";

      String queryEditorId = "query-03";
      Map<String, Object> reqMap = new HashMap<>();
      reqMap.put("query", query);
      reqMap.put("webSocketId", "test");

      // @formatter:off
      given()
              .auth().oauth2(oauth_token)
              .contentType(ContentType.JSON)
              .accept(ContentType.JSON)
              .body(reqMap)
              .log().all()
              .when()
              .post("/api/queryeditors/{id}/query/run", queryEditorId)
              .then()
              .log().all()
              .statusCode(HttpStatus.SC_OK)
      ;

      latch.countDown();
    }).start();

    try{
      System.out.println("======thread..");
      Thread.sleep(3000);
      System.out.println("======thread..sleep..");

      String queryEditorId = "query-02";
      Map<String, Object> reqMap = new HashMap<>();
      reqMap.put("webSocketId", "test");

      // @formatter:off
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .body(reqMap)
        .log().all()
      .when()
        .post("/api/queryeditors/{id}/query/cancel", queryEditorId)
      .then()
        .log().all()
        .statusCode(HttpStatus.SC_NO_CONTENT)
      ;

      latch.await();

      System.out.println("Test Completed.");
    } catch(Exception e){

    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void createWorkbenchAndQueryEditorAndRunQueryIntegration() {

    String workspaceId = "ws-02";
    String dataConnectionId = "stage-hive-connection-for-test";
    List globalVarList = new ArrayList();
    Map globalVarMap = new HashMap();
    globalVarMap.put(Workbench.GLOBAL_VAR_KEY_NAME, "var1");
    globalVarMap.put(Workbench.GLOBAL_VAR_KEY_TYPE, Workbench.GLOBAL_VAR_TYPE_CALENDAR);
    globalVarMap.put(Workbench.GLOBAL_VAR_KEY_VALUE, "20170701");
    globalVarList.add(globalVarMap);

    globalVarMap = new HashMap();
    globalVarMap.put(Workbench.GLOBAL_VAR_KEY_NAME, "var2");
    globalVarMap.put(Workbench.GLOBAL_VAR_KEY_TYPE, Workbench.GLOBAL_VAR_TYPE_TEXT);
    globalVarMap.put(Workbench.GLOBAL_VAR_KEY_VALUE, "limit 10");
    globalVarList.add(globalVarMap);

    String globalVarString = GlobalObjectMapper.writeValueAsString(globalVarList);
    Object body = new WorkbenchBuilder()
            .name("workbench-test")
            .description("desc")
            .favorite(true)
            .tag("my tag")
            .folderId(Folder.ROOT)
//            .globalVar(globalVarString)
            .workspace(workspaceId)
            .dataConnection(dataConnectionId)
            .toJson(true)
            .build();

    System.out.println("Request Body: " + body);
    // @formatter:off
    Response workbenchRes =
            given()
                    .auth().oauth2(oauth_token)
                    .contentType(ContentType.JSON)
                    .body(body)
                    .log().all()
                    .when()
                    .post("/api/workbenchs");

    workbenchRes.then()
            .statusCode(org.apache.http.HttpStatus.SC_CREATED)
            .log().all();
    // @formatter:on

    String workbenchId = from(workbenchRes.asString()).get("id");

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "workbenchDefault")
            .when()
            .get("/api/workbenchs/{id}", workbenchId)
            .then()
            .statusCode(org.apache.http.HttpStatus.SC_OK)
            .log().all();
    // @formatter:on

    int order = 0;
    String query = "select * from sales";
    String name = "Query Editor 1";

    body = new QueryEditorBuilder()
            .name(name)
            .order(order)
            .workbench(workbenchId)
            .query(query)
            .toJson(true)
            .build();

    // @formatter:off
    Response queryEditorRes =
            given()
                    .auth().oauth2(oauth_token)
                    .contentType(ContentType.JSON)
                    .body(body).log().all()
                    .when()
                    .post("/api/queryeditors");

    queryEditorRes.then()
            .statusCode(HttpStatus.SC_CREATED)
            .log().all();
    // @formatter:on

    String queryEditorId = from(queryEditorRes.asString()).get("id");

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "default")
            .when()
            .get("/api/queryeditors/{id}", queryEditorId)
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
    // @formatter:on


    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("query", "select * from sales limit 1;");
    reqMap.put("webSocketId", "test");

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .body(reqMap)
            .log().all()
            .when()
            .post("/api/queryeditors/{id}/query/run", queryEditorId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
    ;
    // @formatter:on

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forListView")
            .param("sort", "id,asc")
            .when()
            .get("/api/queryeditors/{id}/queryhistories", queryEditorId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK);
    ;
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void downloadCSVHive() {

    String queryEditorId = "query-01";
    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("query", "select * from default.sales limit 1");
    reqMap.put("workbenchId", "workbench-01");
    reqMap.put("connectionId", "hive-local");
    reqMap.put("webSocketId", "test");
    reqMap.put("fileName", "test2020");

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.BINARY)
            .body(reqMap)
            .log().all()
            .when()
            .post("/api/queryeditors/{id}/query/download", queryEditorId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
    ;
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void changeHiveSchema() {

    String queryEditorId = "query-01";
    String webSocketId = "test";
    String connectionId = "hive-local";
    String databaseName1 = "default";
    String databaseName2 = "test1";

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("query", "show tables");
    reqMap.put("webSocketId", webSocketId);

    String reqBody = GlobalObjectMapper.writeValueAsString(reqMap);

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(reqBody)
            .when()
            .post("/api/connections/{connectionId}/datasource", connectionId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
    ;

    given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .body(reqMap)
            .log().all()
                    .when()
                    .post("/api/connections/{connectionId}/databases/{database}/change", connectionId, databaseName1)
                    .then()
            .log().all()
                    .statusCode(HttpStatus.SC_OK)
            ;
    // @formatter:on

    // @formatter:off
    Response resp1 = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .body(reqMap)
            .log().all()
            .when()
            .post("/api/queryeditors/{id}/query/run", queryEditorId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
    ;
    // @formatter:on

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(reqMap)
            .when()
            .post("/api/connections/{connectionId}/databases/{database}/change", connectionId, databaseName2)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
    ;
    // @formatter:on

    // @formatter:off
    Response resp2 = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .body(reqMap)
            .log().all()
            .when()
            .post("/api/queryeditors/{id}/query/run", queryEditorId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
            ;
    // @formatter:on

    List<Map<String, Object>> result1 = from(resp1.asString()).getList("");
    System.out.println(result1);

    List<Map<String, Object>> result2 = from(resp2.asString()).getList("");
    System.out.println(result2);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void changeMySQLSchema() {

    String queryEditorId = "query-02";
    String webSocketId = "test";
    String connectionId = "mysql-local";
    String databaseName1 = "metatron";
    String databaseName2 = "sample";

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("query", "show tables");
    reqMap.put("webSocketId", webSocketId);

    String reqBody = GlobalObjectMapper.writeValueAsString(reqMap);

    // @formatter:off

    //임시로 websocket workaround
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(reqBody)
            .when()
            .post("/api/connections/{connectionId}/datasource", connectionId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
    ;
//
//    given()
//            .auth().oauth2(oauth_token)
//            .accept(ContentType.JSON)
//            .contentType(ContentType.JSON)
//            .body(reqMap)
//            .log().all()
//            .when()
//            .post("/api/connections/{connectionId}/databases/{database}/change", connectionId, databaseName1)
//            .then()
//            .log().all()
//            .statusCode(HttpStatus.SC_OK)
//    ;
    // @formatter:on

    // @formatter:off
    Response resp1 = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .body(reqMap)
            .log().all()
            .when()
            .post("/api/queryeditors/{id}/query/run", queryEditorId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
            ;
    // @formatter:on

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(reqMap)
            .when()
            .post("/api/connections/{connectionId}/databases/{database}/change", connectionId, databaseName2)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
    ;
    // @formatter:on

    // @formatter:off
    Response resp2 = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .body(reqMap)
            .log().all()
            .when()
            .post("/api/queryeditors/{id}/query/run", queryEditorId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
            ;
    // @formatter:on

    List<Map<String, Object>> result1 = from(resp1.asString()).getList("");
    System.out.println(result1);

    List<Map<String, Object>> result2 = from(resp2.asString()).getList("");
    System.out.println(result2);
  }

}
