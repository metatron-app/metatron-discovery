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
  private setWorkspaceComponent: SetWorkspacePublishedComponent;

  // 커넥션 id
  private connId: string;

  // 현재 커넥션에 연결된 워크스페이스 수 원본
  private linkedWorkspaces: number;


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
    // 생성된 타입
    this.connection.usageScope = this.usageScope = data.usageScope;
    // 커넥션이 워크벤치라면
    if (data.hasOwnProperty('authenticationType')) {
      this.connection.authenticationType = this.authenticationType  = data.authenticationType;
      // index select box
      this.defaultIndex = this.workbenchTypes.findIndex(i => i.value === this.authenticationType);
    } else {
      this.connection.authenticationType = this.authenticationType = 'MANUAL';
    }

    // 데이터커넥션 상세조회
    this._getConnectionDetail(this.connId);
  }

  // 선택한 데이터베이스
  public implementor: string;
  // 선택한 타입
  public usageScope: string;
  // 선택한 입력 타입
  public authenticationType: string;
  // 선택한 URL 타입
  public selectedUrlType: string;

  // DB types
  public dbTypes: any[];
  // 계정 입력 type
  public workbenchTypes: any[];
  // URL 타입
  public urlTypes: any[] = [];

  // host
  public hostname: string = '';
  // port
  public port: number;
  // user
  public username: string = '';
  // password
  public password: string = '';
  // sid
  public sid: string = '';
  // 데이터베이스
  public database: string = '';
  // catalog
  public catalog: string = '';
  // url
  public url: string = '';

  // time
  public createdTime: any;
  public modifiedTime: any;

  // connection name
  public connectionName: string = '';

  // 커넥션 연결 success flag
  public connectionResultFl: boolean = true;

  // indexValue;
  public defaultIndex = 0;

  // workspace published
  public published : boolean;

  // 기존 커넥션 정보
  public connection: PrevData;

  // 유효성 관련 - 이름
  public isInvalidName: boolean = false;
  public errMsgName: string = '';

  // 권한 변경이 일어났는지 여부
  public isUpdatePermissionFl: boolean;

  // timeout
  public socketTimeout: number = 60;

  // advanced opt show flag
  public advancedOptShowFl: boolean;

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
    this.popupService.notiPopup({
      name: 'reload-connection',
      data: null
    });
    this.close();
  }

  /**
   * 현재 연결된 워크스페이스 변경
   * @param data
   */
  public updateWorkspaces(data): void {
    // 현재 연결된 워크스페이스 수
    this.connection.linkedWorkspaces = data;
    // update flag
    this.isUpdatePermissionFl = true;
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
      // url type 변경
      this.selectedUrlType = urlType;
      // 커넥션 테스트 초기화
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
   * 워크벤치 타입 변경 이벤트
   * @param workbenchType
   */
  public onSelectedWorkbenchType(workbenchType): void {
    // 다른 타입이면
    if (this.authenticationType !== workbenchType) {
      // 워크벤치 타입
      this.authenticationType = workbenchType;
      // 커넥션 flag 초기화
      this.initConnectionFlag();
    }
  }

  /**
   * 공개 모달 오픈 클릭
   */
  public publishModalOpen(): void {
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
   * 삭데 모달 오픈 클릭
   */
  public deleteModalOpen(): void {
    // 모달 오픈
    const modal = new Modal();
    modal.data = 'delete';
    modal.name = this.translateService.instant('msg.storage.ui.dconn.del.title');
    modal.description = this.translateService.instant('msg.storage.ui.dconn.del.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dconn.del');
    this.modalComponent.init(modal);
  }

  /**
   * 워크스페이스 연결 페이지 오픈 클릭
   */
  public setWorkspaceOpen(): void {
    this.setWorkspaceComponent.init('connection', 'update', this.connId);
  }

  /**
   * 수정완료 모달 오픈 클릭
   */
  public doneModalOpen(): void {

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

    // validation
    if (this.getDoneValidation()) {
      // 모달 오픈
      const modal = new Modal();
      modal.data = 'update';
      modal.name = this.translateService.instant('msg.storage.ui.dconn.edit.description');
      modal.btnName = this.translateService.instant('msg.storage.btn.dconn.edit');
      this.modalComponent.init(modal);
    }
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
      this.updatePublished();
    } else {
      this._updateConnection();
    }
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
    // connection check 가 완료된 상태라면 return
    return !(this.connectionResultFl !== null);
  }

  /**
   * 데이터베이스이름이 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredDatabase(): boolean {
    // postgre 만 사용
    return this.implementor === 'POSTGRESQL';
  }

  /**
   * sid가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredSid(): boolean {
    // oracle | tibero 만 사용
    return (this.implementor === 'TIBERO'
      || this.implementor === 'ORACLE');
  }

  /**
   * catalog가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredCatalog(): boolean {
    // presto 만 사용
    return this.implementor === 'PRESTO';
  }

  /**
   * 유저이름과 패스워드가 필요없는지
   * @returns {boolean}
   */
  public isDisabledUsernameAndPassword(): boolean {
    return this.isConnectionWorkbench() && this.isWorkbenchTypeUserInfo();
  }

  /**
   * 워크벤치 타입이 User 인지
   * @returns {boolean}
   */
  public isWorkbenchTypeUserInfo(): boolean {
    return this.authenticationType === 'USERINFO';
  }

  /**
   * 커넥션 생성타입이 워크벤치인지 확인
   * @returns {boolean}
   */
  public isConnectionWorkbench(): boolean {
    return this.usageScope === 'WORKBENCH';
  }

  /**
   * 변경이 일어났는지 확인
   * @returns {boolean}
   */
  public isChangeData(): boolean {
    // 일반타입 || 워크벤치 일때 변경
    return (this.isGeneralType() && this.isUpdatePermissionFl) || (this.isWorkbenchType() && this.isUpdatePermissionFl);
  }

  /**
   * 커넥션 타입이 워크벤치
   * @returns {boolean}
   */
  public isWorkbenchType(): boolean {
    return this.usageScope === 'WORKBENCH';
  }

  /**
   * 커넥션 타입이 일반
   * @returns {boolean}
   */
  public isGeneralType(): boolean {
    return this.usageScope === 'DEFAULT';
  }

  /**
   * 커넥션 수정 validation
   * @returns {boolean}
   */
  public getDoneValidation(): boolean {
    // 변경이 일어났는지 확인
    return (this.isChangeData() && this.nameValidation() && this.connectionResultFl);
  }

  /**
   * name validation
   * @returns {boolean}
   */
  public nameValidation() {
    return this.connectionName.trim() !== '';
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * connection flag init
   */
  public initConnectionFlag(): void {
    // 커넥션 통과
    this.connectionResultFl = null;
    // 수정
    this.isUpdatePermissionFl = true;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
        // close
        this.done();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
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
        // close
        this.done();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 워크스페이스 공개여부 변경
   */
  private updatePublished(): void {
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
        // 권한 변경여부
        this.isUpdatePermissionFl = true;
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

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
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 파라메터에서 username 과 password 제거
   * @param params
   */
  private deleteUsernameAndPassword(params: any): void {
    delete params.password;
    delete params.username;
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
        this.selectedUrlType = !StringUtil.isEmpty(result.url) ? 'URL' : 'DEFAULT';
        // 커넥션 정보
        this._initData(result);
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
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
      params.connection['authenticationType'] = this.authenticationType;
      // 워크벤치 타입이 유저 인포라면
      if (this.isDisabledUsernameAndPassword()) {
        this.deleteUsernameAndPassword(params.connection);
      }
    }
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
    // this.implementor !== this.connection.implementor && (params['implementor'] = this.implementor);
    // 선택한 Default type인경우
    if (this.isDefaultType()) {
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

    // 워크벤치 이고 워크벤치 커넥션 타입이 변경된 경우
    if (this.isWorkbenchType() && this.connection.authenticationType !== this.authenticationType) {
      params['authenticationType'] = this.authenticationType;

      // 만약 유저이름과 패스워드가 필요없는경우 삭제
      this.isDisabledUsernameAndPassword() && this.deleteUsernameAndPassword(params);
    }
    return params;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    this.dbTypes = this.getEnabledConnectionTypes(true);
    this.workbenchTypes = [
      { label: this.translateService.instant('msg.storage.li.admin.input'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.user.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.direct.input'), value: 'DIALOG' },
    ];
    // URL 타입
    this.urlTypes = [
      { label: this.translateService.instant('msg.storage.ui.conn.default'), value: 'DEFAULT' },
      { label: this.translateService.instant('msg.storage.ui.conn.url.only'), value: 'URL' }
    ];
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
    this.connection.implementor = this.implementor = data.implementor.toString();

    // 입력란 있을때만 작용
    if (this.connection.authenticationType !== 'USERINFO') {
      this.connection.password =  this.password = data.password;
      this.connection.username =  this.username = data.username;
    }
    // 워크벤치일 경우만 작용
    if (this.connection.usageScope === 'WORKBENCH') {
      this.connection.published = this.published = data.published;
    }
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
  // type
  public usageScope: string;

  // workbench
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


