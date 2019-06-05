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

import {AbstractComponent} from "../../../../common/component/abstract.component";
import {Component, ElementRef, EventEmitter, HostListener, Injector, Input, Output} from "@angular/core";
import * as _ from 'lodash';

@Component({
  selector: 'connection-select-box',
  templateUrl: 'connection-select-box.component.html'
})
export class ConnectionSelectBoxComponent extends AbstractComponent {

  @Input() readonly isDisableSelect: boolean;
  @Input() readonly isEnableWindowResizeAutoClose: boolean;

  @Input() readonly connectionList;
  @Input() selectedConnection;

  @Input() readonly unselectedMessage: string = this.translateService.instant('msg.storage.ui.load.dconn');

  @Input() readonly listOptionClass: string = 'ddp-selectdown';
  @Input() pageNum: number = 0;

  // event output
  @Output() readonly changedConnection = new EventEmitter();
  @Output() readonly scrolledList = new EventEmitter();

  isShowList: boolean;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    // #1925
    if (this.isEnableWindowResizeAutoClose && this.isShowList) {
      this.isShowList = false;
    }
  }

  closeList(): void {
    this.isShowList = false;
  }

  isEmptyConnectionList(): boolean {
    return _.isNil(this.connectionList) || this.connectionList.length === 0;
  }

  isEmptySelectedConnection(): boolean {
    return _.isNil(this.selectedConnection);
  }

  onChangeShowList(): void {
    if (!this.isDisableSelect) {
      this.isShowList = !this.isShowList;
    }
  }

  onChangeSelectedConnection(connection): void {
    if (this.isEmptySelectedConnection() || this.selectedConnection.id !== connection.id) {
      this.selectedConnection = connection;
      // output event
      this.changedConnection.emit(connection);
    }
  }

  onScrollList(): void {
    this.pageNum++;
    this.scrolledList.emit(this.pageNum);
  }
}
