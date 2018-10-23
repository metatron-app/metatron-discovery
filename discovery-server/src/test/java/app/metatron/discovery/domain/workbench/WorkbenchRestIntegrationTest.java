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
import org.apache.hive.jdbc.HiveDriver;
import org.apache.http.HttpStatus;
import org.hamcrest.Matchers;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.util.Assert;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.*;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;
import app.metatron.discovery.domain.workspace.folder.Folder;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@Sql({"/sql/workbench.sql"})
public class WorkbenchRestIntegrationTest extends AbstractRestIntegrationTest {

  @Autowired
  WorkbenchProperties workbenchProperties;

  @Autowired
  WorkbenchDataSourceManager workbenchDataSourceManager;

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void createWorkbench() {

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
      .globalVar(globalVarString)
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

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void createWorkbenchWithoutPermission() {

    String workspaceId = "ws-00";
    String dataConnectionId = "stage-hive-connection-for-test";

    Object body = new WorkbenchBuilder()
      .name("workbench-test2")
      .dataConnection(dataConnectionId)
      .workspace(workspaceId)
      .toJson(true)
      .build();

    System.out.println("Request Body: " + body);

    // @formatter:off
    Response workbenchRes =
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(body)
        .when()
        .post("/api/workbenchs");

    workbenchRes.then()
      .statusCode(HttpStatus.SC_FORBIDDEN)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void updateWorkbench() {
    String workspaceId = "ws-02";
    String dataConnectionId = "stage-hive-connection-for-test";

    Object body = new WorkbenchBuilder()
      .name("workbench-test3")
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
        .when()
        .post("/api/workbenchs");

    workbenchRes.then()
      .statusCode(org.apache.http.HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String workbenchId = from(workbenchRes.asString()).get("id");

    String workbenchName = from(workbenchRes.asString()).get("name");
    String patchedDesc = "patched desc";

    Map<String, Object> patchedBody = new HashMap<>();
    patchedBody.put("description", patchedDesc);


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(patchedBody)
    .when()
      .patch("/api/workbenchs/{id}", workbenchId)
    .then()
      .statusCode(org.apache.http.HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "workbenchDefault")
    .when()
      .get("/api/workbenchs/{id}", workbenchId)
    .then()
      .body("name", Matchers.is(workbenchName))
      .body("description", Matchers.is(patchedDesc))
      .statusCode(org.apache.http.HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void deleteWorkbench() {
    String workbenchId = "workbench-03";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workbenchs/{id}", workbenchId)
    .then()
      .body("id", Matchers.is(workbenchId))
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/workbenchs/{id}", workbenchId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workbenchs/{id}", workbenchId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readWorkbench() {
    String workbenchId = "workbench-03";
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "workbenchDetail")
    .when()
      .get("/api/workbenchs/{id}", workbenchId)
    .then()
//      .body("id", Matchers.is(workbenchId))
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readWorkbenchWithDeletedDataConnection() {
    String dataConnectionId = "stage-hive-connection-for-test";
    String workbenchId = "workbench-03";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/connections/{id}", dataConnectionId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/workbenchs/{id}", workbenchId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readWorkbenchWithViewProjection() {
    String workbenchId = "workbench-03";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "workbenchDetail")
    .when()
      .get("/api/workbenchs/{id}", workbenchId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK)
      .body("workspace", Matchers.notNullValue())
      .body("workspace.id", Matchers.is("ws-02"))
      .body("dataConnection", Matchers.notNullValue())
      .body("dataConnection.name", Matchers.is("presto-local"))
      .body("dataConnection.id", Matchers.is("presto-local"))
      ;
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listNavigation() {

    String workbenchId = "workbench-03";
    String workspaceId = "ws-02";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .param("projection", "workbenchNavigation")
            .param("sort", "name,asc")
            .param("size", 20)
            .param("page", 0)
            .log().all()
            .when()
            .get("/api/workbenchs/{workbenchId}/navigation", workbenchId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
    ;
    // @formatter:on

    List<HashMap> workbenchList = from(resp.asString()).getList("_embedded.books", HashMap.class);
    // @formatter:on

    for(HashMap<String, Object> map : workbenchList){
      String bookType = map.get("type").toString();
      String wsId = map.get("workspaceId").toString();
      System.out.println("name = " + map.get("name")
              + ", type = " + map.get("type")
              + ", workspaceId = " + map.get("workspaceId"));

      Assert.isTrue(bookType.equals("workbench"));
      Assert.isTrue(wsId.equals(workspaceId));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listNavigationWithNamePattern() {

    String workbenchId = "workbench-03";
    String workspaceId = "ws-02";
    String namePattern = "03";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .param("projection", "workbenchNavigation")
            .param("sort", "name,asc")
            .param("size", 20)
            .param("page", 0)
            .param("namePattern", namePattern)
            .log().all()
            .when()
            .get("/api/workbenchs/{workbenchId}/navigation", workbenchId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
            ;
    // @formatter:on

    List<HashMap> workbenchList = from(resp.asString()).getList("_embedded.books", HashMap.class);
    // @formatter:on

    for(HashMap<String, Object> map : workbenchList){
      String bookType = map.get("type").toString();
      String wsId = map.get("workspaceId").toString();
      String name = map.get("name").toString();
      System.out.println("name = " + map.get("name")
              + ", type = " + map.get("type")
              + ", workspaceId = " + map.get("workspaceId"));

      Assert.isTrue(bookType.equals("workbench"));
      Assert.isTrue(wsId.equals(workspaceId));
      Assert.isTrue(StringUtils.containsIgnoreCase(name, namePattern));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void readWorkbenchAfterDatabaseChange() {

    String workbenchId = "workbench-03";

    String connectionId = "mysql-local";
    String databaseName = "metatron_datasource";
    String webSocketId = "test-01";

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("workbenchId", workbenchId);
    reqMap.put("webSocketId", webSocketId);

    String reqBody = GlobalObjectMapper.writeValueAsString(reqMap);

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(reqBody)
            .when()
            .post("/api/connections/{connectionId}/createDataSource", connectionId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
    ;

    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(reqBody)
            .log().all()
            .when()
            .post("/api/connections/{connectionId}/databases/{database}/change", connectionId, databaseName)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
    ;

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .log().all()
            .when()
            .get("/api/workbenchs/{workbenchId}", workbenchId)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response()
            ;
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void importFileToPersonalDatabase_when_csv_file() throws IOException {
    // given
    final String webSocketId = "test-ws";
    final String fileName = "product_sales.csv";
    final String hdfsConfPath = "/tmp/hdfs-conf";
    Files.copy(Paths.get(getClass().getClassLoader().getResource(fileName).getPath()),
        Paths.get(String.format("%s/%s", workbenchProperties.getTempCSVPath(), fileName)), REPLACE_EXISTING);

    final String loginUserId = "polaris";

    DataConnection hiveConnection = new DataConnection("HIVE");
    hiveConnection.setUsername("read_only");
    hiveConnection.setPassword("1111");
    hiveConnection.setHostname("localhost");
    hiveConnection.setPort(10000);
    hiveConnection.setProperties("{" +
        "  \"metatron.hdfs.conf.path\": \"" + hdfsConfPath + "\"," +
        "  \"metatron.hive.admin.name\": \"hive_admin\"," +
        "  \"metatron.hive.admin.password\": \"1111\"," +
        "  \"metatron.personal.database.prefix\": \"private\"" +
        "}");
    workbenchDataSourceManager.createDataSourceInfo(hiveConnection, webSocketId);

    cleanUpHivePersonalDatabaseTestFixture(hiveConnection, loginUserId);

    // REST when, then
    final String workbenchId = "workbench-05";
    final String requestBody = "{" +
        "  \"type\": \"csv\"," +
        "  \"tableName\": \"product_sales_2018\"," +
        "  \"firstRowHeadColumnUsed\": true," +
        "  \"filePath\": \"" + String.format("%s/%s", workbenchProperties.getTempCSVPath(), fileName) + "\"," +
        "  \"loginUserId\": \"" + loginUserId + "\"," +
        "  \"webSocketId\": \"" + webSocketId + "\"" +
        "}";

    given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(requestBody)
    .when()
        .post("/api/workbenchs/{id}/import/files", workbenchId)
    .then()
        .log().all()
        .statusCode(HttpStatus.SC_NO_CONTENT);
  }

  private void cleanUpHivePersonalDatabaseTestFixture(DataConnection hiveConnection, String loginUserId) {
    final String URL = String.format("jdbc:hive2://%s:%s", hiveConnection.getHostname(), hiveConnection.getPort());

    Connection conn = null;
    try{
      Class.forName(HiveDriver.class.getName());
      conn = DriverManager.getConnection(URL,
          hiveConnection.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_ADMIN_NAME),
          hiveConnection.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_ADMIN_PASSWORD));

      StringBuffer script = new StringBuffer();
      script.append(String.format("DROP DATABASE IF EXISTS %s_%s CASCADE;",
          hiveConnection.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_PERSONAL_DATABASE_PREFIX),
          loginUserId));

      ScriptUtils.executeSqlScript(conn, new InputStreamResource(new ByteArrayInputStream(script.toString().getBytes())));
    } catch(Exception e){
      e.printStackTrace();
    } finally{
      JdbcUtils.closeConnection(conn);
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void previewImportFile_when_csv_file() throws IOException {
    // given
    final String fileName = "product_sales.csv";
    Files.copy(Paths.get(getClass().getClassLoader().getResource(fileName).getPath()),
        Paths.get(System.getProperty("java.io.tmpdir") + File.separator + fileName), REPLACE_EXISTING);

    // when
    final String workbenchId = "workbench-05";
    Response response =
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .log().all()
        .when()
            .get("/api/workbenchs/{workbenchId}/import/files/{tempFileName}/preview", workbenchId, fileName)
        .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
        .extract().response();

    // then
    Map<String, Object> result = from(response.asString()).get();
    assertThat(result.get("totalRecords")).isEqualTo(9);
    assertThat((List<String>)result.get("fields")).hasSize(5);
    assertThat((List<String>)result.get("fields")).contains("time", "order_id", "amount", "product_id", "sale_count");

    assertThat((List<Map<String, String>>)result.get("records")).hasSize(9);
    assertThat((List<Map<String, String>>)result.get("records")).extracting("time").contains("20/04/2017", "21/04/2017", "22/04/2017", "23/04/2017", "24/04/2017", "25/04/2017", "26/04/2017", "27/04/2017", "28/04/2017");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("order_id").contains("1", "2", "3", "4", "5", "6", "7", "8", "9");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("amount").contains("20", "300", "400", "550", "129", "212", "412", "412", "2111");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("product_id").contains("1", "1", "2", "2", "3", "3", "4", "4", "5");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("sale_count").contains("1", "2", "3", "4", "1", "2", "3", "4", "5");
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void previewImportFile_when_csv_file_firstHeaderRow_false() throws IOException {
    // given
    final String fileName = "product_sales.csv";
    Files.copy(Paths.get(getClass().getClassLoader().getResource(fileName).getPath()),
        Paths.get(System.getProperty("java.io.tmpdir") + File.separator + fileName), REPLACE_EXISTING);

    // when
    final String workbenchId = "workbench-05";
    Response response =
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("firstHeaderRow", false)
            .log().all()
        .when()
            .get("/api/workbenchs/{workbenchId}/import/files/{tempFileName}/preview", workbenchId, fileName)
        .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
        .extract().response();

    // then
    Map<String, Object> result = from(response.asString()).get();
    assertThat(result.get("totalRecords")).isEqualTo(10);
    assertThat((List<String>)result.get("fields")).hasSize(5);
    assertThat((List<String>)result.get("fields")).contains("col_1", "col_2", "col_3", "col_4", "col_5");

    assertThat((List<Map<String, String>>)result.get("records")).hasSize(10);
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_1").contains("time", "20/04/2017","21/04/2017","22/04/2017","23/04/2017","24/04/2017","25/04/2017","26/04/2017","27/04/2017","28/04/2017");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_2").contains("order_id", "1", "2", "3", "4", "5", "6", "7", "8", "9");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_3").contains("amount", "20","300","400","550","129","212","412","412","2111");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_4").contains("product_id", "1","1","2","2","3","3","4","4","5");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_5").contains("sale_count", "1","2","3","4","1","2","3","4","5");
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void previewImportFile_when_excel_file() throws IOException {
    // given
    final String fileName = "sales-product.xlsx";
    Files.copy(Paths.get(getClass().getClassLoader().getResource(fileName).getPath()),
        Paths.get(System.getProperty("java.io.tmpdir") + File.separator + fileName), REPLACE_EXISTING);

    // when
    final String workbenchId = "workbench-05";
    Response response =
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .log().all()
        .when()
            .get("/api/workbenchs/{workbenchId}/import/files/{tempFileName}/preview", workbenchId, fileName)
        .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
        .extract().response();

    // then
    Map<String, Object> result = from(response.asString()).get();
    assertThat(result.get("totalRecords")).isEqualTo(9);
    assertThat((List<String>)result.get("fields")).hasSize(5);
    assertThat((List<String>)result.get("fields")).contains("time", "order_id", "amount", "product_id", "sale_count");

    assertThat((List<Map<String, String>>)result.get("records")).hasSize(9);
    assertThat((List<Map<String, String>>)result.get("records")).extracting("time").contains("20/04/2017", "21/04/2017", "22/04/2017", "23/04/2017", "24/04/2017", "25/04/2017", "26/04/2017", "27/04/2017", "28/04/2017");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("order_id").contains("1", "2", "3", "4", "5", "6", "7", "8", "9");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("amount").contains("20", "300", "400", "550", "129", "212", "412", "412", "2111");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("product_id").contains("1", "1", "2", "2", "3", "3", "4", "4", "5");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("sale_count").contains("1", "2", "3", "4", "1", "2", "3", "4", "5");
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void previewImportFile_when_excel_file_firstHeaderRow_false() throws IOException {
    // given
    final String fileName = "sales-product.xlsx";
    Files.copy(Paths.get(getClass().getClassLoader().getResource(fileName).getPath()),
        Paths.get(System.getProperty("java.io.tmpdir") + File.separator + fileName), REPLACE_EXISTING);

    // when
    final String workbenchId = "workbench-05";
    Response response =
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("firstHeaderRow", false)
            .log().all()
        .when()
            .get("/api/workbenchs/{workbenchId}/import/files/{tempFileName}/preview", workbenchId, fileName)
        .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
        .extract().response();

    // then
    Map<String, Object> result = from(response.asString()).get();
    assertThat(result.get("totalRecords")).isEqualTo(10);
    assertThat((List<String>)result.get("fields")).hasSize(5);
    assertThat((List<String>)result.get("fields")).contains("col_1", "col_2", "col_3", "col_4", "col_5");

    assertThat((List<Map<String, String>>)result.get("records")).hasSize(10);
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_1").contains("time", "20/04/2017","21/04/2017","22/04/2017","23/04/2017","24/04/2017","25/04/2017","26/04/2017","27/04/2017","28/04/2017");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_2").contains("order_id", "1", "2", "3", "4", "5", "6", "7", "8", "9");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_3").contains("amount", "20","300","400","550","129","212","412","412","2111");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_4").contains("product_id", "1","1","2","2","3","3","4","4","5");
    assertThat((List<Map<String, String>>)result.get("records")).extracting("col_5").contains("sale_count", "1","2","3","4","1","2","3","4","5");
  }

}
