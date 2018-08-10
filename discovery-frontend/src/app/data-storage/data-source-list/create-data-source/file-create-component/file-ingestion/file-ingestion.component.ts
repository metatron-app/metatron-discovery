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

import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { DatasourceInfo } from '../../../../../domain/datasource/datasource';
import JSON5 from 'json5';

@Component({
  selector: 'file-ingestion',
  templateUrl: './file-ingestion.component.html'
})
export class FileIngestionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
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

  // 선택된 rollup
  public selectedRollup: boolean = true;

  // flag
  public granularShowFl: boolean = false;
  public segGranularShowFl: boolean = false;
  // advanced flag
  public advancedShowFl: boolean = false;

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
    this.step = 'file-configure-schema';
    this.stepChange.emit(this.step);
  }

  /**
   * 다음 화면으로 이동
   */
  public next() {
    // validation
    if (this.getNextValidation()) {
      // 기존 ingestion 삭제후 생성
      this.deleteAndSaveIngestionData();
      // 다음페이지로 이동
      this.step = 'file-complete';
      this.stepChange.emit(this.step);
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
   * roll up 변경 이벤트
   * @param {boolean} flag
   */
  public onSelectedRollup(flag: boolean) {
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
   * next validation
   * @returns {boolean}
   */
  public getNextValidation(): boolean {
    // tuning or jobProperties
    return this.isTuningConfigValidation();
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
  }


  /**
   * init ingestion data
   * @param ingestionData
   */
  private initData(ingestionData: any) {
    this.selectedGranularity = ingestionData.selectedGranularity;
    this.selectedSegGranularity = ingestionData.selectedSegGranularity;
    // roll up
    this.selectedRollup = ingestionData.selectedRollup;
    // advanced flag
    this.advancedShowFl = ingestionData.advancedShowFl;
    // advanced setting
    this.tuningConfig = ingestionData.tuningConfig;
    // tuning result
    this.tuningConfigResultFl = ingestionData.tuningConfigResultFl;
  }


  /**
   * 현재 페이지의 ingestion 데이터 저장
   * @param {DatasourceInfo} sourceData
   */
  private saveIngestionData(sourceData: DatasourceInfo) {
    const ingestionData = {
      selectedGranularity: this.selectedGranularity,
      selectedSegGranularity: this.selectedSegGranularity,
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
}
