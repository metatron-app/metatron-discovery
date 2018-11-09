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

package app.metatron.discovery.domain.datasource;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import app.metatron.discovery.common.exception.ErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;

import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_COMMON_ERROR;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
@ResponseStatus(value= HttpStatus.INTERNAL_SERVER_ERROR, reason="DataSource Ingestion Error")
public class DataSourceIngestionException extends MetatronException {

  public DataSourceIngestionException(String message) {
    super(INGESTION_COMMON_ERROR, message);
  }

  public DataSourceIngestionException(String message, Throwable cause) {
    super(INGESTION_COMMON_ERROR, message, cause);
  }

  public DataSourceIngestionException(ErrorCodes code, Throwable cause) {
    super(code, cause);
  }

  public DataSourceIngestionException(ErrorCodes code, String message) {
    super(code, message);
  }

  public DataSourceIngestionException(ErrorCodes code, String message, Throwable cause) {
    super(code, message, cause);
  }
}
