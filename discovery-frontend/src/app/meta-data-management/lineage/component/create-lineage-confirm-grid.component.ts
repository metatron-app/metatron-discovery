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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {PopupService} from '@common/service/popup.service';
import {GridComponent} from '@common/component/grid/grid.component';
import {GridOption} from '@common/component/grid/grid.option';
import {Header, SlickGridHeader} from '@common/component/grid/grid.header';
import {Alert} from '@common/util/alert.util';
import {LineageService} from '../service/lineage.service';

@Component({
  selector: 'app-create-lineage-confirm-grid',
  templateUrl: './create-lineage-confirm-grid.component.html',
})
export class CreateLineageConfirmGridComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('previewGrid')
  private gridComponent: GridComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public lineageData: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private _lineageService: LineageService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();

    if (this.lineageData) {
      this.updateGrid(this.lineageData);
    }
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*
  public ngOnChanges(changes: any) {
    if(changes.lineageData) {
      console.log(changes.lineageData);
    }
  }
  */

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public prev() {
    this.popupService.notiPopup({
      name: 'upload-file',
      data: null
    });
  }

  public complete() {
    const params = this.lineageData.rows;
    for (const edge of params) {
      if (!edge.frMetaId && !edge.frMetaName) {
        Alert.error('frMetaId or frMetaName is required');
        return;
      }
      if (!edge.toMetaId && !edge.toMetaName) {
        Alert.error('toMetaId or toMetaName is required');
        return;
      }
    }

    this._lineageService.createLineages(params).then(() => {
      this.loadingHide();

      this.popupService.notiPopup({
        name: 'complete-lineage-create',
        data: null
      });
    }).catch((error) => {
      this.loadingHide();
      this.commonExceptionHandler(error);
    });
  }

  /**
   * Close Imported Popup
   */
  public close() {
    super.close();
    this.popupService.notiPopup({
      name: 'close',
      data: null
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private updateGrid(data: any) {
    if (this.gridComponent === undefined || this.gridComponent === null) {
      return;
    }


    // 헤더정보 생성
    const headers: Header[] = data.header.map((column: any) => {
      return new SlickGridHeader()
        .Id(column)
        .Name('<span style="padding-left:20px;">' + column + '</span>')
        .Width(133)
        .Field(column)
        .Behavior('select')
        .Selectable(false)
        .CssClass('cell-selection')
        .Resizable(true)
        .Unselectable(true)
        .Sortable(false)
        .Formatter(((_scope) => {
          return (_row, _cell, value) => {
            return value;
          };
        })(this))
        .build();
    });

    const rows: any[] = data.rows.map((values: any, index: number) => {
      const row: any = {};
      row.id = index;
      for (const key in values) {
        if (key) {
          row[key] = values[key];
        }
      }
      return row;
    });

    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .NullCellStyleActivate(true)
      .EnableColumnReorder(false)
      .build()
    );
  }
}

