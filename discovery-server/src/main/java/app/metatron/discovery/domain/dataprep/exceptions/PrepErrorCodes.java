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

package app.metatron.discovery.domain.dataprep.exceptions;

import app.metatron.discovery.common.exception.ErrorCodes;

public enum PrepErrorCodes implements ErrorCodes {

    // metaton discovery 전체 에러코드 작성 규칙 : 도메인 코드 2자리 + numbering 4자리
    // dataprep 작성 규칙 :
    //   0000~0999 -> 초록색 중앙 상단 토스트, 내용은 JSON의 "details" 항목
    //   1000~1999 -> 주황색 중앙 상단 토스트, 내용은 JSON의 "details" 항목
    //   2000~4999 -> reserved
    //   5000~7999 -> 빨강색 중앙 상단 토스트, 내용은 JSON의 "details" 항목
    //   8000~9999 -> reserved
    PREP_RULE_SYNTAX_ERROR_CODE(            "PR1001"),

    PREP_TRANSFORM_ERROR_CODE(              "PR5001"),
    PREP_DATAFLOW_ERROR_CODE(               "PR5002"),
    PREP_DATASET_ERROR_CODE(                "PR5003"),
    PREP_SNAPSHOT_ERROR_CODE(               "PR5004"),
    PREP_UPSTREAM_ERROR_CODE(               "PR5005"),
    PREP_TEDDY_ERROR_CODE(                  "PR5007"),

    PREP_INVALID_CONFIG_CODE(               "PR5201"),

    PREP_NOT_ACTIVATED_CODE(                "PR9999");

    String errorCode;

    PrepErrorCodes(String errorCode) {
        this.errorCode = errorCode;
    }

    @Override
    public String getCode() {
        return errorCode;
    }
}
