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
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output, ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { DatasourceInfo, FieldFormatType, IngestionRuleType } from '../../../../../domain/datasource/datasource';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { Alert } from '../../../../../common/util/alert.util';
import { CommonUtil } from '../../../../../common/util/common.util';
import { StringUtil } from '../../../../../common/util/string.util';
import { ConfirmModalComponent } from '../../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../../common/domain/modal';
import { CookieConstant } from '../../../../../common/constant/cookie.constant';
import {CommonConstant} from "../../../../../common/constant/common.constant";
import {GranularityService} from "../../../../service/granularity.service";
import {CreateSourceCompleteData} from "../../../../service/data-source-create.service";
import {StorageService} from "../../../../service/storage.service";
import {AuthenticationType, JdbcDialect} from "../../../../../domain/dataconnection/dataconnection";
import * as _ from 'lodash';

/**
 * Creating datasource with Database - complete step
 */
@Component({
  selector: 'db-complete',
  templateUrl: './db-complete.component.html'
})
export class DbCompleteComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  private _connectionType: JdbcDialect;

  // datasource dat
  @Input('sourceData')
  private _sourceData: DatasourceInfo;

  @ViewChild(ConfirmModalComponent)
  private _confirmModal: ConfirmModalComponent;

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  @Output('dbComplete')
  public dbComplete = new EventEmitter();

  // create complete data
  public createCompleteData: CreateSourceCompleteData;

  // Constructor
  constructor(private datasourceService: DatasourceService,
              private _granularityService: GranularityService,
              private storageService: StorageService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
    // set create complete data
    this.createCompleteData = this._sourceData.completeData ? _.cloneDeep(this._sourceData.completeData) : new CreateSourceCompleteData();
    // set connection type
    this._connectionType = this.storageService.findConnectionType(this._sourceData.connectionData.connection.implementor);
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }


  /**
   * Prev button click event
   */
  public prev(): void {
    // set create complete data in source data
    this._sourceData.completeData = this.createCompleteData;
    // move to previous step
    this.step = 'db-ingestion-permission';
    this.stepChange.emit(this.step);
  }

  /**
   * Done button click event
   */
  public done(): void {
    // datasource name is empty
    if (StringUtil.isEmpty(this.createCompleteData.sourceName)) {
      this.createCompleteData.isInvalidName = true;
      this.createCompleteData.nameInvalidMessage = this.translateService.instant('msg.alert.edit.name.empty');
      return;
    } else if (CommonUtil.getByte(this.createCompleteData.sourceName.trim()) > 150) { // check datasource name length
      this.createCompleteData.isInvalidName = true;
      this.createCompleteData.nameInvalidMessage = this.translateService.instant('msg.alert.edit.name.len');
      return;
    }
    // check datasource description length
    if (StringUtil.isNotEmpty(this.createCompleteData.sourceDescription)
      && CommonUtil.getByte(this.createCompleteData.sourceDescription.trim()) > 450) {
      this.createCompleteData.isInvalidDesc = true;
      this.createCompleteData.descInvalidMessage = this.translateService.instant('msg.alert.edit.description.len');
      return;
    }
    // create datasource
    this._createDatasource();
  }

  public getConnectionType(): string {
    return this._connectionType.name;
  }


  /**
   * Getter connectionData
   * @returns {any}
   */
  public get getConnectionData(): any {
    return this._sourceData.connectionData;
  }

  /**
   * Getter databaseData
   * @returns {any}
   */
  public get getDatabaseData(): any {
    return this._sourceData.databaseData;
  }

  /**
   * Getter schemaData
   * @returns {any}
   */
  public get getSchemaData(): any {
    return this._sourceData.schemaData;
  }

  /**
   * Getter ingestionData
   * @returns {any}
   */
  public get getIngestionData(): any {
    return this._sourceData.ingestionData;
  }

  /**
   * Get selected day label
   * @returns {string}
   */
  public getSelectedDaysLabel(): string {
    return this.getIngestionData.dateList
      .filter(date => date.checked)
      .map(day => day.label).toString();
  }

  /**
   * Get ingestion batch row
   * @returns {number}
   */
  public getIngestionBatchRow(): number {
    return StringUtil.isEmpty(this.getIngestionData.ingestionPeriodRow) ? 10000 : this.getIngestionData.ingestionPeriodRow;
  }

  /**
   * Get ingestion once row
   * @returns {number}
   */
  public getIngestionOnceRow(): number {
    return StringUtil.isEmpty(this.getIngestionData.ingestionOnceRow) ? 10000 : this.getIngestionData.ingestionOnceRow;
  }

  /**
   * Is database required
   * @returns {boolean}
   */
  public isRequiredDatabase(): boolean {
    return this.storageService.isRequireDatabase(this._connectionType);

  }

  /**
   * Is SID required
   * @returns {boolean}
   */
  public isRequiredSid() : boolean {
    return this.storageService.isRequireSid(this._connectionType);
  }

  /**
   * Is Catalog required
   * @returns {boolean}
   */
  public isRequiredCatalog() : boolean {
    return this.storageService.isRequireCatalog(this._connectionType);
  }

  /**
   *  Is enable url
   * @returns {boolean}
   */
  public isEnableUrl(): boolean {
    return StringUtil.isNotEmpty(this.getConnectionData.connection.url);
  }

  /**
   * Create datasource
   * @private
   */
  private _createDatasource(): void {
    // loading show
    this.loadingShow();
    // create datasource
    this.datasourceService.createDatasource(this._getCreateDatasourceParams())
      .then((result) => {
        // complete alert
        Alert.success(`'${this.createCompleteData.sourceName.trim()}' ` + this.translateService.instant('msg.storage.alert.source.create.success'));
        // 개인 워크스페이스
        const workspace = JSON.parse(this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE));
        // 워크스페이스 매핑
        this.datasourceService.addDatasourceWorkspaces(result.id, [workspace['id']])
          .then(() => {
            // link datasource detail (#505)
            this.router.navigate(['/management/storage/datasource', result.id]);
            // close
            this.step = '';
            this.dbComplete.emit(this.step);
          })
          .catch(() => {
            // link datasource detail (#505)
            this.router.navigate(['/management/storage/datasource', result.id]);
            // close
            this.step = '';
            this.dbComplete.emit(this.step);
          });
      })
      .catch((error) => {
        // loading hide
        this.loadingHide();
        // modal
        const modal: Modal = new Modal();
        // show cancel disable
        modal.isShowCancel = false;
        // title
        modal.name = this.translateService.instant('msg.storage.ui.source.create.fail.title');
        // desc
        modal.description = this.translateService.instant('msg.storage.ui.source.create.fail.description');
        // show error modal
        this._confirmModal.init(modal);
      });
  }

  /**
   * Create current column
   * @param {number} seq
   * @returns {Object}
   * @private
   */
  private _createCurrentColumn(seq: number): object {
    return {
      seq: seq,
      name: CommonConstant.COL_NAME_CURRENT_DATETIME,
      type: 'TIMESTAMP',
      role: 'TIMESTAMP',
      derived: true,
      format: {
        type: FieldFormatType.TEMPORARY_TIME,
        format: 'yyyy-MM-dd HH:mm:ss'
      }
    };
  }

  /**
   * Delete unnecessary property in column
   * TODO 추후 개선필요
   * @param column
   * @private
   */
  private _deleteColumnProperty(column: any): void {
    delete column.biType;
    delete column.replaceFl;
    // if unloaded property is false, delete unloaded property
    if (column.unloaded === false) {
      delete column.unloaded;
    }
    // delete used UI
    delete column.isValidTimeFormat;
    delete column.isValidReplaceValue;
    delete column.replaceValidMessage;
    delete column.timeFormatValidMessage;
    delete column.checked;
    if (column.format) {
      delete column.format.isValidFormat;
      delete column.format.formatValidMessage;
    }
    // if not GEO types
    if (column.logicalType.indexOf('GEO_') === -1) {
      if (column.logicalType !== 'TIMESTAMP' && column.format) {
        delete column.format;
      } else if (column.logicalType === 'TIMESTAMP' && column.format.type === FieldFormatType.UNIX_TIME) {
        // remove format
        delete column.format.format;
        // remove timezone
        delete column.format.timeZone;
        delete column.format.locale;
      } else if (column.logicalType === 'TIMESTAMP' && column.format.type === FieldFormatType.DATE_TIME) {
        delete column.format.unit;
      }
    } else {  // if GEO types
      delete column.format.unit;
    }
  }

  /**
   * Set ingestion rule in column
   * @param column
   * @private
   */
  private _setColumnIngestionRule(column): void {
    // if exist ingestion rule property
    if (column.hasOwnProperty('ingestionRule')) {
      // ingestion type
      const type = column.ingestionRule.type;
      // if type is default
      if (type === IngestionRuleType.DEFAULT) {
        delete column.ingestionRule;
      } else if (type === IngestionRuleType.DISCARD) {
        delete column.ingestionRule.value;
      }
    }
  }

  /**
   * Convert array to object
   * @param array
   * @returns {Object}
   * @private
   */
  private _toObject(array: any): object {
    const result = {};
    array.forEach((item) => {
      result[item.key] = item.value;
    });
    return result;
  }

  /**
   * Get period value
   * @returns {any}
   * @private
   */
  private _getPeriodValue(): any {
    switch (this.getIngestionData.selectedBatchType.value) {
      case 'WEEKLY':
        return this.getIngestionData.selectedWeeklyTime;
      case 'DAILY':
        return this.getIngestionData.selectedDailyTime;
      case 'HOURLY':
        return this.getIngestionData.selectedHour;
      case 'MINUTELY':
        return this.getIngestionData.selectedMinute;
      case 'EXPR':
        return this.getIngestionData.cronText;
      default:
        return null;
    }
  }

  /**
   * Get period week values
   * @returns {any}
   * @private
   */
  private _getPeriodWeekDays(): any {
    return this.getIngestionData.dateList
      .filter(date => date.checked)
      .map(day => day.value);
  }


  /**
   * Get parameters required for connection
   * @returns {Object}
   * @private
   */
  private _getConnectionParams(): object {
    const connection = _.cloneDeep(this.getConnectionData.connection);
    connection['type'] = 'JDBC';
    return connection;
  }

  /**
   * Get parameters required for datasource creation
   * @returns {Object}
   * @private
   */
  private _getCreateDatasourceParams(): object {
    const params = {
      dsType: 'MASTER',
      srcType: 'JDBC',
      connType: this.getConnectionData.selectedIngestionType.value,
      granularity: this.getIngestionData.selectedQueryGranularity.value,
      segGranularity: this.getIngestionData.selectedSegmentGranularity.value,
      name: this.createCompleteData.sourceName.trim(),
      description: this.createCompleteData.sourceDescription ? this.createCompleteData.sourceDescription.trim() : '',
      ingestion: this._getIngestionParams(),
      fields: this._getFieldsParams()
    };
    // if used connection preset, use connection ID
    if (this._isCreateInWorkbench || !this.getConnectionData.selectedConnectionPreset.default) {
      params['connection'] = `/api/connections/${this.getConnectionData.selectedConnectionPreset.id}`;
    }
    return params;
  }

  /**
   * Get fields parameter
   * @returns {any[]}
   * @private
   */
  private _getFieldsParams(): any[] {
    // timestamp enable
    const isCreateTimestamp = this.getSchemaData.selectedTimestampType === 'CURRENT';
    // fields param
    let fields = _.cloneDeep(this.getSchemaData._originFieldList);
    // seq number
    let seq = 0;
    // field 설정
    fields.forEach((column) => {
      // set seq num and increase seq
      column['seq'] = seq++;
      // set ingestion rule
      this._setColumnIngestionRule(column);
      // if you don't want to create a timestamp column
      if (!isCreateTimestamp) {
        // if specified as a timestamp column
        if (column.name === this.getSchemaData.selectedTimestampField.name) {
          column.role = 'TIMESTAMP';
        } else if (column.name !== this.getSchemaData.selectedTimestampField.name
          && column.role === 'TIMESTAMP') {
          // this column is not timestamp column, but column role is timestamp, specified as Dimension
          column.role = 'DIMENSION';
        }
      }
      // delete unnecessary property
      this._deleteColumnProperty(column);
    });
    // if no column is specified as timestamp
    if (isCreateTimestamp) {
      fields.push(this._createCurrentColumn(seq));
    }
    return fields;
  }

  /**
   * Get period parameters
   * @returns {Object}
   * @private
   */
  private _getPeriodParams(): object {
    const period = {
      frequency: this.getIngestionData.selectedBatchType.value,
    };
    // if batch type is DAILY or WEEKLY, add time
    if (this.getIngestionData.selectedBatchType.value === 'DAILY' || this.getIngestionData.selectedBatchType.value === 'WEEKLY') {
      period['time'] = this._getPeriodValue();
      // if batch type is WEEKLY, add weekDays
      if (this.getIngestionData.selectedBatchType.value === 'WEEKLY') {
        period['weekDays'] = this._getPeriodWeekDays();
      }
    } else {
      period['value'] = this._getPeriodValue();
    }
    return period;
  }

  /**
   * Get ingestion parameters
   * @returns {Object}
   * @private
   */
  private _getIngestionParams(): object {
    // ingestion param
    const ingestion = {
      dataType: this.getDatabaseData.selectedTab,
      type: this.getIngestionData.selectedIngestionType.value,
      rollup: this.getIngestionData.selectedRollUpType.value
    };
    // if database is TABLE
    if (this.getDatabaseData.selectedTab === 'TABLE') {
      ingestion['query'] = this.getDatabaseData.selectedTable;
      ingestion['database'] = this.getDatabaseData.selectedDatabase;
    } else {
      // if database is QUERY
      ingestion['query'] = this.getDatabaseData.queryText;
      ingestion['database'] = this.getDatabaseData.selectedDatabaseInQuery;
    }
    // if source type is LINK
    if (this.getConnectionData.selectedIngestionType.value === 'LINK') {
      ingestion['type'] = 'link';
      ingestion['expired'] = this.getIngestionData.selectedExpirationTime.value;
    }
    // if ingestion type is batch
    if (this.getIngestionData.selectedIngestionType.value === 'batch') {
      // add period
      ingestion['period'] = this._getPeriodParams();
      // add row size
      ingestion['maxLimit'] = this.getIngestionBatchRow();
      // add data range
      ingestion['range'] = this.getIngestionData.selectedIngestionScopeType.value;
    } else if (this.getIngestionData.selectedIngestionType.value === 'single') {
      // add scope type
      ingestion['scope'] = this.getIngestionData.selectedIngestionScopeType.value;
      // add row size
      if (this.getIngestionData.selectedIngestionScopeType.value === 'ROW') {
        ingestion['maxLimit'] = this.getIngestionOnceRow();
      }
    }
    // if not exist connection preset
    if (this.getConnectionData.selectedConnectionPreset.default) {
      ingestion['connection'] = this._getConnectionParams();
    }
    // if authentication type is DIALOG, add connectionUsername and connectionPassword
    if (this.getConnectionData.connection.authenticationType === AuthenticationType.DIALOG) {
      delete ingestion['connection'].username;
      delete ingestion['connection'].password;
      ingestion['connectionUsername'] = this.getConnectionData.connection.username;
      ingestion['connectionPassword'] = this.getConnectionData.connection.password;
    }
    // advanced setting
    if (this.getIngestionData.tuningConfig.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)).length > 0) {
      ingestion['tuningOptions'] = this._toObject(this.getIngestionData.tuningConfig.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)));
    }
    // if not used current_time TIMESTAMP, set intervals
    if (this.getSchemaData.selectedTimestampType !== 'CURRENT') {
      ingestion['intervals'] =  [this._granularityService.getIntervalUsedParam(this.getIngestionData.startIntervalText, this.getIngestionData.selectedSegmentGranularity) + '/' + this._granularityService.getIntervalUsedParam(this.getIngestionData.endIntervalText, this.getIngestionData.selectedSegmentGranularity)];
    }
    return ingestion;
  }

  /**
   * Is create in workbench
   * @returns {boolean}
   * @private
   */
  private get _isCreateInWorkbench(): boolean {
    return this._sourceData.workbenchFl;
  }
}
