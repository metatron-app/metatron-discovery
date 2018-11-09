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

import app.metatron.discovery.common.exception.ErrorCodes;

public enum DataSourceErrorCodes implements ErrorCodes {

  QUERY_ERROR_CODE("DS0001"),
  INVALID_EXPR_CODE("DS0002"),
  INGESTION_ERROR_CODE("DS0003"),
  CONFUSING_FIELD_CODE("DS0004"),
  VOLATILITY_NOT_FOUND_CODE("DS0005"),
  INVALID_TIMEFORMAT_CODE("DS0006"),
  NOT_SUPPORTED_TIMEFORMAT_CODE("DS0007"),
  INVALID_PARTITION_EXPRESSION("DS0008");

  String errorCode;

  DataSourceErrorCodes(String errorCode) {
    this.errorCode = errorCode;
  }

  @Override
  public String getCode() {
    return errorCode;
  }
}
