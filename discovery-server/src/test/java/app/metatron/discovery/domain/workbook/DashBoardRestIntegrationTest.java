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

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.workbook.configurations.BoardConfiguration;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

/**
 * Created by kyungtaak on 2016. 1. 30..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class DashBoardRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void createDashBoardInWorkbookShouldReturnWorkbookInfo() {

    String workbookId = "wb-001";

    Object body = new DashBoardBuilder()
        .name("dashboard-test")
        .workbook(workbookId)
        .temporaryId("test_temporaryId")
        .toJson(true)
        .build();

    System.out.println("Reqeust Body: " + body);

    // @formatter:off
    Response workBookRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(body)
    .when()
      .post("/api/dashboards");

    workBookRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String dashboardId = from(workBookRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/dashboards/{id}", dashboardId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
    .when()
      .get("/api/workbooks/{id}/dashboards", workbookId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void patchDashBoardWithDatasources() {

    String workbookId = "wb-001";
    String datasourceId = "ds-37";
    String datasourceName = "sales";

    TestUtils.printTestTitle("데이터 소스 연결 스펙 추가");

    DataSource datasource = new DefaultDataSource(datasourceName);
    BoardConfiguration boardConfiguration = new BoardConfiguration(datasource, null, null, null, null, null, null);

    Object body = new DashBoardBuilder()
        .name("dashboard-test")
        .workbook(workbookId)
        .configuration(boardConfiguration)
        .toJson(true)
        .build();

    System.out.println("Reqeust Body: " + body);

    // @formatter:off
    Response workBookRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(body)
    .when()
      .post("/api/dashboards");

    workBookRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String dashboardId = from(workBookRes.asString()).get("id");

    TestUtils.printTestTitle("데이터 소스 객체 연결");

    // 추가적인 datasource 를 지정시 "/api/datasources/{id}\n/api/datasources/{id}..."
    String urls = "/api/datasources/" + datasourceId;

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType("text/uri-list")
      .body(urls)
    .when()
      .put("/api/dashboards/{id}/datasources", dashboardId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetail")
    .when()
      .get("/api/dashboards/{id}", dashboardId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void copyDashBoard() {

    String workbookId = "wb-001";
    String dashBoardId = "db-001";

    TestUtils.printTestTitle("1. Copy DashBoard");

    // @formatter:off
    Response copyRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/dashboards/{id}/copy", dashBoardId);
    copyRes.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    String copiedId = from(copyRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/workbooks/{id}/dashboards", workbookId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql({"/sql/test_workbook.sql", "/sql/test_widget.sql"})
  public void getDashBoardDetailView() {

    String dashBoardId = "db-005";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/dashboards/{dashboardId}", dashBoardId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql({"/sql/test_workbook.sql", "/sql/test_widget.sql"})
  public void getWidgetInDashBoardView() {

    String dashBoardId = "db-001";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("widgetType", "page")
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/dashboards/{dashboardId}/widgets", dashBoardId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_workbook.sql"})
  public void getDataFromDashBoard() {

    String dashboardId = "db-005";

//    SearchQueryRequest request = new SearchQueryRequest();
//    request.setFilters(Lists.newArrayList(new InclusionFilter("Category", Lists.newArrayList("Office Supplies"))));
//    request.setLimits(new Limit(100));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .queryParam("limit", 5)
//      .body(request)
      .log().all()
    .when()
      .post("/api/dashboards/{id}/data", dashboardId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

}
