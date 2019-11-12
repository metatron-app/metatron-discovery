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

package app.metatron.discovery.domain.mdm;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.DateTimePath;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

public class CodeTablePredicate {

  /**
   * 기본 목록 조회 옵션 지정
   *
   * @param nameContains 컬럼 명 내 포함되는 문자
   * @param searchDateBy 일자 검색 기준 (생성일/수정일)
   * @param from 검색 시작일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @param to 검색 종료일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @return
   */
  public static Predicate searchList(String nameContains,
                                     String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QCodeTable codeTable = QCodeTable.codeTable;

    if(StringUtils.isNotEmpty(searchDateBy)) {
      DateTimePath searchDateTimePath;
      if("UPDATED".equalsIgnoreCase(searchDateBy)){
        searchDateTimePath = codeTable.modifiedTime;
      } else {
        searchDateTimePath = codeTable.createdTime;
      }

      if (from != null && to != null) {
        builder = builder.and(searchDateTimePath.between(from, to));
      } else if (from != null) {
        builder = builder.and(searchDateTimePath.goe(from));
      } else if (to != null) {
        builder = builder.and(searchDateTimePath.loe(to));
      }
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(codeTable.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  /**
   * CodeTable 명 중복 조회 조건
   *
   * @param name
   * @return
   */
  public static Predicate searchDuplicatedName(String name) {

    BooleanBuilder builder = new BooleanBuilder();
    QCodeTable codeTable = QCodeTable.codeTable;

    builder = builder.and(codeTable.name.eq(name));

    return builder;
  }

}
