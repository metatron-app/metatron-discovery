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

import {Component, ElementRef, EventEmitter, Injector, Output} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import * as _ from "lodash";
import {StringUtil} from "../../common/util/string.util";
import {Metadata} from "../../domain/meta-data-management/metadata";

@Component({
  selector: 'explore-data-main',
  templateUrl: './explore-data-main.component.html',
})
export class ExploreDataMainComponent extends AbstractComponent {

  popularMetadataList: Metadata[];
  updatedMetadataList: Metadata[];
  favoriteMetadataList: Metadata[];
  favoriteCreatorMetadataList: Metadata[];

  // event
  @Output() readonly clickedMetadata = new EventEmitter();

  // 생성자
  constructor(
    protected element: ElementRef,
    protected injector: Injector,
    private _metadataService: MetadataService) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  ngOnInit() {
    super.ngOnInit();
    this._setMetadataList();
  }

  isEnableTag(metadata: Metadata): boolean {
    return !Metadata.isEmptyTags(metadata);
  }

  isEnableDescription(metadata: Metadata): boolean {
    return StringUtil.isNotEmpty(metadata.description);
  }

  private _setMetadataList() {
    this.loadingShow();
    const params = {
      page: this.page.page,
      size: this.page.size,
    };
    this._metadataService.getMetaDataList(params)
      .then((result) => {
        // TODO set metadata list
        this.popularMetadataList = result._embedded.metadatas;
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  onClickMetadata(metadata: Metadata) {
    return this.clickedMetadata.emit(metadata);
  }
}
