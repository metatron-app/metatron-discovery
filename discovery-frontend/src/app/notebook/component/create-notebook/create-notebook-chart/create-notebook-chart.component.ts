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

import {isUndefined} from 'util';
import {Component, ElementRef, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {PopupService} from '@common/service/popup.service';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {NoteBook} from '@domain/notebook/notebook';
import {BookTree} from '@domain/workspace/book';
import {Datasource} from '@domain/datasource/datasource';
import {WorkspaceService} from '../../../../workspace/service/workspace.service';
import {DashboardService} from '../../../../dashboard/service/dashboard.service';
import {NotebookService} from '../../../service/notebook.service';

@Component({
  selector: 'app-create-notebook-chart',
  templateUrl: './create-notebook-chart.component.html'
})
export class CreateNotebookChartComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy {

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

  // 선택한 데이터
  public selectedChartId: string = '';
  // 북 정보
  public books: BookTree[] = [];
  // ui용
  public node: any[] = [];
  // ui용
  public nameNode: any[] = [];

  // 보여줄 타입 필드
  public types = ['folder', 'workbook', 'board', 'chart'];

  // node 추가 flag
  public widgetAddFlag: boolean = false;

  // 위젯 리스트
  public widget: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected popupService: PopupService,
              protected workspaceService: WorkspaceService,
              protected notebookService: NotebookService,
              protected dashboardService: DashboardService,
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

      // 워크북 조회
      this.getWorkbooks(this.workspaceId, 'root');
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
    if (this.selectedChartId === '') {
      Alert.warning(this.translateService.instant('msg.nbook.alert.sel.chart'));
      return;
    }
    this.notebook.datasource.id = this.selectedChartId;
    this.notebook.datasource.dsType = 'CHART';

    this.popupService.notiPopup({
      name: 'create-notebook-name',
      data: null
    });
  }

  /** 팝업창 닫기 */
  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-notebook-create',
      data: null
    });
  }

  // 위젯 디테일 구하기
  public getNotebookChartDetail(widgetId: string) {
    this.selectedChartId = widgetId;
  }

  /** 대시보드 위젯 조회 api */
  public getDashboardWidget(dashboardId: string) {
    this.selectedChartId = '';
    // 로딩 show
    this.loadingShow();
    this.dashboardService.getDashboardWidget(dashboardId, 'forTreeView')
      .then((widget) => {

        console.log('widget', widget);
        // 데이터 넣기
        if (this.widgetAddFlag === true) {
          this.node.pop();
        }

        if (!isUndefined(widget['_embedded'])) {

          // type이 page인것만 보여주기
          this.widget = widget['_embedded'].widgets.filter((item) => {
            return item.type === 'page';
          });
        } else {
          // dashboard를 생성하고 차트가 없을수 있다
          this.widget = [];
        }
        this.widget.widget = true;
        this.node.push(this.widget);
        this.widgetAddFlag = true;

        // 로딩 hide
        this.loadingHide();
      })
      .catch((_error) => {
        Alert.error(this.translateService.instant('msg.nbook.alert.widget.retrieve.fail'));
        // 로딩 hide
        this.loadingHide();
      });
  }

  /** 선택 시 이벤트 */
  public selectBook(event, index) {
    this.selectedChartId = '';
    this.widgetAddFlag = false;
    // 뎁스 자르기
    this.node = this.node.slice(0, index + 1);
    this.nameNode = this.nameNode.slice(0, index);

    // 북 데이터
    const book = this.books.filter((data) => {
      // 존재하는 아이디 일때
      return (data['id'].indexOf(event.id) > -1);
    });

    // 재조회 여부
    if (book.length > 0) {
      this.node.push(book[0]);
      this.nameNode.push(event.id);
    } else {
      // 대시보드라면 위젯 조회
      event.type === undefined ? this.getDashboardWidget(event.id) : this.getWorkbooks(this.workspaceId, event.id);
    }
  }

  /** 차트 요약페이지 닫았을때 발생 이벤트 */
  public onCloseSummary() {
    this.selectedChartId = '';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** 워크북 조회 api */
  protected getWorkbooks(workspaceId: string, bookId: string) {
    // 로딩 show
    this.loadingShow();

    this.workspaceService.getWorkbooks(workspaceId, bookId, 'forTreeView')
      .then((book) => {

        // 데이터 넣기
        this.books.push(book);
        this.node.push(book);

        if (bookId !== 'root') {
          this.nameNode.push(book.id);
        }
        this.notebook.path = book.name;
        console.log('this.notebook.path', this.notebook.path);
        // 로딩 hide
        this.loadingHide();
      })
      .catch((_error) => {
        Alert.error(this.translateService.instant('msg.nbook.alert.workbook.retrieve.fail'));
        // 로딩 hide
        this.loadingHide();
      });
  }

}
