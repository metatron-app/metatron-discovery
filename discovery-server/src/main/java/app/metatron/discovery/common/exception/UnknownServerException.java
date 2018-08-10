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

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * API 로직 처리중 예상하지 못한 오류 발생시 활용
 */
@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Unknown server error")
public class UnknownServerException extends MetatronException {

  public UnknownServerException(String message) {
    super(GlobalErrorCodes.UNKNOWN_SERVER_ERROR_CODE, message);
  }

  public UnknownServerException(Throwable cause) {
    super(GlobalErrorCodes.UNKNOWN_SERVER_ERROR_CODE, cause);
  }

  public UnknownServerException(String message, Throwable cause) {
    super(GlobalErrorCodes.UNKNOWN_SERVER_ERROR_CODE, message, cause);
  }
}
