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

import {Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {Modal} from "../../../../common/domain/modal";
import {Alert} from "../../../../common/util/alert.util";
import {EventBroadcaster} from "../../../../common/event/event.broadcaster";
import {HivePersonalDatabaseService} from "../../service/plugins.hive-personal-database.service";

@Component({
  selector: 'plugin-hive-personal-database-delete-table',
  templateUrl: './delete-table.component.html'
})
export class DeleteTableComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 팝업 flag
  public isShow = false;

  // 모달 구성데이터
  public modal: Modal;

  public webSocketId: string = '';
  public workbenchId: string = '';
  public database:string = '';
  public table:string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected hivePersonalDatabaseService: HivePersonalDatabaseService,
              protected broadCaster: EventBroadcaster) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public init(webSocketId: string, workbenchId: string, database:string, table:string) {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.bench.ui.delete.table.title');
    modal.description = this.translateService.instant('msg.bench.ui.delete.table.description', {value: table});
    this.modal = modal;

    this.webSocketId = webSocketId;
    this.workbenchId = workbenchId;
    this.database = database;
    this.table = table;
    this.isShow = true;
  }

  // 삭제 확인
  public done() {
    this.isShow = false;
    this.loadingShow();
    this.hivePersonalDatabaseService.deleteTable(this.workbenchId, this.database, this.table, this.webSocketId)
      .then((response) => {
        this.loadingHide();
        this.broadCaster.broadcast('WORKBENCH_REFRESH_DATABASE_TABLE');
        Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
      }).catch((error) => {
      this.loadingHide();
      console.log(error);
      Alert.error(this.translateService.instant('msg.comm.alert.delete.fail'));
    });
  }

  // 창닫기
  public close() {
    this.isShow = false;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
