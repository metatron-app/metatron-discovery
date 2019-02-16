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

package app.metatron.discovery.domain.mdm.source;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.QCodeTable;

public class MetadataSourcePredicate {

  /**
   * 기본 목록 조회 옵션 지정
   *
   * @param type Type of metadata source
   * @param sourceId Source Object Id
   * @param searchDateBy 일자 검색 기준 (생성일/수정일)
   * @param from 검색 시작일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @param to 검색 종료일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @return
   */
  public static Predicate searchList(Metadata.SourceType type, String sourceId,
                                     String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QMetadataSource metadataSource = QMetadataSource.metadataSource;

    if(from != null && to != null) {
      if(StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder.and(metadataSource.createdTime.between(from, to));
      } else {
        builder.and(metadataSource.modifiedTime.between(from, to));
      }
    }

    if(type != null) {
      builder.and(metadataSource.type.eq(type));
    }

    if(StringUtils.isNotEmpty(sourceId)) {
      builder.and(metadataSource.sourceId.eq(sourceId));
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
