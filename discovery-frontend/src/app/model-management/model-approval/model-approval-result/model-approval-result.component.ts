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
// import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
// import { AbstractPopupComponent } from '@common/component/abstract-popup.component';
// import { isUndefined } from 'util';
// import { Alert } from '@common/util/alert.util';
// import { ModelApprovalService } from '../service/model-approval.service';
//
// @Component({
//   selector: 'app-model-approval-result',
//   templateUrl: './model-approval-result.component.html',
// })
// export class ModelApprovalResultComponent extends AbstractPopupComponent implements OnInit {
//
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   @Input()
//   public result:any;
//
//   // 닫기 이벤트
//   @Output()
//   public closeResultEvent:EventEmitter<string> = new EventEmitter();
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Protected Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Constructor
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//   constructor(protected modelApprovalService: ModelApprovalService,
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
//     if (!isUndefined(this.result)) {
//       const that = this;
//       if (this.result.type === 'error') {
//         that.showReuslt(this.result.data, this.result.type);
//       } else if (this.result.type === 'success') {
//         that.loadingShow();
//         this.modelApprovalService.runTest(this.result.id)
//           .then((result) => {
//             that.loadingHide();
//             that.showReuslt(result, '');
//           })
//           .catch((_error) => {
//             Alert.error('데이터 조회가 실패했습니다.');
//             that.loadingHide();
//           });
//       }
//     }
//   }
//
//   protected showReuslt(result: string, _type: string) {
//     const iframe: any = $('#modelApprovalContent');
//     const iframeContent = iframe[0].contentWindow.document;
//     iframeContent.body.innerHTML = result;
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Methods
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   public close() {
//     this.closeResultEvent.emit('close');
//   }
// }
