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

// import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
// import {PopupService} from '@common/service/popup.service';
// import {SubscribeArg} from '@common/domain/subscribe-arg';
// import {ModelApprovalService} from './service/model-approval.service';
// import {Alert} from '@common/util/alert.util';
// import {NotebookModel} from '@domain/model-management/notebookModel';
// import {Modal} from '@common/domain/modal';
// import {DeleteModalComponent} from 'app/common/component/modal/delete/delete.component';
// import {StringUtil} from '@common/util/string.util';
// import {AbstractComponent} from '@common/component/abstract.component';
// import {isUndefined} from 'util';
//
// @Component({
//   selector: 'app-model-approval',
//   templateUrl: './model-approval.component.html',
// })
// export class ModelApprovalComponent extends AbstractComponent implements OnInit, OnDestroy {
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Private Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Protected Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//   // popup status
//   public step: string;
//
//   protected datePeriod: any;
//
//   // 선택 된 모델 한개
//   public selectedModelId: string = '';
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//   @ViewChild(DeleteModalComponent)
//   public deleteModalComponent: DeleteModalComponent;
//
//   // Type : All, HTML, JSON
//   public taskTypeList: any[];
//
//   // 검색어
//   public searchText: string = '';
//
//   // Status : All, Approved, Rejected, Waiting
//   public status: string = '';
//
//   // Status : All, Approved, Rejected, Waiting
//   public taskType: string = '';
//
//   // 검색 결과
//   public resultData: NotebookModel[] = [];
//
//   // 총페이지 수
//   public totalElements: number = 0;
//
//   // 전체선택 여부
//   public isCheckAll: boolean = false;
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Constructor
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   // 생성자
//   constructor(private popupService: PopupService,
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
//     super.ngOnInit();
//
//     this.initViewPage();
//
//     this.getModelApprovalList(true);
//
//     const popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {
//
//       console.log('popupService 구독', data);
//
//       if (data.name === 'close-detail') {
//         this.getModelApprovalList(true);
//       }
//       this.step = data.name;
//
//     });
//
//     this.subscriptions.push(popupSubscription);
//
//   }
//
//   ngOnDestroy() {
//     super.ngOnDestroy();
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   // Model Approval list 가지고 오기
//   public getModelApprovalList(initPage: boolean = false) {
//
//     if (initPage) {
//       this.isCheckAll = false;
//       this.page.page = 0;
//       this.pageResult.totalPages = 0;
//     }
//
//
//     const params = {};
//
//     let startDateParam: string;
//     let endDateParam: string;
//     if (isUndefined(this.datePeriod) || this.datePeriod.type === 'ALL') {
//       startDateParam = '';
//       endDateParam = '';
//     } else {
//       if (this.datePeriod.startDateStr === null) {
//         startDateParam = '';
//       } else {
//         startDateParam = this.datePeriod.startDateStr;
//       }
//       if (this.datePeriod.endDateStr === null) {
//         endDateParam = '';
//       } else {
//         endDateParam = this.datePeriod.endDateStr;
//       }
//     }
//
//     // 날짜
//     Object.assign(params, {
//       startDate: startDateParam,
//       endDate: endDateParam
//     });
//
//
//     // 검색어
//     if (!StringUtil.isEmpty(this.searchText)) {
//       Object.assign(params, {
//         user: this.searchText,
//         name: this.searchText
//       });
//     }
//
//     // Status
//     if ('' !== this.status) {
//       Object.assign(params, {
//         status: this.status
//       });
//     }
//
//     // Task Type
//     if ('' !== this.taskType) {
//       Object.assign(params, {
//         subscribe: this.taskType
//       });
//     }
//
//     this.loadingShow();
//
//     this.modelApprovalService.searchModels(params, this.page)
//       .then((data) => {
//
//         this.loadingHide();
//
//         this.pageResult = data['page'];
//
//
//         if (this.page.page === 0) {
//           // 첫번째 페이지이면 초기화
//           this.resultData = [];
//         }
//
//         if (data.hasOwnProperty('_embedded')) {
//
//           this.resultData = this.resultData.concat(data['_embedded'].notebookModels);
//           this.resultData = this.resultData.map((obj) => {
//             if (obj.hasOwnProperty('selected') === false) {
//               obj.selected = false;
//             }
//             return obj;
//           });
//
//
//           this.totalElements = data.page.totalElements;
//           this.page.page += 1;
//         }
//
//       }).catch((error) => {
//       this.loadingHide();
//       if( error.message ) {
//         Alert.error(error.message.toString());
//       }
//     });
//   }
//
//
//   // detail page 로 넘어가기
//   public modelApprovalDetail(modelapprovalId) {
//     this.selectedModelId = modelapprovalId;
//     this.step = 'model-approval-detail';
//
//   }
//
//
//   // type 선택 (subscribe)
//   public onSelectedTaskType($event) {
//     this.taskType = $event.data;
//
//     this.getModelApprovalList(true);
//
//   }
//
//   // 날짜 바꾸기 (startDate, endDate)
//   public changeDate(date) {
//     this.datePeriod = date;
//
//     this.getModelApprovalList(true);
//   }
//
//
//   // 체크 박스 td 클릭스 이벤트 무효화.
//   public checkColumn($event) {
//     $event.stopPropagation();
//   }
//
//
//   // 전체 선택
//   public checkAll() {
//
//     this.isCheckAll = !this.isCheckAll;
//
//     this.resultData = this.resultData.map((obj) => {
//       obj.selected = this.isCheckAll;
//       return obj;
//     });
//
//   }
//
//   // 하나씩 선택
//   public check(item) {
//     item.selected = !item.selected;
//     this.isCheckAll = this.resultData.every((obj) => {
//       return obj.selected;
//     });
//   }
//
//   // setting status : All, approved. rejected, waiting
//   public setStatus(status) {
//     this.status = status;
//
//     this.getModelApprovalList(true);
//   }
//
//   // 체크박스 부분선택 여부
//   public partialChecked() {
//
//     const isCheckAll = this.resultData.every((item) => {
//       return item.selected;
//     });
//
//     if (isCheckAll) {
//       return false;
//     }
//
//     const unChecked = this.resultData.every((item) => {
//       return item.selected === false;
//     });
//
//     if (unChecked) {
//       return false;
//     }
//
//     this.isCheckAll = false;
//
//     return true;
//
//   }
//
//   // 여러개 식제
//   public deleteMultiple() {
//
//     const modal = new Modal();
//     modal.name = 'Model 삭제';
//     modal.description = '선택하신 Model을 삭제하시겠습니까?';
//
//     const checkList = this.resultData.filter(obj => obj.selected);
//
//     this.selectedModelId = '';
//     for (let i = 0, nMax = checkList.length; i < nMax; i = i + 1) {
//       const temp: any = checkList[i];
//       if (temp.selected === true) {
//         this.selectedModelId = this.selectedModelId + temp.id + ',';
//       }
//     }
//     this.deleteModalComponent.init(modal);
//
//   }
//
//   // 삭제하기
//   public deleteModel(isLoad?) {
//
//     if (isLoad) this.loadingShow();
//     const multiCnt = this.selectedModelId.split(',').length;
//
//     if (multiCnt === 1) {
//       this.modelApprovalService.deleteModels(this.selectedModelId).then(() => {
//         Alert.success('삭제되었습니다.');
//         this.loadingHide();
//
//         this.page.page = 0;
//         this.getModelApprovalList(true);
//       }).catch(() => {
//         Alert.error('삭제에 실패했습니다.');
//         this.loadingHide();
//       });
//
//     } else {
//
//       this.selectedModelId = this.selectedModelId.substring(0, this.selectedModelId.length - 1);
//       this.modelApprovalService.deleteModels(this.selectedModelId).then(() => {
//         this.loadingHide();
//         Alert.success('삭제되었습니다.');
//         this.getModelApprovalList(true);
//       }).catch(() => {
//         this.loadingHide();
//         Alert.error('삭제에 실패했습니다.');
//       });
//
//     }
//
//
//   }
//
//   // 삭제 버튼 확성화.
//   public deleteAvailable() {
//     return !this.resultData.find(obj => obj.selected);
//   }
//
//   // 삭제 확인 창
//   public confirmDelete(event, id) {
//     console.log('confirm delete');
//     event.stopPropagation();
//
//     const modal = new Modal();
//     modal.name = '모델 삭제';
//     modal.description = '해당 모델을 삭제하시겠습니까?';
//
//     this.selectedModelId = id;
//     this.deleteModalComponent.init(modal);
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Private Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//   private initViewPage() {
//
//     this.taskTypeList = [
//       {
//         viewKey: 'All',
//         data: ''
//       },
//       {
//         viewKey: 'HTML',
//         data: 'HTML'
//       },
//       {
//         viewKey: 'JSON',
//         data: 'JSON'
//       }
//     ];
//
//   } // end of initViewPage
// }

