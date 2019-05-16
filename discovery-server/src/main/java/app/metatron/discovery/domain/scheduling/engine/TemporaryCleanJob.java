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

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.joda.time.DateTime;
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

import java.util.List;

import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.DataSourceTemporary;
import app.metatron.discovery.domain.datasource.DataSourceTemporaryRepository;
import app.metatron.discovery.domain.engine.EngineLoadService;

/**
 * Created by kyungtaak on 2016. 6. 20..
 */
@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
public class TemporaryCleanJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(TemporaryCleanJob.class);

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataSourceTemporaryRepository temporaryRepository;

  @Autowired
  EngineLoadService engineLoadService;

  public TemporaryCleanJob() {
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.info("## Start batch job for checking expired temporary datasource.");

    PageRequest pageRequest = new PageRequest(0, 20);
    Page<DataSourceTemporary> temporaries;
    DateTime now = DateTime.now();

    do {

      temporaries = temporaryRepository.findByStatusAndNextExpireTimeBefore(DataSourceTemporary.LoadStatus.ENABLE, now, pageRequest);
      if(temporaries.getContent().isEmpty()) {
        break;
      }

      // 임시로 생성된 데이터 소스 Temporary 만 삭제
      final List<String> deleteDataSourceIds = Lists.newArrayList();
      final List<String> deleteTemporaryIds = Lists.newArrayList();
      final List<String> changeTemporaryIds = Lists.newArrayList();

      temporaries.forEach(dataSourceTemporary -> {
        if(BooleanUtils.isTrue(dataSourceTemporary.getVolatiled())) {
          deleteDataSourceIds.add(dataSourceTemporary.getDataSourceId());
          deleteTemporaryIds.add(dataSourceTemporary.getId());
        } else {
          changeTemporaryIds.add(dataSourceTemporary.getId());
        }

        // 엔진내 임시 Datasource 삭제
        engineLoadService.deleteLoadDataSource(dataSourceTemporary.getName());
        LOGGER.info("Successfully delete engine temporary datasource : {}", dataSourceTemporary.getName());
      });

      removeDatasource(deleteTemporaryIds, changeTemporaryIds, deleteDataSourceIds);

    } while (temporaries.hasNext());

    LOGGER.info("## End batch job for checking expired temporary datasource.");
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void removeDatasource(List<String> deleteIds, List<String> updateIds, List<String> dataSourceIds) {
    // delete temporary info.
    if(CollectionUtils.isNotEmpty(deleteIds)) {
      temporaryRepository.deteleTemporaryByIds(deleteIds);
      LOGGER.info("Successfully deleting {} temporary info", deleteIds.size());
    }

    // update temporary info.
    if(CollectionUtils.isNotEmpty(updateIds)) {
      temporaryRepository.updateTemporaryStatusByIds(updateIds, DataSourceTemporary.LoadStatus.DISABLE);
      LOGGER.info("Successfully updating {} temporary info", updateIds.size());
    }

    // delete votile info.
    if(dataSourceIds != null) {
      dataSourceRepository.deleteInBatch(dataSourceRepository.findByIdIn(dataSourceIds));
      LOGGER.info("Successfully deleting {} volatiled datasources", dataSourceIds.size());
    }

  }

}
