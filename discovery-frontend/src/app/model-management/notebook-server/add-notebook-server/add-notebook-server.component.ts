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

import {Component, ElementRef, EventEmitter, Injector, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {NoteBook} from '../../../domain/notebook/notebook';
import {isUndefined} from 'util';
import {Alert} from '../../../common/util/alert.util';
import {NotebookServerService} from '../service/notebook-server.service';
import {StringUtil} from '../../../common/util/string.util';

@Component({
  selector: 'app-add-notebook-server',
  templateUrl: './add-notebook-server.component.html'
})
export class AddNotebookServerComponent extends AbstractComponent implements OnInit {

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

  // select box 리스트
  public notebookServerType: any[] = ['jupyter', 'zeppelin'];

  // selected 선택값
  public selectedNotebookServerType = this.notebookServerType[0];

  // 저장한 노트북 vo
  public notebook: NoteBook;

  // selectlist default 선택값
  public defaultIndex: number = 0;

  // 저장 모드, 수정 모드
  public mode: string = 'create';

  public disabledFlag: boolean = true;

  public isShow = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private notebookService: NotebookServerService,
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

  // 시작점
  public init() {
    this.isShow = true;
    this.notebook = new NoteBook();
    this.mode = 'create';
    this.disabledFlag = false;
  }

  // 업데이트.
  public update(notebook: NoteBook) {
    this.isShow = true;
    this.notebook = notebook;
    if (notebook.type === 'jupyter') {
      this.defaultIndex = 0;
    } else if (notebook.type === 'zeppelin') {
      this.defaultIndex = 1;
    }
    this.selectedNotebookServerType = notebook.type;
    this.mode = 'update';
    this.disabledFlag = true;
  }

  // 닫기
  public close() {
    this.isShow = false;
  }

  // selected 박스 선택시.
  public selectedLanguage(event) {
    this.selectedNotebookServerType = event;
  }

  // 저장
  public confirm() {
    this.notebook.url  = this.notebook.url  ? this.notebook.url.trim() : ''; // trim 처리
    // this.notebook.port  = this.notebook.port  ? this.notebook.port.trim() : ''; // trim 처리
    this.notebook.name  = this.notebook.name  ? this.notebook.name.trim() : ''; // trim 처리

    if (this.notebook.url === '' || isUndefined(this.notebook.url)) {
      Alert.warning(this.translateService.instant('msg.storage.alert.url.required'));
      return;
    }

    if (!StringUtil.isURL(this.notebook.url)) {
      Alert.warning(this.translateService.instant('msg.dp.ui.invalid.url'));
      return;
    }

    if (this.notebook.name === '' || isUndefined(this.notebook.name)) {
      Alert.warning(this.translateService.instant('msg.dp.alert.name.error'));
      return;
    }

    this.notebook.type = this.selectedNotebookServerType;

    this.loadingShow();
    if (this.mode === 'create') {
      this.notebookService.createNotebookServer(this.notebook)
        .then((data) => {
          this.loadingHide();
          Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
          this.isShow = false;
          this.createComplete.emit('create-notebook-complete');
        })
        .catch((error) => {
          this.loadingHide();
          console.info(error);
          Alert.error(error.message);
        });
    } else if (this.mode === 'update') {
      this.notebookService.updateNotebookServer(this.notebook)
        .then((data) => {
          this.loadingHide();
          Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
          this.isShow = false;
          this.createComplete.emit('create-notebook-complete');
        })
        .catch((error) => {
          this.loadingHide();
          console.info(error);
          Alert.error(error.message);
        });
    }


  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
