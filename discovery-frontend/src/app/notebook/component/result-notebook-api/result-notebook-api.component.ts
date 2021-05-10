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

import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {NotebookService} from '../../service/notebook.service';
import {isUndefined} from 'util';

@Component({
  selector: 'app-result-notebook-api',
  templateUrl: './result-notebook-api.component.html',
})
export class ResultNotebookApiComponent extends AbstractPopupComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public result: any;

  // 닫기 이벤트
  @Output()
  public closeResultEvent: EventEmitter<string> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected notebookService: NotebookService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  ngOnInit() {
    // Init
    super.ngOnInit();

    this.loadingShow();
    if (!isUndefined(this.result)) {
      console.log('===>', this.result);
      this.notebookService.runNotebookApi(this.result)
        .then((result) => {
          this.loadingHide();
          this.showReuslt(result);

        })
        .catch((_error) => {
          this.loadingHide();
          this.showReuslt(this.translateService.instant('msg.nbook.ui.api.no.rslt'));
        });
    }
  }

  protected showReuslt(result: string) {
    const iframe: any = $('#resultModelContent');
    const iframeContent = iframe[0].contentWindow.document;
    iframeContent.body.innerHTML = result;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public close() {
    this.closeResultEvent.emit('close');
  }
}
