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

import com.google.common.collect.Lists;

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

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import app.metatron.discovery.domain.engine.DruidEngineRepository;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.engine.monitoring.EngineMonitoring;
import app.metatron.discovery.domain.engine.monitoring.EngineMonitoringRepository;
import app.metatron.discovery.domain.engine.monitoring.EngineMonitoringService;

@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
@DisallowConcurrentExecution
public class EngineMonitoringSetter extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(EngineMonitoringSetter.class);

  @Autowired
  EngineMonitoringService monitoringQueryService;

  @Autowired
  DruidEngineRepository engineRepository;

  @Autowired
  EngineMonitoringRepository monitoringRepository;

  @Autowired
  EngineProperties engineProperties;

  public EngineMonitoringSetter() {
  }

  @Override
  protected void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.debug("########### engine monitoring job : find target servers");
    Map<String, String> hostnames = engineProperties.getHostname();
    for (String hostname : hostnames.keySet()) {
      try {
        URI uri = new URI(hostnames.get(hostname));
        List<EngineMonitoring> engineMonitoringList =
            monitoringRepository.findByHostnameAndPortAndType(uri.getHost(), String.valueOf(uri.getPort()), hostname);
        if (engineMonitoringList.isEmpty() || monitoringRepository.findByType(Lists.newArrayList(hostname)).size() > 1) {
          LOGGER.debug("########### engine monitoring init : delete all servers");
          monitoringRepository.deleteAll();
          break;
        }
      } catch (URISyntaxException e) {
        LOGGER.error("You have set wrong uri format. check your configuration.");
      }
    }

    if (monitoringRepository.findAll().isEmpty()) {
      LOGGER.debug("## You didn't set any hosts, initialize with YAML CONFIGURATION.");
      for (String hostname : hostnames.keySet()) {
        try {
          URI uri = new URI(hostnames.get(hostname));
          LOGGER.debug("Added {} server {}:{}", hostname, uri.getHost(), uri.getPort());
          monitoringRepository.save(new EngineMonitoring(uri.getHost(), String.valueOf(uri.getPort()), hostname));
        } catch (URISyntaxException e) {
          LOGGER.error("You have set wrong uri format. check your configuration.");
        }
      }
    }

    List<EngineMonitoring> existingHistoricalList = monitoringRepository.findByType(Lists.newArrayList("historical"));
    Optional<List> historicalNodes = engineRepository.getHistoricalNodes();
    for (Object o : historicalNodes.get()) {
      Map<String, Object> k = (Map<String, Object>) o;

      String parsedHost = String.valueOf(k.get("host"));
      if (!parsedHost.startsWith("http")) {
        parsedHost = "http://" + parsedHost;
      }

      URI fullHost = null;
      try {
        fullHost = new URI(parsedHost);
      } catch (URISyntaxException e) {
        LOGGER.error("Found wrong uri format. check your configuration.");
      }
      String serverType = String.valueOf(k.get("type"));

      if (serverType.equals("historical")) {
        List<EngineMonitoring> targetHistorical
            = monitoringRepository.findByHostnameAndPortAndType(
            fullHost.getHost(), String.valueOf(fullHost.getPort()), serverType);
        if (targetHistorical.isEmpty()) {
          LOGGER.debug("New historical server {}:{} is added to monitoring target.", fullHost.getHost(), fullHost.getPort());
          monitoringRepository.save(
              new EngineMonitoring(fullHost.getHost(), String.valueOf(fullHost.getPort()), serverType));
        } else {
          LOGGER.debug("Already added target.");

          for (EngineMonitoring engineMonitoring: existingHistoricalList) {
            EngineMonitoring historical = targetHistorical.get(0);
            if (engineMonitoring.getHostname().equals(historical.getHostname())
              && engineMonitoring.getPort().equals(historical.getPort())) {
              existingHistoricalList.remove(engineMonitoring);
              break;
            }
          }
        }
      }
    }

    if (!existingHistoricalList.isEmpty()) {
      LOGGER.debug("########### engine monitoring delete : historical");
      monitoringRepository.delete(existingHistoricalList);
    }

    List<EngineMonitoring> existingMiddleManagerList = monitoringRepository.findByType(Lists.newArrayList("middleManager"));
    Optional<List> middleManagerNodes = engineRepository.getMiddleManagerNodes();
    for (Object o : middleManagerNodes.get()) {
      Map<String, Map<String, Object>> k = (Map<String, Map<String, Object>>) o;
      Map<String, Object> workers = k.get("worker");

      String parsedHost = (String) workers.get("host");
      if (!parsedHost.startsWith("http")) {
        parsedHost = "http://" + parsedHost;
      }

      URI fullHost = null;
      try {
        fullHost = new URI(parsedHost);
      } catch (URISyntaxException e) {
        LOGGER.error("Found wrong uri format. check your configuration.");
      }
      List<EngineMonitoring> targetMiddle
          = monitoringRepository.findByHostnameAndPortAndType(
          fullHost.getHost(), String.valueOf(fullHost.getPort()), "middleManager");
      if (targetMiddle.isEmpty()) {
        LOGGER.debug("New middlemanager server {}:{} is added to monitoring target.", fullHost.getHost(), fullHost.getPort());
        monitoringRepository.save(
            new EngineMonitoring(fullHost.getHost(), String.valueOf(fullHost.getPort()), "middleManager"));
      } else {
        LOGGER.debug("Already added target.");

        for (EngineMonitoring engineMonitoring: existingMiddleManagerList) {
          EngineMonitoring middleManager = targetMiddle.get(0);
          if (engineMonitoring.getHostname().equals(middleManager.getHostname())
              && engineMonitoring.getPort().equals(middleManager.getPort())) {
            existingMiddleManagerList.remove(engineMonitoring);
            break;
          }
        }
      }
    }

    if (!existingMiddleManagerList.isEmpty()) {
      LOGGER.debug("########### engine monitoring delete : middleManager");
      monitoringRepository.delete(existingMiddleManagerList);
    }

  }
}
