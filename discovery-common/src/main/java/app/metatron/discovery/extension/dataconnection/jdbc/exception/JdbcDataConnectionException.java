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

package app.metatron.discovery.extension.dataconnection.jdbc.exception;

import app.metatron.discovery.common.exception.MetatronException;

/**
 * Created by kyungtaak on 2016. 7. 2..
 */
public class JdbcDataConnectionException extends MetatronException {

  public JdbcDataConnectionException(JdbcDataConnectionErrorCodes codes, String message, Throwable cause) {
    super(codes, message, cause);
  }

  public JdbcDataConnectionException(JdbcDataConnectionErrorCodes codes, Throwable cause) {
    super(codes, cause);
  }

  public JdbcDataConnectionException(JdbcDataConnectionErrorCodes codes, String message) {
    super(codes, message);
  }
}
