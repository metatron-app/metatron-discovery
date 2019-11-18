/*
 *
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

import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataConstant} from "../../metadata.constant";
import {MetadataEntity} from "../metadata.entity";
import {DataconnectionService} from "../../../dataconnection/service/dataconnection.service";
import * as _ from "lodash";
import {isNullOrUndefined} from "util";
import {SchemaTableListComponent} from "./component/schema-table-list.component";
import SchemaInfo = MetadataEntity.SchemaInfo;
import {SchemaTablePreviewComponent} from "./component/schema-table-preview.component";

@Component({
  selector: 'create-metadata-staging-select',
  templateUrl: 'create-metadata-staging-select.component.html'
})
export class CreateMetadataStagingSelectComponent extends AbstractComponent {

  @ViewChild(SchemaTableListComponent)
  private readonly _tableListComponent: SchemaTableListComponent;

  @ViewChild(SchemaTablePreviewComponent)
  private readonly _tablePreviewComponent: SchemaTablePreviewComponent;

  @Input() readonly createData: MetadataEntity.CreateData;

  @Output() readonly changeStep: EventEmitter<MetadataConstant.CreateStep> = new EventEmitter();
  @Output() readonly cancel = new EventEmitter();

  schemaList: string[];
  selectedSchema: string;
  tableList: string[];
  selectedTable: string;
  selectedTableDetailData: {data, fields};

  // loading part flag
  isLoading: boolean;

  // constructor
  constructor(private connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.createData.isNotEmptySchemaInfo()) {
      this._loadSchemaInfo(this.createData.schemaInfo);
    } else {
      this._setSchemaList();
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    for (let $subscriptions of this.subscriptions) {
      $subscriptions.unsubscribe();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onChangeSelectedSchema(schema: string) {
    this.selectedSchema = schema;
    if (!_.isNil(this.selectedTable)) {
      // init selected table
      this.selectedTable = undefined;
      // init preview
      this._initialTablePreview();
    }
    // set table list
    this._setTableList();
  }

  onChangeSelectedTable(table: string): void {
    this.selectedTable = table;
    // set table detail data
    this._setTableDetailData();
  }

  changeToNextStep(): void {
    if (this.isEnableNext()) {
      if (this.createData.isNotEmptySchemaInfo() && this._isChangedSchema()) {
        this.createData.removeCompleteInfo();
      }
      this._setSchemaInfoInCreateData();
      this.changeStep.emit(MetadataConstant.CreateStep.STAGING_COMPLETE)
    }
  }

  isEnableNext(): boolean {
    return !_.isNil(this.selectedSchema) && !_.isNil(this._tableListComponent) && !this._tableListComponent.isEmptyCheckedTableList();
  }

  isEmptyTableList(): boolean {
    return _.isNil(this.tableList) || this.tableList.length === 0;
  }

  private _isChangedSchema(): boolean {
    return this.createData.schemaInfo.selectedSchema !== this.selectedSchema;
  }

  /**
   * Set schema list
   * @private
   */
  private _setSchemaList(): void {
    // loading show
    this.isLoading = true;
    // get database list
    const sub = this.connectionService.getSchemaListForHiveWithCancel().subscribe(
      res => {
        this.schemaList = res['databases'];
        this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
        this.isLoading = false;
      },
      err => {
        this.commonExceptionHandler(err);
        this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
        this.isLoading = false;
      },
    );
    this.subscriptions.push(sub);
  }

  /**
   * Set table list
   * @private
   */
  private _setTableList(): void {
    // loading show
    this.isLoading = true;
    const sub = this.connectionService.getTableListForHiveInMetadataWithCancel(this.selectedSchema).subscribe(
      res => {
        // set table list
        this.tableList = res['tables'];
        this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
        this.isLoading = false;
      },
      err => {
        this.commonExceptionHandler(err);
        this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
        this.isLoading = false;
      },
    );
    this.subscriptions.push(sub);
  }

  /**
   * Set table detail data
   * @private
   */
  private _setTableDetailData(): void {
    // loading show
    this.isLoading = true;
    // init preview
    this._initialTablePreview();
    // get detail data
    const sub = this.connectionService.getTableDetailDataForHiveWithCancel( {type: 'TABLE', database: this.selectedSchema, query: this.selectedTable}).subscribe(
      res => {
        // METATRON-1144: 테이블조회시만 테이블 name을 제거하도록 변경
        res['data'] = this._getReplacedDataList(res['data']);
        res['fields'] = this._getReplacedFieldList(res['fields']);
        // set detail data
        this.selectedTableDetailData = res;
        this._tablePreviewComponent.changeTableData(this.selectedTable, this.selectedTableDetailData);
        this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
        this.isLoading = false;
      },
      err => {
        this.commonExceptionHandler(err);
        this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
        this.isLoading = false;
      },
    );
    this.subscriptions.push(sub);
  }

  /**
   * Get replaced field in field list
   * @param fields`
   * @private
   */
  private _getReplacedFieldList(fields: any) {
    return fields.map((item) => {
      // name
      item.name = this._sliceTableName(item.name);
      // if exist alias, convert alias
      if (!isNullOrUndefined(item.alias)) {
        item.alias = this._sliceTableName(item.alias);
      }
      return item;
    });
  }

  /**
   * Get replaced data in list
   * @param datas
   * @private
   */
  private _getReplacedDataList(datas: any) {
    return datas.map((item) => {
      return this._getReplacedObject(item);
    });
  }

  /**
   * Get replaced data in Object
   * @param {Object} data
   * @returns {{} & any}
   * @private
   */
  private _getReplacedObject(data: object) {
    return Object.assign({}, ...Object.keys(data).map(key => ({[this._sliceTableName(key)]: data[key]})));
  }

  /**
   * Set schema info in create data
   * @private
   */
  private _setSchemaInfoInCreateData(): void {
    this.createData.schemaInfo = new SchemaInfo(this.schemaList, this.selectedSchema, this.tableList, this.selectedTable, this.selectedTableDetailData, this._tableListComponent ? this._tableListComponent.checkedTableList : []);
  }

  /**
   * Initial table preview
   * @private
   */
  private _initialTablePreview(): void {
    this._tablePreviewComponent.initialPreview();
  }

  /**
   * Load schema info
   * @param {MetadataEntity.SchemaInfo} schemaInfo
   * @private
   */
  private _loadSchemaInfo(schemaInfo: MetadataEntity.SchemaInfo): void {
    this.schemaList = schemaInfo.schemaList;
    this.selectedSchema = schemaInfo.selectedSchema;
    this.tableList = schemaInfo.tableList;
    this.selectedTable = schemaInfo.selectedTable;
    this.selectedTableDetailData = schemaInfo.selectedTableDetailData;
    this.safelyDetectChanges();
    if (schemaInfo.checkedTableList.length > 0) {
      this._tableListComponent.checkedTableList = schemaInfo.checkedTableList;
    }
    if (!_.isNil(this.selectedTable)) {
      this._tablePreviewComponent.changeTableData(this.selectedTable, this.selectedTableDetailData);
    }
  }

  /**
   * Slice table name
   * @param key
   * @returns {string}
   * @private
   */
  private _sliceTableName(key): string {
    // return key.replace(this.selectedTable + '.', '');
    return key.substr(key.indexOf('.') + 1);
  }
}
