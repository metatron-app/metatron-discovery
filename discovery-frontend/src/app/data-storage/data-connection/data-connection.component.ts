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
import { Dataconnection } from '../../domain/dataconnection/dataconnection';
import { DataconnectionService } from '../../dataconnection/service/dataconnection.service';
import { SubscribeArg } from '../../common/domain/subscribe-arg';
import { PopupService } from '../../common/service/popup.service';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { Modal } from '../../common/domain/modal';
import { Alert } from '../../common/util/alert.util';
import { PeriodComponent } from '../../common/component/period/period.component';
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';
import { StringUtil } from '../../common/util/string.util';

declare let moment: any;

@Component({
  selector: 'app-data-connection',
  templateUrl: './data-connection.component.html',
  providers: [MomentDatePipe]

})
export class DataConnectionComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // DB타입 필터링
  private searchDb: string = 'all';

  // 삭제할 커넥션 데이터
  private deleteConnectionId : string;

  // 공통 삭제 팝업 모달
  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // DB 타입
  public dbTypes: any[];

  // date
  private selectedDate : Date;

  // 데이터 커넥션
  public dataconnections: Dataconnection[];

  // 검색어
  public searchText: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();

  // 커넥션 생성 step
  public connectionStep: string;

  // 선택한 데이터 커넥션
  public selectedConnection: Dataconnection = new Dataconnection();

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataconnectionService: DataconnectionService,
              private popupService: PopupService,
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

    this.initView();

    // 커넥션 조회
    this.getDataconnection();

    // 커넥션 생성 step 구독
    const popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {
      this.connectionStep = data.name;

      // 커넥션 생성완료
      if (data.name === 'reload-connection') {
        // 페이지 초기화
        this.page.page = 0;
        // 조회
        this.getDataconnection();
      }
    });
    this.subscriptions.push(popupSubscription);
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터 모두 초기화
   */
  public initFilters(): void {
    // type list
    this.dbTypes = this.getEnabledConnectionTypes();
    // 정렬
    this.selectedContentSort = new Order();
    // db type
    this.searchDb = 'all';
    // create date 초기화
    this.selectedDate = null;
    // date 필터 created update 설정 default created로 설정
    this.periodComponent.selectedDate = 'CREATED';
    // 검색조건 초기화
    this.searchText = '';
    // 페이지 초기화
    this.page.page = 0;
    // date 필터 init
    this.periodComponent.setAll();
  }

  /**
   * 데이터 커넥션 삭제
   */
  public deleteConnection(): void {
    // 로딩 show
    this.loadingShow();
    // 커넥션 삭제
    this.dataconnectionService.deleteConnection(this.deleteConnectionId)
      .then((result) => {
        Alert.success(this.translateService.instant('msg.storage.alert.dconn.delete'));
        // 초기화
        this.deleteConnectionId = '';
        // 재조회
        this.getDataconnection();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 데이터 커넥션 삭제 모달 오픈
   * @param connection
   */
  public deleteModalOpen(connection): void {

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.ui.dconn.delete.title');
    modal.description = this.translateService.instant('msg.storage.ui.delete.title');
    modal.btnName = this.translateService.instant('msg.storage.ui.dconn.delete.btn');

    // 삭제할 커넥션 아이디 저장
    this.deleteConnectionId = connection.id;

    // 팝업 창 오픈
    this.deleteModalComponent.init(modal);
  }

  /**
   * 데이터 커넥션 생성 페이지 오픈
   */
  public createDataconnection(): void {
    this.connectionStep = 'create-connection';
    this.selectedConnection = new Dataconnection();
  }

  /**
   * 데이터 커넥션 수정 페이지 오픈
   * @param {Dataconnection} connection
   */
  public updateDataconnection(connection: Dataconnection): void {
    this.connectionStep = 'update-connection';
    this.selectedConnection = connection;
  }

  /**
   * 더보기 버튼
   */
  public getMoreList(): void {
    // 더 보여줄 데이터가 있다면
    if (this.isMoreContents()) {
      // 페이지 증가
      this.page.page += 1;
      // 데이터소스 조회
      this.getDataconnection();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터링 DB 타입 변경
   * @param type
   */
  public onChangeDbType(type): void {
    this.searchDb = type.value;
    // 페이지 초기화
    this.page.page = 0;
    // 재조회
    this.getDataconnection();
  }

  /**
   * 필터링 켈린더 선택
   * @param event
   */
  public onChangeData(event): void {
    // 페이지 초기화
    this.page.page = 0;
    // 선택한 날짜
    this.selectedDate = event;
    // 재조회
    this.getDataconnection();
  }

  /**
   * 필터링 커넥션 정렬
   * @param {string} key
   */
  public sort(key: string): void {
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
      }
    }
    // 페이지 초기화
    this.page.page = 0;
    // 재조회
    this.getDataconnection();
  }

  /**
   * 데이터커넥션 검색 이벤트
   * @param {boolean} initFl
   */
  public searchEvent(initFl: boolean): void {
    // esc
    if (!initFl) {
      this.searchText = '';
    }
    // 페이지 초기화
    this.page.page = 0;
    // 데이터 커넥션 리스트 조회
    this.getDataconnection();
  }

  /**
   * 데이터커넥션 텍스트 검색
   * @param {KeyboardEvent} event
   */
  public searchDataconnnectionEvent(event: KeyboardEvent): void {
    ( 13 === event.keyCode ) && (this.searchEvent(true));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 더 조회할 컨텐츠가 있는지 여부
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.page.page < this.pageResult.totalPages -1);
  }

  /**
   * 커넥션이 Default 타입이라면
   * @param {Dataconnection} connection
   * @returns {boolean}
   */
  public isDefaultType(connection: Dataconnection): boolean {
    return StringUtil.isEmpty(connection.url);
  }

  /**
   * 컨텐츠 총 갯수
   * @returns {number}
   */
  public get getTotalContentsCount(): number {
    return this.pageResult.totalElements;
  }

  /**
   * Get connection type
   * @param {string} implementor
   * @returns {string}
   */
  public getConnectionType(implementor: string): string {
    return (this.dbTypes.find((type) => type.value === implementor) || {label: implementor}).label;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 커넥션 목록조회
   */
  private getDataconnection(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터커넥션 목록 조회
    this.dataconnectionService.getAllDataconnections(this.getDataConnectionParams())
      .then((dataconnections) => {
        // 페이지 객체 저장
        this.pageResult = dataconnections['page'];
        // 페이지가 첫번째면
        if (this.page.page === 0) {
          this.dataconnections = [];
        }
        // 데이터가 있다면
        this.dataconnections = dataconnections['_embedded'] ? this.dataconnections.concat(dataconnections['_embedded'].connections) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        console.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * ui 초기화
   */
  private initView(): void {
    // 페이지 초기화
    this.page.page = 0;
    this.page.size = 20;
    // db 타입
    this.dbTypes = this.getEnabledConnectionTypes();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 커넥션 조회 파라메터
   * @returns {{size: number; page: number}}
   */
  private getDataConnectionParams() {
    const params = {
      size: this.page.size,
      page: this.page.page
    };
    // DB 타입
    if (this.searchDb !== 'all') {
      params['implementor'] = this.searchDb;
    }
    // 이름 검색
    if (this.searchText.trim() !== '') {
      params['name'] = this.searchText.trim();
    }
    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }
    // date 타입
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = this.selectedDate.dateType;
      if (this.selectedDate.startDateStr) {
        params['from'] = this.selectedDate.timezone < 0
          ? (moment(this.selectedDate.startDateStr).subtract(-this.selectedDate.timezone, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z')
          : (moment(this.selectedDate.startDateStr).add(this.selectedDate.timezone, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z');
      }
      if (this.selectedDate.endDateStr) {
        params['to'] = this.selectedDate.timezone < 0
          ? (moment(this.selectedDate.endDateStr).subtract(-this.selectedDate.timezone, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z')
          : (moment(this.selectedDate.endDateStr).add(this.selectedDate.timezone, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z');
      }
    }
    return params;
  }
}

class Order {
  key: string = 'createdTime';
  sort: string = 'desc';
}

class Date {
  dateType : string;
  endDateStr : string;
  startDateStr : string;
  type: string;
  timezone: number;
}
