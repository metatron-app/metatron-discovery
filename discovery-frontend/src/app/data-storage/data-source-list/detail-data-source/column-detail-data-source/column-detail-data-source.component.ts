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
  Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild,
  ViewChildren
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { Stats } from '../../../../domain/datasource/stats';
import { Alert } from '../../../../common/util/alert.util';
import { DatasourceService } from '../../../../datasource/service/datasource.service';
import * as _ from 'lodash';
import { Covariance } from '../../../../domain/datasource/covariance';
import { Datasource, Field } from '../../../../domain/datasource/datasource';
import { EditConfigSchemaComponent } from './edit-config-schema/edit-config-schema.component';
import { Metadata } from '../../../../domain/meta-data-management/metadata';
import { MetadataColumn } from '../../../../domain/meta-data-management/metadata-column';
import { isUndefined } from 'util';

declare let echarts: any;

enum FieldRoleType {
  ALL = <any>'ALL',
  DIMENSION = <any>'DIMENSION',
  MEASURE = <any>'MEASURE'
}

@Component({
  selector: 'column-detail-datasource',
  templateUrl: './column-detail-data-source.component.html'
})
export class ColumnDetailDataSourceComponent extends AbstractPopupComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('histogram')
  private _histogram: ElementRef;

  @ViewChildren('covariance')
  private _covariance: ElementRef;

  @ViewChild(EditConfigSchemaComponent)
  private _editConfigSchemaComp: EditConfigSchemaComponent;

  // 차트 옵션
  private _barOption: any;
  private _scatterOption: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터소스 정보
  @Input()
  public datasource: Datasource;

  // 메타데이터 정보
  @Input()
  public metaData: Metadata;

  // Field Role
  public fieldRoleType = FieldRoleType;
  public selectedFieldRole: FieldRoleType = this.fieldRoleType.ALL;

  // logical type list
  public logicalTypes: any[];
  public selectedLogicalType: any;

  // logical type list flag
  public isShowLogicalTypesFl: boolean = false;

  // 선택한 필드 이름
  public selectedField: any;

  // Covariance 조회 결과
  public covarianceData: any = {};
  // 통계 조회 결과
  public statsData: any = {};

  // 검색어
  public searchText: string;

  public columns: any;

  @Output()
  public changeDatasource: EventEmitter<any> = new EventEmitter();

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
    // ui init
    this._initView();
    // 필드 리스트
    this.columns = this.datasource.fields;
    // 메타데이터가 존재한다면 field에 merge
    this.isExistMetaData() && this.columns.forEach((field) => {
      this._setMetaDataField(field);
    });
    // init data
    this.statsData = {};
    this.covarianceData = {};
    // 선택한 필드 확인
    this.selectedField = this.selectedField ? this.columns.filter((field) => {
      return field.id === this.selectedField.id;
    })[0] : this.columns[0];
    // 필드 선택
    this.onSelectedField(this.selectedField, this.datasource);
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 검색어를 지움
   */
  public initSearchText() {
    this.searchText = '';
  }

  /**
   * 스키마 업데이트 완료 후
   */
  public completeUpdateSchema(): void {
    this.changeDatasource.emit('columns');
  }

  /**
   * 메타데이터가 있는지
   * @returns {boolean}
   */
  public isExistMetaData(): boolean {
    return !isUndefined(this.metaData);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터링 된 column list 가져오기
   * @param fields
   * @returns {any}
   */
  public getColumnList(fields) {
    let result = fields;

    // role
    if (this.selectedFieldRole !== FieldRoleType.ALL) {
      result = result.filter((field) => {
        if (this.selectedFieldRole === FieldRoleType.DIMENSION
          && (field.role === this.selectedFieldRole.toString() || field.role === 'TIMESTAMP')) {
          return field;
        } else if (field.role === this.selectedFieldRole.toString()) {
          return field;
        }
      });
    }

    // type
    if (this.selectedLogicalType.value !== 'all') {
      result = result.filter((field) => {
        if (field.logicalType === this.selectedLogicalType.value) {
          return field;
        }
      });
    }

    // search
    if (this.searchText) {
      result = result.filter((field) => {
        if (field.name.toLowerCase().includes(this.searchText.toLowerCase().trim())) {
          return field;
        }
      });
    }

    return result;
  }


  /**
   * value list
   * @returns {any[]}
   */
  public getValueList() {
    // frequentItems
    let list = this._getStats().frequentItems;
    // list가 10건 이상일때
    if (list && list.length > 10) {
      list = list.sort((a, b) => {
        return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
      }).slice(0,9);
      list.push({value:this.translateService.instant('msg.storage.ui.dsource.detail.column.etc')});
    }
    return list;
  }

  /**
   * Covariance 리스트
   * @returns {Covariance[]}
   */
  public getCovarianceList(): Covariance[] {
    if (this.selectedField && this.covarianceData.hasOwnProperty(this.selectedField.name)) {
      return this.covarianceData[this.selectedField.name];
    }
    return new Array<Covariance>();
  }

  /**
   * 데이터 라벨
   * @param {string} labelName
   * @returns {any}
   */
  public getLabel(labelName: string): any {
    // stats
    const stats = this._getStats();

    switch (labelName) {
      case 'count':
        return this._getRowCount();
      case 'valid':
        const valid = this._getRowCount() - (stats.missing === undefined ? 0 : stats.missing);
        return valid + ` (${this._getPercentage(valid)}%)`;
      case 'unique':
        const cardinality = stats.cardinality || stats['cardinality(estimated)'];
        const unique = cardinality === undefined ? 0 : cardinality;
        return unique + ` (${this._getPercentage(unique)}%)`;
      case 'outliers':
        const outliers = stats.outliers === undefined ? 0 : stats.outliers;
        return outliers + ` (${this._getPercentage(outliers)}%)`;
      case 'missing':
        const missing = stats.missing === undefined ? 0 : stats.missing;
        return missing + ` (${this._getPercentage(missing)}%)`;
      case 'min':
        const min = this._getStatsMaxAndMin('MIN');
        return min === undefined ? 0 : min;
      case 'lower':
        const lower = this._getQuartile('LOWER');
        return lower === undefined ? 0 : lower;
      case 'median':
        return stats.median === undefined ? 0 : stats.median;
      case 'upper':
        const upper = this._getQuartile('UPPER');
        return upper === undefined ? 0 : upper;
      case 'max':
        const max = this._getStatsMaxAndMin('MAX');
        return max === undefined ? 0 : max;
      case 'average':
        return stats.mean === undefined ? 0 : stats.mean;
      case 'standard':
        return stats.stddev === undefined ? 0 : stats.stddev;
      case 'skewness':
        return stats.skewness === undefined ? 0 : stats.skewness;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Configure schema 클릭 이벤트
   */
  public onClickConfigureSchema(): void {
    this._editConfigSchemaComp.init(this.datasource.id, this.columns);
    // 마크업 위치 변경
    $('#edit-config-schema').appendTo($('#layout-contents'));
  }

  /**
   * 필터 설정을 초기화 한다.
   */
  public onClickResetFilter(): void {
    // 텍스트 초기화
    this.initSearchText();
    this.selectedFieldRole = FieldRoleType.ALL;
    this.selectedLogicalType = this.logicalTypes[0];
  }

  /**
   * 데이터를 검색한다.
   * @param {Event} event
   */
  public onSearchText(event: KeyboardEvent): void {
    if (13 === event.keyCode) {
      this.searchText = event.target['value'];
    }
  }

  /**
   * logicalType change
   * @param {MouseEvent} event
   * @param type
   */
  public onChangeLogicalType(event: MouseEvent, type): void {
    event.stopPropagation();
    event.preventDefault();
    // flag
    this.isShowLogicalTypesFl = false;
    this.selectedLogicalType = type;
  }

  /**
   * role type 필터링 변경 이벤트
   * @param {FieldRoleType} type
   */
  public onChangeRoleType(type: FieldRoleType): void {
    // role type change
    this.selectedFieldRole = type;
  }


  /**
   * 필드 선택 이벤트
   * @param field
   * @param source
   */
  public onSelectedField(field, source): void {
    // field 선택
    this.selectedField = field;
    // engine 이름
    const engineName = source.engineName;
    // 통계 조회
    if ((this.selectedField.role === 'TIMESTAMP' && !this.statsData.hasOwnProperty('__time'))
      || (this.selectedField.role !== 'TIMESTAMP' && !this.statsData.hasOwnProperty(field.name))) {

      // 로딩 show
      this.loadingShow();
      // stats 조회
      this._getFieldStats(field, engineName)
        .then((stats) => {
          // stats 리스트 저장
          for (const property in stats[0]) {
            // 존재하지 않을 경우에만 넣어줌
            if (!this.statsData.hasOwnProperty(property)) {
              this.statsData[property] = stats[0][property];
            }
          }
          // 로딩 hide
          this.loadingHide();
          // 히스토그램 차트
          this._getHistogramChart(this.selectedField.role);
        })
        .catch((error) => {
          Alert.error(error.message);
          // 로딩 hide
          this.loadingHide();
        });
    } else {
      // 히스토그램 차트
      this._getHistogramChart(this.selectedField.role);
    }

    // covariance 조회
    if (field.role === 'MEASURE' && !this.covarianceData.hasOwnProperty(field.name)) {
      // 로딩 show
      this.loadingShow();

      this._getFieldCovariance(field, engineName)
        .then((covariance) => {
          this.covarianceData[field.name] = covariance;
          // 로딩 hide
          this.loadingHide();
          // covariance 차트
          this._getCovarianceChart(engineName);
        })
        .catch((error) => {
          Alert.error(error.message);
          // 로딩 hide
          this.loadingHide();
        });
    } else if (field.role === 'MEASURE' && this.covarianceData.hasOwnProperty(field.name)) {
      // covariance 차트
      this._getCovarianceChart(engineName);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 히스토그램 사용여부
   * @returns {boolean}
   */
  public isEnabledHistogram(): boolean {
    // 타임스탬프인 컬럼이나 측정값만 사용
    return this.selectedField
      && (this.selectedField.logicalType === 'TIMESTAMP' || this.selectedField.role === 'MEASURE');
  }

  /**
   * value list 사용 여부
   * @returns {boolean}
   */
  public isEnabledValueList(): boolean {
    // 타임스탬프인 컬럼이나 측정값만 사용
    return this.selectedField
      && !(this.selectedField.logicalType === 'TIMESTAMP' || this.selectedField.role === 'MEASURE');
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
    this.logicalTypes = [
      { label: this.translateService.instant('msg.comm.ui.list.all'), value: 'all' },
      { label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING' },
      { label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN' },
      { label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER' },
      { label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE' },
      { label: this.translateService.instant('msg.storage.ui.list.timestamp'), value: 'TIMESTAMP' },
      { label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT' },
      { label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG' }
    ];
    this.selectedLogicalType = this.logicalTypes[0];
    // search
    this.searchText = '';
    // filter
    this.fieldRoleType = FieldRoleType;
    this.selectedFieldRole = this.fieldRoleType.ALL;

    // bar option
    this._barOption = {
      backgroundColor: '#ffffff',
      color: ['#c1cef1'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      grid: {
        left: 0,
        top: 5,
        right: 5,
        bottom: 0,
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: [],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitNumber: 3,
          splitLine: { show: false },
        }
      ],
      series: [
        {
          type: 'bar',
          barWidth: '70%',
          itemStyle: { normal: { color: '#c1cef1' }, emphasis : {color : '#666eb2'}},
          data: []
        }
      ]
    };

    // scatter option
    this._scatterOption = {
      backgroundColor: '#ffffff',
      grid: {
        left: 8,
        right: 8,
        top: 8,
        bottom: 8,
        containLabel: true
      },
      title: {
        x: 'center',
        text: ''
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          show: true,
          type: 'cross'
        }
      },
      xAxis: {
        name: '',
        type: 'value',
        nameLocation: 'middle',
        axisLabel: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: {
          show: false
        }
      },
      series: []
    };
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 스키마 통계 얻기
   * @param selectedField
   * @param engineName
   * @returns {Promise<any>}
   * @private
   */
  private _getFieldStats(selectedField, engineName): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const params = {
        dataSource: {
          name: engineName,
          type: 'default'
        },
        fields: [],
        userFields: []
        // TODO datasource에 커스텀필드 걸려있을 경우만 집어넣음
      };

      // 선택한 컬럼을 params의 fields에 추가
      params.fields.push(selectedField);
      // 필드를 name과 type 프로퍼티만 남겨지도록 수정
      params.fields = params.fields.map((field) => {
        const temp = {
          name: field.name,
          type: field.role.toLowerCase()
        };
        return temp;
      });

      this.datasourceService.getFieldStats(params)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }


  /**
   * covariance 값 계산
   * @param selectedField
   * @param engineName
   * @returns {Promise<any>}
   * @private
   */
  private _getFieldCovariance(selectedField, engineName): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const params = {
        dataSource: {
          type: 'default',
          name: engineName
        },
        fieldName: selectedField.name,
        userFields: []
        // TODO datasource에 커스텀필드 걸려있을 경우만 집어넣음
      };

      this.datasourceService.getFieldCovariance(params)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 통계 결과
   * @returns {Stats}
   * @private
   */
  private _getStats(): Stats {
    // 선택한 필드가 타임스탬프가 아니라면
    if (this.selectedField.role !== 'TIMESTAMP' && this.statsData.hasOwnProperty(this.selectedField.name)) {
      return this.statsData[this.selectedField.name];
    } else if (this.selectedField.role === 'TIMESTAMP' && this.statsData.hasOwnProperty('__time')) {
    // 선택한 필드가 타임스탬프라면
      return this.statsData['__time'];
    } else {
      return new Stats();
    }
  }

  /**
   * Quartile 값
   * @param {string} type
   * @returns {any}
   * @private
   */
  private _getQuartile(type: string) {
    let result;
    // stats
    const stats = this._getStats();
    if (stats.hasOwnProperty('iqr')) {
      const length = stats.iqr.length;
      switch (type) {
        case 'UPPER':
          result = stats.iqr[0];
          break;
        case 'LOWER':
          result = stats.iqr[length - 1];
          break;
      }
    }
    return result;
  }

  /**
   * 통계 MIN MAX값
   * @param {string} type
   * @returns {any}
   * @private
   */
  private _getStatsMaxAndMin(type: string) {
    let result;
    // stats
    const stats = this._getStats();
    // role 이 timestamp 인 경우
    if (this.selectedField.role === 'TIMESTAMP' && stats.hasOwnProperty('segments')) {
      // segments length
      const length = stats.segments.length;
      switch (type) {
        case 'MIN':
          result = this._getArrayUsedSeparator(stats.segments[0].interval, /\//)[0];
          break;
        case 'MAX':
          result = this._getArrayUsedSeparator(stats.segments[length - 1].interval, /\//)[1];
          break;
      }
    } else if (this.selectedField.role !== 'TIMESTAMP') {
      // role 이 timestamp 가 아닌 경우
      switch (type) {
        case 'MIN':
          result = stats.min;
          break;
        case 'MAX':
          result = stats.max;
          break;
      }
    }
    return result;
  }

  /**
   * 구분자로 string을 구분하여 배열을 받음
   * @param {string} value
   * @param separator
   * @returns {string[]}
   * @private
   */
  private _getArrayUsedSeparator(value: string, separator: any) {
    return value.split(separator);
  }

  /**
   * 컬럼의 row percentage
   * @param {number} value
   * @returns {number}
   * @private
   */
  private _getPercentage(value: number) {
    const total = this._getRowCount();
    const result = Math.floor(value / total * 10000) / 100;
    return isNaN(result) ? 0 : result;
  }

  /**
   * 컬럼의 row count
   * @returns {number}
   * @private
   */
  private _getRowCount(): number {
    // stats
    const stats = this._getStats();
    if (this.selectedField.role === 'TIMESTAMP' && stats.hasOwnProperty('segments')) {
      return stats.segments.map((item) => {
        return item.rows === undefined ? 0 : item.rows;
      }).reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
      });
    } else {
      return stats.count === undefined ? 0 : stats.count;
    }
  }

  /**
   * min max값 얻기
   * @param {any[]} array
   * @returns {{minValue: any; maxValue: any}}
   * @private
   */
  private _getMinMaxValue(array: any[]) {
    const min = Math.min.apply(null, array.map((item) => {
      return item.value;
    }));
    const max = Math.max.apply(null, array.map((item) => {
      return item.value;
    }));

    return { minValue: min, maxValue: max };
  }


  /**
   * covariance 차트 그리기
   * @param {string} engineName
   * @private
   */
  private _getCovarianceChart(engineName: string) {
    this._getScatterSeries(engineName)
      .then((series) => {
        // canvas list
        const canvasList = this._covariance['_results'];
        // 차트 그리기
        for (let i = 0, nMax = canvasList.length; i < nMax; i++) {
          const canvas = canvasList[i].nativeElement;
          const scatterChart = echarts.init(canvas);
          scatterChart.setOption(this._getScatterOption(series[i]));
          scatterChart.resize();
        }
      })
      .catch((error) => {
        Alert.error(error.message);
        // 로딩 hide
        this.loadingHide();
      });
  }


  /**
   * 히스토그램 차트 그리기
   * @param {string} roleType
   * @private
   */
  private _getHistogramChart(roleType: string) {

    this.changeDetect.detectChanges();

    // 차트
    const barChart = echarts.init(this._histogram.nativeElement);
    // chart
    barChart.setOption(this._getBarOption(roleType));
    barChart.resize();
  }


  /**
   * scatter 차트를 그릴때 필요한 series 데이터
   * @param {string} engineName
   * @returns {Promise<any>}
   * @private
   */
  private _getScatterSeries(engineName: string) {
    return new Promise((resolve, reject) => {

      this.changeDetect.detectChanges();

      // 로딩 show
      this.loadingShow();

      // covariance List
      const covarianceList = this.getCovarianceList();

      // params
      const params = {
        dataSource: {
          name: engineName,
          type: 'default'
        },
        pivot: {
          columns: []
        },
        // TODO 필드 확인
        userFields: []
      };
      // covariance에 측정된 measure
      params.pivot.columns = covarianceList.map((item) => {
        return {
          type: 'measure',
          aggregationType: 'NONE',
          name: item.with
        };
      });
      // 선택된 measure
      params.pivot.columns.push({
        type: 'measure',
        aggregationType: 'NONE',
        name: this.selectedField.name
      });


      // 측정값에 대해 데이터 조회
      this.datasourceService.getDatasourceQuery(params)
        .then((result) => {

          // covariance names
          const covarianceNames = covarianceList.map((data) => {
            return data.with;
          });

          // 시리즈 데이터
          const series = covarianceList.map((data) => {
            return {
              name: data.with,
              type: 'scatter',
              symbolSize: 5,
              data: []
            };
          });

          result.forEach((data) => {
            for (let i = 0, nMax = covarianceNames.length; i < nMax; i++) {
              // 소수점 2자리
              const x = data[covarianceNames[i]];
              const y = data[this.selectedField.name];
              series[i].data.push([
                x.toFixed(2) * 1,
                y.toFixed(2) * 1
              ]);
            }
          });

          // 로딩 hide
          this.loadingHide();

          resolve(series);
        })
        .catch((error) => {
          // 로딩 hide
          this.loadingHide();
          reject(error);
        })
    });
  }

  /**
   * Bar 차트에서 쓰일 option 얻기
   * @param {string} roleType
   * @returns {{} & any}
   * @private
   */
  private _getBarOption(roleType: string) {
    // bar option
    const barOption = _.cloneDeep(this._barOption);
    // 통계 데이터 가져오기
    const stats = this._getStats();
    // data
    if (roleType === 'DIMENSION') {
      barOption.xAxis[0].data = stats.frequentItems.map((item) => {
        return item.value;
      });
      barOption.series[0].data = stats.frequentItems.map((item) => {
        return item.count;
      });
    } else if (roleType === 'TIMESTAMP') {
      barOption.xAxis[0].data = stats.segments.map((item) => {
        return item.interval.split('/')[0];
      });
      barOption.series[0].data = stats.segments.map((item) => {
        return item.rows;
      });
    } else { // MEASURE
      // Measure Field Histogram : pmf 값에 1번째와 마지막을 버리고, 2번째 부터 count 값을 곱하여 그게 y 축 value 생성
      const count = stats.count;
      // pmf
      let pmf = stats.pmf;
      if (pmf !== undefined) {
        pmf = this._getPmfList(pmf);
        // data
        barOption.series[0].data = pmf.map((item, index) => {
          return item * count;
        });
        // x축
        barOption.xAxis[0].data = pmf.map((item, index) => {
          return index + 1;
        });
      }
    }

    return barOption;
  }

  /**
   * Scatter 차트에서 쓰일 option 얻기
   * @param series
   * @returns {{} & any}
   * @private
   */
  private _getScatterOption(series: any) {
    const scatterOption = _.cloneDeep(this._scatterOption);
    scatterOption.series = series;
    return scatterOption;
  }

  /**
   * pmf list
   * @param {any[]} pmf
   * @returns {any[]}
   * @private
   */
  private _getPmfList(pmf: any[]) {
    // length
    const pmfLength = pmf.length;
    // length 가 10개 이하인 경우 그대로 출력
    if (pmfLength <= 10) {
      return pmf;
    } else if (pmfLength === 11) {
      // length 가 11개 인경우 0번째만 제거
      pmf.shift();
      return pmf;
    } else {
      // length 가 12개 인경우 0번째와 12번째 제거
      pmf.shift();
      pmf.pop();
      return pmf;
    }
  }

  /**
   * 필드에 메타데이터 설정
   * @param {Field} field
   * @private
   */
  private _setMetaDataField(field: Field): void {
    const fieldMetaData: MetadataColumn = _.find(this.metaData.columns, {'physicalName': field.name});
    // logical name
    field['logicalName'] = fieldMetaData.name;
    // code table
    field['codeTable'] = fieldMetaData.codeTable;
    // dictionary
    field['dictionary'] = fieldMetaData.dictionary;
    // type
    if (fieldMetaData.type) {
      field['logicalType'] = fieldMetaData.type;
    }
    // description
    if (fieldMetaData.description) {
      field['description'] = fieldMetaData.description;
    }
    // format
    if (fieldMetaData.format) {
      field['format'] = fieldMetaData.format;
    }
  }
}
