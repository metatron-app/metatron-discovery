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

package app.metatron.discovery.domain.audit;

import com.google.common.collect.Lists;

import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.jpa.JPQLQuery;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.Iterator;
import java.util.List;

public class AuditRepositoryImpl extends QueryDslRepositorySupport implements AuditRepositoryCustom{
  public AuditRepositoryImpl(){
    super(Audit.class);
  }

  @Override
  public List<AuditStatsDto> countByUser(Predicate predicate) {
    NumberPath<Long> aliasCount = Expressions.numberPath(Long.class, "userCount");
    QAudit qAudit = QAudit.audit;

    return from(qAudit)
            .select(Projections.constructor(AuditStatsDto.class, qAudit.user, qAudit.user.count().as(aliasCount)))
            .where(predicate)
            .groupBy(qAudit.user)
            .orderBy(aliasCount.desc())
            .fetch();
  }

  @Override
  public List<AuditStatsDto> countStatusByDate(Predicate predicate) {
    NumberPath<Long> aliasDate = Expressions.numberPath(Long.class, "date");
    QAudit qAudit = QAudit.audit;
    Expression<String> groupDateExpr = qAudit.startTime.year().stringValue()
                                                       .concat(qAudit.startTime.dayOfYear().stringValue());

    Expression<String> selectDateExpr = qAudit.startTime.year().stringValue()
                                                        .concat(qAudit.startTime.dayOfYear().stringValue())
                                                        .as("date");

    return from(qAudit)
            .select(Projections.constructor(AuditStatsDto.class, selectDateExpr, qAudit.status, qAudit.count()))
            .where(predicate)
            .groupBy(groupDateExpr, qAudit.status)
            .orderBy(aliasDate.asc())
            .fetch();
  }

  @Override
  public Page<AuditStatsDto> countByStatus(Predicate predicate, Pageable pageable) {
    NumberPath<Long> aliasCount = Expressions.numberPath(Long.class, "statusCount");
    QAudit qAudit = QAudit.audit;

    JPQLQuery countQuery = from(qAudit)
                          .select(Projections.constructor(AuditStatsDto.class, qAudit.query, qAudit.count().as(aliasCount)))
                          .where(predicate)
                          .groupBy(qAudit.query);

    JPQLQuery listQuery = from(qAudit)
            .select(Projections.constructor(AuditStatsDto.class, qAudit.query, qAudit.count().as(aliasCount)))
            .where(predicate)
            .groupBy(qAudit.query);

    if(pageable != null){
      //Pagination 적용
      listQuery.offset((long)pageable.getOffset());
      listQuery.limit((long)pageable.getPageSize());

      //Sort 적용 (기본값은 count, query 내림차순)
      Sort sort = pageable.getSort();
      if(sort == null){
        listQuery.orderBy(aliasCount.desc(), qAudit.query.desc());
      } else {
        Iterator<Sort.Order> sortIterator = sort.iterator();
        while(sortIterator.hasNext()){
          Sort.Order order = sortIterator.next();
          if(order.getProperty().equals(AuditStatsDto.SORT_STATUS_COUNT)){
            listQuery.orderBy(order.isAscending() ? aliasCount.asc() : aliasCount.desc());
          } else if(order.getProperty().equals(AuditStatsDto.SORT_QUERY)){
            listQuery.orderBy(order.isAscending() ? qAudit.query.asc() : qAudit.query.desc());
          }
        }
      }
    }

    Long total = countQuery.fetchCount();
    List<AuditStatsDto> content = total > pageable.getOffset() ? listQuery.fetch() : Lists.newArrayList();
    return new PageImpl<>(content, pageable, total);
  }

  @Override
  public Page<AuditStatsDto> sumResourceByQueue(Predicate predicate, Pageable pageable) {
    NumberPath<Long> aliasMemory = Expressions.numberPath(Long.class, "incrementMemorySeconds");
    NumberPath<Long> aliasVCore = Expressions.numberPath(Long.class, "incrementVcoreSeconds");
    NumberPath<Long> aliasCount = Expressions.numberPath(Long.class, "queueCount");

    QAudit qAudit = QAudit.audit;

    JPQLQuery countQuery = from(qAudit)
                          .select(Projections.constructor(AuditStatsDto.class, qAudit.queue, qAudit.count().as(aliasCount)
                                  , qAudit.incrementMemorySeconds.sum().as(aliasMemory), qAudit.incrementVcoreSeconds.sum().as(aliasVCore)))
                          .where(predicate).where(qAudit.queue.isNotNull())
                          .groupBy(qAudit.queue);

    JPQLQuery listQuery = from(qAudit)
            .select(Projections.constructor(AuditStatsDto.class, qAudit.queue, qAudit.count().as(aliasCount),
                    qAudit.incrementMemorySeconds.sum().as(aliasMemory), qAudit.incrementVcoreSeconds.sum().as(aliasVCore)))
            .where(predicate)
            .where(qAudit.queue.isNotNull())
            .groupBy(qAudit.queue);

    if(pageable != null){
      //Pagination 적용
      listQuery.offset((long)pageable.getOffset());
      listQuery.limit((long)pageable.getPageSize());

      //Sort 적용 (기본값은 memory, cpu, queue 내림차순)
      Sort sort = pageable.getSort();
      if(sort == null){
        listQuery.orderBy(aliasMemory.desc(), aliasVCore.desc(), qAudit.queue.desc());
      } else {
        Iterator<Sort.Order> sortIterator = sort.iterator();
        while(sortIterator.hasNext()){
          Sort.Order order = sortIterator.next();
          if(order.getProperty().equals(AuditStatsDto.SORT_SUM_MEMORY)){
            listQuery.orderBy(order.isAscending() ? aliasMemory.asc() : aliasMemory.desc());
          } else if(order.getProperty().equals(AuditStatsDto.SORT_SUM_VCORE)){
            listQuery.orderBy(order.isAscending() ? aliasVCore.asc() : aliasVCore.desc());
          } else if(order.getProperty().equals(AuditStatsDto.SORT_QUEUE)) {
            listQuery.orderBy(order.isAscending() ? qAudit.queue.asc() : qAudit.queue.desc());
          }
        }
      }
    }

    Long total = countQuery.fetchCount();
    List<AuditStatsDto> content = total > pageable.getOffset() ? listQuery.fetch() : Lists.newArrayList();

    return new PageImpl<>(content, pageable, total);
  }

}
