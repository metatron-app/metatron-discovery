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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@Component
@Transactional(readOnly = true)
public class CatalogService {

  @Autowired
  CatalogService catalogService;

  @Autowired
  CatalogTreeService catalogTreeService;

  @Autowired
  CatalogRepository catalogRepository;

  public List<Catalog> findAllCatalogs(String nameContains, String searchDateBy, DateTime from, DateTime to) {
    return Lists.newArrayList(
        catalogRepository.findAll(CatalogPredicate.searchList(nameContains, searchDateBy, from, to)));
  }

  public List<Catalog> findOnlySubCatalogs(String catalogId, String nameContains, String searchDateBy, DateTime from, DateTime to) {
    if (catalogId == null || Catalog.ROOT.equals(catalogId)) {
      return catalogRepository.findRootSubCatalogs(nameContains, searchDateBy, from, to);
    } else {
      return catalogRepository.findSubCatalogs(catalogId, nameContains, searchDateBy, from, to, true);
    }
  }

  public List<Catalog> findAllSubCatalogs(String catalogId, String nameContains, String searchDateBy, DateTime from, DateTime to) {
    return catalogRepository.findSubCatalogs(catalogId, nameContains, searchDateBy, from, to, false);
  }

  /**
   * TreeView Projection 을 위한 처리
   */
  public List<Map<String, Object>> findSubCatalogsForTreeView(String catalogId) {

    List<Catalog> catalogs = findOnlySubCatalogs(catalogId, null, null, null, null);

    return catalogs.stream()
                   .map(catalog -> catalog.getTreeView(this))
                   .collect(Collectors.toList());

  }

  public boolean existSubCatalogs(String catalogId) {
    return countSubCatalogs(catalogId) > 0 ? true : false;
  }

  public Long countSubCatalogs(String catalogId) {
    return catalogRepository.countOnlySubCatalogs(catalogId);
  }

  public List<Map<String, String>> findHierarchies(String catalogId) {

    List<Catalog> books = catalogRepository.findAllAncestors(catalogId);

    return books.stream()
                .map(catalog -> {
                  Map<String, String> map = Maps.newLinkedHashMap();
                  map.put("id", catalog.getId());
                  map.put("name", catalog.getName());
                  return map;
                })
                .collect(Collectors.toList());
  }

  @Transactional
  public Catalog copy(Catalog sourceCatalog, Optional<String> toCatalogId) {

    if (!toCatalogId.isPresent() && catalogRepository.findOne(toCatalogId.get()) == null) {
      throw new IllegalArgumentException("Not found catalog to copy : " + toCatalogId);
    }

    // toCatalogId 가 존재하지 않을 경우 같은 Catalog 에 복사하고,
    // Catalog 명이 "Copy of" Prefix를 붙여줍니다.
    Catalog copiedCatalog = sourceCatalog.copyOf(toCatalogId);

    catalogRepository.saveAndFlush(copiedCatalog);
    catalogTreeService.createTree(copiedCatalog);

    return copiedCatalog;

  }

  @Transactional
  public Catalog move(Catalog moveCatalog, Optional<String> toCatalogId) {

    if (!toCatalogId.isPresent()
        && !Catalog.ROOT.equals(toCatalogId.get())
        && catalogRepository.findOne(toCatalogId.get()) == null) {
      throw new IllegalArgumentException("Not found catalog to move : " + toCatalogId);
    }

    if (!toCatalogId.isPresent() || Catalog.ROOT.equals(toCatalogId.get())) {
      moveCatalog.setParentId(null);
    } else {
      moveCatalog.setParentId(toCatalogId.get());
    }

    catalogTreeService.editTree(moveCatalog);

    return catalogRepository.save(moveCatalog);
  }

}
