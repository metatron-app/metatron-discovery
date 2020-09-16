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

import { ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { Widget } from '../../domain/dashboard/widget/widget';
import { EventBroadcaster } from '../../common/event/event.broadcaster';
import { LayoutMode } from '../../domain/dashboard/dashboard';
import * as $ from "jquery";
import {Alert} from "../../common/util/alert.util";
import {isNullOrUndefined} from "util";

export abstract class AbstractWidgetComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public widget: Widget;

  // 위젯 권한 모드
  public isEditMode: boolean = false;
  public isViewMode: boolean = false;
  public isAuthMgmtViewMode: boolean = false;

  public isVisibleScrollbar: boolean = false;   // 스크롤바 표시 여부 체크

  public isMissingDataSource:boolean = false;
  public isError: boolean = false;                // 에러 상태 표시 여부
  public errorInfo: { show?: boolean, code?: string, details?: string };    // 에러 정보

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables - Input & Output
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public layoutMode: LayoutMode;

  @Input()
  public isShowTitle: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  protected constructor(
    protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {
    this.isViewMode = (
      this.layoutMode === LayoutMode.VIEW
      || this.layoutMode === LayoutMode.VIEW_AUTH_MGMT
      || this.layoutMode === LayoutMode.STANDALONE
    );
    this.isAuthMgmtViewMode = ( this.layoutMode === LayoutMode.VIEW_AUTH_MGMT );
    this.isEditMode = ( this.layoutMode === LayoutMode.EDIT );
  } // function - ngAfterViewInit

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 위젯 수정
   */
  public editWidget() {
    if( this.isMissingDataSource ) {
      Alert.warning( this.translateService.instant('msg.board.alert.can-not-edit-missing-datasource') );
      return;
    }
    // workbook.component 로 이벤트 전달 -> 워크북에서 대시보드 편집 화면으로 이동시킴
    this.broadCaster.broadcast(
      'MOVE_EDIT_WIDGET',
      {
        cmd: 'MODIFY',
        id: this.widget.id,
        type: this.widget.type.toUpperCase()
      }
    );
  } // function - editWidget

  /**
   * 위젯 컴포넌트 구동 시작
   */
  public processStart() {
    this.broadCaster.broadcast( 'START_PROCESS', { widgetId : this.widget.id } );
  } // function - processStart

  /**
   * 위젯 컴포넌트 구동 종료
   */
  public processEnd() {
    this.broadCaster.broadcast( 'STOP_PROCESS', { widgetId : this.widget.id } );
  } // function - processEnd

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 에러 표시
   * @param {{show:boolean, code:string, details:string}} error
   */
  protected _showError(error: { show?: boolean, code?: string, details?: string }) {
    if( this.isEditMode ) {
      this.commonExceptionHandler(error);
    } else {
      (isNullOrUndefined(error) || typeof error != "object") && (error = {});
      error.show = false;
      this.errorInfo = error;
    }
    this.isError = true;

  } // function - _showError

  /**
   * 에러 숨김
   */
  protected _hideError() {
    this.errorInfo = undefined;
    this.isError = false;
  } // function - _hideError

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
