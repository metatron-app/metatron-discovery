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

package app.metatron.discovery.domain.datasource;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.StringMessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.io.File;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.datasource.connection.jdbc.HawqConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.MySQLConnection;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.datasource.ingestion.BatchPeriod;
import app.metatron.discovery.domain.datasource.ingestion.DiscardRule;
import app.metatron.discovery.domain.datasource.ingestion.HdfsIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.RealtimeIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.ReplaceRule;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ExcelFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.JsonFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.OrcFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ParquetFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SingleIngestionInfo;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.util.JsonPatch;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE;
import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK;
import static app.metatron.discovery.domain.datasource.DataSource.DataSourceType.MASTER;
import static app.metatron.discovery.domain.datasource.DataSource.GranularityType.DAY;
import static app.metatron.discovery.domain.datasource.DataSource.GranularityType.HOUR;
import static app.metatron.discovery.domain.datasource.DataSource.GranularityType.MONTH;
import static app.metatron.discovery.domain.datasource.DataSource.GranularityType.SECOND;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.FILE;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.HDFS;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.HIVE;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.JDBC;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.NONE;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.REALTIME;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.DIMENSION;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.MEASURE;
import static app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP;
import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.hamcrest.Matchers.any;
import static org.hamcrest.Matchers.is;

/**
 * Created by kyungtaak on 2016. 1. 30..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class DataSourceRestIntegrationTest extends AbstractRestIntegrationTest {

  private WebSocketStompClient stompClient;

  private BlockingQueue<String> blockingQueue;

  private final WebSocketHttpHeaders webSocketHttpHeaders = new WebSocketHttpHeaders();

  @Before
  public void setUp() {
    RestAssured.port = serverPort;

    List<Transport> transports = Lists.newArrayList(new WebSocketTransport(new StandardWebSocketClient()));

    this.blockingQueue = new LinkedBlockingDeque<>();

    this.stompClient = new WebSocketStompClient(new SockJsClient(transports));
    this.stompClient.setMessageConverter(new MappingJackson2MessageConverter());
    this.stompClient.setMessageConverter(new StringMessageConverter());
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void dataSourceList() {
    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/datasources");

    createResponse.then()
      .statusCode(HttpStatus.SC_OK)
//      .body("id", any(String.class))
    .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void dataSourceDetail() {
    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/datasources/{id}", "ds-37");

    createResponse.then()
      .statusCode(HttpStatus.SC_OK)
//      .body("id", any(String.class))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void updateDataSourceFields() throws JsonProcessingException {
    // add DataSource with Fields
    //
    TestUtils.printTestTitle("1. add DataSource with Fields include filteringOption property");

    Field f1 = new Field("filtering field1", DataType.TIMESTAMP, TIMESTAMP, 0L);
    f1.setFiltering(true);
    f1.setFilteringSeq(0L);
    f1.setFilteringOptions(new Field.FilterOption("time", "relative", Lists.newArrayList("range", "relative")));
    Field f2 = new Field("filtering field2", DataType.TEXT, DIMENSION, 1L);
    f2.setFiltering(true);
    f2.setFilteringSeq(1L);
    f2.setFilteringOptions(new Field.FilterOption("inclusion", "single_list", Lists.newArrayList("single_list", "single_combo")));
    Field f3 = new Field("filtering field3", DataType.TEXT, DIMENSION, 2L);


    DataSource dataSource = new DataSourceBuilder()
            .name("DataSource")
            .type(MASTER)
            .ownerId("polaris")
            .fields(f1, f2, f3).build();

    dataSource.setConnType(ENGINE);
    dataSource.setSrcType(NONE);

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(dataSource)
      .log().all()
    .when()
      .post("/api/datasources");

    createResponse.then()
      .statusCode(HttpStatus.SC_CREATED)
      .body("id", any(String.class))
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Update fields ");
    //
    String dataSourceId = from(createResponse.asString()).get("id");
    Integer field1Id = from(createResponse.asString()).get("fields[0].id");
    Integer field2Id = from(createResponse.asString()).get("fields[1].id");

    // 필드 추가/수정/삭제
    Map<String, Object> addField = Maps.newHashMap();
    addField.put("op", "add");
    addField.put("name", "add field name");
    addField.put("type", "string");
    addField.put("role", "DIMENSION");
    addField.put("seq", 3);

    Map<String, Object> updateField = Maps.newHashMap();
    updateField.put("op", "replace");
    updateField.put("id", field1Id);
    updateField.put("alias", "update field name");
    updateField.put("description", "update description");
//    updateField.put("filtering", false);
    updateField.put("filteringOptions", new Field.FilterOption("time", "range", Lists.newArrayList("range", "relative")));

    Map<String, Object> removeField = Maps.newHashMap();
    removeField.put("op", "remove");
    removeField.put("id", field2Id);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(addField, updateField, removeField))
      .log().all()
    .when()
      .patch("/api/datasources/{id}/fields", dataSourceId).
    then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Result. ");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/datasources/{id}", dataSourceId).
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("name", is(workspace1.getName()))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_ADMIN", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithMapType() throws JsonProcessingException {

    Field field1 = new Field("id", DataType.STRING, DIMENSION, 1L);
    Field field2 = new Field("kvMap", DataType.MAP, DIMENSION, 2L);
    Field field3 = new Field("keyArray", DataType.ARRAY, DIMENSION, 3L);
    field3.setLogicalType(LogicalType.MAP_KEY);

    Field field4 = new Field("keyValue", DataType.ARRAY, DIMENSION, 4L);
    field4.setLogicalType(LogicalType.MAP_VALUE);

    field2.setMappedField(Sets.newHashSet(field3, field4));

    DataSource dataSource1 = new DataSourceBuilder()
            .name("datasource1")
            .fields(
              field1, field2
            )
            .build();

    System.out.println("################\n" + GlobalObjectMapper.writeValueAsString(dataSource1));

    // @formatter:off
    Response addResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(dataSource1))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources");

    String dataSourceId = from(addResponse.asString()).get("id");

    addResponse.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/datasources/{id}", dataSourceId);

    createResponse.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();


  }


  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_ADMIN", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceAndAddDeleteWorkspaceReference() throws JsonProcessingException {

    TestUtils.printTestTitle("1. Create Datasoucre!");

    DataSource dataSource1 = new DataSourceBuilder()
            .name("datasource1").build();

    // @formatter:off
    Response addResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(dataSource1))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources");

    addResponse.then()
      .statusCode(HttpStatus.SC_CREATED)
      .body("name", is(dataSource1.getName()))
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2-1. 데이터 소스내 워크스페이스 전체 수정(Replace)");

    String dataSourceId = from(addResponse.asString()).get("id");
    String workspacesLink = from(addResponse.asString()).get("_links.workspaces.href");

    // Add Workspace
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body("/api/workspaces/ws-02")
      .contentType("text/uri-list")
    .when()
      .put(workspacesLink)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2-2. 데이터 소스내 워크스페이스 연결 추가");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body("/api/workspaces/ws-03")
      .contentType("text/uri-list")
    .when()
      .patch(workspacesLink)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2-2. 데이터 소스내 워크스페이스 연결 삭제");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
    .when()
      .delete(workspacesLink + "/ws-02")
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. 데이터 소스내 워크스페이스 연결 조회");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get(workspacesLink)
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces.name", hasItems(workspace1.getName(), workspace2.getName()))
    .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_datasource_list.sql"})
  public void findByMultipleIds() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/datasources/{id}/multiple", "ds-test-03,ds-test-04").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.dataSources", hasSize(2))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_datasource_list.sql", "/scripts/default_join_datasource.sql"})
  public void findDataSources() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .param("dsType", "master")
      .param("connType", "engine")
      .param("srcType", "jdbc")
      .param("linkedMetadata", false)
//      .param("status", "preparing")
//      .param("published", "false")
//      .param("nameContains", "real")
//      .param("searchDateBy", "created")
//      .param("from", "2017-09-11")
//      .param("to", "2017-09-12")
//      .param("sort", "name,asc")
      .log().all()
    .when()
      .get("/api/datasources")
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.dataSources", hasSize(2))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql({"/sql/test_datasource_list.sql"})
  public void findDetailDataSources() {

    String datasourceId = "ds-test-03";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/datasources/{id}", datasourceId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.dataSources", hasSize(2))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void getDataFromDataSources() {

    String datasourceId = "ds-37";

//    SearchQueryRequest request = new SearchQueryRequest();
//    request.setFilters(Lists.newArrayList(new InclusionFilter("Category", Lists.newArrayList("Office Supplies"))));
//    request.setLimits(new Limit(100));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .queryParam("limit", 5)
      //.body(request)
      .log().all()
    .when()
      .post("/api/datasources/{id}/data", datasourceId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void findByDataSourceSearchInWorkspace() {

    // @formatter:off
    given()
     .auth().oauth2(oauth_token)
      .param("workspaceId", "ws-02")
      .param("dsType", "MASTER")
      .contentType(ContentType.JSON).
    when()
      .get("/api/datasources/search/type").
    then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.dataSources", hasSize(2))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void patchDataSource() throws JsonProcessingException {


    List<JsonPatch> patches = Lists.newArrayList(
        //new JsonPatch(JsonPatch.Operations.REPLACE, "/name", "test"),
        new JsonPatch(JsonPatch.Operations.REMOVE, "/fields/0"),
        new JsonPatch(JsonPatch.Operations.REPLACE, "/fields/1/filteringOptions", "[{\"type\": \"USER_DEFINED\", \"default\": true}]"),
        new JsonPatch(JsonPatch.Operations.REPLACE, "/fields/2/filteringOptions", "[{\"type\": \"USER_DEFINED\", \"default\": true}]")
    );

    System.out.println(GlobalObjectMapper.writeValueAsString(patches));

    // @formatter:off
    Response connRes =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType("application/json-patch+json")
      .body(patches)
    .when()
      .patch("/api/datasources/ds-37");


    connRes.then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void findConnectableDataSourceByWorkspaceId() throws JsonProcessingException {

    // connection 생성
    HawqConnection connection1 = new HawqConnection();
    connection1.setDatabase("gpadmin");
    connection1.setHostname("exntu.kr");
    connection1.setName("Test connection");
    connection1.setUsername("gpadmin");
    connection1.setPassword("gpadmin");
    connection1.setPort(42432);

    // @formatter:off
    // connection 생성
    Response addResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(connection1))
      .contentType(ContentType.JSON)
    .when()
      .post("api/connections");

    String connectionId = from(addResponse.asString()).get("id");
    // @formatter:on

    // ds 생성
    DataSource dataSource1 = new DataSourceBuilder()
            .name("Published datasource")
            .type(MASTER)
            .ownerId("kyungtaak@sk.com")
            .published(true)
            .build();


    // @formatter:off
    // 퍼블릭 데이터소스 생성
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(dataSource1))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources");

    // 조회
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/datasources/search/connectable?workspaceId=ws-02")
    .then()
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void uploadLocalExcelFileAndQuerySheet() {

    String filePath = "./src/test/resources/ingestion/";
    File file = new File(filePath + "sample_ingestion.xlsx");
//    File file = new File(filePath + "export.xlsx");

    // 파일업로드
    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .multiPart("file", file)
    .when()
      .post("/api/datasources/file/upload");

    res.then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();

    String fileKey = from(res.asString()).getString("filekey");

    List<String> sheets = from(res.asString()).get("sheets");

    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .param("sheet", sheets.get(0))
      .param("limit", 5)
      .param("firstHeaderRow", true)
      .log().all()
    .when()
      .get("/api/datasources/file/{fileName}/data", fileKey)
    .then()
       .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void uploadLocalCsvFileAndQuery() {

//    String filePath = "./src/test/resources/ingestion/";
//    File file = new File(filePath + "sample_ingestion.csv");
        File file = new File("/Users/kyungtaak/Downloads/citycsv.csv");

    // 파일업로드
    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .multiPart("file", file)
      .log().all()
    .when()
      .post("/api/datasources/file/upload");

    res.then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();

    String fileKey = from(res.asString()).getString("filekey");

    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
//      .param("sheet", sheets.get(0))
      .param("lineSep", "\n")
      .param("columnSeq", ",")
      .param("limit", 5)
      .param("firstHeaderRow", true)
      .log().all()
    .when()
      .get("/api/datasources/file/{fileName}/data", fileKey)
    .then()
       .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/sales_hive.sql")
  public void findDataSourceByDatabaseName() throws JsonProcessingException {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/datasources/search/database?name=default&workspaceId=ws-02")
    .then()
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchDataSourceByKeyword() throws JsonProcessingException {

    DataSource dataSource1 = new DataSourceBuilder()
        .name("test1")
        .description("desc")
        .build();

    // @formatter:off
    Response addResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(dataSource1))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources");

    String dataSourceId = from(addResponse.asString()).get("id");

    addResponse.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .param("q", "*test*")
    .when()
      .get("/api/datasources/search/keyword")
    .then()
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchDataSourceByQuery() throws JsonProcessingException {

    DataSource dataSource1 = new DataSourceBuilder()
        .name("test1")
        .description("desc")
        .build();

    dataSource1.setDsType(MASTER);

    // @formatter:off
    Response addResponse =
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(dataSource1))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources");

    addResponse.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String dataSourceId = from(addResponse.asString()).get("id");

    // Add Workspace
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body("/api/workspaces/ws-02")
      .contentType("text/uri-list")
    .when()
      .put("/api/datasources/" + dataSourceId + "/workspaces")
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .param("projection", "forList")
//      .param("q", "+(alias:test* AND dsType:MASTER AND workspaces.id:ws-02 AND ownerId:polaris AND createdTime.ymd:[2017-01-02 TO 2017-02-04] AND modifiedTime.ymd:[2017-01-02 TO 2017-02-04])")
//      .param("q", "+(dsType:MASTER AND (workspaces.id:ws-02 OR published:true))")
//      .param("q", "+(alias:data~* AND dsType:MASTER)")
      .param("q", "+(alias:\\~* AND dsType:MASTER)")
        .param("size", 10)
        .param("sort","alias,desc")
    .when()
      .get("/api/datasources/search/query")
    .then()
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithNoneIngestion() throws JsonProcessingException {

    DataSource dataSource = new DataSource();
    dataSource.setName("Non-Ingestion");
    dataSource.setEngineName("non-Ingestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(NONE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithContext() throws JsonProcessingException {

    TestUtils.printTestTitle("1. 최초 DataSource 생성시 Context 지정");

    DataSource dataSource = new DataSource();
    dataSource.setName("context_datasource");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(NONE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    // Context 추가
    Map<String, String> contexts = Maps.newHashMap();
    contexts.put("prop1", "value1");
    contexts.put("prop2", "value2");

    dataSource.setContexts(GlobalObjectMapper.writeValueAsString(contexts));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    String dataSourceId = from(dsRes.asString()).get("id");


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/datasources/{id}", dataSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. DataSource 수정시 Context 수정");

    DataSource updateDataSource = new DataSource();
    updateDataSource.setName("context_datasource - updated");

    // Context 추가
    Map<String, String> updatedContexts = Maps.newHashMap();
    updatedContexts.put("prop1", "value1 - updated");
    updatedContexts.put("prop3", "value3");

    updateDataSource.setContexts(GlobalObjectMapper.writeValueAsString(updatedContexts));

    reqBody = GlobalObjectMapper.writeValueAsString(updateDataSource);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .patch("/api/datasources/{id}", dataSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/datasources/{id}", dataSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Context key/value 값을 통해 Domain(datasource) 값을 로드");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("key", "prop1")
//      .param("domainProjection", "forDetailView")
      .log().all()
    .when()
      .get("/api/contexts/domains/{domainType}", "datasource")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithLinkType() throws JsonProcessingException {

    DataSource dataSource = new DataSource();
    dataSource.setName("Linked DataSource");
    dataSource.setEngineName("linked_datasource");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(LINK);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    // Add Connection Info
    MySQLConnection dataConnection = new MySQLConnection();
    dataConnection.setHostname("localhost");
    dataConnection.setPort(3306);
    dataConnection.setUsername("polaris");
    dataConnection.setPassword("polaris");
    dataConnection.setDatabase("polaris_datasources");

    LinkIngestionInfo ingestionInfo = new LinkIngestionInfo();
    ingestionInfo.setConnection(dataConnection);
    ingestionInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    ingestionInfo.setDatabase("polaris_datasources");
    ingestionInfo.setQuery("sample_ingestion");
    ingestionInfo.setExpired(3600);

    dataSource.setIngestionInfo(ingestionInfo);

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithLocalCsvFileIngestion() throws JsonProcessingException {

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_space.csv").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localFileIngestion_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));

    Field field1 = new Field("sd", DataType.STRING, DIMENSION, 2L);
    field1.setRemoved(true);
    fields.add(field1);

    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));

    Field field2 = new Field("m2", DataType.DOUBLE, MEASURE, 4L);
    field2.setRemoved(true);
    fields.add(field2);

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(false);
    localFileIngestionInfo.setFormat(new CsvFileFormat("\u0020", "\n"));

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(localFileIngestionInfo));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void appendDataSourceWithLocalCsvFileIngestion() throws JsonProcessingException {

    // profile 을 h2-in-memory-db -> h2-default-db 로 변경, initial 삭제
    // createDataSourceWithLocalCsvFileIngestion() 수행후 ID 추출
    String dataSourceId = "2c1c58ce-16e7-4c71-8d6b-822c21c9049e";
    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_append.csv").getPath();

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(false);
    localFileIngestionInfo.setFormat(new CsvFileFormat());

    String reqBody = GlobalObjectMapper.writeValueAsString(localFileIngestionInfo);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .put("/api/datasources/{dataSourceId}/data", dataSourceId);

    dsRes.then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithLocalExcelFileIngestion() throws JsonProcessingException {

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion.xlsx").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localExcelFileIngestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.TEXT, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(true);
    localFileIngestionInfo.setFormat(new ExcelFileFormat(0));

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(localFileIngestionInfo));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithRealTimeIngestion() throws JsonProcessingException {

    DataSource dataSource = new DataSource();
    dataSource.setName("RealTime_Ingestion_" + System.currentTimeMillis());
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(SECOND);
    dataSource.setSegGranularity(HOUR);
    dataSource.setSrcType(REALTIME);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("event_time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d1", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("d2", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    RealtimeIngestionInfo ingestionInfo = new RealtimeIngestionInfo();
    ingestionInfo.setRollup(false);
    ingestionInfo.setFormat(new JsonFileFormat());
    ingestionInfo.setConsumerType(RealtimeIngestionInfo.ConsumerType.KAFKA);
    ingestionInfo.setTopic("test_topic");

    Map<String, Object> consumeProperties = Maps.newHashMap();
    consumeProperties.put("bootstrap.servers", "localhost:9092");
    ingestionInfo.setConsumerProperties(consumeProperties);

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(ingestionInfo));

    //String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(dataSource)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
//      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithHdfsFileIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String targetFile = "/Users/kyungtaak/sample_ingestion.csv";

    DataSource dataSource = new DataSource();
    dataSource.setName("HdfsFileIngestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(HDFS);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    HdfsIngestionInfo hdfsIngestionInfo = new HdfsIngestionInfo();
    hdfsIngestionInfo.setPaths(Lists.newArrayList(targetFile));
    hdfsIngestionInfo.setFindRecursive(false);

    Map<String, Object> jobProp = Maps.newHashMap();
    jobProp.put("mapreduce.reduce.java.opts", "-server -Xmx1024m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
    jobProp.put("mapreduce.reduce.memory.mb", "1024");
    jobProp.put("mapreduce.reduce.cpu.vcores", "1");
    jobProp.put("mapreduce.map.java.opts", "-server -Xmx1024m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
    jobProp.put("mapreduce.map.memory.mb", "1024");
    jobProp.put("mapreduce.map.cpu.vcores", "1");
    hdfsIngestionInfo.setJobProperties(jobProp);

    hdfsIngestionInfo.setFormat(new CsvFileFormat());

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(hdfsIngestionInfo));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
    .when()
      .post("/api/datasources");

    dsRes.then()
//      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithHdfsParquetFileIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String targetFile = "/user/hive/warehouse/sample_ingestion_parquet/*";

    DataSource dataSource = new DataSource();
    dataSource.setName("HdfsFileIngestion_qarquet_" + System.currentTimeMillis());
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(HDFS);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    HdfsIngestionInfo hdfsIngestionInfo = new HdfsIngestionInfo();
    hdfsIngestionInfo.setPaths(Lists.newArrayList(targetFile));
    hdfsIngestionInfo.setFindRecursive(false);

    Map<String, Object> jobProp = Maps.newHashMap();
    jobProp.put("mapreduce.reduce.java.opts", "-server -Xmx1024m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
    jobProp.put("mapreduce.reduce.memory.mb", "1024");
    jobProp.put("mapreduce.reduce.cpu.vcores", "1");
    jobProp.put("mapreduce.map.java.opts", "-server -Xmx1024m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
    jobProp.put("mapreduce.map.memory.mb", "1024");
    jobProp.put("mapreduce.map.cpu.vcores", "1");
    hdfsIngestionInfo.setJobProperties(jobProp);

    hdfsIngestionInfo.setFormat(new ParquetFileFormat());

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(hdfsIngestionInfo));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
    .when()
      .post("/api/datasources");

    dsRes.then()
//      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithHiveCsvNonPartitionTableIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String sourceTable = "default.sample_ingestion_types";

    DataSource dataSource = new DataSource();
    dataSource.setName("Hive Ingestion CSV None Partition " + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(HIVE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));
    fields.add(new Field("m3", DataType.DOUBLE, MEASURE, 5L));
    fields.add(new Field("d1", DataType.STRING, DIMENSION, 6L));

    dataSource.setFields(fields);

    Map<String,Object> context = Maps.newHashMap();

    HiveIngestionInfo hiveIngestionInfo = new HiveIngestionInfo(
        new CsvFileFormat(),
        sourceTable,
        null,
        null,
        null,
        null,
        context);

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(hiveIngestionInfo));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
//      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    //Spec
    /*

    {
   "type":"index_hynix",
   "spec":{
      "dataSchema":{
         "dataSource":"hive_ingestion_csv_none_partition_ijmha",
         "parser":{
            "type":"string",
            "parseSpec":{
               "format":"csv",
               "dimensionsSpec":{
                  "dimensions":[
                     "d",
                     "sd"
                  ],
                  "dimensionExclusions":[

                  ],
                  "spatialDimensions":[

                  ]
               },
               "timestampSpec":{
                  "column":"time",
                  "format":"auto",
                  "replaceWrongColumn":false
               },
               "columns":[
                  "time",
                  "d",
                  "sd",
                  "m1",
                  "m2",
                  "m3"
               ]
            }
         },
         "metricsSpec":[
            {
               "type":"count",
               "name":"count"
            },
            {
               "type":"sum",
               "name":"m1",
               "fieldName":"m1",
               "inputType":"double"
            },
            {
               "type":"sum",
               "name":"m2",
               "fieldName":"m2",
               "inputType":"double"
            },
            {
               "type":"sum",
               "name":"m3",
               "fieldName":"m3",
               "inputType":"double"
            }
         ],
         "granularitySpec":{
            "type":"uniform",
            "segmentGranularity":"MONTH",
            "queryGranularity":"DAY",
            "intervals":[
               "1970-01-01/2050-01-01"
            ]
         }
      },
      "ioConfig":{
         "type":"hadoop",
         "inputSpec":{
            "type":"hive",
            "source":"default.sample_ingestion_types",
            "metastoreUri":"thrift://metatron-poc-h03:9083"
         }
      },
      "tuningConfig":{
         "type":"hadoop",
         "ingestionMode":"REDUCE_MERGE",
         "useCombiner":false,
         "jobProperties":{
            "mapreduce.map.memory.mb":"4096",
            "mapreduce.task.files.preserve.filepattern":".*",
            "mapreduce.reduce.memory.mb":"4096",
            "keep.task.files.pattern":".*",
            "mapreduce.map.java.opts":"-server -Xmx4096m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps",
            "mapreduce.reduce.java.opts":"-server -Xmx4096m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps"
         },
         "buildV9Directly":true,
         "maxRowsInMemory":3000000,
         "maxOccupationInMemory":1024000000,
         "maxShardLength":256000000,
         "partitionsSpec":{
            "type":"sized",
            "targetPartitionSize":0
         }
      }
   },
   "context":{

   }
}

  */

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithOrcNonPartitionHiveTableIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String sourceTable = "default.sample_ingestion_types_orc";

    DataSource dataSource = new DataSource();
    dataSource.setName("Hive Ingestion orc none partition " + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(HIVE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));
    fields.add(new Field("m3", DataType.DOUBLE, MEASURE, 5L));
    fields.add(new Field("d1", DataType.STRING, DIMENSION, 6L));

    dataSource.setFields(fields);

    Map<String,Object> context = Maps.newHashMap();
