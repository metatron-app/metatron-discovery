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

package app.metatron.discovery.domain.engine;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.facebook.presto.jdbc.internal.guava.collect.Sets;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.SerializationUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.StringJoiner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.RawJsonString;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.QueryHistoryTeller;
import app.metatron.discovery.domain.datasource.SimilarityQueryRequest;
import app.metatron.discovery.domain.datasource.SimilarityResponse;
import app.metatron.discovery.domain.datasource.data.CandidateQueryRequest;
import app.metatron.discovery.domain.datasource.data.CovarianceQueryRequest;
import app.metatron.discovery.domain.datasource.data.DataQueryController;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.datasource.data.SummaryQueryRequest;
import app.metatron.discovery.domain.datasource.data.result.ChartResultFormat;
import app.metatron.discovery.domain.datasource.data.result.GeoJsonResultFormat;
import app.metatron.discovery.domain.datasource.data.result.GraphResultFormat;
import app.metatron.discovery.domain.datasource.data.result.ObjectResultFormat;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.Sort;
import app.metatron.discovery.domain.workbook.configurations.analysis.GeoSpatialAnalysis;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.AdvancedFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.GeoShelf;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.MapViewLayer;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.meta.AnalysisType;
import app.metatron.discovery.query.druid.queries.*;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE;
import static app.metatron.discovery.domain.datasource.DataSourceQueryHistory.EngineQueryType.*;
import static app.metatron.discovery.query.druid.AbstractQueryBuilder.GEOMETRY_BOUNDARY_COLUMN_NAME;
import static app.metatron.discovery.query.druid.AbstractQueryBuilder.GEOMETRY_COLUMN_NAME;
import static app.metatron.discovery.query.druid.meta.AnalysisType.CARDINALITY;
import static app.metatron.discovery.query.druid.meta.AnalysisType.INGESTED_NUMROW;
import static app.metatron.discovery.query.druid.meta.AnalysisType.QUERYGRANULARITY;
import static app.metatron.discovery.query.druid.meta.AnalysisType.SERIALIZED_SIZE;

/**
 * Created by kyungtaak on 2016. 8. 25..
 */
@Component
public class EngineQueryService extends AbstractQueryService implements QueryService {

  private static final Logger LOGGER = LoggerFactory.getLogger(EngineQueryService.class);

  private static final String EXPR_TEMP_NAME = "__TARGET";

  @Autowired
  DruidEngineRepository engineRepository;

  @Override
  public Object preview(SearchQueryRequest request) {

    StopWatch stopWatch = new StopWatch();

    QueryHistoryTeller.setEngineQueryType(SELECT); // for history
    stopWatch.start("Query Generation Time");
    Query query = SelectQuery.builder(request.getDataSource())
                             .limit(request.getLimits())
                             .fields(request.getProjections())
                             .forward(request.getResultForward())
                             .build();

    if (request.getResultFormat() == null) {
      request.setResultFormat(new ObjectResultFormat(ENGINE));
    }

    String queryString = GlobalObjectMapper.writeValueAsString(query);
    stopWatch.stop();
    LOGGER.debug("[{}] Query Generation Time : {}", CommonLocalVariable.getQueryId(), stopWatch.getLastTaskTimeMillis());

    QueryHistoryTeller.setEngineQuery(queryString); // for history
    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);

    // 결과 셋 추가 정의
    if (request.getResultFormat() == null) {
      request.setResultFormat(new ObjectResultFormat(ENGINE));
    } else {
      request.getResultFormat().setConnType(ENGINE);
    }

    stopWatch.start("Result Processing Time");
    // 결과 정의
    Object result = request.getResultFormat()
                           .makeResult(
                               engineResult.orElseGet(
                                   () -> GlobalObjectMapper.getDefaultMapper().createArrayNode())
                           );
    stopWatch.stop();
    LOGGER.debug("[{}] Result Processing Time : {}", CommonLocalVariable.getQueryId(), stopWatch.getLastTaskTimeMillis());

