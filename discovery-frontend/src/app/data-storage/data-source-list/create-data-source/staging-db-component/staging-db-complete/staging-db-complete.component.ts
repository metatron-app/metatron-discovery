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
import {
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonUtil } from '../../../../../common/util/common.util';
import { Alert } from '../../../../../common/util/alert.util';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { DatasourceInfo, FieldFormatType, IngestionRuleType } from '../../../../../domain/datasource/datasource';
import * as _ from 'lodash';
import { StringUtil } from '../../../../../common/util/string.util';
import { ConfirmModalComponent } from '../../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../../common/domain/modal';
import { CookieConstant } from '../../../../../common/constant/cookie.constant';
import {CommonConstant} from "../../../../../common/constant/common.constant";

/**
 * Creating datasource with StagingDB - complete step
 */
@Component({
  selector: 'staging-db-complete',
  templateUrl: './staging-db-complete.component.html'
})
export class StagingDbCompleteComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  // datasource data
  private _sourceData: DatasourceInfo;

  @ViewChild(ConfirmModalComponent)
  private _confirmModal: ConfirmModalComponent;

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this._sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  @Output('stagingComplete')
  public stagingComplete = new EventEmitter();

  // the name of the datasource to create
  public datasourceName: string = '';

  // the name of the datasource to description
  public datasourceDesc: string = '';

  // is invalid name
  public isInvalidName: boolean = false;
  // name validation message
  public errMsgName: string = '';

  // is invalid description
  public isInvalidDesc: boolean = false;
  // description validation message
  public errMsgDesc: string = '';

  // Constructor
  constructor(private datasourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
    // ui init
    this._initView();
    // if createData is exist, load createData
    if (this._sourceData.hasOwnProperty('createData')) {
      this._loadData(this._sourceData.createData);
    }
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
    // if createData is exist, delete createData
    if (this._sourceData.hasOwnProperty('createData')) {
      delete this._sourceData.createData;
    }
    // save createData
    this._saveCreateData(this._sourceData);
    // move to previous step
    this.step = 'staging-db-ingestion';
    this.stepChange.emit(this.step);
  }

  /**
   * Done button click event
   */
  public done(): void {
    // datasource name is empty
    if (StringUtil.isEmpty(this.datasourceName)) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return;
    }
    // check datasource name length
    if (CommonUtil.getByte(this.datasourceName.trim()) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return;
    }
    // check datasource description length
    if (this.datasourceDesc.trim() !== ''
      && CommonUtil.getByte(this.datasourceDesc.trim()) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return;
    }
    // validation
    if (this.isEnableDone()) {
      // create datasource
      this._createDatasource();
    }
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
   * Getter IngestionData
   * @returns {any}
   */
  public get getIngestionData(): any {
    return this._sourceData.ingestionData;
  }

  /**
   * Get data range time label
   * @returns {string}
   */
  public getDataRangeTimeLabel(): string {
    const datePipe = new DatePipe('en-EN');
    return datePipe.transform(this.getIngestionData.startDateTime, 'yyyy-MM-dd HH:mm')
      + ' ~ ' + datePipe.transform(this.getIngestionData.endDateTime, 'yyyy-MM-dd HH:mm');
  }

  /**
   * Get partition key label
   * @returns {string}
   */
  public getPartitionsEnabledLabel(): string {
    return this.translateService.instant('msg.storage.ui.partition.enable.count.label', {value: this._getPartitionFields.length});
  }


  /**
   * Get validation done
   * @returns {boolean}
   */
  public isEnableDone(): boolean {
    // datasource name is not empty
    return StringUtil.isNotEmpty(this.datasourceName);
  }


  /**
   * Load createData
   * @param createData
   * @private
   */
  private _loadData(createData: any): void {
    this.datasourceName = createData.datasourceName;
    this.datasourceDesc = createData.datasourceDesc;
  }

  /**
   * Save createData
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveCreateData(sourceData: DatasourceInfo): void {
    sourceData['createData'] = {
      datasourceName: this.datasourceName,
      datasourceDesc: this.datasourceDesc
    };
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
        Alert.success(`'${this.datasourceName.trim()}' ` + this.translateService.instant('msg.storage.alert.source.create.success'));
        // 개인 워크스페이스
        const workspace = JSON.parse(this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE));
        // 워크스페이스 매핑
        this.datasourceService.addDatasourceWorkspaces(result.id, [workspace['id']])
          .then(() => {
            // link datasource detail (#505)
            this.router.navigate(['/management/storage/datasource', result.id]);
            // close
            this.step = '';
            this.stagingComplete.emit(this.step);
          })
          .catch(() => {
            // link datasource detail (#505)
            this.router.navigate(['/management/storage/datasource', result.id]);
            // close
            this.step = '';
            this.stagingComplete.emit(this.step);
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
    // if not GEO types
    if (column.logicalType.indexOf('GEO_') === -1) {
      if (column.logicalType !== 'TIMESTAMP' && column.format) {
        delete column.format;
      } else if (column.logicalType === 'TIMESTAMP' && column.format.type === FieldFormatType.UNIX_TIME) {
        delete column.format.format;
      } else if (column.logicalType === 'TIMESTAMP' && column.format.type === FieldFormatType.DATE_TIME) {
        delete column.format.unit;
      }
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
   * Getter partitionFileds
   * @returns {any}
   */
  private get _getPartitionFields() {
    return this.getIngestionData.partitionKeyList;
  }

  /**
   * Get parameters required for datasource creation
   * @returns {Object}
   * @private
   */
  private _getCreateDatasourceParams(): object {
    return {
      dsType: 'MASTER',
      connType: 'ENGINE',
      srcType: 'HIVE',
      fields: this._getFieldsParams(),
      granularity: this.getIngestionData.selectedQueryGranularity.value,
      segGranularity: this.getIngestionData.selectedSegmentGranularity.value,
      name: this.datasourceName.trim(),
      description: this.datasourceDesc.trim(),
      // ingestion
      ingestion: this._getIngestionParams()
    };
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
    let fields = _.cloneDeep(this.getSchemaData.fields);
    // seq number
    let seq = 0;
    // field setting
    fields.forEach((column) => {
      // set seq num and increase seq
      column['seq'] = seq++;
      // set ingestion rule
      this._setColumnIngestionRule(column);
      // if you don't want to create a timestamp column
      if (!isCreateTimestamp) {
        // if specified as a timestamp column
        if (column.name === this.getSchemaData.selectedTimestampColumn.name) {
          column.role = 'TIMESTAMP';
        } else if (column.name !== this.getSchemaData.selectedTimestampColumn.name
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
   * Get file format parameter
   * @returns {Object}
   * @private
   */
  private _getFileFormatParams(): object {
    const format = _.cloneDeep(this.getDatabaseData.selectedTableDetail.fileFormat);
    // if CSV
    if (this.getDatabaseData.selectedTableDetail.fileFormat.type === 'CSV') {
      // add line separator
      format['lineSeparator'] = '\n';
    }
    return format;
  }

  /**
   * Get partition parameter
   * @returns {Object}
   * @private
   */
  private _getPartitionParams(): object {
    // result
    const result = [];
    // partition fields
    const fields = this._getPartitionFields;
    for (let i = 0; i < fields.length; i++) {
      // partition keys
      const partitionKeys = fields[i];
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
   * Get ingestion parameter
   * @returns {Object}
   * @private
   */
  private _getIngestionParams(): object {
    // ingestion param
    const ingestion = {
      type: 'hive',
      format: this._getFileFormatParams(),
      source: this.getDatabaseData.selectedDatabase + '.' + this.getDatabaseData.selectedTable,
      partitions: this.getIngestionData.selectedPartitionType.value === 'ENABLE' ? this._getPartitionParams() : [],
      rollup: this.getIngestionData.selectedRollUpType.value
    };
    // is enable data range
    if (this.getIngestionData.selectedDataRangeType.value === 'ENABLE') {
      ingestion['intervals'] = [this.getIngestionData.startDateTime + '/' + this.getIngestionData.endDateTime];
    }
    // advanced setting
    if (this.getIngestionData.tuningConfig.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)).length > 0) {
      ingestion['tuningOptions'] = this._toObject(this.getIngestionData.tuningConfig.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)));
    }
    if (this.getIngestionData.jobProperties.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)).length > 0) {
      ingestion['jobProperties'] = this._toObject(this.getIngestionData.jobProperties.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)));
    }
    return ingestion;
  }

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    this.datasourceName = '';
    this.datasourceDesc = '';
  }
}
