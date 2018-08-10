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

package app.metatron.discovery.common.datasource;

/**
 * Created by kyungtaak on 2017. 6. 11..
 */
public enum LogicalType {
  STRING,
  BOOLEAN,
  NUMBER,       // 정수/실수 혼합
  INTEGER,      // 정수형 대표
  DOUBLE,       // 실수형 대표
  TIMESTAMP,
  LNG,
  LNT,
  ARRAY,
  STRUCT,
  MAP_KEY,
  MAP_VALUE,
  IP_V4,         // IPv4 Address
  DISTRICT,      // 지역명
  EMAIL,
  SEX,
  CREDIT_CARD,   // 신용카드
  NIN,           // National Indentification Number 주민번호 (eq. SSN)
  POSTAL_CODE,
  PHONE_NUMBER,  // 전화번호
  URL,
  HTTP_CODE
}
