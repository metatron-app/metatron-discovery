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
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input, OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {AbstractComponent} from '@common/component/abstract.component';
import {Datasource} from '@domain/datasource/datasource';

@Component({
  selector: 'dashboard-datasource-combo',
  templateUrl: './dashboard-datasource-combo.component.html'
})
export class DashboardDatasourceComboComponent extends AbstractComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // @ts-ignore
  @Input('dataSources') private _inputDataSources: Datasource[];
  // @ts-ignore
  @Input('initialValue') private _initValue: Datasource;
  @Output('selectOption') private _selectOptionEvent: EventEmitter<Datasource> = new EventEmitter();
  @Output('showInfo') private _showInfoEvent: EventEmitter<Datasource> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isShowDataSourceOpts: boolean = false;  // 데이터소스 목록 옵션 표시 여부
  public dataSources: Datasource[] = [];    // 데이터소스 목록
  public selectedDataSource: Datasource;    // 선택된 데이터 소스

  public searchText: string = '';

  @Input('canChangeDataSourceMode')
  public canChangeDataSourceMode: boolean = false;

  @Input('enableInfo') public isEnableInfo: boolean = false;
  @Input('enableEditAssociationJoin') public isEnableEditAssociationJoin: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
  } // function - ngOnInit

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const dataSourceChanges: SimpleChange = changes._inputDataSources;
    const initValChanges: SimpleChange = changes._initValue;
    if (dataSourceChanges && dataSourceChanges.currentValue) {
      this.dataSources = dataSourceChanges.currentValue;
    }
    if (initValChanges && initValChanges.firstChange) {
      this.selectedDataSource = initValChanges.currentValue;
    }
  } // function - ngOnChanges

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터소스 목록 열고 닫음
   * @param $event
   */
  public toggleDataSourceList($event) {
    const $targetElm = $($event.target);

    if (!$targetElm.hasClass('ddp-form-search') && 0 === $targetElm.closest('.ddp-form-search').length) {
      this.isShowDataSourceOpts = !this.isShowDataSourceOpts;
    }

  } // function - toggleDataSourceList

  /**
   * 데이터소스 선택
   * @param {Datasource} dataSource
   */
  public selectDataSource(dataSource: Datasource) {
    if (dataSource.valid) {
      this.isShowDataSourceOpts = false;
      this.selectedDataSource = dataSource;
      this._selectOptionEvent.emit(dataSource);
      this.safelyDetectChanges();
    }
  } // function - selectDataSource

  /**
   * 데이터소스 정보 이벤트 실행
   */
  public triggerShowInfo() {
    this._showInfoEvent.emit(this.selectedDataSource);
  } // function - triggerShowInfo

  /**
   * 대시보드 데이터소스 변경
   */
  public updateBoardDataSource() {
    this.broadCaster.broadcast('UPDATE_BOARD_UPDATE_DATASOURCE');
  } // function - updateBoardDataSource

  public changeBoardDataSource(selectedDataSource: Datasource){
   this.broadCaster.broadcast('CHANGE_BOARD_DATASOURCE', {dataSource: this.dataSources, selectedDataSource: selectedDataSource});
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
