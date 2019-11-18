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

package app.metatron.discovery.domain.mdm.catalog;

import com.querydsl.jpa.JPQLQuery;

import org.apache.commons.lang3.BooleanUtils;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.ListJoin;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import app.metatron.discovery.domain.mdm.Metadata;

public class CatalogRepositoryImpl extends QueryDslRepositorySupport implements CatalogRepositoryExtends {

  public CatalogRepositoryImpl() {
    super(Catalog.class);
  }

  @Override
  public List<Catalog> findRootSubCatalogs(String nameContains, String searchDateBy, DateTime from, DateTime to) {
    QCatalog qCatalog = QCatalog.catalog;
    JPQLQuery query = from(qCatalog)
        .where(qCatalog.parentId.isNull())
        .where(CatalogPredicate.searchList(nameContains, searchDateBy, from, to))
        .orderBy(qCatalog.name.asc());

    return query.fetch();
  }

  @Override
  public List<Catalog> findSubCatalogs(String catalogId, String nameContains, String searchDateBy, DateTime from, DateTime to, Boolean onlySubCategory) {
    return makeQuerySubCatalogs(catalogId, nameContains, searchDateBy, from, to, onlySubCategory).fetch();
  }

  @Override
  public Long countOnlySubCatalogs(String catalogId) {
    return makeQuerySubCatalogs(catalogId, null, null, null, null, true).fetchCount();
  }

  private JPQLQuery makeQuerySubCatalogs(String catalogId, String nameContains, String searchDateBy, DateTime from, DateTime to, Boolean onlySubCategory) {

    QCatalog qCatalog = QCatalog.catalog;
    QCatalogTree qCatalogTree = QCatalogTree.catalogTree;

    JPQLQuery query = from(qCatalog, qCatalogTree);
    query.select(qCatalog);
    query.where(CatalogPredicate.searchList(nameContains, searchDateBy, from, to));
    query.where(qCatalog.id.eq(qCatalogTree.id.descendant),
                qCatalogTree.id.ancestor.eq(catalogId),
                qCatalogTree.depth.gt(0));

    if(BooleanUtils.isTrue(onlySubCategory)) {
      query.where(qCatalogTree.depth.lt(2));
    }

    query.orderBy(qCatalog.name.asc());

    return query;
  }

  @Override
  public Page<CatalogCountDTO> getCatalogsWithCount(String nameContains, Pageable pageable) {
    Long totalRows = countCatalogs(nameContains);

    CriteriaBuilder criteriaBuilder = getEntityManager().getCriteriaBuilder();
    CriteriaQuery<CatalogCountDTO> criteriaListQuery = criteriaBuilder.createQuery(CatalogCountDTO.class);

    Root<Catalog> rootCatalog = criteriaListQuery.from(Catalog.class);
    ListJoin<Catalog, Metadata> join = rootCatalog.joinList("metadatas", JoinType.LEFT);

    Path<String> catalogIdPath = rootCatalog.get("id");
    Path<String> catalogNamePath = rootCatalog.get("name");

    //select
    criteriaListQuery.select(criteriaBuilder.construct(CatalogCountDTO.class, catalogIdPath, catalogNamePath, criteriaBuilder.count(join).alias("metadataCnt")));

    //where
    List<Predicate> predicateList = new ArrayList<>();
    if(nameContains != null && !nameContains.isEmpty()){
      predicateList.add(criteriaBuilder.like(criteriaBuilder.upper(catalogNamePath), "%" + nameContains.toUpperCase() + "%"));
    }
    if(!predicateList.isEmpty()){
      criteriaListQuery.where(criteriaBuilder.and(predicateList.toArray(new Predicate[] {})));
    }

    //group by
    criteriaListQuery.groupBy(catalogIdPath, catalogNamePath);

    //order by
    List<Order> orderList = new ArrayList();
    //default order count desc, name asc
    orderList.add(criteriaBuilder.desc(criteriaBuilder.count(join)));
    orderList.add(criteriaBuilder.asc(catalogNamePath));
    criteriaListQuery.orderBy(orderList);

    TypedQuery<CatalogCountDTO> typedQuery = getEntityManager().createQuery(criteriaListQuery);

    Long firstRow = pageable.getPageSize() * pageable.getPageNumber() < totalRows
        ? pageable.getPageSize() * pageable.getPageNumber()
        : totalRows;

    //result
    List<CatalogCountDTO> results = typedQuery
        .setFirstResult(firstRow.intValue())
        .setMaxResults(pageable.getPageSize())
        .getResultList();
    return new PageImpl<CatalogCountDTO>(results, pageable, totalRows);
  }

  @Override
  public List<CatalogCountDTO> getCatalogsWithCount(String nameContains) {
    CriteriaBuilder criteriaBuilder = getEntityManager().getCriteriaBuilder();
    CriteriaQuery<CatalogCountDTO> criteriaListQuery = criteriaBuilder.createQuery(CatalogCountDTO.class);

    Root<Catalog> rootCatalog = criteriaListQuery.from(Catalog.class);
    ListJoin<Catalog, Metadata> join = rootCatalog.joinList("metadatas", JoinType.LEFT);

    Path<String> catalogIdPath = rootCatalog.get("id");
    Path<String> catalogNamePath = rootCatalog.get("name");

    //select
    criteriaListQuery.select(criteriaBuilder.construct(CatalogCountDTO.class, catalogIdPath, catalogNamePath, criteriaBuilder.count(join).alias("metadataCnt")));

    //where
    List<Predicate> predicateList = new ArrayList<>();
    if(nameContains != null && !nameContains.isEmpty()){
      predicateList.add(criteriaBuilder.like(criteriaBuilder.upper(catalogNamePath), "%" + nameContains.toUpperCase() + "%"));
    }
    if(!predicateList.isEmpty()){
      criteriaListQuery.where(criteriaBuilder.and(predicateList.toArray(new Predicate[] {})));
    }

    //group by
    criteriaListQuery.groupBy(catalogIdPath, catalogNamePath);

    TypedQuery<CatalogCountDTO> typedQuery = getEntityManager().createQuery(criteriaListQuery);

    //result
    List<CatalogCountDTO> results = typedQuery.getResultList();
    return results;
  }

  public Long countCatalogs(String nameContains){
    QCatalog qCatalog = QCatalog.catalog;
    JPQLQuery query = from(qCatalog);
    if(nameContains != null && !nameContains.isEmpty()){
      query.where(qCatalog.name.containsIgnoreCase(nameContains));
    }
    return query.fetchCount();
  }
}
