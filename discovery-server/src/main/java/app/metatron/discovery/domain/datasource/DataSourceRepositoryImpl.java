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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.querydsl.core.types.SubQueryExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;

import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.Sort;
import org.apache.lucene.search.SortField;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.FullTextQuery;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.BooleanJunction;
import org.hibernate.search.query.dsl.QueryBuilder;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;

import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.source.QMetadataSource;
import app.metatron.discovery.domain.workbook.QDashBoard;

/**
 * Created by kyungtaak on 2016. 12. 28..
 */
public class DataSourceRepositoryImpl extends QueryDslRepositorySupport implements DataSourceSearchRepository, DataSourceRepositoryExtends {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceRepositoryImpl.class);

  @Autowired
  private EntityManager entityManager;

  private Map<String, SortField> sortFieldMap = Maps.newHashMap();

  public DataSourceRepositoryImpl() {

    super(DataSource.class);

    sortFieldMap.put("alias", new SortField("sortAlias", SortField.Type.STRING));
    sortFieldMap.put("createdTime", new SortField("createdTime.mils", SortField.Type.STRING));
    sortFieldMap.put("modifiedTime", new SortField("modifiedTime.mils", SortField.Type.STRING));
  }

  @Override
  public Page<DataSource> findDataSources(DataSource.DataSourceType type, DataSource.ConnectionType connectionType,
                                          DataSource.SourceType sourceType, DataSource.Status status, Boolean published,
                                          String nameContains, Boolean linkedMetadata, String searchDateBy, DateTime from, DateTime to,
                                          Pageable pageable) {

    QDataSource dataSource = QDataSource.dataSource;
    QMetadataSource metadataSource = QMetadataSource.metadataSource;

    JPQLQuery<DataSource> query = from(dataSource);

    if (linkedMetadata != null) {

      SubQueryExpression<String> subQueryExpr = JPAExpressions.selectFrom(metadataSource)
                                                              .select(metadataSource.sourceId)
                                                              .where(metadataSource.type.eq(Metadata.SourceType.ENGINE));

      if (linkedMetadata) {
        query.where(dataSource.id.in(subQueryExpr));
      } else {
        query.where(dataSource.id.notIn(subQueryExpr));
      }
    } else {
      query = from(dataSource);
    }

    query.where(DataSourcePredicate.searchList(type, connectionType, sourceType, status,
                                               published, nameContains, searchDateBy, from, to));


    Long total = query.fetchCount();

    List<DataSource> contents;
    if (total > pageable.getOffset()) {
      query = getQuerydsl().applyPagination(pageable, query);
      contents = query.fetch();
    } else {
      contents = Lists.newArrayList();
    }

    return new PageImpl<>(contents, pageable, total);
  }

  @Override
  public List<String> findIdsByWorkbookIn(String workbookId) {
    QDashBoard qDashBoard = QDashBoard.dashBoard;

    JPQLQuery query = from(qDashBoard).select(qDashBoard.dataSources.any().id).distinct()
                                      .where(qDashBoard.workBook.id.eq(workbookId));

    return query.fetch();

  }

  @Override
  public List<String> findIdsByWorkbookInNotPublic(String workbookId) {
    QDashBoard qDashBoard = QDashBoard.dashBoard;
    QDataSource qDataSource = qDashBoard.dataSources.any();

    // FixMe: Query generation is complicated by null processing of "published" columns
    JPQLQuery query = from(qDashBoard).select(qDataSource.id).distinct()
                                      .where(qDashBoard.workBook.id.eq(workbookId),
                                             Expressions.anyOf(qDataSource.published.isNull(),
                                                               qDataSource.published.isFalse()));

    return query.fetch();

  }

  @Override
  public List<String> findIdsByWorkspaceIn(String workspaceId) {
    QDataSource qDataSource = QDataSource.dataSource;

    JPQLQuery query = from(qDataSource).select(qDataSource.id)
                                       .where(qDataSource.workspaces.any().id.eq(workspaceId));

    return query.fetch();

  }

  @Override
  public Page<DataSource> searchByKeyword(String keywords, Pageable pageable) {

    // Must be retrieved inside a transaction to take part of
    final FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

    // Prepare a search query builder
    final QueryBuilder queryBuilder = fullTextEntityManager.getSearchFactory().buildQueryBuilder().forEntity(DataSource.class).get();

    // This is a boolean junction... I'll add at least a keyword query
    final BooleanJunction<BooleanJunction> outer = queryBuilder.bool();
    outer.must(
        queryBuilder
            .keyword()
            .wildcard()
            .onFields("name", "description", "alias")
            .matching(keywords)
            .createQuery()
    );

    FullTextQuery fullTextQuery = fullTextEntityManager.createFullTextQuery(outer.createQuery(), DataSource.class);
    fullTextQuery.setFirstResult(pageable.getOffset());
    fullTextQuery.setMaxResults(pageable.getPageSize());
    fullTextQuery.setSort(getSearchSort(pageable));


    return new PageImpl<>(fullTextQuery.getResultList(), pageable, fullTextQuery.getResultSize());
  }

  @Override
  public Page<DataSource> searchByQuery(String query, Pageable pageable) {
    final FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

    LOGGER.info("Query : {}, Pageable: {}", query, pageable);
    FullTextQuery fullTextQuery;
    try {
      final QueryParser queryParser = new QueryParser("content", fullTextEntityManager.getSearchFactory().getAnalyzer(DataSource.class));
      fullTextQuery = fullTextEntityManager.createFullTextQuery(queryParser.parse(query), DataSource.class);
    } catch (ParseException e) {
      LOGGER.error("Fail to search query : {}", e.getMessage());
      throw new RuntimeException("Fail to search query : " + e.getMessage());
    }

    fullTextQuery.setFirstResult(pageable.getOffset());
    fullTextQuery.setMaxResults(pageable.getPageSize());
    fullTextQuery.setSort(getSearchSort(pageable));

    LOGGER.debug("FullTextQuery : {}", fullTextQuery);

    return new PageImpl<>(fullTextQuery.getResultList(), pageable, fullTextQuery.getResultSize());
  }

  private Sort getSearchSort(Pageable pageable) {

    if (pageable == null || pageable.getSort() == null) {
      return null;
    }

    List<SortField> sortFields = Lists.newArrayList();
    for (org.springframework.data.domain.Sort.Order sortOrder : pageable.getSort()) {

      sortFields.add(getAvailableSortField(sortOrder.getProperty(), sortOrder.getDirection()));
    }

    return new Sort(sortFields.toArray(new SortField[0]));
  }

  private SortField getAvailableSortField(String propertyName, org.springframework.data.domain.Sort.Direction direction) {

    if (sortFieldMap.containsKey(propertyName)) {
      SortField availableSortField = sortFieldMap.get(propertyName);

      boolean reverse = direction == org.springframework.data.domain.Sort.Direction.DESC ? true : false;
      if (availableSortField.getType() != null) {
        return new SortField(availableSortField.getField(), availableSortField.getType(), reverse);
      } else {
        return new SortField(availableSortField.getField(), availableSortField.getComparatorSource(), reverse);
      }

    } else {
      return sortFieldMap.get("modifiedTime");
    }
  }
}
