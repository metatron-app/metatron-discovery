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

import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DatasourceInfo, Field } from '../../../../../domain/datasource/datasource';
import { PeriodType } from '../../../../../common/component/period/period.component';
import * as _ from 'lodash';
import JSON5 from 'json5';

declare let moment: any;

@Component({
  selector: 'staging-db-ingestion',
  templateUrl: './staging-db-ingestion.component.html'
})
export class StagingDbIngestionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

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


  // selected segment Granularity
  public selectedSegGranularity: any;
  // selected Granularity
  public selectedGranularity: any;
  // data range list
  public dataRangeList: any[];
  // data range 설정여부
  public selectedDataRange: any;
  // data range time
  public startDateTime: string;
  public endDateTime: string;
  // partition list
  public partitionList: any[];
  // partition 설정여부
  public selectedPartition: any;
  // partitionKeys
  public partitionKeys: any[];

  // flag
  public granularShowFl: boolean = false;
  public segGranularShowFl: boolean = false;
  public advancedShowFl: boolean = false;

  // 달력컴포넌트 타입
  public periodType = PeriodType;

  // 선택된 rollup
  public selectedRollup: boolean = true;
  // tuning configuration
  public tuningConfig: string = '';
  // job properties
  public jobProperties: string = '';
  // tuning validation flag
  public tuningConfigResultFl: boolean;
  public jobPropertyResultFl: boolean;

  // segment Granularity list
  public segGranularityList: any[];
  // Granularity list
  public granularityList: any[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
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

    // ingestion 데이터가 있는경우
    if (this.sourceData.hasOwnProperty('ingestionData')) {
      // init data
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
    // 기존 ingestion 삭제후 생성
    this.deleteAndSaveIngestionData();
    // 이번페이지로 이동
    this.step = 'staging-db-configure-schema';
    this.stepChange.emit(this.step);
  }

  /**
   * 다음 화면으로 이동
   */
  public next() {
    // 기존 ingestion 삭제후 생성
    this.deleteAndSaveIngestionData();
    // validation
    if (this.getNextValidation()) {
      // 다음페이지로 이동
      this.step = 'staging-db-complete';
      this.stepChange.emit(this.step);
    }
  }

  /**
   * tuning result init
   */
  public tuningResultInit() {
    this.tuningConfigResultFl = null;
  }

  /**
   * jobProperties result init
   */
  public jobPropertyResultInit() {
    this.jobPropertyResultFl = null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * segment Granularity 선택 이벤트
   * @param granularity
   */
  public onSelectedSegGranularity(granularity) {
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
  public onSelectedGranularity(granularity) {
    this.selectedGranularity = granularity
  }

  /**
   * 데이터 범위 선택 이벤트
   * @param range
   */
  public onSelectedRange(range) {
    this.selectedDataRange = range;
  }

  /**
   * 데이터 범위 타임 변경 이벤트
   * @param event
   */
  public onChangeRangeTime(event) {
    this.startDateTime = event.startDateStr;
    this.endDateTime = event.endDateStr;
  }

  /**
   * 파티션 설정여부 선택 이벤트
   * @param type
   */
  public onSelectedPartition(type) {
    // 파티션 필드 있을때만 변경가능
    if (this.isEnabledPartitionFields()) {
      this.selectedPartition = this.partitionList[this.partitionList.findIndex((item) => {
        return item.value === type;
      })];
    }
  }

  /**
   * 파티션 추가 이벤트
   */
  public onClickAddPartitionKeys() {
    this.addPartitionKeys();
  }

  /**
   * 파티션 제거 이벤트
   */
  public onClickDeletePartitionKeys() {
    this.deletePartitionKeys();
  }

  /**
   * roll up 변경 이벤트
   * @param {boolean} flag
   */
  public onSelectedRollup(flag: boolean) {
    // 롤업 변경
    this.selectedRollup = flag;
    // return
    return false;
  }

  /**
   * tuning 텍스트 json인지 확인
   */
  public onClickTuningTest() {
    // 아무 입력이 없을때는 return
    if (this.tuningConfig.trim() === '') {
      return;
    }
    const isError = this.isJsonText(this.tuningConfig);
    // 에러가 있는경우
    this.tuningConfigResultFl = isError ? false : true;
  }

  /**
   * jobProperty 텍스트 json인지 확인
   */
  public onClickJobPropertyTest() {
    // 아무 입력이 없을때는 return
    if (this.jobProperties.trim() === '') {
      return;
    }
    const isError = this.isJsonText(this.jobProperties);
    // 에러가 있는경우
    this.jobPropertyResultFl = isError ? false : true;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * next validation
   * @returns {boolean}
   */
  public getNextValidation(): boolean {
    // tuning or jobProperties
    return this.isTuningConfigValidation() && this.isJobPropertyValidation();
  }

  /**
   * 파티션 사용못하게 하는 상태여부
   * @returns {boolean}
   */
  public isDisabledPartition(): boolean {
    return this.selectedPartition.value === 'DISABLE';
  }

  /**
   * 파티션 설정 사용가능 여부
   * @returns {boolean}
   */
  public isEnabledPartitionFields(): boolean {
    return this.getPartitionFields.length !== 0;
  }

  /**
   * 파티션 삭제 여부
   * @returns {boolean}
   */
  public isEnabledPartitionDelete(): boolean {
    return this.partitionKeys.length > 1;
  }

  /**
   * 파티션 추가 여부
   * @returns {boolean}
   */
  public isEnabledPartitionAdd(): boolean {
    return this.partitionKeys.length < 20;
  }

  /**
   * 파티션 설정 인풋 사용여부
   * @param {any[]} partitions
   * @param partition
   * @returns {boolean}
   */
  public isEnabledPartitionInput(partitions: any[], partition: any):boolean {
    const index = partitions.findIndex((item) => {
     return item === partition;
    });
    // 이전 value가 없다면 이용 불가
    if (index !== 0
      && (partitions[index - 1].value === undefined || partitions[index - 1].value === '')) {
      return false;
    }
    return true;
  }

  /**
   * tuning config validation
   * @returns {boolean}
   */
  public isTuningConfigValidation(): boolean {
    return (this.tuningConfig.trim() === '') || (this.tuningConfig.trim() !== '' && this.tuningConfigResultFl);
  }

  /**
   * jobProperty config validation
   * @returns {boolean}
   */
  public isJobPropertyValidation(): boolean {
    return (this.jobProperties.trim() === '') || (this.jobProperties.trim() !== '' && this.jobPropertyResultFl);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 페이지의 ingestion 데이터 저장
   * @param {DatasourceInfo} sourceData
   */
  private saveIngestionData(sourceData: DatasourceInfo) {
    const ingestionData = {
      selectedGranularity: this.selectedGranularity,
      selectedSegGranularity: this.selectedSegGranularity,
      selectedDataRange: this.selectedDataRange,
      startDateTime: this.startDateTime,
      endDateTime: this.endDateTime,
      // 선택한 파티션 설정여부
      selectedPartition: this.selectedPartition,
      // 설정된 파티션 키
      partitionKeys: this.partitionKeys,
      // advanced setting
      jobProperties: this.jobProperties,
      tuningConfig: this.tuningConfig,
      // show flag
      advancedShowFl: this.advancedShowFl,
      // roll up
      selectedRollup: this.selectedRollup,
      // tuning result
      tuningConfigResultFl: this.tuningConfigResultFl,
      // job property result
      jobPropertyResultFl: this.jobPropertyResultFl
    };
    sourceData['ingestionData'] = ingestionData;
  }

  /**
   * 기존 ingestion 삭제후 새로 생성
   */
  private deleteAndSaveIngestionData() {
    // 스키마 정보가 있다면 삭제
    if (this.sourceData.hasOwnProperty('ingestionData')) {
      delete this.sourceData.ingestionData;
    }
    // 현재 페이지의 데이터소스 생성정보 저장
    this.saveIngestionData(this.sourceData);
  }

  /**
   * 파티션 키 설정필드 추가
   */
  private addPartitionKeys() {
    this.partitionKeys.push(_.cloneDeep(this.getPartitionFields));
  }

  /**
   * 파티션 키 설정필드 제거
   */
  private deletePartitionKeys() {
    this.partitionKeys = this.partitionKeys.slice(0,this.partitionKeys.length - 1);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * data range start time default
   */
  private getDefaultStartTime() {
    return moment().subtract(1, 'years').format('YYYY-MM-DDTHH:mm');
  }

  /**
   * data range end time default
   */
  private getDefaultEndTime() {
    return moment().format('YYYY-MM-DDTHH:mm');
  }

  /**
   * 파티션 필드 데이터
   * @returns {Field[]}
   */
  private get getPartitionFields(): Field[] {
    return this.sourceData.databaseData.selectedTableDetail.partitionFields;
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
  private initView() {
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

    // data range
    this.dataRangeList = [
      { label: this.translateService.instant('msg.storage.ui.set.disable'), value: 'DISABLE' },
      { label: this.translateService.instant('msg.storage.ui.set.enable'), value: 'ENABLE' }
    ];
    this.selectedDataRange = this.dataRangeList[0];

    // partition keys
    this.partitionList = [
      { label: this.translateService.instant('msg.storage.ui.set.disable'), value: 'DISABLE' },
      { label: this.translateService.instant('msg.storage.ui.set.enable'), value: 'ENABLE' }
    ];
    this.selectedPartition = this.partitionList[0];

    // 데이터 범위 초기 값
    this.startDateTime = this.getDefaultStartTime();
    this.endDateTime = this.getDefaultEndTime();

    // 파티션 키 설정
    this.partitionKeys = [];
    this.addPartitionKeys();
  }

  /**
   * init ingestion data
   * @param ingestionData
   */
  private initData(ingestionData: any) {
    // granularity
    this.selectedGranularity = ingestionData.selectedGranularity;
    // seg granularity
    this.selectedSegGranularity = ingestionData.selectedSegGranularity;
    //  선택한 데이터 범위 설정여부
    this.selectedDataRange = ingestionData.selectedDataRange;
    // 데이터 범위 값
    this.startDateTime = ingestionData.startDateTime;
    this.endDateTime = ingestionData.endDateTime;
    // 선택한 파티션 설정여부
    this.selectedPartition = ingestionData.selectedPartition;
    // 설정된 파티션 키
    this.partitionKeys = ingestionData.partitionKeys;
    // advanced setting
    this.jobProperties = ingestionData.jobProperties;
    this.tuningConfig = ingestionData.tuningConfig;
    // flag
    this.advancedShowFl = ingestionData.advancedShowFl;
    // roll up
    this.selectedRollup = ingestionData.selectedRollup;
    // tuning result
    this.tuningConfigResultFl = ingestionData.tuningConfigResultFl;
    // job property result
    this.jobProperties = ingestionData.jobProperties;
  }
}
