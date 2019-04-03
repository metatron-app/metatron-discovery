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
import {AbstractComponent} from '../../../common/component/abstract.component';
import {MetadataModelService} from '../service/metadata.model.service';
import {StorageService} from '../../../data-storage/service/storage.service';

@Component({
  selector: 'app-select-datatype',
  templateUrl: './select-datatype.component.html',
})
export class SelectDatatypeComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // show flag
  public showFlag: boolean = false;

  @Output()
  public createdEmit: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    public metaDataModelService: MetadataModelService,
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
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init
   */
  public init(): void {
    // flag
    this.showFlag = true;
  }

  /**
   * 취소 클릭 이벤트
   */
  public onClickClose(): void {
    // 스탭 초기화
    this.metaDataModelService.setCreateStep('');
    // flag
    this.showFlag = false;
  }

  /**
   * 생성할 메타데이터 타입 선택
   * @param {string} selectType
   */
  public onSelectedDataType(selectType: string): void {
    // if disabled stageDB
    if (selectType === 'staging' && !this.isEnableStageDB()) {
      return;
    }
    // 생성할 데이터 타입 초기화
    this.metaDataModelService.setCreateData({});
    // 타입 변경
    this.metaDataModelService.patchCreateData('createType', selectType);
    // 스탭 변경
    this.metaDataModelService.setCreateStep(selectType);
  }

  /**
   * 생성완료 이벤트
   */
  public onCompleteCreate(): void {
    // close
    this.onClickClose();
    // complete
    this.createdEmit.emit();
  }

  /**
   * 현재 생성스탭과 일치하는지 확인
   * @param {string} step
   * @returns {boolean}
   */
  public isCreateStep(step: string): boolean {
    return step === this.metaDataModelService.getCreateStep();
  }

  /**
   * Check enable stageDB
   * @return {boolean}
   */
  public isEnableStageDB(): boolean {
    return StorageService.isEnableStageDB;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}

