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

import * as _ from 'lodash';
import {
  AfterViewInit, Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output,
  SimpleChange, SimpleChanges, ViewChild
} from '@angular/core';
import {RangeSliderComponent} from '../slider/range-slider.component';
import {Pivot} from '../../../../domain/workbook/configurations/pivot';
import {
  ChartColorList, GraphicType, ShelveFieldType,
  ShelveType
} from '../../../../common/component/chart/option/define/common';
import {PageWidgetConfiguration} from '../../../../domain/dashboard/widget/page-widget';
import {Analysis, analysis, Confidence, Forecast, HyperParameter, Style} from '../../value/analysis';
import {ColorPickerLayerComponent} from '../color.picker/color.picker.layer.component';
import * as $ from 'jquery';
import {SelectComponent} from '../../../../common/component/select/select.component';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {Alert} from '../../../../common/util/alert.util';
import {TimeUnit} from '../../../../domain/workbook/configurations/field/timestamp-field';
import {UIOption} from '../../../../common/component/chart/option/ui-option';
import {Field} from '../../../../domain/workbook/configurations/field/field';
import {UIChartColorBySeries} from '../../../../common/component/chart/option/ui-option/ui-color';

@Component({
  selector: 'analysis-prediction',
  templateUrl: './analysis-prediction.component.html'
})
export class AnalysisPredictionComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constant Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private DEFAULT_PREDICTION_LINE_SLIDER_FROM: number = 95;

  /**
   * Alpha, Beta, Gamma 기본값 지정에 사용
   *
   * @type {HyperParameter}
   */
  private DEFAULT_HYPER_PARAMETER: HyperParameter = new HyperParameter();

  // ---------------------------------------
  // Template 에서 사용하는 라벨
  // ---------------------------------------

  public LABEL: {
    ANALYSIS: string;
    SUB_MENU: string;
    ACTIVE: string;
    ACTIVE_FIRST_DESCRIPTION: string;
    ACTIVE_LAST_DESCRIPTION: string;
    ALGORITHM_NAME: string;
    INTERVAL: string;
    SLIDER_TITLE: string;
    ANALYSIS_SETTING: string;
    ALPHA: string;
    BETA: string;
    TREND: string;
    GAMMA: string;
    GAMMA_ADDITIVE: string;
    GAMMA_MULTIPLICATIVE: string;
    SEASONAL: string;
    FORECAST: string;
    CONFIDENCE: string;
    OPACITY: string;
    PROCENT: string;
    HYPHEN: string
  } = {
    // Analysis
    'ANALYSIS': 'Analysis',
    // 예측선
    'SUB_MENU': '예측선',
    // 활성화
    'ACTIVE': '활성화',
    // 예측선을 사용할 수 있는 차트
    'ACTIVE_FIRST_DESCRIPTION': '예측선을 사용할 수 있는 차트',
    // 라인차트
    'ACTIVE_LAST_DESCRIPTION': '라인차트',
    // Holt-Winters
    'ALGORITHM_NAME': 'Holt-Winters',
    // 예측기간
    'INTERVAL': '예측기간',
    // 신뢰구간
    'SLIDER_TITLE': '신뢰구간',
    // 고급설정
    'ANALYSIS_SETTING': '고급설정',
    // alpha
    'ALPHA': 'alpha',
    // beta
    'BETA': 'beta',
    // trend
    'TREND': 'trend',
    // gamma
    'GAMMA': 'gamma',
    // additive
    'GAMMA_ADDITIVE': 'additive',
    // multiplicative
    'GAMMA_MULTIPLICATIVE': 'multiplicative',
    // seasonal
    'SEASONAL': 'seasonal',
    // Forecast
    'FORECAST': 'Forecast',
    // Confidence
    'CONFIDENCE': 'Confidence',
    // 투명도
    'OPACITY': '투명도',
    // %
    'PROCENT': '%',
    // -
    'HYPHEN': '-'
  };

  private MESSAGE: {
    ALPHA: string;
    BETA: string;
    GAMMA: string;
    PLEASE_VALUE: string;
    VALUES_ONLY_NUMERIC: string;
    PLEASE_FORECAST_PERIOD: string;
    PLEASE_TRANSPARENCY: string;
    VALUES_LESS_THAN_0_CAN_NOT_BE_ENTERED: string;
    VALUES_GREATER_THAN_100_CAN_NOT_BE_ENTERED: string;
  } = {
    'ALPHA': '알파',
    'BETA': '베타',
    'GAMMA': '감마',
    'PLEASE_VALUE': '값을 입력해주세요.',
    'VALUES_ONLY_NUMERIC': '값은 숫자만 입력할 수 있습니다.',
    'PLEASE_FORECAST_PERIOD': '예측기간을 입력해주세요.',
    'PLEASE_TRANSPARENCY': '투명도를 입력해주세요.',
    'VALUES_LESS_THAN_0_CAN_NOT_BE_ENTERED': '0 보다 작은 값은 입력할 수 없습니다.',
    'VALUES_GREATER_THAN_100_CAN_NOT_BE_ENTERED': '100 보다 큰 값은 입력할 수 없습니다.'
  };

  // ----------------------------------------------
  // 셀렉트 박스에서 사용할 값
  // ----------------------------------------------

  public LINE_TYPE_LIST: string[] = [
    'SOLID',
    'DASHED',
    'DOTTED'
  ];

  public LINE_WIDTH_LIST: string[] = [
    '2.0',
    '2.5',
    '3.0',
    '3.5',
    '4',
    '4.5',
    '5'
  ];

  // ------------------------------------------------
  // 현재 언어
  // ------------------------------------------------

  public currentLang: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터 변경 알림
  private changeSubject$ = new Subject<{
    isPredictionLineDisabled: boolean;
    isPredictionLineActive: boolean;
    isAnalysisSettingsActive: boolean;
    isSelectedForecast: boolean;
    isSelectedConfidence: boolean;
    analysis: Analysis
  }>();

  // 데이터 변경 알림 구독
  private changeSubjectSubscription: Subscription;

  // Forecast 하위 값 변경 알림
  private changeForecastSubject$ = new Subject<{
    isPredictionLineDisabled: boolean;
    isPredictionLineActive: boolean;
    isAnalysisSettingsActive: boolean;
    isSelectedForecast: boolean;
    isSelectedConfidence: boolean;
    analysis: Analysis
  }>();

  // Forecast 하위 값 변경 알림 구독
  private changeForecastSubscription: Subscription;

  // Confidence 하위 값 변경 알림
  private changeConfidenceSubject$ = new Subject<{
    isPredictionLineDisabled: boolean;
    isPredictionLineActive: boolean;
    isAnalysisSettingsActive: boolean;
    isSelectedForecast: boolean;
    isSelectedConfidence: boolean;
    analysis: Analysis
  }>();

  // Confidence 하위 값 변경 알림 구독
  private changeConfidenceSubscription: Subscription;

  // ---------------------------------------
  // ElementRef
  // ---------------------------------------

  /**
   * 슬라이더 컴포넌트
   */
  @ViewChild(RangeSliderComponent)
  private predictionSlider: RangeSliderComponent;

  /**
   * 패널
   */
  @ViewChild('panel')
  private panel: ElementRef;

  /**
   * ColorPickerLayer Component
   */
  @ViewChild(ColorPickerLayerComponent)
  private colorPickerLayerComponent: ColorPickerLayerComponent;

  /**
   * 셀렉트 박스 컴포넌트
   */
  @ViewChild('selectComponent')
  private selectComponent: SelectComponent;

  /**
   * 라인 타입 셀렉트 박스 컴포넌트
   */
  @ViewChild('selectLineTypeComponent')
  private selectLineTypeComponent: SelectComponent;

  /**
   * 라인 두께 셀렉트 박스 컴포넌트
   */
  @ViewChild('selectLineComponent')
  private selectLineComponent: SelectComponent;

  // ---------------------------------------
  // @Input
  // ---------------------------------------

  @Input('isChartShow')
  private isChartShow: boolean;

  @Input('selectChart')
  private selectChart: string;

  @Input('widgetConfiguration')
  private widgetConfiguration: PageWidgetConfiguration;

  @Input('dataSubLayerKey')
  public dataSubLayerKey: string = '';

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

  // ---------------------------------------
  //
  // ---------------------------------------

  /**
   * 첫번째 초기화 이후 인지 검사하는 플래그
   *  - AfterViewInit hook 마지막에 해당 값을 true 로 변경
   * @type {boolean}
   */
  private initialized = false;

  // ---------------------------------------
  //
  // ---------------------------------------

  private originWidgetConfigurationAnalysis: Analysis;

  private uiOption: UIOption;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public data: {
    isPredictionLineDisabled: boolean;
    isPredictionLineActive: boolean;
    isAnalysisSettingsActive: boolean;
    isSelectedForecast: boolean;
    isSelectedConfidence: boolean;
    analysis: Analysis
  } = {
    // 예측선 Disabled 여부
    'isPredictionLineDisabled': false,
    // 예측선 활성화 여부
    'isPredictionLineActive': false,
    // 고급설정: 활성화 / 비활성화
    'isAnalysisSettingsActive': true,
    // Forecast 선택여부
    'isSelectedForecast': true,
    // Confidence 선택여부
    'isSelectedConfidence': true,
    // Analysis - 서버 스펙에 맞는 vo
    'analysis': null
  };

  /**
   * forecastParameters 셀렉트 박스 컴포넌트에 넘겨줄 문자열 목록
   * @type {any[]}
   */
  public forecastParameters: string[] = [];

  /**
   * 선택된 측정 값 오브젝트
   * @type {HyperParameter}
   */
  public selectedForecastParameter: HyperParameter = new HyperParameter();

  /**
   * Pivot
   */
  public pivot: Pivot;

  // ---------------------------------------
  // @Input
  // ---------------------------------------

  /**
   * LNB menu show / hide flag
   */
  @Input('dataLayerKey')
  public dataLayerKey: string;

  // ---------------------------------------
  // ColorPickerLayer Component x, y 좌표 값
  // ---------------------------------------

  /**
   * Color Picker Layer Offset X
   */
  public colorPickerLayerOffsetX: string;

  /**
   * Color Picker Layer Offset Y
   */
  public colorPickerLayerOffsetY: string;

  // -----------------------------------------
  // 예측선 슬라이더 옵션
  // -----------------------------------------

  public predictionLineSliderHideFromTo: boolean = false;
  public predictionLineSliderHideMinMax: boolean = true;
  public predictionLineSliderKeyboard: boolean = false;
  public predictionLineSliderMin: number = 50;
  public predictionLineSliderMax: number = 99;
  public predictionLineSliderFrom: number = 95;
  public predictionLineSliderType: string = 'single';
  public predictionLineSliderStep: number = 5;
  public predictionLineSliderGrid: boolean = false;
  public predictionLineSliderObject: object = {
    name: 'Page Analysis Slider',
    onUpdate: undefined,
    onFinish: undefined
  };

  // ---------------------------------------------
  //
  // ---------------------------------------------

  public forecastParametersSelectedIndex: number = 0;

  public selectLineTypeComponentDefaultIndex: number = 0;

  public selectLineComponentDefaultIndex: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * constructor
   *
   * @param {ElementRef} element
   * @param {Injector} injector
   */
  constructor(private element: ElementRef,
              protected injector: Injector) {

    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ngOnInit
   */
  public ngOnInit(): void {

    // 현재 언어
    this.currentLang = this.translateService.currentLang;

    // Analysis
    this.LABEL.ANALYSIS = this.translateService.instant('msg.page.prediction.analysis');
    // 예측선
    this.LABEL.SUB_MENU = this.translateService.instant('msg.page.prediction.sub.menu');
    // 활성화
    this.LABEL.ACTIVE = this.translateService.instant('msg.page.prediction.span.active');
    // 예측선을 사용할 수 있는 차트
    this.LABEL.ACTIVE_FIRST_DESCRIPTION = this.translateService.instant('msg.page.prediction.active.first.description');
    // 라인차트
    this.LABEL.ACTIVE_LAST_DESCRIPTION = this.translateService.instant('msg.page.prediction.active.last.description');
    // Holt-Winters
    this.LABEL.ALGORITHM_NAME = this.translateService.instant('msg.page.prediction.algorithm.name');
    // 예측기간
    this.LABEL.INTERVAL = this.translateService.instant('msg.page.prediction.span.interval');
    // 신뢰구간
    this.LABEL.SLIDER_TITLE = this.translateService.instant('msg.page.prediction.span.slider.title');
    // 고급설정
    this.LABEL.ANALYSIS_SETTING = this.translateService.instant('msg.page.prediction.a.advanced.settings');
    // alpha
    this.LABEL.ALPHA = this.translateService.instant('msg.page.prediction.alpha');
    // beta
    this.LABEL.BETA = this.translateService.instant('msg.page.prediction.beta');
    // trend
    this.LABEL.TREND = this.translateService.instant('msg.page.prediction.trend');
    // gamma
    this.LABEL.GAMMA = this.translateService.instant('msg.page.prediction.gamma');
    // additive
    this.LABEL.GAMMA_ADDITIVE = this.translateService.instant('msg.page.prediction.gamma.additive');
    // multiplicative
    this.LABEL.GAMMA_MULTIPLICATIVE = this.translateService.instant('msg.page.prediction.gamma.multiplicative');
    // seasonal
    this.LABEL.SEASONAL = this.translateService.instant('msg.page.prediction.seasonal');
    // Forecast
    this.LABEL.FORECAST = this.translateService.instant('msg.page.prediction.forecast');
    // Confidence
    this.LABEL.CONFIDENCE = this.translateService.instant('msg.page.prediction.confidence');
    // 투명도
    this.LABEL.OPACITY = this.translateService.instant('msg.page.prediction.opacity');
    // Alpha
    this.MESSAGE.ALPHA = this.translateService.instant('msg.page.prediction.alert.alpha');
    // Beta
    this.MESSAGE.BETA = this.translateService.instant('msg.page.prediction.alert.beta');
    // Gamma
    this.MESSAGE.GAMMA = this.translateService.instant('msg.page.prediction.alert.gamma');
    // 값을 입력해주세요.
    this.MESSAGE.PLEASE_VALUE = this.translateService.instant('msg.page.prediction.alert.please.value');
    // 값은 숫자만 입력할 수 있습니다.
    this.MESSAGE.VALUES_ONLY_NUMERIC = this.translateService.instant('msg.page.prediction.alert.values.numeric');
    // 예측기간을 입력해주세요.
    this.MESSAGE.PLEASE_FORECAST_PERIOD = this.translateService.instant('msg.page.prediction.alert.forecast.period');
    // 투명도를 입력해주세요.
    this.MESSAGE.PLEASE_TRANSPARENCY = this.translateService.instant('msg.page.prediction.alert.please.transparency');
    // 0 보다 작은 값은 입력할 수 없습니다.
    this.MESSAGE.VALUES_LESS_THAN_0_CAN_NOT_BE_ENTERED = this.translateService.instant('msg.page.prediction.alert.0.not');
    // 100 보다 큰 값은 입력할 수 없습니다.
    this.MESSAGE.VALUES_GREATER_THAN_100_CAN_NOT_BE_ENTERED = this.translateService.instant('msg.page.prediction.alert.100.not');

    /**
     * 예측선 데이터 변경 알림 처리
     *
     * @type {Subscription}
     */
    this.changeSubjectSubscription = this.changeSubject$
      .subscribe((data) => {

        if (this.isChartTypeLine()) {
          if (_.isUndefined(data.analysis)) {
            this.removeAnalysisPredictionLine();
          } else {

            this.widgetConfiguration.analysis = data.analysis.analysis;

            if (typeof this.originWidgetConfigurationAnalysis !== 'undefined') {
              this.originWidgetConfigurationAnalysis = _.cloneDeep(this.widgetConfiguration.analysis);
            }
          }

          this.changeAnalysisPrediction.emit();
        }
      });

    /**
     * Forecast 값 변경 알림 처리
     *
     * @type {Subscription}
     */
    this.changeForecastSubscription = this.changeForecastSubject$
      .subscribe((data) => {

        if (this.isChartTypeLine()) {
          if (_.isUndefined(data.analysis)) {
            this.removeAnalysisPredictionLine();
          } else {
            this.widgetConfiguration.analysis = data.analysis.analysis;
          }

          this.changeForecast.emit();
        }
      });

    /**
     * Confidence 값 변경 알림
     *
     * @type {Subscription}
     */
    this.changeConfidenceSubscription = this.changeConfidenceSubject$
      .subscribe((data) => {

        if (this.isChartTypeLine()) {
          if (_.isUndefined(data.analysis)) {
            this.removeAnalysisPredictionLine();
          } else {
            this.widgetConfiguration.analysis = data.analysis.analysis;
          }

          this.changeConfidence.emit();
        }
      });
  }

  /**
   * ngAfterViewInit
   */
  public ngAfterViewInit(): void {
    this.initialized = true;
  }

  /**
   * ngOnChanges
   *
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges): void {

    if (this.initialized) {

      // 차트가 그려지지 않았으면 고급분석 데이터 삭제
      if (!_.isUndefined(changes['isChartShow'])) {
        const isChartShow: SimpleChange = changes['isChartShow'];
        if (isChartShow.currentValue === false) {

          this.data.isPredictionLineDisabled = false;

          this.data.isPredictionLineActive = false;

          this.removeAnalysisPredictionLine();

          // 예측선 데이터 변경 알림
          //this.predictionLineDataChangeNotification();

          return;
        }
      }

      // 차트가 라인차트가 아니라면 고급분석 데이터를 삭제
      if (!_.isUndefined(changes['selectChart'])) {
        const isChartType: SimpleChange = changes['selectChart'];
        if (isChartType.currentValue !== 'line') {

          this.data.isPredictionLineDisabled = false;

          this.data.isPredictionLineActive = false;

          this.removeAnalysisPredictionLine();

          // 예측선 데이터 변경 알림
          this.predictionLineDataChangeNotification();

          return;
        }
      }

      if (!_.isUndefined(changes['dataLayerKey'])) {
        const dataLayerKey: SimpleChange = changes['dataLayerKey'];
        if (dataLayerKey.currentValue !== 'analysis') {
          this.dataSubLayerKey = '';
        }
      }

      if (!_.isUndefined(changes['dataSubLayerKey'])) {
        const dataSubLayerKey: SimpleChange = changes['dataSubLayerKey'];
        if (dataSubLayerKey.currentValue === 'prediction') {
          if (_.isUndefined(this.widgetConfiguration.analysis)) {
            return;
          }
          if (_.isEmpty(this.widgetConfiguration.analysis)) {
            return;
          }
          this.data.isPredictionLineActive = true;
          return;
        } else {
          this.data.isPredictionLineActive = false;
        }
      }

    }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy(): void {

    if (this.changeSubjectSubscription) {
      this.changeSubjectSubscription.unsubscribe();
    }

    if (this.changeForecastSubscription) {
      this.changeForecastSubscription.unsubscribe();
    }

    if (this.changeConfidenceSubscription) {
      this.changeConfidenceSubscription.unsubscribe();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // -------------------------------------------------------------------------------------------------------------------
  // 예측선 사용가능 여부 검사
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 고급분석 예측선이 사용 가능여부 검사
   *
   * @returns {boolean}
   */
  public isValid(): boolean {

    // 고급 분석 예측선 사용 가능여부
    let result: boolean = false;

    // 차트가 그려져 있고 && 라인차트인 경우
    if (this.isChartDrawed() && this.isChartTypeLine()) {

      const shelve: Pivot = this.widgetConfiguration.pivot;

      const getFieldTypeCount = (shelve: Pivot, shelveType: ShelveType, fieldType: ShelveFieldType) => {
        return shelve[shelveType].filter((field) => {
          return _.eq(field.type, fieldType);
        }).length;
      };

      // ---------------------------------------------
      // 교차값 검사
      // ---------------------------------------------

      if (getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) === 1 && getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) === 0) {
        result = true;
      }

      if (this.widgetConfiguration.pivot.columns.length > 1) {
        return result = false;
      }

      if (getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) !== 1) {
        return result = false;
      }

      if (this.widgetConfiguration.pivot.columns[0].format.unit === TimeUnit.HOUR
        || this.widgetConfiguration.pivot.columns[0].format.unit === TimeUnit.MINUTE
        || this.widgetConfiguration.pivot.columns[0].format.unit === TimeUnit.SECOND
        || this.widgetConfiguration.pivot.columns[0].format.unit === TimeUnit.NONE) {

        return result = false;
      }

      // ---------------------------------------------
      // 차원값 검사
      // ---------------------------------------------

      if (shelve.aggregations.length > 0 && (getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 1 || getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 1)) {
        result = true;
      }

      if (getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) !== 0) {
        return result = false;
      }

      if (getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) !== 0) {
        return result = false;
      }

    }

    return result;
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 예측선 데이터 싱크 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 고급분석 예측선 데이터 싱크
   */
  public synchronize(uiOption: UIOption, param?: Object, resultData?: any): void {

    // isPredictionLineDisabled값 설정
    if (param) param['isPredictionLineDisabled'] = this.setPredictionLineDisabled(param);

    // uiOption값 설정
    this.uiOption = uiOption;

    if (_.isUndefined(this.widgetConfiguration.analysis) || _.isEmpty(this.widgetConfiguration.analysis)) {

      // 파라미터의 disabled로 지정된경우 예측선 설정제거
      if (param && false == param['isPredictionLineDisabled']) {
        this.data.isPredictionLineDisabled = param['isPredictionLineDisabled'];
        this.data.isPredictionLineActive = param['isPredictionLineDisabled'];
        this.removeAnalysisPredictionLine();
      }
      return;
    }

    if (this.isValid()) {

      if (resultData) {
        this.widgetConfiguration.pivot.aggregations
          .forEach((agg) => {
            const hyperParameter = new HyperParameter();

            // alias가 있는경우
            if (agg.alias) hyperParameter.field = agg.alias;
            else if ( 'user_defined' === agg.ref ) hyperParameter.field = agg.ref + '.' + agg.name;
            // alias가 없는경우
            else hyperParameter.field = `${agg.aggregationType + '(' + agg.name + ')'}`;

            hyperParameter.alpha = resultData[`${hyperParameter.field}.params`][0];
            hyperParameter.beta = resultData[`${hyperParameter.field}.params`][1];
            hyperParameter.gamma = resultData[`${hyperParameter.field}.params`][2];

            if (-1 == _.findIndex(this.data.analysis.analysis.forecast.parameters, {field: hyperParameter.field})) {
              // 고급분석 제외
              this.data.analysis.analysis.forecast.parameters.push(_.cloneDeep(hyperParameter));
            }
          });
      }

      const selectedForecastParameterName: string = this.forecastParameters[this.forecastParametersSelectedIndex];

      this.data.analysis = null;
      this.data.analysis = new Analysis();
      this.data.analysis.analysis = new analysis();
      this.data.analysis.analysis = this.widgetConfiguration.analysis;

      // 측정 목록 초기화
      this.forecastParameters = [];

      const widgetConfigurationPivotAggregations = [];
      this.widgetConfiguration.pivot.aggregations
        .forEach((agg, index) => {

          // alias 설정
          let alias: string;
          // alias가 있는경우
          if (agg.alias) alias = agg.alias;
          else if ( 'user_defined' === agg.ref ) alias = agg.ref + '.' + agg.name;
          // alias가 없는경우
          else alias = `${agg.aggregationType + '(' + agg.name + ')'}`;

          const parameter = this.data.analysis.analysis.forecast.parameters
            .filter((param) => {
              return param.field === alias;
            });

          if (parameter.length === 0) {

            const hyperParameter = new HyperParameter();
            hyperParameter.field = alias;

            widgetConfigurationPivotAggregations.push(_.cloneDeep(hyperParameter));
          } else {
            widgetConfigurationPivotAggregations.push(parameter[0]);
          }
        });

      this.data.analysis.analysis.forecast.parameters = [];
      this.data.analysis.analysis.forecast.parameters = widgetConfigurationPivotAggregations;

      // Forecast parameters 목록을 셀렉트 전용 문자열 목록에 추가해준다
      this.data.analysis.analysis.forecast.parameters
        .forEach((param) => {
          this.forecastParameters.push(param.field);
        });

      const forecastParameterIndex = this.forecastParameters.findIndex((item) => {
        return selectedForecastParameterName === item
      });

      if (forecastParameterIndex === -1) {
        this.forecastParametersSelectedIndex = 0;
      } else {
        this.forecastParametersSelectedIndex = forecastParameterIndex;
      }

      this.selectedForecastParameter = this.data.analysis.analysis.forecast.parameters[this.forecastParametersSelectedIndex];

      this.selectLineTypeComponentDefaultIndex = this.getLineTypeFromLineTypeListToLineType(this.data.analysis.analysis.forecast.style.lineType);
      this.selectLineComponentDefaultIndex = this.getLineThicknessFromLineWidthListToLineThickness(this.data.analysis.analysis.forecast.style.lineThickness.toString());

      this.predictionLineSliderFrom = this.data.analysis.analysis.confidence.confidenceInterval;

      this.data.isPredictionLineDisabled = true;
      this.data.isPredictionLineActive = true;

      this.widgetConfiguration.analysis.forecast.parameters.map(parameter => {
        if (parameter.isAuto) {
          if (parameter.alpha !== '') {
            parameter.alpha = Math.round(parameter.alpha.toFixed(3) * 100) / 100;
          }
          if (parameter.beta !== '') {
            parameter.beta = Math.round(parameter.beta.toFixed(3) * 100) / 100;
          }
          if (parameter.gamma !== '') {
            parameter.gamma = Math.round(parameter.gamma.toFixed(3) * 100) / 100;
          }
        }
        return parameter;
      });

      this.originWidgetConfigurationAnalysis = _.cloneDeep(this.widgetConfiguration.analysis);

      let color = this.uiOption.color;
      let schema = this.uiOption.color['schema'];
      let codes: any = _.cloneDeep(ChartColorList[schema]);
      // userCodes가 있는경우 codes대신 userCodes로 설정
      if ((<UIChartColorBySeries>color).mapping) {
        Object.keys((<UIChartColorBySeries>color).mapping).forEach((key, index) => {

          codes[index] = (<UIChartColorBySeries>color).mapping[key];
        });
      }

      // 상속된 색상 설정시에만 forecast, confidence에 color by series / measure의 색상 변경에 따라서 설정
      if (!this.data.analysis.analysis.forecast.style.predictColorUseFl) this.data.analysis.analysis.forecast.style.color = codes[0];
      if (!this.data.analysis.analysis.confidence.style.predictColorUseFl) this.data.analysis.analysis.confidence.style.color = codes[0];

    } else {
      this.data.isPredictionLineDisabled = false;
      this.data.isPredictionLineActive = false;
      this.removeAnalysisPredictionLine();
    }

    // 파라미터의 disabled로 지정된경우 예측선 설정제거
    if (param && false == param['isPredictionLineDisabled']) {
      this.data.isPredictionLineDisabled = param['isPredictionLineDisabled'];
      this.data.isPredictionLineActive = param['isPredictionLineDisabled'];
      this.removeAnalysisPredictionLine();
    }

    this.loadingHide();
  }

  public changePredictionLineDisabled(): void {
    this.data.isPredictionLineDisabled = true;
  }

  /**
   * 차트 옵션이 변경되는 경우
   */
  public changeOption(): void {

    if (_.isUndefined(this.widgetConfiguration.analysis)) {
      return;
    }

    if (_.isEmpty(this.widgetConfiguration.analysis)) {
      return;
    }

    if (this.isValid() === false) {
      this.data.isPredictionLineDisabled = false;
      this.data.isPredictionLineActive = false;
      this.removeAnalysisPredictionLine();
      this.predictionLineDataChangeNotification();
      return;
    }

    if (this.data.isPredictionLineDisabled && this.data.isPredictionLineActive) {
      this.data.analysis.analysis.timeUnit = this.widgetConfiguration.pivot.columns[0].format.unit;
    }
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 전체 예측선 on/off 버튼 이벤트
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 전체 예측선 on/off 버튼 이벤트
   */
  public predictionLineClick(): void {

    this.data.isPredictionLineActive = !this.data.isPredictionLineActive;

    // 예측선 사용여부 on 시 예측선 데이터 수정
    if (this.data.isPredictionLineActive) {

      // 초기화
      this.initializeAnalysisPredictionLine();

      // 예측선 데이터 변경 알림
      this.predictionLineDataChangeNotification();
    }
    // 예측선 사용여부 off 시 예측선 데이터 삭제
    else {

      // 예측선 데이터 삭제
      this.removeAnalysisPredictionLine();

      // 예측선 데이터 변경 알림
      this.predictionLineDataChangeNotification();
    }
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 예측기간 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 예측기간 Keyup enter 이벤트 발생시
   *
   * @param {number | string} predictionInterval
   */
  public keyupEnterPredictionInterval(predictionInterval: number | string): void {

    if (this.validationPredictionInterval(predictionInterval)) {

      this.data.analysis.analysis.interval = predictionInterval;

      // 예측선 데이터 변경 알림
      this.predictionLineDataChangeNotification();
    }
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 슬라이더 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 고급 분석 슬라이더 컴포넌트의 콜백 이벤트
   * @param slider
   * @param {Event} $event
   */
  public sliderCallBack(slider, $event: Event): void {

    slider.onUpdate = $event;

    // 변경된 값 업데이트
    this.data.analysis.analysis.confidence.confidenceInterval = this.predictionSlider.from;

    // 예측선 데이터 변경 알림
    this.predictionLineDataChangeNotification();
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Forecast parameters 영역 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Change forecast parameters area display none block flag
   */
  public changeForecastParametersAreaDisplayNoneBlockFlag(): void {
    this.data.isAnalysisSettingsActive = !this.data.isAnalysisSettingsActive;
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Forecast parameter 값 변경 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 고급 설정 자동 / 수정 체크박스 클릭시
   */
  public selectedForecastCheckBoxFlag(): void {

    if (this.selectedForecastParameter.isAuto === false) {
      this.selectedForecastParameter.isAlphaDisabled = true;
      this.selectedForecastParameter.isAlphaSelected = true;
      this.selectedForecastParameter.isBetaDisabled = true;
      this.selectedForecastParameter.isBetaSelected = true;
      this.selectedForecastParameter.isGammaDisabled = true;
      this.selectedForecastParameter.isGammaSelected = true;
      this.selectedForecastParameter.isPeriodSelected = true;

      // ---------------------------------------------------
      // Forecast.parameter VO 필드
      // ---------------------------------------------------

      // Alpha 기본값으로 초기화
      this.selectedForecastParameter.alpha = '';

      // Beta 기본값으로 초기화
      this.selectedForecastParameter.beta = '';

      // Gamma 기본값으로 초기화
      this.selectedForecastParameter.gamma = '';

      // 파마미터 값을 곱할지(multiplicative) 여부 (기본값은 덧셈 - additive)
      this.selectedForecastParameter.multiple = null;

      // 선택되어 있는 Forecast parameter 데이터 업데이트
      // @param {number} index : Select Component 의 선택되어 있는 아이템 인덱스
      this.updateSelectedForecastParameter(this.selectComponent.array.findIndex((item) => item === this.selectComponent.selectedItem));

      // 예측선 데이터 변경 알림
      this.predictionLineDataChangeNotification();
    } else {
      this.selectedForecastParameter.isAlphaDisabled = false;
      this.selectedForecastParameter.isAlphaSelected = false;
      this.selectedForecastParameter.isBetaDisabled = false;
      this.selectedForecastParameter.isBetaSelected = false;
      this.selectedForecastParameter.isGammaDisabled = false;
      this.selectedForecastParameter.isGammaSelected = false;
    }

    this.selectedForecastParameter.isAuto = !this.selectedForecastParameter.isAuto;
  }

  /**
   * Forecast.Parameter 값이 변경되는 경우
   */
  public changeSelectedForecastParameter(): void {

    // 선택되어 있는 Forecast parameter 데이터 업데이트
    // @param {number} index : Select Component 의 선택되어 있는 아이템 인덱스
    this.updateSelectedForecastParameter(this.selectComponent.array.findIndex((item) => item === this.selectComponent.selectedItem));
  }

  // ---------------------------------------
  // Alpha text input
  // ---------------------------------------
  public validateForecastParameterAlpha():Function {
    const messages = this.MESSAGE;
    const isKorLang = ( this.currentLang === 'ko' );
    return ( alphaValue:string ) => {

      if (_.isUndefined(alphaValue)) {
        let msg: string = '';
        if (isKorLang) {
          msg = `${messages.ALPHA} ${messages.PLEASE_VALUE}`;
        } else {
          msg = `${messages.PLEASE_VALUE.replace('xxx', messages.ALPHA.toLowerCase())}`;
        }
        Alert.warning(msg);
        return false;
      }

      if ('' === alphaValue ) {
        let msg: string = '';
        if (isKorLang) {
          msg = `${messages.ALPHA} ${messages.PLEASE_VALUE}`;
        } else {
          msg = `${messages.PLEASE_VALUE.replace('xxx', messages.ALPHA.toLowerCase())}`;
        }
        Alert.warning(msg);
        return false;
      }

      const alpha: number = Number(alphaValue);

      if (_.isNaN(alpha)) {
        Alert.warning(`${messages.ALPHA} ${messages.VALUES_ONLY_NUMERIC}`);
        return false;
      }

      if (_.isFinite(alpha) === false) {
        Alert.warning(`${messages.ALPHA} ${messages.VALUES_ONLY_NUMERIC}`);
        return false;
      }

      return true;
    };
  } // function - validateForecastParameterAlpha

  /**
   * 선택된 Forecast parameter alpha text input
   *  - Keyup 이벤트
   *
   * @param {number} alphaValue
   */
  public setForecastParameterAlpha(alphaValue:number): void {
    this.selectedForecastParameter.alpha = alphaValue;

    // 선택되어 있는 Forecast parameter 데이터 업데이트
    // @param {number} index : Select Component 의 선택되어 있는 아이템 인덱스
    this.updateSelectedForecastParameter(this.selectComponent.array.findIndex((item) => item === this.selectComponent.selectedItem));

    // 예측선 데이터 변경 알림
    this.predictionLineDataChangeNotification();
  } // function - setForecastParameterAlpha

  // ---------------------------------------
  // Beta text input
  // ---------------------------------------
  public validateForecastParameterBeta():Function {
    const messages = this.MESSAGE;
    const isKorLang = (this.currentLang === 'ko');
    return (betaValue: string) => {

      if (_.isUndefined(betaValue)) {
        let msg: string = '';
        if (isKorLang) {
          msg = `${messages.BETA} ${messages.PLEASE_VALUE}`;
        } else {
          msg = `${messages.PLEASE_VALUE.replace('xxx', messages.BETA.toLowerCase())}`;
        }
        Alert.warning(msg);
        return false;
      }

      if (betaValue === '') {
        let msg: string = '';
        if (isKorLang) {
          msg = `${messages.BETA} ${messages.PLEASE_VALUE}`;
        } else {
          msg = `${messages.PLEASE_VALUE.replace('xxx', messages.BETA.toLowerCase())}`;
        }
        Alert.warning(msg);
        return false;
      }

      const beta: number = Number(betaValue);

      if (_.isNaN(beta)) {
        Alert.warning(`${messages.BETA} ${messages.VALUES_ONLY_NUMERIC}`);
        return false;
      }

      if (_.isFinite(beta) === false) {
        Alert.warning(`${messages.BETA} ${messages.VALUES_ONLY_NUMERIC}`);
        return false;
      }
      return true;
    };
  } // function - validateForecastParameterBeta

  /**
   * 선택된 Forecast parameter beta text input
   *  - Keyup 이벤트
   *
   * @param {number} betaValue
   */
  public setForecastParameterBeta(betaValue: number): void {
    this.selectedForecastParameter.beta = betaValue;

    // 선택되어 있는 Forecast parameter 데이터 업데이트
    // @param {number} index : Select Component 의 선택되어 있는 아이템 인덱스
    this.updateSelectedForecastParameter(this.selectComponent.array.findIndex((item) => item === this.selectComponent.selectedItem));

    // 예측선 데이터 변경 알림
    this.predictionLineDataChangeNotification();
  } // function - setForecastParameterBeta

  // ---------------------------------------
  // Gamma text input
  // ---------------------------------------
  public validateForecastParameterGamma():Function {
    const messages = this.MESSAGE;
    const isKorLang = (this.currentLang === 'ko');
    return (gammaValue: string) => {
      if (_.isUndefined(gammaValue)) {
        let msg: string = '';
        if (isKorLang) {
          msg = `${messages.GAMMA} ${messages.PLEASE_VALUE}`;
        } else {
          msg = `${messages.PLEASE_VALUE.replace('xxx', messages.GAMMA.toLowerCase())}`;
        }
        Alert.warning(msg);
        return false;
      }

      if (gammaValue === '') {
        let msg: string = '';
        if (isKorLang) {
          msg = `${messages.GAMMA} ${messages.PLEASE_VALUE}`;
        } else {
          msg = `${messages.PLEASE_VALUE.replace('xxx', messages.GAMMA.toLowerCase())}`;
        }
        Alert.warning(msg);
        return false;
      }

      const gamma: number = Number(gammaValue);

      if (_.isNaN(gamma)) {
        Alert.warning(`${messages.GAMMA} ${messages.VALUES_ONLY_NUMERIC}`);
        return false;
      }

      if (_.isFinite(gamma) === false) {
        Alert.warning(`${messages.GAMMA} ${messages.VALUES_ONLY_NUMERIC}`);
        return false;
      }
      return true;
    };
  } // function - validateForecastParameterGamma

  /**
   * 선택된 Forecast parameter alpha text input
   *  - Keyup 이벤트
   *
   * @param {number} gammaValue
   */
  public setForecastParameterGamma(gammaValue: number): void {
    this.selectedForecastParameter.gamma = gammaValue;

    // 선택되어 있는 Forecast parameter 데이터 업데이트
    // @param {number} index : Select Component 의 선택되어 있는 아이템 인덱스
    this.updateSelectedForecastParameter(this.selectComponent.array.findIndex((item) => item === this.selectComponent.selectedItem));

    // 예측선 데이터 변경 알림
    this.predictionLineDataChangeNotification();
  } // function - setForecastParameterGamma

  /**
   * advanced 세팅의 period값 변경시
   */
  public changeAdvancedPeriod(periodValue:string) {
    if (_.isEmpty(periodValue)) return;
    this.selectedForecastParameter.period = parseInt(periodValue);

    // 예측선 데이터 변경 알림
    this.predictionLineDataChangeNotification();
  } // function - changeAdvancedPeriod

  /**
   * Forecast parameter gamma 체크박스 변경에 대한 처리
   */
  public changeSelectedForecastParameterGamma(): void {

    // 선택되어 있는 forecast parameter 의 gamma 체크박스를 해제하는 경우
    if (this.selectedForecastParameter.isGammaSelected === false) {

      // 선택되어 있는 forecast parameter gamma 값 초기화
      this.selectedForecastParameter.gamma = this.DEFAULT_HYPER_PARAMETER.gamma;

      // forecast parameter gamma multiple 값 undefined 처리
      this.selectedForecastParameter.multiple = undefined;
    }

    // 선택되어 있는 forecast parameter 의 gamma 체크박스를 체크하면
    // forecast parameter gamma multiple 값 false 로 변경
    else {
      this.selectedForecastParameter.multiple = false;
    }
  }

  /**
   * Forecast parameter period 체크박스 변경에 대한 처리
   */
  public changeSelectedForecastParameterPeriod(): void {

    // 반대값 설정
    this.selectedForecastParameter.isPeriodSelected = !this.selectedForecastParameter.isPeriodSelected;

    if (this.selectedForecastParameter.isPeriodSelected) this.selectedForecastParameter.period = null;
  }

  /**
   * Forecast parameter gamma 'multiple' 변경시
   *
   * @param {boolean} multiple
   */
  public changeSelectedForecastParameterGammaInMultipleValue(multiple: boolean): void {

    this.selectedForecastParameter.multiple = multiple;

    // 선택되어 있는 Forecast parameter 데이터 업데이트
    // @param {number} index : Select Component 의 선택되어 있는 아이템 인덱스
    this.updateSelectedForecastParameter(this.selectComponent.array.findIndex((item) => item === this.selectComponent.selectedItem));

    // 예측선 데이터 변경 알림
    this.predictionLineDataChangeNotification();
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Forecast 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Forecast 컬러 선텍 레이어 보여주기
   *
   * @param {HTMLElement} element
   * @param {string} color
   */
  public forecastColorPickerShow(element: HTMLElement, color: string): void {

    // 컬러 선텍 레이어 보여주기
    this.colorPickerLayerShow(element, color,
      (colorHex: any): void => {

        const isForecastChanged: boolean = this.data.analysis.analysis.forecast.style.color !== colorHex;

        this.data.analysis.analysis.forecast.style.color = colorHex;
        // 예측선 내부에서 색상설정여부
        this.data.analysis.analysis.forecast.style.predictColorUseFl = true;

        if (isForecastChanged) {
          this.predictionLineForecastDataChangeNotification();
        }
      });
  }

  /**
   * 예측선 사용 여부
   */
  public changeUseForecast() {
    if( this.data.isSelectedForecast ) {
      this.data.analysis.analysis.forecast.style.lineType = 'SOLID';
      this.data.analysis.analysis.forecast.style.lineThickness = 2.0;
      this.predictionLineForecastDataChangeNotification();
    } else {
      this.data.analysis.analysis.forecast.style.lineType = 'SOLID';
      this.data.analysis.analysis.forecast.style.lineThickness = 0;
      this.predictionLineForecastDataChangeNotification();
    }
  } // function - changeUseForecast

  // -------------------------------------------------------------------------------------------------------------------
  // Confidence 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Confidence 컬러 선텍 레이어 보여주기
   *
   * @param {HTMLElement} element
   * @param {string} color
   */
  public confidenceColorPickerShow(element: HTMLElement, color: string): void {

    // 컬러 선텍 레이어 보여주기
    this.colorPickerLayerShow(element, color,
      (colorHex: any): void => {

        const isChangedConfidenceColor: boolean = this.data.analysis.analysis.confidence.style.color !== colorHex;

        this.data.analysis.analysis.confidence.style.color = colorHex;

        // 예측선 내부에서 색상설정여부
        this.data.analysis.analysis.confidence.style.predictColorUseFl = true;

        // Confidence 투명도 색상이 변경된 경우
        if (isChangedConfidenceColor) {

          // 예측선 Confidence 데이터 변경 알림
          this.predictionLineConfidenceDataChangeNotification();
        }
      });
  }

  /**
   * validation Confidence transparency text input
   */
  public validateConfidenceTransparency():Function {
    const messages = this.MESSAGE;
    return ( transparencyValue:number ) => {
      if (_.isUndefined(transparencyValue)) {
        Alert.warning(messages.PLEASE_TRANSPARENCY);
        return false;
      }

      if (Number(transparencyValue) < 0) {
        Alert.warning(messages.VALUES_LESS_THAN_0_CAN_NOT_BE_ENTERED);
        return false;
      }

      if (Number(transparencyValue) > 100) {
        Alert.warning(messages.VALUES_GREATER_THAN_100_CAN_NOT_BE_ENTERED);
        return false;
      }

      return true;
    };
  } // function - validateConfidenceTransparency

  /**
   * 투명도 설정
   * @param transparencyValue
   */
  public setConfidenceTransparency( transparencyValue:number ) {
    this.data.analysis.analysis.confidence.style.transparency = Number(transparencyValue);

    // 예측선 Confidence 데이터 변경 알림
    this.predictionLineConfidenceDataChangeNotification();
  } // function - setConfidenceTransparency

  /**
   * 투명도 사용 여부 변경
   */
  public changeUseConfidence() {
    this.setConfidenceTransparency( this.data.isSelectedConfidence ? 10 : 0 );
  } // function - changeUseConfidence

  // -------------------------------------------------------------------------------------------------------------------
  // 셀렉트 박스 콜백 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Forecast parameters 셀렉트 박스 콜백 처리
   * @param {Event} series
   */
  public onChangeForecastParameter(series: string): void {
    const forecastParameterIndex = this.forecastParameters.findIndex((item) => series === item);
    this.forecastParametersSelectedIndex = forecastParameterIndex;
    this.selectedForecastParameter = this.data.analysis.analysis.forecast.parameters[forecastParameterIndex];
  }

  /**
   * Forecast 라인 타입 셀렉트 박스 콜백 처리
   * @param {string} lineType
   */
  public onChangeLineType(lineType: string): void {
    this.data.analysis.analysis.forecast.style.lineType = lineType;
    this.predictionLineForecastDataChangeNotification();
  }

  /**
   * Forecast 라인 투께 셀렉트 박스 콜백 처리
   * @param {string} lineWidth
   */
  public onChangeLineWidth(lineWidth: string): void {
    this.data.analysis.analysis.forecast.style.lineThickness = Number(lineWidth);
    this.predictionLineForecastDataChangeNotification();
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 패널 show, hide 처리
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 고급분석 서브 패널 클릭시 show hide 처리
   */
  public clickDataSubPanel(dataSubLayerKey: string, event?: Event): void {

    // 이벤트 전파 방지
    event.stopPropagation();
    event.preventDefault();

    if (this.dataSubLayerKey === dataSubLayerKey) {
      this.data.isPredictionLineActive = false;
      this.dataSubLayerKey = '';
    } else {

      this.dataSubLayerKey = dataSubLayerKey;

      if (this.isValid()) {

        if (!_.isUndefined(this.widgetConfiguration.analysis) && !_.isEmpty(this.widgetConfiguration.analysis)) {

          this.data.isPredictionLineDisabled = true;
          this.data.isPredictionLineActive = true;
        } else {

          this.data.isPredictionLineDisabled = true;
          this.data.isPredictionLineActive = false;
        }
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 컬러 선텍 레이어 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 컬러 선텍 레이어 보여주기
   *
   * @param {HTMLElement} element
   * @param {string} color
   * @param {Function} callBackFn
   */
  public colorPickerLayerShow(element: HTMLElement, color: string, callBackFn: Function): void {

    // 컬러 선텍 레이어 좌표 계산
    this.colorPickerLayerOffsetCalculator(element);

    // 컬러 선텍 레이어 보여주기
    this.colorPickerLayerComponent.show(color, callBackFn);
  }

  /**
   * 컬러 선텍 레이어 좌표 계산
   *
   * @param {HTMLElement} element
   */
  public colorPickerLayerOffsetCalculator(element: HTMLElement): void {

    const boundingClientRect = element.getBoundingClientRect();

    this.colorPickerLayerOffsetX = `${boundingClientRect.left}px`;

    // Color picker layer 높이 값
    const colorPickerLayerHeight = this.colorPickerLayerComponent.getHeight();
    // Offset top value 값 보정
    const offsetTopValueCorrection: number = 6;
    // 고급 설정 컬러 선택 아이콘 엘리먼트 높이 값
    const elementHeight: number = element.offsetWidth;
    // Offset top + 엘리먼트 높이 값 + Color picker layer 높이 값
    const top = boundingClientRect.top + elementHeight + colorPickerLayerHeight;

    // top 값이 윈도우 높이 보다 크다면
    if (top >= $(window).outerHeight()) {
      this.colorPickerLayerOffsetY = `${boundingClientRect.top - colorPickerLayerHeight - offsetTopValueCorrection}px`;
    } else {
      this.colorPickerLayerOffsetY = `${boundingClientRect.top + elementHeight + offsetTopValueCorrection}px`;
    }
  }

  /**
   * 컬러 선텍 레이어 컬러 선택에 대한 콜백 이벤트
   *
   * @param {{data: {className: string; colorHex: string}; fn: Function}} event
   */
  public colorPickerLayerSelected(event: { 'data': { 'className': string, 'colorHex': string }, 'fn': Function }): void {
    event.fn(event.data.colorHex);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * disabled 여부 설정
   * @param param
   * @returns {Object}
   */
  private setPredictionLineDisabled(param: Object): Object {

    const pivot: Pivot = param['pivot'];
    const columns: Field[] = pivot['columns'];

    let disabled: Object;
    if (columns && columns.length > 0) {

      const field = columns[0];

      // discontinuous일때
      if (field && field.format && field.format.discontinuous) {

        disabled = false;
      }
      // continuous , none일때
      else if (field && field.format && !field.format.discontinuous && field.format.unit && field.format.unit.toString() == 'NONE') {

        disabled = false;
      }
      // 행선반에 dimension이 2개이상인경우
      else if (columns.length > 1) {
        disabled = false;
      }
      // aggregations에 dimension이 있는경우
      else if (pivot.aggregations && pivot.aggregations.length > 0) {

        loop: for (const item of pivot.aggregations) {

          if (item.type == 'dimension') {
            disabled = false;
            break loop;
          }
        }
      }
    }
    return disabled;
  }

  /**
   * 고급분석 예측선 초기화
   */
  private initializeAnalysisPredictionLine(): void {

    //  - 고급설정 > 수정 / 자동 플래그
    this.data.isAnalysisSettingsActive = true;

    this.data.isSelectedForecast = true;

    this.data.isSelectedConfidence = true;

    const _analysis: Analysis = new Analysis();
    _analysis.pivot = this.widgetConfiguration.pivot;
    this.data.analysis = _analysis;

    const analysisInAnalysis = new analysis();

    analysisInAnalysis.timeUnit = this.widgetConfiguration.pivot.columns[0].format.unit;
    analysisInAnalysis.interval = 12;

    analysisInAnalysis.confidence = new Confidence();
    analysisInAnalysis.confidence.confidenceInterval = this.DEFAULT_PREDICTION_LINE_SLIDER_FROM;
    analysisInAnalysis.confidence.style = new Style();

    let schema = this.uiOption.color['schema'];
    let colorCodes = _.cloneDeep(ChartColorList[schema]);

    analysisInAnalysis.confidence.style.color = colorCodes[0];
    // analysisInAnalysis.confidence.style.color = this.uiOption.color['userCodes'] && this.uiOption.color['userCodes'].length > 0 ? this.uiOption.color['userCodes'][0] : this.uiOption.color['codes'][0];
    analysisInAnalysis.confidence.style.transparency = 10;

    analysisInAnalysis.forecast = new Forecast();
    analysisInAnalysis.forecast.style = new Style();
    analysisInAnalysis.forecast.style.color = colorCodes[0];
    analysisInAnalysis.forecast.style.lineType = this.LINE_TYPE_LIST[0];
    analysisInAnalysis.forecast.style.lineThickness = Number(this.LINE_WIDTH_LIST[0]);

    this.widgetConfiguration.pivot.aggregations
      .forEach((agg) => {
        const hyperParameter = new HyperParameter();

        // alias가 있는경우
        if (agg.alias) hyperParameter.field = agg.alias;
        else if ( 'user_defined' === agg.ref ) hyperParameter.field = agg.ref + '.' + agg.name;
        // alias가 없는경우
        else hyperParameter.field = `${agg.aggregationType + '(' + agg.name + ')'}`;

        // 고급분석 제외
        analysisInAnalysis.forecast.parameters.push(_.cloneDeep(hyperParameter));
      });

    // 측정 목록 초기화
    this.forecastParameters = [];

    // Forecast parameters 목록을 셀렉트 박스 문자열 목록에 추가해준다
    analysisInAnalysis.forecast.parameters
      .forEach((param) => {
        this.forecastParameters.push(param.field);
      });

    this.forecastParametersSelectedIndex = 0;
    this.selectedForecastParameter = analysisInAnalysis.forecast.parameters[this.forecastParametersSelectedIndex];

    _analysis.analysis = analysisInAnalysis;

    this.data.analysis = _analysis;

    this.widgetConfiguration.analysis = new analysis();
    this.widgetConfiguration.analysis = this.data.analysis.analysis;
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 유효성 검사
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 차트가 그려져 있는지 검사
   *
   * @returns {boolean}
   */
  private isChartDrawed(): boolean {
    return this.isChartShow;
  }

  /**
   * 라인차트인지 검사
   *
   * @returns {boolean}
   */
  private isChartTypeLine(): boolean {
    return this.selectChart === GraphicType.LINE.toString().toLowerCase();
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 데이터 변경 알림 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 예측선 데이터 변경 알림
   */
  private predictionLineDataChangeNotification(): void {
    this.changeSubject$.next(this.data);
  }

  /**
   * 예측선 Forecast 데이터 변경 알림
   */
  private predictionLineForecastDataChangeNotification(): void {
    this.changeForecastSubject$.next(this.data);
  }

  /**
   * 예측선 Confidence 데이터 변경 알림
   */
  private predictionLineConfidenceDataChangeNotification(): void {
    this.changeConfidenceSubject$.next(this.data);
  }

  // -------------------------------------------------------------------------------------------------------------------
  // 예측기간 관련
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 예측기간 유효성 검사
   *
   * @param {number | string} predictionInterval
   * @returns {boolean}
   */
  private validationPredictionInterval(predictionInterval: number | string): boolean {

    // 예측기간을 입력해주세요.
    const message: string = this.MESSAGE.PLEASE_FORECAST_PERIOD;

    if (_.isUndefined(predictionInterval)) {
      Alert.warning(message);
      return false;
    }

    if (predictionInterval === '') {
      Alert.warning(message);
      return false;
    }

    if (_.isNumber(Number(predictionInterval)) === false) {
      Alert.warning(message);
      return false;
    }

    return true;
  }

  // -------------------------------------------------------------------------------------------------------------------
  //
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 예측선 라인 타입명으로 LINE_TYPE_LIST 에서 인덱스를 구하기
   *
   * @param {string} lineType
   * @returns {number}
   */
  private getLineTypeFromLineTypeListToLineType(lineType: string): number {
    return this.LINE_TYPE_LIST.findIndex((item) => item === lineType);
  }

  /**
   * 예측선 라인 두꼐로 LINE_WIDTH_LIST 에서 인덱스를 구하기
   *
   * @param {string} lineThickness
   * @returns {number}
   */
  private getLineThicknessFromLineWidthListToLineThickness(lineThickness: string): number {
    return this.LINE_WIDTH_LIST.findIndex((item) => Number(item) === Number(lineThickness));
  }

  // -------------------------------------------------------------------------------------------------------------------
  //
  // -------------------------------------------------------------------------------------------------------------------

  /**
   * 선택되어 있는 Forecast parameter 데이터 업데이트
   *
   * @param {number} index : Select Component 의 선택되어 있는 아이템 인덱스
   */
  private updateSelectedForecastParameter(index: number): void {

    // ---------------------------------------------------
    // UI 에서만 사용하는 값
    // ---------------------------------------------------

    // 고급분석 제외
    // isAuto
    // this.data.analysis.analysis.forecast.parameters[index].isAuto = this.selectedForecastParameter.isAuto;
    // // alpha
    // this.data.analysis.analysis.forecast.parameters[index].isAlphaDisabled = this.selectedForecastParameter.isAlphaDisabled;
    // this.data.analysis.analysis.forecast.parameters[index].isAlphaSelected = this.selectedForecastParameter.isAlphaSelected;
    // // beta
    // this.data.analysis.analysis.forecast.parameters[index].isBetaDisabled = this.selectedForecastParameter.isBetaDisabled;
    // this.data.analysis.analysis.forecast.parameters[index].isBetaSelected = this.selectedForecastParameter.isBetaSelected;
    // // gamma
    // this.data.analysis.analysis.forecast.parameters[index].isGammaDisabled = this.selectedForecastParameter.isGammaDisabled;
    // this.data.analysis.analysis.forecast.parameters[index].isGammaSelected = this.selectedForecastParameter.isGammaSelected;

    // ---------------------------------------------------
    // Forecast.parameter VO 필드
    // ---------------------------------------------------

    // 대상 Measure 필드명 (alias)
    this.data.analysis.analysis.forecast.parameters[index].field = this.selectedForecastParameter.field;
    // alpha
    this.data.analysis.analysis.forecast.parameters[index].alpha = this.selectedForecastParameter.alpha;
    // beta
    this.data.analysis.analysis.forecast.parameters[index].beta = this.selectedForecastParameter.beta;
    // gamma
    this.data.analysis.analysis.forecast.parameters[index].gamma = this.selectedForecastParameter.gamma;
    // period
    this.data.analysis.analysis.forecast.parameters[index].period = this.selectedForecastParameter.period;
    // 파마미터 값을 곱할지(multiplicative) 여부 (기본값은 덧셈 - additive)
    this.data.analysis.analysis.forecast.parameters[index].multiple = this.selectedForecastParameter.multiple;
  }

  // -------------------------------------------------------------------------------------------------------------------
  //
  // -------------------------------------------------------------------------------------------------------------------

  /**
   *  고급분석 예측선 데이터 삭제
   */
  private removeAnalysisPredictionLine(): void {
    delete this.widgetConfiguration.analysis;
    this.data.analysis = this.widgetConfiguration.analysis;
    this.originWidgetConfigurationAnalysis = undefined;
  }

}
