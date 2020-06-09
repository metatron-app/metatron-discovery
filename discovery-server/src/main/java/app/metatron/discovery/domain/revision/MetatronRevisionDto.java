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

package app.metatron.discovery.domain.revision;

import java.util.HashMap;

/**
 *
 */
public class MetatronRevisionDto {

  public String revisionType;

  public String revisionDate;

  public String userName;

  public String targetType;

  public String targetId;

  public HashMap<String, Object> additionalInformation;

  public String getRevisionType() {
    return revisionType;
  }

  public void setRevisionType(String revisionType) {
    this.revisionType = revisionType;
  }

  public String getRevisionDate() {
    return revisionDate;
  }

  public void setRevisionDate(String revisionDate) {
    this.revisionDate = revisionDate;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getTargetType() {
    return targetType;
  }

  public void setTargetType(String targetType) {
    this.targetType = targetType;
  }

  public String getTargetId() {
    return targetId;
  }

  public void setTargetId(String targetId) {
    this.targetId = targetId;
  }

  public HashMap<String, Object> getAdditionalInformation() {
    return additionalInformation;
  }

  public void setAdditionalInformation(HashMap<String, Object> additionalInformation) {
    this.additionalInformation = additionalInformation;
  }
}
