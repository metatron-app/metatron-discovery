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

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.util.concurrent.ThreadFactoryBuilder;

import com.univocity.parsers.common.TextParsingException;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.MultiLineString;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.io.WKTReader;
import org.quartz.CronExpression;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.stream.Collectors;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.common.MetatronProperties;
import app.metatron.discovery.common.criteria.ListCriterion;
import app.metatron.discovery.common.criteria.ListFilter;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.data.DataSourceValidator;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.datasource.data.result.ObjectResultFormat;
import app.metatron.discovery.domain.datasource.format.DateTimeFormatChecker;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOption;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOptionProjections;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOptionService;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.job.IngestionJobRunner;
import app.metatron.discovery.domain.engine.EngineIngestionService;
import app.metatron.discovery.domain.engine.EngineLoadService;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;
import app.metatron.discovery.domain.mdm.MetadataService;
import app.metatron.discovery.domain.workbench.WorkbenchProperties;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.util.CommonsCsvProcessor;
import app.metatron.discovery.util.ExcelProcessor;
import app.metatron.discovery.util.PolarisUtils;
import app.metatron.discovery.util.ProjectionUtils;

import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_COMMON_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_ENGINE_GET_TASK_LOG_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceTemporary.ID_PREFIX;

/**
 *
 */
@RepositoryRestController
public class DataSourceController {

  private static Logger LOGGER = LoggerFactory.getLogger(DataSourceController.class);

  @Autowired
  DataSourceService dataSourceService;

  @Autowired
  MetadataService metadataService;

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  @Autowired
  EngineLoadService engineLoadService;

  @Autowired
  EngineIngestionService engineIngestionService;

  @Autowired
  EngineQueryService engineQueryService;

  @Autowired
  IngestionOptionService ingestionOptionService;

  @Autowired
  DataSourceValidator dataSourceValidator;

  @Autowired
  IngestionJobRunner jobRunner;

  @Autowired
  IngestionHistoryRepository ingestionHistoryRepository;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataSourceTemporaryRepository temporaryRepository;

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  DateTimeFormatChecker dateTimeFormatChecker;

  @Autowired
  WorkbenchProperties workbenchProperties;

  @Autowired
  MetatronProperties metatronProperties;

  DataSourceProjections dataSourceProjections = new DataSourceProjections();

  public DataSourceController() {
  }

