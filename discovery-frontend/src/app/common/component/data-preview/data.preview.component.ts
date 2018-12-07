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

import {AbstractPopupComponent} from '../abstract-popup.component';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {BoardDataSource, Dashboard, JoinMapping, QueryParam} from '../../../domain/dashboard/dashboard';
import {DatasourceService} from 'app/datasource/service/datasource.service';
import {Datasource, DataSourceSummary, Field} from '../../../domain/datasource/datasource';
import {SlickGridHeader} from 'app/common/component/grid/grid.header';
import {header} from '../grid/grid.header';
import {GridComponent} from '../grid/grid.component';
import {GridOption} from '../grid/grid.option';
import {Alert} from '../../util/alert.util';
import {Stats} from '../../../domain/datasource/stats';
import {Covariance} from '../../../domain/datasource/covariance';
import * as _ from 'lodash';
import {DataconnectionService} from '../../../dataconnection/service/dataconnection.service';
import {CommonUtil} from '../../util/common.util';
import {DataDownloadComponent, PreviewResult} from '../data-download/data.download.component';
import {MetadataColumn} from '../../../domain/meta-data-management/metadata-column';
import {DashboardUtil} from '../../../dashboard/util/dashboard.util';
import {ConnectionType, Dataconnection} from '../../../domain/dataconnection/dataconnection';
import {PeriodData} from "../../value/period.data.value";
import {TimeRangeFilter} from "../../../domain/workbook/configurations/filter/time-range-filter";
import {Filter} from "../../../domain/workbook/configurations/filter/filter";
import {DIRECTION, Sort} from "../../../domain/workbook/configurations/sort";

declare let echarts: any;

enum FieldRoleType {
  ALL = <any>'ALL',
  DIMENSION = <any>'DIMENSION',
  MEASURE = <any>'MEASURE'
}

