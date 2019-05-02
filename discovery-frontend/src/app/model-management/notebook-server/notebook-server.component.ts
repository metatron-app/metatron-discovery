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

import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { AddNotebookServerComponent } from './add-notebook-server/add-notebook-server.component';
import { NotebookServerService } from './service/notebook-server.service';
import { Alert } from '../../common/util/alert.util';
import { isUndefined } from 'util';
import { Modal } from '../../common/domain/modal';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { NoteBook } from '../../domain/notebook/notebook';
import * as _ from 'lodash';

@Component({
  selector: 'app-notebook-server',
  templateUrl: './notebook-server.component.html',
})
export class NotebookServerComponent extends AbstractComponent implements OnInit {


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Server 추가
  @ViewChild(AddNotebookServerComponent)
  private addNotebookServerComponent: AddNotebookServerComponent;

  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // notebook server 리스트
  public notebookServerType: any[] = ['ALL', 'jupyter', 'zeppelin'];

  // 선택된 notebook server Type
  public selectedNotebookServerType: string = this.notebookServerType[0];

  // 검색 text
  public searchText: string = '';

  // 검색 결과
  public resultData: any[] = [];

  // 총페이지 수
  public totalElements: number = 0;

  // 정렬 순서
  public sort: string = 'desc';

  // 삭제 아이템.
  public selectedDeleteItemIndex: string;

  // checkbox 카운트
  public checkBoxCnt: number = 0;

