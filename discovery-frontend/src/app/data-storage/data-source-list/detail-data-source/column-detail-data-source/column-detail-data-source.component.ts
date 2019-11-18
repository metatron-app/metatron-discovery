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
  Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { Stats } from '../../../../domain/datasource/stats';
import { DatasourceService } from '../../../../datasource/service/datasource.service';
import * as _ from 'lodash';
import { Covariance } from '../../../../domain/datasource/covariance';
import {
  ConnectionType,
  Datasource,
  Field,
  FieldFormat,
  FieldFormatType, FieldRole, LogicalType
} from '../../../../domain/datasource/datasource';
import { Metadata } from '../../../../domain/meta-data-management/metadata';
import { MetadataColumn } from '../../../../domain/meta-data-management/metadata-column';
import { isUndefined } from 'util';
import { AbstractComponent } from '../../../../common/component/abstract.component';
import { EditFilterDataSourceComponent } from '../edit-filter-data-source.component';
import { EditConfigSchemaComponent } from './edit-config-schema.component';
import {TimezoneService} from "../../../service/timezone.service";
import {StringUtil} from "../../../../common/util/string.util";
import {DataSourceCreateService, TypeFilterObject} from "../../../service/data-source-create.service";

declare let echarts: any;

/**
 * Datasource detail - column detail tab
 */
@Component({
  selector: 'column-detail-datasource',
  templateUrl: './column-detail-data-source.component.html'
})
export class ColumnDetailDataSourceComponent extends AbstractComponent implements OnChanges {

  @ViewChild('histogram')
  private _histogram: ElementRef;

  @ViewChildren('covariance')
  private _covariance: ElementRef;

  @ViewChild(EditFilterDataSourceComponent)
  private _editFilterComponent: EditFilterDataSourceComponent;

  @ViewChild(EditConfigSchemaComponent)
  private _editConfigSchemaComp: EditConfigSchemaComponent;

  // chart option
  private _barOption: any;
  private _scatterOption: any;

  // datasource information
  @Input()
  public datasource: Datasource;

  // metadata information
  @Input()
  public metaData: Metadata;

  // enum
  public readonly FIELD_ROLE: any = FieldRole;
  public readonly LOGICAL_TYPE: any = LogicalType;

  // filtered column list
  public filteredColumnList: any[];

  // role type filter list
  public roleTypeFilterList: TypeFilterObject[] = this.datasourceCreateService.getRoleTypeFilterList();
  // selected role type filter
  public selectedRoleTypeFilter: TypeFilterObject;

  // logical type filter list
  public logicalTypeFilterList: TypeFilterObject[] = this.datasourceCreateService.getLogicalTypeFilterList().filter(type => type.value !== LogicalType.USER_DEFINED);
  // selected logical type filter
  public selectedLogicalTypeFilter: TypeFilterObject;

  // selected field
  public selectedField: any;

  // covariance data result
  public covarianceData: any = {};
  // stats data result
  public statsData: any = {};

  // search text keyword
  public searchTextKeyword: string;

  @Output()
  public changeDatasource: EventEmitter<any> = new EventEmitter();


  // constructor
  constructor(private datasourceService: DatasourceService,
              private datasourceCreateService: DataSourceCreateService,
              private _timezoneService: TimezoneService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * ngOnChanges
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const dsChanges: SimpleChange = changes.datasource;
    if (dsChanges) {
      // if this is the first access
      if (!dsChanges.previousValue) {
        // ui init
        this._initView();
        // set filtered column list
        this.filteredColumnList = this.datasource.fields;
        // if exist metadata, merge to field
        this.isExistMetaData() && this.filteredColumnList.forEach(field => this._setMetaDataField(field));
        // change selected field
        this.onSelectedField(this.filteredColumnList[0], this.datasource);
      }
      // if change to the field
      else if (dsChanges.previousValue.fields !== dsChanges.currentValue.fields) {
        // update filtered column list
        this._updateFilteredColumnList();
        // if exist metadata, merge to field
        this.isExistMetaData() && this.filteredColumnList.forEach(field => this._setMetaDataField(field));
        // change selected field
        this.onSelectedField(this.selectedField ? this.datasource.fields.filter(field => field.id === this.selectedField.id)[0] : this.filteredColumnList[0], this.datasource);
      }
    }
  }


  /**
   * Change search text keyword and update filtered column list
   * @param {string} text
   */
  public searchText(text: string): void {
    // change search text keyword
    this.searchTextKeyword = text;
    // update filtered column list
    this._updateFilteredColumnList();
  }

  /**
   * Complete update schema
   */
  public completeUpdatedSchema(): void {
    this.changeDatasource.emit('columns');
  }

