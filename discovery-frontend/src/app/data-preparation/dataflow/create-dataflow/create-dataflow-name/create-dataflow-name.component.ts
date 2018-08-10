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

import { Component, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupService } from '../../../../common/service/popup.service';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { Dataflow } from '../../../../domain/data-preparation/dataflow';
import { isUndefined } from 'util';
import { Alert } from '../../../../common/util/alert.util';
import { PreparationAlert } from '../../../util/preparation-alert.util';
import { DataflowService } from '../../service/dataflow.service';
import { StringUtil } from '../../../../common/util/string.util';
import * as _ from 'lodash';

@Component({
  selector: 'app-create-dataflow-name',
  templateUrl: './create-dataflow-name.component.html',
})
export class CreateDataflowNameComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public dataflow: Dataflow;

  public showNameError: boolean = false;
  public showDescError: boolean = false;

  // name error description
  public nameErrorDesc: string = '';

  // name description error description
  public nameDescErrorDesc: string = '';

  // flag to prevent multiple enters
  public flag: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private dataflowService: DataflowService,
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
  /** 이전 */
  public prev() {
    this.popupService.notiPopup({
      name: 'select-dataset',
      data: null
    });
  }

  /** 닫기 */
  public close(result?) {
    super.close();

    // close popup
    if(result) {
      this.router.navigate(['/management/datapreparation/dataflow', result])
    } else {
      this.popupService.notiPopup({
        name: 'close-create',
        data: null
      });
    }

  }

  /** 완료 */
  public complete() {

    if (this.flag === false) { // flag가 false일 때만 서비스를 태운다

      // validation for dataflow name
      if (isUndefined(this.dataflow.dfName) || this.dataflow.dfName.trim() === '' || this.dataflow.dfName.length < 1) {
        this.showNameError = true;
        this.nameErrorDesc = this.translateService.instant('msg.common.ui.required');
        return;
      }

      // 이름 validation
      if (this.dataflow.dfName.length > 50) {
        this.showNameError = true;
        this.nameErrorDesc = this.translateService.instant('msg.dp.alert.name.error.description');
        return true;
      }

      // 설명 validation
      if (!StringUtil.isEmpty(this.dataflow.dfDesc) && this.dataflow.dfDesc.length > 150) {
        this.showDescError = true;
        this.nameDescErrorDesc = this.translateService.instant('msg.dp.alert.description.error.description');
        return true;
      }

      // 서버에 보낼 이름 설명 앞뒤 공백 제거
      this.dataflow.dfName = this.dataflow.dfName.trim();
      this.dataflow.dfDesc ? this.dataflow.dfDesc = this.dataflow.dfDesc.trim() : null;

      // 원본데이터를 변경하기보단 클론해서 사용한다
      const dataflowCloned = _.cloneDeep(this.dataflow);

      // 선택한 데이터 셋의 link 정보를 보내줘야함
      dataflowCloned.datasets = this.dataflow.datasets.map((ds) => { return ds['_links'].self.href; });


      this.loadingShow();
      this.flag = true;
      // 데이터 저장 서비스호출
      this.dataflowService.createDataflow(dataflowCloned).then((result) => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.dp.alert.create-df.success',{value:result.dfName}));
        this.flag = false;
        this.close(result.dfId);

      }).catch((error) => {
        this.loadingHide();
        this.flag = false;
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
    }
  }

  /** show/hide error msg */
  public hideNameError() {
    if (isUndefined(this.dataflow.dfName) || this.dataflow.dfName.length > 0 || this.dataflow.dfName.length < 50) {
      this.showNameError = false;
      this.nameErrorDesc = '';

    }
  }

  /** show/hide error msg */
  public hideDescError() {
    if (isUndefined(this.dataflow.dfDesc) || this.dataflow.dfDesc.length < 150) {
      this.showDescError = false;
      this.nameDescErrorDesc = '';
    }
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
