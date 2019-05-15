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
import {isNullOrUndefined, isUndefined} from 'util';
import { Modal } from '../../common/domain/modal';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { NoteBook } from '../../domain/notebook/notebook';
import * as _ from 'lodash';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-notebook-server',
  templateUrl: './notebook-server.component.html',
})
export class NotebookServerComponent extends AbstractComponent implements OnInit {


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 검색 파라메터
  private _searchParams: { [key: string]: string };

  // Server 추가
  @ViewChild(AddNotebookServerComponent)
  private addNotebookServerComponent: AddNotebookServerComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

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

  // 삭제 아이템.
  public selectedDeleteItemIndex: string;

  // checkbox 카운트
  public checkBoxCnt: number = 0;

  // check box flag
  public tempCheckData : any[] = [];

  public selectedContentSort: Order = new Order();

  public typeDefaultIndex: number = 0;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private notebookService: NotebookServerService,
              private _activatedRoute: ActivatedRoute,
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

    this.subscriptions.push(
      // Get query param from url
      this._activatedRoute.queryParams.subscribe((params) => {

        if (!_.isEmpty(params)) {


          if (!isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }

          if (!isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }

          if (!isNullOrUndefined(params['name'])) {
            this.searchText = params['name'];
          }

          if (!isNullOrUndefined(params['type'])) {
            this.selectedNotebookServerType = params['type'];
            this.typeDefaultIndex = this.notebookServerType.findIndex((item) => {
              return item === this.selectedNotebookServerType;
            });
          }

          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }

        }

        this.getNotebookServerList();

      })
    );

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
   * On select type
   * @param $event
   */
  public selectedLanguage($event) {
    this.selectedNotebookServerType = $event;
    this.reloadPage();
  }


  /**
   * Open notebook detail popup
   * @param notebook
   */
  public connectorItemRowClick(notebook: NoteBook) {
    this.addNotebookServerComponent.update(notebook);
  }


  /**
   * All checkbox click
   */
  public allCheckClick() {
    const checkList = $('.ddp-checkbox-form');
    const $headerCheck: any = checkList[0];

    let flag;
    flag = $headerCheck.checked !== false;
    for (let index = 1; index < checkList.length; index += 1) {
      const temp: any = checkList[index];
      temp.checked = flag;
      const cloneData = _.cloneDeep(this.resultData[index-1]);
      this.removeTempData(cloneData);
      if( temp.checked ) {
        this.tempCheckData.push( cloneData );
      }
    }
    this.checkBoxCnt = flag === true? 1 : 0;
  }


  /**
   * Check one item
   * @param $event
   * @param idx
   */
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


  /**
   * Search notebook server
   * @param event
   */
  public searchNotebookServer(event : any) {

    if (13 === event.keyCode || 27 === event.keyCode) {
      if (27 === event.keyCode) {
        this.searchText = '';
      }
      this.reloadPage();
    }

  }


  /**
   * Delete notebook server
   * @param isLoad
   */
  public deleteNotebookServer(isLoad?) {
    if (isLoad) this.loadingShow();
    const multiCnt = this.selectedDeleteItemIndex.split(',').length;

    if (multiCnt === 1) {
      this.notebookService.deleteNotebookServer(this.selectedDeleteItemIndex).then(() => {
        this.loadingHide();

        if (this.page.page > 0 && this.resultData.length === 1) {
          this.page.page -= 1;
        }
        Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
        this.reloadPage(false);
      }).catch((error) => {
        this.loadingHide();
        Alert.error(this.translateService.instant('msg.comm.alert.delete.fail'));
      });
    } else {
      this.selectedDeleteItemIndex = this.selectedDeleteItemIndex.substring(0, this.selectedDeleteItemIndex.length - 1);
      this.notebookService.deleteAllNotebookServer(this.selectedDeleteItemIndex).then(() => {
        this.loadingHide();

        if (this.page.page > 0 && this.resultData.length === this.checkBoxCnt) {
          this.page.page -= 1;
        }
        Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
        this.reloadPage(false);
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


  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      // 워크스페이스 조회
      this.reloadPage(false);
    }
  } // function - changePage


  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getNotebookParams(this.selectedNotebookServerType === 'ALL');
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage


  /**
   * 정렬 버튼 클릭
   * @param {string} key
   */
  public onClickSort(key: string): void {

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== key ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = key;

    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }

    // 페이지 초기화 후 재조회
    this.reloadPage();
  }


  /**
   * Refresh search text
   */
  public refreshSearch() {
    this.searchText = '';
    this.reloadPage();
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

    this.resultData = [];

    const isAll = this.selectedNotebookServerType === 'ALL';
    const params = this._getNotebookParams(isAll);

    this.notebookService.getNotebookList(isAll, params)
      .then((data) => {

        this.loadingHide();

        this._searchParams = params;

        this.pageResult = data.page;

        if (!isUndefined(data._embedded)) {
          this.resultData = this.resultData.concat(data._embedded.connectors);

          if (data._embedded.connectors.length > 0) {
            this.checkBoxTypeCheck();
          }
        }

      })
      .catch((error) => {
        this.loadingHide();
        Alert.error(error.message);
      });

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


  /**
   * Returns parameter for notebook list API
   * @private
   */
  private _getNotebookParams(isAll: boolean): any{

    const params = {
      page: this.page.page,
      size: this.page.size,
      projection: 'default',
      pseudoParam : (new Date()).getTime(),
    };

    // 검색어
    if (!isUndefined(this.searchText) && this.searchText.trim() !== '') {
      params['name'] = this.searchText.trim();
    } else {
      params['name'] = '';
    }


    // 타입이 all 이 아니라면 타입 정보가 필요하다
    if (!isAll) {
      params['type'] = this.selectedNotebookServerType
    }


    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

    return params

  }

}

class Order {
  key: string = 'modifiedTime';
  sort: string = 'desc';
}
