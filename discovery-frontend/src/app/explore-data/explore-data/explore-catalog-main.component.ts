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

import {Component, ElementRef, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import * as _ from "lodash";
import {StringUtil} from "../../common/util/string.util";
import {Catalog} from "../../domain/catalog/catalog";
import {CatalogService} from "../../meta-data-management/catalog/service/catalog.service";
import {Metadata, SourceType} from "../../domain/meta-data-management/metadata";

@Component({
  selector: 'explore-catalog-main',
  templateUrl: './explore-catalog-main.component.html',
})
export class ExploreCatalogMainComponent extends AbstractComponent implements OnChanges {

  @Input() readonly catalog: Catalog.Tree;
  metadataList: Metadata[];

  // event
  @Output() readonly clickedMetadata = new EventEmitter();

  // 생성자
  constructor(private catalogService: CatalogService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!_.isNil(changes.catalog.currentValue)) {
      this._setMetadataList(changes.catalog.currentValue.id);
    }
  }
  
  getConvertedMetadataType(sourceType: SourceType) {
    switch (sourceType) {
      case SourceType.ENGINE:
        return this.translateService.instant('msg.comm.th.ds');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.STAGEDB:
        return this.translateService.instant('msg.storage.li.hive');
    }
  }

  isEmptyMetadataList(): boolean {
    return _.isNil(this.metadataList) || this.metadataList.length === 0;
  }

  isEnableTag(metadata: Metadata): boolean {
    return !Metadata.isEmptyTags(metadata);
  }

  isEnableDescription(metadata: Metadata): boolean {
    return StringUtil.isNotEmpty(metadata.description);
  }

  /**
   * More connection click event
   */
  changePage(data: { page: number, size: number }): void {
    // if more metadata list
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      this._setMetadataList(this.catalog.id);
    }
  }

  private _setMetadataList(catalogId: string) {
    this.loadingShow();
    const params = {
      page: this.page.page,
      size: this.page.size,
    };
    this.catalogService.getMetadataInCatalog(catalogId, params, false, 'forListView')
      .then((result) => {

        this.pageResult = result.page;

        if (result._embedded) {
          this.metadataList = result._embedded.metadatas;
        } else {
          this.metadataList = [];
        }
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  onClickMetadata(metadata: Metadata) {
    return this.clickedMetadata.emit(metadata);
  }
}
