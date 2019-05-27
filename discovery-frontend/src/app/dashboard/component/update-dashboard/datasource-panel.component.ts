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
  Component, DoCheck,
  ElementRef,
  EventEmitter,
  Injector,
  Input, KeyValueDiffers, OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { Datasource, Field, FieldRole, LogicalType } from '../../../domain/datasource/datasource';
import { Filter } from '../../../domain/workbook/configurations/filter/filter';
import { Widget } from '../../../domain/dashboard/widget/widget';
import { Alert } from '../../../common/util/alert.util';
import { StringUtil } from '../../../common/util/string.util';
import { FilterUtil } from '../../util/filter.util';
import * as _ from 'lodash';
import { CustomField } from '../../../domain/workbook/configurations/field/custom-field';
import { BoardConfiguration, BoardDataSource, Dashboard } from '../../../domain/dashboard/dashboard';
import { PageDataContextComponent } from '../../../page/page-data/page-data-context.component';
import { DashboardUtil } from '../../util/dashboard.util';
import { EventBroadcaster } from '../../../common/event/event.broadcaster';

@Component({
  selector: 'datasource-panel',
  templateUrl: './datasource-panel.component.html'
})
export class DatasourcePanelComponent extends AbstractComponent implements OnInit, OnDestroy, DoCheck {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private DIM_PAGE_SIZE: number = 10;
  private MEA_PAGE_SIZE: number = 7;

  // page data 하위의 context menu
  @ViewChild(PageDataContextComponent)
  private _dataContext: PageDataContextComponent;

  // 전체 필드 목록
  private _totalFields: (Field | CustomField)[] = [];

  private _differ: any;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public boardDs:BoardDataSource;
  public dsFields:Field[] = [];
  public dsCustomFields:CustomField[] = [];

  // 전체 영역별 필드 목록
  public dimensionFields: (Field | CustomField)[] = [];
  public measureFields: (Field | CustomField)[] = [];

  // 페이징 영역별 필드 목록
  public displayDimensions: (Field | CustomField)[] = [];
  public displayMeasures: (Field | CustomField)[] = [];

  // Fields 페이지 정보
  public dimPage: number = 1;
  public dimTotalPage: number = 1;
  public meaPage: number = 1;
  public meaTotalPage: number = 1;

  // 검색어
  public searchText = '';

  // 데이터 & 필드 상세 조회
  public isShowDataPreview: boolean = false;
  public isColumnDetail: boolean = false;
  public selectedField: (Field | CustomField);

  // 커스텀 필드 관련 변수
  public customFieldPopupType: string = 'dimension';    // 팝업에 대한 타입
  public selectedCustomField: CustomField;              // 변경할 커스텀 필드
  public isShowCustomFiled: boolean = false;            // 사용자정의 컬럼 설정 팝업 표시 여부

  public dataSourceList: Datasource[] = [];
  public dataSource: Datasource;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Input&Output Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 대시보드 선택 진입점
  @Input()
  public dashboard: Dashboard;

  @Input()
  public chartFilters: Filter[] = [];

  // 필터 토글 클릭
  @Output() public onFilterClick = new EventEmitter();

  // 필터 업데이트
  @Output() public onUpdateFilter = new EventEmitter();

  // 필터 삭제
  @Output() public onDeleteFilter = new EventEmitter();

  // 커스텀 필드 변경
  @Output() public onUpdateCustomField = new EventEmitter();

  // 커스텀 필드 삭제
  @Output() public onDeleteCustomField = new EventEmitter();

  // 별칭 변경 이벤트
  @Output('changeFieldAlias')
  public changeFieldAliasEvent: EventEmitter<Field> = new EventEmitter();


