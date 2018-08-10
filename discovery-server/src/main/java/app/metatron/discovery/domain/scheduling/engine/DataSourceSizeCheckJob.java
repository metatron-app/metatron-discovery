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

package app.metatron.discovery.domain.scheduling.engine;

import org.joda.time.DateTime;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.DataSourceSizeHistory;
import app.metatron.discovery.domain.datasource.DataSourceSizeHistoryRepository;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;

/**
 * Created by kyungtaak on 2016. 6. 20..
 */
@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
@DisallowConcurrentExecution
public class DataSourceSizeCheckJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceSizeCheckJob.class);

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataSourceSizeHistoryRepository sizeHistoryRepository;

  @Autowired
  DruidEngineMetaRepository metaRepository;

  public DataSourceSizeCheckJob() {
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.info("## Start batch job for checking datasource trend");

    int pageNum = 0;
    int size = 100;

    PageRequest pageRequest = null;
    Page<DataSource> page = null;
    do {
      pageRequest = new PageRequest(pageNum, size);
      page = dataSourceRepository.findByDsTypeAndConnTypeAndStatus(
              DataSource.DataSourceType.MASTER,
              DataSource.ConnectionType.ENGINE,
              DataSource.Status.ENABLED, pageRequest);

      for (DataSource ds : page) {

        LOGGER.debug("Check size '{}' datasource.", ds.getName());

        Page<DataSourceSizeHistory> histories = sizeHistoryRepository
                .findByDataSourceIdOrderByCreatedTimeDesc(ds.getId(), new PageRequest(0, 1));

        if(histories != null && histories.hasContent()) {
          DateTime dateTime = histories.getContent().get(0).getCreatedTime().minusDays(1);
          sizeHistoryRepository.deleteHistroy(ds.getId(), dateTime);
          LOGGER.debug("Successfully deleted size history : under {}", dateTime.toString());
        }

        setSizeHistory(ds);

      }

      pageNum++;

    } while (page.hasNext());

    LOGGER.info("## End batch job for checking datasource trend");
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void setSizeHistory(DataSource dataSource) {

    Map<String, Object> result = null;
    DataSourceSizeHistory sizeHistory = new DataSourceSizeHistory(dataSource.getId());

    try {
      result = metaRepository.getSegmentMetaData(dataSource.getName(), "SERIALIZED_SIZE", "INGESTED_NUMROW");
    } catch (Exception e) {
      LOGGER.warn("Fail to query metadata: {}", e.getMessage());
      return;
    }

    Long size = 0L;
    Long rowCount = 0L;
    if(result.containsKey("serializedSize")) {
      size = result.get("serializedSize") == null ? 0L : ((Number) result.get("serializedSize")).longValue();
    }

    if(result.containsKey("numRows")) {
      rowCount = result.get("numRows") == null ? 0L : ((Number) result.get("numRows")).longValue();
    }

    sizeHistory.setSize(size);
    sizeHistory.setCount(rowCount);

    sizeHistoryRepository.save(sizeHistory);

    LOGGER.debug("Successfully save size history : {}", sizeHistory);
  }

}
