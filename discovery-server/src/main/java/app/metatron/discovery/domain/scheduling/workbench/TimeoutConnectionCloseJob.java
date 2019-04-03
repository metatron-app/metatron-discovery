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

package app.metatron.discovery.domain.scheduling.workbench;

import org.apache.commons.lang3.StringUtils;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.user.SimpSession;
import org.springframework.messaging.simp.user.SimpSubscription;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.config.WebSocketMessageBrokerStats;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;

@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
public class TimeoutConnectionCloseJob extends QuartzJobBean {

  private static final Logger LOGGER = LoggerFactory.getLogger(TimeoutConnectionCloseJob.class);

  @Autowired
  WebSocketMessageBrokerStats webSocketMessageBrokerStats;

  @Autowired
  WorkbenchDataSourceManager workbenchDataSourceManager;

  @Autowired
  private SimpUserRegistry userRegistry;
  
  public TimeoutConnectionCloseJob() {
  }

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {

    LOGGER.info("## Start batch job for checking time out websocket.");

    //1. getting connect websocket session
    List<String> subscribedWebsocketId = new ArrayList<>();
    for(SimpUser simpUser : userRegistry.getUsers()){
      for(SimpSession simpSession : simpUser.getSessions()){
        for(SimpSubscription simpSubscription : simpSession.getSubscriptions()){
          if(StringUtils.startsWith(simpSubscription.getDestination(), "/user/queue/workbench")){
            subscribedWebsocketId.add(simpSession.getId());
          }
        }
      }
    }
    LOGGER.info("Current subscribed queue from workbench : {}", subscribedWebsocketId);

    //2. getting workbench datasource
    Map<String, WorkbenchDataSource> workbenchDataSourceList = workbenchDataSourceManager.getCurrentConnections();
    LOGGER.info("Current connected workbench DataSource : {}", workbenchDataSourceList.keySet());

    //3. filter workbench datasource not in queue
    List<WorkbenchDataSource> dataSourceList
            = workbenchDataSourceList.entrySet().stream()
            .filter(workbenchMap -> !subscribedWebsocketId.contains(workbenchMap.getKey()))
            .map(workbenchMap -> workbenchMap.getValue())
            .collect(Collectors.toList());
    LOGGER.info("Workbench DataSource not in ws queue : {}",
            dataSourceList.stream().map(workbenchDataSource -> workbenchDataSource.getWebSocketId()).collect(Collectors.toList()));

    //4. destroy DataSource
    for(WorkbenchDataSource workbenchDataSource : dataSourceList){
      workbenchDataSource.destroy();
      LOGGER.info("Destroy workbench DataSource : {}", workbenchDataSource.getWebSocketId());
    }

    LOGGER.info("## End batch job for checking time out websocket.");
  }

}
