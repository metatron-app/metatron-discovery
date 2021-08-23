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

package app.metatron.discovery.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Validation Failed")
public class ValidationException extends MetatronException {

  public ValidationException(String message) {
    super(GlobalErrorCodes.VALIDATION_FAIL_CODE, message);
  }

  public ValidationException(String message, Throwable cause) {
    super(GlobalErrorCodes.VALIDATION_FAIL_CODE, message, cause);
  }

  public ValidationException(Throwable cause) {
    super(GlobalErrorCodes.VALIDATION_FAIL_CODE, cause);
  }
}
