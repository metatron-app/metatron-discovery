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
  ImportType, QueryInfo, TableInfo,
} from '../../../domain/data-preparation/pr-dataset';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { isNullOrUndefined } from 'util';
import {ConnectionComponent} from "../../../data-storage/component/connection/connection.component";
import {PageResult} from "../../../domain/common/page";
import {Dataconnection} from "../../../domain/dataconnection/dataconnection";

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

  public connectionList: Connection[] = [];

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

    this.pageResult.number = 0;
    this.pageResult.size = 20;

    // 처음
    if (isNullOrUndefined(this.datasetJdbc.connectionList)) {
      this.datasetJdbc.dsType = DsType.IMPORTED;
      this.datasetJdbc.importType = ImportType.DATABASE;
      this._getConnections();
    } else {

      // 이미 커넥션 리스트가 있음
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
   * Initialise _connection component
   * @param connection
   */
  public selectConnection(connection) {
    if (!isNullOrUndefined(connection)) {
      this._connectionComponent.init(connection);
    } else {
      this._connectionComponent.init();
    }

  }


  /**
   * Get connection detail information
   */
  public getConnectionDetail() {

    this.loadingShow();
    //  get connection data in preset
    this.connectionService.getDataconnectionDetail(this.datasetJdbc.dcId)
      .then((connection: Dataconnection) => {
        // loading hide
        this.loadingHide();
        this.selectConnection(connection);
      })
      .catch(error => this.commonExceptionHandler(error));
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


  /**
   * When it's scrolled
   * @param number
   */
  public onScrollPage(number) {
    // if remain next page
    if (this._isMorePage()) {
      // save pageResult
      this.pageResult.number = number;
      // get more preset list
      this._getConnections();
    }
  }


  /**
   * When a connection is selected from list
   * @param event
   */
  public onConnectionSelected(event) {

    // only fetch data when it's different
    if (this.datasetJdbc.dcId !== event.id) {
      this.datasetJdbc.dcId = event.id;
      this.getConnectionDetail();

      // refresh existing data
      this.datasetJdbc.sqlInfo = new QueryInfo();
      this.datasetJdbc.tableInfo = new TableInfo();
      this.datasetJdbc.rsType = undefined;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Get parameter for connection list
   * @param {PageResult} pageResult
   * @returns {Object}
   * @private
   */
  private _getConnectionPresetListParams(pageResult: PageResult): object {
    return {
      authenticationType:'MANUAL',
      size: pageResult.size,
      page: pageResult.number,
      type: 'jdbc'
    };
  }



  /**
   * Fetch dataset connections
   */
  private _getConnections() {

    this.loadingShow();

    this.connectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
      .then((data) => {

        // 리스트가 있다면
        if (data.hasOwnProperty('_embedded')) {

          // 리스트 추가
          this.connectionList = this.connectionList.concat(data['_embedded'].connections);

          if (this.connectionList.length !== 0 ) {

            // 첫번째 커넥션 등록
            this.datasetJdbc.dcId = this.connectionList[0].id;
            this.getConnectionDetail();
          } else {

            this.loadingHide();
            // 커넥션 리스트가 0개 라면
            this.selectConnection(null);
          }

        } else {
          this.loadingHide();
          // no connections
          this.connectionList = [];
          this.selectConnection(null)
        }

        this.pageResult = data['page'];

      })
      .catch((err) => {
        this.loadingHide();
        console.info('getConnections err)', err.toString());
      });
  }


  /**
   * Check if there's more pages to load
   * @private
   */
  private _isMorePage(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

}

class Connection {
  id: string;
  implementor: string;
  name: string;
  type: string;
}
