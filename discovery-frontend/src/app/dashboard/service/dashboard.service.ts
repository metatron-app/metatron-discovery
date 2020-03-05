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

import * as _ from 'lodash';
import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '../../common/service/abstract.service';
import 'rxjs/add/operator/toPromise';
import {
  BoardConfiguration,
  BoardDataSource,
  Dashboard,
  JoinMapping
} from '../../domain/dashboard/dashboard';
import {BookTree} from '../../domain/workspace/book';
import {BoardGlobalOptions} from '../../domain/dashboard/dashboard.globalOptions';
import {FilterUtil} from '../util/filter.util';
import {MetadataService} from '../../meta-data-management/metadata/service/metadata.service';
import {CommonUtil} from '../../common/util/common.util';

declare let async;

@Injectable()
export class DashboardService extends AbstractService {

  private _dashboard:Dashboard;

  constructor(protected injector: Injector,
              private metadataService: MetadataService) {
    super(injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public setCurrentDashboard(board:Dashboard) {
    this._dashboard = board;
  }

  public getCurrentDashboard() {
    return this._dashboard;
  }

  /**
   * 데이터소스와 대시보드를 연결한다.
   * @param {string} boardId
   * @param {BoardDataSource[]} dataSources
   */
  public connectDashboardAndDataSource(boardId: string, dataSources: BoardDataSource[]) {
    let linksParam: string[] = dataSources.reduce((acc: string[], currVal: BoardDataSource) => {
      return acc.concat(this._getLinkDataSourceParam(currVal));
    }, []);

    return this.put(`/api/dashboards/${boardId}/datasources`, linksParam.join('\n'), 'text/uri-list');
  } // function - connectDashboardAndDataSource

  /**
   * 대시보드 생성
   * @param {string} workbookId
   * @param {Dashboard} dashboard
   * @param {BoardGlobalOptions} option
   * @param {Function} callback
   * @return {Promise<any>}
   */
  public createDashboard(workbookId: string, dashboard: Dashboard, option: BoardGlobalOptions, callback?:Function) {
    const url = this.API_URL + 'dashboards';
    const boardDs: BoardDataSource = dashboard.dataSource;
    let params = {
      workBook: `/api/workbooks/${workbookId}`,
      configuration: {
        dataSource: boardDs,
        options: option
      },
      name: dashboard.name,
      description: dashboard.description
    };
    (dashboard.temporaryId) && (params['temporaryId'] = dashboard.temporaryId);

    // for UI 속성 제거
    params = this.convertSpecToServer(_.cloneDeep(params));
    return this.post(url, params).then((board: Dashboard) => {
      return new Promise((resolve) => {
        ( callback ) && ( callback( board ) );
        this.connectDashboardAndDataSource(board.id, ('multi' === boardDs.type) ? boardDs.dataSources : [boardDs])
          .then(() => resolve(board));
      });
    });
  } // function - createDashboard

  /**
   * 대시보드 상세 조회
   * @param {string} dashboardId
   * @return {Promise<any>}
   */
  public getDashboard(dashboardId: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(this.API_URL + `dashboards/${dashboardId}?projection=forDetailView`)
        .then((board: Dashboard) => {
          const procMetas: Function[] = [];
          board.dataSources.forEach(ds => {
            procMetas.push((callback) => {
              this.metadataService.getMetadataForDataSource(ds.id).then(result => {
                (result && 0 < result.length) && (ds.uiMetaData = result[0]);
                callback();
              }).catch(() => callback())
            });
          });
          async.waterfall(procMetas, () => {
            resolve(board);
          });
        })
        .catch(reject)
    });
  } // function - getDashboard

  /**
   * 대시보드 삭제
   * @param {string} id
   * @return {Promise<any>}
   */
  public deleteDashboard(id: string) {
    return this.delete(this.API_URL + 'dashboards/' + id);
  } // function - deleteDashboard

  /**
   * 대시보드 수정
   * @param {string} dashboardId
   * @param options
   * @return {Promise<any>}
   */
  public updateDashboard(dashboardId: string, options: any) {
    // for UI 속성 제거
    const apiParams: any = this.convertSpecToServer(_.cloneDeep(options));
    return this.patch(this.API_URL + 'dashboards/' + dashboardId, apiParams);
  } // function - updateDashboard