  public widgets: Widget[] = [];
  public globalFilters: Filter[] = [];
  public showDatasourcePanel: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private differs: KeyValueDiffers,
              protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
    this._differ = differs.find({}).create();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 클래스 초기화
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   */
  public ngDoCheck() {
    if(this._differ.diff(this.dashboard)) {
      console.log('changes detected');
      // 초기 설정
      this.widgets = DashboardUtil.getPageWidgets(this.dashboard);
      this.globalFilters = DashboardUtil.getBoardFilters(this.dashboard);
      this.dataSourceList = DashboardUtil.getMainDataSources(this.dashboard);

      // 데이터소스 설정
      this.selectDataSource( this.dataSourceList[0] );
    }
  } // function - ngDoCheck

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - API
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터소스 설정
   * @param {Datasource} dataSource
   */
  public selectDataSource(dataSource: Datasource) {
    if( dataSource ) {
      this.dataSource = dataSource;
      const boardConf: BoardConfiguration = this.dashboard.configuration;

      this.boardDs = DashboardUtil.getBoardDataSourceFromDataSource( this.dashboard, dataSource );

      this.dsFields = _.cloneDeep( DashboardUtil.getFieldsForMainDataSource(boardConf, dataSource.engineName) );
      this._totalFields = this.dsFields;
      if( boardConf.customFields ) {
        this.dsCustomFields = boardConf.customFields.filter( filter => filter.dataSource === this.boardDs.engineName );
        // this._totalFields = this.dsFields.concat(this.dsCustomFields);
        this._totalFields = this._totalFields.concat(this.dsCustomFields);
      }

      this._setFields();
    }
  } // function - selectDataSource

  /**
   * 데이터 소스 패널 표시 상태를 변경한다.
   */
  public toggleDatasourcePanel() {
    this.showDatasourcePanel = !this.showDatasourcePanel;
    this.changeDetect.detectChanges();
    if (this.showDatasourcePanel) {
      this._setFields();
    }
  } // function - toggleDatasourcePanel

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Datasource
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터소스 미리보기 팝업 호출
   */
  public onDataPreviewPopup(): void {
    this.selectedField = null;
    this.isColumnDetail = false;
    this.isShowDataPreview = true;
  } // function - onDataPreviewPopup

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Search
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 검색어에 따라 필드 검색
   * @param {string} inputText
   */
  public searchField(inputText: string) {
    this.searchText = inputText;
    this._setFields(this.searchText);
  } // function - searchField

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Paging
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차원값 이전버튼 클릭 이벤트
   */
  public prevDimPage(): void {
    // 이전 페이지를 갈 수 없다면 중지
    if (this.dimPage <= 1) return;

    // 페이지 감소
    this.dimPage--;

    // 페이징 목록
    let start: number = (this.dimPage - 1) * this.DIM_PAGE_SIZE;
    let end: number = (this.dimPage * this.DIM_PAGE_SIZE);
    this.displayDimensions = this.dimensionFields.slice(start, end);
  } // function - prevDimPage

  /**
   * 차원값 다음버튼 클릭 이벤트
   */
  public nextDimPage(): void {
    // 다음 페이지를 갈 수 없다면 중지
    if (this.dimPage >= this.dimTotalPage) return;

    // 페이지 감소
    this.dimPage++;

    // 페이징 목록
    let start: number = (this.dimPage - 1) * this.DIM_PAGE_SIZE;
    let end: number = (this.dimPage * this.DIM_PAGE_SIZE);
    this.displayDimensions = this.dimensionFields.slice(start, end);
  } // function - nextDimPage

  /**
   * 측정값 이전버튼 클릭 이벤트
   */
  public prevMeaPage(): void {
    // 이전 페이지를 갈 수 없다면 중지
    if (this.meaPage <= 1) return;

    // 페이지 감소
    this.meaPage--;

    // 페이징 목록
    let start: number = (this.meaPage - 1) * this.MEA_PAGE_SIZE;
    let end: number = (this.meaPage * this.MEA_PAGE_SIZE);
    this.displayMeasures = this.measureFields.slice(start, end);
  } // function - prevMeaPage

  /**
   * 측정값 다음버튼 클릭 이벤트
   */
  public nextMeaPage(): void {
    // 다음 페이지를 갈 수 없다면 중지
    if (this.meaPage >= this.meaTotalPage) return;

    // 페이지 감소
    this.meaPage++;

    // 페이징 목록
    let start: number = (this.meaPage - 1) * this.MEA_PAGE_SIZE;
    let end: number = (this.meaPage * this.MEA_PAGE_SIZE);
    this.displayMeasures = this.measureFields.slice(start, end);
  } // function - nextMeaPage

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - List Item
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 외부 static method 정의
  public getDimensionTypeIconClass = Field.getDimensionTypeIconClass;
  public getMeasureTypeIconClass = Field.getMeasureTypeIconClass;
  public unescapeCustomColumnExpr = StringUtil.unescapeCustomColumnExpr;

  /**
   * 필드 상세정보 ContextMenu
   * @param {MouseEvent} event
   * @param {Field} field
   */
  public openFieldDetailLayer(event: MouseEvent, field: Field) {
    // 이벤트 버블링 막기
    event.stopPropagation();
    // 현재 선택된 필드 설정
    this.selectedField = field;
    // 필드 상세 레이어 표시
    this._dataContext.init(field, this.dashboard.configuration.dataSource, $(event.currentTarget), true);
  } // function - openFieldDetailLayer

