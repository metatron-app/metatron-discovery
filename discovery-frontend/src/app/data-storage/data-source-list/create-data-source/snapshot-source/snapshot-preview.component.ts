import {isUndefined} from 'util';
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
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {DatasourceInfo, FieldRole} from '@domain/datasource/datasource';
import {PrDataSnapshot, SsType} from '@domain/data-preparation/pr-snapshot';
import {CreateSnapShotData,} from '../../../service/data-source-create.service';
import {PreparationCommonUtil} from '../../../../data-preparation/util/preparation-common.util';
import {DataSnapshotService} from '../../../../data-preparation/data-snapshot/service/data-snapshot.service';
import {DataSnapshotDetailComponent} from '../../../../data-preparation/data-snapshot/data-snapshot-detail.component';

@Component({
  selector: 'snapshot-preview',
  templateUrl: 'snapshot-preview.component.html'
})
export class SnapshotPreviewComponent extends AbstractComponent implements OnChanges {

  @ViewChild(DataSnapshotDetailComponent)
  private _snapshotDetailComponent: DataSnapshotDetailComponent;

  @Input('snapshotId')
  private _selectedSnapshotId: string;

  @Input('createSnapshotData')
  private _createSnapshotData: CreateSnapShotData;

  @Input('sourceData')
  public sourceData: DatasourceInfo;

  // snapshot data
  public snapshotData: PrDataSnapshot;

  // snapshot type
  public snapshotType = SsType;

  // is error snapshot
  public isErrorSnapshot: boolean;

  @Output()
  public closedPreview: EventEmitter<any> = new EventEmitter();

  constructor(private dataSnapshotService: DataSnapshotService,
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
   * Returns formatted elapsed time
   * TODO 추후 변경 필요
   * hour:minute:second.millisecond
   * @param item
   */
  public getElapsedTime(item: PrDataSnapshot) {
    if (isUndefined(item) ||
      isUndefined(item.elapsedTime) ||
      isUndefined(item.elapsedTime.hours) ||
      isUndefined(item.elapsedTime.minutes) ||
      isUndefined(item.elapsedTime.seconds) ||
      isUndefined(item.elapsedTime.milliseconds)
    ) {
      return '--:--:--';
    }
    return `${PreparationCommonUtil.padLeft(item.elapsedTime.hours)}:${PreparationCommonUtil.padLeft(item.elapsedTime.minutes)}:${PreparationCommonUtil.padLeft(item.elapsedTime.seconds)}.${PreparationCommonUtil.padLeft(item.elapsedTime.milliseconds)}`;
  }

  /**
   * Get snapshot type label
   * @param {PrDataSnapshot} snapshot
   * @return {string}
   */
  public getSnapshotTypeLabel(snapshot: PrDataSnapshot): string {
    if (snapshot.ssType === SsType.STAGING_DB) {
      return this.translateService.instant('msg.dp.ui.list.staging-db')
    } else if (snapshot.ssType === SsType.URI) {
      return `${this.translateService.instant('msg.dp.ui.list.file')} (${snapshot.storedUri.match(/.csv$/) ? 'CSV' : 'JSON'})`;
    }
  }

  /**
   * Get snapshot uri type
   * @param {PrDataSnapshot} snapshot
   * @return {string}
   */
  public getSnapshotUriType(snapshot: PrDataSnapshot): string {
    return snapshot.storedUri.match(/^hdfs:/) ? 'HDFS' : 'FILE';
  }

  /**
   * Click snapshot detail
   */
  public onClickDetail(): void {
    this._snapshotDetailComponent.init(this._selectedSnapshotId, false, false);
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
            // set error flag
            this.isErrorSnapshot = false;
            // set field list #657
            for (let idx = 0; idx < content.gridResponse.colCnt; idx++) {
              this.sourceData.fieldList.push({
                name: content.gridResponse.colNames[idx],
                type: content.gridResponse.colDescs[idx].type,
                logicalType: this.dataSnapshotService.getConvertTypeToLogicalType(content.gridResponse.colDescs[idx].type),
                role: this._getRoleType(content.gridResponse.colDescs[idx].type)
              });
            }
            // set data list
            content.gridResponse.rows.forEach((row) => {
              const obj = {};
              for (let idx = 0; idx < content.gridResponse.colCnt; idx++) {
                obj[content.gridResponse.colNames[idx]] = row.objCols[idx];
              }
              this.sourceData.fieldData.push(obj);
            });
            // remove error id
            this._createSnapshotData.errorSnapshotIdList.some(errorId => errorId === snapshotId) && this._createSnapshotData.errorSnapshotIdList.splice(this._createSnapshotData.errorSnapshotIdList.findIndex(errorId => errorId === snapshotId), 1);
            // loading hide
            this.loadingHide();
          })
          .catch((error) => {
            this.commonExceptionHandler(error);
            // set error flag
            this.isErrorSnapshot = true;
            // set error id
            this._createSnapshotData.errorSnapshotIdList.every(errorId => errorId !== snapshotId) && this._createSnapshotData.errorSnapshotIdList.push(snapshotId);
          });
      })
      .catch(error => this.commonExceptionHandler(error));
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
      case 'LONG':
      case 'DOUBLE':
        return FieldRole.MEASURE;
      default:
        return FieldRole.DIMENSION;
    }
  }
}
