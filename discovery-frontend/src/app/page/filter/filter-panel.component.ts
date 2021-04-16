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
  Input, OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Filter} from '@domain/workbook/configurations/filter/filter';
import {Dashboard} from '@domain/dashboard/dashboard';
import {Field} from '@domain/datasource/datasource';
import {InclusionFilter} from '@domain/workbook/configurations/filter/inclusion-filter';
import {DatasourceService} from '../../datasource/service/datasource.service';
import {FilterUtil} from '../../dashboard/util/filter.util';

@Component({
  selector: 'page-filter-panel',
  templateUrl: './filter-panel.component.html'
})
export class PageFilterPanelComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public boardFilters: Filter[] = [];
  public chartFilters: Filter[] = [];
  public isOpenBoardFilterList: boolean = false;

  @Input('boardFilters')
  public inputBoardFilters: Filter[];

  @Input('chartFilters')
  public inputChartFilters: Filter[];

  @Input()
  public dashboard: Dashboard;

  @Output('openUpdateFilterPopup')
  public openUpdateFilterPopup = new EventEmitter();

  @Output('updateFilter')
  public updateFilterEvent: EventEmitter<Filter> = new EventEmitter();

  @Output('deleteFilter')
  public deleteFilterEvent: EventEmitter<Filter> = new EventEmitter();

  @Output('changeGlobalToChart')
  public changeGlobalToChartEvent: EventEmitter<Filter> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public getDimensionTypeIconClass = Field.getDimensionTypeIconClass;
  public getMeasureTypeIconClass = Field.getMeasureTypeIconClass;
  public filterUtil = FilterUtil;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const chartFilterChanges: SimpleChange = changes.inputChartFilters;
    const boardFilterChanges: SimpleChange = changes.inputBoardFilters;
    if (chartFilterChanges) {
      this.chartFilters = chartFilterChanges.currentValue;
    }
    if (boardFilterChanges) {
      this.boardFilters = boardFilterChanges.currentValue;
      FilterUtil.getPanelContentsList(
        this.boardFilters,
        this.dashboard,
        (filter: InclusionFilter, field: Field) => {
          this._setInclusionFilter(filter, field);
        }
      );
    }
  } // function - ngOnChanges

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * 필터 목록을 강제로 설정하기 위해 사용
   * @param {Filter[]} boardFilters
   * @param {Filter[]} chartFilters
   */
  public setFilters(boardFilters: Filter[], chartFilters: Filter[]) {
    this.boardFilters = [];
    this.chartFilters = [];
    this.safelyDetectChanges();

    this.boardFilters = boardFilters;
    this.chartFilters = chartFilters;
    FilterUtil.getPanelContentsList(
      this.boardFilters,
      this.dashboard,
      (filter: InclusionFilter, field: Field) => {
        this._setInclusionFilter(filter, field);
      }
    );
    this.safelyDetectChanges();
  } // function - setFilters

  /**
   * 리스트의 개별성 체크 함수
   * @param _index
   * @param {Filter} filter
   * @return {string}
   */
  public trackByFn(_index, filter: Filter) {
    return filter.field;
  } // function - trackByFn

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Inclusion Filter 설정
   * @param {InclusionFilter} filter
   * @param {Field} field
   * @private
   */
  private _setInclusionFilter(filter: InclusionFilter, field: Field) {

    // 필터 데이터 후보 조회
    this.loadingShow();
    this.datasourceService.getCandidateForFilter(filter, this.dashboard, [], field).then((result) => {

      const valueList: string[] = filter.valueList;
      if ((valueList && 0 < valueList.length && valueList.length !== result.length)) {
        filter['panelContents'] = valueList.join(' , ');
      } else {
        filter['panelContents'] = '(' + this.translateService.instant('msg.comm.ui.list.all') + ')';
      }

      this.safelyDetectChanges();

      this.loadingHide();
    }).catch((error) => console.error(error));
  } // function - _setInclusionFilter

}
