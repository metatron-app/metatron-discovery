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
 * 인증 오류시 발생 (Role처리 오류)
 */
@ResponseStatus(value = HttpStatus.UNAUTHORIZED, reason = "Authentication failed")
public class AuthenticationException extends MetatronException {

  public AuthenticationException(String message) {
    super(GlobalErrorCodes.AUTH_ERROR_CODE, message);
  }

  public AuthenticationException(Throwable cause) {
    super(GlobalErrorCodes.AUTH_ERROR_CODE, cause);
  }

  public AuthenticationException(ErrorCodes code, String message, Throwable cause) {
    super(code, message, cause);
  }
}
