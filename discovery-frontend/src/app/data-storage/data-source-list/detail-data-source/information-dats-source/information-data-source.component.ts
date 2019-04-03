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
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '../../../../common/component/abstract-popup.component';
import {ConnectionType, Datasource, Field, SourceType, Status} from '../../../../domain/datasource/datasource';
import {SetWorkspacePublishedComponent} from '../../../component/set-workspace-published/set-workspace-published.component';
import {DatasourceService} from '../../../../datasource/service/datasource.service';
import {QueryDetailComponent} from './component/query-detail/query-detail.component';
import {BatchHistoryComponent} from './component/batch-history/batch-history.component';
import {MomentDatePipe} from '../../../../common/pipe/moment.date.pipe';
import * as _ from 'lodash';
import {GranularityType} from '../../../../domain/workbook/configurations/field/timestamp-field';
import {StringUtil} from '../../../../common/util/string.util';
import {ConfirmModalComponent} from "../../../../common/component/modal/confirm/confirm.component";
import {Modal} from "../../../../common/domain/modal";
import {Alert} from "../../../../common/util/alert.util";
import { IngestionLogComponent } from './component/ingestion-log/ingestion-log.component';
import { CommonUtil } from '../../../../common/util/common.util';
import {Metadata} from "../../../../domain/meta-data-management/metadata";

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

  // ingestion detail comp
  @ViewChild(IngestionLogComponent)
  private _ingestionLogComp: IngestionLogComponent;

  @ViewChild('histogram')
  private histogram: ElementRef;

  @ViewChild(ConfirmModalComponent)
  private confirmModal: ConfirmModalComponent;

  @Output('updateDatasource')
  private _updateDatasource: EventEmitter<any> = new EventEmitter();

  @Output()
  public changeDatasource: EventEmitter<any> = new EventEmitter();

  @Input()
  public isShowModifiedGuideMessage: boolean;

  // scope types
  private ingestionScopeTypeList: any[];
  // batch types
  private ingestionBatchTypeList: any[];
  // week date types
  private dateType: any[];

  // 차트 옵션
  private barOption: any;

  // ingestionProgress
  private _ingestionProgress: any;
  // expiration time list
  private _expirationTimeList: any[] = [];

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

  @Input()
  public ingestionProcess: any;

  @Input()
  public isNotShowProgress: boolean;

  @Input()
  public historyId: string;

  @Output()
  public confirm = new EventEmitter;

  @Input()
  public timestampColumn: Field;

  @Input()
  public metaData: Metadata;

  // source description edit flag
  public isEditSourceDescription: boolean = false;
  // advanced setting show flag
  public isShowAdvancedSetting: boolean = false;

  // process step
  public ingestionProcessStatusStep: number = 0;

  // partitionKeyList
  public partitionKeyList: string[];

  // description
  public descriptionChangeText: string;

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
    // set partition key list
    this.partitionKeyList = this._getPartitionKeyLabels();
    // Linked 소스가 아니고 enabled 일때 timestamp 필드가 있는 경우에만 stats 조회하기
    if (!this.isLinkedSource() && this.isEnabled() && this.timestampColumn) {
      this._getFieldStats(this.timestampColumn.name, this.datasource.engineName);
    }
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  // Change
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.ingestionProcess) {
      // 최초 접근시 status가 ENABLED라면 process hide
      if (!changes.ingestionProcess.previousValue && this.datasource && this.datasource.status === Status.ENABLED) {
        this.isNotShowProgress = true;
      } else if (changes.ingestionProcess.currentValue) { // if changed data
        // set _ingestionProgress
        this._ingestionProgress = changes.ingestionProcess.currentValue;
        // set process status
        this._setProcessStatus(changes.ingestionProcess.currentValue);
        // if success ingestion
        if (changes.ingestionProcess.currentValue['message'] === 'END_INGESTION_JOB') {
          this._getFieldStats(this.timestampColumn.name, this.datasource.engineName);
        }
      }
    }
    // when hide source name edit, if edit desc mode, set show modified guide message
    if (changes.isShowModifiedGuideMessage && !changes.isShowModifiedGuideMessage.currentValue && this.isEditSourceDescription) {
      this.isShowModifiedGuideMessage = true;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Enable edit datasource description
   */
  public enableEditDescription(): void {
    this.isEditSourceDescription = true;
    // set show modified guide message
    this.isShowModifiedGuideMessage = true;
    // set desc text
    this.descriptionChangeText = this.datasource.description;
  }

  /**
   * Get converted datasource description
   * @return {string}
   */
  public getConvertedSourceDescription(): string {
    return StringUtil.isEmpty(this.datasource.description) ? this.translateService.instant('msg.storage.ui.none.source.desc') : this.datasource.description.replace(/\r\n|\n/gi, '<br>');
  }

  /**
   * Update datasource description
   */
  public updateSourceDescription(): void {
    // 설명 길이 체크
    if (CommonUtil.getByte(this.descriptionChangeText.trim()) > 450) {
      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      return;
    }
    this.isEditSourceDescription = false;
    // set hide modified guide message
    this.isShowModifiedGuideMessage = false;
    // update
    this._updateDatasource.emit({description: this.descriptionChangeText.trim()});
  }

  /**
   * Click description outside
   * @param {MouseEvent} event
   */
  public onClickDescriptionOutside(event: MouseEvent): void {
    !$(event.relatedTarget).hasClass('ddp-box-btn') && this.updateSourceDescription();
  }

  /**
   * ingestion details click event
   */
  public onClickIngestionDetails(): void {
    this._ingestionLogComp.init(this.datasource.id, this.historyId, this._ingestionProgress);
  }

  /**
   * Link master data click event
   */
  public onClickLinkMasterData(): void {
    this.router.navigate([`/management/metadata/metadata/${this.metaData.id}`]).then();
  }

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
    return CommonUtil.formatBytes(bytes, 2);
  };

  /**
   * Get master data information
   * @param {SourceType} type
   * @returns {string}
   */
  public getMasterDataInfo(type: SourceType): string {
    switch (type) {
      case SourceType.IMPORT:
        return this.translateService.instant('msg.storage.li.druid');
      case SourceType.FILE:
        return this.translateService.instant('msg.storage.li.file');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db') + `(${this.getConnectionTypeLabel(this.getConnection.implementor)})`;
      case SourceType.HIVE:
        return this.translateService.instant('msg.storage.li.hive');
      case SourceType.REALTIME:
        return this.translateService.instant('msg.storage.li.stream');
      case SourceType.SNAPSHOT:
        return this.translateService.instant('msg.storage.li.ss');
    }
  }

  /**
   * Get connection type label
   * @param {string} implementor
   * @returns {string}
   */
  public getConnectionTypeLabel(implementor: string): string {
    return (this.getEnabledConnectionTypes().find((type) => type.value === implementor) || {label: implementor}).label;
  }

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
   * get connection
   * @returns {any}
   */
  public get getConnection(): any {
    return this.datasource.connection || this.datasource.ingestion.connection;
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
   * ingestion period 객체
   * @returns {any}
   */
  public get getIngestionPeriod(): any {
    return this.getIngestion.period;
  }

  /**
   * Get ingestion expired
   * @returns {string}
   */
  public getIngestionExpired(): string {
    return this._expirationTimeList.find(obj => obj.value === this.getIngestion.expired).label;
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
    // data range 가 있다면
    if (this.getIngestion.intervals) {
      return this.getIngestion.intervals[0].split('/').join(' ~ ').replace(/T/g, ' ');
    }
    return this.translateService.instant('msg.storage.ui.set.false');
  }

  /**
   * 데이터 소스 status class
   * @returns {string}
   */
  public getSourceStatusClass(status: Status): string {
    switch (status) {
      case Status.ENABLED:
        return 'ddp-enabled';
      case Status.PREPARING:
        return'ddp-preparing';
      case Status.DISABLED:
        return 'ddp-disabled';
      case Status.FAILED:
        return 'ddp-fail';
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
   * Get partition key label list
   * @returns {string[]}
   * @private
   */
  private _getPartitionKeyLabels(): string[] {
    // if exist partition keys in ingestion data
    if (this.getIngestion && this.getIngestion.partitions && this.getIngestion.partitions.length !== 0) {
      return this.getIngestion.partitions.reduce((array, partition) => {
        array.push(Object.keys(partition).reduce((line, key) => {
          StringUtil.isNotEmpty(partition[key]) && (line += line === '' ? `${key}=${partition[key]}` : `/${key}=${partition[key]}`);
          return line;
        }, ''));
        return array;
      }, []);
    } else { // if not exist partition keys
      return [this.translateService.instant('msg.storage.ui.set.false')];
    }
  }

  /**
   * Set process status
   * @param {any} processData
   * @private
   */
  private _setProcessStatus(processData: any): void {
    switch (processData.message) {
      // 데이터 준비
      case 'START_INGESTION_JOB':
      case 'PREPARATION_HANDLE_LOCAL_FILE':
      case 'PREPARATION_LOAD_FILE_TO_ENGINE':
        this.ingestionProcessStatusStep = 1;
        break;
      // 엔진 적재
      case 'ENGINE_INIT_TASK':
      case 'ENGINE_RUNNING_TASK':
        this.ingestionProcessStatusStep = 2;
        break;
      // 상태 확인
      case 'ENGINE_REGISTER_DATASOURCE':
        this.ingestionProcessStatusStep = 3;
        break;
      // 완료
      case 'END_INGESTION_JOB':
        this.ingestionProcessStatusStep = 4;
        break;
      // 실패
      case 'FAIL_INGESTION_JOB':
        break;
    }
  }

  /**
   * Set expiration time list
   * @param {Array} expirationTimeList
   * @private
   */
  private _setExpirationTimeList(expirationTimeList: any[]): void {
    const TIME = 1800;
    for (let i = 1; i < 49; i++) {
      if (i === 1) {
        expirationTimeList.push({label: this.translateService.instant('msg.storage.li.dsource.expire-minutes',{minute:30}), value: TIME});
      } else{
        expirationTimeList.push (i % 2 === 0
          ? {label: this.translateService.instant('msg.storage.li.dsource.expire-hour',{hour: i / 2}), value: TIME * i}
          : {label: this.translateService.instant('msg.storage.li.dsource.expire-hour-minutes',{hour: Math.floor(i / 2), minute:30}), value: TIME * i});
      }
    }
  }

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
    // init expiration time list
    this._setExpirationTimeList(this._expirationTimeList);

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
