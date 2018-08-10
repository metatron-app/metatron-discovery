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
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.List;

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
}
