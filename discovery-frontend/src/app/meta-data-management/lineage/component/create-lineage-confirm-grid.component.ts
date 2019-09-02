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

import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, Output, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {PopupService} from '../../../common/service/popup.service';
import {CommonConstant} from '../../../common/constant/common.constant';
import {CookieConstant} from '../../../common/constant/cookie.constant';
import {isUndefined} from 'util';
import {GridComponent} from '../../../common/component/grid/grid.component';
import {GridOption} from '../../../common/component/grid/grid.option';
import {header, SlickGridHeader} from '../../../common/component/grid/grid.header';
import {DeleteModalComponent} from '../../../common/component/modal/delete/delete.component';
import {Modal} from '../../../common/domain/modal';
import * as _ from 'lodash';
import {Alert} from "../../../common/util/alert.util";
import {saveAs} from 'file-saver';
import {LineageService} from '../service/lineage.service';
import {LineageEdge} from '../../../domain/meta-data-management/lineage';

declare let plupload: any;

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

  private isWell: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public lineageData: any;

  @Input()
  public step: string;

  public errorView: boolean = false;
  public errorMsg: string = null;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor( private popupService: PopupService,
              private lineageService: LineageService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();

    this.isWell = false;

    this.setData();
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

  public downloadSample() {
    let downloadFileName = "lineage_sample.csv"
    this.lineageService.downloadSample().subscribe((sampleFile) => {
      saveAs(sampleFile, downloadFileName);
    });
  }

  public prev() {
    this.popupService.notiPopup({
      name: 'upload-file',
      data: null
    });
  }

  public complete() {
    let params = this.lineageData.rows;

    this.lineageService.createLineages(params).then((result) => {
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

  private setData() {
    if(this.lineageData) {
      this.updateGrid(this.lineageData);

      this.isWell = this.checkData( this.lineageData );
    }
  }

  private updateGrid(data: any) {
    if(this.gridComponent===undefined || this.gridComponent===null) { return; }

    // 헤더정보 생성
    const headers: header[] = data.header.map((column: any) => {
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
        .Formatter((function (scope) {
          return function (row, cell, value) {
            return value;
          };
        })(this))
        .build();
    });

    let rows: any[] = data.rows.map((values: any, index: number) => {
      let row : any = {};
      row.id = index;
      for(var key in values) {
        row[key] = values[key];
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

  private checkData(data: any) : boolean {
    var ret :boolean = false;
    if(data===undefined || data===null) { return ret; }

    var frMetaIdIndex = -1;
    var frMetaNameIndex = -1;
    var toMetaIdIndex = -1;
    var toMetaNameIndex = -1;

    var useMetaId = false;
    var useMetaName = false;

    var rowCount = 0;

    data.header.map((column: any, index:number) => {
      if(column==='frMetaId') { frMetaIdIndex = index; }
      else if(column==='frMetaName') { frMetaNameIndex = index; }
      else if(column==='toMetaId') { toMetaIdIndex = index; }
      else if(column==='toMetaName') { toMetaNameIndex = index; }
    });

    if(frMetaIdIndex!=-1 && toMetaIdIndex!=-1) {
      useMetaId = true;
    } else if(frMetaNameIndex!=-1 && toMetaNameIndex!=-1) {
      useMetaName = true;
    }

    data.rows.map((values: any, index: number) => {
      if( values['frMetaId']&&values['toMetaId']) {
        rowCount++;
      } else if(values['frMetaName']&&values['toMetaName']) {
        rowCount++;
      }
    });

    if( frMetaNameIndex===-1 || toMetaNameIndex===-1 ) {
      if( frMetaIdIndex===-1 || toMetaIdIndex===-1 ) {
        this.errorMsg = `'frMetaName' and 'toMetaName' are required`;
        this.errorView = true;
        ret = false;
      }
    } else if( data.rows.length!==rowCount ) {
      this.errorMsg = `total ${data.rows.length!} rows, but ${rowCount} rows are right`;
      this.errorView = true;
      ret = false;
    } else {
      this.errorMsg = null;
      this.errorView = false;
      ret = true;
    }

    return ret;
  }

}

