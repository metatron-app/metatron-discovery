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
  Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';

import { Filter } from '@domain/workbook/configurations/filter/filter';
import { Dashboard } from '@domain/dashboard/dashboard';
import { Widget } from '@domain/dashboard/widget/widget';
import { Datasource } from '@domain/datasource/datasource';
import { PageWidget, PageWidgetConfiguration } from '@domain/dashboard/widget/page-widget';

import { DashboardUtil } from '../util/dashboard.util';
import { AbstractFilterPopupComponent } from './abstract-filter-popup.component';
import { ConfigureFiltersSelectComponent } from './configure-filters-select.component';
import { ConfigureFiltersUpdateComponent } from './configure-filters-update.component';

@Component({
  selector: 'app-config-filter',
  templateUrl: './configure-filters.component.html'
})
export class ConfigureFiltersComponent extends AbstractFilterPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(ConfigureFiltersSelectComponent)
  private _selectFieldComp: ConfigureFiltersSelectComponent;

  @ViewChild(ConfigureFiltersUpdateComponent)
  private _updateFilterComp: ConfigureFiltersUpdateComponent;

  private _board: Dashboard;
  private _widget:PageWidget;
  private _chartFilters:Filter[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public done:EventEmitter<Filter> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트를 연다.
   * @param {Dashboard} board
   * @param {Filter[]} chartFilters
   * @param {Filter} targetFilter
   * @param {Widget} widget
   */
  public open(board: Dashboard, chartFilters:Filter[], targetFilter?: Filter, widget?:Widget) {
    this._board = board;
    this._widget = widget as PageWidget;
    if (targetFilter) {
      this._updateFilterComp.openForEditFilter( board, { key : 'EDIT', filter : targetFilter } , true, this._widget);
    } else {
      this._chartFilters = chartFilters;
      const dataSources:Datasource[] = DashboardUtil.getMainDataSources( this._board );
      this._selectFieldComp.open(
        board.configuration, dataSources, this._getTargetDataSource( dataSources, this._widget ),
        this._chartFilters, this._widget
      );
    }
  } // function - open

  /**
   * 아무런 작업을 하지 않고 컴포넌트를 닫는다.
   */
  public close() {
    this._updateFilterComp.close();
    this._selectFieldComp.close();
  } // function - close

  /**
   * 필터 변경을 요청한다.
   * @param {Filter} filter
   */
  public emitUpdateFilter(filter:Filter) {
    this.done.emit(filter);
  } // function - emitUpdateFilter

  /**
   * 필터 설정
   * @param {any} data
   */
  public setFilter(data: { key: string, filter: Filter }) {
    if ('ADD' === data.key) {
      this._updateFilterComp.openForAddFilter(this._board, data, this._widget);
    } else {
      this._updateFilterComp.openForEditFilter(this._board, data, false, this._widget);
    }
    this._selectFieldComp.close();
  } // function - setFilter

  /**
   * 필드 선택 컴포넌트를 연다.
   * @param {Filter} selectedFilter
   */
  public showSelectFieldComp(selectedFilter:Filter) {
    const dataSources:Datasource[] = DashboardUtil.getMainDataSources( this._board );
    this._selectFieldComp.open(
      this._board.configuration, dataSources, dataSources.find( ds => ds.engineName === selectedFilter.dataSource ),
      this._chartFilters, this._widget
    );
    this._updateFilterComp.close();
  } // function - showSelectFieldComp

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 대상 데이터소스 조회
   * @param {Datasource[]} dataSources
   * @param {PageWidget} widget
   * @returns {Datasource}
   * @private
   */
  private _getTargetDataSource( dataSources:Datasource[], widget:PageWidget ) {
    let targetDataSource:Datasource = dataSources[0];
    if( widget ) {
      const widgetConf:PageWidgetConfiguration = widget.configuration as PageWidgetConfiguration;
      targetDataSource = dataSources.find( item => item.id === widgetConf.dataSource.id );
    }
    return targetDataSource;
  } // function - _getTargetDataSource

}
