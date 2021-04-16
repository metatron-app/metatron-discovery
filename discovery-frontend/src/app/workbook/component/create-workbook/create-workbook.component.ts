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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Workbook} from '@domain/workbook/workbook';
import {CommonUtil} from '@common/util/common.util';
import {WorkbookService} from '../../service/workbook.service';
import {Alert} from '@common/util/alert.util';
import {CommonConstant} from '@common/constant/common.constant';
import {Book} from '@domain/workspace/book';

@Component({
  selector: 'app-create-workbook',
  templateUrl: './create-workbook.component.html',
})
export class CreateWorkbookComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크스페이스 아이디
  private workspaceId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public createComplete = new EventEmitter();

  // 이어서 대시보드 생성 체크박스
  public createDashboardFl: boolean = true;

  // 모달 flag
  public isShow = false;

  // 워크북
  public workbook: Workbook;

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
  constructor(private workbookService: WorkbookService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 시작점
  public init(workspaceId: string, folderId?: string) {
    this.isShow = true;
    this.workspaceId = workspaceId;
    this.workbook = new Workbook();

    if (folderId) {
      this.workbook.folderId = folderId;
    }
  }

  // 닫기
  public close() {
    this.isShow = false;
  }

  // 워크북 생성
  public createWorkbook() {

    this.workbook.name = this.workbook.name ? this.workbook.name.trim() : '';
    if (this.workbook.name == null || this.workbook.name.length === 0) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return;
    }

    // BDD-2818 이름 길이 체크
    if (CommonUtil.getByte(this.workbook.name) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return;
    }

    // BDD-2818 설명 길이 체크
    if (this.workbook.description != null
      && CommonUtil.getByte(this.workbook.description.trim()) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return;
    }

    this.workbook.type = 'workbook';
    this.workbook.workspace = CommonConstant.API_CONSTANT.API_URL + this.workspaceId;

    this.loadingShow();
    this.workbookService.createWorkbook(this.workbook).then((result: Book) => {
      this.createComplete.emit({createDashboardFl: this.createDashboardFl, id: result['id']});
      this.loadingHide();
      Alert.success(`'${result.name}’ ` + this.translateService.instant('msg.book.alert.create.workbook.success'));
      this.close();
    }).catch((_error) => {
      Alert.error(this.translateService.instant('msg.book.alert.create.workbook.fail'));
      this.loadingHide();
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
