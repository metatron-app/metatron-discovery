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

import {Injectable, Injector, OnInit} from '@angular/core';
import {AbstractService} from '../../../../common/service/abstract.service';
import {Analysis} from '../../value/analysis';
import {SearchQueryRequest} from '../../../../domain/datasource/data/search-query-request';
import * as _ from 'lodash';
import {PageWidget, PageWidgetConfiguration} from '../../../../domain/dashboard/widget/page-widget';
import {UIOption} from '../../../../common/component/chart/option/ui-option';
import {CommonUtil} from "../../../../common/util/common.util";

@Injectable()
export class AnalysisPredictionService extends AbstractService implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 예측선을 사용하면 생기는 예측선 타입 목록
  private predictionLineType: string[] = ['Lower Data', 'Observations Data', 'Upper Data'];
  private predictionLineTypePrefix: string = ` - `;
  private predictionLineTypeSuffix: string = ` Prediction Line`;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public static predictionLineTypeAdditional: string = `Additional Lower Data`;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(protected injector: Injector) {
    super(injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit(): void {
    AnalysisPredictionService.predictionLineTypeAdditional.concat(`${this.predictionLineTypeSuffix}`);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // -----------------------------------------------------
  // Page component
  // -----------------------------------------------------

  /**
   * 페이지에서 고급분석 API 호출시
   *
   * @param {PageWidgetConfiguration} widgetConfiguration
   * @param {PageWidget} widget
   * @param {LineChartComponent} chart
   * @param {{data: any; config: SearchQueryRequest; uiOption: UIOption}} resultData
   * @param {BaseChart} baseChart
   */
  public getAnalysisPredictionLineFromPage(widgetConfiguration: PageWidgetConfiguration,
                                           widget: PageWidget,
                                           chart: any,
                                           resultData?: { data: any; config: SearchQueryRequest; uiOption: UIOption }): Promise<any> {

    return this.getAnalysis(this.createGetAnalysisParameter(widgetConfiguration, widget))
      .then((result) => {
        this.createPredictionLineSeriesList(result, widgetConfiguration);
        return result;
      })
      .then((result) => {
        chart.analysis = _.cloneDeep(widgetConfiguration.analysis);
        resultData.data.columns = result.columns;
        resultData.data.rows = result.rows;
        chart.resultData = resultData;
        return result;
      })
      .catch((error) => {
        if (chart) chart.analysis = null;
        console.info('error', error);
        throw new Error('getAnalysis API error');
      });
  }

  /**
   * 페이지에서 고급분석 API 호출시
   *  - 고급분석 컴포넌트가 데이터 변경됨을 알려주는 경우
   *
   * @param {PageWidgetConfiguration} widgetConfiguration
   * @param {PageWidget} widget
   * @param {LineChartComponent} chart
   * @param {{data: any; config: SearchQueryRequest; uiOption: UIOption}} resultData
   * @param {BaseChart} baseChart
   */
  public changeAnalysisPredictionLine(widgetConfiguration: PageWidgetConfiguration,
                                      widget: PageWidget,
                                      chart: any,
                                      resultData?: { data: any; config: SearchQueryRequest; uiOption: UIOption }): Promise<any> {

    return this.getAnalysis(this.createGetAnalysisParameter(widgetConfiguration, widget))
      .then((result) => {
        this.createPredictionLineSeriesList(result, widgetConfiguration);
        return result;
      })
      .then((result) => {
        chart.analysis = _.cloneDeep(widgetConfiguration.analysis);
        chart['data']['columns'] = result.columns;
        chart['data']['rows'] = result.rows;
        chart.predictionDraw();
        return result;
      })
      .catch((error) => {
        if (chart) chart.analysis = null;
        console.info('error', error);
        throw new Error('getAnalysis API error');
      });
  }

  // -----------------------------------------------------
  // Page widget component
  // -----------------------------------------------------

  /**
   * 대쉬보드에서 고급분석 API 호출시
   *
   * @param {PageWidgetConfiguration} widgetConfiguration
   * @param {PageWidget} widget
   * @param {LineChartComponent} chart
   * @param {{data: any; config: SearchQueryRequest; uiOption: UIOption}} resultData
   * @param {BaseChart} baseChart
   */
  public getAnalysisPredictionLineFromDashBoard(widgetConfiguration: PageWidgetConfiguration,
                                                widget: PageWidget,
                                                chart: any,
                                                resultData?: { data: any; config: SearchQueryRequest; uiOption: UIOption }): Promise<any> {

    return this.getAnalysis(this.createGetAnalysisParameter(widgetConfiguration, widget))
      .then((result) => {
        this.createPredictionLineSeriesList(result, widgetConfiguration);
        return result;
      })
      .then((result) => {
        chart.analysis = _.cloneDeep(widgetConfiguration.analysis);
        resultData.data.columns = result.columns;
        resultData.data.rows = result.rows;
        chart.resultData = resultData;
      })
      .catch((error) => {
        chart.analysis = null;
        throw error;
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // -----------------------------------------------------
  // API
  // -----------------------------------------------------

  /**
   *
   * @param {Analysis} analysis
   * @returns {Promise<any>}
   */
  private getAnalysis(analysis: Analysis): Promise<any> {
    return this.post(this.API_URL + `datasources/query/search`, analysis);
  }

  // -----------------------------------------------------
  //
  // -----------------------------------------------------

  /**
   * 고급분석 예측선 API 파라미터 생성
   *
   * @param {PageWidgetConfiguration} widgetConf
   * @param {PageWidget} widget
   * @returns {Analysis}
   */
  private createGetAnalysisParameter(widgetConf: PageWidgetConfiguration, widget: PageWidget) {
    // 고급분석 API 호출시 필요한 부가 정보들
    const param: Analysis = new Analysis();
    param.dataSource = _.cloneDeep(widgetConf.dataSource);
    param.limits = _.cloneDeep(widgetConf.limit);
    param.resultFormat = {'type': 'chart', 'mode': 'line', 'columnDelimeter': '―'};
    param.pivot = _.cloneDeep(widgetConf.pivot);
    param.userFields = _.cloneDeep(
      CommonUtil.objectToArray(widgetConf.customFields)
        .filter(item => item.dataSource === widgetConf.dataSource.engineName)
    );

    if (widget && widget.dashBoard && widget.dashBoard.configuration) {
      param.filters = _.cloneDeep(
        widget.dashBoard.configuration.filters.filter(item => item.dataSource === widgetConf.dataSource.engineName)
      );
    }
    // 고급분석 API 시 사용하는 예측선 데이터
    param.analysis = _.cloneDeep(widgetConf.analysis);
    // parameters관련 파라미터 제거
    delete param.analysis.forecast.parameters;
    return param;
  }

  /**
   * 예측선 시리즈 데이터 생성
   * @param result
   * @param {PageWidgetConfiguration} widgetConfiguration
   */
  private createPredictionLineSeriesList(result, widgetConfiguration: PageWidgetConfiguration): void {

    const columnName: string = widgetConfiguration.pivot.columns[0].alias ? widgetConfiguration.pivot.columns[0].alias : widgetConfiguration.pivot.columns[0].name;
    result.info.analysis[columnName]
      .forEach((row) => {
        result.rows.push(row);
      });

    const series = [];
    result.columns.forEach((column) => {

      const targetSeries = _.cloneDeep(column);

      const defSeriesData = targetSeries.value.map(() => {
        return null;
      });

      // 잘리는 음수영역이 있는지 확인하기 위한 플래그
      let isAdditionalData = false;

      series.push(targetSeries);

      const upper = result.info.analysis[`${column.name}`][2];
      const observations = result.info.analysis[`${column.name}`][1];
      const lower = result.info.analysis[`${column.name}`][0];

      const observationsSeriesData = observations.map((value) => {
        return Number(parseFloat(value).toFixed(2));
      });

      // Observations 시리즈 생성
      const observationsSeries = this.createObservationsSeries(targetSeries, defSeriesData, observationsSeriesData);

      // Lower 시리즈 생성
      const {lowerSeries, lowerSeriesData} = this.createLowerSeries(targetSeries, lower);

      // Upper 시리즈 생성
      const upperSeries = this.createUpperSeries(targetSeries);

      const upperSeriesData = upper.map((value, dataIdx) => {
        if (value > 0 && lowerSeriesData[dataIdx] > 0) {
          return Number(parseFloat((value - lowerSeriesData[dataIdx]).toString()).toFixed(2));
        } else if (value < 0 && lowerSeriesData[dataIdx] < 0) {
          const returnValue = Number(parseFloat((lowerSeriesData[dataIdx] - value).toString()).toFixed(2));
          lowerSeriesData[dataIdx] = Number(parseFloat(value).toFixed(2));
          return returnValue;
        } else if (value > 0 && lowerSeriesData[dataIdx] < 0) {
          isAdditionalData = true;
          lowerSeriesData[dataIdx] = null;
          // upper 가 양수이고 lower 가 음수이면 area 음수 영역이 짤림
          return Number(parseFloat(value).toFixed(2));
        }
      });

      // 데이터 갱신
      upperSeries.value = defSeriesData.concat(upperSeriesData);
      lowerSeries.value = defSeriesData.concat(lowerSeriesData);

      // 기존 라인의 마지막 데이터는 복구 - 선 이어짐을 위해서
      upperSeries.value[defSeriesData.length - 1] = 0;
      lowerSeries.value[defSeriesData.length - 1] = targetSeries.value[defSeriesData.length - 1];

      // Series 추가
      series.push(lowerSeries, observationsSeries, upperSeries);

      // 잘리는 음수영역은 따로 생성
      if (isAdditionalData) {

        // Addition lower 시리즈 생성
        const additionLowerSeries = this.createAdditionLowerSeries(upperSeries, targetSeries, lowerSeriesData, lower, defSeriesData);

        // Series 추가
        series.push(additionLowerSeries);
      }
    });

    result.columns = series;
  }

  /**
   * Lower 시리즈 생성
   *
   * @param targetSeries
   * @param lower
   * @returns {{lowerSeries: any; lowerSeriesData: any}}
   */
  private createLowerSeries(targetSeries: any, lower: any) {
    // Lower 시리즈 라인
    const lowerSeries = _.cloneDeep(targetSeries);
    lowerSeries.name = `${targetSeries.name}${this.predictionLineTypePrefix}${this.predictionLineType[0]}${this.predictionLineTypeSuffix}`;
    const lowerSeriesData = lower.map((value) => {
      return Number(parseFloat(value).toFixed(2));
    });
    return {lowerSeries, lowerSeriesData};
  }

  /**
   * Observations 시리즈 생성
   *
   * @param targetSeries
   * @param defSeriesData
   * @param observationsSeriesData
   * @returns {any}
   */
  private createObservationsSeries(targetSeries: any, defSeriesData: any, observationsSeriesData: any) {
    // Observations 시리즈 라인
    const observationsSeries = _.cloneDeep(targetSeries);
    observationsSeries.name = `${targetSeries.name}${this.predictionLineTypePrefix}${this.predictionLineType[1]}${this.predictionLineTypeSuffix}`;
    observationsSeries.value = defSeriesData.concat(observationsSeriesData);
    observationsSeries.value[defSeriesData.length - 1] = targetSeries.value[defSeriesData.length - 1];
    return observationsSeries;
  }

  /**
   * Upper 시리즈 생성
   *
   * @param targetSeries
   * @returns {any}
   */
  private createUpperSeries(targetSeries: any) {
    // Upper 시리즈 라인
    const upperSeries = _.cloneDeep(targetSeries);
    upperSeries.name = `${targetSeries.name}${this.predictionLineTypePrefix}${this.predictionLineType[2]}${this.predictionLineTypeSuffix}`;
    return upperSeries;
  }

  /**
   * Addition lower 시리즈 생성
   *
   * @param upperSeries
   * @param targetSeries
   * @param lowerSeriesData
   * @param lower
   * @param defSeriesData
   * @returns {any}
   */
  private createAdditionLowerSeries(upperSeries: any, targetSeries: any, lowerSeriesData: any, lower: any, defSeriesData: any) {
    const additionLowerSeries = _.cloneDeep(upperSeries);
    additionLowerSeries.name = `${targetSeries.name}${this.predictionLineTypePrefix}${AnalysisPredictionService.predictionLineTypeAdditional}`;
    const additionLowerSeriesData = lowerSeriesData.map((value, dataIdx) => {
      const returnValue = value == null ? lower[dataIdx] : null;
      return returnValue;
    });
    additionLowerSeries.value = defSeriesData.concat(additionLowerSeriesData);
    return additionLowerSeries;
  }

}
