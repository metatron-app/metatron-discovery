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
import {EventBroadcaster} from "../../../../../common/event/event.broadcaster";
import {AbstractComponent} from "../../../../../common/component/abstract.component";
import {HivePersonalDatabaseService} from "../../../service/plugins.hive-personal-database.service";
import {Modal} from "../../../../../common/domain/modal";
import {CommonUtil} from "../../../../../common/util/common.util";

@Component({
  selector: 'plugin-hive-personal-database-details-data-aggregate-task',
  templateUrl: './details-data-aggregate-task.component.html',
})
export class DetailsDataAggregateTaskComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private workbenchId: string = "";
  private taskId: number;
  private taskName: string = "";
  private dataAggregateTaskDetails: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isShow = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected broadCaster: EventBroadcaster,
              private hivePersonalDatabaseService: HivePersonalDatabaseService) {
    super(elementRef, injector);
    this.dataAggregateTaskDetails = {
      taskInformation: {
        source: {
          query: "",
        },
        target: {
          database: "",
          table: "",
        },
        loopRange: {
          from: "",
          to: "",
        }
      },
      histories: []
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  public close() {
    this.isShow = false;
  }

  public init(workbenchId: string, taskId: number, taskName: string) {
    this.isShow = true;
    this.workbenchId = workbenchId;
    this.taskId = taskId;
    this.taskName = taskName;
    this.loadDataAggregateTaskDetails();
  }

  private loadDataAggregateTaskDetails(): void {
    this.loadingShow();
    this.hivePersonalDatabaseService.getDataAggregateTaskDetails(this.workbenchId, this.taskId)
      .then((result) => {
        this.loadingHide();
        this.dataAggregateTaskDetails = result;
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  public showErrorDetails(item): void {
    const modal = new Modal();
    modal.name = item.status;
    modal.description = item.errorMessage;
    modal.isShowCancel = false;
    modal.isScroll = true;
    CommonUtil.confirm(modal);
  }

  public refresh() {
    this.loadDataAggregateTaskDetails();
  }
}
