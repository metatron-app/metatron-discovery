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

package app.metatron.discovery.domain.scheduling.ingestion;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Trigger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;
import app.metatron.discovery.domain.datasource.ingestion.job.IngestionJobRunner;
import app.metatron.discovery.domain.engine.EngineIngestionService;

/**
 * Created by kyungtaak on 2016. 8. 12..
 */
@Component
//@Scope(SCOPE_PROTOTYPE)
@Transactional
@DisallowConcurrentExecution
public class IncrementalIngestionJob extends QuartzJobBean {

  private static Logger LOGGER = LoggerFactory.getLogger(IncrementalIngestionJob.class);

  @Autowired
  EngineIngestionService engineIngestionService;

  @Autowired
  IngestionJobRunner jobRunner;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  IngestionHistoryRepository ingestionHistoryRepository;

  public IncrementalIngestionJob() {
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    Trigger trigger = jobExecutionContext.getTrigger();
    JobDataMap jobData = trigger.getJobDataMap();

    String targetDataSourceId = jobData.getString("dataSourceId");
    if(StringUtils.isEmpty(targetDataSourceId)) {
      return;
    }

    LOGGER.info("## Start incremental ingestion job for datasource({}).", targetDataSourceId);

    List<IngestionHistory> ingestionHistories = ingestionHistoryRepository.findByDataSourceIdAndStatus(targetDataSourceId, IngestionHistory.IngestionStatus.RUNNING);
    if(CollectionUtils.isNotEmpty(ingestionHistories)) {
      LOGGER.info("This data source({}) has running ingestion job, skip!", targetDataSourceId);
      return;
    }

    DataSource dataSource = dataSourceRepository.findByIdIncludeConnection(targetDataSourceId);
    if (dataSource == null) {
      LOGGER.warn("Job({}) - datasource not found", trigger.getKey().getName());
      return;
    }

    if (dataSource.getIngestion() == null) {
      LOGGER.warn("Job({}) - ingestion info. not found", trigger.getKey().getName());
      return;
    }

    jobRunner.ingestion(dataSource);

    LOGGER.info("## End incremental ingestion job for datasource({}).", targetDataSourceId);
  }

}
