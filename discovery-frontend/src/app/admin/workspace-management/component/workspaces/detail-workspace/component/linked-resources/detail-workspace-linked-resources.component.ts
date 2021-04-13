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

import {Component, ElementRef, Injector, Input, OnInit, ViewChild} from '@angular/core';
import { AbstractComponent } from '@common/component/abstract.component';
import { SourceType, Status } from '@domain/datasource/datasource';
import {PageResult} from '@domain/common/page';

import { ResourcesViewComponent } from '../viewer/resources-view.component';
import { WorkspaceService } from '../../../../../../../workspace/service/workspace.service';

@Component({
  selector: 'detail-workspaces-linked-resources',
  templateUrl: './detail-workspace-linked-resources.component.html'
})
export class DetailWorkspaceLinkedResourcesComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스
  private _workspace: any;

  @ViewChild(ResourcesViewComponent)
  private _resourcesViewComponent: ResourcesViewComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('workspace')
  public set setWorkspace(workspace) {
    // 워크스페이스 상세정보
    this._workspace = workspace;
    // workspace id 있을때만
    if (workspace.id) {
      // get resources list
      this._getResourcesList();
    }
  }

  // 데이터소스 리스트
  public datasourceList: any[] = [];
  public datasourcePageResult: PageResult;
  // 데이터커넥션 리스트
  public connectionList: any[] = [];
  public connectionPageResult: PageResult;
  // 노트북 서버 리스트
  public connectorList: any[] = [];
  public connectorPageResult: PageResult;

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
    // ui init
    this._initView();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터소스 리스트 더보기 클릭 이벤트
   */
  public onClickMoreDatasources(): void {
    this._resourcesViewComponent.init('datasource', this._workspace.id, this.datasourceList, this.datasourcePageResult);
  }

  /**
   * 데이터 커넥션 리스트 더보기 클릭 이벤트
   */
  public onClickMoreConnections(): void {
    this._resourcesViewComponent.init('connection', this._workspace.id, this.connectionList, this.connectionPageResult);
  }

  /**
   * 노트북 커넥터 리스트 더보기 클릭 이벤트
   */
  public onClickMoreConnector(): void {
    this._resourcesViewComponent.init('connector', this._workspace.id, this.connectorList, this.connectorPageResult);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터소스 리스트
   * @returns {any}
   */
  public getDatasourceList(): any {
    return this.datasourceList.slice(0, 3);
  }

  /**
   * 데이터 커넥션 리스트
   * @returns {any}
   */
  public getConnectionList(): any {
    return this.connectionList.slice(0, 3);
  }

  /**
   * 노트북 커넥터 리스트
   * @returns {any}
   */
  public getNotebookConnectorList(): any {
    return this.connectorList;
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
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   * @private
   */
  private _initView(): void {
    // 리스트 초기화
    this.datasourceList = [];
    this.connectionList = [];
    this.connectorList = [];
    // count init
    this.datasourcePageResult = new PageResult();
    this.connectionPageResult = new PageResult();
    this.connectorPageResult = new PageResult();
  }

  /**
   * 리소스 리스트 조회
   * @private
   */
  private _getResourcesList(): void {
    const q = [];
    // 로딩 show
    this.loadingShow();
    // 데이터소스 리스트
    q.push(this._getDatasourceList(this._workspace.id, {page: 0, size: 30, sort: 'name,asc'}).then((result) => {
      // list count
      this.datasourcePageResult = result['page'];
      // list
      this.datasourceList = result['_embedded'] ? result['_embedded'].datasources : [];
    }));
    // 데이터 커넥션 리스트
    q.push(this._getDataConnectionList(this._workspace.id, {page: 0, size: 30, sort: 'name,asc'}).then((result) => {
      // list count
      this.connectionPageResult = result['page'];
      // list
      this.connectionList = result['_embedded'] ? result['_embedded'].connections : [];
    }));
    // 노트북 커넥터 리스트
    q.push(this._getNotebookConnectorList(this._workspace.id, {page: 0, size: 30, sort: 'name,asc'}).then((result) => {
      // list count
      this.connectorPageResult = result['page'];
      // list
      this.connectorList = result['_embedded'] ? result['_embedded'].connectors : [];
    }));
    // 리스트 서비스 조회
    Promise.all(q)
      .then(() => {
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 데이터소스 리스트 조회
   * @param {string} workspaceId
   * @param {Object} params
   * @returns {Promise<any>}
   * @private
   */
  private _getDatasourceList(workspaceId: string, params: object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.workspaceService.getDataSources(workspaceId, params, 'default')
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error)
        })
    });
  }

  /**
   * 데이터 커넥션 리스트 조회
   * @param {string} workspaceId
   * @param {Object} params
   * @returns {Promise<any>}
   * @private
   */
  private _getDataConnectionList(workspaceId: string, params: object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.workspaceService.getDataConnectionList(workspaceId, params, 'default')
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error)
        })
    });
  }

  /**
   * 노트북 커넥터 리스트 조회
   * @param {string} workspaceId
   * @param {Object} params
   * @returns {Promise<any>}
   * @private
   */
  private _getNotebookConnectorList(workspaceId: string, params: object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.workspaceService.getNoteBookConnectorList(workspaceId, params, 'default')
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error)
        })
    });
  }
}
