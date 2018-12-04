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
  AfterViewInit, Component, ElementRef, Injector, OnInit, ViewChild, OnDestroy, Output,
  HostListener, EventEmitter
} from '@angular/core';
//import { DataSnapshot, OriginDsInfo } from '../../domain/data-preparation/data-snapshot';
import { PrDataSnapshot, Status, OriginDsInfo } from '../../domain/data-preparation/pr-snapshot';
import { DataSnapshotService } from './service/data-snapshot.service';
import { PopupService } from '../../common/service/popup.service';
import { GridComponent } from '../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../common/component/grid/grid.header';
//import { Field } from '../../domain/data-preparation/dataset';
import { Field } from '../../domain/data-preparation/pr-dataset';
import { GridOption } from '../../common/component/grid/grid.option';
import { Alert } from '../../common/util/alert.util';
import { PreparationAlert } from '../util/preparation-alert.util';
import { isNull, isUndefined } from 'util';
import { saveAs } from 'file-saver';
import * as pixelWidth from 'string-pixel-width';
import { AbstractComponent } from '../../common/component/abstract.component';
import * as $ from "jquery";
import {PreparationCommonUtil} from "../util/preparation-common.util";

@Component({
  selector: 'app-data-snapshot-detail',
  templateUrl: './data-snapshot-detail.component.html',
})
export class DataSnapshotDetailComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  private commandList: any[];

  private isFromDataflow : boolean = false;

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
  public ssId: string;

  //public selectedDataSnapshot: DataSnapshot = null;
  public selectedDataSnapshot: PrDataSnapshot = null;
  public originDsInfo: OriginDsInfo = null;
  public colCnt: number = 0;

  public dsId: string;
  public dfId: string;

  // Grid 에서 필요한 parameter
  public offset: number = 0;
  public target: number = 10000;


  // % 계산
  public missing: string = '';
  public valid:string= '';
  public mismatched:string = '';

  public interval : any;
  public currentTab : number = 0;

  public ruleList : any = [];
  public isShow : boolean = false;

  public progressbarWidth = '100%';

  public prepCommonUtil = PreparationCommonUtil;

  public flag: boolean = false; // Restrict api calling again and again
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
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

  public init(ssId : string, isFromDataflow : boolean = false) {
    this.isFromDataflow = isFromDataflow;
    this.ssId = ssId;
    this.isShow = true;
    $('body').removeClass('body-hidden').addClass('body-hidden');
    this.initViewPage();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
    clearInterval(this.interval);
    this.interval = undefined;
    $('body').removeClass('body-hidden');
  }

  public ngAfterViewInit() {

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 팝업끼리 관리하는 모델들 초기화
  public initViewPage() {

    const griddata = { data: [], fields: [] };
    this.updateGrid(griddata);
    //this.selectedDataSnapshot = new DataSnapshot();
    this.selectedDataSnapshot = new PrDataSnapshot();
    this.originDsInfo = new OriginDsInfo();
    this.colCnt = 0;
    this.commandList = [
      { command: 'header', alias: 'He', desc: this.translateService.instant('msg.dp.li.he.description'), isHover:false },
      { command: 'keep', alias: 'Ke', desc: this.translateService.instant('msg.dp.li.ke.description'), isHover:false },
      { command: 'replace', alias: 'Rp', desc: this.translateService.instant('msg.dp.li.rp.description'), isHover:false },
      { command: 'rename', alias: 'Rn', desc: this.translateService.instant('msg.dp.li.rn.description'), isHover:false },
      { command: 'set', alias: 'Se', desc: this.translateService.instant('msg.dp.li.se.description'), isHover:false },
      { command: 'settype', alias: 'St', desc: this.translateService.instant('msg.dp.li.st.description'), isHover:false },
      { command: 'countpattern', alias: 'Co', desc: this.translateService.instant('msg.dp.li.co.description'), isHover:false },
      { command: 'split', alias: 'Sp', desc: this.translateService.instant('msg.dp.li.sp.description'), isHover:false },
      { command: 'derive', alias: 'Dr', desc: this.translateService.instant('msg.dp.li.dr.description'), isHover:false },
      { command: 'delete', alias: 'De', desc: this.translateService.instant('msg.dp.li.de.description'), isHover:false },
      { command: 'drop', alias: 'Dp', desc: this.translateService.instant('msg.dp.li.dp.description'), isHover:false },
      { command: 'pivot', alias: 'Pv', desc: this.translateService.instant('msg.dp.li.pv.description'), isHover:false },
      { command: 'unpivot', alias: 'Up', desc: this.translateService.instant('msg.dp.li.up.description'), isHover:false },
      { command: 'Join', alias: 'Jo', desc: this.translateService.instant('msg.dp.li.jo.description'), isHover:false },
      { command: 'extract', alias: 'Ex', desc: this.translateService.instant('msg.dp.li.ex.description'), isHover:false },
      { command: 'flatten', alias: 'Fl', desc: this.translateService.instant('msg.dp.li.fl.description'), isHover:false },
      { command: 'merge', alias: 'Me', desc: this.translateService.instant('msg.dp.li.me.description'), isHover:false },
      { command: 'nest', alias: 'Ne', desc: this.translateService.instant('msg.dp.li.ne.description'), isHover:false },
      { command: 'unnest', alias: 'Un', desc: this.translateService.instant('msg.dp.li.un.description'), isHover:false  },
      { command: 'aggregate', alias: 'Ag', desc: this.translateService.instant('msg.dp.li.ag.description'), isHover:false },
      { command: 'sort', alias: 'So', desc: this.translateService.instant('msg.dp.li.so.description'), isHover:false },
      { command: 'move', alias: 'Mv', desc: this.translateService.instant('msg.dp.li.mv.description'), isHover:false },
      { command: 'Union', alias: 'Ui', desc: this.translateService.instant('msg.dp.li.ui.description'), isHover:false },
      { command: 'window', alias: 'Wn', desc: this.translateService.instant('msg.dp.li.ui.description'), isHover:false },
      { command: 'setformat', alias: 'Sf', desc: 'set timestamp type .... ', isHover:false }

    ];

    this.interval =  setInterval(() => this.getSnapshot(), 1000);
    this.getSnapshot(true);
  } // end of initViewPage

  // 데이터 스냅샷 디테일 페이지 팝업 닫기
  public close() {
    clearInterval(this.interval);
    this.interval = undefined;
    this.isShow = false;
    $('body').removeClass('body-hidden');
    this.snapshotDetailCloseEvent.emit();
  } // end of method close

  // esc 창 닫힘
  @HostListener('document:keydown.escape', ['$event'])
  public onKeydownHandler(event: KeyboardEvent) {
    if (this.isShow) {
      event.keyCode === 27 ? this.close() : null;
    }
  }

  public getRows() {
    let rows = '0';
    if (Number.isInteger(this.selectedDataSnapshot.totalLines)) {
      rows = new Intl.NumberFormat().format(this.selectedDataSnapshot.totalLines);
      return rows + ' rows';
    } else {
      //if (this.selectedDataSnapshot.status === 'FAILED') {
      if (this.selectedDataSnapshot.status === Status.FAILED) {
        return 0 + ' rows';
      }
      return '(counting rows)'
    }

  }

  public getCols() {
    let cols = '0';
    if(true==Number.isInteger(this.colCnt)) {
      cols = new Intl.NumberFormat().format(this.colCnt);
    }
    return cols;
  }

  public getElapsedTime(item) {
    if( true===isUndefined(item) || true===isUndefined(item.elapsedTime)
      || true===isUndefined(item.elapsedTime.hours) || true===isUndefined(item.elapsedTime.minutes) || true===isUndefined(item.elapsedTime.seconds) || true===isUndefined(item.elapsedTime.milliseconds)
    ) { return '--:--:--'; }
    return this.padleft(item.elapsedTime.hours) + ':' + this.padleft(item.elapsedTime.minutes) + ':' +this.padleft(item.elapsedTime.seconds) + '.' + this.padleft(item.elapsedTime.milliseconds);
  }

  /** Formatting number to 2 whole number digit */
  public padleft(data) {

    let z = '0';
    let n = data + '';
    return n.length >= 2 ? n : new Array(2 - n.length + 1).join(z) + n;
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
    if(true==Number.isInteger(this.selectedDataSnapshot.totalBytes)) {
      size = this.selectedDataSnapshot.totalBytes;
    }
    return this.formatBytes(size,1);
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

  private getSnapshot(isInitial?) {

    if (isInitial) {

      this.flag = false;
      this.loadingShow();
    }


    if (!this.flag) {
      this.flag = true;
      //this.datasnapshotservice.getDataSnapshot(this.ssId).then((snapshot : DataSnapshot) => {
      this.datasnapshotservice.getDataSnapshot(this.ssId).then((snapshot : PrDataSnapshot) => {
        this.selectedDataSnapshot = snapshot;
        this.flag = false;

        this.loadingHide();
        if (this.selectedDataSnapshot.totalLines === -1) {
          this.selectedDataSnapshot.totalLines = null;
        } else {
          clearInterval(this.interval);
          this.interval = undefined;
        }

        //let linageInfo = JSON.parse( this.selectedDataSnapshot["lineageInfo"] );
        /*
        let linageInfo = this.selectedDataSnapshot["jsonLineageInfo"];
        if( linageInfo.dsId ) {
          this.dsId = linageInfo.dsId;
        }
        if( linageInfo.dfId ) {
          this.dfId = linageInfo.dfId;
        }

        this._setRuleList(linageInfo['ruleStringinfos']);
        */
        let sourceInfo = this.selectedDataSnapshot.sourceInfo;
        this.dsId = sourceInfo.dsId;
        this.dfId = sourceInfo.dfId;

        let connectionInfo = this.selectedDataSnapshot.connectionInfo;
        let ruleStringInfo = this.selectedDataSnapshot.ruleStringInfo;
        this._setRuleList(ruleStringInfo);

        // % 계산
        /*
        this.missing = this.selectedDataSnapshot.missingLines / (this.selectedDataSnapshot.validLines + this.selectedDataSnapshot.mismatchedLines + this.selectedDataSnapshot.missingLines) * 100 + '%';
        this.valid = this.selectedDataSnapshot.validLines / (this.selectedDataSnapshot.validLines + this.selectedDataSnapshot.mismatchedLines + this.selectedDataSnapshot.missingLines)  * 100 + '%';
        this.mismatched = this.selectedDataSnapshot.mismatchedLines / (this.selectedDataSnapshot.validLines + this.selectedDataSnapshot.mismatchedLines + this.selectedDataSnapshot.missingLines) * 100 + '%';
        */
        this.missing = this.selectedDataSnapshot.missingLines / this.selectedDataSnapshot.totalLines * 100 + '%';
        this.valid = (this.selectedDataSnapshot.totalLines - this.selectedDataSnapshot.missingLines - this.selectedDataSnapshot.mismatchedLines ) / this.selectedDataSnapshot.totalLines * 100 + '%';
        this.mismatched = this.selectedDataSnapshot.mismatchedLines / this.selectedDataSnapshot.totalLines * 100 + '%';

        //if ( ['SUCCEEDED'].indexOf(this.selectedDataSnapshot.status) >= 0){
        if ( [Status.SUCCEEDED].indexOf(this.selectedDataSnapshot.status) >= 0){
          this.selectedDataSnapshot.displayStatus = 'SUCCESS';
          this.getOriginData();
          this.getGridData();

        //} else if ( ['INITIALIZING','RUNNING','WRITING','TABLE_CREATING','CANCELING'].indexOf(this.selectedDataSnapshot.status) >= 0) {
        } else if ( [Status.INITIALIZING,Status.RUNNING,Status.WRITING,Status.TABLE_CREATING,Status.CANCELING].indexOf(this.selectedDataSnapshot.status) >= 0) {
          this.selectedDataSnapshot.displayStatus = 'PREPARING';

          if(isUndefined(this.selectedDataSnapshot.ruleCntDone) || isNull(this.selectedDataSnapshot.ruleCntDone)) this.selectedDataSnapshot.ruleCntDone = 0;
          if(isUndefined(this.selectedDataSnapshot.ruleCntTotal) || isNull(this.selectedDataSnapshot.ruleCntTotal)) this.selectedDataSnapshot.ruleCntTotal = 0;
          if (this.selectedDataSnapshot.ruleCntTotal > 0 && this.selectedDataSnapshot.ruleCntDone < this.selectedDataSnapshot.ruleCntTotal){
            this.progressbarWidth = Math.ceil(this.selectedDataSnapshot.ruleCntDone * 100  / (this.selectedDataSnapshot.ruleCntTotal + 1)) + "%";
          } else {
            this.progressbarWidth = '100%';
          }
          this.interval =  setInterval(() => this.getSnapshot(), 1000);

        } else  { //'FAILED','CANCELED','NOT_AVAILABLE'
          this.selectedDataSnapshot.displayStatus = 'FAIL';
          if(false===isUndefined(this.selectedDataSnapshot.custom) && "fail_msg"==this.selectedDataSnapshot.custom.match("fail_msg")) {
            this.selectedDataSnapshot.custom = JSON.parse(this.selectedDataSnapshot.custom.replace(/\n/g, '<br>').replace(/'/g, '"'));
          }
        }

      }).catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
    }

  } // end of method getSnapshot

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
        rule['desc'] = this.commandList[idx].desc;
        rule['desc'] = this.commandList[idx].desc;

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

  // 데이터스냅샷 디테일 팝업 안에 그리드데이터
  private getGridData() {

    this.loadingShow();
    this.datasnapshotservice.getDataSnapshotGridData(this.ssId, this.offset, this.target)
      .then((result) => {
        this.loadingHide();

        if(isUndefined(result.gridResponse)){
          Alert.warning(this.translateService.instant('msg.dp.alert.no.grid'));
          return;
        }

        /*
        this.originDsInfo.dsName = '';
        this.originDsInfo.qryStmt = '';
        this.originDsInfo.createdTime = '';
        if( isUndefined(result.originDsInfo) ) {
          Alert.warning(this.translateService.instant('msg.dp.alert.imported.ds.info'));
        } else {
          if( isUndefined(result.originDsInfo.dsName) ) {
            Alert.warning(this.translateService.instant('msg.dp.alert.imported.ds.name'));
            this.originDsInfo.dsName = '';
          } else {
            this.originDsInfo.dsName = result.originDsInfo.dsName;
          }
          if( isUndefined(result.originDsInfo.qryStmt) ) {
            Alert.warning(this.translateService.instant('msg.dp.alert.imported.ds.querystmt'));
          } else {
            this.originDsInfo.qryStmt = result.originDsInfo.qryStmt;
          }
          if( isUndefined(result.originDsInfo.createdTime) ) {
            Alert.warning(this.translateService.instant('msg.dp.alert.imported.ds.createdtime'));
          } else {
            this.originDsInfo.createdTime = result.originDsInfo.createdTime;
          }
        }
        */

        this.colCnt = result.gridResponse.colCnt;
        const colNames = result.gridResponse.colNames;
        const colTypes = result.gridResponse.colDescs;

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
        // let prep_error = this.dataprepExceptionHandler(error);
        // PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        Alert.error(error.details);


      });
  } // end of method getGridData



  private updateGrid(data) {

    const maxDataLen: any = {};
    const fields: Field[] = data.fields;

    let rows: any[] = data.data;

    if( 0 === fields.length || 0 === rows.length ) {
      return;
    }

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

  } // end of method updateGrid

  public downloadSnapshot() {
    let downloadFileName = this.selectedDataSnapshot.sourceInfo.dsName + ".csv";

    this.datasnapshotservice.downloadSnapshot(this.ssId).subscribe((snapshotFile) => {
      saveAs(snapshotFile, downloadFileName);
    });
  }
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
        //console.log(result.result);
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
} // end of class DataSnapshotDetailComponent
