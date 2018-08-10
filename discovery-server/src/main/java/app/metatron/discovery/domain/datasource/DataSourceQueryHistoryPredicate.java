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

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.joda.time.DateTime;

public class DataSourceQueryHistoryPredicate {

  /**
   * 데이터 소스 기본 검색 관련 조건 정의
   *
   * @param queryType type of query
   * @param succeed whether succeed
   * @param from 검색 시작일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @param to 검색 종료일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @return
   */
  public static Predicate searchList(String dataSourceId,
                                     DataSourceQueryHistory.QueryType queryType, Boolean succeed,
                                     DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QDataSourceQueryHistory queryHistory = QDataSourceQueryHistory.dataSourceQueryHistory;

    if(dataSourceId != null) {
      builder = builder.and(queryHistory.dataSourceId.eq(dataSourceId));
    }

    if(queryType != null) {
      builder = builder.and(queryHistory.queryType.eq(queryType));
    }

    if(succeed != null) {
      builder = builder.and(queryHistory.succeed.eq(succeed));
    }

    if(from != null && to != null) {
      builder = builder.and(queryHistory.modifiedTime.between(from, to));
    }

    return builder;
  }

}
