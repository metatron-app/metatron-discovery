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
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BoardDataSource, BoardDataSourceRelation, QueryParam } from '../../../domain/dashboard/dashboard';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { Field } from '../../../domain/datasource/datasource';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { EventBroadcaster } from '../../../common/event/event.broadcaster';
import { isNull, isNullOrUndefined } from 'util';

@Component({
  selector: 'create-board-pop-relation',
  templateUrl: './create-board-pop-relation.component.html'
})
export class CreateBoardPopRelationComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('leftGrid')
  private leftGrid: GridComponent; // 조인 대상 원본 데이터 그리드

  @ViewChild('rightGrid')
  private rightGrid: GridComponent; // 조인할 데이터 그리드

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

  public sourceSearchText:string = '';          // 소스 필드 목록 검색
  public targetSearchText:string = '';          // 타겟 필드 목록 검색

  public isShowRelationPopup: boolean = false;  // Join Popup 표시 여부
  public isFromGridMode: boolean = true;        // From DataSource Grid 모드 여부
  public isToGridMode: boolean = true;          // To DataSource Grid 모드 여부
  public isShowSrcComboOpts:boolean = false;    // 소스 콤보 옵션 표시 여부
  public isShowTgtComboOpts:boolean = false;    // 타겟 콤보 옵션 표시 여부

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
   * 설정 유효 여부
   * @return {boolean}
   */
  public isValid(): boolean {
    return !isNullOrUndefined(this.relation.ui.sourceField) && !isNullOrUndefined(this.relation.ui.targetField);
  } // function - isValid

  /**
   * 조인 정보를 생성한다.
   */
  public completeRelation() {
    if (this.isValid()) {
      if ('ADD' === this._mode) {
        this.broadCaster.broadcast('CREATE_BOARD_CREATE_REL', { relation: this.relation });
      } else if ('EDIT' === this._mode) {
        this.broadCaster.broadcast('CREATE_BOARD_UPDATE_REL', { relation: this.relation });
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
    if (data.isSelect) {
      this.relation.ui.sourceField = this.relation.ui.source.uiFields.find(item => item.name === data.id);
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
   * 소스 데이터소스 필드 선택
   * @param {Field} field
   */
  public selectSourceField( field:Field ) {
    this.isShowSrcComboOpts = false;
    this.relation.ui.sourceField = field;
    this.leftGrid.columnAllUnSelection();
    this.leftGrid.selectColumn( field.name, true );
  } // function - selectSourceField

  /**
   * To Grid 헤더 클릭 이벤트 핸들러
   * @param {{id: string, isSelect: boolean}} data
   */
  public toGridHeaderClickHandler(data: { id: string, isSelect: boolean }) {
    if (data.isSelect) {
      this.relation.ui.targetField = this.relation.ui.target.uiFields.find(item => item.name === data.id);
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
   * 타겟 데이터소스 필드 선택
   * @param {Field} field
   */
  public selectTargetField( field:Field ) {
    this.isShowTgtComboOpts = false;
    this.relation.ui.targetField = field;
    this.rightGrid.columnAllUnSelection();
    this.rightGrid.selectColumn( field.name, true );
  } // function - selectTargetField


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
    const headers: header[] = fields.map(
      (field: Field) => {
        /* 62 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth: number = Math.floor(pixelWidth(field.name, { size: 12 })) + 62;
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
          .Formatter((row, cell, value, columnDef) => {
            if (!isNull(value) && columnDef.select) {
              return '<div style=\'background-color:#d6d9f1; position:absolute; top:0; left:0; right:0; bottom:0; line-height:30px; padding:0 10px;\'>' + value + '</div>';
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
