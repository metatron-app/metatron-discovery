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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;

import static app.metatron.discovery.domain.mdm.MetadataErrorCodes.DUPLICATED_CATALOG_NAME;

/**
 * Catalog event handler
 */
@RepositoryEventHandler(Catalog.class)
public class CatalogEventHandler {

  @Autowired
  CatalogTreeService catalogTreeService;

  @Autowired
  CatalogRepository catalogRepository;
  
  @HandleBeforeCreate
  public void handleBeforeCreate(Catalog catalog) {

    if ( catalog.getParentId() == null ){
      if ( catalogRepository.countByCatalogName(catalog.getName()) > 0 ){
        throw new CatalogException(DUPLICATED_CATALOG_NAME, "Duplicated Catalog Name");
      }
    }else{
      if ( catalogRepository.countByCatalogNameAndParentId(catalog.getName(), catalog.getParentId()) > 0 ){
        throw new CatalogException(DUPLICATED_CATALOG_NAME, "Duplicated Catalog Name");
      }
    }
  }

  @HandleAfterCreate
  public void handleAfterCreate(Catalog catalog) {
    // Tree 생성
    catalogTreeService.createTree(catalog);
  }

  @HandleBeforeSave
  public void handleBeforeSave(Catalog catalog) {
  }

  @HandleBeforeDelete
  public void handleBeforeDelete(Catalog catalog) {
    // Tree 삭제
    catalogTreeService.deleteTree(catalog);
  }
}
