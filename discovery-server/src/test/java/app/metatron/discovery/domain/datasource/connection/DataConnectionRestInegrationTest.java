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

package app.metatron.discovery.domain.datasource.connection;

import app.metatron.discovery.fixture.HiveTestFixture;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataconnection.ConnectionRequest;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
  public class DataConnectionRestInegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris@metatron.com", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void available() {
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/connections/available").
    then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createConnection() throws JsonProcessingException {

    DataConnection connection = new DataConnection();
    connection.setImplementor("H2");
    connection.setName("connection name");
    connection.setHostname("localhost");
    connection.setDatabase("polaris-datasources");
    connection.setUsername("sa");
    connection.setPassword("sa");

    String reqBody = GlobalObjectMapper.writeValueAsString(connection);

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(reqBody)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/connections");

    String connId = from(createResponse.asString()).get("id");

    createResponse.then()
//      .statusCode(HttpStatus.SC_CREATED)
//      .body("id", any(String.class))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createConnectionAndCreateDataSource() throws JsonProcessingException {
    DataConnection h2Conn = new DataConnection();
    h2Conn.setImplementor("H2");
    h2Conn.setName("H2Connection");
    h2Conn.setHostname("localhost");
    h2Conn.setPort(3306);
    h2Conn.setUsername("sa");
    h2Conn.setPassword("sa");

    String reqBody = GlobalObjectMapper.writeValueAsString(h2Conn);

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(reqBody)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/connections");

    String connId = from(createResponse.asString()).get("id");

    createResponse.then()
//      .statusCode(HttpStatus.SC_CREATED)
//      .body("id", any(String.class))
    .log().all();

    Map<String, Object> createDatasourceReqMap = Maps.newHashMap();
    createDatasourceReqMap.put("name", "datasource-connection");
    createDatasourceReqMap.put("connection", "/api/h2Connection/" + connId);

    String dsReqBody = GlobalObjectMapper.writeValueAsString(createDatasourceReqMap);
    // @formatter:off
    createResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(dsReqBody)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources");

    createResponse.then().log().all();

    String dataSourceId = from(createResponse.asString()).get("id");

    createResponse.then()
//      .statusCode(HttpStatus.SC_CREATED)
//      .body("id", any(String.class))
    .log().all();


    // @formatter:off
//    given()
//      .auth().oauth2(oauth_token)
//      .contentType(ContentType.JSON)
//    .when()
//      .get("/api/connections/{id}", connId).
//    then()
//      .statusCode(HttpStatus.SC_OK)
//    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_ADMIN", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createConnectionAndAddDeleteWorkspaceReference() throws JsonProcessingException {

    TestUtils.printTestTitle("1. Create Connection!");

    DataConnection h2Conn = new DataConnection();
    h2Conn.setImplementor("H2");
    h2Conn.setName("H2Connection");
    h2Conn.setHostname("localhost");
    h2Conn.setPort(3306);
    h2Conn.setUsername("sa");
    h2Conn.setPassword("sa");

    String reqBody = GlobalObjectMapper.writeValueAsString(h2Conn);

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(reqBody)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/connections");
    createResponse.then()
    .log().all();

    TestUtils.printTestTitle("2-1. Connection내 워크스페이스 전체 수정(Replace)");

    String connId = from(createResponse.asString()).get("id");
    String workspacesLink = from(createResponse.asString()).get("_links.workspaces.href");

    // Put Workspace
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType("text/uri-list")
      .body("/api/workspaces/ws-00\n/api/workspaces/ws-02")
      .log().all()
    .when()
      .put("/api/connections/{id}/workspaces", connId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2-2. Connection 내 워크스페이스 연결 추가");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType("text/uri-list")
      .body("/api/workspaces/ws-03")
      .log().all()
    .when()
      .patch("/api/connections/{connId}/workspaces", connId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2-2. Connection 내 워크스페이스 연결 삭제");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .log().all()
    .when()
      .delete("/api/connections/{connId}/workspaces/{workspaceId}", connId,"ws-02")
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Connection 내 워크스페이스 연결 조회");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/connections/{connId}/workspaces", connId)
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces.name", hasItems(workspace1.getName(), workspace2.getName()))
    .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void checkConnection() throws JsonProcessingException {

    DataConnection connection = new DataConnection();
    connection.setImplementor("MYSQL");
    connection.setHostname("255.255.255.0");
    connection.setPort(3306);
    connection.setUsername("sa");
    connection.setPassword("sa");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/check").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void checkMysqlConnection() throws JsonProcessingException {

    DataConnection connection = new DataConnection();
    connection.setImplementor("MYSQL");
    connection.setHostname("localhost");
    connection.setPort(3306);
    connection.setDatabase("sample");
    connection.setUsername("polaris");
    connection.setPassword("polaris");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
            .log().all()
    .when()
      .post("/api/connections/query/check").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void checkConnectionWithUserInfo() throws JsonProcessingException {

    DataConnection connection = new DataConnection();
    connection.setImplementor("MYSQL");
    connection.setHostname("localhost");
    connection.setPort(3306);
    connection.setDatabase("sample");
    connection.setAuthenticationType(JdbcConnectInformation.AuthenticationType.USERINFO);

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(request)
            .when()
            .post("/api/connections/query/check").
            then()
            .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
            .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showMysqlDataBases() throws JsonProcessingException {

    DataConnection connection = new DataConnection();
    connection.setImplementor("MYSQL");
    connection.setHostname("localhost");
//    connection.setPort(3306);
    connection.setDatabase("polaris_datasources");
    connection.setUsername("root");
    connection.setPassword("root");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/databases").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showMysqlSchemas() throws JsonProcessingException {

    DataConnection connection = new DataConnection();
    connection.setImplementor("MYSQL");
    connection.setHostname("localhost");
//    connection.setPort(3306);
    connection.setDatabase("polaris_datasources");
    connection.setUsername("root");
    connection.setPassword("root");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/schemas").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showMysqlTables() throws JsonProcessingException {

    DataConnection connection = new DataConnection();
    connection.setImplementor("MYSQL");
    connection.setHostname("localhost");
    connection.setPort(3306);
    connection.setUsername("root");
    connection.setPassword("root");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase("polaris_datasources");


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/connections/query/tables").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showMysqlTablesByConnection() throws JsonProcessingException {

    DataConnection connection = new DataConnection("MYSQL");
    connection.setName("test");
    connection.setHostname("localhost");
    connection.setPort(3306);
    connection.setDatabase("sample");
    connection.setUsername("sample");
    connection.setPassword("sample00");

    String reqBody = GlobalObjectMapper.writeValueAsString(connection);

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(reqBody)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/connections");

    createResponse.then()
//      .statusCode(HttpStatus.SC_CREATED)
//      .body("id", any(String.class))
    .log().all();
    // @formatter:on

    String connId = from(createResponse.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/connections/{connId}/databases/test/tables", connId).
    then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showMysqlDatabaseByConnection() throws JsonProcessingException {

    DataConnection connection = new DataConnection("MYSQL");
    connection.setName("test");
    connection.setHostname("localhost");
    connection.setPort(3306);
    connection.setDatabase("sample");
    connection.setUsername("sample");
    connection.setPassword("sample00");

    String reqBody = GlobalObjectMapper.writeValueAsString(connection);

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(reqBody)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/connections");

    createResponse.then()
//      .statusCode(HttpStatus.SC_CREATED)
//      .body("id", any(String.class))
    .log().all();
    // @formatter:on

    String connId = from(createResponse.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/connections/{connId}/databases", connId).
    then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showOracleDatabaseByConnection() throws JsonProcessingException {

    DataConnection connection = new DataConnection("ORACLE");
    connection.setName("test");
    connection.setHostname("ora11.cof5lvzznx9y.ap-northeast-2.rds.amazonaws.com");
    connection.setPort(1521);
    connection.setSid("ora11");
    connection.setUsername("metatron");
    connection.setPassword("metatron");

    String reqBody = GlobalObjectMapper.writeValueAsString(connection);

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(reqBody)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/connections");

    createResponse.then()
//      .statusCode(HttpStatus.SC_CREATED)
//      .body("id", any(String.class))
    .log().all();
    // @formatter:on

    String connId = from(createResponse.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/connections/{connId}/databases", connId).
    then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showOracleTablesByConnection() throws JsonProcessingException {

    DataConnection connection = new DataConnection("ORACLE");
    connection.setName("test");
    connection.setHostname("ora11.cof5lvzznx9y.ap-northeast-2.rds.amazonaws.com");
    connection.setPort(1521);
    connection.setSid("ora11");
    connection.setUsername("metatron");
    connection.setPassword("metatron");

    String reqBody = GlobalObjectMapper.writeValueAsString(connection);

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(reqBody)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/connections");

    createResponse.then()
//      .statusCode(HttpStatus.SC_CREATED)
//      .body("id", any(String.class))
    .log().all();
    // @formatter:on

    String connId = from(createResponse.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/connections/{connId}/metatron", connId).
    then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showMysqlTableData() throws JsonProcessingException {

    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    connection.setPort(3306);
    connection.setUsername("polaris");
    connection.setPassword("polaris");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase("polaris_datasources");
    request.setType(JdbcIngestionInfo.DataType.TABLE);
    request.setQuery("sales");


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/connections/query/data").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showPrestoTable() throws JsonProcessingException {

    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setPort(8080);
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase("default");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/tables").
    then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showPrestoSchema() throws JsonProcessingException {

    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setPort(8080);
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setDatabase("default");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/schemas").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void queryMysqlBySelectTableCase() throws JsonProcessingException {

    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    connection.setPort(3306);
//    connection.setDatabase("polaris_datasources");
    connection.setUsername("root");
    connection.setPassword("root");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase("polaris");
    request.setType(JdbcIngestionInfo.DataType.QUERY);
    request.setQuery("select * from book");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/data").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void queryPrestoBySelectTableCase() throws JsonProcessingException {

    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("jnn-g07-02");
    connection.setPort(18080);
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase("tpch");
    request.setType(JdbcIngestionInfo.DataType.QUERY);
    request.setQuery("select * from region");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/data").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showPhoenixSchemas() throws JsonProcessingException {

    DataConnection connection = new DataConnection("PHOENIX");
    connection.setHostname("localhost");
    connection.setPort(2181);
    connection.setDatabase("hbase");
    connection.setUsername("root");
    connection.setPassword("root");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/schemas").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showPhoenixTables() throws JsonProcessingException {

    DataConnection connection = new DataConnection("PHOENIX");
    connection.setHostname("localhost");
    connection.setPort(2181);
    connection.setDatabase("hbase");
    connection.setUsername("polaris");
    connection.setPassword("polaris");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/tables").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void checkConnectionForPostgresql() throws JsonProcessingException {

    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setDatabase("etl");
    connection.setUsername("etl");
    connection.setPassword("metatron$$00");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/check").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showSchemaForPostgresql() throws JsonProcessingException {

    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setDatabase("etl");
    connection.setUsername("etl");
    connection.setPassword("metatron$$00");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/schemas").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showTablesForPostgresql() throws JsonProcessingException {

    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setDatabase("etl");
    connection.setUsername("etl");
    connection.setPassword("metatron$$00");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase("public");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/tables").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void queryBySelectTableForPostgresql() throws JsonProcessingException {

    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setDatabase("etl");
    connection.setUsername("etl");
    connection.setPassword("metatron$$00");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setType(JdbcIngestionInfo.DataType.TABLE);
    request.setDatabase("public");
    request.setQuery("store");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/data").
    then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void checkConnectionForHive() throws JsonProcessingException {

    DataConnection connection = new DataConnection("HIVE");
    connection.setHostname("localhost");
    connection.setPort(10000);
    connection.setUsername("hive");
    connection.setPassword("hive");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/check").
    then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showSchemasForHive() throws JsonProcessingException {

    DataConnection connection = new DataConnection("HIVE");
    connection.setHostname("localhost");
    connection.setPort(10000);
    connection.setUsername("hive");
    connection.setPassword("hive");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/schemas").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }


  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showTablesForHive() throws JsonProcessingException {

    DataConnection connection = new DataConnection("HIVE");
    connection.setHostname("localhost");
    connection.setPort(10000);
    connection.setUsername("hive");
    connection.setPassword("hive");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase("default");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/tables").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void queryHiveBySelectTableCase1() throws JsonProcessingException {

    DataConnection connection = new DataConnection("HIVE");
    connection.setHostname("localhost");
    connection.setPort(10000);
    connection.setUsername("hive");
    connection.setPassword("hive");

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase("tpch");
    request.setType(JdbcIngestionInfo.DataType.QUERY);
    request.setQuery("select * from region");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/connections/query/data").
    then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getDetailConnection()  {

    String id = "mysql-connection";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/connections/{id}", id)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListForType() throws JsonProcessingException {

    // @formatter:off
    Response resp =
      given()
        .auth().oauth2(oauth_token)
        .accept(ContentType.JSON)
        .contentType(ContentType.JSON)
        .param("projection", "forSimpleListView")
        .param("size", "100")
        .param("type", "jdbc")
        .log().all()
      .when()
        .get("/api/connections")
      .then()
        .log().all()
        .statusCode(HttpStatus.SC_OK)
        .body("_embedded.connections", hasSize(18))
        .extract().response();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListForAllUsageScope() throws JsonProcessingException {

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;

    // @formatter:on

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
            "name = " + connectionMap.get("name")
            + ", implementor = " + connectionMap.get("implementor")
            + ", createTime = " + connectionMap.get("createdTime")
            + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListForDefault() throws JsonProcessingException {

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("projection", "list")
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "name = " + connectionMap.get("name")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListForWorkbench() throws JsonProcessingException {

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("projection", "list")
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "name = " + connectionMap.get("name")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListForWorkbenchByAuthType() throws JsonProcessingException {
    String authenticationType = "DIALOG";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("projection", "list")
                    .param("authenticationType", authenticationType)
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "name = " + connectionMap.get("name")
                      + ", authenticationType = " + connectionMap.get("authenticationType")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
      Assert.isTrue(connectionMap.get("authenticationType").equals(authenticationType));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListByImplementor() throws JsonProcessingException {

    String implementor = "MYSQL";
    // @formatter:off
    Response resp =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .param("projection", "list")
      .param("implementor", implementor)
    .when()
      .get("/api/connections")
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK)
      .extract().response()
    ;
    // @formatter:on

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "ame = " + connectionMap.get("name")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
      Assert.isTrue(connectionMap.get("implementor").equals(implementor));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListByName() throws JsonProcessingException {

    String namePattern = "LOCAL";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("projection", "list")
                    .param("name", namePattern)
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;

    // @formatter:on

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "name = " + connectionMap.get("name")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
      Assert.isTrue(StringUtils.containsIgnoreCase(connectionMap.get("name").toString(), namePattern));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListWithSortName() throws JsonProcessingException {

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("projection", "list")
                    .param("sort", "name,asc")
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;

    // @formatter:on

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "name = " + connectionMap.get("name")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListWithSortModifiedTime() throws JsonProcessingException {

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("projection", "list")
                    .param("sort", "modifiedTime,asc")
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;

    // @formatter:on

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "name = " + connectionMap.get("name")
                      + ", authenticationType = " + connectionMap.get("authenticationType")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListWithRange() throws JsonProcessingException {

    String from = "2017-08-01T00:00:00.000Z";
    String to = "2017-09-22T23:00:00.000Z";
    String searchDateBy = "MODIFIED";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("projection", "list")
                    .param("sort", "modifiedTime,asc")
                    .param("from", from)
                    .param("to", to)
                    .param("searchDateBy", searchDateBy)
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;

    // @formatter:on

    DateTime fromDateTime = new DateTime(from);
    DateTime toDateTime = new DateTime(to);

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "name = " + connectionMap.get("name")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
      );
      DateTime modifiedTime = new DateTime(connectionMap.get("modifiedTime").toString());
      Assert.isTrue(modifiedTime.isAfter(fromDateTime));
      Assert.isTrue(modifiedTime.isBefore(toDateTime));
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void getListWithParameter() throws JsonProcessingException {

    String from = "2017-08-01T00:00:00.000Z";
    String to = "2017-09-22T23:00:00.000Z";
    String searchDateBy = "MODIFIED";
    String namePattern = "meta";
    String implementor = "MYSQL";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("projection", "list")
                    .param("sort", "modifiedTime,asc")
                    .param("from", from)
                    .param("to", to)
                    .param("searchDateBy", searchDateBy)
                    .param("name", namePattern)
                    .param("implementor", implementor)
                    .when()
                    .get("/api/connections")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;

    // @formatter:on

    DateTime fromDateTime = new DateTime(from);
    DateTime toDateTime = new DateTime(to);

    List<HashMap> connectionList = from(resp.asString()).getList("_embedded.connections", HashMap.class);
    for(HashMap<String, Object> connectionMap : connectionList){
      System.out.println(
                      "name = " + connectionMap.get("name")
                      + ", implementor = " + connectionMap.get("implementor")
                      + ", createTime = " + connectionMap.get("createdTime")
                      + ", modifiedTime = " + connectionMap.get("modifiedTime")
                      + ", createdBy = " + connectionMap.get("createdBy")
      );
      HashMap<String, String> createdByMap = (HashMap) connectionMap.get("createdBy");
      DateTime modifiedTime = new DateTime(connectionMap.get("modifiedTime").toString());
      Assert.isTrue(modifiedTime.isAfter(fromDateTime));
      Assert.isTrue(modifiedTime.isBefore(toDateTime));
      Assert.isTrue(StringUtils.containsIgnoreCase(connectionMap.get("name").toString(), namePattern)
                  || StringUtils.containsIgnoreCase(createdByMap.get("username"), namePattern));
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createWorkbenchConnection() throws JsonProcessingException {
    DataConnection connection = new DataConnection("HIVE");
    connection.setName("Hive-For-Workbench");
    connection.setHostname("localhost");
    connection.setPort(10000);
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setAuthenticationType(JdbcConnectInformation.AuthenticationType.MANUAL);

    String reqBody = GlobalObjectMapper.writeValueAsString(connection);

    // @formatter:off
    Response createResponse =
            given()
                    .auth().oauth2(oauth_token)
                    .body(reqBody)
                    .log().all()
                    .contentType(ContentType.JSON)
                    .when()
                    .post("/api/connections");

    String connId = from(createResponse.asString()).get("id");

    createResponse.then()
      .statusCode(HttpStatus.SC_CREATED)
            .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchHiveTable() throws JsonProcessingException {

    String connectionId = "hive-connection";
    String database = "default";
    String tableNamePattern = "rt";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("tableName", tableNamePattern)
                    .when()
                    .get("/api/connections/{connectionId}/databases/{database}/tables", connectionId, database )
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on

    List<String> tableList = from(resp.asString()).getList("tables", String.class);
    for(String tableName : tableList){
      System.out.println("tableName = " + tableName);
      Assert.isTrue(StringUtils.containsIgnoreCase(tableName, tableNamePattern));
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchMySqlDatabase() throws JsonProcessingException {

    String connectionId = "mysql-local-connection";
    String databaseName = "on";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("databaseName", databaseName)
                    .param("size", 10)
                    .param("page", 0)
                    .when()
                    .get("/api/connections/{connectionId}/databases", connectionId)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<String> databaseList = from(resp.asString()).getList("databases", String.class);
    for(String database : databaseList){
      System.out.println(database);
      Assert.isTrue(StringUtils.containsIgnoreCase(database, databaseName));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchMySqlTables() throws JsonProcessingException {

    String connectionId = "mysql-local-connection";
    String databaseName = "metatron";
    String tableNamePattern = "prep";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("tableName", tableNamePattern)
//                    .param("size", 10)
//                    .param("page", 0)
                    .when()
                    .get("/api/connections/{connectionId}/databases/{databaseName}/tables", connectionId, databaseName)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<String> tableList = from(resp.asString()).getList("tables", String.class);
    for(String tableName : tableList){
      System.out.println("tableName = " + tableName);
      Assert.isTrue(StringUtils.containsIgnoreCase(tableName, tableNamePattern));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchHiveDatabase() throws JsonProcessingException {

    String connectionId = "hive-connection";
    String databaseName = "def";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("databaseName", databaseName)
//                    .param("size", 10)
//                    .param("page", 1)
                    .when()
                    .get("/api/connections/{connectionId}/databases", connectionId)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<String> databaseList = from(resp.asString()).getList("databases", String.class);
    for(String database : databaseList){
      System.out.println(database);
      Assert.isTrue(StringUtils.containsIgnoreCase(database, databaseName));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchHiveColumns() throws JsonProcessingException {

    //Path Variable
    String connectionId = "hive-connection";
    String databaseName = "default";
    String tableName = "sales";

    //Request Param Variable
    String webSocketId = "test01";
    String columnNamePattern = "";

    Map<String, Object> reqMap = new HashMap<>();
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

    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("columnNamePattern", columnNamePattern)
                    .param("webSocketId", webSocketId)
                    .param("size", 20)
                    .param("page", 0)
                    .when()
                    .get("/api/connections/{connectionId}/databases/{databaseName}/tables/{tableName}/columns", connectionId, databaseName, tableName)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<Map> columnList = from(resp.asString()).getList("columns", Map.class);
    for(Map<String, Object> columnMap : columnList){
      String columnType = (String) columnMap.get("columnType");
      String columnName = (String) columnMap.get("columnName");
      System.out.println(columnName + " : " + columnType);
      Assert.isTrue(StringUtils.containsIgnoreCase(columnName, columnNamePattern));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void showHiveTableInfo() throws JsonProcessingException {

    //Path Variable
    String connectionId = "hive-connection";
    String databaseName = "default";
    String tableName = "mart1";

    //Request Param Variable
    String webSocketId = "test01";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("webSocketId", webSocketId)
                    .when()
                    .get("/api/connections/{connectionId}/databases/{databaseName}/tables/{tableName}/information", connectionId, databaseName, tableName)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    Map<String, Object> tableInformationMap = from(resp.asString()).getMap("");
    for(String key : tableInformationMap.keySet()){
      System.out.println(key + " = " + tableInformationMap.get(key));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchPrestoDatabase() throws JsonProcessingException {

    String connectionId = "presto-connection";
    String databaseName = "def";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("databaseName", databaseName)
//                    .param("size", 10)
//                    .param("page", 1)
                    .when()
                    .get("/api/connections/{connectionId}/databases", connectionId)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<String> databaseList = from(resp.asString()).getList("databases", String.class);
    for(String database : databaseList){
      System.out.println(database);
      Assert.isTrue(StringUtils.containsIgnoreCase(database, databaseName));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchPostgresDatabase() throws JsonProcessingException {

    String connectionId = "postgres-local";
    String databaseName = "SCHE";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("databaseName", databaseName)
//                    .param("size", 10)
//                    .param("page", 1)
                    .when()
                    .get("/api/connections/{connectionId}/databases", connectionId)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<String> databaseList = from(resp.asString()).getList("databases", String.class);
    for(String database : databaseList){
      System.out.println(database);
      Assert.isTrue(StringUtils.containsIgnoreCase(database, databaseName));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchPostgresTable() throws JsonProcessingException {

    String connectionId = "postgres-local";
    String databaseName = " ";
    String tableNamePattern = "";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("tableName", tableNamePattern)
                    .param("size", 5)
                    .param("page", 0)
                    .when()
                    .get("/api/connections/{connectionId}/databases/{database}/tables", connectionId, databaseName)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<String> tableList = from(resp.asString()).getList("tables", String.class);
    for(String table : tableList){
      System.out.println(table);
      Assert.isTrue(StringUtils.containsIgnoreCase(table, tableNamePattern));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchPhoenixSchema() throws JsonProcessingException {

    String connectionId = "phoenix-local";
    String databaseNamePattern = "sche";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("databaseName", databaseNamePattern)
                    .param("size", 5)
                    .param("page", 0)
                    .when()
                    .get("/api/connections/{connectionId}/databases", connectionId)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<String> databaseList = from(resp.asString()).getList("databases", String.class);
    for(String database : databaseList){
      System.out.println(database);
      Assert.isTrue(StringUtils.containsIgnoreCase(database, databaseNamePattern));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void searchPhoenixTables() throws JsonProcessingException {

    String connectionId = "phoenix-local";
    String databaseName = " ";
    String tableNamePattern = "abl";

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .param("tableName", tableNamePattern)
                    .param("size", 5)
                    .param("page", 0)
                    .when()
                    .get("/api/connections/{connectionId}/databases/{database}/tables", connectionId, databaseName)
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    List<String> tableList = from(resp.asString()).getList("tables", String.class);
    for(String table : tableList){
      System.out.println(table);
      Assert.isTrue(StringUtils.containsIgnoreCase(table, tableNamePattern));
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_dataconnection.sql"})
  public void changeHiveSchema() throws JsonProcessingException {

    String connectionId = "hive-local";
    String databaseName = "default";
    String webSocketId = "test-01";

    Map<String, Object> reqMap = new HashMap<>();
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

    Response resp =
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
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createConnectionPublished(){

    String ownerWsId = "ws-02";
    String othersWsId = "ws-05";
    String sharedWsId = "ws-03";

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("name", "H2Conn");
    reqMap.put("implementor", "H2");
    reqMap.put("type", "JDBC");
    reqMap.put("hostname", "localhost");
    reqMap.put("port", 3306);
    reqMap.put("username", "sa");
    reqMap.put("password", "sa");
    reqMap.put("published", true);

    //1. 전체공개 Connection 생성
    String connId = createConnection(reqMap);

    //2. 목록조회
    List ownersConnectionList = getConnectionList("list", ownerWsId);
    List othersConnectionList = getConnectionList("list", othersWsId);
    List sharedConnectionList = getConnectionList("list", sharedWsId);

    Assert.isTrue(ownersConnectionList.size() == 1);
    Assert.isTrue(othersConnectionList.size() == 1);
    Assert.isTrue(sharedConnectionList.size() == 1);

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createConnectionNotPublished(){
    String ownerWsId = "ws-02";
    String othersWsId = "ws-05";
    String sharedWsId = "ws-03";

    List<String> wsList = new ArrayList<>();
    wsList.add("/api/workspaces/" + ownerWsId);
    wsList.add("/api/workspaces/" + sharedWsId);

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("name", "H2Conn");
    reqMap.put("implementor", "H2");
    reqMap.put("type", "JDBC");
    reqMap.put("hostname", "localhost");
    reqMap.put("port", 3306);
    reqMap.put("username", "sa");
    reqMap.put("password", "sa");
    reqMap.put("published", false);
    reqMap.put("workspaces", wsList);

    //1. 본인 공유 Workspace 공개된 Connection 생성
    String connId = createConnection(reqMap);

    //2. 목록조회
    List ownersConnectionList = getConnectionList("list", ownerWsId);
    List othersConnectionList = getConnectionList("list", othersWsId);
    List sharedConnectionList = getConnectionList("list", sharedWsId);

    Assert.isTrue(ownersConnectionList.size() == 1);
    Assert.isTrue(othersConnectionList.size() == 0);
    Assert.isTrue(sharedConnectionList.size() == 1);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void patchConnectionToWorkspace(){
    String ownerWsId = "ws-02";
    String othersWsId = "ws-05";
    String sharedWsId = "ws-03";

    List<String> wsList = new ArrayList<>();
    wsList.add("/api/workspaces/" + ownerWsId);

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("name", "H2Conn");
    reqMap.put("implementor", "H2");
    reqMap.put("type", "JDBC");
    reqMap.put("hostname", "localhost");
    reqMap.put("port", 3306);
    reqMap.put("username", "sa");
    reqMap.put("password", "sa");
    reqMap.put("published", false);
    reqMap.put("workspaces", wsList);

    //1. 본인 Workspace에 공개하여 등록
    String connId = createConnection(reqMap);

    //2. 타인 Workspace에 공개 (Patch)
    List<String> patchWsList = new ArrayList<>();
    patchWsList.add("/api/workspaces/" + ownerWsId);
    patchWsList.add("/api/workspaces/" + othersWsId);

    Map<String, Object> patchMap = new HashMap<>();
    patchMap.put("workspaces", patchWsList);

    patchConnection(connId, patchMap);

    //3. 목록 조회
    List ownersConnectionList = getConnectionList("list", ownerWsId);
    List othersConnectionList = getConnectionList("list", othersWsId);
    List sharedConnectionList = getConnectionList("list", sharedWsId);

    Assert.isTrue(ownersConnectionList.size() == 1);
    Assert.isTrue(othersConnectionList.size() == 1);
    Assert.isTrue(sharedConnectionList.size() == 0);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void connectionAfterWorkspaceDelete(){
    String ownerWsId = "ws-02";

    List<String> wsList = new ArrayList<>();
    wsList.add("/api/workspaces/" + ownerWsId);

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("name", "H2Conn");
    reqMap.put("implementor", "H2");
    reqMap.put("type", "JDBC");
    reqMap.put("hostname", "localhost");
    reqMap.put("port", 3306);
    reqMap.put("username", "sa");
    reqMap.put("password", "sa");
    reqMap.put("published", false);
    reqMap.put("workspaces", wsList);

    //1. 본인 Workspace에 공개하여 등록
    createConnection(reqMap);

    //2. 전체 목록조회
    List connectionList = getConnectionList("list", "");

    //3. Workspace 삭제
    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .when()
            .delete("/api/workspaces/" + ownerWsId);
    // @formatter:on

    //4. 전체 목록조회
    List connectionListAfterDelete = getConnectionList("list", "");
    List ownersConnectionListAfterDelete = getConnectionList("list", ownerWsId);

    Assert.isTrue(connectionList.size() == 1);
    Assert.isTrue(connectionListAfterDelete.size() == 1);
    Assert.isTrue(ownersConnectionListAfterDelete.size() == 0);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void workspaceAfterConnectionDelete(){
    String ownerWsId = "ws-02";

    List<String> wsList = new ArrayList<>();
    wsList.add("/api/workspaces/" + ownerWsId);

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("name", "H2Conn");
    reqMap.put("implementor", "H2");
    reqMap.put("type", "JDBC");
    reqMap.put("hostname", "localhost");
    reqMap.put("port", 3306);
    reqMap.put("username", "sa");
    reqMap.put("password", "sa");
    reqMap.put("published", false);
    reqMap.put("workspaces", wsList);

    //1. 본인 Workspace에 공개하여 등록
    String connId = createConnection(reqMap);

    //2. 전체 목록조회
    List workspaceList = getWorkspaceList();

    //3. Connection 삭제
    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .when()
            .delete("/api/connections/" + connId);
    // @formatter:on

    //4. 전체 목록조회
    List workspaceListAfterDelete = getWorkspaceList();

    Assert.isTrue(workspaceList.size() == 4);
    Assert.isTrue(workspaceListAfterDelete.size() == 4);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void listConnectionMultiple(){

    String ownerWsId = "ws-02";
    String othersWsId = "ws-05";
    String sharedWsId = "ws-03";

    Map<String, Object> reqMap = new HashMap<>();
    reqMap.put("name", "H2Conn1");
    reqMap.put("implementor", "H2");
    reqMap.put("type", "JDBC");
    reqMap.put("hostname", "localhost");
    reqMap.put("port", 3306);
    reqMap.put("username", "sa");
    reqMap.put("password", "sa");
    reqMap.put("published", true);

    //1. 전체공개 Connection 생성
    String connId1 = createConnection(reqMap);

    //2. 전체공개 Connection 생성
    reqMap.put("name", "H2Conn2");
    String connId2 = createConnection(reqMap);

    //3. 일부공개 Connection 생성
    List<String> wsList = new ArrayList<>();
    wsList.add("/api/workspaces/" + ownerWsId);

    reqMap.put("name", "H2Conn3");
    reqMap.put("published", false);
    reqMap.put("workspaces", wsList);
    String connId3 = createConnection(reqMap);

    //2. 목록조회
    List ownersConnectionList = getConnectionList("list", ownerWsId);
    List othersConnectionList = getConnectionList("list", othersWsId);
    List sharedConnectionList = getConnectionList("list", sharedWsId);

    Assert.isTrue(ownersConnectionList.size() == 3);
    Assert.isTrue(othersConnectionList.size() == 2);
    Assert.isTrue(sharedConnectionList.size() == 2);

  }

  private String createConnection(Map reqMap){
    String reqBody = GlobalObjectMapper.writeValueAsString(reqMap);
    // @formatter:off
    Response createResponse =
            given()
                    .auth().oauth2(oauth_token)
                    .body(reqBody)
                    .log().all()
                    .contentType(ContentType.JSON)
                    .when()
                    .post("/api/connections");
    // @formatter:on

    //2. 타인 Workspace에 공개 (Patch)
    String connId = from(createResponse.asString()).get("id");
    return connId;
  }

  private void patchConnection(String connectionId, Map reqMap){
    String reqBody = GlobalObjectMapper.writeValueAsString(reqMap);
    // @formatter:off
    Response createResponse =
            given()
                    .auth().oauth2(oauth_token)
                    .body(reqBody)
                    .log().all()
                    .contentType(ContentType.JSON)
                    .when()
                    .patch("/api/connections/" + connectionId);
    // @formatter:on
  }

  private List getConnectionList(String projection, String workspaceId){
    // @formatter:off
    Response resp = given().auth().oauth2(oauth_token).accept(ContentType.JSON).contentType(ContentType.JSON)
            .param("projection", projection)
            .when()
//            .get("/api/connections/workspaces/{workspaceId}", workspaceId)
            .get("/api/workspaces/{workspaceId}/connections", workspaceId)
            .then().log().all().statusCode(HttpStatus.SC_OK).extract().response()
            ;
    // @formatter:on
    Map respMap = from(resp.asString()).getMap("_embedded");
    List connections = (respMap == null ? new ArrayList<>() : (List) respMap.get("connections"));
    return connections;
  }

  private List getWorkspaceList(){
    // @formatter:off
    Response resp = given().auth().oauth2(oauth_token).accept(ContentType.JSON).contentType(ContentType.JSON)
            .when()
            .get("/api/workspaces")
            .then().log().all().statusCode(HttpStatus.SC_OK).extract().response()
            ;
    // @formatter:on
    Map respMap = from(resp.asString()).getMap("_embedded");
    List workspaces = (respMap == null ? new ArrayList<>() : (List) respMap.get("workspaces"));
    return workspaces;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void tableInformationForQuery(){

    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    connection.setPort(3306);
    connection.setUsername("polaris");
    connection.setPassword("polaris");

    String databaseName = "sample";
    String tableName = "sales";

    ConnectionRequest request = new ConnectionRequest();
    request.setConnection(connection);
    request.setDatabase(databaseName);
    request.setTable(tableName);

    // @formatter:off
    Response resp =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .body(request)
                    .log().all()
                    .when()
                    .post("/api/connections/query/information")
                    .then()
                    .log().all()
                    .statusCode(HttpStatus.SC_OK)
                    .extract().response()
            ;
    // @formatter:on
    Map<String, Object> tableInformationMap = from(resp.asString()).getMap("");
    for(String key : tableInformationMap.keySet()){
      System.out.println(key + " = " + tableInformationMap.get(key));
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showDatabaseForHiveIngestion() throws JsonProcessingException {

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .when()
            .post("/api/connections/query/hive/databases")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showTableForHiveIngestion() throws JsonProcessingException {

    ConnectionRequest request = new ConnectionRequest();
    request.setDatabase("default");

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(request)
            .log().all()
            .when()
            .post("/api/connections/query/hive/tables")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showTableDataForHiveIngestionNonePartitionCSV() throws JsonProcessingException {

    ConnectionRequest request = new ConnectionRequest();
    request.setDatabase("default");
    request.setType(JdbcIngestionInfo.DataType.TABLE);
    request.setQuery("sample_ingestion");

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(request)
            .log().all()
            .when()
            .post("/api/connections/query/hive/data")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showTableDataForHiveIngestionNonePartitionORC() throws JsonProcessingException {

    ConnectionRequest request = new ConnectionRequest();
    request.setDatabase("default");
    request.setType(JdbcIngestionInfo.DataType.TABLE);
    request.setQuery("sample_ingestion_orc");


    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(request)
            .log().all()
            .when()
            .post("/api/connections/query/hive/data")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showTableDataForHiveIngestionPartitionCSV() throws JsonProcessingException {

    ConnectionRequest request = new ConnectionRequest();
    request.setDatabase("default");
    request.setType(JdbcIngestionInfo.DataType.TABLE);
    request.setQuery("contract_date_non_parti_1");

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(request)
            .log().all()
            .when()
            .post("/api/connections/query/hive/data")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void showTableDataForHiveIngestionPartitionORC() throws JsonProcessingException {

    ConnectionRequest request = new ConnectionRequest();
    request.setDatabase("default");
    request.setType(JdbcIngestionInfo.DataType.TABLE);
    request.setQuery("sample_ingestion_partition_parti_orc");

    // @formatter:off
    given()
            .auth().oauth2(oauth_token)
            .accept(ContentType.JSON)
            .contentType(ContentType.JSON)
            .body(request)
            .log().all()
            .when()
            .post("/api/connections/query/hive/data")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
    // @formatter:on
  }

  @Test
  @Sql({"/sql/test_dataconnection.sql"})
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void queryForListOfDatabasesByConnectionId_when_filter_database_hive_connection() {
    // given
    HiveTestFixture.setUpDefaultDatabaseFixture();
    final String connectionId = "hive-local-manual-conn";
    final String filteringDatabaseName = "metatron";

    // REST when
    Response resp =
        given()
          .auth().oauth2(oauth_token)
        .when()
          .get("/api/connections/{connectionId}/databases?databaseName={filteringDatabaseName}", connectionId, filteringDatabaseName)
        .then()
          .log().all()
          .statusCode(HttpStatus.SC_OK)
        .extract().response();

    // then
    List<String> databases = from(resp.asString()).getList("databases", String.class);
    assertThat(databases).hasSize(1);
    assertThat(databases.get(0)).isEqualTo("metatron_test_db");
  }

}
