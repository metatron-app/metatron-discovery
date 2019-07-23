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

import {Component, ElementRef, Injector, Input, OnInit} from '@angular/core';
import {AbstractPopupComponent} from '../../../../common/component/abstract-popup.component';
import {PopupService} from '../../../../common/service/popup.service';
import {NoteBook} from '../../../../domain/notebook/notebook';
import {NotebookService} from '../../../service/notebook.service';
import {Alert} from '../../../../common/util/alert.util';
import {isUndefined} from 'util';
import {CommonConstant} from '../../../../common/constant/common.constant';
import * as $ from "jquery";

@Component({
  selector: 'app-create-notebook-name',
  templateUrl: './create-notebook-name.component.html'
})
export class CreateNotebookNameComponent extends AbstractPopupComponent implements OnInit {

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
  public notebook: NoteBook;

  @Input()
  public workspaceId: string;

  // 개발 언어
  public developLanguage: string[] = ['R', 'PYTHON'];

  public jupyterLanguage: string[] = ['R', 'PYTHON'];

  public zeppelinLanguage: string[] = ['SPARK'];

  // 타입 초기인덱스 값
  public defaultIndex = -1;

  // 서버 타입
  public serverType: any[] = [];

  // 선택된 개발 언어
  public selectedDevLanguage: string = this.developLanguage[0];

  // 선택된 서버 타입
  public selectedServerType: string;

  // 이름
  public name: string = '';

  // 설명
  public description: string = '';

  // show/hide error msg
  public showError: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              protected notebookService: NotebookService,
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
    this.getServer();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public getServer() {
    this.loadingShow();
    this.notebookService.getNotebookServers(this.workspaceId)
      .then((result) => {
        this.loadingHide();
        this.serverType = result['_embedded']['connectors'];
        this.defaultIndex = 0;
        this.selectedServerType = this.serverType[0];
        if (this.selectedServerType['type'].toLowerCase() === 'jupyter') {
          this.developLanguage = this.jupyterLanguage;
        }
        if (this.selectedServerType['type'].toLowerCase() === 'zeppelin') {
          this.developLanguage = this.zeppelinLanguage;
        }
        this.selectedDevLanguage = this.developLanguage[0];
      })
      .catch((error) => {
        this.loadingHide();
        Alert.error(error);
      });
  }

  /** 이전 화면 */
  public prev() {
    const type = this.notebook.datasource.dsType;
    if (type === 'DATASOURCE') {
      this.popupService.notiPopup({
        name: 'create-notebook-datasource',
        data: null
      });
    } else if (type === 'DASHBOARD') {
      this.popupService.notiPopup({
        name: 'create-notebook-dashboard',
        data: null
      });
    } else if (type === 'CHART') {
      this.popupService.notiPopup({
        name: 'create-notebook-chart',
        data: null
      });
    }
  }

  /** 팝업 닫기 */
  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-notebook-create',
      data: null
    });
  }

  /** 노트북 생성 */
  public confirm() {
    this.name = this.name ? this.name.trim() : ''; // trim 처리
    if (this.name === '') {
      this.showError = true;
      $(".ddp-type-contents").animate({ scrollTop: $('.ddp-type-contents').height() }, 1000);
      return;
    }
    if (isUndefined(this.selectedServerType)) {
      Alert.warning(this.translateService.instant('msg.nbook.alert.sel.notebook.server'));
      return;
    }

    // 로딩 show
    this.loadingShow();

    const param = new NoteBook();
    param.name = this.name;
    param.type = 'notebook';
    param.kernelType = this.selectedDevLanguage;
    param.workspace = CommonConstant.API_CONSTANT.API_URL + 'workspaces/' + this.workspaceId;
    // TODO 나중에 커넥터 리스트 조회후 선택해서 사용해야됨
    param.connector = CommonConstant.API_CONSTANT.API_URL + 'connectors/' + this.selectedServerType['id'];

    // 설명이 있다면
    if (this.description.trim() !== '') {
      param.description = this.description;
    }
    // 폴더 아이디 있다면
    if (this.notebook.folderId) {
      param.folderId = this.notebook.folderId;
    }
    // 데이터 소스를 선택했다면
    // dsType = DATASOURCE or DASHBOARD or CHART
    // dsId = datasourceId or dashboardId or chartId
    if (this.notebook.datasource) {
      param.dsType = this.notebook.datasource.dsType;
      param.dsId = this.notebook.datasource.id;
      if(this.notebook.datasource.dsType === 'DASHBOARD' || this.notebook.datasource.dsType === 'CHART') {
        param.dsName = this.notebook.path + " > " + this.notebook.datasource.name;
      } else {
        param.dsName = this.notebook.datasource.name;
      }
    } else {
      param.dsType = '';
      param.dsId = '';
      param.dsName = '';
    }


    // 생성 api
    this.notebookService.createNotebook(param).then((data:NoteBook) => {

      if (data) {
        // 로딩 hide
        this.loadingHide();

        // 생성 완료
        Alert.success(`'${this.name}' ` + this.translateService.instant('msg.book.alert.create.notebook.success'));

        this.popupService.notiPopup({
          name: 'complete-notebook-create',
          data: data.id
        });
      }

    }).catch((error) => {
      // 로딩 hide
      this.loadingHide();
      if (!isUndefined(error.message)) {
        Alert.error(error.message);
      } else {
        Alert.error(error);
      }
    });
  }

  public selectedLanguage($event: any) {
    this.selectedDevLanguage = $event;
  }

  public selectedType($event: any) {
    this.selectedServerType = $event;
    if (this.selectedServerType['type'].toLowerCase() === 'jupyter') {
      this.developLanguage = this.jupyterLanguage;
    }
    if (this.selectedServerType['type'].toLowerCase() === 'zeppelin') {
      this.developLanguage = this.zeppelinLanguage;
    }
    this.selectedDevLanguage = this.developLanguage[0];
  }

  /** show/hide error msg */
  public hideError() {
    if (this.name.length !== 0) {
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
