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

import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {Catalog} from "../../../domain/catalog/catalog";
import {CatalogService} from "../../../meta-data-management/catalog/service/catalog.service";
import {StringUtil} from "../../../common/util/string.util";
import * as _ from 'lodash';

@Component({
  selector: 'component-catalog-folder',
  templateUrl: 'catalog-folder.component.html'
})
export class CatalogFolderComponent extends AbstractComponent implements OnInit {
  // data
  @Input() readonly searchKeyword: string;
  @Input() readonly catalog: Catalog.Tree;
  @Input() readonly selectedCatalog: Catalog.Tree;
  @Input() readonly isEmptyCatalog: boolean;

  // event
  @Output() readonly clickedCatalog = new EventEmitter();

  constructor(private catalogService: CatalogService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {

  }

  isEmptySearchKeyword(): boolean {
    return StringUtil.isEmpty(this.searchKeyword);
  }

  isEmptySelectedCatalog(): boolean {
    return _.isNil(this.selectedCatalog);
  }

  isSelectedCatalog(): boolean {
    return !this.isEmptySelectedCatalog() && this.selectedCatalog.id === this.catalog.id;
  }

  onChangeFolderOpen(catalogId: string) {
    // stop bubbling
    event.stopImmediatePropagation();
    // if is not opened
    if (!this.catalog.isOpened) {
      // set catalog list in child
      this._setCatalogList(catalogId);
    }
    this.catalog.isOpened= !this.catalog.isOpened;
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
