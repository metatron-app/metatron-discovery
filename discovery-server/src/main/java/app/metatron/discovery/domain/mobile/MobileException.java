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

package app.metatron.discovery.domain.mobile;

import app.metatron.discovery.common.exception.ErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Mobile Exception
 */
@ResponseStatus(value= HttpStatus.INTERNAL_SERVER_ERROR, reason="Mobile Error")
public class MobileException extends MetatronException {

  public MobileException(ErrorCodes errorCodes, String message) {
    super(errorCodes, message);
  }

  public MobileException(ErrorCodes errorCodes, String message, Throwable cause) {
    super(errorCodes, message, cause);
  }

}
