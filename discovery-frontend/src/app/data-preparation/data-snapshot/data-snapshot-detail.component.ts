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
  Component, ElementRef, Injector, OnInit, ViewChild, OnDestroy, Output,
  HostListener, EventEmitter
} from '@angular/core';
import { PrDataSnapshot, Status, OriginDsInfo, SsType } from '../../domain/data-preparation/pr-snapshot';
import { DataSnapshotService } from './service/data-snapshot.service';
import { PopupService } from '../../common/service/popup.service';
import { GridComponent } from '../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../common/component/grid/grid.header';
import { Field } from '../../domain/data-preparation/pr-dataset';
import { GridOption } from '../../common/component/grid/grid.option';
import { Alert } from '../../common/util/alert.util';
import { PreparationAlert } from '../util/preparation-alert.util';
import { isNull, isUndefined, isNullOrUndefined } from 'util';
import { saveAs } from 'file-saver';
import * as pixelWidth from 'string-pixel-width';
import { AbstractComponent } from '../../common/component/abstract.component';
import * as $ from "jquery";
import {PreparationCommonUtil} from "../util/preparation-common.util";
declare let moment: any;

@Component({
  selector: 'app-data-snapshot-detail',
  templateUrl: './data-snapshot-detail.component.html',
})
export class DataSnapshotDetailComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  private commandList: {command: string, alias: string}[] = [
    { command: 'header', alias: 'He'},
    { command: 'keep', alias: 'Ke'},
    { command: 'replace', alias: 'Rp'},
    { command: 'rename', alias: 'Rn'},
    { command: 'set', alias: 'Se'},
    { command: 'settype', alias: 'St'},
    { command: 'countpattern', alias: 'Co'},
    { command: 'split', alias: 'Sp'},
    { command: 'derive', alias: 'Dr'},
    { command: 'delete', alias: 'De'},
    { command: 'drop', alias: 'Dp'},
    { command: 'pivot', alias: 'Pv'},
    { command: 'unpivot', alias: 'Up'},
    { command: 'Join', alias: 'Jo'},
    { command: 'extract', alias: 'Ex'},
    { command: 'flatten', alias: 'Fl'},
    { command: 'merge', alias: 'Me'},
    { command: 'nest', alias: 'Ne'},
    { command: 'unnest', alias: 'Un'},
    { command: 'aggregate', alias: 'Ag'},
    { command: 'sort', alias: 'So'},
    { command: 'move', alias: 'Mv'},
    { command: 'Union', alias: 'Ui'},
    { command: 'window', alias: 'Wn'},
    { command: 'setformat', alias: 'Sf'}];

  private isFromDataflow : boolean = false;

  private uiOffset : number = 0;
  private uiSize : number = 100;

  @Output()
  public snapshotDetailCloseEvent = new EventEmitter();

  @Output()
  public navigateToDataflow = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('ssName')
  public ssName: ElementRef;

  public ssId: string;

  public selectedDataSnapshot: PrDataSnapshot = null;
  public originDsInfo: OriginDsInfo = null;
  public colCnt: number = 0;

  public dsId: string;
  public dfId: string;

  // Grid 에서 필요한 parameter
  public offset: number = 0;
  public target: number = 10000;


  // % 계산
  public missing: string = '0%';
  public valid:string= '100%';
  public mismatched:string = '0%';

  public interval : any;
  public currentTab : number = 0;

  public ruleList : any = [];
  public isShow : boolean = false;

  public progressbarWidth = '100%';

  public prepCommonUtil = PreparationCommonUtil;

  public flag: boolean = false; // Restrict api calling again and again

  public snapshotUriFileFormat: string = '';

  public isSsNameEditing: boolean = false;
  public sSInformationList: {label : String, value : string, isFileUri?: boolean}[] = [];

  public ssType = SsType;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected datasnapshotservice: DataSnapshotService,
              protected popupService: PopupService,
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

    this._clearSnapshotInterval();
    $('body').removeClass('body-hidden');

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * When popup is opened
   * @param ssId
   * @param isFromDataflow
   */
  public init(ssId : string, isFromDataflow : boolean = false) {

    this.selectedDataSnapshot = new PrDataSnapshot();
    this.originDsInfo = new OriginDsInfo();
    this.sSInformationList = [];

    this.isFromDataflow = isFromDataflow;
    this.ssId = ssId;
    this.isShow = true;
    this.colCnt = 0;

    $('body').removeClass('body-hidden').addClass('body-hidden');

    this._clearSnapshotInterval();
    this.interval =  setInterval(() => this.getSnapshot(), 3000);
    this.getSnapshot(true);
  }


  /**
   * Close snapshot popup
   */
  public close() {
    this._clearSnapshotInterval();
    this.isShow = false;
    $('body').removeClass('body-hidden');
    this.snapshotDetailCloseEvent.emit();
  } // end of method close



  public getRows() {
    let rows = '0';
    if (Number.isInteger(this.selectedDataSnapshot.totalLines)) {
      rows = new Intl.NumberFormat().format(this.selectedDataSnapshot.totalLines);
      return rows + ' row(s)';
    } else {
      //if (this.selectedDataSnapshot.status === 'FAILED') {
      if (this.selectedDataSnapshot.status === Status.FAILED) {
        return 0;
      }
      return '(counting rows)'
    }
   }

  /**
   * Returns number of columns
   */
  public getCols() {
    let cols = '0';
    if (Number.isInteger(this.colCnt)) {
      cols = new Intl.NumberFormat().format(this.colCnt);
      return cols + ' column(s)';
    }
    return cols;
  }


  /**
   * Returns formatted elapsed time
   * hour:minute:second.millisecond
   * @param item
   */
  public getElapsedTime(item: PrDataSnapshot) {

    if (isUndefined(item) ||
      isUndefined(item.elapsedTime) ||
      isUndefined(item.elapsedTime.hours) ||
      isUndefined(item.elapsedTime.minutes) ||
      isUndefined(item.elapsedTime.seconds) ||
      isUndefined(item.elapsedTime.milliseconds)
    ) {
      return '--:--:--';
    }
    return `${this.prepCommonUtil.padLeft(item.elapsedTime.hours)}:${this.prepCommonUtil.padLeft(item.elapsedTime.minutes)}:${this.prepCommonUtil.padLeft(item.elapsedTime.seconds)}.${this.prepCommonUtil.padLeft(item.elapsedTime.milliseconds)}`;
  }


  /** Jump to selected dataflow */
  public navigateDataflow(dfId) {

    if (!this.isFromDataflow) {
      this._savePrevRouterUrl();
      this.router.navigate(['/management/datapreparation/dataflow',dfId]);
    } else { // 데이터플로우 화면에서 이동할때
      this.isShow = false;
      this.navigateToDataflow.emit();
    }
  } // function - navigateDataflow

  /**
   * 데이터셋 아이디 저장
   */
  private _savePrevRouterUrl(): void {
    this.cookieService.set('SELECTED_DATASET_ID', this.dsId);
    this.cookieService.set('SELECTED_DATASET_TYPE', 'WRANGLED');
  }

  /**
   * Tab click event
   * @param tabNumber
   * */
  public onTabClick(tabNumber : number) {
    this.currentTab = tabNumber;
  }

  public getSize() {
    let size = 0;
    if(Number.isInteger(this.selectedDataSnapshot.totalBytes)) {
      size = this.selectedDataSnapshot.totalBytes;
    }
    return this.formatBytes(size,1);
  }


  /**
   * Edit snapshot name
   * Apply changed snapshot name to server
   */
  public editSnapshotName() {
    if ((this.ssName.nativeElement.value !== this.selectedDataSnapshot.ssName) && this.ssName.nativeElement.value.trim() !== '') {
      this.loadingShow();
      this.datasnapshotservice.editSnapshot({ssId: this.ssId, ssName: this.ssName.nativeElement.value}).then((result) => {
        this.loadingHide();
        if (result) {
          this.selectedDataSnapshot.ssName = result.ssName;
          Alert.success(this.translateService.instant('msg.dp.alert.modify.sSname'));
        }
      }).catch(() => {
        this.loadingHide();
        Alert.error(this.translateService.instant('msg.dp.alert.fail.change.ssName'));
      });
    }
    this.isSsNameEditing = false;

  }

  /**
   * Change snapshot name editing status
   * @param {boolean} state
   */
  public changeSsNameEditingState(state: boolean) {

    this.isSsNameEditing = state;
    if (state) {
      this.ssName.nativeElement.value = this.selectedDataSnapshot.ssName;
      setTimeout(() => {
        this.ssName.nativeElement.select();
      });
    }

  }


  /**
   * Download snapshot
   * @param fileFormat
   */
  public downloadSnapshot(fileFormat: string) {
    let downloadFileName = this.selectedDataSnapshot.sourceInfo.dsName + "."+ fileFormat;

    this.datasnapshotservice.downloadSnapshot(this.ssId, fileFormat).subscribe((snapshotFile) => {
      saveAs(snapshotFile, downloadFileName);
    });
  }


  /**
   * Cancel snapshot create process
   * @param param
   */
  public cancelClick(param:boolean){
    clearInterval(this.interval);
    this.interval = undefined;
    let elm = $('.ddp-wrap-progress');
    if (param) {
      if(this.selectedDataSnapshot.ruleCntDone == this.selectedDataSnapshot.ruleCntTotal) {
        Alert.info('Generating completed');
        this.close();
      } else {
        elm[0].style.display = "none";
        elm[1].style.display = "";
      }
    } else {
      elm[0].style.display = "";
      elm[1].style.display = "none";
      this.interval =  setInterval(() => this.getSnapshot(), 1000);
    }
  }


  /** 처리 중 스냅샷 취소*/
  public cancelSnapshot() {
    this.loadingShow();
    this.datasnapshotservice.cancelSnapshot(this.ssId)
      .then((result) => {
        this.loadingHide();

        if( result.result === 'OK')  {
          Alert.info(this.translateService.instant('msg.dp.alert.snapshot.cancel.success'));
          this.close();
        } else {
          Alert.warning(this.translateService.instant('msg.dp.alert.snapshot.cancel.fail'));
        }
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private formatBytes(a,b) { // a=크기 , b=소숫점자릿
    if(0==a) return "0 Bytes";
    let c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));
    return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
  }


  /**
   * Get snapshot information
   * @param isInitial
   */
  private getSnapshot(isInitial?) {

    // Initial execution
    if (isInitial) {
      this.flag = false;
      this.loadingShow();
    }


    if (!this.flag) {
      this.flag = true;
      this.datasnapshotservice.getDataSnapshot(this.ssId).then((snapshot : PrDataSnapshot) => {
        this.flag = false;
        this.loadingHide();

        this.selectedDataSnapshot = snapshot;

        // clear interval
        this._clearSnapshotInterval();


        // set file format
        if (this.selectedDataSnapshot.ssType ===  SsType.URI){
          this.snapshotUriFileFormat = this.selectedDataSnapshot.storedUri.slice((this.selectedDataSnapshot.storedUri.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
        }

        // dsId
        this.dsId = this.selectedDataSnapshot.sourceInfo.dsId;

        // dfId
        this.dfId = this.selectedDataSnapshot.sourceInfo.dfId;

        // set rule list
        this._setRuleList(this.selectedDataSnapshot.ruleStringInfo);

        // calculate valid, missing, mismatched
        const totalLines = this.selectedDataSnapshot.totalLines ? this.selectedDataSnapshot.totalLines : 0;
        const missingLines = this.selectedDataSnapshot.missingLines ? this.selectedDataSnapshot.missingLines : 0;
        const mismatchedLines = this.selectedDataSnapshot.mismatchedLines ? this.selectedDataSnapshot.mismatchedLines : 0;


        // if denominator is 0, results in NaN
        if (totalLines !== 0) {
          this.valid = ((totalLines - missingLines - mismatchedLines ) / totalLines) * 100 + '%';
          this.missing = (missingLines / totalLines) * 100 + '%';
          this.mismatched = (mismatchedLines / totalLines) * 100 + '%';
        }

        this.selectedDataSnapshot.displayStatus = this._findDisplayStatus(this.selectedDataSnapshot.status);

        // 실패해도 원본 데이터셋 정보 필요함
        this.getOriginData();

        if (this.selectedDataSnapshot.displayStatus === 'SUCCESS') {
          // 성공했을경우에만 그리드 그림
          this.getGridData();
        }

        if (this.selectedDataSnapshot.displayStatus === 'PREPARING') {
          if(isUndefined(this.selectedDataSnapshot.ruleCntDone) || isNull(this.selectedDataSnapshot.ruleCntDone)) this.selectedDataSnapshot.ruleCntDone = 0;
          if(isUndefined(this.selectedDataSnapshot.ruleCntTotal) || isNull(this.selectedDataSnapshot.ruleCntTotal)) this.selectedDataSnapshot.ruleCntTotal = 0;

          if (this.selectedDataSnapshot.ruleCntTotal > 0 && this.selectedDataSnapshot.ruleCntDone < this.selectedDataSnapshot.ruleCntTotal){
            this.progressbarWidth = Math.ceil(this.selectedDataSnapshot.ruleCntDone * 100  / (this.selectedDataSnapshot.ruleCntTotal + 1)) + "%";
          } else {
            this.progressbarWidth = '100%';
          }
        }

        if (this.selectedDataSnapshot.displayStatus === 'FAIL') {
          if(!isUndefined(this.selectedDataSnapshot.custom) && "fail_msg"==this.selectedDataSnapshot.custom.match("fail_msg")) {
            this.selectedDataSnapshot.custom = JSON.parse(this.selectedDataSnapshot.custom.replace(/\n/g, '<br>').replace(/'/g, '"'));
          }
          this._setSnapshotInfo(this.selectedDataSnapshot);
        }

      }).catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
    }

  } // end of method getSnapshot

  /**
   * Returns display snapshot status
   * @param status
   * @private
   * returns SUCCESS, PREPARING, FAIL
   */
  private _findDisplayStatus(status: Status) : string {

    if ([Status.SUCCEEDED].indexOf(status) >= 0) {
      return 'SUCCESS';
    }

    if ( [Status.INITIALIZING,Status.RUNNING,Status.WRITING,Status.TABLE_CREATING,Status.CANCELING].indexOf(this.selectedDataSnapshot.status) >= 0) {
      return 'PREPARING';
    }

    if ([Status.FAILED,Status.CANCELED,Status.NOT_AVAILABLE].indexOf(this.selectedDataSnapshot.status) >= 0){
      return 'FAIL'
    }

  }

  /**
   * ruleStringInfos로 내려오는 데이터를 화면에 출력할수 있게 가공
   * @param rules
   * @private
   */
  private _setRuleList(rules: any) {
    this.ruleList = [];
    const commandNames = this.commandList.map((command) => {
      return command.command;
    });

    // ruleStringInfos
    rules.forEach((rule) => {
      rule['ruleVO'] = JSON.parse(rule['jsonRuleString']);
      rule['ruleVO']['command'] = rule['ruleVO']['name'];
      rule['ruleVO']['ruleNo'] = rule['ruleNo'];

      if (rule['ruleVO'].command === 'join') {
        rule['ruleVO'].command = 'Join'
      } else if (rule['ruleVO'].command === 'union') {
        rule['ruleVO'].command = 'Union'
      }

      const idx = commandNames.indexOf(rule['ruleVO'].command);
      if (idx > -1) {
        rule['command'] = this.commandList[idx].command;
        rule['alias'] = this.commandList[idx].alias;

        if (rule.shortRuleString) {
          rule['simplifiedRule'] = rule.shortRuleString;
        } else {
          rule['simplifiedRule'] = rule.ruleString;
        }
      } else {
        rule['simplifiedRule'] = rule.shortRuleString ? rule.shortRuleString : rule.ruleString;
        rule['command'] = 'Create';
        rule['alias'] = 'Cr';
        rule['desc'] = '';
      }
      this.ruleList.push(rule);
    });
  }


  private getOriginData() {
    let sourceInfo = this.selectedDataSnapshot.sourceInfo;

    if( isUndefined(sourceInfo) ) {
      Alert.warning(this.translateService.instant('msg.dp.alert.imported.ds.info'));
    } else {
      if( isUndefined(sourceInfo.origDsName) ) {
        Alert.warning(this.translateService.instant('msg.dp.alert.imported.ds.name'));
        this.originDsInfo.dsName = '';
      } else {
        this.originDsInfo.dsName = sourceInfo.origDsName;
      }
      if( isUndefined(sourceInfo.origDsQueryStmt) ) {
        Alert.warning(this.translateService.instant('msg.dp.alert.imported.ds.querystmt'));
      } else {
        this.originDsInfo.qryStmt = sourceInfo.origDsQueryStmt;
      }
      if( isUndefined(sourceInfo.origDsCreatedTime) ) {
        Alert.warning(this.translateService.instant('msg.dp.alert.imported.ds.createdtime'));
      } else {
        this.originDsInfo.createdTime = sourceInfo.origDsCreatedTime;
      }
    }
  }

  /**
   * Make grid response from grid data
   */
  private getGridData() {

    this.loadingShow();
    this.datasnapshotservice.getDataSnapshotGridData(this.ssId, this.offset, this.target)
      .then((result) => {
        this.loadingHide();

        if(isUndefined(result.gridResponse)){
          Alert.warning(this.translateService.instant('msg.dp.alert.no.grid'));
          return;
        }

        this.colCnt = result.gridResponse.colCnt;
        const colNames = result.gridResponse.colNames;
        const colTypes = result.gridResponse.colDescs;

        this._setSnapshotInfo(this.selectedDataSnapshot);

        const griddata = {
          data: [],
          fields: []
        };

        for ( let idx = 0; idx < this.colCnt; idx++ ) {
          griddata.fields.push({
            name: colNames[idx],
            type: colTypes[idx].type,
            seq: idx
          });
        }

        result.gridResponse.rows.forEach((row) => {
          const obj = {};
          for ( let idx = 0; idx < this.colCnt; idx++ ) {
            obj[ colNames[idx] ] = row.objCols[idx];
          }
          griddata.data.push(obj);
        });

        this.selectedDataSnapshot.gridData = griddata;
        this.updateGrid(this.selectedDataSnapshot.gridData);

      })
      .catch((error) => {
        this.loadingHide();
        Alert.error(error.details);
      });
  } // end of method getGridData


  /**
   * Update grid
   * @param data
   */
  private updateGrid(data) {

    if( 0 === data.fields.length || 0 === data.data.length ) {
      return;
    }

    const maxDataLen: any = {};
    const fields: Field[] = data.fields;
    let rows: any[];

    this.uiOffset = 1;
    rows = data.data.slice(0, (data.data.length > this.uiOffset*this.uiSize? this.uiOffset*this.uiSize -1 : data.data.length -1) );

    // Row 생성 및 컬럼별 최대 길이 측정
    if (rows.length > 0 && !rows[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        // 컬럼 길이 측정
        fields.forEach((field: Field) => {
          const colWidth: number = pixelWidth(row[field.name], { size: 12 });
          if (!maxDataLen[field.name] || ( maxDataLen[field.name] < colWidth )) {
            maxDataLen[field.name] = colWidth;
          }
        });
        // row id 설정
        row.id = idx;
        return row;
      });
    }

    // 헤더정보 생성
    const headers: header[] = fields.map((field: Field) => {
        /* 72 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth: number = Math.floor(pixelWidth(field.name, { size: 12 })) + 72;

        return new SlickGridHeader()
          .Id(field.name)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + field.name + '</span>')
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth > maxDataLen[field.name] ? headerWidth : maxDataLen[field.name])
          .MinWidth(100)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(false)
          .Formatter((function (scope) {
            return function (row, cell, value) {
              if (field.type === 'STRING') {
                value = (value) ? value.toString().replace(/</gi, '&lt;') : value;
                value = (value) ? value.toString().replace(/>/gi, '&gt;') : value;
                value = (value) ? value.toString().replace(/\n/gi, '&crarr;') : value;
                let tag = '<span style="color:#ff00ff; font-size: 9pt; letter-spacing: 0px">&middot;</span>';
                value = (value) ? value.toString().replace(/\s/gi, tag) : value;
              }
              if (isNull(value)) {
                return '<div  style=\'color:#b8bac2; font-style: italic ;line-height:30px;\'>' + '(null)' + '</div>';
              } else {
                return value;
              }
            };
          })(this))
          .build();
      }
    );

    // 헤더 필수
    // 로우 데이터 필수
    // 그리드 옵션은 선택
    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .RowHeight(32)
      .NullCellStyleActivate(true)
      .EnableColumnReorder(false)
      .build()
    );

    this.gridComponent.grid.onScroll.subscribe(() => {
      let lastIdx = (this.selectedDataSnapshot.gridData.data.length > this.uiOffset*this.uiSize? this.uiOffset*this.uiSize: this.selectedDataSnapshot.gridData.data.length);
      if ( this.gridComponent.grid.getViewport().bottom === lastIdx && this.selectedDataSnapshot.gridData.data.length > this.uiOffset*this.uiSize ){
        this.uiOffset += 1;
        this.gridComponent.grid.setData(data.data.slice(0,(data.data.length < this.uiOffset*this.uiSize? data.data.length -1: this.uiOffset*this.uiSize -1) ));
        this.gridComponent.grid.updateRowCount();
        this.gridComponent.grid.render();
      }
    });
  } // end of method updateGrid


  /**
   * Set snapshot information into list
   * @param {PrDataSnapshot} snapshot
   * @private
   */
  private _setSnapshotInfo(snapshot: PrDataSnapshot) {

    this.sSInformationList = [];

    // Staging db
    if (!snapshot.storedUri) {
      this.sSInformationList.push({label: this.translateService.instant('msg.dp.th.ss-type'),
        value : this.prepCommonUtil.getSnapshotType(snapshot.ssType)});
    }

    // File type
    if (snapshot.storedUri) {
      const fileType : string[] = this.prepCommonUtil.getFileNameAndExtension(snapshot.storedUri);
      this.sSInformationList.push({label: this.translateService.instant('msg.dp.th.ss-type'),
        value : `${this.prepCommonUtil.getSnapshotType(snapshot.ssType)} (${fileType[1].toUpperCase()})`},
        {label: this.translateService.instant('msg.dp.th.file.uri'),
          value : snapshot.storedUri, isFileUri: true});
    }

    // Summary only when snapshot is successful
    if (snapshot.displayStatus !== 'FAIL') {
      this.sSInformationList.push(
        {label: this.translateService.instant('msg.dp.th.summary'), value : `${this.getRows()}`},
        {label: '', value : `${this.getCols()}`});
    }

    if (snapshot.totalBytes) {
      this.sSInformationList.push({label: this.translateService.instant('msg.comm.detail.size'), value : this.getSize()});
    }

    if (snapshot.dbName) {
      this.sSInformationList.push({label: this.translateService.instant('msg.dp.th.database'), value : this.selectedDataSnapshot.dbName});
    }

    if (snapshot.tblName) {
      this.sSInformationList.push({label: this.translateService.instant('msg.dp.th.ss.table'), value : this.selectedDataSnapshot.tblName});
    }

    this.sSInformationList.push(
      {label: this.translateService.instant('msg.dp.th.et'), value : this.getElapsedTime(snapshot)},
      {label: this.translateService.instant('msg.comm.th.created'), value : moment(snapshot.createdTime).format('YYYY-MM-DD HH:mm')});
  }


  /**
   * Clears exisiting snapshot interval
   * @private
   */
  private _clearSnapshotInterval() {
    if (!isNullOrUndefined(this.interval)) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }


  /**
   * Close snapshot popup with esc button
   * @param event
   */
  @HostListener('document:keydown.escape', ['$event'])
  private _onKeydownHandler(event: KeyboardEvent) {
    if (this.isShow) {
      event.keyCode === 27 ? this.close() : null;
    }
  }

} // end of class DataSnapshotDetailComponent
