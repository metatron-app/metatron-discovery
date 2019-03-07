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

import {AbstractComponent} from '../../../common/component/abstract.component';
import {Component, ElementRef, HostListener, Injector} from '@angular/core';
import {MetadataService} from '../service/metadata.service';
import {Metadata} from '../../../domain/meta-data-management/metadata';
import {MetadataColumn} from '../../../domain/meta-data-management/metadata-column';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-embedded-metadata-detail',
  templateUrl: './embedded-metadata-detail.component.html',
})
export class EmbeddedMetadataDetailComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 메타데이터 아이디
  private _metaDataId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 메타데이터
  public metaData: Metadata = new Metadata();
  // 필드 목록
  public columnList: MetadataColumn[] = [];

  // Logical type list
  public logicalTypeList: any[] = this.getMetaDataLogicalTypeList();

  // show mode
  public mode: string = 'information';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
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
      // 라우터에서 metadata id 뽑아오기
      this._metaDataId = params['id'];
      // 메타데이터 상세정보 조회
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

  @HostListener('window:popstate', ['$event'])
  public onPopstate() {
    window.history.pushState(null, null, window.location.href);
  }

  /**
   * 현재 필드의 logical Type label
   * @param {MetadataColumn} column
   * @returns {string}
   */
  public getSelectedLogicalTypeLabel(column: MetadataColumn): string {
    return column.type ? this.logicalTypeList.filter((type) => {
      return type.value === column.type;
    })[0].label : '';
  }

  /**
   * 컬럼 인기도
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
   * 메타데이터 상세정보 조회
   * @private
   */
  private _getDetailMetaData(): void {
    // 로딩 show
    this.loadingShow();
    // 메타데이터 상세정보 조회
    this._metaDataService.getDetailMetaData(this._metaDataId).then((result) => {
      // 메타데이터 정보
      this.metaData = result;
      // 컬럼 스키마 목록 조회
      this._getColumnSchemaList();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼 스키마 목록 조회
   * @private
   */
  private _getColumnSchemaList(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 조회
    this._metaDataService.getColumnSchemaListInMetaData(this._metaDataId).then((result) => {
      // 컬럼 데이터
      this.columnList = result;
      // 로딩 hide
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }
}
