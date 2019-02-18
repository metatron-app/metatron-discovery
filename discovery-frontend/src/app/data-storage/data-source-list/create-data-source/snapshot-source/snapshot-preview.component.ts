import {AbstractComponent} from "../../../../common/component/abstract.component";
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {DataSnapshotService} from "../../../../data-preparation/data-snapshot/service/data-snapshot.service";
import {DataSnapshotDetailComponent} from "../../../../data-preparation/data-snapshot/data-snapshot-detail.component";
import {DatasourceInfo, FieldRole, LogicalType} from "../../../../domain/datasource/datasource";
import {SsType} from "../../../../domain/data-preparation/pr-snapshot";
import {DataSourceCreateService, TypeFilterObject} from "../../../service/data-source-create.service";

@Component({
  selector: 'snapshot-preview',
  templateUrl: 'snapshot-preview.component.html'
})
export class SnapshotPreviewComponent extends AbstractComponent implements OnChanges {

  @ViewChild(DataSnapshotDetailComponent)
  private _snapshotDetailComponent: DataSnapshotDetailComponent;

  @Input('snapshotId')
  private _selectedSnapshotId: string;

  private _snapshotTypeList: TypeFilterObject[] = this.dataSourceCreateService.getSnapshotTypeList();

  @Input('sourceData')
  public sourceData: DatasourceInfo;

  // snapshot data
  public snapshotData: any;

  // snapshot type
  public snapshotType = SsType;

  @Output()
  public closedPreview: EventEmitter<any> = new EventEmitter();

  constructor(private dataSourceCreateService: DataSourceCreateService,
              private dataSnapshotService: DataSnapshotService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if changed snapshot id
    if (changes._selectedSnapshotId && changes._selectedSnapshotId.currentValue !== changes._selectedSnapshotId.previousValue) {
      this._setSelectedSnapshotPreviewData(this._selectedSnapshotId);
    }
  }

  /**
   * Close preview
   */
  public closePreview(): void {
    this.snapshotData = undefined;
    this.closedPreview.emit();
  }

  /**
   * Get selected snapshot type
   * @param {SsType} snapshotType
   * @return {string}
   */
  public getSelectedSnapshotType(snapshotType: SsType): string {
    return this._snapshotTypeList.find(type => type.value === snapshotType).label;
  }

  /**
   * Click snapshot detail
   */
  public onClickDetail(): void {
    this._snapshotDetailComponent.init(this._selectedSnapshotId);
  }

  /**
   * Set snapshot preview data
   * @param {string} snapshotId
   * @private
   */
  private _setSelectedSnapshotPreviewData(snapshotId: string): void {
    // loading show
    this.loadingShow();
    // get snapshot
    this.dataSnapshotService.getDataSnapshot(snapshotId)
      .then((result) => {
        this.snapshotData = result;
        // init field list
        this.sourceData.fieldList = [];
        this.sourceData.fieldData = [];
        // get snapshot grid data
        this.dataSnapshotService.getDataSnapshotGridData(snapshotId, 0, 10000)
          .then((content) => {
            // set field list #657
            for ( let idx = 0; idx < content.gridResponse.colCnt; idx++ ) {
              this.sourceData.fieldList.push({
                name: content.gridResponse.colNames[idx],
                type: content.gridResponse.colDescs[idx].type,
                logicalType: this._getLogicalType(content.gridResponse.colDescs[idx].type),
                role: this._getRoleType(content.gridResponse.colDescs[idx].type)
              });
            }
            // set data list
            content.gridResponse.rows.forEach((row) => {
              const obj = {};
              for ( let idx = 0; idx < content.gridResponse.colCnt; idx++ ) {
                obj[ content.gridResponse.colNames[idx] ] = row.objCols[idx];
              }
              this.sourceData.fieldData.push(obj);
            });
            // loading hide
            this.loadingHide();
          })
          .catch(error => this.commonExceptionHandler(error));
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get logical type
   * @param {string} type
   * @return {LogicalType}
   * @private
   */
  private _getLogicalType(type: string): LogicalType {
    switch (type) {
      case 'STRING':
        return LogicalType.STRING;
      case 'NUMBER':
      case 'INTEGER':
        return LogicalType.INTEGER;
      case 'LONG':
      case 'DOUBLE':
        return LogicalType.DOUBLE;
      case 'TIMESTAMP':
        return LogicalType.TIMESTAMP;
    }
  }

  /**
   * Get role type
   * @param {string} type
   * @return {FieldRole}
   * @private
   */
  private _getRoleType(type: string): FieldRole {
    switch (type) {
      case 'INTEGER':
      case 'FLOAT':
        return FieldRole.MEASURE;
      default:
        return FieldRole.DIMENSION;
    }
  }
}
