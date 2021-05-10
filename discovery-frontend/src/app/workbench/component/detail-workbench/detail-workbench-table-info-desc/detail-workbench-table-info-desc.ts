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
import {isUndefined} from 'util';
import {DataconnectionService} from '@common/service/dataconnection.service';
import {MetadataService} from '../../../../meta-data-management/metadata/service/metadata.service';
import {AbstractWorkbenchComponent} from '../../abstract-workbench.component';
import {WorkbenchService} from '../../../service/workbench.service';

@Component({
  selector: 'detail-workbench-table-info-desc',
  templateUrl: './detail-workbench-table-info-desc.html',
  // host: {
  //   '(document:click)': 'onClickHost($event)',
  // }
})
export class DetailWorkbenchTableInfoDescComponent extends AbstractWorkbenchComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private params: any = {};

  // request reconnect count
  private _getTableReconnectCount: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  get getTop(): string {
    return `${this.params['top']}px`;
  }

  @Input('tableParams')
  public set setParams(params: any) {
    this.params = params;
  }

  // Table detail
  public tables: any[] = [];

  // result data
  public resultData: any[] = [];

  // select table
  public selectedTable: string = '';

  @Output()
  public showLayer: EventEmitter<string> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _metaDataService: MetadataService,
              protected workbenchService: WorkbenchService,
              protected element: ElementRef,
              protected injector: Injector,
              protected dataconnectionService: DataconnectionService) {
    super(workbenchService, element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit(): void {
    // this.getTable();
  }

  public ngOnChanges(): void {
    // 테이블 조회
    !isUndefined(this.params['dataconnection'].id) && this._getTable();
  }

  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // close the popup
  public close() {
    this.showLayer.emit('table-info-close');
  }

  // public onClickHost(event) {
  // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
  // if (!this.elementRef.nativeElement.contains(event.target)) {
  // 팝업창 닫기
  // this.showLayer.emit('table-info-schma-close');

  // }
  // }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 테이블 조회
   * @private
   */
  private _getTable(): void {
    // 호출 횟수 증가
    this._getTableReconnectCount++;
    // select table
    this.selectedTable = this.params['selectedTable'];
    // 로딩 show
    this.loadingShow();
    this.dataconnectionService.getTableInfomation(this.params['dataconnection'].id, this.params['dataconnection'].database, this.params['selectedTable'], WorkbenchService.websocketId, this.page)
      .then((data) => {
        // 호출 횟수 초기화
        this._getTableReconnectCount = 0;
        // 테이블 목록 초기화
        this.tables = [];
        // key-pair
        for (const key in data) {
          if (key) {
            this.tables.push({
              itemKey: key,
              item: data[key]
            });
          }
        }
        // 메타데이터 조회
        this._getMetaData();
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getTableReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._getTable();
          });
        } else {
          this.commonExceptionHandler(error);
          // close
          this.close();
        }
      });
  }

  /**
   * 메타데이터 조회
   * @private
   */
  private _getMetaData(): void {

    // table array 생성
    const tableNameArr: string[] = [];
    tableNameArr.push(this.params['selectedTable']);

    this._metaDataService.getMetadataByConnection(this.params['dataconnection'].id, this.params['dataconnection'].database, tableNameArr)
      .then((result) => {
        // tables 최상단에 메타데이터 이름 push
        result.length > 0 && this.tables.unshift({
          itemKey: this.translateService.instant('msg.bench.ui.table.metadata.name'),
          item: result[0]['name']
        });

        let tempLabel = '';
        let tempArr: any[] = [];

        this.resultData = [];

        // result Data 생성
        for (const key in this.tables) {

          if (key) {
            const tempData = {
              label: '',
              data: tempArr
            };

            if (this.tables[key]['itemKey'].startsWith('#')) {

              if (key !== '0') {
                tempData.label = tempLabel.split('#')[1];
                tempData.data = tempArr;
                this.resultData.push(tempData);

                tempLabel = '';
                tempArr = [];
              }

              // label
              tempLabel = this.tables[key]['itemKey'];
            } else {
              // data
              tempArr.push(this.tables[key]);
            }

            // 마지막 데이터일 경우
            if (this.tables.length - 1 === Number(key)) {
              tempData.label = tempLabel.split('#')[1];
              tempData.data = tempArr;
              this.resultData.push(tempData);
            }
          }
        }

        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }
}
