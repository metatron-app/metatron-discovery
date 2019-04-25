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
import {
  Component, ElementRef, EventEmitter, Injector, Output, Renderer2,
  ViewChild
} from '@angular/core';
import {
  DatasourceInfo,
  Field,
  FieldFormat,
  FieldFormatType,
} from '../../../domain/datasource/datasource';
import * as _ from 'lodash';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { StringUtil } from '../../../common/util/string.util';
import { Alert } from '../../../common/util/alert.util';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { CommonUtil } from '../../../common/util/common.util';
import {GranularityObject, GranularityService} from '../../service/granularity.service';

declare let moment: any;
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
  private _granularityList: GranularityObject[] = this._granularityService.granularityList;
  // scope type list (only engine source type)
  private _scopeTypeList: any[] = [
    { label: this.translateService.instant('msg.storage.th.dsource.scope-incremental'), value: 'INCREMENTAL' },
    { label: this.translateService.instant('msg.storage.th.dsource.scope-all'), value: 'ALL' },
    { label: this.translateService.instant('msg.storage.th.dsource.scope-row'), value: 'ROW' }
  ];

  // format
  private _format: FieldFormat;

  // sorted timestamp column data list
  private _sortedTimestampColumnDataList: string[];

  // timestamp field first/end data
  private _firstMomentData: any;
  private _endMomentData: any;

  // element
  @ViewChild('resultElement')
  private _resultElement: ElementRef;
  @ViewChild('resultBoxElement')
  private _resultBoxElement: ElementRef;

  // source create type
  public createType: string;

  // rollup type list
  public rollUpTypeList: any[];
  // selected rollup type
  public selectedRollUpType: any;

  // partition type list
  public partitionTypeList: any[];
  // selected partition type
  public selectedPartitionType: any;
  // partition key list
  public partitionKeyList: any[] = [];

  // segment granularity list
  public segmentGranularityList: GranularityObject[];
  // selected segment granularity
  public selectedSegmentGranularity: GranularityObject;
  // segment granularity list show flag
  public isShowSegmentGranularityList: boolean = false;

  // query granularity list
  public queryGranularityList: GranularityObject[];
  // selected query granularity
  public selectedQueryGranularity: GranularityObject;
  // query granularity list show flag
  public isShowQueryGranularityList: boolean = false;

  // expiration list (only linked source type)
  public expirationTimeList: any[] = [];
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
  // selected time in week (only engine source type)
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
  // isShowAdvancedSetting
  public isShowAdvancedSetting: boolean = false;

  // is show partition validation button (only stagingDB)
  public isStrictMode: boolean = false;
  // partition validation result (only stagingDB)
  public partitionValidationResult: boolean = null;
  // partition validation message
  public partitionValidationResultMessage: string;
  // partition validation result data
  public partitionValidationResultData: any;
  // partition result modal show flag
  public isShowPartitionValidResult: boolean = false;

  // clicked next button flag
  public isClickedNext: boolean;

  // interval input text
  public startIntervalText: string;
  public endIntervalText: string;
  // interval valid message
  public intervalValidMessage: string;
  // interval valid
  public intervalValid: boolean;
  // granularity unit
  public granularityUnit: number;



  // step change
  @Output()
  public prevStep: EventEmitter<any> = new EventEmitter();
  @Output()
  public nextStep: EventEmitter<any> = new EventEmitter();

  // constructor
  constructor(private _dataSourceService: DatasourceService,
              private _dataConnectionService: DataconnectionService,
              private _granularityService: GranularityService,
              protected element: ElementRef,
              protected renderer: Renderer2,
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
  public init(sourceData: DatasourceInfo, createType: string, selectedTimestampColumn: Field, isChangedTimestampField: boolean = false): void {
    // datasource data
    this._sourceData = sourceData;
    // create datasource type
    this.createType = createType;
    // set format
    this._format = selectedTimestampColumn ? selectedTimestampColumn.format : null;
    // ui init
    this._initView();
    // if exist ingestionData
    if (this._sourceData.hasOwnProperty("ingestionData")) {
      this._loadIngestionData(this._sourceData.ingestionData);
      // if changed timestamp field
      if (isChangedTimestampField) {
        // init granularity
        this._initGranularity();
        // if used TIMESTAMP column
        if (!this.isUsedCurrentTimestampColumn()) {
          // granularity interval initial
          this._initGranularityIntervalInfo();
        }
      }
    } else { // init
      this._setDefaultIngestionOption();
      // init granularity
      this._initGranularity();
      // if used TIMESTAMP column
      if (!this.isUsedCurrentTimestampColumn()) {
        // granularity interval initial
        this._initGranularityIntervalInfo();
      }
      // if staging type, set partition key list
      if (this.createType === 'STAGING' && this._sourceData.databaseData.selectedTableDetail.partitionFields.length > 0) {
        // set key list
        this.partitionKeyList.push(_.cloneDeep(this._sourceData.databaseData.selectedTableDetail.partitionFields));
        // set enable partition
        this.selectedPartitionType = this.partitionTypeList[1];
      } else if (this.createType === 'SNAPSHOT-STAGING') {
        const partitionList = JSON.parse(this._sourceData.snapshotData.selectedSnapshot.partitionColNames.toString());
        partitionList.length > 0 && this.partitionKeyList.push(partitionList.map((item) => {
          return {name: item};
        }));
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
    return this._sourceData.connectionData.selectedIngestionType.value;
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
    // click next button flag
    this.isClickedNext = true;
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
   * Partition validation click events
   */
  public onClickPartitionKeysValidation(): void {
    // if open result view, close
    if (this.isShowPartitionValidResult) {
      this.isShowPartitionValidResult = false;
    }
    // if multi partition, first partition required
    if (this._isEnablePartitionKeys(this.partitionKeyList)) {
      // set result
      this.partitionValidationResult = false;
      // set result message
      this.partitionValidationResultMessage = this.translateService.instant('msg.storage.ui.partition.valid.no.key');
      return;
    }

    const partitionParams = this._getPartitionParams(this.partitionKeyList);
    // if not exist params
    if (partitionParams.length === 0) {
      // set result
      this.partitionValidationResult = false;
      // set result message
      this.partitionValidationResultMessage = this.translateService.instant('msg.storage.ui.partition.valid.no.key');
      return;
    }
    // loading show
    this.loadingShow();
    // partition keys valid
    this._dataConnectionService.partitionValidationForStagingDB({
      database: this._sourceData.databaseData.selectedDatabase,
      query: this._sourceData.databaseData.selectedTable,
      type: 'TABLE',
      partitions: partitionParams
    })
      .then((result) => {
        // loading hide
        this.loadingHide();
        // set result
        this.partitionValidationResult = true;
        // set data
        this.partitionValidationResultData = result;
        // set result message
        this.partitionValidationResultMessage = this.translateService.instant('msg.storage.ui.partition.valid.success');
      })
      .catch(error => {
        // set result
        this.partitionValidationResult = false;
        // set result message
        if (error.code && error.code === 'JDC0006') {
          this.partitionValidationResultMessage = this.translateService.instant('msg.storage.ui.partition.valid.fail.invalid.key');
        } else {
          this.partitionValidationResultMessage = this.translateService.instant('msg.storage.ui.partition.valid.fail');
        }
        // loading hide
        this.loadingHide();
      });
  }

  /**
   * Partition validation result click event
   */
  public onClickPartitionKeyValidResult(): void {
    this.isShowPartitionValidResult = true;
    this.safelyDetectChanges();
    // set style
    $(this._resultBoxElement.nativeElement).css({
      display: 'block',
      top: $(this._resultElement.nativeElement).offset().top - 20,
      left: $(this._resultElement.nativeElement).offset().left + 80
    });
  }

  /**
   * Init partition validation event
   */
  public initPartitionValidation(): void {
    // init partitionValidationResult flag
    this.partitionValidationResult = null;
    // init isClickedNext flag
    this.isClickedNext = false;
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
    // if used TIMESTAMP column, granularity interval initial
    !this.isUsedCurrentTimestampColumn() && this._initGranularityIntervalInfo();
  }

  /**
   * Rollup change event
   * @param rollUp
   */
  public onChangeRollUpType(rollUp: any): void {
    this.selectedRollUpType = rollUp;
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
    //
    this.safelyDetectChanges();
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
   * Check start granularity interval
   */
  public checkStartInterval(): void {
    StringUtil.isEmpty(this.startIntervalText) && (this.startIntervalText = this._granularityService.getInitInterval(this._firstMomentData, this.selectedSegmentGranularity));
    // get interval validation info
    const validInfo = this._granularityService.getIntervalValidationInfo(this.startIntervalText, this.endIntervalText, this.selectedSegmentGranularity);
    this.intervalValid = validInfo.intervalValid;
    this.intervalValidMessage = validInfo.intervalValidMessage;
    this.granularityUnit = validInfo.granularityUnit;
  }

  /**
   * Check end granularity interval
   */
  public checkEndInterval(): void {
    StringUtil.isEmpty(this.endIntervalText) && (this.endIntervalText = this._granularityService.getInitInterval(this._endMomentData, this.selectedSegmentGranularity));
    // get interval validation info
    const validInfo = this._granularityService.getIntervalValidationInfo(this.startIntervalText, this.endIntervalText, this.selectedSegmentGranularity);
    this.intervalValid = validInfo.intervalValid;
    this.intervalValidMessage = validInfo.intervalValidMessage;
    this.granularityUnit = validInfo.granularityUnit;
  }


  /**
   * Is used current_time column in schema step
   * @returns {boolean}
   */
  public isUsedCurrentTimestampColumn(): boolean {
    return this._sourceData.schemaData.selectedTimestampType === 'CURRENT';
  }

  /**
   * is enable partition input
   * TODO f#35
   * @param {any[]} partitions
   * @param partition
   * @returns {boolean}
   */
  public isEnabledPartitionInput(partitions: any[], partition: any): boolean {
    const index = partitions.findIndex(item => item === partition);
    if (index !== 0
      && (partitions[index - 1].value === undefined || partitions[index - 1].value === '')) {
      return false;
    }
    return true;
  }

  /**
   * Is max row over max Value
   * @param row
   * @param {number} value
   * @returns {boolean}
   */
  public isMaxRowOverValue(row: any, value: number): boolean {
    return this[row] && this[row] > value;
  }

  /**
   * add partition in partition list
   */
  public addPartitionKeys(): void {
    // init validation
    this.initPartitionValidation();
    // create keys
    this.partitionKeyList.push(_.cloneDeep(this._sourceData.databaseData.selectedTableDetail.partitionFields));
  }

  /**
   * delete partition in partition list
   */
  public deletePartitionKeys(): void {
    // init validation
    this.initPartitionValidation();
    // remove keys
    this.partitionKeyList = this.partitionKeyList.slice(0, this.partitionKeyList.length - 1);
  }

  /**
   * convert file size
   * @param bytes
   * @returns {any}
   */
  public bytesToSize(bytes: number) {
    if (bytes === undefined || bytes === null || (typeof bytes !== 'number' && bytes === '')) {
      return ' bytes';
    } else {
      return CommonUtil.formatBytes(bytes, 2);
    }
  };

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // init roll up type list
    this.rollUpTypeList = [
      { label: this.translateService.instant('msg.storage.ui.set.true'), value: true },
      { label: this.translateService.instant('msg.storage.ui.set.false'), value: false },
    ];
    this.selectedRollUpType = this.rollUpTypeList[1];
    // init partition type list
    this.partitionTypeList = [
      { label: this.translateService.instant('msg.storage.ui.set.disable'), value: 'DISABLE' },
      { label: this.translateService.instant('msg.storage.ui.set.enable'), value: 'ENABLE' }
    ];
    this.selectedPartitionType = this.partitionTypeList[0];
    // init expiration time list
    this._setExpirationTimeList(this.expirationTimeList);
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
    // default HOURLY
    this.selectedBatchType = this.batchTypeList[1];
    // init hour list
    for (let i = 1; i < 24 ; i += 1) {
      this.hourList.push(i);
    }
    this.selectedHour = this.hourList[0];
    // init minute list
    for (let i = 10; i < 60 ; i += 10) {
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
    // init segment granularity list
    // #1058 remove MINUTE, SECOND in segment granularity
    this.segmentGranularityList = this._granularityService.getSegmentGranularityList();
    // set timestamp column data list
    this._sortedTimestampColumnDataList = this._sourceData.schemaData.timestampFieldData.sort();
  }

  /**
   * Init granularity
   * @private
   */
  private _initGranularity(): void {
    // if not exist format (Current time)
    if (!this._format) {
      // #1058 set default MONTH
      this.selectedSegmentGranularity = this._granularityList[5];
      this.selectedQueryGranularity = this._granularityList[5];
      // set segment granularity HOUR
      // this.selectedSegmentGranularity = this._granularityList[3];
      // set query granularity SECOND
      // this.selectedQueryGranularity =this._granularityList[1];
    } else if (this._format.type === FieldFormatType.DATE_TIME) { // if exist format, DATE_TIME type
      const initializedGranularity = this._granularityService.getInitializedGranularity(this._format.format, this._format.format.length - 1);
      this.selectedSegmentGranularity = initializedGranularity.segmentGranularity;
      this.selectedQueryGranularity = initializedGranularity.queryGranularity;
    } else if (this._format.type === FieldFormatType.UNIX_TIME) { // if exist format, UNIX_TIME type
      // set segment granularity HOUR
      this.selectedSegmentGranularity = this._granularityList[3];
      // set query granularity SECOND
      this.selectedQueryGranularity = this._granularityList[1];
    } else { // default
      // set segment granularity HOUR
      this.selectedSegmentGranularity = this._granularityList[3];
      // set query granularity SECOND
      this.selectedQueryGranularity = this._granularityList[1];
    }
    // init query granularity list
    this._updateQueryGranularityList(this.selectedSegmentGranularity);
  }

  /**
   * Update query granularity list
   * @param granularity
   * @private
   */
  private _updateQueryGranularityList(granularity: any): void {
    this.queryGranularityList = this._granularityService.getQueryGranularityList(granularity);
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
        (this.selectedIngestionType.value === 'batch' && (this.isMaxRowOverValue('ingestionPeriodRow', 5000000) || (this.selectedBatchType.value === 'EXPR' && !this.cronValidationResult)))
        || (this.selectedIngestionType.value === 'single' && this.selectedIngestionScopeType.value === 'ROW' && this.isMaxRowOverValue('ingestionOnceRow', 10000))
      )) {
      return false;
    }
    // If create type is StagingDB and strict mode
    if ((this.createType === 'STAGING' || this.createType === 'SNAPSHOT-STAGING') && this.isStrictMode && this.partitionKeyList.length !== 0 && !this.partitionValidationResult) {
      return false;
    }
    // valid interval granularity (only column TIMESTAMP)
    if (!this.isUsedCurrentTimestampColumn() && !this.intervalValid) {
      return false;
    }
    // valid tuning config (if exist tuningConfig error)
    if (this.tuningConfig.length !== 0 && _.some(this.tuningConfig, config => config.keyError || config.valueError)) {
      return false;
    }
    // valid job properties (if exist jobProperties error)
    if (this.jobProperties.length !== 0 && _.some(this.jobProperties, config => config.keyError || config.valueError)) {
      return false;
    }
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
        // result
        this.tuningConfig = result.filter(item => item.type === 'TUNING').map((item) => {
          return {key: item.name, value: '', ph: item.defaultValue, defaultOpt: true};
        });
        this.jobProperties = result.filter(item => item.type === 'JOB').map((item) => {
          return {key: item.name, value: '', ph: item.defaultValue,  defaultOpt: true};
        });
        // in stagingDB
        if (this.createType === 'STAGING') {
          // set strict mode flag
          this._setStrictModeFlag();
        } else {
          // loading hide
          this.loadingHide();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Set strict mode flag
   * @private
   */
  private _setStrictModeFlag(): void {
    // is check strict mode
    this._dataConnectionService.isStrictModeForStagingDB()
      .then((result) => {
        // set validation
        this.isStrictMode = result;
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
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
   * Get current time
   * @returns {string}
   * @private
   */
  private _getCurrentTime(): string {
    const date = new Date();
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  }

  /**
   * Get partition parameter
   * @param partitionKeyList
   * @returns {any}
   * @private
   */
  private _getPartitionParams(partitionKeyList: any): any {
    // result
    const result = [];
    // partition fields
    for (let i = 0; i < partitionKeyList.length; i++) {
      // partition keys
      const partitionKeys = partitionKeyList[i];
      // partition
      const partition = {};
      // loop
      for (let j = 0; j < partitionKeys.length; j++) {
        // #619 enable empty value
        // is value empty break for loop
        // if (StringUtil.isEmpty(partitionKeys[j].value)) {
        //   break;
        // }
        // add partition #619 enable empty value
        partition[partitionKeys[j].name] = (partitionKeys[j].value || '');
      }
      // if exist partition, add in result
      if (Object.keys(partition).length) {
        result.push(partition);
      }
    }
    return result;
  }

  /**
   * Granularity interval initial
   * @private
   */
  private _initGranularityIntervalInfo(): void {
    // granularity unit initial
    const info = this._granularityService.getInitializedInterval(this._sortedTimestampColumnDataList, this._format.format, this.selectedSegmentGranularity, this._format.type, this._format.unit);
    // set interval text
    this.startIntervalText = info.startInterval;
    this.endIntervalText = info.endInterval;
    this.intervalValid = info.intervalValid;
    this.intervalValidMessage = info.intervalValidMessage;
    this.granularityUnit = info.granularityUnit;
    // set moment data
    this._firstMomentData = info.firstMoment;
    this._endMomentData = info.endMoment;
  }

  /**
   * Check enable partition keys
   * @param partitionList
   * @returns {boolean}
   * @private
   */
  private _isEnablePartitionKeys(partitionList: any): boolean {
    return _.some(partitionList, (partition) => {
      return _.some(partition.filter((item, index, array) => {
        return index !== array.length -1;
      }), item => StringUtil.isEmpty(item.value));
    });
  }

  /**
   * Load ingestion data
   * @param ingestionData
   * @private
   */
  private _loadIngestionData(ingestionData:any): void {
    // query granularity list
    this.queryGranularityList = ingestionData.queryGranularityList;
    // load selected segment granularity
    this.selectedSegmentGranularity = ingestionData.selectedSegmentGranularity;
    // load selected query granularity
    this.selectedQueryGranularity = ingestionData.selectedQueryGranularity;
    // load selected rollup type
    this.selectedRollUpType = ingestionData.selectedRollUpType;
    // load tuning configuration
    this.tuningConfig = ingestionData.tuningConfig;
    // isShowAdvancedSetting
    this.isShowAdvancedSetting = ingestionData.isShowAdvancedSetting;
    // interval text
    this.startIntervalText = ingestionData.startIntervalText;
    this.endIntervalText = ingestionData.endIntervalText;
    // interval valid message
    this.intervalValidMessage = ingestionData.intervalValidMessage;
    // interval valid
    this.intervalValid = ingestionData.intervalValid;
    // granularity unit
    this.granularityUnit = ingestionData.granularityUnit;
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
      // cron text
      this.cronText = ingestionData.cronText;
    }
    // if create type is StagingDB
    if (this.createType === 'STAGING' || this.createType === 'SNAPSHOT-STAGING') {
      // load selected data range type
      // load selected partition type
      this.selectedPartitionType = ingestionData.selectedPartitionType;
      // load job properties
      this.jobProperties = ingestionData.jobProperties;
      // partition key list
      this.partitionKeyList = ingestionData.partitionKeyList;
      // is show partition validation button (only stagingDB)
      this.isStrictMode = ingestionData.isStrictMode;
      // partition validation result (only stagingDB)
      this.partitionValidationResult = ingestionData.partitionValidationResult;
      // partition validation message
      this.partitionValidationResultMessage = ingestionData.partitionValidationResultMessage;
      // partition validation result data
      this.partitionValidationResultData = ingestionData.partitionValidationResultData;
      // partition result modal show flag
      this.isShowPartitionValidResult = ingestionData.isShowPartitionValidResult;
      // clicked next button flag
      this.isClickedNext = ingestionData.isClickedNext;
    }
  }

  /**
   * Save ingestion data
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveIngestionData(sourceData: DatasourceInfo): void {
    sourceData['ingestionData'] = {
      // query granularity list
      queryGranularityList : this.queryGranularityList,
      // save selected segment granularity
      selectedSegmentGranularity : this.selectedSegmentGranularity,
      // save query granularity
      selectedQueryGranularity : this.selectedQueryGranularity,
      // save selected rollup type
      selectedRollUpType : this.selectedRollUpType,
      // save tuning configuration
      tuningConfig : this.tuningConfig,
      // isShowAdvancedSetting
      isShowAdvancedSetting: this.isShowAdvancedSetting,
      // interval text
      startIntervalText: this.startIntervalText,
      endIntervalText: this.endIntervalText,
      // interval valid message
      intervalValidMessage: this.intervalValidMessage,
      // interval valid
      intervalValid: this.intervalValid,
      // granularity unit
      granularityUnit: this.granularityUnit
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
      // cron text
      sourceData['ingestionData'].cronText = this.cronText;
    }
    // if create type Staging
    if (this.createType === 'STAGING' || this.createType === 'SNAPSHOT-STAGING') {
      // save selected partition type
      sourceData['ingestionData'].selectedPartitionType = this.selectedPartitionType;
      // selected job properties
      sourceData['ingestionData'].jobProperties = this.jobProperties;
      // partition key list
      sourceData['ingestionData'].partitionKeyList = this.partitionKeyList;
      // is show partition validation button (only stagingDB)
      sourceData['ingestionData'].isStrictMode = this.isStrictMode;
      // partition validation result (only stagingDB)
      sourceData['ingestionData'].partitionValidationResult = this.partitionValidationResult;
      // partition validation message
      sourceData['ingestionData'].partitionValidationResultMessage = this.partitionValidationResultMessage;
      // partition validation result data
      sourceData['ingestionData'].partitionValidationResultData = this.partitionValidationResultData;
      // partition result modal show flag
      sourceData['ingestionData'].isShowPartitionValidResult = this.isShowPartitionValidResult;
      // clicked next button flag
      sourceData['ingestionData'].isClickedNext = this.isClickedNext;
    }
  }
}
