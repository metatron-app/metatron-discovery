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

import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonUtil } from '@common/util/common.util';
import { Alert } from '@common/util/alert.util';
import { AbstractComponent } from '@common/component/abstract.component';
import { PrDataflow } from '@domain/data-preparation/pr-dataflow';
import { PreparationAlert } from '../util/preparation-alert.util';
import { DataflowService } from './service/dataflow.service';

@Component({
  selector: 'app-create-dataflow-name-desc',
  templateUrl: './create-dataflow-name-desc.component.html',
})
export class CreateDataflowNameDescComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public createComplete = new EventEmitter();

  // 모달 flag
  public isShow = false;

  // 워크북
  public dataflow: PrDataflow = new PrDataflow();

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
              protected dataflowService : DataflowService,
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
  public init() {
    this.isShow = true;
  }

  // 닫기
  public close() {
    this.isShow = false;
  }

  // 워크북 생성
  public createDataflow () {

    this.dataflow.dfName = this.dataflow.dfName ? this.dataflow.dfName.trim() : '';
    if (this.dataflow.dfName == null || this.dataflow.dfName.length === 0) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return;
    }

    // BDD-2818 이름 길이 체크
    if (CommonUtil.getByte(this.dataflow.dfName) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return;
    }

    // BDD-2818 설명 길이 체크
    if (this.dataflow.dfDesc != null
      && CommonUtil.getByte(this.dataflow.dfDesc.trim()) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return;
    }

    this.loadingShow();
    this.dataflow.datasets = [];
    this.dataflowService.createDataflow(this.dataflow).then((result) => {
      this.loadingHide();
      Alert.success(this.translateService.instant('msg.dp.alert.create-df.success',{value:result.dfName}));
      this.isShow = false;
      this.router.navigate(['/management/datapreparation/dataflow',result.dfId]);
      // 완료 후 생성 된 데이터플로우로 이동한다.
    }).catch((error) => {
      this.loadingHide();
      const prepError = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prepError, this.translateService.instant(prepError.message));
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
