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

import java.io.Serializable;
import java.util.List;

/**
 * Created by kyungtaak on 2016. 7. 22..
 */
public class CronValidationResponse implements Serializable {

  boolean valid;

  String error;

  List<String> nextTriggerTimes;

  public CronValidationResponse(boolean valid, String error) {
    this.valid = valid;
    this.error = error;
  }

  public CronValidationResponse(boolean valid, List<String> nextTriggerTimes) {
    this.valid = valid;
    this.nextTriggerTimes = nextTriggerTimes;
  }

  public boolean isValid() {
    return valid;
  }

  public String getError() {
    return error;
  }

  public List<String> getNextTriggerTimes() {
    return nextTriggerTimes;
  }
}
