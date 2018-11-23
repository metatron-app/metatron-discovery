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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.NotBlank;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Period;
import org.joda.time.format.DateTimeFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.common.RawJsonString;
import app.metatron.discovery.domain.datasource.SimilarityQueryRequest;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.data.result.ChartResultFormat;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.geo.GeoService;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeListFilter;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.polaris.ComputationalField;
import app.metatron.discovery.util.EnumUtils;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK;
import static app.metatron.discovery.query.polaris.ComputationalField.checkComputationalFieldIn;

/**
 * 데이터 관련 질의 담당 API
 */
@RepositoryRestController
public class DataQueryController {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataQueryController.class);

  @Autowired
  DataSourceValidator dataSourceValidator;

  @Autowired
  EngineQueryService engineQueryService;

  @Autowired
  GeoService geoService;

  @Autowired
  DruidEngineMetaRepository engineMetaRepository;

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  @RequestMapping(value = "/datasources/query/candidate", method = RequestMethod.POST)
  public ResponseEntity<?> metaDataQuery(@RequestBody CandidateQueryRequest queryRequest) {

    dataSourceValidator.validateQuery(queryRequest);

    // Link 타입의 데이터 소스일 경우, 별도 JDBC 처리
    if (queryRequest.getDataSource().getMetaDataSource().getConnType() == LINK &&
        BooleanUtils.isNotTrue(queryRequest.getDataSource().getTemporary())) {
      return ResponseEntity.ok(jdbcConnectionService.selectCandidateQuery(queryRequest));
    } else {
      return ResponseEntity.ok(engineQueryService.candidate(queryRequest));
    }
  }

  @RequestMapping(value = "/datasources/query/search", method = RequestMethod.POST)
  public ResponseEntity<?> searchQuery(@RequestBody SearchQueryRequest queryRequest) {

    //TODO: need to validation check about datasource granularity and query granularity
    dataSourceValidator.validateQuery(queryRequest);

    if (queryRequest.getResultFormat() instanceof ChartResultFormat
        && "map".equals(((ChartResultFormat) queryRequest.getResultFormat()).getMode())) {

      String result = geoService.search(queryRequest);

      return ResponseEntity.ok(new RawJsonString(result));
    }

    Object result = engineQueryService.search(queryRequest);
    if (result instanceof MatrixResponse && queryRequest.getResultFormat() instanceof ChartResultFormat) {
      MatrixResponse response = (MatrixResponse) result;
      if (queryRequest.getLimits() != null &&
          response.getCategoryCount() >= queryRequest.getLimits().getLimit()) {
        queryRequest.setMetaQuery(true);
        ArrayNode totalResult = (ArrayNode) engineQueryService.search(queryRequest);
        if (totalResult != null
            && totalResult.isArray()
            && totalResult.size() == 1
            && totalResult.get(0).has("cardinality")) {
          response.addInfo("totalCategory",
                           totalResult.get(0).get("cardinality").asInt());
        } else {
          response.addInfo("totalCategory", response.getCategoryCount());
        }
      } else {
        response.addInfo("totalCategory", response.getCategoryCount());
      }

      result = response;
    }

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/datasources/query/{queryId}/cancel", method = RequestMethod.POST)
  public ResponseEntity<?> searchQuery(@PathVariable("queryId") String queryId) {

    engineMetaRepository.cancelQuery(queryId);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(value = "/datasources/query/search/time_compare", method = RequestMethod.POST)
  public ResponseEntity<?> searchQuery(@RequestBody TimeCompareRequest timeCompareRequest) {

    Map<String, Object> resultMap = Maps.newLinkedHashMap();

    DateTime baseTime = null;
    if (timeCompareRequest.getBasePoint() == BasePoint.LAST) {
      if (StringUtils.isEmpty(timeCompareRequest.getBaseTime())) {
        CandidateQueryRequest candidateQueryRequest = new CandidateQueryRequest();
        candidateQueryRequest.setDataSource(timeCompareRequest.getDataSource());
        candidateQueryRequest.setTargetField(timeCompareRequest.getTimeField());
        dataSourceValidator.validateQuery(candidateQueryRequest);
        Object result = engineQueryService.candidate(candidateQueryRequest);
        if (result instanceof ObjectNode) {
          baseTime = DateTime.parse(((ObjectNode) result).get("maxTime").textValue());
        } else {
          baseTime = DateTime.now(DateTimeZone.forID(timeCompareRequest.getTimezone()));
        }
      } else {
        baseTime = DateTime.parse(timeCompareRequest.getBaseTime(),
                                  DateTimeFormat.forPattern(timeCompareRequest.getTimeUnit().sortFormat()));
      }
    } else {
      baseTime = DateTime.now(DateTimeZone.forID(timeCompareRequest.getTimezone()));
    }

    SearchQueryRequest currentRequest = timeCompareRequest.convertSearchQueryRequest(baseTime);

    dataSourceValidator.validateQuery(currentRequest);
    Object currentResult = engineQueryService.search(currentRequest);
    resultMap.put("current", currentResult);

    DateTime previousTime = baseTime.minus(
        Period.parse(timeCompareRequest.getTimeUnit().peridFormat(timeCompareRequest.getValue()))
    );
    SearchQueryRequest previousRequest = timeCompareRequest.convertSearchQueryRequest(previousTime);

    dataSourceValidator.validateQuery(currentRequest);
    Object previousResult = engineQueryService.search(previousRequest);
    resultMap.put("previous", previousResult);

    return ResponseEntity.ok(resultMap);
  }

  @RequestMapping(value = "/datasources/query/similarity", method = RequestMethod.POST)
  public ResponseEntity<?> similarityQuery(@RequestBody SimilarityQueryRequest queryRequest) {

    return ResponseEntity.ok(engineQueryService.similarity(queryRequest));
  }

  @RequestMapping(value = "/datasources/stats", method = RequestMethod.POST)
  public ResponseEntity<?> getDataSourceFieldStats(@RequestBody SummaryQueryRequest request) {

    dataSourceValidator.validateQuery(request.getDataSource());

    return ResponseEntity.ok(new RawJsonString((String) engineQueryService.summary(request)));
  }

  @RequestMapping(value = "/datasources/covariance", method = RequestMethod.POST)
  public ResponseEntity<?> getDataSourceFieldCovariance(@RequestBody CovarianceQueryRequest request) {

    dataSourceValidator.validateQuery(request.getDataSource());

    return ResponseEntity.ok(new RawJsonString((String) engineQueryService.covariance(request)));
  }

  @RequestMapping(value = "/datasources/validate/expr", method = RequestMethod.POST)
  public ResponseEntity<?> validateField(@RequestBody CheckExprRequest checkExprRequest) {

    dataSourceValidator.validateQuery(checkExprRequest.getDataSource());

    // TODO: 메타 데이터 소스 관련 내용 및 ParameterField 지원 여부 관련 추가

    Map<String, String> exprMap = null;
    if (CollectionUtils.isNotEmpty(checkExprRequest.getUserFields())) {
      checkExprRequest.getUserFields().stream()
                      .filter(f -> f instanceof ExpressionField)
                      .collect(Collectors.toMap(UserDefinedField::getName, f -> ((ExpressionField) f).getExpr()));
    }

    ComputationalField.CheckType checkType = checkComputationalFieldIn(checkExprRequest.getExpr(), exprMap);

    Map<String, Object> resultMap = Maps.newLinkedHashMap();
    switch (checkType) {
      case CHECK_TYPE_INVALID:
        throw new InvalidExpressionException("");
      case CHECK_TYPE_VALID_AGGREGATOR:
        resultMap.put("aggregated", true);
        break;
      case CHECK_TYPE_VALID_NON_AGGREGATOR:
        resultMap.put("aggregated", false);
        break;
    }

    // 추후 Guessing 방식은 검토
    //resultMap.put("dataType", engineQueryService.guessTypeForExpr(checkExprRequest));

    return ResponseEntity.ok(resultMap);
  }

  public static class TimeCompareRequest implements Serializable {
    DataSource dataSource;
    List<UserDefinedField> userFields;
    List<Filter> filters;
    Field timeField;
    List<Field> measures;
    TimeFieldFormat.TimeUnit timeUnit;
    BasePoint basePoint;
    Integer value;
    String timezone;
    String baseTime;

    @JsonCreator
    public TimeCompareRequest(
        @JsonProperty("dataSource") DataSource dataSource,
        @JsonProperty("userFields") List<UserDefinedField> userFields,
        @JsonProperty("filters") List<Filter> filters,
        @JsonProperty("timeField") Field timeField,
        @JsonProperty("measures") List<Field> measures,
        @JsonProperty("timeUnit") String timeUnit,
        @JsonProperty("basePoint") String basePoint,
        @JsonProperty("value") Integer value,
        @JsonProperty("timezone") String timezone,
        @JsonProperty("baseTime") String baseTime) {
      this.dataSource = dataSource;
      this.userFields = userFields;
      this.filters = filters;
      this.timeField = timeField;
      this.measures = measures;
      this.timeUnit = EnumUtils.getUpperCaseEnum(TimeFieldFormat.TimeUnit.class, timeUnit);
      this.basePoint = EnumUtils.getUpperCaseEnum(BasePoint.class, basePoint, BasePoint.LAST);
      this.value = (value == null || value < 1) ? 1 : value;

      if (StringUtils.isEmpty(timezone)) {
        this.timezone = "UTC";
      } else {
        this.timezone = DateTimeZone.forID(timezone).getID();
      }

      this.baseTime = baseTime;
    }

    public SearchQueryRequest convertSearchQueryRequest(DateTime dateTime) {

      TimeListFilter currentTimeFilter = new TimeListFilter(timeField.getName(), timeField.getRef(),
                                                            timeUnit.name(),
                                                            null, false,
                                                            Lists.newArrayList(
                                                                timeUnit.parsedDateTime(dateTime, timeUnit.format(), null)
                                                            ),
                                                            null);

      List<Filter> currentReqFilters = Lists.newArrayList(filters);
      currentReqFilters.add(currentTimeFilter);

      return new SearchQueryRequest(dataSource,
                                    userFields,
                                    currentReqFilters,
                                    measures,
                                    new Limit(1000));
    }

    public DataSource getDataSource() {
      return dataSource;
    }

    public List<UserDefinedField> getUserFields() {
      return userFields;
    }

    public List<Filter> getFilters() {
      return filters;
    }

    public Field getTimeField() {
      return timeField;
    }

    public List<Field> getMeasures() {
      return measures;
    }

    public TimeFieldFormat.TimeUnit getTimeUnit() {
      return timeUnit;
    }

    public BasePoint getBasePoint() {
      return basePoint;
    }

    public Integer getValue() {
      return value;
    }

    public String getTimezone() {
      return timezone;
    }

    public String getBaseTime() {
      return baseTime;
    }
  }

  public static class CheckExprRequest implements Serializable {

    /**
     * 질의할 DataSource 정보
     */
    @NotNull
    DataSource dataSource;

    /**
     * 기존 정의되어 있는 Field 외 가상 필드 정의
     */
    List<UserDefinedField> userFields;

    /**
     * 검증할 표현식
     */
    @NotBlank
    String expr;


    public CheckExprRequest() {
    }

    public DataSource getDataSource() {
      return dataSource;
    }

    public void setDataSource(DataSource dataSource) {
      this.dataSource = dataSource;
    }

    public List<UserDefinedField> getUserFields() {
      return userFields;
    }

    public void setUserFields(List<UserDefinedField> userFields) {
      this.userFields = userFields;
    }

    public String getExpr() {
      return expr;
    }

    public void setExpr(String expr) {
      this.expr = expr;
    }
  }

  public enum BasePoint {
    LAST, CURRENT
  }

}
