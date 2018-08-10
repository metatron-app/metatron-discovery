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

package app.metatron.discovery.domain.engine;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import app.metatron.discovery.common.exception.MetatronException;

import static app.metatron.discovery.domain.engine.EngineErrorCodes.ENGINE_ACCESS_ERROR_CODE;

/**
 * Created by kyungtaak on 2016. 6. 13..
 */
@ResponseStatus(value= HttpStatus.INTERNAL_SERVER_ERROR, reason="Engine access error")
public class EngineException extends MetatronException {

  public EngineException(String message) {
    super(ENGINE_ACCESS_ERROR_CODE, message);
  }

  public EngineException(EngineErrorCodes code, String message) {
    super(code, message);
  }

  public EngineException(String message, Throwable cause) {
    super(ENGINE_ACCESS_ERROR_CODE, message, cause);
  }

  public EngineException(EngineErrorCodes code, String message, Throwable cause) {
    super(code, message, cause);
  }
}