//    context.put(HiveIngestionInfo.KEY_ORC_SCHEMA, "struct<time:date,d:string,sd:string,m1:double,m2:double>");

    HiveIngestionInfo hiveIngestionInfo = new HiveIngestionInfo(
            new OrcFileFormat(), //new CsvFileFormat(),
            sourceTable,
            null,
            null,
            null,
            null,
            context);
    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(hiveIngestionInfo));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
            given()
                    .auth().oauth2(oauth_token)
                    .contentType(ContentType.JSON)
                    .body(reqBody)
                    .log().all()
                    .when()
                    .post("/api/datasources");

    dsRes.then()
//      .statusCode(HttpStatus.SC_CREATED)
            .log().all();
    // @formatter:on

    //Ingestion Spec

    /*

    {
   "type":"index_hynix",
   "spec":{
      "dataSchema":{
         "dataSource":"hive_ingestion_orc_none_partition_ecvof",
         "parser":{
            "type":"orc",
            "parseSpec":{
               "format":"timeAndDims",
               "dimensionsSpec":{
                  "dimensions":[
                     "d",
                     "sd",
                     "d1"
                  ],
                  "dimensionExclusions":[

                  ],
                  "spatialDimensions":[

                  ]
               },
               "timestampSpec":{
                  "column":"time",
                  "format":"auto",
                  "replaceWrongColumn":false
               }
            },
            "typeString":"struct<time:string,d:string,sd:string,m1:bigint,m2:int,m3:decimal(5,2),d1:varchar(300)>"
         },
         "metricsSpec":[
            {
               "type":"count",
               "name":"count"
            },
            {
               "type":"sum",
               "name":"m1",
               "fieldName":"m1",
               "inputType":"double"
            },
            {
               "type":"sum",
               "name":"m2",
               "fieldName":"m2",
               "inputType":"double"
            },
            {
               "type":"sum",
               "name":"m3",
               "fieldName":"m3",
               "inputType":"double"
            }
         ],
         "granularitySpec":{
            "type":"uniform",
            "segmentGranularity":"MONTH",
            "queryGranularity":"DAY",
            "intervals":[
               "1970-01-01/2050-01-01"
            ]
         }
      },
      "ioConfig":{
         "type":"hadoop",
         "inputSpec":{
            "type":"hive",
            "source":"default.sample_ingestion_types_orc",
            "metastoreUri":"thrift://metatron-poc-h03:9083"
         }
      },
      "tuningConfig":{
         "type":"hadoop",
         "ingestionMode":"REDUCE_MERGE",
         "useCombiner":false,
         "jobProperties":{
            "mapreduce.map.memory.mb":"4096",
            "mapreduce.task.files.preserve.filepattern":".*",
            "mapreduce.reduce.memory.mb":"4096",
            "keep.task.files.pattern":".*",
            "mapreduce.map.java.opts":"-server -Xmx4096m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps",
            "mapreduce.reduce.java.opts":"-server -Xmx4096m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps"
         },
         "buildV9Directly":true,
         "maxRowsInMemory":3000000,
         "maxOccupationInMemory":1024000000,
         "maxShardLength":256000000,
         "partitionsSpec":{
            "type":"sized",
            "targetPartitionSize":0
         }
      }
   },
   "context":{

   }
}

     */
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithHiveOrcPartitionTableIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String sourceTable = "default.sample_ingestion_partition_parti_orc";

    DataSource dataSource = new DataSource();
    dataSource.setName("Hive Ingestion orc partition " + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(DAY);
    dataSource.setSrcType(HIVE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));
    dataSource.setFields(fields);

    Map<String,Object> context = Maps.newHashMap();

    List<String> intervals = Lists.newArrayList("2017-01-01/2017-12-01");

    List<Map<String,Object>> partitions = Lists.newArrayList();
    partitions.add(TestUtils.makeMap("ym", "201704"));

    HiveIngestionInfo hiveIngestionInfo = new HiveIngestionInfo(
            new OrcFileFormat(), //new CsvFileFormat(),
            sourceTable,
            partitions,
            null,
            null,
            intervals,
            context);

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(hiveIngestionInfo));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void appendDataSourceWithHiveOrcPartitionTableIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String dataSourceId = "0a3958c6-6c48-4804-be36-ec113fc85547";
    String sourceTable = "default.sample_ingestion_partition_parti_orc";

    List<String> intervals = Lists.newArrayList("2016-04-01/2017-12-01");

    List<Map<String,Object>> partitions = Lists.newArrayList();
    partitions.add(TestUtils.makeMap("ym", "201705"));

    HiveIngestionInfo hiveIngestionInfo = new HiveIngestionInfo(
        new OrcFileFormat(), //new CsvFileFormat(),
        sourceTable,
        partitions,
        null,
        null,
        intervals,
        null);

    String reqBody = GlobalObjectMapper.writeValueAsString(hiveIngestionInfo);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .put("/api/datasources/{dataSourceId}/data", dataSourceId);

    dsRes.then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createDataSourceWithHiveTableIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String sourceTable = "default.sample_ingestion_orc";