  /**
   * 저장된 Linked 데이터 소스 정보를 기반으로 임시 데이터 소스를 생성합니다
   *
   * @param filters 지정된 Essential Filter 정보
   * @param async   비동기 처리 여부
   */
  @RequestMapping(value = "/datasources/{dataSourceId}/temporary", method = RequestMethod.POST)
  public ResponseEntity<?> createDataSourceTemporary(@PathVariable("dataSourceId") String dataSourceId,
                                                     @RequestBody(required = false) List<Filter> filters,
                                                     @RequestParam(value = "async", required = false) boolean async) {

    DataSource dataSource = dataSourceRepository.findByIdIncludeConnection(dataSourceId);
    if (dataSource == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    if (dataSource.getConnType() != DataSource.ConnectionType.LINK) {
      throw new BadRequestException("Invalid connection type. Only use 'LINK' type.");
    }

    // filter 정보를 통해 기존에 생성한 임시 데이터 소스가 있는지 확인
    List<DataSourceTemporary> temporaries = dataSourceService.getMatchedTemporaries(dataSourceId, filters);

    String tempoaryId = null;
    if (CollectionUtils.isNotEmpty(temporaries)) {
      DataSourceTemporary temporary = temporaries.get(0);
      LOGGER.info("Already created temporary datasource : {}", temporary.getName());
      if (temporary.getStatus() == DataSourceTemporary.LoadStatus.ENABLE) {
        // Expired Time 재조정 후 정보 리턴
        temporary.setNextExpireTime(DateTime.now().plusSeconds(temporary.getExpired()));
        temporaryRepository.save(temporary);

        return ResponseEntity.ok(temporary);

      } else if (temporary.getStatus() == DataSourceTemporary.LoadStatus.PREPARING) {
        // 진행상황에 대한 정보를 전달 후 리턴
        Map<String, Object> responseMap = Maps.newHashMap();
        responseMap.put("id", temporary.getId());
        responseMap.put("progressTopic", String.format(EngineLoadService.TOPIC_LOAD_PROGRESS, temporary.getId()));

        return ResponseEntity.ok(responseMap);

      } else if (temporary.getStatus() == DataSourceTemporary.LoadStatus.DISABLE) {
        // Reload 프로세스
        tempoaryId = temporary.getId();
      }
    }

    return handleTemporaryDatasource(dataSource, tempoaryId, filters, async);
  }

  /**
   * 지정된 데이터 소스 정보를 가지고 임시 데이터 소스를 생성합니다. (WorkBench 에서 활용)
   */
  @RequestMapping(value = "/datasources/temporary", method = RequestMethod.POST)
  public ResponseEntity<?> createDataSourceTemporary(@RequestBody Resource<DataSource> dataSourceResource,
                                                     @RequestParam(value = "async", required = false) boolean async) {

    DataSource dataSource = dataSourceResource.getContent();

    Preconditions.checkNotNull(dataSource.getIngestionInfo(),
                               "Required ingestion information.");

    String csvBaseDir = workbenchProperties.getTempCSVPath();
    if (!csvBaseDir.endsWith(File.separator)) {
      csvBaseDir = csvBaseDir + File.separator;
    }

    LocalFileIngestionInfo ingestionInfo = (LocalFileIngestionInfo) dataSource.getIngestionInfo();
    ingestionInfo.setPath(csvBaseDir + ingestionInfo.getPath());

    return handleTemporaryDatasource(dataSource, null, null, async);
  }

  /**
   * Link 데이터 소스 정보를 통해 생성된 임시 데이터 소스 목록 조회
   */
  @RequestMapping(value = "/datasources/{dataSourceId}/temporaries/{temporaryId}/reload", method = RequestMethod.POST)
  public ResponseEntity<?> reloadTemporaryDataSources(@PathVariable("dataSourceId") String dataSourceId,
                                                      @PathVariable("temporaryId") String temporaryId,
                                                      @RequestParam(value = "async", required = false) boolean async) {

    DataSource dataSource = dataSourceRepository.findOne(dataSourceId);
    if (dataSource == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    if (dataSource.getConnType() != DataSource.ConnectionType.LINK) {
      throw new BadRequestException("Invalid connection type. Only use 'LINK' type.");
    }

    DataSourceTemporary temporary = temporaryRepository.findOne(temporaryId);
    if (temporary == null || dataSourceId.equals(temporary.getDataSourceId())) {
      throw new ResourceNotFoundException(temporaryId);
    }

    return handleTemporaryDatasource(dataSource, temporary.getId(), temporary.getFilterList(), async);
  }

  /**
   * 임시 데이터 소스 생성 합니다.
   */
  private ResponseEntity<?> handleTemporaryDatasource(DataSource dataSource, String temporaryId, List<Filter> filters, boolean async) {
    // Generate Temporary ID
    final String tempTargetId = StringUtils.isNotEmpty(temporaryId) ?
        temporaryId : PolarisUtils.randomUUID(ID_PREFIX, false);

    if (async) {
      LOGGER.debug("Start async process : {}", temporaryId);
      ThreadFactory factory = new ThreadFactoryBuilder()
          .setNameFormat("BulkLoad-" + temporaryId + "-%s")
          .setDaemon(true)
          .build();

      // FIXME: 전용 Thread Pool 로 변경하는 것을 검토해보자!
      ExecutorService service = Executors.newSingleThreadExecutor(factory);
      service.submit(() ->
                         engineLoadService.load(dataSource, filters, async, tempTargetId)
      );

      Map<String, Object> responseMap = Maps.newHashMap();
      responseMap.put("id", tempTargetId);
      responseMap.put("progressTopic", String.format(EngineLoadService.TOPIC_LOAD_PROGRESS, tempTargetId));

      return ResponseEntity.created(URI.create("")).body(responseMap);
    } else {
      return ResponseEntity.created(URI.create(""))
                           .body(engineLoadService.load(dataSource, filters, async, tempTargetId));
    }
  }

  /**
   * 데이터 소스의 상세정보를 가져옵니다. 임시 데이터 소스가 존재할 경우
   */
  @Transactional(readOnly = true)
  @RequestMapping(value = "/datasources/{dataSourceId}", method = RequestMethod.GET)
  public ResponseEntity<?> findDataSources(@PathVariable("dataSourceId") String dataSourceId,
                                           @RequestParam(value = "includeUnloadedField", required = false) Boolean includeUnloadedField,
                                           PersistentEntityResourceAssembler resourceAssembler) {

    DataSource resultDataSource = dataSourceService.findDataSourceIncludeTemporary(dataSourceId, includeUnloadedField);

    return ResponseEntity.ok(resourceAssembler.toResource(resultDataSource));
  }

  @Transactional(readOnly = true)
  @RequestMapping(value = "/datasources/{ids}/multiple", method = RequestMethod.GET)
  public ResponseEntity<?> findMultipleDataSources(@PathVariable("ids") List<String> ids,
                                                   @RequestParam(value = "includeUnloadedField", required = false) Boolean includeUnloadedField,
                                                   @RequestParam(value = "projection", required = false, defaultValue = "default") String projection) {

    List results = dataSourceService.findMultipleDataSourceIncludeTemporary(ids, includeUnloadedField);

    return ResponseEntity.ok(ProjectionUtils.toListResource(projectionFactory,
                                                            dataSourceProjections.getProjectionByName(projection),
                                                            results));
  }

  /**
   * Link 데이터 소스 정보를 통해 생성된 임시 데이터 소스 목록 조회
   */
  @RequestMapping(value = "/datasources/{dataSourceId}/temporaries", method = RequestMethod.GET)
  public ResponseEntity<?> findTemporaryDataSources(@PathVariable("dataSourceId") String dataSourceId) {

    DataSource dataSource = dataSourceRepository.findOne(dataSourceId);
    if (dataSource == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    if (dataSource.getConnType() != DataSource.ConnectionType.LINK) {
      throw new BadRequestException("Invalid connection type. Only use 'LINK' type.");
    }

    return ResponseEntity.ok(engineLoadService.findTemporaryByDataSources(dataSourceId));
  }


  /**
   * 데이터 소스 목록을 조회합니다.
   *
   * @param type       DataSourceType
   * @param connection ConnectionType
   * @param source     SourceType
   * @param status     Status
   */
  @RequestMapping(value = "/datasources", method = RequestMethod.GET)
  public ResponseEntity<?> findDataSources(@RequestParam(value = "dsType", required = false) String type,
                                           @RequestParam(value = "connType", required = false) String connection,
                                           @RequestParam(value = "srcType", required = false) String source,
                                           @RequestParam(value = "status", required = false) String status,
                                           @RequestParam(value = "published", required = false) Boolean published,
                                           @RequestParam(value = "nameContains", required = false) String nameContains,
                                           @RequestParam(value = "linkedMetadata", required = false) Boolean linkedMetadata,
                                           @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                           @RequestParam(value = "from", required = false)
                                           @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                           @RequestParam(value = "to", required = false)
                                           @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                           Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    // Validate DataSourceType
    DataSource.DataSourceType dataSourceType = SearchParamValidator
        .enumUpperValue(DataSource.DataSourceType.class, type, "dsType");

    // Validate ConnectionType
    DataSource.ConnectionType connectionType = SearchParamValidator
        .enumUpperValue(DataSource.ConnectionType.class, connection, "connType");

    // Validate SourceType
    DataSource.SourceType sourceType = SearchParamValidator
        .enumUpperValue(DataSource.SourceType.class, source, "srcType");

    // Validate status
    DataSource.Status statusType = SearchParamValidator
        .enumUpperValue(DataSource.Status.class, status, "status");

    // Validate searchByTime
    SearchParamValidator.range(searchDateBy, from, to);

    // Get Predicate
    //    Predicate searchPredicated = DataSourcePredicate
    //        .searchList(dataSourceType, connectionType, sourceType, statusType,
    //                    published, nameContains, searchDateBy, from, to);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "createdTime", "name"));
    }

    // Find by predicated
    // Page<DataSource> dataSources = dataSourceRepository.findAll(searchPredicated, pageable);
    Page<DataSource> dataSources = dataSourceRepository.findDataSources(dataSourceType, connectionType, sourceType, statusType,
                                                                        published, nameContains, linkedMetadata, searchDateBy, from, to, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(dataSources, resourceAssembler));
  }

  /**
   * 데이터 소스내 데이터 질의 수행, NoteBook 모듈내에서 주로 수행
   */
  @RequestMapping(path = "/datasources/{id}/data", method = RequestMethod.POST)
  public @ResponseBody
  ResponseEntity<?> getDataFromDatasource(@PathVariable("id") String id,
                                          @RequestParam(value = "limit", required = false) Integer limit,
                                          @RequestBody(required = false) SearchQueryRequest request) {

    DataSource dataSource = dataSourceRepository.findOne(id);
    if (dataSource == null) {
      throw new ResourceNotFoundException(id);
    }

    if (request == null) {
      request = new SearchQueryRequest();
    }

    DefaultDataSource defaultDataSource = new DefaultDataSource(dataSource.getEngineName());
    defaultDataSource.setMetaDataSource(dataSource);

    if (request.getResultFormat() == null) {
      ObjectResultFormat resultFormat = new ObjectResultFormat();
      resultFormat.setRequest(request);
      request.setResultFormat(resultFormat);
    }
    request.setDataSource(defaultDataSource);

    if (CollectionUtils.isEmpty(request.getProjections())) {
      request.setProjections(new ArrayList<>());
    }

    // 데이터 Limit 처리 최대 백만건까지 확인 가능함
    if (request.getLimits() == null) {
      if (limit == null) {
        limit = 1000;
      } else if (limit > 1000000) {
        limit = 1000000;
      }
      request.setLimits(new Limit(limit));
    }

    return ResponseEntity.ok(engineQueryService.search(request));
  }

  /**
   * 데이터 소스내 데이터 추가
   */
  @RequestMapping(path = "/datasources/{id}/data", method = {RequestMethod.PATCH, RequestMethod.PUT})
  public @ResponseBody
  ResponseEntity<?> appendDataSource(
      @PathVariable("id") String id,
      @RequestParam(value = "once", required = false) Boolean singleMode,
      @RequestBody IngestionInfo ingestionInfo) {

    DataSource dataSource = dataSourceRepository.findOne(id);
    if (dataSource == null) {
      throw new ResourceNotFoundException(id);
    }

    // TODO: 기존 적재 작업과 비교하여 제한이 필요한 경우 제한 필요
    dataSource.setIngestionInfo(ingestionInfo);

    // 기존 진행중인 적재 작업 ShutDown
    if (BooleanUtils.isTrue(singleMode)) {
      engineIngestionService.shutDownIngestionTask(dataSource.getId());
    }

    ThreadFactory factory = new ThreadFactoryBuilder()
        .setNameFormat("ingestion-append-" + dataSource.getId() + "-%s")
        .setDaemon(true)
        .build();
    ExecutorService service = Executors.newSingleThreadExecutor(factory);
    service.submit(() -> jobRunner.ingestion(dataSource));

    return ResponseEntity.noContent().build();

  }


  /**
   * 데이터 소스내 필드 정보를 수정합니다.
   */
  @RequestMapping(path = "/datasources/{id}/fields", method = RequestMethod.PATCH)
  public @ResponseBody
  ResponseEntity<?> patchFieldsInDataSource(
      @PathVariable("id") String id, @RequestBody List<CollectionPatch> patches) {

    DataSource dataSource = dataSourceRepository.findOne(id);
    if (dataSource == null) {
      throw new ResourceNotFoundException(id);
    }

    Map<Long, Field> fieldMap = dataSource.getFieldMap();
    for (CollectionPatch patch : patches) {
      Long fieldId = patch.getLongValue("id");
      switch (patch.getOp()) {
        case ADD:
          dataSource.getFields().add(new Field(patch));
          LOGGER.debug("Add field in datasource({})", dataSource.getId());
          break;
        case REPLACE:
          if (fieldMap.containsKey(fieldId)) {
            Field field = fieldMap.get(fieldId);
            field.updateField(patch);
            LOGGER.debug("Updated field in datasource({}) : {}", dataSource.getId(), fieldId);
          }
          break;
        case REMOVE:
          if (fieldMap.containsKey(fieldId)) {
            dataSource.getFields().remove(fieldMap.get(fieldId));
            LOGGER.debug("Deleted field in datasource({}) : {}", dataSource.getId(), fieldId);
          }
          break;
        default:
          break;
      }
    }

    dataSourceRepository.saveAndFlush(dataSource);
    metadataService.updateFromDataSource(dataSource, true);

    return ResponseEntity.noContent().build();
  }

  /**
   * Engine Datasource에는 존재하지만 Metatron Datasource 필드에 존재하지 않는 값을 동기화 하여 추가합니다.
   */
  @RequestMapping(path = "/datasources/{id}/fields/sync", method = RequestMethod.PATCH)
  public ResponseEntity<?> synchronizeFieldsInDataSource(@PathVariable("id") final String id) {
    final DataSource dataSource = dataSourceRepository.findOne(id);
    if (dataSource == null) {
      throw new ResourceNotFoundException(id);
    }

    List<Field> candidateFields = getCandidateFieldsFromEngine(dataSource.getEngineName());
    dataSource.synchronizeFields(candidateFields);
    dataSourceRepository.save(dataSource);

    return ResponseEntity.noContent().build();
  }

  private List<Field> getCandidateFieldsFromEngine(String engineName) {
    SegmentMetaDataResponse segmentMetaData = engineQueryService.segmentMetadata(engineName);

    if (segmentMetaData == null || segmentMetaData.getColumns() == null) {
      return new ArrayList<>();
    } else {
      return segmentMetaData.getColumns().entrySet().stream()
                            .filter(entry -> ((entry.getKey().equals("__time") || entry.getKey().equals("count")) == false))
                            .map(entry -> {
                              SegmentMetaDataResponse.ColumnInfo value = entry.getValue();

                              Field field = new Field();
                              field.setName(entry.getKey());
                              field.setType(value.getType().startsWith("dimension.") ? DataType.STRING : DataType.INTEGER);
                              field.setRole(value.getType().startsWith("dimension.") ? Field.FieldRole.DIMENSION : Field.FieldRole.MEASURE);

                              return field;
                            })
                            .collect(Collectors.toList());
    }
  }

  /**
   * metatron 을 통해서가 아닌 기존에 엔진에 적재된 데이터 소스를 등록 합니다.
   */
  @RequestMapping(value = "/datasources/import/{engineSourceName}", method = RequestMethod.POST)
  public ResponseEntity<?> importEngineDataSources(@PathVariable("engineSourceName") String engineName,
                                                   @RequestBody(required = false) DataSource dataSource) {

    DataSource importedDataSource = dataSourceService
        .importEngineDataSource(engineName, dataSource == null ? new DataSource() : dataSource);

    return ResponseEntity.created(URI.create("")).body(importedDataSource);
  }

  /**
   * 엔진 내에서 등록되지 않은 데이터 소스 목록 전달
   */
  @RequestMapping(value = "/datasources/import/datasources", method = RequestMethod.GET)
  public ResponseEntity<?> importAvailableEngineDataSources() {

    return ResponseEntity.ok(dataSourceService.findImportAvailableEngineDataSource());
  }

  /**
   * 엔진에 적재된 데이터 소스의 스키마 정보를 확인합니다.
   */
  @RequestMapping(value = "/datasources/import/{engineSourceName}/preview", method = RequestMethod.GET)
  public ResponseEntity<?> findEngineDataSourcesInfo(@PathVariable("engineSourceName") String engineName,
                                                     @RequestParam(value = "withData", required = false) boolean withData,
                                                     @RequestParam(value = "limit", required = false) Integer limit) {

    Map<String, Object> resultMap = Maps.newLinkedHashMap();

    SegmentMetaDataResponse segmentMetaData = engineQueryService.segmentMetadata(engineName);
    List<Field> convertedField = segmentMetaData.getConvertedField(null);
    segmentMetaData.setFields(convertedField);

    resultMap.put("meta", segmentMetaData);

    if (withData) {
      if (limit == null || limit < 0) {
        limit = 100;
      }
      SearchQueryRequest queryRequest = new SearchQueryRequest();
      DefaultDataSource dataSource = new DefaultDataSource(engineName);
      dataSource.setMetaDataSource(new DataSource("Raw Data",
                                                  convertedField.toArray(new Field[segmentMetaData.getFields().size()])));

      queryRequest.setDataSource(dataSource);
      queryRequest.setLimits(new Limit(limit));
      queryRequest.setResultFormat(new ObjectResultFormat(DataSource.ConnectionType.ENGINE));

      resultMap.put("data", engineQueryService.preview(queryRequest));
    }

    return ResponseEntity.ok(resultMap);
  }

  /**
   * Get list of ingestion history by status
   */
  @RequestMapping(value = {"/datasources/{id}/ingestion/histories", "/datasources/{id}/histories"},
      method = RequestMethod.GET)
  public ResponseEntity<?> findIngestionHistorys(@PathVariable("id") String dataSourceId,
                                                 @RequestParam(name = "status", required = false) String status,
                                                 Pageable pageable) {

    IngestionHistory.IngestionStatus ingestionStatus = SearchParamValidator.enumUpperValue(
        IngestionHistory.IngestionStatus.class, status, "status");

    if (dataSourceRepository.findOne(dataSourceId) == null) {
      return ResponseEntity.notFound().build();
    }

    Page<IngestionHistory> results;
    if (ingestionStatus == null) {
      results = ingestionHistoryRepository.findByDataSourceIdOrderByModifiedTimeDesc(dataSourceId, pageable);
    } else {
      results = ingestionHistoryRepository.findByDataSourceIdAndStatusOrderByModifiedTimeDesc(dataSourceId, ingestionStatus, pageable);
    }

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(results));
  }

  /**
   * Get ingestion history
   */
  @RequestMapping(value = "/datasources/{dataSourceId}/histories/{historyId}", method = RequestMethod.GET)
  public ResponseEntity<?> findIngestionHistory(@PathVariable("dataSourceId") String dataSourceId,
                                                @PathVariable("historyId") Long historyId) {

    if (dataSourceRepository.findOne(dataSourceId) == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    IngestionHistory history = ingestionHistoryRepository.findOne(historyId);
    if (history == null) {
      throw new ResourceNotFoundException(historyId);
    }

    return ResponseEntity.ok(history);
  }

  /**
   * Get ingestion log (= engine task log)
   */
  @RequestMapping(value = "/datasources/{dataSourceId}/histories/{historyId}/log", method = RequestMethod.GET)
  public ResponseEntity<?> findIngestionHistoryLog(@PathVariable("dataSourceId") String dataSourceId,
                                                   @PathVariable("historyId") Long historyId,
                                                   @RequestParam(value = "offset", required = false) Integer offset) {

    if (dataSourceRepository.findOne(dataSourceId) == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    IngestionHistory history = ingestionHistoryRepository.findOne(historyId);
    if (history == null) {
      throw new ResourceNotFoundException(historyId);
    }

    String taskId = history.getIngestionId();

    EngineIngestionService.EngineTaskLog taskLog;
    try {
      taskLog = engineIngestionService.getIngestionTaskLog(taskId, offset);
    } catch (MetatronException e) {
      throw new DataSourceIngestionException(INGESTION_ENGINE_GET_TASK_LOG_ERROR, "Task log on engine not founded", e);
    } catch (Exception e) {
      throw new DataSourceIngestionException(INGESTION_COMMON_ERROR, e);
    }

    return ResponseEntity.ok(taskLog);
  }

  /**
   * Stop ingestion task
   */
  @RequestMapping(value = "/datasources/{dataSourceId}/histories/{historyId}/stop", method = RequestMethod.POST)
  public ResponseEntity<?> stopIngestionJob(@PathVariable("dataSourceId") String dataSourceId,
                                            @PathVariable("historyId") Long historyId) {

    if (dataSourceRepository.findOne(dataSourceId) == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    IngestionHistory history = ingestionHistoryRepository.findOne(historyId);
    if (history == null) {
      throw new ResourceNotFoundException(historyId);
    }

    boolean result = engineIngestionService.shutDownIngestionTask(history);
    Map<String, Object> results = Maps.newLinkedHashMap();
    results.put("result", result);

    return ResponseEntity.ok(results);
  }

  /**
   * Reset (real time) ingestion task
   */
  @RequestMapping(value = "/datasources/{dataSourceId}/histories/{historyId}/reset", method = RequestMethod.POST)
  public ResponseEntity<?> resetRealTimeIngestionJob(@PathVariable("dataSourceId") String dataSourceId,
                                                     @PathVariable("historyId") Long historyId) {

    if (dataSourceRepository.findOne(dataSourceId) == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    IngestionHistory history = ingestionHistoryRepository.findOne(historyId);
    if (history == null) {
      throw new ResourceNotFoundException(historyId);
    }

    boolean result = engineIngestionService.resetRealTimeIngestionTask(history);
    Map<String, Object> results = Maps.newLinkedHashMap();
    results.put("result", result);

    return ResponseEntity.ok(results);
  }

  /**
   * Get list fo option for datasource ingestion
   */
  @RequestMapping(value = "/datasources/ingestion/options", method = RequestMethod.GET)
  public ResponseEntity<?> findIngestionOptions(@RequestParam(value = "type", required = false) String type,
                                                @RequestParam(value = "ingestionType", required = false) String ingestionType) {

    // Validate type
    IngestionOption.OptionType optionEnumType = SearchParamValidator
        .enumUpperValue(IngestionOption.OptionType.class, type, "type");

    // Validate ingestionType
    IngestionOption.IngestionType ingestionEnumType = SearchParamValidator
        .enumUpperValue(IngestionOption.IngestionType.class, ingestionType, "ingestionType");

    List resultOptions = ingestionOptionService.findIngestionOptions(optionEnumType, ingestionEnumType);

    return ResponseEntity.ok(ProjectionUtils.toListResource(projectionFactory,
                                                            IngestionOptionProjections.DefaultProjection.class,
                                                            resultOptions));
  }


  /**
   * datetime 포맷 유효성을 체크합니다.
   */
  @RequestMapping(value = "/datasources/validation/datetime", method = RequestMethod.POST)
  public ResponseEntity<?> checkDateTimeFormat(@RequestBody TimeFormatCheckRequest request) {

    if (StringUtils.isEmpty(request.getFormat())) {
      return ResponseEntity.ok(new TimeFormatCheckResponse(dateTimeFormatChecker.findPattern(request)));
    } else {
      return ResponseEntity.ok(new TimeFormatCheckResponse(dateTimeFormatChecker.checkTimeFormat(request)));
    }

  }

  /**
   * Cron 표현식의 유효성을 체크합니다
   */
  @RequestMapping(value = "/datasources/validation/cron", method = RequestMethod.POST)
  public ResponseEntity<?> checkCronExpression(@RequestParam String expr,
                                               @RequestParam(value = "timeZone", required = false, defaultValue = "UTC") String timeZone,
                                               @RequestParam(value = "count", required = false, defaultValue = "5") int count) {

    CronExpression cronExpression = null;
    try {
      cronExpression = new CronExpression(expr);
    } catch (ParseException e) {
      return ResponseEntity.ok(new CronValidationResponse(false, e.getMessage()));
    }

    DateTimeZone zone = DateTimeZone.forID(timeZone);

    cronExpression.setTimeZone(zone.toTimeZone());
    LOGGER.debug("Timezone summary : {}", cronExpression.getExpressionSummary());

    List<String> afterTimes = Lists.newArrayList();
    DateTime time = DateTime.now();
    for (int i = 0; i < count; i++) {
      time = new DateTime(cronExpression.getNextValidTimeAfter(time.toDate()));
      afterTimes.add(time.withZone(zone).toString());
    }

    return ResponseEntity.ok(new CronValidationResponse(true, afterTimes));
  }

  /**
   * Cron 표현식의 유효성을 체크합니다
   */
  @RequestMapping(value = "/datasources/validation/wkt", method = RequestMethod.POST)
  public ResponseEntity<?> checkWktType(@RequestBody WktCheckRequest wktCheckRequest) {

    LogicalType type = wktCheckRequest.getGeoType();

    WKTReader wktReader = new WKTReader();
    Geometry geometry = null;

    boolean valid = true;
    String message = null;
    LogicalType suggestType = null;
    for (String value : wktCheckRequest.getValues()) {
      try {
        geometry = wktReader.read(value);

        LogicalType parsedType = findGeoType(geometry).orElseThrow(
            () -> new RuntimeException("ERROR_NOT_SUPPORT_WKT_TYPE")
        );

        if (type != parsedType) {
          suggestType = parsedType;
          throw new RuntimeException("ERROR_NOT_MATCHED_WKT_TYPE");
        }

      } catch (org.locationtech.jts.io.ParseException e) {
        LOGGER.debug("WKT Parse error ({}), Invalid WKT String : {}", e.getMessage(), value);
        valid = false;
        message = "ERROR_PARSE_WKT";
        break;
      } catch (Exception ex) {
        LOGGER.debug("WKT validation error ({}), Invalid WKT String : {}", ex.getMessage(), value);
        valid = false;
        message = ex.getMessage();
        break;
      }
    }

    Map<String, Object> resultResponse = Maps.newLinkedHashMap();
    resultResponse.put("valid", valid);
    resultResponse.put("suggestType", suggestType);
    resultResponse.put("message", message);

    return ResponseEntity.ok(resultResponse);
  }

  private Optional<LogicalType> findGeoType(Geometry geometry) {

    Class<? extends Geometry> c = geometry.getClass();
    LogicalType logicalType = null;
    if (c.equals(Point.class)) {
      logicalType = LogicalType.GEO_POINT;
    } else if (c.equals(LineString.class)) {
      logicalType = LogicalType.GEO_LINE;
    } else if (c.equals(Polygon.class)) {
      logicalType = LogicalType.GEO_POLYGON;
    } else if (c.equals(MultiLineString.class)) {
      logicalType = LogicalType.GEO_LINE;
    } else if (c.equals(MultiPolygon.class)) {
      logicalType = LogicalType.GEO_POLYGON;
    }

    return Optional.ofNullable(logicalType);
  }

  @RequestMapping(value = "/datasources/duration/{duration}", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> test(@PathVariable("duration") Long duration) {

    CommonLocalVariable.setQueryId("test-query");
    try {
      Thread.sleep(duration * 1000L);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

    return ResponseEntity.ok(duration + " OK!");

  }

  /**
   * 엑셀파일 업로드
   *
   * @return 업로드 성공여부, 파일키, sheet 이름목록
   */
  @RequestMapping(value = "/datasources/file/upload", method = RequestMethod.POST, produces = "application/json")
  public
  @ResponseBody
  ResponseEntity<?> uploadFileForIngestion(@RequestParam("file") MultipartFile file) {

    // 파일명 가져오기
    String fileName = file.getOriginalFilename();

    // 파일명을 통해 확장자 정보 얻기
    String extensionType = FilenameUtils.getExtension(fileName).toLowerCase();

    if (StringUtils.isEmpty(extensionType) || !extensionType.matches("xlsx|xls|csv")) {
      throw new BadRequestException("Not supported file type : " + extensionType);
    }

    // Upload 파일 처리
    String tempFileName = "TEMP_FILE_" + UUID.randomUUID().toString() + "." + extensionType;
    String tempFilePath = System.getProperty("java.io.tmpdir") + File.separator + tempFileName;

    Map<String, Object> responseMap = Maps.newHashMap();
    responseMap.put("filekey", tempFileName);
    responseMap.put("filePath", tempFilePath);

    try {
      File tempFile = new File(tempFilePath);
      file.transferTo(tempFile);

      if ("xlsx".equals(extensionType) || "xls".equals(extensionType)) {
        responseMap.put("sheets", new ExcelProcessor(tempFile).getSheetNames());
      }
    } catch (IOException e) {
      LOGGER.error("Failed to upload file : {}", e.getMessage());
      throw new DataSourceIngestionException("Fail to upload file.", e.getCause());
    }

    return ResponseEntity.ok(responseMap);
  }

  /**
   * 업로드한 파일 Sheet 내용 조회
   */
  @RequestMapping(value = "/datasources/file/{fileKey}/data", method = RequestMethod.GET, produces = "application/json")
  public @ResponseBody
  ResponseEntity<?> getPreviewFromFile(@PathVariable(value = "fileKey") String fileKey,
                                       @RequestParam(value = "sheet", required = false) String sheetName,
                                       @RequestParam(value = "lineSep", required = false, defaultValue = "\n") String lineSep,
                                       @RequestParam(value = "delimiter", required = false, defaultValue = ",") String delimiter,
                                       @RequestParam(value = "limit", required = false, defaultValue = "100") int limit,
                                       @RequestParam(value = "firstHeaderRow", required = false, defaultValue = "true") boolean firstHeaderRow) {

    IngestionDataResultResponse resultResponse = null;

    try {
      String filePath = System.getProperty("java.io.tmpdir") + File.separator + fileKey;
      File tempFile = new File(filePath);
      // 파일 확장자
      String extensionType = FilenameUtils.getExtension(fileKey);

      // 파일이 없을 경우
      if (!tempFile.exists()) {
        throw new BadRequestException("Invalid temporary file name.");
      }

      if ("xlsx".equals(extensionType) || "xls".equals(extensionType)) {
        resultResponse = new ExcelProcessor(tempFile).getSheetData(sheetName, limit, firstHeaderRow);
      } else if ("csv".equals(extensionType)) {
        CommonsCsvProcessor commonsCsvProcessor = new CommonsCsvProcessor("file://" + tempFile)
            .totalCount()
            .maxRowCount(Integer.valueOf(limit).longValue())
            .withHeader(firstHeaderRow)
            .parse(delimiter);

        resultResponse = commonsCsvProcessor.ingestionDataResultResponse();

        //        CsvProcessor csvProcessor = new CsvProcessor(tempFile);
        //        csvProcessor.setCsvMaxCharsPerColumn(metatronProperties.getCsvMaxCharsPerColumn());
        //        resultResponse = csvProcessor.getData(lineSep, delimiter, limit, firstHeaderRow);
      } else {
        throw new BadRequestException("Invalid temporary file.");
      }

    } catch (TextParsingException e) {
      LOGGER.error("Failed to parse csv file ({}) : {}", fileKey, e.getMessage());
      throw new DataSourceIngestionException("Fail to parse csv file. \n" +
                                                 "Line Index : " + e.getLineIndex() + ",\n" +
                                                 "Column Index : " + e.getColumnIndex() + ",\n" +
                                                 "Char Index : " + e.getCharIndex()
          , e.getCause());
    } catch (Exception e) {
      LOGGER.error("Failed to parse file ({}) : {}", fileKey, e.getMessage());
      throw new DataSourceIngestionException("Fail to parse file.", e.getCause());
    }

    return ResponseEntity.ok(resultResponse);
  }

  @RequestMapping(value = "/datasources/filter", method = RequestMethod.POST)
  public @ResponseBody
  ResponseEntity<?> filterDataSources(@RequestBody DataSourceFilterRequest request,
                                      Pageable pageable,
                                      PersistentEntityResourceAssembler resourceAssembler) {

    List<String> statuses = request == null ? null : request.getStatus();
    List<String> workspaces = request == null ? null : request.getWorkspace();
    List<String> createdBys = request == null ? null : request.getCreatedBy();
    List<String> userGroups = request == null ? null : request.getUserGroup();
    List<String> dataSourceTypes = request == null ? null : request.getDataSourceType();
    List<String> sourceTypes = request == null ? null : request.getSourceType();
    List<String> connectionTypes = request == null ? null : request.getConnectionType();
    DateTime createdTimeFrom = request == null ? null : request.getCreatedTimeFrom();
    DateTime createdTimeTo = request == null ? null : request.getCreatedTimeTo();
    DateTime modifiedTimeFrom = request == null ? null : request.getModifiedTimeFrom();
    DateTime modifiedTimeTo = request == null ? null : request.getModifiedTimeTo();
    String containsText = request == null ? null : request.getContainsText();
    List<Boolean> published = request == null ? null : request.getPublished();

    LOGGER.debug("Parameter (status) : {}", statuses);
    LOGGER.debug("Parameter (workspace) : {}", workspaces);
    LOGGER.debug("Parameter (createdBy) : {}", createdBys);
    LOGGER.debug("Parameter (userGroup) : {}", userGroups);
    LOGGER.debug("Parameter (dataSourceType) : {}", dataSourceTypes);
    LOGGER.debug("Parameter (sourceType) : {}", sourceTypes);
    LOGGER.debug("Parameter (connectionType) : {}", connectionTypes);
    LOGGER.debug("Parameter (createdTimeFrom) : {}", createdTimeFrom);
    LOGGER.debug("Parameter (createdTimeTo) : {}", createdTimeTo);
    LOGGER.debug("Parameter (modifiedTimeFrom) : {}", modifiedTimeFrom);
    LOGGER.debug("Parameter (modifiedTimeTo) : {}", modifiedTimeTo);
    LOGGER.debug("Parameter (containsText) : {}", containsText);
    LOGGER.debug("Parameter (published) : {}", published);


    // Validate status
    List<DataSource.Status> statusEnumList
        = request.getEnumList(statuses, DataSource.Status.class, "status");

    // Validate DataSourceType
    List<DataSource.DataSourceType> dataSourceTypeEnumList
        = request.getEnumList(dataSourceTypes, DataSource.DataSourceType.class, "dataSourceType");

    // Validate ConnectionType
    List<DataSource.ConnectionType> connectionTypeEnumList
        = request.getEnumList(connectionTypes, DataSource.ConnectionType.class, "connectionType");

    // Validate SourceType
    List<DataSource.SourceType> sourceTypeEnumList
        = request.getEnumList(sourceTypes, DataSource.SourceType.class, "sourceType");

    // Validate createdTimeFrom, createdTimeTo
    SearchParamValidator.range(null, createdTimeFrom, createdTimeTo);

    // Validate modifiedTimeFrom, modifiedTimeTo
    SearchParamValidator.range(null, modifiedTimeFrom, modifiedTimeTo);

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.DESC, "createdTime", "name"));
    }

    Page<DataSource> dataSources = dataSourceService.findDataSourceListByFilter(
        statusEnumList, workspaces, createdBys, userGroups, createdTimeFrom, createdTimeTo, modifiedTimeFrom,
        modifiedTimeTo, containsText, dataSourceTypeEnumList, sourceTypeEnumList, connectionTypeEnumList, published, pageable
    );

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(dataSources, resourceAssembler));
  }

  @RequestMapping(value = "/datasources/criteria", method = RequestMethod.GET)
  public ResponseEntity<?> getCriteria() {
    List<ListCriterion> listCriteria = dataSourceService.getListCriterion();
    List<ListFilter> defaultFilter = dataSourceService.getDefaultFilter();

    HashMap<String, Object> response = new HashMap<>();
    response.put("criteria", listCriteria);
    response.put("defaultFilters", defaultFilter);

    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/datasources/criteria/{criterionKey}", method = RequestMethod.GET)
  public ResponseEntity<?> getCriterionDetail(@PathVariable(value = "criterionKey") String criterionKey) {

    DataSourceListCriterionKey criterionKeyEnum = DataSourceListCriterionKey.valueOf(criterionKey);

    if (criterionKeyEnum == null) {
      throw new ResourceNotFoundException("Criterion(" + criterionKey + ") is not founded.");
    }

    ListCriterion criterion = dataSourceService.getListCriterionByKey(criterionKeyEnum);
    return ResponseEntity.ok(criterion);
  }

  class TimeFormatCheckResponse {

    Boolean valid;
    String pattern;

    public TimeFormatCheckResponse(Boolean valid) {
      this.valid = valid;
    }

    public TimeFormatCheckResponse(String pattern) {
      this.pattern = pattern;
    }

    public Boolean getValid() {
      return valid;
    }

    public void setValid(Boolean valid) {
      this.valid = valid;
    }

    public String getPattern() {
      return pattern;
    }

    public void setPattern(String pattern) {
      this.pattern = pattern;
    }
  }
}
