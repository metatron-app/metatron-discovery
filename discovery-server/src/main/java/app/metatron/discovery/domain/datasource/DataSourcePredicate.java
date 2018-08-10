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
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import app.metatron.discovery.domain.workspace.Workspace;

public class DataSourcePredicate {

  /**
   * 데이터 소스 기본 검색 관련 조건 정의
   *
   * @param type type of datasource
   * @param connectionType type of connection
   * @param sourceType type of source
   * @param status engine status
   * @param published 전체 공개 여부
   * @param nameContains 데이터 소스 명 내 포함되는 문자
   * @param searchDateBy 일자 검색 기준 (생성일/수정일
   * @param from 검색 시작일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @param to 검색 종료일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @return
   */
  public static Predicate searchList(DataSource.DataSourceType type, DataSource.ConnectionType connectionType,
                                     DataSource.SourceType sourceType, DataSource.Status status,
                                     Boolean published, String nameContains,
                                     String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QDataSource dataSource = QDataSource.dataSource;

    if(type != null) {
      builder = builder.and(dataSource.dsType.eq(type));
    } else {
      builder = builder.and(dataSource.dsType.ne(DataSource.DataSourceType.VOLATILITY));
    }

    if(connectionType != null) {
      builder = builder.and(dataSource.connType.eq(connectionType));
    }

    if(sourceType != null) {
      builder = builder.and(dataSource.srcType.eq(sourceType));
    }

    if(status != null) {
      builder = builder.and(dataSource.status.eq(status));
    }

    if(published != null) {
      builder = builder.and(dataSource.published.eq(published));
    }

    if(from != null && to != null) {
      if(StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder = builder.and(dataSource.createdTime.between(from, to));
      } else {
        builder = builder.and(dataSource.modifiedTime.between(from, to));
      }
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(dataSource.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  /**
   * Workspace 내에서 사용가능한 데이터 소스 조회 조건 정의
   *
   * @param workspace
   * @param sourceType
   * @param connectionType
   * @param onlyPublic
   * @param nameContains
   * @return
   */
  public static Predicate searchAvailableDatasourcesInWorkspace(Workspace workspace,
                                                                DataSource.DataSourceType sourceType,
                                                                DataSource.ConnectionType connectionType,
                                                                Boolean onlyPublic,
                                                                String nameContains) {

    QDataSource dataSource = QDataSource.dataSource;

    BooleanExpression published = dataSource.id
        .in(JPAExpressions.select(dataSource.id)
                          .from(dataSource)
                          .where(dataSource.published.eq(true)));

    BooleanBuilder builder = new BooleanBuilder();

    if (BooleanUtils.isTrue(onlyPublic)) {
      builder.and(published);
    } else {
      BooleanExpression workspaceContains = dataSource.id
          .in(JPAExpressions.select(dataSource.id)
                            .from(dataSource)
                            .innerJoin(dataSource.workspaces)
                            .where(dataSource.workspaces.any().eq(workspace)));
      builder.andAnyOf(workspaceContains, published);
    }

    // Source Type 별 조회
    if (sourceType != null) {
      builder.and(dataSource.dsType.eq(sourceType));
    }

    // Connection Type 별 조회
    if (connectionType != null) {
      builder.and(dataSource.connType.eq(connectionType));
    }

    // Datasource 명 검색
    if (StringUtils.isNotEmpty(nameContains)) {
      builder.and(dataSource.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

}