  /**
   * Is exist metadata
   * @returns {boolean}
   */
  public isExistMetaData(): boolean {
    return !isUndefined(this.metaData);
  }

  /**
   * Is linked type datasource
   * @param {Datasource} source
   * @returns {boolean}
   */
  public isLinkedTypeSource(source: Datasource): boolean {
    return source.connType === ConnectionType.LINK;
  }

  /**
   * Is enable filtering in column
   * @param column
   * @returns {boolean}
   */
  public isEnableFiltering(column: any): boolean {
    return column.filtering;
  }

  /**
   * Is GEO type column
   * @param column
   * @returns {boolean}
   */
  public isGeoType(column: any): boolean {
    return column.logicalType.indexOf('GEO_') !== -1;
  }

  /**
   * Is time type field
   * @param {Field} field
   * @return {boolean}
   */
  public isEnableTimezone(field: Field): boolean {
    return field.format && (field.format.type === FieldFormatType.UNIX_TIME || this._timezoneService.isEnableTimezoneInDateFormat(field.format));
  }

  /**
   * Get timezone label
   * @param {FieldFormat} format
   * @return {string}
   */
  public getTimezoneLabel(format: FieldFormat): string {
    if (format.type === FieldFormatType.UNIX_TIME) {
      return 'Unix time';
    } else {
      return this._timezoneService.getTimezoneObject(format).label;
    }
  }

  /**
   * Get column type label
   * @param {string} type
   * @returns {string}
   */
  public getColumnTypeLabel(type: string): string {
    return this.logicalTypeFilterList.find(filter => filter.value === type).label;
  }

  /**
   * value list
   * @returns {any[]}
   */
  public getValueList(): any {
    // frequentItems
    let list = this._getStats().frequentItems;
    // if list 10 over
    if (list && list.length > 10) {
      list = list.sort((a, b) => {
        return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
      }).slice(0,9);
      list.push({value:this.translateService.instant('msg.storage.ui.dsource.detail.column.etc')});
    }
    return list;
  }

  /**
   * Get covariance data list
   * @returns {Covariance[]}
   */
  public getCovarianceList(): Covariance[] {
    if (this.selectedField && this.covarianceData.hasOwnProperty(this.selectedField.name)) {
      return this.covarianceData[this.selectedField.name];
    }
    return new Array<Covariance>();
  }

  /**
   * Get label
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


  /**
   * Role type filter change event
   * @param type
   */
  public onChangeRoleTypeFilter(filter: TypeFilterObject): void {
    if (this.selectedRoleTypeFilter.value !== filter.value) {
      // 롤 타입 필터링 변경
      this.selectedRoleTypeFilter = filter;
      // 컬럼 목록 갱신
      this._updateFilteredColumnList();
    }
  }

  /**
   * Type filter change event
   * @param type
   */
  public onChangeLogicalTypeFilter(filter: TypeFilterObject): void {
    if (this.selectedLogicalTypeFilter.value !== filter.value) {
      // 타입 필털이 변경
      this.selectedLogicalTypeFilter = filter;
      // 컬럼 목록 갱신
      this._updateFilteredColumnList();
    }
  }

  /**
   * Filter reset click event
   */
  public onClickResetFilter(): void {
    // init search text keyword
    this.searchTextKeyword = undefined;
    // init selected role type filter
    this.selectedRoleTypeFilter = this.roleTypeFilterList[0];
    // init selected type fliter
    this.selectedLogicalTypeFilter = this.logicalTypeFilterList[0];
    // update filtered column list
    this._updateFilteredColumnList();
  }

  /**
   * Selected field change event
   * @param field
   * @param {Datasource} source
   */
  public onSelectedField(field: any, source: Datasource): void {
    // set selected field
    this.selectedField = field;
    // detect changes
    this.changeDetect.detectChanges();
    // set engineName
    const engineName = source.engineName;
    // if only engine type source, get statistics and covariance
    // #728 except GEO types, not get statistics and covariance
    if (!this.isLinkedTypeSource(source) && !this.isGeoType(field)) {
      // if role is TIMESTAMP and __time variable not exist in statsData,
      // else if role is not TIMESTAMP and field name not existed in statsData
      if ((this.selectedField.role === FieldRole.TIMESTAMP && !this.statsData.hasOwnProperty('__time'))
        || (this.selectedField.role !== FieldRole.TIMESTAMP && !this.statsData.hasOwnProperty(field.name))) {
        // loading show
        this.loadingShow();
        // get stats data
        this._getFieldStats(field, engineName)
          .then((stats) => {
            // loading hide
            this.loadingHide();
            // update histogram chart
            this._updateHistogramChart(this.selectedField.role);
          })
          .catch(error => this.commonExceptionHandler(error));
      } else {
        // update histogram chart
        this._updateHistogramChart(this.selectedField.role);
      }

      // if role is MEASURE and field name not existed in covarianceData
      if (field.role === FieldRole.MEASURE && !this.covarianceData.hasOwnProperty(field.name)) {
        // loading show
        this.loadingShow();
        // get covariance data
        this._getFieldCovariance(field, engineName)
          .then((covariance) => {
            // set convariance data
            this.covarianceData[field.name] = covariance;
            // loading hide
            this.loadingHide();
            // update covariance chart
            this._updateCovarianceChart(engineName);
          })
          .catch(error => this.commonExceptionHandler(error));
      } else if (field.role === FieldRole.MEASURE && this.covarianceData.hasOwnProperty(field.name)) {
        // update covariance chart
        this._updateCovarianceChart(engineName);
      }
    }
  }

