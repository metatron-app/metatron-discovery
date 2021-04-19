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
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {PopupService} from '@common/service/popup.service';
import {LineageService} from '../service/lineage.service';

@Component({
  selector: 'app-create-lineage-upload-file',
  templateUrl: './create-lineage-upload-file.component.html',
})
export class CreateLineageUploadFileComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public unsupportedFileView: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public lineageData: any;

  @Output()
  public lineageDataChange = new EventEmitter();

  public changeDetect: ChangeDetectorRef;

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
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * File Upload Cancel(Plupload)
   */
  public cancelUpload(_file) {
  }

  /**
   * File Upload Start(Plupload)
   */
  public startUpload() {
  }

  /**
   * Disable Drag and Drop in File list area
   */
  public disableEvent(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  /**
   * Next (confirm file)
   */
  public next() {
    if (this.lineageData) {
      this.popupService.notiPopup({
        name: 'confirm-grid',
        data: null
      });
    }
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

  public getLineageData(params: any) {
    this.loadingShow();

    this._lineageService.getLineageFile(params).then((result) => {
      this.loadingHide();

      let headerRow = null;
      let header = null;
      const rows = [];
      const gridResponse = result.gridResponses[0];
      gridResponse.rows.forEach((item) => {
        if (headerRow == null) {
          headerRow = item.objCols;
          header = item.objCols.filter((k) => k);
        } else {
          const row = {};
          header.forEach((k) => {
            const idx = headerRow.indexOf(k);
            row[k] = item.objCols[idx];
          });
          rows.push(row);
        }
      });

      this.lineageData = {};
      this.lineageData['header'] = header;
      this.lineageData['rows'] = rows;

      this.lineageDataChange.emit(this.lineageData);
      this.changeDetect.detectChanges();

    }).catch((error) => {
      this.loadingHide();
      this.commonExceptionHandler(error);
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

