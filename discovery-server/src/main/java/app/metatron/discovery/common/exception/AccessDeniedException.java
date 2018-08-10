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

import static app.metatron.discovery.common.exception.GlobalErrorCodes.ACCESS_DENIED_CODE;

/**
 * 접근 거부 오류시 발생 (Role처리 오류)
 */
@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "Access denied")
public class AccessDeniedException extends MetatronException {

  public AccessDeniedException(String message) {
    super(ACCESS_DENIED_CODE, message);
  }

  public AccessDeniedException(Throwable cause) {
    super(ACCESS_DENIED_CODE, cause);
  }

  public AccessDeniedException(String message, Throwable cause) {
    super(ACCESS_DENIED_CODE, message, cause);
  }
}