  /**
   * 필터 변경
   * @param {MouseEvent} event
   * @param {Field} field
   */
  public toggleFilter(event: MouseEvent, field: Field) {

    if (this.isCustomMeasureField(field)) {
      return;
    }

    this.onFilterClick.emit();
    event.stopPropagation();

    // custom measure필드에서 aggregation 함수가 쓰인경우 필터 적용못하게 막기
    if (field.aggregated) {
      Alert.info(this.translateService.instant('msg.page.custom.measure.aggregation.unavailable'));
      return;
    }

    if (field.useFilter) {  // 제거

      // 추천필터 제거 볼가
      if (field.filtering) {
        Alert.warning(this.translateService.instant('msg.board.alert.recomm-filter.del.error'));
        return;
      }

      field.useFilter = false;

      // 필터 제거
      const idx = _.findIndex(this.globalFilters, { field: field.name });
      if (idx > -1) {
        this.onDeleteFilter.emit(this.globalFilters[idx]);
      }
      return;
    } else {  // 추가
      field.useFilter = true;

      // 시간일 경우
      if (field.logicalType === LogicalType.TIMESTAMP) {
        this.onUpdateFilter.emit(FilterUtil.getTimeAllFilter(field));
      } else if (field.role === FieldRole.MEASURE) {
        // 측정값 필터
        this.onUpdateFilter.emit(FilterUtil.getBasicBoundFilter(field));
      } else {
        // inclusion필터
        const inclusionFilter = FilterUtil.getBasicInclusionFilter(field);
        if (field.type === 'user_expr') {
          inclusionFilter.ref = 'user_defined';
        }
        this.onUpdateFilter.emit(inclusionFilter);
      }
    }
  } // function - toggleFilter

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Custom Field
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 사용자 정의 필드 팝업 열기
   * @param {string} popupType
   * @param {CustomField} customField
   */
  public openCustomFieldPopup(popupType: string, customField?: CustomField) {
    this.customFieldPopupType = popupType;
    if (customField) {
      this.selectedCustomField = customField;
    } else {
      this.selectedCustomField = null;
    }
    this.isShowCustomFiled = true;
  } // function - openCustomFieldPopup

  /**
   * 사용자 정의 필드 팝업 열기 ( 컨텍스트 메뉴로 부터.. )
   * @param customField
   */
  public openCustomFieldPopupFromContext( customField:CustomField ) {
    this.customFieldPopupType = customField.role.toString();
    this.selectedCustomField = customField;
    this.isShowCustomFiled = true;
  } // function - openCustomFieldPopupFromContext

  /**
   * 사용자 정의 컬럼 변경
   * ( TODO : 추후 update-dashboard 에 있는 함수를 이곳으로 옮겨와야 한다. )
   * @param data
   */
  public updateCustomField(data: any) {
    this.onUpdateCustomField.emit(data);
    this.isShowCustomFiled = false;
  } // function - updateCustomField

  /**
   * 사용자 정의 컬럼 삭제
   * ( TODO : 추후 update-dashboard 에 있는 함수를 이곳으로 옮겨와야 한다. )
   * @param {CustomField} field
   */
  public deleteCustomField(field: CustomField) {
    this.onDeleteCustomField.emit(field);
    this.isShowCustomFiled = false;
  } // function - deleteCustomField

  /**
   * 사용자 정의 측정값 필드 여부
   * @param {Field} field
   * @returns {boolean}
   */
  public isCustomMeasureField(field: Field) {
    return FieldRole.MEASURE === field.role && 'user_expr' === field.type;
  } // function - isCustomMeasureField

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Context Menu
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 컬럼 디테일 팝업 호출
   * @param field
   */
  public onColumnDetailPopup(field: Field): void {
    this.selectedField = field;
    this.isColumnDetail = true;
    this.isShowDataPreview = true;
  } // function - onColumnDetailPopup

