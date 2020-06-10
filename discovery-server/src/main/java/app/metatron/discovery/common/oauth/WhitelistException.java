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

package app.metatron.discovery.common.oauth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import app.metatron.discovery.common.exception.ErrorCodes;
import app.metatron.discovery.common.exception.GlobalErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;

/**
 *
 */
@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason = "Client is not matched with white list")
public class WhitelistException extends MetatronException {

  public WhitelistException(String message) {
    super(GlobalErrorCodes.INVALID_TOKEN_CODE, message);
  }

  public WhitelistException(Throwable cause) {
    super(GlobalErrorCodes.INVALID_TOKEN_CODE, cause);
  }

  public WhitelistException(ErrorCodes code, String message, Throwable cause) {
    super(code, message, cause);
  }
}
