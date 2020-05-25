/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.audit;

import app.metatron.discovery.common.exception.ErrorCodes;

/**
 *
 */
public enum AuditErrorCodes implements ErrorCodes {
  DOMAIN_CLASS_NOT_FOUND("AD001")
  ;

  String errorCode;

  AuditErrorCodes(String errorCode) {
    this.errorCode = errorCode;
  }

  @Override
  public String getCode() {
    return errorCode;
  }
}
