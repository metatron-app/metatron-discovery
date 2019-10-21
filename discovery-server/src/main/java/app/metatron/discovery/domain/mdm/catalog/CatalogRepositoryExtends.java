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

import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * The interface Catalog repository extends.
 */
public interface CatalogRepositoryExtends {

  /**
   * ROOT Catalog 조회 하기
   *
   * @param nameContains the name contains
   * @param searchDateBy the search date by
   * @param from         the from
   * @param to           the to
   * @return list list
   */
  List<Catalog> findRootSubCatalogs(String nameContains, String searchDateBy, DateTime from, DateTime to);

  /**
   * 하위 Catalog 가져오기
   *
   * @param catalogId       the catalog id
   * @param nameContains    the name contains
   * @param searchDateBy    the search date by
   * @param from            the from
   * @param to              the to
   * @param onlySubCategory the only sub category
   * @return list list
   */
  List<Catalog> findSubCatalogs(String catalogId, String nameContains, String searchDateBy, DateTime from, DateTime to, Boolean onlySubCategory);

  /**
   * 하위 Catalog 개수 가져오기
   *
   * @param catalogId the catalog id
   * @return long long
   */
  Long countOnlySubCatalogs(String catalogId);

  /**
   * Gets catalogs with used count through Pagination.
   *
   * @param nameContains the name contains
   * @param pageable     the pageable
   * @return the catalogs with count
   */
  Page<CatalogCountDTO> getCatalogsWithCount(String nameContains, Pageable pageable);

  /**
   * Gets catalogs with used count.
   *
   * @param nameContains the name contains
   * @return the catalogs with count
   */
  List<CatalogCountDTO> getCatalogsWithCount(String nameContains);
}
