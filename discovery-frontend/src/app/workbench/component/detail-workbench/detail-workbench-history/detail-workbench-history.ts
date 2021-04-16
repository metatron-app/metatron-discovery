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

import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {WorkbenchService} from '../../../service/workbench.service';
import {isUndefined} from 'util';
import {Alert} from '@common/util/alert.util';

@Component({
  selector: 'detail-workbench-history',
  templateUrl: './detail-workbench-history.html',
})
export class DetailWorkbenchHistoryComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public editorId: string;

  @Output()
  public sqlIntoEditorEvent: EventEmitter<string> = new EventEmitter();

  // query fail popup
  @Output()
  public sqlQueryPopupEvent: EventEmitter<string> = new EventEmitter();

  // history 삭제 여부
  @Input()
  public deleteHistory: boolean = false;

  // history delete popup
  @Output()
  public queryHistoryDeleteEvent: EventEmitter<string> = new EventEmitter();

  // history popup close
  @Output()
  public historyCloseEvent: EventEmitter<string> = new EventEmitter();

  public histories: any[] = [];

  public searchText: string = '';

  public completeSearchText: string = '';

  // 검색 영역 활성화
  public isSearchText: boolean = false;

  // get filteredHistories() {
  //   // if(_.isEmpty(this.histories)) {
  //   //   return [];
  //   // }
  //   // return this.histories;
  //
  //   if (this.histories.length === 0) return [];
  //   let list = this.histories;
  //
  //   // 검색어가 있는지 체크
  //   const isSearchTextEmpty = StringUtil.isNotEmpty(this.searchText);
  //   // 검색어가 있다면
  //   if (isSearchTextEmpty) {
  //     list = list.filter((result) => {
  //       return result.query.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
  //     });
  //   }
  //
  //
  //   return list;
  //
  // }
  // set filteredHistories(histories:any[]) {
  //   this.histories = histories;
  // }

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

  public ngOnInit(): void {
    // this.getQueryHistories();
  }

  public ngOnChanges(): void {

    if (this.deleteHistory) {
      this.deleteAll();
      this.completeSearchText = '';
    } else {
      this.page.page = 0;
      this.getQueryHistories();
    }

  }

  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public getSearch() {
    this.page.page = 0;
    this.getQueryHistories();
  }

  public getQueryHistories() {
    if (!isUndefined(this.editorId)) {

      if (this.page.page === 0) {
        this.histories = [];
      }

      // 조회 한 검색어 설정
      this.completeSearchText = this.searchText;

      this.loadingShow();
      this.workbenchService.getQueryHistories(this.editorId, this.searchText, 'forListView', this.page)
        .then((data) => {
          this.loadingHide();
          this.pageResult = data['page'];
          if (!isUndefined(data['_embedded'])) {
            this.histories = this.histories.concat(data['_embedded'].queryhistories);

            // ms 변환 상위 2단계 까지만 표현
            for (let idx = 0, nMax = this.histories.length; idx < nMax; idx++) {
              const queryTime: number = this.histories[idx]['queryTimeTaken'];

              const milliseconds = Math.floor((queryTime % 1000) / 100);
              const seconds = Math.floor((queryTime / 1000) % 60);
              const minutes = Math.floor((queryTime / (1000 * 60)) % 60);
              const hours = Math.floor((queryTime / (1000 * 60 * 60)) % 24);
              if (hours >= 1) {
                this.histories[idx]['queryTimeTakenFormatted'] = hours + 'h ' + minutes + 'm';
              } else if (minutes >= 1 && hours < 1) {
                this.histories[idx]['queryTimeTakenFormatted'] = minutes + 'm ' + seconds + 's';
              } else if (seconds >= 1 && minutes < 1) {
                this.histories[idx]['queryTimeTakenFormatted'] = seconds + 's ' + milliseconds + 'ms';
              } else if (milliseconds >= 1 && seconds < 1) {
                this.histories[idx]['queryTimeTakenFormatted'] = queryTime + 'ms';
              }
            }

            this.page.page += 1;
          }
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

  public deleteAll() {
    this.workbenchService.deleteQueryHistoryAll(this.editorId)
      .then((_result) => {
        this.page.page = 0;
        this.getQueryHistories();

      })
      .catch((error) => {
        // Alert.error(this.translateService.instant('msg.bench.alert.query.del.fail'));
        Alert.error(error.details);
      });
  }

  public setTableSql(item) {

    if (item.queryResultStatus === 'SUCCESS') {
      // 성공일 경우 에디터에 삽입
      this.sqlIntoEditorEvent.emit('\n' + item.query + ';');
    } else {
      // 실패일 경우 팝업 호출
      this.sqlQueryPopupEvent.emit(item);
    }
  }

  public historyClose() {
    this.historyCloseEvent.emit();
  }

  public historyDelete() {
    this.queryHistoryDeleteEvent.emit();
  }

  /**
   * 검색창 열기
   */
  public openSearchArea() {

    this.isSearchText = true;
    const searchElement = $('.ddp-type-search');
    searchElement.animate({
      left: '10px'
    }, 200);

  }

  /**
   * 검색창 닫기
   */
  public closeSearchArea() {

    this.isSearchText = false;
    const searchElement = $('.ddp-type-search');
    searchElement.animate({
      left: '200px'
    }, 200);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
