/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.mdm;

import app.metatron.discovery.common.exception.ErrorCodes;

public enum MetadataErrorCodes implements ErrorCodes {

  METADATA_COMMON_ERROR("MD001"),
  DUPLICATED_CATALOG_NAME("MD002"),
  LINEAGE_COLUMN_MISSING("MD003"),
  LINEAGE_DATASET_ERROR("MD004"),
  LINEAGE_CANNOT_CREATE_EDGE("MD005"),
  LINEAGE_NODE_COUNT_DONE("MD006"),
  ;

  String errorCode;

  MetadataErrorCodes(String errorCode) {
    this.errorCode = errorCode;
  }

  @Override
  public String getCode() {
    return errorCode;
  }
}
