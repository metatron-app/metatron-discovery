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

import com.google.common.base.Preconditions;
import com.google.common.util.concurrent.ThreadFactoryBuilder;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.quartz.CronScheduleBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.quartz.impl.triggers.CronTriggerImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeLinkDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeLinkSave;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

import javax.annotation.PostConstruct;

import app.metatron.discovery.domain.activities.ActivityStreamService;
import app.metatron.discovery.domain.activities.spec.ActivityGenerator;
import app.metatron.discovery.domain.activities.spec.ActivityObject;
import app.metatron.discovery.domain.activities.spec.ActivityStreamV2;
import app.metatron.discovery.domain.context.ContextService;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.RealtimeIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.job.IngestionJobRunner;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.EngineIngestionService;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataService;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE;
import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.IMPORT;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.JDBC;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.NONE;
import static app.metatron.discovery.domain.datasource.DataSource.Status.ENABLED;
import static app.metatron.discovery.domain.datasource.DataSource.Status.FAILED;
import static app.metatron.discovery.domain.datasource.DataSource.Status.PREPARING;

/**
 * Created by kyungtaak on 2016. 4. 1..
 */
@RepositoryEventHandler(DataSource.class)
public class DataSourceEventHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceEventHandler.class);

  @Autowired
  IngestionHistoryRepository ingestionHistoryRepository;

  @Autowired
  DruidEngineMetaRepository engineMetaRepository;

  @Autowired
  DataSourceService dataSourceService;

  @Autowired
  MetadataService metadataService;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  EngineIngestionService engineIngestionService;

  @Autowired
  IngestionJobRunner jobRunner;

  @Autowired
  ContextService contextService;

  @Autowired
  DataSourceSizeHistoryRepository dataSourceSizeHistoryRepository;

  @Autowired
  DataSourceQueryHistoryRepository dataSourceQueryHistoryRepository;

  @Autowired
  ActivityStreamService activityStreamService;

  @Autowired(required = false)
  Scheduler scheduler;


  @HandleBeforeCreate
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_DATASOURCE') or " +
      "hasPermission(#dataSource, 'PERM_SYSTEM_MANAGE_DATASOURCE')")
  public void checkCreateAuthority(DataSource dataSource) {

    // Owner 등록
    if (StringUtils.isEmpty(dataSource.getOwnerId())) {
      dataSource.setOwnerId(AuthUtils.getAuthUserName());
    }

    IngestionInfo ingestionInfo = dataSource.getIngestionInfo();
    if (ingestionInfo instanceof JdbcIngestionInfo) {
      DataConnection dataConnection = Preconditions.checkNotNull(dataSource.getConnection() == null ?
                                                                     ((JdbcIngestionInfo) ingestionInfo).getConnection()
                                                                     : dataSource.getConnection());
      //Batch Ingestion not allow Dialog type connection
      if (ingestionInfo instanceof BatchIngestionInfo) {
        Preconditions.checkArgument(
            dataConnection.getAuthenticationType() != DataConnection.AuthenticationType.DIALOG,
            "BatchIngestion not allowed DIALOG Authentication.");
      }

      //Dialog Authentication require connectionUsername, connectionPassword
      if (ingestionInfo instanceof JdbcIngestionInfo
          && dataConnection.getAuthenticationType() == DataConnection.AuthenticationType.DIALOG) {

        Preconditions.checkNotNull(((JdbcIngestionInfo) ingestionInfo).getConnectionUsername(),
                                   "Dialog Authentication require connectionUsername.");

        Preconditions.checkNotNull(((JdbcIngestionInfo) ingestionInfo).getConnectionPassword(),
                                   "Dialog Authentication require connectionPassword.");
      }
    }

    //partition range to map
    if (ingestionInfo instanceof HiveIngestionInfo) {
      List<String> partitionNameList = new ArrayList<>();
      for (Map<String, Object> partitionNameMap : ((HiveIngestionInfo) ingestionInfo).getPartitions()) {
        partitionNameList.addAll(PolarisUtils.mapWithRangeExpressionToList(partitionNameMap));
      }

      List<Map<String, Object>> partitionMapList = new ArrayList<>();
      for (String partitionName : partitionNameList) {
        partitionMapList.add(PolarisUtils.partitionStringToMap(partitionName));
      }
      ((HiveIngestionInfo) ingestionInfo).setPartitions(partitionMapList);
      dataSource.setIngestionInfo(ingestionInfo);
    }

    /*
      데이터 적재 관련
     */
    if (dataSource.getConnType() == ENGINE) {

      if (dataSource.getSrcType() == NONE || dataSource.getSrcType() == IMPORT) {
        if (StringUtils.isNotEmpty(dataSource.getEngineName())) {
          dataSource.setEngineName(dataSource.getName());
        }
      } else {
        // 엔진내 datasource 네임 충돌을 방지하기 위하여 추가로 생성
        dataSource.setEngineName(dataSourceService.convertName(dataSource.getName()));
        dataSource.setStatus(PREPARING);
        dataSource.setIncludeGeo(dataSource.existGeoField()); // mark datasource include geo column
        dataSourceRepository.saveAndFlush(dataSource);

        if (dataSource.getIngestionInfo() instanceof RealtimeIngestionInfo) {
          Optional<IngestionHistory> ingestionHistory = engineIngestionService.realtimeIngestion(dataSource);

          IngestionHistory resultHistory = null;
          if (ingestionHistory.isPresent()) {
            resultHistory = ingestionHistory.get();
            if (resultHistory.getStatus() != IngestionHistory.IngestionStatus.FAILED) {
              dataSource.setStatus(ENABLED);
            } else {
              dataSource.setStatus(FAILED);
            }
          } else {
            resultHistory = new IngestionHistory(dataSource.getId(),
                                                 IngestionHistory.IngestionMethod.SUPERVISOR,
                                                 IngestionHistory.IngestionStatus.FAILED,
                                                 "Ingestion History not fond");
          }
          ingestionHistoryRepository.saveAndFlush(resultHistory);
        } else {
          ThreadFactory factory = new ThreadFactoryBuilder()
              .setNameFormat("ingestion-" + dataSource.getId() + "-%s")
              .setDaemon(true)
              .build();
          ExecutorService service = Executors.newSingleThreadExecutor(factory);
          service.submit(() -> jobRunner.ingestion(dataSource));
        }
      }

    } else if (dataSource.getConnType() == LINK) {

      // 엔진내 datasource 네임 충돌을 방지하기 위하여 추가로 생성
      dataSource.setEngineName(dataSourceService.convertName(dataSource.getName()));

      LinkIngestionInfo ingestion = (LinkIngestionInfo) dataSource.getIngestionInfo();

      Preconditions.checkNotNull(dataSource.getConnection() == null ?
                                     ingestion.getConnection() : dataSource.getConnection(),
                                 "Connection info. required");

      dataSource.setStatus(DataSource.Status.ENABLED);
    }
  }

  @HandleAfterCreate
  public void handleDataSourceAfterCreate(DataSource dataSource) {

    // IngestionHistory 가 존재하면 저장 수행
    IngestionHistory history = dataSource.getHistory();
    if (history != null) {
      history.setDataSourceId(dataSource.getId());
      ingestionHistoryRepository.save(history);
    }

    // save context from domain
    contextService.saveContextFromDomain(dataSource);

    if (dataSource.getConnType() == LINK) {
      // create metadata
      metadataService.saveFromDataSource(dataSource);
    }

    // 수집 경로가 아닌 경우 Pass
    if (dataSource.getIngestion() == null) {
      return;
    }

    IngestionInfo info = dataSource.getIngestionInfo();
    if (scheduler != null && info instanceof BatchIngestionInfo) {
      // 초기 Ingestion 결과 확인
      JobKey jobKey = new JobKey("incremental-ingestion", "ingestion");
      TriggerKey triggerKey = new TriggerKey(dataSource.getId(), "ingestion");

      JobDataMap map = new JobDataMap();
      map.put("dataSourceId", dataSource.getId());

      // @formatter:of
      Trigger trigger = TriggerBuilder
          .newTrigger()
          .withIdentity(triggerKey)
          .forJob(jobKey)
          .usingJobData(map)
          .withSchedule(CronScheduleBuilder
                            .cronSchedule(((BatchIngestionInfo) info).getPeriod().getCronExpr())
                            .withMisfireHandlingInstructionDoNothing())
          .build();
      // @formatter:on

      try {
        scheduler.scheduleJob(trigger);
      } catch (SchedulerException e) {
        LOGGER.warn("Fail to register batch ingestion : {}", e.getMessage());
      }
      LOGGER.info("Successfully register batch ingestion : {}", dataSource.getName());
    }

  }

  @HandleBeforeSave
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_DATASOURCE')")
  public void handleBeforeSave(DataSource dataSource) {
    // Context 정보 저장
    contextService.saveContextFromDomain(dataSource);
  }

  @HandleBeforeLinkSave
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_DATASOURCE')")
  public void handleBeforeLinkSave(DataSource dataSource, Object linked) {

    // Count connected workspaces.
    // a value is injected to linked object when PATCH,
    // but not injected when PUT request so doesn't check linked object.
    if (BooleanUtils.isNotTrue(dataSource.getPublished())) {
      dataSource.setLinkedWorkspaces(dataSource.getWorkspaces().size());

      // Insert ActivityStream for saving grant history.
      if(!CollectionUtils.sizeIsEmpty(linked) && CollectionUtils.get(linked, 0) instanceof Workspace) {
        for (int i = 0; i < CollectionUtils.size(linked); i++) {
          Workspace linkedWorkspace = (Workspace) CollectionUtils.get(linked, i);
          if (!linkedWorkspace.getDataSources().contains(dataSource)) {
            activityStreamService.addActivity(new ActivityStreamV2(
                null, null, "Accept", null, null
                , new ActivityObject(dataSource.getId(),"DATASOURCE")
                , new ActivityObject(linkedWorkspace.getId(), "WORKSPACE"),
                new ActivityGenerator("WEBAPP",""), DateTime.now()));

            LOGGER.debug("[Activity] Accept workspace ({}) to datasource ({})", linkedWorkspace.getId(), dataSource.getId());
          }
        }
      }
    }
  }

  @HandleAfterSave
  public void handleDataSourceAfterSave(DataSource dataSource) {

    // 배치 수집 경로가 아닌 경우 Pass
    if (dataSource.getConnType() == ENGINE && dataSource.getIngestion() != null) {

      IngestionInfo ingestionInfo = dataSource.getIngestionInfo();

      if (ingestionInfo == null) {
        // 기존 동작하고 있는 적재 task 가 존재하는지 확인후 Cancel
        List<IngestionHistory> ingestionHistories = ingestionHistoryRepository
            .findByDataSourceIdAndStatus(dataSource.getId(), IngestionHistory.IngestionStatus.RUNNING);

        if (CollectionUtils.isNotEmpty(ingestionHistories)) {
          for (IngestionHistory ingestionHistory : ingestionHistories) {
            engineIngestionService.shutDownIngestionTask(ingestionHistory);
          }
        }

        // 기존 Trigger 가 동작하고 있다면 종료
        if (scheduler != null) {
          TriggerKey triggerKey = new TriggerKey(dataSource.getId(), "ingestion");
          try {
            scheduler.unscheduleJob(triggerKey);
            LOGGER.info("Successfully unscheduled cron job for datasource({})", dataSource.getId());
          } catch (SchedulerException e) {
            LOGGER.warn("Fail to pause trigger : {} ", e.getMessage());
          }
        }

      } else if (ingestionInfo instanceof BatchIngestionInfo) {

        BatchIngestionInfo batchIngestionInfo = (BatchIngestionInfo) dataSource.getIngestionInfo();

        TriggerKey triggerKey = new TriggerKey(dataSource.getId(), "ingestion");
        CronTriggerImpl trigger;
        try {
          trigger = (CronTriggerImpl) scheduler.getTrigger(triggerKey);
        } catch (Exception e) {
          LOGGER.warn("Fail to get Trigger object : {} ", e.getMessage());
          return;
        }

        // 기존 Sheduling 정책과 비교후 변경 가능
        String cronExpr = trigger.getCronExpression();
        String afterCronExpr = batchIngestionInfo.getPeriod().getCronExpr();
        if (!cronExpr.equals(afterCronExpr)) {
          try {
            trigger.setCronExpression(afterCronExpr);
            scheduler.rescheduleJob(triggerKey, trigger);

            LOGGER.info("Successfully rescheduled cron job for datasource({}) : '{}' to '{}'",
                        dataSource.getId(), cronExpr, afterCronExpr);

          } catch (Exception e) {
            LOGGER.warn("Fail to get Trigger object : {} ", e.getMessage());
            return;
          }
        }
      } else if (ingestionInfo instanceof RealtimeIngestionInfo) {
        // TODO: 기존 동작하고 있는 적재 task 가 존재하는지 확인 (재정의 필요)
      }
    }

    // update metadata from datasource
    metadataService.updateFromDataSource(dataSource, false);
  }

  @HandleBeforeDelete
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_DATASOURCE')")
  public void handleBeforeDelete(DataSource dataSource) {
    // Context 정보 삭제
    contextService.removeContextFromDomain(dataSource);
  }

  @HandleBeforeLinkDelete
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_DATASOURCE')")
  public void handleBeforeLinkDelete(DataSource dataSource, Object linked) {
    // Count connected workspaces.
    Set<Workspace> preWorkspaces = dataSourceRepository.findWorkspacesInDataSource(dataSource.getId());
    // Not a public workspace and linked entity type is Workspace.
    if (BooleanUtils.isNotTrue(dataSource.getPublished()) &&
        !CollectionUtils.sizeIsEmpty(preWorkspaces)) {
      dataSource.setLinkedWorkspaces(dataSource.getWorkspaces().size());
      LOGGER.debug("DELETED: Set linked workspace in datasource({}) : {}", dataSource.getId(), dataSource.getLinkedWorkspaces());

      for (Workspace workspace : preWorkspaces) {
        if(!dataSource.getWorkspaces().contains(workspace)) {
          activityStreamService.addActivity(new ActivityStreamV2(
              null, null, "Block", null, null,
              new ActivityObject(dataSource.getId(), "DATASOURCE"),
              new ActivityObject(workspace.getId(), "WORKSPACE"),
              new ActivityGenerator("WEBAPP", ""), DateTime.now()));

          LOGGER.debug("[Activity] Block workspace ({}) from datasource ({})", workspace.getId(), dataSource.getId());
        }
      }
    }

  }

  @HandleAfterDelete
  public void handleDataSourceAfterDelete(DataSource dataSource) {

    if (dataSource.getConnType() == ENGINE) {

      // Batch 적재용 Trigger 종료
      if (dataSource.getSrcType() == JDBC
          && dataSource.getIngestionInfo() instanceof BatchIngestionInfo) {

        TriggerKey triggerKey = new TriggerKey(dataSource.getId(), "ingestion");
        try {
          scheduler.unscheduleJob(triggerKey);
          LOGGER.info("Successfully unscheduled cron job for datasource({})", dataSource.getId());
        } catch (SchedulerException e) {
          LOGGER.warn("Fail to pause trigger : {} ", e.getMessage());
        }
      }

      // Shutdown Ingestion Task
      engineIngestionService.shutDownIngestionTask(dataSource.getId());
      LOGGER.debug("Successfully shutdown ingestion tasks in datasource ({})", dataSource.getId());

      // Disable DataSource
      try {
        engineMetaRepository.disableDataSource(dataSource.getEngineName());
        LOGGER.info("Successfully disabled datasource({})", dataSource.getId());
      } catch (Exception e) {
        LOGGER.warn("Fail to disable datasource({}) : {} ", dataSource.getId(), e.getMessage());
      }

      // Delete Related Histories
      try {
        // Delete Ingestion History
        ingestionHistoryRepository.deteleHistoryByDataSourceId(dataSource.getId());

        // Delete Size history and Query history
        dataSourceSizeHistoryRepository.deleteHistoryById(dataSource.getId());
        dataSourceQueryHistoryRepository.deleteQueryHistoryById(dataSource.getId());
      } catch (Exception e) {
        LOGGER.warn("Fail to remove history related datasource({}) : {} ", dataSource.getId(), e.getMessage());
      }

      // Delete Metadata
      try{
        Optional<Metadata> metadata = metadataService.findByDataSource(dataSource.getId());
        if(metadata.isPresent()){
          metadataService.delete(metadata.get().getId());
        }
      } catch (Exception e){
        LOGGER.warn("Fail to remove metadata related datasource({}) : {} ", dataSource.getId(), e.getMessage());
      }
    }

  }

  @PostConstruct
  void setGlobalSecurityContext() {
    SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
  }

}
