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

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.List;

import app.metatron.discovery.domain.workspace.Workspace;

public class DataSourcePredicate {

  /**
   * 데이터 소스 기본 검색 관련 조건 정의
   *
   * @param type           type of datasource
   * @param connectionType type of connection
   * @param sourceType     type of source
   * @param status         engine status
   * @param published      전체 공개 여부
   * @param nameContains   데이터 소스 명 내 포함되는 문자
   * @param searchDateBy   일자 검색 기준 (생성일/수정일
   * @param from           검색 시작일자, yyyy-MM-ddThh:mm:ss.SSSZ
   * @param to             검색 종료일자, yyyy-MM-ddThh:mm:ss.SSSZ
   */
  public static Predicate searchList(DataSource.DataSourceType type, DataSource.ConnectionType connectionType,
                                     DataSource.SourceType sourceType, DataSource.Status status,
                                     Boolean published, String nameContains,
                                     String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QDataSource dataSource = QDataSource.dataSource;

    if (type != null) {
      builder = builder.and(dataSource.dsType.eq(type));
    } else {
      builder = builder.and(dataSource.dsType.ne(DataSource.DataSourceType.VOLATILITY));
    }

    if (connectionType != null) {
      builder = builder.and(dataSource.connType.eq(connectionType));
    }

    if (sourceType != null) {
      builder = builder.and(dataSource.srcType.eq(sourceType));
    }

    if (status != null) {
      builder = builder.and(dataSource.status.eq(status));
    }

    if (published != null) {
      builder = builder.and(dataSource.published.eq(published));
    }

    if (from != null && to != null) {
      if (StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder = builder.and(dataSource.createdTime.between(from, to));
      } else {
        builder = builder.and(dataSource.modifiedTime.between(from, to));
      }
    }

    if (StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(dataSource.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  /**
   * Workspace 내에서 사용가능한 데이터 소스 조회 조건 정의
   */
  public static Predicate searchDatasourcesInWorkspace(Workspace workspace,
                                                       DataSource.DataSourceType sourceType,
                                                       DataSource.ConnectionType connectionType,
                                                       List<DataSource.Status> status,
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

    if (CollectionUtils.isNotEmpty(status)) {
      builder.and(dataSource.status.in(status));
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

  public static Predicate searchList(List<DataSource.Status> statuses,
                                     List<String> workspaces,
                                     List<String> createdBys,
                                     DateTime createdTimeFrom,
                                     DateTime createdTimeTo,
                                     DateTime modifiedTimeFrom,
                                     DateTime modifiedTimeTo,
                                     String containsText,
                                     List<DataSource.DataSourceType> dataSourceTypes,
                                     List<DataSource.SourceType> sourceTypes,
                                     List<DataSource.ConnectionType> connectionTypes,
                                     List<Boolean> published) {
    BooleanBuilder builder = new BooleanBuilder();
    QDataSource dataSource = QDataSource.dataSource;

    //Status
    if (statuses != null && !statuses.isEmpty()) {
      BooleanBuilder subBuilder = new BooleanBuilder();
      for (DataSource.Status status : statuses) {
        subBuilder = subBuilder.or(dataSource.status.eq(status));
      }
      builder = builder.and(subBuilder);
    }

    //DataSourceType
    if (dataSourceTypes != null && !dataSourceTypes.isEmpty()) {
      BooleanBuilder subBuilder = new BooleanBuilder();
      for (DataSource.DataSourceType dataSourceType : dataSourceTypes) {
        subBuilder = subBuilder.or(dataSource.dsType.eq(dataSourceType));
      }
      builder = builder.and(subBuilder);
    } else {
      builder = builder.and(dataSource.dsType.ne(DataSource.DataSourceType.VOLATILITY));
    }

    //SourceType
    if (sourceTypes != null && !sourceTypes.isEmpty()) {
      BooleanBuilder subBuilder = new BooleanBuilder();
      for (DataSource.SourceType sourceType : sourceTypes) {
        subBuilder = subBuilder.or(dataSource.srcType.eq(sourceType));
      }
      builder = builder.and(subBuilder);
    }

    //ConnectionType
    if (connectionTypes != null && !connectionTypes.isEmpty()) {
      BooleanBuilder subBuilder = new BooleanBuilder();
      for (DataSource.ConnectionType connectionType : connectionTypes) {
        subBuilder = subBuilder.or(dataSource.connType.eq(connectionType));
      }
      builder = builder.and(subBuilder);
    }

    //CreatedBy
    if (createdBys != null && !createdBys.isEmpty()) {
      BooleanBuilder subBuilder = new BooleanBuilder();
      for (String createdBy : createdBys) {
        subBuilder = subBuilder.or(dataSource.createdBy.eq(createdBy));
      }
      builder = builder.and(subBuilder);
    }

    //containsText
    if (StringUtils.isNotEmpty(containsText)) {
      builder = builder.andAnyOf(dataSource.name.containsIgnoreCase(containsText),
                                 dataSource.description.containsIgnoreCase(containsText));
    }

    //createdTime
    if (createdTimeFrom != null && createdTimeTo != null) {
      builder = builder.and(dataSource.createdTime.between(createdTimeFrom, createdTimeTo));
    } else if (createdTimeFrom != null) {
      builder = builder.and(dataSource.createdTime.goe(createdTimeFrom));
    } else if (createdTimeTo != null) {
      builder = builder.and(dataSource.createdTime.loe(createdTimeTo));
    }

    //modifiedTime
    if (modifiedTimeFrom != null && modifiedTimeTo != null) {
      builder = builder.and(dataSource.modifiedTime.between(modifiedTimeFrom, modifiedTimeTo));
    } else if (modifiedTimeFrom != null) {
      builder = builder.and(dataSource.modifiedTime.goe(modifiedTimeFrom));
    } else if (modifiedTimeTo != null) {
      builder = builder.and(dataSource.modifiedTime.loe(modifiedTimeTo));
    }

    //published
    if (published != null && !published.isEmpty() && workspaces != null && !workspaces.isEmpty()) {
      BooleanBuilder subBuilder = new BooleanBuilder();
      for (Boolean publishedBoolean : published) {
        subBuilder = subBuilder.or(dataSource.published.eq(publishedBoolean));
      }
      subBuilder = subBuilder.or(dataSource.id.in(JPAExpressions.select(dataSource.id)
                                                                .from(dataSource)
                                                                .innerJoin(dataSource.workspaces)
                                                                .where(dataSource.workspaces.any().id.in(workspaces))));
      builder.and(subBuilder);
    } else if (published != null && !published.isEmpty()) {
      BooleanBuilder subBuilder = new BooleanBuilder();
      for (Boolean publishedBoolean : published) {
        subBuilder = subBuilder.or(dataSource.published.eq(publishedBoolean));
      }
      builder.and(subBuilder);
    } else if (workspaces != null && !workspaces.isEmpty()) {
      BooleanExpression workspaceContains = dataSource.id
          .in(JPAExpressions.select(dataSource.id)
                            .from(dataSource)
                            .innerJoin(dataSource.workspaces)
                            .where(dataSource.workspaces.any().id.in(workspaces)));
      builder.and(workspaceContains);
    }

    return builder;
  }

}
