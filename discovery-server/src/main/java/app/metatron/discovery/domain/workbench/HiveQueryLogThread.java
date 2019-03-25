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

import org.apache.commons.lang3.StringUtils;
import org.apache.hive.jdbc.HiveStatement;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.ProgressResponse;
import app.metatron.discovery.util.WebSocketUtils;

/**
 *
 */
@Component
public class HiveQueryLogThread implements Runnable {

  private static Logger LOGGER = LoggerFactory.getLogger(HiveQueryLogThread.class);

  private SimpMessageSendingOperations messagingTemplate;
  private HiveStatement stmt;
  private String workbenchId;
  private String webSocketId;
  private int queryIndex;
  private long queryProgressInterval;
  private String totalLog;
  private String queryEditorId;


  private HiveQueryLogThread(){

  }

  public HiveQueryLogThread(HiveStatement stmt, String workbenchId, String webSocketId, int queryIndex, String queryEditorId,long queryProgressInterval, SimpMessageSendingOperations messagingTemplate){
    this.stmt = stmt;
    this.workbenchId = workbenchId;
    this.webSocketId = webSocketId;
    this.queryIndex = queryIndex;
    this.queryEditorId = queryEditorId;
    this.queryProgressInterval = queryProgressInterval;
    this.messagingTemplate = messagingTemplate;
  }

  @Override
  public void run() {
    try{
      while (stmt.hasMoreLogs()) {
        LOGGER.debug("HiveQueryLogThread Tick : {}", DateTime.now().getSecondOfDay());

        //get current log
        //required hive property in server-side (hive.async.log.enabled=false)
        List<String> logLists = stmt.getQueryLog();
        sendLogMessage(logLists);
        Thread.sleep(queryProgressInterval);
      }
    } catch(SQLException e){
      LOGGER.debug(e.getMessage());
    } catch(InterruptedException e){
      LOGGER.debug("Log Thread Interrupted..", e);
    } finally {
      showRemainingLogsIfAny(stmt);
//      sendDoneMessage();
    }
  }

  private ProgressResponse parseProgress(List<String> logLists){
    ProgressResponse progress = null;
    for(String log : logLists){
      if(isProgressIndicatedLog(log)){
        String progressIndicatedLog = parseProgressIndicatedLog(log);
        VerticesProgress verticesProgress = new VerticesProgress(log);
        progress = new ProgressResponse(verticesProgress.getProgress(), progressIndicatedLog);
        LOGGER.debug("progress : {}%, progressIndicatedLog : {}", verticesProgress.getProgress(), progressIndicatedLog);
      }
    }
    return progress;
  }

  public boolean isProgressIndicatedLog(String log){
    if(StringUtils.isNotEmpty(log)){
      return VerticesProgress.isProgressIndicatedLog(log);
    }
    return false;
  }

  private String parseProgressIndicatedLog(String log){
    int firstMapString = StringUtils.indexOf(log, "Map");
    int firstReducerString = StringUtils.indexOf(log, "Reducer");
    if(firstMapString > 0 && firstReducerString > 0){
      return StringUtils.substring(log, Math.min(firstMapString, firstReducerString), log.length());
    } else if(firstMapString > 0){
      return StringUtils.substring(log, firstMapString, log.length());
    } else if(firstReducerString > 0){
      return StringUtils.substring(log, firstReducerString, log.length());
    }
    return log;
  }

  private void sendLogMessage(List<String> logLists){
    String currentLog = StringUtils.join(logLists, "\n");

    //append to total log
    String newTotalLog = StringUtils.join(totalLog, "\n", currentLog);
    totalLog = newTotalLog;

    //parse progress
    ProgressResponse progress = parseProgress(logLists);

    Map<String, Object> message = new HashMap<>();
    message.put("command", WorkbenchWebSocketController.WorkbenchWebSocketCommand.LOG);
    message.put("log", logLists);
    message.put("progress", progress);
    message.put("queryIndex", queryIndex);
    message.put("queryEditorId", queryEditorId);

    WebSocketUtils.sendMessage(messagingTemplate, webSocketId, "/queue/workbench/" + workbenchId, message);
  }


  private void sendDoneMessage(){
    Map<String, Object> message = new HashMap<>();
    message.put("command", WorkbenchWebSocketController.WorkbenchWebSocketCommand.DONE);
    message.put("queryIndex", queryIndex);
    message.put("queryEditorId", queryEditorId);

    WebSocketUtils.sendMessage(messagingTemplate, webSocketId, "/queue/workbench/" + workbenchId, message);
  }

  private void showRemainingLogsIfAny(Statement statement) {
    if (statement instanceof HiveStatement) {
      LOGGER.debug("showRemainingLogsIfAny.");
      HiveStatement hiveStatement = (HiveStatement) statement;
      List<String> logs = null;
      do {
        try {
          LOGGER.debug("showRemainingLogsIfAny. do!");
          logs = hiveStatement.getQueryLog();
        } catch (SQLException e) {
          LOGGER.debug(e.getMessage());
          return;
        }
        sendLogMessage(logs);
      } while (logs.size() > 0);
    } else {
      LOGGER.debug("The statement instance is not HiveStatement type: " + statement.getClass());
    }
  }
}
