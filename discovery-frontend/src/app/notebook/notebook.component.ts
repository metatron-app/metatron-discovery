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

import {Component, ElementRef, Injector, OnInit, ViewChild} from '@angular/core';
import {isUndefined} from 'util';
import {Alert} from '@common/util/alert.util';
import {Modal} from '@common/domain/modal';
import {PopupService} from '@common/service/popup.service';
import {NotebookModel} from '@domain/model-management/notebookModel';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {ActivatedRoute} from '@angular/router';
import {AbstractComponent} from '@common/component/abstract.component';
import {NotebookService} from './service/notebook.service';
import {SubscribeArg} from '@common/domain/subscribe-arg';
import {NoteBook} from '@domain/notebook/notebook';
import {UserDetail} from '@domain/common/abstract-history-entity';
import {CookieConstant} from '@common/constant/cookie.constant';
import {WorkspaceService} from '../workspace/service/workspace.service';
import {PermissionChecker, Workspace} from '@domain/workspace/workspace';

@Component({
  selector: 'app-notebook',
  templateUrl: './notebook.component.html'
})
export class NotebookComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선택된 모델 아이디
  public selectedModelId: string;

  // 삭제 모달.
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  // 노트북 모델 데이터
  public resultData: NotebookModel = new NotebookModel();

  // 디테일 option layer show/hide
  public isOptionShow: boolean = false;

  // 모델 등록시 나오는 팝업 구분값.
  public modelView: string = '';    // model

  // notebook name edit mode
  public isNotebookNameEditMode: boolean = false;

  // notebook desscription edit mode
  public isNotebookDescEditMode: boolean = false;

  // api 생성 팝업
  public createApiLayerShow: boolean = false;

  // api 상세 결과 내용
  public resultSet: any = null;

  // 결과 팝업 show 여부
  public resultLayerShow: boolean = false;

  @ViewChild('nbName')
  private nbName: ElementRef;
  @ViewChild('nbDesc')
  private nbDesc: ElementRef;

  // container for dataset name/desc - for edit
  public notebookName: string;
  public notebookDesc: string;

  // Notebook 편집/관리 가능 사용자 여부
  public isChangeAuthUser: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected popupService: PopupService,
              private notebookService: NotebookService,
              private workspaceService: WorkspaceService,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

    this.resultData.createdBy = new UserDetail();

    this.subscriptions.push(
      this.popupService.view$.subscribe((data: SubscribeArg) => {
        this.createApiLayerShow = false;
        if (data.name === 'create-notebook-api-create') {
          this.getNotebookApi();
        }
      })
    );
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  ngOnInit() {
    // Init
    super.ngOnInit();

    // Router에서 파라미터 전달 받기
    this.activatedRoute.params.subscribe((params) => {
      // 외부에서 url에서 아이디 받아오기
      this.selectedModelId = params['id'];

      const workspaceId = params['workspaceId'];

      // 워크스페이스 조회
      this.workspaceService.getWorkSpace(workspaceId, 'forDetailView').then((workspace: Workspace) => {

        const permissionChecker: PermissionChecker = new PermissionChecker(workspace);
        if (workspace.active && permissionChecker.isViewNotebook()) {

          // 노트북 상세 조회
          this.loadingShow();
          this.notebookService.getNotebook(this.selectedModelId).then((data) => {

            if (data.connValid) {
              // 관리 유저 여부 설정
              this.isChangeAuthUser
                = (permissionChecker.isManageNotebook()
                || permissionChecker.isEditNotebook(data.createdBy.username));

              this.resultData = data;

              // 노트북 API 조회
              this.getNotebookApi();

              this.setNotebookName();
              this.setNotebookDescription();

              // Send statistics data
              this.sendViewActivityStream(this.selectedModelId, 'NOTEBOOK');
            } else {
              this.loadingHide();
              this.openAccessDeniedConfirm();
            }

          }).catch((error) => {
            this.loadingHide();
            Alert.error(error.error_description);
          });
        } else {
          // 경고창 표시
          this.openAccessDeniedConfirm();
        }
      });

    });
  } // function - ngOnInit

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 닫기
  public close() {
    this.router.navigate(['/workspace']).then();
  }

  // 에러페이지 표현
  public showError(err: string) {
    Alert.error(err);
  }

  /**
   * 삭제 확인창 오픈
   * @param event
   * @param id
   */
  public confirmDelete(event, id) {

    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.comm.ui.del.description');
    modal.description = this.translateService.instant('msg.nbook.ui.del.notebook.del.description');
    modal.data = {
      type: 'NOTEBOOK',
      id: id
    };

    this.deleteModalComponent.init(modal);
  } // function - confirmDelete

  /**
   * 삭제 이벤트 처리 후 콜백
   * @param {Modal} modal
   */
  public deleteConfirmHandler(modal: Modal) {
    const confirmData = modal.data;
    if ('NOTEBOOK' === confirmData.type) {
      this._deleteNotebook(confirmData.id);
    } else if ('API' === confirmData.type) {
      this._deleteApi(confirmData.id);
    }
  } // function - deleteConfirmHandler

  // 노트북 연결 팝업
  public popupWindow() {
    if (!isUndefined(this.resultData['link'])) {
      window.open(this.resultData['link'], '_blank');
    }
  }

  // 모델 요청
  public setRequestModel() {
    this.modelView = 'model';
  }

  public updateNotebook() {
    if (this.notebookName === '') {
      Alert.warning(this.translateService.instant('msg.nbook.alert.input.name'));
      return;
    }

    // for IE - 커서가 남아있는 문제 해결을 위해 강제 focus out
    this.nbName.nativeElement.blur();
    this.nbDesc.nativeElement.blur();

    const notebook: NoteBook = new NoteBook();
    notebook.id = this.selectedModelId;
    notebook.name = this.notebookName;
    notebook.description = this.notebookDesc;
    this.loadingShow();
    this.notebookService.updateNotebook(this.selectedModelId, notebook)
      .then((data) => {
        this.loadingHide();
        this.resultData = data;
        this.notebookDesc = data.description;
        this.notebookName = data.name;
        // Alert.success(this.translateService.instant('msg.nbook.alert.update.success'));
        return;
      })
      .catch((_error) => {
        this.loadingHide();
        Alert.error(this.translateService.instant('msg.nbook.alert.update.fail'));
        return;
      });
    this.isNotebookNameEditMode = false;
    this.isNotebookDescEditMode = false;
  }


  public setNotebookName() {
    this.isNotebookNameEditMode = false;
    if (this.notebookName !== this.resultData.name) {
      this.notebookName = this.resultData.name;
    }
  }

  public setNotebookDescription() {

    this.isNotebookDescEditMode = false;
    if (this.notebookDesc !== this.resultData.description) {
      this.notebookDesc = this.resultData.description;
    }
  }

  /**
   * 노트북 이름 수정 활성화
   * @param $event
   */
  public onNotebookNameEdit($event) {

    $event.stopPropagation();

    if (this.isNotebookNameEditMode || !this.isChangeAuthUser) {
      return;
    }

    this.isNotebookNameEditMode = true;
    (this.isNotebookDescEditMode) && (this.isNotebookDescEditMode = false);

    if (this.notebookDesc !== this.resultData.description) {
      this.notebookDesc = this.resultData.description;
    }

    this.changeDetect.detectChanges();
    this.nbName.nativeElement.focus();
  } // function - onNotebookNameEdit

  /**
   * 노트북 설명 수정 활성화
   * @param $event
   */
  public onNotebookDescEdit($event) {
    $event.stopPropagation();

    if (this.isNotebookDescEditMode || !this.isChangeAuthUser) {
      return;
    }

    this.isNotebookDescEditMode = true;
    (this.isNotebookNameEditMode) && (this.isNotebookNameEditMode = false);

    if (this.notebookName !== this.resultData.name) {
      this.notebookName = this.resultData.name;
    }

    this.changeDetect.detectChanges();
    this.nbDesc.nativeElement.focus();
  } // function - onNotebookDescEdit

  // create API
  public setCreateApi() {
    this.createApiLayerShow = true;
  }

  // 뒤로 가기
  public goBack() {
    const cookieWs = this.cookieService.get(CookieConstant.KEY.CURRENT_WORKSPACE);
    let cookieWorkspace = null;
    if (cookieWs) {
      cookieWorkspace = JSON.parse(cookieWs);
    }
    if (null !== cookieWorkspace) {
      this.router.navigate(['/workspace', cookieWorkspace['workspaceId']]).then();
    }
  }

  // 노트북 상세 정보 조회
  public getNotebookApi() {
    this.loadingShow();
    this.notebookService.getNotebookApi(this.selectedModelId).then((result) => {
      this.loadingHide();
      if (!isUndefined(result.notebookAPI)) {
        this.resultSet = result.notebookAPI;
      }
    }).catch(() => {
      this.loadingHide();
    });
  }

  // 노트북 result
  public runResult() {
    this.resultLayerShow = true;
  }

  // 노트북 result close
  public resultClose() {
    this.resultLayerShow = false;
  }

  // 노트북 API 수정
  public modifyApi() {
    this.createApiLayerShow = true;
  }

  /**
   * 노트북 API 삭제 확인창 띄움
   */
  public showConfirmDeleteApi() {

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.comm.ui.del.description');
    modal.description = this.translateService.instant('msg.nbook.ui.del.api.desc');
    modal.data = {
      type: 'API',
      id: this.selectedModelId
    };

    this.deleteModalComponent.init(modal);
  } // function - showConfirmDeleteApi


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * API 를 제거한다.
   * @param {string} id
   * @private
   */
  private _deleteApi(id: string) {
    this.loadingShow();
    this.notebookService.deleteNotebookApi(id).then(() => {
      this.resultSet = null;
      Alert.success(this.translateService.instant('msg.nbook.ui.del.api.success'));
      this.getNotebookApi();
    }).catch(() => {
      Alert.error(this.translateService.instant('msg.alert.del.fail'));
      this.loadingHide();
    });
  } // function - _deleteApi

  /**
   * 노트북을 제거한다
   * @param {string} id
   * @private
   */
  private _deleteNotebook(id: string) {
    this.loadingShow();
    this.notebookService.deleteNotebook(id).then(() => {
      Alert.success(this.translateService.instant('msg.nbook.ui.del.notebook'));
      this.loadingHide();
      this.close();
    }).catch(() => {
      Alert.error(this.translateService.instant('msg.alert.del.fail'));
      this.loadingHide();
    });
  } // function - _deleteNotebook

}