  /**
   * Edit filter click event
   */
  public onClickEditFilters(): void {
    this._editFilterComponent.init(this.datasource.id, this.datasource.fields, this.isLinkedTypeSource(this.datasource));
    // change markup position
    $('#edit-filter-comp').appendTo($('#layout-contents'));
  }

  /**
   * Configure schema click event
   */
  public onClickConfigureSchema(): void {
    this._editConfigSchemaComp.init(this.datasource.id, this.datasource.fields, this.datasource);
    // change markup position
    $('#edit-config-schema').appendTo($('#layout-contents'));
  }

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    this.selectedLogicalTypeFilter = this.logicalTypeFilterList[0];
    this.selectedRoleTypeFilter = this.roleTypeFilterList[0];
    // init data
    this.statsData = {};
    this.covarianceData = {};
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

  /**
   * Set metadata in field
   * @param {Field} field
   * @private
   */
  private _setMetaDataField(field: Field): void {
    const fieldMetaData: MetadataColumn = _.find(this.metaData.columns, {'physicalName': field.name});
    // code table
    field['codeTable'] = fieldMetaData.codeTable;
    // dictionary
    field['dictionary'] = fieldMetaData.dictionary;
  }

  /**
   * Update filtered column list
   * @private
   */
  private _updateFilteredColumnList(): void {
    this.filteredColumnList =  this.datasource.fields.filter(field => (this.selectedRoleTypeFilter.value === 'ALL' ? true : (FieldRole.DIMENSION === this.selectedRoleTypeFilter.value && FieldRole.TIMESTAMP === field.role ? field : this.selectedRoleTypeFilter.value === field.role))
      && (this.selectedLogicalTypeFilter.value === 'ALL' ? true : (this.selectedLogicalTypeFilter.value === LogicalType.USER_DEFINED && field.logicalType === LogicalType.STRING ? true : this.selectedLogicalTypeFilter.value === field.logicalType))
      && (StringUtil.isEmpty(this.searchTextKeyword) ? true : field.name.toUpperCase().includes(this.searchTextKeyword.toUpperCase().trim())));
  }

  /**
   * Get stats in filed
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
        fields: [selectedField],
        userFields: []
        // TODO datasource에 커스텀필드 걸려있을 경우만 집어넣음
      };
      // modify field to leave only name and type properties
      params.fields = params.fields.map((field) => {
        const temp = {
          name: field.name,
          type: field.role.toLowerCase()
        };
        return temp;
      });
      // get stats data
      this.datasourceService.getFieldStats(params)
        .then((result) => {
          if (!_.isNil(result[0])) {
            // for loop
            for (const property in result[0]) {
              // if not exist property in statsData, push property in statsData
              if (!this.statsData.hasOwnProperty(property)) {
                this.statsData[property] = result[0][property];
              }
            }
          }
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Get covariance in field
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
      // get covarinace data
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
   * Get stats data
   * @returns {Stats}
   * @private
   */
  private _getStats(): Stats {
    // if the seleted field is not a TIMESTAMP
    if (this.selectedField.role !== 'TIMESTAMP' && this.statsData.hasOwnProperty(this.selectedField.name)) {
      return this.statsData[this.selectedField.name];
    } else if (this.selectedField.role === 'TIMESTAMP' && this.statsData.hasOwnProperty('__time')) {
      // If the selected field is a TIMESTAMP
      return this.statsData['__time'];
    } else {
      return new Stats();
    }
  }