  /**
   * 데이터소스 필드의 별칭이 변경되었을때의 처리
   * @param {Field} changeField
   */
  public changeDatasourceFieldAlias(changeField: Field) {
    this.changeFieldAliasEvent.emit(changeField);
  } // function - changeDatasourceFieldAlias

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필드 설정
   * @param {string} searchText
   * @private
   */
  private _setFields(searchText?: string) {

    if (this.showDatasourcePanel) {

      this._setUseChart(this._totalFields);
      this._setUseFilter(this._totalFields);

      this.dimensionFields = this._totalFields.filter(item => item.role !== FieldRole.MEASURE);
      this.measureFields = this._totalFields.filter(item => item.role === FieldRole.MEASURE);

      let dimensionFields = _.cloneDeep(this.dimensionFields);
      let measureFields = _.cloneDeep(this.measureFields);

      if (searchText) {
        searchText = searchText.toLowerCase();
        dimensionFields = dimensionFields.filter(item => item.name.toLowerCase().includes(searchText));
        measureFields = measureFields.filter(item => item.name.toLowerCase().includes(searchText));
      }

      if (this.DIM_PAGE_SIZE < dimensionFields.length) {
        this.dimPage = 1;
        this.dimTotalPage = Math.ceil(dimensionFields.length / this.DIM_PAGE_SIZE);
        this.displayDimensions = dimensionFields.slice(0, this.DIM_PAGE_SIZE);
      } else {
        this.dimPage = 1;
        this.dimTotalPage = 1;
        this.displayDimensions = dimensionFields;
      }

      if (this.MEA_PAGE_SIZE < measureFields.length) {
        this.meaPage = 1;
        this.meaTotalPage = Math.ceil(measureFields.length / this.MEA_PAGE_SIZE);
        this.displayMeasures = measureFields.slice(0, this.MEA_PAGE_SIZE);
      } else {
        this.meaPage = 1;
        this.meaTotalPage = 1;
        this.displayMeasures = measureFields;
      }

    }

  } // function - _setFields

  /**
   * 사용중인 필드 설정
   * @param {(Field | CustomField)[]} totalFields
   * @private
   */
  private _setUseChart(totalFields: (Field | CustomField)[]) {

    totalFields.forEach(field => field.useChart = false);

    if (this.widgets && this.widgets.length > 0) {

      this.widgets.forEach((widget: Widget) => {

      // map - set shelf layers
      if (undefined !== widget.configuration['chart']['layerNum'] && widget.type === 'page' && widget.configuration && widget.configuration['shelf']) {

        const pivotConf = widget.configuration['shelf'];
        const layerNum = widget.configuration['chart']['layerNum'];
        if (undefined !== layerNum && pivotConf.layers && 0 < pivotConf.layers[layerNum].length) {
          pivotConf.layers[layerNum].forEach(layer => {
            let idx: number = totalFields.findIndex(field => field.name === layer.name);
            if (-1 < idx) {
              totalFields[idx].useChart = true;
            }
          });
        }
      } else if (widget.type === 'page' && widget.configuration && widget.configuration['pivot']) {
          const pivotConf = widget.configuration['pivot'];
          if (pivotConf.columns && 0 < pivotConf.columns.length) {
            pivotConf.columns.forEach(column => {
              let idx: number = totalFields.findIndex(field => field.name === column.name);
              if (-1 < idx) {
                totalFields[idx].useChart = true;
              }
            });
          }
          if (pivotConf.rows && 0 < pivotConf.rows.length) {
            pivotConf.rows.forEach(row => {
              let idx: number = totalFields.findIndex(field => field.name === row.name);
              if (-1 < idx) {
                totalFields[idx].useChart = true;
              }
            });
          }
          if (pivotConf.aggregations && 0 < pivotConf.aggregations.length) {
            pivotConf.aggregations.forEach(aggregation => {
              let idx: number = totalFields.findIndex(field => field.name === aggregation.name);
              if (-1 < idx) {
                totalFields[idx].useChart = true;
              }
            });
          }
        }
      });
    } // end if - widgets
  } // function - _setUseChart

  /**
   * 필터 사용 여부 설정
   * @param {(Field | CustomField)[]} totalFields
   * @private
   */
  private _setUseFilter(totalFields: (Field | CustomField)[]) {
    totalFields.forEach(field => {
      field.useChartFilter = false;
      field.useFilter = false;
      field['isCustomMeasure'] = this.isCustomMeasureField(<Field>field);
    });

    // 필드로 필터 사용판단
    totalFields.forEach((field) => {
      // 글로벌 필터로 사용하는지
      let idx = _.findIndex(this.globalFilters, { field: field.name });
      if (idx > -1) field.useFilter = true;

      // 차트 필터로 사용중인지
      idx = _.findIndex(this.chartFilters, { field: field.name });
      if (idx > -1) field.useChartFilter = true;
    });
  } // function - _setUseFilter

}
