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
  Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../common/service/popup.service';
import { DataconnectionService } from '../../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../../common/util/alert.util';
import { Modal } from '../../../../common/domain/modal';
import { DeleteModalComponent } from '../../../../common/component/modal/delete/delete.component';
import { SetWorkspacePublishedComponent } from '../../../component/set-workspace-published/set-workspace-published.component';
import { CommonUtil } from '../../../../common/util/common.util';
import { MomentDatePipe } from '../../../../common/pipe/moment.date.pipe';
import { StringUtil } from '../../../../common/util/string.util';
import * as _ from 'lodash';

@Component({
  selector: 'app-update-connection',
  templateUrl: './update-connection.component.html',
  providers: [MomentDatePipe]
})
export class UpdateConnectionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 공통 팝업 모달
  @ViewChild(DeleteModalComponent)
  private modalComponent: DeleteModalComponent;

  // 워크스페이스 지정 팝입
  @ViewChild(SetWorkspacePublishedComponent)
  private _setWorkspaceComponent: SetWorkspacePublishedComponent;

  // 커넥션 id
  private connId: string;

  // 현재 커넥션에 연결된 워크스페이스 수 원본
  public linkedWorkspaces: number;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 커넥션 정보
  @Input('connection')
  public set connectionData(data) {
    // ui
    this._initView();
    // 커넥션 아이디
    this.connId = data.id;
    // 기존 connection data
    this.connection = new PrevData();


    // 데이터커넥션 상세조회
    this._getConnectionDetail(this.connId);
  }

  // time
  public createdTime: any;
  public modifiedTime: any;

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
  // 커넥션 정보 변경여부
  public isChangedConnection: boolean = false;
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

  // 기존 커넥션 정보
  public connection: PrevData;

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
   * 수정 종료
   */
  public cancel(): void {
    this.close();
  }

  /**
   * 수정 완료
   */
  public done(): void {
    // 버튼 클릭
    this.isClickedDone = true;
    // validation 통과시 커넥션 수정팝업 오픈
    this.doneValidation() && this._doneModalOpen();
  }

  /**
   * 모달 이벤트 확인
   * @param data
   */
  public confirmModal(data): void {
    // delete
    if (data.data === 'delete') {
      this._deleteConnection();
    } else if (data.data === 'published') {
      this._updatePublished();
    } else {
      this._updateConnection();
    }
  }

  /**
   * 현재 연결된 워크스페이스 변경
   * @param data
   */
  public updateWorkspaces(data): void {
    // 현재 연결된 워크스페이스 수
    this.connection.linkedWorkspaces = data;
    // update flag
    this.isChangedConnection = true;
  }

  /**
   * 수정완료 모달 오픈 클릭
   * @private
   */
  private _doneModalOpen(): void {
    // 모달 오픈
    const modal = new Modal();
    modal.data = 'update';
    modal.name = this.translateService.instant('msg.storage.ui.dconn.edit.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dconn.edit');
    this.modalComponent.init(modal);
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
    this._setWorkspaceComponent.init('connection', 'update', this.connId);
  }

  /**
   * 워크스페이스 공개 클릭 이벤트
   */
  public onClickPublishConnection(): void {
    const modal = new Modal();
    modal.data = 'published';
    // 현재 전체공개 됨
    if (this.connection.published) {
      modal.name = `'${this.connection.name}' ` + this.translateService.instant('msg.storage.alert.dconn.change-selected');
      modal.description = this.translateService.instant('msg.storage.alert.dconn-publish.description');
      modal.btnName = this.translateService.instant('msg.storage.btn.dconn.private');
    } else {
      modal.name = `'${this.connection.name}' ` + this.translateService.instant('msg.storage.alert.dconn.change-public');
      modal.btnName = this.translateService.instant('msg.storage.btn.dconn.public');
    }
    this.modalComponent.init(modal);
  }

  /**
   * 커넥션 삭제 클릭 이벤트
   */
  public onClickDeleteConnection(): void {
    // 모달 오픈
    const modal = new Modal();
    modal.data = 'delete';
    modal.name = this.translateService.instant('msg.storage.ui.dconn.del.title');
    modal.description = this.translateService.instant('msg.storage.ui.dconn.del.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dconn.del');
    this.modalComponent.init(modal);
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
   * @returns {boolean}
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
    // 커넥션 변경여부
    this.isChangedConnection = true;
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
    // 커넥션 체크
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
   * 커넥션 업데이트
   * @private
   */
  private _updateConnection(): void {
    // 로딩 show
    this.loadingShow();
    // 현재 커넥션 수정 요청
    this.connectionService.updateConnection(this.connId, this._getUpdateParams())
      .then((result) => {
        // 수정완료 alert
        Alert.success(`'${this.connectionName.trim()}' ` + this.translateService.instant('msg.storage.alert.dconn.modify.success'));
        // 로딩 hide
        this.loadingHide();
        // 종료
        this.popupService.notiPopup({
          name: 'reload-connection',
          data: null
        });
        this.close();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 커넥션 삭제
   * @private
   */
  private _deleteConnection(): void {
    // 로딩 show
    this.loadingShow();
    // 커넥션 삭제
    this.connectionService.deleteConnection(this.connId)
      .then((result) => {
        Alert.success(this.translateService.instant('msg.storage.alert.dconn.del.success'));
        // 로딩 hide
        this.loadingHide();
        // 종료
        this.popupService.notiPopup({
          name: 'reload-connection',
          data: null
        });
        this.close();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 워크스페이스 공개여부 변경
   */
  private _updatePublished(): void {
    // 로딩 show
    this.loadingShow();
    // 공개여부 변경
    this.connectionService.updateConnection(this.connId, {published: !this.connection.published})
      .then((result) => {
        this.connection.published = result['published'];
        // alert
        result['published']
          ? Alert.success(this.translateService.instant('msg.storage.alert.dconn-public.success'))
          : Alert.success(this.translateService.instant('msg.storage.alert.dconn-selected.success'));
        // 커넥션 변경 여부
        this.isChangedConnection = true;
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 파라메터에서 username 과 password 제거
   * @param params
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
   * 커넥션 상세정보 조회
   * @param {string} connId
   * @private
   */
  private _getConnectionDetail(connId: string): void {
    // 로딩 show
    this.loadingShow();

    this.connectionService.getDataconnectionDetail(connId)
      .then((result) => {
        // url이 있다면 타입 설정
        this.isEnableUrl = !StringUtil.isEmpty(result.url);
        // 커넥션 정보
        this._initData(result);
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
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
   * 업데이트시 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getUpdateParams(): object {
    // 변경된 사항만 저장하여 전달한다
    const params = {};

    // 입력한 name이 다른경우
    this.connectionName.trim() !== this.connection.name && (params['name'] = this.connectionName.trim());
    // 선택한 db가 다른경우
    // this.implementor !== this.selectedDbType.value && (params['implementor'] = this.selectedDbType.value);
    // 선택한 Default type인경우
    if (!this.isEnableUrl) {
      // 입력한 host가 다른경우
      this.hostname !== this.connection.hostname && (params['hostname'] = this.hostname.trim());
      // 입력한 port가 다른경우
      this.port !== this.connection.port && (params['port'] = this.port);
      // 기존에 url이 있었다면
      this.connection.url && (params['url'] = '');
      // 입력한 database가 다른경우
      this.isRequiredDatabase() && this.database !== this.connection.database && (params['database'] = this.database.trim());
      // 입력한 sid가 다른경우
      this.isRequiredSid() && this.sid !== this.connection.sid && (params['sid'] = this.sid.trim());
      // 입력한 catalog 다른경우
      this.isRequiredCatalog() && this.catalog !== this.connection.catalog && (params['catalog'] = this.catalog.trim());
    } else {
      // 입력한 url이 다른경우
      this.url !== this.connection.url && (params['url'] = this.url.trim());
      // 기존에 hostname과 port가 있었다면
      this.connection.hostname && (params['hostname'] = '');
      this.connection.port && (params['port'] = '');
    }
    // 입력한 password가 다른경우
    this.password !== this.connection.password.trim() && (params['password'] = this.password);
    // 입력한 username가 다른경우
    this.username !== this.connection.username.trim() && (params['username'] = this.username);

    // 보안 타입이 변경된 경우
    this.connection.authenticationType !== this.selectedSecurityType.value && (params['authenticationType'] = this.selectedSecurityType.value);
    // 사용자 계정으로 연결이라면
    this.isConnectUserAccount() && this._deleteUsernameAndPassword(params);
    return params;
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
   * ui init
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

  /**
   * init data
   * @param data
   * @private
   */
  private _initData(data): void {
    // time
    this.createdTime = data.createdTime;
    this.modifiedTime = data.modifiedTime;
    // 커넥션
    data.hostname && (this.connection.hostname = this.hostname = data.hostname);
    data.port && (this.connection.port = this.port = data.port);
    data.url && (this.connection.url = this.url = data.url);
    this.connection.name = this.connectionName = data.name;
    if (data.sid) {
      this.connection.sid = this.sid = data.sid;
    }
    if (data.database) {
      this.connection.database = this.database = data.database;
    }
    if (data.catalog) {
      this.connection.catalog = this.catalog = data.catalog;
    }
    this.connection.implementor = data.implementor.toString();
    this.selectedDbType = this.dbTypeList[_.findIndex(this.dbTypeList, type => type.value === data.implementor.toString())];
    // security
    this.selectedSecurityType = this.securityTypeList[_.findIndex(this.securityTypeList, type => type.value === data.authenticationType)] || this.securityTypeList[0];
    this.connection.authenticationType = this.selectedSecurityType.value;
    // 입력란 있을때만 작용
    if (this.connection.authenticationType !== 'USERINFO') {
      this.connection.password =  this.password = data.password;
      this.connection.username =  this.username = data.username;
    }
    // 공개여부
    this.connection.published = data.published;
    // 연결된 워크스페이스 수
    if (data.hasOwnProperty('linkedWorkspaces')) {
      this.connection.linkedWorkspaces = this.linkedWorkspaces = data.linkedWorkspaces;
    }
  }
}

class PrevData {
  // name
  public name: string;
  // connection
  public implementor: string;
  public hostname: string;
  public port: number;
  public username: string = '';
  public password: string = '';
  public url: string = '';
  public database: string = '';
  public sid: string = '';
  public catalog: string = '';

  // security
  public authenticationType: string = 'MANUAL';
  // 워크스페이스 공개여부
  public published: boolean;
  public workspaces: {
    addWorkspaces: any[],
    deleteWorkspaces: any[];
  };
  public linkedWorkspaces: number;

  constructor() {
    const workspaces = {
      addWorkspaces: [],
      deleteWorkspaces: []
    };
    this.workspaces = workspaces;
  }
}


