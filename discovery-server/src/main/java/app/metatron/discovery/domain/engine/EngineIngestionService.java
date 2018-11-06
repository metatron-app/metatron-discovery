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

import com.fasterxml.jackson.core.JsonProcessingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.fileloader.FileLoaderFactory;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOptionService;
import app.metatron.discovery.domain.datasource.ingestion.RealtimeIngestionInfo;
import app.metatron.discovery.domain.datasource.realtime.KafkaClient;
import app.metatron.discovery.domain.datasource.realtime.RealTimeProperties;
import app.metatron.discovery.domain.engine.model.IngestionStatusResponse;
import app.metatron.discovery.spec.druid.ingestion.KafkaRealTimeIndexBuilder;
import app.metatron.discovery.spec.druid.ingestion.SupervisorIndex;

import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.RUNNING;

/**
 *
 */
@Component
@Transactional(readOnly = true)
public class EngineIngestionService {

  private static final Logger LOGGER = LoggerFactory.getLogger(EngineIngestionService.class);

  private static final String DEFAULT_DEDICATED_WORKER = "localhost:8091";

  @Autowired
  FileLoaderFactory fileLoaderFactory;

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  @Autowired
  IngestionOptionService ingestionOptionService;

  @Autowired
  DruidEngineMetaRepository engineMetaRepository;

  @Autowired
  IngestionHistoryRepository ingestionHistoryRepository;

  @Autowired
  DruidEngineRepository engineRepository;

  @Autowired
  EngineProperties engineProperties;

  @Autowired(required = false)
  KafkaClient kafkaClient;

  @Autowired
  RealTimeProperties realTimeProperties;

  public EngineIngestionService() {
    // Empty Constructor
  }

  /**
   * 데이터 소스내 진행중인 적재 작업이 있다면 종료 시킵니다 엔진내 예외 발생시 로그로만 실패여부를 표시합니다
   */
  public void shutDownIngestionTask(String dataSourceId) {
    // Shutdown Ingestion Task
    List<IngestionHistory> ingestionHistories = ingestionHistoryRepository.findByDataSourceIdAndStatus(dataSourceId, RUNNING);
    for (IngestionHistory ingestionHistory : ingestionHistories) {
      try {
        if (ingestionHistory.getIngestionMethod() == IngestionHistory.IngestionMethod.SUPERVISOR) {
          engineMetaRepository.shutDownSupervisorIngestionTask(ingestionHistory.getIngestionId());
        } else {
          engineMetaRepository.shutDownIngestionTask(ingestionHistory.getIngestionId());
        }
        LOGGER.info("Successfully shutdown ingestion task : ({}) {}",
                    ingestionHistory.getIngestionMethod(),
                    ingestionHistory.getIngestionId());
      } catch (Exception e) {
        LOGGER.warn("Fail to shutdown ingestion task : ({}) {}",
                    ingestionHistory.getIngestionMethod(),
                    ingestionHistory.getIngestionId());
      }
    }
  }

  public void shutDownIngestionTask(String datasourceName, String taskId) {

    engineMetaRepository.shutDownIngestionTask(taskId);

    if (kafkaClient != null) {
      kafkaClient.destroyTopic(datasourceName);
    }
  }

  public IngestionStatusResponse doCheckResult(String ingestionId) {

    return engineMetaRepository.getIngestionStatus(ingestionId)
                               .orElse(IngestionStatusResponse.failedResponse(ingestionId));

  }

  public Optional<String> doSupervisorCheckResult(String ingestionId) {

    Optional<Map> result = engineMetaRepository.getSupervisorIngestionStatus(ingestionId);

    // 엔진상에서 처리방식에 대한 협의 필요
    String status = "FAILED";
    if (result.isPresent()) {
      Map resultMap = result.get();
      if (resultMap.containsKey("id")) {
        status = "RUNNING";
      }
    }

    return Optional.of(status);
  }

  public Optional<IngestionHistory> realtimeIngestion(DataSource dataSource) {

    RealtimeIngestionInfo ingestionInfo = dataSource.getIngestionInfoByType();

    // Ingestion Task 생성
    SupervisorIndex spec = new KafkaRealTimeIndexBuilder()
        .dataSchema(dataSource)
        .ioConfig(ingestionInfo.getTopic(), ingestionInfo.getConsumerProperties(), ingestionInfo.getTuningOptions())
        .tuningConfig(ingestionInfo.getTuningOptions())
        .build();

    return doSupervisorIngestion(dataSource.getId(), ingestionInfo, spec);

  }

  /**
   * 실제 스펙을 가지고 Supervisor task 전달
   */
  private Optional<IngestionHistory> doSupervisorIngestion(String dataSourceId, IngestionInfo info, SupervisorIndex spec) {
    String ingestionSpec = null;
    try {
      ingestionSpec = GlobalObjectMapper.getDefaultMapper().writeValueAsString(spec);
    } catch (JsonProcessingException e) {/* Empty statement */}

    LOGGER.info("Ingestion Spec: " + ingestionSpec);
    Map<String, Object> result = engineRepository.supervisorIngestion(ingestionSpec, Map.class)
                                                 .orElseThrow(() -> new DataSourceIngestionException("Result empty"));

    LOGGER.info("Ingestion Result: " + result);
    IngestionHistory ingestionHistory = new IngestionHistory(dataSourceId);
    ingestionHistory.setIngestionInfo(info);
    // Supervisor 타입지정
    ingestionHistory.setIngestionMethod(IngestionHistory.IngestionMethod.SUPERVISOR);
    if (result.containsKey("id")) {
      String ingestionId = (String) result.get("id");
      ingestionHistory.setIngestionId(ingestionId);

      // 성공 실패 여부를 체크하기 위해 Sleep!
      try {
        Thread.sleep(3000L);
      } catch (InterruptedException e) { /* Empty statement */ }

      Optional<String> checkStatus = doSupervisorCheckResult(ingestionId);
      if (!checkStatus.isPresent() || checkStatus.get().equals("FAILED")) {
        throw new DataSourceIngestionException("Fail to ingest datasource. please, Check engine.");
      } else {
        ingestionHistory.setStatus(checkStatus.get());
      }
    } else {
      throw new DataSourceIngestionException("Invalid result of ingestion : " + result);
    }

    return Optional.ofNullable(ingestionHistory);
  }

}
