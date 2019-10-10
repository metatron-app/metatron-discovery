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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine.monitoring;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.common.criteria.ListCriterion;
import app.metatron.discovery.common.criteria.ListCriterionType;
import app.metatron.discovery.common.criteria.ListFilter;
import app.metatron.discovery.domain.datasource.data.result.ChartResultFormat;
import app.metatron.discovery.domain.datasource.data.result.ObjectResultFormat;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.DruidEngineRepository;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.query.druid.aggregations.LongSumAggregation;
import app.metatron.discovery.query.druid.filters.InFilter;
import app.metatron.discovery.query.druid.filters.SelectorFilter;
import app.metatron.discovery.query.druid.postaggregations.ArithmeticPostAggregation;
import app.metatron.discovery.query.druid.postaggregations.FieldAccessorPostAggregator;
import app.metatron.discovery.query.druid.queries.MonitoringQuery;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE;

@Component
public class EngineMonitoringService {

  private static final Logger LOGGER = LoggerFactory.getLogger(EngineMonitoringService.class);

  @Autowired
  DruidEngineRepository engineRepository;

  @Autowired
  DruidEngineMetaRepository engineMetaRepository;

  @Autowired
  EngineMonitoringProperties monitoringProperties;

  @Value("${polaris.engine.monitoring.emitter.datasource:druid-metric}")
  String datasourceName;

