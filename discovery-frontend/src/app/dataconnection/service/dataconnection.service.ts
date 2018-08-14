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

import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '../../common/service/abstract.service';
import {CommonUtil} from '../../common/util/common.util';
import {Page} from '../../domain/common/page';

@Injectable()
export class DataconnectionService extends AbstractService {

  // Dictionary url
  private URL_CONNECTIONS = this.API_URL + 'connections';

  constructor(protected injectior: Injector) {
    super(injectior);
  }

  // 데이터커넥션 목록
  public getDataconnections(param: any, projection: string = 'list'): Promise<any[]> {

    let url = this.API_URL + `connections`;

    if (param.hasOwnProperty('implementor') && param.hasOwnProperty('name')) {
      url += '/search/nameAndimplementor';
    } else if (param.hasOwnProperty('implementor')) {
      url += '/search/implementor';
    } else if (param.hasOwnProperty('name')) {
      url += '/search/name';
    }

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + '&projection=' + projection);
  }

  // 데이터 커넥션 모든 목록
  public getAllDataconnections(param: any, projection: string = 'list'): Promise<any[]> {

    let url = this.API_URL + `connections`;

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + '&projection=' + projection);
  }

  // 커넥션 상세정보 조회
  public getDataconnectionDetail(connectionId: string, projection: string = 'default'): Promise<any> {

    const url = this.API_URL + `connections/${connectionId}`;

    return this.get(url + '?projection=' + projection);
  }

  /**
   * 커넥션 아이디로 데이터베이스 조회
   * @param {string} connectionId
   * @param {Page} page
   * @param {string} searchName
   * @returns {Promise<any>}
   */
  public getDatabases(connectionId: string, page?:Page, searchName?:string): Promise<any> {
    let url:string = this.API_URL + `connections/${connectionId}/databases`;
    if (page || searchName) {
      let param:any = {};

      if( page ) {
        param.sort = page.sort;
        param.page = page.page;
        param.size = page.size;
      }
      ( searchName ) && ( param.databaseName = searchName );

      url += '?' + CommonUtil.objectToUrlString(param);
    }
    return this.get(url);
  } // function - getDatabases

  // 커넥션 정보로만 데이터베이스 조회
  public getDatabasesWithoutId(param: any): Promise<any> {
    return this.post(this.API_URL + 'connections/query/databases', param);
  }

  // 데이터 테이블 조회
  public getTables(connectionId: string, databaseName: string, page?:Page): Promise<any> {
    let url:string = this.API_URL + `connections/${connectionId}/databases/${databaseName}/tables`;
    if (page) {
      let param:any = {};

      if( page ) {
        param.sort = page.sort;
        param.page = page.page;
        param.size = page.size;
      }

      url += '?' + CommonUtil.objectToUrlString(param);
    }
    return this.get(url);
  }

  // 커넥션 정보로 데이터 테이블 조회
  public getTablesWitoutId(param: any): Promise<any>  {
    return this.post(this.API_URL + 'connections/query/tables?size=5000', param);
  }

  // 테이블 상세조회
  public getTableDetailWitoutId(param: any): Promise<any>  {
    return this.post(this.API_URL + 'connections/query/data', param);
  }

  // 데이터 테이블 조회 -> 이름으로
  public getSearchTables(connectionId: string, databaseName: string, tableName: string, page?:Page): Promise<any> {
    let url = this.API_URL + `connections/${connectionId}/databases/${databaseName}/tables?tableName=${tableName}`;

    if (page) {
      url += '&' + CommonUtil.objectToUrlString(page);
    }

    return this.get(url);
  }

  // 커넥션 상태 조회
  public checkConnection(param: any) : Promise<any> {
    return this.post(this.API_URL + 'connections/query/check', param);
  }

  // 커넥션 생성
  public createConnection(param: any) : Promise<any> {
    return this.post(this.API_URL + 'connections', param);
  }

  // 커넥션 수정
  public updateConnection(connectionId: string, param: any): Promise<any> {
    return this.patch(this.API_URL + `connections/${connectionId}`, param);
  }

  // 커넥션에 워크스페이스 추가
  public addConnectionWorkspaces(connectionId: string, param: any): Promise<any> {
    const connIds = param.map((id) => {
      return '/api/workspaces/' + id;
    }).join('\n');
    return this.patch(this.API_URL + `connections/${connectionId}/workspaces`, connIds,'text/uri-list');
  }

  // 커넥션에 워크스페이스 제거
  public deleteConnectionWorkspaces(connectionId: string, param: any): Promise<any> {
    const connIds = param.map((connection) => {
      return connection;
    }).join(',');
    return this.delete(this.API_URL + `connections/${connectionId}/workspaces/${connIds}`);
  }

  // 커넥션 삭제
  public deleteConnection(connectionId: string) : Promise<any> {
    return this.delete(this.API_URL + `connections/${connectionId}`);
  }

  // 컬럼 리스트 검색.
  public getColumnList(connectionId: string, databaseName: string, tableName: string, columnNamePattern: string, webSocketId: string, page: Page) {
    let url = this.API_URL + `connections/${connectionId}/databases/${databaseName}/tables/${tableName}/columns?columnNamePattern=${columnNamePattern}&webSocketId=${webSocketId}`;
    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // 테이블 인포메이션 검색.
  public getTableInfomation(connectionId: string, databaseName: string, tableName: string, webSocketId: string, page: Page) {
    let url = this.API_URL + `connections/${connectionId}/databases/${databaseName}/tables/${tableName}/information?webSocketId=${webSocketId}`;
    url += '&' + CommonUtil.objectToUrlString(page);
    return this.get(url);
  }

  // database 스키마 변경
  public setDatabaseShema(connection: string, databaseName: string, webSocket: string) {
    const params = {
      webSocketId : webSocket
    };
    const url = this.API_URL + `connections/${connection}/databases/${databaseName}/change`;
    return this.post(url, params);
  }

  /**
   * stageDB 생성시 데이터베이스 조회
   * @returns {Promise<any>}
   */
  public getDatabaseForHive(): Promise<any> {
    return this.post(this.API_URL + 'connections/query/hive/databases', null);
  }

  /**
   * stageDB 생성시 테이블 조회
   * @param {string} databaseName
   * @returns {Promise<any>}
   */
  public getTableForHive(databaseName: string): Promise<any> {
    const params = {
      database: databaseName
    };
    return this.post(this.API_URL + 'connections/query/hive/tables', params)
  }

  /**
   * stageDB 생성시 테이블 상세데이터 조회
   * @param params
   * @returns {Promise<any>}
   */
  public getTableDataForHive(params: any): Promise<any> {
    return this.post(this.API_URL + 'connections/query/hive/data', params);
  }

  /**
   * 메타데이터 내에서 stageDB로 생성시 테이블 목록 조회
   * @param {string} databaseName
   * @returns {Promise<any>}
   */
  public getTableListForStageInMetadata(databaseName: string): Promise<any> {
    return this.post(this.URL_CONNECTIONS + '/metadata/tables/stage', {database: databaseName})
  }

  /**
   * 메타데이터 내에서 HIVE로 생성시 테이블 목록 조회
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public getTableListForHiveInMetadata(params: object): Promise<any> {
    return this.post(this.URL_CONNECTIONS + '/metadata/tables/jdbc', params);
  }
}
