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

package app.metatron.discovery.domain.tag;

import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPADeleteClause;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import app.metatron.discovery.common.entity.DomainType;

public class TagRepositoryImpl extends QueryDslRepositorySupport implements TagRepositoryExtends {

  public TagRepositoryImpl() {
    super(Tag.class);
  }

  private static final Logger LOGGER = LoggerFactory.getLogger(TagRepositoryImpl.class);

  @Override
  public Tag findByTagNameAndDomain(Tag.Scope scope, DomainType domainType, String name) {

    QTag qTag = QTag.tag;
    JPQLQuery<Tag> query = from(qTag).where(qTag.scope.eq(scope));

    if (scope == Tag.Scope.DOMAIN) {
      query.where(qTag.domainType.eq(domainType));
    }

    query.where(qTag.name.eq(name));

    return query.fetchOne();
  }

  @Override
  public List<Tag> findByTagsNameAndDomain(Tag.Scope scope, DomainType domainType, String nameContains) {

    QTag qTag = QTag.tag;
    JPQLQuery<Tag> query = from(qTag).where(qTag.scope.eq(scope));

    if (scope == Tag.Scope.DOMAIN) {
      query.where(qTag.domainType.eq(domainType));
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      query.where(qTag.name.contains(nameContains));
    }

    return query.fetch();
  }

  public List<Tag> findByTagsInDomainItem(Tag.Scope scope, DomainType domainType, String domainId) {
    QTagDomain qTagDomain = QTagDomain.tagDomain;
    QTag qTag = qTagDomain.tag;
    JPQLQuery<Tag> query = from(qTagDomain).innerJoin(qTag)
                                           .select(qTag)
                                           .where(qTagDomain.domainType.eq(domainType),
                                                  qTagDomain.domainId.eq(domainId),
                                                  qTag.scope.eq(scope));

    return query.fetch();
  }

  @Override
  public long detachTag(Tag.Scope scope, DomainType domainType, String domainId, List<String> tags) {
    QTagDomain qTagDomain = QTagDomain.tagDomain;

    JPQLQuery<Long> subQuery = JPAExpressions.selectFrom(qTagDomain)
                  .select(qTagDomain.id)
                  .where(qTagDomain.domainType.eq(domainType),
                         qTagDomain.domainId.eq(domainId));

    if(CollectionUtils.isNotEmpty(tags)) {
      subQuery.where(qTagDomain.tag.name.in(tags));
    }

    JPQLQuery<TagDomain> selectQuery = from(qTagDomain).where(qTagDomain.id.in(subQuery));
    List<TagDomain> list = selectQuery.fetch();
    List<Long> tagDomainIdList = list.stream()
                                     .map(tagDomain -> tagDomain.getId())
                                     .collect(Collectors.toList());

    JPADeleteClause deleteClause = delete(qTagDomain).where(qTagDomain.id.in(tagDomainIdList));
    return deleteClause.execute();
  }

  @Override
  public List<TagCountDTO> findTagsWithCount(Tag.Scope scope, DomainType domainType, String nameContains,
                                             boolean includeEmpty, Sort sort) {
    CriteriaBuilder criteriaBuilder = getEntityManager().getCriteriaBuilder();
    CriteriaQuery<TagCountDTO> criteriaListQuery = criteriaBuilder.createQuery(TagCountDTO.class);

    Root<Tag> rootTag = criteriaListQuery.from(Tag.class);
    Join<Tag, TagDomain> join = rootTag.join("domains", includeEmpty ? JoinType.LEFT : JoinType.INNER);

    Path<String> tagIdPath = rootTag.get("id");
    Path<String> tagNamePath = rootTag.get("name");
    Path<Tag.Scope> tagScopePath = rootTag.get("scope");
    Path<DomainType> tagDomainTypePath = rootTag.get("domainType");
    Path<Tag> tagPath = join.get("tag");

    //join
    join.on(criteriaBuilder.equal(tagIdPath, tagPath));

    //select
    criteriaListQuery.select(criteriaBuilder.construct(TagCountDTO.class, tagIdPath, tagNamePath, criteriaBuilder.count(join).alias("domainCnt")));

    //where
    List<Predicate> predicateList = new ArrayList<>();
    if(scope != null){
      predicateList.add(criteriaBuilder.equal(tagScopePath, scope));
    }
    if(domainType != null){
      predicateList.add(criteriaBuilder.equal(tagDomainTypePath, domainType));
    }
    if(nameContains != null && !nameContains.isEmpty()){
      predicateList.add(criteriaBuilder.like(criteriaBuilder.upper(tagNamePath), "%" + nameContains.toUpperCase() + "%"));
    }
    if(!predicateList.isEmpty()){
      criteriaListQuery.where(criteriaBuilder.and(predicateList.toArray(new Predicate[] {})));
    }

    //group by
    criteriaListQuery.groupBy(tagIdPath, tagNamePath);

    //order by
    List<Order> orderList = new ArrayList();
    if(sort != null){
      Sort.Order nameOrder = sort.getOrderFor("name");
      if(nameOrder != null){
        if(nameOrder.isAscending()){
          orderList.add(criteriaBuilder.asc(tagNamePath));
        } else {
          orderList.add(criteriaBuilder.desc(tagNamePath));
        }
        orderList.add(criteriaBuilder.desc(criteriaBuilder.count(join)));
      }
    }
    //default order count desc, name asc
    if(orderList.isEmpty()){
      orderList.add(criteriaBuilder.desc(criteriaBuilder.count(join)));
      orderList.add(criteriaBuilder.asc(tagNamePath));
    }
    criteriaListQuery.orderBy(orderList);

    //result
    List<TagCountDTO> results = getEntityManager().createQuery(criteriaListQuery).getResultList();
    return results;
  }

