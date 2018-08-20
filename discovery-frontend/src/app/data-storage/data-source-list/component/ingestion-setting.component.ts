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

import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, Output } from '@angular/core';
import { DatasourceInfo } from '../../../domain/datasource/datasource';
import * as _ from 'lodash';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { StringUtil } from '../../../common/util/string.util';
import { Alert } from '../../../common/util/alert.util';

@Component({
  selector: 'ingestion-setting',
  templateUrl: './ingestion-setting.component.html'
})
export class IngestionSettingComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  private _sourceData: DatasourceInfo;

  // 저장단위 목록
  private _granularityList: any[] = [
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-none'), value: 'NONE' },
    // { label: this.translateService.instant('msg.storage.li.dsource.granularity-second'), value: 'SECOND' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-minute'), value: 'MINUTE' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-hour'), value: 'HOUR' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-day'), value: 'DAY' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-month'), value: 'MONTH' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-year'), value: 'YEAR' }
  ];
  // 스코프 타입 목록
  private _scopeTypeList: any[] = [
    { label: this.translateService.instant('msg.storage.th.dsource.scope-incremental'), value: 'INCREMENTAL' },
    { label: this.translateService.instant('msg.storage.th.dsource.scope-all'), value: 'ALL' },
    { label: this.translateService.instant('msg.storage.th.dsource.scope-row'), value: 'ROW' }
  ];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성 타입
  public createType: string;

  // roll up 목록
  public rollUpTypeList: any[];
  // 선택한 roll up
  public selectedRollUpType: any;

  // 데이터 범위 타입 목록
  public dataRangeTypeList: any[];
  // 선택한 데이터 범위 타입
  public selectedDataRangeType: any;

  // 파티션 타입 목록
  public partitionTypeList: any[];
  // 선택한 파티션 타입
  public selectedPartitionType: any;

  // segment Granularity 목록
  public segmentGranularityList: any[];
  // 선택한 segment Granularity
  public selectedSegmentGranularity: any;
  // segement Granularity 목록 show flag
  public isShowSegmentGranularityList: boolean = false;

  // query Granularity 목록
  public queryGranularityList: any[];
  // 선택한 query Granularity
  public selectedQueryGranularity: any;
  // query Granularity 목록 show flag
  public isShowQueryGranularityList: boolean = false;

  // expiration 목록
  public expirationTimeList: any[];
  // 선택한 expiration
  public selectedExpirationTime: any;
  // expiration 목록 show flag
  public isShowExpirationTimeList: boolean = false;

  // ingestion 수집방식 목록
  public ingestionTypeList: any[];
  // 선택한 ingestion 수집방식
  public selectedIngestionType: any;

  // ingestion 수집방식 scope 목록
  public ingestionScopeTypeList: any[];
  // 선택한 ingestion 수집방식 scope 목록
  public selectedIngestionScopeType: any;

  // 배치주기 목록
  public batchTypeList: any[];
  // 선택한 배치주기
  public selectedBatchType: any;

  // 배치주기 목록 show flag
  public isShowBatchTypeList: boolean = false;

  // 시간 목록
  public hourList: any[] = [];
  // 선택한 시간
  public selectedHour: any;
  // 시간 목록 show flag
  public isShowHourList: boolean = false;

  // 분 목록
  public minuteList: any[] = [];
  // 선택한 분
  public selectedMinute: any;
  // 분 목록 show flag
  public isShowMinuteList: boolean = false;

  // 선택한 초
  public selectedDailyTime: string;

  // 일 목록
  public dateList: any[];
  // 일 목록 show flag
  public isShowDateList: boolean = false;
  // 선택한 일의 초
  public selectedWeeklyTime: string;

  // cron text
  public cronText: string;
  // cron validation result
  public cronValidationResult: boolean;
  // cron validation result message
  public cronValidationMessage: string;

  // row
  public ingestionOnceRow: number = 10000;
  public ingestionPeriodRow: number = 10000;

  // advanced settings
  public tuningConfig: any[];
  public jobProperties: any[];


  // step change
  @Output()
  public prevStep: EventEmitter<any> = new EventEmitter();
  @Output()
  public nextStep: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _dataSourceService: DatasourceService,
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
   * init
   * @param {DatasourceInfo} sourceData
   */
  public init(sourceData: DatasourceInfo, createType: string): void {
    // ui init
    this._initView();
    // 생성될 데이터소스 정보
    this._sourceData = sourceData;
    // 생성 타입
    this.createType = createType;
    // 현재 페이지에 ingestion 정보가 있다면
    if (this._sourceData.hasOwnProperty("ingestionData")) {
      this._loadIngestionData(this._sourceData.ingestionData);
    } else {
      this._setDefaultIngestionOption();
    }
  }

  /**
   * cron validation check
   */
  public cronValidation(): void {
    // cron 이 빈값이면
    if (StringUtil.isEmpty(this.cronText)) {
      // result fail
      this.cronValidationResult = false;
      this.cronValidationMessage = this.translateService.instant('msg.storage.ui.cron.empty');
      return;
    }
    // 로딩 show
    this.loadingShow();
    this._dataSourceService.checkValidationCron({expr: this.cronText})
      .then((result) => {
        // validation 결과
        this.cronValidationResult = result.valid;
        // 만약 실패라면
        if (!result.valid) {
          this.cronValidationMessage = this.translateService.instant('msg.storage.ui.cron.description');
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
        // result fail
        this.cronValidationResult = false;
      });
  }

  /**
   * 데이터소스 연결 타입
   * @returns {string}
   */
  public getConnectionType(): string {
    return this._sourceData.connectionData.connType;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이전 클릭 이벤트
   */
  public onClickPrev(): void {
    // 기존 스키마 정보가 있다면 삭제
    this._sourceData.hasOwnProperty('ingestionData') && (delete this._sourceData.ingestionData);
    // 현재 페이지 스키마 수정정보 저장
    this._saveIngestionData(this._sourceData);
    // 이전 스탭으로 이동
    this.prevStep.emit();
  }

  /**
   * 다음 클릭 이벤트
   */
  public onClickNext(): void {
    // 다음화면으로 넘어갈 수 있는지
    if (this._isEnableNext()) {
      // 기존 스키마 정보가 있다면 삭제
      this._sourceData.hasOwnProperty('ingestionData') && (delete this._sourceData.ingestionData);
      // 현재 페이지 스키마 수정정보 저장
      this._saveIngestionData(this._sourceData);
      // 다음 스탭으로 이동
      this.nextStep.emit();
    } else {
      Alert.error(this.translateService.instant('msg.comm.alert.error'));
    }
  }

  /**
   * Query Granularity 변경 이벤트
   * @param granularity
   */
  public onChangeQueryGranularity(granularity: any): void {
    this.selectedQueryGranularity = granularity;
  }

  /**
   * Segement Granularity 변경 이벤트
   * @param granularity
   */
  public onChangeSegmentGranularity(granularity: any): void {
    this.selectedSegmentGranularity = granularity;
    // 목록 갱신
    this._updateQueryGranularityList(granularity);
    // 선택한 query granularity 가 query granularity 목록에 존재하지 않는경우 query granularity를 기본 값으로 수정
    if (_.every(this.queryGranularityList, item => item.value !== this.selectedQueryGranularity.value)) {
      this.selectedQueryGranularity = this.queryGranularityList[0];
    }
  }

  /**
   * 롤 업 타입 변경 이벤트
   * @param rollUp
   */
  public onChangeRollUpType(rollUp: any): void {
    this.selectedRollUpType = rollUp;
  }

  /**
   * 데이터 범위 타입 변경 이벤트
   * @param dataRangeType
   */
  public onChangeDataRangeType(dataRangeType: any): void {
    this.selectedDataRangeType = dataRangeType;
  }

  /**
   * 파티션 타입 변경 이벤트
   * @param partitionType
   */
  public onChangePartitionType(partitionType: any): void {
    this.selectedPartitionType = partitionType;
  }

  /**
   * expiration time 변경 이벤트
   * @param expirationTime
   */
  public onChangeExpirationTime(expirationTime: any): void {
    this.selectedExpirationTime = expirationTime;
  }

  /**
   * ingestion 수집방식 변경 이벤트
   * @param ingestionType
   */
  public onChangeIngestionType(ingestionType: any): void {
    // 선택한 타입이 다를 경우에만 작동
    if (this.selectedIngestionType !== ingestionType) {
      this.selectedIngestionType = ingestionType;
      // 스코프 타입 목록 갱신
      this._updateIngestionScopeTypeList(ingestionType);
      // scope 타입 초기화
      this.selectedIngestionScopeType = this.ingestionScopeTypeList[0];
    }
  }

  /**
   * ingestion 스코프 변경 이벤트
   * @param scopeType
   */
  public onChangeIngestionScopeType(scopeType: any): void {
    this.selectedIngestionScopeType = scopeType;
  }

  /**
   * 배치주기 선택 이벤트
   * @param type
   */
  public onSelectBatchType(type: any): void {
    this.selectedBatchType = type;
  }

  /**
   * 시간 선택 이벤트
   * @param hour
   */
  public onSelectHour(hour: any): void {
    this.selectedHour = hour;
  }

  /**
   * 분 선택 이벤트
   * @param minute
   */
  public onSelectMinute(minute: any): void {
    this.selectedMinute = minute;
  }

  /**
   * 일 선택 이벤트
   * @param date
   */
  public onSelectDate(date: any): void {
    date.checked = !date.checked;
  }

  /**
   * cronText 엔터 이벤트
   * @param {KeyboardEvent} event
   */
  public onKeyPressCronText(event: KeyboardEvent): void {
    // 엔터인 경우에만
    event.keyCode === 13 && this.cronValidation();
  }

  /**
   * row 최댓값 체크 이벤트
   * @param {string} row
   * @param {number} value
   */
  public onCheckMaxRow(row: string, value: number): void {
    // 값 변경
    this[row] = value;
    // 만약 값이 10000이 넘는다면 10000으로 고정
    if (this[row] > 10000) {
      this[row] = 10000;
    }
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
    // Segment Granularity 목록 설정
    this.segmentGranularityList = _.filter(this._granularityList, item => item.value !== 'NONE');
    this.selectedSegmentGranularity = this.segmentGranularityList[3];
    // Query Granularity 목록 설정
    this.queryGranularityList = this._granularityList;
    this.selectedQueryGranularity = this.queryGranularityList[4];
    // roll up 타입 목록
    this.rollUpTypeList = [
      { label: this.translateService.instant('msg.storage.ui.set.true'), value: true },
      { label: this.translateService.instant('msg.storage.ui.set.false'), value: false },
    ];
    this.selectedRollUpType = this.rollUpTypeList[0];
    // 데이터 범위 타입 목록
    this.dataRangeTypeList = [
      { label: this.translateService.instant('msg.storage.ui.set.disable'), value: 'DISABLE' },
      { label: this.translateService.instant('msg.storage.ui.set.enable'), value: 'ENABLE' }
    ];
    this.selectedDataRangeType = this.dataRangeTypeList[0];
    // 파티션 타입 목록
    this.partitionTypeList = [
      { label: this.translateService.instant('msg.storage.ui.set.disable'), value: 'DISABLE' },
      { label: this.translateService.instant('msg.storage.ui.set.enable'), value: 'ENABLE' }
    ];
    this.selectedPartitionType = this.partitionTypeList[0];
    // Expiration time 목록
    this.expirationTimeList = this._getExpirationTimeList();
    this.selectedExpirationTime = this.expirationTimeList[0];
    // ingestion 수집방식 목록
    this.ingestionTypeList = [
      { label: this.translateService.instant('msg.storage.th.ingest-once'), value: 'single' },
      { label: this.translateService.instant('msg.storage.th.ingest-prcdly'), value: 'batch' },
    ];
    this.selectedIngestionType = this.ingestionTypeList[0];
    // ingestion scope List
    this.ingestionScopeTypeList = this._scopeTypeList.filter(type => type.value !== 'INCREMENTAL');
    this.selectedIngestionScopeType = this.ingestionScopeTypeList[0];
    // 배치 주기
    this.batchTypeList = [
      { label: this.translateService.instant('msg.storage.li.dsource.batch-minutely'), value: 'MINUTELY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-hourly'), value: 'HOURLY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-daily'), value: 'DAILY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-weekly'), value: 'WEEKLY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-expr'), value: 'EXPR' },
    ];
    this.selectedBatchType = this.batchTypeList[0];
    // 시간 목록
    for (let i = 1; i < 24 ; i += 1) {
      this.hourList.push(i);
    }
    this.selectedHour = this.hourList[0];
    // 분 목록
    for (let i = 1; i < 60 ; i += 1) {
      this.minuteList.push(i);
    }
    this.selectedMinute = this.minuteList[0];
    // 일 목록
    this.dateList = [
      { label: this.translateService.instant('msg.storage.li.dsource.date-mon'), value: 'MON', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-tue'), value: 'TUE', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-wed'), value: 'WED', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-thu'), value: 'THU', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-fri'), value: 'FRI', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-sat'), value: 'SAT', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-sun'), value: 'SUN', checked: true }
    ];
    // 초 설정
    this.selectedWeeklyTime = this.selectedDailyTime = this._getCurrentTime();
  }

  /**
   * Query Granularity 목록 갱신
   * @param granularity
   * @private
   */
  private _updateQueryGranularityList(granularity: any): void {
    this.queryGranularityList = this._granularityList.slice(0, _.findIndex(this._granularityList, item => item.value === granularity.value) + 1)
  }

  /**
   * ingestion 스코프 타입 목록 갱신
   * @param ingestionType
   * @private
   */
  private _updateIngestionScopeTypeList(ingestionType: any): void {
    this.ingestionScopeTypeList = ingestionType.value === 'single'
      ? this._scopeTypeList.filter(type => type.value !== 'INCREMENTAL')
      : this._scopeTypeList.filter(type => type.value !== 'ROW');
  }

  /**
   * 다음 화면으로 넘어갈 수 있는지
   * @returns {boolean}
   * @private
   */
  private _isEnableNext(): boolean {
    // 타입이 데이터베이스이고 engine 형이라면
    if (this.createType === 'DB' && this.getConnectionType() === 'ENGINE' && (
        (this.selectedIngestionType.value === 'batch' && !this.ingestionPeriodRow || (this.selectedBatchType.value === 'EXPR' && !this.cronValidationResult))
        || (this.selectedIngestionType.value === 'single' && this.selectedIngestionScopeType.value === 'ROW' && !this.ingestionOnceRow)
      )) {
      return false;
    }
    // 타입이 스테이징이라면
    if (this.createType === 'STAGING') {

    }
    // 고급설정의 옵션 중 default 옵션이 비어있으면
    if (this.tuningConfig.some(item => item.defaultOpt && StringUtil.isEmpty(item.value))) {
      return false;
    }
    return true;
  }

  /**
   * Ingestion 기본 옵션 설정
   * @private
   */
  private _setDefaultIngestionOption(): void {
    // 로딩 show
    this.loadingShow();
    // TODO f#35 생성타입이 Staging인 경우에만 hadoop 전달
    this._dataSourceService.getDefaultIngestionOptions(this.createType === 'STAGING' ? 'hadoop' : 'batch')
      .then((result) => {
        // 로딩 hide
        this.loadingHide();
        // result
        this.tuningConfig = result.filter(item => item.type === 'TUNING').map((item) => {
          return {key: item.name, value: item.defaultValue, defaultOpt: true};
        });
        this.jobProperties = result.filter(item => item.type === 'JOB').map((item) => {
          return {key: item.name, value: item.defaultValue, defaultOpt: true};
        });
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * expiration 시간 목록
   * @returns {Array}
   * @private
   */
  private _getExpirationTimeList() {
    const result = [];
    const TIME = 1800;
    for (let i = 1; i < 49; i++) {
      if (i === 1) {
        result.push({label: this.translateService.instant('msg.storage.li.dsource.expire-minutes',{minute:30}), value: TIME});
      } else{
        result.push (i % 2 === 0
          ? {label: this.translateService.instant('msg.storage.li.dsource.expire-hour',{hour: i / 2}), value: TIME * i}
          : {label: this.translateService.instant('msg.storage.li.dsource.expire-hour-minutes',{hour: Math.floor(i / 2), minute:30}), value: TIME * i});
      }
    }
    return result;
  }

  /**
   * 현재 시간
   * @returns {string}
   * @private
   */
  private _getCurrentTime(): string {
    // date 현재시각
    const date = new Date();
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  }

  /**
   * ingestion 데이터 불러오기
   * @param ingestionData
   * @private
   */
  private _loadIngestionData(ingestionData:any): void {
    // 선택한 Segment Granularity
    this.selectedSegmentGranularity = ingestionData.selectedSegmentGranularity;
    // Query Granularity 목록 갱신
    this._updateQueryGranularityList(this.selectedSegmentGranularity);
    // 선택한 Query Granularity
    this.selectedQueryGranularity = ingestionData.selectedQueryGranularity;
    // 선택한 롤업 타입
    this.selectedRollUpType = ingestionData.selectedRollUpType;
    // tuning configuration
    this.tuningConfig = ingestionData.tuningConfig;
    // 데이터베이스
    if (this.createType === 'DB') {
      // 선택한 expiration 타임
      this.selectedExpirationTime = ingestionData.selectedExpirationTime;
      // 선택한 ingestion 타입
      this.selectedIngestionType = ingestionData.selectedIngestionType;
      // 스코프 타입 목록 갱신
      this._updateIngestionScopeTypeList(this.selectedIngestionType);
      // 선택한 scope 타입
      this.selectedIngestionScopeType = ingestionData.selectedIngestionScopeType;
      // 선택한 배치 주기
      this.selectedBatchType = ingestionData.selectedBatchType;
      // 선택한 시간
      this.selectedHour = ingestionData.selectedHour;
      // 선택한 분
      this.selectedMinute = ingestionData.selectedMinute;
      // 일 목록
      this.dateList = ingestionData.dateList;
      // 초 설정
      this.selectedWeeklyTime = ingestionData.selectedWeeklyTime;
      this.selectedDailyTime = ingestionData.selectedDailyTime;
      // row
      this.ingestionOnceRow = ingestionData.ingestionOnceRow;
      this.ingestionPeriodRow = ingestionData.ingestionPeriodRow;
    }
    // 스테이징
    if (this.createType === 'STAGING') {
      // 선택한 데이터 범위 타입
      this.selectedDataRangeType = ingestionData.selectedDataRangeType;
      // 선택한 파티션 타입
      this.selectedPartitionType = ingestionData.selectedPartitionType;
      // job properties
      this.jobProperties = ingestionData.jobProperties;
    }
  }

  /**
   * 현재 페이지의 ingestion 데이터 저장
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveIngestionData(sourceData: DatasourceInfo): void {
    sourceData['ingestionData'] = {
      // 선택한 Segment Granularity
      selectedSegmentGranularity : this.selectedSegmentGranularity,
      // 선택한 Query Granularity
      selectedQueryGranularity : this.selectedQueryGranularity,
      // 선택한 롤업 타입
      selectedRollUpType : this.selectedRollUpType,
      // tuning configuration
      tuningConfig : this.tuningConfig
    };
    // 데이터베이스
    if (this.createType === 'DB') {
      // 선택한 expiration 타임
      sourceData['ingestionData'].selectedExpirationTime = this.selectedExpirationTime;
      // 선택한 ingestion 타입
      sourceData['ingestionData'].selectedIngestionType = this.selectedIngestionType;
      // 선택한 scope 타입
      sourceData['ingestionData'].selectedIngestionScopeType = this.ingestionScopeTypeList[0];
      // 선택한 배치 주기
      sourceData['ingestionData'].selectedBatchType = this.selectedBatchType;
      // 선택한 시간
      sourceData['ingestionData'].selectedHour = this.selectedHour;
      // 선택한 분
      sourceData['ingestionData'].selectedMinute = this.selectedMinute;
      // 일 목록
      sourceData['ingestionData'].dateList = this.dateList;
      // 초 설정
      sourceData['ingestionData'].selectedWeeklyTime = this.selectedWeeklyTime;
      sourceData['ingestionData'].selectedDailyTime = this.selectedDailyTime;
      // row 설정
      sourceData['ingestionData'].ingestionOnceRow = this.ingestionOnceRow;
      sourceData['ingestionData'].ingestionPeriodRow = this.ingestionPeriodRow;
    }
    // 스테이징
    if (this.createType === 'STAGING') {
      // 선택한 데이터 범위 타입
      sourceData['ingestionData'].selectedDataRangeType = this.selectedDataRangeType;
      // 선택한 파티션 타입
      sourceData['ingestionData'].selectedPartitionType = this.selectedPartitionType;
      // job properties
      sourceData['ingestionData'].jobProperties = this.jobProperties;
    }
  }
}
