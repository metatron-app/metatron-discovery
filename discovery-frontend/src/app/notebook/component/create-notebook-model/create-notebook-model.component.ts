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

import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {PopupService} from '@common/service/popup.service';
import {NotebookModel} from '@domain/model-management/notebookModel';
import {Alert} from '@common/util/alert.util';
import {NotebookService} from '../../service/notebook.service';

@Component({
  selector: 'app-create-notebook-model',
  templateUrl: './create-notebook-model.component.html'
})
export class CreateNotebookModelComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noteboook 상세 값.
  @Input()
  public notebookId: string;

  @Input()
  public workspaceId: string;

  // 입력 Format
  public selectedFormat = 'HTML';

  // 입력 이름
  public argName = '';

  // 입력 설명값.
  public argDescription = '';

  @Output()
  public saveComplete = new EventEmitter();


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected popupService: PopupService,
              protected notebookService: NotebookService,
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

  public ngOnChanges(_changes: SimpleChanges) {

  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // format 선택.
  public setSelectFormat(arg) {
    this.selectedFormat = arg;
  }

  /** Request */
  public setRequest() {
    if (this.argName === '') {
      Alert.warning(this.translateService.instant('msg.comm.ui.create.name'));
      return;
    }

    const notebookModel: NotebookModel = new NotebookModel();
    notebookModel.name = this.argName;
    notebookModel.description = this.argDescription;
    notebookModel.subscribeType = this.selectedFormat;

    this.loadingShow();
    const that = this;
    this.notebookService.setNotebookModelRequest(notebookModel, this.workspaceId, this.notebookId)
      .then((data) => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.nbook.alert.update.success'));
        that.saveComplete.emit(data);
        this.close();
      })
      .catch((_error) => {
        this.loadingHide();
        Alert.error(this.translateService.instant('msg.nbook.alert.update.fail'));
      });
  }

  /** 팝업창 닫기 */
  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-notebook-model-create',
      data: null
    });
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
