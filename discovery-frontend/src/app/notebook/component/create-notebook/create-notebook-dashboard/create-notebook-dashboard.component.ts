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

import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {Component, ElementRef, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {NoteBook} from '@domain/notebook/notebook';
import {Alert} from '@common/util/alert.util';
import {PopupService} from '@common/service/popup.service';
import {WorkspaceService} from '../../../../workspace/service/workspace.service';
import {Book} from '@domain/workspace/book';
import {DashboardService} from '../../../../dashboard/service/dashboard.service';
import {NotebookService} from '../../../service/notebook.service';
import {Datasource} from '@domain/datasource/datasource';

@Component({
  selector: 'app-create-notebook-dashboard',
  templateUrl: './create-notebook-dashboard.component.html'
})
export class CreateNotebookDashboardComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy {

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

  // 북 컨텐츠 정보
  public books: Book[];

  // root books
  public rootBooks: Book[];

  // sub books
  public subBooks: Book[];

  // 선택한 대시보드의 마스터 데이터소스 아이디
  public selectedBoardId: string = '';
  public selectedDatasourceId: string = '';

  // 전체 뎁스
  public node: any[] = [];
  public nameNode: any[] = [];

  // 대시보드 리스트
  public datasource: Datasource = new Datasource();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected popupService: PopupService,
              protected workspaceService: WorkspaceService,
              protected dashboardService: DashboardService,
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
    this.notebook.datasource = new Datasource();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.workspaceId.firstChange) {
      // 초기화
      // this.initViewPage();

      // 워크스페이스 조회
      this.getWorkspace();
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

  public next(arg?: string) {
    this.notebook.type = arg;
    if (this.selectedBoardId === '') {
      Alert.warning(this.translateService.instant('msg.nbook.alert.sel.dashboard'));
      return;
    }
    this.notebook.datasource.id = this.selectedBoardId;
    this.notebook.datasource.dsType = 'DASHBOARD';

    this.popupService.notiPopup({
      name: 'create-notebook-name',
      data: null
    });
  }

  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-notebook-create',
      data: null
    });
  }

  // 대시 보드 Detail 구하기
  public showDashboardDetail(dashboardId: string) {
    this.loadingShow();
    this.dashboardService.getDashboard(dashboardId)
      .then((data) => {
        console.log('dashboardDetail', data);
        this.loadingHide();
        this.selectedBoardId = data.id;
        if (data.dataSources.length > 0) {
          this.selectedDatasourceId = data.dataSources[0].id;
          this.datasource = data.dataSources[0];
          this.notebook.datasource.name = data.dataSources[0].name;
        }
      })
      .catch((error) => {
        this.loadingHide();
        Alert.error(this.translateService.instant('msg.nbook.alert.dashboard.retrieve.fail'));
        console.log('dashboardDetail', error);
      });
  }

  /** 내부 폴더 조회 */
  public hasSubBooks(book: Book) {
    // 해당 북을 던지면 내부에 일치하는 아이디가 있는지 판단하여 내부 컨텐츠가 존재함을 표시
    const types = ['page', 'board'];
    // 워크보드 내 대시보드가 없다면
    if (types.indexOf(book.type) > -1) {
      return false;
    } else if (book.type === 'workbook') {
      // 해당 북이 워크북일 경우 내부컨텐츠 존재하는지 확인
    } else {
      // 폴더 일경우 내부컨텐츠 존재하는지 확인
      return (this.subBooks.filter((data) => {
        return data.folderId === book.id;
      }).length) > 0;
    }
  }

  /** 클릭시 내부 컨텐츠 show */
  public showBooks(book: Book, index: number) {
    console.log('showbooks', book, index);
    this.selectedDatasourceId = '';
    this.selectedBoardId = '';
    // 뎁스 자르기
    this.node = this.node.slice(0, index + 1);
    this.nameNode = this.nameNode.slice(0, index);

    // 내부에 컨텐츠가 있을 경우
    if (this.hasSubBooks(book)) {
      this.node.push(this.subBooks.filter((data) => {
        return data.folderId === book.id;
      }));
      this.selectedBoardId = '';
    } else {
      // this.selectedBoardId = book.type !== 'folder' && book['pages'] ? book.id : '';
      if (book.type === 'workbook') {
        this.selectedBoardId = book.id;
        this.notebook.path = book.name;
        this.getNotebookDashboard(this.workspaceId, this.selectedBoardId);
      }
    }
    // 선택한 컨텐츠들 담기
    this.nameNode.push(book.id);
  }

  /** 데이터소스 요약페이지 닫았을때 발생 이벤트 */
  public onCloseSummary() {
    this.selectedDatasourceId = '';
    this.selectedBoardId;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** 워크스페이스 조회 */
  protected getWorkspace() {

    // 로딩 show
    this.loadingShow();

    this.workspaceService.getWorkSpace(this.workspaceId)
      .then((workspace) => {

        // 데이터 있을 때
        if (workspace['_embedded'] && workspace['_embedded']['books']) {
          this.books = workspace['_embedded']['books'];
          // 폴더 데이터
          this.getRootAndSubBooks();
        } else {
          this.books = [];
        }

        // 로딩 hide
        this.loadingHide();
      })
      .catch((_error) => {
        Alert.error(this.translateService.instant('msg.space.alert.retrieve'));
        // 로딩 hide
        this.loadingHide();
      });
  }

  /** 워크북 조회 api */
  protected getNotebookDashboard(workspaceId: string, bookId: string) {
    // 로딩 show
    this.loadingShow();
    this.workspaceService.getWorkbooks(workspaceId, bookId, 'forTreeView')
      .then((workbooks) => {
        this.loadingHide();
        console.log('workbooks', workbooks);
        // this.bookTree = workbooks;
        // this.node.push(this.bookTree);
        this.node.push(workbooks);
      })
      .catch((_error) => {
        Alert.error(this.translateService.instant('msg.nbook.alert.workbook.retrieve.fail'));
        // 로딩 hide
        this.loadingHide();
      });
  }


  /** 루트 폴더와 분리 */
  protected getRootAndSubBooks() {
    // types에 존재하는 타입만 필터링
    const types = ['folder', 'workbook', 'board'];
    this.rootBooks = this.books.filter((book) => {
      return book.folderId === 'ROOT' && (types.indexOf(book.type) > -1);
    });

    // 전체 뎁스에 넣기
    this.node.push(this.rootBooks);

    this.subBooks = this.books.filter((book) => {
      return book.folderId !== 'ROOT' && (types.indexOf(book.type) > -1);
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
