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
  Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild
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
  private _setWorkspaceComponent: SetWorkspacePublishedComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 추가될 워크스페이스 목록
  public addWorkspaces: any[] = [];
  // 데이터베이스 타입 목록
  public dbTypeList: any[];
  // 선택된 데이터베이스 타입
  public selectedDbType: any;
  // 보안 타입 목록
  public securityTypeList: any[];
  // 선택된 보안 타입
  public selectedSecurityType: any;
  // URL 허용 여부
  public isEnableUrl: boolean = false;

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

  // 커넥션 연결 success flag
  public connectionResultFl: boolean = null;
  // 완료 버튼 클릭 flag
  public isClickedDone: boolean;
  // 서버 input validation
  public isShowHostRequired: boolean;
  public isShowPortRequired: boolean;
  public isShowSidRequired: boolean;
  public isShowDatabaseRequired: boolean;
  public isShowCatalogRequired: boolean;
  public isShowUrlRequired: boolean;
  public isShowUsernameRequired: boolean;
  public isShowPasswordRequired: boolean;
  // 이름 input validation
  public isShowConnectionNameRequired: boolean;
  // 커넥션 이름 메세지
  public nameErrorMsg: string;

  // workspace published
  public published: boolean = false;

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
    this.addWorkspaces.push(this._getPrivateWorkspace);
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
    // 버튼 클릭 flag
    this.isClickedDone = true;
    // validation 통과시 커넥션 생성
    this.doneValidation() && this._createConnection();
  }

  /**
   * 생성 종료
   */
  public cancel(): void {
    this.close();
  }

  /**
   * 워크스페이스 연결 모달 닫기
   * @param event
   */
  public closeSetWorkspace(event): void {
    this.addWorkspaces = event;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 변경 이벤트
   * @param type
   */
  public onChangeDbType(type: any): void {
    // 선택된 데이터베이스가 다를 경우에만 작동
    if (type !== this.selectedDbType) {
      // 데이터베이스 타입 변경
      this.selectedDbType = type;
      // 커넥션 input flag 초기화
      this.initConnectionFlag();
      // 커넥션 flag 초기화
      this.initConnectionResultFlag();
    }
  }

  /**
   * 보안 타입 변경 이벤트
   * @param type
   */
  public onChangeSecurityType(type: any): void {
    // 선택된 보안 타입이 다를 경우에만 작동
    if (type !== this.selectedSecurityType) {
      // 보안 타입 변경
      this.selectedSecurityType = type;
      // 커넥션 input flag 초기화
      this.initConnectionFlag();
      // 커넥션 flag 초기화
      this.initConnectionResultFlag();
    }
  }

  /**
   * URL 허용 변경 이벤트
   */
  public onChangeEnableURL(): void {
    this.isEnableUrl = !this.isEnableUrl;
    // 커넥션 input flag 초기화
    this.initConnectionFlag();
    // 커넥션 flag 초기화
    this.initConnectionResultFlag();
  }

  /**
   * 커넥션 체크 클릭 이벤트
   */
  public onClickConnectionValidation(): void {
    // check
    this.isEnabledConnectionValidation() && this._checkConnection();
  }

  /**
   * 워크스페이스 설정 클릭 이벤트
   */
  public onClickSetWorkspace(): void {
    const workspaces = {
      addWorkspaces: this.addWorkspaces,
    };
    this._setWorkspaceComponent.init('connection', 'create', workspaces);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스이름이 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredDatabase(): boolean {
    // postgre 만 사용
    return this.selectedDbType.value === 'POSTGRE';
  }

  /**
   * sid가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredSid() : boolean {
    // oracle | tibero 만 사용
    return this.selectedDbType.value === 'TIBERO' || this.selectedDbType.value === 'ORACLE';
  }

  /**
   * catalog가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredCatalog() : boolean {
    // presto 만 사용
    return this.selectedDbType.value === 'PRESTO';
  }

  /**
   * 사용자 계정으로 연결하는지
   * @returns {boolean}
   */
  public isConnectUserAccount(): boolean {
    return this.selectedSecurityType.value === 'USERINFO';
  }

  /**
   * 아이디와 비번으로 연결하는지
   * @returns {boo+lean}
   */
  public isConnectWithIdAndPassword(): boolean {
    return this.selectedSecurityType.value === 'DIALOG';
  }

  /**
   * 커넥션 테스트가 사용가능한지 확인
   * @returns {boolean}
   */
  public isEnabledConnectionValidation() : boolean {
    let result: boolean = true;
    // URL 허용하지 않는다면
    if (!this.isEnableUrl) {
      // hostname 없는경우
      if (this.hostname.trim() === '') {
        this.isShowHostRequired = true;
        result = false;
      }
      // port 없는경우
      if (!this.port) {
        this.isShowPortRequired = true;
        result = false;
      }
      // sid 없는경우
      if (this.isRequiredSid() && this.sid.trim() === '') {
        this.isShowSidRequired = true;
        result = false;
      }
      // database 없는경우
      if (this.isRequiredDatabase() && this.database.trim() === '') {
        this.isShowDatabaseRequired = true;
        result = false;
      }
      // catalog 없는경우
      if (this.isRequiredCatalog() && this.catalog.trim() === '') {
        this.isShowCatalogRequired = true;
        result = false;
      }
      // username
      if (!this.isConnectUserAccount() && this.username.trim() === '') {
        this.isShowUsernameRequired = true;
        result = false;
      }
      // password
      if (!this.isConnectUserAccount() && this.password.trim() === '') {
        this.isShowPasswordRequired = true;
        result = false;
      }
    } else if (this.url.trim() === '') {
      this.isShowUrlRequired = true;
      result = false;
    }
    return result;
  }

  /**
   * done validation
   * @returns {boolean}
   */
  public doneValidation(): boolean {
    return this.connectionResultFl && this._connectionNameValidation();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * connection result flag init
   */
  public initConnectionResultFlag(): void {
    // 커넥션 통과
    this.connectionResultFl = null;
    // 완료 버튼 클릭 초기화
    this.isClickedDone = false;
  }

  /**
   * connection flag init
   */
  public initConnectionFlag(): void {
    this.isShowHostRequired = null;
    this.isShowPortRequired = null;
    this.isShowSidRequired = null;
    this.isShowDatabaseRequired = null;
    this.isShowCatalogRequired = null;
    this.isShowUrlRequired = null;
    this.isShowUsernameRequired = null;
    this.isShowPasswordRequired = null;
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
        // 커넥션 이름 기본값 설정
        if (this.connectionName === '') {
          this.connectionName = this._getDefaultConnectionName();
          this.isShowConnectionNameRequired = false;
        }

        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // 커넥트 결과 fail
        this.connectionResultFl = false;
        // 로딩 hide
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
      .catch(error => this.commonExceptionHandler(error));
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

  /**
   * 커넥션 이름 validation
   * @returns {boolean}
   */
  private _connectionNameValidation(): boolean {
    // 이름이 없다면
    if (this.connectionName.trim() === '') {
      this.isShowConnectionNameRequired = true;
      this.nameErrorMsg = this.translateService.instant('msg.storage.dconn.name.error');
      return false;
    }
    // 이름길이 체크
    if (CommonUtil.getByte(this.connectionName.trim()) > 150) {
      this.isShowConnectionNameRequired = true;
      this.nameErrorMsg = this.translateService.instant('msg.alert.edit.name.len');
      return false;
    }
    return true;
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
    // 커넥션 공개여부
    params['published'] = this.published;
    // 비공개일경우 워크스페이스 전달
    !this.published && (params['workspaces'] = this._getWorkspacesParams());
    return params;
  }

  /**
   * 커넥션 연결 파라메터
   * @returns {Object}
   * @private
   */
  private _getCheckConnectionParams(): object {
    return {connection: this._getConnectionParams()};
  }

  /**
   * 커넥션 파라메터
   * @returns {Object}
   * @private
   */
  private _getConnectionParams(): object {
    const params = {
      implementor: this.selectedDbType.value,
      authenticationType: this.selectedSecurityType.value
    };
    // username과 password를 사용한다면
    !StringUtil.isEmpty(this.password) && (params['password'] = this.password.trim());
    !StringUtil.isEmpty(this.username) && (params['username'] = this.username.trim());
    // default라면 hostname, port, database 추가
    if (!this.isEnableUrl) {
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
    // 사용자 계정으로 연결이라면
    this.isConnectUserAccount() && this._deleteUsernameAndPassword(params);
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

  /**
   * 커넥션 default 이름
   * @returns {string}
   * @private
   */
  private _getDefaultConnectionName(): string {
    return this.isEnableUrl ? (this.selectedDbType.label + '-' + this.url) : (this.selectedDbType.label + '-' + this.hostname + '-' + this.port);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   * @private
   */
  private _initView(): void {
    // 데이터베이스 타입 목록
    this.dbTypeList = this.getEnabledConnectionTypes(true);
    // 선택한 데이터베이스 타입
    this.selectedDbType = this.dbTypeList[0];
    // 보안 타입 목록
    this.securityTypeList = [
      { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
    ];
    // 선택한 보안 타입
    this.selectedSecurityType = this.securityTypeList[0];
  }
}