  @Override
  public Page<TagCountDTO> findTagsWithCount(Tag.Scope scope, DomainType domainType, String nameContains,
                                             boolean includeEmpty, Pageable pageable) {
    Long totalRows = this.countTags(scope, domainType, nameContains, includeEmpty);

    CriteriaBuilder criteriaBuilder = getEntityManager().getCriteriaBuilder();
    CriteriaQuery<TagCountDTO> criteriaListQuery = criteriaBuilder.createQuery(TagCountDTO.class);

    Root<Tag> rootTag = criteriaListQuery.from(Tag.class);
    Join<Tag, TagDomain> join = rootTag.join("domains", includeEmpty ? JoinType.LEFT : JoinType.INNER);

    Path<String> tagIdPath = rootTag.get("id");
    Path<String> tagNamePath = rootTag.get("name");
    Path<Tag.Scope> tagScopePath = rootTag.get("scope");
    Path<DomainType> tagDomainTypePath = rootTag.get("domainType");
    Path<Tag> tagPath = join.get("tag");

    //join
    join.on(criteriaBuilder.equal(tagIdPath, tagPath));

    //select
    criteriaListQuery.select(criteriaBuilder.construct(TagCountDTO.class, tagIdPath, tagNamePath, criteriaBuilder.count(join).alias("domainCnt")));

    //where
    List<Predicate> predicateList = new ArrayList<>();
    if(scope != null){
      predicateList.add(criteriaBuilder.equal(tagScopePath, scope));
    }
    if(domainType != null){
      predicateList.add(criteriaBuilder.equal(tagDomainTypePath, domainType));
    }
    if(nameContains != null && !nameContains.isEmpty()){
      predicateList.add(criteriaBuilder.like(criteriaBuilder.upper(tagNamePath), "%" + nameContains.toUpperCase() + "%"));
    }
    if(!predicateList.isEmpty()){
      criteriaListQuery.where(criteriaBuilder.and(predicateList.toArray(new Predicate[] {})));
    }

    //group by
    criteriaListQuery.groupBy(tagIdPath, tagNamePath);

    //order by
    List<Order> orderList = new ArrayList();
    if(pageable != null && pageable.getSort() != null){
      Sort.Order nameOrder = pageable.getSort().getOrderFor("name");
      if(nameOrder != null){
        if(nameOrder.isAscending()){
          orderList.add(criteriaBuilder.asc(tagNamePath));
        } else {
          orderList.add(criteriaBuilder.desc(tagNamePath));
        }
        orderList.add(criteriaBuilder.desc(criteriaBuilder.count(join)));
      }
    }
    //default order count desc, name asc
    if(orderList.isEmpty()){
      orderList.add(criteriaBuilder.desc(criteriaBuilder.count(join)));
      orderList.add(criteriaBuilder.asc(tagNamePath));
    }
    criteriaListQuery.orderBy(orderList);

    TypedQuery<TagCountDTO> typedQuery = getEntityManager().createQuery(criteriaListQuery);

    Long firstRow = pageable.getPageSize() * pageable.getPageNumber() < totalRows
        ? pageable.getPageSize() * pageable.getPageNumber()
        : totalRows;

    //result
    List<TagCountDTO> results = typedQuery
        .setFirstResult(firstRow.intValue())
        .setMaxResults(pageable.getPageSize())
        .getResultList();
    return new PageImpl<TagCountDTO>(results, pageable, totalRows);
  }

  @Override
  public Long countTags(Tag.Scope scope, DomainType domainType, String nameContains, boolean includeEmpty) {
    CriteriaBuilder criteriaBuilder = getEntityManager().getCriteriaBuilder();
    CriteriaQuery<Long> criteriaCountQuery = criteriaBuilder.createQuery(Long.class);

    Root<Tag> rootTag = criteriaCountQuery.from(Tag.class);
    Join<Tag, TagDomain> join = rootTag.join("domains", includeEmpty ? JoinType.LEFT : JoinType.INNER);

    Path<String> tagIdPath = rootTag.get("id");
    Path<String> tagNamePath = rootTag.get("name");
    Path<Tag.Scope> tagScopePath = rootTag.get("scope");
    Path<DomainType> tagDomainTypePath = rootTag.get("domainType");
    Path<Tag> tagPath = join.get("tag");

    //join
    join.on(criteriaBuilder.equal(tagIdPath, tagPath));

    criteriaCountQuery.select(criteriaBuilder.countDistinct(tagIdPath));

    //where
    List<Predicate> predicateList = new ArrayList<>();
    if(scope != null){
      predicateList.add(criteriaBuilder.equal(tagScopePath, scope));
    }
    if(domainType != null){
      predicateList.add(criteriaBuilder.equal(tagDomainTypePath, domainType));
    }
    if(nameContains != null && !nameContains.isEmpty()){
      predicateList.add(criteriaBuilder.like(criteriaBuilder.upper(tagNamePath), "%" + nameContains.toUpperCase() + "%"));
    }
    if(!predicateList.isEmpty()){
      criteriaCountQuery.where(criteriaBuilder.and(predicateList.toArray(new Predicate[] {})));
    }

    TypedQuery<Long> typedCountQuery = getEntityManager().createQuery(criteriaCountQuery);
    return typedCountQuery.getSingleResult();
  }
}
