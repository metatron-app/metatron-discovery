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

import {AbstractPopupComponent} from '../../../../../common/component/abstract-popup.component';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  DatasourceInfo,
  Field,
  FieldFormatType,
  IngestionRuleType
} from '../../../../../domain/datasource/datasource';
import {Alert} from '../../../../../common/util/alert.util';
import {DatasourceService} from '../../../../../datasource/service/datasource.service';
import {CommonUtil} from '../../../../../common/util/common.util';
import * as _ from 'lodash';
import {StringUtil} from '../../../../../common/util/string.util';
import {ConfirmModalComponent} from '../../../../../common/component/modal/confirm/confirm.component';
import {Modal} from '../../../../../common/domain/modal';
import {CookieConstant} from '../../../../../common/constant/cookie.constant';
import {CommonConstant} from "../../../../../common/constant/common.constant";
import {GranularityService} from "../../../../service/granularity.service";
import {
  CreateSourceCompleteData,
  DataSourceCreateService
} from "../../../../service/data-source-create.service";
import {DataStorageConstant} from "../../../../constant/data-storage-constant";

/**
 * Creating datasource with Stream - complete step
 */
@Component({
  selector: 'stream-complete',
  templateUrl: './stream-complete.component.html'
})
export class StreamCompleteComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  // datasource data
  @Input('sourceData')
  private _sourceData: DatasourceInfo;

  @ViewChild(ConfirmModalComponent)
  private confirmModal: ConfirmModalComponent;

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // create complete data
  public createCompleteData: CreateSourceCompleteData;

  @Output()
  public readonly onComplete: EventEmitter<any> = new EventEmitter();

  // Constructor
  constructor(private datasourceService: DatasourceService,
              private _dataSourceCreateService: DataSourceCreateService,
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
    // set create complete data
    this.createCompleteData = this._sourceData.completeData ? _.cloneDeep(this._sourceData.completeData) : new CreateSourceCompleteData();
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
    this.step = 'stream-ingestion';
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

    this._createDatasource();
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

  public get getKafkaData() {
    return this._sourceData.kafkaData;
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
            this.close();
          })
          .catch(() => {
            // link datasource detail (#505)
            this.router.navigate(['/management/storage/datasource', result.id]);
            // close
            this.close();
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
  private _deleteColumnProperty(column): void {
    delete column.biType;
    // if disable originalName
    if (Field.isDisableOriginalName(column)) {
      Field.removeOriginalNameProperty(column);
    }
    // if unloaded property is false, delete unloaded property
    if (column.unloaded === false) {
      delete column.unloaded;
    }
    // delete used UI
    delete column.checked;
    if (!Field.isEmptyIngestionRule(column)) {
      delete column.ingestionRule.isValidReplaceValue;
      delete column.ingestionRule.replaceValidationMessage;
    }
    if (!Field.isEmptyFormat(column)) {
      delete column.format.isValidFormat;
      delete column.format.formatValidMessage;
    }
    // if not GEO types
    if (!Field.isGeoType(column)) {
      if (!Field.isTimestampTypeField(column) && column.format) {
        delete column.format;
      } else if (Field.isTimestampTypeField(column) && column.format.type === FieldFormatType.UNIX_TIME) {
        // remove format
        delete column.format.format;
        // remove timezone
        delete column.format.timeZone;
        delete column.format.locale;
      } else if (Field.isTimestampTypeField(column) && column.format.type === FieldFormatType.DATE_TIME) {
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
   * Get parameters required for datasource creation
   * @returns {Object}
   * @private
   */
  private _getCreateDatasourceParams(): object {
    return {
      dsType: 'MASTER',
      srcType: 'REALTIME',
      connType: 'ENGINE',
      granularity: this.getIngestionData.selectedQueryGranularity.value,
      segGranularity: this.getIngestionData.selectedSegmentGranularity.value,
      name: this.createCompleteData.sourceName.trim(),
      description: this.createCompleteData.sourceDescription ? this.createCompleteData.sourceDescription.trim() : '',
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
    const isCreateTimestamp = this.getSchemaData.selectedTimestampType === DataStorageConstant.Datasource.TimestampType.CURRENT;
    // fields param
    let fields = _.cloneDeep(this.getSchemaData.fieldList);
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
   * Get ingestion parameter
   * @returns {Object}
   * @private
   */
  private _getIngestionParams(): object {
    // ingestion param
    const ingestion = {
      type: 'realtime',
      topic: this._sourceData.kafkaData.topic,
      consumerType: 'KAFKA',
      consumerProperties: {
        "bootstrap.servers": this._sourceData.kafkaData.bootstrapServer
      },
      format: {
        "type": 'json'
      }
    };
    // advanced
    if (this.getIngestionData.tuningConfig.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)).length > 0) {
      ingestion['tuningOptions'] = this._toObject(this.getIngestionData.tuningConfig.filter(item => StringUtil.isNotEmpty(item.key) && StringUtil.isNotEmpty(item.value)));
    }
    // if not used current_time TIMESTAMP, set intervals
    if (this.getSchemaData.selectedTimestampType !== DataStorageConstant.Datasource.TimestampType.CURRENT) {
      ingestion['intervals'] =  [this._granularityService.getIntervalUsedParam(this.getIngestionData.startIntervalText, this.getIngestionData.selectedSegmentGranularity) + '/' + this._granularityService.getIntervalUsedParam(this.getIngestionData.endIntervalText, this.getIngestionData.selectedSegmentGranularity)];
    }
    return ingestion;
  }
}
