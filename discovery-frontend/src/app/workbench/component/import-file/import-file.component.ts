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
  Output,
  ViewChild
} from '@angular/core';
import * as pixelWidth from 'string-pixel-width';
import {AbstractPopupComponent} from "../../../common/component/abstract-popup.component";
import {GridComponent} from "../../../common/component/grid/grid.component";
import {FileLikeObject, FileUploader} from "ng2-file-upload";
import {CommonConstant} from "../../../common/constant/common.constant";
import {CookieConstant} from "../../../common/constant/cookie.constant";
import {Alert} from "../../../common/util/alert.util";
import {isUndefined} from "util";
import {GridOption} from "../../../common/component/grid/grid.option";
import {header, SlickGridHeader} from "../../../common/component/grid/grid.header";
import {WorkbenchService} from "../../service/workbench.service";
import {CommonUtil} from "../../../common/util/common.util";
import {StringUtil} from "../../../common/util/string.util";

@Component({
  selector: 'app-import-file',
  templateUrl: './import-file.component.html',
})
export class ImportFileComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public workbenchId: string = '';

  @Input()
  public webSocketId: string = '';

  @Output()
  importSucceed = new EventEmitter<void>();

  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  // 업로드 결과
  private uploadResult: any;

  public importingTableName: string = '';
  public errMsgImportingTableName: string = '';
  public isInvalidImportingTableName: boolean = false;
  public importFile: ImportFile;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Change Detect
  public changeDetect: ChangeDetectorRef;


  // 파일 업로드
  public uploader: FileUploader;
  // 파일 업로드 가능한 확장자 명
  public allowFileType: string[];

  // 그리드 row
  public rowNum: number = 100;

  // csv 파일 구분자
  public delimiter: string = ',';
  // csv 파일 줄바꿈자
  public separator: string = '\\n';
  // 임의의 헤드컬럼 생성여부
  public createHeadColumnFl: boolean = false;

  // flag
  public typeShowFl: boolean = false;

  // grid hide
  public clearGrid = true;

  public selectedSheetName: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workbenchService: WorkbenchService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

    this.uploader = new FileUploader(
      {
        url: CommonConstant.API_CONSTANT.API_URL + 'common/file',
        //allowedFileType: this.allowFileType
      }
    );
    // post
    this.uploader.onBeforeUploadItem = (item) => {
      item.method = 'POST';
    };
    // set option
    this.uploader.setOptions({
      url: CommonConstant.API_CONSTANT.API_URL
      + 'common/file',
      headers: [
        { name: 'Accept', value: 'application/json, text/plain, */*' },
        {
          name: 'Authorization',
          value: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
        }
      ],
    });

    // 지원하지 않는 파일 형식일 경우
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      Alert.error(this.translateService.instant('msg.storage.alert.file.import.error'));
    };

    // 업로드 성공
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      const success = true;
      this.uploadResult = { success, item, response, status, headers };
    };
    // 업로드 완료후 작동
    this.uploader.onCompleteAll = () => {
      if (this.uploadResult && this.uploadResult.success) {
        this.getFileData();
      }
    };

    // 에러 처리
    this.uploader.onErrorItem = (item, response, status, headers) => {
      // response 데이터
      const result: any = JSON.parse(response);
      // 데이터 초기화
      this.uploadResult = null;
      // 파일 업로드 에러 처리
      Alert.error(result.details);
      // loading hide
      this.loadingHide();
    };

    this.uploader.onAfterAddingFile = (item) => {
      this.loadingShow();
      this.uploader.uploadAll();
    };

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();

    // init view
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

  public done() {
    if (this.getDoneValidation()) {
      if(this.validateColumnNames() == false) {
        Alert.error(this.translateService.instant('msg.bench.alert.invalid-hive-name-rule', {
          value: 'Column'
        }));
        return;
      }

      const params = {
        tableName: this.importingTableName.trim(),
        firstRowHeadColumnUsed: !this.createHeadColumnFl,
        filePath: this.importFile.filepath,
        loginUserId: CommonUtil.getLoginUserId(),
        webSocketId: this.webSocketId
      };

      if(this.isExcelFile()) {
        params['type'] = 'excel';
        params['sheetName'] = this.selectedSheetName;
      } else {
        params['type'] = 'csv';
        if(this.separator) {
          params['lineSep'] = (this.separator + '').replace(/\\n/gi, '\n').replace(/\\r/gi, '\r').replace(/\\t/gi, '\t');
        }
        if(this.delimiter) {
          params['delimiter'] = (this.delimiter + '').replace(/\\n/gi, '\n').replace(/\\r/gi, '\r').replace(/\\t/gi, '\t');
        }
      }

      this.loadingShow();
      this.workbenchService.importFile(this.workbenchId, params)
        .then((response) => {
          this.loadingHide();
          Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
          this.importSucceed.emit();
          this.close();
        }).catch((error) => {
        this.loadingHide();
        console.log(error);
        if(error.code) {
          switch (error.code) {
            case "WB0004":
              Alert.error(this.translateService.instant('msg.bench.alert.already-exists-table'));
              break;
            default:
              this.commonExceptionHandler(error);
          }
        } else {
          this.commonExceptionHandler(error);
        }
      });
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 파일 이름
   * @returns {string}
   */
  public get getFileName(): string {
    return this.importFile.filename;
  }

  /**
   * 파일 size
   * @returns {number}
   */
  public get getFileSize(): number {
    return this.importFile.fileSize;
  }

  /**
   * 시트 데이터
   * @returns {any[]}
   */
  public get getSheets(): any[] {
    return this.importFile.sheets;
  }

  /**
   * 필드 데이터
   * @returns {any[]}
   */
  public getFields(): any[] {
    return this.importFile.filename && this.importFile.fields;
  }

  /**
   * 선택한 시트 이름
   * @returns {string}
   */
  public get getSelectedSheetName(): string {
    return this.selectedSheetName;
  }

  /**
   * 컬럼 length
   * @returns {number}
   */
  public get getColumnLength() {
    return this.getFields().length;
  }

  /**
   * row length
   * @returns {number}
   */
  public getRowLength() {
    return this.importFile.totalRows;
  }

  /**
   * 다음페이지로 가기위한 validation
   * @returns {boolean}
   */
  public getDoneValidation(): boolean {
    if (StringUtil.isEmpty(this.importingTableName)) {
      this.isInvalidImportingTableName = true;
      this.errMsgImportingTableName = this.translateService.instant('msg.common.ui.required');
      return false;
    } else {
      if(StringUtil.isAlphaNumericUnderscore(this.importingTableName) === false) {
        this.isInvalidImportingTableName = true;
        this.errMsgImportingTableName = this.translateService.instant('msg.bench.alert.invalid-hive-name-rule', {
          value: 'Table'
        });
        return false;
      }
    }

    this.isInvalidImportingTableName = false;

    // 선택한 파일이 존재하는지
    if (this.importFile.filename
      && this.importFile.fields
      && !this.clearGrid) {
      return true;
    }

    return false;
  }

  public validateColumnNames(): boolean {
    let validate = true;
    this.importFile.fields.forEach(field => {
      if(StringUtil.isAlphaNumericUnderscore(field) == false) {
        validate = false;
      }
    });
    return validate;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - validation
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 파일이 CSV 파일인지 확인
   * @returns {boolean}
   */
  public isCsvFile(): boolean {
    return this.importFile && this.importFile.isCsvFile();
  }

  /**
   * 파일이 엑셀 파일인지 확인
   * @returns {boolean}
   */
  public isExcelFile(): boolean {
    return this.importFile && this.importFile.isExcelFile();
  }

  /**
   * 선택한 시트인지 확인
   * @param sheetName
   * @returns {boolean}
   */
  public isSelectedSheet(sheetName): boolean {
    return this.selectedSheetName === sheetName;
  }

  /**
   * 파일 업로드 성공여부
   * @returns {boolean}
   */
  public isSuccessFileUpload(): boolean {
    return (this.importFile && this.importFile.filekey && !isUndefined(this.importFile.filekey));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 시트 선택 이벤트
   * @param sheetName
   */
  public onSelectedSheet(sheetName) {
    // 시트이름 저장
    this.selectedSheetName = sheetName;
    // file data 조회
    this.getFileData();
  }

  /**
   * 헤드컬럼 선택이벤트
   */
  public onClickCreateHeadColumn() {
    // 헤드컬럼 플래그 변경
    this.createHeadColumnFl = !this.createHeadColumnFl;
    // file data 조회
    this.getFileData();
  }

  /**
   * row 변경 이벤트
   */
  public onChangeRowNum() {
    // row num이 총 row 보다 클경우 변경
    if (this.rowNum > this.getRowLength()) {
      this.rowNum = this.getRowLength();
    }

    // file data 조회
    this.getFileData();
  }

  /**
   * 구분자 변경 이벤트
   * @param {KeyboardEvent} event
   */
  public onChangeDelimiter(event?: KeyboardEvent) {
    // 엔터 일때만 입력
    if (event && 13 !== event.keyCode) {
      return;
    }
    // file data 조회
    this.getFileData();
  }

  /**
   * 줄바꿈 문자 변경
   * @param {KeyboardEvent} event
   */
  public onChangeSeparator(event?: KeyboardEvent) {
    // 엔터 일때만 입력
    if (event && 13 !== event.keyCode) {
      return;
    }
    // file data 조회
    this.getFileData();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


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
   * grid 정보 업데이트
   * @param data
   * @param {Field[]} fields
   */
  private updateGrid(data: any, fields: string[]) {
    // headers
    const headers: header[] = this.getHeaders(fields);
    // rows
    const rows: any[] = this.getRows(data);
    // grid 그리기
    this.drawGrid(headers, rows);
  }

  /**
   * 헤더정보 얻기
   * @param {Field[]} fields
   * @returns {header[]}
   */
  private getHeaders(fields: string[]) {
    return fields.map(
      (field: string) => {

        /* 70 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth:number = Math.floor(pixelWidth(field, { size: 12 })) + 70;

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * 파일 데이터 가져오기
   */
  private getFileData() {
    // grid hide
    this.clearGrid = true;

    // 로딩 show
    this.loadingShow();
    // 파일 조회
    this.workbenchService.getPreviewImportFile(this.workbenchId, JSON.parse(this.uploadResult.response).filekey, this.getDatasourceFileParams(this.isCsvFile()))
      .then((result) => {
        // 로딩 hide
        this.loadingHide();

        if (result['success'] === false) {
          Alert.warning(this.translateService.instant('msg.storage.alert.file.import.error'));
          return;
        }

        this.importFile = new ImportFile();
        this.importFile.filename = this.uploadResult.item.file.name;
        this.importFile.fileSize = this.uploadResult.item.file.size;
        this.importFile.filepath = JSON.parse(this.uploadResult.response).filePath;
        this.importFile.filekey = JSON.parse(this.uploadResult.response).filekey;
        this.importFile.fields = result.fields;
        this.importFile.records = result.records;
        this.importFile.totalRows = result.totalRecords;

        if(result.sheets) {
          this.importFile.fileType = 'text/excel';
          this.importFile.sheets = result.sheets;
          if(this.selectedSheetName === '') {
            this.selectedSheetName = result.sheets[0];
          }
        } else {
          this.importFile.fileType = 'text/csv';
        }

        this.clearGrid = false;
        // grid 출력
        this.updateGrid(result.records, result.fields);

        // 기본 데이터베이스 테이블명 설정
        if(this.importFile.filename) {
          if(this.importFile.isCsvFile()) {
            this.importingTableName = this.importFile.filename.substring(0, this.importFile.filename.indexOf(".csv"));
            this.isInvalidImportingTableName = false;
          } else if(this.selectedSheetName) {
            this.importingTableName = this.selectedSheetName;
            this.isInvalidImportingTableName = false;
          }
        }
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 파일 조회 파라메터
   * @param {boolean} isCsvFile
   * @returns {{limit: number; firstHeaderRow: boolean}}
   */
  private getDatasourceFileParams(isCsvFile:boolean) {
    const params = {
      limit: this.rowNum,
      firstHeaderRow: !this.createHeadColumnFl,
    };

    if (!isCsvFile) {
      params['sheet'] = this.selectedSheetName;
    } else {
      params['lineSep'] = this.separator;
      params['columnSeq'] = this.delimiter;
    }
    return params;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - init
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private initView() {
    this.allowFileType = ['csv', 'text/csv', 'xls', 'xlsx', 'application/vnd.ms-excel'];
  }
}

class ImportFile {
  public fileType: string;
  public fields: string[];
  public records: any[];
  public totalRows: number = 0;
  public sheets: string[];
  public filename: string;
  public filepath: string;
  public fileSize: number;
  public filekey: string;

  public isExcelFile(): boolean {
    return this.fileType !== 'text/csv';
  }

  public isCsvFile(): boolean {
    return this.fileType === 'text/csv';
  }
}


