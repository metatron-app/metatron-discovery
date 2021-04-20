// /*
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *      http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */
//
// import {Component, ElementRef, Injector, Input, OnInit, ViewChild} from '@angular/core';
// import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
// import {PopupService} from '@common/service/popup.service';
// import {ModelApprovalService} from '../service/model-approval.service';
// import {NotebookModel} from '@domain/model-management/notebookModel';
// import {isUndefined} from 'util';
// import {Alert} from '@common/util/alert.util';
// import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
// import {Modal} from '@common/domain/modal';
//
// @Component({
//   selector: 'app-model-approval-detail',
//   templateUrl: './model-approval-detail.component.html',
// })
// export class ModelApprovalDetailComponent extends AbstractPopupComponent implements OnInit {
//
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//   @Input()
//   public step: string;
//
//   @Input()
//   public selectedModelId: string;
//
//   @ViewChild(DeleteModalComponent)
//   public deleteModalComponent: DeleteModalComponent;
//
//   // 노트북 모델 데이터
//   public resultData: NotebookModel;
//
//   // 디테일 option layer show/hide
//   public isOptionShow: boolean = false;
//
//   // 노트북 모델 삭제 아이디
//   public selectedNotebookModelId: string;
//
//   // 결과 창 확인 여부
//   public resultLayer: boolean = false;
//
//   public resultLayerData: any = {};
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Constructor
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//   constructor(protected popupService: PopupService,
//               private modelApprovalService: ModelApprovalService,
//               protected elementRef: ElementRef,
//               protected injector: Injector) {
//
//     super(elementRef, injector);
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Override Methods
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//   ngOnInit() {
//     // Init
//     super.ngOnInit();
//
//     // 뷰
//     this.initViewPage();
//
//     this.getModelApprovalDetail();
//
//   }
//
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Methods
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//   public initViewPage() {
//
//   }
//
//   public getModelApprovalDetail(isLoad?) {
//
//     if (isLoad) this.loadingShow();
//     // 결재 상세 정보 가져오기
//     this.modelApprovalService.getModelApprovalDetail(this.selectedModelId)
//       .then((data) => {
//         this.resultData = data['_embedded'];
//         console.log('result', this.resultData);
//         this.loadingHide();
//       })
//       .catch((error) => {
//         this.loadingHide();
//         Alert.error(error.error_description);
//       });
//   }
//
//   // 닫기
//   public close() {
//     super.close();
//
//     this.popupService.notiPopup({
//       name: 'close-detail',
//       data: null
//     });
//   }
//
//   // 승인 처리
//   public setApproval(param: string) {
//     this.loadingShow();
//     this.modelApprovalService.updateModel(this.resultData['notebook']['id'], param)
//       .then((_data) => {
//         this.loadingHide();
//         if (param === 'APPROVAL') {
//           Alert.success('승인 처리 되었습니다.');
//         }
//         if (param === 'REJECT') {
//           Alert.success('반려 처리 되었습니다.');
//         }
//       })
//       .catch((error) => {
//         this.loadingHide();
//         Alert.error(error.error_description);
//       });
//   }
//
//   // 결과 값 Layer
//   public showResult() {
//     this.resultLayer = true;
//     this.resultLayerData.type = 'success';
//     this.resultLayerData.id = this.resultData['notebook']['id'];
//     this.resultLayerData.data = '';
//   }
//
//   // 에러 결과 값
//   public showError(error: string) {
//     this.resultLayer = true;
//     this.resultLayerData.type = 'error';
//     this.resultLayerData.id = '';
//     this.resultLayerData.data = error;
//   }
//
//   // 삭제 처리
//   public confirmDelete(event, id) {
//     event.stopPropagation();
//
//     const modal = new Modal();
//     modal.name = '노트북 모델 삭제';
//     modal.description = '해당 노트북 모델을 삭제하시겠습니까?';
//
//     this.selectedNotebookModelId = id;
//     this.deleteModalComponent.init(modal);
//   }
//
//   // 삭제 이벤트 처리 후 콜백
//   public deleteNotebookModel(isLoad?) {
//     if (isLoad) this.loadingShow();
//     this.modelApprovalService.deleteModels(this.selectedNotebookModelId).then(() => {
//       Alert.success('삭제되었습니다.');
//       this.loadingHide();
//       this.close();
//     }).catch((_error) => {
//       Alert.error('삭제에 실패했습니다.');
//       this.loadingHide();
//     });
//   }
//
//   // 노트북 연결 팝업
//   public popupWindow() {
//     console.log('(this.resultData', this.resultData);
//     if (!isUndefined(this.resultData['notebook']['link'])) {
//       window.open(this.resultData['notebook']['link'], '_blank');
//     }
//   }
//
//   // run Test 처리.
//   public runTest() {
//     if (!isUndefined(this.resultData['notebook']['id'])) {
//       this.modelApprovalService.runTest(this.resultData['notebook']['id']).then(() => {
//         Alert.success('테스트가 성공적으로 이루어 졌습니다.');
//         this.loadingHide();
//         this.getRunTestHistory();
//       }).catch((_error) => {
//         Alert.error('테스트가 실패했습니다.');
//         this.loadingHide();
//       });
//     }
//   }
//
//
//   // 실행 결과 히스토리
//   protected getRunTestHistory() {
//     this.loadingShow();
//     const that = this;
//     this.modelApprovalService.getRunTestHistory(this.resultData['notebook']['id'])
//       .then((result) => {
//         this.loadingHide();
//         that.resultData.histories = result.histories;
//       })
//       .catch((error) => {
//         this.loadingHide();
//         Alert.error(error);
//
//       });
//   }
//
//   // 결과 화면 창 닫기
//   public approvalResultClose(_param) {
//     this.resultLayer = false;
//   }
//
//    public getResultOfNotebook(type: string): any{
//      return this.resultData['notebook'][type];
//    }
//
// }
