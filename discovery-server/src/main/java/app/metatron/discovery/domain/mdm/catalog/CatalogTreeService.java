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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Created by kyungtaak on 2016. 12. 21..
 */
@Component
@Transactional(readOnly = true)
public class CatalogTreeService {

  private static Logger LOGGER = LoggerFactory.getLogger(CatalogTreeService.class);

  @Autowired
  CatalogRepository catalogRepository;

  @Autowired
  CatalogTreeRepository catalogTreeRepository;

  public CatalogTreeService() {
  }

  @Transactional
  public void createSelfTree(Catalog catalog) {
    CatalogTree tree = new CatalogTree(catalog.getId(), catalog.getId(), 0);
    catalogTreeRepository.save(tree);
  }

  @Transactional
  public void createTree(Catalog catalog) {
    List<CatalogTree> catalogTrees = Lists.newArrayList();
    catalogTrees.add(new CatalogTree(catalog.getId(), catalog.getId(), 0));

    if (catalog.getParentId() == null) {
      catalogTreeRepository.save(catalogTrees);
      return;
    }

    Catalog parentCatalog = catalogRepository.findOne(catalog.getParentId());
    if (parentCatalog == null) {
      throw new IllegalArgumentException("Invalid parent Catalog Id : " + catalog.getParentId());
    }

    List<CatalogTree> ancestors = catalogTreeRepository.findByIdDescendant(parentCatalog.getId());

    for (CatalogTree ancestor : ancestors) {
      catalogTrees.add(new CatalogTree(ancestor.getId().getAncestor(), catalog.getId(), ancestor.getDepth() + 1));
    }

    catalogTreeRepository.save(catalogTrees);
  }

  @Transactional
  public void editTree(Catalog catalog) {

    List<CatalogTree> catalogTrees = Lists.newArrayList();
    List<String> deleteDescendants = Lists.newArrayList();

    if (catalog.getParentId() == null) {

      List<CatalogTree> descendants = catalogTreeRepository.findDescendantNotAncenstor(catalog.getId());
      for (CatalogTree catalogTree : descendants) {
        deleteDescendants.add(catalogTree.getId().getDescendant());
        catalogTrees.add(new CatalogTree(catalog.getId(), catalogTree.getId().getDescendant(), catalogTree.getDepth()));
      }

    } else {

      Catalog parentCatalog = catalogRepository.findOne(catalog.getParentId());
      if (parentCatalog == null) {
        throw new IllegalArgumentException("Invalid parent Catalog Id : " + catalog.getParentId());
      }

      List<CatalogTree> ancestors = catalogTreeRepository.findByIdDescendant(parentCatalog.getId());
      Map<String, Integer> depthMap = Maps.newHashMap();
      int depth;
      for (CatalogTree ancestor : ancestors) {
        depth = ancestor.getDepth() + 1;
        catalogTrees.add(new CatalogTree(ancestor.getId().getAncestor(), catalog.getId(), depth));
        depthMap.put(ancestor.getId().getAncestor(), depth);
      }

      List<CatalogTree> descendants = catalogTreeRepository.findDescendantNotAncenstor(catalog.getId());
      for (CatalogTree catalogTree : descendants) {
        deleteDescendants.add(catalogTree.getId().getDescendant());
        depthMap.forEach((ancestor, i) ->
                             catalogTrees.add(new CatalogTree(ancestor, catalogTree.getId().getDescendant(), i + catalogTree.getDepth()))
        );
      }
    }

    catalogTreeRepository.deleteEditedTree(deleteDescendants.isEmpty() ? null : deleteDescendants, catalog.getId());

    catalogTreeRepository.save(catalogTrees);
  }

  @Transactional
  public void deleteTree(Catalog catalog) {
    // Delete sub-catalog.
    List<CatalogTree> descendants = catalogTreeRepository.findDescendantNotAncenstor(catalog.getId());
    if (descendants.size() > 0) {
      for (CatalogTree catalogTree : descendants) {
        String descendantId = catalogTree.getId().getDescendant();
        catalogRepository.delete(descendantId);
        catalogTreeRepository.deteleAllTree(descendantId);
      }
    }

    catalogTreeRepository.deteleAllTree(catalog.getId());
  }
}
