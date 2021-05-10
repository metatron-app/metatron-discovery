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

import * as pixelWidth from 'string-pixel-width';
import * as $ from 'jquery';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {GridComponent} from '@common/component/grid/grid.component';
import {Header, SlickGridHeader} from '@common/component/grid/grid.header';
import {GridOption} from '@common/component/grid/grid.option';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {Field} from '@domain/datasource/datasource';
import {BoardDataSource, BoardDataSourceRelation, QueryParam} from '@domain/dashboard/dashboard';
import {DatasourceService} from '../../../datasource/service/datasource.service';

@Component({
  selector: 'create-board-pop-relation',
  templateUrl: './create-board-pop-relation.component.html',
  styles: [
    '.ddp-list-selectbox2 li.sys-focus-item { background-color: #f6f6f7 !important; }'
  ]
})
export class CreateBoardPopRelationComponent extends AbstractPopupComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('leftGrid')
  private leftGrid: GridComponent;

  @ViewChild('leftSide')
  private _leftSide: ElementRef;

  @ViewChild('rightGrid')
  private rightGrid: GridComponent;

  @ViewChild('rightSide')
  private _rightSide: ElementRef;

  @ViewChild('inputSourceSearchText')
  private _sourceSearchText: ElementRef;

  @ViewChild('inputTargetSearchText')
  private _targetSearchText: ElementRef;

  @ViewChild('sourceFieldCombo')
  private _sourceFieldCombo: ElementRef;

  @ViewChild('targetFieldCombo')
  private _targetFieldCombo: ElementRef;

  private _$sourceFieldCombo;
  private _$targetFieldCombo;
  private _$leftSide;
  private _$rightSide;
  private _$leftFieldList;
  private _$rightFieldList;

  private _queryLimit: number = 1000;         // 조회 갯수

  private _mode: string; // ADD, EDIT - 동작 모드

  @Output('addCancel')
  private _addCancelEvent: EventEmitter<string> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public relation: BoardDataSourceRelation;      // 데이터소스 연계 정보

  public sourceSearchText: string = '';          // 소스 필드 목록 검색
  public targetSearchText: string = '';          // 타겟 필드 목록 검색

  public isShowRelationPopup: boolean = false;  // Join Popup 표시 여부
  public isFromGridMode: boolean = true;        // From DataSource Grid 모드 여부
  public isToGridMode: boolean = true;          // To DataSource Grid 모드 여부
  public isShowSrcComboOpts: boolean = false;    // 소스 콤보 옵션 표시 여부
  public isShowTgtComboOpts: boolean = false;    // 타겟 콤보 옵션 표시 여부

  get filteredSourceList() {
    const srchText: string = this.sourceSearchText.toLowerCase().trim();
    if ('' === srchText) {
      return this.relation.ui.source.uiFields;
    } else {
      return this.relation.ui.source.uiFields.filter(item => -1 < item.name.toLowerCase().indexOf(srchText));
    }
  } // get - filteredSourceList

  get filteredTargetList() {
    const srchText: string = this.targetSearchText.toLowerCase().trim();
    if ('' === srchText) {
      return this.relation.ui.target.uiFields;
    } else {
      return this.relation.ui.target.uiFields.filter(item => -1 < item.name.toLowerCase().indexOf(srchText));
    }
  } // get - filteredTargetList

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected broadCaster: EventBroadcaster,
              private datasourceService: DatasourceService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();

  }

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 연계 정보 생성
   * @param {BoardDataSourceRelation} relation
   */
  public addRelation(relation: BoardDataSourceRelation) {
    this._initializeComponent(relation);
    this._mode = 'ADD';
  } // function - addRelation

  /**
   * 연계 정보 수정
   * @param {BoardDataSourceRelation} relation
   */
  public editRelation(relation: BoardDataSourceRelation) {
    this._initializeComponent(relation);
    this._mode = 'EDIT';
  } // function - editRelation

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * isContainsSearchText
   * @param {string} searchText
   * @param {any[]} list
   * @return {boolean}
   */
  public isContainsSearchText(searchText: string, list: any[]): boolean {
    if (list) {
      return list.some(item => -1 < item.name.toLowerCase().indexOf(searchText.toLowerCase()));
    } else {
      return false;
    }
  } // function - isContainsSearchText

  /**
   * Highlight Text
   * @param {string} sourceText
   * @param {string} highlightText
   * @return {string}
   */
  public highlightText(sourceText: string, highlightText: string): string {
    if (sourceText) {
      return sourceText.replace(new RegExp('(' + highlightText + ')', 'gi'), '<span class="ddp-txt-search">$1</span>');
    } else {
      return sourceText;
    }
  } // function - highlightText

  /**
   * 설정 유효 여부
   * @return {boolean}
   */
  public isValid(): boolean {
    return !this.isNullOrUndefined(this.relation.ui.sourceField) && !this.isNullOrUndefined(this.relation.ui.targetField);
  } // function - isValid

  /**
   * 조인 정보를 생성한다.
   */
  public completeRelation() {
    if (this.isValid()) {
      if ('ADD' === this._mode) {
        this.broadCaster.broadcast('CREATE_BOARD_CREATE_REL', {relation: this.relation});
      } else if ('EDIT' === this._mode) {
        this.broadCaster.broadcast('CREATE_BOARD_UPDATE_REL', {relation: this.relation});
      }
      this._closeComponent();
    }
  } // function - completeRelation

  /**
   * 팝업을 닫는다.
   */
  public closePopup() {
    if ('ADD' === this._mode) {
      this._addCancelEvent.emit(this.relation.id);
    }
    this._closeComponent();
  } // function - closePopup

  /**
   * From Grid 헤더 클릭 이벤트 핸들러
   * @param {{id: string, isSelect: boolean}} data
   */
  public fromGridHeaderClickHandler(data: { id: string, isSelect: boolean }) {
    const $cols = this._$leftSide.find('.slick-header-column');
    $cols.css('backgroundColor', '');

    if (data.isSelect) {
      const colIdx: number = this.relation.ui.source.uiFields.findIndex(item => item.name === data.id);
      $cols.eq(colIdx).css('backgroundColor', '#d6d9f1');
      this.relation.ui.sourceField = this.relation.ui.source.uiFields[colIdx];
    } else {
      this.relation.ui.sourceField = null;
    }
  } // function - fromGridHeaderClickHandler

  /**
   * From Table 클릭 이벤트 핸들러
   * @param {string} columnId
   */
  public fromTableClickHandler(columnId: string) {
    const selectedField: Field = this.relation.ui.source.uiFields.find(item => item.id === columnId);
    if (this.relation.ui.sourceField && this.relation.ui.sourceField.id === selectedField.id) {
      this.relation.ui.sourceField = null;
    } else {
      this.relation.ui.sourceField = selectedField;
    }
  } // function - fromTableClickHandler

  /**
   * Select field from source datasource
   * @param {Field} field
   */
  public selectSourceField(field: Field) {
    this.isShowSrcComboOpts = false;
    this.relation.ui.sourceField = field;
    this.leftGrid.columnAllUnSelection();
    this.leftGrid.selectColumn(field.name, true);

    // scroll to target field
    const colIdx: number = this.relation.ui.source.uiFields.findIndex(item => item.name === field.name);
    if (-1 < colIdx) {
      this.leftGrid.grid.scrollCellIntoView(0, colIdx);
      this._$leftFieldList.scrollTop(colIdx * 30);

      const $cols = this._$leftSide.find('.slick-header-column');
      $cols.css('backgroundColor', '');
      $cols.eq(colIdx).css('backgroundColor', '#d6d9f1');
    }

  } // function - selectSourceField

  /**
   * Open search source field list in combobox
   */
  public openSearchSourceFields() {
    this.isShowSrcComboOpts = !this.isShowSrcComboOpts;
    this.sourceSearchText = '';
    this.safelyDetectChanges();
    this._sourceSearchText.nativeElement.focus();
    // this.sourceSearchText = '';
  } // function - openSearchSourceFields

  /**
   * Keyboard event handler to source field combo box
   * @param {KeyboardEvent} event
   */
  public sourceComboKeyEvent(event: KeyboardEvent) {

    const $currFocusItem = this._$sourceFieldCombo.find('li.sys-focus-item');

    switch (event.keyCode) {
      case 38 :
        // ArrowUP
        let $prev;
        if (0 === $currFocusItem.length) {
          $prev = this._$sourceFieldCombo.find('li:last');
        } else {
          $prev = $currFocusItem.prev('li');
          (0 === $prev.length) && ($prev = this._$sourceFieldCombo.find('li:last'));
        }

        $prev.addClass('sys-focus-item');
        $currFocusItem.removeClass('sys-focus-item');
        this._$sourceFieldCombo.scrollTop($prev.index() * 26);
        break;
      case 40 :
        // ArrowDown
        let $next;
        if (0 === $currFocusItem.length) {
          $next = this._$sourceFieldCombo.find('li:first');
        } else {
          $next = $currFocusItem.next('li');
          (0 === $next.length) && ($next = this._$sourceFieldCombo.find('li:first'));
        }

        $next.addClass('sys-focus-item');
        $currFocusItem.removeClass('sys-focus-item');
        this._$sourceFieldCombo.scrollTop($next.index() * 26);
        break;
      case 13 :
        // Enter
        $currFocusItem.trigger('click');
        $currFocusItem.removeClass('sys-focus-item');
        break;
    }
  } // function - sourceComboKeyEvent

  // noinspection JSMethodCanBeStatic
  /**
   * Mouse Hover event handler to source field combo box
   * @param {MouseEvent} event
   */
  public hoverSourceItem(event: MouseEvent) {
    const $target = $(event.currentTarget);
    $target.parent().find('.sys-focus-item').removeClass('sys-focus-item');
    $target.addClass('sys-focus-item');
  } // function - hoverSourceItem

  /**
   * Change view mode for source fields
   * @param {boolean} isGridMode
   */
  public changeViewModeSource(isGridMode: boolean) {
    this.isFromGridMode = isGridMode;
    this.safelyDetectChanges();
    if (this.relation.ui.sourceField) {
      this.selectSourceField(this.relation.ui.sourceField);
    }
  } // function - changeViewModeSource

  /**
   * To Grid 헤더 클릭 이벤트 핸들러
   * @param {{id: string, isSelect: boolean}} data
   */
  public toGridHeaderClickHandler(data: { id: string, isSelect: boolean }) {

    const $cols = this._$rightSide.find('.slick-header-column');
    $cols.css('backgroundColor', '');

    if (data.isSelect) {
      const colIdx: number = this.relation.ui.target.uiFields.findIndex(item => item.name === data.id);
      $cols.eq(colIdx).css('backgroundColor', '#d6d9f1');
      this.relation.ui.targetField = this.relation.ui.target.uiFields[colIdx];
    } else {
      this.relation.ui.targetField = null;
    }
  } // function - toGridHeaderClickHandler

  /**
   * To Table 클릭 이벤트 핸들러
   * @param {string} columnId
   */
  public toTableClickHandler(columnId: string) {
    const selectedField: Field = this.relation.ui.target.uiFields.find(item => item.id === columnId);
    if (this.relation.ui.targetField && this.relation.ui.targetField.id === selectedField.id) {
      this.relation.ui.targetField = null;
    } else {
      this.relation.ui.targetField = selectedField;
    }
  } // function - toTableClickHandler

  /**
   * Select field from target datasource
   * @param {Field} field
   */
  public selectTargetField(field: Field) {
    this.isShowTgtComboOpts = false;
    this.relation.ui.targetField = field;
    this.rightGrid.columnAllUnSelection();
    this.rightGrid.selectColumn(field.name, true);

    // scroll to target field
    const colIdx: number = this.relation.ui.target.uiFields.findIndex(item => item.name === field.name);
    if (-1 < colIdx) {
      this.rightGrid.grid.scrollCellIntoView(0, colIdx);
      this._$rightFieldList.scrollTop(colIdx * 30);

      const $cols = this._$rightSide.find('.slick-header-column');
      $cols.css('backgroundColor', '');
      $cols.eq(colIdx).css('backgroundColor', '#d6d9f1');
    }

  } // function - selectTargetField

  /**
   * Open search target field list in combobox
   */
  public openSearchTargetFields() {
    this.isShowTgtComboOpts = !this.isShowTgtComboOpts;
    this.targetSearchText = '';
    this.safelyDetectChanges();
    this._targetSearchText.nativeElement.focus();
    // this.targetSearchText = '';
  } // function - openSearchTargetFields

  /**
   * Keyboard event handler to target field combo box
   * @param {KeyboardEvent} event
   */
  public targetComboKeyEvent(event: KeyboardEvent) {

    const $currFocusItem = this._$targetFieldCombo.find('li.sys-focus-item');

    switch (event.keyCode) {
      case 38 :
        // ArrowUP
        let $prev;
        if (0 === $currFocusItem.length) {
          $prev = this._$targetFieldCombo.find('li:last');
        } else {
          $prev = $currFocusItem.prev('li');
          (0 === $prev.length) && ($prev = this._$targetFieldCombo.find('li:last'));
        }

        $prev.addClass('sys-focus-item');
        $currFocusItem.removeClass('sys-focus-item');
        this._$targetFieldCombo.scrollTop($prev.index() * 26);
        break;
      case 40 :
        // ArrowDown
        let $next;
        if (0 === $currFocusItem.length) {
          $next = this._$targetFieldCombo.find('li:first');
        } else {
          $next = $currFocusItem.next('li');
          (0 === $next.length) && ($next = this._$targetFieldCombo.find('li:first'));
        }

        $next.addClass('sys-focus-item');
        $currFocusItem.removeClass('sys-focus-item');
        this._$targetFieldCombo.scrollTop($next.index() * 26);
        break;
      case 13 :
        // Enter
        $currFocusItem.trigger('click');
        $currFocusItem.removeClass('sys-focus-item');
        break;
    }
  } // function - targetComboKeyEvent

  // noinspection JSMethodCanBeStatic
  /**
   * Mouse Hover event handler to target field combo box
   * @param {MouseEvent} event
   */
  public hoverTargetItem(event: MouseEvent) {
    const $target = $(event.currentTarget);
    $target.parent().find('.sys-focus-item').removeClass('sys-focus-item');
    $target.addClass('sys-focus-item');
  } // function - hoverTargetItem

  /**
   * Change view mode for target fields
   * @param {boolean} isGridMode
   */
  public changeViewModeTarget(isGridMode: boolean) {
    this.isToGridMode = isGridMode;
    this.safelyDetectChanges();
    if (this.relation.ui.targetField) {
      this.selectTargetField(this.relation.ui.targetField);
    }
  } // function - changeViewModeTarget

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 컴포넌트 닫기
   * @private
   */
  private _closeComponent() {
    this.isShowRelationPopup = false;
    this.relation = null;
  } // function - _closeComponent

  /**
   * 컴포넌트 초기화
   * @param {BoardDataSourceRelation} relation
   * @private
   */
  private _initializeComponent(relation: BoardDataSourceRelation) {
    this.relation = relation;
    this._queryLimit = 100;

    const sourceDataSource: BoardDataSource = this.relation.ui.source;
    const targetDataSource: BoardDataSource = this.relation.ui.target;

    // 데이터 조회
    this._queryData(sourceDataSource.engineName, sourceDataSource.temporary).then(data => {
      const grid: GridComponent = this.updateGrid(data[0], sourceDataSource.uiFields, 'left');
      if (relation.ui.sourceField) {
        grid.selectColumn(relation.ui.sourceField.name, true);
      }
      this.changeDetect.detectChanges();
    }).catch(err => this.commonExceptionHandler(err));

    this._queryData(targetDataSource.engineName, targetDataSource.temporary).then(data => {
      const grid: GridComponent = this.updateGrid(data[0], targetDataSource.uiFields, 'right');
      if (relation.ui.targetField) {
        grid.selectColumn(relation.ui.targetField.name, true);
      }
      this.changeDetect.detectChanges();
    }).catch(err => this.commonExceptionHandler(err));

    this.isShowRelationPopup = true;

    this.safelyDetectChanges();

    this._$sourceFieldCombo = $(this._sourceFieldCombo.nativeElement);
    this._$targetFieldCombo = $(this._targetFieldCombo.nativeElement);

    this._$leftSide = $(this._leftSide.nativeElement);
    this._$rightSide = $(this._rightSide.nativeElement);
    this._$leftFieldList = this._$leftSide.find('.ddp-wrap-scroll');
    this._$rightFieldList = this._$rightSide.find('.ddp-wrap-scroll');

  } // function - _initializeComponent

  /**
   * 데이터를 조회한다.
   * @param {string} dsName
   * @param {boolean} isTemporary
   * @param {boolean} loading
   * @return {Promise<[any , Field[]]>}
   * @private
   */
  private _queryData(dsName: string, isTemporary: boolean = false, loading: boolean = true): Promise<[any, Field[]]> {
    return new Promise<any>((res, rej) => {

      const params = new QueryParam();
      params.limits.limit = this._queryLimit;

      params.dataSource = new BoardDataSource();
      params.dataSource.type = 'default';
      params.dataSource.name = dsName;
      params.dataSource.temporary = isTemporary;

      (loading) && (this.loadingShow());
      this.datasourceService.getDatasourceQuery(params).then((data) => {
        let fieldList: Field[] = [];
        if (data && 0 < data.length) {
          fieldList = Object.keys(data[0]).map(keyItem => {
            const tempInfo = new Field();
            tempInfo.name = keyItem;
            return tempInfo;
          });
        }
        res([data, fieldList]);
        this.loadingHide();
      }).catch((err) => {
        rej(err);
        this.loadingHide();
      });
    });
  } // function - _queryData

  /**
   * 그리드 갱신
   * @param data
   * @param {Field[]} fields
   * @param {string} targetGrid
   * @return GridComponent
   */
  private updateGrid(data: any, fields: Field[], targetGrid: string = 'main'): GridComponent {

    // 헤더정보 생성
    const headers: Header[] = fields.map(
      (field: Field) => {
        /* 62 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth: number = Math.floor(pixelWidth(field.name, {size: 12})) + 62;
        return new SlickGridHeader()
          .Id(field.name)
          .Name(field.name)
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(false)
          .Sortable(false)
          .Formatter((_row, _cell, value, columnDef) => {
            if (columnDef.select) {
              return '<div style=\'background-color:#d6d9f1; position:absolute; top:0; left:0; right:0; bottom:0; line-height:30px; padding:0 10px;\'>'
                + ((value) ? value : '&nbsp;')
                + '</div>';
            } else {
              return value;
            }
          })
          .build();
      }
    );

    let rows: any[] = data;

    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }

    // 헤더 필수
    // 로우 데이터 필수
    // 그리드 옵션은 선택
    let grid: GridComponent;

    if (targetGrid === 'left') {
      grid = this.leftGrid;
    } else if (targetGrid === 'right') {
      grid = this.rightGrid;
    }

    grid.destroy();

    if (0 < headers.length) {
      grid.create(headers, rows, new GridOption()
        .EnableHeaderClick(true)
        .MultiSelect(false)
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .build()
      );

      if (0 === rows.length) {
        grid.invalidateAllRows();
        grid.elementRef.nativeElement.querySelector('.grid-canvas').innerHTML =
          '<div class="ddp-data-empty"><span class="ddp-data-contents">'
          + this.translateService.instant('msg.space.ui.no.data')
          + '</span></div>';
      }
    }

    return grid;

  } // function - updateGrid

}
