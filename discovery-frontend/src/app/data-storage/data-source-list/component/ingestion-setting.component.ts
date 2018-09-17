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

/**
 * Ingestion setting component
 */
@Component({
  selector: 'ingestion-setting',
  templateUrl: './ingestion-setting.component.html'
})
export class IngestionSettingComponent extends AbstractComponent {

  // datasource data
  private _sourceData: DatasourceInfo;

  // granularity list
  private _granularityList: any[] = [
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-none'), value: 'NONE' },
    // { label: this.translateService.instant('msg.storage.li.dsource.granularity-second'), value: 'SECOND' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-minute'), value: 'MINUTE' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-hour'), value: 'HOUR' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-day'), value: 'DAY' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-month'), value: 'MONTH' },
    { label: this.translateService.instant('msg.storage.li.dsource.granularity-year'), value: 'YEAR' }
  ];
  // scope type list (only engine source type)
  private _scopeTypeList: any[] = [
    { label: this.translateService.instant('msg.storage.th.dsource.scope-incremental'), value: 'INCREMENTAL' },
    { label: this.translateService.instant('msg.storage.th.dsource.scope-all'), value: 'ALL' },
    { label: this.translateService.instant('msg.storage.th.dsource.scope-row'), value: 'ROW' }
  ];

  // source create type
  public createType: string;

  // rollup type list
  public rollUpTypeList: any[];
  // selected rollup type
  public selectedRollUpType: any;

  // data range type list (only stagingDB create type)
  public dataRangeTypeList: any[];
  // selected data range type (only stagingDB create type)
  public selectedDataRangeType: any;
  // start date time in data range (only stagingDB create type)
  public startDateTime: string;
  // end date time in data range (only stagingDB create type)
  public endDateTime: string;

  // partition type list
  public partitionTypeList: any[];
  // selected partition type
  public selectedPartitionType: any;
  // partition key list
  public partitionKeyList: any[] = [];

  // segment granularity list
  public segmentGranularityList: any[];
  // selected segment granularity
  public selectedSegmentGranularity: any;
  // segment granularity list show flag
  public isShowSegmentGranularityList: boolean = false;

  // query granularity list
  public queryGranularityList: any[];
  // selected query granularity
  public selectedQueryGranularity: any;
  // query granularity list show flag
  public isShowQueryGranularityList: boolean = false;

  // expiration list (only linked source type)
  public expirationTimeList: any[];
  // selected expiration (only linked source type)
  public selectedExpirationTime: any;
  // expiration list show flag (only linked source type)
  public isShowExpirationTimeList: boolean = false;

  // ingestion type list (only engine source type)
  public ingestionTypeList: any[];
  // selected ingestion type (only engine source type)
  public selectedIngestionType: any;

  // ingestion scope type list (only engine source type)
  public ingestionScopeTypeList: any[];
  // selected ingestion scope type (only engine source type)
  public selectedIngestionScopeType: any;

  // batch type list (only engine source type)
  public batchTypeList: any[];
  // selected batch type (only engine source type)
  public selectedBatchType: any;
  // batch type list show flag (only engine source type)
  public isShowBatchTypeList: boolean = false;

  // hour list (only engine source type)
  public hourList: any[] = [];
  // selected hour (only engine source type)
  public selectedHour: any;
  // hour list show flag (only engine source type)
  public isShowHourList: boolean = false;

  // minute list (only engine source type)
  public minuteList: any[] = [];
  // selected minute (only engine source type)
  public selectedMinute: any;
  // minute list show flag (only engine source type)
  public isShowMinuteList: boolean = false;

  // second list (only engine source type)
  public selectedDailyTime: string;

  // day list (only engine source type)
  public dateList: any[];
  // day list show flag (only engine source type)
  public isShowDateList: boolean = false;
  // seleted time in week (only engine source type)
  public selectedWeeklyTime: string;

  // cron text (only engine source type)
  public cronText: string;
  // cron validation result (only engine source type)
  public cronValidationResult: boolean;
  // cron validation result message (only engine source type)
  public cronValidationMessage: string;

  // row (only engine source type)
  public ingestionOnceRow: number = 10000;
  public ingestionPeriodRow: number = 10000;

  // advanced settings
  public tuningConfig: any[] = [];
  public jobProperties: any[] = [];

  // step change
  @Output()
  public prevStep: EventEmitter<any> = new EventEmitter();
  @Output()
  public nextStep: EventEmitter<any> = new EventEmitter();

