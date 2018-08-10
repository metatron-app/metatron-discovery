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

package app.metatron.discovery.domain.dataprep.transform;

import java.io.Serializable;
import java.util.List;

public class PrepSnapshotResponse implements Serializable {
  String ssId;
  List<String> fullDsIds;
  String ssName;

  public PrepSnapshotResponse(String ssId, List<String> fullDsIds, String ssName) {
    this.ssId = ssId;
    this.fullDsIds = fullDsIds;
    this.ssName = ssName;
  }

  public String getSsId() {
    return ssId;
  }

  public List<String> getFullDsIds() {
    return fullDsIds;
  }

  public String getSsName() {
    return ssName;
  }
}
