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
  Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../common/service/popup.service';
import { DatasetFile } from '../../../../domain/data-preparation/dataset';
import { Alert } from '../../../../common/util/alert.util';
import { PreparationAlert } from '../../../util/preparation-alert.util';
import { isUndefined } from 'util';
import { DatasetService } from '../../service/dataset.service';
import { FileLikeObject, FileUploader } from 'ng2-file-upload';
import { CookieConstant } from '../../../../common/constant/cookie.constant';
import { CommonConstant } from '../../../../common/constant/common.constant';
import { DomSanitizer } from '@angular/platform-browser';
import { GridComponent } from '../../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../../common/component/grid/grid.header';
import { Field } from '../../../../domain/datasource/datasource';
import * as pixelWidth from 'string-pixel-width';
import { GridOption } from '../../../../common/component/grid/grid.option';

@Component({
  selector: 'app-create-dataset-selectsheet',
  templateUrl: './create-dataset-selectsheet.component.html',
})
export class CreateDatasetSelectsheetComponent extends AbstractPopupComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  @ViewChild('fileUploadChange')
  private fileUploadChange: ElementRef;

  @Output()
  public typeEmitter = new EventEmitter<string>();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public datasetFile: DatasetFile;

  public rowData: string = '';

  public isCSV: boolean = false;

  // Column Delimiter - default value is comma
  public columnDelimiter : string = ',';

  // 파일 업로드
  public uploader: FileUploader;

  // 파일 업로드 결과
  public uploadResult;

  public allowFileType: string[] = ['text/csv'];

  public isChanged : boolean = false; // tell if uploaded file is changed

  // grid hide
  public clearGrid = true;

  // Change Detect
  public changeDetect: ChangeDetectorRef;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              public sanitizer: DomSanitizer) {

    super(elementRef, injector);

    this.uploader = new FileUploader(
      {
        url: CommonConstant.API_CONSTANT.API_URL + 'preparationdatasets/upload',
        // allowedFileType: this.allowFileType
      }
    );

    // 옵션 설정
    this.uploader.setOptions({
      url: CommonConstant.API_CONSTANT.API_URL
      + 'preparationdatasets/upload',
      headers: [
        { name: 'Accept', value: 'application/json, text/plain, */*' },
        {
          name: 'Authorization',
          value: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
        }
      ],
    });

    // add 가 처음
    this.uploader.onAfterAddingFile = (item) => {
      this.loadingShow();
      let ext = item.file.name.split('.')[1];
      if( ext !== 'csv' && false==ext.startsWith('xls') ) { // 윈도우에서 타입으로 파일 체크 불가 그래서 이름으로 ..
        this.uploader.clearQueue();
        this.fileUploadChange.nativeElement.value = ''; // 같은 파일은 연속으로 올리면 잡지 못해서 초기화
        Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
        this.loadingHide();
      } else{
        this.uploader.uploadAll();
      }
    };

    // add 할때 에러난다면
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      Alert.error(item.name + this.translateService.instant('msg.dp.alert.file.format.wrong'));
    };

    // 업로드 전 ..
    this.uploader.onBeforeUploadItem = (item) => {
      item.method = 'POST';
    };

    // 업로드 성공
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      const success = true;
      this.uploadResult = { success, item, response, status, headers };
    };

    // 업로드 하고 에러났을때
    this.uploader.onErrorItem = (item, response, status, headers) => {
      Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
      this.loadingHide();
    };

    // 마지막
    this.uploader.onCompleteAll = () => {
      const that: any = this;
      if (this.uploadResult && this.uploadResult.success) {
        // 업로드 완료 후
        console.info('Complete', this.uploadResult);
        this.isChanged = true;
        this.getDataFile();
      }
    };
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();

    if (this.datasetFile.sheets && this.datasetFile.sheets.length === 0) {
      this.isCSV = true;
      this.getDataFile();

    } else {
      this.datasetFile.sheetIndex = 0;

      if(this.datasetFile.delimiter) { // delimiter 를 바꾼게 있다면 그걸 사용한다
        this.columnDelimiter = this.datasetFile.delimiter;
      }

      if(0 === this.datasetFile.selectedSheets.length) { // 벌써 선택된 sheet가 있다면 converting 필요 없다
        this.convertSheet();
      }
      this.getDataFile();
    }

  }

  public ngOnChanges(changes: SimpleChanges) {

  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // Convert array to object
  public convertSheet() {
    // 초기화
    this.datasetFile.selectedSheets = [];

    // 배열로 받아온 데이터를 오브젝트로 변환한다
    this.datasetFile.sheets.filter((item) => {
      let temp = {
        name :'',
        selected : false // 처음엔 selected 된 것이 없기 떄문에
      };
      temp.name = item;
      this.datasetFile.selectedSheets.push(temp);
    });
  }


  // excel 시 sheet 아이디 세팅
  public setDataSetSheetIndex(event,sheetname, idx) {
    event.stopPropagation();
    this.isChanged = false;
    this.datasetFile.sheetname = sheetname;
    this.datasetFile.sheetIndex = idx;
    this.getDataFile();
  }

  // 다음
  public next() {

    // 입력 받은 delimiter를 보낸다
    this.datasetFile.delimiter = this.columnDelimiter.trim();

    if(isUndefined(this.datasetFile.delimiter) || this.datasetFile.delimiter.length ===0 ){
      this.columnDelimiter = '';
      Alert.warning(this.translateService.instant('msg.dp.alert.col.delim.required'));
      return;

    }

    this.typeEmitter.emit('FILE');
    this.popupService.notiPopup({
      name: 'create-dataset-name',
      data: null
    });

    // //sheet 가 없는 파일이거나 sheet가 있어도 한장일때
    // if (isUndefined(this.datasetFile.sheets) || 1 === this.datasetFile.sheets.length || 0 === this.datasetFile.sheets.length) {
    //   this.popupService.notiPopup({
    //     name: 'create-name',
    //     data: null
    //   });
    // }
    // //sheet 가 여러개 있을 때
    // else {
    //   const num = this.datasetFile.selectedSheets.filter((item) => {
    //     if (item.selected === true) {
    //       return item;
    //     }
    //   }).length;
    //
    //   // 선택된 sheet 가 없다
    //   if(0 === num) {
    //     Alert.warning(this.translateService.instant('msg.dp.alert.sel.sheet'));
    //     return;
    //   } else {
    //     this.popupService.notiPopup({
    //       name: 'create-name',
    //       data: null
    //     });
    //   }
    // }
  }

  // 이전
  public prev() {
    super.close();
    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }

  // 닫기 버튼
  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }

  // 업로드 한 파일 조회
  public getDataFile() {
    if (isUndefined(this.datasetFile)) {
      return;
    }
    // regex for line separator
    const regEx = /\n/g;

    if(this.isChanged) { // when uploaded file is changed
      const response: any = JSON.parse(this.uploadResult.response);
      this.datasetFile.filename = response.filename;
      this.datasetFile.filepath = response.filepath;
      this.datasetFile.sheets = response.sheets;
      if (response.sheets && response.sheets.length > 0) {
        this.datasetFile.sheetname = response.sheets[0];
        this.convertSheet();
      }
      this.datasetFile.filekey = response.filekey;
    }

    this.loadingShow();
    if (isUndefined(this.datasetFile.sheets) || 0==this.datasetFile.sheets.length) {
      // csv
      this.datasetService.getDatasetCSVFile(this.datasetFile).then((result) => {
        const temp: any = {};

        console.info('result' , result);
        temp.header = result.headers;
        temp.data = result.data;
        this.loadingHide();

        this.clearGrid = false;
        this.updateGrid(result.data , result.fields)
        if (result.success === false) {
          this.loadingHide();
          Alert.warning(this.translateService.instant('msg.dp.alert.file.format.wrong'));
          this.datasetFile = null;
          this.datasetFile = new DatasetFile();
          return;
        }
      })
        .catch((error) => {
                this.loadingHide();
                let prep_error = this.dataprepExceptionHandler(error);
                PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    /*
    if (isUndefined(this.datasetFile.sheets)) {
      // csv
      this.datasetService.getDatasetCSVFile(this.datasetFile).then((result) => {
        this.loadingHide();
        const temp: any = {};
        temp.header = result.headers;
        temp.data = result.data;
        this.clearGrid = true;
        this.datasetFile.sheetname = '';
        this.rowData = temp.data['0'][0]; // index 0,0에 파일 앞 250 바이트 들어있음
        this.rowData = this.rowData.replace(regEx,'<br>');
        // this.rowData = JSON.stringify(temp);
      })
        .catch((error) => {
                this.loadingHide();
                let prep_error = this.dataprepExceptionHandler(error);
                PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    } else if (this.datasetFile.sheets.length === 0) {
      // csv
      this.datasetService.getDatasetCSVFile(this.datasetFile).then((result) => {
        this.loadingHide();
        const temp: any = {};
        this.clearGrid = true;
        this.datasetFile.sheetname = '';
        temp.header = result.headers;
        temp.data = result.data;
        this.rowData = temp.data['0'][0]; // index 0,0에 파일 앞 250 바이트 들어있음
        this.rowData = this.rowData.replace(regEx,'<br>');
        // this.rowData = JSON.stringify(temp);
      })
        .catch((error) => {
                this.loadingHide();
                let prep_error = this.dataprepExceptionHandler(error);
                PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    */
    } else {
      // excel
      this.datasetService.getDatasetExcelFile(this.datasetFile).then((result) => {
        const temp: any = {};

        console.info('result' , result);
        temp.header = result.headers;
        temp.data = result.data;
        this.loadingHide();

        this.clearGrid = false;
        this.updateGrid(result.data , result.fields)
        // this.rowData = JSON.stringify(result.data);
        // json -> csv 스타일로 출력. grid로 출력하게 될지도 모름.
        // this.rowData = "";
        // if( 0<result.data.length ) {
        //   var keys = [];
        //   for(var k in result.fields) {
        //     keys.push(k['name']);
        //   }
        //   for(var d of result.data) {
        //     var vals = [];
        //     for(var v in d) {
        //       vals.push(d[v]);
        //     }
        //     if(this.rowData==="") {
        //         this.rowData = vals.join();
        //     } else {
        //         this.rowData = this.rowData + "<br>" + vals.join();
        //     }
        //   }
        // }
        if (result.success === false) {
          this.loadingHide();
          Alert.warning(this.translateService.instant('msg.dp.alert.file.format.wrong'));
          this.datasetFile = null;
          this.datasetFile = new DatasetFile();
          return;
        }
      }).catch((error) => {
              this.loadingHide();
              let prep_error = this.dataprepExceptionHandler(error);
              PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
    }
  }

  /**
   * Go to next stage with enter key
   * @param event Event
   */
  @HostListener('document:keydown.enter', ['$event'])
  public onEnterKeydownHandler(event: KeyboardEvent) {
    if(event.keyCode === 13 ) {
      this.next();
    }

  }

  /**
   * 헤더정보 얻기
   * @param {Field[]} fields
   * @returns {header[]}
   */
  private getHeaders(fields: Field[]) {
    return fields.map(
      (field: Field) => {

        /* 70 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth:number = Math.floor(pixelWidth(field.name, { size: 12 })) + 70;

        return new SlickGridHeader()
          .Id(field.name)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) + '"></em>' + field.name + '</span>')
          .Field(field.name)
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

  /**
   * grid 정보 업데이트
   * @param data
   * @param {Field[]} fields
   */
  private updateGrid(data: any, fields: Field[]) {
    // headers
    const headers: header[] = this.getHeaders(fields);
    // rows
    const rows: any[] = this.getRows(data);
    // grid 그리기
    this.drawGrid(headers, rows);
  }

  /**
   * 그리드 출력
   * @param {any[]} headers
   * @param {any[]} rows
   */
  private drawGrid(headers: any[], rows: any[]) {
    this.changeDetect.detectChanges();
    // 그리드 옵션은 선택
    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .build()
    );
  }

  /**
   * rows 얻기
   * @param data
   * @returns {any[]}
   */
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

  public getGridStyle(div?: any) {
    if( this.datasetFile.sheetname && ''!==this.datasetFile.sheetname) {
      return null;
    }
    return {'top':'0px'};
  }



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
