/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.datasource;

import java.io.Serializable;

public class FileValidationResponse implements Serializable {

  boolean isValid;

  String warning = null;

  public FileValidationResponse(boolean isValid, String warning) {
    this.isValid = isValid;
    this.warning = warning;
  }

  public FileValidationResponse(boolean isValid) {
    this.isValid = isValid;
  }

  public boolean isValid() {
    return isValid;
  }

  public void setValid(boolean isValid) {
    this.isValid = isValid;
  }

  public String getWarning() {
    return warning;
  }

  public void setWarning(String warning) {
    this.warning = warning;
  }

  public enum WarningType {

    SEEMS_NOT_FORMAL("FV001"),
    HEADER_MERGED("FV002"),
    DUPLICATED_HEADER("FV003"),
    TOO_LONG_HEADER("FV004"),
    NULL_HEADER("FV005");

    private String warning;

    private WarningType(String warning) {
      this.warning = warning;
    }

    public String getCode() { return warning; }
  }

}