    return result;

  }

  @Override
  public Object search(SearchQueryRequest request) {

    StopWatch stopWatch = new StopWatch();

    DataSource metaDataSource = request.getDataSource().getMetaDataSource();
    List<Filter> filters = request.getFilters();

    // Do not check essential filter in Preview mode
    if (metaDataSource != null && BooleanUtils.isFalse(request.getPreview())) {
      checkRequriedFilter(metaDataSource, filters, request.getProjections());
    }

    // If necessary, pre-handle the request object in case of ChartResultFormat
    if (request.getResultFormat() instanceof ChartResultFormat) {
      ((ChartResultFormat) request.getResultFormat()).preHandling();
    }

    // If GraphResultFormat, handle it separately.
    if (request.getResultFormat() instanceof GraphResultFormat) {
      return searchGraphQuery(request);
    }

    // If GeoJsonResultFormat, handle it separately.
    if (request.getShelf() instanceof GeoShelf) {
      return searchGeoQuery(request);
    }

    stopWatch.start("Query Generation Time");
    Query query;
    if (checkSelectQuery(request.getProjections(), request.getUserFields())) {
      if (request.getMetaQuery()) {
        QueryHistoryTeller.setEngineQueryType(SELECTMETA); // for history
        query = new SelectMetaQueryBuilder(request.getDataSource())
            .initVirtualColumns(request.getUserFields())
            .fields(request.getProjections())
            .filters(filters)
            .limit(request.getLimits())
            .forward(request.getResultForward())
            .build();
      } else {

        QueryHistoryTeller.setEngineQueryType(SELECT); // for history
        if (BooleanUtils.isTrue(request.getContextValue(SearchQueryRequest.CXT_KEY_USE_STREAM))) {
          query = SelectStreamQuery.builder(request.getDataSource())
                                   .initVirtualColumns(request.getUserFields())
                                   .fields(request.getProjections())
                                   .filters(filters)
                                   .limit(request.getLimits())
                                   .forward(request.getResultForward())
                                   .build();
          request.setResultFieldMapper(((SelectStreamQuery) query).getFieldMapper());
        } else {
          query = SelectQuery.builder(request.getDataSource())
                             .initVirtualColumns(request.getUserFields())
                             .fields(request.getProjections())
                             .filters(filters)
                             .limit(request.getLimits())
                             .forward(request.getResultForward())
                             .build();
        }
      }
    } else {

      QueryHistoryTeller.setEngineQueryType(GROUPBY); // for history
      query = GroupByQuery.builder(request.getDataSource())
                          .initVirtualColumns(request.getUserFields())
                          .fields(request.getProjections())
                          .filters(filters)
                          .analysis(request.getAnalysis(), request.getProjections())
                          .limit(request.getLimits())
                          .groupingSet(request.getGroupingSets())
                          .forward(request.getResultForward())
                          .format(request.getResultFormat())
                          .build();

      if (request.getMetaQuery()) {
        QueryHistoryTeller.setEngineQueryType(GROUPBYMETA);// for history
        query = new GroupByMetaQuery(query);

        // force result format to be assigned
        request.setResultFormat(new ObjectResultFormat(ENGINE));
      }
    }
    String queryString = GlobalObjectMapper.writeValueAsString(query);
    stopWatch.stop();
    LOGGER.debug("[{}] Query Generation Time : {}", CommonLocalVariable.getQueryId(), stopWatch.getLastTaskTimeMillis());

    QueryHistoryTeller.setEngineQuery(queryString); // for history
    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);

    // 결과 셋 추가 정의
    if (request.getResultFormat() == null) {
      request.setResultFormat(new ObjectResultFormat(ENGINE));
    } else {
      request.getResultFormat().setConnType(ENGINE);
    }

    stopWatch.start("Result Processing Time");
    // 결과 정의
    Object result = request.getResultFormat()
                           .makeResult(
                               engineResult.orElseGet(
                                   () -> GlobalObjectMapper.getDefaultMapper().createArrayNode())
                           );
    stopWatch.stop();
    LOGGER.debug("[{}] Result Processing Time : {}", CommonLocalVariable.getQueryId(), stopWatch.getLastTaskTimeMillis());

    return result;

  }

  private Object searchGeoQuery(SearchQueryRequest request) {

    GeoShelf geoShelf = (GeoShelf) request.getShelf();
    request.setResultFormat(new GeoJsonResultFormat());

    StringJoiner resultJoiner = new StringJoiner(",", "[", "]");
    String queryString = null;

    if (request.getAnalysis() != null && request.getAnalysis() instanceof GeoSpatialAnalysis) {
      GeoSpatialAnalysis geoSpatialAnalysis = (GeoSpatialAnalysis) request.getAnalysis();
      MapViewLayer mainLayer = geoShelf.getLayerByName(geoSpatialAnalysis.getMainLayer())
                                       .orElseThrow(() -> new IllegalArgumentException("Invalid name of main layer"));
      MapViewLayer compareLayer = geoShelf.getLayerByName(geoSpatialAnalysis.getCompareLayer())
                                          .orElseThrow(() -> new IllegalArgumentException("Invalid name of compare layer"));

      SelectStreamQuery compareLayerQuery = SelectStreamQuery.builder(request.getDataSource())
                                                             .layer(compareLayer)
                                                             .filters(request.getFilters())
                                                             .compareLayer(compareLayer.getFields(), geoSpatialAnalysis.getOperation())
                                                             .emptyQueryId()
                                                             .build();

      if (geoSpatialAnalysis.isIncludeCompareLayer()) {

        request.setResultFieldMapper(compareLayerQuery.getFieldMapper());

        queryString = GlobalObjectMapper.writeValueAsString(compareLayerQuery);

        LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

        Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);
        Object geoJsonResult = request.getResultFormat().makeResult(request.makeResult(engineResult.get()));
        resultJoiner.add(GlobalObjectMapper.writeValueAsString(geoJsonResult));
      }

      Query operationQuery = null;
      if (geoSpatialAnalysis.enableChoropleth()) {
        GroupByQuery mainLayerQuery = GroupByQuery.builder(request.getDataSource())
                                                  .layer(mainLayer)
                                                  .fields(mainLayer.getFields())
                                                  .filters(request.getFilters())
                                                  .limit(request.getLimits())
                                                  .enableChropoleth(geoSpatialAnalysis.getOperation().getAggregation())
                                                  .emptyQueryId()
                                                  .build();

        operationQuery = GeoBoundaryFilterQuery.builder()
                                               .query(mainLayerQuery)
                                               .geometry(mainLayerQuery.getGeometry())
                                               .boundary(compareLayerQuery, GEOMETRY_BOUNDARY_COLUMN_NAME, true)
                                               .operation(geoSpatialAnalysis.getOperation())
                                               .build();

        Map<String, String> mapper = Maps.newLinkedHashMap();
        for (String outputColumn : mainLayerQuery.getOutputColumns()) {
          mapper.put(outputColumn, outputColumn);
        }

        for (String column : compareLayerQuery.getColumns()) {
          if (GEOMETRY_BOUNDARY_COLUMN_NAME.equals(column)) {
            mapper.put(GEOMETRY_BOUNDARY_COLUMN_NAME, GEOMETRY_COLUMN_NAME);
          } else {
            mapper.put(column, column);
          }
        }

        request.setResultFieldMapper(mapper);

      } else {
        SelectStreamQuery mainLayerQuery = SelectStreamQuery.builder(request.getDataSource())
                                                            .layer(mainLayer)
                                                            .fields(mainLayer.getFields())
                                                            .filters(request.getFilters())
                                                            .limit(request.getLimits())
                                                            .emptyQueryId()
                                                            .build();

        operationQuery = GeoBoundaryFilterQuery.builder()
                                               .query(mainLayerQuery)
                                               .geometry(mainLayerQuery.getGeometry())
                                               .boundary(compareLayerQuery, GEOMETRY_BOUNDARY_COLUMN_NAME, false)
                                               .operation(geoSpatialAnalysis.getOperation())
                                               .build();
        request.setResultFieldMapper(mainLayerQuery.getFieldMapper());
      }


      queryString = GlobalObjectMapper.writeValueAsString(operationQuery);

      LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

      Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);
      Object geoJsonResult = request.getResultFormat().makeResult(request.makeResult(engineResult.get()));
      resultJoiner.add(GlobalObjectMapper.writeValueAsString(geoJsonResult));

    } else {

      for (MapViewLayer layer : geoShelf.getLayers()) {

        if (CollectionUtils.isEmpty(layer.getFields())) {
          continue;
        }

        CommonLocalVariable.generateQueryId();

        if (layer.getView().needAggregation()) {
          GroupByQuery groupByQuery = GroupByQuery.builder(request.getDataSource())
                                                  .layer(layer)
                                                  .initVirtualColumns(request.getUserFields())
                                                  .fields(layer.getFields())
                                                  .filters(request.getFilters())
                                                  .limit(request.getLimits())
                                                  .build();

          queryString = GlobalObjectMapper.writeValueAsString(groupByQuery);

        } else {
          SelectStreamQuery streamQuery = SelectStreamQuery.builder(request.getDataSource())
                                                           .layer(layer)
                                                           .initVirtualColumns(request.getUserFields())
                                                           .fields(layer.getFields())
                                                           .filters(request.getFilters())
                                                           .limit(request.getLimits())
                                                           .build();

          request.setResultFieldMapper(streamQuery.getFieldMapper());

          queryString = GlobalObjectMapper.writeValueAsString(streamQuery);
        }

        LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

        Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);
        Object geoJsonResult = request.getResultFormat().makeResult(request.makeResult(engineResult.get()));
        resultJoiner.add(GlobalObjectMapper.writeValueAsString(geoJsonResult));
      }
    }

    return new RawJsonString(resultJoiner.toString());
  }

  private Object searchGraphQuery(SearchQueryRequest request) {

    GraphResultFormat graphResultFormat = (GraphResultFormat) request.getResultFormat();

    ObjectNode objectNode = GlobalObjectMapper.getDefaultMapper().createObjectNode();

    List<app.metatron.discovery.domain.workbook.configurations.field.Field> fields = request.getProjections();

    // 차원값 추출
    List<app.metatron.discovery.domain.workbook.configurations.field.Field> dimFields =
        fields.stream()
              .filter(field -> field instanceof DimensionField)
              .collect(Collectors.toList());

    // 측정값 추출, 1개만 처리 및 Alias를 value로 변경
    MeasureField measureField = (MeasureField) fields.stream()
                                                     .filter(field -> field instanceof MeasureField)
                                                     .findFirst().get();
    measureField.setAlias("value");

    /* Node Size 지정 */
    SearchQueryRequest sizeRequest = request.copyOf();
    final List<List<String>> groupingSets = Lists.newArrayList();
    dimFields.forEach(field ->
                          groupingSets.add(Lists.newArrayList(field.getAlias()))
    );
    sizeRequest.setGroupingSets(groupingSets);
    sizeRequest.setResultFormat(new ObjectResultFormat());

    objectNode.set("nodes", (ArrayNode) search(sizeRequest));

    /* Node/Link 구성 */

    ArrayNode linkNodes = GlobalObjectMapper.getDefaultMapper().createArrayNode();
    for (int i = 0; i < dimFields.size() - 1; i++) {
      // 신규 쿼리 요청 작성, Deep Copy
      SearchQueryRequest newRequest = SerializationUtils.clone(request);

      List<app.metatron.discovery.domain.workbook.configurations.field.Field> newProjection = Lists.newArrayList();

      // source 필드 지정
      app.metatron.discovery.domain.workbook.configurations.field.Field source = SerializationUtils.clone(fields.get(i));
      String originalFieldName = source.getAlias();
      source.setAlias("source");
      newProjection.add(source);

      newRequest.addUserDefinedFields(new ExpressionField("sourceField", "'" + originalFieldName + "'", "dimension"));
      newProjection.add(new DimensionField("sourceField", "sourceField", UserDefinedField.REF_NAME, null));

      // target 필드 지정
      app.metatron.discovery.domain.workbook.configurations.field.Field target = SerializationUtils.clone(fields.get(i + 1));
      originalFieldName = target.getAlias();
      target.setAlias("target");
      newProjection.add(target);

      newRequest.addUserDefinedFields(new ExpressionField("targetField", "'" + originalFieldName + "'", "dimension"));
      newProjection.add(new DimensionField("targetField", "targetField", UserDefinedField.REF_NAME, null));

      if (BooleanUtils.isTrue(graphResultFormat.getUseLinkCount())) {
        measureField.setAggregationType(MeasureField.AggregationType.COUNT);
      }
      newProjection.add(measureField);

      newRequest.setProjections(newProjection);

      newRequest.setResultFormat(new ObjectResultFormat());

      // source - target 지정후 (차원값 개수 - 1) 만큼 호출
      linkNodes.addAll((ArrayNode) search(newRequest));
    }

    objectNode.set("links", linkNodes);

    return request.getResultFormat().makeResult(objectNode);
  }

  @Override
  public Object candidate(CandidateQueryRequest request) {

    StopWatch stopWatch = new StopWatch();
    DataSource metaDataSource = request.getDataSource().getMetaDataSource();
    List<Filter> availableFilter = request.getAvailableFilters();

    // 필수 필터 체크
    checkRequriedFilter(metaDataSource, availableFilter, Lists.newArrayList(request.getTargetField()));

    // 파티션된 필드의 조회의 경우.
    int idx = getPartitionedIndex(metaDataSource, request.getFilters(), request.getTargetField());
    if (idx > 0) {
      QueryHistoryTeller.setEngineQueryType(TOPN); // for history

      // 조회할 Regex 작성
      PartitionRegexQuery regexQuery = PartitionRegexQuery.builder(request.getDataSource())
                                                          .filters(request.getFilters())
                                                          .build();

      // 코디네이터 호출
      Map<String, Object> paramMap = Maps.newHashMap();
      paramMap.put("nameRegex", regexQuery.toCommaExprs());
      Optional<List> metaResult = engineRepository.meta(paramMap);

      LOGGER.debug("[{}] Successfully call candidation for partition field. Request: {}, Response: {}",
                   CommonLocalVariable.getQueryId(), regexQuery.toCommaExprs(), metaResult);

      // 결과값 처리
      stopWatch.start("Result Processing Time");
      List<Map<String, Object>> result = Lists.newArrayList();

      List<String> sources = metaResult.orElse(Lists.newArrayList());
      // TODO: 여러개를 가정할 경우, 루프 추가
      Pattern p = Pattern.compile(regexQuery.getRegExprs().get(0));
      String tagetFieldName = request.getTargetField().getColunm();
      Set<String> dupSet = Sets.newHashSet();
      Matcher matcher;
      for (String source : sources) {
        matcher = p.matcher(source);
        if (matcher.find()) {
          String itemName = matcher.group(idx);
          if (StringUtils.isNotEmpty(itemName) && !dupSet.contains(itemName)) {
            Map<String, Object> item = Maps.newHashMap();
            item.put("count", 0);
            item.put(tagetFieldName, matcher.group(idx));
            result.add(item);
            dupSet.add(itemName);
          }
        }
      }
      stopWatch.stop();
      LOGGER.debug("[{}] Result Processing Time : {}", CommonLocalVariable.getQueryId(), stopWatch.getLastTaskTimeMillis());

      return result;
    }

    stopWatch.start("Query Generation Time");

    Query query;
    List<Filter> advancedFilters = request.getAvailableFilters().stream()
                                          .filter(filter -> filter instanceof AdvancedFilter)
                                          .collect(Collectors.toList());

    // for workbook measure filter
    if (CollectionUtils.isNotEmpty(advancedFilters)) {

      List<Filter> commonFilters = request.getAvailableFilters().stream()
                                          .filter(filter -> !(filter instanceof AdvancedFilter))
                                          .collect(Collectors.toList());

      query = GroupByQuery.builder(request.getDataSource())
                          .initVirtualColumns(request.getUserFields())
                          .fields(Lists.newArrayList(request.getTargetField()))
                          .filters(commonFilters)
                          .advancedFilters(advancedFilters)
                          .build();

    } else {

      app.metatron.discovery.domain.workbook.configurations.field.Field targetField = request.getTargetField();
      app.metatron.discovery.domain.datasource.Field metaField = metaDataSource.getMetaFieldMap(false, "")
                                                                               .get(targetField.getName());

      Field.FieldRole fieldRole = metaField == null ? null : metaField.getRole();
      LogicalType metaDataType = metaField == null ? null : metaField.getLogicalType();

      if (fieldRole == Field.FieldRole.TIMESTAMP) {
        if (targetField.getFormat() != null
            && targetField.getFormat() instanceof TimeFieldFormat
            && ((TimeFieldFormat) targetField.getFormat()).getFilteringType() == TimeFieldFormat.FilteringType.LIST) {
          QueryHistoryTeller.setEngineQueryType(GROUPBY);  // for history

          Limit limit;
          if (request.getSortBy() == CandidateQueryRequest.SortCreteria.COUNT) {
            limit = new Limit(1000, new Sort("count", Sort.Direction.DESC));
          } else {
            limit = new Limit(1000);
          }

          query = GroupByQuery.builder(request.getDataSource())
                              .initVirtualColumns(request.getUserFields())
                              .fields(Lists.newArrayList(request.getTargetField()))
                              .filters(request.getAvailableFilters())
                              .count("count")
                              .limit(limit)
                              .build();
        } else {
          QueryHistoryTeller.setEngineQueryType(TIMEBOUNDARY);  // for history
          query = TimeBoundaryQuery.builder(request.getDataSource())
                                   .filters(request.getAvailableFilters())
                                   .build();
        }
      } else if (metaDataType == LogicalType.TIMESTAMP || fieldRole == Field.FieldRole.MEASURE ||
          UserDefinedField.REF_NAME.equalsIgnoreCase(targetField.getRef()) && targetField instanceof MeasureField) {
        // Timestamp Type 처리시, 체크해야할 사항
        if (targetField.getFormat() != null
            && targetField.getFormat() instanceof TimeFieldFormat
            && ((TimeFieldFormat) targetField.getFormat()).getFilteringType() == TimeFieldFormat.FilteringType.LIST) {
          QueryHistoryTeller.setEngineQueryType(GROUPBY);  // for history

          Limit limit;
          if (request.getSortBy() == CandidateQueryRequest.SortCreteria.COUNT) {
            limit = new Limit(1000, new Sort("count", Sort.Direction.DESC));
          } else {
            limit = new Limit(1000);
          }

          query = GroupByQuery.builder(request.getDataSource())
                              .initVirtualColumns(request.getUserFields())
                              .fields(Lists.newArrayList(request.getTargetField()))
                              .filters(request.getAvailableFilters())
                              .count("count")
                              .limit(limit)
                              .build();
        } else {
          QueryHistoryTeller.setEngineQueryType(SEGMENTMETA);
          query = SegmentMetaDataQuery.builder(request.getDataSource())
                                      .initVirtualColumns(request.getUserFields())
                                      .fields(Arrays.asList(request.getTargetField()))
                                      .types("minmax")
                                      .filters(request.getAvailableFilters())
                                      .merge(true)
                                      .build();
        }
      } else {
        QueryHistoryTeller.setEngineQueryType(SEARCH); // for history

        query = SearchQuery.builder(request.getDataSource())
                           .initVirtualColumns(request.getUserFields())
                           .fields(Lists.newArrayList(request.getTargetField()))
                           .filters(request.getAvailableFilters())
                           .query(request.getSearchWord())
                           .sort(request.getSortBy())
                           .limit(request.getLimit())
                           .build();
      }
    }

    String queryString = GlobalObjectMapper.writeValueAsString(query);
    stopWatch.stop();
    LOGGER.debug("[{}] Query Generation Time : {}", CommonLocalVariable.getQueryId(), stopWatch.getLastTaskTimeMillis());

    QueryHistoryTeller.setEngineQuery(queryString); // for history
    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);

    stopWatch.start("Result Processing Time");
    Object result = request.makeResult(engineResult.get());
    stopWatch.stop();
    LOGGER.debug("[{}] Result Processing Time : {}", CommonLocalVariable.getQueryId(), stopWatch.getLastTaskTimeMillis());

    return result;
  }

  /**
   *
   * @param request
   * @return
   */
  @Override
  public Object summary(SummaryQueryRequest request) {

    QueryHistoryTeller.setEngineQueryType(SUMMARY);
    Query query = SummaryQuery.builder(request.getDataSource())
                              .initVirtualColumns(request.getUserFields())
                              .field(request.getFields())
                              .build();

    String queryString = GlobalObjectMapper.writeValueAsString(query);

    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    return engineRepository.query(queryString, String.class).get();

  }

  /**
   *
   * @param request
   * @return
   */
  @Override
  public Object covariance(CovarianceQueryRequest request) {

    QueryHistoryTeller.setEngineQueryType(COVARIANCE);
    Query query = CovarianceQuery.builder(request.getDataSource())
                                 .initVirtualColumns(request.getUserFields())
                                 .column(request.getFieldName())
                                 .build();

    String queryString = GlobalObjectMapper.writeValueAsString(query);

    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    Optional<String> engineResult = engineRepository.query(queryString, String.class);

    return engineResult.get();
  }

  /**
   * 데이터 소스간 유사도 체크
   */
  public Object similarity(SimilarityQueryRequest queryRequest) {

    QueryHistoryTeller.setEngineQueryType(SIMILARITY);
    UnionAllQuery query = UnionAllQuery.builder()
                                       .similarityQuery(queryRequest.getDataSources())
                                       .build();

    String queryString = GlobalObjectMapper.writeValueAsString(query);

    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);

    final List<SimilarityResponse> result = Lists.newArrayList();
    engineResult.ifPresent(jsonNode -> {
      if (!jsonNode.isArray()) {
        return;
      }
      jsonNode.forEach(node -> {
        // FIXME: 임시 조치임 엔진내 measure 항목 제외시 제거
        if (node.get("to").textValue().indexOf("count") > -1) {
          return;
        }
        result.add(new SimilarityResponse(node));
      });
    });

    return result;
  }

  public DataType guessTypeForExpr(DataQueryController.CheckExprRequest exprRequest) {

    List<UserDefinedField> userDefinedFields = exprRequest.getUserFields() == null ?
        Lists.newArrayList() : exprRequest.getUserFields();
    userDefinedFields.add(new ExpressionField(EXPR_TEMP_NAME, exprRequest.getExpr()));

    SelectMetaQuery query = new SelectMetaQueryBuilder(exprRequest.getDataSource())
        .initVirtualColumns(userDefinedFields)
        .fields(Lists.newArrayList(new DimensionField(EXPR_TEMP_NAME, UserDefinedField.REF_NAME)))
        .schemaOnly(true)
        .build();

    String queryString = GlobalObjectMapper.writeValueAsString(query);

    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    JsonNode result = engineRepository.query(queryString, JsonNode.class)
                                      .orElseGet(() -> GlobalObjectMapper.getDefaultMapper().createArrayNode());

    if (!result.isArray() && result.size() != 1) {
      return DataType.UNKNOWN;
    }

    return DataType.engineToFieldDataType(result.get(0).get("result").get("schema").get("columnTypes").get(0).textValue());
  }


  public SegmentMetaDataResponse segmentMetadata(String dataSourceName, AnalysisType... types) {
    Preconditions.checkNotNull(dataSourceName, "DataSource name required.");

    List<AnalysisType> analysisTypes;

    if (types == null || types.length == 0) {
      analysisTypes = Lists.newArrayList(CARDINALITY, INGESTED_NUMROW, SERIALIZED_SIZE, QUERYGRANULARITY);
    } else {
      analysisTypes = Lists.newArrayList(types);
    }

    SegmentMetaDataQuery query = new SegmentMetaDataQueryBuilder(new DefaultDataSource(dataSourceName))
        .types(analysisTypes)
        .merge(true)
        .build();

    String queryString = GlobalObjectMapper.writeValueAsString(query);
    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    String result = engineRepository.query(queryString, String.class).orElseThrow(
        () -> new ResourceNotFoundException(dataSourceName));

    List<SegmentMetaDataResponse> metaData = null;
    try {
      metaData = GlobalObjectMapper.getDefaultMapper().readValue(result, new TypeReference<List<SegmentMetaDataResponse>>() {});
    } catch (IOException e) {
      LOGGER.error("Result is not matched : {}", e.getMessage());
      throw new QueryTimeExcetpion("Result is not matched : " + e.getMessage());
    }

    if (CollectionUtils.isEmpty(metaData)) {
      throw new ResourceNotFoundException(dataSourceName);
    }

    return metaData.get(0);
  }

  public Map<String, Object> geoBoundary(String dataSourceName, List<Field> geoFields) {

    if (CollectionUtils.isEmpty(geoFields)) {
      return Maps.newHashMap();
    }

    // TODO: consider multiple geo column (later)
    Field geoField = geoFields.get(0);

    TimeseriesQuery timeseriesQuery = TimeseriesQuery.builder(new DefaultDataSource(dataSourceName))
                                                     .geoBoundary(geoField.getName(), geoField.getLogicalType().isShape())
                                                     .build();

    String queryString = GlobalObjectMapper.writeValueAsString(timeseriesQuery);
    LOGGER.info("[{}] Generated Druid Query : {}", CommonLocalVariable.getQueryId(), queryString);

    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);

    JsonNode node = new SearchQueryRequest().makeResult(engineResult.get());
    if (!node.isArray()) {
      return Maps.newHashMap();
    }

    return GlobalObjectMapper.getDefaultMapper().convertValue(node.get(0), Map.class);
  }
}
