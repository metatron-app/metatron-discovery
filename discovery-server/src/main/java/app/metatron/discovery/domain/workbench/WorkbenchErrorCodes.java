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

import app.metatron.discovery.common.exception.ErrorCodes;

public enum WorkbenchErrorCodes implements ErrorCodes {

  QUERY_STATUS_ERROR_CODE("WB0001"),
  DATASOURCE_NOT_EXISTED("WB0002"),
  CSV_FILE_NOT_FOUND("WB0003"),
  TABLE_ALREADY_EXISTS("WB0004");

  String errorCode;

  WorkbenchErrorCodes(String errorCode) {
    this.errorCode = errorCode;
  }

  @Override
  public String getCode() {
    return errorCode;
  }
}
