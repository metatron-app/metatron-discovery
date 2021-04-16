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
import {DataconnectionService} from '@common/service/dataconnection.service';
import {isUndefined} from 'util';
import {StringUtil} from '@common/util/string.util';
import {WorkbenchService} from '../../../service/workbench.service';
import {AbstractWorkbenchComponent} from '../../abstract-workbench.component';

@Component({
  selector: 'detail-workbench-table-info-schema',
  templateUrl: './detail-workbench-table-info-schema.html',
})
export class DetailWorkbenchTableInfoSchemaComponent extends AbstractWorkbenchComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 컬럼리스트
  private columns: any[] = [];

  // params
  private params: any = {};

  // request reconnect count
  private _getTableDetailReconnectCount: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public tableName: string;

  @Input('schemaParams')
  public set setParams(params: any) {
    this.params = params;
    this.tableName = params['selectedTable'];
  }

  // 검색
  public searchText: string = '';

  // 검색되는 컬럼리스트
  get filteredColumns() {
    if (isUndefined(this.columns)) return [];
    let list = this.columns;

    // 검색어가 있는지 체크
    const isSearchTextEmpty = StringUtil.isNotEmpty(this.searchText);
    // 검색어가 있다면
    if (isSearchTextEmpty) {
      list = list.filter((result) => result.columnName.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1);
    }
    return list;
  }

  @Output()
  public showLayer: EventEmitter<string> = new EventEmitter();

  // insert schema name
  @Output()
  public insertName: EventEmitter<string> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector,
              protected workbenchService: WorkbenchService,
              protected dataconnectionService: DataconnectionService) {
    super(workbenchService, element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit(): void {
    // this.page.page === 0;
    // this.getTableDetail();
  }

  public ngOnChanges(): void {
    this.page.page = 0;
    this.getTableDetail();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // close the popup
  public close() {
    this.showLayer.emit('table-info-schema-close');
  }

  // protected searchTable() {
  //   this.page.page = 0;
  //   this.getTableDetail();
  // }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선택된 테이블 컬럼정보를 읽어온다
  private getTableDetail() {
    // 호출 횟수 증가
    this._getTableDetailReconnectCount++;

    if (this.page.page === 0) {
      this.columns = [];
    }

    this.loadingShow();

    this.dataconnectionService.getColumnList(this.params['dataconnection'].id, this.params['dataconnection'].database, this.params['selectedTable'], this.searchText, WorkbenchService.websocketId, this.page)
      .then((data) => {
        // 호출 횟수 초기화
        this._getTableDetailReconnectCount = 0;

        this.loadingHide();
        this.pageResult = data['page'];
        this.columns = data['columns'];
        this.page.page += 1;
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableDetailReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this.getTableDetail();
          });
        } else {
          this.commonExceptionHandler(error);
          // close
          this.close();
        }
      });
  }

  /**
   * insert schema column
   * @param {string} param
   */
  public setColumn(param: string) {
    this.insertName.emit(param + ',');
  }

}
