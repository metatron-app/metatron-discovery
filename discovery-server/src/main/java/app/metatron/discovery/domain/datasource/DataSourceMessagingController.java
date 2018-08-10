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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
public class DataSourceMessagingController {

  private static Logger LOGGER = LoggerFactory.getLogger(DataSourceMessagingController.class);

  @Autowired
  public SimpMessageSendingOperations messagingTemplate;

  /**
   * Workspace 화면 진입시 호출
   *
   * @param accessor
   * @param workbenchId
   * @throws Exception
   */
  @MessageMapping("/datasources/{temporaryId}/progress")
  public void viewWorkbenchPage(SimpMessageHeaderAccessor accessor,
                                @DestinationVariable String workbenchId) throws Exception {
    LOGGER.debug("Init workbench view : Workbench - {}, user - {}, session id - {}",
                 workbenchId, accessor.getUser().getName(), accessor.getSessionId());

    // TODO : Create DataSource Connection per workbench view

  }
}
