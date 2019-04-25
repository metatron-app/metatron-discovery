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

import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import {
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import {DatasourceInfo, Field} from '../../../../../domain/datasource/datasource';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { GridComponent } from '../../../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../../../common/component/grid/grid.header';
import { GridOption } from '../../../../../common/component/grid/grid.option';
import * as pixelWidth from 'string-pixel-width';
import { Alert } from '../../../../../common/util/alert.util';
import { CookieConstant } from '../../../../../common/constant/cookie.constant';

@Component({
  selector: 'druid-select',
  templateUrl: './druid-select.component.html'
})
export class DruidSelectComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  private sourceData: DatasourceInfo;

  @ViewChild("grid")
  private _gridComponent: GridComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this.sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output('druidComplete')
  public druidComplete = new EventEmitter();

  // 엔진 목록
  public engineList: string[] = [];
  // 선택한 엔진 목록
  public selectedEngineList: string[] = [];
  // 현재 선택한 엔진
  public selectedEngine: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
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
    // init ui
    this._initView();
    // import 가능한 메타트론 엔진 데이터소스 목록 조회
    this._getImportableEngineList();
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  /**
   * done
   */
  public done() {
    // done validation
    if (this.doneValidation()) {
      // 로딩 show
      this.loadingShow();
      // 개인 워크스페이스
      const workspace = JSON.parse(this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE));
      // q
      const q = [];
      // workspace q
      const workspaceQ  = [];
      // 선택된 아이템 목록
      this.selectedEngineList.forEach((engineName) => {
        q.push(this._importEngineDatasource(engineName).then((result) => {
          // 생성된 데이터소스 워크스페이스 매핑하기 위한 큐 생성
          workspaceQ.push(this._linkSourceToWorkspace(result.id, workspace['id']));
        }));
      });
      // 데이터소스 import
      Promise.all(q)
        .then((result) => {
          // alert
          Alert.success(this.translateService.instant('msg.storage.alert.source.create.success'));
          // 생성된 데이터소스들 워크스페이스에 매핑
          Promise.all(workspaceQ)
            .then(() => {
              // 로딩 hide
              this.loadingHide();
              // 닫기
              this.step = '';
              this.druidComplete.emit(this.step);
            })
            .catch(() => {
              // 로딩 hide
              this.loadingHide();
              // 닫기
              this.step = '';
              this.druidComplete.emit(this.step);
            });
        })
        .catch((error) => {
          this.commonExceptionHandler(error);
        });
    } else {
      // 선택된 테이블이 없는경우 alert
      Alert.warning(this.translateService.instant('msg.storage.alert.dsource.create.druid.none.selected'));
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 아이템을 선택된 리스트에서 제거
   * @param item
   */
  public deleteSelectedItem(item: any): void {
    // 선택된 리스트에 있는 아이템의 index
    const index = this.selectedEngineList.indexOf(item);
    // 선택된 리스트에 있을 때만 제거
    if (index !== -1) {
      this._deleteSelectedItem(index);
    }
  }

  /**
   * 아이템을 선택된리스트에서 추가
   * @param item
   */
  public addSelectedItem(item: any): void {
    // 선택된 리스트에 있는 아이템의 index
    const index = this.selectedEngineList.indexOf(item);
    // 선택된 리스트에 있을 때만 추가
    if (index === -1) {
      this._addSelectedItem(item);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * done validation
   * @returns {boolean}
   */
  public doneValidation(): boolean {
    return this.selectedEngineList.length > 0;
  }

  /**
   * 현재 엔진이 선택된 리스트에 있는지 확인
   * @param {string} engineName
   * @returns {boolean}
   */
  public isCheckedEngine(engineName: string): boolean {
    return this.selectedEngineList.indexOf(engineName) !== -1;
  }

  /**
   * 현재 엔진이 선택된 상태인지
   * @param {string} engineName
   * @returns {boolean}
   */
  public isSelectedEngine(engineName: string): boolean {
    return this.selectedEngine === engineName;
  }

  /**
   * 모든 엔진이 선택된 리스트에 있느지 확인
   * @returns {boolean}
   */
  public isAllSelectedEngine(): boolean {
    if (this.engineList.length !== 0) {
      for (let index = 0; index < this.engineList.length; index++) {
        // 조회된 아이템 목록 중 선택목록에 하나라도 없다면 false
        if (this.selectedEngineList.indexOf(this.engineList[index]) === -1) {
          return false;
        }
      }
      return true;
    } else {
      // 조회된 목록이 없다면 false
      return false;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 모든 엔진 선택 이벤트
   */
  public onCheckAllEngine(): void {
    // 중복선택 제거
    event.preventDefault();
    // 현재 선택된 상태라면 선택된 아이템 제거
    this.isAllSelectedEngine() ? this._deleteAllItem() : this._addAllItem();
  }

  /**
   * 엔진 선택 이벤트
   * @param {string} engineName
   */
  public onSelectedEngine(engineName: string): void {
    // 현재 선택한 엔진
    this.selectedEngine = engineName;
    // preview 조회
    this._getEnginePreview(engineName);
  }

  /**
   * 엔진 체크 이벤트
   * @param {string} engineName
   */
  public onCheckEngine(engineName: string): void {
    // 아이템이 선택된 리스트에 있는경우 체크 해제
    const index = this.selectedEngineList.indexOf(engineName);
    index === -1 ? this._addSelectedItem(engineName) : this._deleteSelectedItem(index);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // 엔진 목록
    this.engineList = [];
    // 선택한 엔진 목록
    this.selectedEngineList = [];
  }

  /**
   * 선택된 리스트에 아이템을 추가
   * @param {any}
   * @private
   */
  private _addSelectedItem(item: any): void {
    this.selectedEngineList.push(item);
  }

  /**
   * 선택된 리스트에 아이템을 제거
   * @param {number} index
   * @private
   */
  private _deleteSelectedItem(index: number): void {
    this.selectedEngineList.splice(index, 1);
  }

  /**
   * 현재 보이고 있는 아이템을 선택한 리스트에서 제거
   * @private
   */
  private _deleteAllItem(): void {
    // 아이템을 현재 선택된 리스트에서 제거
    this.engineList.forEach((item) => {
      this.deleteSelectedItem(item);
    });
  }

  /**
   * 현재 보이고 있는 아이템들 선택한 리스트에 추가
   * @private
   */
  private _addAllItem(): void {
    // 아이템을 현재 선택된 리스트에 추가
    this.engineList.forEach((item) => {
      this.addSelectedItem(item);
    });
  }

  /**
   * import engine 데이터소스
   * @param {string} engineName
   * @returns {Promise<any>}
   * @private
   */
  private _importEngineDatasource(engineName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // 드루이드 데이터소스 import
      this.datasourceService.importDatasource(engineName)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 데이터소스를 워크스페이스에 연결
   * @param {string} sourceId
   * @param {string} workspaceId
   * @returns {Promise<any>}
   * @private
   */
  private _linkSourceToWorkspace(sourceId: string, workspaceId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.datasourceService.addDatasourceWorkspaces(sourceId, [workspaceId])
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private _updateGrid(dataList: any, fields: any): void {
    // headers
    const headers: header[] = this._getHeaders(fields);
    // rows
    const rows: any[] = this._getRows(dataList);
    // grid 그리기
    this._drawGrid(this._gridComponent, headers, rows);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * import 가능한 메타트론 엔진 데이터소스 목록 조회
   * @private
   */
  private _getImportableEngineList(): void {
    // 로딩 show
    this.loadingShow();
    // 드루이드 데이터소스 리스트 조회
    this.datasourceService.getDatasourceImportableEngineList()
      .then((result) => {
        // 엔진 리스트
        this.engineList = result;

        // 목록이 있다면 첫번째 선택
        result.length > 0 ? this.onSelectedEngine(result[0]) : this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * engine의 상세 데이터 preview
   * @param {string} engineName
   * @private
   */
  private _getEnginePreview(engineName: string) {
    // 로딩 show
    this.loadingShow();
    // 드루이드 데이터소스 preview
    this.datasourceService.getDatasourceImportableEnginePreview(engineName, this._getEnginePreviewParams())
      .then((result) => {
        // grid
        this._updateGrid(result['data'], result['meta'].fields);
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
    });
  }

  /**
   * engine 상세 데이터 조회에 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getEnginePreviewParams(): object {
    return {
      withData: true,
      limit: 10
    }
  }

  /**
   * 헤더정보 얻기
   * @param {Field[]} fields
   * @returns {header[]}
   * @private
   */
  private _getHeaders(fields: any[]) {
    return fields.map(
      (field: any) => {

        /* 62 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth:number = Math.floor(pixelWidth(field.name, { size: 12 })) + 62;

        return new SlickGridHeader()
          .Id(field.name)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) + '"></em>' + Field.getSlicedColumnName(field) + '</span>')
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .Formatter((row, cell, value) => {
            let content = value;
            // trans to string
            if (typeof value === "number") {
              content = value + '';
            }
            if (content && content.length > 50) {
              return content.slice(0,50);
            } else {
              return content;
            }
          })
          .build();
      }
    );
  }

  /**
   * 그리드 출력
   * @param {GridComponent} gridComponent
   * @param {any[]} headers
   * @param {any[]} rows
   * @private
   */
  private _drawGrid(gridComponent: GridComponent, headers: any[], rows: any[]) {
    this.changeDetect.detectChanges();
    // 그리드 옵션은 선택
    gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .build()
    );
  }

  /**
   * rows 얻기
   * @param data
   * @returns {any[]}
   * @private
   */
  private _getRows(data: any) {
    let rows: any[] = data;
    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return rows;
  }
}
