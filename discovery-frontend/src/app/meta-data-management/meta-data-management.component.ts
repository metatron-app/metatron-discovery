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
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import {MetadataService} from './metadata/service/metadata.service';

@Component({
  selector: 'app-meta-data-management',
  templateUrl: './meta-data-management.component.html',
})
export class MetaDataManagementComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 탭 리스트
  private _tabList = [
    {id: 'metadata'},
    {id: 'column-dictionary'},
    {id: 'code-table'},
    {id: 'catalog'},
    {id: 'lineage'},
  ];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선택된 탭 아이디 (default 는 metadata-list)
  // TODO 추후 metadata-list로 변경
  public tabId: string = 'code-table';

  // Lineage 탭 제어
  public showLineageTab: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private metadataService: MetadataService,
    private activatedRoute: ActivatedRoute,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);

    // path variable
    this.activatedRoute.params.subscribe((params) => {

      // tabId가 tabList에 없다면
      if (-1 === _.findIndex(this._tabList, {id: params['tabId']})) {

        // metadata 리스트 페이지로 redirect
        // TODO 추후 metadata-list로 변경
        this.router.navigateByUrl('/management/metadata/code-table').then();
      }

      // 탭 아이디를 설정
      this.tabId = params['tabId'];
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    this._showLineageTab();
    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 해당 tab으로 이동
   * @param tabId 탭 아이디
   */
  public gotoTab(tabId: string) {
    // 선택된 탭 아이디 설정
    this.tabId = tabId;
    // 페이지 이동
    this.router.navigateByUrl('/management/metadata/' + tabId).then();

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _showLineageTab() {
    this.metadataService.isShowLineage()
      .then((result) => {
        this.showLineageTab = result;
      })
      .catch(_error => {
      });
  }

}
