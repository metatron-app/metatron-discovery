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

import {Component, ElementRef, Injector, OnInit, Input, ViewChild} from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import {
  PrDatasetJdbc,
  DsType,
  ImportType,
  Connection
} from '../../../domain/data-preparation/pr-dataset';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { isNullOrUndefined } from 'util';
import {ConnectionComponent} from "../../../data-storage/component/connection/connection.component";

@Component({
  selector: 'app-create-dataset-db-select',
  templateUrl: './create-dataset-db-select.component.html',
  providers: [DataconnectionService]
})
export class CreateDatasetDbSelectComponent extends AbstractPopupComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(ConnectionComponent)
  private readonly _connectionComponent: ConnectionComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public datasetJdbc: PrDatasetJdbc;

  public connectionList: Connection[];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private popupService: PopupService,
              protected connectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {

    super.ngOnInit();

    if (isNullOrUndefined(this.datasetJdbc.connectionList)) {

      this.datasetJdbc.dsType = DsType.IMPORTED;
      this.datasetJdbc.importType = ImportType.DATABASE;
      this._getConnections();

    } else {
      console.info('this.datasetJdbc --> ' , this.datasetJdbc);
      this.connectionList = this.datasetJdbc.connectionList;
      this._connectionComponent.init(this.datasetJdbc.dataconnection.connection);
      this._connectionComponent.isValidConnection = true;
    }
  }


  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * When next button is clicked
   */
  public next() {

    this._connectionComponent.isConnectionCheckRequire = true;

    if (this.isEnableNext()) {
      this.datasetJdbc.dataconnection = this._connectionComponent.getConnectionParams();
      this.datasetJdbc.connectionList = this.connectionList;

      this.popupService.notiPopup({
        name: 'create-db-query',
        data: null
      });
    }
  }


  /**
   * Close popup
   */
  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }


  /**
   * On select connection
   * @param connection
   */
  public selectConnection(connection) {

    if (!isNullOrUndefined(connection)) {
      this.datasetJdbc.dcId = connection.id;
      this._connectionComponent.init(connection);
    } else {
      this._connectionComponent.init();
    }

  }


  /**
   * Check if user can proceed to next step
   * @returns {boolean}
   */
  public isEnableNext(): boolean {
    return this._connectionComponent.isValidConnection;
  }


  /**
   * Get selectedConnectionPreset index in connectionPreset list
   * @returns {number}
   */
  public getConnectionDefaultIndex(): number {
    // 커넥션 있을때만 작동
    return this.datasetJdbc.dcId
      ? this.connectionList.findIndex((item) => {
        return item.id === this.datasetJdbc.dcId;
      })
      : 0;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Fetch dataset connections
   */
  private _getConnections() {

    const connParam = {projection:'default'};


    // 먼저 초기화 하는게 맞을까
    this.connectionList = [];
    this.connectionService.getDataconnections(connParam)
      .then((data) => {

        // 리스트가 있다면
        if (data.hasOwnProperty('_embedded') && data['_embedded'].hasOwnProperty('connections')) {

          // FIXME : only MANUAL type can be used to make dataset (No server side API)
          this.connectionList = data['_embedded']['connections'].filter((item) => {
            return item.authenticationType === 'MANUAL'
          });

          // Manual type 인 커넥션 리스트만 체크
          if (this.connectionList.length !== 0 ) {
            this.selectConnection(this.connectionList[0]);
          } else {
            // 커넥션 리스트가 0개 라면
            this.selectConnection(null);
          }

        } else {
          // no connections
          this.connectionList = [];
          this.selectConnection(null)
        }
      })
      .catch((err) => {
        console.info('getConnections err)', err.toString());
      });
  }





}