  public Object query(Object query) {
    EngineMonitoringRequest request = new EngineMonitoringRequest();
    request.setResultFormat(new ObjectResultFormat(ENGINE));

    String queryString = GlobalObjectMapper.writeValueAsString(query);
    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);
    Object result = request.getResultFormat()
                           .makeResult(
                               engineResult.orElseGet(
                                   () -> GlobalObjectMapper.getDefaultMapper().createArrayNode())
                           );
    if (result instanceof MatrixResponse && request.getResultFormat() instanceof ChartResultFormat) {
      MatrixResponse response = (MatrixResponse) result;
      return response;
    } else {
      return result;
    }

  }

  public Object search(EngineMonitoringRequest request) {

    List<Filter> filters = Lists.newArrayList();
    setFiltersByType(filters, request.getMonitoringTarget());

    List<Aggregation> aggregations = Lists.newArrayList();
    List<PostAggregation> postAggregations = Lists.newArrayList();
    aggregations.add(new LongSumAggregation("value", "value"));
    if (request.getMonitoringTarget().isIncludeCount()) {
      aggregations.add(new CountAggregation("count"));

      List<PostAggregation> fields = Lists.newArrayList();
      fields.add(new FieldAccessorPostAggregator("value", "value"));
      fields.add(new FieldAccessorPostAggregator("count", "count"));
      postAggregations.add(new ArithmeticPostAggregation("avg_value", ArithmeticPostAggregation.AggregationFunction.DIVISION, fields));
    }

    Pivot pivot = new Pivot();
    pivot.addColumn(new TimestampField("event_time", null, new CustomDateTimeFormat("yyyy-MM-dd HH:mm:ss.SSS")));


    pivot.addAggregation(new MeasureField("value", null, MeasureField.AggregationType.SUM));
    pivot.addAggregation(new DimensionField("metric"));

    request.setPivot(pivot);

    if (request.getResultFormat() == null) {
      request.setResultFormat(new ObjectResultFormat(ENGINE));
    } else {
      request.getResultFormat().setConnType(ENGINE);
    }

    Query query = MonitoringQuery.builder(new DefaultDataSource(datasourceName))
                           .filters(filters)
                           .granularity(request.getGranularity())
                           .aggregation(aggregations)
                           .postAggregation(postAggregations)
                           .format(request.getResultFormat())
                           .intervals(Lists.newArrayList(request.getFromDate(), request.getToDate()))
                           .build();

    String queryString = GlobalObjectMapper.writeValueAsString(query);

    Optional<JsonNode> engineResult = engineRepository.query(queryString, JsonNode.class);

    Object result = request.getResultFormat()
                           .makeResult(engineResult.orElseGet(
                               () -> GlobalObjectMapper.getDefaultMapper().createArrayNode()
                                       )
                           );

    return result;
  }

  public Object getEngineData(EngineMonitoringRequest queryRequest) {
    Object data = search(queryRequest);
    if (data instanceof MatrixResponse && queryRequest.getResultFormat() instanceof ChartResultFormat) {
      MatrixResponse response = (MatrixResponse) data;
      return response;
    } else {
      Map<String, Object> result = Maps.newHashMap();
      ArrayNode engineData = (ArrayNode) data;
      List<String> timeList = Lists.newArrayList();
      String metric;
      switch (queryRequest.getMonitoringTarget().getMetric()) {
        case GC_COUNT:
        case GC_CPU:
        case QUERY_TIME:
        case QUERY_COUNT:
        case SUPERVISOR_LAG:
          List<Long> valueList = Lists.newArrayList();
          List<Long> countList = Lists.newArrayList();
          List<Float> avgList = Lists.newArrayList();

          for (JsonNode rowNode : engineData) {
            Map<String, Object> row = GlobalObjectMapper.getDefaultMapper().convertValue(rowNode, Map.class);
            timeList.add(String.valueOf(row.get("event_time")));
            valueList.add(Long.parseLong(String.valueOf(row.get("value"))));
            if (queryRequest.getMonitoringTarget().isIncludeCount()) {
              countList.add(Long.parseLong(String.valueOf(row.get("count"))));
              avgList.add(Float.parseFloat(String.valueOf(row.get("avg_value"))));
            }
          }
          result.put("time", timeList);
          result.put("value", valueList);
          result.put("total_value", valueList.stream().mapToLong(Long::longValue).sum());
          if (queryRequest.getMonitoringTarget().isIncludeCount()) {
            result.put("count", countList);
            result.put("avg_value", avgList);
            result.put("total_count", countList.stream().mapToLong(Long::longValue).sum());
          }
          break;
        case MEM:
          List<Long> maxMemList = Lists.newArrayList();
          List<Long> usedMemList = Lists.newArrayList();

          for (JsonNode rowNode : engineData) {
            Map<String, Object> row = GlobalObjectMapper.getDefaultMapper().convertValue(rowNode, Map.class);
            timeList.add(String.valueOf(row.get("event_time")));
            metric = String.valueOf(row.get("metric"));
            if ("jvm/mem/max".equals(metric)) {
              maxMemList.add(Long.parseLong(String.valueOf(row.get("value"))));
            } else if ("jvm/mem/used".equals(metric)) {
              usedMemList.add(Long.parseLong(String.valueOf(row.get("value"))));
            }
          }

          result.put("maxMem", maxMemList);
          result.put("usedMem", usedMemList);
          break;
        case TASK_ROW:
          List<Long> processedList = Lists.newArrayList();
          List<Long> unparseableList = Lists.newArrayList();
          List<Long> thrownawayList = Lists.newArrayList();

          for (JsonNode rowNode : engineData) {
            Map<String, Object> row = GlobalObjectMapper.getDefaultMapper().convertValue(rowNode, Map.class);
            timeList.add(String.valueOf(row.get("event_time")));
            metric = String.valueOf(row.get("metric"));
            if ("ingest/events/processed".equals(metric)) {
              processedList.add(Long.parseLong(String.valueOf(row.get("value"))));
            } else if ("ingest/events/unparseable".equals(metric)) {
              unparseableList.add(Long.parseLong(String.valueOf(row.get("value"))));
            } else if ("ingest/events/thrownAway".equals(metric)) {
              thrownawayList.add(Long.parseLong(String.valueOf(row.get("value"))));
            }
          }

          result.put("processed", processedList);
          result.put("unparseable", unparseableList);
          result.put("thrownaway", thrownawayList);
          break;
        default:
          break;
      }
      return result;
    }
  }

  public List getMemory(EngineMonitoringRequest queryRequest) {
    if (queryRequest.getMonitoringTarget() == null) {
      queryRequest.setMonitoringTarget(new EngineMonitoringTarget());
    }
    EngineMonitoringTarget engineMonitoringTarget = queryRequest.getMonitoringTarget();
    engineMonitoringTarget.setIncludeCount(true);
    engineMonitoringTarget.setMetric(EngineMonitoringTarget.MetricType.MEM);
    queryRequest.setMonitoringTarget(engineMonitoringTarget);
    Map result = (Map) getEngineData(queryRequest);
    List usedMemList = (List) result.get("usedMem");
    List maxMemList = (List) result.get("maxMem");
    float useMem = new Float(String.valueOf(usedMemList.get(usedMemList.size()-1)));
    float maxMem = new Float(String.valueOf(maxMemList.get(maxMemList.size()-1)));

    float percentage = 100 * useMem / maxMem;
    List memList = Lists.newArrayList();
    Map<String, Object> useMemMap = Maps.newHashMap();
    useMemMap.put("name", "useMem");
    useMemMap.put("value", useMem);
    useMemMap.put("percentage", percentage);

    Map<String, Object> maxMemMap = Maps.newHashMap();
    maxMemMap.put("name", "maxMem");
    maxMemMap.put("value", maxMem);
    maxMemMap.put("percentage", 100 - percentage);

    memList.add(useMemMap);
    memList.add(maxMemMap);
    return memList;
  }

  public HashMap getConfigs(String configName) {
    Map<String, Object> paramMap = Maps.newHashMap();
    paramMap.put("configName", configName);
    Optional<HashMap> result = engineRepository.getConfigs(paramMap, HashMap.class);
    return result.orElse(Maps.newHashMap());
  }

  public Map getSize() {
    Optional<List> historicalNodes = engineRepository.getHistoricalNodes();
    long currSize = 0L;
    long maxSize = 0L;
    for (Object o : historicalNodes.get()) {
      Map<String, Object> k = (Map<String, Object>) o;
      currSize += Long.parseLong(String.valueOf(k.get("currSize")));
      maxSize += Long.parseLong(String.valueOf(k.get("maxSize")));
    }
    Map<String, Object> sizeMap = Maps.newHashMap();
    sizeMap.put("currSize", currSize);
    sizeMap.put("maxSize", maxSize);
    return sizeMap;
  }

  public List getDatasourceList() {
    Optional<List> results = engineRepository.sql("SELECT datasource FROM sys.segments GROUP BY 1");
    return results.get();
  }

  public List getSegmentCount() {
    Optional<List> results = engineRepository.sql("SELECT COUNT(*) as \"count\" FROM sys.segments");
    return results.get();
  }

  public List getPendingTasks() {
    Optional<List> tasks = engineRepository.getPendingTasks();
    return tasks.get();
  }

  public List getRunningTasks() {
    Optional<List> tasks = engineRepository.getRunningTasks();
    return tasks.get();
  }

  public List getWaitingTasks() {
    Optional<List> tasks = engineRepository.getWaitingTasks();
    return tasks.get();
  }

  public List getCompleteTasks() {
    Optional<List> tasks = engineRepository.getCompleteTasks();
    return tasks.get();
  }

  public List getTaskList() {
    Optional<List> results = engineRepository.sql("SELECT \"task_id\", \"type\", \"datasource\", \"created_time\", CASE WHEN \"status\" = 'RUNNING' THEN \"runner_status\" ELSE \"status\" END AS \"status\", CASE WHEN \"status\" = 'RUNNING' THEN (CASE WHEN \"runner_status\" = 'RUNNING' THEN 4 WHEN \"runner_status\" = 'PENDING' THEN 3 ELSE 2 END) ELSE 1 END AS \"rank\", \"location\", \"duration\", \"error_msg\" FROM sys.tasks ORDER BY \"rank\" DESC, \"created_time\" DESC");
    return results.get();
  }

  public Object getTaskById(String taskId) {
    Optional<List> results = engineRepository.sql("SELECT \"task_id\", \"type\", \"datasource\", \"created_time\", \"queue_insertion_time\", \"location\", \"host\", CASE WHEN \"status\" = 'RUNNING' THEN \"runner_status\" ELSE \"status\" END AS \"status\", \"location\", \"duration\", \"error_msg\" FROM sys.tasks WHERE \"task_id\" = '" + taskId + "'");
    if (CollectionUtils.isNotEmpty(results.get())) {
      return results.get().get(0);
    } else {
      return null;
    }
  }

  public boolean shutDownIngestionTask(String taskId) {
    try {
        engineMetaRepository.shutDownIngestionTask(taskId);
      LOGGER.info("Successfully shutdown ingestion task : {}", taskId);
    } catch (Exception e) {
      LOGGER.warn("Fail to shutdown ingestion task : {}", taskId);
      return false;
    }

    return true;
  }

  public List getSupervisorList() {
    Optional<List> tasks = engineRepository.getSupervisorList();
    return tasks.get();
  }

  public Map getSupervisorStatus(String supervisorId){
    Optional<Map> result = engineMetaRepository.getSupervisorIngestionStatus(supervisorId);
    return result.get();
  }

  public boolean shutDownSupervisor(String supervisorId) {
    try {
      engineMetaRepository.shutDownSupervisorIngestionTask(supervisorId);
      LOGGER.info("Successfully shutdown supervisor : {}", supervisorId);
    } catch (Exception e) {
      LOGGER.warn("Fail to shutdown supervisor : {}", supervisorId);
      return false;
    }

    return true;
  }

  public boolean resetSupervisor(String supervisorId) {
    try {
      engineMetaRepository.resetSupervisorIngestionTask(supervisorId);
      LOGGER.info("Successfully reset supervisor : {}", supervisorId);
    } catch (Exception e) {
      LOGGER.warn("Fail to reset supervisor : {}", supervisorId);
      return false;
    }

    return true;
  }

  public List<ListCriterion> getListCriterionInTask() {

    List<ListCriterion> criteria = new ArrayList<>();

    //Status
    criteria.add(new ListCriterion(EngineMonitoringCriterionKey.TASK_STATUS,
                                   ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.status"));

    //Duration
    /*ListCriterion durationCriterion
        = new ListCriterion(EngineMonitoringCriterionKey.DURATION,
                            ListCriterionType.RANGE_DATETIME, "msg.engine.monitoring.ui.criterion.duration");
    durationCriterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.DURATION,
                                               "durationFrom", "durationTo", "", "",
                                               "msg.engine.monotoring.ui.criterion.duration"));
    criteria.add(durationCriterion);*/

    //Type
    criteria.add(new ListCriterion(EngineMonitoringCriterionKey.TYPE,
                                   ListCriterionType.CHECKBOX, "msg.engine.monitoring.ui.criterion.type"));

    //CreatedTime
    ListCriterion createdTimeCriterion
        = new ListCriterion(EngineMonitoringCriterionKey.CREATED_TIME,
                            ListCriterionType.RANGE_DATETIME, "msg.storage.ui.criterion.created-time");
    createdTimeCriterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.CREATED_TIME,
                                                  "createdTimeFrom", "createdTimeTo", "", "",
                                                  "msg.storage.ui.criterion.created-time"));
    criteria.add(createdTimeCriterion);

    return criteria;
  }

  public ListCriterion getListCriterionInTaskByKey(EngineMonitoringCriterionKey criterionKey) {
    ListCriterion criterion = new ListCriterion();
    criterion.setCriterionKey(criterionKey);

    switch (criterionKey) {
      case TASK_STATUS:
        EngineMonitoring.TaskStatus[] statuses = {
            EngineMonitoring.TaskStatus.PENDING,
            EngineMonitoring.TaskStatus.WAITING,
            EngineMonitoring.TaskStatus.RUNNING,
            EngineMonitoring.TaskStatus.SUCCESS,
            EngineMonitoring.TaskStatus.FAILED
        };
        for (EngineMonitoring.TaskStatus status : statuses) {
          String filterName = status.toString();
          criterion.addFilter(new ListFilter(criterionKey, "taskStatus", status.toString(), filterName));
        }
        break;
      case DURATION:
        criterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.DURATION,
                                           "durationFrom", "durationTo", "", "",
                                           "msg.engine.monitoring.ui.criterion.duration"));
        break;
      case TYPE:
        EngineMonitoring.TaskType[] taskTypes = {
            EngineMonitoring.TaskType.INDEX,
            EngineMonitoring.TaskType.KAFKA,
            EngineMonitoring.TaskType.HADOOP
        };

        for (EngineMonitoring.TaskType taskType : taskTypes) {
          String filterName = taskType.toString();
          criterion.addFilter(new ListFilter(criterionKey, "taskType",
                                             taskType.toString(), filterName));
        }
        break;
      case CREATED_TIME:
        //created_time
        criterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.CREATED_TIME,
                                           "createdTimeFrom", "createdTimeTo", "", "",
                                           "msg.storage.ui.criterion.created-time"));
        break;
      default:
        break;
    }

    return criterion;
  }

  public List<ListCriterion> getListCriterionInWorker() {

    List<ListCriterion> criteria = new ArrayList<>();

    //Capacity
    /*ListCriterion capacityCriterion
        = new ListCriterion(EngineMonitoringCriterionKey.CAPACITY,
                            ListCriterionType.RANGE_DATETIME, "msg.engine.monitoring.ui.criterion.used-capacity");
    capacityCriterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.CAPACITY,
                                                  "capacityFrom", "capacityTo", "", "",
                                                  "msg.engine.monitoring.ui.criterion.used-capacity"));
    criteria.add(capacityCriterion);*/

    //Version
    /*ListCriterion versionCriterion
        = new ListCriterion(EngineMonitoringCriterionKey.VERSION,
                            ListCriterionType.RANGE_DATETIME, "msg.engine.monitoring.ui.criterion.version");
    versionCriterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.VERSION,
                                                  "versionFrom", "versionTo", "", "",
                                                  "msg.engine.monitoring.ui.criterion.version"));
    criteria.add(versionCriterion);*/

    //CreatedTime
    ListCriterion createdTimeCriterion
        = new ListCriterion(EngineMonitoringCriterionKey.COMPLETED_TIME,
                            ListCriterionType.RANGE_DATETIME, "msg.engine.monitoring.ui.criterion.completed-time");
    createdTimeCriterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.COMPLETED_TIME,
                                                  "completedTimeFrom", "completedTimeTo", "", "",
                                                  "msg.storage.ui.criterion.completed-time"));
    criteria.add(createdTimeCriterion);

    return criteria;
  }

  public ListCriterion getListCriterionInWorkerByKey(EngineMonitoringCriterionKey criterionKey) {
    ListCriterion criterion = new ListCriterion();
    criterion.setCriterionKey(criterionKey);

    switch (criterionKey) {
      case CAPACITY:
        criterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.CAPACITY,
                                           "capacityFrom", "capacityTo", "", "",
                                           "msg.engine.monitoring.ui.criterion.used-capacity"));
        break;
      case VERSION:
        criterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.VERSION,
                                           "versionFrom", "versionTo", "", "",
                                           "msg.engine.monitoring.ui.criterion.version"));
        break;
      case COMPLETED_TIME:
        criterion.addFilter(new ListFilter(EngineMonitoringCriterionKey.COMPLETED_TIME,
                                           "completedTimeFrom", "completedTimeTo", "", "",
                                           "msg.engine.monitoring.ui.criterion.completed-time"));
        break;
      default:
        break;
    }

    return criterion;
  }

  private void setFiltersByType(List<Filter> filters, EngineMonitoringTarget monitoringTarget) {
    if ( monitoringTarget.getHost() != null ) {
      filters.add(new SelectorFilter("host", monitoringTarget.getHost()));
    }

    if ( monitoringTarget.getService() != null ) {
      filters.add(new SelectorFilter("service", monitoringTarget.getService()));
    }

    if ( monitoringTarget.getTaskId() != null ) {
      filters.add(new SelectorFilter("taskId", monitoringTarget.getTaskId()));
    }

    switch (monitoringTarget.getMetric()) {
      case GC_COUNT:
        filters.add(new SelectorFilter("metric", "jvm/gc/count"));
        break;
      case GC_CPU:
        filters.add(new SelectorFilter("metric", "jvm/gc/cpu"));
        break;
      case MEM:
        filters.add(new InFilter("metric", "jvm/mem/max", "jvm/mem/used"));
        break;
      case QUERY_TIME:
        filters.add(new SelectorFilter("metric", "query/time"));
        break;
      case QUERY_COUNT:
        filters.add(new SelectorFilter("metric", "query/time"));
        filters.add(new SelectorFilter("service", "druid/prod/broker"));
        break;
      case SUPERVISOR_LAG:
        filters.add(new SelectorFilter("metric", "ingest/kafka/lag"));
        break;
      case TASK_ROW:
        filters.add(new InFilter("metric", "ingest/events/processed", "ingest/events/unparseable", "ingest/events/thrownAway"));
        break;
      default:
        break;
    }
  }

}
