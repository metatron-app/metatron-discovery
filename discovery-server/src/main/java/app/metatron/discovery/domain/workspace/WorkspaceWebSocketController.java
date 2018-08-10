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

package app.metatron.discovery.domain.workspace;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
public class WorkspaceWebSocketController {

  private static Logger LOGGER = LoggerFactory.getLogger(WorkspaceWebSocketController.class);

  @Autowired
  public SimpMessageSendingOperations messagingTemplate;

  @Autowired
  public WorkspaceService workspaceService;

  /**
   * Workspace 화면 진입시 호출 되며, 메시지를 받는 즉시 특정 workspace 의 lastAccessTime 을 업데이트 합니다
   *
   * @param accessor
   * @param workspaceId
   * @throws Exception
   */
  @MessageMapping("/workspaces/{workspaceId}/accessed")
  public void accessWorkspace(SimpMessageHeaderAccessor accessor,
                               @DestinationVariable String workspaceId) throws Exception {

    LOGGER.debug("Workspace accessed : WorkspaceId - {}, user - {}, session id - {}",
            workspaceId, accessor.getUser().getName(), accessor.getSessionId());

    workspaceService.updateLastAccessedTime(workspaceId);

  }

}
