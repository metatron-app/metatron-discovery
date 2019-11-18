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
  Output,
  ViewChild
} from "@angular/core";
import {AbstractPopupComponent} from "../../../../common/component/abstract-popup.component";
import {DatasourceInfo} from "../../../../domain/datasource/datasource";
import {DatasourceService} from "../../../../datasource/service/datasource.service";
import {CreateSourceCompleteData, DataSourceCreateService} from "../../../service/data-source-create.service";
import {ConfirmModalComponent} from "../../../../common/component/modal/confirm/confirm.component";
import {StringUtil} from "../../../../common/util/string.util";
import {CommonUtil} from "../../../../common/util/common.util";
import * as _ from 'lodash';
import {SsType} from "../../../../domain/data-preparation/pr-snapshot";
import {Alert} from "../../../../common/util/alert.util";
import {CookieConstant} from "../../../../common/constant/cookie.constant";
import {Modal} from "../../../../common/domain/modal";
import {EventBroadcaster} from "../../../../common/event/event.broadcaster";

/**
 * Creating datasource with Snapshot - complete step
 */
@Component({
  selector: 'create-snapshot-source-complete',
  templateUrl: './create-snapshot-source-complete.component.html'
})
export class CreateSnapshotSourceCompleteComponent extends AbstractPopupComponent {

  @ViewChild(ConfirmModalComponent)
  private _confirmModal: ConfirmModalComponent;

  @Input('step')
  private _step: string;

  @Output('stepChange')
  private _stepChange: EventEmitter<string> = new EventEmitter();

  // partition list
  private _convertedPartitionList: any;

  // datasource data
  @Input()
  public sourceData: DatasourceInfo;

  // create complete data
  public createCompleteData: CreateSourceCompleteData;

  constructor(private datasourceService: DatasourceService,
              private datasourceCreateService: DataSourceCreateService,
              private broadCaster: EventBroadcaster,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngOnInit
   */
  ngOnInit() {
    super.ngOnInit();
    // set create complete data
    this.createCompleteData = this.sourceData.completeData ? _.cloneDeep(this.sourceData.completeData) : new CreateSourceCompleteData();
    // set partition list
    this.sourceData.snapshotData.selectedSnapshot.ssType === SsType.STAGING_DB && (this._convertedPartitionList = this.sourceData.ingestionData.selectedPartitionType.value === 'ENABLE' ? this.datasourceCreateService.getConvertedPartitionList(this.sourceData.ingestionData.partitionKeyList) : []);
  }

  /**
   * Prev
   */
  public prev(): void {
    // set create complete data in source data
    this.sourceData.completeData = this.createCompleteData;
    // go prev step
    this._step = 'snapshot-ingestion';
    this._stepChange.emit(this._step);
  }

  /**
   * Done
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
    // set complete data
    this.sourceData.completeData = this.createCompleteData;
    // create datasource
    this._createDatasource();
  }

  /**
   * Get partition keys
   * @return {string}
   */
  public getPartitionKeys(): string {
    return this.datasourceCreateService.getPartitionLabel(this._convertedPartitionList);
  }

  /**
   * Create datasource
   * @private
   */
  private _createDatasource(): void {
    // loading show
    this.loadingShow();
    // create source
    this.datasourceService.createDatasource(this.datasourceCreateService.getCreateSourceParams(this.sourceData))
      .then((datasource) => {
        // complete alert
        Alert.success(`'${this.createCompleteData.sourceName.trim()}' ` + this.translateService.instant('msg.storage.alert.source.create.success'));
        // 개인 워크스페이스
        const workspace = JSON.parse(this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE));
        // 워크스페이스 매핑
        this.datasourceService.addDatasourceWorkspaces(datasource.id, [workspace['id']])
          .then(() => {
            this.broadCaster.broadcast('CREATED_DATASOURCE_SNAPSHOT');
            this.router.navigate(['/management/storage/datasource', datasource.id]);
            this.close();
          })
          .catch(() => {
            // link datasource detail (#505)
            this.router.navigate(['/management/storage/datasource', datasource.id]);
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
        this._confirmModal.init(modal);
      });
  }
}
