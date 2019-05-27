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

import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { Component, ElementRef, Injector, Input, ViewChild } from '@angular/core';
import { AuditService } from '../../../service/audit.service';
import { Audit } from '../../../../../domain/audit/audit';
import { LogComponent } from '../../../../../common/component/modal/log/log.component';
import { QueryHistory } from '../../../../../domain/query/queryHistory';
import { Log } from '../../../../../common/domain/modal';
import { DatePipe } from '@angular/common';
import { isUndefined } from 'util';
import { LogEditorComponent } from '../../../component/log-editor/log-editor.component';
import { MomentDatePipe } from '../../../../../common/pipe/moment.date.pipe';
import { ActivatedRoute } from '@angular/router';
import { CommonUtil } from '../../../../../common/util/common.util';
import {Location} from "@angular/common";

declare let moment: any;

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  providers: [MomentDatePipe]
})
export class JobDetailComponent extends AbstractPopupComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // audit Id
  private _auditId: string;

  // log 출력용 컴포넌트
  @ViewChild(LogComponent)
  private logComponent: LogComponent;

  @ViewChild(LogEditorComponent)
  private logEditorComponent: LogEditorComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // audit info
  public audit: Audit;

  // 쿼리 히스토리 리스트
  public queryHistoryList: QueryHistory[];

  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected auditService: AuditService,
              protected element: ElementRef,
              protected activatedRoute : ActivatedRoute,
              protected location: Location,
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
    // Router에서 파라미터 전달 받기
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this._auditId = params['id'];
        // 상세정보 조회
        this._getAuditDetail();
      }
    });
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public convertMilliseconds:Function = CommonUtil.convertMilliseconds;

  /**
   * 상세 팝업 종료
   */
  public close(): void {
    let prev = this.auditService.previousRouter;
    if(''!== prev) {
      this.auditService.previousRouter = '';
      this.router.navigateByUrl(prev);
    } else {
      this.location.back();
    }

  }

  /**
   * plan값이 null 인지
   * @returns {boolean}
   */
  public isPlanNull(): boolean {
    return isUndefined(this.audit.plan) || this.audit.plan === null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 플랜 모달 오픈 이벤트
   */
  public onClickOpenPlanModal(): void {
    // plan 값 있는지 확인
    if (this.isPlanNull()) {
      return;
    }
    const log: Log = new Log;
    log.title = 'Plan Information';
    // 생성시간
    log.subTitle = [];
    log.subTitle.push(moment(this.audit.startTime).format('YYYY-MM-DD HH:mm'));
    log.data = this.audit.plan;
    // log 모달 오픈
    this.logComponent.init(log);
  }

  /**
   * 쿼리 모달 오픈 이벤트
   * @param {QueryHistory} queryData
   */
  public onClickOpenQueryModal(queryData: QueryHistory): void {
    const log: Log = new Log;
    const datePipe = new DatePipe('en-EN');
    log.title = 'QUERY';
    log.subTitle = [];
    // 생성시간 | 소요시간 | 성공여부
    log.subTitle.push(datePipe.transform(queryData.queryStartTime, 'yyyy-MM-dd HH:mm'));
    log.subTitle.push(queryData.queryTimeTakenFormatted);
    log.subTitle.push(queryData.queryResultStatus.toString());
    log.data = queryData.query;
    log.isShowCopy = true;
    // log 모달 오픈
    this.logEditorComponent.init(log);
  }

  /**
   * 로그 모달 오픈 이벤트
   * @param {string} type
   * @param {QueryHistory} queryData
   */
  public onClickOpenLogModal(type: string, queryData ?: QueryHistory): void {
    const log: Log = new Log;
    const datePipe = new DatePipe('en-EN');
    // titles
    log.subTitle = [];
    switch (type) {
      // case 'log':
      //   log.title = 'Log';
      //   // 생성시간 | 소요시간
      //   log.subTitle.push(datePipe.transform(this.audit.startTime, 'yyyy-MM-dd HH:mm'));
      //   log.subTitle.push(this.convertMilliseconds(this.audit.elapsedTime));
      //   log.data = this.audit.jobLog;
      //   break;
      case 'name':
        log.title = 'JOB NAME';
        // 생성시간 | 질의 유형 | 소요시간 | 성공여부
        log.subTitle.push(datePipe.transform(this.audit.startTime, 'yyyy-MM-dd HH:mm'));
        log.subTitle.push(this.audit.type.toString());
        log.subTitle.push(this.convertMilliseconds(this.audit.elapsedTime));
        log.data = this.audit.jobName;
        // status가 있다면 title에 성공여부 추가
        this.audit.hasOwnProperty('status') && log.subTitle.push(this.audit.status.toString());
        break;
      case 'query':
        log.title = 'QUERY';
        // 생성시간 | 소요시간 | 성공여부
        log.subTitle.push(datePipe.transform(queryData.queryStartTime, 'yyyy-MM-dd HH:mm'));
        log.subTitle.push(queryData.queryTimeTakenFormatted);
        log.subTitle.push(queryData.queryResultStatus.toString());
        log.data = queryData.query;
        break;
    }
    // flag
    log.isShowCopy = true;
    // log 모달 오픈
    this.logEditorComponent.init(log);
  }

  /**
   * 정렬 클릭 이벤트
   * @param {string} key
   */
  public onClickSort(key: string): void {
    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== key ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = key;

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
    // 정렬
    this.queryHistoryList = this.queryHistoryList.sort((prev, next) => {
      return this.selectedContentSort.sort === 'desc'
        ? (prev[key] > next[key] ? -1 : prev[key] < next[key] ? 1 : 0)
        : (prev[key] < next[key] ? -1 : prev[key] > next[key] ? 1 : 0);
    });
  }

  /**
   * 로그 클릭 이벤트
   * @param {string} log
   */
  public onClickLog(log: string): void {
    window.open(log);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * audit 히스토리 상세 정보 조회
   * @private
   */
  private _getAuditDetail(): void {
    // 로딩 시작
    this.loadingShow();

    this.auditService.getAuditDetail(this._auditId)
      .then((result) => {
        // audit 데이터 저장
        this.audit = result;
        // 타입이 쿼리일 경우 히스토리까지 조회
        result.type === 'QUERY' ? this._getQueryHistory(this.audit.dataConnectionId) : this.loadingHide();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 쿼리 히스토리 조회
   * @param {string} connectionId
   * @private
   */
  private _getQueryHistory(connectionId: string): void {
    this.auditService.getQueryHistories({ dataConnectionId: connectionId, page: 0, size: 5 })
      .then((result) => {
        // 데이터 있을때
        result._embedded && (this.queryHistoryList = result._embedded.queryhistories.sort((prev, next) => {
          return prev.queryStartTime > next.queryStartTime ? -1 : prev.queryStartTime < next.queryStartTime ? 1 : 0;
        }));
        // 로딩 종료
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 종료
        this.loadingHide();
      });
  }
}

class Order {
  key: string = 'queryStartTime';
  sort: string = 'desc';
}
