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

import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {Catalog} from "../../../domain/catalog/catalog";
import {CatalogService} from "../../../meta-data-management/catalog/service/catalog.service";
import {StringUtil} from "../../../common/util/string.util";

@Component({
  selector: 'component-catalog-folder',
  templateUrl: 'catalog-folder.component.html'
})
export class CatalogFolderComponent extends AbstractComponent {

  isOpened: boolean;

  // data
  @Input() readonly searchKeyword: string;
  @Input() readonly catalog: Catalog.Tree;

  // event
  @Output() readonly clickedCatalog = new EventEmitter();

  constructor(private catalogService: CatalogService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  isEmptySearchKeyword(): boolean {
    return StringUtil.isEmpty(this.searchKeyword);
  }

  onChangeFolderOpen(catalogId: string) {
    // stop bubbling
    event.stopImmediatePropagation();
    // if is not opened
    if (!this.isOpened) {
      // set catalog list in child
      this._setCatalogList(catalogId);
    }
    this.isOpened = !this.isOpened;
  }

  onClickCatalog(catalog) {
    this.clickedCatalog.emit(catalog);
  }

  getCatalogName(): string {
    // if empty search keyword
    if (StringUtil.isEmpty(this.searchKeyword)) {
      return this.catalog.name;
    } else {
      return this.catalog.name.replace(this.searchKeyword, `<span class="ddp-txt-search">${this.searchKeyword}</span>`);
    }
  }

  private _setCatalogList(catalogId: string): void {
    this.catalogService.getTreeCatalogs(catalogId)
      .then((result) => {
        // set catalog list
        this.catalog.child = result;
      })
      .catch(error => this.commonExceptionHandler(error));
  }
}
