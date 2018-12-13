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

package app.metatron.discovery.common;

import java.io.Serializable;

public class ProgressResponse implements Serializable {

  Integer progress;

  String message;

  Object results;

  public ProgressResponse(Integer progress, String message) {
    this.progress = progress;
    this.message = message;
  }

  public ProgressResponse(Integer progress, Enum<?> enumMessage) {
    this.progress = progress;
    this.message = enumMessage.toString();
  }

  public ProgressResponse(Integer progress, Enum<?> enumMessage, Object results) {
    this.progress = progress;
    this.message = enumMessage.toString();
    this.results = results;
  }

  public Integer getProgress() {
    return progress;
  }

  public void setProgress(Integer progress) {
    this.progress = progress;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public Object getResults() {
    return results;
  }

  public void setResults(Object results) {
    this.results = results;
  }

  @Override
  public String toString() {
    return "ProgressResponse{" +
        "progress=" + progress +
        ", message='" + message + '\'' +
        ", results=" + results +
        '}';
  }
}
