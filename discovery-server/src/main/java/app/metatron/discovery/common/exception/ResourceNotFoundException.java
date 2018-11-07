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

import com.google.common.base.Preconditions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static app.metatron.discovery.common.exception.GlobalErrorCodes.NOT_FOUND_CODE;

/**
 * API 또는 Resource 가 존재하지 않을 경우 활용
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Resource Not Found")
public class ResourceNotFoundException extends MetatronException {

  public ResourceNotFoundException(String resource) {
    this(resource, null);
  }

  public ResourceNotFoundException(Long resource) {
    this(resource, null);
  }

  public ResourceNotFoundException(Object resource, Throwable cause) {
    super(NOT_FOUND_CODE, String.format("Resource(%s) not Found", Preconditions.checkNotNull(resource)), cause);
  }

  public ResourceNotFoundException(Throwable cause) {
    super(NOT_FOUND_CODE, cause);
  }
}
