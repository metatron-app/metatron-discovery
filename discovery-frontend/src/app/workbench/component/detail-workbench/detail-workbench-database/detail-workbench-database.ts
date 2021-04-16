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
  EventEmitter, HostListener,
  Injector,
  Input, OnChanges,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {DataconnectionService} from '@common/service/dataconnection.service';
import {isUndefined} from 'util';
import {Page} from '@domain/common/page';
import {AbstractWorkbenchComponent} from '../../abstract-workbench.component';
import {WorkbenchService} from '../../../service/workbench.service';
import {StringUtil} from '@common/util/string.util';
import {CommonUtil} from '@common/util/common.util';

@Component({
  selector: 'detail-workbench-database',
  templateUrl: './detail-workbench-database.html'
})
export class DetailWorkbenchDatabaseComponent extends AbstractWorkbenchComponent implements OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('inputSearch')
  private inputSearch: ElementRef;

  // request reconnect count
  private _setDatabaseSchemaReconnectCnt: number = 0;

  private readonly _pageSize = 20;
  private _allDatabases: string[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public disable: boolean = false;

  @Input()
  public params: any;

  public selectedDatabaseName: string = '';

  // 데이터 베이스 리스트.
  public databases: string[];

  public workbenchId: string = '';
  // 검색어
  public searchText: string = '';

  // data search layer show 여부
  public isDatabaseSearchShow: boolean = false;

  @Output()
  public initDatabaseEvent: EventEmitter<string> = new EventEmitter();

  @Output()
  public selectedDatabaseEvent: EventEmitter<string> = new EventEmitter();

  @Output()
  public schemaBrowserEvent: EventEmitter<string> = new EventEmitter();

  // request reconnect count
  private _getDatabaseListReconnectCount: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected workbenchService: WorkbenchService,
              protected dataconnectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(workbenchService, element, injector);
  }

  public ngOnChanges(changes: SimpleChanges) {
    const paramChanges: SimpleChange = changes.params;
    if (paramChanges && paramChanges.currentValue) {
      if (this.selectedDatabaseName !== paramChanges.currentValue.dataconnection.database) {
        this.selectedDatabaseName = paramChanges.currentValue.dataconnection.database;
      }
      if (this.workbenchId !== paramChanges.currentValue.workbenchId) {
        this.workbenchId = paramChanges.currentValue.workbenchId;
      }
      this._getDatabaseList(this.params.dataconnection.id);
    }
  }

  // 컴포넌트 내부  host 클릭이벤트 처리
  @HostListener('document:click', ['$event'])
  public onClickHost(event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.isDatabaseSearchShow = false;
    }
  }

  /**
   * 스키마 브라우져 창 열기
   */
  public openSchemaBrowser(): void {
    if (this.disable) {
      return;
    }
    this.schemaBrowserEvent.emit();
  }

  /**
   * 데이터베이스 검색 이벤트
   * @param {KeyboardEvent} event
   */
  public onSearchDatabase(event: KeyboardEvent): void {
    (event.keyCode === 13) && this._searchDatabase();
  }

  /**
   * 데이터베이스 검색 초기화 이벤트
   */
  public onSearchDatabaseInit(): void {
    this._searchDatabaseInit();
  }

  /**
   * 데이터베이스 검색
   * @private
   */
  private _searchDatabase(): void {
    this.searchText = this.inputSearch.nativeElement.value.trim();
    if ('' === this.searchText) {
      this.databases = this._allDatabases.slice(0, this._pageSize);
    } else {
      this.databases = this._allDatabases.filter(ds => ds.includes(this.searchText)).slice(0, this._pageSize);
    }
  }

  /**
   * 데이터베이스 검색 초기화
   * @private
   */
  private _searchDatabaseInit(): void {
    // 데이터베이스 검색어 초기화
    this.inputSearch.nativeElement.value = '';
    // 데이터베이스 검색
    this._searchDatabase();
  }

  /**
   * 검색어 삭제 버튼 표시 여부
   * @returns {boolean}
   */
  public isShowBtnClear(): boolean {
    if (this.inputSearch) {
      return '' !== this.inputSearch.nativeElement.value;
    } else {
      return false;
    }
  } // function - isShowBtnClear

  public get isShowMore() {
    return this.databases.length < this._allDatabases.filter(ds => ds.includes(this.searchText)).length;
  }

  public moreDatabases(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.databases
      = this.databases.concat(
      this._allDatabases
        .filter(ds => ds.includes(this.searchText))
        .slice(this.databases.length, this.databases.length + this._pageSize)
    );
  }

  private _getDatabaseList(connectionId: string): void {
    // 호출 횟수 증가
    this._getDatabaseListReconnectCount++;
    const param = this._getParameterForDatabase(WorkbenchService.websocketId);
    this.dataconnectionService.getDatabaseListInConnection(connectionId, param)
      .then((result) => {
        // 호출 횟수 초기화
        this._getDatabaseListReconnectCount = 0;
        if (result && result.databases && 0 < result.databases.length) {
          this._allDatabases = result.databases.sort();
          this.databases = this._allDatabases.slice(0, this._pageSize);
          const generalConnection: any = this.getLocalStorageGeneral();
          if (generalConnection) {
            if (undefined === generalConnection.schema || null === generalConnection.schema) {
              this.selectedDatabase(this.databases[0]);
            } else {
              this.selectedDatabase(generalConnection.schema);
            }
          } else {
            this.selectedDatabase(this.databases[0], true);
          }
        }
        this.loadingHide();
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._getDatabaseListReconnectCount <= 5) {
          this.webSocketCheck(() => {
            this._getDatabaseList(connectionId);
          });
        } else {
          this.commonExceptionHandler(error);
        }
      });
  }

  /**
   * 데이터베이스 이름 클릭했을 때
   */
  public databaseSearchShow() {
    if (this.disable) {
      return;
    }
    this.isDatabaseSearchShow = !this.isDatabaseSearchShow;
  } // function - databaseSearchShow

  /**
   * 데이터 베이스 선택하기
   * @param {string} param
   * @param {boolean} init
   */
  public selectedDatabase(param: string, init: boolean = false) {
    if (this.disable) {
      return;
    }
    this.params.dataconnection.database = param;
    this.selectedDatabaseName = param;
    this.isDatabaseSearchShow = false;
    this._setDatabaseSchema(this.params.dataconnection.id, this.params.dataconnection.database);
    this.saveLocalStorageGeneralSchema(this.params.dataconnection.database);
    if (init === true) {
      this.initDatabaseEvent.emit(param);
    } else {
      this.selectedDatabaseEvent.emit(param);
    }
  } // function - selectedDatabase

  /**
   * 데이터베이스 스키마 조회
   * @param {string} connectionId
   * @param {string} databaseName
   */
  private _setDatabaseSchema(connectionId: string, databaseName: string) {
    // 호출 횟수 증가
    this._setDatabaseSchemaReconnectCnt++;
    this.loadingShow();
    this.dataconnectionService.setDatabaseShema(connectionId, databaseName, WorkbenchService.websocketId)
      .then(() => {
        // 호출 횟수 초기화
        this._setDatabaseSchemaReconnectCnt = 0;
        this.loadingHide();
      })
      .catch((error) => {
        if (!isUndefined(error.details) && error.code === 'JDC0005' && this._setDatabaseSchemaReconnectCnt <= 5) {
          this.webSocketCheck(() => {
            this._setDatabaseSchema(connectionId, databaseName);
          });
        } else {
          this.commonExceptionHandler(error);
        }

      });
  } // function - _setDatabaseSchema

  /**
   * local storage 에 저장된 기본정보 불러오기
   * @returns {string}
   */
  public getLocalStorageGeneral() {
    return JSON.parse(localStorage.getItem('workbench-general-' + this.workbenchId));
  }

  public saveLocalStorageGeneralSchema(schema: string): void {
    const saveObj: any = {};
    const generalConnection: any = this.getLocalStorageGeneral();
    if (generalConnection !== null) {
      if (!isUndefined(generalConnection.tabId)) {
        saveObj.tabId = generalConnection.tabId;
      }
      // if (!isUndefined(generalConnection.schema)) {
      saveObj.schema = schema;
      // }
      localStorage.setItem('workbench-general-' + this.workbenchId, JSON.stringify(saveObj));
    }
  }

  /**
   * Get parameters for database list
   * @param {string} webSocketId
   * @param {Page} page
   * @param {string} databaseName
   * @private
   */
  private _getParameterForDatabase(webSocketId: string, page?: Page, databaseName?: string): any {
    const params = {
      webSocketId: webSocketId,
      loginUserId: CommonUtil.getLoginUserId()
    };
    if (page) {
      params['sort'] = page.sort;
      params['page'] = page.page;
      params['size'] = page.size;
    } else {
      params['page'] = 0;
      params['size'] = 10000;
    }
    if (StringUtil.isNotEmpty(databaseName)) {
      params['databaseName'] = databaseName.trim();
    }
    return params;
  }
}
