/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

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
import app.metatron.discovery.TestEngineIngestion;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.datasource.ingestion.BatchPeriod;
import app.metatron.discovery.domain.datasource.ingestion.HdfsIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.RealtimeIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ExcelFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.JsonFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.OrcFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ParquetFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SingleIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.rule.DiscardNullRule;
import app.metatron.discovery.domain.datasource.ingestion.rule.GeoPointRule;
import app.metatron.discovery.domain.datasource.ingestion.rule.ReplaceNullRule;
import app.metatron.discovery.domain.scheduling.engine.DataSourceCheckJobIntegrationTest;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoPointFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoPolygonFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TemporaryTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.UnixTimeFormat;
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
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.IMPORT;
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql("/sql/test_datasource_list.sql")
  public void findDataSourceIngestionHistories() {

    String dataSourceId = "ds-test-01";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("status", "running")
      .log().all()
    .when()
      .get("/api/datasources/{id}/histories", dataSourceId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql("/sql/test_datasource_list.sql")
  public void findDataSourceIngestionHistoryLog() {

    String dataSourceId = "ds-test-01";
    String historyId = "100001";
    String offset = "-8000";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("offset", offset)
    .when()
      .get("/api/datasources/{id}/histories/{historyId}/log", dataSourceId, historyId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql("/sql/test_datasource_list.sql")
  public void resetDataSourceIngestion() {

    String dataSourceId = "ds-test-01";
    String historyId = "100011";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/{id}/histories/{historyId}/reset", dataSourceId, historyId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql("/sql/test_datasource_list.sql")
  public void stopDataSourceIngestion() {

    String dataSourceId = "ds-test-01";
    String historyId = "100011";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/{id}/histories/{historyId}/stop", dataSourceId, historyId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void updateDataSourceFields() throws JsonProcessingException {
    // add DataSource with Fields
    //
    TestUtils.printTestTitle("1. add DataSource with Fields include filteringOption property");

    Field f1 = new Field("filtering field1", DataType.TIMESTAMP, TIMESTAMP, 0L);
    f1.setFormat(GlobalObjectMapper.writeValueAsString(new CustomDateTimeFormat("yyyy-MM-dd")));
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

    Map<String, Object> formatMap = Maps.newHashMap();
    formatMap.put("type", "time_format");
    formatMap.put("format", "yyyy-MM-dd");
    updateField.put("format", formatMap);
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_ADMIN", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithMapType() throws JsonProcessingException {

    Field field1 = new Field("id", DataType.STRING, DIMENSION, 1L);
    Field field2 = new Field("kvMap", DataType.MAP, DIMENSION, 2L);
    Field field3 = new Field("keyArray", DataType.ARRAY, DIMENSION, 3L);
    field3.setLogicalType(LogicalType.MAP_KEY);

    Field field4 = new Field("keyValue", DataType.ARRAY, DIMENSION, 4L);
    field4.setLogicalType(LogicalType.MAP_VALUE);

    //field2.setMappedField(Sets.newHashSet(field3, field4));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_ADMIN", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
  //  @Sql({"/scripts/default_datasource_ingestion_options.sql"})
  public void findDataSourceIngestionOptions() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
//      .param("type", "tuning")
      .param("ingestionType", "batch")
      .log().all()
    .when()
      .get("/api/datasources/ingestion/options")
    .then()
//      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
      .param("delimiter", ",")
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql("/sql/test_datasource_field.sql")
  public void patchDataSourceWithMetadata() throws JsonProcessingException {

    String dataSourceId = "test_ds_id";

    TestUtils.printTestTitle("1. update datasource column");

    Map<String, Object> patchParams = Maps.newHashMap();
    patchParams.put("name", "name->metadata");
    patchParams.put("description", "desc->metadata");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(patchParams)
      .log().all()
    .when()
      .patch("/api/datasources/{id}", dataSourceId).
    then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Check updated metadata column");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .queryParam("projection", "forDetailView")
    .when()
      .post("/api/metadatas/metasources/{dataSourceId}", dataSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithMetadata() throws JsonProcessingException {

    TestUtils.printTestTitle("1. Created datasource(Import Type) with metadata");

    DataSource dataSource = new DataSource();
    dataSource.setName("datasourceWith");
    dataSource.setDescription("datasourceWithDescription");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(IMPORT);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    String reqBody = GlobalObjectMapper.writeValueAsString(dataSource);

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

    String dataSourceId = from(dsRes.asString()).get("id");

    TestUtils.printTestTitle("2. Check created metadata related with datasource");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .queryParam("projection", "forDetailView")
    .when()
      .post("/api/metadatas/metasources/{dataSourceId}", dataSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql("/sql/test_datasource_field.sql")
  public void patchDataSourceFieldWithMetadataColumn() throws JsonProcessingException {

    String dataSourceId = "test_ds_id";

    TestUtils.printTestTitle("1. update datasource column");

    Map<String, Object> addField = Maps.newHashMap();
    addField.put("op", "add");
    addField.put("name", "add field name");
    addField.put("type", "string");
    addField.put("role", "DIMENSION");
    addField.put("seq", 3);

    Map<String, Object> updateField = Maps.newHashMap();
    updateField.put("op", "replace");
    updateField.put("id", 10037066);
    updateField.put("logicalName", "sd->logicalName");
    updateField.put("description", "sd description");
    updateField.put("seq", 10);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(addField, updateField))
      .log().all()
    .when()
      .patch("/api/datasources/{id}/fields", dataSourceId).
    then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Check updated metadata column");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .queryParam("projection", "forDetailView")
    .when()
      .post("/api/metadatas/metasources/{dataSourceId}", dataSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    // Add Connection Info
    DataConnection dataConnection = new DataConnection("MYSQL");
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithLocalJsonFileIngestion() throws JsonProcessingException {

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion.json").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localJsonFileIngestion_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("nd", DataType.STRING, DIMENSION, 3L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 4L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 5L));

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);

    List<JsonFileFormat.JsonFlatten> flattenRules = Lists.newArrayList();
    flattenRules.add(new JsonFileFormat.JsonFlatten("nd", "$.nested.dim2"));
    localFileIngestionInfo.setFormat(new JsonFileFormat(flattenRules));

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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithLocalJsonArrayFileIngestion() {

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

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_array.json").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localJsonFileIngestion_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.ARRAY, DIMENSION, 2L));
    fields.add(new Field("array_measure", DataType.ARRAY, MEASURE, 3L));

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);

    localFileIngestionInfo.setFormat(new JsonFileFormat(null));

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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

    Field timestampField = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField.setFormat("yyyy-MM-dd");
    fields.add(timestampField);

    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));

    Field field1 = new Field("sd", DataType.STRING, DIMENSION, 2L);
    field1.setUnloaded(true);
    fields.add(field1);

    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));

    Field field2 = new Field("m2", DataType.DOUBLE, MEASURE, 4L);
    field2.setUnloaded(true);
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithLocalCsvFileIngestion_Timezone() throws JsonProcessingException {

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

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_timezone.csv").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localFileIngestion_tz_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(HOUR);
    dataSource.setSegGranularity(HOUR);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();

    Field timestampField = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField.setFormat(new CustomDateTimeFormat("yyyy-MM-dd HH:mm:ss", "Asia/Seoul", null, null));
    fields.add(timestampField);

    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));

    Field field1 = new Field("sd", DataType.STRING, DIMENSION, 2L);
    field1.setUnloaded(true);
    fields.add(field1);

    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));

    Field field2 = new Field("m2", DataType.DOUBLE, MEASURE, 4L);
    field2.setUnloaded(true);
    fields.add(field2);

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(false);
    localFileIngestionInfo.setFormat(new CsvFileFormat(",", "\n"));
    localFileIngestionInfo.setIntervals(Lists.newArrayList("2017-01-01T00:00:00.000Z/2018-01-01T00:00:00.000Z"));

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithLocalCsvFileIngestionByAsync() throws JsonProcessingException {

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

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_space.csv").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localFileIngestion_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();

    Field timestampField = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField.setFormat("yyyy-MM-dd");
    fields.add(timestampField);

    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));

    Field field1 = new Field("sd", DataType.STRING, DIMENSION, 2L);
    field1.setUnloaded(true);
    fields.add(field1);

    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));

    Field field2 = new Field("m2", DataType.DOUBLE, MEASURE, 4L);
    field2.setUnloaded(true);
    fields.add(field2);

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(false);
    localFileIngestionInfo.setFormat(new CsvFileFormat("\u0020", "\n"));
    localFileIngestionInfo.setIntervals(Lists.newArrayList("2000-01-01T00:00:00.000Z/2020-01-01T00:00:00.000Z"));

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithLocalCsvFileInvalidIngestionByAsync() throws JsonProcessingException {

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

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_invalid_row.csv").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localFileIngestion_invalid_enforce_true" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();

    Field timestampField = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField.setFormat("yyyy-MM-dd");
    fields.add(timestampField);
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    Field field1 = new Field("sd", DataType.STRING, DIMENSION, 2L);
    fields.add(field1);
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    Field field2 = new Field("m2", DataType.DOUBLE, MEASURE, 4L);
    fields.add(field2);

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(true);
    localFileIngestionInfo.setFormat(new CsvFileFormat(",", "\n"));
    localFileIngestionInfo.setTuningOptions(TestUtils.makeMap("ignoreInvalidRows", "true"));

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithGeoCsvFileIngestionByAsync() throws JsonProcessingException {

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

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_estate.csv").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localFileIngestion_geo_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();

    Field timestampField = new Field("current_time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField.setDerived(true);
    timestampField.setFormat(GlobalObjectMapper.writeValueAsString(new TemporaryTimeFormat()));
    fields.add(timestampField);

    fields.add(new Field("idx", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("gu", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("py", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("amt", DataType.DOUBLE, MEASURE, 4L));

    Field lonField = new Field("x", DataType.DOUBLE, DIMENSION, 4L);
    lonField.setUnloaded(true);
    fields.add(lonField);

    Field latField = new Field("y", DataType.DOUBLE, DIMENSION, 4L);
    latField.setUnloaded(true);
    fields.add(latField);

    fields.add(new Field("addr", DataType.STRING, DIMENSION, 5L));

    Field locationField = new Field("location", DataType.STRUCT, DIMENSION, 4L);
    locationField.setLogicalType(LogicalType.GEO_POINT);
    locationField.setDerived(true);
    locationField.setDerivationRule(GlobalObjectMapper.writeValueAsString(new GeoPointRule(null, latField.getName(), lonField.getName())));
    locationField.setIngestionRule(GlobalObjectMapper.writeValueAsString(new DiscardNullRule()));
    locationField.setFormat(GlobalObjectMapper.writeValueAsString(new GeoPointFormat("EPSG:4301", null)));
    fields.add(locationField);

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(false);
    localFileIngestionInfo.setFormat(new CsvFileFormat(",", "\n"));

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithGeoPointCsvFileIngestionByAsync() throws JsonProcessingException {

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

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_point_wkt.csv").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localFileIngestion_geo_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();

    Field geoField = new Field("GeoPoint", DataType.STRING, DIMENSION, 1L);
    geoField.setLogicalType(LogicalType.GEO_POINT);
    geoField.setFormat(GlobalObjectMapper.writeValueAsString(new GeoPointFormat(null, null)));
    fields.add(geoField);

    Field timestampField = new Field("OrderDate", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField.setFormat(GlobalObjectMapper.writeValueAsString(new CustomDateTimeFormat("yyyy-MM-ddTHH:mm:ss.SSSZ")));
    fields.add(timestampField);

    fields.add(new Field("Category", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("City", DataType.STRING, DIMENSION, 3L));
    fields.add(new Field("Region", DataType.STRING, DIMENSION, 4L));
    fields.add(new Field("Sales", DataType.DOUBLE, MEASURE, 5L));

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(true);
    localFileIngestionInfo.setFormat(new CsvFileFormat(",", "\n"));

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithGeoPolygonCsvFileIngestionByAsync() throws JsonProcessingException {

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

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_zipcode_polygon.csv").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localFileIngestion_geo_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();

    Field timestampField = new Field("current_time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField.setDerived(true);
    timestampField.setFormat(GlobalObjectMapper.writeValueAsString(new TemporaryTimeFormat()));
    fields.add(timestampField);

    Field geoField = new Field("geometry", DataType.STRING, DIMENSION, 1L);
    geoField.setLogicalType(LogicalType.GEO_POINT);
    geoField.setFormat(GlobalObjectMapper.writeValueAsString(new GeoPolygonFormat(null, 8)));
    fields.add(geoField);

    fields.add(new Field("zip_code", DataType.STRING, DIMENSION, 2L));

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(true);
    localFileIngestionInfo.setFormat(new CsvFileFormat(",", "\n"));

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithLocalCsvFileIngestion_UnixTimestamp() throws JsonProcessingException {

    String targetFile = getClass().getClassLoader().getResource("ingestion/sample_ingestion_unix_timestamp_millis.csv").getPath();

    DataSource dataSource = new DataSource();
    dataSource.setName("localFileIngestion_unix_" + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(FILE);

    List<Field> fields = Lists.newArrayList();

    Field timestampField = new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L);
    timestampField.setFormat(GlobalObjectMapper.writeValueAsString(new UnixTimeFormat()));

    fields.add(timestampField);
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));

    Field field1 = new Field("sd", DataType.STRING, DIMENSION, 2L);
    fields.add(field1);

    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));

    Field field2 = new Field("m2", DataType.DOUBLE, MEASURE, 4L);
    fields.add(field2);

    dataSource.setFields(fields);

    LocalFileIngestionInfo localFileIngestionInfo = new LocalFileIngestionInfo();
    localFileIngestionInfo.setPath(targetFile);
    localFileIngestionInfo.setRemoveFirstRow(false);
    localFileIngestionInfo.setFormat(new CsvFileFormat(",", "\n"));

    dataSource.setIngestion(GlobalObjectMapper.writeValueAsString(localFileIngestionInfo));

    String reqBody = GlobalObjectMapper.getDefaultMapper().writeValueAsString(dataSource);

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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithRealTimeIngestion() throws JsonProcessingException {

    DataSource dataSource = new DataSource();
    dataSource.setName("RealTime_Ingestion_" + System.currentTimeMillis());
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(SECOND);
    dataSource.setSegGranularity(HOUR);
    dataSource.setSrcType(REALTIME);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("event_time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d1", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("d2", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    Map<String, Object> consumeProperties = Maps.newHashMap();
    consumeProperties.put("bootstrap.servers", "localhost:9092");

    RealtimeIngestionInfo ingestionInfo = new RealtimeIngestionInfo("test_topic",
                                                                    consumeProperties,
                                                                    new JsonFileFormat(),
                                                                    false,
                                                                    null,
                                                                    null, null);

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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithHdfsFileIngestion() throws JsonProcessingException {

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

    // 사전에 HDFS 경로에 파일 위치
    String targetFile = "/test/sample_ingestion.csv";

    DataSource dataSource = new DataSource();
    dataSource.setName("HdfsFileIngestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(HDFS);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithHiveCsvNonPartitionTableIngestion() throws JsonProcessingException {

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

    // 사전에 HDFS 경로에 파일 위치
    String sourceTable = "default.sample_ingestion";

    DataSource dataSource = new DataSource();
    dataSource.setName("Hive Ingestion CSV None Partition " + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(HIVE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    Map<String, Object> context = Maps.newHashMap();

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));
    fields.add(new Field("m3", DataType.DOUBLE, MEASURE, 5L));
    fields.add(new Field("d1", DataType.STRING, DIMENSION, 6L));

    dataSource.setFields(fields);

    Map<String, Object> context = Maps.newHashMap();
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
   "type":"index_hadoop",
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
            "metastoreUri":"thrift://localhost:9083"
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));
    dataSource.setFields(fields);

    Map<String, Object> context = Maps.newHashMap();

    List<String> intervals = Lists.newArrayList("2017-01-01/2017-12-01");

    List<Map<String, Object>> partitions = Lists.newArrayList();
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void appendDataSourceWithHiveOrcPartitionTableIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String dataSourceId = "0a3958c6-6c48-4804-be36-ec113fc85547";
    String sourceTable = "default.sample_ingestion_partition_parti_orc";

    List<String> intervals = Lists.newArrayList("2016-04-01/2017-12-01");

    List<Map<String, Object>> partitions = Lists.newArrayList();
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void createDataSourceWithHiveTableIngestion() throws JsonProcessingException {

    // 사전에 HDFS 경로에 파일 위치
    String sourceTable = "default.sample_ingestion_orc";
    //    String metastoreUri = "thrift://localhost:9083";
    //    String typeString = "struct<time:date,d:string,sd:string,m1:double,m2:double>";

    DataSource dataSource = new DataSource();
    dataSource.setName("Hive File Ingestion orc " + PolarisUtils.randomString(5));
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(HIVE);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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

    Map<String, Object> context = Maps.newHashMap();
    //    context.put(HiveIngestionInfo.KEY_HIVE_METASTORE, metastoreUri);
    //    context.put(HiveIngestionInfo.KEY_ORC_SCHEMA, typeString);

    List<Map<String, Object>> partitions = Lists.newArrayList();
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql("/sql/test_dataconnection.sql")
  public void createDataSourceWithJdbcSingleIngestionByAsync() throws JsonProcessingException {

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

    String connectionId = "mysql-connection";

    DataSource dataSource = new DataSource();
    dataSource.setName("localJDBCIngestion");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("d", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sd", DataType.STRING, DIMENSION, 2L));
    fields.add(new Field("m1", DataType.DOUBLE, MEASURE, 3L));
    fields.add(new Field("m2", DataType.DOUBLE, MEASURE, 4L));

    dataSource.setFields(fields);

    SingleIngestionInfo singleJdbcInfo = new SingleIngestionInfo();

    singleJdbcInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    singleJdbcInfo.setDatabase("polaris_datasources");
    singleJdbcInfo.setQuery("sample_ingestion");
    singleJdbcInfo.setMaxLimit(3);
    singleJdbcInfo.setRollup(false);

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

    String id = from(dsRes.asString()).get("id");

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/datasources/" + id + "/progress");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    try {
      System.out.println("Sleep!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      Thread.sleep(1000000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
        GlobalObjectMapper.writeValueAsString(new ReplaceNullRule("null_replace_test")));

    Field dimDiscardField = new Field("sd", DataType.STRING, DIMENSION, 2L);
    dimDiscardField.setIngestionRule(
        GlobalObjectMapper.writeValueAsString(new DiscardNullRule()));

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    fields.add(new Field("time", DataType.TIMESTAMP, TIMESTAMP, 0L));
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
    batchJdbcInfo.setMaxLimit(100);

    // Add Connection Info
    DataConnection dataConnection = new DataConnection("MYSQL");
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


    Thread.sleep(5 * 60 * 1000L);
  }


  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    DataConnection dataConnection = new DataConnection("MYSQL");
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
    DataConnection dataConnection = new DataConnection("MYSQL");
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_MANAGE_DATASOURCE"})
  public void dataSourceValidateWkt() throws JsonProcessingException {

    //    List<String> wktList = Lists.newArrayList(
    //        "LINESTRING (127.007656 37.491764, 127.027648 37.497879)",
    //        "LINESTRING (127.027648 37.497879, 127.066436 37.509842)"
    //    );

    //
    List<String> wktList = Lists.newArrayList(
            "MULTIPOINT((3.5 5.6),(4.8 10.5))"
    );

    // @formatter:off
    Response connRes =
            given()
                    .auth().oauth2(oauth_token)
                    .accept(ContentType.JSON)
                    .contentType(ContentType.JSON)
                    .body(new WktCheckRequest("GEO_POINT", wktList))
                    .log().all()
                    .when()
                    .post("/api/datasources/validation/wkt");

    connRes.then()
            .log().all()
            .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql("/sql/test_dataconnection.sql")
  public void createSingleJdbcDataSourcePresetConnectionManual() {
    String connectionId = "mysql-local-manual-conn";

    DataSource dataSource = new DataSource();
    dataSource.setName("jdbc-with-connection-manual-single");
    dataSource.setDsType(MASTER);
    dataSource.setConnType(ENGINE);
    dataSource.setGranularity(DAY);
    dataSource.setSegGranularity(MONTH);
    dataSource.setSrcType(JDBC);

    List<Field> fields = Lists.newArrayList();
    fields.add(new Field("orderdate", DataType.TIMESTAMP, TIMESTAMP, 0L));
    fields.add(new Field("category", DataType.STRING, DIMENSION, 1L));
    fields.add(new Field("sales", DataType.DOUBLE, MEASURE, 2L));

    dataSource.setFields(fields);

    SingleIngestionInfo singleJdbcInfo = new SingleIngestionInfo();

    singleJdbcInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    singleJdbcInfo.setDatabase("sample");
    singleJdbcInfo.setQuery("simple");
    singleJdbcInfo.setRollup(true);
    singleJdbcInfo.setScope(SingleIngestionInfo.IngestionScope.ALL);

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_MANAGE_DATASOURCE"})
  @Sql({"/sql/test_datasource_field.sql"})
  public void synchronizeFieldsInDataSource() throws InterruptedException {
    // given
    final String engineDataSourceName = "testsampleds";
    final String testDataSourceId = "7b8005ae-eca0-4a56-9072-c3811138c7a6";

    setUpTestFixtureSchemaNotMatchedEngineDataSource(engineDataSourceName);

    // REST
    // when, then
    given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .when()
        .patch("/api/datasources/{id}/fields/sync", testDataSourceId)
        .then()
        .statusCode(HttpStatus.SC_NO_CONTENT)
        .log().all();
  }

  private void setUpTestFixtureSchemaNotMatchedEngineDataSource(String engineDataSourceName) throws InterruptedException {
    final TestEngineIngestion testEngineIngestion = new TestEngineIngestion();

    final String workerHost = testEngineIngestion.getEngineWorkerHost();
    final String baseDir = DataSourceCheckJobIntegrationTest.class.getResource("/ingestion/").getPath();
    final String filter = "sample_ingestion_extends.csv";

    final String ingestionSpec = "{\n" +
        "  \"context\": {\n" +
        "    \"druid.task.runner.dedicated.host\": \"" + workerHost + "\"\n" +
        "  },\n" +
        "  \"spec\": {\n" +
        "    \"dataSchema\": {\n" +
        "      \"dataSource\": \"" + engineDataSourceName + "\",\n" +
        "      \"granularitySpec\": {\n" +
        "        \"intervals\": [\n" +
        "          \"1970-01-01/2050-01-01\"\n" +
        "        ],\n" +
        "        \"queryGranularity\": \"DAY\",\n" +
        "        \"rollup\": true,\n" +
        "        \"segmentGranularity\": \"MONTH\",\n" +
        "        \"type\": \"uniform\"\n" +
        "      },\n" +
        "      \"metricsSpec\": [\n" +
        "        {\n" +
        "          \"name\": \"count\",\n" +
        "          \"type\": \"count\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"m1\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"m1\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"m2\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"m2\",\n" +
        "          \"type\": \"sum\"\n" +
        "        },\n" +
        "        {\n" +
        "          \"fieldName\": \"m3\",\n" +
        "          \"inputType\": \"double\",\n" +
        "          \"name\": \"m3\",\n" +
        "          \"type\": \"sum\"\n" +
        "        }\n" +
        "      ],\n" +
        "      \"parser\": {\n" +
        "        \"parseSpec\": {\n" +
        "          \"columns\": [\n" +
        "            \"time\",\n" +
        "            \"d\",\n" +
        "            \"sd\",\n" +
        "            \"m1\",\n" +
        "            \"m2\",\n" +
        "            \"m3\",\n" +
        "            \"p\"\n" +
        "          ],\n" +
        "          \"dimensionsSpec\": {\n" +
        "            \"dimensionExclusions\": [],\n" +
        "            \"dimensions\": [\n" +
        "              \"d\",\n" +
        "              \"sd\",\n" +
        "              \"p\"\n" +
        "            ],\n" +
        "            \"spatialDimensions\": []\n" +
        "          },\n" +
        "          \"format\": \"csv\",\n" +
        "          \"timestampSpec\": {\n" +
        "            \"column\": \"time\",\n" +
        "            \"format\": \"yyyy-MM-dd\",\n" +
        "            \"replaceWrongColumn\": false\n" +
        "          }\n" +
        "        },\n" +
        "        \"type\": \"string\"\n" +
        "      }\n" +
        "    },\n" +
        "    \"ioConfig\": {\n" +
        "      \"firehose\": {\n" +
        "        \"baseDir\": \"" + baseDir + "\",\n" +
        "        \"filter\": \"" + filter + "\",\n" +
        "        \"type\": \"local\"\n" +
        "      },\n" +
        "      \"type\": \"index\"\n" +
        "    },\n" +
        "    \"tuningConfig\": {\n" +
        "      \"buildV9Directly\": true,\n" +
        "      \"ignoreInvalidRows\": true,\n" +
        "      \"maxRowsInMemory\": 75000,\n" +
        "      \"type\": \"index\"\n" +
        "    }\n" +
        "  },\n" +
        "  \"type\": \"index\"\n" +
        "}";

    testEngineIngestion.ingestionLocalFile(engineDataSourceName, ingestionSpec);

  }


  public class DataSourceCreationStompHander extends StompSessionHandlerAdapter {
    public void handleFrame(StompHeaders headers, Object payload) {
    }
  }

}
