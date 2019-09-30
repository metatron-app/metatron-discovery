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

import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.TriggerKey;
import org.quartz.impl.triggers.CronTriggerImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.criteria.ListCriterion;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.engine.DruidEngineRepository;
import app.metatron.discovery.domain.engine.EngineIngestionService;

import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_COMMON_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_ENGINE_GET_TASK_LOG_ERROR;

@Profile("scheduling")
@RestController
@RequestMapping("/api")
public class EngineMonitoringController {

  private static final Logger LOGGER = LoggerFactory.getLogger(EngineMonitoringController.class);

  @Autowired
  Scheduler scheduler;

  @Autowired
  EngineMonitoringService monitoringQueryService;

  @Autowired
  EngineMonitoringRepository monitoringRepository;

  @Autowired
  DruidEngineRepository engineRepository;

  @Autowired
  EngineIngestionService engineIngestionService;

  @Autowired
  ProjectionFactory projectionFactory;

  @RequestMapping(value = "/monitoring/test", method = RequestMethod.POST)
  public ResponseEntity<?> test(@RequestBody Object queryRequest) {

    Object result = monitoringQueryService.query(queryRequest);
    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/query", method = RequestMethod.POST)
  public ResponseEntity<?> monitoringQuery(@RequestBody EngineMonitoringRequest queryRequest) {

    Object result = monitoringQueryService.search(queryRequest);

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/data", method = RequestMethod.POST)
  public ResponseEntity<?> monitoringData(@RequestBody EngineMonitoringRequest queryRequest) {

    Object result = monitoringQueryService.getEngineData(queryRequest);

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/stream", method = RequestMethod.POST)
  public ResponseEntity<?> monitoringStream(@RequestBody EngineMonitoringRequest queryRequest) {

    Object result = monitoringQueryService.selectStreamQuery(queryRequest);

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/servers/health", method = RequestMethod.GET)
  public ResponseEntity<?> serverHealth() {
    List<Object[]> objects = monitoringRepository.findServerListByStatus();

    HashMap<String, String> result = new HashMap<>();

    for (Object[] row : objects) {
      if ( row.length == 3 ) {
        String type = (String) row[2];
        if ((Boolean) row[0]){
          result.put(type, "normal");
        } else if ((Boolean) row[1]){
          result.put(type, "warn");
        } else {
          result.put(type, "error");
        }
      }
    }

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/{group}/{name}/modify/{expression}", method = RequestMethod.POST, produces = "application/json")
  public ResponseEntity<?> findJob(@PathVariable("group") String group
      , @PathVariable("name") String name
      , @PathVariable("expression") String expression) throws SchedulerException, ParseException {

    TriggerKey triggerKey = new TriggerKey(name, group);
    CronTriggerImpl trigger = (CronTriggerImpl) scheduler.getTrigger(triggerKey);
    trigger.setCronExpression(expression);
    scheduler.rescheduleJob(triggerKey, trigger);

    return ResponseEntity.ok(scheduler);
  }

  @RequestMapping(value = "/monitoring/information/{name}", method = RequestMethod.GET)
  public ResponseEntity<?> getInformation(@PathVariable("name") String name) {
    Map<String, Object> result = Maps.newHashMap();
    List<EngineMonitoring> cluster = monitoringRepository.findByType(Lists.newArrayList("broker", "coordinator", "overlord"));
    result.put("cluster", cluster);

    HashMap configs = monitoringQueryService.getConfigs(name);
    result.put("configs", configs);
    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/monitoring/memory", method = RequestMethod.POST)
  public ResponseEntity<?> getMemory(@RequestBody EngineMonitoringRequest queryRequest) {
    return ResponseEntity.ok(monitoringQueryService.getMemory(queryRequest));
  }

  @RequestMapping(value = "/monitoring/size", method = RequestMethod.GET)
  public ResponseEntity<?> getSize() {
    return ResponseEntity.ok(monitoringQueryService.getSize());
  }

  @RequestMapping(value = "/monitoring/datasource/list", method = RequestMethod.GET)
  public ResponseEntity<?> getDatasourceList() {
    return ResponseEntity.ok(monitoringQueryService.getDatasourceList());
  }

  @RequestMapping(value= "/monitoring/ingestion/tasks/{status}", method = RequestMethod.GET)
  public ResponseEntity<?> getRunningTasks(@PathVariable("status") String status) {
    List list = Lists.newArrayList();
    if ("pending".equals(status)) {
      list = monitoringQueryService.getPendingTasks();
    } else if ("running".equals(status)) {
      list = monitoringQueryService.getRunningTasks();
    } else if ("waiting".equals(status)) {
      list = monitoringQueryService.getWaitingTasks();
    } else if ("complete".equals(status)) {
      list = monitoringQueryService.getCompleteTasks();
    }
    return ResponseEntity.ok(list);
  }

  @RequestMapping(value = "/monitoring/ingestion/tasks/criteria", method = RequestMethod.GET)
  public ResponseEntity<?> getCriteriaInTask() {
    List<ListCriterion> listCriteria = monitoringQueryService.getListCriterionInTask();

    HashMap<String, Object> response = new HashMap<>();
    response.put("criteria", listCriteria);

    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/monitoring/ingestion/tasks/criteria/{criterionKey}", method = RequestMethod.GET)
  public ResponseEntity<?> getCriterionDetailInTask(@PathVariable(value = "criterionKey") String criterionKey) {
    EngineMonitoringCriterionKey criterionKeyEnum = EngineMonitoringCriterionKey.valueOf(criterionKey);

    if (criterionKeyEnum == null) {
      throw new ResourceNotFoundException("Criterion(" + criterionKey + ") is not founded.");
    }

    ListCriterion criterion = monitoringQueryService.getListCriterionInTaskByKey(criterionKeyEnum);
    return ResponseEntity.ok(criterion);
  }

  @RequestMapping(value = "/monitoring/ingestion/tasks/list", method = RequestMethod.GET)
  public ResponseEntity<?> getTaskList() {
    return ResponseEntity.ok(monitoringQueryService.getTaskList());
  }

  @RequestMapping(value = "/monitoring/ingestion/task/{taskId:.+}", method = RequestMethod.GET)
  public ResponseEntity<?> getTaskById(@PathVariable String taskId) {
    return ResponseEntity.ok(monitoringQueryService.getTaskById(taskId));
  }

  @RequestMapping(value = "/monitoring/ingestion/task/{taskId}/log", method = RequestMethod.GET)
  public ResponseEntity<?> getTaskLogById(@PathVariable String taskId) {
    EngineIngestionService.EngineTaskLog taskLog;
    try {
      taskLog = engineIngestionService.getIngestionTaskLog(taskId, null);
    } catch (MetatronException e) {
      throw new DataSourceIngestionException(INGESTION_ENGINE_GET_TASK_LOG_ERROR, "Task log on engine not founded", e);
    } catch (Exception e) {
      throw new DataSourceIngestionException(INGESTION_COMMON_ERROR, e);
    }

    return ResponseEntity.ok(taskLog.getLogs());
  }

  @RequestMapping(value = "/monitoring/ingestion/task/{taskId}/shutdown", method = RequestMethod.POST)
  public ResponseEntity<?> shutDownTaskById(@PathVariable String taskId) {
    return ResponseEntity.ok(monitoringQueryService.shutDownIngestionTask(taskId));
  }

  @RequestMapping(value = "/monitoring/ingestion/supervisors/list", method = RequestMethod.GET)
  public ResponseEntity<?> getSupervisorList() {
    return ResponseEntity.ok(monitoringQueryService.getSupervisorList());
  }

  @RequestMapping(value = "/monitoring/ingestion/supervisor/{supervisorId:.+}", method = RequestMethod.GET)
  public ResponseEntity<?> getSupervisorStatus(@PathVariable String supervisorId) {
    return ResponseEntity.ok(monitoringQueryService.getSupervisorStatus(supervisorId));
  }

  @RequestMapping(value = "/monitoring/ingestion/supervisor/row", method = RequestMethod.POST)
  public ResponseEntity<?> getIngestRow(@RequestBody EngineMonitoringRequest queryRequest) {
    return ResponseEntity.ok(monitoringQueryService.getIngestRow(queryRequest));
  }

  @RequestMapping(value = "/monitoring/ingestion/supervisor/{supervisorId}/shutdown", method = RequestMethod.POST)
  public ResponseEntity<?> shutDownSupervisorById(@PathVariable String supervisorId) {
    return ResponseEntity.ok(monitoringQueryService.shutDownSupervisor(supervisorId));
  }

  @RequestMapping(value = "/monitoring/ingestion/supervisor/{supervisorId}/reset", method = RequestMethod.POST)
  public ResponseEntity<?> resetSupervisorById(@PathVariable String supervisorId) {
    return ResponseEntity.ok(monitoringQueryService.resetSupervisor(supervisorId));
  }

  @RequestMapping(value = "/monitoring/ingestion/workers/criteria", method = RequestMethod.GET)
  public ResponseEntity<?> getCriteriaInWorker() {
    List<ListCriterion> listCriteria = monitoringQueryService.getListCriterionInWorker();

    HashMap<String, Object> response = new HashMap<>();
    response.put("criteria", listCriteria);

    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/monitoring/ingestion/workers/criteria/{criterionKey}", method = RequestMethod.GET)
  public ResponseEntity<?> getCriterionDetailInWorker(@PathVariable(value = "criterionKey") String criterionKey) {
    EngineMonitoringCriterionKey criterionKeyEnum = EngineMonitoringCriterionKey.valueOf(criterionKey);

    if (criterionKeyEnum == null) {
      throw new ResourceNotFoundException("Criterion(" + criterionKey + ") is not founded.");
    }

    ListCriterion criterion = monitoringQueryService.getListCriterionInWorkerByKey(criterionKeyEnum);
    return ResponseEntity.ok(criterion);
  }

  @RequestMapping(value = "/monitoring/ingestion/workers/list", method = RequestMethod.GET)
  public ResponseEntity<?> getWorkerList() {
    return ResponseEntity.ok(engineRepository.getMiddleManagerNodes().get());
  }



}