@Component({
  selector: 'data-preview',
  templateUrl: './data.preview.component.html'
})
export class DataPreviewComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  @ViewChild('main')
  private gridComponent: GridComponent;

  @ViewChild('histogram')
  private histogram: ElementRef;

  @ViewChildren('covariance')
  private covariance: ElementRef;

  @ViewChild(DataDownloadComponent)
  private _dataDownComp: DataDownloadComponent;

  private gridData: any[];

  // 차트 옵션
  private barOption: any;
  private scatterOption: any;

  private _zIndex: string;

  private _filters: Filter[] = [];

  private _queryParams = new QueryParam();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public source: Dashboard | Datasource;

  // 필드 디테일 single data
  @Input()
  public singleTab: boolean = false;
  // sigle 일때 넘겨받은 필드
  @Input()
  public field: any;

  public isDashboard: boolean = false;    // 입력 소스가 대시보드인지 여부

  // 검색어
  public srchText: string;

  // 표시 여부
  public isShowDataGrid: boolean = true;    // 데이터 그리드 표시 여부
  public isShowInfoLayer: boolean = false;  // 정보 레이어 표시 여부
  public isJoin: boolean = false;            // 데이터소스 조인 여부

  // Field Role
  public fieldRoleType = FieldRoleType;
  public selectedFieldRole: FieldRoleType = this.fieldRoleType.ALL;

  // logical Type
  public isShowTypeComboOpts: boolean = false;
  public logicalTypes: any[];
  public selectedLogicalType: any;

  // columns & column Types & Roles
  public columns: any[] = [];
  public colTypes: { type: string, cnt: number }[] = [];
  public roles: any = {};

  // Datasource
  public datasources: Datasource[] = [];
  public mainDatasource: Datasource;
  public joinMappings: JoinMapping[] = [];
  public joinDataSources: Datasource[] = [];

  // 메인 그리드 rows 개수
  public rowNum: number = 100;

  // 선택한 필드 이름
  public selectedField: any;
  // 선택된 데이터소스
  public selectedSource: Datasource;

  // Covariance 조회 결과
  public covarianceData: any = {};

  // 통계 조회 결과
  public statsData: any = {};

  // 선택한 필드의 데이터
  public selectedColumnData: any[] = [];

  // 현재 마스터 데이터소스의 연결 타입
  public connType: string;

  // 메인 데이터소스 요약 정보
  public mainDsSummary: DataSourceSummary;

  public commonUtil = CommonUtil;

  public timestampField: Field;

  public downloadPreview: PreviewResult;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private connectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Init
   */
  public ngOnInit() {
    super.ngOnInit();

    // z-index 강제 설정
    const $popup = $('.ddp-wrap-tab-popup');
    this._zIndex = $popup.css('z-index');
    $popup.css('z-index', '127');

    // ui init
    this.initView();

    // set columns info
    if (this.source['configuration']) {
      this.isDashboard = true;
      const dashboardInfo: Dashboard = (<Dashboard>this.source);
      this.datasources = _.cloneDeep(DashboardUtil.getMainDataSources(dashboardInfo));
    } else {
      this.isDashboard = false;
      this.datasources.push(<Datasource>_.cloneDeep(this.source));
    }
    // 데이터소스 array에 메타데이터가 존재하는경우 merge
    this.datasources.forEach((source) => {
      source.fields.forEach((field, index, object) => {
        // set meta data information
        this._setMetaDataField(field, source);
        //  if current time in fields, hide
        if (DashboardUtil.isCurrentDateTime(field)) {
          object.splice(index, 1);
        }
      });
    });
    this.selectDataSource(this.datasources[0]);

  } // function - ngOnInit

  /**
   * Destory
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
    // z-index 설정 해제
    $('.ddp-wrap-tab-popup').css('z-index', this._zIndex);
  }

  /**
   * Is tooltip class changed
   * @param columnList
   * @param {number} index
   * @returns {boolean}
   */
  // public isChangeTooltipClass(columnList: any, index: number): boolean {
  //   return index > (columnList.length / 2 - 1) ? true : false;
  // }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 스키마 통계 얻기
   * @param selectedField
   * @param engineName
   * @returns {Promise<any>}
   */
  private getFieldStats(selectedField, engineName) {
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
        return {
          name: field.name,
          type: field.role.toLowerCase()
        };
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
   */
  private getFieldCovariance(selectedField, engineName): Promise<any> {
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
   * 데이터를 조회한다.
   * @param {Datasource} source
   * @returns {Promise<any>}
   */
  private queryData(source: Datasource): Promise<any> {
    return new Promise<any>((res, rej) => {

      const params = new QueryParam();
      params.limits.limit = (this.rowNum < 1) ? 100 : this.rowNum;
      if (this.isDashboard) {
        // 대시보드인 경우

        if (this.timestampField) {
          const sortInfo: Sort = new Sort();
          sortInfo.field = this.timestampField.name;
          sortInfo.direction = DIRECTION.DESC;
          params.limits.sort.push(sortInfo);
        }

        let boardDs: BoardDataSource = (<Dashboard>this.source).configuration.dataSource;
        if ('multi' === boardDs.type) {
          boardDs = boardDs.dataSources.find(item => DashboardUtil.isSameDataSource(item, source));
        }

        params.dataSource = _.cloneDeep(boardDs);
        params.dataSource.name = boardDs.engineName;
        const joins = boardDs.joins;
        if (joins && joins.length > 0) {
          this.isJoin = true;
          this.joinMappings = joins;
          params.dataSource.type = 'mapping';
          params.dataSource['joins'] = joins;
        }
      } else {
        // 데이터소스인 경우
        const dsInfo = _.cloneDeep(<Datasource>source);
        params.dataSource.name = dsInfo.engineName;
        params.dataSource.engineName = dsInfo.engineName;
        params.dataSource.connType = dsInfo.connType.toString();
        params.dataSource.type = 'default';
      }

      if (this._filters && 0 < this._filters.length) {
        params.filters = this._filters;
      }
      // params.metaQuery = true;

      this.loadingShow();
      this.datasourceService.getDatasourceQuery(params).then(gridData => {

        // 쿼리 조건 저장
        params.limits.limit = 10000000;
        this._queryParams = _.cloneDeep(params);

        params.metaQuery = true;
        this.datasourceService.getDatasourceQuery(params).then(metaData => {
          this.downloadPreview = new PreviewResult(metaData.estimatedSize, metaData.totalCount);
          (this.rowNum > this.downloadPreview.count) && (this.rowNum = this.downloadPreview.count);
          res(gridData);
          this.loadingHide();
        });

      }).catch((err) => {
        console.error(err);
        rej(err);
        this.loadingHide();
      });
    });
  } // function - queryData

  /**
   * 그리드 갱신
   * @param data
   * @param {Field[]} fields
   */
  private updateGrid(data?: any, fields?: Field[]) {

    // 헤더정보 생성
    const headers: header[]
      = ((fields) ? fields : this.columns)
      .filter((item: Field) => {
        // role
        let isValidRole: boolean = (FieldRoleType.ALL === this.selectedFieldRole)
          ? true
          : (item.role.toString() === 'TIMESTAMP' ? this.selectedFieldRole.toString() === 'DIMENSION' : item.role.toString() === this.selectedFieldRole.toString());
        // type
        let isValidType: boolean = ('all' === this.selectedLogicalType.value) ? true : (item.logicalType === this.selectedLogicalType.value);
        return (isValidRole && isValidType);
      })
      .map((field: Field) => {
        const headerName: string = field.headerKey ? field.headerKey : field.name;
        return new SlickGridHeader()
          .Id(headerName)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) + '"></em>' + headerName + '</span>')
          .Field(headerName)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(10 * (headerName.length) + 20)
          .MinWidth(100)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      });

    let rows: any[] = data || this.gridData;
    // row and headers가 있을 경우에만 그리드 생성
    if (rows && 0 < headers.length) {
      if (rows.length > 0 && !rows[0].hasOwnProperty('id')) {
        rows = rows.map((row: any, idx: number) => {
          Object.keys(row).forEach(key => {
            row[key.substr(key.indexOf('.') + 1, key.length)] = row[key];
          });
          row.id = idx;
          return row;
        });
      }

      this.rowNum = rows.length;

      // dom 이 모두 로드되었을때 작동
      this.changeDetect.detectChanges();
      // 세컨드 헤더가 사용이 가능하다면
      this.isEnableSecondHeader()
        ? this.gridComponent.create(headers, rows, new GridOption()
          .SyncColumnCellResize(true)
          .MultiColumnSort(true)
          .RowHeight(32)
          .ShowHeaderRow(true)
          .HeaderRowHeight(32)
          .ExplicitInitialization(true)
          .build())
        : this.gridComponent.create(headers, rows, new GridOption()
          .SyncColumnCellResize(true)
          .MultiColumnSort(true)
          .RowHeight(32)
          .build());
      // search
      this.gridComponent.search(this.srchText);
      // ExplicitInitialization 을 true 로 줬기 떄문에 init해줘야 한다.
      this.isEnableSecondHeader() && this.gridComponent.grid.init();
    } else {
      this.gridComponent.destroy();
    }
  } // function - updateGrid

  /**
   * Get query data for linked type
   * @param source
   * @private
   */
  private _getQueryDataInLinked(source): void {
    // loading show
    this.loadingShow();
    // 프리셋을 생성한 연결형 : source.connection 사용
    // 커넥션 정보로 생성한 연결형 : source.ingestion.connection 사용
    const connection: Dataconnection = source.connection || source.ingestion.connection;
    const params = source.ingestion && connection
      ? this._getConnectionParams(source.ingestion, connection)
      : {};
    this.connectionService.getTableDetailWitoutId(params, connection.implementor === ConnectionType.HIVE)
      .then((data) => {
        this.gridData = data['data'];
        this.updateGrid(this.gridData, this.columns);
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  // noinspection JSMethodCanBeStatic
  /**
   * 커넥션 파라메터
   * @param ingestion
   * @param connection
   * @return {{connection: {hostname: any,port: any,username: any,password: any,implementor: any},database: any,type: any, query: any}}
   * @private
   */
  private _getConnectionParams(ingestion: any, connection: any) {
    const params = {
      connection: {
        hostname: connection.hostname,
        port: connection.port,
        implementor: connection.implementor,
        authenticationType: connection.authenticationType || 'MANUAL'
      },
      database: ingestion.database,
      type: ingestion.dataType,
      query: ingestion.query
    };
    // if security type is not USERINFO, add password and username
    if (connection.authenticationType !== 'USERINFO') {
      params['connection']['username'] = connection.authenticationType === 'DIALOG' ? ingestion.connectionUsername : connection.username;
      params['connection']['password'] = connection.authenticationType === 'DIALOG' ? ingestion.connectionPassword : connection.password;
    }
    // 데이터 베이스가 있는경우
    if (ingestion.connection && ingestion.connection.hasOwnProperty('database')) {
      params['connection']['database'] = ingestion.connection.database;
    }

    return params;
  }

  // ui init
  private initView() {
    this.logicalTypes = [
      {label: this.translateService.instant('msg.comm.ui.list.all'), value: 'all'},
      {label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING'},
      {label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN'},
      {label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER'},
      {label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE'},
      {label: this.translateService.instant('msg.storage.ui.list.date'), value: 'TIMESTAMP'},
      {label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT'},
      {label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG'},
      {label: this.translateService.instant('msg.storage.ui.list.geo.point'), value: 'GEO_POINT', derived: true},
      {label: this.translateService.instant('msg.storage.ui.list.geo.polygon'), value: 'GEO_POLYGON', derived: true},
      {label: this.translateService.instant('msg.storage.ui.list.geo.line'), value: 'GEO_LINE', derived: true}
    ];
    this.selectedLogicalType = this.logicalTypes[0];

    // bar option
    this.barOption = {
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
          splitLine: {show: false},
        }
      ],
      series: [
        {
          type: 'bar',
          barWidth: '70%',
          itemStyle: {normal: {color: '#c1cef1'}, emphasis: {color: '#666eb2'}},
          data: []
        }
      ]
    };

    // scatter option
    this.scatterOption = {
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
   | private Method - column detail
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 통계 결과
   * @returns {Stats}
   */
  private getStats(): Stats {
    if (this.selectedField.role !== 'TIMESTAMP' && this.statsData.hasOwnProperty(this.selectedField.name)) {
      return this.statsData[this.selectedField.name];
    } else if (this.selectedField.role === 'TIMESTAMP' && this.statsData.hasOwnProperty('__time')) {
      return this.statsData['__time'];
    }
    return new Stats();
  }

  /**
   * frequentItems 값
   * @returns {any[]}
   */
  private get getFrequentItems() {
    return this.getStats().frequentItems;
  }

  /**
   * time 의 segments 배열
   * @returns {Segments[]}
   */
  private get getTimeSegments() {
    return this.getStats().segments;
  }

  /**
   * Quartile 값
   * @param {string} type
   * @returns {any}
   */
  private getQuartile(type: string) {
    let result;
    // stats
    const stats = this.getStats();
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
   * 통계 MIN MAX값
   * @param {string} type
   * @returns {any}
   */
  private getStatsMaxAndMin(type: string) {
    let result;
    // stats
    const stats = this.getStats();
    // role 이 timestamp 인 경우
    if (this.selectedField.role === 'TIMESTAMP' && stats.hasOwnProperty('segments')) {
      const length = this.getTimeSegments.length;
      switch (type) {
        case 'MIN':
          result = this.getArrayUsedSeparator(this.getTimeSegments[0].interval, /\//)[0];
          break;
        case 'MAX':
          result = this.getArrayUsedSeparator(this.getTimeSegments[length - 1].interval, /\//)[1];
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

  // noinspection JSMethodCanBeStatic
  /**
   * 구분자로 string을 구분하여 배열을 받음
   * @param {string} value
   * @param separator
   * @returns {string[]}
   */
  private getArrayUsedSeparator(value: string, separator: any) {
    return value.split(separator);
  }

  /**
   * 컬럼의 row percentage
   * @param {number} value
   * @returns {number}
   */
  private getPercentage(value: number) {
    const total = this.getRowCount();
    const result = Math.floor(value / total * 10000) / 100;
    return isNaN(result) ? 0 : result;
  }

  /**
   * 컬럼의 row count
   * @returns {number}
   */
  private getRowCount(): number {
    // stats
    const stats = this.getStats();
    if (this.selectedField.role === 'TIMESTAMP' && stats.hasOwnProperty('segments')) {
      return this.getTimeSegments.map((item) => {
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
   * @returns {{minValue: any, maxValue: any}}
   */
  private getMinMaxValue(array: any[]) {
    const min = Math.min.apply(null, array.map((item) => {
      return item.value;
    }));
    const max = Math.max.apply(null, array.map((item) => {
      return item.value;
    }));

    return {minValue: min, maxValue: max};
  }


  /**
   * covariance 차트 그리기
   * @param {string} engineName
   */
  private getCovarianceChart(engineName: string) {
    this.getScatterSeries(engineName)
      .then((series) => {
        // canvas list
        const canvasList = this.covariance['_results'];
        // 차트 그리기
        for (let i = 0, nMax = canvasList.length; i < nMax; i++) {
          const canvas = canvasList[i].nativeElement;
          const scatterChart = echarts.init(canvas);
          scatterChart.setOption(this.getScatterOption(series[i]));
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
   */
  private getHistogramChart(roleType: string) {

    this.changeDetect.detectChanges();

    // 차트
    const barChart = echarts.init(this.histogram.nativeElement);
    // chart
    barChart.setOption(this.getBarOption(roleType));
    barChart.resize();
  }


  /**
   * scatter 차트를 그릴때 필요한 series 데이터
   * @param {string} engineName
   * @returns {Promise<any>}
   */
  private getScatterSeries(engineName: string) {
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
   */
  private getBarOption(roleType: string) {
    // bar option
    const barOption = _.cloneDeep(this.barOption);
    // 통계 데이터 가져오기
    const stats = this.getStats();

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
      let pmf = stats.pmf;
      if (pmf !== undefined) {
        pmf = this.getPmfList(pmf);
        // data
        barOption.series[0].data = pmf.map((item) => {
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
   */
  private getScatterOption(series: any) {
    const scatterOption = _.cloneDeep(this.scatterOption);
    scatterOption.series = series;
    return scatterOption;
  }


  // noinspection JSMethodCanBeStatic
  private getPmfList(pmf: any[]) {
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
   * @param {Datasource} source
   * @private
   */
  private _setMetaDataField(field: Field, source: Datasource): void {
    // 메타데이터가 존재한다면
    if (this.isExistMetaData(source)) {
      const fieldMetaData: MetadataColumn = _.find(source.uiMetaData.columns, {'physicalName': field.name});
      // logical name
      field['logicalName'] = fieldMetaData.name;
      // code table
      field['codeTable'] = fieldMetaData.codeTable;
      // dictionary
      field['dictionary'] = fieldMetaData.dictionary;
      // type
      if (fieldMetaData.type) {
        field['metaType'] = fieldMetaData.type;
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 조회 날짜 변경
   */
  public onChangeDate(data: PeriodData) {

    if ('ALL' === data.type) {
      this._filters = [];
    } else {
      const timestampField: Field = this.columns.filter(item => item.role === 'TIMESTAMP')[0];
      const timeRange: TimeRangeFilter = new TimeRangeFilter(timestampField);
      timeRange.intervals = [
        data.startDateStr.replace(/T/gi, ' ') + ':00'
        + '/'
        + data.endDateStr.replace(/T/gi, ' ') + ':00'
      ];
      this._filters = [timeRange];
    }

    // Query Data
    this.queryData(this.mainDatasource).then(data => {
      this.gridData = data;
      this.updateGrid(data, this.columns);
    }).catch((error) => {
      console.log(error);
    });

  } // function - onChangeDate

  /**
   * 데이터소스 선택
   * @param {Datasource} dataSource
   */
  public selectDataSource(dataSource: Datasource) {

    // initialize data
    this.mainDatasource = dataSource;
    this.rowNum = 100;
    // seletedfield init
    this.selectedField = null;
    this.timestampField = null;
    this.columns = [];
    this.colTypes = [];
    this.roles = {};

    this.joinMappings = [];
    this.joinDataSources = [];

    this.safelyDetectChanges();

    // set columns info
    if (this.isDashboard) {

      this.mainDsSummary = (this.mainDatasource && this.mainDatasource.summary) ? this.mainDatasource.summary : undefined;
      this.columns = this.mainDatasource.fields;
      if (this.mainDsSummary) {
        this.downloadPreview = new PreviewResult(this.mainDsSummary.size, this.mainDsSummary.count);
        if (this.rowNum > this.mainDsSummary.count) {
          this.rowNum = this.mainDsSummary.count;
        }
      }

      // Column Type & Role 타입별 수량 정리 - 대시보드 정보 레이어용
      let tempColType: any = {};
      this.columns.forEach((item: Field) => {
        if (tempColType[item.logicalType]) {
          tempColType[item.logicalType] += 1;
        } else {
          tempColType[item.logicalType] = 1;
        }
        if (this.roles[item.role]) {
          this.roles[item.role] += 1;
        } else {
          this.roles[item.role] = 1;
        }
      });
      Object.keys(tempColType).forEach(key => this.colTypes.push({type: key, cnt: tempColType[key]}));

      const boardDs: BoardDataSource = (<Dashboard>this.source).configuration.dataSource;
      if ('multi' === boardDs.type) {
        const masterBoardDs: BoardDataSource
          = boardDs.dataSources.find(item => DashboardUtil.isSameDataSource(item, dataSource));
        this.joinDataSources = [dataSource];
        if (masterBoardDs.joins && 0 < masterBoardDs.joins.length) {
          this.joinDataSources = this.joinDataSources.concat(
            (<Dashboard>this.source).dataSources.filter(item => {
              return masterBoardDs.joins.some((joinItem: JoinMapping) => {
                return (joinItem.join && joinItem.join.id === item.id) || (joinItem.id === item.id);
              });
            })
          );
        }
      } else {
        this.joinDataSources = this.datasources;
      }

    } else {
      this.joinDataSources = this.datasources;
      this.columns = this.mainDatasource.fields;
    }

    // 타임스탬프 필드 설정
    this.timestampField = this.columns.find(item => item.role === 'TIMESTAMP');

    // 마스터 소스 타입
    this.connType = this.mainDatasource.hasOwnProperty('connType') ? this.mainDatasource.connType.toString() : 'ENGINE';

    // singleTab
    const field = this.singleTab ? this.field : this.columns[0];
    this.isShowDataGrid = !this.singleTab;

    // linked인 경우
    if (this.connType === 'LINK') {
      // TODO 마스터 데이터소스만 해당되는지 join된 소스까지 해당되는지 확인하기
      this._getQueryDataInLinked(this.mainDatasource);
    } else {
      // Query Data
      this.queryData(this.mainDatasource)
        .then(data => {
          if (data && 0 < data.length) {
            this.gridData = data;

            // single tab 이 아닌경우에만 그리드
            if (!this.singleTab) {
              this.updateGrid(data, this.columns);
            } else {
              // gird data를 name으로 검색
              const data = [];
              this.gridData.forEach((item) => {
                if (item.hasOwnProperty(field.name) && item[field.name]) {
                  data.push(item[field.name]);
                }
              });
              this.selectedColumnData = data;
              // 필드 선택
              this.onSelectedField(field, this.mainDatasource);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  } // function - selectDataSource

  /**
   * value list
   * @returns {any[]}
   */
  public getValueList() {
    let list = this.getFrequentItems;
    if (list && list.length > 10) {
      list = list.sort((a, b) => {
        return a.count > b.count ? -1 : a.count < b.count ? 1 : 0;
      }).slice(0, 9);
      list.push({value: '기타'});
    }
    return list;
  }


  /**
   * 히스토그램 사용여부
   * @returns {boolean}
   */
  public isEnabledHistogram(): boolean {
    return this.selectedField
      && (this.selectedField.logicalType === 'TIMESTAMP' || this.selectedField.role === 'MEASURE');
  }

  /**
   * value list 사용 여부
   * @returns {boolean}
   */
  public isEnabledValueList(): boolean {
    return this.selectedField
      && !(this.selectedField.logicalType === 'TIMESTAMP' || this.selectedField.role === 'MEASURE');
  }

  /**
   * 메타데이터 헤더 생성
   * @param args
   */
  public createMetaDataHeader(args: any): void {
    // TODO 추후 그리드 자체에서 생성하도록 변경하기
    $('<div class="slick-data">(' + (_.find(this.columns, {'name': args.column.id}).logicalName || '') + ')</div>')
      .appendTo(args.node);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - column detail
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Is linked type datasource
   * @param {Datasource} source
   * @returns {boolean}
   */
  public isLinkedTypeSource(source: Datasource): boolean {
    return source.connType.toString() === 'LINK';
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
   * Is derived column
   * @param {Field} column
   * @returns {boolean}
   */
  public isDerivedColumn(column: Field): boolean {
    return column.derived;
  }

  /**
   * Get column type label
   * @param {string} type
   * @param typeList
   * @returns {string}
   */
  public getColumnTypeLabel(type: string, typeList: any): string {
    return typeList[_.findIndex(typeList, item => item['value'] === type)].label;
  }

  /**
   * Covariance 리스트
   * @returns {Covariance[]}
   */
  public getCovarianceList(): Covariance[] {
    if (this.covarianceData.hasOwnProperty(this.selectedField.name)) {
      return this.covarianceData[this.selectedField.name];
    }
    return [];
  }

  /**
   * 데이터 라벨
   * @param {string} labelName
   * @returns {any}
   */
  public getLabel(labelName: string): any {
    let result;

    // stats
    const stats = this.getStats();

    switch (labelName) {
      case 'count':
        result = this.getRowCount();
        break;
      case 'valid':
        const valid = this.getRowCount() - (stats.missing === undefined ? 0 : stats.missing);
        result = valid + ` (${this.getPercentage(valid)}%)`;
        break;
      case 'unique':
        const cardinality = stats.cardinality || stats['cardinality(estimated)'];
        const unique = cardinality === undefined ? 0 : cardinality;
        result = unique + ` (${this.getPercentage(unique)}%)`;
        break;
      case 'outliers':
        const outliers = stats.outliers === undefined ? 0 : stats.outliers;
        result = outliers + ` (${this.getPercentage(outliers)}%)`;
        break;
      case 'missing':
        const missing = stats.missing === undefined ? 0 : stats.missing;
        result = missing + ` (${this.getPercentage(missing)}%)`;
        break;
      case 'min':
        const min = this.getStatsMaxAndMin('MIN');
        result = min === undefined ? 0 : min;
        break;
      case 'lower':
        const lower = this.getQuartile('LOWER');
        result = lower === undefined ? 0 : lower;
        break;
      case 'median':
        result = stats.median === undefined ? 0 : stats.median;
        break;
      case 'upper':
        const upper = this.getQuartile('UPPER');
        result = upper === undefined ? 0 : upper;
        break;
      case 'max':
        const max = this.getStatsMaxAndMin('MAX');
        result = max === undefined ? 0 : max;
        break;
      case 'average':
        result = stats.mean === undefined ? 0 : stats.mean;
        break;
      case 'standard':
        result = stats.stddev === undefined ? 0 : stats.stddev;
        break;
      case 'skewness':
        result = stats.skewness === undefined ? 0 : stats.skewness;
        break;
    }
    return result;
  }

  /**
   * 조회 줄 수를 변경한다.
   * @param {KeyboardEvent} event
   */
  public changeRowNum(event: KeyboardEvent) {
    if (13 === event.keyCode) {
      this.rowNum = event.target['value'];
      if (this.downloadPreview && this.rowNum > this.downloadPreview.count) {
        this.rowNum = this.downloadPreview.count;
      }
      // Query Data
      this.queryData(this.mainDatasource).then(data => {
        this.gridData = data;
        this.updateGrid(data, this.columns);
      }).catch((error) => {
        console.log(error);
      });
    }
  } // function - changeRowNum

  /**
   * 필터 설정을 초기화 한다.
   */
  public resetFilter() {
    this.clearSrchText();
    this.selectedFieldRole = FieldRoleType.ALL;
    this.selectedLogicalType = this.logicalTypes[0];
    if (this.isShowDataGrid) {
      this.updateGrid();
    } else {
      console.info('column detail');
    }
  } // function - resetFilter

  /**
   * 데이터를 검색한다.
   * @param {Event} event
   */
  public searchData(event: KeyboardEvent) {
    if (13 === event.keyCode) {
      if (this.isShowDataGrid) {
        this.srchText = event.target['value'];
        // grid update
        this.updateGrid(this.gridData, this.columns);
      } else {
        this.srchText = event.target['value'];
      }
    }
  } // function - searchData

  /**
   * 검색어를 지움
   */
  public clearSrchText() {
    this.srchText = '';
  } // function - clearSrchText

  /**
   * Field Role 타입을 변경 후, 그리드를 재조회한다.
   * @param {FieldRoleType} type
   */
  public changeFieldRole(type: FieldRoleType) {
    this.selectedFieldRole = type;
    if (this.isShowDataGrid) {
      this.updateGrid();
    } else {
      console.info('column detail');
    }
  } // function - changeFieldRole

  /**
   * 그리드의 데이터 CSV로 다운로드한다.
   * @param {MouseEvent} event
   */
  public downloadData(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.loadingShow();
    this.datasourceService.getDatasourceQuery(this._queryParams).then(downData => {
      this._dataDownComp.openDataDown(event, this.columns, downData, this.downloadPreview);
      this.loadingHide();
    }).catch((err) => {

      this.loadingHide();
    });
  } // function - downloadData

  /**
   * logicalType change
   * @param {MouseEvent} event
   * @param type
   */
  public onChangeLogicalType(event: MouseEvent, type) {
    event.stopPropagation();
    event.preventDefault();
    this.isShowTypeComboOpts = false;
    this.selectedLogicalType = type;
    if (this.isShowDataGrid) {
      this.updateGrid();
    } else {
      console.info('change logical type');
    }
  } // function - onChangeLogicalType

  /**
   * 그리드 탭 변경 이벤트
   * @param showGridFl
   */
  public onChangeTab(showGridFl) {
    // 같다면 이벤트 발생하지 않음
    if (showGridFl === this.isShowDataGrid) {
      return;
    }
    // 그리드 show flag
    this.isShowDataGrid = showGridFl;

    // 컬럼상세이고 선택된 필드가 없는경우
    if (!this.isShowDataGrid && !this.selectedField) {
      // 필드 선택
      this.onSelectedField(this.columns[0], this.mainDatasource);
    }

    // 변경된 탭이 그리드 인 경우
    if (this.isShowDataGrid) {
      this.updateGrid(this.gridData, this.columns);
    }
  }

  /**
   * 필드 선택 이벤트
   * @param field
   * @param source
   */
  public onSelectedField(field, source) {
    // field 선택
    this.selectedField = field;
    // 데이터소스 선택
    this.selectedSource = source;
    // detect changes
    this.changeDetect.detectChanges();
    // engine 이름
    const engineName = source.engineName;
    // 메타데이터
    this._setMetaDataField(field, source);
    // if only engine type source, get statistics and covariance
    // #728 except GEO types, not get statistics and covariance
    if (!this.isLinkedTypeSource(source) && !this.isGeoType(field)) {
      // 통계 조회
      if ((this.selectedField.role === 'TIMESTAMP' && !this.statsData.hasOwnProperty('__time'))
        || (this.selectedField.role !== 'TIMESTAMP' && !this.statsData.hasOwnProperty(field.name))) {

        // 로딩 show
        this.loadingShow();

        this.getFieldStats(field, engineName)
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
            this.getHistogramChart(this.selectedField.role);
          })
          .catch((error) => {
            Alert.error(error.message);
            // 로딩 hide
            this.loadingHide();
          });
      } else {
        // 히스토그램 차트
        this.getHistogramChart(this.selectedField.role);
      }

      // covariance 조회
      if (field.role === 'MEASURE' && !this.covarianceData.hasOwnProperty(field.name)) {
        // 로딩 show
        this.loadingShow();

        this.getFieldCovariance(field, engineName)
          .then((covariance) => {
            this.covarianceData[field.name] = covariance;
            // 로딩 hide
            this.loadingHide();

            // covariance 차트
            this.getCovarianceChart(engineName);
          })
          .catch((error) => {
            Alert.error(error.message);
            // 로딩 hide
            this.loadingHide();
          });
      } else if (field.role === 'MEASURE' && this.covarianceData.hasOwnProperty(field.name)) {
        // covariance 차트
        this.getCovarianceChart(engineName);
      }
    }
  }

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
    if (this.srchText) {
      result = result.filter((field) => {
        if (field.name.toLowerCase().includes(this.srchText.toLowerCase().trim())) {
          return field;
        }
      });
    }

    return result;
  }

  // noinspection JSMethodCanBeStatic
  /**
   * 데이터소스에 메타데이터가 존재하는지
   * @param {Datasource} source
   * @returns {boolean}
   */
  public isExistMetaData(source: Datasource): boolean {
    return source.hasOwnProperty('uiMetaData');
  }

  /**
   * 데이터소스 목록에 메타데이터가 하나라도 존재하는지
   * @returns {boolean}
   */
  public isEnableSecondHeader(): boolean {
    return this.joinDataSources.some(source => this.isExistMetaData(source));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Dashboard Info Layer
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Role 문자열 생성
   * @returns {string}
   */
  public getRoleStr(): string {
    let roleStr: string = '';
    if (this.roles['TIMESTAMP']) {
      roleStr += `${this.roles['TIMESTAMP']} Timestamps`;
    }
    if (this.roles['DIMENSION']) {
      ('' !== roleStr) && (roleStr += ' / ');
      roleStr += `${this.roles['DIMENSION']} Dimensions`;
    }
    if (this.roles['MEASURE']) {
      ('' !== roleStr) && (roleStr += ' / ');
      roleStr += `${this.roles['MEASURE']} Measures`;
    }
    return roleStr;
  } // function - getRoleStr

  /**
   * 데이터소스 개수 반환
   * @returns {number}
   */
  public getDatasourceCnt(): number {
    const dsInfo: Dashboard = <Dashboard>this.source;
    return dsInfo.dataSources.length;
  } // function - getDatasourceCnt

  /**
   * 데이터 소스 이름
   * @returns {string}
   */
  public getDatasourceNames(): string {
    const dsInfo: Dashboard = <Dashboard>this.source;
    if (dsInfo.dataSources.length > 0) {
      let names = this.mainDatasource.name;
      if (dsInfo.dataSources.length > 1) {
        names += ` and ${dsInfo.dataSources.length - 1} more`;
      }
      return names;
    }
    return '';
  } // function - getDastasourceNames

}
