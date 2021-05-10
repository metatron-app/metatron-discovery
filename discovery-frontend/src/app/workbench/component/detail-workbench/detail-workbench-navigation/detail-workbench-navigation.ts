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

import { Component, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import { AbstractComponent } from '@common/component/abstract.component';
import { isUndefined } from 'util';
import { WorkbenchService } from '../../../service/workbench.service';
import { Alert } from '@common/util/alert.util';
import { StringUtil } from '@common/util/string.util';
import { CommonConstant } from '@common/constant/common.constant';

@Component({
  selector: 'detail-workbench-navigation',
  templateUrl: './detail-workbench-navigation.html',
})
export class DetailWorkbenchNavigationComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 워크벤치 리스트
  private navigation: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public workbenchId: string;

  // 검색어
  public searchText: string;

  // 필터 show/hide
  public isFilterShow: boolean = false;

  // 필터에서 선택된 값
  public selectedData: string = '';

  // 필터 값
  public filterTypes: any[] = [{ key: 'A', name: '전체' }, { key: 'P', name: '개인 워크스페이스' }, {
    key: 'S',
    name: '공유 워크스페이스'
  }];

  // 검색어 포함 워크벤치리스트
  get filteredNavigation() {
    if (this.navigation === undefined) return [];
    let list = this.navigation;

    // 검색어가 있는지 체크
    const isSearchTextEmpty = StringUtil.isNotEmpty(this.searchText);
    // 검색어가 있다면
    if (isSearchTextEmpty) {
      list = list.filter((result) => {
        return result.name.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
      });
    }
    return list;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected workbenchService: WorkbenchService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public goWorkbench(item:any) {
    console.log(item);
    const temp = 'workbench/' + item.id;
    console.log('temp', temp);
    // this.router.navigate([temp]);
    window.location.href = CommonConstant.API_CONSTANT.BASE_URL + temp;
  }

  public ngOnInit(): void {
    this.page.size = 20;
    this.getQueryNavigation();
  }


  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // select box 선택
  public onSelectedFilter(event) {
    this.selectedData = event.name;
    console.log('onSelectedFilter', this.selectedData);
  }

  // open filter show/hide
  public openFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  public moreButton(){
    this.page.page = this.page.page + 1;
    this.getQueryNavigation();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // get workbench list
  private getQueryNavigation() {

    if (isUndefined(this.workbenchId)) return;

    if (isUndefined(this.navigation)) {
      this.navigation = [];
    }

    if (this.page.page === 0) {
      this.navigation = [];
    }
    this.loadingShow();
    this.workbenchService.getQueryNavigation(this.workbenchId, this.page)
      .then((data) => {
        this.loadingHide();
        this.pageResult = data['page'];
        this.navigation = this.navigation.concat(data['_embedded'].books);
      })
      .catch((error) => {
        this.loadingHide();
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });
  }

}
