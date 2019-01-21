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

package app.metatron.discovery.domain.workbook.widget;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.commons.io.FileUtils;
import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.workbook.WidgetBuilder;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.widget.FilterWidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.TextWidgetConfiguration;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class WidgetRestIntegrationTest extends AbstractRestIntegrationTest {
  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void simpleCreateWidget() {

    String dashboardId = "db-001";
    String widgetName = "widget-page-test";

    Object pageWidgetReq = new WidgetBuilder()
        .name("widget-page-test")
        .dashboard(dashboardId)
        .imageUrl("/test/abc.png")
        .type("page")
        .toJson(true)
        .build();

    System.out.println("Reqeust Body: " + pageWidgetReq);

    // @formatter:off
    Response widgetRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(pageWidgetReq)
    .when()
      .post("/api/widgets");

    widgetRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String widgetId = from(widgetRes.asString()).get("id");

    Map<String, Object> patchMap = Maps.newHashMap();
    patchMap.put("name", widgetName + "-patched");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(patchMap)
    .when()
      .patch("/api/widgets/{id}", widgetId)
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
      .get("/api/widgets/{id}", widgetId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql("/sql/test_workbook.sql")
  public void createWidgetByTypeAndReturnWidgetList() {

    String dashboardId = "db-001";

    Filter filter = new InclusionFilter("f1", Lists.newArrayList("v1", "v2", "v3"));

    PageWidgetConfiguration pageConf = new PageWidgetConfiguration();
    pageConf.setFilters(Lists.newArrayList(filter));

    Object pageWidgetReq = new WidgetBuilder()
        .name("widget-page-test")
        .dashboard(dashboardId)
        .imageUrl("/test/abc.png")
        .configuration(pageConf)
        .type("page")
        .toJson(true)
        .build();

    System.out.println("Reqeust Body: " + pageWidgetReq);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(pageWidgetReq)
    .when()
      .post("/api/widgets")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    Object textWidgetReq = new WidgetBuilder()
        .name("widget-text-test")
        .dashboard(dashboardId)
        .configuration(new TextWidgetConfiguration())
        .type("text")
        .contents("<h1>test</h1>")
        .toJson(true)
        .build();

    System.out.println("Reqeust Body: " + textWidgetReq);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(textWidgetReq)
    .when()
      .post("/api/widgets")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    Object filterWidgetReq = new WidgetBuilder()
        .name("widget-filter-test")
        .dashboard(dashboardId)
        .configuration(new FilterWidgetConfiguration(filter))
        .type("filter")
        .toJson(true)
        .build();

    System.out.println("Reqeust Body: " + filterWidgetReq);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(filterWidgetReq)
    .when()
      .post("/api/widgets")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/dashboards/{id}/widgets", dashboardId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  @Sql({"/sql/test_workbook.sql", "/sql/test_widget.sql"})
  public void copyWidget() {

    String dashBoardId = "db-001";
    String widgetId = "widget-page-001";

    TestUtils.printTestTitle("1. Copy Widget");

    // @formatter:off
    Response copyRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/widgets/{id}/copy", widgetId);
    copyRes.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    String copiedId = from(copyRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/dashboards/{id}/widgets", dashBoardId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  @Sql("/sql/test_download_excel.sql")
  public void getDataByWidgetId() throws IOException {

    String widgetId = "widget-page-001";

    // @formatter:off
    Response fileRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .queryParam("original", true)
      .queryParam("preview", false)
      .queryParam("limit", 5)
      .log().all()
    .when()
      .post("/api/widgets/{widgetId}/data", widgetId);
    fileRes.then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  public void getDataByPageWidgetConfiguration() throws IOException {

    PageWidgetConfiguration configuration = new PageWidgetConfiguration();

    DataSource dataSource = new DefaultDataSource("sales");

    Field city = new DimensionField("Category");
    Field salesAvg = new MeasureField("Sales", MeasureField.AggregationType.AVG);

    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(city));
    pivot.setAggregations(Lists.newArrayList(salesAvg));

    configuration.setDataSource(dataSource);
    configuration.setPivot(pivot);

    configuration.setFilters(Lists.newArrayList(new InclusionFilter("Category", Lists.newArrayList("Furniture"))));

    // @formatter:off
    Response fileRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(configuration)
      .queryParam("original", true)
//      .queryParam("preview", true)
      .log().all()
    .when()
      .post("/api/widgets/config/data");
    fileRes.then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  @Sql("/sql/test_download_excel.sql")
  public void downloadExcelByWidgetId() throws IOException {

    String widgetId = "widget-page-001";

    // @formatter:off
    Response fileRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept("application/vnd.ms-excel")
      .queryParam("original", true)
      .log().all()
    .when()
      .post("/api/widgets/{widgetId}/download", widgetId);
    fileRes.then()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on

    InputStream is = fileRes.getBody().asInputStream();

    FileUtils.copyInputStreamToFile(is, new File("/tmp/test1.xlsx"));

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  public void downloadExcelByWidgetConfig() throws IOException {

    PageWidgetConfiguration configuration = new PageWidgetConfiguration();

    DataSource dataSource = new DefaultDataSource("sales");

    Field city = new DimensionField("Category");
    Field salesAvg = new MeasureField("Sales", MeasureField.AggregationType.AVG);

    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(city));
    pivot.setAggregations(Lists.newArrayList(salesAvg));

    configuration.setDataSource(dataSource);
    configuration.setPivot(pivot);

    configuration.setFilters(Lists.newArrayList(new InclusionFilter("Category", Lists.newArrayList("Furniture"))));

    // @formatter:off
    Response fileRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept("application/vnd.ms-excel")
      .queryParam("original", true)
      .body(configuration)
      .log().all()
    .when()
      .post("/api/widgets/config/download");
    fileRes.then()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on

    InputStream is = fileRes.getBody().asInputStream();

    FileUtils.copyInputStreamToFile(is, new File("/tmp/test1.xlsx"));

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_WORKBOOK"})
  public void getBaseMapsInMapView() throws IOException {

    // @formatter:off
    Response fileRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/widgets/properties/mapview");
    fileRes.then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

}
