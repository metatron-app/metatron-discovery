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
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output, ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { DatasourceInfo } from '../../../../../domain/datasource/datasource';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { DataconnectionService } from '../../../../../dataconnection/service/dataconnection.service';
import { Alert } from '../../../../../common/util/alert.util';
import { CommonUtil } from '../../../../../common/util/common.util';
import * as _ from 'lodash';
import { StringUtil } from '../../../../../common/util/string.util';
import { ConfirmModalComponent } from '../../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../../common/domain/modal';
import JSON5 from 'json5';

@Component({
  selector: 'db-complete',
  templateUrl: './db-complete.component.html'
})
export class DbCompleteComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

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

  @Output('dbComplete')
  public dbComplete = new EventEmitter();

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
              private connectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    console.log('5 step',this.sourceData);

    // Init
    super.ngOnInit();

    // init ui
    this.initView();

    /**
     * create Data 가 있다면
     */
    if (this.sourceData.hasOwnProperty('createData')) {
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
    // 기존 create 정보 삭제후 생성
    this.deleteAndSaveCreateData();
    // 이전 step 으로 이동
    this.step = 'db-ingestion-permission';
    this.stepChange.emit(this.step);
  }

  /**
   * 다음 화면으로 이동
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
    if (this.getDoneValidation()) {
      // 로딩 show
      this.loadingShow();
      // 데이터 소스 생성
      this.createDatasource();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커넥션 host name
   * @returns {string}
   */
  public get getHostname(): string {
    return this.getConnectionData.hostname;
  }

  /**
   * 커넥션 port
   * @returns {number}
   */
  public get getPort(): number {
    return this.getConnectionData.port;
  }

  /**
   * 커넥션 URL
   * @returns {string}
   */
  public get getUrl(): string {
    return this.getConnectionData.url;
  }

  /**
   * 커넥션 sid
   * @returns {string}
   */
  public get getSid(): string {
    return this.getConnectionData.sid;
  }

  /**
   * 커넥션 database
   * @returns {string}
   */
  public get getDatabase(): string {
    return this.getConnectionData.database;
  }

  /**
   * 커넥션 catalog
   * @returns {string}
   */
  public get getCatalog(): string {
    return this.getConnectionData.catalog;
  }

  /**
   * 새로 생성할 커넥션 이름
   * @returns {string}
   */
  public get getConnectionName(): string {
    return this.getConnectionData.connectionName;
  }

  /**
   * 선택된 데이터베이스 이름
   * @returns {string}
   */
  public get getSelectedDatabaseName(): string {
    return this.getDatabaseData.selectedDatabase;
  }

  /**
   * 선택된 테이블 이름
   * @returns {string}
   */
  public get getSelectedTableName(): string {
    return this.getDatabaseData.selectedTable;
  }

  /**
   * 선택된 데이터베이스 쿼리 이름
   * @returns {string}
   */
  public get getSelectedDatabaseQueryName(): string {
    return this.getDatabaseData.selectedDatabaseQuery;
  }

  /**
   * 선택된 쿼리 text
   * @returns {string}
   */
  public get getSelectedQueryText(): string {
    return this.getDatabaseData.queryText;
  }

  /**
   * 스키마 필드 데이터
   * @returns {any[]}
   */
  public get getSchemaFields(): any[] {
    return this.getSchemaData.fields;
  }


  /**
   * 선택된 ingestion type 객체
   * @returns {any}
   */
  public get getSelectedIngestionType(): any {
    return this.getIngestionData.selectedIngestionType;
  }

  /**
   * 선택된 ingestion period type 객체
   * @returns {any}
   */
  public get getSelectedPeriodType(): any {
    return this.getIngestionData.selectedBatchType;
  }

  /**
   * 선택된 ingestion scope type 객체
   * @returns {any}
   */
  public get getSelectedScopeType(): any {
    return this.getIngestionData.selectedScopeType;
  }

  /**
   * 선택된 segment Granularity 객체
   * @returns {any}
   */
  public get getSelectedSegGranularity(): any {
    return this.getIngestionData.selectedSegGranularity;
  }

  /**
   * 선택된 Granularity 객체
   * @returns {any}
   */
  public get getSelectedGranularity(): any {
    return this.getIngestionData.selectedGranularity;
  }

  /**
   * ingetsion Single Rows
   * @returns {number}
   */
  public get getIngestionSingleRow(): number {
    return this.getIngestionData.ingestionOnceRow;
  }

  /**
   * ingestion Batch Rows
   * @returns {number}
   */
  public get getIngestionBatchRow(): number {
    return this.getIngestionData.ingestionPeriodRow;
  }

  /**
   * 선택된 batch hour
   * @returns {number}
   */
  public get getSelectedHour(): number {
    return this.getIngestionData.selectedHour;
  }

  /**
   * 선택된 batch minute
   * @returns {number}
   */
  public get getSelectedMinute(): number {
    return this.getIngestionData.selectedMinute;
  }

  /**
   * 선택한 일 batch time
   * @returns {any}
   */
  public get getSelectedDayTime(): any {
    return this.getIngestionData.selectedDayTime;
  }

  /**
   * 선택한 주간 batch time
   * @returns {any}
   */
  public get getSelectedWeekTime(): any {
    return this.getIngestionData.selectedWeekTime;
  }

  /**
   * 선택된 batch days
   * @returns {any}
   */
  public getSelectedDays(): any {
    return this.getIngestionData.dateType.filter((date) => {
      return date.checked;
    });
  }

  /**
   * 선택된 batch days label
   * @returns {string}
   */
  public getSelectedDaysLabel(): string {
    return this.getSelectedDays().map((day) => {
      return day.label;
    }).toString();
  }

  /**
   * cron text
   * @returns {string}
   */
  public get getCronText(): string {
    return this.getIngestionData.cronText;
  }

  /**
   * 선택된 expiration time 객체
   * @returns {any}
   */
  public get getSelectedExpirationTime(): any {
    return this.getIngestionData.selectedExpirationTime;
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
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 생성 validation
   * @returns {boolean}
   */
  public getDoneValidation() {
    // 이름이 공란이 아닐때 true
    return this.datasourceName.trim() !== '';
  }

  /**
   * 데이터베이스이름이 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredDatabase(): boolean {
    // postgre 만 사용
    return this.getConnectionData.selectedDbType.value === 'POSTGRESQL';
  }

  /**
   * sid가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredSid() : boolean {
    // oracle | tibero 만 사용
    return this.getConnectionData.selectedDbType.value === 'TIBERO' || this.getConnectionData.selectedDbType.value === 'ORACLE';
  }

  /**
   * catalog가 필요한 DB 타입인지 확인
   * @returns {boolean}
   */
  public isRequiredCatalog() : boolean {
    // presto 만 사용
    return this.getConnectionData.selectedDbType.value === 'PRESTO';
  }

  /**
   * 데이터베이스가 테이블 타입인지 확인
   * @returns {boolean}
   */
  public isDatabaseTableType(): boolean {
    return this.getDatabaseType === 'TABLE';
  }

  /**
   * 데이터베이스가 쿼리 타입인지 확인
   * @returns {boolean}
   */
  public isDatabaseQueryType(): boolean {
    return this.getDatabaseType === 'QUERY';
  }

  /**
   * 커넥션 타입이 수집형 이라면
   * @returns {boolean}
   */
  public isConnectionTypeEngine(): boolean {
    return this.getConnectionData.selectedIngestionType.value === 'ENGINE';
  }

  /**
   * 커넥션 타입이 연결형 이라면
   * @returns {boolean}
   */
  public isConnectionTypeLink(): boolean {
    return this.getConnectionData.selectedIngestionType.value === 'LINK';
  }

  /**
   * 데이터 수집방식이 single 라면
   * @returns {boolean}
   */
  public isIngestionTypeSingle(): boolean {
    return this.getSelectedIngestionType.value === 'single';
  }

  /**
   * 데이터 수집방식이 batch 라면
   * @returns {boolean}
   */
  public isIngestionTypeBatch(): boolean {
    return this.getSelectedIngestionType.value === 'batch';
  }

  /**
   * period type week
   * @returns {boolean}
   */
  public isPeriodTypeWeekly(): boolean {
    return this.getSelectedPeriodType.value === 'WEEKLY';
  }

  /**
   * period type day
   * @returns {boolean}
   */
  public isPeriodTypeDaily(): boolean {
    return this.getSelectedPeriodType.value === 'DAILY';
  }

  /**
   * period type hour
   * @returns {boolean}
   */
  public isPeriodTypeHourly(): boolean {
    return this.getSelectedPeriodType.value === 'HOURLY';
  }

  /**
   * period type minute
   * @returns {boolean}
   */
  public isPeriodTypeMinutely(): boolean {
    return this.getSelectedPeriodType.value === 'MINUTELY';
  }

  /**
   * period type expr
   * @returns {boolean}
   */
  public isPeriodTypeExpr(): boolean {
    return this.getSelectedPeriodType.value === 'EXPR';
  }

  /**
   * tuningConfig 를 사용하는지 여부
   * @returns {boolean}
   */
  public isUsedTuningConfig(): boolean {
    return this.getTuningConfig && this.getTuningConfig.trim() !== '';
  }

  /**
   * Is enable url
   * @returns {boolean}
   */
  public isEnableUrl(): boolean {
    return this.isCreateInWorkbench? StringUtil.isNotEmpty(this.getUrl) : this.getConnectionData.isEnableUrl;
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
   * 데이터소스 생성
   */
  private createDatasource() {
    // 로딩 show
    this.loadingShow();
    // 데이터 소스 생성
    this.datasourceService.createDatasource(this.getCreateDatasourceParams())
      .then((result) => {
        // 로딩 hide
        this.loadingHide();
        // 생성완료 alert
        Alert.success(`'${this.datasourceName.trim()}' ` + this.translateService.instant('msg.storage.alert.source.create.success'));
        // 생성완료 emit
        this.step = '';
        this.dbComplete.emit(this.step);
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
        // error modal open
        this.showErrorModal(this.translateService.instant('msg.storage.ui.source.create.fail.title'), this.translateService.instant('msg.storage.ui.source.create.fail.description'));
      });
  }

  /**
   * 기존 create 삭제후 새로 생성
   */
  private deleteAndSaveCreateData() {
    // ingestion 정보가 있다면 삭제
    if (this.sourceData.hasOwnProperty('createData')) {
      delete this.sourceData.createData;
    }
    // 현재 페이지의 create 생성정보 저장
    this.saveCreateData(this.sourceData);
  }

  /**
   * 현재 페이지의 create 데이터 저장
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
   * 커넥션 데이터
   * @returns {any}
   */
  public get getConnectionData() {
    return this.sourceData.connectionData;
  }

  /**
   * 데이터베이스 데이터
   * @returns {any}
   */
  private get getDatabaseData() {
    return this.sourceData.databaseData;
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
   * 선택된 타임스탬프의 타입
   * @returns {string}
   */
  private get getTimestampType(): string {
    return this.getSchemaData.selectedTimestampType;
  }

  /**
   * 타임스탬프로 지정된 컬럼
   * @returns {any}
   */
  private get getSelectedTimestampColumn(): any {
    return this.getSchemaData.selectedTimestampColumn;
  }

  /**
   * 데이터베이스 테이블 또는 쿼리 타입
   * @returns {string}
   */
  private get getDatabaseType(): string {
    return this.getDatabaseData.selectedType;
  }

  /**
   * period 값
   * @returns {any}
   */
  private getPeriodValue(): any {
    // 시간
    if (this.isPeriodTypeHourly()) {
      return this.getSelectedHour;
    }
    // 분
    if (this.isPeriodTypeMinutely()) {
      return this.getSelectedMinute;
    }
    // EXPR
    if (this.isPeriodTypeExpr()) {
      return this.getCronText;
    }
    return null;
  }

  /**
   * period time
   * @returns {any}
   */
  private getPeriodTime(): any {
    // 일
    if (this.isPeriodTypeDaily()) {
      return this.getSelectedDayTime;
    }
    // 주간
    if (this.isPeriodTypeWeekly()) {
      return this.getSelectedWeekTime;
    }
    return null;
  }

  /**
   * period week
   * @returns {any}
   */
  private getPeriodWeekDays(): any {
    return this.getSelectedDays().map((item) => {
      return item.value;
    });
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
   * connection 파라메터
   * @returns {Object}
   */
  private getConnectionParams(): object {
    const connection = {
      type: 'JDBC',
      implementor: this.getConnectionData.selectedDbType.value,
      authenticationType: this.getConnectionData.selectedSecurityType.value
    };
    // If security type is MANUAL, add username and password
    if (this.getConnectionData.selectedSecurityType.value === 'MANUAL') {
      connection['password'] = this.getConnectionData.password;
      connection['username'] = this.getConnectionData.username;
    }
    // if enable URL
    if (!this.isEnableUrl()) {
      connection['hostname'] = this.getConnectionData.hostname;
      connection['port'] = this.getConnectionData.port;
      // catalog 가 있다면
      this.isRequiredCatalog() && (connection['catalog'] = this.getConnectionData.catalog);
      // sid 가 있다면
      this.isRequiredSid() && (connection['sid'] = this.getConnectionData.sid);
      // database 가 있다면
      this.isRequiredDatabase() && (connection['database'] = this.getConnectionData.database);
    } else {
      connection['url'] = this.getConnectionData.url;
    }
    return connection;
  }

  /**
   * 데이터소스 생성시 필요한 파라메터
   * @returns {{dsType: string; srcType: string; connType; granularity; segGranularity; name: string; description: string}}
   */
  private getCreateDatasourceParams() {
    // 파라메터
    const params = {
      dsType: 'MASTER',
      srcType: 'JDBC',
      connType: this.getConnectionData.selectedIngestionType.value,
      granularity: this.getSelectedGranularity.value,
      segGranularity: this.getSelectedSegGranularity.value,
      name: this.datasourceName.trim(),
      description: this.datasourceDesc.trim()
    };
    // fields 파라메터
    params['fields'] = this.getFieldsParams();
    // ingestion 파라메터
    params['ingestion'] = this.getIngestionParams();
    // if used connection preset, use connection ID
    if (this.getConnectionData.isUsedConnectionPreset) {
      params['connection'] = `/api/connections/${this.isCreateInWorkbench ? this.getConnectionData.connectionId : this.getConnectionData.selectedConnectionPreset.id}`;
    }
    return params;
  }

  /**
   * fields 파라메터
   * @returns {any[]}
   */
  private getFieldsParams() {
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
        if (column.name === this.getSelectedTimestampColumn.name) {
          column.role = 'TIMESTAMP';
        } else if (column.name !== this.getSelectedTimestampColumn.name
          && column.role === 'TIMESTAMP') {
          // 타임스탬프가 아닌데 role 이 타임스탬프인경우 dimension 으로 지정
          column.role = 'DIMENSION';
        }
      }

      if (!isCreateTimestamp
        && column.name === this.getSelectedTimestampColumn.name) {
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
   * period 파라메터
   * @returns {{frequency}}
   */
  private getPeriodParams() {
    const period = {
      frequency: this.getSelectedPeriodType.value,
    };
    // value
    const value = this.getPeriodValue();
    if (value !== null) {
      period['value'] = value;
    }
    // time
    const time = this.getPeriodTime();
    if (time !== null) {
      period['time'] = time;
    }
    // weekDays
    if (this.isPeriodTypeWeekly()) {
      period['weekDays'] = this.getPeriodWeekDays();
    }

    return period;
  }

  /**
   * ingestion 파라메터
   * @returns {{dataType: string; database: string; type}}
   */
  private getIngestionParams() {
    // ingestion param
    const ingestion = {
      dataType: this.getDatabaseType,
      type: this.getSelectedIngestionType.value,
      rollup: this.getRollup
    };

    // if database is TABLE
    if (this.isDatabaseTableType()) {
      ingestion['query'] = this.getSelectedTableName;
      ingestion['database'] = this.getSelectedDatabaseName;
    } else {
      // if database is QUERY
      ingestion['query'] = this.getSelectedQueryText;
      ingestion['database'] = this.getSelectedDatabaseQueryName;
    }

    // if Connect type is LINK
    if (this.isConnectionTypeLink()) {
      ingestion['type'] = 'link';
      ingestion['expired'] = this.getSelectedExpirationTime.value;
    }
    // batch 타입
    if (this.isIngestionTypeBatch()) {
      // period
      ingestion['period'] = this.getPeriodParams();
      // 가져올 rows 수
      ingestion['size'] = this.getIngestionBatchRow;
      // 적재 범위
      ingestion['range'] = this.getSelectedScopeType.value;

    } else if (this.isIngestionTypeSingle()) {
      // 적재 범위
      ingestion['scope'] = this.getSelectedScopeType.value;
      // row 수
      if (this.getSelectedScopeType.value === 'ROW') {
        ingestion['size'] = this.getIngestionSingleRow;
      }
    }
    // if not used connection preset
    if (!this.getConnectionData.isUsedConnectionPreset) {
      ingestion['connection'] = this.getConnectionParams();
    }
    // if authentication type is DIALOG, add connectionUsername and connectionPassword
    if (this.getConnectionData.selectedSecurityType.value === 'DIALOG') {
      ingestion['connectionUsername'] = this.getConnectionData.username;
      ingestion['connectionPassword'] = this.getConnectionData.password;
    }
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
   * 워크벤치에서 들어온건지 확인
   * @returns {boolean}
   */
  private get isCreateInWorkbench(): boolean {
    return this.sourceData.workbenchFl;
  }

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
   * ui init
   */
  private initView() {
    this.datasourceName = '';
    this.datasourceDesc = '';
  }

  /**
   * init create source data
   * @param createData
   */
  private initData(createData: any) {
    this.datasourceName = createData.datasourceName;
    this.datasourceDesc = createData.datasourceDesc;
  }
}
