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

import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import {
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { DatasourceInfo } from '../../../../../domain/datasource/datasource';
import { Alert } from '../../../../../common/util/alert.util';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { CommonUtil } from '../../../../../common/util/common.util';
import * as _ from 'lodash';
import { StringUtil } from '../../../../../common/util/string.util';
import { ConfirmModalComponent } from '../../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../../common/domain/modal';
import JSON5 from 'json5';

@Component({
  selector: 'file-complete',
  templateUrl: './file-complete.component.html'
})
export class FileCompleteComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
| Private Variables
|-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  private sourceData: DatasourceInfo;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(ConfirmModalComponent)
  private confirmModal: ConfirmModalComponent;

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this.sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  @Output('fileComplete')
  public fileComplete = new EventEmitter();

  // 생성할 데이터소스 이름
  public datasourceName: string = '';

  // 생성할 데이터소스 설명
  public datasourceDesc: string = '';

  // 유효성 관련 - 이름
  public isInvalidName: boolean = false;
  public errMsgName: string = '';

  // 유효성 관련 - 설명
  public isInvalidDesc: boolean = false;
  public errMsgDesc: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
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

    // ui init
    this.initView();

    // 현재 페이지 데이터소스 생성정보가 있다면
    if (this.sourceData.hasOwnProperty('createData')) {
      // init data
      this.initData(this.sourceData.createData);
    }
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이전 화면으로 이동
   */
  public prev() {
    // 현재 페이지의 데이터소스 생성정보 저장
    this.saveCreateData(this.sourceData);
    // 이전 step 으로 이동
    this.step = 'file-ingestion';
    this.stepChange.emit(this.step);
  }

  /**
   * 생성 완료
   */
  public done() {
    // 이름 비어있는지 확인
    if (StringUtil.isEmpty(this.datasourceName)) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.empty');
      return;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.datasourceName.trim()) > 150) {
      this.isInvalidName = true;
      this.errMsgName = this.translateService.instant('msg.alert.edit.name.len');
      return;
    }
    // 설명 길이 체크
    if (this.datasourceDesc.trim() !== ''
      && CommonUtil.getByte(this.datasourceDesc.trim()) > 450) {
      this.isInvalidDesc = true;
      this.errMsgDesc = this.translateService.instant('msg.alert.edit.description.len');
      return;
    }
    // validation
    if (this.validationDatasourceName()) {
      // loading show
      this.loadingShow();
      // 데이터소스 생성
      this.datasourceService.createDatasource(this.getParams())
        .then((result) => {
          // loading hide
          this.loadingHide();
          // 생성완료 alert
          Alert.success(`'${this.datasourceName.trim()}' ` + this.translateService.instant('msg.storage.alert.source.create.success'));
          // 닫기
          this.step = '';
          this.fileComplete.emit(this.step);
        })
        .catch((error) => {
          // loading hide
          this.loadingHide();
          // error modal open
          this.showErrorModal(this.translateService.instant('msg.storage.ui.source.create.fail.title'), this.translateService.instant('msg.storage.ui.source.create.fail.description'));
        });
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터소스 이름 validation
   * @returns {boolean}
   */
  public validationDatasourceName(): boolean {
    return this.datasourceName && this.datasourceName.trim() !== '';
  }

  /**
   * 파일이 엑셀 파일인지 확인
   * @returns {boolean}
   */
  public isExcelFile(): boolean {
    return (this.getFileData.datasourceFile.hasOwnProperty('sheets')
      && this.getFileData.datasourceFile.sheets.length !== 0);
  }

  /**
   * tuningConfig 를 사용하는지 여부
   * @returns {boolean}
   */
  public isUsedTuningConfig(): boolean {
    return this.getTuningConfig && this.getTuningConfig.trim() !== '';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터베이스 이름
   * @returns {string}
   */
  public get getDatabaseName(): string {
    return this.sourceData.databaseData.selectedDatabase;
  }

  /**
   * 테이블 이름
   * @returns {string}
   */
  public get getTableName(): string {
    return this.sourceData.databaseData.selectedTable;
  }

  /**
   * 선택한 시트 이름
   * @returns {string}
   */
  public get getSheetName(): string {
    return this.getFileData.datasourceFile.selectedSheetName;
  }

  /**
   * 선택한 파일 이름
   * @returns {string}
   */
  public get getFileName(): string {
    return this.getFileData.datasourceFile.filename;
  }

  /**
   * segment Granularity 객체
   * @returns {any}
   */
  public get getSegmentGranularity(): any {
    return this.getIngestionData.selectedSegGranularity;
  }

  /**
   * Granularity 객체
   * @returns {any}
   */
  public get getGranularity(): any {
    return this.getIngestionData.selectedGranularity;
  }

  /**
   * Druid tuning configuration
   * @returns {string}
   */
  public get getTuningConfig(): string {
    return this.getIngestionData.tuningConfig;
  }

  /**
   * rollup 설정 여부
   * @returns {boolean}
   */
  public get getRollup(): boolean {
    return this.getIngestionData.selectedRollup;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 생성 실패시 error modal
   * @param {string} title
   * @param {string} description
   */
  private showErrorModal(title: string, description: string) {
    // modal
    const modal: Modal = new Modal();
    // show cancel disable
    modal.isShowCancel = false;
    // title
    modal.name = title;
    // desc
    modal.description = description;
    // show modal
    this.confirmModal.init(modal);
  }

  /**
   * 현재 페이지의 데이터소스 생성정보 저장
   * @param {DatasourceInfo} sourceData
   */
  private saveCreateData(sourceData: DatasourceInfo) {
    const createData = {
      datasourceName: this.datasourceName,
      datasourceDesc: this.datasourceDesc
    };
    sourceData['createData'] = createData;
  }

  /**
   * 데이터소스 생성요청
   * @param params
   * @returns {Promise<any>}
   */
  private createDatasource(params) {
    return new Promise((resolve, reject) => {
      // loading show
      this.loadingShow();
      this.datasourceService.createDatasource(params)
        .then((result) => {
          // loading hide
          this.loadingHide();
          resolve(result);
        })
        .catch((error) => {
          // loading hide
          this.loadingHide();
          reject(error);
        });
    });
  }

  /**
   * current column 생성
   * @param {number} seq
   * @returns {{seq: number; name: string; type: string; role: string; format: string}}
   */
  private createCurrentColumn(seq: number) {
    const column = {
      seq: seq,
      name: 'current_datetime',
      type: 'TIMESTAMP',
      role: 'TIMESTAMP',
      format: 'yyyy-MM-dd HH:mm:ss',
    };
    return column;
  }

  /**
   * 컬럼 내 불필요한 프로퍼티 삭제
   * @param column
   */
  private deleteColumnProperty(column) {
    delete column.biType;
    delete column.replaceFl;
    // removed 가 false 인 상태만 삭제
    if (column.removed === false) {
      delete column.removed;
    }
  }

  /**
   * 컬럼 내 ingestion rule 설정
   * @param column
   */
  private setColumnIngestionRule(column) {
    // ingestion rule 이 존재시
    if (column.hasOwnProperty('ingestionRule')) {
      // ingestion type
      const type = column.ingestionRule.type;
      // type 이 default 라면
      if (type === 'default') {
        delete column.ingestionRule;
      } else if (type === 'discard') {
        delete column.ingestionRule.value;
      }
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 파일 데이터
   * @returns {any}
   */
  private get getFileData() {
    return this.sourceData.fileData;
  }

  /**
   * schema 데이터
   * @returns {any}
   */
  private get getSchemaData() {
    return this.sourceData.schemaData;
  }

  /**
   * ingestion 데이터
   * @returns {any}
   */
  private get getIngestionData() {
    return this.sourceData.ingestionData;
  }

  /**
   * 데이터베이스의 파일포맷
   * @returns {any}
   */
  private getFileFormat(): any {
    return this.isExcelFile() ? 'excel' : 'csv';
  }

  /**
   * 구분자
   * @returns {string}
   */
  private get getDelimiter(): string {
    return this.getFileData.delimiter;
  }

  /**
   *
   * @returns {string}
   */
  private get getSeparator(): string {
    return this.getFileData.separator;
  }

  /**
   * timestamp type
   * @returns {string}
   */
  private get getTimestampType(): string {
    return this.getSchemaData.selectedTimestampType;
  }

  /**
   * timestamp column
   * @returns {any}
   */
  private get getTimestampColumn() {
    return this.getSchemaData.selectedTimestampColumn;
  }

  /**
   * 필드 정보
   * @returns {Array}
   */
  private get getSchemaFields() {
    return this.getSchemaData.fields;
  }

  /**
   * 파일 경로
   * @returns {string}
   */
  private get getFilePath(): string {
    return this.getFileData.datasourceFile.filepath;
  }

  /**
   * TODO sheet index number
   * @returns {number}
   */
  private getSheetIndex(): number {
    return this.getFileData.datasourceFile.sheets.findIndex((item) => {
      return item === this.getSheetName;
    });
  }


  /**
   * 첫번째 컬럼 헤드생성 여부
   * @returns {boolean}
   */
  private get getRemoveFirstRow(): boolean {
    return this.getFileData.createHeadColumnFl;
  }

  /**
   * JSON map convert
   * @param {string} inputText
   * @returns {{}}
   */
  private getConvertJsonMap(inputText: string) {
    return JSON5.parse(inputText);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - params
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 생성시 사용되는 파라메터
   * @returns {{dsType: string; dataSourceType: string; connType: string; srcType: string; ingestion: {type: string; format: {}; source: string}; fields: Array; granularity: string; segGranularity: string; name: string; description: string}}
   */
  private getParams() {
    // params
    const params = {
      dsType: 'MASTER',
      connType: 'ENGINE',
      srcType: 'FILE',
      fields: this.getFieldsParams(),
      granularity: this.getGranularity.value,
      segGranularity: this.getSegmentGranularity.value,
      name: this.datasourceName.trim(),
      description: this.datasourceDesc.trim(),
      // ingestion
      ingestion: this.getIngestionParams()
    };
    return params;
  }


  /**
   * 필드 파라메터
   * @returns {any[]}
   */
  private getFieldsParams(): any[] {
    // timestamp 생성 여부
    const isCreateTimestamp = this.isCreateCurrentTimestampColumn();
    // fields param
    let fields = _.cloneDeep(this.getSchemaFields);
    // seq number
    let seq = 0;
    // field 설정
    fields.forEach((column) => {
      // seq 설정
      column['seq'] = seq;
      // seq 값 증가
      seq += 1;
      // ingestion rule 처리
      this.setColumnIngestionRule(column);
      // 타임스탬프 컬럼으로 지정되었을 경우
      if (!isCreateTimestamp) {
        // 타임스탬프 컬럼으로 지정된 경우
        if (column.name === this.getTimestampColumn.name) {
          column.role = 'TIMESTAMP';
        } else if (column.name !== this.getTimestampColumn.name
          && column.role === 'TIMESTAMP') {
          // 타임스탬프가 아닌데 role 이 타임스탬프인경우 dimension 으로 지정
          column.role = 'DIMENSION';
        }
      }

      if (!isCreateTimestamp
        && column.name === this.getTimestampColumn.name) {
        // role 을 timestamp 로 변경
        column.role = 'TIMESTAMP';
      }
      // 필요없는 프로퍼티 삭제
      this.deleteColumnProperty(column);
    });

    // 타임스탬프로 지정된 컬럼이 없을 경우
    if (isCreateTimestamp) {
      fields.push(this.createCurrentColumn(seq));
    }

    return fields;
  }

  /**
   * file format 파라메터
   * @returns {{type: string}}
   */
  private getFileFormatParam() {
    const format = {
      type: this.getFileFormat(),
    };
    // file format 이 CSV인 경우만 작동
    if (this.getFileFormat() === 'csv') {
      format['delimiter'] = this.getDelimiter;
      format['lineSeparator'] = this.getSeparator;
    } else {
      format['sheetIndex'] = this.getSheetIndex();
    }
    return format;
  }

  /**
   * ingestion 파라메터
   * @returns {{type: string; format: {type: any}; removeFirstRow: boolean; path: string}}
   */
  private getIngestionParams() {
    // ingestion param
    const ingestion = {
      type: 'local',
      format: this.getFileFormatParam(),
      removeFirstRow: !this.getRemoveFirstRow,
      path: this.getFilePath,
      rollup: this.getRollup
    };
    // advanced
    if (this.getTuningConfig) {
      ingestion['tuningOptions'] = this.getConvertJsonMap(this.getTuningConfig);
    }
    return ingestion;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 임의의 타임스탬프 컬럼 생성여부
   * @returns {boolean}
   */
  private isCreateCurrentTimestampColumn(): boolean {
    return this.getTimestampType === 'CURRENT';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   */
  private initView() {
    this.datasourceName = '';
    this.datasourceDesc = '';
  }

  /**
   * init source create data
   * @param createData
   */
  private initData(createData: any) {
    this.datasourceName = createData.datasourceName;
    this.datasourceDesc = createData.datasourceDesc;
  }
}
