import * as _ from 'lodash';
import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {CommonConstant} from '@common/constant/common.constant';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {DatasourceInfo} from '@domain/datasource/datasource';
import {PrDataSnapshot, SsType} from '@domain/data-preparation/pr-snapshot';
import {
  CreateSnapShotData,
  DataSourceCreateService,
  TypeFilterObject
} from '../../../service/data-source-create.service';
import {DataSnapshotService} from '../../../../data-preparation/data-snapshot/service/data-snapshot.service';

@Component({
  selector: 'create-snapshot-source-select',
  templateUrl: './create-snapshot-source-select.component.html'
})
export class CreateSnapshotSourceSelectComponent extends AbstractPopupComponent implements OnInit {

  @Input('step')
  private _step: string;

  @Output('stepChange')
  private _stepChange: EventEmitter<string> = new EventEmitter();

  @Input('sourceData')
  public sourceData: DatasourceInfo;

  // create snapshot data
  public createSnapshotData: CreateSnapShotData;

  // snapshot type filter list
  public snapshotTypeFilterList: TypeFilterObject[] = this.sourceCreateService.getSnapshotTypeList();
  public isSnapshotTypeFilterList: boolean = false;

  // 생성자
  constructor(private sourceCreateService: DataSourceCreateService,
              private dataSnapshotService: DataSnapshotService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    // set create snapshot data
    this.createSnapshotData = this.sourceData.snapshotData ? _.cloneDeep(this.sourceData.snapshotData) : new CreateSnapShotData();
    // if not exist selected snapshot type filter, init filter
    !this.createSnapshotData.selectedSnapshotTypeFilter && (this.createSnapshotData.selectedSnapshotTypeFilter = this.snapshotTypeFilterList[0]);
    // if not exist snapshot list, set snapshot list
    !this.createSnapshotData.snapshotList && this._setSnapshotList(true);
  }

  /**
   * Next
   */
  public next(): void {
    if (this.isEnableNext()) {
      // if changed selected snapshot data
      if (this._isChangedSelectedSnapshot()) {
        // remove configure, ingestion data
        delete this.sourceData.schemaData;
        delete this.sourceData.ingestionData;
      }
      // set create snapshot data in source data
      this.sourceData.snapshotData = this.createSnapshotData;
      // go next step
      this._step = 'snapshot-configure';
      this._stepChange.emit(this._step);
    }
  }

  /**
   * Change selected snapshot
   * @param {PrDataSnapshot} snapshot
   */
  public onSelectedSnapshot(snapshot: PrDataSnapshot): void {
    if (this.createSnapshotData.selectedSnapshot && this.createSnapshotData.selectedSnapshot.ssId === snapshot.ssId) {
      this.createSnapshotData.selectedSnapshot = undefined;
    } else {
      // selected snapshot
      this.createSnapshotData.selectedSnapshot = snapshot;
    }
  }

  /**
   * Changed snapshot type filter
   * @param type
   */
  public onChangedSnapshotTypeFilter(type: any): void {
    if (this.createSnapshotData.selectedSnapshotTypeFilter !== type) {
      // set selected snapshot type filter
      this.createSnapshotData.selectedSnapshotTypeFilter = type;
      // set snapshot list
      this._setSnapshotList(true);
    }
  }

  /**
   * Changed search text
   * @param {string} text
   */
  public onChangedSearchText(text: string): void {
    // set search text
    this.createSnapshotData.searchText = text;
    // set snapshot list
    this._setSnapshotList(true);
  }

  public onChangedSort(sort: string): void {
    // changed sort
    this.createSnapshotData.sort = sort === 'createdTime,desc' ? 'createdTime,asc' : 'createdTime,desc';
    // set snapshot list
    this._setSnapshotList(true);
  }

  /**
   * Click more snapshot list
   */
  public onClickMoreSnapshotList(): void {
    this.isMoreExistSnapshotList() && this._setSnapshotList();
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
   * Is error snapshot
   * @param {string} snapshotId
   * @return {boolean}
   */
  public isErrorSnapshot(snapshotId: string): boolean {
    return this.createSnapshotData.errorSnapshotIdList.some(errorId => snapshotId === errorId);
  }


  /**
   * Is selected snapshot
   * @param {PrDataSnapshot} snapshot
   * @return {boolean}
   */
  public isSelectedSnapshot(snapshot: PrDataSnapshot): boolean {
    return this.createSnapshotData.selectedSnapshot && snapshot.ssId === this.createSnapshotData.selectedSnapshot.ssId;
  }

  /**
   * Is enable next button
   * @return {boolean}
   */
  public isEnableNext(): boolean {
    return this.createSnapshotData.selectedSnapshot && (this.sourceData.fieldList && this.sourceData.fieldList.length !== 0);
  }

  /**
   * Is more exist snapshot list
   * @return {boolean}
   */
  public isMoreExistSnapshotList(): boolean {
    return this.pageResult.number > this.pageResult.totalElements - 1;
  }

  /**
   * Is changed selected snapshot
   * @return {boolean}
   * @private
   */
  private _isChangedSelectedSnapshot(): boolean {
    return !this.sourceData.snapshotData || (this.sourceData.snapshotData.selectedSnapshot.ssId !== this.createSnapshotData.selectedSnapshot.ssId);
  }

  /**
   * Get snapshot list params
   * @param {boolean} isPageInit
   * @return {object}
   * @private
   */
  private _getSnapshotListParams(isPageInit: boolean): object {
    const params = {
      status: 'success',
      searchText: this.createSnapshotData.searchText || '',
      page: {
        size: CommonConstant.API_CONSTANT.PAGE_SIZE,
        sort: this.createSnapshotData.sort,
        number: isPageInit ? 0 : this.createSnapshotData.pageResult.number + 1
      }
    };
    this.createSnapshotData.selectedSnapshotTypeFilter.value !== 'ALL' && (params['ssType'] = this.createSnapshotData.selectedSnapshotTypeFilter.value);
    return params;
  }

  /**
   * Set snapshot list
   * @param {boolean} isPageInit
   * @private
   */
  private _setSnapshotList(isPageInit: boolean = false): void {
    // loading show
    this.loadingShow();
    // get snapshot list
    this.dataSnapshotService.getDataSnapshotsByStatus(this._getSnapshotListParams(isPageInit))
      .then((result) => {
        // set list
        this.createSnapshotData.snapshotList = result['_embedded'].preparationsnapshots;
        // set page result
        this.createSnapshotData.pageResult = result['page'];
        // if exist snapshot list
        if (this.createSnapshotData.snapshotList.length !== 0 && !this.createSnapshotData.selectedSnapshot) {
          this.createSnapshotData.selectedSnapshot = this.createSnapshotData.snapshotList[0];
        } else {
          // loading hide
          this.loadingHide();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }
}
