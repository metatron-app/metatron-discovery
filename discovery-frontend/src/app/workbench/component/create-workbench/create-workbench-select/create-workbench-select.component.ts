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

import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../common/service/popup.service';
import { DataconnectionService } from '../../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../../common/util/alert.util';
import { Dataconnection } from '../../../../domain/dataconnection/dataconnection';
import { Workbench } from '../../../../domain/workbench/workbench';
import { PageResult } from '../../../../domain/common/page';
import { WorkspaceService } from '../../../../workspace/service/workspace.service';
import {StorageService} from "../../../../data-storage/service/storage.service";

@Component({
  selector: 'app-create-workbench-select',
  templateUrl: './create-workbench-select.component.html'
})
export class CreateWorkbenchSelectComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선택한 데이터 커넥션
  private dataconnection: Dataconnection = new Dataconnection;

  // 선택한 데이터베이스 타입
  private selectedDbType: any;

  // 선택한 계정 타입
  private selectedAccountType: any;

  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public workbench: Workbench;

  @Input()
  public workspaceId: string;

  // 검색
  public searchText: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();

  // 데이터 베이스 타입
  public dbTypes: any[];

  // 계정 타입
  public accountTypes: any[];

  // 데이터 커넥션 목
  public dataconnections: Dataconnection[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected popupService: PopupService,
              protected workspaceService: WorkspaceService,
              protected storageService: StorageService,
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
    // 초기화
    this.initViewPage();
    // 커넥션 정보를 이미 가지고 있을 경우
    if (this.workbench.dataConnection.hasOwnProperty('id')) {
      this.initConnectionData(this.workbench);
    } else {
      // 데이터 커넥션 조회
      this.getDataconnections();
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

  /** 취소 */
  public cancel() {
    this.close();
  }

  /** 다음 */
  public next() {
    // 선택된게 없다면
    if (!this.isSelectedConnection) return;


    // 데이터 커넥션 정보 저장
    this.saveConnectionData();

    // 다음 페이지로 이동
    this.popupService.notiPopup({
      name: 'workbench-create-complete',
      data: null
    });

    // const idx = this.dataconnections.findIndex((dataconnection) => {
    //   return dataconnection.id === this.dataconnectionId;
    // });
    //
    // if (idx > -1) {
    //   this.workbench.dataConnection = this.dataconnections[idx];
    //
    //   this.popupService.notiPopup({
    //     name: 'workbench-create-complete',
    //     data: null
    //   });
    // }
  }

  /**
   * 검색 조회 - 키보드 이벤트
   * @param {KeyboardEvent} event
   */
  public searchEventPressKey(event: KeyboardEvent) {
    ( 13 === event.keyCode ) && ( this.searchEvent() );
  } // function - searchEventPressKey

  /**
   * 검색 조회
   */
  public searchEvent() {
    // 검색어 설정
    this.searchText = this._inputSearch.nativeElement.value;
    // 페이지 초기화
    this.pageResult.number = 0;
    // 데이터커넥션 리스트 조회
    this.getDataconnections();
  } // function - searchEvent

  /**
   * 검색어 리셋
   */
  public resetSearchText(isClear: boolean) {
    if (isClear) {
      this._inputSearch.nativeElement.value = '';
    } else {
      // 검색어 설정
      this._inputSearch.nativeElement.value = this.searchText;
    }
  } // function - resetSearchText

  /**
   * 정렬
   * @param {string} column
   */
  public changeOrder(column: string) {

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = column;

    if (this.selectedContentSort.key === column) {
      // asc, desc, default
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

    // 페이지 초기화
    this.pageResult.number = 0;
    // 데이터소스 리스트 조회
    this.getDataconnections();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 더 조회할 데이터가 있는지 여부
   * @returns {boolean}
   */
  public get isMoreContents() {
    if (this.pageResult.number < this.pageResult.totalPages - 1) {
      return true;
    }
    return false;
  }

  /**
   * 선택한 데이터 커넥션이 있는경우
   * @returns {boolean}
   */
  public get isSelectedConnection() {
    if (this.dataconnection.id) {
      return true;
    }
    return false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 계정 타입 얻기
   * @param connection
   * @returns {any}
   */
  public getAuthenticationType(connection) {
    const authenticationType = connection.authenticationType;
    let result;
    switch (authenticationType) {
      case 'MANUAL':
        result = this.translateService.instant('msg.storage.li.connect.always');
        break;
      case 'USERINFO':
        result = this.translateService.instant('msg.storage.li.connect.account');
        break;
      case 'DIALOG':
        result = this.translateService.instant('msg.storage.li.connect.id');
        break;
      default:
        result = this.translateService.instant('msg.storage.li.connect.always');
    }
    return result;
  }

  /**
   * db type default index
   * @returns {number}
   */
  public get getDefaultIndexDbType() {
    return this.dbTypes.findIndex((item) => {
      return item.name === this.selectedDbType.name;
    });
  }

  /**
   * account type default index
   * @returns {number}
   */
  public get getDefaultIndexAccountType() {
    return this.accountTypes.findIndex((item) => {
      return item.value === this.selectedAccountType.value;
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터커넥션 선택
   * @param {Dataconnection} dataconnection
   */
  public onSelectDataconnection(dataconnection: Dataconnection) {
    // 지금 보고있는 데이터면 show 해제
    if (dataconnection.id === this.dataconnection.id) {
      this.dataconnection = new Dataconnection;
      return;
    }

    // 데이터커넥션 저장
    this.dataconnection = dataconnection;
  }

  /**
   * 데이터베이스 선택 이벤트
   * @param event
   */
  public onChangeDbType(event) {
    // 데이터베이스 타입
    this.selectedDbType = event;
    // 페이지 초기화
    this.pageResult.number = 0;
    // 데이터커넥션 리스트 조회
    this.getDataconnections();
  }

  /**
   * 계정 타입 선택 이벤트
   * @param event
   */
  public onChangeAccountType(event) {
    // 계정 타입
    this.selectedAccountType = event;
    // 페이지 초기화
    this.pageResult.number = 0;
    // 데이터커넥션 리스트 조회
    this.getDataconnections();
  }

  /**
   * 더보기 버튼
   */
  public onClickMoreList() {
    // 더 보여줄 데이터가 있다면
    if (this.isMoreContents) {
      // 페이지 넘버 추가
      this.pageResult.number += 1;
      // 데이터소스 조회
      this.getDataconnections();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 커넥션 목록 조회 api
   */
  private getDataconnections() {

    // 로딩 show
    this.loadingShow();

    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
    };

    const allDBType = this.translateService.instant('msg.storage.ui.list.all');

    // 데이터베이스 타입
    if (this.selectedDbType.name !== allDBType) {
      params['implementor'] = this.selectedDbType.implementor;
    }
    // 계정타입
    if (this.selectedAccountType.value !== 'all') {
      params['authenticationType'] = this.selectedAccountType.value;
    }
    // 검색
    if (this.searchText.trim() !== '') {
      params['name'] = this.searchText.trim();
    }

    // 페이지가 첫번째면
    if (0 === params.page) {
      this.pageResult = new PageResult();
      this.dataconnections = [];
    }

    // 조회
    this.workspaceService.getConnections(this.workspaceId, params).then((dataconnections) => {

      // 데이터커넥션 아이디 초기화
      this.dataconnection = new Dataconnection;

      // page 객체 저장
      this.pageResult = dataconnections['page'];

      // 데이터가 있다면
      this.dataconnections = dataconnections['_embedded'] ? this.dataconnections.concat(dataconnections['_embedded'].connections) : [];

      this.dataconnections.forEach((item: Dataconnection, idx: number) => {
        item.num = this.pageResult.totalElements - idx;
      });

      // 로딩 hide
      this.loadingHide();
    }).catch(() => {
      // 로딩 hide
      this.loadingHide();

      Alert.error(this.translateService.instant('msg.bench.alert.dc.retrieve.fail'));
    });
  }


  /**
   * 현재 커넥션 정보 저장
   */
  private saveConnectionData() {
    // connection 정보 저장
    this.workbench.dataConnection = this.dataconnection;
    // 커넥션 리스트
    this.workbench['dataconnections'] = this.dataconnections;
    // 검색어
    this.workbench['searchText'] = this.searchText;
    // 선택한 콤보박스 정보
    this.workbench['selectedDbType'] = this.selectedDbType;
    this.workbench['selectedAccountType'] = this.selectedAccountType;
    // 선택한 정렬 상태
    this.workbench['selectedContentSort'] = this.selectedContentSort;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - init
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커넥션 데이터 init
   * @param workbench
   */
  private initConnectionData(workbench) {
    // 커넥션 정보
    this.dataconnection = workbench.dataConnection;
    // 커넥션 리스트
    this.dataconnections = workbench.dataconnections;
    // 검색어
    this.searchText = workbench.searchText;
    // 선택한 콤보박스 정보
    this.selectedDbType = workbench.selectedDbType;
    this.selectedAccountType = workbench.selectedAccountType;
    // 선택한 정렬 상태
    this.selectedContentSort = workbench.selectedContentSort;
  }

  /**
   * 초기화
   */
  private initViewPage() {

    // 선택한 데이터커넥션 초기화
    this.dataconnection = new Dataconnection;
    // 데이터커넥션 리스트
    this.dataconnections = [];
    // 검색어
    this.searchText = '';

    // database types
    this.dbTypes = this.storageService.getConnectionTypeList();
    this.dbTypes.unshift({name: this.translateService.instant('msg.storage.ui.list.all'), value: 'all'});

    this.selectedDbType = this.dbTypes[0];

    // 계정 타입
    this.accountTypes = [
      { label: 'All', value: 'all' },
      { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
    ];
    this.selectedAccountType = this.accountTypes[0];

    // 정렬
    this.selectedContentSort = new Order();

    // page 설정
    this.pageResult.number = 0;
    this.pageResult.size = 20;
  }

}

class Order {
  key: string = 'modifiedTime';
  sort: string = 'desc';
}

