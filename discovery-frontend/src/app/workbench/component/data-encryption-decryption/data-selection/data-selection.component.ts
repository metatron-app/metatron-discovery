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

import {AbstractPopupComponent} from '../../../../common/component/abstract-popup.component';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {DataEncryptionDecryptionService} from '../service/data-encryption-decrytion.service';
import {GridComponent} from '../../../../common/component/grid/grid.component';
import {header, SlickGridHeader} from '../../../../common/component/grid/grid.header';
import {DataEncryptionDecryptionContext, DataSet} from '../data-encryption-decryption.component';
import * as pixelWidth from 'string-pixel-width';
import {GridOption} from '../../../../common/component/grid/grid.option';
import {StringUtil} from '../../../../common/util/string.util';
import {Alert} from '../../../../common/util/alert.util';

@Component({
             selector: 'app-data-selection',
             templateUrl: './data-selection.component.html'
           })
export class DataSelectionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  public clearGrid = true;

  @Input()
  public step: string;

  @Input()
  public context: DataEncryptionDecryptionContext;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  public columns: string[] = [];
  public transformTypes: any[] = [
    {type: "dec/imsi/imsi", name: "IMSI(암호화)->IMSI(복호화)"},
    {type: "dec/imsi/mdn", name: "IMSI(암호화)->MDN(복호화)"},
    {type: "dec/imsi/svrcd", name: "IMSI(암호화)->SVRCD(복호화)"},
    {type: "enc/imsi/imsi", name: "IMSI(복호화)->IMSI(암호화)"},
    {type: "enc/mdn/imsi", name: "MDN(복호화)->IMSI(암호화)"},
    {type: "enc/svrcd/imsi", name: "SVCD(복호화)->IMSI(암호화)"}];

  public selectedColumn: string = "";
  public selectedTransformType: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataEncryptionDecryptionService: DataEncryptionDecryptionService,
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
    // ui 초기화
    this.initView();

  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public prev() {
    this.step = 'identity-verification';
    this.stepChange.emit(this.step);
  }

  public isEnableNext(): boolean {
    if(StringUtil.isNotEmpty(this.selectedColumn) && this.selectedTransformType && StringUtil.isNotEmpty(this.selectedTransformType.type)) {
      return true;
    } else {
      return false;
    }
  }

  public next() {
    if (this.isEnableNext()) {
      const request = {
        cipherType: this.selectedTransformType.type,
        cipherFieldName: this.selectedColumn,
        identityVerificationId: this.context.identityVerificationId,
        csvFile: this.context.originalDataSet.csvFilePath,
        fields: this.context.originalDataSet.fields,
      };
      this.loadingShow();
      this.dataEncryptionDecryptionService.encryptOrDecrypt(request).then((result) => {
        this.loadingHide();
        this.context.transformDataSet = new DataSet(result.csvFileName, result.data, result.fields);
        this.step = 'encryption-decryption-completion';
        this.stepChange.emit(this.step);
      }).catch(() => {
        this.loadingHide();
        Alert.error("압복화에 실패 했습니다.");
      });
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init view
   */
  private initView() {
    this.clearGrid = false;
    this.context.transformDataSet = null;
    // headers
    const headers: header[] = this.getHeaders(this.context.originalDataSet.fields.map((field => field.name)));
    // rows
    const rows: any[] = this.getRows(this.context.originalDataSet.data);
    // grid 그리기
    this.drawGrid(headers, rows);
    this.columns = this.context.originalDataSet.fields.map((field => field.name));
  }

  private getHeaders(fields: string[]) {
    return fields.map(
      (field: string) => {
        /* 70 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth: number = Math.floor(pixelWidth(field, {size: 12})) + 70;

        return new SlickGridHeader()
          .Id(field)
          .Name('<span style="padding-left:20px;">' + field + '</span>')
          .Field(field)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      }
    );
  }

  private getRows(data: any) {
    let rows: any[] = data;
    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return rows;
  }

  private drawGrid(headers: any[], rows: any[]) {
    // 그리드 옵션은 선택
    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .build()
    );
    this.changeDetect.detectChanges();
  }
}
