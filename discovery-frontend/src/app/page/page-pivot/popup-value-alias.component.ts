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
  EventEmitter,
  HostListener,
  Injector,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {GridComponent} from '../../common/component/grid/grid.component';
import {GRID_EDIT_TYPE, header, SlickGridHeader} from '../../common/component/grid/grid.header';
import {GridOption} from '../../common/component/grid/grid.option';
import {Field, FieldValueAlias} from '../../domain/datasource/datasource';
import {DatasourceAliasService} from '../../datasource/service/datasource-alias.service';
import {DatasourceService} from '../../datasource/service/datasource.service';
import {BoardDataSource} from '../../domain/dashboard/dashboard';
import * as _ from 'lodash';
import {DashboardUtil} from '../../dashboard/util/dashboard.util';

@Component({
  selector: 'popup-value-alias',
  templateUrl: './popup-value-alias.component.html'
})
export class PopupValueAliasComponent extends AbstractComponent {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // slick grid
  @ViewChild('gridArea')
  private gridComponent: GridComponent;

  // 수정 여부
  private _isEdit: boolean = false;

  // 그리드 데이터
  private _gridData: { field: string, alias: string }[] = [];

  // alias 정보
  private _fieldValueAlias: FieldValueAlias;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 팝업 show / hide
  public showFl: boolean;

  // 선택된 필트값
  public selectedField: Field;

  @Output('changeAlias')
  public changeAliasEvent: EventEmitter<FieldValueAlias> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private aliasService: DatasourceAliasService,
              private datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 최초 데이터 설정시
   * @param {Field} field
   * @param {BoardDataSource} dataSource
   * @param {FieldValueAlias} fieldValueAlias
   */
  public init(field: Field, dataSource: BoardDataSource, fieldValueAlias: FieldValueAlias) {

    // 선택된 필드값 설정
    this.selectedField = field;

    // dataSourceAlias에 tempData 설정
    if (fieldValueAlias) {
      // 기존에 설정된 값이 있을 경우
      this._isEdit = true;
      this._fieldValueAlias = fieldValueAlias;
      this._setGrid(fieldValueAlias);
    } else {
      // 신규 설정일 경우
      this._isEdit = false;
      const valueAlias: FieldValueAlias = new FieldValueAlias();
      valueAlias.dataSourceId = field.dsId;
      valueAlias.dashBoardId = field.boardId;
      valueAlias.fieldName = field.name;
      this._fieldValueAlias = valueAlias;
      const param = {
        dataSource : DashboardUtil.getDataSourceForApi(_.cloneDeep(dataSource)),
        targetField: { alias: field.alias, type: 'dimension', name: field.name }
      };
      this.loadingShow();
      this.datasourceService.getCandidate(param).then((result) => {
        const valueAlias = {};
        if (result && 0 < result.length) {
          result.forEach(item => {
            valueAlias[item.field] = item.field;
          });
        }
        this._fieldValueAlias.valueAlias = valueAlias;
        // 그리드 설정
        this._setGrid(this._fieldValueAlias);
        this.loadingHide();
      }).catch(() => {

        this.loadingHide();
      });
    }
  } // function - init

  /**
   * done 버튼 클릭시
   */
  public done() {
    if (this.gridComponent) {
      $(this.gridComponent.grid.getActiveCellNode()).removeClass('ddp-selected');
      this.gridComponent.grid.getEditorLock().commitCurrentEdit();
    }

    // 그리드 데이터를 valueAlias 로 변환
    this._gridData.forEach(item => {
      this._fieldValueAlias.valueAlias[item.field] = item.alias;
    });

    this.loadingShow();
    if (this._isEdit) {
      this.aliasService.updateAliases(this._fieldValueAlias.id, this._fieldValueAlias).then(item => {
        this.selectedField.valueAlias = <FieldValueAlias>item;
        this.changeAliasEvent.emit(<FieldValueAlias>item);
        this.showFl = false;
        this.loadingHide();
      });
    } else {
      this.aliasService.createAliases(this._fieldValueAlias).then(item => {
        this.selectedField.valueAlias = <FieldValueAlias>item;
        this.changeAliasEvent.emit(<FieldValueAlias>item);
        this.showFl = false;
        this.loadingHide();
      });
    }
  } // function - done

  public resetAll() {
    this._setGrid(this._fieldValueAlias);
  }

  @HostListener('click', ['$event.target'])
  public clickOther(target) {
    if (this.gridComponent) {
      const $eventTarget:JQuery = $( target );
      if( !$eventTarget.hasClass( 'ui-widget-content' ) && 0 === $eventTarget.closest( '.ui-widget-content' ).length ) {
        this.gridComponent.resetActiveCell();
      }
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 그리드 설정
   * @param {FieldValueAlias} aliasData
   * @private
   */
  private _setGrid(aliasData: FieldValueAlias) {

    // 팝업 show
    this.showFl = true;

    this.changeDetect.detectChanges();

    this.gridComponent.destroy();

    // 필드 정보 grid 형식의 데이터로 변환
    const data = [];
    for (let key in aliasData.valueAlias) {
      let value = {};
      value['field'] = key;
      value['alias'] = aliasData.valueAlias[key];
      data.push(value);
    }
    this._gridData = data;

    // header 설정
    const valueMsg = this.translateService.instant('msg.board.datasource.alias.for.value.header.value');
    const forValueMsg = this.translateService.instant('msg.board.datasource.alias.for.value.title');
    const headers: header[] = [];
    headers.push(new SlickGridHeader()
      .Id('field')
      .Name(valueMsg)
      .Field('field')
      .CssClass('ddp-tleft')
      // .Behavior('select')
      .Width(429)
      .CannotTriggerInsert(true)
      .Focusable(false)
      .Sortable(true)
      .build());
    headers.push(new SlickGridHeader()
      .Id('alias')
      .Name(forValueMsg)
      .Field('alias')
      .CssClass('ddp-tleft')
      // .Behavior('select')
      .Editor(GRID_EDIT_TYPE.TEXT)
      .Width(429)
      .CannotTriggerInsert(true)
      .Sortable(true)
      .build());

    // grid 생성
    this.gridComponent.create(
      headers,
      data,
      new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .CellExternalCopyManagerActivate(true)
        .SelectedCellCssClass('ddp-selected')
        .Editable(true)
        .build()
    );
  } // function - _setGrid
}
