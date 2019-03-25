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

package app.metatron.discovery.domain.dataconnection;

import app.metatron.discovery.common.exception.MetatronException;

/**
 * Created by kyungtaak on 2016. 7. 2..
 */
public class DataConnectionException extends MetatronException {

  public DataConnectionException(DataConnectionErrorCodes code, String message) {
    super(code, message);
  }

  public DataConnectionException(DataConnectionErrorCodes code, String message, Throwable cause) {
    super(code, message, cause);
  }

  public DataConnectionException(DataConnectionErrorCodes code, Throwable cause) {
    super(code, cause);
  }
}
