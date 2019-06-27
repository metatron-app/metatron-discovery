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
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {PageWidgetConfiguration} from '../../../domain/dashboard/widget/page-widget';
import {AnalysisPredictionComponent} from './prediction/analysis-prediction.component';
import {TrendLineComponent} from './trend.line/trend.line.component';
import {AbstractComponent} from '../../../common/component/abstract.component';
import * as _ from 'lodash';
import {UIOption} from '../../../common/component/chart/option/ui-option';
import {EventType} from '../../../common/component/chart/option/define/common';
import {AnalysisPredictionService} from './service/analysis.prediction.service';
import {fromEvent} from "rxjs";
import {MapSpatialComponent} from "./map-spatial/map-spatial.component";
import {Shelf} from "../../../domain/workbook/configurations/shelf/shelf";

@Component({
  selector: 'analysis-component',
  templateUrl: './analysis.component.html'
})
export class AnalysisComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 패널
   */
  @ViewChild('panel')
  private panel: ElementRef;

  /**
   * 예측선
   */
  @ViewChild(AnalysisPredictionComponent)
  private analysisPredictionComponent: AnalysisPredictionComponent;

  /**
   * 추세선
   */
  @ViewChild(TrendLineComponent)
  private trendLineComponent: TrendLineComponent;

  @ViewChild('MapSpatialComponent')
  private mapSpatialComponent: MapSpatialComponent;

  // ---------------------------------------
  // @Output
  // ---------------------------------------

  @Output('clickDataPanelNoti')
  private clickDataPanelNoti = new EventEmitter();

  @Output('changeAnalysisPredictionNoti')
  private changeAnalysisPrediction = new EventEmitter();

  @Output('changeForecastNoti')
  private changeForecast = new EventEmitter();

  @Output('changeConfidenceNoti')
  private changeConfidence = new EventEmitter();

  @Output('changeAnalysisNoti')
  private changeAnalysis = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public whatKindOfChart: string = '';

  public dataSubLayerKey: string = '';

  // ---------------------------------------
  // @Input
  // ---------------------------------------

  @Input('isChartShow')
  public isChartShow: boolean;

  @Input('selectChart')
  public selectChart: string;

  @Input('widgetConfiguration')
  public widgetConfiguration: PageWidgetConfiguration;

  @Input('dataLayerKey')
  public dataLayerKey: string;

  @Input('uiOption')
  public uiOption: UIOption;

  @Input('shelf')
  public shelf: Shelf;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private element: ElementRef,
              protected injector: Injector,
              private analysisPredictionService: AnalysisPredictionService) {

    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnChanges(changes: SimpleChanges): void {
    if (!_.isUndefined(changes['dataLayerKey'])) {
      if (changes['dataLayerKey'].currentValue !== 'analysis') {
        this.dataSubLayerKey = '';
      }
    }
    if (!_.isUndefined(changes['selectChart'])) {
      this.selectChart = changes['selectChart']['currentValue'];
    }
  }

  // Init
  public ngOnInit(): void {
    // 패널 클릭 이벤트
    fromEvent(this.panel.nativeElement, 'click')
      .subscribe(() => {
        this.clickDataPanel('analysis');
      });
  }

  // Destory
  public ngOnDestroy(): void {
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public drawComplete(uiOption: UIOption, param?: Object): void {
    this.synchronize(uiOption, param);
  }

  public synchronize(uiOption: UIOption, param?: Object, data?: Object): void {

    // pivot이 변경된경우 변경된 parameters값 적용
    if (data && EventType.CHANGE_PIVOT == data['type']) {

      const widget = data['widget'];
      const lineChart = data['lineChart'];

      this.analysisPredictionService
        .changeAnalysisPredictionLine(this.widgetConfiguration, widget, lineChart, null)
        .then((result) => {
          this.analysisPredictionComponent.synchronize(uiOption, param, result.info.analysis);
        });

    } else {
      this.analysisPredictionComponent.synchronize(uiOption, param);
    }
  }

  public changeOption(): void {
    this.analysisPredictionComponent.changeOption();
  }

  public isValid(): boolean {
    return this.analysisPredictionComponent.isValid();
  }

  public changePredictionLineDisabled(): void {
    this.analysisPredictionComponent.changePredictionLineDisabled();
  }

  public mapSpatialChanges(uiOption, shelf) {
    if (_.isUndefined(this.mapSpatialComponent)) {
      return;
    }
    this.mapSpatialComponent.mapSpatialChanges(uiOption, shelf);
  }

  public mapSpatialAnalysisBtn() {
    this.mapSpatialComponent.spatialAnalysisBtn();
  }

  // ------------------------------------
  // @Output
  // ------------------------------------

  public changeAnalysisPredictionNoti(): void {
    this.changeAnalysisPrediction.emit();
  }

  public changeForecastNoti(): void {
    this.changeForecast.emit();
  }

  public changeConfidenceNoti(): void {
    this.changeConfidence.emit();
  }

  public clickDataPanel(dataLayerKey: string): void {
    this.clickDataPanelNoti.emit(dataLayerKey);
  }

  public changeAnalysisNoti(value) {
    this.changeAnalysis.emit(value);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
