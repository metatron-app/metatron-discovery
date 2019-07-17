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

import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { Component, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupService } from '../../../../common/service/popup.service';
import { StringUtil } from '../../../../common/util/string.util';
import { Alert } from '../../../../common/util/alert.util';
import { CommonUtil } from '../../../../common/util/common.util';
import { Workbench } from '../../../../domain/workbench/workbench';
import { WorkbenchService } from '../../../service/workbench.service';

@Component({
  selector: 'app-create-workbench-complete',
  templateUrl: './create-workbench-complete.component.html'
})
export class CreateWorkbenchCompleteComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 아이디
  @Input()
  public workspaceId: string;

  // 폴더 아이디
  @Input()
  public folderId: string;

  @Input()
  public workbench: Workbench;

  // 워크벤치 이름
  public name: string;

  // 워크벤치 설명
  public description: string = null;

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
  constructor(protected popupService: PopupService,
              protected workbenchService: WorkbenchService,
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
    // ui 초기화
    this.initView();
    // 생성 데이터 있다면
    if (this.workbench.hasOwnProperty('createData')) {
      this.initCreateData(this.workbench['createData']);
    }
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** 워크벤치 생성완료 */
  public complete() {

    // validation
    if (this.validation()) {
      // 로딩 show
      this.loadingShow();

      const params: {name: string, dataConnection: string, workspace: string, type: 'workbench', folderId?: string, description?: string} = {
        workspace: `/api/workspaces/${this.workspaceId}`,
        dataConnection: `/api/dataconnections/${this.workbench.dataConnection.id}`,
        name: this.name.trim(),
        type: 'workbench'
      };

      // 폴더아이디 존재시
      if (this.folderId) {
        params.folderId = this.folderId;
      }

      // 설명 존재시
      if (this.description) {
        params.description = this.description.trim();
      }

      this.workbenchService.createWorkbench(params).then(( data:Workbench ) => {

        // 로딩 hide
        this.loadingHide();

        Alert.success(`'${this.name}' ` + this.translateService.instant('msg.space.alert.workbench.create.success'));

        // 완료 알림
        this.popupService.notiPopup({
          name: 'create-workbench',
          data: data.id
        });

        // 닫기
        this.close();
      }).catch(() => {
        Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
        this.loadingHide();
      });
    }
  }

  /** 이전 화면 */
  public prev() {

    this.saveCreateData(this.workbench);

    this.popupService.notiPopup({
      name: 'workbench-create-select',
      data: null
    });
  }

  /**
   * 커넥션이 default 타입인지 
   * @returns {boolean}
   */
  public isDefaultType(): boolean {
    return StringUtil.isEmpty(this.workbench.dataConnection.url);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** validation */
  protected validation() {
    if (StringUtil.isEmpty(this.name)) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return false;
    }

    if (CommonUtil.getByte(this.name) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return false;
    }

    if (this.description != null
      && CommonUtil.getByte(this.description) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return false;
    }

    return true;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init view
   */
  private initView() {
    // 워크벤치 이름
    this.name = null;
    // 워크벤치 설명
    this.description = null;
    // 유효성 관련 - 이름
    this.isInvalidName = false;
    this.errMsgName = '';
    // 유효성 관련 - 설명
    this.isInvalidDesc = false;
    this.errMsgDesc = '';
  }

  /**
   * create data init
   * @param createData
   */
  private initCreateData(createData) {
    // 이름
    this.name = createData.name;
    // 설명
    this.description = createData.description;
    // 유효성 관련 - 이름
    this.isInvalidName = createData.isInvalidName;
    this.errMsgName = createData.errMsgName;
    // 유효성 관련 - 설명
    this.isInvalidDesc = createData.isInvalidDesc;
    this.errMsgDesc = createData.errMsgDesc;
  }

  /**
   * 생성 정보 저장
   */
  private saveCreateData(workbench) {
    const createData = {
      // 이름
      name: this.name,
      // 설명
      description: this.description,
      // 유효성 관련 - 이름
      isInvalidName: this.isInvalidName,
      errMsgName: this.errMsgName,
      // 유효성 관련 - 설명
      isInvalidDesc: this.isInvalidDesc,
      errMsgDesc: this.errMsgDesc
    };
    workbench['createData'] = createData;
  }
}
