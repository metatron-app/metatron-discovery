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
import { DatasourceInfo, FieldFormatType, IngestionRuleType } from '../../../../../domain/datasource/datasource';
import { Alert } from '../../../../../common/util/alert.util';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { CommonUtil } from '../../../../../common/util/common.util';
import * as _ from 'lodash';
import { StringUtil } from '../../../../../common/util/string.util';
import { ConfirmModalComponent } from '../../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../../common/domain/modal';
import { CookieConstant } from '../../../../../common/constant/cookie.constant';
import {CommonConstant} from "../../../../../common/constant/common.constant";
import {GranularityService} from "../../../../service/granularity.service";

/**
 * Creating datasource with File - complete step
 */
@Component({
  selector: 'file-complete',
  templateUrl: './file-complete.component.html'
})
export class FileCompleteComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  // datasource data
  private _sourceData: DatasourceInfo;

  @ViewChild(ConfirmModalComponent)
  private confirmModal: ConfirmModalComponent;

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this._sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  @Output('fileComplete')
  public fileComplete = new EventEmitter();

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
              private _granularityService: GranularityService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    // Init
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
    this.step = 'file-ingestion';
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
   * Getter fileData
   * @returns {any}
   */
  public get getFileData() {
    return this._sourceData.fileData;
  }

  /**
   * Getter schemaData
   * @returns {any}
   */
  public get getSchemaData() {
    return this._sourceData.schemaData;
  }

  /**
   * Getter IngestionData
   * @returns {any}
   */
  public get getIngestionData() {
    return this._sourceData.ingestionData;
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
   * Is excel file
   * @returns {boolean}
   */
  public isExcelFile(): boolean {
    return (this.getFileData.datasourceFile.hasOwnProperty('sheets')
      && this.getFileData.datasourceFile.sheets.length !== 0);
  }


  /**
   * Load createData
   * @param createData
   * @private
   */
  private _loadData(createData: any) {
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
            this.fileComplete.emit(this.step);
          })
          .catch(() => {
            // link datasource detail (#505)
            this.router.navigate(['/management/storage/datasource', result.id]);
            // close
            this.step = '';
            this.fileComplete.emit(this.step);
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
        this.confirmModal.init(modal);
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
    delete column.replaceValidMessage;
    delete column.timeFormatValidMessage;
    delete column.checked;
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
   * Get file format
   * @returns {string}
   * @private
   */
  private _getFileFormat(): string {
    return this.isExcelFile() ? 'excel' : 'csv';
  }

  /**
   * Get parameters required for datasource creation
   * @returns {Object}
   * @private
   */
  private _getCreateDatasourceParams(): object {
    return {
      dsType: 'MASTER',
      srcType: 'FILE',
      connType: 'ENGINE',
      granularity: this.getIngestionData.selectedQueryGranularity.value,
      segGranularity: this.getIngestionData.selectedSegmentGranularity.value,
      name: this.datasourceName.trim(),
      description: this.datasourceDesc.trim(),
      ingestion: this._getIngestionParams(),
      fields: this._getFieldsParams()
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
    let fields = _.cloneDeep(this.getSchemaData._originFieldList);
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
   * Get file format parameter
   * @returns {Object}
   * @private
   */
  private _getFileFormatParams(): object {
    const format = {
      type: this._getFileFormat(),
    };
    // if file format is csv, add delimiter and lineSeparator
    if (this._getFileFormat() === 'csv') {
      format['delimiter'] = this.getFileData.delimiter;
      format['lineSeparator'] = this.getFileData.separator;
    } else {
      // add sheetIndex
      format['sheetIndex'] = this.getFileData.datasourceFile.sheets.findIndex(item => item === this.getFileData.datasourceFile.selectedSheetName);
    }
    return format;
  }

  /**
   * Get ingestion parameter
   * @returns {Object}
   * @private
   */
  private _getIngestionParams(): object {
    // ingestion param
    const ingestion = {
      type: 'local',
      format: this._getFileFormatParams(),
      removeFirstRow: !this.getFileData.createHeadColumnFl,
      path: this.getFileData.datasourceFile.filepath,
      rollup: this.getIngestionData.selectedRollUpType.value
    };
    // advanced
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
   * ui init
   * @private
   */
  private _initView(): void {
    this.datasourceName = '';
    this.datasourceDesc = '';
  }
}
