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
  Output
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {SubscribeArg} from '@common/domain/subscribe-arg';
import {PopupService} from '@common/service/popup.service';
import {NoteBook} from '@domain/notebook/notebook';

@Component({
  selector: 'app-create-notebook',
  templateUrl: './create-notebook.component.html'
})
export class CreateNotebookComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

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
  public step: string;

  // notebook
  public notebook: NoteBook;

  // workspaceId
  public workspaceId: string;

  // dashboard, chart 에 대한 path 경로.
  public datasourcePath: string = '';
  // workbookId
  // public workbook: Workbook;

  @Output()
  public createComplete = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
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


    const popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {

      this.step = data.name;
      if (this.step === 'close-notebook-create') {

      } else if (this.step === 'complete-notebook-create') {
        this.createComplete.emit(data.data);
      }

    });

    this.subscriptions.push(popupSubscription);

    this.initViewPage();
  }

  // Change
  public ngOnChanges() {

    // Init
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public init(workspaceId: string, folderId?: string) {
    console.log('init', workspaceId, folderId);
    this.workspaceId = workspaceId;
    // this.workbook = new Workbook();
    this.notebook = new NoteBook();
    // 폴더아이디 존재시
    if (folderId) {
      this.notebook.folderId = folderId;
    }
    this.step = 'create-notebook-select';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // View초기화
  private initViewPage() {
    this.notebook = new NoteBook();
    // this.contentOrder = [
    //   { key : 'name', value: 'Name Ascending' , type :'asc' },
    //   { key : 'name', value: 'Name Descending', type :'desc' },
    //   { key : 'createdTime', value: 'Update Ascending', type :'asc' },
    //   { key : 'createdTime', value: 'Update Descending', type :'desc' },
    // ];
    // this.selectedContentOrder = this.contentOrder[0];
    // this.isShowContentOrder = false;

  }
}
