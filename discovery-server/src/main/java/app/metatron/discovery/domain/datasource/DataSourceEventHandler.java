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

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

import app.metatron.discovery.domain.context.ContextService;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.DataConnectionRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.RealtimeIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.job.IngestionJobRunner;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.EngineIngestionService;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.util.AuthUtils;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE;
import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.IMPORT;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.JDBC;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.NONE;
import static app.metatron.discovery.domain.datasource.DataSource.Status.PREPARING;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.FAILED;

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
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  EngineIngestionService engineIngestionService;

  @Autowired
  IngestionJobRunner jobRunner;

  @Autowired
  ContextService contextService;

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
    if(ingestionInfo instanceof JdbcIngestionInfo){
      DataConnection jdbcConnection = Preconditions.checkNotNull(dataSource.getConnection() == null ?
              ((JdbcIngestionInfo) ingestionInfo).getConnection() : dataSource.getConnection());

      //Batch Ingestion not allow Dialog type connection
      if(ingestionInfo instanceof BatchIngestionInfo){
        Preconditions.checkArgument(
                jdbcConnection.getAuthenticationType() != DataConnection.AuthenticationType.DIALOG,
                "BatchIngestion not allowed DIALOG Authentication.");
      }

      //Dialog Authentication require connectionUsername, connectionPassword
      if(ingestionInfo instanceof JdbcIngestionInfo
              && jdbcConnection.getAuthenticationType() == DataConnection.AuthenticationType.DIALOG){

        Preconditions.checkNotNull(((JdbcIngestionInfo) ingestionInfo).getConnectionUsername(),
                "Dialog Authentication require connectionUsername.");

        Preconditions.checkNotNull(((JdbcIngestionInfo) ingestionInfo).getConnectionPassword(),
                "Dialog Authentication require connectionPassword.");
      }
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

        if(dataSource.getIngestionInfo() instanceof LocalFileIngestionInfo
            || dataSource.getIngestionInfo() instanceof JdbcIngestionInfo) {
          dataSource.setStatus(PREPARING);
          dataSourceRepository.saveAndFlush(dataSource);

          ThreadFactory factory = new ThreadFactoryBuilder()
              .setNameFormat("ingestion-" + dataSource.getId() + "-%s")
              .setDaemon(true)
              .build();
          ExecutorService service = Executors.newSingleThreadExecutor(factory);
          service.submit(() -> jobRunner.ingestion(dataSource));
        } else {
          initEngineIngestion(dataSource);
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

    // IngestionHistoy 가 존재하면 저장 수행
    IngestionHistory histroy = dataSource.getHistory();
    if (histroy != null) {
      histroy.setDataSourceId(dataSource.getId());
      ingestionHistoryRepository.save(histroy);
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

    // Context 정보 저장, ID 가 지정후 생성 필요
    contextService.saveContextFromDomain(dataSource);

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

    // 연결된 워크스페이스 개수 처리,
    // PATCH 일경우 linked 객체에 값이 주입되나 PUT 인경우 값이 주입되지 않아
    // linked 객체 체크를 수행하지 않음
    if (BooleanUtils.isNotTrue(dataSource.getPublished())) {
      dataSource.setLinkedWorkspaces(dataSource.getWorkspaces().size());
      LOGGER.debug("UPDATED: Set linked workspace in datasource({}) : {}", dataSource.getId(), dataSource.getLinkedWorkspaces());
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
            engineIngestionService.shutDownIngestionTask(dataSource.getName(), ingestionHistory.getIngestionId());
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
        // 기존 동작하고 있는 적재 task 가 존재하는지 확인 (재정의 필요)
//        List<IngestionHistory> ingestionHistories = ingestionHistoryRepository
//            .findByDataSourceIdAndStatus(dataSource.getId(), IngestionHistory.IngestionStatus.RUNNING);
//
//        if (CollectionUtils.isNotEmpty(ingestionHistories)) {
//          // TODO: Excetpion 정의
//          throw new RuntimeException("Ingestion task already exist.");
//        }
//
//        engineIngestionService.realtimeIngestion(dataSource).ifPresent(
//            ingestionHistroy -> ingestionHistoryRepository.save(ingestionHistroy)
//        );
      }
    }
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

    // 연결된 워크스페이스 개수 처리,
    // 전체 공개 워크스페이스가 아니고 linked 내 Entity 타입이 Workspace 인 경우
    if (BooleanUtils.isNotTrue(dataSource.getPublished()) &&
        !CollectionUtils.sizeIsEmpty(linked) &&
        CollectionUtils.get(linked, 0) instanceof Workspace) {
      dataSource.setLinkedWorkspaces(dataSource.getWorkspaces().size());
      LOGGER.debug("DELETED: Set linked workspace in datasource({}) : {}", dataSource.getId(), dataSource.getLinkedWorkspaces());
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

      // DataSource Disable
      try {
        engineMetaRepository.disableDataSource(dataSource.getEngineName());
        LOGGER.info("Successfully disabled datasource({})", dataSource.getId());
      } catch (Exception e) {
        LOGGER.warn("Fail to disable datasource({}) : {} ", dataSource.getId(), e.getMessage());
      }

      // Delete Ingestion History
      ingestionHistoryRepository.deteleHistoryByDataSourceId(dataSource.getId());
    }

  }

  private void initEngineIngestion(DataSource dataSource) {

    Optional<IngestionHistory> status = engineIngestionService.doIngestion(dataSource);

    // 적재 실패시 예외 처리 및 히스토리 저장
    if (!status.isPresent() || status.get().getStatus() == FAILED) {
      throw new DataSourceIngestionException("Fail to ingest engine. (TASK ID:" + status.get().getIngestionId() + ")");
    }

    // 트랜잭션 밖에서 처리하기 위해 데이터 소스내 객체에 저장
    dataSource.setHistory(status.get());

    // 데이터 소스 관련 상태 지정 (Preparing)
    dataSource.setStatus(PREPARING);

    LOGGER.info("Completed ingestion : {}", dataSource.getName());
  }
}