  // constructor
  constructor(private _dataSourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

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

  /**
   * Init
   * @param {DatasourceInfo} sourceData
   */
  public init(sourceData: DatasourceInfo, createType: string): void {
    // ui init
    this._initView();
    // datasource data
    this._sourceData = sourceData;
    // create datasource type
    this.createType = createType;
    // if exist ingestionData
    if (this._sourceData.hasOwnProperty("ingestionData")) {
      this._loadIngestionData(this._sourceData.ingestionData);
    } else {
      this._setDefaultIngestionOption();
      // if staging type, set partition key list
      if (this.createType === 'STAGING' && this._sourceData.databaseData.selectedTableDetail.partitionFields.length > 0) {
        this.partitionKeyList.push(_.cloneDeep(this._sourceData.databaseData.selectedTableDetail.partitionFields));
      }
    }
  }

  /**
   * Cron validation check
   */
  public cronValidation(): void {
    // if crontext is empty
    if (StringUtil.isEmpty(this.cronText)) {
      // result fail
      this.cronValidationResult = false;
      this.cronValidationMessage = this.translateService.instant('msg.storage.ui.cron.empty');
      return;
    }
    // loading show
    this.loadingShow();
    this._dataSourceService.checkValidationCron({expr: this.cronText})
      .then((result) => {
        // validation result
        this.cronValidationResult = result.valid;
        // if validation fail
        if (!result.valid) {
          this.cronValidationMessage = this.translateService.instant('msg.storage.ui.cron.description');
        }
        // loading hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
        // result fail
        this.cronValidationResult = false;
      });
  }

  /**
   * Get connection type
   * @returns {string}
   */
  public getConnectionType(): string {
    return this._sourceData.connectionData.connType;
  }

  /**
   * Prev button click event
   */
  public onClickPrev(): void {
    // if exist ingestionData, delete IngestionData
    this._sourceData.hasOwnProperty('ingestionData') && (delete this._sourceData.ingestionData);
    // save ingestionData
    this._saveIngestionData(this._sourceData);
    // move to prev staff
    this.prevStep.emit();
  }

  /**
   * Next button click event
   */
  public onClickNext(): void {
    // if enable next
    if (this._isEnableNext()) {
      // if exist ingestionData, delete IngestionData
      this._sourceData.hasOwnProperty('ingestionData') && (delete this._sourceData.ingestionData);
      // save ingestionData
      this._saveIngestionData(this._sourceData);
      // move to next staff
      this.nextStep.emit();
    } else {
      Alert.error(this.translateService.instant('msg.comm.alert.error'));
    }
  }

  /**
   * Query Granularity change event
   * @param granularity
   */
  public onChangeQueryGranularity(granularity: any): void {
    this.selectedQueryGranularity = granularity;
  }

  /**
   * Segment Granularity change event
   * @param granularity
   */
  public onChangeSegmentGranularity(granularity: any): void {
    this.selectedSegmentGranularity = granularity;
    // update query granularity list
    this._updateQueryGranularityList(granularity);
    // if selected query granularity not exist in query granularity list, selected query granularity set default
    if (_.every(this.queryGranularityList, item => item.value !== this.selectedQueryGranularity.value)) {
      this.selectedQueryGranularity = this.queryGranularityList[0];
    }
  }

  /**
   * Rollup change event
   * @param rollUp
   */
  public onChangeRollUpType(rollUp: any): void {
    this.selectedRollUpType = rollUp;
  }

  /**
   * Data range change event
   * @param dataRangeType
   */
  public onChangeDataRangeType(dataRangeType: any): void {
    this.selectedDataRangeType = dataRangeType;
  }

  /**
   * Data range time change vent
   * @param time
   */
  public onChangeRangeTime(time: any): void {
    this.startDateTime = time.startDateStr;
    this.endDateTime = time.endDateStr;
  }

  /**
   * Partition type change click event
   * @param partitionType
   */
  public onChangePartitionType(partitionType: any): void {
    // if partition field list length 0
    if (this.partitionKeyList.length !== 0) {
      this.selectedPartitionType = partitionType;
    }
  }

  /**
   * Expiration time change event
   * @param expirationTime
   */
  public onChangeExpirationTime(expirationTime: any): void {
    this.selectedExpirationTime = expirationTime;
  }

  /**
   * Ingestion type change event
   * @param ingestionType
   */
  public onChangeIngestionType(ingestionType: any): void {
    // only operates if the selected type is different
    if (this.selectedIngestionType !== ingestionType) {
      this.selectedIngestionType = ingestionType;
      // update scope type list
      this._updateIngestionScopeTypeList(ingestionType);
      // init selected scope type
      // if used current_time column in schema step
      if (ingestionType.value === 'batch' && this.isUsedCurrentTimestampColumn()) {
        this.selectedIngestionScopeType = this.ingestionScopeTypeList[1];
      } else {
        this.selectedIngestionScopeType = this.ingestionScopeTypeList[0];
      }
    }
  }

  /**
   * Ingestion scope type change event
   * @param scopeType
   */
  public onChangeIngestionScopeType(scopeType: any): void {
    if (this.isUsedCurrentTimestampColumn() && scopeType.value === 'INCREMENTAL') {
      return;
    }
    this.selectedIngestionScopeType = scopeType;
  }

  /**
   * Batch type select event
   * @param type
   */
  public onSelectBatchType(type: any): void {
    this.selectedBatchType = type;
  }

  /**
   * Hour select event
   * @param hour
   */
  public onSelectHour(hour: any): void {
    this.selectedHour = hour;
  }

  /**
   * Minute select event
   * @param minute
   */
  public onSelectMinute(minute: any): void {
    this.selectedMinute = minute;
  }

  /**
   * Day select event
   * @param date
   */
  public onSelectDate(date: any): void {
    date.checked = !date.checked;
  }

  /**
   * CronText keypress event
   * @param {KeyboardEvent} event
   */
  public onKeyPressCronText(event: KeyboardEvent): void {
    // only enter
    event.keyCode === 13 && this.cronValidation();
  }

  /**
   * Row check max event
   * @param {string} row
   * @param {number} value
   */
  public onCheckMaxRow(row: string, value: number): void {
    // change row
    this[row] = value;
    // if value is over 10000, set 10000
    if (this[row] > 10000) {
      this[row] = 10000;
    }
  }

  /**
   * Is used current_time column in schema step
   * @returns {boolean}
   */
  public isUsedCurrentTimestampColumn(): boolean {
    return this._sourceData.schemaData.selectedTimestampType === 'CURRENT';
  }

  public isOverPeriodMaxRow(): boolean {
    return this.ingestionPeriodRow > 5000000;
  }


  /**
   * is enable partition input
   * TODO f#35
   * @param {any[]} partitions
   * @param partition
   * @returns {boolean}
   */
  public isEnabledPartitionInput(partitions: any[], partition: any): boolean {
    const index = partitions.findIndex((item) => {
      return item === partition;
    });
    if (index !== 0
      && (partitions[index - 1].value === undefined || partitions[index - 1].value === '')) {
      return false;
    }
    return true;
  }

  /**
   * add partition in partition list
   * TODO f#35
   */
  public addPartitionKeys(): void {
    this.partitionKeyList.push(_.cloneDeep(this._sourceData.databaseData.selectedTableDetail.partitionFields));
  }

  /**
   * delete partition in partition list
   * TODO f#35
   */
  public deletePartitionKeys(): void {
    this.partitionKeyList = this.partitionKeyList.slice(0, this.partitionKeyList.length - 1);
  }

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // init Segment Granularity list
    this.segmentGranularityList = _.filter(this._granularityList, item => item.value !== 'NONE');
    this.selectedSegmentGranularity = this.segmentGranularityList[3];
    // init Query Granularity list
    this.queryGranularityList = this._granularityList;
    this.selectedQueryGranularity = this.queryGranularityList[4];
    // init roll up type list
    this.rollUpTypeList = [
      { label: this.translateService.instant('msg.storage.ui.set.true'), value: true },
      { label: this.translateService.instant('msg.storage.ui.set.false'), value: false },
    ];
    this.selectedRollUpType = this.rollUpTypeList[0];
    // init data range type list
    this.dataRangeTypeList = [
      { label: this.translateService.instant('msg.storage.ui.set.disable'), value: 'DISABLE' },
      { label: this.translateService.instant('msg.storage.ui.set.enable'), value: 'ENABLE' }
    ];
    this.selectedDataRangeType = this.dataRangeTypeList[0];
    // init partition type list
    this.partitionTypeList = [
      { label: this.translateService.instant('msg.storage.ui.set.disable'), value: 'DISABLE' },
      { label: this.translateService.instant('msg.storage.ui.set.enable'), value: 'ENABLE' }
    ];
    this.selectedPartitionType = this.partitionTypeList[0];
    // init expiration time list
    this.expirationTimeList = this._getExpirationTimeList();
    this.selectedExpirationTime = this.expirationTimeList[0];
    // init ingestion type list
    this.ingestionTypeList = [
      { label: this.translateService.instant('msg.storage.th.ingest-once'), value: 'single' },
      { label: this.translateService.instant('msg.storage.th.ingest-prcdly'), value: 'batch' },
    ];
    this.selectedIngestionType = this.ingestionTypeList[0];
    // init ingestion scope List
    this.ingestionScopeTypeList = this._scopeTypeList.filter(type => type.value !== 'INCREMENTAL');
    this.selectedIngestionScopeType = this.ingestionScopeTypeList[0];
    // init batch type list
    this.batchTypeList = [
      { label: this.translateService.instant('msg.storage.li.dsource.batch-minutely'), value: 'MINUTELY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-hourly'), value: 'HOURLY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-daily'), value: 'DAILY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-weekly'), value: 'WEEKLY' },
      { label: this.translateService.instant('msg.storage.li.dsource.batch-expr'), value: 'EXPR' },
    ];
    this.selectedBatchType = this.batchTypeList[0];
    // init hour list
    for (let i = 1; i < 24 ; i += 1) {
      this.hourList.push(i);
    }
    this.selectedHour = this.hourList[0];
    // init minute list
    for (let i = 1; i < 60 ; i += 1) {
      this.minuteList.push(i);
    }
    this.selectedMinute = this.minuteList[0];
    // init day list
    this.dateList = [
      { label: this.translateService.instant('msg.storage.li.dsource.date-mon'), value: 'MON', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-tue'), value: 'TUE', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-wed'), value: 'WED', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-thu'), value: 'THU', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-fri'), value: 'FRI', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-sat'), value: 'SAT', checked: true },
      { label: this.translateService.instant('msg.storage.li.dsource.date-sun'), value: 'SUN', checked: true }
    ];
    // init second list
    this.selectedWeeklyTime = this.selectedDailyTime = this._getCurrentTime();
  }

  /**
   * Update query granularity list
   * @param granularity
   * @private
   */
  private _updateQueryGranularityList(granularity: any): void {
    this.queryGranularityList = this._granularityList.slice(0, _.findIndex(this._granularityList, item => item.value === granularity.value) + 1)
  }

  /**
   * Update ingestion scope type list
   * @param ingestionType
   * @private
   */
  private _updateIngestionScopeTypeList(ingestionType: any): void {
    this.ingestionScopeTypeList = ingestionType.value === 'single'
      ? this._scopeTypeList.filter(type => type.value !== 'INCREMENTAL')
      : this._scopeTypeList.filter(type => type.value !== 'ROW');
  }

  /**
   * If enable next page
   * @returns {boolean}
   * @private
   */
  private _isEnableNext(): boolean {
    // If create type is DB and source type is ENGINE
    if (this.createType === 'DB' && this.getConnectionType() === 'ENGINE' && (
        (this.selectedIngestionType.value === 'batch' && (!this.ingestionPeriodRow || this.ingestionPeriodRow > 5000000 || (this.selectedBatchType.value === 'EXPR' && !this.cronValidationResult)))
        || (this.selectedIngestionType.value === 'single' && this.selectedIngestionScopeType.value === 'ROW' && !this.ingestionOnceRow)
      )) {
      return false;
    }
    // If create type is StagingDB and value is empty in jobProperties's default option
    // if (this.createType === 'STAGING' && this.jobProperties.some(item => item.defaultOpt && StringUtil.isEmpty(item.value))) {
    //   return false;
    // }
    // value is empty in tuningConfig's default option
    // if (this.tuningConfig.some(item => item.defaultOpt && StringUtil.isEmpty(item.value))) {
    //   return false;
    // }
    return true;
  }

  /**
   * Set ingestion default option
   * @private
   */
  private _setDefaultIngestionOption(): void {
    // loading show
    this.loadingShow();
    this._dataSourceService.getDefaultIngestionOptions(this.createType === 'STAGING' ? 'hadoop' : 'batch')
      .then((result) => {
        // loading hide
        this.loadingHide();
        // result
        this.tuningConfig = result.filter(item => item.type === 'TUNING').map((item) => {
          return {key: item.name, value: '', ph: item.defaultValue, defaultOpt: true};
        });
        this.jobProperties = result.filter(item => item.type === 'JOB').map((item) => {
          return {key: item.name, value: '', ph: item.defaultValue,  defaultOpt: true};
        });
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get expiration time list
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
   * Get current time
   * @returns {string}
   * @private
   */
  private _getCurrentTime(): string {
    const date = new Date();
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  }

  /**
   * Load ingestion data
   * @param ingestionData
   * @private
   */
  private _loadIngestionData(ingestionData:any): void {
    // load selected segment granularity
    this.selectedSegmentGranularity = ingestionData.selectedSegmentGranularity;
    // update query granularity list
    this._updateQueryGranularityList(this.selectedSegmentGranularity);
    // load selected query granularity
    this.selectedQueryGranularity = ingestionData.selectedQueryGranularity;
    // load selected rollup type
    this.selectedRollUpType = ingestionData.selectedRollUpType;
    // load tuning configuration
    this.tuningConfig = ingestionData.tuningConfig;
    // if create type is DB
    if (this.createType === 'DB') {
      // load selected expiration time
      this.selectedExpirationTime = ingestionData.selectedExpirationTime;
      // load selected ingestion type
      this.selectedIngestionType = ingestionData.selectedIngestionType;
      // update ingestion scope type list
      this._updateIngestionScopeTypeList(this.selectedIngestionType);
      // load selected scope type
      this.selectedIngestionScopeType = ingestionData.selectedIngestionScopeType;
      // if used current_time column
      if (this.isUsedCurrentTimestampColumn() && this.selectedIngestionScopeType.value === 'INCREMENTAL') {
        this.selectedIngestionScopeType = this.ingestionScopeTypeList[1];
      }
      // load selected batch type
      this.selectedBatchType = ingestionData.selectedBatchType;
      // load selected hour
      this.selectedHour = ingestionData.selectedHour;
      // load selected minute
      this.selectedMinute = ingestionData.selectedMinute;
      // load day list
      this.dateList = ingestionData.dateList;
      // load selected time
      this.selectedWeeklyTime = ingestionData.selectedWeeklyTime;
      this.selectedDailyTime = ingestionData.selectedDailyTime;
      // load row
      this.ingestionOnceRow = ingestionData.ingestionOnceRow;
      this.ingestionPeriodRow = ingestionData.ingestionPeriodRow;
    }
    // if create type is StagingDB
    if (this.createType === 'STAGING') {
      // load selected data range type
      this.selectedDataRangeType = ingestionData.selectedDataRangeType;
      // load selected partition type
      this.selectedPartitionType = ingestionData.selectedPartitionType;
      // load job properties
      this.jobProperties = ingestionData.jobProperties;
      // load date time used data range
      this.startDateTime = ingestionData.startDateTime;
      this.endDateTime = ingestionData.endDateTime;
      // partition key list
      this.partitionKeyList = ingestionData.partitionKeyList;
    }
  }

  /**
   * Save ingestion data
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveIngestionData(sourceData: DatasourceInfo): void {
    sourceData['ingestionData'] = {
      // save selected segment granularity
      selectedSegmentGranularity : this.selectedSegmentGranularity,
      // save query granularity
      selectedQueryGranularity : this.selectedQueryGranularity,
      // save selected rollup type
      selectedRollUpType : this.selectedRollUpType,
      // save tuning configuration
      tuningConfig : this.tuningConfig
    };
    // if create type DB
    if (this.createType === 'DB') {
      // save selected expiration type
      sourceData['ingestionData'].selectedExpirationTime = this.selectedExpirationTime;
      // save selected ingestion type
      sourceData['ingestionData'].selectedIngestionType = this.selectedIngestionType;
      // save selected scope type
      sourceData['ingestionData'].selectedIngestionScopeType = this.selectedIngestionScopeType;
      // save selected batch type
      sourceData['ingestionData'].selectedBatchType = this.selectedBatchType;
      // save selected hour
      sourceData['ingestionData'].selectedHour = this.selectedHour;
      // save selected minute
      sourceData['ingestionData'].selectedMinute = this.selectedMinute;
      // save day list
      sourceData['ingestionData'].dateList = this.dateList;
      // save time
      sourceData['ingestionData'].selectedWeeklyTime = this.selectedWeeklyTime;
      sourceData['ingestionData'].selectedDailyTime = this.selectedDailyTime;
      // save row
      sourceData['ingestionData'].ingestionOnceRow = this.ingestionOnceRow;
      sourceData['ingestionData'].ingestionPeriodRow = this.ingestionPeriodRow;
    }
    // if create type Staging
    if (this.createType === 'STAGING') {
      // save selected data range type
      sourceData['ingestionData'].selectedDataRangeType = this.selectedDataRangeType;
      // save selected partition type
      sourceData['ingestionData'].selectedPartitionType = this.selectedPartitionType;
      // selected job properties
      sourceData['ingestionData'].jobProperties = this.jobProperties;
      // selected time used data range
      sourceData['ingestionData'].startDateTime = this.startDateTime;
      sourceData['ingestionData'].endDateTime = this.endDateTime;
      // partition key list
      sourceData['ingestionData'].partitionKeyList = this.partitionKeyList;
    }
  }
}