//    String metastoreUri = "thrift://metatron-poc-h03:9083";
//    String typeString = "struct<time:date,d:string,sd:string,m1:double,m2:double>";

    DataSource dataSource = new DataSource();
    dataSource.setName("Hive File Ingestion orc " + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(HIVE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    //    Map<String, String> jobProp = Maps.newHashMap();
    //    jobProp.put("mapreduce.reduce.java.opts", "-server -Xmx1024m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
    //    jobProp.put("mapreduce.reduce.memory.mb", "1024");
    //    jobProp.put("mapreduce.reduce.cpu.vcores", "1");
    //    jobProp.put("mapreduce.map.java.opts", "-server -Xmx1024m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
    //    jobProp.put("mapreduce.map.memory.mb", "1024");
    //    jobProp.put("mapreduce.map.cpu.vcores", "1");

    Map<String,Object> context = Maps.newHashMap();
//    context.put(HiveIngestionInfo.KEY_HIVE_METASTORE, metastoreUri);
//    context.put(HiveIngestionInfo.KEY_ORC_SCHEMA, typeString);

    List<Map<String,Object>> partitions = Lists.newArrayList();
    partitions.add(TestUtils.makeMap("ym", "201704", "dd", "21"));
    partitions.add(TestUtils.makeMap("ym", "201705"));

    HiveIngestionInfo hiveIngestionInfo = new HiveIngestionInfo(
            new OrcFileFormat(), //new CsvFileFormat(),
            sourceTable,
            partitions,
            null,
            null,
            null,
            context);

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(hiveIngestionInfo));

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
//      .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_dataconnection.sql")
  public void createDataSourceWithJdbcSingleIngestion() throws JsonProcessingException {

    String connectionId = "mysql-connection";

    DataSource dataSource = new DataSource();
    dataSource.setName("localJDBCIngestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    SingleIngestionInfo singleJdbcInfo = new SingleIngestionInfo();

    singleJdbcInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    singleJdbcInfo.setDatabase("polaris_datasources");
    singleJdbcInfo.setQuery("sample_ingestion");

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(singleJdbcInfo));

    Map reqMap = GlobalObjectMapper.getDefaultMapper().convertValue(dataSource, Map.class);

    // 추가 정보
    reqMap.put("connection", "/api/connections/" + connectionId);

    String reqBody = GlobalObjectMapper.writeValueAsString(reqMap);
    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_dataconnection.sql")
  public void createDataSourceWithIngestionOption() throws JsonProcessingException {

    String connectionId = "mysql-connection";

    DataSource dataSource = new DataSource();
    dataSource.setName("localJDBCIngestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    Field dimReplaceField = new Field("d", DataType.STRING, DIMENSION, 1L);
    dimReplaceField.setIngestionRule(
        GlobalObjectMapper.writeValueAsString(new ReplaceRule("null_replace_test")));

    Field dimDiscardField = new Field("sd", DataType.STRING, DIMENSION, 2L);
    dimDiscardField.setIngestionRule(
        GlobalObjectMapper.writeValueAsString(new DiscardRule()));

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(dimReplaceField);
    fields.add(dimDiscardField);
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    SingleIngestionInfo singleJdbcInfo = new SingleIngestionInfo();

    singleJdbcInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    singleJdbcInfo.setDatabase("polaris_datasources");
    singleJdbcInfo.setQuery("sample_ingestion");

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(singleJdbcInfo));

    Map reqMap = GlobalObjectMapper.getDefaultMapper().convertValue(dataSource, Map.class);

    // 추가 정보
    reqMap.put("connection", "/api/connections/" + connectionId);

    String reqBody = GlobalObjectMapper.writeValueAsString(reqMap);
    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

  }



  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_dataconnection.sql")
  public void createDataSourceWithJdbcBatchIngestion() throws JsonProcessingException, InterruptedException {

    String connectionId = "mysql-connection";

    DataSource dataSource = new DataSource();
    dataSource.setName("localJDBCBatchIngestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP,0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    BatchIngestionInfo batchJdbcInfo = new BatchIngestionInfo();

    batchJdbcInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    batchJdbcInfo.setDatabase("polaris_datasources");
    batchJdbcInfo.setQuery("sample_ingestion");
//    batchJdbcInfo.setPeriod(new BatchPeriod("MINUTELY", 1, null, null));
//    batchJdbcInfo.setPeriod(new BatchPeriod("WEEKLY", null, "03:20", Lists.newArrayList("MON", "SUN")));
    batchJdbcInfo.setPeriod(new BatchPeriod("EXPR", "0 0/1 * 1/1 * ? *", null, null));
    batchJdbcInfo.setSize(100);

    // Add Connection Info
    MySQLConnection dataConnection = new MySQLConnection();
    dataConnection.setHostname("localhost");
    dataConnection.setPort(3306);
    dataConnection.setUsername("polaris");
    dataConnection.setPassword("polaris");
    dataConnection.setDatabase("polaris_datasources");

    batchJdbcInfo.setConnection(dataConnection);

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(batchJdbcInfo));

//    Map reqMap = GlobalObjectMapper.getDefaultMapper().convertValue(dataSource, Map.class);
//    // 추가 정보
//    reqMap.put("connection", "/api/connections/" + connectionId);
//    String reqBody = GlobalObjectMapper.writeValueAsString(reqMap);

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

    System.out.println(reqBody);

    // @formatter:off
    Response dsRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources");

    dsRes.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on
    ///jobs/search/


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("group", "ingestion")
      .log().all()
    .when()
      .get("/api/jobs/search/key")
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on


    Thread.sleep(5*60*1000L);
  }


  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_dataconnection.sql")
  public void dataconnectionToDataSource() throws JsonProcessingException {

    String connectionId = "oracle-connection";
    String databaseName = "_default";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
    .when()
      .post("/api/datasources/connections/{connectionId}/{databaseName}", connectionId, databaseName)
//      .post("/api/datasources/connections/{connectionId}/", connectionId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void importAvailableDataSourceNames() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/datasources/import/datasources")
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void engineDatasourcePreview() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("withData", true)
      .param("limit", 10)
      .log().all()
    .when()
      .get("/api/datasources/import/{datasourceId}/preview", "realtime_ingestion_1519456518315")
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void engineDatasourceImport() {

    DataSource dataSource = new DataSource();
    dataSource.setName("test-sales");
    dataSource.setSegGranularity(DAY);
    dataSource.setGranularity(HOUR);

    Field field = new Field("sd", DataType.STRING, DIMENSION, 0L);
    field.setLogicalType(LogicalType.TIMESTAMP);
    field.setFormat("yyyy-MM-dd");
    dataSource.addField(field);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      //.body(dataSource)
      .log().all()
    .when()
      .post("/api/datasources/import/{datasourceId}", "sales_join_category")
    .then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createTemporaryDatasourcesSync() throws JsonProcessingException {

    DataSource dataSource = new DataSource();
    dataSource.setName("bulk_ingestion");
    dataSource.setEngineName("bulk_ingestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(LINK);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    // Add Connection Info
    MySQLConnection dataConnection = new MySQLConnection();
    dataConnection.setHostname("localhost");
    dataConnection.setPort(3306);
    dataConnection.setUsername("polaris");
    dataConnection.setPassword("polaris");
    dataConnection.setDatabase("metatron");

    //dataSource.setConnection(dataConnection);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("OrderDate", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("City", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("Quantity", DataType.DOUBLE, MEASURE, 2L));

    dataSource.setFields(fields);

    LinkIngestionInfo ingestionInfo = new LinkIngestionInfo();
    ingestionInfo.setConnection(dataConnection);
    ingestionInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    ingestionInfo.setDatabase("sample");
    ingestionInfo.setQuery("sales");
//    ingestionInfo.setFormat(new CsvFileFormat());

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(ingestionInfo));

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(dataSource)
      .log().all()
    .when()
      .post("/api/datasources/temporary");
    res.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    String temporaryId = from(res.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/datasources/{id}/multiple", temporaryId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("id", any(String.class))
    .log().all();

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void createTemporaryDatasourcesAsync() throws JsonProcessingException {

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

    DataSource dataSource = new DataSource();
    dataSource.setName("bulk_ingestion");
    dataSource.setEngineName("bulk_ingestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(LINK);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    // Add Connection Info
    MySQLConnection dataConnection = new MySQLConnection();
    dataConnection.setHostname("localhost");
    dataConnection.setPort(3306);
    dataConnection.setUsername("polaris");
    dataConnection.setPassword("polaris");
    dataConnection.setDatabase("metatron");

    //dataSource.setConnection(dataConnection);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("OrderDate", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("City", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("Quantity", DataType.DOUBLE, MEASURE, 2L));

    dataSource.setFields(fields);

    LinkIngestionInfo ingestionInfo = new LinkIngestionInfo();
    ingestionInfo.setConnection(dataConnection);
    ingestionInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    ingestionInfo.setDatabase("sample");
    ingestionInfo.setQuery("sales");
    ingestionInfo.setFormat(new CsvFileFormat());

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(ingestionInfo));

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .queryParam("async", true)
      .body(dataSource)
      .log().all()
    .when()
      .post("/api/datasources/temporary");
    res.then()
//      .statusCode(HttpStatus.SC_NOT_FOUND)
    .log().all();
    // @formatter:on

    String id = from(res.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(100000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_datasource_temporary.sql")
  public void createTemporaryDatasourceByIdSync() throws JsonProcessingException {

    String dataSourceId = "ds-test-01";

    TestUtils.printTestTitle("Create Temporary Datasource.");
    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .queryParam("async", false)
      .log().all()
    .when()
      .post("/api/datasources/{id}/temporary", dataSourceId);
    res.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("Get Temporary Datasource Info.");
    String tempId = from(res.asString()).get("id");
    // @formatter:off
    Response resDetail =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .queryParam("async", false)
      .log().all()
    .when()
      .get("/api/datasources/{id}", tempId);
    resDetail.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    String tempEngineName = from(resDetail.asString()).get("engineName");

    TestUtils.printTestTitle("Query Temporary Datasource");

    // Set Temporary
    app.metatron.discovery.domain.workbook.configurations.datasource.DataSource queryDataSource = new DefaultDataSource(tempEngineName);
    queryDataSource.setTemporary(true);

    List<app.metatron.discovery.domain.workbook.configurations.field.Field> projections = Lists.newArrayList(
        new DimensionField("city", null, null),
        new MeasureField("m1", MeasureField.AggregationType.SUM)
    );

    SearchQueryRequest request = new SearchQueryRequest(queryDataSource, null, projections, null);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_datasource_temporary.sql")
  public void createTemporaryDatasourceByIdASync() throws JsonProcessingException {

    String dataSourceId = "ds-test-01";
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

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .queryParam("async", true)
//      .body(dataSource)
      .log().all()
    .when()
      .post("/api/datasources/{id}/temporary", dataSourceId);
    res.then()
//      .statusCode(HttpStatus.SC_NOT_FOUND)
    .log().all();
    // @formatter:on

    String id = from(res.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(100000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  class DefaultStompFrameHandler implements StompFrameHandler {

    @Override
    public Type getPayloadType(StompHeaders stompHeaders) {
      return String.class;
    }

    @Override
    public void handleFrame(StompHeaders stompHeaders, Object o) {
      System.out.println("@@@@@@@@@@ Result : " + o);
      blockingQueue.offer((String) o);
    }
  }


  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void dataSourceFieldTimeFormatCheck() throws JsonProcessingException {

    TimeFormatCheckRequest request = new TimeFormatCheckRequest();
    request.setFormat("yyyy.M.dd h:mm:ss aaa");
    request.setSamples(Lists.newArrayList(
        "2014.4.15 4:07:55 AM",
        "2014.4.16 4:07:55 PM",
        "2016.4.16 4:07:55 PM"
    ));

    // @formatter:off
    Response connRes =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/validation/datetime");
    connRes.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void dataSourceFieldFindTimeFormat() throws JsonProcessingException {

    TimeFormatCheckRequest request = new TimeFormatCheckRequest();
    request.setSamples(Lists.newArrayList(
        "20/07/2016//",
        "21/08/20161//",
        "22/08/20171//"
    ));

    // @formatter:off
    Response connRes =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .body(request)
    .when()
      .post("/api/datasources/validation/datetime");


    connRes.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void dataSourceValidateCronExpression() throws JsonProcessingException {

    String cronExpr = "0 0 0/1 1/1 * ? *";

    // @formatter:off
    Response connRes =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
      .queryParam("expr", cronExpr)
    .when()
      .post("/api/datasources/validation/cron");


    connRes.then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_workbook.sql")
  public void createAndUpdateAndLoadAlias() throws JsonProcessingException {
    // DataSource + Field 등록
    //
    TestUtils.printTestTitle("1. Create Alias");

    String dataSourceId = "ds-37";
    String dashboardId = "db-005";
    String fieldName = "Category";

    DataSourceAlias createAlias = new DataSourceAlias();
    createAlias.setDataSourceId(dataSourceId);
    createAlias.setDashBoardId(dashboardId);
    createAlias.setFieldName(fieldName);
    createAlias.setNameAlias("카테고리");
    Map<String,Object> valueMap = TestUtils.makeMap("Furniture", "가구",
                      "Office Supplies", "사무용품",
                      "Technology", "가전");
    createAlias.setValueAlias(GlobalObjectMapper.writeValueAsString(valueMap));

    // @formatter:off
    Response createResponse =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(createAlias)
      .log().all()
    .when()
      .post("/api/datasources/aliases");

    createResponse.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    Long createdId = from(createResponse.asString()).getLong("id");

    TestUtils.printTestTitle("2. Alias 수정 ");
    //

    Map<String, Object> updateParamMap = Maps.newLinkedHashMap();
    updateParamMap.put("nameAlias", "카테고리_Update");

    Map<String,Object> updateValueMap = TestUtils.makeMap("Furniture", "가구_Update",
                                                          "Office Supplies", "사무용품",
                                                          "Technology", "가전");
    updateParamMap.put("valueAlias", updateValueMap);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(updateParamMap)
      .log().all()
    .when()
      .patch("/api/datasources/aliases/{id}", createdId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. 결과 조회 ");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/datasources/aliases/{id}", createdId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/dashboards/{id}", dashboardId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

}
