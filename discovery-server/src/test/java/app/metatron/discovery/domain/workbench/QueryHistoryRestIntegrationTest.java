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

import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.hamcrest.Matchers;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.util.Assert;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@Sql({"/sql/workbench.sql"})
public class QueryHistoryRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void createQueryHistory() {

    String dataConnectionId = "stage-hive-connection-for-test";
    String queryEditorId = "query-01";
    String query = "select * from sales";

    Object body = new QueryHistoryBuilder()
      .query(query)
      .queryEditor(queryEditorId)
      .queryFinishTime(DateTime.now())
      .queryRunTime(DateTime.now())
      .queryStatus(QueryResult.QueryResultStatus.SUCCESS)
      .rtRowCount(1000)
      .rtSize(10000)
      .queryTimeTaken(1000)
      .toJson(true)
      .build();

    // @formatter:off
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(body).log().all()
      .when()
        .post("/api/queryhistories")
      .then()
        .log().all()
        .statusCode(HttpStatus.SC_METHOD_NOT_ALLOWED);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readQueryHistory() {
    long queryHistoryId = 2;

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
      .param("projection", "default")
    .when()
      .get("/api/queryhistories/{queryHistoryId}", queryHistoryId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readQueryHistories() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
            .param("projection", "forListView")
            .param("sort", "id,desc")
    .when()
      .get("/api/queryhistories")
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }
  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readQueryHistoryWithListView() {
    String queryHistoryId = "query-01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
    .when()
      .get("/api/queryhistories")
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void updateQueryHistory() {

    long queryHistoryId = 2;

    String pathcedQuery = "Select * from sales limit 100";

    Map<String, Object> patchedBody = new HashMap<>();
    patchedBody.put("query", pathcedQuery);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(patchedBody)
    .when()
      .patch("/api/queryhistories/{id}", queryHistoryId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_METHOD_NOT_ALLOWED);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void deleteQueryHistory() {
    long queryHistoryId = 2;

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/queryhistories/{id}", queryHistoryId)
    .then()
      .body("queryHistoryId", Matchers.is(queryHistoryId))
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/queryhistories/{id}", queryHistoryId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void deleteAllQueryHistories() {
    String queryEditorId = "query-01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
            .param("queryEditorId", queryEditorId)
      .log().all()
    .when()
      .delete("/api/queryhistories/deleteAll")
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NO_CONTENT);
    // @formatter:on

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forListView")
            .param("queryEditorId", queryEditorId)
            .param("sort", "id,desc")
            .param("size", 10)
            .param("page", 0)
            .log().all()
            .when()
            .get("/api/queryhistories/list")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listQueryHistories() {
    String queryEditorId = "query-01";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("queryEditorId", queryEditorId)
            .param("projection", "forListView")
            .param("sort", "id,desc")
            .param("size", 10)
            .param("page", 0)
            .log().all()
            .when()
            .get("/api/queryhistories/list")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

    List<HashMap> queryHistoryList = from(resp.asString()).getList("_embedded.queryhistories", HashMap.class);
    Assert.isTrue(queryHistoryList.size() == 4);
    for(HashMap queryHistory : queryHistoryList){
      System.out.println(queryHistory);
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listQueryHistoriesWithQueryPattern() {
    String queryEditorId = "query-01";
    String queryPattern = "LES2";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("queryEditorId", queryEditorId)
            .param("searchKeyword", queryPattern)
            .param("projection", "forListView")
            .param("sort", "id,desc")
            .param("size", 10)
            .param("page", 0)
            .log().all()
            .when()
            .get("/api/queryhistories")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

    List<HashMap> queryHistoryList = from(resp.asString()).getList("_embedded.queryhistories", HashMap.class);
    for(HashMap queryHistory : queryHistoryList){
      String query = (String) queryHistory.get("query");
      Assert.isTrue(StringUtils.containsIgnoreCase(query, queryPattern));
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void auditList(){
    String dataConnectionId = "hive-local";
    String queryEditorId = "query-01";
    String searchKeyword = "";
    String from = "2017-08-01T00:00:00.000Z";
    String to = "2017-09-22T23:00:00.000Z";
    QueryResult.QueryResultStatus result = QueryResult.QueryResultStatus.SUCCESS;

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("queryEditorId", queryEditorId)
            .param("dataConnectionId", dataConnectionId)
            .param("searchKeyword", searchKeyword)
            .param("from", from)
            .param("to", to)
            .param("queryResultStatus", result)
            .param("projection", "forAuditList")
            .param("sort", "createdTime,desc")
            .param("size", 10)
            .param("page", 0)
            .log().all()
            .when()
            .get("/api/queryhistories")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

    DateTime fromDateTime = new DateTime(from);
    DateTime toDateTime = new DateTime(to);

    List<HashMap> queryHistoryList = from(resp.asString()).getList("_embedded.queryhistories", HashMap.class);
    for(HashMap queryHistory : queryHistoryList){
      String query = (String) queryHistory.get("query");
      String dc_Id = (String) queryHistory.get("dataConnectionId");
      String qe_Id = (String) queryHistory.get("queryEditorId");
      String username = (String) ((Map)queryHistory.get("createdBy")).get("username");
      Assert.isTrue(StringUtils.containsIgnoreCase(query, searchKeyword)
              || StringUtils.containsIgnoreCase(query, username));
      Assert.isTrue(StringUtils.equals(dc_Id, dataConnectionId));
      Assert.isTrue(StringUtils.equals(qe_Id, queryEditorId));

      DateTime createdTime = new DateTime(queryHistory.get("queryStartTime").toString());
      Assert.isTrue(createdTime.isAfter(fromDateTime));
      Assert.isTrue(createdTime.isBefore(toDateTime));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readQueryHistoryForAudit() {
    long queryHistoryId = 2;

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .log().all()
            .param("projection", "forAuditDetail")
            .when()
            .get("/api/queryhistories/{queryHistoryId}", queryHistoryId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void recentTop5List(){
    String dataConnectionId = "hive-local";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("dataConnectionId", dataConnectionId)
            .param("projection", "forAuditList")
            .param("sort", "createdTime,desc")
            .param("size", 5)
            .param("page", 0)
            .log().all()
            .when()
            .get("/api/queryhistories")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
    List<HashMap> queryHistoryList = from(resp.asString()).getList("_embedded.queryhistories", HashMap.class);
    for(HashMap queryHistory : queryHistoryList){
      String dc_Id = (String) queryHistory.get("dataConnectionId");
      String createdTime = (String) queryHistory.get("createdTime");
      Assert.isTrue(StringUtils.equals(dc_Id, dataConnectionId));
      System.out.println("createdTime : " + createdTime);
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void statsCountStatusByDate(){
    String duration = "-P100D";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("duration", duration)
            .log().all()
            .when()
            .get("/api/queryhistories/stats/count/date")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void statsCountByUser(){
    String duration = "-P100D";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("duration", duration)
            .log().all()
            .when()
            .get("/api/queryhistories/stats/count/user")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void statsCountByElapsed(){
    String duration = "-P100D";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("duration", duration)
            .log().all()
            .when()
            .get("/api/queryhistories/stats/count/elapsed")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listLongQueryTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("sort", "queryTimeTaken,desc")
//            .param("projection", "forListView")
            .log().all()
            .when()
            .get("/api/queryhistories")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listSuccessQueryCountTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("queryResultStatus", "SUCCESS")
            .log().all()
            .when()
            .get("/api/queryhistories/stats/count/query")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listFailQueryCountTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("queryResultStatus", "FAIL")
            .log().all()
            .when()
            .get("/api/queryhistories/stats/count/query")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listNumRowsTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("sort", "numRows,desc")
            .log().all()
            .when()
            .get("/api/queryhistories")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }
}
