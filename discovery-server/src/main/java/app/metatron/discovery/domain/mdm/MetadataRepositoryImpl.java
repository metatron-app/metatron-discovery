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

import com.google.common.collect.Lists;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.jpa.JPQLQuery;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.List;

import app.metatron.discovery.domain.mdm.source.QMetadataSource;
import app.metatron.discovery.domain.tag.QTagDomain;

public class MetadataRepositoryImpl extends QueryDslRepositorySupport implements MetadataRepositoryExtends {

  public MetadataRepositoryImpl() {
    super(Metadata.class);
  }

  public Page<Metadata> searchMetadatas(Metadata.SourceType sourceType, String catalogId, String tag, String nameContains,
                                      String searchDateBy, DateTime from, DateTime to, Pageable pageable) {

    QMetadata qMetadata = QMetadata.metadata;
    QTagDomain qTagDomain = QTagDomain.tagDomain;

    JPQLQuery<Metadata> query;
    if(StringUtils.isNotEmpty(tag)) {
      query = from(qMetadata, qTagDomain).select(qMetadata)
          .where(qMetadata.id.eq(qTagDomain.domainId))
          .where(qTagDomain.tag.name.eq(tag));
    } else {
      query = from(qMetadata);
    }

    query.where(MetadataPredicate.searchList(sourceType, catalogId, null, nameContains, searchDateBy, from, to));

    Long total = query.fetchCount();

    List<Metadata> contents;
    if(total > pageable.getOffset()) {
      query = getQuerydsl().applyPagination(pageable, query);
      contents = query.fetch();
    } else {
      contents = Lists.newArrayList();
    }

    return new PageImpl<>(contents, pageable, total);

  }

  @Override
  public List<Metadata> findBySource(String sourceId, String schema, List<String> table) {
    QMetadata qMetadata = QMetadata.metadata;
    QMetadataSource qMetadataSource = qMetadata.source;

    JPQLQuery<Metadata> query = from(qMetadata).join(qMetadataSource).fetchJoin()
                                               .where(qMetadataSource.sourceId.eq(sourceId));

    if(StringUtils.isNotEmpty(schema)) {
      query.where(qMetadataSource.schema.eq(schema));
      if(CollectionUtils.isNotEmpty(table)) {
        query.where(qMetadataSource.table.in(table));
      }
    }

    return query.fetch();
  }

  @Override
  public List<Metadata> findBySource(List<String> sourceIds) {

    QMetadata qMetadata = QMetadata.metadata;
    QMetadataSource qMetadataSource = qMetadata.source;

    JPQLQuery query = from(qMetadata).distinct().join(qMetadataSource).fetchJoin()
                                               .where(qMetadataSource.sourceId.in(sourceIds));

    return query.fetch();
  }

  @Override
  public List<Metadata> findByName(String name) {
    QMetadata qMetadata = QMetadata.metadata;

    JPQLQuery query = from(qMetadata).distinct().where(qMetadata.name.eq(name));

    return query.fetch();
  }

  @Override
  public List<Metadata> findById(String id) {
    QMetadata qMetadata = QMetadata.metadata;

    JPQLQuery query = from(qMetadata).distinct().where(qMetadata.id.eq(id));

    return query.fetch();
  }

  @Override
  public List<MetadataStatsDto> countBySourceType() {
    NumberPath<Long> aliasCount = Expressions.numberPath(Long.class, "count");
    QMetadata qMetadata = QMetadata.metadata;

    return from(qMetadata)
        .select(Projections.constructor(MetadataStatsDto.class, qMetadata.sourceType, qMetadata.sourceType.count().as(aliasCount)))
        .groupBy(qMetadata.sourceType)
        .fetch();
  }
}
