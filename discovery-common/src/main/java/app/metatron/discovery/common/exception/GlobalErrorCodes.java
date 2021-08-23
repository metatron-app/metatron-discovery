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

package app.metatron.discovery.common.exception;

public enum GlobalErrorCodes implements ErrorCodes {

  DEFAULT_GLOBAL_ERROR_CODE("GB0000"),      // status 500
  UNKNOWN_SERVER_ERROR_CODE("GB0001"),      // status 500
  NOT_FOUND_CODE("GB0002"),                 // status 404
  BAD_REQUEST_CODE("GB0003"),               // status 400
  ACCESS_DENIED_CODE("GB0004"),             // status 403
  AUTH_ERROR_CODE("GB0005"),                // status 401
  INVALID_USERNAME_PASSWORD_CODE("GB0006"), // status 400
  INVALID_TOKEN_CODE("GB0007"),             // status 401
  VALIDATION_FAIL_CODE("GB0008"),           // status 400

  DEFAULT_GLOBAL_ERROR("error.global.default");

  String errorCode;

  GlobalErrorCodes(String errorCode) {
    this.errorCode = errorCode;
  }

  @Override
  public String getCode() {
    return errorCode;
  }
}