  /**
   * 대시보드 복제
   * @param {string} dashboardId
   * @return {Promise<any>}
   */
  public copyDashboard(dashboardId: string) {

    return this.get(this.API_URL + `dashboards/${dashboardId}?projection=forDetailView`).then((info: Dashboard) => {
      if (info.configuration.customFields) {
        {
          info.configuration['userDefinedFields'] = _.cloneDeep( CommonUtil.objectToArray( info.configuration.customFields ) );
          delete info.configuration.customFields;
          info.configuration.widgets.forEach(item => item.isInLayout = true); // Processing to prevent widget information from being deleted
        }
        return this.updateDashboard(dashboardId, { configuration: info.configuration }).then(() => {
          return this.post(this.API_URL + 'dashboards/' + dashboardId + '/copy', null);
        })
      } else {
        return this.post(this.API_URL + 'dashboards/' + dashboardId + '/copy', null);
      }
    });
  } // function - copyDashboard

  /**
   * 대시보드 위젯 조회
   * @param {string} dashboardId
   * @param {string} projection
   * @return {Promise<BookTree>}
   */
  public getDashboardWidget(dashboardId: string, projection: string): Promise<BookTree> {
    return this.get(this.API_URL + `dashboards/${dashboardId}/widgets?projection=${projection}`);
  } // function - getDashboardWidget

  /******* 계산식 필드 *******/
  public getCalculationFunction() {
    return this.get(this.API_URL + 'expressions/list');
  }

  public validate(param: any) {
    return this.post(this.API_URL + 'datasources/validate/expr', param);
  }

  /**
   * UI 스펙을 서버 스펙으로 변경
   * @param param
   * @return {any}
   * @private
   */
  public convertSpecToServer(param: any) {
    if (param) {
      delete param['selectDatasource'];
      delete param['update'];
      if (param['configuration']) {
        const boardConf: BoardConfiguration = param['configuration'] as BoardConfiguration;
        if (boardConf.dataSource) {
          boardConf.dataSource.name = boardConf.dataSource.engineName;
          delete boardConf.dataSource.connType;
          delete boardConf.dataSource.engineName;
          delete boardConf.dataSource.uiFields;
          delete boardConf.dataSource.uiFilters;
          delete boardConf.dataSource.metaDataSource;
          delete boardConf.dataSource['orgDataSource'];
          if (boardConf.dataSource.dataSources) {
            boardConf.dataSource.dataSources.forEach(item => {
              delete item.uiFields;
              delete item.metaDataSource;
            });
          }
        }
        (boardConf.layout) && (boardConf.content = _.cloneDeep(boardConf.layout.content));
        if (boardConf.widgets) {
          boardConf.widgets = boardConf.widgets.filter(item => item.isInLayout);
          boardConf.widgets.forEach(item => {
            delete item.isInLayout;
            delete item.isSaved;
            delete item.isLoaded;
          });
        }
        if (boardConf.filters) {
          boardConf.filters
            = boardConf.filters.filter( item => {
              if( boardConf.dataSource.temporary ) {
                return 'recommended' !== item.ui.importanceType;
              } else {
                return true;
              }
            }).map(item => FilterUtil.convertToServerSpecForDashboard(item));
        }
        delete boardConf.layout;
        delete boardConf.fields;

        // convert spec UI to server ( customFields -> userDefinedFields )
        if (boardConf.customFields) {
          boardConf['userDefinedFields'] = _.cloneDeep( CommonUtil.objectToArray( boardConf.customFields ) );
          delete boardConf.customFields;
        }

      }
    }
    return param;
  } // function - convertSpecToServer

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 대시보드와 데이터소스 연결에 대한 파라메터 생성
   * @param {BoardDataSource} dataSource
   * @return {string[]}
   * @private
   */
  private _getLinkDataSourceParam(dataSource: BoardDataSource): string[] {

    let links: string[] = [dataSource.id];
    if (dataSource.type === 'mapping') {
      dataSource.joins.forEach((join: JoinMapping) => {
        links.push(join.id);
        (join.join) && (links.push(join.join.id));
      });
    }
    links = links.map(dsId => this.API_URL + 'datasources/' + dsId);

    return links;
  } // function - _getLinkDataSourceParam

}
