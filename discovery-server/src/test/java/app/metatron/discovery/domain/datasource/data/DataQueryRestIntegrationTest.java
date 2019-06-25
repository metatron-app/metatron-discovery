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
import app.metatron.discovery.query.druid.ShapeFormat;
import app.metatron.discovery.query.druid.SpatialOperations;
import app.metatron.discovery.query.druid.aggregations.RelayAggregation;

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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(1000);
    limit.setSort(Lists.newArrayList(
        new Sort("OrderDate", "DESC")
    ));

    List<Filter> filters = Lists.newArrayList(
        //        new IntervalFilter("OrderDate", "2011-01-04T00:00:00.000", "2012-05-19T00:00:00.000"),
        new LikeFilter("Category", "T_chnology")
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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

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
        new ExpressionField("switch_dim", "SWITCH( \"Category\", 'Furniture', 'F', 'Technology', 'T')", "dimension", false),
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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

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

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot4, limit);
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

    // Only dimension case
    //    List<Field> fields = Lists.newArrayList(geoDimensionField,
    //                                            new DimensionField("gu"));

    List<Field> fields = Lists.newArrayList(geoDimensionField,
                                            new DimensionField("gu"),
                                            new MeasureField("py", null, MeasureField.AggregationType.NONE),
                                            new MeasureField("amt", null, MeasureField.AggregationType.NONE));

    //    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields, new LayerView.ClusteringLayerView("geohex", 5));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields, new LayerView.AbbreviatedView("h3", 12, RelayAggregation.Relaytype.FIRST.name()));
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
        //new ExpressionFilter("amt < 50000 && amt > 40000"),
        //new InclusionFilter("gu_new", "user_defined", Arrays.asList("강남구_new")),
        //        new SpatialBboxFilter(null, "gis", null, "126.8060772 37.4458596", "127.1810908 37.6874771", null),
        new SpatialShapeFilter(null, "gis", null, SpatialOperations.INTERSECTS.name(), ShapeFormat.WKT.name(), "MULTIPOLYGON (((126.951858766354 37.6548652051559, 126.95186016876798 37.65486493538041, 126.951864842551 37.6548654779832, 126.95231446156599 37.654916395867794, 126.95262519283801 37.6549247216172, 126.953210482981 37.6549330656519, 126.953275724319 37.6549484112216, 126.953358818072 37.6549682696123, 126.95337320940202 37.65497629562049, 126.95348450820201 37.6550391503726, 126.953736075754 37.655181542374194, 126.95389055076599 37.65526640195569, 126.95394559374401 37.655296522181594, 126.953950362443 37.655294811840406, 126.954177854961 37.655216860022094, 126.954180753545 37.6552158698726, 126.954187579194 37.655213619625, 126.954188607729 37.655213259560696, 126.954194030965 37.655211279116, 126.954147967474 37.6551727817135, 126.95411881568802 37.6551485291906, 126.95404033046802 37.6550828041165, 126.95403201465601 37.6550760421807, 126.954037120669 37.6549820532408, 126.95403852385502 37.654980521816505, 126.95406050835301 37.654954486871894, 126.954219264042 37.6547664766093, 126.95424481573401 37.6547160215917, 126.95426241199098 37.6546808831953, 126.954345940882 37.654600712356, 126.95435174009502 37.654595307643206, 126.954551924304 37.65453203342331, 126.954554074285 37.6545322144835, 126.95458351953698 37.654534929302, 126.95460044311099 37.65452952885921, 126.95461811377201 37.6545253903247, 126.954762844569 37.65449192278011, 126.954777990811 37.6544884140652, 126.95479491343198 37.6544845455653, 126.954800990646 37.6544831060387, 126.954897851623 37.6544608844712, 126.95504437120502 37.65440605978371, 126.95518257766201 37.6543396067975, 126.95523587780698 37.654313943987894, 126.955256078721 37.654299262751, 126.955284135403 37.6542790874154, 126.95529058846401 37.654274403831614, 126.95531725694002 37.6542307978132, 126.95532118717301 37.654224130721, 126.955335241186 37.6541711478603, 126.95535324482802 37.6540790561664, 126.955368321156 37.654035986442906, 126.955399005326 37.653998870272595, 126.955399006135 37.6539975185335, 126.95540257886002 37.6539633659352, 126.955406512682 37.65395066107191, 126.95542055995598 37.653908762459295, 126.955423838217 37.6538980398987, 126.955444324164 37.65387542853149, 126.95545872945002 37.6538601142579, 126.955462657659 37.6538567814505, 126.955467333719 37.6538534489252, 126.955524582423 37.6537895783051, 126.955534685226 37.6537781373863, 126.95554366227601 37.6537733646236, 126.95559153992602 37.6537477897231, 126.955713945986 37.653681960969095, 126.95579461541301 37.6536901016626, 126.955802560938 37.6536907354514, 126.95585109446901 37.653662367096, 126.95587017400501 37.653646513825, 126.95593031196901 37.6535964318294, 126.95593208890799 37.6535950807537, 126.955937513471 37.65359057698161, 126.95595051329701 37.6535804888483, 126.95596201667901 37.6535716617784, 126.95596379361601 37.65357031070231, 126.955966318828 37.653568238977606, 126.95602935271299 37.6535213120706, 126.956021415442 37.6535067103251, 126.95602029489402 37.6535046372401, 126.956009556335 37.653484717607206, 126.956087275797 37.6534222060813, 126.95613338379201 37.6533849152244, 126.95616321825202 37.6533609554667, 126.95616789393202 37.6533581636091, 126.95617584265499 37.6533533002998, 126.95624925131402 37.6533085399105, 126.95626187316302 37.6533052103, 126.956277019305 37.653301340928, 126.95629824264 37.65329585171791, 126.95630151472798 37.6532954023502, 126.956318062179 37.6532930654635, 126.95634825891301 37.65328884119041, 126.95636593930799 37.6532674001303, 126.95636986544199 37.65326749169839, 126.95638070914302 37.6532675858244, 126.956392207208 37.653267680191306, 126.956395105951 37.6532662394072, 126.95644868677401 37.6532381430172, 126.95646851071001 37.653227786997405, 126.95649591487401 37.6532031954462, 126.956508447838 37.65319193557091, 126.956517146047 37.6531841888037, 126.95653257837098 37.65317040674721, 126.95652790434602 37.65317040502491, 126.95641273656499 37.6531700020644, 126.95641236264301 37.6531700019262, 126.956413765325 37.6531691914008, 126.956504562654 37.653121643679306, 126.95663482054101 37.65305356395769, 126.95664239475602 37.65304960163889, 126.95666614505201 37.6530387964486, 126.95679144182301 37.6529817088797, 126.956868115873 37.6529467719397, 126.95710823619198 37.65283718834449, 126.957146061705 37.65273356871539, 126.95716694086401 37.6526759020708, 126.95746036554699 37.6518719032928, 126.957685000162 37.650710208582005, 126.957764565145 37.650022291425394, 126.95778936388902 37.64980863520991, 126.95764857819401 37.64933304246949, 126.957562185009 37.64904247732821, 126.957842653954 37.6484705212587, 126.95785453938801 37.6484454732447, 126.957840813391 37.6480886087881, 126.957839060509 37.648047695474204, 126.958105759275 37.647850796792, 126.95833224637099 37.64768362160339, 126.95837722579799 37.64765029454, 126.95854466765101 37.6474270459006, 126.95902706324802 37.64678333512921, 126.95901411394702 37.64670438895191, 126.958919739074 37.646136624841, 126.958939573678 37.6461028382153, 126.95909656653102 37.645834076472205, 126.959101244445 37.6458261478784, 126.95914587201699 37.6457499251316, 126.959137945377 37.64571630908569, 126.95891365782398 37.64478920691851, 126.95890647651902 37.6447603672646, 126.959107274378 37.644375010452, 126.959122058311 37.64434626853671, 126.959121033012 37.644341041447205, 126.959027051615 37.6439116956862, 126.95901987242999 37.64387907115871, 126.95936111905202 37.6432080043275, 126.95936542314601 37.6431996250102, 126.959358641074 37.64312419547571, 126.95931645615102 37.64266666133789, 126.95926786426 37.64213270644899, 126.959912647686 37.6415176142402, 126.95997128084001 37.6414616720171, 126.960131507351 37.6405384862062, 126.960253516178 37.6402928706947, 126.96044944031098 37.639897326530814, 126.96051022703699 37.63983084115301, 126.96056246405799 37.63967153322, 126.960847237353 37.6388007452288, 126.960861934746 37.63875542165929, 126.961133028633 37.6384747993223, 126.96130546519399 37.6382966061564, 126.961602832208 37.63798922681771, 126.961602796253 37.63787748270819, 126.96160283092799 37.6376284916295, 126.961602840342 37.63761019804139, 126.961603898427 37.637188634727096, 126.96160430895 37.63711735293091, 126.962540686572 37.63581880870909, 126.96272779834901 37.6352429350453, 126.962922207609 37.6346455255354, 126.96329086725001 37.6333756322414, 126.963325785401 37.6332552477514, 126.963328687483 37.63324515563001, 126.96226017161099 37.63239700467171, 126.961619055157 37.63188791113781, 126.96108155212 37.6312666534952, 126.96060420254 37.630718858239995, 126.95991376319901 37.62987306422, 126.959825136245 37.6297646241301, 126.95982224114998 37.6297611086073, 126.959803193415 37.629730823032, 126.95881390401901 37.6295892695662, 126.958418299129 37.629469726669896, 126.958017195046 37.6293268403569, 126.95768168154301 37.6292072262355, 126.95746678901098 37.6291306401951, 126.95740345463899 37.6290868208057, 126.95709995516901 37.6288767397689, 126.95688940286202 37.6287309448965, 126.956794309054 37.6286649449477, 126.956775626607 37.62865196135099, 126.95672695880401 37.6286182399982, 126.95666831133501 37.62855108179481, 126.95652897753901 37.628391164136794, 126.95639618110302 37.6282392690818, 126.956379278212 37.6282197075852, 126.956221905439 37.6282268586102, 126.956072195689 37.62823365181299, 126.955982855475 37.628238214453, 126.95594360555502 37.62824027248061, 126.955688387655 37.6282535141324, 126.95562792703302 37.6282516890844, 126.95558503455801 37.6282504113178, 126.955565971224 37.6282498634423, 126.955403956537 37.6282056453061, 126.955205315967 37.6281514101329, 126.954571709921 37.62772455705031, 126.954415808436 37.627619241013, 126.95404357241 37.6273653289371, 126.954034885337 37.6273594679894, 126.953907140458 37.627361400717206, 126.953813504437 37.6273628960809, 126.95379229147798 37.6273632482412, 126.953492787034 37.6273679968568, 126.95348699453801 37.6273659218971, 126.9534798006 37.62736339580281, 126.953246520954 37.62726678897041, 126.952884037035 37.62711687137939, 126.95287030372599 37.627111278679905, 126.952819574467 37.6270908019905, 126.95275800791399 37.62706617558761, 126.952447344254 37.62698710885591, 126.95240305716702 37.6269759165694, 126.95215247153001 37.626911742480914, 126.95201895679101 37.6268776242754, 126.95197999559001 37.626867605508494, 126.951797490782 37.62672550768679, 126.951579401174 37.6265558193705, 126.951150973231 37.62651391890031, 126.951135462072 37.626512290383005, 126.951099861144 37.626508580862996, 126.95103828358 37.626502337297595, 126.950936713457 37.626491841608, 126.950568098251 37.626441042354706, 126.95041261665898 37.6264195294181, 126.950164884379 37.6260059710808, 126.950108412386 37.6259115052425, 126.950066594234 37.6258429990979, 126.949991359674 37.6257188769669, 126.949945707247 37.62565514532109, 126.94980632326599 37.62546034458529, 126.94976496159201 37.62540860017259, 126.94976104020701 37.6254036421013, 126.949755998263 37.6253975120396, 126.949713142681 37.6253440547605, 126.949676355717 37.625298620413005, 126.949671687083 37.625293211438, 126.949670660214 37.6252916790213, 126.94965878484699 37.625303208854405, 126.948868232363 37.62585257892991, 126.947505929315 37.626046271666105, 126.946890396261 37.6257844784679, 126.94598027246802 37.625984123696696, 126.945130317741 37.626064475800504, 126.94469792137302 37.62609022745761, 126.94453383046601 37.6260884382267, 126.944148967959 37.6257797882996, 126.943585604362 37.6258721599457, 126.943223364292 37.625927497895894, 126.942592340277 37.626023617109105, 126.94222654456301 37.6260830956208, 126.94149144088901 37.626150410812095, 126.94068076214101 37.6260690815411, 126.93974834902401 37.626073024816606, 126.938283806697 37.626017477139406, 126.93779207629801 37.626147437093394, 126.93769162244801 37.62614585211271, 126.937572105792 37.626143896497105, 126.937314757111 37.6261397949412, 126.93726289491802 37.6261389563308, 126.93677004798 37.62614986769239, 126.936760329301 37.62615013283321, 126.936194779419 37.6261625347832, 126.93570407498201 37.6263979227455, 126.935344435652 37.626461798972606, 126.934978720549 37.62652693238401, 126.93462655693801 37.626589458794896, 126.934472531937 37.626616768736596, 126.934095238833 37.62666945691811, 126.93405813564601 37.6266746629383, 126.9340167334 37.626680407241096, 126.93358153129202 37.6265954536853, 126.93327012604401 37.626534629670104, 126.93286585222 37.626454557244, 126.932599754772 37.6264105188734, 126.93204253954701 37.6264003765875, 126.931802419194 37.6266651801821, 126.931757731744 37.6268910760789, 126.931732926521 37.6269365704948, 126.931377225115 37.627589527541296, 126.931244397169 37.6278333050682, 126.93101042344001 37.628011688987804, 126.930735014025 37.6281287690062, 126.93004160536002 37.6282455111725, 126.930004559401 37.6282882043492, 126.929996233539 37.62829766162591, 126.929918520013 37.62825895558291, 126.929859805254 37.6282893800193, 126.929617559068 37.6284154887658, 126.92933564247801 37.62849245985551, 126.92925681436701 37.6285453109118, 126.928597342999 37.6288352685193, 126.928325142076 37.628815458124606, 126.92814446011002 37.6288602261658, 126.927344147702 37.629058442589894, 126.92722754718498 37.6292240045467, 126.92722352319198 37.6292297695098, 126.927203778071 37.6292575131585, 126.92717712234298 37.6292803862572, 126.926936658737 37.6294868743365, 126.92675950230101 37.6294599999568, 126.92664971095999 37.629541487028504, 126.926009971663 37.6295155846804, 126.925996702182 37.62951503566081, 126.925673421766 37.629548986547306, 126.925448734467 37.6295802953935, 126.925366005634 37.6296050250822, 126.925021758142 37.6297652138816, 126.92440687462802 37.629463382460806, 126.92400520038701 37.629393824988604, 126.92363865795498 37.6293305069164, 126.92320556310601 37.6290104931099, 126.92311342914398 37.62891202607779, 126.92299749200302 37.6287880405187, 126.922819300302 37.6285904792095, 126.922804178699 37.62857379779529, 126.922764604077 37.62852736198461, 126.92273649972802 37.62850418368661, 126.92254172856 37.62834545123379, 126.92225767534 37.628403479576896, 126.92204967413599 37.62847633658131, 126.92074425083399 37.62841292622039, 126.92055923304102 37.628401447141606, 126.92053297557702 37.6283997172502, 126.920457006292 37.6283948898958, 126.920229098205 37.628380677888, 126.920161445183 37.62837657689601, 126.920042992776 37.6283378367791, 126.91972838917302 37.6283001347765, 126.91970643149799 37.628297416346406, 126.919716086146 37.628270117665494, 126.91970643257 37.628209552917106, 126.919688018234 37.628214046201904, 126.91965380739302 37.628221863033005, 126.91964734601102 37.6282342946878, 126.91955408972399 37.6282286439315, 126.91951204487201 37.62822185653331, 126.919468411586 37.628214887803296, 126.91944327482598 37.6282138793649, 126.919442142834 37.628223701273, 126.91933525692201 37.62820515440119, 126.91927551492999 37.62823097693371, 126.9192228805 37.62825175778679, 126.919129349539 37.6282408797591, 126.91910990214102 37.62825005829521, 126.918732266636 37.6284280489192, 126.91855190972102 37.6285130844975, 126.91846948199701 37.6285178037367, 126.918380886296 37.62852278900089, 126.91830565012401 37.62853120786961, 126.91823723674202 37.628538730255, 126.91818142995301 37.62855455204561, 126.917786149087 37.6286291639621, 126.917588877373 37.6286284856472, 126.91714353155 37.6286804412328, 126.917083435545 37.628687428091204, 126.91705427541099 37.628690832016694, 126.917065834445 37.628716703528504, 126.91699343979599 37.62885867595641, 126.916957474389 37.62893110417679, 126.916885398312 37.62903838197231, 126.916836443524 37.6291104405378, 126.916820999217 37.629132868616004, 126.91681959515202 37.62913494030159, 126.916754072977 37.62923077786011, 126.91653983205399 37.6295282807185, 126.91649484903698 37.629557897160204, 126.91626731335299 37.6297090412041, 126.91624430841702 37.629723263254206, 126.916133038898 37.6296127016163, 126.916120437101 37.629600166490604, 126.916080484594 37.629560577019305, 126.91608189000502 37.6295573338314, 126.91596595817902 37.6294381175506, 126.915946914025 37.629420531303786, 126.91594047313399 37.629414128456794, 126.915890721627 37.6294458139468, 126.915878552212 37.6294642791166, 126.91587564955101 37.6294693235609, 126.91581516530502 37.6295712920931, 126.915750015938 37.629749315430495, 126.915728361985 37.6298084162682, 126.915702114535 37.6298802202196, 126.91569386384899 37.62990409514719, 126.91559338790401 37.63008326465339, 126.915339995767 37.630534746033504, 126.915168273117 37.6309085152169, 126.914450745928 37.6309067355291, 126.91376894622599 37.63063760254221, 126.912627386763 37.6306716377478, 126.912019293945 37.6305118602734, 126.911146327604 37.6297521564807, 126.909977047816 37.62922535135921, 126.90881496630898 37.6290923485025, 126.908801324224 37.6290909862143, 126.908769915919 37.6293276974997, 126.908382212154 37.6299941676754, 126.908368937964 37.6299974916709, 126.90823068048 37.63003225923091, 126.908118316803 37.6300606485378, 126.90729428700898 37.6308672657694, 126.907009185938 37.6315990560054, 126.906929307413 37.63180445813811, 126.90692206079301 37.6318450948622, 126.906757590064 37.632736305017595, 126.90671296379098 37.632774929619, 126.906233388676 37.6331927790256, 126.90620204680201 37.6332200593389, 126.90621325862098 37.63322232115781, 126.90709628805202 37.6333979354027, 126.907104974827 37.633401637008596, 126.908112554613 37.63382984736751, 126.909122391193 37.63433293743031, 126.909806787703 37.634941927406, 126.91076039567598 37.6352830215166, 126.910854374495 37.63531652568011, 126.91085614707602 37.635319140389896, 126.911191281417 37.6358743288113, 126.91121040325201 37.6359056135301, 126.91120899783199 37.63590858630751, 126.91079676628202 37.63683367870949, 126.91031583205101 37.6379129962276, 126.91031508067799 37.63791605960671, 126.91025859791502 37.63809814146501, 126.91021966075802 37.6382232832175, 126.910218253628 37.6382276077234, 126.91017036580502 37.63833462929361, 126.91009183411902 37.63850939485881, 126.910092953384 37.638511288151406, 126.91055447662 37.639518777241705, 126.910556620767 37.6395233747914, 126.910556993539 37.6395242762356, 126.910794257865 37.6400261325138, 126.910795282089 37.6400293774697, 126.910841401793 37.640150708672, 126.91089218022202 37.6402842991689, 126.910893204239 37.64028772435591, 126.911052333472 37.640713733338394, 126.91115137050902 37.64097919999661, 126.911153140444 37.640984157717206, 126.91120286999602 37.6411361309639, 126.911214696982 37.6411723665515, 126.911215068913 37.64117398892179, 126.911334271279 37.64153868844009, 126.91206683289501 37.6437796134063, 126.912067577245 37.643782497676185, 126.91208517421401 37.6438407257883, 126.912107145557 37.64391481758891, 126.912175204118 37.6441417805938, 126.91217809593199 37.6441466490154, 126.91218667726798 37.6441617949063, 126.91220831830701 37.644199028957495, 126.91220971875401 37.644200381741, 126.91221223881601 37.64420344756331, 126.91225797713501 37.6442558390367, 126.912260497307 37.644258814742, 126.91226236054501 37.644264042860804, 126.91227633261 37.6443051461872, 126.91227996583198 37.6443154221228, 126.91212699087602 37.6443655029421, 126.91202974497901 37.644397421681006, 126.911906309347 37.6444447306372, 126.91177520553902 37.6444950075605, 126.911739574445 37.6445112018049, 126.91148398415001 37.64462726006471, 126.91143937469998 37.64464777305331, 126.911246441 37.6447363924079, 126.91118518487501 37.64476437241029, 126.910965272485 37.6448238634962, 126.910884580774 37.64484651182399, 126.91083025650201 37.6448617003941, 126.91077696080902 37.6448765292527, 126.91066354356398 37.6449082543987, 126.910589769214 37.6449302769498, 126.910495424148 37.6449583216273, 126.910241643952 37.64504310827989, 126.910140842326 37.645076825073495, 126.910140886293 37.6451179180371, 126.910140876523 37.6451260284764, 126.910140870878 37.6451307145079, 126.91011636416398 37.6451452045273, 126.91007352464202 37.6451701340334, 126.90991508272502 37.6452553530767, 126.90983840793801 37.64527926537911, 126.909725359202 37.64531459454489, 126.90965233826999 37.6453313903523, 126.909441353944 37.645425670230196, 126.90938662967702 37.6454617647547, 126.909340231269 37.6454920982235, 126.90932685749598 37.6454982158381, 126.909284024303 37.6455175578645, 126.909216314461 37.64554787489509, 126.90877714747802 37.6458102244631, 126.908745442441 37.6458251592098, 126.90868540325201 37.6458501650193, 126.90848480493901 37.64593354717191, 126.908480128607 37.6459357964458, 126.908420740995 37.645962875294906, 126.908250808159 37.6460402430721, 126.9081669152 37.64608000909671, 126.90812810198202 37.6460982724375, 126.907951341656 37.646178428061994, 126.90770509274398 37.646289799349205, 126.907560396825 37.6465172290953, 126.907473202614 37.646655578995, 126.90732419378402 37.64689246723869, 126.90729141365101 37.6469445285575, 126.90723741606999 37.64699585225699, 126.906973886018 37.6472449958379, 126.906879930117 37.6473322441552, 126.906796081152 37.6474098579657, 126.90662360968899 37.64756976766011, 126.90662295447201 37.6475704880698, 126.906621831889 37.647571208109504, 126.90660058848901 37.647591106936694, 126.90657251372701 37.647617218356594, 126.90648183241701 37.6477013148829, 126.906479961137 37.6477027552561, 126.90647930591902 37.6477034756649, 126.90644440105602 37.6477347182529, 126.906388534657 37.6477845982179, 126.906385352933 37.64778747940619, 126.90638497881201 37.6477876593414, 126.906350446295 37.64782007370491, 126.906350072061 37.647820343756, 126.90634857478399 37.6478216943078, 126.906345673365 37.6478246658336, 126.90633706280599 37.6478334002526, 126.90633097943102 37.64783943319671, 126.906323398552 37.64784699692391, 126.90623590113599 37.6479260492882, 126.90622336102501 37.6479376642885, 126.906222238319 37.64793847444031, 126.906204925824 37.6479542309822, 126.90609843013499 37.6480513814581, 126.906096558727 37.64805291194101, 126.90609262828002 37.6480565134535, 126.906013832323 37.6481285435261, 126.90594897989 37.6481878783025, 126.905900784869 37.64823208683839, 126.905880571352 37.6482503642665, 126.905761067762 37.6483586784408, 126.905648395786 37.6484604194864, 126.90562677843101 37.648479957371705, 126.90562500070402 37.64848130768989, 126.90541651807898 37.648655695453, 126.90541436598801 37.6486574059319, 126.90540613118002 37.6486645184946, 126.905353543014 37.6487080924682, 126.90534493441 37.64871511461071, 126.905341004235 37.64871844574991, 126.90523255972998 37.648802707276495, 126.90522862966002 37.648805948296, 126.905220676503 37.648812069795596, 126.905179320477 37.6488435771679, 126.905068444451 37.6489284673994, 126.90501548613202 37.648968796745805, 126.905009404165 37.648973567997395, 126.90500435145601 37.6489775290334, 126.904875508588 37.64907745398631, 126.90482254902402 37.649118594288, 126.90481029167901 37.64912804657939, 126.904809917548 37.6491282265095, 126.904805660088 37.6491682345823, 126.904802066153 37.649201033909485, 126.904809269858 37.6491962635739, 126.904811795535 37.6491948237557, 126.904986737399 37.6490828604658, 126.90516457864501 37.6489691870408, 126.90517000157799 37.6489681100079, 126.90554035615001 37.6488898259671, 126.905901481151 37.64871745228, 126.90592701501099 37.6487053970976, 126.905964800538 37.6486882150631, 126.90598893112 37.6486770599089, 126.90602924180001 37.648658798473605, 126.906033637498 37.648656909538595, 126.906094056003 37.6486301030738, 126.90617216249298 37.6485863688357, 126.906419484322 37.648447245913715, 126.906437911685 37.64843698730311, 126.90648683420402 37.6484088197779, 126.906522099483 37.6483885716214, 126.906526776366 37.6483860520785, 126.906579719346 37.6483569865397, 126.90664276461901 37.6483222516623, 126.906647067372 37.64831991205061, 126.90692282089601 37.64816693269301, 126.90705171732502 37.6480955723092, 126.907102789403 37.64806731610421, 126.90710924360002 37.6480637165452, 126.90721982752602 37.647985312505604, 126.907225534479 37.6479812617724, 126.90723451582 37.64797496071301, 126.907296076645 37.647930762133505, 126.90730075425802 37.64792761174811, 126.907302251183 37.647926531532, 126.90750059130902 37.647785114927096, 126.90754521779299 37.64775324883351, 126.907552047399 37.6477483879199, 126.907558596026 37.6477439773658, 126.90760930281898 37.6477084212547, 126.90762081022501 37.6477002297071, 126.90763736888302 37.647689068284095, 126.907659353687 37.6476741262326, 126.907776368073 37.64761032549621, 126.908047436665 37.64746247644041, 126.908051084677 37.64746040661489, 126.908053890875 37.64745878671331, 126.90812338935102 37.6474200008463, 126.90812703747001 37.64741784090239, 126.908132369106 37.6474148712251, 126.908263416064 37.64734098793251, 126.90826846693699 37.6473382883788, 126.90841354420499 37.647256575731305, 126.90841466488502 37.6472573876457, 126.90841896088098 37.6472604549261, 126.908513281965 37.64733117908379, 126.90853634860402 37.6473484992489, 126.908538122715 37.647350032597096, 126.908544286637 37.64735436294551, 126.90857267684201 37.64737529187191, 126.908577346413 37.6473786297841, 126.90858276200201 37.647383410130814, 126.9085910725 37.6473904456213, 126.90859639572201 37.6473943247354, 126.908597516517 37.64739504653209, 126.908613020036 37.6474056922353, 126.908623483072 37.647410566606, 126.908635347325 37.64741616298921, 126.90863600196802 37.64741589314809, 126.90863890151401 37.6474143634209, 126.908947454439 37.64726320702011, 126.909114121416 37.647182861911304, 126.909161259533 37.6471600988578, 126.90923757804102 37.6471234803682, 126.90932110067301 37.6470812801717, 126.90935065647402 37.6470661633902, 126.909361038303 37.6470609446364, 126.909491419383 37.64699507979079, 126.90958214261602 37.646950001218904, 126.909694844994 37.6468940353616, 126.909726831914 37.6468781093017, 126.909727206131 37.6468778392399, 126.909784754959 37.64682561595401, 126.909857556807 37.64675925607539, 126.909966569617 37.64666201398611, 126.909969096306 37.6466595827809, 126.90996947063 37.6466592226024, 126.910139027587 37.64650561389059, 126.91016999462602 37.6464825677643, 126.91030462042401 37.6463832721882, 126.910316875863 37.6463744501318, 126.91043858885502 37.646286228858905, 126.910437470332 37.6462836146441, 126.910436725371 37.6462812710611, 126.910436074098 37.646278747317, 126.910486478427 37.646259590852004, 126.91049620392302 37.6462559034725, 126.91055841256701 37.6462143170331, 126.910602753366 37.6461849728063, 126.91060555989202 37.6461829923797, 126.910726234659 37.6461026101173, 126.91072904128701 37.646100539571705, 126.91086337339101 37.646011155895295, 126.910905083187 37.645993164189605, 126.910909478497 37.6459913651876, 126.91095193604198 37.64597337403001, 126.910971013889 37.64596527798291, 126.911005522467 37.6459505249853, 126.911009917987 37.64594854574759, 126.91103329797699 37.64593838026601, 126.91104152764801 37.64593487194541, 126.91105779950901 37.64592830574139, 126.911060979147 37.645926956397595, 126.911210794156 37.645864979277206, 126.91131375681202 37.6458223417084, 126.91163378660998 37.64559909400741, 126.911646696061 37.6455902723014, 126.911673731674 37.6455712780552, 126.911709373529 37.645546432699206, 126.911786362935 37.645493321810505, 126.911812278853 37.6454726144896, 126.91185447357701 37.64543930307679, 126.911860181042 37.645434441073206, 126.91188357118801 37.6454154440547, 126.91194045553002 37.645369617447706, 126.91194513342398 37.6453659261803, 126.911945507732 37.64536556599539, 126.91201892513199 37.6453292138765, 126.912019299227 37.6453290339233, 126.91202397562598 37.64532660427669, 126.91214172336 37.6452687473889, 126.912160428289 37.64525956947771, 126.91232783732 37.64517732791221, 126.912342609881 37.64517373424629, 126.912504266303 37.645134563639, 126.912563262896 37.645120278922406, 126.91258093312 37.6451165972581, 126.91267994225899 37.645096124115895, 126.91268059676202 37.6450959443682, 126.912685364592 37.64509522696841, 126.912881128469 37.6450636508327, 126.91289234700699 37.6450618567948, 126.91290057396898 37.6450605111278, 126.912927964333 37.64505746739981, 126.912931516729 37.6450570194411, 126.91304566167402 37.6450418740099, 126.91328582392201 37.6450100595694, 126.91329012418 37.64500952203359, 126.913297696314 37.64500862643789, 126.913363228137 37.645000744365106, 126.91339594730802 37.644996803280705, 126.91339847131701 37.6449965347853, 126.913457502132 37.64495251134011, 126.91370915446001 37.6447645332968, 126.91372066147301 37.64475571033671, 126.91373000679401 37.6447571590281, 126.914059422746 37.644814172584596, 126.91460667514201 37.6449086511534, 126.91460695555199 37.6449086513564, 126.915189505857 37.6451163385595, 126.91519483335898 37.64511661273739, 126.915656740974 37.6451371298694, 126.915806192772 37.6451437249782, 126.91581553899599 37.64514445257639, 126.91729617598898 37.645254450165204, 126.91734159896701 37.6452578162939, 126.917350197157 37.64525881359461, 126.917517206966 37.6452788461306, 126.917647207391 37.6452944369139, 126.91811627486102 37.64535063538029, 126.918190761179 37.6453596085471, 126.919153478952 37.64547417892629, 126.91952533957401 37.645529764439104, 126.91987093948401 37.645581546071, 126.920630851093 37.6456765915166, 126.92114674341101 37.645741190219596, 126.92147076525602 37.6457818684629, 126.92148151396802 37.645782326197505, 126.92166190399999 37.6457913676092, 126.921663679858 37.6457914589045, 126.921846219489 37.6458007718099, 126.922141846653 37.6458223247892, 126.9222800802 37.6458324188197, 126.922862172874 37.64587758854259, 126.92307890339299 37.6459062968466, 126.92312320277601 37.64591218326651, 126.923355731367 37.6459397298464, 126.92339535851798 37.6459443515037, 126.92354871109501 37.6459776136938, 126.923680102989 37.64600599521209, 126.92397531141802 37.6460728717083, 126.92398932893802 37.6460760348029, 126.92408184450902 37.64609700130169, 126.92412286909598 37.6461063096493, 126.924131182844 37.6461114516119, 126.92424346323202 37.6461828956903, 126.924397218912 37.64628040979011, 126.924405158811 37.6462855514937, 126.924792162818 37.646533527897994, 126.92479935481201 37.64653884933029, 126.92484502945999 37.64657186091429, 126.925174115558 37.6467878079439, 126.92523670091698 37.6468289405446, 126.92528135116801 37.64685852689879, 126.925480409272 37.6469906728256, 126.92548834905101 37.64699608480381, 126.92556578550798 37.6470486713465, 126.925707206997 37.647145455015, 126.92580949045401 37.6472152692069, 126.92581528183601 37.6472192379551, 126.92589944299701 37.6472776860487, 126.92614137246201 37.647445273379, 126.92640496396899 37.647638106217, 126.926489496584 37.6476999785273, 126.926573375733 37.6477611294414, 126.926580941602 37.64776672134491, 126.92658243797898 37.6477659112317, 126.92658776890698 37.64776294071971, 126.92659964653902 37.6477563696391, 126.92660469127901 37.6477592564911, 126.926898862814 37.6479401218038, 126.92702767604702 37.6480294164317, 126.927096800138 37.648077220669094, 126.927133884168 37.648103016766996, 126.92714649181801 37.6481146495224, 126.927173481203 37.6481398986772, 126.927178243986 37.6481444074192, 126.92721998894902 37.64818336330819, 126.927376230913 37.648327645252195, 126.92742152495501 37.6483698474308, 126.92755330246801 37.64848825078111, 126.92755797243402 37.6484921286383, 126.927574596387 37.648507098106606, 126.92758748451098 37.64851882110239, 126.927591874056 37.64852269878601, 126.927858599143 37.6487694196528, 126.92793639551101 37.64884011816671, 126.927941438897 37.6488445369327, 126.92797197843099 37.64887231131911, 126.92797272553598 37.6488730327035, 126.927983840978 37.64888142028, 126.92798823117501 37.6488846671368, 126.92799215417 37.64888773347641, 126.92816674204302 37.6490094064316, 126.92820205261201 37.6490333987896, 126.92845408337301 37.6492061240923, 126.928459781662 37.649210002537, 126.928645955739 37.649338260272, 126.928863703798 37.6494890657585, 126.92886949543302 37.649493124471505, 126.92886986925102 37.6494932148129, 126.92895478300798 37.6495518413922, 126.92897785603 37.6495681662842, 126.92911424073 37.649663140478204, 126.92911825780301 37.6496656661404, 126.92912432527 37.64967459127131, 126.92913151368 37.6496843281195, 126.929184445661 37.6497569934133, 126.92918845949002 37.6497629434796, 126.92919023442602 37.64976411605319, 126.929258981793 37.6498180466736, 126.92926552060102 37.6498228267431, 126.92928093282102 37.64983482141291, 126.929281680375 37.6498350922091, 126.929285978234 37.6498372575697, 126.929488350411 37.64994047142001, 126.92969931882801 37.65004810572909, 126.929709690988 37.650052077014, 126.929876019784 37.6501154374389, 126.929954886054 37.65014531269111, 126.93000310293502 37.650163544743805, 126.93000422457098 37.6501636355253, 126.93004235511901 37.650172129048, 126.93019142010698 37.65020465911359, 126.930284597392 37.6502250804318, 126.930300860414 37.6502271627096, 126.930447694285 37.650246714427894, 126.930448815922 37.6502468052052, 126.93045676044198 37.6502478912808, 126.930862774324 37.650301388486106, 126.931431273425 37.650331368454395, 126.93145324364698 37.650327956814, 126.931538133007 37.65031457882339, 126.931544677299 37.650313591345, 126.931544677382 37.650313501229, 126.93154140784101 37.650311156315496, 126.93153673714102 37.6503077291968, 126.931545712989 37.6503054815053, 126.931593210239 37.6502935236278, 126.93185313571101 37.65022824984089, 126.931855285595 37.6502283411988, 126.931868278374 37.6502288893994, 126.93187510184998 37.65022925380389, 126.931900713256 37.65023062033121, 126.93215770622102 37.6503057449207, 126.932185810396 37.65034135690231, 126.93219626776799 37.6503546099661, 126.932199162031 37.6503584866179, 126.932204857817 37.6503654288238, 126.932206351564 37.650367502350306, 126.93221494137 37.6503785915551, 126.932221477387 37.650386705751, 126.93222400085601 37.6503871577808, 126.93249616171099 37.650436066587105, 126.932797482909 37.6504903983404, 126.932807202581 37.650492566661, 126.932823370876 37.65049618050911, 126.933349354706 37.6506144407004, 126.933889648964 37.65072513682111, 126.93424179319102 37.65081454847821, 126.93453692940201 37.6508896891343, 126.93454524709101 37.6508917664176, 126.934590573621 37.650903326406, 126.93462122844001 37.650910011982695, 126.934628424797 37.6509116380587, 126.93471010856099 37.6509296163783, 126.934716557258 37.65093106180309, 126.93473599698599 37.6509352178953, 126.934947400101 37.6509850786908, 126.93497188624002 37.6509908596147, 126.93526702865898 37.6510605013702, 126.9357055043 37.6512026738523, 126.935708026808 37.6512042973149, 126.9361367565 37.6514858723195, 126.936281564279 37.651583906704595, 126.936356765015 37.651641891879805, 126.93645466620501 37.6517174618542, 126.93665952437999 37.6518830249768, 126.936766110567 37.6519694132708, 126.936837009667 37.652030189426, 126.937060543802 37.65222135478061, 126.93716319812 37.652315670819505, 126.937306049416 37.652520580440495, 126.937425279735 37.6526913234009, 126.937537233601 37.6529564138039, 126.93756998004902 37.6530342012193, 126.937621478136 37.6531574169886, 126.93762287755399 37.6531607520194, 126.93771038346001 37.65337482367279, 126.937738090734 37.65344251538751, 126.93773986325799 37.65344684188919, 126.93774705217899 37.65345774971449, 126.937837055856 37.6535919798418, 126.93787738928002 37.65365246889729, 126.937923511999 37.65372089118931, 126.937925285065 37.6537245868766, 126.93795048816598 37.65376884707089, 126.938121495876 37.654070104416405, 126.938150993013 37.654122026673605, 126.93826148282402 37.6543545837018, 126.938459507889 37.65477111295571, 126.938466697563 37.6547813899235, 126.938797515249 37.655257734638305, 126.938809840376 37.6552755839872, 126.93881161485402 37.6552776575741, 126.939036230249 37.65553649670981, 126.93928504232998 37.65581643499001, 126.939398428032 37.655944007327996, 126.93966620636601 37.6562409864367, 126.93990452018402 37.65644549098649, 126.939956742441 37.65648976449399, 126.94006763273701 37.6565843524801, 126.940128075991 37.6566359294763, 126.940186100506 37.6566728163208, 126.94022571779398 37.656698158973896, 126.94033335767799 37.6567666114455, 126.940335132883 37.656767873966096, 126.94051623671598 37.656855828441394, 126.94076929682001 37.65697878376219, 126.94084881782099 37.6570228903431, 126.94102159668898 37.6571184096006, 126.94144359200601 37.65735409269261, 126.94157320001699 37.6574265200285, 126.94180139287401 37.657554146832, 126.941952960846 37.6576393810384, 126.942069954254 37.6577053132726, 126.942077897148 37.657709732852, 126.94209985674401 37.65772217962661, 126.942437910333 37.6578337283199, 126.942697082155 37.657919464604305, 126.943338200232 37.658058552777405, 126.94412344525202 37.6581157904758, 126.94412484734902 37.6581160614877, 126.94429403625202 37.65814560940299, 126.944396297364 37.6581635907126, 126.94472820577002 37.65824881609889, 126.94482868487601 37.65827490662859, 126.94488224260802 37.6582888095128, 126.94502272666001 37.6583251917742, 126.94520554966698 37.65837628243249, 126.945689055375 37.658517447284204, 126.946043288914 37.6586322372534, 126.946082544476 37.6586448714267, 126.94642593726601 37.65875605065371, 126.946584356293 37.65881514839959, 126.946738099579 37.65887649671821, 126.94708399939898 37.659014709922, 126.947464574771 37.659166815402095, 126.94751102524599 37.65918539995121, 126.94753728511301 37.65920001040531, 126.94753840659 37.6592005515993, 126.947558124837 37.65921155450409, 126.947565040293 37.65921534244521, 126.94767772161998 37.6590420095285, 126.947683430576 37.6590331807044, 126.94769241521001 37.65901921672731, 126.947693163998 37.659017955437, 126.947754371032 37.6589238114659, 126.947755400344 37.6589224601835, 126.947776356425 37.658901292230695, 126.947807603518 37.65886958526949, 126.94790125089898 37.6587748247574, 126.94790228001702 37.6587737438213, 126.94796711272102 37.658708077956696, 126.947968519058 37.6587023111604, 126.947982957116 37.6586435619704, 126.947983332826 37.65864103889119, 126.948002078189 37.6585723788499, 126.947942650247 37.658395545265, 126.947939388961 37.6583801340085, 126.947915260366 37.65825909771531, 126.94803912036498 37.658005385981, 126.94803835768 37.657892470426, 126.947992301798 37.6577112270563, 126.94799230192402 37.6577110468246, 126.94781627963 37.6574263830671, 126.94781338497502 37.6574215155276, 126.94775795289299 37.6572809101781, 126.94780258472801 37.657224967957, 126.94788249076902 37.6571257856719, 126.94801143053 37.6570924095659, 126.948128027724 37.65706245229661, 126.94818458926001 37.65705833182291, 126.948236382661 37.65705474992531, 126.948282101696 37.65704801128519, 126.94828640246 37.6570473823593, 126.94834904395802 37.6570383080969, 126.94883287468201 37.656974356423596, 126.949126341834 37.65681272528621, 126.94918610127002 37.6567797686183, 126.949203028445 37.65677040385339, 126.949213791069 37.6567530161158, 126.94922820352798 37.65672986252941, 126.949344832117 37.6565145356253, 126.94937937110102 37.6564510187281, 126.94949028864 37.6562469537093, 126.949552595684 37.6561783120372, 126.949571680859 37.65615705283919, 126.949633520636 37.65608796034379, 126.949791253624 37.6559117608303, 126.949799201701 37.6559088805032, 126.95010412584702 37.655799879481094, 126.95040465441099 37.655692317675395, 126.950644809462 37.6555579654252, 126.95069016582399 37.65553248158359, 126.95072186833201 37.65551492222371, 126.95077255515902 37.6554864667509, 126.95078125488598 37.65547772913519, 126.950900434208 37.6553540496191, 126.95105300848502 37.6551970409433, 126.95130975167001 37.6549946566721, 126.951364089213 37.65495782166639, 126.95137016823598 37.65495376895511, 126.951375966811 37.654949716127796, 126.951418786777 37.6549422541466, 126.951718339571 37.654889659302, 126.951858766354 37.6548652051559)))")
        //        new SpatialPointFilter(null, "gis", null, 37.501176, 127.035949, 1000.0, SpatialOperations.INTERSECTS.name()),
        //        timeListFilter
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
    limit.setLimit(10000);

    List<Filter> filters = Lists.newArrayList(
        //new SpatialBboxFilter("estate", "gis", null, "127.066436 37.484505", "127.007656 37.521752", null)
    );

    List<Field> fields1 = Lists.newArrayList(new DimensionField("gis"), new MeasureField("amt", null, MeasureField.AggregationType.NONE));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields1, null);

    List<Field> fields2 = Lists.newArrayList(new DimensionField("geom"), new DimensionField("name"));
    MapViewLayer layer2 = new MapViewLayer("layer2", "seoul_roads", fields2, null);

    Shelf geoShelf = new GeoShelf(Arrays.asList(layer1, layer2));

    GeoSpatialOperation operation = new GeoSpatialOperation.Within(1000, false, new GeoSpatialOperation.ChoroplethAggregation(MeasureField.AggregationType.AVG, "amt"));
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
    List<Field> fields1 = Lists.newArrayList(new DimensionField("gis"), new DimensionField("gu"));
    MapViewLayer layer1 = new MapViewLayer("layer1", "estate", fields1, null);

    List<Field> fields2 = Lists.newArrayList(new DimensionField("geom"), new DimensionField("name"));
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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

    // Limit
    Limit limit = new Limit();
    limit.setLimit(50000);

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("State", Lists.newArrayList("Texas"))
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

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(request)
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

    SimilarityQueryRequest queryRequest = new SimilarityQueryRequest(Lists.newArrayList("sales_geo", "sales_join_category"), null);

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
