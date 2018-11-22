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

package app.metatron.discovery.domain.workbench;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

public class QueryHistoryPredicate {

  /**
   * 데이터 소스 기본 검색 관련 조건 정의
   *
   * @param queryEditorId queryEditor ID
   * @param queryPattern query내 포함되는 문자
   * @return
   */
  public static Predicate searchListNotDeleted(String queryEditorId, String queryPattern) {

    BooleanBuilder builder = new BooleanBuilder();
    QQueryHistory queryHistory = QQueryHistory.queryHistory;

    if(StringUtils.isNotEmpty(queryEditorId)) {
      builder = builder.and(queryHistory.queryEditor.id.eq(queryEditorId));
    }

    if(StringUtils.isNotEmpty(queryPattern)){
      builder = builder.and(queryHistory.query.containsIgnoreCase(queryPattern));
    }

    //exclude running, cancelled
    builder = builder.and(queryHistory.queryResultStatus.ne(QueryResult.QueryResultStatus.RUNNING))
            .and(queryHistory.queryResultStatus.ne(QueryResult.QueryResultStatus.CANCELLED))
            .and(queryHistory.queryResultStatus.isNotNull());

    builder = builder.and(queryHistory.deleted.eq(false));

    return builder;
  }

  /**
   * Audit 검색 관련 조건 정의
   *
   * @param queryEditorId QueryEditor ID
   * @return
   */
  public static Predicate searchList(String queryEditorId, String dataConnectionId, String searchKeyword,
                                     DateTime from, DateTime to, QueryResult.QueryResultStatus queryResultStatus) {

    BooleanBuilder builder = new BooleanBuilder();
    QQueryHistory queryHistory = QQueryHistory.queryHistory;

    if(StringUtils.isNotEmpty(queryEditorId)) {
      builder = builder.and(queryHistory.queryEditor.id.eq(queryEditorId));
    }

    if(StringUtils.isNotEmpty(dataConnectionId)) {
      builder = builder.and(queryHistory.dataConnectionId.eq(dataConnectionId));
    }

    if(StringUtils.isNotEmpty(searchKeyword)) {
      builder = builder.and(queryHistory.query.containsIgnoreCase(searchKeyword)
                      .or(queryHistory.createdBy.containsIgnoreCase(searchKeyword)));
    }

    if(queryResultStatus == null){
      builder = builder.and(queryHistory.queryResultStatus.ne(QueryResult.QueryResultStatus.RUNNING))
              .and(queryHistory.queryResultStatus.ne(QueryResult.QueryResultStatus.CANCELLED))
              .and(queryHistory.queryResultStatus.isNotNull());
    } else if (queryResultStatus != QueryResult.QueryResultStatus.ALL){
      builder = builder.and(queryHistory.queryResultStatus.eq(queryResultStatus));
    }

    if(from != null && to != null) {
      builder = builder.and(queryHistory.queryStartTime.between(from, to));
    }

    return builder;
  }
}
