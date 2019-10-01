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

package app.metatron.discovery.domain.scheduling.engine;

import org.joda.time.DateTime;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import app.metatron.discovery.domain.engine.DruidEngineRepository;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.engine.monitoring.EngineMonitoring;
import app.metatron.discovery.domain.engine.monitoring.EngineMonitoringRepository;
import app.metatron.discovery.domain.engine.monitoring.EngineMonitoringService;

@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
@DisallowConcurrentExecution
public class EngineMonitoringJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(EngineMonitoringJob.class);

  @Autowired
  EngineMonitoringService monitoringQueryService;

  @Autowired
  DruidEngineRepository engineRepository;

  @Autowired
  EngineMonitoringRepository monitoringRepository;

  @Autowired
  EngineProperties engineProperties;

  public EngineMonitoringJob() {
  }

  @Override
  protected void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.debug("########### engine monitoring job : check server health");

    List<EngineMonitoring> targetList = monitoringRepository.findAll();

    for (EngineMonitoring target : targetList) {
      if ( target.getStatus() == null || target.getStatus() ) {
        try {
          Optional<String> health = engineRepository.health(target.getHostname() + ":" + target.getPort(), String.class);
          if(health.isPresent()){
            if (health.get().equals("true")) {
              LOGGER.debug("{} status is normal", target.getHostname());
            } else {
              LOGGER.warn("{} status is not normal", target.getHostname());

              EngineMonitoring patchTarget = monitoringRepository.findOne(target.getId());

              patchTarget.setErrorMessage("Unknown Error");
              patchTarget.setErrorTime(DateTime.now());
              patchTarget.setStatus(false);

              monitoringRepository.save(patchTarget);
            }
          }

        } catch (Exception e) {
          EngineMonitoring patchTarget = monitoringRepository.findOne(target.getId());

          patchTarget.setErrorMessage(e.getMessage());
          patchTarget.setErrorTime(DateTime.now());
          patchTarget.setStatus(false);

          monitoringRepository.save(patchTarget);

        }
      } else {
        try {
          Optional<String> health = engineRepository.health(target.getHostname() + ":" + target.getPort(), String.class);
          if(health.isPresent()){
            if (health.get().equals("true")) {
              LOGGER.debug("{} status is normal", target.getHostname());

              EngineMonitoring patchTarget = monitoringRepository.findOne(target.getId());

              patchTarget.setErrorMessage(null);
              patchTarget.setErrorTime(null);
              patchTarget.setStatus(true);

              monitoringRepository.save(patchTarget);

            } else {
              LOGGER.warn("{} status is not normal", target.getHostname());
            }
          }
        } catch (Exception e) {
          EngineMonitoring patchTarget = monitoringRepository.findOne(target.getId());

          patchTarget.setErrorMessage(e.getMessage());
          patchTarget.setStatus(false);

          monitoringRepository.save(patchTarget);

        }
      }
    }
  }
}
