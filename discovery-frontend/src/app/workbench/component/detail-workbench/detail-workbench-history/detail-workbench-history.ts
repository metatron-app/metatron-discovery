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
  Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit,
  Output
} from '@angular/core';
import { AbstractComponent } from '../../../../common/component/abstract.component';
import { WorkbenchService } from '../../../service/workbench.service';
import { isUndefined } from 'util';
import { Alert } from '../../../../common/util/alert.util';
import { StringUtil } from '../../../../common/util/string.util';

@Component({
  selector: 'detail-workbench-history',
  templateUrl: './detail-workbench-history.html',
})
export class DetailWorkbenchHistory extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

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

  public histories: any[] = [];

  public searchText: string = '';

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
    this.page.page = 0;
    this.getQueryHistories();
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

      this.loadingShow();
      this.workbenchService.getQueryHistories(this.editorId, this.searchText,'forListView', this.page)
        .then((data) => {
          this.loadingHide();
          this.pageResult = data['page'];
          if (!isUndefined(data['_embedded'])) {
            this.histories = this.histories.concat(data['_embedded'].queryhistories);
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
      .then((result) => {
        this.page.page = 0;
        this.getQueryHistories();
      })
      .catch((error) => {
        // Alert.error(this.translateService.instant('msg.bench.alert.query.del.fail'));
        Alert.error(error.details);
      });
  }

  public setTableSql(item) {
    this.sqlIntoEditorEvent.emit('\n' + item + ';');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
