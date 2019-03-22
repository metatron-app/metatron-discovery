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

package app.metatron.discovery.domain.datasource.data;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.datasource.DataSourceAlias;
import app.metatron.discovery.domain.datasource.SimilarityQueryRequest;
import app.metatron.discovery.domain.datasource.data.alias.CodeTableAlias;
import app.metatron.discovery.domain.datasource.data.alias.ValueRefAlias;
import app.metatron.discovery.domain.datasource.data.forward.CsvResultForward;
import app.metatron.discovery.domain.datasource.data.forward.JsonResultForward;
import app.metatron.discovery.domain.datasource.data.result.ChartResultFormat;
import app.metatron.discovery.domain.datasource.data.result.FileResultFormat;
import app.metatron.discovery.domain.datasource.data.result.GraphResultFormat;
import app.metatron.discovery.domain.datasource.data.result.PivotResultFormat;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.Sort;
import app.metatron.discovery.domain.workbook.configurations.analysis.GeoSpatialAnalysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.GeoSpatialOperation;
import app.metatron.discovery.domain.workbook.configurations.analysis.PredictionAnalysis;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.JoinMapping;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.*;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.GeoShelf;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.LayerView;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.MapViewLayer;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.Shelf;
import app.metatron.discovery.query.druid.SpatialOperations;

import static app.metatron.discovery.domain.datasource.Field.FieldRole.MEASURE;
import static com.jayway.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;

