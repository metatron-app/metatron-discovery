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

package app.metatron.discovery.domain.datasource.connection;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

public class DataConnectionPredicate {

  /**
   * 데이터 소스 기본 검색 관련 조건 정의
   *
   * @param namePattern DataConnection 명 내 포함되는 문자
   * @param sourceType DataConnection Source Type(File, JDBC)
   * @param implementor DataConnection DB Type
   * @param searchDateBy 일자 검색 기준 (생성일/수정일)
   * @param from 검색 시작일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @param to 검색 종료일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @return
   */
  public static Predicate searchList(String namePattern,
                                     DataConnection.SourceType sourceType,
                                     DataConnection.Implementor implementor,
                                     String searchDateBy, DateTime from, DateTime to,
                                     DataConnection.AuthenticationType authenticationType) {

    QDataConnection dataConnection = QDataConnection.dataConnection;

    BooleanBuilder builder = new BooleanBuilder();

    if(sourceType != null) {
      builder.and(dataConnection.type.eq(sourceType));
    }

    if(implementor != null){
      builder.and(dataConnection.implementor.eq(implementor.toString()));
    }

    if(authenticationType != null){
      builder.and(dataConnection.authenticationType.eq(authenticationType));
    }

    if(StringUtils.isNotEmpty(namePattern)) {
      builder.and(dataConnection.name.containsIgnoreCase(namePattern));
    }

    if(from != null && to != null) {
      if(StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder = builder.and(dataConnection.createdTime.between(from, to));
      } else {
        builder = builder.and(dataConnection.modifiedTime.between(from, to));
      }
    }

    return builder;
  }

  /**
   * 데이터 소스 기본 검색 관련 조건 정의
   *
   * @param namePattern DataConnection 명 내 포함되는 문자
   * @param sourceType DataConnection Source Type(File, JDBC)
   * @param implementor DataConnection DB Type
   * @param workspaceId 조회 기준이 되는 workspace
   * @return
   */
  public static Predicate searchListForWorkspace(String namePattern,
                                     DataConnection.SourceType sourceType,
                                     DataConnection.Implementor implementor,
                                     DataConnection.AuthenticationType authenticationType,
                                     String workspaceId) {

    QDataConnection dataConnection = QDataConnection.dataConnection;

    BooleanBuilder builder = (BooleanBuilder) searchList(namePattern, sourceType, implementor,
            null, null, null, authenticationType);

    //특정 Workspace일 경우
    if(StringUtils.isNotEmpty(workspaceId)){
      //전체공개된 모든 Connection OR 해당 workspace에만 공개된 Connection
      builder = builder.and(dataConnection.published.isTrue()
              .or(dataConnection.workspaces.any().id.eq(workspaceId)));
    }

    return builder;
  }

}