  /**
   * Get quartile
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
        case 'LOWER':
          result = stats.iqr[0];
          break;
        case 'UPPER':
          result = stats.iqr[length - 1];
          break;
      }
    }
    return result;
  }

  /**
   * Get max and min in stats
   * @param {string} type
   * @returns {any}
   * @private
   */
  private _getStatsMaxAndMin(type: string) {
    let result;
    // stats
    const stats = this._getStats();
    // if role is a TIMESTAMP
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
      // if role is not a TIMESTAMP
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
   * Get separator
   * @param {string} value
   * @param separator
   * @returns {string[]}
   * @private
   */
  private _getArrayUsedSeparator(value: string, separator: any) {
    return value.split(separator);
  }

  /**
   * Get parcentage
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
   * Get row count
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
   * Get min max value
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
   * Update covariance chart
   * @param {string} engineName
   * @private
   */
  private _updateCovarianceChart(engineName: string) {
    this._getScatterSeries(engineName)
      .then((series) => {
        // canvas list
        const canvasList = this._covariance['_results'];
        // create chart
        for (let i = 0, nMax = canvasList.length; i < nMax; i++) {
          const canvas = canvasList[i].nativeElement;
          const scatterChart = echarts.init(canvas);
          scatterChart.setOption(this._getScatterOption(series[i]));
          scatterChart.resize();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Update histogram chart
   * @param {string} roleType
   * @private
   */
  private _updateHistogramChart(roleType: string) {
    // init chart
    const barChart = echarts.init(this._histogram.nativeElement);
    // chart
    barChart.setOption(this._getBarOption(roleType));
    barChart.resize();
  }

  /**
   * Get series data to draw scatter chart
   * @param {string} engineName
   * @returns {Promise<any>}
   * @private
   */
  private _getScatterSeries(engineName: string) {
    return new Promise((resolve, reject) => {
      // loading show
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
          columns: covarianceList
            ? covarianceList.map((item) => {
              return {
                type: 'measure',
                aggregationType: 'NONE',
                name: item.with
              };
            })
            : []
        },
        // TODO 필드 확인
        userFields: []
      };
      // selected field
      params.pivot.columns.push({
        type: 'measure',
        aggregationType: 'NONE',
        name: this.selectedField.name
      });
      // Get data to MEASURE value
      this.datasourceService.getDatasourceQuery(params)
        .then((result) => {
          // covariance names
          const covarianceNames = covarianceList.map((data) => {
            return data.with;
          });
          // set series data
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
              // 2 decimal places
              const x = data[covarianceNames[i]];
              const y = data[this.selectedField.name];
              series[i].data.push([
                x.toFixed(2) * 1,
                y.toFixed(2) * 1
              ]);
            }
          });
          // loading hide
          this.loadingHide();
          resolve(series);
        })
        .catch((error) => {
          // loading hide
          this.loadingHide();
          reject(error);
        })
    });
  }

  /**
   * Get options to use in Bar charts
   * @param {string} roleType
   * @returns {{} & any}
   * @private
   */
  private _getBarOption(roleType: string) {
    // bar option
    const barOption = _.cloneDeep(this._barOption);
    // get stats
    const stats = this._getStats();
    // data
    if (roleType === 'DIMENSION' && !_.isNil(stats.frequentItems)) {
      barOption.xAxis[0].data = stats.frequentItems.map((item) => {
        return item.value;
      });
      barOption.series[0].data = stats.frequentItems.map((item) => {
        return item.count;
      });
    } else if (roleType === 'TIMESTAMP' && !_.isNil(stats.segments)) {
      barOption.xAxis[0].data = stats.segments.map((item) => {
        return item.interval.split('/')[0];
      });
      barOption.series[0].data = stats.segments.map((item) => {
        return item.rows;
      });
    } else { // MEASURE
      // Measure Field Histogram : It discards the first and the last in the pmf value, multiplies the count value from the second
      const count = stats.count;
      // pmf
      let pmf = stats.pmf;
      if (!_.isNil(pmf)) {
        pmf = this._getPmfList(pmf);
        // data
        barOption.series[0].data = pmf.map((item, index) => {
          return item * count;
        });
        // xAxis
        barOption.xAxis[0].data = pmf.map((item, index) => {
          return index + 1;
        });
      }
    }

    return barOption;
  }

  /**
   * Get options to use in Scatter charts
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
   * Get pmf list
   * @param {any[]} pmf
   * @returns {any[]}
   * @private
   */
  private _getPmfList(pmf: any[]) {
    // length
    const pmfLength = pmf.length;
    // Outputs when length is less than 10
    if (pmfLength <= 10) {
      return pmf;
    } else if (pmfLength === 11) {
      // If length is 11, remove only 0th
      pmf.shift();
      return pmf;
    } else {
      // If length is 12, remove 0th and 12th
      pmf.shift();
      pmf.pop();
      return pmf;
    }
  }
}
