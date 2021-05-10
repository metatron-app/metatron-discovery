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

import {Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {CommonUtil} from '@common/util/common.util';
import {MomentDatePipe} from '@common/pipe/moment.date.pipe';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {IngestionHistory, IngestionStatus} from '@domain/datasource/datasource';
import {DatasourceService} from '../../../../../../datasource/service/datasource.service';

@Component({
  selector: 'batch-history',
  templateUrl: './batch-history.component.html',
  providers: [MomentDatePipe]
})
export class BatchHistoryComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private datasourceId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public batchFl: boolean = false;

  public histories: IngestionHistory[];

  public convertMilliseconds: (ms: number) => string = CommonUtil.convertMilliseconds;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected datasourceService: DatasourceService,
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

    this.initView()
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
   * Init
   * @param {string} datasourceId
   */
  public init(datasourceId: string) {
    // show
    this.batchFl = true;

    // 소스 id
    this.datasourceId = datasourceId;

    // 히스토리 조회
    this.getBatchHistory(datasourceId);
  }

  /**
   * get batch history status
   * @param {IngestionHistory} history
   * @returns {string}
   */
  public getStatus(history: IngestionHistory): string {
    const status = history.status;
    let result = 'Fail';
    switch (status) {
      case IngestionStatus.SUCCESS:
        result = 'Success';
        break;
      case IngestionStatus.FAILED:
        result = 'Fail';
        break;
      case IngestionStatus.PASS:
        result = 'Pass';
        break;
      case IngestionStatus.RUNNING:
        result = 'Running';
        break;
    }
    return result;
  }

  /**
   * get status icon
   * @param {IngestionHistory} history
   * @returns {string}
   */
  public getIconStatus(history: IngestionHistory): string {
    const status = history.status;
    let result = 'ddp-preparing';
    switch (status) {
      case IngestionStatus.SUCCESS:
        result = 'ddp-success';
        break;
      case IngestionStatus.FAILED:
        result = 'ddp-fail';
        break;
      case IngestionStatus.PASS:
        result = 'ddp-preparing';
        break;
      case IngestionStatus.RUNNING:
        result = 'ddp-preparing';
        break;
    }
    return result;
  }

  /**
   * 더 조회할 리스트가 있는지 여부
   * @returns {boolean}
   */
  public checkMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /**
   * 리스트 더보기
   */
  public moreList() {
    // 페이지 초기화
    this.pageResult.number += 1;

    // 리스트 재조회
    this.getBatchHistory(this.datasourceId);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init view
   */
  private initView() {
    this.pageResult.number = 0;
    this.pageResult.size = 20;
  }

  /**
   * 배치 히스토리 조회
   * @param {string} datasourceId
   */
  private getBatchHistory(datasourceId: string) {
    // 로딩 시작
    this.loadingShow();

    const params = {
      page: this.pageResult.number,
      size: this.pageResult.size
    };

    this.datasourceService.getBatchHistories(datasourceId, params)
      .then((histories) => {

        // page
        this.pageResult = histories.page;

        // 페이지가 첫번째면
        if (histories.page.number === 0) {
          this.histories = [];
        }

        // 데이터 있다면
        this.histories = histories['_embedded'] ? this.histories.concat(histories['_embedded'].ingestionHistories) : [];

        // 로딩 종료
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 종료
        this.loadingHide();
      });
  }
}
