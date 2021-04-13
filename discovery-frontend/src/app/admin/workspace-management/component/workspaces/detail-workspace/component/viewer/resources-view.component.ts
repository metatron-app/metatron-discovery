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

import { Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractComponent } from '@common/component/abstract.component';
import { SourceType, Status } from '@domain/datasource/datasource';
import {PageResult} from '@domain/common/page';
import * as _ from 'lodash';
import { WorkspaceService } from '../../../../../../../workspace/service/workspace.service';

@Component({
  selector: 'resources-viewer',
  templateUrl: './resources-view.component.html',
  styles : [
    'table tbody tr:hover td { background-color : initial }',
    'table tbody tr:nth-child(odd):hover td { background-color : #fafafa }'
  ]
})
export class ResourcesViewComponent extends AbstractComponent implements OnInit, OnDestroy{

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // workspace id
  private _workspaceId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // resource mode
  public mode: string;

  // resource data list
  public dataList: any;

  // show flag
  public isShowFl: boolean = false;

  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
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
   * init
   * @param {string} mode
   * @param {string} workspaceId
   * @param dataList
   * @param {PageResult} pageResult
   */
  public init(mode: string, workspaceId: string, dataList: any, pageResult: PageResult): void {
    // ui init
    this._initView();
    // mode
    this.mode = mode;
    // data
    this.dataList = _.cloneDeep(dataList);
    // list count
    this.pageResult = pageResult;
    // workspace id
    this._workspaceId = workspaceId;
    // flag
    this.isShowFl = true;

    this.addBodyScrollHidden();
  }

  /**
   * close popup
   */
  public close() {
    this.removeBodyScrollHidden();
    this.isShowFl = false;
  } // function - close

