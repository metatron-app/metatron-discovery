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
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { DatasourceInfo } from '../../../../../domain/datasource/datasource';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { Alert } from '../../../../../common/util/alert.util';
import { isUndefined } from 'util';
import JSON5 from 'json5';

@Component({
  selector: 'db-ingestion-permission',
  templateUrl: './db-ingestion-permission.component.html'
})
export class DbIngestionPermissionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  private sourceData: DatasourceInfo;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this.sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // insgetion type list
  public ingestionTypeList: any[];
  // 선택된 ingestion type
  public selectedIngestionType: any;
  // ingestion batch type list
  public ingestionBatchTypeList: any[];
  // 선택된 ingestion batch
  public selectedBatchType: any;
  // ingestion batch scope list
  public ingestionScopeTypeList: any[];
  // 선택된 ingestion scope
  public selectedScopeType: any;

  // selected segment Granularity
  public selectedSegGranularity: any;
  // selected Granularity
  public selectedGranularity: any;

  // ingestion row
  public ingestionOnceRow = 10000;
  public ingestionPeriodRow = 10000;

  // hour type
  public hourType: number[] = [];
  // 선택된 batch hour
  public selectedHour: number;
  // minute type
  public minuteType: number[] = [];
  // 선택된 batch minute
  public selectedMinute: number;
  // 선택된 batch time
  public selectedWeekTime: any;
  public selectedDayTime: any;
  // date type
  public dateType: any[] = [];

  // expiration Time list
  public expirationTimeList: any[];
  // 선택된 expiration Time
  public selectedExpirationTime: any;

  // 선택된 rollup
  public selectedRollup: boolean = true;

  // flag
  public granularShowFl: boolean = false;
  public segGranularShowFl: boolean = false;
  public expirationShowFl: boolean = false;
  public batchShowFl: boolean = false;
  public hourShowFl: boolean = false;
  public minShowFl: boolean = false;
  public dayShowFl: boolean = false;
  // cron result flag
  public cronResultFl: boolean = false;
  // advanced flag
  public advancedShowFl: boolean = false;

  // cron test
  public cronText: string = '';

  // tuning configuration
  public tuningConfig: string = '';
  // tuning validation flag
  public tuningConfigResultFl: boolean;

  // segment Granularity list
  public segGranularityList: any[];
  // Granularity list
  public granularityList: any[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
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

    // 현재 페이지 ingestion 정보가 있다면
    if (this.sourceData.hasOwnProperty('ingestionData')) {
      this.initData(this.sourceData.ingestionData);
    }
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
   * 이전 화면으로 이동
   */
  public prev() {
    // 기존 ingestion 정보 삭제후 생성
    this.deleteAndSaveIngestionData();
    // 이전 step 으로 이동
    this.step = 'db-configure-schema';
    this.stepChange.emit(this.step);
  }

  /**
   * 다음 화면으로 이동
   */
  public next() {
    // validation
    if (this.getNextValidation()) {
      // 기존 ingestion 정보 삭제후 생성
      this.deleteAndSaveIngestionData();
      // 다음 step 으로 이동
      this.step = 'db-complete';
      this.stepChange.emit(this.step);
    }
  }

  /**
   * single max row
   */
  public maxIngestionOnceRow() {
    if (this.ingestionOnceRow > 10000) {
      this.ingestionOnceRow = 10000;
    }
  }

  /**
   * batch max row
   */
  public maxIngestionPeriodRow() {
    if (this.ingestionPeriodRow > 10000) {
      this.ingestionPeriodRow = 10000;
    }
  }

  /**
   * tuning result init
   */
  public tuningResultInit() {
    this.tuningConfigResultFl = null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 setting type
   * @returns {string}
   */
  public getSettingType() : string {
    return this.isEngineType() ? this.translateService.instant('msg.storage.th.ingestion-settings') : this.translateService.instant('msg.storage.th.dsource-expire');
  }

  /**
   * granularity 목록
   * @returns {any[]}
   */
  public getGranularityList() {
    const index = this.granularityList.findIndex((type) => {
      return type.value === this.selectedSegGranularity.value;
    });

    return this.granularityList.slice(0, index + 1);
  }

  /**
   * 데이터소스 연결 타입
   * @returns {string}
   */
  public get getConnectionType(): string {
    return this.sourceData.connectionData.connType;
  }

  /**
   * 선택된 expiration
   * @returns {string}
   */
  public getSelectedExpiration(): string {
    const result = this.expirationTimeList.find(i => i.value === this.selectedExpirationTime.value);
    return result.label;
  }

  /**
   * 현재 선택된 batch type
   * @returns {string}
   */
  public getSelectedBatchType(): string {
    const result = this.ingestionBatchTypeList.find(i => i.value === this.selectedBatchType.value);
    return result.label;
  }

  /**
   * 현재 선택된 batch 시간
   * @returns {number}
   */
  public getSelectedHour(): number {
    const result = this.hourType.find(i => i === this.selectedHour);
    // 현재 선택값이 없는경우 default 값
    if (isUndefined(result)) {
      return this.hourType[0];
    }
    return result;
  }

  /**
   * 현재 선택된 batch 분
   * @returns {number}
   */
  public getSelectedMinute(): number {
    const result = this.minuteType.find(i => i === this.selectedMinute);
    // 현재 선택값이 없는경우 default 값
    if (isUndefined(result)) {
      return this.minuteType[0];
    }
    return result;
  }

  /**
   * TODO 현재 선택된 요일 수
   * @returns {string}
   */
  // public getSelectedWeek(): string {
  //   const dateLength = this.dateType.filter((date) => {
  //     return date.checked;
  //   }).length;
  //   const result = dateLength === 0 ? 'msg.storage.btn.sel.day' : dateLength + ' 일';
  //   return resultLength === 0 ? '요일 선택' : resultLength + ' 요일';
  // }


  /**
   * cron validation message
   * @returns {string}
   */
  public getCronValidationMessage(): string {
    // cron 이 빈값이면
    if (this.cronText.trim() === '') {
      return this.translateService.instant('msg.storage.ui.cron.empty');
    }
    // cron 이 있으나 validation 실패시
    if (this.cronText.trim() !== '' && !this.cronResultFl) {
      return this.translateService.instant('msg.storage.ui.cron.description');
    }
    return;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * segment Granularity 선택 이벤트
   * @param granularity
   */
  public onSelectedSegGranularity(granularity): void {
    this.selectedSegGranularity = granularity;

    // segment 가 granularity 보다 작을 경우
    const index = this.getGranularityList().findIndex((type) => {
      return type.value === this.selectedGranularity.value;
    });
    // granularity 기본값으로 수정
    if (index === -1) {
      this.selectedGranularity = this.granularityList[0];
    }
  }

  /**
   * Granularity 선택 이벤트
   * @param granularity
   */
  public onSelectedGranularity(granularity): void {
    this.selectedGranularity = granularity
  }

  /**
   * expiration 선택 이벤트
   * @param expiration
   */
  public onSelectedExpiration(expiration): void {
    this.selectedExpirationTime = expiration;
  }

  /**
   * 시 선택 이벤트
   * @param hour
   */
  public onSelectedHour(hour): void {
    this.selectedHour = hour;
  }

  /**
   * 분 선택 이벤트
   * @param hour
   */
  public onSelectedMinute(minute): void {
    this.selectedMinute = minute;
  }

  /**
   * 주 선택 이벤트
   * @param week
   */
  public onSelectedDay(day): void {
    day.checked = !day.checked;
  }

  /**
   * batch 타입 변경 이벤트
   * @param type
   */
  public onChangeBatchType(type): void {
    this.selectedBatchType = type;
  }

  /**
   * ingestion 수집방법 변경 이벤트
   * @param ingestionType
   */
  public onChangeIngestion(ingestionType): void {
    // 이미 같은 타입이면 return
    if (this.isEqualTypeValue(ingestionType, this.selectedIngestionType)) {
      return;
    }
    // 타입 변경
    this.selectedIngestionType = ingestionType;
    // ingestion 타입에 따라 scope 선택값 변경
    this.selectedScopeType = this.isIngestionOnceType() ? this.ingestionScopeTypeList[1] : this.ingestionScopeTypeList[0];
  }

  /**
   * ingestion scope 타입 변경 이벤트
   * @param scope
   */
  public onChangeIngestionScope(scope): void {
    this.selectedScopeType = scope;
  }

  /**
   * roll up 변경 이벤트
   * @param {boolean} flag
   */
  public onSelectedRollup(flag: boolean): void {
    // 롤업 변경
    this.selectedRollup = flag;
  }

  /**
   * tuning 텍스트 json인지 확인
   */
  public onClickTuningTest(): void {
    // 아무 입력이 없을때는 return
    if (this.tuningConfig.trim() === '') {
      return;
    }
    const isError = this.isJsonText(this.tuningConfig);
    // 에러가 있는경우
    this.tuningConfigResultFl = isError ? false : true;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선택된 타입의 value와 같은지 확인
   * @param targetType
   * @param selectedType
   * @returns {boolean}
   */
  public isEqualTypeValue(targetType, selectedType): boolean {
    return targetType.value === selectedType.value;
  }

  /**
   * 현재 데이터소스 생성 타입이 수집형인 경우
   * @returns {boolean}
   */
  public isEngineType() : boolean {
    return this.getConnectionType === 'ENGINE';
  }

  /**
   * 현재 데이터소스 생성 타입이 연결형인 경우
   * @returns {boolean}
   */
  public isLinkType() : boolean {
    return this.getConnectionType === 'LINK';
  }

  /**
   * ingestion 타입이 once 인지
   * @returns {boolean}
   */
  public isIngestionOnceType() : boolean {
    return this.selectedIngestionType.value === 'single';
  }

  /**
   * ingestion 타입이 period 인지
   * @returns {boolean}
   */
  public isIngestionPeriodType() : boolean {
    return this.selectedIngestionType.value === 'batch';
  }

  /**
   * 현재 선택된 batch 타입이 시간 인지 여부
   * @returns {boolean}
   */
  public isSelectedBatchTypeHour(): boolean {
    return this.selectedBatchType.value === 'HOURLY';
  }

  /**
   * 현재 선택된 batch 타입이 분 인지 여부
   * @returns {boolean}
   */
  public isSelectedBatchTypeMinute(): boolean {
    return this.selectedBatchType.value === 'MINUTELY';
  }

  /**
   * 현재 선택된 batch 타입이 요일 인지 여부
   * @returns {boolean}
   */
  public isSelectedBatchTypeDay(): boolean {
    return this.selectedBatchType.value === 'DAILY';
  }

  /**
   * 현재 선택된 batch 타입이 주 인지 여부
   * @returns {boolean}
   */
  public isSelectedBatchTypeWeek(): boolean {
    return this.selectedBatchType.value === 'WEEKLY';
  }

  /**
   * 현재 선택된 batch 타입이 cron 인지 여부
   * @returns {boolean}
   */
  public isSelectedBatchTypeCron(): boolean {
    return this.selectedBatchType.value === 'EXPR';
  }


  /**
   * next validation
   * @returns {boolean}
   */
  public getNextValidation(): boolean {
    // engine 형일때만 validation 체크
    if (this.isEngineType()) {
      // period 타입일때
      if ((this.isIngestionPeriodType() && !this.ingestionPeriodRow
          // cron 이라면
          || (this.isSelectedBatchTypeCron() && !this.cronResultFl))
        // once 타입일때
        || (this.isIngestionOnceType() && this.isEqualTypeValue({value: 'ROW'}, this.selectedScopeType) && !this.ingestionOnceRow)) {
        return false;
      }
    }

    // tuning validation
    if (!this.isTuningConfigValidation()) {
      return false;
    }
    return true;
  }

  /**
   * cron validation
   * @param event
   */
  public cronValidation(event) {
    // cron 이 빈값일때 return
    if (this.cronText.trim() === '') {
      this.cronResultFl = false;
      return;
    }
    // 스페이스바와 삭제일때 작동 x
    if (event.keyCode === 32 || event.keyCode === 8 || event.keyCode === 46) {
      return;
    }
    // cron validation check
    this.getCronValidation();
  }

  /**
   * tuning config validation
   * @returns {boolean}
   */
  public isTuningConfigValidation(): boolean {
    return (this.tuningConfig.trim() === '') || (this.tuningConfig.trim() !== '' && this.tuningConfigResultFl);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 기존 ingestion 삭제후 새로 생성
   */
  private deleteAndSaveIngestionData(): void {
    // ingestion 정보가 있다면 삭제
    if (this.sourceData.hasOwnProperty('ingestionData')) {
      delete this.sourceData.ingestionData;
    }
    // 현재 페이지의 ingestion 생성정보 저장
    this.saveIngestionData(this.sourceData);
  }

  /**
   * 현재 페이지의 ingestion 데이터 저장
   * @param {DatasourceInfo} sourceData
   */
  private saveIngestionData(sourceData: DatasourceInfo): void {
    const ingestionData = {
      // 선택된 ingestion type
      selectedIngestionType : this.selectedIngestionType,
      // 선택된 ingestion batch
      selectedBatchType : this.selectedBatchType,
      // 선택된 ingestion scope
      selectedScopeType : this.selectedScopeType,
      // selected segment Granularity
      selectedSegGranularity : this.selectedSegGranularity,
      // selected Granularity
      selectedGranularity : this.selectedGranularity,
      // ingestion row
      ingestionOnceRow : this.ingestionOnceRow,
      ingestionPeriodRow : this.ingestionPeriodRow,
      // 선택된 batch hour
      selectedHour : this.selectedHour,
      // 선택된 batch minute
      selectedMinute : this.selectedMinute,
      // 선택된 batch time
      selectedDayTime : this.selectedDayTime,
      selectedWeekTime : this.selectedWeekTime,
      // date type
      dateType : this.dateType,
      // 선택된 expiration Time
      selectedExpirationTime : this.selectedExpirationTime,
      // cron text
      cronText : this.cronText,
      // cron result flag
      cronResultFl : this.cronResultFl,
      // roll up
      selectedRollup: this.selectedRollup,
      // advanced flag
      advancedShowFl: this.advancedShowFl,
      // advanced setting
      tuningConfig: this.tuningConfig,
      // tuning result
      tuningConfigResultFl: this.tuningConfigResultFl
    };
    sourceData['ingestionData'] = ingestionData;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * cron validation
   */
  private getCronValidation(): void {
    const param = {
      expr: this.cronText.trim()
    };
    this.datasourceService.checkValidationCron(param)
      .then((result) => {
        // cron flag
        this.cronResultFl = result.valid;
      })
      .catch((error) => {
        Alert.error(error);
        // cron flag
        this.cronResultFl = false;
      });
  }

  /**
   * current 시간
   * @returns {string}
   */
  private getCurrentTime(): string {
    // date 현재시각
    const date = new Date();
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  }

  /**
   * expiration time
   * @returns {Array}
   */
  private getExpirationTimeList() {
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
   * 해당 text가 json 형태인지 체크
   * @param {string} text
   * @returns {any}
   */
  private isJsonText(text: string) {
    try {
      JSON5.parse(text);
    } catch(e) {
      return e;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - init
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   */
  private initView(): void {
    // Ingestion setting
    // 데이터 수집 방식
    this.ingestionTypeList = [
      { label: this.translateService.instant('msg.storage.th.ingest-once'), value: 'single' },
      { label: this.translateService.instant('msg.storage.th.ingest-prcdly'), value: 'batch' },
    ];
    this.selectedIngestionType = this.ingestionTypeList[0];
    // ingestion scope List
    this.ingestionScopeTypeList = [
      { label: this.translateService.instant('msg.storage.th.dsource.scope-incremental'), value: 'INCREMENTAL' },
      { label: this.translateService.instant('msg.storage.th.dsource.scope-all'), value: 'ALL' },
      { label: this.translateService.instant('msg.storage.th.dsource.scope-row'), value: 'ROW' }
    ];
    this.selectedScopeType = this.ingestionScopeTypeList[1];
    // ingestion batch type List
    this.ingestionBatchTypeList = [
      { label: this.translateService.instant('msg.storage.li.dsource.batch-minutely'), value: 'MINUTELY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-hourly'), value: 'HOURLY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-daily'), value: 'DAILY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-weekly'), value: 'WEEKLY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-expr'), value: 'EXPR' },
    ];
    this.selectedBatchType = this.ingestionBatchTypeList[0];
    // ingestion row
    this.ingestionOnceRow = 10000;
    this.ingestionPeriodRow = 10000;

    // hour type
    for (let i = 1; i < 24 ; i += 1) {
      this.hourType.push(i);
    }
    this.selectedHour = this.hourType[0];

    // minute type
    for (let i = 1; i < 60 ; i += 1) {
      this.minuteType.push(i);
    }
    this.selectedMinute = this.minuteType[0];

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

    // Granularity setting
    // 저장 단위
    this.segGranularityList = [
      // { label: this.translateService.instant('msg.storage.li.dsource.granularity-second'), value: 'SECOND' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-minute'), value: 'MINUTE' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-hour'), value: 'HOUR' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-day'), value: 'DAY' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-month'), value: 'MONTH' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-year'), value: 'YEAR' }
    ];
    this.selectedSegGranularity = this.segGranularityList[3];
    // 집계 단위
    this.granularityList = [
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-none'), value: 'NONE' },
      // { label: this.translateService.instant('msg.storage.li.dsource.granularity-second'), value: 'SECOND' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-minute'), value: 'MINUTE' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-hour'), value: 'HOUR' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-day'), value: 'DAY' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-month'), value: 'MONTH' },
      { label: this.translateService.instant('msg.storage.li.dsource.granularity-year'), value: 'YEAR' }
    ];
    this.selectedGranularity = this.granularityList[4];

    // Expiration time
    this.expirationTimeList = this.getExpirationTimeList();
    this.selectedExpirationTime = this.expirationTimeList[0];

    // selectedTime
    this.selectedDayTime = this.getCurrentTime();
    this.selectedWeekTime = this.getCurrentTime();

    // rollup 초기화
    this.selectedRollup = true;
  }

  /**
   * init ingestion data
   * @param ingestionData
   */
  private initData(ingestionData: any): void {
    // 선택된 ingestion type
    this.selectedIngestionType = ingestionData.selectedIngestionType;
    // 선택된 ingestion batch
    this.selectedBatchType = ingestionData.selectedBatchType;
    // 선택된 ingestion scope
    this.selectedScopeType = ingestionData.selectedScopeType;
    // selected segment Granularity
    this.selectedSegGranularity = ingestionData.selectedSegGranularity;
    // selected Granularity
    this.selectedGranularity = ingestionData.selectedGranularity;
    // ingestion row
    this.ingestionOnceRow = ingestionData.ingestionOnceRow;
    this.ingestionPeriodRow = ingestionData.ingestionPeriodRow;
    // 선택된 batch hour
    this.selectedHour = ingestionData.selectedHour;
    // 선택된 batch minute
    this.selectedMinute = ingestionData.selectedMinute;
    // 선택된 batch time
    this.selectedDayTime = ingestionData.selectedDayTime;
    this.selectedWeekTime = ingestionData.selectedWeekTime;
    // date type
    this.dateType = ingestionData.dateType;
    // 선택된 expiration Time
    this.selectedExpirationTime = ingestionData.selectedExpirationTime;
    // cron text
    this.cronText = ingestionData.cronText;
    // cron result flag
    this.cronResultFl = ingestionData.cronResultFl;
    // roll up
    this.selectedRollup = ingestionData.selectedRollup;
    // advanced flag
    this.advancedShowFl = ingestionData.advancedShowFl;
    // advanced setting
    this.tuningConfig = ingestionData.tuningConfig;
    // tuning result
    this.tuningConfigResultFl = ingestionData.tuningConfigResultFl;
  }
}
