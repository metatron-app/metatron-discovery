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

package app.metatron.discovery.domain.engine.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.Map;

import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;

public class IngestionStatusResponse implements Serializable {

  String id;

  IngestionHistory.IngestionStatus status;

  Long duration;

  String cause;

  public IngestionStatusResponse() {
  }

  @JsonCreator
  public IngestionStatusResponse(@JsonProperty("task") String task,
                         @JsonProperty("status") Map statusMap) {
    this.id = task;
    this.status = IngestionHistory.IngestionStatus.convertFromEngineStatus((String) statusMap.get("status"));
    this.duration = Long.parseLong(statusMap.get("duration") + "");
    this.cause = (String) statusMap.get("reason");
  }

  public IngestionStatusResponse(String id, IngestionHistory.IngestionStatus status, Long duration, String cause) {
    this.id = id;
    this.status = status;
    this.duration = duration;
    this.cause = cause;
  }

  public static IngestionStatusResponse failedResponse(String taskId) {
    return new IngestionStatusResponse(taskId, IngestionHistory.IngestionStatus.FAILED, 0L,
                                       "Fail to check ingestion task(" + taskId + ") on druid");
  }

  public static IngestionStatusResponse unknownResponse(String taskId, Throwable t) {
    return new IngestionStatusResponse(taskId, IngestionHistory.IngestionStatus.UNKNOWN, 0L,
                                       "Fail to check ingestion task(" + taskId + ") on druid : " + t.getMessage());
  }

  public String getId() {
    return id;
  }

  public IngestionHistory.IngestionStatus getStatus() {
    return status;
  }

  public void setStatus(IngestionHistory.IngestionStatus status) {
    this.status = status;
  }

  public Long getDuration() {
    return duration;
  }

  public String getCause() {
    return cause;
  }

  @Override
  public String toString() {
    return "IngestionStatus{" +
        "id='" + id + '\'' +
        ", status=" + status +
        ", duration=" + duration +
        ", cause='" + cause + '\'' +
        '}';
  }
}
