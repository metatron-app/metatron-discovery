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
import {ScrollLoadingGridComponent} from './scroll-loading-grid.component';

declare const Slick: any;

export class ScrollLoadingGridModel {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private readonly _pageSize: number = 100;

  private _searchText: string = '';
  private _orgData: any[] = [];

  // 데이터 로딩 중 여부
  private _isLoadingData: boolean = false;

  // 현재 페이지
  private _currentPage: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public data: any = {length: 0};

  // events
  public onDataLoading = new Slick.Event();
  public onDataLoaded = new Slick.Event();
  public onMoreDataComplete = new Slick.Event();

  /**
   * 데이터 조회
   * @param {number} nextPage
   * @param {number} pageSize
   * @returns {Promise<any>}
   */
  public loadData: (ruleIndex: number, startIdx: number, pageSize: number) => Promise<any>;

  /**
   * 조회 성공
   */
  public loadSuccess: (data) => any;

  /**
   * 조회 실퍠
   */
  public loadFail: (error) => void;


  public totalRowCnt: number = 0;

  public ruleIndex: number;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(loadData: (ruleIndex: number, startIdx: number, pageSize: number) => Promise<any>,
              loadSuccess: (data) => any,
              data?: any[]) {
    this.loadData = loadData;
    this.loadSuccess = loadSuccess;
    if (data) {
      this._orgData = _.cloneDeep(data);
      data.forEach((item: any, idx: number) => {
        // 아이디 중복나지 않도록 처리
        item[ScrollLoadingGridComponent.ID_PROPERTY] = idx + 1;
        this.data[idx] = item;
      });
      this.data.length = data.length;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   *  전체 row count
   */
  public setTotalRowCnt(totalRowCnt: number): void {
    this.totalRowCnt = totalRowCnt;
  }

  /**
   *  ruleIndex
   */
  public setRuleIndex(ruleIndex: number): void {
    if (ruleIndex == null || ruleIndex === undefined) {
      this.ruleIndex = null;
    } else {
      this.ruleIndex = ruleIndex;
    }
  }

  /**
   *  pageInfo
   */
  public getPageInfo(): any {
    const pageInfo: any = {};
    let lastPageNumber: number = Math.floor(this.totalRowCnt / this._pageSize) - 1;
    if (this.totalRowCnt % this._pageSize !== 0) lastPageNumber = lastPageNumber + 1;
    // lastPageNumber =  lastPageNumber - 1;

    pageInfo.currentPage = this._currentPage;
    pageInfo.totalRowCnt = this.totalRowCnt;
    pageInfo.lastPage = ( lastPageNumber <= this._currentPage );
    pageInfo.lastPageNumber = lastPageNumber;
    pageInfo.pageSize = this._pageSize;
    pageInfo.ruleIndex = this.ruleIndex;
    pageInfo.length = this.data.length;
    return pageInfo;
  }

  /**
   *  setExternalData
   */
  public setExternalData(data: any, currentPage: number): void {
    const result = this.loadSuccess(data);
    if (result) {
      this.totalRowCnt = data.totalRowCnt;
      const currLength: number = this.data.length;

      // 검색을 위한 원본 데이터 목록 저장
      this._orgData = this._orgData.concat(result);

      this._filteringData(result)
        .forEach((item: any, idx: number) => {
          // 아이디 중복나지 않도록 처리
          item[ScrollLoadingGridComponent.ID_PROPERTY] = currLength + idx + 1;
          this.data[currLength + idx] = item;
          this.data.length = this.data.length + 1;
        });
      this._currentPage = currentPage;
    }
    this._isLoadingData = false;
  }

  /**
   *  검색 이전 단계로 초기화 Reset
   */
  public searchProcessReset(): void {
    if (0 < this._orgData.length) {
      this._searchText = '';
      this.data =
        this._filteringData(this._orgData)
          .reduce((acc, currVal, currIndex) => {
            currVal[ScrollLoadingGridComponent.ID_PROPERTY] = currIndex + 1;
            acc[currIndex] = currVal;
            acc.length = acc.length + 1;
            return acc;
          }, {length: 0});

      this.onDataLoaded.notify({from: 0, to: this.data.length});
    }

  }

  /**
   * 검색
   * @param {string} searchText
   */
  public search(searchText: string) {

    if (0 < this._orgData.length) {
      this._searchText = searchText;
      this.data =
        this._filteringData(this._orgData)
          .reduce((acc, currVal, currIndex) => {
            currVal[ScrollLoadingGridComponent.ID_PROPERTY] = currIndex + 1;
            acc[currIndex] = currVal;
            acc.length = acc.length + 1;
            return acc;
          }, {length: 0});

      this.onDataLoaded.notify({from: 0, to: this.data.length});
    }

  } // function - search

  /**
   * 데이터 호출
   * @param from
   * @param to
   */
  public ensureData(from, to) {

    if (this._isLoadingData) {
      return;
    }
    // console.log(from + ':this.totalRowCnt:'+ this.totalRowCnt);
    let lastPageNumber: number = Math.floor(this.totalRowCnt / this._pageSize);
    if (this.totalRowCnt % this._pageSize !== 0) lastPageNumber = lastPageNumber + 1;

    // 페이지 지정 ( to 에 20을 더한 것은 그만큼 미리 부르기 위한 것임 )
    const viewPortBottom: number = (isNaN(to) || (to + 20) < 0) ? 0 : (to + 20);
    const nextPage: number = Math.floor(viewPortBottom / this._pageSize);

    if (lastPageNumber <= nextPage) {
      return;
    }

    if (this._currentPage >= nextPage) {
      return;
    }

    const startIdx: number = nextPage * this._pageSize;
    if (this.data.length <= startIdx) {
      this._isLoadingData = true;
      this.onDataLoading.notify({from: from, to: to});
      this.loadData(this.ruleIndex, startIdx, this._pageSize)
        .then((data) => {
          const result = this.loadSuccess(data);
          if (result) {
            //
            this.totalRowCnt = data.totalRowCnt;
            // this.ruleIndex = data.ruleCurIdx;

            const currLength: number = this.data.length;

            // 검색을 위한 원본 데이터 목록 저장
            this._orgData = this._orgData.concat(result);

            this._filteringData(result)
              .forEach((item: any, idx: number) => {
                // 아이디 중복나지 않도록 처리
                item[ScrollLoadingGridComponent.ID_PROPERTY] = currLength + idx + 1;
                this.data[currLength + idx] = item;
                this.data.length = this.data.length + 1;
              });

            this._currentPage = nextPage;

          }
          this.onDataLoaded.notify({from: startIdx, to: (startIdx + this._pageSize)});
          this.onMoreDataComplete.notify('complete');
          this._isLoadingData = false;
        })
        .catch((error) => {
          console.error(error);
          this._isLoadingData = false;
          (this.loadFail) && (this.loadFail(error));
        });
    } else {
      // this.onDataLoaded.notify({ from: from, to: to });
    }

  } // function - ensureData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 검색어에 대한 데이터 필터링
   * @param {any[]} data
   * @returns {any[]}
   * @private
   */
  private _filteringData(data: any[]): any[] {
    if ('' !== this._searchText) {
      return data.filter(item => {
        return -1 < Object.keys(item).findIndex(key => {
          return -1 < String(item[key]).toLocaleUpperCase().indexOf(this._searchText.toLocaleUpperCase());
        });
      });
    } else {
      return data;
    }
  } // function - _filteringData

}
