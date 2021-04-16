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

import {Component, ElementRef, Injector, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Page, PageResult} from '@domain/common/page';
import {Activity} from '@domain/user/activity';
import {ActivityService} from '../service/activity.service';
import {CommonUtil} from '@common/util/common.util';

@Component({
  selector: 'app-access-history',
  templateUrl: './access-history.component.html',
  styles: ['.ddp-wrap-viewtable {position: absolute;top: 166px;left: 0;right: 0;bottom: 84px;padding-bottom: 45px;padding: 0 50px;}']
})
export class AccessHistoryComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 팝업 플래그
  public isShow: boolean = false;

  public searchText: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();

  public page: Page = new Page();
  public pageResult: PageResult = new PageResult();

  public activities: Activity[] = [];


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private activityService: ActivityService,
              protected renderer: Renderer2,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
    this.renderer.removeStyle(document.body, 'overflow');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 초기화
  public init() {

    // 초기 hidden 처리
    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    // ui 초기화
    this.initView();
    // 팝업 열기
    this.isShow = true;

    // 노트북 서버 최초조회
    this.getAccessHistory();
  }

  public close() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.isShow = false;
  }

  // 검색
  public searchEvent() {
    // 페이지 초기화
    this.page.page = 0;

    // 재조회
    this.getAccessHistory();
  }

  // 더보기 버튼
  public getMoreList() {
    // 더 보여줄 데이터가 있다면
    if (this.page.page < this.pageResult.totalPages) {
      // 재조회
      this.getAccessHistory();
    }
  }

  // 정렬
  public changeOrder(column: string) {

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = column;

    if (this.selectedContentSort.key === column) {
      // asc, desc, default
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }

    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getAccessHistory();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 노트북 서버 조회
  private getAccessHistory() {
    this.loadingShow();

    this.page.sort = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;

    const param = {
      action: 'ARRIVE',
      nameContains: CommonUtil.getLoginUserId(),
      clientContains: this.searchText,
      sort: this.page.sort,
      page: this.page.page,
      size: this.page.size,
      projection: 'detail'
    }
    this.activityService.getActivities(CommonUtil.getLoginUserId(), param)
      .then((result) => {

        // 페이지 객체 저장
        this.pageResult = result['page'];

        // 페이지가 첫 번째이면
        if (this.page.page === 0) {
          this.activities = [];
        }

        // 데이터 있을 때
        if (result['_embedded']['activities'].length > 0) {
          this.activities = this.activities.concat(result['_embedded']['activities']);
          this.page.page += 1;
        }

        // 로딩 hide
        this.loadingHide();
      })
      .catch((_error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  // 초기화
  private initView() {
    // page 설정
    this.page.page = 0;
    this.page.size = 20;

    this.searchText = '';

    // 정렬
    this.selectedContentSort = new Order();
  }
}

class Order {
  key: string = 'publishedTime';
  sort: string = 'desc';
}
