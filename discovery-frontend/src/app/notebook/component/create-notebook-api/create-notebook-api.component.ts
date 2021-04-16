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
  OnChanges, OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {PopupService} from '@common/service/popup.service';
import {Alert} from '@common/util/alert.util';
import {NotebookService} from '../../service/notebook.service';
import {isUndefined} from 'util';

@Component({
  selector: 'app-create-notebook-api',
  templateUrl: './create-notebook-api.component.html'
})
export class CreateNotebookApiComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy {

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
  public result: any;

  @Input()
  public kernel: string;

  // 입력 Format
  public selectedFormat = 'HTML';

  // 입력 이름
  public argName = '';

  // 입력 설명값.
  public argDescription = '';

  public selectedType: string = 'HTML';

  @Output()
  public saveComplete = new EventEmitter();

  //  error show/hide
  public showError: boolean = false;


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
    if (this.kernel === 'SPARK') {
      this.selectedType = 'Void';
    }
    console.log('result', this.result);
    if (this.result !== null) {
      console.log('result', this.result);
      this.argName = this.result.name;
      this.argDescription = this.result.desc;
      this.selectedType = this.result.returnType;
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


  /** 팝업창 닫기 */
  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-notebook-api-create',
      data: null
    });
  }

  // API 저장하기
  public saveApi() {
    if (this.argName.trim() === '' || isUndefined(this.argName) || this.argName.length < 1) {
      this.showError = true;
      return;
    }

    const param = {
      name: this.argName,
      desc: this.argDescription,
      returnType: this.selectedType
    };
    this.loadingShow();
    if (this.result !== null) {
      this.notebookService.modifyNotebookApi(this.notebookId, param)
        .then((_result) => {
          this.loadingHide();
          this.popupService.notiPopup({
            name: 'create-notebook-api-create',
            data: null
          });
        })
        .catch((error) => {
          this.loadingHide();
          Alert.error(error.details);
        });
    } else {
      this.notebookService.createNotebookApi(this.notebookId, param)
        .then((_result) => {
          this.loadingHide();

          this.popupService.notiPopup({
            name: 'create-notebook-api-create',
            data: null
          });
        })
        .catch((error) => {
          this.loadingHide();
          Alert.error(error.details);
        });
    }

  }

  /** show/hide error msg */
  public hideError() {
    if (this.argName.length !== 0) {
      this.showError = false;
    }
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
