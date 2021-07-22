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

import {AbstractComponent} from '@common/component/abstract.component';
import {Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {MetadataService} from '../service/metadata.service';
import {Metadata} from '@domain/meta-data-management/metadata';
import {MetadataColumn} from '@domain/meta-data-management/metadata-column';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-embedded-metadata-detail',
  templateUrl: './embedded-metadata-detail.component.html',
})
export class EmbeddedMetadataDetailComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Metadata Id
  private _metaDataId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Metadata
  public metaData: Metadata = new Metadata();
  // Field List
  public columnList: MetadataColumn[] = [];

  // Logical type list
  public logicalTypeList: any[] = this.getMetaDataLogicalTypeList();

  // show mode
  public mode: string = 'information';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(
    private _metaDataService: MetadataService,
    private _activatedRoute: ActivatedRoute,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();

    window.history.pushState(null, null, window.location.href);

    this._activatedRoute.params.subscribe((params) => {
      // get metadata id from router
      this._metaDataId = params['id'];
      // get metadata detail information
      this._getDetailMetaData();
    });
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // @HostListener('window:popstate')
  // public onPopstate() {
  //   window.history.pushState(null, null, window.location.href);
  // }

  /**
   * Current field's logical Type label
   * @param {MetadataColumn} column
   * @returns {string}
   */
  public getSelectedLogicalTypeLabel(column: MetadataColumn): string {
    return column.type ? this.logicalTypeList.filter((type) => {
      return type.value === column.type;
    })[0].label : '';
  }

  /**
   * Column popularity
   * @param {MetadataColumn} column
   * @returns {string}
   */
  public getColumnPopularity(column: MetadataColumn): string {
    return (column.popularity || 0) + '%';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Get Metadata detail information
   * @private
   */
  private _getDetailMetaData(): void {
    // Loading show
    this.loadingShow();
    // Get Metadata detail information
    this._metaDataService.getDetailMetaData(this._metaDataId).then((result) => {
      // Metadata detail information
      this.metaData = result;
      // Get Column Schema List
      this._getColumnSchemaList();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get Column Schema List
   * @private
   */
  private _getColumnSchemaList(): void {
    // Loading show
    this.loadingShow();
    // Get Column Schema List
    this._metaDataService.getColumnSchemaListInMetaData(this._metaDataId).then((result) => {
      // Column Data
      this.columnList = result;
      // Loading hide
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }
}
