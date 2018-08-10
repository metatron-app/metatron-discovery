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

import java.util.List;

public interface CatalogRepositoryExtends {

  /**
   * ROOT Catalog 조회 하기
   *
   * @param nameContains
   * @param searchDateBy
   * @param from
   * @param to
   * @return
   */
  List<Catalog> findRootSubCatalogs(String nameContains, String searchDateBy, DateTime from, DateTime to);

  /**
   * 하위 Catalog 가져오기
   *
   * @param catalogId
   * @return
   */
  List<Catalog> findSubCatalogs(String catalogId, String nameContains, String searchDateBy, DateTime from, DateTime to, Boolean onlySubCategory);

  /**
   * 하위 Catalog 개수 가져오기
   *
   * @param catalogId
   * @return
   */
  Long countOnlySubCatalogs(String catalogId);
}
