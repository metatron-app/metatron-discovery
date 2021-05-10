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

import {AbstractComponent} from '@common/component/abstract.component';
import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {NotebookService} from '../../service/notebook.service';
import {Alert} from '@common/util/alert.util';
import {isUndefined} from 'util';

@Component({
  selector: 'app-chart-summary',
  templateUrl: './chart-summary.component.html'
})
export class ChartSummaryComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // chart summary
  public chartSummary: any = {};

  // columns
  public columns: any[] = [];

  // rows
  public rows: any[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 변경 이벤트
  @Output('close')
  public closeEvent = new EventEmitter();

  @Input('chart')
  public set setChart(chartId: string) {
    if (this.chartId !== chartId) {
      this.chartId = chartId;

      // 차트 조회
      this.getChartSummary(this.chartId);
    }
  }

  // 차트 아이디.
  public chartId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected notebookService: NotebookService,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public getIconClass(itemType: string): string {
    let result = '';
    switch (itemType.toUpperCase()) {
      case 'TIMESTAMP':
        result = 'ddp-icon-type-calen';
        break;
      case 'BOOLEAN':
        result = 'ddp-icon-type-tf';
        break;
      case 'TEXT':
      case 'DIMENSION':
      case 'STRING':
        result = 'ddp-icon-type-ab';
        break;
      case 'USER_DEFINED':
        result = 'ddp-icon-type-ab';
        break;
      case 'INT':
      case 'INTEGER':
      case 'LONG':
        result = 'ddp-icon-type-int';
        break;
      case 'DOUBLE':
        result = 'ddp-icon-type-float';
        break;
      case 'CALCULATED':
        result = 'ddp-icon-type-sharp';
        break;
      case 'LNG':
      case 'LATITUDE':
        result = 'ddp-icon-type-latitude';
        break;
      case 'LNT':
      case 'LONGITUDE':
        result = 'ddp-icon-type-longitude';
        break;
      default:
        console.error(this.translateService.instant('msg.common.ui.no.icon.type'), itemType);
        break;
    }
    return result;
  }

  public closeBtn() {
    this.closeEvent.emit('');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  protected getChartSummary(chartId: string) {
    this.loadingShow();
    this.notebookService.getChartDetail(chartId)
      .then((data) => {
        this.loadingHide();
        this.chartSummary = data;
        if (!isUndefined(data.configuration)) {
          this.columns = data.configuration.pivot.columns;
          this.rows = data.configuration.pivot.rows;
        }
      })
      .catch((error) => {
        this.loadingHide();
        Alert.error(this.translateService.instant('msg.nbook.alert.chart.retrieve.fail'));
        console.log('dashboardDetail', error);
      });
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
