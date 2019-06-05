import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {MetadataConstant} from "../../../metadata.constant";
import {MetadataEntity} from "../../metadata.entity";
import {DataconnectionService} from "../../../../dataconnection/service/dataconnection.service";
import {ConnectionParam} from "../../../../data-storage/service/data-connection-create.service";
import * as _ from "lodash";
import {isNullOrUndefined} from "util";
import {SchemaTableListComponent} from "./component/schema-table-list.component";
import SchemaInfo = MetadataEntity.SchemaInfo;

@Component({
  selector: 'create-metadata-db-select',
  templateUrl: 'create-metadata-db-select.component.html'
})
export class CreateMetadataDbSelectComponent extends AbstractComponent {

  @ViewChild(SchemaTableListComponent)
  private readonly _tableListComponent: SchemaTableListComponent;

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
    }
    // set table list
    this._setTableList();
  }

  onChangeSelectedTable(table: string): void {
    this.selectedTable = table;
    // set table detail data
    this._setTableDetailData();
  }

  changeToPrevStep(): void {
    this.changeStep.emit(MetadataConstant.CreateStep.DB_CONNECTION);
  }

  changeToNextStep(): void {
    if (this._isEnableNext()) {
      this._setSchemaInfoInCreateData();
      this.changeStep.emit(MetadataConstant.CreateStep.DB_COMPLETE)
    } else {

    }
  }

  private _isEnableNext() {
    return !_.isNil(this.selectedSchema) && !this._tableListComponent.isEmptyCheckedTableList();
  }

  isEmptyTableList(): boolean {
    return this.isIdleTableList() || this.tableList.length === 0;
  }

  isIdleTableList(): boolean {
    return _.isNil(this.tableList);
  }

  private _setSchemaList(): void {
    // loading show
    this.isLoading = true;
    // get database list
    const sub = this.connectionService.getDatabasesWithoutIdWithCancel(this._getConnectionParams()).subscribe(
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

  private _setTableList(): void {
    // loading show
    this.isLoading = true;
    const sub = this.connectionService.getTableListInMetadataWitchCancel(this._getConnectionParamsAddedDatabase()).subscribe(
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

  private _setTableDetailData(): void {
    // loading show
    this.isLoading = true;
    // get detail data
    const sub = this.connectionService.getTableDetailWitoutIdWithCancel(this._getConnectionParamsAddedTable()).subscribe(
      res => {
        // METATRON-1144: 테이블조회시만 테이블 name을 제거하도록 변경
        res['data'] = this._getReplacedDataList(res['data']);
        res['fields'] = this._getReplacedFieldList(res['fields']);
        // set detail data
        this.selectedTableDetailData = res;
        this.subscriptions = this.subscriptions.filter(item => !this.subscriptions.includes(sub));
        this.isLoading = false;
      },
      err => {
        console.info('error');
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
   * Get database params
   * @return {{connection: ConnectionParam}}
   * @private
   */
  private _getConnectionParams(): {connection: ConnectionParam, type: string} {
    return {connection: _.cloneDeep(this.createData.connectionInfo.connection), type: 'TABLE'};
  }

  private _getConnectionParamsAddedDatabase() {
    const result: {connection, database?} = this._getConnectionParams();
    result.database = this.selectedSchema;
    return result;
  }

  private _getConnectionParamsAddedTable() {
    const result: {connection, database?, query?} = this._getConnectionParamsAddedDatabase();
    result.query = this.selectedTable;
    return result;
  }

  private _setSchemaInfoInCreateData(): void {
    this.createData.schemaInfo = new SchemaInfo(this.schemaList, this.selectedSchema, this.tableList, this.selectedTable, this.selectedTableDetailData, this._tableListComponent ? this._tableListComponent.checkedTableList : []);
  }

  private _loadSchemaInfo(schemaInfo: MetadataEntity.SchemaInfo): void {
    this.schemaList = schemaInfo.schemaList;
    this.selectedSchema = schemaInfo.selectedSchema;
    this.tableList = schemaInfo.tableList;
    this.selectedTable = schemaInfo.selectedTable;
    this.selectedTableDetailData = schemaInfo.selectedTableDetailData;
    this._tableListComponent.checkedTableList = schemaInfo.checkedTableList;
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
