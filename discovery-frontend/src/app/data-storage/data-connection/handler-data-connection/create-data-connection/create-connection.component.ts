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
  Component, ElementRef, Injector, OnChanges, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../common/service/popup.service';
import { DataconnectionService } from '../../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../../common/util/alert.util';
import { SetWorkspacePublishedComponent } from '../../../component/set-workspace-published/set-workspace-published.component';
import { CommonUtil } from '../../../../common/util/common.util';
import { CookieConstant } from '../../../../common/constant/cookie.constant';
import { StringUtil } from '../../../../common/util/string.util';

@Component({
  selector: 'app-create-connection',
  templateUrl: './create-connection.component.html'
})
export class CreateConnectionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 지정 팝입
  @ViewChild(SetWorkspacePublishedComponent)
  private setWorkspaceComponent: SetWorkspacePublishedComponent;

  // 최초 접근시 flag
  private firstFl: boolean = true;

  // 선택한 입력 타입
  private selectedWorkbenchType: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선택한 커넥션 타입
  public selectedConnectionType: string;
  // 선택한 데이터베이스
  public implementor: string;
  // 선택한 URL 타입
  public selectedUrlType: string;

  // 커넥션 생성 타입
  public connectionTypes: any[];
  // DB types
  public dbTypes: any[];
  // 계정 입력 타입
  public workbenchTypes: any[];
  // URL 타입
  public urlTypes: any[];

  // host
  public hostname: string = '';
  // port
  public port: number;
  // user
  public username: string = '';
  // password
  public password: string = '';
  // database
  public database: string = '';
  // sid
  public sid: string = '';
  // catalog
  public catalog: string = '';
  // url
  public url: string = '';

  // connection name
  public connectionName: string = '';

  // 새로운 커넥션 생성 flag
  public createConnectionFl: boolean = false;
  // 커넥션 연결 success flag
  public connectionResultFl: boolean = null;

  // workspace published
  public published: boolean = false;

  // 추가될 워크스페이스 목록
  public addWorkspaces: any[] = [];

  // 유효성 관련 - 이름
  public isInvalidName: boolean = false;
  public errMsgName: string = '';

  // timeout
  public socketTimeout: number = 60;

  // advanced opt show flag
  public advancedOptShowFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private connectionService: DataconnectionService,
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
    // ui init
    this._initView();
    // 개인 워크스페이스 정보
    // this.addWorkspaces.push(this._getPrivateWorkspace);
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 생성 완료
   */
  public done(): void {
    // 이름 비어있는지 확인
    if (StringUtil.isEmpty(this.connectionName)) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.storage.dconn.name.error');
      return;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.connectionName.trim()) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return;
    }
    // validation 통과시 커넥션 생성
    this.doneValidation() && this._createConnection();
  }

  /**
   * 생성 종료
   */
  public cancel(): void {
    this.close();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * connection validation message
   * @returns {string}
   */
  public getValidationMessage(): string {
    // URL 타입이 Default 라면
    if (this.isDefaultType()) {
      // hostname
      if (this.hostname.trim() === '') {
        return this.translateService.instant('msg.storage.alert.host.required');
      }
      // port
      if (!this.port) {
        return this.translateService.instant('msg.storage.alert.port.required');
      }
      // sid
      if (this.isRequiredSid() && this.sid.trim() === '') {
        return this.translateService.instant('msg.storage.alert.sid.required');
      }
      // database
      if (this.isRequiredDatabase() && this.database.trim() === '') {
        return this.translateService.instant('msg.storage.alert.db.required');
      }
      // catalog
      if (this.isRequiredCatalog() && this.catalog.trim() === '') {
        return this.translateService.instant('msg.storage.alert.catalogue.required');
      }
      // username
      if (!this.isDisabledUsernameAndPassword() && this.username.trim() === '') {
        return this.translateService.instant('msg.storage.alert.user-name.required');
      }
      // password
      if (!this.isDisabledUsernameAndPassword() && this.password.trim() === '') {
        return this.translateService.instant('msg.storage.alert.pw.required');
      }
    } else if (this.url.trim() === '') {
      return this.translateService.instant('msg.storage.alert.url.required');
    }
    return '';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * url 타입 변경 이벤트
   * @param {string} urlType
   */
  public onSelectedUrlType(urlType: string): void {
    // 타입이 같지 않을때만 동작
    if (this.selectedUrlType !== urlType) {
      // url 타입
      this.selectedUrlType = urlType;
      // 커넥션 플래그 초기화
      this.initConnectionFlag();
    }
  }

  /**
   * 워크벤치 타입 변경 이벤트
   * @param {string} workbenchType
   */
  public onSelectedWorkbenchType(workbenchType: string): void {
    // 같은 타입이 아니라면
    if (this.selectedWorkbenchType !== workbenchType) {
      // 워크벤치 타입
      this.selectedWorkbenchType = workbenchType;
      // 커넥션 플래그 초기화
      this.initConnectionFlag();
    }
  }

  /**
   * 커넥션 타입 변경 이벤트
   * @param {string} connectionType
   */
  public onSelectedConnectionType(connectionType: string): void {
    // 커넥션 타입
    this.selectedConnectionType = connectionType;
  }

  /**
   * 데이터베이스 선택 이벤트
   * @param database
   */
  public onSelectedDb(database): void {
    // 다른 데이터베이스 선택시
    if (this.implementor !== database) {
      // 변경된 데이터베이스 타입 저장
      this.implementor = database;
      // 커넥션 flag 초기화
      this.initConnectionFlag();
    }
  }

  /**
   * 커넥션 테스트 클릭 이벤트
   */
  public onClickConnectionTest(): void {
    // validation 통과 시 커넥션 체크
    this.isEnabledConnectionTest() && this._checkConnection();
  }

  /**
   * 워크스페이스 연결 모달 오픈
   */
  public onClickOpenSetWorkspace(): void {
    const workspaces = {
      addWorkspaces: this.addWorkspaces,
    };
    this.setWorkspaceComponent.init('connection', 'create', workspaces);
  }

  /**
   * 워크스페이스 연결 모달 닫기
   * @param event
   */
  public closeSetWorkspace(event): void {
    this.addWorkspaces = event;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * url이 default 타입이라면
   * @returns {boolean}
   */
  public isDefaultType(): boolean {
    return this.selectedUrlType === 'DEFAULT';
  }

  /**
   * connection validation message 를 보여주는지 여부
   * @returns {boolean}
   */
  public isShowValidationMessage(): boolean {
    // 최초 접근 또는 connection check 가 완료된 상태라면 return
    return !(this.firstFl || this.connectionResultFl !== null);
  }

  /**
   * 데이터베이스이름이 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredDatabase(): boolean {
    // postgre 만 사용
    return this.implementor === 'POSTGRE';
  }

  /**
   * sid가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredSid() : boolean {
    // oracle | tibero 만 사용
    return this.implementor === 'TIBERO' || this.implementor === 'ORACLE';
  }

  /**
   * catalog가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredCatalog() : boolean {
    // presto 만 사용
    return this.implementor === 'PRESTO';
  }

  /**
   * 커넥션 생성타입이 워크벤치인지 확인
   * @returns {boolean}
   */
  public isConnectionWorkbench(): boolean {
    return this.selectedConnectionType === 'WORKBENCH';
  }

  /**
   * 워크벤치 타입이 User 인지
   * @returns {boolean}
   */
  public isWorkbenchTypeUserInfo(): boolean {
    return this.selectedWorkbenchType === 'USERINFO';
  }

  /**
   * 유저이름과 패스워드가 필요없는지
   * @returns {boolean}
   */
  public isDisabledUsernameAndPassword(): boolean {
    return this.isConnectionWorkbench() && this.isWorkbenchTypeUserInfo();
  }

  /**
   * 커넥션 테스트가 사용가능한지 확인
   * @returns {boolean}
   */
  public isEnabledConnectionTest() : boolean {
    // URL 타입이 Default 라면
    if (this.isDefaultType()) {
      // hostname 없는경우
      if (this.hostname.trim() === '') {
        return false;
      }
      // port 없는경우
      if (!this.port) {
        return false;
      }
      // sid 없는경우
      if (this.isRequiredSid() && this.sid.trim() === '') {
        return false;
      }
      // database 없는경우
      if (this.isRequiredDatabase() && this.database.trim() === '') {
        return false;
      }
      // catalog 없는경우
      if (this.isRequiredCatalog() && this.catalog.trim() === '') {
        return false;
      }
      // username
      if (!this.isDisabledUsernameAndPassword() && this.username.trim() === '') {
        return false;
      }
      // password
      if (!this.isDisabledUsernameAndPassword() && this.password.trim() === '') {
        return false;
      }
    } else if (this.url.trim() === ''){
      return false;
    }
    return true;
  }

  /**
   * done validation
   * @returns {boolean}
   */
  public doneValidation(): boolean {
    return this.connectionResultFl && this.nameValidation();
  }

  /**
   * name validation
   * @returns {boolean}
   */
  public nameValidation(): boolean {
    return this.connectionName.trim() !== '';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * connection flag init
   */
  public initConnectionFlag(): void {
    // 최초 접근 flag
    this.firstFl = false;
    // 커넥션 통과
    this.connectionResultFl = null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커넥션 연결 체크
   * @private
   */
  private _checkConnection(): void {
    // 로딩 show
    this.loadingShow();
    // 커넥션 연결 체크
    this.connectionService.checkConnection(this._getCheckConnectionParams())
      .then((result) => {
        // 커넥트 성공시
        this.connectionResultFl = result['connected'];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 커넥션 생성
   * @private
   */
  private _createConnection(): void {
    // 로딩 show
    this.loadingShow();
    // 커넥션 생성
    this.connectionService.createConnection(this._getCreateConnectionParams())
      .then((result) => {
        // 생성완료 alert
        Alert.success(`'${this.connectionName.trim()}' ` + this.translateService.instant('msg.storage.alert.dconn.create.success'));
        // 로딩 hide
        this.loadingHide();
        // 종료
        this.popupService.notiPopup({
          name: 'reload-connection',
          data: null
        });
        // close
        this.close();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 파라메터에서 username 과 password 제거
   * @param params
   * @private
   */
  private _deleteUsernameAndPassword(params: any): void {
    delete params.password;
    delete params.username;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커넥션 생성 파라메터
   * @returns {Object}
   * @private
   */
  private _getCreateConnectionParams(): object {
    // params
    const params = this._getConnectionParams();
    // type
    params['type'] = 'JDBC';
    // name
    params['name'] = this.connectionName.trim();
    // 워크벤치 생성타입인 경우
    if (this.isConnectionWorkbench()) {
      // usageScope
      params['usageScope'] = this.selectedConnectionType;
      // authenticationType
      params['authenticationType'] = this.selectedWorkbenchType;
      // 워크벤치 타입이 유저 인포라면
      this.isDisabledUsernameAndPassword() && this._deleteUsernameAndPassword(params);
      // 커넥션 공개여부
      params['published'] = this.published;
      // 비공개일경우 워크스페이스 전달
      !this.published && (params['workspaces'] = this._getWorkspacesParams());
    }
    return params;
  }

  /**
   * 커넥션 연결 파라메터
   * @returns {Object}
   * @private
   */
  private _getCheckConnectionParams(): object {
    // params
    const params = {
      connection: this._getConnectionParams()
    };
    // 워크벤치 생성타입인 경우
    if (this.isConnectionWorkbench()) {
      params.connection['authenticationType'] = this.selectedWorkbenchType;
      // 워크벤치 타입이 유저 인포라면
      this.isDisabledUsernameAndPassword() && this._deleteUsernameAndPassword(params.connection);
    }
    return params;
  }

  /**
   * 커넥션 파라메터
   * @returns {Object}
   * @private
   */
  private _getConnectionParams(): object {
    const params = {
      implementor: this.implementor
    };
    // username과 password를 사용한다면
    !StringUtil.isEmpty(this.password) && (params['password'] = this.password.trim());
    !StringUtil.isEmpty(this.username) && (params['username'] = this.username.trim());
    // default라면 hostname, port, database 추가
    if (this.isDefaultType()) {
      params['hostname'] = this.hostname.trim();
      params['port'] = this.port;
      // catalog 가 있다면
      this.isRequiredCatalog() && (params['catalog'] = this.catalog);
      // sid 가 있다면
      this.isRequiredSid() && (params['sid'] = this.sid);
      // database 가 있다면
      this.isRequiredDatabase() && (params['database'] = this.database);
    // only url이면 url만 추가
    } else {
      params['url'] = this.url.trim();
    }
    return params;
  }

  /**
   * 워크스페이스 목록 파라메터
   * @returns {any}
   * @private
   */
  private _getWorkspacesParams(): any {
    const workspaces = [];
    this.addWorkspaces.forEach((workspace) => {
      workspaces.push('/api/workspaces/' + workspace.id);
    });
    return workspaces;
  }

  /**
   * 현재 접속한 사용자의 개인워크스페이스 정보
   * @returns {any}
   * @private
   */
  private _getPrivateWorkspace(): any {
    const workspace = this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE);
    return JSON.parse(workspace);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   * @private
   */
  private _initView(): void {
    // 커넥션 타입
    this.connectionTypes = [
      { label: this.translateService.instant('msg.storage.ui.list.general'), value: 'DEFAULT' },
      { label: this.translateService.instant('msg.storage.ui.list.workbench') , value: 'WORKBENCH' }
    ];
    this.selectedConnectionType = this.connectionTypes[0].value;

    // 데이터베이스 타입
    this.dbTypes = this.getEnabledConnectionTypes(true);
    this.implementor = this.dbTypes[0].value;

    // 워크벤치 타입
    this.workbenchTypes = [
      { label: this.translateService.instant('msg.storage.li.admin.input'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.user.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.direct.input'), value: 'DIALOG' },
    ];
    this.selectedWorkbenchType = this.workbenchTypes[0].value;

    // URL 타입
    this.urlTypes = [
      { label: this.translateService.instant('msg.storage.ui.conn.default'), value: 'DEFAULT' },
      { label: this.translateService.instant('msg.storage.ui.conn.url.only'), value: 'URL' }
    ];
    this.selectedUrlType = this.urlTypes[0].value;

    // flag 초기화
    // 새로운 커넥션 생성 flag
    this.createConnectionFl = false;
    // 커넥션 연결 success flag
    this.connectionResultFl = null;
    // 최초 접근시 flag
    this.firstFl = true;
  }
}