  /**
   * 정렬 버튼 클릭
   * @param {string} key
   */
  public onClickSort(key: string): void {
    // 정렬 정보 저장
    this.selectedContentSort.key = key;
    // 정렬 key와 일치하면
    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }
    // 페이지 초기화
    this.pageResult.number = 0;
    // 리스트 조회
    this._getDataList();
  }

  /**
   * 더보기 버튼 클릭
   */
  public onClickMoreList(): void {
    // page 증가
    this.pageResult.number++;
    // 리스트 조회
    this._getDataList();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 오픈데이터 라벨
   * @returns {string}
   */
  public getOpenLabel(): string {
    return this.mode === 'connection' ? this.translateService.instant('msg.spaces.shared.detail.connection.open'): this.translateService.instant('msg.comm.ui.list.ds.opendata');
  }

  /**
   * 타이틀 이름
   * @returns {string}
   */
  public getTitleName(): string {
    if (this.isDatasourceMode()) {
      return this.translateService.instant('msg.spaces.shared.detail.datasource');
    } else if (this.isDataconnectionMode()) {
      return this.translateService.instant('msg.spaces.shared.detail.dataconnection');
    } else {
      return this.translateService.instant('msg.spaces.shared.detail.nbook.connector');
    }
  }

  /**
   * 데이터소스 IngestedType | 데이터커넥션 DbType | 노트북 Type
   * @returns {string}
   */
  public getTableNameIngestionTypeOrDbTypeOrType(): string {
    if (this.isDatasourceMode()) {
      return this.translateService.instant('msg.spaces.shared.detail.statistics.ingested.type');
    } else if (this.isDataconnectionMode()) {
      return this.translateService.instant('msg.spaces.shared.detail.statistics.dbtype');
    } else {
      return this.translateService.instant('msg.spaces.shared.detail.statistics.type');
    }
  }

  /**
   * 데이터소스 IngestedType | 데이터커넥션 Implementor | 노트북 Type
   * @param data
   * @returns {string}
   */
  public getIngestedTypeOrImplementorOrType(data: any): string {
    // 데이터소스 인경우 ingested type
    if (this.isDatasourceMode()) {
      return this.getConnectionTypeString(data.connType);
    // 데이터 커넥션 인경우 db type
    } else if (this.isDataconnectionMode()) {
      return data.implementor;
    } else {
      return data.type;
    }
  }

  /**
   * 테이블이름 데이터소스 Data type | 데이터커넥션 Host | 노트북 Host
   * @returns {string}
   */
  public getTableNameDataTypeOrHost(): string {
    // mode가 데이터소스라면 data type
    if (this.isDatasourceMode()) {
      return this.translateService.instant('msg.spaces.shared.detail.statistics.data.type');
    } else {
      return this.translateService.instant('msg.spaces.shared.detail.statistics.host');
    }
  }

  /**
   * 데이터소스 srcType | 데이터커넥션 hostname | 노트북 hostname
   * @param data
   * @returns {string}
   */
  public getImplementorOrHostname(data: any): string {
    // mode가 데이터소스라면 implementor
    if (this.isDatasourceMode()) {
      return this.getDataTypeString(data.srcType);
    } else {
      return data.hostname;
    }
  }

  /**
   * 테이블이름 데이터소스 status | 데이터커넥션 port | 노트북 port
   * @returns {string}
   */
  public getTableNameStatusOrPort(): string {
    // mode가 데이터소스라면 status
    if (this.isDatasourceMode()) {
      return this.translateService.instant('msg.spaces.shared.detail.statistics.status');
    } else {
      return this.translateService.instant('msg.spaces.shared.detail.statistics.port');
    }
  }

  /**
   * 데이터소스 status | 데이터커넥션 port | 노트북 port
   * @param data
   * @returns {string}
   */
  public getStatusOrPort(data:any): string {
    // mode가 데이터소스라면 status
    if (this.isDatasourceMode()) {
      return this.getSourceStatusString(data.status);
    } else {
      return data.port;
    }
  }

  /**
   * 데이터소스 커넥션 타입
   * @param {string} connType
   * @returns {string}
   */
  public getConnectionTypeString(connType: string): string {
    return connType === 'ENGINE' ? this.translateService.instant('msg.comm.ui.list.ds.type.engine'): this.translateService.instant('msg.comm.ui.list.ds.type.link');
  }

  /**
   * 데이터소스 데이터 타입
   * @param {SourceType} srcType
   * @returns {string}
   */
  public getDataTypeString(srcType: SourceType): string {
    switch (srcType) {
      case SourceType.IMPORT:
        return this.translateService.instant('msg.storage.li.druid');
      case SourceType.FILE:
        return this.translateService.instant('msg.storage.li.file');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.HIVE:
        return this.translateService.instant('msg.storage.li.hive');
      case SourceType.REALTIME:
        return this.translateService.instant('msg.storage.li.stream');
    }
  }

  /**
   * 데이터소스 status
   * @param {Status} status
   * @returns {string}
   */
  public getSourceStatusString(status: Status): string {
    switch (status) {
      case Status.ENABLED:
        return 'Enabled';
      case Status.PREPARING:
        return 'Preparing';
      case Status.DISABLED:
        return 'Disabled';
      case Status.FAILED:
        return 'Failed';
      default:
        return 'Disabled';
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 리소스가 데이터소스 인지
   * @returns {boolean}
   */
  public isDatasourceMode(): boolean {
    return this.mode === 'datasource';
  }

  /**
   * 현재 리소스가 데이터커넥션 인지
   * @returns {boolean}
   */
  public isDataconnectionMode(): boolean {
    return this.mode === 'connection';
  }

  /**
   * 현재 리소스가 노트북 인지
   * @returns {boolean}
   */
  public isNotebookMode(): boolean {
    return this.mode === 'notebook';
  }

  /**
   * 더 조회할 컨텐츠가 있는지
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages -1);
  }

  /**
   * 브라우저 언어가 영어인지
   * @returns {boolean}
   */
  public isBrowserLangEng(): boolean {
    return this.translateService.getBrowserLang() === 'en';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // sort
    this.selectedContentSort = new Order();
    // dataList
    this.dataList = [];
    // page result init
    this.pageResult.number = 0;
  }

  /**
   * 데이터소스 리스트 조회
   * @param {string} workspaceId
   * @private
   */
  private _getDatasourceList(workspaceId: string): void {
    // 로딩 show
    this.loadingShow();
    // 데이터소스 조회
    this.workspaceService.getDataSources(workspaceId, this._getListParams(), 'default')
      .then((result) => {
        // 리스트 초기화
        if (this.pageResult.number === 0) {
          this.dataList = [];
        }
        // page result
        this.pageResult = result['page'];
        // 리스트
        this.dataList = result['_embedded'] ? this.dataList.concat(result['_embedded'].datasources) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      })
  }

  /**
   * 데이터 커넥션 리스트 조회
   * @param {string} workspaceId
   * @private
   */
  private _getDataConnectionList(workspaceId: string): void {
    // 로딩 show
    this.loadingShow();
    // 커넥션 조회
    this.workspaceService.getDataConnectionList(workspaceId, this._getListParams(), 'default')
      .then((result) => {
        // 리스트 초기화
        if (this.pageResult.number === 0) {
          this.dataList = [];
        }
        // page result
        this.pageResult = result['page'];
        // 리스트
        this.dataList = result['_embedded'] ? this.dataList.concat(result['_embedded'].connections) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      })
  }

  /**
   * 노트북 커넥터 리스트 조회
   * @param {string} workspaceId
   * @private
   */
  private _getNotebookConnectorList(workspaceId: string): void {
    // 로딩 show
    this.loadingShow();
    // 커넥션 조회
    this.workspaceService.getNoteBookConnectorList(workspaceId, this._getListParams(), 'default')
      .then((result) => {
        // 리스트 초기화
        if (this.pageResult.number === 0) {
          this.dataList = [];
        }
        // page result
        this.pageResult = result['page'];
        // 리스트
        this.dataList = result['_embedded'] ? this.dataList.concat(result['_embedded'].connectors) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      })
  }

  /**
   * 리스트 조회시 파라메터
   * @returns {Object}
   * @private
   */
  private _getListParams(): object {
    return {
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort,
      page: this.pageResult.number,
      size: 30
    };
  }

  /**
   * 리스트 조회
   * @private
   */
  private _getDataList(): void {
    // 리스트 재조회
    switch (this.mode) {
      case 'datasource':
        this._getDatasourceList(this._workspaceId);
        break;
      case 'connection':
        this._getDataConnectionList(this._workspaceId);
        break;
      case 'connector':
        this._getNotebookConnectorList(this._workspaceId);
        break;
    }
  }
}

class Order {
  key: string = 'name';
  sort: string = 'asc';
}