/**
 * Created by kyungtaak on 2016. 3. 20..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class DataQueryRestIntegrationTest extends AbstractRestIntegrationTest {
  final static String datasourceEngineName = "test_sales_geo";

  @BeforeClass
  public static void beforeClass() throws Exception {
    //    SalesGeoDataSourceTestFixture.setUp(datasourceEngineName);
  }

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSales() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000);
    limit.setSort(Lists.newArrayList(
        //        new Sort("OrderDate","ASC")
    ));

    List<Filter> filters = Lists.newArrayList(
        //        new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000"),
        //        new LikeFilter("Category", "T_chnology")
    );

    //    List<Field> projections = Lists.newArrayList(
    ////            new TimestampField("orderdate", MONTH),
    ////            new DimensionField("City"),
    ////            new DimensionField("Sub-Category"),
    //            new DimensionField("Category"),
    //            new MeasureField("Sales", MeasureField.AggregationType.AVG)
    //    );

    // Case1
    Pivot pivot1 = new Pivot();
    TimestampField timestampField = new TimestampField("OrderDate", null, new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.DAY.name(), null));
    pivot1.setColumns(Lists.newArrayList(timestampField));
    //    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category", null, null)));
    //    pivot1.setRows(Lists.newArrayList(new DimensionField("Sub-Category", "dimrow", null)));
    pivot1.setAggregations(Lists.newArrayList(
        //        new DimensionField("Category"),
        new MeasureField("Sales", MeasureField.AggregationType.NONE)
        //        new MeasureField("Sales")
    ));

    //    Pivot pivot = new Pivot();
    //    pivot.setColumns(Lists.newArrayList(
    //        new DimensionField("Category")
    //    ));
    //    pivot.setAggregations(Lists.newArrayList(
    //        new MeasureField("Sales", MeasureField.AggregationType.SUM)
    //    ));

    // Case 2
    //    Pivot pivot = new Pivot();
    //    pivot.setColumns(Lists.newArrayList(new DimensionField("City")));
    //    pivot.setAggregations(Lists.newArrayList(
    //        new MeasureField("Sales", MeasureField.AggregationType.SUM),
    //        new MeasureField("Sales", MeasureField.AggregationType.AVG),
    //        new DimensionField("Quantity")
    //    ));

    // case of many column
    //    Pivot pivot = new Pivot();
    //    pivot.setColumns(Lists.newArrayList(new DimensionField("City")));
    //    pivot.setAggregations(Lists.newArrayList(
    //        new MeasureField("Sales", MeasureField.AggregationType.SUM),
    //        new DimensionField("CustomerName")
    //    ));

    // case of Calculated Measure
    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(new DimensionField("City")));
    pivot.setAggregations(Lists.newArrayList(
        new MeasureField("calc", "user_defined", MeasureField.AggregationType.NONE)
    ));

    List<UserDefinedField> userDefinedFields = Lists.newArrayList(
        new ExpressionField("calc", "sumof(\"Sales\")", "measure", true)
    );


    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    request.setUserFields(userDefinedFields);
    //    CsvResultForward csvResultForward = new CsvResultForward();
    //    request.setResultForward(csvResultForward);
    //    request.setResultFormat(new FileResultFormat());
    //    JsonResultForward forward = new JsonResultForward();
    //    forward.setRemoveFile(false);
    //    JsonResultForward forward = new JsonResultForward();
    //    forward.setRemoveFile(false);
    //    request.setResultForward(forward);

    ChartResultFormat format = new ChartResultFormat("bar");
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

    Map<String, Object> context = TestUtils.makeMap(QueryRequest.CONTEXT_ROUTE_URI, "/test/uri",
                                                    QueryRequest.CONTEXT_DASHBOARD_ID, "dashboard_id",
                                                    QueryRequest.CONTEXT_WIDGET_ID, "chart_id");

    request.setContext(context);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQuerySelectForSales() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000);
    limit.setSort(Lists.newArrayList(
        new Sort("OrderDate", "DESC")
    ));

    List<Filter> filters = Lists.newArrayList(
        //        new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000"),
        //        new LikeFilter("Category", "T_chnology")
    );

    List<Field> projections = Lists.newArrayList(
        new TimestampField("OrderDate"),
        new DimensionField("City"),
        new DimensionField("Sub-Category"),
        new DimensionField("Category"),
        new MeasureField("Sales", MeasureField.AggregationType.NONE)
    );


    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, projections, limit);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql(value = {"/sql/test_workbook.sql", "/sql/test_mdm.sql"})
  public void searchQuerySelectForSalesForStream() throws JsonProcessingException {

    String dataSourceId = "ds-gis-37";
    String dashboardId = "db-005";
    String fieldName = "Category";

    DataSourceAlias createAlias = new DataSourceAlias();
    createAlias.setDataSourceId(dataSourceId);
    createAlias.setDashBoardId(dashboardId);
    createAlias.setFieldName(fieldName);
    Map<String, Object> valueMap = TestUtils.makeMap("Furniture", "가구",
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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000);
    limit.setSort(Lists.newArrayList(
        new Sort("OrderDate", "DESC")
    ));

    List<Filter> filters = Lists.newArrayList(
        new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000"),
        new LikeFilter("Category", "T_chnology")
    );

    DimensionField dimAliasField = new DimensionField("Category");

    List<Field> projections = Lists.newArrayList(
        new TimestampField("OrderDate"),
        new DimensionField("City"),
        new DimensionField("Sub-Category"),
        new DimensionField("Category"),
        new DimensionField("location"),
        new MeasureField("Sales", MeasureField.AggregationType.NONE)
    );

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, projections, limit);
    request.setValueAliasRef("db-005");
    request.setContext(TestUtils.makeMap(SearchQueryRequest.CXT_KEY_USE_STREAM, true));

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesForDownload() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList();

    Pivot pivot1 = new Pivot();
    TimestampField timestampField = new TimestampField("OrderDate", null, new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.DAY.name(), null));
    pivot1.setColumns(Lists.newArrayList(timestampField));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.NONE)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    CsvResultForward csvResultForward = new CsvResultForward();
    request.setResultForward(csvResultForward);
    request.setResultFormat(new FileResultFormat());

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithTimeCompare() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    Map<String, Object> valueMap = TestUtils.makeMap("Furniture", "가구",
                                                     "Office Supplies", "사무용품",
                                                     "Technology", "가전");

    List<UserDefinedField> userFields = Lists.newArrayList(
        new ExpressionField("test", "Category + '1'", "measure", false)
    );

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("Category", Lists.newArrayList("Furniture", "Office Supplies")),
        new InclusionFilter("test", Lists.newArrayList("Furniture1", "Office Supplies1"))
    );

    DataQueryController.TimeCompareRequest timeCompareRequest = new DataQueryController.TimeCompareRequest(
        dataSource1,
        userFields,
        filters,
        new TimestampField("OrderDate"),
        Lists.newArrayList(new MeasureField("Sales", MeasureField.AggregationType.AVG)),
        "DAY",
        null,
        1,
        "Asia/Seoul",
        null,
        null
    );

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(timeCompareRequest))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search/time_compare")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithTimeRange() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //        new Sort("OrderDate","ASC")
    ));

    //    TimeRangeFilter timeRangeFilter = new TimeRangeFilter("OrderDate", null, "DAY",
    //                                                          Lists.newArrayList(
    //                                                              "EARLIEST_DATETIME/2011-05-19",
    //                                                              "2012-05-19/2013-05-19",
    //                                                              "2014-05-19/LATEST_DATETIME"
    //                                                          ));

    //    TimeRangeFilter timeRangeFilter = new TimeRangeFilter("ShipDate", null, "DAY",
    //                                                          Lists.newArrayList(
    //                                                              "EARLIEST_DATETIME/2011-05-19",
    //                                                              "2012-05-19/2013-05-19",
    //                                                              "2014-05-19/LATEST_DATETIME"
    //                                                          ));

    TimeRangeFilter timeRangeFilter = new TimeRangeFilter("ShipDate", null, null,
                                                          Lists.newArrayList(
                                                              "EARLIEST_DATETIME/2011-05-19 12:00:00",
                                                              "2014-05-19 16:00:23/LATEST_DATETIME"
                                                          ), null, null);

    List<Filter> filters = Lists.newArrayList(
        timeRangeFilter
    );

    // Case1
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList());
    pivot1.setRows(Lists.newArrayList());
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithTimeList() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //        new Sort("OrderDate","ASC")
    ));

    List<String> valueList = Lists.newArrayList(
        "Jan 2012",
        "Feb 2012"
    );

    TimeListFilter timeListFilter = new TimeListFilter("OrderDate", null, "MONTH", "MONTH", false,
                                                       null, null, valueList, null);

    List<Filter> filters = Lists.newArrayList(
        timeListFilter
    );

    // Case1
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList());
    pivot1.setRows(Lists.newArrayList());
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithTimeRelative() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //        new Sort("OrderDate","ASC")
    ));

    TimeRelativeFilter relativeFilter = new TimeRelativeFilter("OrderDate", null, "year", null, TimeRelativeFilter.Tense.PREVIOUS.name(), 6, "Asia/Seoul", null);
    //    TimeRelativeFilter relativeFilter = new TimeRelativeFilter("ShipDate", null, "year", null, TimeRelativeFilter.Tense.PREVIOUS.name(), 6, null);

    List<Filter> filters = Lists.newArrayList(
        relativeFilter
    );

    // Case1
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList());
    pivot1.setRows(Lists.newArrayList());
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql(value = {"/sql/test_workbook.sql", "/sql/test_mdm.sql"})
  public void searchQueryForValueAlias() throws JsonProcessingException {

    String dataSourceId = "ds-37";
    String dashboardId = "db-005";
    String fieldName = "Category";

    DataSourceAlias createAlias = new DataSourceAlias();
    createAlias.setDataSourceId(dataSourceId);
    createAlias.setDashBoardId(dashboardId);
    createAlias.setFieldName(fieldName);
    Map<String, Object> valueMap = TestUtils.makeMap("Furniture", "가구",
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


    TestUtils.printTestTitle("Search DataSource using value alias");

    DataSource dataSource = new DefaultDataSource("sales");
    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("Category", null, Lists.newArrayList("가구"))
    );

    DimensionField dimField = new DimensionField("Category");
    dimField.setAlias("카테고리");

    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(dimField));
    pivot.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource, filters, pivot, limit);
    //request.setValueAliasRef(dashboardId);
    Map<String, String> codeTableMap = Maps.newHashMap();
    codeTableMap.put("Category", "test_code_table4");
    request.setAliases(Lists.newArrayList(new ValueRefAlias(dashboardId), new CodeTableAlias(codeTableMap)));
    ChartResultFormat format = new ChartResultFormat("bar");
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("Candidate field using value alias");

    CandidateQueryRequest candidateQueryRequest = new CandidateQueryRequest();
    candidateQueryRequest.setDataSource(dataSource);
    candidateQueryRequest.setFilters(filters);
    candidateQueryRequest.setTargetField(new DimensionField("Category"));
    //    candidateQueryRequest.setValueAliasRef(dashboardId);
    candidateQueryRequest.setAliases(Lists.newArrayList(new ValueRefAlias(dashboardId)));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(candidateQueryRequest)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/candidate")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithExpression() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList());

    List<Filter> filters = Lists.newArrayList();

    List<UserDefinedField> userFields = Lists.newArrayList(
        new ExpressionField("test(%)", "AVGOF(\"Sales\")", "measure", true)
        //        new ExpressionField("test", "countd(\"City\")", "measure", null,true)
        //        new ExpressionField("test", "Sales + 1", "measure", null,false)
    );

    // Case1
    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot.setAggregations(Lists.newArrayList(
        //        new MeasureField("Sales", null, MeasureField.AggregationType.SUM)
        new MeasureField("test(%)", "user_defined", MeasureField.AggregationType.NONE)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot, limit);
    request.setUserFields(userFields);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithExpression1() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList());

    List<Filter> filters = Lists.newArrayList();

    List<UserDefinedField> userFields = Lists.newArrayList(
        new ExpressionField("datediff_dimension", "DATEDIFF( \"OrderDate\",\"ShipDate\" )", "dimension", false),
        new ExpressionField("now_dimension", "NOW(  )", "dimension", false),
        new ExpressionField("orderdate_d", "\"OrderDate\"", "dimension", false),
        new ExpressionField("trim", "TRIM( \"Category\"  )", "dimension", false),
        new ExpressionField("case_dim", "CASE( \"Category\" == 'Furniture', 'F', 'default' )", "dimension", false),
        //        new ExpressionField("switch_dim", "SWITCH( \"Category\", 'Furniture', 'F', 'Technology', 'T')", "dimension", false)
        new ExpressionField("sumof_dim", "(SUMOF([SalesForecase]) - SUMOF( [Sales]  ) ) / SUMOF( [Sales]  ) * 100", "measure", true)
        //        new ExpressionField("test", "Sales + 1", "measure", false)
    );

    // Case1
    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(new DimensionField("switch_dim", "user_defined")));
    pivot.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", null, MeasureField.AggregationType.SUM)
        //        new MeasureField("test", "user_defined", MeasureField.AggregationType.NONE)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot, limit);
    request.setUserFields(userFields);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithWindowExpression() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList());

    List<Filter> filters = Lists.newArrayList();

    List<UserDefinedField> userFields = Lists.newArrayList(
        new ExpressionField("test", "$RANK(\"SUMOF(Sales)\",{d})", "measure", false)
    );

    // Case1
    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(new DimensionField("Category"), new DimensionField("Sub-Category")));
    pivot.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", null, MeasureField.AggregationType.SUM),
        new MeasureField("test", "user_defined", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot, limit);
    request.setUserFields(userFields);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithDimensionExpression() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList());

    List<Filter> filters = Lists.newArrayList();

    List<UserDefinedField> userFields = Lists.newArrayList(
        //        new ExpressionField("test", "sumof(\"Sales\")", "measure", true)
        //        new ExpressionField("test", "countd(\"City\")", "measure", true)
        new ExpressionField("test", "\"Category\"", "dimension", false)
    );

    // Case1
    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(new DimensionField("test", "user_defined")));
    pivot.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot, limit);
    request.setUserFields(userFields);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithTimestamp() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //        new Sort("ShipDate","ASC")
    ));

    List<Filter> filters = Lists.newArrayList(
        //new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000")
        new TimestampFilter("OrderDate", null, Lists.newArrayList("Dec 29, 2014", "Dec 30, 2014"), new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.DAY.name(), null)),
        new TimestampFilter("ShipDate", null, Lists.newArrayList("Sun", "Mon"), new ContinuousTimeFormat(true, TimeFieldFormat.TimeUnit.DAY.name(), TimeFieldFormat.ByTimeUnit.WEEK.name()))
    );

    // Case1
    Pivot pivot1 = new Pivot();
    TimestampField origianlTimeField1 = new TimestampField("OrderDate", null, new ContinuousTimeFormat(true, TimeFieldFormat.TimeUnit.MONTH.name(), TimeFieldFormat.ByTimeUnit.YEAR.name()));
    origianlTimeField1.setAlias("DAY(OrderDate)");

    pivot1.setColumns(Lists.newArrayList(origianlTimeField1));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    // Case2
    Pivot pivot2 = new Pivot();
    TimestampField origianlTimeField2 = new TimestampField("OrderDate", null,
                                                           new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.DAY.name(), null));
    DimensionField dimTimeField2 = new DimensionField("ShipDate", null,
                                                      new ContinuousTimeFormat(true, TimeFieldFormat.TimeUnit.DAY.name(), TimeFieldFormat.ByTimeUnit.WEEK.name()));
    pivot2.setColumns(Lists.newArrayList(origianlTimeField2, dimTimeField2));
    pivot2.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    // Case3
    Pivot pivot3 = new Pivot();
    TimestampField origianlTimeField3 = new TimestampField("OrderDate", null, new ContinuousTimeFormat(true, TimeFieldFormat.TimeUnit.HOUR.name(), null));
    origianlTimeField3.setAlias("HOUR(OrderDate)");

    pivot3.setColumns(Lists.newArrayList(origianlTimeField3));
    pivot3.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    // Case4, Week/Quarter
    Pivot pivot4 = new Pivot();
    TimestampField originalTimeField4 = new TimestampField("OrderDate", null, new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.WEEK.name(), null));
    originalTimeField4.setAlias("WEEK(OrderDate)");

    DimensionField dimTimeField4 = new DimensionField("ShipDate", null,
                                                      new ContinuousTimeFormat(true, TimeFieldFormat.TimeUnit.QUARTER.name(), TimeFieldFormat.ByTimeUnit.YEAR.name()));

    pivot4.setColumns(Lists.newArrayList(originalTimeField4));
    pivot4.setRows(Lists.newArrayList(dimTimeField4));
    pivot3.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithBoundFilter() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList(
        new BoundFilter("Profit", null, 0, 20)
    );

    // Case1
    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot, limit);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithSort() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    Field city = new DimensionField("City");
    Field sumDiscount = new MeasureField("Discount", MeasureField.AggregationType.SUM);

    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(city));
    pivot.setAggregations(Lists.newArrayList(sumDiscount));

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        new Sort(sumDiscount.getAlias(), "asc")
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, null, pivot, limit);

    ChartResultFormat format = new ChartResultFormat("bar");
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithPivotFormat() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    Field cat = new DimensionField("Category");
    Field subCat = new DimensionField("Sub-Category");
    Field region = new DimensionField("Region");
    Field state = new DimensionField("State");
    Field sumSales = new MeasureField("Sales", MeasureField.AggregationType.SUM);

    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(cat, subCat, region, state));
    pivot.setAggregations(Lists.newArrayList(sumSales));

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, null, pivot, limit);

    PivotResultFormat format = new PivotResultFormat();
    format.setKeyFields(Lists.newArrayList("Category", "Sub-Category"));

    format.setPivots(Lists.newArrayList(new PivotResultFormat.Pivot("Region"),
                                        new PivotResultFormat.Pivot("State")));
    format.setAggregations(Lists.newArrayList(new PivotResultFormat.Aggregation(sumSales.getAlias())));
    format.setResultType(PivotResultFormat.ResultType.MATRIX);

    request.setResultFormat(format);

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithPercentile() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    Field category = new DimensionField("Category");
    Field avgSales = new MeasureField("Discount", null, null,
                                      MeasureField.AggregationType.PERCENTILE.name(), null, "value=0.25");

    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(category));
    pivot.setAggregations(Lists.newArrayList(avgSales));

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, null, pivot, limit);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithForecastAnalysis() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //        new Sort("ShipDate","ASC")
    ));

    List<Filter> filters = Lists.newArrayList(
        new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000")
    );

    // Case1
    Pivot pivot1 = new Pivot();
    TimestampField origianlTimeField1 = new TimestampField("OrderDate", null, new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.DAY.name(), null));
    origianlTimeField1.setAlias("DAY(OrderDate)");

    DimensionField dimTimeField2 = new DimensionField("ShipDate", null,
                                                      new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.MONTH.name(), null));

    pivot1.setColumns(Lists.newArrayList(origianlTimeField1));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
        //        new MeasureField("Profit", MeasureField.AggregationType.AVG)
    ));

    PredictionAnalysis analysis = new PredictionAnalysis();
    analysis.setTimeUnit(TimeFieldFormat.TimeUnit.MONTH);
    analysis.setInterval(5);
    PredictionAnalysis.Forecast forecast = new PredictionAnalysis.Forecast();
    forecast.setParameters(Lists.newArrayList(
        new PredictionAnalysis.HyperParameter("AVG(Sales)", 0.1, 0, 0.3, 12, false)
        //        new PredictionAnalysis.HyperParameter("AVG(Profit)", 0.2, 0, 0.2, false)
    ));
    analysis.setForecast(forecast);
    analysis.setConfidence(new PredictionAnalysis.Confidence(95));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    request.setResultFormat(new ChartResultFormat("line"));
    request.setAnalysis(analysis);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithNetworkChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //new Sort("OrderDate", Sort.Direction.ASC)
    ));

    // Case 1. 디멘젼에 열선반에만 존재
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot1.setRows(Lists.newArrayList(new DimensionField("Sub-Category")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, null, pivot1, limit);
    GraphResultFormat format = new GraphResultFormat(true, true);
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Ignore
  //  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_sample_network_datasource.sql")
  public void searchQueryForSampleWithNetworkChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sample_network_ingestion_01");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList());

    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("d")));
    pivot1.setRows(Lists.newArrayList(new DimensionField("nd")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("m1", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, null, pivot1, limit);
    GraphResultFormat format = new GraphResultFormat(true, true);
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithSankeyChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //new Sort("OrderDate", Sort.Direction.ASC)
    ));

    // Case 1. 디멘젼에 열선반에만 존재
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category", "aCat", null, null),
                                         new DimensionField("Sub-Category", "aSubCat", null, null),
                                         new DimensionField("Segment")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, null, pivot1, limit);
    GraphResultFormat format = new GraphResultFormat();
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithBarChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(20);
    limit.setSort(Lists.newArrayList(
        //new Sort("OrderDate", Sort.Direction.ASC)
    ));

    List<Filter> filters = Lists.newArrayList(
        new IntervalFilter("OrderDate", "", "")
    );

    // Case 1. 디멘젼에 열선반에만 존재
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category"))); //, new DimensionField("Sub-Category"))); //, new DimensionField("Sub-Category")));
    pivot1.setRows(Lists.newArrayList(new DimensionField("Sub-Category")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM)
    ));

    // Case 2. 디멘젼에 열선반에 위치하고 행선반에 디멘젼 처리
    Pivot pivot2 = new Pivot();
    pivot2.setColumns(Lists.newArrayList(new DimensionField("Category"), new DimensionField("Sub-Category")));
    pivot2.setRows(Lists.newArrayList(new DimensionField("Region")));
    pivot2.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    // Case 3.
    Pivot pivot3 = new Pivot();
    pivot3.setColumns(Lists.newArrayList(new TimestampField("OrderDate", null,
                                                            new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.QUARTER.name(), null))));
    pivot3.setRows(null);
    pivot3.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM)
    ));

    // Case 4. 열 선반에만 디멘전
    Pivot pivot4 = new Pivot();
    pivot4.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot4.setRows(Lists.newArrayList(new TimestampField("OrderDate", null,
                                                         new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.DAY.name(), null))));
    pivot4.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM)
    ));

    // Case 5. 디멘젼에 열선반에 위치하고 행선반에 디멘젼 처리
    Pivot pivot5 = new Pivot();
    pivot5.setColumns(Lists.newArrayList(new DimensionField("State")));
    pivot5.setRows(null);
    pivot5.setAggregations(Lists.newArrayList(
        new DimensionField("Category"),
        new MeasureField("Sales", MeasureField.AggregationType.SUM),
        new MeasureField("SalesForecast", MeasureField.AggregationType.SUM)
    ));

    // Case 6. 타임 디멘젼
    Pivot pivot6 = new Pivot();
    TimestampField field1 = new TimestampField("OrderDate", "MONTH(OrderDate)", null, new ContinuousTimeFormat(false, "MONTH", null));
    TimestampField field2 = new TimestampField("OrderDate", "DAY(OrderDate)", null, new ContinuousTimeFormat(false, "DAY", null));
    pivot6.setColumns(Lists.newArrayList(field1));
    pivot6.setRows(Lists.newArrayList(field2));
    pivot6.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM)
    ));

    // Case 6. 타임 디멘젼
    Pivot pivot7 = new Pivot();
    TimestampField field3 = new TimestampField("OrderDate", "MONTH(OrderDate)", null, new ContinuousTimeFormat(false, "MONTH", null));
    TimestampField field4 = new TimestampField("OrderDate", "DAY(OrderDate)", null, new ContinuousTimeFormat(false, "DAY", null));
    pivot7.setColumns(Lists.newArrayList(field3));
    pivot7.setRows(Lists.newArrayList());
    pivot7.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM), field4
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    ChartResultFormat format = new ChartResultFormat("bar");
    format.addOptions("showPercentage", true);
    format.addOptions("showCategory", true);
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);
    //request.setMetaQuery(true);


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithLineChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //new Sort("OrderDate", Sort.Direction.ASC)
    ));

    List<Filter> filters = Lists.newArrayList();

    // Case 1. 디멘젼에 열선반에만 존재
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category"))); //, new DimensionField("Sub-Category")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM),
        new TimestampField("OrderDate", "MONTH(OrderDate)", null, new ContinuousTimeFormat(true, "MONTH", null)
        )));

    // Case 2.
    Pivot pivot2 = new Pivot();
    pivot2.setColumns(Lists.newArrayList(new TimestampField("OrderDate", null,
                                                            new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.QUARTER.name(), null))));
    pivot2.setRows(null);
    pivot2.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot2, limit);
    ChartResultFormat format = new ChartResultFormat("line");
    //    format.addOptions("showPercentage", true);
    //    format.addOptions("showCategory", true);
    format.addOptions("isCumulative", true);
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithGaugeChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
    ));

    List<Filter> filters = Lists.newArrayList();

    // Case 1. 디멘젼에 열선반에만 존재
    Pivot pivot1 = new Pivot();
    pivot1.setRows(Lists.newArrayList(new DimensionField("Category"))); //, new DimensionField("Sub-Category")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.COUNT)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    ChartResultFormat format = new ChartResultFormat("gauge");
    format.addOptions("showPercentage", true);
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithGridChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList();

    // Case 1. 행/열 차원값 2개씩 교차에 측정값 1개
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot1.setRows(Lists.newArrayList(new DimensionField("Sub-Category"), new DimensionField("Region")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.NONE)
        //new MeasureField("Sales", MeasureField.AggregationType.SUM)
    ));

    // Case 2. 행/열 차원값 2개씩 교차에 측정값 1개
    Pivot pivot2 = new Pivot();
    pivot2.setColumns(Lists.newArrayList(new DimensionField("City")));
    pivot2.setRows(Lists.newArrayList(new DimensionField("CustomerName")));
    pivot2.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM)
    ));

    // Case 3. 행/열 차원값 2개씩 교차에 측정값 1개
    Pivot pivot3 = new Pivot();
    pivot3.setColumns(Lists.newArrayList(new DimensionField("City")));
    //    pivot3.setRows(Lists.newArrayList(new DimensionField("CustomerName")));
    MeasureField measureField = new MeasureField("Sales", MeasureField.AggregationType.NONE);
    measureField.setAlias("SUM(Sales)");
    pivot3.setAggregations(Lists.newArrayList(
        measureField
    ));

    // Case 4. 행/열 차원값 1개씩 교차에 측정값 1개
    Pivot pivot4 = new Pivot();
    pivot4.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot4.setRows(Lists.newArrayList(new DimensionField("City")));
    pivot4.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM)
    ));

    // Case 5. 행/열 차원값 1개씩 교차에 측정값 1개
    Pivot pivot5 = new Pivot();
    pivot5.setColumns(Lists.newArrayList(new TimestampField("OrderDate", null,
                                                            new ContinuousTimeFormat(false, "week", null))));
    pivot5.setRows(Lists.newArrayList(new DimensionField("Category")));
    pivot5.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM)
    ));

    // Case 5. 행/열 차원값 1개씩 교차에 측정값 1개
    Pivot pivot6 = new Pivot();
    pivot6.setRows(Lists.newArrayList(new DimensionField("Category")));
    pivot6.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM),
        new MeasureField("countof", "user_defined")
    ));

    List<UserDefinedField> userDefinedFields = Lists.newArrayList();
    userDefinedFields.add(new ExpressionField("countof", "countof(\"State\")", "measure", true));

    //    limit.setSort(Lists.newArrayList(new Sort("City", "asc")));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    ChartResultFormat format = new ChartResultFormat("grid");
    format.addOptions("isOriginal", true);
    format.addOptions("addMinMax", true);
    format.addOptions("columnAggregation", "SUM");
    request.setResultFormat(format);
    request.setUserFields(userDefinedFields);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithScatterChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList();

    // Case 1. 행/열 측정값 1개씩 교차에 차원값 2개
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new MeasureField("Sales", MeasureField.AggregationType.AVG)));
    pivot1.setRows(Lists.newArrayList(new MeasureField("Profit", MeasureField.AggregationType.AVG)));
    pivot1.setAggregations(Lists.newArrayList(
        new DimensionField("Category"), new DimensionField("Sub-Category")
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    ChartResultFormat format = new ChartResultFormat("scatter");
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithWordCloudChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(5);

    List<Filter> filters = Lists.newArrayList();

    // Case 1. 교차에 차원값 1개, 측정값 1개씩
    Pivot pivot1 = new Pivot();
    pivot1.setAggregations(Lists.newArrayList(
        new DimensionField("City"),
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    ChartResultFormat format = new ChartResultFormat("wordcloud");
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithTreeMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList();
    //    filters.add(new IntervalFilter("OrderDate", "2020-01-04T00:00:00.000", "2030-05-19T00:00:00.000"));

    // Case 1. 열, 차원값 1개 행 차원값 3개, 교차에 측정값 1개씩
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(
        new DimensionField("Region")
    ));
    pivot1.setRows(Lists.newArrayList(
        new DimensionField("State"),
        new DimensionField("City")
        //new DimensionField("CustomerName")
    ));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    // Case 1. 열, 차원값 1개 행 차원값 3개, 교차에 측정값 1개씩
    Pivot pivot2 = new Pivot();
    pivot2.setColumns(Lists.newArrayList(
        new DimensionField("State")
    ));
    pivot2.setRows(Lists.newArrayList(
        new DimensionField("Category"),
        new DimensionField("Region")
        //new DimensionField("CustomerName")
    ));
    pivot2.setAggregations(Lists.newArrayList(
        new MeasureField("Profit", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot2, limit);
    ChartResultFormat format = new ChartResultFormat("treemap");
    format.addOptions("showPercentage", true);
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithRadarChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList();

    // Case 1. 교차에 차원값 1개, 측정값 2개씩
    Pivot pivot1 = new Pivot();
    pivot1.setAggregations(Lists.newArrayList(
        new DimensionField("Category"),
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
        //        new MeasureField("Profit", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    ChartResultFormat format = new ChartResultFormat("radar");
    format.addOptions("addMinMax", true);
    format.addOptions("showCategory", true);
    format.addOptions("showPercentage", true);
    request.setResultFormat(format);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithHeatmapChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(5);

    List<Filter> filters = Lists.newArrayList();
    //List<Filter> filters = Lists.newArrayList(new IntervalFilter("OrderDate", 1, "MINUTES"));

    // Case 1. 행 차원값 2개 열 차원값 1개 교차에 측정값 1개씩
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category"), new DimensionField("Sub-Category")));
    pivot1.setRows(Lists.newArrayList(new DimensionField("Region"), new DimensionField("State")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    // Case 2. 행 차원값 2개 열 차원값 1개 교차에 측정값 1개씩
    Pivot pivot2 = new Pivot();
    pivot2.setColumns(Lists.newArrayList(new DimensionField("Sub-Category")));
    pivot2.setRows(Lists.newArrayList());
    pivot2.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM),
        new DimensionField("Region")
    ));

    // Case 1. 행 차원값 2개 열 차원값 1개 교차에 측정값 1개씩
    Pivot pivot3 = new Pivot();
    pivot3.setRows(Lists.newArrayList(new DimensionField("Category")));
    //    pivot3.setColumns(Lists.newArrayList(new DimensionField("Category")));
    //pivot3.setRows(Lists.newArrayList(new DimensionField("Region"), new DimensionField("State")));
    pivot3.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    ChartResultFormat format = new ChartResultFormat("heatmap");
    format.addOptions("showPercentage", true);
    format.addOptions("showCategory", true);
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithBoxplotChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList();

    // Case 1. 행 차원값 2개 열 차원값 1개 교차에 측정값 1개씩
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category"), new DimensionField("Sub-Category")));
    pivot1.setRows(Lists.newArrayList(new DimensionField("Region")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    // Case 2. 행 차원값 1개 교차에 측정값 1개, 차원값 1개씩
    Pivot pivot2 = new Pivot();
    pivot2.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot2.setRows(Lists.newArrayList(new DimensionField("City")));
    pivot2.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot2, limit);
    ChartResultFormat format = new ChartResultFormat("boxplot");
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithPieChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(5);

    List<Filter> filters = Lists.newArrayList();

    // Case 1. 교차에 측정값 1개 + 차원값 1개씩
    Pivot pivot1 = new Pivot();
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG),
        new DimensionField("City")
    ));

    // Case 1. 교차에 측정값 1개 + 차원값 1개씩
    Pivot pivot2 = new Pivot();
    pivot2.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG),
        new DimensionField("Category"), new DimensionField("Sub-Category")
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot1, limit);
    ChartResultFormat format = new ChartResultFormat("pie");
    format.addOptions("showPercentage", true);
    format.addOptions("showCategory", true);
    format.addOptions("addMinMax", true);
    request.setResultFormat(format);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryForEstateGeoHashWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("estate");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList(
        //new ExpressionFilter("amt < 50000 && amt > 40000")
    );

    DimensionField geoDimensionField = new DimensionField("gis");

    List<Field> fields = Lists.newArrayList(geoDimensionField,
                                            new MeasureField("py", null, MeasureField.AggregationType.AVG),
                                            new MeasureField("amt", null, MeasureField.AggregationType.SUM));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields, new LayerView.HashLayerView("geohex", 5));
    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryForEstateAbbrWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("estate");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList(
    );

    DimensionField geoDimensionField = new DimensionField("gis");

    List<Field> fields = Lists.newArrayList(geoDimensionField,
                                            new DimensionField("gu"),
                                            new MeasureField("py", null, MeasureField.AggregationType.NONE),
                                            new MeasureField("amt", null, MeasureField.AggregationType.NONE));

    //MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields, new LayerView.HashLayerView("geohex", 5));
    //    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields, new LayerView.AbbreviatedView("geohex", 12, RelayAggregation.Relaytype.FIRST.name()));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields, new LayerView.ClusteringLayerView("geohex", 5));
    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryForEstateGeoHashExprWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("estate");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(5);

    List<Filter> filters = Lists.newArrayList();

    ExpressionField expressionField1 = new ExpressionField("MEASURE_1", "COUNTOF( 1 )");
    expressionField1.setRole(MEASURE);
    expressionField1.setAggregated(true);

    MeasureField measureField = new MeasureField("MEASURE_1", "user_defined");

    DimensionField geoDimensionField = new DimensionField("gis", null, null);

    List<Field> fields = Lists.newArrayList(geoDimensionField, measureField);
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields, new LayerView.HashLayerView("h3", 5));
    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);
    request.setUserFields(Lists.newArrayList(expressionField1));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryForEstateWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("estate");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<String> valueList = Lists.newArrayList(
        "Jul 2018"
    );

    TimeListFilter timeListFilter = new TimeListFilter("event_time", null, "MONTH", "MONTH", false,
                                                       null, null,
                                                       valueList, null);

    List<Filter> filters = Lists.newArrayList(
        new ExpressionFilter("amt < 50000 && amt > 40000"),
        new InclusionFilter("gu_new", "user_defined", Arrays.asList("강남구_new")),
        //        new SpatialBboxFilter(null, "gis", null, "126.8060772 37.4458596", "127.1810908 37.6874771", null),
        //        new SpatialShapeFilter(null, "gis", null, SpatialOperations.INTERSECTS.name(), ShapeFormat.WKT.name(), "MULTIPOLYGON (((126.970143157837 37.5496155093979, 126.97013881470201 37.549504303227394, 126.970125492913 37.5492017751894, 126.97020615515999 37.54918323135059, 126.97031846561201 37.549158567421706, 126.97038829829201 37.549142093439706, 126.97044338018499 37.5491291303102, 126.97044440736002 37.549128319509194, 126.97050706343599 37.5490828258029, 126.970509959747 37.5490766084139, 126.97053368887002 37.549030564259404, 126.970540602433 37.5490162372906, 126.970571901957 37.5489471249179, 126.97058918463499 37.5489143264276, 126.970609362851 37.5488772030117, 126.970619358813 37.5488581005738, 126.970651774088 37.54879998279981, 126.970682040287 37.54874691106691, 126.97070539410701 37.54870519242571, 126.970719872086 37.5486828468578, 126.97073350934299 37.548661942960905, 126.97074144894201 37.548649508702894, 126.970778904779 37.54859175261111, 126.970793292634 37.5485610260768, 126.97082608508302 37.5484925448236, 126.97082851424501 37.5484872284866, 126.970868167898 37.54829862217999, 126.97087572741201 37.5483032200415, 126.97087569962902 37.548134700153895, 126.970875714496 37.5480964903016, 126.970874610505 37.54805485570479, 126.97087285784201 37.5480009649559, 126.970870004947 37.54789579702759, 126.97086668089801 37.547801983797505, 126.970865604765 37.547688795838205, 126.97086344335499 37.54748594060321, 126.97086277489498 37.5472847078463, 126.97086242121601 37.547234061669, 126.97086020240201 37.547178728915796, 126.97085624601101 37.5470308449573, 126.970856639295 37.54697974837409, 126.97086060224102 37.5468709774052, 126.970863481835 37.5466675826802, 126.970863485764 37.546657489509194, 126.97086387199099 37.5466245065602, 126.97086416115198 37.54660107605349, 126.970864161292 37.5466007155831, 126.97088546504699 37.5465478218015, 126.97090845014202 37.5464920446664, 126.97091284159002 37.54648141187031, 126.970868524318 37.5464232750866, 126.97084006852299 37.54638460760789, 126.97074972896202 37.54633249728481, 126.970712297821 37.54632996471361, 126.97069250819801 37.54633014003879, 126.97068923830201 37.5463371684009, 126.970666910582 37.5463825821328, 126.970653925244 37.5464083525432, 126.97064383577599 37.5464287166154, 126.97062160149 37.5464737698908, 126.970606467259 37.546504315994206, 126.970589557721 37.5465391872985, 126.970579468359 37.5465591908943, 126.970577319389 37.546564236944896, 126.970571153157 37.54657775304961, 126.970548074863 37.54663244868371, 126.97053153645899 37.5466729073632, 126.970502011096 37.54674292137129, 126.970479680191 37.54679581482501, 126.97044772559501 37.54687114514941, 126.97037995522 37.5468711281691, 126.97037930381902 37.5468659913023, 126.97032852617998 37.5468572371462, 126.9702215571 37.5468389163451, 126.97021510324501 37.5468712669372, 126.970188872526 37.546871350435396, 126.970079375728 37.54687141285849, 126.97007834692302 37.546876369066, 126.970073296243 37.54690115012699, 126.97000020679401 37.5468967158181, 126.969924595013 37.546897147172004, 126.969918433995 37.5468973258378, 126.96976944840598 37.5469040466097, 126.96973630994901 37.54690412823879, 126.969674420229 37.54690465306619, 126.969631200114 37.54690500242891, 126.969580421694 37.546898320656005, 126.969436762483 37.54689134450441, 126.96941090610498 37.54688908486911, 126.96938570279299 37.546887726573395, 126.96933492795101 37.546872393405906, 126.969333154346 37.54687239294531, 126.96931765860302 37.5468724790375, 126.969289933952 37.54687346312391, 126.96927266501099 37.546872557455394, 126.969198455281 37.54686857294659, 126.96918193108299 37.5468726239273, 126.96917539604401 37.546874334456, 126.969095482924 37.5468926074415, 126.96904833643602 37.54690692379181, 126.968977103278 37.54692835308809, 126.968927061432 37.54694636345079, 126.96886264149998 37.546970407881, 126.968825204888 37.5469804010571, 126.96880466755502 37.54698237822049, 126.96878917118799 37.5469839061248, 126.96875023666801 37.547004262405395, 126.968692721353 37.547035517977804, 126.968694492135 37.54704227726731, 126.96869738124501 37.54705345261569, 126.96870782614599 37.547077516783496, 126.96852019361098 37.547085307142105, 126.968518793355 37.5470853968864, 126.968405383809 37.5470660814299, 126.96819842366699 37.5470846802163, 126.96805475669102 37.54709536543109, 126.967939935608 37.547102723955206, 126.96792770703101 37.54710272063449, 126.967862842034 37.547075217130605, 126.967860321873 37.5470746757391, 126.967851360322 37.54707503377, 126.96784165202699 37.5470753014792, 126.967716748333 37.5470850902153, 126.96765191364702 37.5469876553455, 126.967642583544 37.546976838677, 126.96761300548499 37.546946370818695, 126.967601152977 37.5469402395703, 126.96757633337698 37.5469150899468, 126.96754573358498 37.54687299662, 126.967536031255 37.54685956643001, 126.967526608737 37.5468466770219, 126.96742335489002 37.5468728728037, 126.96737219477498 37.54688574549571, 126.967344476227 37.5468726707809, 126.967273920079 37.5468391274991, 126.96723612215801 37.5468211836143, 126.96721920786 37.54686317372321, 126.967218832931 37.5468666882056, 126.967215936629 37.546872454928206, 126.967213040366 37.546878131533, 126.96719687878701 37.546906514089294, 126.96715222598002 37.54698084869789, 126.967139990065 37.5469976071674, 126.967125973058 37.547031397366204, 126.96712418306399 37.5470687055544, 126.967080575344 37.5471011357412, 126.967000000526 37.5471364393495, 126.966998879874 37.54713752044751, 126.96696862913302 37.5471511197466, 126.96687935968602 37.547216159647206, 126.96684985196501 37.5472381400607, 126.96684583664 37.547241202931595, 126.96679335734902 37.5472810201631, 126.96672277834898 37.5472985732252, 126.966693280373 37.54729847479089, 126.966641005728 37.54729773909369, 126.966557178725 37.5472985264404, 126.96651470455001 37.5473002266377, 126.96645094044901 37.5473165198232, 126.966423586523 37.547323000515206, 126.966412103282 37.5473261513653, 126.96638904267802 37.5473341652696, 126.96635739249498 37.547345601191, 126.96633069032701 37.5473557768685, 126.96631201723501 37.54736343153831, 126.96628643527302 37.5473735174078, 126.96626552144801 37.5473819824887, 126.966256920531 37.54741054730881, 126.966239251042 37.54746965940001, 126.96623708712102 37.547507147700095, 126.966236431284 37.547512464450605, 126.96625658170602 37.5475409473699, 126.966263373521 37.547591144809495, 126.96628100137102 37.54762449335351, 126.96628930172298 37.5476415279481, 126.96629620363498 37.547654596969, 126.966298718407 37.547667124031896, 126.966308772923 37.54772741556901, 126.96630839863602 37.54772939804919, 126.96629794151302 37.547733991062096, 126.966286830177 37.547740296121496, 126.96624724085902 37.54776128221009, 126.96623855747599 37.547765605372, 126.96620540939898 37.5477861427, 126.966199713538 37.547789655655706, 126.96609811743001 37.5478617206009, 126.966042371484 37.5478984725584, 126.96599624333201 37.547928828910614, 126.965966362739 37.5479484659359, 126.965919207235 37.5479798132551, 126.96585188188402 37.5480252130674, 126.965833579751 37.5480377341174, 126.96578857215302 37.5480669191834, 126.965789317463 37.548070163632396, 126.96562585633501 37.5480849855621, 126.96548470770901 37.54809521779289, 126.96544400427798 37.54810214494209, 126.965370999403 37.5481147400165, 126.965272697418 37.5481261560801, 126.965221538966 37.54813280972451, 126.96517262101301 37.5481391936549, 126.96515030921101 37.54814207083471, 126.96513733283199 37.54814386935579, 126.965106712655 37.5481473748971, 126.965099150402 37.5481494453666, 126.965036504788 37.5481671799978, 126.96488600468402 37.5482121941301, 126.96481224866201 37.5482336201584, 126.96474923430799 37.5482411712403, 126.96472552230502 37.54824386768661, 126.964677257852 37.5482498911365, 126.964672228301 37.5482259183551, 126.96466393982402 37.54818437166969, 126.964437456547 37.548222153060905, 126.96382189569701 37.54825413804299, 126.96351696597202 37.54835822014591, 126.963494650746 37.5483678558301, 126.963404993916 37.54845235836681, 126.96342406268201 37.5485913255785, 126.963442785405 37.54867441978091, 126.96351297317102 37.5486976918242, 126.963529960086 37.5487033744791, 126.96353425347901 37.5487048176863, 126.963579614254 37.5487197912033, 126.96361312139999 37.5487310662302, 126.963671362358 37.54875045944141, 126.96371028308799 37.5487632681048, 126.963711029319 37.54876443986261, 126.963731552691 37.54879256285101, 126.96373042559202 37.5488068010813, 126.96372760290701 37.548852579941, 126.963726848595 37.5488680799316, 126.963724307965 37.54890971346911, 126.96372148514202 37.548955762680514, 126.963717817358 37.54901172456441, 126.96371640338701 37.5490400210467, 126.963715643435 37.549067146201395, 126.963714976921 37.5490940911495, 126.963714207838 37.54914005087281, 126.96371248493502 37.54922791497099, 126.96371248393001 37.549229987674806, 126.963710978787 37.54925377824961, 126.96380029171999 37.549495591088316, 126.963802808359 37.54950352220521, 126.963806720643 37.549521006211506, 126.96380961334499 37.549523440272296, 126.96381073307701 37.549524431908694, 126.96382154087699 37.549567691650005, 126.96383199401001 37.5495722007304, 126.963833019259 37.549575535394105, 126.96385063905102 37.54962429438989, 126.963853527929 37.54963465879371, 126.963855764612 37.5496424095885, 126.96385716265898 37.549647006012, 126.963862942247 37.54966394988221, 126.96386434059902 37.5496679154827, 126.963878789494 37.549710455391605, 126.96388270458898 37.54972217187179, 126.963883823238 37.54972541644611, 126.96389062822301 37.54974542462531, 126.963898181238 37.5497629097411, 126.963894633283 37.5497641703021, 126.96389966568701 37.5497819249996, 126.963909749446 37.54977814314471, 126.96393235547198 37.5497469693769, 126.96394432174698 37.549711016125585, 126.963948997247 37.5496945260399, 126.96396478244 37.5496761468762, 126.96397384361401 37.54966344306521, 126.964002232534 37.5496422740968, 126.964015586763 37.54963182453031, 126.96402417926198 37.5496230857452, 126.964056584236 37.54959777257928, 126.96409804635202 37.54956804639811, 126.96414697253998 37.5495466132844, 126.964219686515 37.5495600628572, 126.96428483633402 37.54957927762149, 126.964310780821 37.5495941548636, 126.964361923189 37.54962354863499, 126.964442181418 37.5496734078416, 126.96446588597 37.549687383199206, 126.964534669101 37.54972254972651, 126.96459225275001 37.549752215684705, 126.964617161463 37.5497861974707, 126.964629004212 37.5498134165213, 126.96464084543601 37.54984387980209, 126.96468984484902 37.5498651622085, 126.96473659867802 37.5498974382657, 126.96477766188299 37.549921692144395, 126.96491876813799 37.5500094185327, 126.964928846853 37.5500163605783, 126.964990822539 37.5500371961249, 126.965020688471 37.5500512633145, 126.96505923434601 37.5500691180026, 126.9651121482 37.5501045498471, 126.96517009713999 37.5501527798454, 126.96520359540702 37.5501850518054, 126.96522626589899 37.55021515774631, 126.965261903363 37.550264552654006, 126.965296049332 37.5503094412348, 126.965253633806 37.5503821536234, 126.965285641296 37.5504085674795, 126.96529431701701 37.55042154695679, 126.965310456104 37.5504448921443, 126.96532491665799 37.550464361782005, 126.965337510553 37.550483019812, 126.965345720074 37.550494827620405, 126.96540406790999 37.550488896972205, 126.96542423288601 37.5504869202926, 126.96543393876 37.5504928708924, 126.965461283035 37.550510001228005, 126.965465292147 37.55052090662381, 126.965484042718 37.5505495694862, 126.965516787048 37.55059797217551, 126.965541588299 37.550664125694, 126.96554876904601 37.5506801687122, 126.96556863046601 37.55072937868451, 126.96561899810101 37.5508223045478, 126.96564997948401 37.55084772671151, 126.96573349299298 37.550928676529, 126.96573563564898 37.55093840984521, 126.965853037937 37.5510160350572, 126.965891859761 37.55104443330259, 126.96590156517 37.5510516455088, 126.96591136426301 37.55105813680099, 126.96596679233001 37.551109880256995, 126.96599338660701 37.5511347603596, 126.96601279583402 37.5511527894554, 126.96603836354501 37.55117703842951, 126.96604778815001 37.551185962776, 126.966061782274 37.551205432187, 126.96609023539 37.55124860666161, 126.966104601929 37.5512703291126, 126.966119060972 37.55129394405661, 126.966140610055 37.5513281949012, 126.966154696686 37.551349646913, 126.966191083961 37.5513949864569, 126.96622309274301 37.551420228527, 126.96623531755202 37.55143014495211, 126.966250808431 37.5514429460704, 126.96628785528999 37.551474948377596, 126.96631735912901 37.5514656746917, 126.96635479920998 37.5514536997341, 126.966356666723 37.5514527089734, 126.96636274813498 37.551422791685006, 126.966373227552 37.5513697154426, 126.966399091373 37.55135863834871, 126.966407401225 37.55135548659939, 126.96643653049799 37.551348645950405, 126.96646678012601 37.55134153525981, 126.966528679743 37.5513271340172, 126.966606830988 37.551294353362195, 126.966611873022 37.5512921919671, 126.966617662001 37.5512897604305, 126.966620556431 37.551288679838294, 126.96663923031001 37.551281385595395, 126.96665939683199 37.5512763447094, 126.96666369143702 37.5512755348641, 126.966687872661 37.5512693235787, 126.966736430613 37.5512370751902, 126.966758005418 37.551214011176704, 126.96678612931602 37.551158506688196, 126.966796219752 37.5511397650783, 126.966812746779 37.551131749263796, 126.966832168422 37.55112220226191, 126.96683506360098 37.55111940943141, 126.966844773342 37.55111706910229, 126.966846267428 37.5511160782289, 126.966932644395 37.551058337108, 126.96695066670601 37.5510465367562, 126.96698848577 37.55102122430691, 126.966994944042 37.5509828360403, 126.966998126737 37.55096310118859, 126.967065087446 37.55090220042711, 126.967094318394 37.55087589425461, 126.96710757973199 37.5508639123164, 126.96719900759001 37.550782561608806, 126.967218151562 37.5507672469429, 126.96734197615301 37.5506774340638, 126.967352801332 37.5506859081065, 126.96735634664 37.5506906853166, 126.967363909794 37.55068699258791, 126.96737007234701 37.5506840204121, 126.96737763554002 37.550680237565, 126.96743739387799 37.5506507856226, 126.967646162537 37.55057487391951, 126.96767211663901 37.550569834445604, 126.967667366653 37.550544419996804, 126.967833371849 37.55048633951831, 126.96785998188798 37.55047544254099, 126.96786679810101 37.55047192981179, 126.967900692068 37.5504552672843, 126.9679964848 37.5504237521445, 126.968088636261 37.5503933173534, 126.96810553654701 37.55038494098749, 126.968126080397 37.5503698969041, 126.968137573701 37.5503440362692, 126.96817250342599 37.55030619631831, 126.968147600096 37.550255363304196, 126.96815227543398 37.550237160819904, 126.968161333627 37.5502299538586, 126.968162736242 37.5502244570661, 126.968169559853 37.550203461516105, 126.96823800613302 37.5501577002306, 126.96831214571098 37.5501144637246, 126.968406441926 37.5500883549019, 126.968452934914 37.550079175342105, 126.96848784519601 37.550086844656, 126.968493632428 37.5500881979637, 126.96849755285501 37.5500890100677, 126.96854683797402 37.5500998373128, 126.96858650618502 37.55011471726911, 126.96862104630202 37.550114726453096, 126.9686245934 37.5501153582186, 126.96864876442402 37.5501322166213, 126.968672197093 37.5501288884912, 126.968699836767 37.55011078219281, 126.968702357827 37.5501094310977, 126.96870712023102 37.550105917775404, 126.968771923237 37.55006529191459, 126.96878695679202 37.5500558335463, 126.96882589221302 37.5500370993807, 126.96886622713902 37.5500201679223, 126.968935695427 37.5499846799017, 126.968935706161 37.549958816166, 126.96902608038198 37.549934688402104, 126.969034296427 37.54993198703029, 126.9691336357 37.549899660837, 126.96915743651901 37.5499088590471, 126.96924313293 37.549909331988005, 126.969266559657 37.5499202423122, 126.96930184376 37.549926920189904, 126.96932266729802 37.54991187596979, 126.96933667410802 37.5499018765591, 126.969383178404 37.54986448984009, 126.96938495901 37.5498475482009, 126.96943893503001 37.5498011516407, 126.969491892936 37.5497331265781, 126.969526830386 37.5496739283626, 126.969547662497 37.54963752624241, 126.969558125258 37.54961923507529, 126.969576522557 37.5496016668923, 126.96967192307199 37.5496121450713, 126.969674443441 37.5496124160713, 126.96993722673298 37.549612212915406, 126.96999837112301 37.5496135802303, 126.97001284046301 37.54961376414091, 126.970143157837 37.5496155093979)))"),
        new SpatialPointFilter(null, "gis", null, 37.501176, 127.035949, 1000.0, SpatialOperations.INTERSECTS.name()),
        timeListFilter
        //        new BoundFilter("amt", null, 0, 62510)
    );

    ExpressionField expressionField1 = new ExpressionField("gu_new", "\"gu\" + '_new'");

    //    List<Field> layer1 = Lists.newArrayList(new DimensionField("gis", null, new GeoFormat()), new DimensionField("gu"), new MeasureField("py", null, MeasureField.AggregationType.NONE));
    List<Field> fields = Lists.newArrayList(new DimensionField("gis", null, null), new DimensionField("gu_new", "user_defined"), new MeasureField("amt", null, MeasureField.AggregationType.NONE));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields, null);
    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);
    request.setUserFields(Lists.newArrayList(expressionField1));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryTimeFieldForSaleGeoWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(500);

    List<Filter> filters = Lists.newArrayList();

    //    List<Field> fields = Lists.newArrayList(new DimensionField("location", null, new GeoFormat()));
    //    List<Field> fields = Lists.newArrayList(new DimensionField("location", null, new GeoPointFormat()), new TimestampField("OrderDate", null), new MeasureField("Sales", null, MeasureField.AggregationType.NONE));
    //    List<Field> fields = Lists.newArrayList(new DimensionField("location", null, null), new MeasureField("Profit", null, MeasureField.AggregationType.AVG), new MeasureField("Sales", null, MeasureField.AggregationType.AVG));
    //    MapViewLayer layer1 = new MapViewLayer("layer1", "sales_geo", fields, new LayerView.HashLayerView("h3", 5));

    //        List<Field> fields2 = Lists.newArrayList(new DimensionField("location", null, null), new DimensionField("City"), new MeasureField("Profit", null, MeasureField.AggregationType.AVG));
    //        MapViewLayer layer2 = new MapViewLayer("layer1", "sales_geo", fields2, null);
    //        MapViewLayer layer2 = new MapViewLayer("layer1", "sales_geo", fields2, new LayerView.ClusteringLayerView("h3", 5));

    List<Field> fields1 = Lists.newArrayList(new DimensionField("location", null, null), new MeasureField("Profit", null, MeasureField.AggregationType.AVG));
    MapViewLayer layer1 = new MapViewLayer("layer1", "sales_geo", fields1, new LayerView.ClusteringLayerView("h3", 5));

    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .log().all();
//      .statusCode(HttpStatus.SC_OK);

    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryMultiLayerEstateSaleGeoWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new MultiDataSource(Lists.newArrayList(new DefaultDataSource("sales_geo"),
                                                                    new DefaultDataSource("estate")),
                                                 null);

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList(
        new SpatialBboxFilter("sales_geo", "location", null, "-123.52115624999999 23.439926562500006", "-68.32584374999999 51.125473437500006", null),
        new SpatialBboxFilter("estate", "gis", null, "-123.52115624999999 23.439926562500006", "-68.32584374999999 51.125473437500006", null)
    );

    List<Field> fields1 = Lists.newArrayList(new DimensionField("location", null, null), new DimensionField("City"), new MeasureField("Profit", null, MeasureField.AggregationType.AVG));
    MapViewLayer layer1 = new MapViewLayer("layer1", "sales_geo", fields1, new LayerView.ClusteringLayerView("h3", 5));

    List<Field> fields2 = Lists.newArrayList(new DimensionField("gis", null, null), new DimensionField("gu"), new MeasureField("amt", null, MeasureField.AggregationType.NONE));
    MapViewLayer layer2 = new MapViewLayer("layer2", "estate", fields2, null);

    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1, layer2));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .log().all();
//      .statusCode(HttpStatus.SC_OK);

    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryDistanceWithinEstateRoadWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new MultiDataSource(Lists.newArrayList(new DefaultDataSource("estate"),
                                                                    new DefaultDataSource("seoul_roads")),
                                                 null);

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList(
        new SpatialBboxFilter("estate", "gis", null, "127.066436 37.484505", "127.007656 37.521752", null)
    );

    List<Field> fields1 = Lists.newArrayList(new DimensionField("gis", null, null), new DimensionField("gu"), new MeasureField("amt", null, MeasureField.AggregationType.NONE));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields1, null);

    List<Field> fields2 = Lists.newArrayList(new DimensionField("geom", null, null));
    MapViewLayer layer2 = new MapViewLayer("layer2", "seoul_roads", fields2, null);

    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1, layer2));

    GeoSpatialOperation operation = new GeoSpatialOperation.Within(1000, false, null);
    GeoSpatialAnalysis geoSpatialAnalysis = new GeoSpatialAnalysis("layer1", "layer2", true, operation);

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);
    request.setAnalysis(geoSpatialAnalysis);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .log().all();
//      .statusCode(HttpStatus.SC_OK);

    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryDistanceWithinChoroplethEstateRoadWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new MultiDataSource(Lists.newArrayList(new DefaultDataSource("estate"),
                                                                    new DefaultDataSource("seoul_roads")),
                                                 null);

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList(
        new SpatialBboxFilter("estate", "gis", null, "127.066436 37.484505", "127.007656 37.521752", null)
    );

    //    List<Field> fields1 = Lists.newArrayList(new DimensionField("gis", null, null), new DimensionField("gu"), new MeasureField("amt", null, MeasureField.AggregationType.SUM));
    List<Field> fields1 = Lists.newArrayList(new DimensionField("gis", null, null), new DimensionField("gu"));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields1, null);

    List<Field> fields2 = Lists.newArrayList(new DimensionField("geom", null, null));
    MapViewLayer layer2 = new MapViewLayer("layer2", "seoul_roads", fields2, null);

    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1, layer2));

    GeoSpatialOperation operation = new GeoSpatialOperation.Within(1000, true, new GeoSpatialOperation.ChoroplethAggregation(MeasureField.AggregationType.SUM, "py"));
    GeoSpatialAnalysis geoSpatialAnalysis = new GeoSpatialAnalysis("layer1", "layer2", false, operation);

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);
    request.setAnalysis(geoSpatialAnalysis);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .log().all();
//      .statusCode(HttpStatus.SC_OK);

    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryIntersectsEstateRoadWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new MultiDataSource(Lists.newArrayList(new DefaultDataSource("sales_geo"),
                                                                    new DefaultDataSource("usa_states")),
                                                 null);

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("sales_geo", "State", null, Lists.newArrayList("California"))
    );

    List<Field> fields1 = Lists.newArrayList(new DimensionField("location", null, null), new DimensionField("City"), new MeasureField("Sales", null, MeasureField.AggregationType.NONE));
    MapViewLayer layer1 = new MapViewLayer("layer1", "sales_geo", fields1, null);

    List<Field> fields2 = Lists.newArrayList(new DimensionField("state_geom", null, null));
    MapViewLayer layer2 = new MapViewLayer("layer2", "usa_states", fields2, null);

    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1, layer2));

    GeoSpatialOperation operation = new GeoSpatialOperation.Intersects(0, false, null);
    GeoSpatialAnalysis geoSpatialAnalysis = new GeoSpatialAnalysis("layer1", "layer2", false, operation);

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);
    request.setAnalysis(geoSpatialAnalysis);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .log().all();
//      .statusCode(HttpStatus.SC_OK);

    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryChoroplethSalesStateWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new MultiDataSource(Lists.newArrayList(new DefaultDataSource("sales_geo"),
                                                                    new DefaultDataSource("usa_states")),
                                                 null);

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("sales_geo", "Region", null, Lists.newArrayList("East"))
    );

    List<Field> fields1 = Lists.newArrayList(new DimensionField("location", null, null), new MeasureField("Sales", null, MeasureField.AggregationType.AVG));
    MapViewLayer layer1 = new MapViewLayer("layer1", "sales_geo", fields1, null);

    List<Field> fields2 = Lists.newArrayList(new DimensionField("state_geom"), new DimensionField("state_name"));
    MapViewLayer layer2 = new MapViewLayer("layer2", "usa_states", fields2, null);

    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1, layer2));

    GeoSpatialOperation operation = new GeoSpatialOperation.Intersects(0, false, null);
    GeoSpatialAnalysis geoSpatialAnalysis = new GeoSpatialAnalysis("layer1", "layer2", false, operation);

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);
    request.setAnalysis(geoSpatialAnalysis);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .log().all();
//      .statusCode(HttpStatus.SC_OK);

    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_gis_datasource.sql")
  public void searchQueryEstateRoadWithMapChart() throws JsonProcessingException {

    DataSource dataSource1 = new MultiDataSource(Lists.newArrayList(new DefaultDataSource("estate"),
                                                                    new DefaultDataSource("seoul_roads")),
                                                 null);

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList(
        new SpatialBboxFilter("estate", "gis", null, "127.00702944992682 37.46699154436034", "127.09886828659677 37.524326444262684", null),
        new SpatialBboxFilter("seoul_roads", "geom", null, "127.00702944992682 37.46699154436034", "127.09886828659677 37.524326444262684", null)
    );

    List<Field> fields1 = Lists.newArrayList(new DimensionField("gis", null, null), new DimensionField("gu"), new MeasureField("amt", null, MeasureField.AggregationType.NONE));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields1, null);

    List<Field> fields2 = Lists.newArrayList(new DimensionField("geom", null, null));
    MapViewLayer layer2 = new MapViewLayer("layer2", "seoul_roads", fields2, null);

    Shelf geoShelf = new GeoShelf(Arrays.asList(layer2, layer1));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, geoShelf, limit);
    ChartResultFormat format = new ChartResultFormat("map");
    request.setResultFormat(format);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .log().all();
//      .statusCode(HttpStatus.SC_OK);

    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/scripts/default_join_datasource.sql")
  public void searchQueryForSalesJoinedSelect() throws JsonProcessingException {

    //    DefaultDataSource dataSource = new DefaultDataSource("sales");

    MappingDataSource dataSource = new MappingDataSource();
    dataSource.setName("sales");
    Map<String, String> keyPair1 = Maps.newHashMap();
    keyPair1.put("Category", "cat");
    Map<String, String> keyPair2 = Maps.newHashMap();
    keyPair2.put("Region", "region");
    Map<String, String> keyPair3 = Maps.newHashMap();
    keyPair3.put("abbr", "cat");

    JoinMapping childJoinMapping = new JoinMapping("sales_join_category_abbr", null, "LEFT_OUTER", keyPair3, null);
    JoinMapping joinMapping1 = new JoinMapping("sales_join_category", "join1", "LEFT_OUTER", keyPair1, childJoinMapping);
    JoinMapping joinMapping2 = new JoinMapping("sales_join_region", null, "LEFT_OUTER", keyPair2, null);

    dataSource.setJoins(Lists.newArrayList(
        joinMapping1, joinMapping2
    ));

    // Limit
    Limit limit = new Limit();
    limit.setLimit(5);

    List<Filter> filters = Lists.newArrayList(
        //        new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000"),
        //        new LikeFilter("Category", "T_chnology")
    );

    List<Field> projections = Lists.newArrayList(
        //          new DimensionField("Category"),
        //          new MeasureField("Sales", MeasureField.AggregationType.AVG)
    );

    SearchQueryRequest request = new SearchQueryRequest(dataSource, filters, projections, limit);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/scripts/default_join_datasource.sql")
  public void searchQueryForSalesJoinedGroupBy() throws JsonProcessingException {

    MappingDataSource dataSource = new MappingDataSource();
    dataSource.setName("sales");
    Map<String, String> keyPair1 = Maps.newHashMap();
    keyPair1.put("Category", "cat");
    Map<String, String> keyPair2 = Maps.newHashMap();
    keyPair2.put("Region", "region");
    Map<String, String> keyPair3 = Maps.newHashMap();
    keyPair3.put("abbr", "cat");

    JoinMapping childJoinMapping = new JoinMapping("sales_join_category_abbr", null, "INNER", keyPair3, null);
    JoinMapping joinMapping1 = new JoinMapping("sales_join_category", "join1", "INNER", keyPair1, childJoinMapping);
    //    JoinMapping joinMapping1 = new JoinMapping("sales_join_category", null,"INNER", keyPair1, null);
    JoinMapping joinMapping2 = new JoinMapping("sales_join_region", null, "LEFT_OUTER", keyPair2, null);

    dataSource.setJoins(Lists.newArrayList(
        joinMapping1, joinMapping2
    ));

    // Limit
    Limit limit = new Limit();
    limit.setLimit(5);

    List<Filter> filters = Lists.newArrayList(
        new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000"),
        new InclusionFilter("value", "join1.sales_join_category", Lists.newArrayList("사무용품"))
    );

    List<Field> projections = Lists.newArrayList(
        new DimensionField("cat", "join1.sales_join_category_abbr"),
        new MeasureField("Sales", "sales", MeasureField.AggregationType.AVG)
    );

    SearchQueryRequest request = new SearchQueryRequest(dataSource, filters, projections, limit);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/scripts/default_join_datasource.sql")
  public void candidateQueryForSalesJoined() throws JsonProcessingException {

    //    DefaultDataSource dataSource = new DefaultDataSource("sales");

    MappingDataSource dataSource = new MappingDataSource();
    dataSource.setName("sales");
    Map<String, String> keyPair1 = Maps.newHashMap();
    keyPair1.put("Category", "cat");
    Map<String, String> keyPair2 = Maps.newHashMap();
    keyPair2.put("Region", "region");
    Map<String, String> keyPair3 = Maps.newHashMap();
    keyPair3.put("abbr", "cat");

    JoinMapping childJoinMapping = new JoinMapping("sales_join_category_abbr", null, "INNER", keyPair3, null);
    JoinMapping joinMapping1 = new JoinMapping("sales_join_category", "join1", "INNER", keyPair1, childJoinMapping);
    JoinMapping joinMapping2 = new JoinMapping("sales_join_region", null, "LEFT_OUTER", keyPair2, null);

    dataSource.setJoins(Lists.newArrayList(
        joinMapping1, joinMapping2
    ));

    // Limit
    Limit limit = new Limit();
    limit.setLimit(5);

    List<Filter> filters = Lists.newArrayList(
        //        new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000"),
        //        new LikeFilter("Category", "T_chnology")
    );

    ExpressionField exprField = new ExpressionField("expr_test", "\"sales.Category\"", "dimension");

    //    DimensionField targetField = new DimensionField("abbr", "join1.sales_join_category_abbr");
    //    DimensionField targetField = new DimensionField("value", "sales_join_category");
    DimensionField targetField = new DimensionField("expr_test", "user_defined");
    //    MeasureField targetField = new MeasureField("Sales", "sales");
    //    TimestampField targetField = new TimestampField("OrderDate", "sales");

    CandidateQueryRequest request = new CandidateQueryRequest(dataSource, filters, targetField);
    request.setSortBy(CandidateQueryRequest.SortCreteria.VALUE);
    request.setUserFields(Lists.newArrayList(exprField));

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/candidate")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQueryForSalesWithMultiInterval() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        new Sort("OrderDate", "ASC")
    ));

    IntervalFilter timestampFilter = new IntervalFilter("OrderDate",
                                                        Lists.newArrayList(
                                                            "2011-01-01T00:00:00.000/2011-01-15T00:00:00.000",
                                                            "2012-01-01T00:00:00.000/CURRENT_DATETIME"
                                                        ));

    IntervalFilter dimensionFilter = new IntervalFilter("ShipDate",
                                                        Lists.newArrayList(
                                                            "2011-01-01T00:00:00.000/2011-02-01T00:00:00.000",
                                                            "2012-01-01T00:00:00.000/2012-02-01T00:00:00.000"
                                                        ));

    List<Filter> filters = Lists.newArrayList(
        dimensionFilter,
        timestampFilter
    );

    // Case1
    Pivot pivot = new Pivot();
    TimestampField timestampField = new TimestampField("OrderDate", null, new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.DAY.name(), null));
    DimensionField dimensionField = new DimensionField("ShipDate");
    pivot.setColumns(Lists.newArrayList(timestampField, dimensionField));
    pivot.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.AVG)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot, limit);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @Sql({"/sql/sales_required.sql"})
  public void searchQueryForSalesFiltering() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("State", Lists.newArrayList("Texas")),
        new InclusionFilter("City", Lists.newArrayList("Austin"))
    );

    // Case 2
    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot.setAggregations(Lists.newArrayList(
        new MeasureField("Sales", MeasureField.AggregationType.SUM),
        new MeasureField("Sales", MeasureField.AggregationType.AVG),
        new DimensionField("Quantity")
    ));


    //    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, projections, limit);
    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot, limit);
    JsonResultForward forward = new JsonResultForward();
    forward.setRemoveFile(false);
    request.setResultForward(forward);
    request.setResultFormat(new ChartResultFormat("line"));

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .body(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request))
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/search")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void candidateQueryForMeasure() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(50000);

    MeasureField measureField = new MeasureField("Sales");
    //    MeasureField measureField = new MeasureField("dis", "user_defined");

    ExpressionField expressionField = new ExpressionField("dis", "\"Discount\" + 100", "measure", false);

    CandidateQueryRequest request = new CandidateQueryRequest();
    request.setDataSource(dataSource1);
    //request.setUserFields(Lists.newArrayList(expressionField));
    request.setTargetField(measureField);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/candidate")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void candidateQueryForTimestamp() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(50000);

    TimestampField timestampTargetField = new TimestampField("OrderDate", null,
                                                             new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.DAY.name(), null, "list"));

    CandidateQueryRequest request = new CandidateQueryRequest();
    request.setDataSource(dataSource1);
    request.setTargetField(timestampTargetField);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/candidate")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void candidateQueryForSaleFilterd() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(50000);

    List<Filter> filters = Lists.newArrayList(
        //        new InclusionFilter("State", Lists.newArrayList("Texas"))
    );

    DimensionField targetField = new DimensionField("Category");
    //    DimensionField targetField = new DimensionField("OrderDate");
    //    DimensionField targetField = new DimensionField("ShipDate");

    CandidateQueryRequest request = new CandidateQueryRequest();
    request.setDataSource(dataSource1);
    request.setFilters(filters);
    request.setTargetField(targetField);
    request.setContext(TestUtils.makeMap(QueryRequest.CONTEXT_ROUTE_URI, "/route/uri"));

    List<UserDefinedField> userFields = Lists.newArrayList(
        new ExpressionField("test1", "AVGOF(\"Sales\")", "measure", true),
        new ExpressionField("test2", "countd(\"City\")", "measure", true)
        //        new ExpressionField("test", "Sales + 1", "measure", null,false)
    );

    request.setUserFields(userFields);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/candidate")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void candidateQueryForUserDefined() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(50000);

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("State", Lists.newArrayList("Texas"))
    );

    ExpressionField expressionField1 = new ExpressionField("cate_new", "\"Category\" + '_new'");
    ExpressionField expressionField2 = new ExpressionField("sales_plus", "\"Sales\" + 1000");

    DimensionField targetField1 = new DimensionField("cate_new", "user_defined");
    MeasureField targetField2 = new MeasureField("sales_plus", "user_defined");
    //    DimensionField targetField = new DimensionField("OrderDate");
    //    DimensionField targetField = new DimensionField("ShipDate");

    CandidateQueryRequest request = new CandidateQueryRequest();
    request.setDataSource(dataSource1);
    request.setFilters(filters);
    request.setTargetField(targetField2);
    request.setUserFields(Lists.newArrayList(expressionField2));

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/candidate")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void candidateQueryForSaleWithAdvancedFilters() throws JsonProcessingException {

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(50000);

    List<Filter> filters = Lists.newArrayList(
        new IntervalFilter("ShipDate", Lists.newArrayList(
            "2011-01-01T00:00:00.000/2013-02-01T00:00:00.000"
        )),
        new InclusionFilter("State", Lists.newArrayList("Texas")),
        new MeasureInequalityFilter("Sales", "SUM", "GREATER_THAN", 100),
        new MeasurePositionFilter("Sales", "SUM", "TOP", 5),
        new WildCardFilter("Sub-Category", null, "BOTH", "ho")
    );

    DimensionField targetField = new DimensionField("Sub-Category");
    //    DimensionField targetField = new DimensionField("orderdate");

    CandidateQueryRequest request = new CandidateQueryRequest();
    request.setDataSource(dataSource1);
    request.setFilters(filters);
    request.setTargetField(targetField);

    System.out.println(GlobalObjectMapper.getDefaultMapper().writeValueAsString(request));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/query/candidate")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }


  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_datasource_temporary.sql")
  public void candidateQueryForLinkedDataSource() {

    DataSource dataSource1 = new DefaultDataSource("test_linked");

    List<String> intervals = Lists.newArrayList("2000-11-04T09:00:00/CURRENT_DATETIME");
    IntervalFilter intervalFilter = new IntervalFilter("OrderDate", intervals);

    List<String> valueList = Lists.newArrayList("TX", "KY");
    InclusionFilter inclusionFilter = new InclusionFilter("state", valueList);

    List<Filter> filters = Lists.newArrayList(intervalFilter, inclusionFilter);

    CandidateQueryRequest request = new CandidateQueryRequest();
    request.setDataSource(dataSource1);
    request.setFilters(filters);
    request.setTargetField(new DimensionField("city"));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/candidate")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on


  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void validateCalucationNormalCaseNonIncludeAggregateFunction() throws JsonProcessingException {

    // Normal Case
    //
    DataQueryController.CheckExprRequest noralReq = new DataQueryController.CheckExprRequest();
    noralReq.setExpr("x + y");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
//      .accept(ContentType.JSON)
      .body(noralReq)
    .when()
      .post("/api/datasources/validate/expr")
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("aggregated", is(false))
      .log().all();
    // @formatter:on

    DataQueryController.CheckExprRequest abnoralReq = new DataQueryController.CheckExprRequest();
    abnoralReq.setExpr("x + y + sumof(z+x");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(abnoralReq)
      .accept(ContentType.JSON)
    .when()
      .post("/api/datasources/validate/expr")
    .then()
      .statusCode(HttpStatus.SC_BAD_REQUEST)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void validateCalucationNormalCaseIncludeAggregateFunction() {

    // Normal Aggregated Case
    //
    DataQueryController.CheckExprRequest noralReq = new DataQueryController.CheckExprRequest();
    noralReq.setDataSource(new DefaultDataSource("sales"));
    noralReq.setExpr("Sales + 1");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(noralReq)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/datasources/validate/expr")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("aggregated", is(false))
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void checkSimilarity() {

    SimilarityQueryRequest queryRequest = new SimilarityQueryRequest(Lists.newArrayList("sales", "sales_join_category"), null);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(queryRequest)
      .log().all()
    .when()
      .post("/api/datasources/query/similarity")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void getDataSourceFieldStats() throws JsonProcessingException {

    SummaryQueryRequest summaryQueryRequest = new SummaryQueryRequest(new DefaultDataSource("sales"),
                                                                      Lists.newArrayList(new TimestampField("OrderDate"),
                                                                                         new DimensionField("Category"),
                                                                                         new MeasureField("Sales")));
    //    SummaryQueryRequest summaryQueryRequest = new SummaryQueryRequest("sales", Lists.newArrayList(new MeasureField("Sales"),
    //        new MeasureField("Profit")));
    //    SummaryQueryRequest summaryQueryRequest = new SummaryQueryRequest("sales", Lists.newArrayList(new TimestampField("OrderDate")));

    String reqBody = GlobalObjectMapper.writeValueAsString(summaryQueryRequest);
    System.out.println(reqBody);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(reqBody)
      .log().all()
    .when()
      .post("/api/datasources/stats")
    .then()
//      .statusCode(HttpStatus.SC_NOT_FOUND)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void getDataSourceFieldCovariance() throws JsonProcessingException {

    CovarianceQueryRequest covarianceRequest = new CovarianceQueryRequest(new DefaultDataSource("sales"), "DaystoShipScheduled", null, null);

    String reqBody = GlobalObjectMapper.writeValueAsString(covarianceRequest);
    System.out.println(reqBody);

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(reqBody)
    .when()
      .post("/api/datasources/covariance")
    .then()
//      .statusCode(HttpStatus.SC_NOT_FOUND)
    .log().all();
    // @formatter:on
  }


  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void cancelQuery() {

    String queryId = "query-id-1234";

    DataSource dataSource1 = new DefaultDataSource("sales");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000000);
    limit.setSort(Lists.newArrayList(
        //new Sort("OrderDate", Sort.Direction.ASC)
    ));

    // Case 1. 디멘젼에 열선반에만 존재
    Pivot pivot1 = new Pivot();
    pivot1.setColumns(Lists.newArrayList(new DimensionField("Category")));
    pivot1.setAggregations(Lists.newArrayList(
        new MeasureField("Discount", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, null, pivot1, limit);
    request.setContext(TestUtils.makeMap(QueryRequest.CONTEXT_QUERY_ID, queryId));


    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(request)
      .log().all()
    .when()
      .post("/api/datasources/query/search")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .post("/api/datasources/query/{queryId}/cancel", queryId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_datasource_array.sql")
  public void searchSelectWithArray() {

    DataSource dataSource1 = new DefaultDataSource("array_datasource");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList(
    );

    List<Field> projections = Lists.newArrayList(
        new TimestampField("time"),
        new DimensionField("d"),
        new DimensionField("sd"),
        new MeasureField("measureIdx1", MeasureField.AggregationType.NONE),
        new MeasureField("measureIdx2", MeasureField.AggregationType.NONE)
    );

    ExpressionField expressionField1 = new ExpressionField("measureIdx1", "\"array_measure\"[0]");
    ExpressionField expressionField2 = new ExpressionField("measureIdx2", "\"array_measure\"[1]");

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, projections, limit);
    request.setUserFields(Lists.newArrayList(expressionField1, expressionField2));
    request.setContext(TestUtils.makeMap(SearchQueryRequest.CXT_KEY_USE_STREAM, true));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(request))
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_datasource_array.sql")
  public void searchGroupByWithMeasureArray() {

    DataSource dataSource1 = new DefaultDataSource("array_datasource");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("sd", Lists.newArrayList("a", "b"))
    );

    ExpressionField expressionField = new ExpressionField("measureIdx1", "\"array_measure\"[0]");

    List<Field> projections = Lists.newArrayList(
        new TimestampField("time"),
        new DimensionField("sd"),
        new MeasureField("measureIdx1", MeasureField.AggregationType.SUM)
    );

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, projections, limit);
    request.setUserFields(Lists.newArrayList(expressionField));
    request.setContext(TestUtils.makeMap(SearchQueryRequest.CXT_KEY_USE_STREAM, true));

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(GlobalObjectMapper.writeValueAsString(request))
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
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchQuery_when_pivot_columns_order_by_desc() {
    // given
    final String requestBody = "{\n" +
        "  \"dataSource\": {\n" +
        "    \"connType\": \"ENGINE\",\n" +
        "    \"engineName\": \"" + datasourceEngineName + "\",\n" +
        "    \"id\": \"ds-gis-37\",\n" +
        "    \"joins\": [],\n" +
        "    \"name\": \"sales_geo\",\n" +
        "    \"temporary\": false,\n" +
        "    \"type\": \"default\",\n" +
        "    \"uiDescription\": \"Sales data (2011~2014)\"\n" +
        "  },\n" +
        "  \"filters\": [],\n" +
        "  \"limits\": {\n" +
        "    \"limit\": 10,\n" +
        "    \"sort\": [\n" +
        "      {\n" +
        "        \"direction\": \"DESC\",\n" +
        "        \"field\": \"ShipMode\"\n" +
        "      },\n" +
        "      {\n" +
        "        \"direction\": \"DESC\",\n" +
        "        \"field\": \"State\"\n" +
        "      },\n" +
        "      {\n" +
        "        \"direction\": \"DESC\",\n" +
        "        \"field\": \"City\"\n" +
        "      }\n" +
        "    ]\n" +
        "  },\n" +
        "  \"pivot\": {\n" +
        "    \"aggregations\": [\n" +
        "      {\n" +
        "        \"aggregationType\": \"SUM\",\n" +
        "        \"alias\": \"SUM(Sales)\",\n" +
        "        \"format\": {\n" +
        "          \"abbr\": \"NONE\",\n" +
        "          \"customSymbol\": null,\n" +
        "          \"decimal\": 2,\n" +
        "          \"sign\": \"KRW\",\n" +
        "          \"type\": \"number\",\n" +
        "          \"useThousandsSep\": true\n" +
        "        },\n" +
        "        \"name\": \"Sales\",\n" +
        "        \"subRole\": \"MEASURE\",\n" +
        "        \"subType\": \"DOUBLE\",\n" +
        "        \"type\": \"measure\"\n" +
        "      }\n" +
        "    ],\n" +
        "    \"columns\": [\n" +
        "      {\n" +
        "        \"alias\": \"ShipMode\",\n" +
        "        \"direction\": \"DESC\",\n" +
        "        \"lastDirection\": true,\n" +
        "        \"name\": \"ShipMode\",\n" +
        "        \"subRole\": \"DIMENSION\",\n" +
        "        \"subType\": \"STRING\",\n" +
        "        \"type\": \"dimension\"\n" +
        "      }\n" +
        "    ],\n" +
        "    \"rows\": [\n" +
        "      {\n" +
        "        \"alias\": \"City\",\n" +
        "        \"direction\": \"DESC\",\n" +
        "        \"name\": \"City\",\n" +
        "        \"subRole\": \"DIMENSION\",\n" +
        "        \"subType\": \"STRING\",\n" +
        "        \"type\": \"dimension\"\n" +
        "      },\n" +
        "      {\n" +
        "        \"alias\": \"State\",\n" +
        "        \"direction\": \"DESC\",\n" +
        "        \"name\": \"State\",\n" +
        "        \"subRole\": \"DIMENSION\",\n" +
        "        \"subType\": \"STRING\",\n" +
        "        \"type\": \"dimension\"\n" +
        "      }\n" +
        "    ]\n" +
        "  },\n" +
        "  \"resultFormat\": {\n" +
        "    \"columnDelimeter\": \"―\",\n" +
        "    \"mode\": \"grid\",\n" +
        "    \"options\": {\n" +
        "      \"addMinMax\": true\n" +
        "    },\n" +
        "    \"type\": \"chart\"\n" +
        "  },\n" +
        "  \"userFields\": []\n" +
        "}";

    // when
    Response response =
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .body(requestBody)
            .log().all()
            .when()
            .post("/api/datasources/query/search")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all()
            .extract().response();

    // then
    Map<String, Object> resMap = response.jsonPath().get();

    List<Map<String, Object>> columns = (List<Map<String, Object>>) resMap.get("columns");
    assertThat(columns).hasSize(4);
    assertThat(columns).extracting("name").containsExactly("Standard Class―SUM(Sales)", "Second Class―SUM(Sales)", "Same Day―SUM(Sales)", "First Class―SUM(Sales)");
  }

}
