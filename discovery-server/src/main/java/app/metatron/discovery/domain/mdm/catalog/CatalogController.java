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

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataPredicate;
import app.metatron.discovery.domain.mdm.MetadataProjections;
import app.metatron.discovery.domain.mdm.MetadataRepository;
import app.metatron.discovery.util.ProjectionUtils;

/**
 * Created by kyungtaak on 2016. 12. 21..
 */
@RepositoryRestController
public class CatalogController {

  private final static Logger LOGGER = LoggerFactory.getLogger(CatalogController.class);

  public final static String EMPTY_CATALOG = "__EMPTY";

  @Autowired
  CatalogService catalogService;

  @Autowired
  CatalogTreeService catalogTreeService;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  CatalogRepository catalogRepository;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  CatalogProjections catalogProjections = new CatalogProjections();

  MetadataProjections metadataProjections = new MetadataProjections();

  /**
   * 전체 카테고리를 조회합니다.
   */
  @RequestMapping(path = "/catalogs", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findCatalogs(@RequestParam(value = "nameContains", required = false) String nameContains,
                                 @RequestParam(value = "parentId", required = false) String parentId,
                                 @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
                                 @RequestParam(value = "from", required = false)
                                 @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                 @RequestParam(value = "to", required = false)
                                 @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                 @RequestParam(value = "projection", required = false, defaultValue = "default") String projection,
                                 PersistentEntityResourceAssembler resourceAssembler) {

    List result;
    if (StringUtils.isEmpty(parentId)) {
      result = catalogService.findAllCatalogs(nameContains, searchDateBy, from, to);
    } else {
      result = catalogService.findOnlySubCatalogs(parentId, nameContains, searchDateBy, from, to);
    }

    return ResponseEntity.ok(
        ProjectionUtils.toListResource(projectionFactory, catalogProjections.getProjectionByName(projection), result)
    );
  }

  /**
   * 카탈로그내 포함되어 있는 메타데이터를 조회합니다.
   */
  @RequestMapping(path = "/catalogs/{catalogId}/metadatas", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findMetadataInCatalog(@PathVariable("catalogId") String catalogId,
                                          @RequestParam(value = "nameContains", required = false) String nameContains,
                                          @RequestParam(value = "allSubCatalogs", required = false) Boolean allSubCatalogs,
                                          @RequestParam(value = "projection", required = false, defaultValue = "default") String projection,
                                          Pageable pageable) {

    List<String> subCatalogIds = null;
    if(BooleanUtils.isTrue(allSubCatalogs)) {
      subCatalogIds = catalogService.findAllSubCatalogs(catalogId, null, null, null, null)
                                    .stream()
                                    .map(catalog -> catalog.getId())
                                    .collect(Collectors.toList());
    }

    Page<Metadata> pages = metadataRepository.findAll(
        MetadataPredicate.searchList(null, catalogId, subCatalogIds, nameContains, null, null, null),
        pageable);


    return ResponseEntity.ok(pagedResourcesAssembler.toResource(
        ProjectionUtils.toPageResource(projectionFactory, metadataProjections.getProjectionByName(projection), pages)
    ));
  }

  /**
   * 카탈로그내 트리형태로 조회시 사용합니다.
   */
  @RequestMapping(path = "/catalogs/{catalogId}/tree", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> findCatalogForTree(@PathVariable("catalogId") String catalogId,
                                       @RequestParam(value = "includeAllHierarchies", required = false, defaultValue = "false") Boolean includeAllHierarchies) {

    if (!Catalog.ROOT.equals(catalogId) && catalogRepository.findOne(catalogId) == null) {
      throw new ResourceNotFoundException(catalogId);
    }

    if(includeAllHierarchies){
      return ResponseEntity.ok(catalogService.findHierarchies(catalogId));
    } else {
      return ResponseEntity.ok(catalogService.findSubCatalogsForTreeView(catalogId));
    }
  }

  @RequestMapping(path = {"/catalogs/{fromCatalogIds}/move", "/catalogs/{fromCatalogIds}/move/{toCatalogId}"}, method = RequestMethod.POST)
  public @ResponseBody
  ResponseEntity<?> move(@PathVariable("fromCatalogIds") List<String> fromCatalogIds,
                         @PathVariable("toCatalogId") Optional<String> toCatalogId) {

    for (String fromCatalogId : fromCatalogIds) {
      Catalog fromCatalog = catalogRepository.findOne(fromCatalogId);
      if (fromCatalog == null) {
        continue;
      }

      catalogService.move(fromCatalog, toCatalogId);

    }

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = {"/catalogs/{fromCatalogIds}/copy", "/catalogs/{fromCatalogIds}/copy/{toCatalogId}"}, method = RequestMethod.POST)
  public ResponseEntity<?> copyBook(@PathVariable("fromCatalogIds") String fromCatalogIds,
                                    @PathVariable("toCatalogId") Optional<String> toCatalogId,
                                    PersistentEntityResourceAssembler resourceAssembler) {

    Catalog fromCatalog = catalogRepository.findOne(fromCatalogIds);
    if (fromCatalog == null) {
      return ResponseEntity.notFound().build();
    }

    Catalog copiedCatalog = catalogService.copy(fromCatalog, toCatalogId);

    return ResponseEntity.ok(resourceAssembler.toResource(copiedCatalog));

  }

  @RequestMapping(path = "/catalogs/{catalogIds}", method = RequestMethod.DELETE)
  public @ResponseBody
  ResponseEntity<?> multiDelete(@PathVariable("catalogIds") List<String> catalogIds) {
    for (String catalogId : catalogIds) {
      Catalog deleteCatalog = catalogRepository.findOne(catalogId);
      if (deleteCatalog == null) {
        LOGGER.warn("Fail to find deleting catalog : {}", catalogId);
        continue;
      }

      catalogRepository.delete(deleteCatalog);
      catalogTreeService.deleteTree(deleteCatalog);
    }

    return ResponseEntity.noContent().build();
  }
}
