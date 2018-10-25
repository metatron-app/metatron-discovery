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
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import {
  ConnectionType,
  Datasource,
  Field,
  FieldRole,
  SourceType,
  Status
} from '../../../../domain/datasource/datasource';
import { SetWorkspacePublishedComponent } from '../../../component/set-workspace-published/set-workspace-published.component';
import { DatasourceService } from '../../../../datasource/service/datasource.service';
import { QueryDetailComponent } from './component/query-detail/query-detail.component';
import { BatchHistoryComponent } from './component/batch-history/batch-history.component';
import { MomentDatePipe } from '../../../../common/pipe/moment.date.pipe';
import * as _ from 'lodash';
import { GranularityType } from '../../../../domain/workbook/configurations/field/timestamp-field';
import { StringUtil } from '../../../../common/util/string.util';
import {ConfirmModalComponent} from "../../../../common/component/modal/confirm/confirm.component";
import {Modal} from "../../../../common/domain/modal";
import {Alert} from "../../../../common/util/alert.util";

declare let echarts: any;

@Component({
  selector: 'information-data-source',
  templateUrl: './information-data-source.component.html',
  providers: [MomentDatePipe]
})
export class InformationDataSourceComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 지정 페이지
  @ViewChild(SetWorkspacePublishedComponent)
  private setWorkspaceComponent: SetWorkspacePublishedComponent;

  // 쿼리 디테일 페이지
  @ViewChild(QueryDetailComponent)
  private queryDetailComponent: QueryDetailComponent;

  // 배치 히스토리 페이지
  @ViewChild(BatchHistoryComponent)
  private batchHistoryComponent: BatchHistoryComponent;

  @ViewChild('histogram')
  private histogram: ElementRef;

  @ViewChild(ConfirmModalComponent)
  private confirmModal: ConfirmModalComponent;

  @Output()
  public changeDatasource: EventEmitter<any> = new EventEmitter();

  // scope types
  private ingestionScopeTypeList: any[];
  // batch types
  private ingestionBatchTypeList: any[];
  // week date types
  private dateType: any[];

  // 차트 옵션
  private barOption: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  @Input()
  public mode: string;

  @Input()
  public datasource: Datasource;

  @Output()
  public confirm = new EventEmitter;

  // 리스트 flag
  public detailFl: boolean = false;
  // advanced setting show flag
  public isShowAdvancedSetting: boolean = false;

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
    this.initView();
    // Linked 소스가 아니고 enabled 일때 timestamp 필드가 있는 경우에만 stats 조회하기
    !this.isLinkedSource() && this.isEnabled() && this._getFindIndexTimestampField() !== -1 && this._getFieldStats(this.getFields[this._getFindIndexTimestampField()].name, this.datasource.engineName);
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
   * 확인모달 오픈 요청
   * @param {string} type
   */
  public confirmModalEvent(type: string): void {
    this.confirm.emit(type);
  }

  /**
   * 데이터소스에 연결된 워크스페이스 업데이트
   * @param data
   */
  public updateWorkspaces(data) {
    this.datasource.linkedWorkspaces = data;
  }

  /**
   * 워크스페이스 연결 모달 오픈
   */
  public setWorkspaceOpen() {
    this.setWorkspaceComponent.init('datasource', 'update', this.datasource.id);
    // 마크업 위치 변경
    $('#set-workspace-modal').appendTo($('#layout-contents'));
  }

  // 쿼리 detail 페이지 오픈
  public queryDetailOpen() {
    this.queryDetailComponent.init(this.datasource.ingestion.query);
  }

  // batch history 페이지 오픈
  public batchHistoryOpen() {
    this.batchHistoryComponent.init(this.datasource.id);

    // 마크업 위치 변경
    $('#batch-history-modal').appendTo($('#layout-contents'));
  }

  /**
   * convert file size
   * @param bytes
   * @returns {any}
   */
  public bytesToSize(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const data = bytes / Math.pow(1024, i);
    return data.toFixed(2) + ' ' + sizes[i];
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커넥션 타입
   * @returns {ConnectionType}
   */
  public get getConnType() {
    return this.datasource.connType;
  }

  /**
   * source Type
   * @returns {SourceType}
   */
  public get getSrcType() {
    return this.datasource.srcType;
  }

  /**
   * summary
   * @returns {any}
   */
  public get getSummary() {
    return this.datasource.summary;
  }

  /**
   * ingestion
   * @returns {any}
   */
  public get getIngestion() {
    return this.datasource.ingestion;
  }

  /**
   * granularity
   * @returns {GranularityType}
   */
  public get getGranularity(): GranularityType {
    return this.datasource.granularity;
  }

  /**
   * segment granularity
   * @returns {GranularityType}
   */
  public get getSegGranularity(): GranularityType {
    return this.datasource.segGranularity;
  }

  /**
   * 워크스페이스 공개여부
   * @returns {boolean}
   */
  public get getPublished(): boolean {
    return this.datasource.published;
  }

  /**
   * 현재 데이터소스에 연결된 워크스페이스 수
   * @returns {number}
   */
  public get getLinkedWorkspaces(): number {
    return this.datasource.linkedWorkspaces;
  }

  /**
   * ingestion 스태이징 db source
   * @returns {string}
   */
  public get getStagingDbSource(): string {
    return this.getIngestion.source;
  }

  /**
   * ingestion 포맷
   * @returns {string}
   */
  public get getFormat() {
    return this.getIngestion.format;
  }

  /**
   * ingestion connection
   * @returns {any}
   */
  public get getConnection(): any {
    return this.getIngestion.connection;
  }

  /**
   * ingestion data type
   * @returns {string}
   */
  public get getIngestionDataType(): string {
    return this.getIngestion.dataType;
  }

  /**
   * ingestion query
   * @returns {string}
   */
  public get getIngestionTableOrQuery(): string {
    return this.getIngestion.query;
  }

  /**
   * intestion database
   * @returns {string}
   */
  public get getIngestionDatabase(): string {
    return this.getIngestion.database;
  }

  /**
   * ingestion type
   * @returns {string}
   */
  public get getIngestionType(): string {
    return this.getIngestion.type;
  }

  /**
   * ingestion size
   * @returns {number}
   */
  public get getIngestionSize(): number {
    return this.getIngestion.size;
  }

  /**
   * ingestion period 객체
   * @returns {any}
   */
  public get getIngestionPeriod(): any {
    return this.getIngestion.period;
  }

  /**
   * ingestion expired
   * @returns {number}
   */
  public get getIngestionExpired(): number {
    return this.getIngestion.expired;
  }

  /**
   * scope label
   * @returns {string}
   */
  public getIngestionScopeLabel(): string {
    return this.ingestionScopeTypeList.filter((type) => {
      return type.value === this.getIngestionScope();
    })[0].label;
  }

  /**
   * batch label
   * @returns {string}
   */
  public getIngestionBatchLabel(): string {
    return this.ingestionBatchTypeList.filter((type) => {
      return type.value === this.getIngestionPeriod.frequency;
    })[0].label;
  }

  /**
   * batch week label
   * @returns {string}
   */
  public get getIngestionBatchWeekLabel(): string {
    return this.getIngestionPeriod.weekDays.toString();
  }

  /**
   * data range label
   * @returns {string}
   */
  public getDataRangeLabel(): string {
    const range = this.getIngestion.intervals;
    // data range 가 있다면
    if (range) {
      return range[0].split('/').join(' ~ ').replace(/T/g, ' ');
    }
    return 'None';
  }

  /**
   * TODO partition keys label
   * @returns {string}
   */
  public getPartitionKeys(): string {
    const partitions = this.getIngestion.partitions;
    // data range 가 있다면
    if (partitions.length !== 0) {
      return '';
    }
    return 'None';
  }

  /**
   * 데이터 소스 status
   * @returns {string}
   */
  public getSourceStatus(datasource: Datasource): string {
    const status = datasource.status;
    switch (status) {
      case Status.ENABLED:
        return 'Enabled';
      case Status.PREPARING:
        return'Preparing';
      case Status.DISABLED:
        return 'Disabled';
      case Status.FAILED:
        return 'Failed';
    }
  }

  /**
   * 데이터 소스 status description
   * @param {Datasource} datasource
   * @returns {string}
   */
  public getSourceStatusDesc(datasource: Datasource): string {
    const status = datasource.status;
    switch (status) {
      case Status.ENABLED:
        return this.translateService.instant('msg.storage.ui.available.engine');
      case Status.PREPARING:
        return this.translateService.instant('msg.storage.ui.source.preparing');
      case Status.FAILED:
        return this.translateService.instant('msg.storage.ui.source.fail');
      default:
        return this.translateService.instant('msg.storage.ui.unavailable.engine');
    }
  }

  /**
   * Get object key list
   * @param {Object} option
   * @returns {string[]}
   */
  public getObjectKeys(option: object): string[] {
    return _.keys(option);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * source type linked
   */
  public isLinkedSource(): boolean {
    return this.datasource.connType === ConnectionType.LINK;
  }

  /**
   * source enabled
   * @returns {boolean}
   */
  public isEnabled(): boolean {
    return this.getStatus === Status.ENABLED;
  }

  /**
   * source disabled
   * @returns {boolean}
   */
  public isDisabled(): boolean {
    return this.getStatus === Status.DISABLED;
  }

  /**
   * source failed
   * @returns {boolean}
   */
  public isFailed(): boolean {
    return this.getStatus === Status.FAILED;
  }

  /**
   * source preparing
   * @returns {boolean}
   */
  public isPreParing(): boolean {
    return this.getStatus === Status.PREPARING;
  }

  /**
   * staging db type 인지
   * @returns {boolean}
   */
  public isHiveType(): boolean {
    if (this.datasource.hasOwnProperty('srcType')) {
      return this.getSrcType === SourceType.HIVE;
    }
  }

  /**
   * FILE type 인지
   * @returns {boolean}
   */
  public isFileType(): boolean {
    if (this.datasource.hasOwnProperty('srcType')) {
      return this.getSrcType === SourceType.FILE;
    }
  }

  /**
   * JDBC type 인지
   * @returns {boolean}
   */
  public isJdbcType(): boolean {
    if (this.datasource.hasOwnProperty('srcType')) {
      return this.getSrcType === SourceType.JDBC;
    }
  }

  /**
   * Url 타입이 default라면
   * @returns {boolean}
   */
  public isDefaultType(): boolean {
    return StringUtil.isEmpty(this.getConnection.url);
  }

  public synchronizeFieldsModalOpen() {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.ui.dsource.synchronization.modal.name');
    modal.description = this.translateService.instant('msg.storage.ui.dsource.synchronization.modal.description');
    modal.isShowCancel = true;
    modal.btnName = this.translateService.instant('msg.storage.ui.dsource.synchronization.modal.btn');

    this.confirmModal.init(modal);
  }

  public confirmSynchronizeFields() {
    this.loadingShow();

    this.datasourceService.synchronizeDatasourceFields(this.datasource.id)
      .then((result) => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.storage.ui.dsource.synchronization.success'));
        this.changeDatasource.emit('information');
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /**
   * 고급 옵션이 사용 가능한 상태인지
   * @returns {boolean}
   */
  public isEnableAdvancedSettings(): boolean {
    // tuningOptions 이나 jobProperties 있고 key가 있을 경우에만 true
    if ((this.getIngestion.tuningOptions && Object.keys(this.getIngestion.tuningOptions).length)
      || (this.getIngestion.jobProperties && Object.keys(this.getIngestion.jobProperties).length)) {
      return true;
    } else {
      return false;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 히스토그램 차트 그리기
   * @param timeStats
   */
  private getHistogramChart(timeStats) {

    this.changeDetect.detectChanges();

    // 차트
    const barChart = echarts.init(this.histogram.nativeElement);
    // chart
    barChart.setOption(this.getBarOption(timeStats));
    barChart.resize();
  }

  /**
   * Bar 차트에서 쓰일 option 얻기
   * @param timeStats
   * @returns {any}
   */
  private getBarOption(timeStats: any) {
    // bar option
    const barOption = _.cloneDeep(this.barOption);

    // timestamp
    barOption.xAxis[0].data = timeStats.segments.map((item) => {
      return item.interval.split('/')[0];
    });
    barOption.series[0].data = timeStats.segments.map((item) => {
      return item.rows;
    });

    return barOption;
  }


  /**
   * 스키마 통계 얻기
   * @param selectedField
   * @param engineName
   * @private
   */
  private _getFieldStats(selectedField, engineName) {
    // 로딩 show
    this.loadingShow();
    // param
    const params = {
      dataSource: {
        name: engineName,
        type: 'default'
      },
      fields: [{name: selectedField, type: 'timestamp'}],
      userFields: []
      // TODO datasource에 커스텀필드 걸려있을 경우만 집어넣음
    };

    this.datasourceService.getFieldStats(params)
      .then((result) => {
        // histogram
        this.getHistogramChart(result[0]['__time']);
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /**
   * time stamp 필드인 index 얻기
   * @returns {number}
   * @private
   */
  private _getFindIndexTimestampField(): number {
    return _.findIndex(this.getFields, (field) => {
      return field.role === FieldRole.TIMESTAMP;
    });
  }

  /**
   * ingestion scope
   * @returns {any}
   */
  private getIngestionScope() {
    return this.getIngestionType === 'single' ? this.getIngestion.scope : this.getIngestion.range;
  }

  /**
   * status
   * @returns {Status}
   */
  private get getStatus() {
    return this.datasource.status;
  }

  /**
   * 현재 데이터소스의 필드
   * @returns {Field[]}
   */
  private get getFields(): Field[] {
    return this.datasource.fields;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   */
  private initView() {
    // ingestion scope List
    this.ingestionScopeTypeList = [
      { label: this.translateService.instant('msg.storage.th.dsource.scope-incremental'), value: 'INCREMENTAL' },
      { label: this.translateService.instant('msg.storage.th.dsource.scope-all'), value: 'ALL' },
      { label: this.translateService.instant('msg.storage.th.dsource.scope-row'), value: 'ROW' }
    ];

    // ingestion batch type List
    this.ingestionBatchTypeList = [
      { label: this.translateService.instant('msg.storage.li.dsource.batch-minutely'), value: 'MINUTELY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-hourly'), value: 'HOURLY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-daily'), value: 'DAILY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-weekly'), value: 'WEEKLY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-expr'), value: 'EXPR' },
    ];

    // date type
    this.dateType = [
      { label: this.translateService.instant('msg.storage.li.dsource.date-mon'), value: 'MON', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-tue'), value: 'TUE', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-wed'), value: 'WED', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-thu'), value: 'THU', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-fri'), value: 'FRI', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-sat'), value: 'SAT', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-sun'), value: 'SUN', checked: true }
    ];

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

  }
}
