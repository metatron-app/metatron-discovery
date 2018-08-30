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

import { Component, ElementRef, Injector, OnInit } from '@angular/core';
import { BoardDataSource, BoardDataSourceRelation, Dashboard } from '../../../domain/dashboard/dashboard';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { DashboardService } from '../../service/dashboard.service';
import { Alert } from '../../../common/util/alert.util';
import { CommonUtil } from '../../../common/util/common.util';
import { StringUtil } from '../../../common/util/string.util';
import { BoardGlobalOptions } from '../../../domain/dashboard/dashboard.globalOptions';
import { EventBroadcaster } from '../../../common/event/event.broadcaster';
import { DashboardUtil } from '../../util/dashboard.util';

@Component({
  selector: 'create-board-complete',
  templateUrl: './create-board-complete.component.html'
})
export class CreateBoardCompleteComponent extends AbstractPopupComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _workbookId: string;

  private _dataSources: BoardDataSource[];
  private _relations: BoardDataSourceRelation[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public dashboard: Dashboard;

  // 컴포넌트 표시 여부
  public isShow: boolean = false;

  // 워크북 이름
  public workbookName: string;

  // 유효성 관련 - 이름
  public isInvalidName: boolean = false;
  public errMsgName: string = '';

  // 유효성 관련 - 설명
  public isInvalidDesc: boolean = false;
  public errMsgDesc: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private dashboardService: DashboardService,
              private broadCaster: EventBroadcaster) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
    this.useUnloadConfirm = true;
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 열기
   * @param {string} workbookId
   * @param {string} workbookName
   * @param {BoardDataSource[]} dataSources
   * @param {BoardDataSourceRelation[]} relations
   */
  public openComp(workbookId: string, workbookName: string,
                  dataSources: BoardDataSource[], relations: BoardDataSourceRelation[]) {
    this._workbookId = workbookId;
    this._dataSources = dataSources;
    this._relations = relations;
    this.dashboard = new Dashboard();
    this.workbookName = workbookName;
    this.isShow = true;
  } // function - openComp

  /**
   * 컴포넌트 닫기
   * @param {boolean} isForceClose
   */
  public closeComp(isForceClose: boolean = false) {
    this.isShow = false;
    (isForceClose) && (this.close());
  } // function - closeComp

  /**
   * 대시보드 생성 작업 완료 처리
   */
  public complete() {

    if (this._verifyNameAndDesc()) {

      this.loadingShow();

      // layout 옵션
      const options: BoardGlobalOptions = new BoardGlobalOptions();

      // 데이터소스 & 연관관계 설정
      this.dashboard = DashboardUtil.setDataSourceAndRelations( this.dashboard, this._dataSources, this._relations );

      this.dashboardService.createDashboard(this._workbookId, this.dashboard, options).then(() => {
        Alert.success(`'${this.dashboard.name}' ` + this.translateService.instant('msg.board.alert.create.success'));
        this.loadingHide();
        this.broadCaster.broadcast('WORKBOOK_RELOAD_BOARD_LIST', { boardName: this.dashboard.name });
        this.close();
      }).catch(err => this.commonExceptionHandler(err));
    }
  } // function - complete

  /**
   * 데이터 소스 이름 조회
   * @returns {string}
   */
  public getDatasourceNames(): string {
    return this._dataSources.reduce((acc: string, currDs: BoardDataSource, currIdx: number) => {
      let result = currDs.name;
      if (currDs.joins && currDs.joins.length > 0) {
        result += ' / ' + currDs.joins.map(ds => ds.name).join(', ');
      }
      (0 < currIdx) && (result = '<br>' + result);
      return acc + result;
    }, '');
  } // function - getDatasourceNames

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /** validation */
  private _verifyNameAndDesc() {
    this.dashboard.name = (this.dashboard.name) ? this.dashboard.name.trim() : '';
    if (StringUtil.isEmpty(this.dashboard.name)) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return false;
    }

    if (CommonUtil.getByte(this.dashboard.name) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return false;
    }

    if (this.dashboard.description != null
      && CommonUtil.getByte(this.dashboard.description.trim()) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return false;
    }
    return true;
  } // function - _verifyNameAndDesc

}
