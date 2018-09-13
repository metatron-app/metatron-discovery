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

import Split from 'split.js';
import * as $ from "jquery";
import * as pixelWidth from 'string-pixel-width';
import { isNull, isUndefined } from 'util';
import {
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../../../../common/component/abstract.component';
import { Dataset, ImportType, RsType, Rule } from '../../../../../domain/data-preparation/dataset';
import { DeleteModalComponent } from '../../../../../common/component/modal/delete/delete.component';
import { Dataflow } from '../../../../../domain/data-preparation/dataflow';
import { Alert } from '../../../../../common/util/alert.util';
import { Modal } from '../../../../../common/domain/modal';
import { PreparationAlert } from '../../../../util/preparation-alert.util';
import { DataflowService } from '../../../service/dataflow.service';
import { Field } from '../../../../../domain/workbook/configurations/field/field';
import { header, SlickGridHeader } from '../../../../../common/component/grid/grid.header';
import { GridComponent } from '../../../../../common/component/grid/grid.component';
import { DomSanitizer } from '@angular/platform-browser';
import { GridOption } from 'app/common/component/grid/grid.option';
import { DatasetService } from '../../../../dataset/service/dataset.service';
import { StringUtil } from '../../../../../common/util/string.util';

@Component({
  selector: 'app-dataset-info-popup',
  templateUrl: './dataset-info-popup.component.html',
})
export class DatasetInfoPopupComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _split:any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  @Input() // Dataflow information
  public dataflow: Dataflow;

  // Selected data set - one to show details
  @Input('selectedDataSet')
  public selectedDataSet : Dataset;

  @Output()
  public createSnapshotEvent = new EventEmitter();

  @Output() // event after dataflow/dataset deletion
  public initEventAfterDelete = new EventEmitter();

  @Output() // when X button is pressed
  public closePopup = new EventEmitter();

  @Output() // edit rule or create wrangled dataset
  public datasetEventHandler = new EventEmitter();

  @Output() // change different dataflow
  public changeDataflow = new EventEmitter();

  @Output()
  public updateDataflow = new EventEmitter();

  @Output() // clone
  public cloneEventHandler = new EventEmitter();

  @ViewChild(DeleteModalComponent) // To delete data set (modal popup)
  public deleteModalComponent: DeleteModalComponent;

  @ViewChild(GridComponent)
  public gridComponent: GridComponent;

  // delete selected dataflow
  public selectedDataflowId: string;

  // 룰 리스트 (룰 미리보기)
  public ruleList: any[];

  // 룰 리스트에서 필요한 변수
  public commandList: any[];
  public ruleVO: Rule = new Rule;


  // 사용된 dataflow layer show/hide
  public isDataflowsShow: boolean = false;


  public isDatasetNameEdit : boolean = false;
  public isDatasetDescEdit: boolean = false;

  public datasetName : string;
  public datasetDesc : string;

  @ViewChild('dsName')
  private dsName: ElementRef;
  @ViewChild('dsDesc')
  private dsDesc: ElementRef;

  public changeDetect: ChangeDetectorRef;

  public isBtnOptionOpen : boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(public dataflowService: DataflowService,
              public datasetService: DatasetService,
              public sanitizer: DomSanitizer,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    // Init
    super.ngOnInit();

    this.isBtnOptionOpen = false;
    this.commandList = [
      { command: 'header', alias: 'He'},
      { command: 'keep', alias: 'Ke'},
      { command: 'replace', alias: 'Rp'},
      { command: 'rename', alias: 'Rm'},
      { command: 'set', alias: 'Se'},
      { command: 'settype', alias: 'St'},
      { command: 'countpattern', alias: 'Co'},
      { command: 'split', alias: 'Sp'},
      { command: 'derive', alias: 'Dr'},
      { command: 'delete', alias: 'De'},
      { command: 'drop', alias: 'Dp'},
      { command: 'pivot', alias: 'Pv'},
      { command: 'unpivot', alias: 'Up'},
      { command: 'join', alias: 'Jo'},
      { command: 'extract', alias: 'Ex'},
      { command: 'flatten', alias: 'Fl'},
      { command: 'merge', alias: 'Me'},
      { command: 'nest', alias: 'Ne'},
      { command: 'unnest', alias: 'Un'},
      { command: 'aggregate', alias: 'Ag'},
      { command: 'sort', alias: 'So'},
      { command: 'move', alias: 'Mv'},
      { command: 'union', alias: 'Ui'},
      { command: 'setformat', alias: 'Sf'}
    ];

    this.setDataset(this.selectedDataSet);

  }

  public ngAfterViewInit() {
    setTimeout( () => {
      this._split = Split(['.sys-dataflow-left-panel', '.sys-dataflow-right-panel'], { sizes: [80, 20], minSize: [700,300], onDragEnd : (() => {
          this.gridComponent.resize();
        }) });
    }, 500 );
  } // function -  ngAfterViewInit

  public ngOnDestroy() {
    super.ngOnDestroy();
    this._split.destroy();
    this._split = undefined;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public createSnapshot() {
    this.isBtnOptionOpen = false;
    this.createSnapshotEvent.emit();
  }

  public openBtnOptions() {
    this.isBtnOptionOpen = !this.isBtnOptionOpen;
  }

  public cloneDataset() {
    this.cloneEventHandler.emit(this.selectedDataSet);
    this.isBtnOptionOpen = false;
  }

  /**
   * 데이터셋 타입 아이콘
   * @param datasetType
   */
  public getIconClass(datasetType): string {
    let result = '';
    switch (datasetType.toLowerCase()) {
      case 'dataset':
        result = 'ddp-icon-flow-dataset';
        break;
      case 'wrangled':
        result = 'ddp-icon-flow-wrangled';
        break;
      case 'db':
        result = 'ddp-icon-flow-db';
        break;
      case 'mysql':
        result = 'ddp-icon-flow-mysql';
        break;
      case 'post':
        result = 'ddp-icon-flow-post';
        break;
      case 'hive':
        result = 'ddp-icon-flow-db';
        break;
      case 'presto':
        result = 'ddp-icon-flow-presto';
        break;
      case 'phoenix':
        result = 'ddp-icon-flow-phoenix';
        break;
      case 'tibero':
        result = 'ddp-icon-flow-tibero';
        break;
      case 'file':
        result = 'ddp-icon-flow-file';
        break;
      case 'xls':
        result = 'ddp-icon-flow-xls';
        break;
      case 'xlsx':
        result = 'ddp-icon-flow-xlsx';
        break;
      case 'csv':
        result = 'ddp-icon-flow-csv';
        break;
      default:
        Alert.error(this.translateService.instant('msg.common.ui.no.icon.type'));
        break;
    }
    return result;
  }

  /** delete */
  public confirmDelete(event, id) {
    event.stopPropagation();
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.dp.alert.del.flow.title');
    modal.description = this.translateService.instant('msg.dp.alert.del.flow.sub-title');

    this.selectedDataflowId = id;
    this.deleteModalComponent.init(modal);
  }

  /**
   * Delete dataset
   * When imported dataset, only delete from this dataflow,
   * when wrangled dataset, completely delete.
   */
  public deleteDataSet() {

    this.loadingShow();
    this.dataflowService.deleteChainDataflow(this.dataflow.dfId, this.selectedDataSet.dsId).then(() => {
      this.loadingHide();
      this.initEventAfterDelete.emit();
      Alert.success(this.translateService.instant('msg.dp.ui.ds.del.success'));
    }).catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  } // function - deleteDataSet

  /**
   * get total bytes
   */
  public get getTotalBytes() {
    if( this.selectedDataSet['importType'] && this.selectedDataSet['importType']===ImportType.HIVE &&
      this.selectedDataSet['rsType'] && this.selectedDataSet['rsType']!==RsType.TABLE ) {
      return this.translateService.instant('msg.dp.alert.rstype.no.table');
    } else {
      let size = 0;
      if(true==Number.isInteger(this.selectedDataSet.totalBytes)) {
        size = this.selectedDataSet.totalBytes;
      }
      return this.formatBytes(size,1);
    }
  }

  /** get colCnt */
  public get getColCnt() {
    let colCnt = '0';

    if( this.selectedDataSet && this.selectedDataSet.gridResponse && this.selectedDataSet.gridResponse.colCnt ) {
        if(true==Number.isInteger(this.selectedDataSet.gridResponse.colCnt)) {
            colCnt = new Intl.NumberFormat().format(this.selectedDataSet.gridResponse.colCnt);
        }
    }
    return colCnt;
  }

  /** get rows */
  public get getRows() {
    let rows = '0';

    if(true==Number.isInteger(this.selectedDataSet.totalLines)) {
      if (this.selectedDataSet.totalLines === -1) {
        rows = '(counting)';
      } else {
        rows = new Intl.NumberFormat().format(this.selectedDataSet.totalLines);
      }
    }
    return rows;
  }

  public get getHost() {
    if( this.selectedDataSet['importType'] && this.selectedDataSet['importType']===ImportType.DB ) {
      return 'host from '+this.selectedDataSet['dcId'];
    }
    return null;
  }

  public get getPort() {
    if( this.selectedDataSet['importType'] && this.selectedDataSet['importType']===ImportType.DB ) {
      return 'port from '+this.selectedDataSet['dcId'];
    }
    return null;
  }

  public get getDatabase() {
    if( this.selectedDataSet['importType'] && this.selectedDataSet['importType']!==ImportType.FILE ) {
      let custom = JSON.parse( this.selectedDataSet.custom );
      if( custom['databaseName'] ) {
        return custom['databaseName'];
      }
    }
    return null;
  }

  public get getTableOrSql() {
    if( this.selectedDataSet['importType'] && this.selectedDataSet['importType']===ImportType.FILE ) {
     return null;
    }

    if( this.selectedDataSet['rsType'] && this.selectedDataSet['rsType']===RsType.TABLE ) {
      return this.selectedDataSet['tableName'];
    } else {
      return this.selectedDataSet['queryStmt'];
    }
  }

  /**
   * show dataflow list
   */
  public showDataflows(event) {
    this.isDataflowsShow = !this.isDataflowsShow;
    event.stopImmediatePropagation();
  }

  /**
   * 데이터셋 정보 설정
   */
  public setDataset(data?) {
    this.loadingShow();
    if(data) {
      this.selectedDataSet = data;
    }

    this.isDataflowsShow = false; // close popup
    this.isBtnOptionOpen = false;

    this.dataflowService.getDataset(this.selectedDataSet.dsId).then((dataset: Dataset) => {
      this.loadingHide();

      //this.previewData = dataset; //  preview 를 위한 데이터 저장
      this.selectedDataSet = $.extend(this.selectedDataSet, dataset);

      this.setDatasetName();
      this.setDatasetDescription();

      setTimeout(()=>{
        if(this.selectedDataSet.ruleStringInfos) {
          this.setRuleList(this.selectedDataSet.ruleStringInfos);
        }
        if(this.selectedDataSet.gridResponse) {
          this.setGridData(this.selectedDataSet.gridResponse);
        }
      },0);

    }).catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  } // function - setDataset

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /** 룰 리스트로 셋 하는 과정 */
  private setRuleList(rules: any) {

    this.ruleList = [];

    if (isUndefined(rules)) {
      this.ruleList = [];
      rules = [];
    }

    const commandNames = this.commandList.map((command) => {
      return command.command;
    });

    // ruleStringInfos
    rules.forEach((rule) => {

      let tempString = rule.ruleString.split('type: ');
      if (tempString[1] === 'Long') {
        rule.ruleString = tempString[0] + ' type: Integer';
      } else if(tempString[1] === 'Double') {
        rule.ruleString = tempString[0] + ' type: Float';
      }

      // 룰 수정 시 사용하기 위하여 ruleVO 세팅
      rule['ruleVO'] = JSON.parse(rule['jsonRuleString']);
      rule['ruleVO']['command'] = rule['ruleVO']['name'];
      rule['ruleVO']['ruleNo'] = rule['ruleNo'];

      const idx = commandNames.indexOf(rule['ruleVO'].name);
      if (idx > -1) {
        rule['command'] = this.commandList[idx].command;
        rule['alias'] = this.commandList[idx].alias;
        rule['desc'] = this.commandList[idx].desc;
        rule['simplifiedRule'] = this.simplifyRule(rule['ruleVO'], rule.ruleString);
      } else {
        rule['command'] = 'Create';
        rule['alias'] = 'Cr';
        rule['simplifiedRule'] = rule.ruleString;
      }

      this.ruleList.push(rule);
    });
  }

  public simplifyRule(rule : any , ruleString? : string) {

    let result : string;
    let column : string;

    if (rule.col) {
      if ('string' === typeof rule.col) {
        column = rule.col;
      } else if ('string' === typeof rule.col.value) {
        column = rule.col.value;
      } else if (rule.col.value.length === 2 ) {
        column = rule.col.value.join(', ');
      } else {
        column = `${rule.col.value.length} columns`;
      }
    }

    switch(rule.command) {
      case 'header':
        result = `Convert row${rule.rownum} to header`;
        break;
      case 'keep':
        let row = ruleString.split(": ");
        result = `Keep rows where ` + row[1];
        break;
      case 'rename':

        let toString : string = '';
        if ('string' === typeof rule.to.value) {
          toString = ` to '${rule.to['escapedValue']}'`;
        } else if ( rule.to.value.length === 2 ) {
          toString = ` to ${rule.to['value'].join(', ')}`;
        }
        result = `Rename ${column}${toString}`;
        break;
      case 'nest' :
        result = `Convert ${column} into ${rule.into}`;
        break;
      case 'setformat':
        let fomatStr : string;
        if ('string' === typeof rule.col.value) {
          fomatStr = `${column} type`
        } else if ( rule.col.value.length === 2 ) {
          fomatStr = `${column} types`;
        } else {
          fomatStr = column;
        }
        result = `Set ${fomatStr} format to ${ rule.format }`;
        break;
      case 'settype':

        let type : string;
        if (rule.type === 'Long') {
          type = 'Integer';
        } else if (rule.type === 'Double') {
          type = 'Float'
        }

        let columnStr : string;
        if ('string' === typeof rule.col.value) {
          columnStr = `${column} type`
        } else if ( rule.col.value.length === 2 ) {
          columnStr = `${column} types`;
        } else {
          columnStr = column;
        }

        result = `Change ${columnStr} to ${!isUndefined(type) ? type : rule.type }`;

        break;
      case 'delete':
        const deleteCondition = ruleString.split('row: ');
        result = `Delete rows where ${deleteCondition[1]}`;
        break;
      case 'set':
        let rowString = ruleString.split("value: ");
        result = `Set ${column} to ${rowString[1]}`;
        break;
      case 'split':
        result = `Split ${rule.col} into ${rule.limit+1 > 1 ? rule.limit+1 + ' columns' : rule.limit+1 +' column'} on ${rule.on.value}`;
        break;
      case 'extract':
        result = `Extract ${rule.on.value} ${rule.limit > 1 ? rule.limit + ' times' : rule.limit+' time'} from ${rule.col}`;
        break;
      case 'flatten':
        result = `Convert arrays in ${rule.col} to rows`;
        break;
      case 'countpattern':
        result = `Count occurrences of ${rule.on.value} in ${column}`;
        break;
      case 'sort':
        if ('string' === typeof rule.order.value) {
          result = `Sort row by ${rule.type && rule.type['escapedValue'] === 'desc' ? '-'+rule.order.value : rule.order.value}`;
          break;
        } else {
          result = `Sort rows by ${rule.type && rule.type['escapedValue'] === 'desc' ? '-'+rule.order.value.toString() : rule.order.value.toString()}`;
          break;
        }
      case 'replace':
        result = `Replace ${rule.on.value} from `;
        if('string' === typeof rule.col.value) {
          result += `${rule.col.value} with ${rule.with['value']}`;
        } else if(rule.col.value.length === 2) {
          result += `${rule.col.value.join(', ')} with ${rule.with['value']}`;
        } else {
          result += column;
        }
        break;
      case 'merge':
        result = `Concatenate ${column} separated by ${rule.with}`;
        break;
      case 'aggregate':
        result = `Aggregate with ${rule.value.escapedValue ? rule.value.escapedValue : rule.value.value.length + ' functions'} grouped by `;
        if ('string' === typeof rule.group.value) {
          result += `${rule.group.value}`
        } else if ( rule.group.value.length === 2 ) {
          result += `${rule.group.value.join(', ')}`
        } else {
          result += `${rule.group.value.length} columns`
        }
        break;
      case 'move':
        result = `Move ${column}`;
        result += `${rule.before ? ' before ' + rule.before : ' after ' + rule.after }`;
        break;
      case 'unnest' :
        result = `Create new columns from ${column}`;
        break;
      case 'union':
      case 'join':
        result = `${rule.command} with `;

        let datasetIds = [];
        if ( rule.dataset2.escapedValue ) {
          datasetIds = [rule.dataset2.escapedValue]
        } else {
          rule.dataset2.value.forEach((item) => {
            datasetIds.push(item.substring(1,item.length -1))
          })
        }

        if (datasetIds.length === 1) {
          result += `${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[0]]}`;
        } else if (datasetIds.length === 2) {
          result += `${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[0]]}, ${this.selectedDataSet.gridResponse.slaveDsNameMap[datasetIds[1]]}`;
        } else {
          result += `${datasetIds.length} datasets`;
        }

        break;
      case 'derive':
        let deriveCondition = ruleString.split('value: ');
        deriveCondition = deriveCondition[1].split(' as: ');
        result = `Create ${rule.as} from ${deriveCondition[0]}`;
        break;
      case 'pivot':
        let formula = '';
        if(rule.value.escapedValue) {
          formula = rule.value.escapedValue
        } else {
          let list = [];
          rule.value.value.forEach((item) =>{
            list.push(item.substring(1,item.length -1));
          });
          formula = list.toString();
        }
        result = `Pivot ${column} and compute ${formula} grouped by`;

        if ('string' === typeof rule.group.value || rule.group.value.length === 2) {
          result += ` ${rule.group.value}`;
        } else {
          result += ` ${rule.group.value.length} columns`;
        }
        break;
      case 'unpivot':
        result = `Convert `;
        if ('string' === typeof rule.col.value) {
          result += `${rule.col.value} into row`;
        } else if(rule.col.value.length > 1) {
          result += `${column} into rows`;
        }
        break;
      case 'drop':
        result = `Drop ${column}`;
        break;

    }
    return result
  }

  private getGridDataFromGridResponse(gridResponse: any) {
    let colCnt = gridResponse.colCnt;
    let colNames = gridResponse.colNames;
    let colTypes = gridResponse.colDescs;

    const gridData = {
      data: [],
      fields: []
    };

    for(let idx = 0;idx < colCnt; idx++ ) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for ( let idx = 0; idx < colCnt; idx++ ) {
        obj[ colNames[idx] ] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - getGridDataFromGridResponse

  /** 그리드 데이터 가공 */
  private setGridData(data: any) {
    this.selectedDataSet.gridData = this.getGridDataFromGridResponse(data);
    this.updateGrid(this.selectedDataSet.gridData);
  }

  /** 데이터 미리보기 */
  private updateGrid(data: any) {

    const maxDataLen: any = {};
    let fields: Field[] = data.fields;
    let rows: any[] = data.data.splice(0,50); // preview는 50 rows 까지만

    /*
    let total = 0;
    let limit = 260;
    if( 0 === fields.length || 0 === rows.length ) {
      return;
    }

    column width 에 따라서 preview에 보여지는 수가 다름
    fields = fields.filter((item) => {
      if (total < limit ) {
        total += (item.name.length * 10);
        return item;
      }
    });
    */

    // Row 생성 및 컬럼별 최대 길이 측정
    if (rows.length > 0 && !rows[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        // 컬럼 길이 측정
        fields.forEach((field: Field) => {
          if(field.type === 'ARRAY' ||field.type === 'MAP') {
            row[field.name] = JSON.stringify(row[field.name])
          }
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
        .Width(headerWidth > maxDataLen[field.name] ? headerWidth : isUndefined(maxDataLen[field.name]) ? headerWidth : maxDataLen[field.name])
        .MinWidth(100)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(false)
        .ColumnType(field.type)
        .Formatter((function (scope) {
          return function (row, cell, value, columnDef) {

            if (isNull(value)) {
              return '<div style=\'position:absolute; top:0; left:0; right:0; bottom:0; line-height:30px; padding:0 10px; font-style: italic ; color:#b8bac2;\'>' + '(null)' + '</div>';
            } else {
              return value;
            }
          };
        })(this))
        .build();
    });

    // 헤더 필수
    // 로우 데이터 필수
    // 그리드 옵션은 선택
    this.gridComponent.create(headers, rows, new GridOption()
      .EnableHeaderClick(false)
      .SyncColumnCellResize(true)
      .NullCellStyleActivate(true)
      .RowHeight(32)
      .EnableColumnReorder(false)
      .NullCellStyleActivate(true)
      .build()
    );


    this.loadingHide();
  }

  /**
   * get format of bytes
   */
  private formatBytes(a,b) { // a=크기 , b=소숫점자릿
    if(0==a) return "0 Bytes";
    let c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));
    return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
  }

  /**
   * get names of sheet
   */
  public get getSheetName() {
    let customJson = JSON.parse(this.selectedDataSet.custom);
    let fileType = customJson.fileType;
    if( fileType==="EXCEL" ) {
      return customJson.sheet;
    } else {
      return "N/A"
    }
  }


  /**
   * Dataflow 이름 수정
   * @Param $event
   */
  public onDatasetNameEdit($event) {
    $event.stopPropagation();
    this.isDatasetNameEdit = !this.isDatasetNameEdit;

    if (this.isDatasetDescEdit) {
      this.isDatasetDescEdit = false;
    }

    if(this.datasetName !== this.selectedDataSet.dsName) {
      this.datasetName = this.selectedDataSet.dsName;
    }

    this.changeDetect.detectChanges();
    this.dsName.nativeElement.focus();
  }

  /**
   * Dataflow 이름 수정
   * @Param $event
   */
  public onDatasetDescEdit($event) {
    $event.stopPropagation();
    this.isDatasetDescEdit = !this.isDatasetDescEdit;

    if (this.isDatasetNameEdit) {
      this.isDatasetNameEdit = false;
    }

    if(this.datasetDesc !== this.selectedDataSet.dsDesc) {
      this.datasetDesc = this.selectedDataSet.dsDesc;
    }

    this.changeDetect.detectChanges();
    this.dsDesc.nativeElement.focus();
  }

  /**
   * 데이터 셋 갱신
   */
  public updateDataset() {
    if (this.datasetName.trim() === '' || this.datasetName.length < 1) {
      Alert.warning(this.translateService.instant('msg.comm.ui.create.name'));
      return;
    }

    // 이름 validation
    if (this.datasetName.length > 50) {
      Alert.warning(this.translateService.instant('msg.dp.alert.name.error.description'));
      return;
    }
    // 설명 validation
    if (!StringUtil.isEmpty(this.datasetDesc) && this.datasetDesc.length > 150) {
      Alert.warning(this.translateService.instant('msg.dp.alert.description.error.description'));
      return;
    }

    // 서버에 보낼 이름 설명 앞뒤 공백 제거
    this.datasetName = this.datasetName.trim();
    this.datasetDesc ? this.datasetDesc = this.datasetDesc.trim() : null;

    const newDataset = {
      dsId: this.selectedDataSet.dsId,
      dsName: this.datasetName,
      dsDesc: this.datasetDesc
    };
    this.loadingShow();
    this.datasetService.updateDataset(newDataset)
      .then((dataset: Dataset) => {
        this.isDatasetNameEdit = false;
        this.isDatasetDescEdit = false;
        this.selectedDataSet = dataset;
        this.datasetName = dataset.dsName;
        this.datasetDesc = dataset.dsDesc;
        this.dsName.nativeElement.blur();
        this.dsDesc.nativeElement.blur();
        this.loadingHide();
        this.updateDataflow.emit(this.selectedDataSet);
        // this.getDataset();
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  } // function - updateDataset


  /**
   * 룰 편집 화면으로 이동
   */
  public onEditRulesBtnClicked() {
    this.gridComponent.destroy();
    this.datasetEventHandler.emit('update-rules');
  }

  /**
   * 데이터셋 이름을 실제 db와 같게 set
   */
  public setDatasetName() {
    this.isDatasetNameEdit = false;
    if (this.datasetName !== this.selectedDataSet.dsName) {
      this.datasetName = this.selectedDataSet.dsName;
    }

  }

  /**
   * 데이터셋 설명을 실제 db와 같게 set
   */
  public setDatasetDescription() {
    this.isDatasetDescEdit = false;
    if (this.datasetDesc !== this.selectedDataSet.dsDesc) {
      this.datasetDesc = this.selectedDataSet.dsDesc;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}

