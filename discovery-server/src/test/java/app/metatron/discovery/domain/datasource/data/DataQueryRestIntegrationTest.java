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
import app.metatron.discovery.domain.workbook.configurations.analysis.PredictionAnalysis;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.JoinMapping;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.*;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoFormat;
import app.metatron.discovery.domain.workbook.configurations.format.GeoHashFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.GeoShelf;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.Shelf;

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
    //SalesGeoDataSourceTestFixture.setUp(datasourceEngineName);
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
        null, null
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

    TimeRangeFilter timeRangeFilter = new TimeRangeFilter("OrderDate", null, "DAY",
                                                          Lists.newArrayList(
                                                              "EARLIEST_DATETIME/2011-05-19",
                                                              "2012-05-19/2013-05-19",
                                                              "2014-05-19/LATEST_DATETIME"
                                                          ),
                                                          "Asia/Seoul",
                                                          "ko");

    //    TimeRangeFilter timeRangeFilter = new TimeRangeFilter("ShipDate", null, "DAY",
    //                                                          Lists.newArrayList(
    //                                                              "EARLIEST_DATETIME/2011-05-19",
    //                                                              "2012-05-19/2013-05-19",
    //                                                              "2014-05-19/LATEST_DATETIME"
    //                                                          ));

    //    TimeRangeFilter timeRangeFilter = new TimeRangeFilter("OrderDate", null, null,
    //                                                          Lists.newArrayList(
    //                                                              "EARLIEST_DATETIME/2011-05-19 12:00:00",
    //                                                              "2014-05-19 16:00:23/LATEST_DATETIME"
    //                                                          ),
    //                                                          "Asia/Seoul",
    //                                                          "ko");

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

    TimeRelativeFilter relativeFilter = new TimeRelativeFilter("OrderDate", null, "year", null, TimeRelativeFilter.Tense.PREVIOUS.name(), 6, "Asia/Seoul", "en");
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

    DataSource dataSource1 = new DefaultDataSource("sales_geo");

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

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot2, limit);

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

    // Case 2.
    Pivot pivot3 = new Pivot();
    pivot3.setColumns(Lists.newArrayList(new TimestampField("OrderDate", null,
                                                            new ContinuousTimeFormat(false, TimeFieldFormat.TimeUnit.YEAR.name(), null))));
    pivot3.setRows(null);
    pivot3.setAggregations(Lists.newArrayList(
        new DimensionField("Category"),
        new DimensionField("Sub-Category"),
        new MeasureField("Discount", MeasureField.AggregationType.SUM)
    ));

    SearchQueryRequest request = new SearchQueryRequest(dataSource1, filters, pivot3, limit);
    ChartResultFormat format = new ChartResultFormat("line");
    format.addOptions("showPercentage", true);
    format.addOptions("showCategory", true);
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

    GeoHashFormat hashFormat = new GeoHashFormat("geohex", 5);
    DimensionField geoDimensionField = new DimensionField("gis", null, hashFormat);

    List<Field> layer1 = Lists.newArrayList(geoDimensionField,
                                            new MeasureField("py", null, MeasureField.AggregationType.AVG),
                                            new MeasureField("amt", null, MeasureField.AggregationType.SUM));

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

    GeoHashFormat hashFormat = new GeoHashFormat("geohex", 5);
    DimensionField geoDimensionField = new DimensionField("gis", null, hashFormat);

    MeasureField measureField = new MeasureField("MEASURE_1", "user_defined");

    List<Field> layer1 = Lists.newArrayList(geoDimensionField, measureField);

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
                                                       null, null, valueList, null);

    List<Filter> filters = Lists.newArrayList(
        new ExpressionFilter("amt < 50000 && amt > 40000"),
        new InclusionFilter("gu_new", "user_defined", Arrays.asList("강남구_new")),
        new SpatialBboxFilter(null, "gis", null, "126.8060772 37.4458596", "127.1810908 37.6874771"),
        timeListFilter
        //        new BoundFilter("amt", null, 0, 62510)
    );

    ExpressionField expressionField1 = new ExpressionField("gu_new", "\"gu\" + '_new'");

    //    List<Field> layer1 = Lists.newArrayList(new DimensionField("gis", null, new GeoFormat()), new DimensionField("gu"), new MeasureField("py", null, MeasureField.AggregationType.NONE));
    List<Field> layer1 = Lists.newArrayList(new DimensionField("gis", null, new GeoFormat()), new DimensionField("gu_new", "user_defined"), new MeasureField("amt", null, MeasureField.AggregationType.NONE));
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
    limit.setLimit(10);

    List<Filter> filters = Lists.newArrayList();

    GeoHashFormat hashFormat = new GeoHashFormat("geohex", 5);

    //    List<Field> layer1 = Lists.newArrayList(new DimensionField("gis", null, new GeoFormat()), new DimensionField("gu"), new MeasureField("py", null, MeasureField.AggregationType.NONE));
    //    List<Field> layer1 = Lists.newArrayList(new DimensionField("location", null, new GeoFormat()), new TimestampField("OrderDate", null), new MeasureField("Sales", null, MeasureField.AggregationType.NONE));
    List<Field> layer1 = Lists.newArrayList(new DimensionField("location", null, hashFormat), new MeasureField("Profit", null, MeasureField.AggregationType.AVG), new MeasureField("Sales", null, MeasureField.AggregationType.AVG));
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
