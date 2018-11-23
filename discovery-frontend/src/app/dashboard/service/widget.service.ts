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
import { Injectable } from '@angular/core';
import { AbstractService } from '../../common/service/abstract.service';
import { Widget } from '../../domain/dashboard/widget/widget';
import { ResponseContentType, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { CookieConstant } from '../../common/constant/cookie.constant';
import { SearchQueryRequest } from '../../domain/datasource/data/search-query-request';
import { UIOption } from '../../common/component/chart/option/ui-option';
import { SPEC_VERSION } from '../../common/component/chart/option/define/common';
import { OptionGenerator } from '../../common/component/chart/option/util/option-generator';
import { FilterUtil } from '../util/filter.util';

@Injectable()
export class WidgetService extends AbstractService {

  /**
   * 위젯 정보 조회
   * @param {string} widgetId
   * @return {Promise<any>}
   */
  public getWidget(widgetId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(this.API_URL + `widgets/${widgetId}?projection=forDetailView`)
        .then(widgetData => {
          this.get(this.API_URL + `widgets/${widgetId}/dashBoard?projection=forDetailView`)
            .then(boardData => {
              widgetData.dashBoard = boardData;
              resolve(widgetData);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  } // function - getWidget

  /**
   * 위젯 생성
   * @param {Widget} widget
   * @param {string} dashboardId
   * @return {Promise<any>}
   */
  public createWidget(widget: Widget, dashboardId: string): Promise<any> {
    const url = this.API_URL + 'widgets';
    let param = _.extend({ name: '' }, widget, {
      dashBoard: '/api/dashboards/' + dashboardId
    });

    // for UI 속성 제거
    param = this._convertSpecToServer(_.cloneDeep(param));
    return this.post(url, param);
  }

  /**
   * 위젯 정보 갱신
   * @param {string} widgetId
   * @param options
   * @return {Promise<any>}
   */
  public updateWidget(widgetId: string, options: any): Promise<any> {

    // 차트 스펙버전 확인
    if (options && options['configuration'] && _.eq(options['configuration']['type'], 'page')) {

      try {
        let uiOption: UIOption = <UIOption>options['configuration']['chart'];

        if (!uiOption.version || uiOption.version < SPEC_VERSION) {
          // 옵션 초기화
          uiOption = OptionGenerator.initUiOption(uiOption);
          options['configuration']['chart'] = uiOption;
        }
      }
      catch (error) {
      }
    }

    options = this._convertSpecToServer(_.cloneDeep(options));
    return this.patch(this.API_URL + 'widgets/' + widgetId, options);
  }

  /**
   * 위젯 정보 삭제
   * @param {string} widgetId
   * @return {Promise<any>}
   */
  public deleteWidget(widgetId: string): Promise<any> {
    return this.delete(this.API_URL + 'widgets/' + widgetId);
  }

  /**
   * 위젯 설정 다운로드
   * @param {SearchQueryRequest} query
   * @param {boolean} original
   * @param {number} maxRowsPerSheet
   * @return {Observable<any>}
   */
  public downloadConfig(query: SearchQueryRequest, original: boolean, maxRowsPerSheet: number): Observable<any> {

    // 파라미터 가공
    let config: Object = {
      type: 'page',
      dataSource: query.dataSource,
      fields: query.userFields,
      filters: query.filters,
      pivot: query.pivot,
      limit: query.limits
    };

    // URL
    let url: string = this.API_URL + 'widgets/config/download?original=' + original + '&maxRowsPerSheet=' + maxRowsPerSheet;

    // 헤더
    let headers = new Headers({
      'Accept': 'application/vnd.ms-excel',
      'Content-Type': 'application/json',
      'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
    });

    // 옵션
    let option: Object = {
      headers: headers,
      responseType: ResponseContentType.Blob
    };

    // 호출
    return this.http.post(url, config, option)
      .map((res) => {
        return new Blob([res.blob()], { type: 'application/vnd.ms-excel' })
      });
  }

  /**
   * 위젯 정보 미리보기
   * @param {string} widgetId
   * @param {boolean} original
   * @param {boolean} preview
   * @returns {Promise<any>}
   */
  public previewWidget(widgetId: string, original: boolean, preview:boolean ): Promise<any> {
    const url = this.API_URL + `widgets/${widgetId}/data?original=${original}&preview=${preview}`;
    return this.post(url, null);
  } // function - previewWidget

  /**
   * 위젯 데이터 다운로드
   * @param {string} widgetId
   * @param {boolean} original
   * @param {number} maxRowsPerSheet
   * @param {string} fileType
   * @returns {Observable<any>}
   */
  public downloadWidget(widgetId: string, original: boolean, maxRowsPerSheet?: number, fileType?: string): Observable<any> {

    // URL
    let url: string = this.API_URL + 'widgets/' + widgetId + '/download?original=' + original;

    if (maxRowsPerSheet) {
      url = url + '&maxRowsPerSheet=' + maxRowsPerSheet;
    }

    const strType: string = ('CSV' === fileType) ? 'application/csv' : 'application/vnd.ms-excel';

    // 헤더
    let headers = new Headers({
      'Accept': strType,
      'Content-Type': 'application/octet-binary',
      'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
    });

    // 옵션
    let option: Object = {
      headers: headers,
      responseType: ResponseContentType.Blob
    };

    // 호출
    return this.http.post(url, null, option)
      .map((res) => {
        return new Blob([res.blob()], { type: strType })
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * UI 스펙을 서버 스펙으로 변경
   * @param param
   * @return {any}
   * @private
   */
  private _convertSpecToServer(param: any) {
    if (param) {
      let conf = param.configuration;
      if (conf && conf.filter) {
        param.configuration.filter = FilterUtil.convertToServerSpecForDashboard( conf.filter );
      }
      if (conf && conf.filters) {
        param.configuration.filters = conf.filters.map(item => FilterUtil.convertToServerSpecForDashboard( item ) );
      }
      if (conf && conf.pivot) {
        if (conf.pivot.columns) {
          conf.pivot.columns.forEach(item => {
            delete item.field.filter;
          });
        }
        if (conf.pivot.rows) {
          conf.pivot.rows.forEach(item => {
            delete item.field.filter;
          });
        }
        if (conf.pivot.aggregations) {
          conf.pivot.aggregations.forEach(item => {
            delete item.field.filter;
          });
        }
      }
    }
    return param;
  } // function - _convertSpecToServer
}
