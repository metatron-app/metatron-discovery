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

package app.metatron.discovery.domain.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import app.metatron.discovery.common.exception.ErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;

import static app.metatron.discovery.domain.user.UserErrorCodes.USER_COMMON_ERROR_CODE;

/**
 * Created by kyungtaak on 2016. 5. 30..
 */
@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason = "User error.")
public class UserException extends MetatronException {

  public UserException(String message) {
    super(USER_COMMON_ERROR_CODE, message);
  }

  public UserException(ErrorCodes errorCodes, String message) {
    super(errorCodes, message);
  }

  public UserException(String message, Throwable cause) {
    super(USER_COMMON_ERROR_CODE, message, cause);
  }

  public UserException(Throwable cause) {
    super(USER_COMMON_ERROR_CODE, cause);
  }
}