  // check box flag
  public tempCheckData : any[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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

    // temp check list init
    this.tempCheckData = [];

    // 로딩시 데이터 조회
    this.getNotebookServerList();

  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // select box 선택시 이벤트
  public selectedLanguage($event) {
    this.selectedNotebookServerType = $event;
    this.getInitialNotebookServer();
  }

  // 데이터 소팅.
  public sortingToggle(param: string) {
    this.sort = param;
    this.getInitialNotebookServer();
  }

  // 행 클릭시 - 수정모드로
  public connectorItemRowClick(notebook: NoteBook) {
    this.addNotebookServerComponent.update(notebook);
  }

  // 전체 선택 체크 박스
  public allCheckClick($event) {
    const checkList = $('.ddp-checkbox-form');
    const $headerCheck: any = checkList[0];

    let flag = false;
    if ($headerCheck.checked === false) {
      flag = false;
    } else {
      flag = true;
    }
    for (let index = 1; index < checkList.length; index += 1) {
      const temp: any = checkList[index];
      temp.checked = flag;
      const cloneData = _.cloneDeep(this.resultData[index-1]);
      this.removeTempData(cloneData);
      if( temp.checked ) {
        this.tempCheckData.push( cloneData );
      }
    }
    if (flag === true) {
      this.checkBoxCnt = 1;
    } else {
      this.checkBoxCnt = 0;
    }
  }

  // 한행 체크 박스 클릭
  public checkClick($event, idx) {

    const cloneData = _.cloneDeep(this.resultData[idx]);
    this.removeTempData(cloneData);
    const checkList = $('.ddp-checkbox-form');
    if ($event.srcElement.checked === false) {
      const $headerCheck: any = checkList[0];
      $headerCheck.checked = false;
    } else {
      let tempFlag: boolean = false;
      for (let index = 1; index < checkList.length; index += 1) {
        const temp: any = checkList[index];
        if (temp.checked === false) {
          tempFlag = true;
        }
      }
      if (tempFlag === false) {
        const $headerCheck: any = checkList[0];
        $headerCheck.checked = true;
      }
      this.tempCheckData.push( cloneData );
    }

    this.checkBoxCnt = 0;
    for (let index = 1; index < checkList.length; index += 1) {
      const temp: any = checkList[index];
      if (temp.checked === true) {
        this.checkBoxCnt = 1;
      }
    }

  }


  // 체크 박스 td 클릭스 이벤트 무효화.
  public checkColumn($event) {
    $event.stopPropagation();
  }

  // notebook connection 추가.
  public addServer() {
    this.addNotebookServerComponent.init();
  }

  public deleteAvailable() {
    if (this.checkBoxCnt === 0) {
      return true;
    } else {
      return false;
    }
  }

  // 노트북 서버 검색
  public searchNotebookServer(event : KeyboardEvent) {

    if (13 === event.keyCode) {
      this.page.page = 0;
      this.getNotebookServerList();
    } else if (27 === event.keyCode) {
      this.searchText = '';
      this.page.page = 0;
      this.getNotebookServerList();
    }

  }

  // 노트북 서버 리스트 불러오기 (no search, type)
  public getInitialNotebookServer() {
    this.searchText = '';
    this.page.page = 0;
    this.getNotebookServerList();
  }

  // 삭제하기
  public deleteNotebookServer(isLoad?) {
    if (isLoad) this.loadingShow();
    const multiCnt = this.selectedDeleteItemIndex.split(',').length;

    if (multiCnt === 1) {
      this.notebookService.deleteNotebookServer(this.selectedDeleteItemIndex).then(() => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
        this.getInitialNotebookServer();
      }).catch((error) => {
        this.loadingHide();
        Alert.error(this.translateService.instant('msg.comm.alert.delete.fail'));
      });
    } else {
      this.selectedDeleteItemIndex = this.selectedDeleteItemIndex.substring(0, this.selectedDeleteItemIndex.length - 1);
      this.notebookService.deleteAllNotebookServer(this.selectedDeleteItemIndex).then(() => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
        this.getInitialNotebookServer();
      }).catch((error) => {
        this.loadingHide();
        Alert.error(this.translateService.instant('msg.comm.alert.delete.fail'));
      });
    }
    const checkList = $('.ddp-checkbox-form');
    const $headerCheck: any = checkList[0];
    $headerCheck.checked = false;
  }

  // 여러행 삭제하기.
  public confirmDeleteAll() {
    event.stopPropagation();

    if (this.checkBoxCnt === 0) {
      Alert.warning(this.translateService.instant('msg.nbook.alert.sel.del.items'));
      return;
    }
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.nbook.ui.del.nbook-server.title');
    modal.description = this.translateService.instant('msg.nbook.ui.del.nbook-server.description');

    const checkList = $('.ddp-checkbox-form');

    this.selectedDeleteItemIndex = '';
    for (let index = 1; index < checkList.length; index += 1) {
      const temp: any = checkList[index];
      if (temp.checked === true) {
        this.selectedDeleteItemIndex = this.selectedDeleteItemIndex + temp.value + ',';
      }
    }
    this.deleteModalComponent.init(modal);
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 삭제 확인 창
  protected confirmDelete($event, id) {

    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.nbook.ui.del.nbook-server.title');
    modal.description = this.translateService.instant('msg.nbook.ui.del.nbook-server.description');

    this.selectedDeleteItemIndex = id;
    this.deleteModalComponent.init(modal);

  }



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 페이지 첫 로딩시 처리 - 노트북 서버 리스트 불러오기
  private getNotebookServerList() {
    this.loadingShow();
    if (this.selectedNotebookServerType === 'ALL') {
      this.page.sort = 'modifiedTime,' + this.sort;
      this.notebookService.getNotebookServerAllList(this.searchText, this.page, 'default')
        .then((data) => {
          this.loadingHide();
          if (this.page.page === 0) {
            this.resultData = [];
          }
          if (!isUndefined(data._embedded)) {
            this.resultData = this.resultData.concat(data._embedded.connectors);
          }
          if (!isUndefined(data.page)) {
            this.totalElements = data.page.totalElements;
            this.pageResult = data['page'];
          }
          this.page.page += 1;
          this.checkBoxTypeCheck();
        })
        .catch((error) => {
          this.loadingHide();
          Alert.error(error.message);
        });
    } else {
      // ALL 아닐 경우.
      this.page.sort = 'modifiedTime,' + this.sort;
      this.notebookService.getNotebookServerTypeList(this.searchText, this.selectedNotebookServerType, this.page, 'default')
        .then((data) => {
          this.loadingHide();
          if (this.page.page === 0) {
            this.resultData = [];
          }
          if (!isUndefined(data._embedded)) {
            this.resultData = this.resultData.concat(data._embedded.connectors);
          }
          if (!isUndefined(data.page)) {
            this.totalElements = data.page.totalElements;
            this.pageResult = data['page'];
          }
          this.page.page += 1;
          this.checkBoxTypeCheck();
        })
        .catch((error) => {
          this.loadingHide();
          Alert.error(error.message);
        });
    }

  }

  /**
   * checkbox type checked
   */
  private checkBoxTypeCheck() {
    this.changeDetect.detectChanges();
    const checkList = $('.ddp-checkbox-form');
    let cnt : number = 0;
    for (let index = 1; index < checkList.length; index += 1) {
      const temp: any = checkList[index];
      for (let tempIndex = 0; tempIndex < this.tempCheckData.length; tempIndex += 1) {
        const idx = index-1;
        if( _.eq(this.resultData[idx].type, this.tempCheckData[tempIndex].type)
          && _.eq(this.resultData[idx].hostname, this.tempCheckData[tempIndex].hostname)
          && _.eq(this.resultData[idx].port, this.tempCheckData[tempIndex].port)
          && _.eq(this.resultData[idx].createdTime, this.tempCheckData[tempIndex].createdTime)
          && _.eq(this.resultData[idx].name, this.tempCheckData[tempIndex].name) ) {
          temp.checked = true;
          this.checkBoxCnt = 1;
          cnt++;
        }
      }
    }

    const $headerCheck: any = checkList[0];
    if (cnt == this.resultData.length) {
      $headerCheck.checked = true;
    } else {
      $headerCheck.checked = false;
    }

    if (0 == this.resultData.length) {
      $headerCheck.checked = false;
    }

  }

  /**
   * remove temp data
   * @param cloneData
   */
  private removeTempData(cloneData) {
    _.remove(this.tempCheckData, {
      type : cloneData.type,
      hostname : cloneData.hostname,
      port : cloneData.port,
      createdTime : cloneData.createdTime,
      name : cloneData.name,
    });
  }

}
