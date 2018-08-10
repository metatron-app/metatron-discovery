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

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

public class ColumnDictionaryPredicate {

  /**
   * 기본 목록 조회 옵션 지정
   *
   * @param nameContains 컬럼 명 내 포함되는 문자
   * @param logicalNameContains 로지컬 명 내 포함되는 문자
   * @param searchDateBy 일자 검색 기준 (생성일/수정일)
   * @param from 검색 시작일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @param to 검색 종료일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @return
   */
  public static Predicate searchList(String nameContains, String logicalNameContains,
                                     String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QColumnDictionary dictionary = QColumnDictionary.columnDictionary;

    if(from != null && to != null) {
      if(StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder = builder.and(dictionary.createdTime.between(from, to));
      } else {
        builder = builder.and(dictionary.modifiedTime.between(from, to));
      }
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(dictionary.name.containsIgnoreCase(nameContains));
    }

    if(StringUtils.isNotEmpty(logicalNameContains)) {
      builder = builder.and(dictionary.logicalName.containsIgnoreCase(logicalNameContains));
    }

    return builder;
  }

  public static Predicate searchListInCodeTable(CodeTable codeTable, String nameContains, String logicalNameContains,
                                     String searchDateBy, DateTime from, DateTime to) {
    BooleanBuilder builder = new BooleanBuilder();
    QColumnDictionary dictionary = QColumnDictionary.columnDictionary;

    builder.and(dictionary.codeTable.eq(codeTable));

    return builder.and(searchList(nameContains, logicalNameContains, searchDateBy, from, to));

  }

  /**
   * ColumnDictionary 명 중복 조회 조건
   *
   * @param name
   * @return
   */
  public static Predicate searchDuplicatedName(String name) {

    BooleanBuilder builder = new BooleanBuilder();
    QColumnDictionary dictionary = QColumnDictionary.columnDictionary;

    builder = builder.and(dictionary.name.eq(name));

    return builder;
  }

}
