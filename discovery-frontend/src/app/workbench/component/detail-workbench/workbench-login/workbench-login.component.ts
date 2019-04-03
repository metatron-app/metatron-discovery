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

import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {Location} from '@angular/common';
import { AbstractComponent } from '../../../../common/component/abstract.component';
import { Workbench } from '../../../../domain/workbench/workbench';
import { DataconnectionService } from '../../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../../common/util/alert.util';
import { ConnectionRequest } from '../../../../domain/dataconnection/connectionrequest';
import { ImplementorType, Dataconnection } from '../../../../domain/dataconnection/dataconnection';
import { isUndefined } from 'util';
import { StringUtil } from '../../../../common/util/string.util';

@Component({
  selector: 'app-workbench-login',
  templateUrl: './workbench-login.component.html'
})
export class WorkbenchLoginComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선택한 dataconnection 객체
  protected dataconnection: Dataconnection = new Dataconnection();

  // connection request 객체
  protected connectionRequest: ConnectionRequest = new ConnectionRequest();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 팝업 플래그
  @Input()
  public isShow: boolean = false;

  @Input()
  public workbench: Workbench;

  @Output()
  public connectionComplete = new EventEmitter();

  // 로그인 아이디
  protected loginId: string = '';

  // 로그인 패스워드
  protected loginPw: string = '';


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _location: Location,
              protected  connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
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

  public init() {

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 강제 닫기를 누를 경우
  protected close() {
    this._location.back();
  }

  // 커넥션 체크
  protected checkConnection() {

    if (this.loginId === '') {
      Alert.warning(this.translateService.instant('msg.bench.alert.id.description'));
      return;
    }

    if (this.loginPw === '') {
      Alert.warning(this.translateService.instant('msg.bench.alert.passwd.description'));
      return;
    }

    this.dataconnection.implementor = this.workbench.dataConnection.implementor;

    ( !StringUtil.isEmpty(this.workbench.dataConnection.hostname) ) && (this.dataconnection.hostname = this.workbench.dataConnection.hostname);
    ( this.workbench.dataConnection.port ) && (this.dataconnection.port = this.workbench.dataConnection.port);
    ( !StringUtil.isEmpty(this.workbench.dataConnection.url) ) && (this.dataconnection.url = this.workbench.dataConnection.url);
    ( !StringUtil.isEmpty(this.workbench.dataConnection.sid) ) && (this.dataconnection.sid = this.workbench.dataConnection.sid);
    // add authenticationType in connection
    this.dataconnection.authenticationType = this.workbench.dataConnection.authenticationType || 'MANUAL';
    // if authenticationType is not USERINFO, add username and password in connection
    if (this.dataconnection.authenticationType !== 'USERINFO') {
      this.dataconnection.username = this.loginId;
      this.dataconnection.password = this.loginPw;
    }
    this.connectionRequest.connection = this.dataconnection;

    this.loadingShow();
    const that = this;
    this.connectionService.checkConnection(this.connectionRequest)
      .then((data) => {
        this.loadingHide();
        if (!isUndefined(data.connected)) {
          if (data.connected === false) {
            // Alert.error('Invalid : ' + data.message);
            Alert.warning(this.translateService.instant('login.ui.failed2'));
          } else if (data.connected === true) {
            // 팝업 창 닫기.
            that.isShow = false;
            const param = {
              id: this.loginId,
              pw: this.loginPw
            };
            that.connectionComplete.emit(param);
          }
        }
      })
      .catch((error) => {
        this.loadingHide();
        if (!isUndefined(error.details)) {
          Alert.error(error.details);
        } else {
          Alert.error(error);
        }
      });
  }

  protected getImplemntor(param: string): ImplementorType {
    if (param === 'H2') {
      return ImplementorType.H2;
    } else if (param === 'MYSQL') {
      return ImplementorType.MYSQL;
    } else if (param === 'ORACLE') {
      return ImplementorType.ORACLE;
    } else if (param === 'TIBERO') {
      return ImplementorType.TIBERO;
    } else if (param === 'HIVE') {
      return ImplementorType.HIVE;
    } else if (param === 'HAWQ') {
      return ImplementorType.HAWQ;
    } else if (param === 'POSTGRESQL') {
      return ImplementorType.POSTGRESQL;
    } else if (param === 'MSSQL') {
      return ImplementorType.MSSQL;
    } else if (param === 'PRESTO') {
      return ImplementorType.PRESTO;
    } else if (param === 'PHOENIX') {
      return ImplementorType.PHOENIX;
    } else if (param === 'NVACCEL') {
      return ImplementorType.NVACCEL;
    } else if (param === 'STAGE') {
      return ImplementorType.STAGE;
    } else if (param === 'FILE') {
      return ImplementorType.FILE;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
