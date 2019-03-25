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

package app.metatron.discovery.domain.workbench;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;
import app.metatron.discovery.util.WebSocketUtils;

@Controller
public class WorkbenchWebSocketController {

  private static Logger LOGGER = LoggerFactory.getLogger(WorkbenchWebSocketController.class);

  enum WorkbenchWebSocketCommand{
    CONNECT, DISCONNECT, LOG, GET_CONNECTION, CREATE_STATEMENT, EXECUTE_QUERY, GET_RESULTSET, DONE
  }

  @Autowired
  public SimpMessageSendingOperations messagingTemplate;

  @Autowired
  WorkbenchDataSourceManager workbenchDataSourceManager;

  /**
   * Workspace 화면 진입시 호출
   *
   * @param accessor
   * @param workbenchId
   * @throws Exception
   */
  @MessageMapping("/workbench/{workbenchId}/dataconnections/{dataConnectionId}/connect")
  public void connectWorkbench(SimpMessageHeaderAccessor accessor,
                               @DestinationVariable String workbenchId,
                               @DestinationVariable String dataConnectionId,
                               UserInfo userInfo) throws Exception {
    LOGGER.debug("Connect workbench : Workbench - {}, DataConnection - {}, user - {}, session id - {}",
            workbenchId, dataConnectionId, accessor.getUser().getName(), accessor.getSessionId());

    String sessionId = accessor.getSessionId();
    String username = userInfo != null ? userInfo.getUsername() : "";
    String password = userInfo != null ? userInfo.getPassword() : "";

    Map<String, Object> message = new HashMap<>();
    message.put("command", WorkbenchWebSocketCommand.CONNECT);
    message.put("connected", true);
    try{
      workbenchDataSourceManager.getWorkbenchDataSource(dataConnectionId, sessionId, username, password);
    } catch (MetatronException e){
      message.put("connected", false);
      message.put("message", e.getMessage());
    }

    WebSocketUtils.sendMessage(messagingTemplate, sessionId, "/queue/workbench/" + workbenchId, message);
  }

  /**
   * Workspace 화면 나갈때 호출
   *
   * @param accessor
   * @param workbenchId
   * @throws Exception
   */
  @MessageMapping("/workbench/{workbenchId}/dataconnections/{dataConnectionId}/disconnect")
  public void disconnectWorkbench(SimpMessageHeaderAccessor accessor,
                               @DestinationVariable String workbenchId) throws Exception {
    LOGGER.debug("Disconnect workbench : Workbench - {}, user - {}, session id - {}",
            workbenchId, accessor.getUser().getName(), accessor.getSessionId());

    String sessionId = accessor.getSessionId();
    workbenchDataSourceManager.destroyDataSource(sessionId);

    Map<String, Object> message = new HashMap<>();
    message.put("command", WorkbenchWebSocketCommand.DISCONNECT);
    message.put("disconnected", true);

    WebSocketUtils.sendMessage(messagingTemplate, sessionId, "/queue/workbench/" + workbenchId, message);
  }

  /**
   * Message Payload
   */
  public static class UserInfo implements Serializable {

    String username;
    String password;

    public UserInfo() {
    }

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }

  }
}
