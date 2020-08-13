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
import {DataEncryptionDecryptionContext, DataSet} from '../data-encryption-decryption.component';
import {GridComponent} from '../../../../common/component/grid/grid.component';
import {header, SlickGridHeader} from '../../../../common/component/grid/grid.header';
import {GridOption} from '../../../../common/component/grid/grid.option';
import * as pixelWidth from 'string-pixel-width';
import {Alert} from '../../../../common/util/alert.util';
import {saveAs} from 'file-saver';

@Component({
             selector: 'app-encryption-decryption-completion',
             templateUrl: './encryption-decryption-completion.component.html'
           })
export class EncryptionDecryptionCompletionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
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
  public step: string;

  @Input()
  public context: DataEncryptionDecryptionContext;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

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
    this.step = 'data-selection';
    this.stepChange.emit(this.step);
  }

  public download() {
    const request = {
      queryEditorId: this.context.queryEditorId,
      originalFileName: this.context.originalDataSet.csvFilePath,
      transformFileName: this.context.transformDataSet.csvFilePath,
    };

    this.loadingShow();
    this.dataEncryptionDecryptionService.downloadFile(request).then((result) => {
      this.loadingHide();
      saveAs(result, this.context.transformDataSet.csvFilePath);
    }).catch(() => {
      this.loadingHide();
      Alert.error("파일 다운로드에 실패 했습니다.");
    });
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
    // headers
    const headers: header[] = this.getHeaders(this.context.transformDataSet.fields.map((field => field.name)));
    // rows
    const rows: any[] = this.getRows(this.context.transformDataSet.data);
    // grid 그리기
    this.drawGrid(headers, rows);
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
