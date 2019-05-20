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

import * as $ from "jquery";
import * as pixelWidth from 'string-pixel-width';
import {isNull, isNullOrUndefined, isUndefined} from 'util';
import * as _ from 'lodash';

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
import {AbstractComponent} from '../../../../../common/component/abstract.component';
import {DsType, ImportType, PrDataset, RsType, Rule} from '../../../../../domain/data-preparation/pr-dataset';
import {DeleteModalComponent} from '../../../../../common/component/modal/delete/delete.component';
import {PrDataflow} from '../../../../../domain/data-preparation/pr-dataflow';
import {Alert} from '../../../../../common/util/alert.util';
import {Modal} from '../../../../../common/domain/modal';
import {PreparationAlert} from '../../../../util/preparation-alert.util';
import {DataflowService} from '../../../service/dataflow.service';
import {Field} from '../../../../../domain/workbook/configurations/field/field';
import {header, SlickGridHeader} from '../../../../../common/component/grid/grid.header';
import {GridComponent} from '../../../../../common/component/grid/grid.component';
import {GridOption} from 'app/common/component/grid/grid.option';
import {DatasetService} from '../../../../dataset/service/dataset.service';
import {StringUtil} from '../../../../../common/util/string.util';
import {PreparationCommonUtil} from "../../../../util/preparation-common.util";
import {DataflowModelService} from "../../../service/dataflow.model.service";

declare let Split;

@Component({
  selector: 'app-dataset-info-popup',
  templateUrl: './dataset-info-popup.component.html',
})
export class DatasetInfoPopupComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _split:any;

  private interval : any;

  @ViewChild('dsName')
  private dsName: ElementRef;

  @ViewChild('dsDesc')
  private dsDesc: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables (INPUT)
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input() // Dataflow information
  //public dataflow: Dataflow;
  public dataflow: PrDataflow;

  // Selected data set - one to show details
  @Input('selectedDataSet')
  //public selectedDataSet : Dataset;
  public selectedDataSet : PrDataset;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables (OUTPUT)
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
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

  @Output()
  public datasetSelectPopupOpen = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
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

  public changeDetect: ChangeDetectorRef;

  public isBtnOptionOpen : boolean = false;

  public clearGrid : boolean = false;

  public DsType = DsType;
  public ImportType = ImportType;

  public prepCommonUtil = PreparationCommonUtil;

  public datasetInformationList : DatasetInformation[] ;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(public dataflowService: DataflowService,
              public dataflowModelService: DataflowModelService,
              public datasetService: DatasetService,
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

    this.clearGrid = false;
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
      { command: 'window', alias: 'Wn'},
      { command: 'setformat', alias: 'Sf'}
    ];
    if (!isNullOrUndefined(this.selectedDataSet)) {
      this.setDataset(this.selectedDataSet);
    } else {
      this.getDatasetInformationList(this.selectedDataSet);
    }

  }

  public ngAfterViewInit() {
    setTimeout( () => {
      this._split = Split(['.sys-dataflow-left-panel', '.sys-dataflow-right-panel'], { sizes: [80, 20], minSize: [300,300], onDragEnd : (() => {
          this.gridComponent.resize();
          this.datasetEventHandler.emit('resize');
        }) });
    }, 500 );
  } // function -  ngAfterViewInit

  public ngOnDestroy() {
    super.ngOnDestroy();
    if (this._split) {
      this._split.destroy();
      this._split = undefined;
    }
    this.clearExistingInterval();
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
    if( this.selectedDataSet.importType===ImportType.STAGING_DB && this.selectedDataSet.rsType!==RsType.TABLE ) {
      return null;
    } else {
      let size = -1;
      if(!_.isNil(this.selectedDataSet.totalBytes)) {
        size = this.selectedDataSet.totalBytes;
      }
      return this.formatBytes(size,1);
    }
  }


  /**
   * Get column number
   */
  public getCols(): string {
    let result = `0 column(s)`;
    if (this.selectedDataSet.gridData.fields && this.selectedDataSet.gridData.fields.length > 0) {
      result = this.selectedDataSet.gridData.fields.length + ` column(s)`;
    }
    return result;
  }

  /** get rows */
  public get getRows() {
    let rows: string = `0 row(s)`;
    if(!_.isNil(this.selectedDataSet.totalLines)) {
      if (this.selectedDataSet.totalLines === -1) {
        rows = '(counting)';
      } else {
        rows = new Intl.NumberFormat().format(this.selectedDataSet.totalLines) + ' row(s)';
        this.clearExistingInterval();
      }
    } else {
      this.clearExistingInterval();
    }
    return rows;
  }

  public get getHost() {
    if( this.selectedDataSet.importType===ImportType.DATABASE && !isNullOrUndefined(this.selectedDataSet.dcHostname)) {
      return this.selectedDataSet.dcHostname;
    } else {
      return null;
    }
  }

  public get getPort() {
    if( this.selectedDataSet.importType===ImportType.DATABASE && !isNullOrUndefined(this.selectedDataSet.dcPort)) {
      return this.selectedDataSet.dcPort;
    } else {
      return null;
    }
  }

  public get getDatabase() {
    return !isNullOrUndefined(this.selectedDataSet.dbName) ? this.selectedDataSet.dbName : this.selectedDataSet['database'];
  }

  public get getUrl() {
    return this.selectedDataSet.dcUrl;
  }

  public get getTable() {
    return this.selectedDataSet.tblName;
  }

  public get getQueryStmt() {
    return this.selectedDataSet.queryStmt;
  }

  /**
   * show dataflow list
   */
  public showDataflows(event) {
    this.isDataflowsShow = !this.isDataflowsShow;
    event.stopImmediatePropagation();
  }

  /**
   * Set dataset information
   * @param data
   */
  public setDataset(data?: PrDataset) {
    this.loadingShow();
    if(data) {
      this.selectedDataSet = data;
    }

    this.isDataflowsShow = false; // close popup
    this.isBtnOptionOpen = false;

    this.getDatasetInfo(this.selectedDataSet);
    this.clearExistingInterval();
    this.interval = setInterval(() => {
      this.getDatasetInfo(this.selectedDataSet);
    },5000);
  }


  /**
   * Close by clicking X button
   */
  public closeInfo() {
    this.closePopup.emit(this.selectedDataSet);
    this.selectedDataSet.dsId = '';
    this.isDataflowsShow = false;
    this.clearExistingInterval();
  }


  /**
   * Fetch dataset info from server
   * @param {PrDataset} selectedDatset
   */
  public getDatasetInfo(selectedDatset : PrDataset) {
    this.loadingShow();
    this.dataflowService.getDataset(selectedDatset.dsId).then((dataset: any) => {

      this.selectedDataSet = $.extend(selectedDatset, dataset);

      // 편집 중 interval 을 타면 편집창이 닫히는걸 방지
      if (!this.isDatasetNameEdit) {
        this.datasetName = this.selectedDataSet.dsName;
      }

      if (!this.isDatasetDescEdit) {
        this.datasetDesc = this.selectedDataSet.dsDesc;
      }

      setTimeout(() => {

        if(this.selectedDataSet.transformRules) {
          this.setRuleList(this.selectedDataSet.transformRules);
        }

        if(this.selectedDataSet.gridResponse) {
          this.clearGrid = false;
          this.setGridData(this.selectedDataSet.gridResponse);
        } else {
          this.clearGrid = true;
        }

        this.getDatasetInformationList(this.selectedDataSet);
        this.loadingHide();

      },0);

    }).catch((error) => {

      this.loadingHide();
      this.clearGrid = true;
      this.clearExistingInterval();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  }


  /**
   * Dataset swap button click
   * @param {string} type
   */
  public dataSwap(type: string) {

    let importedDsId = this.selectedDataSet.dsId;

    if (this.isBtnOptionOpen) {
      this.isBtnOptionOpen = false;
    }

    if (type === 'wrangled') { // wrangled 면 upstream dsId 를 찾아야함

      this.dataflowModelService.getUpstreamList().forEach((item) => {
        if (item.dsId === this.selectedDataSet.dsId) {
          importedDsId = item.upstreamDsId;
        }
      });
    }

    this.datasetSelectPopupOpen.emit({type: type, dsId : importedDsId });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Set rules
   * @param rules
   */
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

      const idx = commandNames.indexOf(rule['ruleVO'].command);
      if (idx > -1) {
        rule['command'] = this.commandList[idx].command;
        rule['alias'] = this.commandList[idx].alias;
        rule['desc'] = this.commandList[idx].desc;

        if (rule.shortRuleString) {
          rule['simplifiedRule'] = rule.shortRuleString;
        } else {
          const ruleStr = PreparationCommonUtil.simplifyRule(rule['ruleVO'], this.selectedDataSet.gridResponse.slaveDsNameMap, rule.ruleString)
          if (!isUndefined(ruleStr)) {
            rule['simplifiedRule'] = ruleStr;
          } else {
            rule['simplifiedRule'] = rule.ruleString;
          }
        }

      } else {
        rule['command'] = 'Create';
        rule['alias'] = 'Cr';
        rule['simplifiedRule'] = rule.shortRuleString ? rule.shortRuleString : rule.ruleString;
      }

      this.ruleList.push(rule);
    });
  }


  /**
   * get names of sheet
   */
  public getSheetName() : string {

    let result = "N/A";

    if (this.selectedDataSet.sheetName) {
      result = this.selectedDataSet.sheetName;
    }
    return result;

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
    if (this.datasetName.length > 150) {
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
    //.then((dataset: Dataset) => {
      .then((dataset: PrDataset) => {
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
    this.router.navigate([`/management/datapreparation/dataflow/${this.dataflow.dfId}/rule/${this.selectedDataSet.dsId}`], {skipLocationChange: true});
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


  /**
   * Clear interval
   */
  public clearExistingInterval() {
    clearInterval(this.interval);
    this.interval = undefined;
  }


  /**
   * Set dataset information according to dataset type
   * @param dataset
   */
  public getDatasetInformationList(dataset) {
    this.datasetInformationList = [];

    // WRANGLED
    if (dataset.dsType === DsType.WRANGLED) {
      this.datasetInformationList = [
        { name : this.translateService.instant('msg.comm.th.type') , value : dataset.dsType },
        {name : this.translateService.instant('msg.dp.th.summary'), value :this.getRows},
        {name : '', value : this.getCols()}
      ];

      // FILE
    }  else if (dataset.importType === ImportType.UPLOAD || dataset.importType === ImportType.URI) {

      // FIXME : use filenameBeforeUpload or storedUri ?
      let filepath : string = dataset.filenameBeforeUpload;

      this.datasetInformationList = [
        {
          name: this.translateService.instant('msg.comm.th.type'),
          value: PreparationCommonUtil.getDatasetType(dataset)
        },
        {
          name : this.translateService.instant('msg.dp.th.file'),
          value : `${filepath}`
        },
      ];

      // EXCEL
      if (PreparationCommonUtil.getFileNameAndExtension(dataset.filenameBeforeUpload)[1].toUpperCase() === 'EXCEL') {
        this.datasetInformationList.push({name : this.translateService.instant('msg.dp.th.sheet'), value : this.getSheetName() })
      }

      if (!isNullOrUndefined(this.getTotalBytes)) {
        this.datasetInformationList.push({name : this.translateService.instant('msg.comm.detail.size'), value : this.getTotalBytes });
      }

      this.datasetInformationList.push(
        {name : this.translateService.instant('msg.dp.th.summary'), value :this.getRows},
        {name : '', value : this.getCols()}
      )


      // STAGING OR DB
    } else if (dataset.importType === 'STAGING_DB' || dataset.importType === 'DATABASE') {

      this.datasetInformationList = [
        {
          name: this.translateService.instant('msg.comm.th.type'),
          value: PreparationCommonUtil.getDatasetType(dataset) }];

      if (!isNullOrUndefined(this.getDatabase)) {
        this.datasetInformationList.push({ name : `${this.translateService.instant('msg.dp.th.database')}`, value : `${this.getDatabase}` });
      }

      if (dataset.rsType === 'TABLE') {
        this.datasetInformationList.push({ name : `${this.translateService.instant('msg.lineage.ui.list.search.table')}`, value : `${this.getTable}` })
      } else {
        this.datasetInformationList.push({ name : `${this.translateService.instant('msg.lineage.ui.list.search.sql')}`, value : `${this.getQueryStmt}` })
      }

      if (dataset.importType === 'STAGING_DB') {
        if (!isNullOrUndefined(this.getTotalBytes)) {
          this.datasetInformationList.push({name : this.translateService.instant('msg.comm.detail.size'), value : this.getTotalBytes });
        }
      } else {
        if (this.getPort && this.getHost) {
          this.datasetInformationList.push({ name : `${this.translateService.instant('Host')}`, value : `${this.getHost}` },
            { name : `${this.translateService.instant('Port')}`, value : `${this.getPort}` })
        } else {
          this.datasetInformationList.push({ name : `${this.translateService.instant('Url')}`, value : `${this.getUrl}` });
        }
      }

      this.datasetInformationList.push(
        {name : this.translateService.instant('msg.dp.th.summary'), value :this.getRows},
        {name : '', value : this.getCols()})

    }
  }

  /**
   * Returns description with new line replaced with <br>
   * @param description
   */
  public getDescriptionWithBR(description: string) {
    if (description) {
      return description.replace( /\r\n|\n/gi, '<br>' );
    } else {
      return this.translateService.instant('msg.groups.ui.create.ph.desc');
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Make grid data from grid response
   * @param gridResponse
   */
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
  }


  /**
   * Set grid Data
   * @param data
   */
  private setGridData(data: any) {
    this.selectedDataSet.gridData = this.getGridDataFromGridResponse(data);

    if (this.selectedDataSet.gridData) {
      this.updateGrid(this.selectedDataSet.gridData);
    }
  }


  /**
   * Update grid
   * @param data
   */
  private updateGrid(data: any) {

    const maxDataLen: any = {};
    let fields: Field[] = data.fields;
    let rows: any[] = data.data.splice(0,50); // preview는 50 rows 까지만
    const maxLength = 500;
    if (rows.length > 0) {
      rows.forEach((row: any, idx: number) => {
        // 컬럼 길이 측정
        fields.forEach((field: Field) => {
          let colWidth: number = 0;
          if (typeof row[field.name] === 'string') {
            colWidth = Math.floor((row[field.name]).length * 12);
          }
          if (!maxDataLen[field.name] || (maxDataLen[field.name] < colWidth)) {
            if (colWidth > 500) {
              maxDataLen[field.name] = maxLength;
            } else {
              maxDataLen[field.name] = colWidth;
            }
          }
        });
        // row id 설정
        (row.hasOwnProperty('id')) || (row.id = idx);

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
        .Formatter((row, cell, value, columnDef) => {
          const colDescs = (this.selectedDataSet.gridResponse && this.selectedDataSet.gridResponse.colDescs) ? this.selectedDataSet.gridResponse.colDescs[cell] : {};
          value = PreparationCommonUtil.setFieldFormatter(value, columnDef.columnType, colDescs);

          if (isNull(value)) {
            return '<div style=\'position:absolute; top:0; left:0; right:0; bottom:0; line-height:30px; padding:0 10px; font-style: italic ; color:#b8bac2;\'>' + '(null)' + '</div>';
          } else {
            return value;
          }
        }).build();
    });

    // 헤더 필수
    // 로우 데이터 필수
    // 그리드 옵션은 선택
    if (!isNullOrUndefined(this.gridComponent)) {
      this.gridComponent.create(headers, rows, new GridOption()
        .EnableHeaderClick(false)
        .SyncColumnCellResize(true)
        .NullCellStyleActivate(true)
        .RowHeight(32)
        .EnableColumnReorder(false)
        .NullCellStyleActivate(true)
        .build()
      );
    }
  }


  /**
   * get format of bytes
   */
  private formatBytes(a,b) { // a=크기 , b=소숫점자릿

    if (a === -1) {
      return "0 Bytes";
    }

    let c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));
    return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
  }


}


class DatasetInformation {
  name: string;
  value: any;
}
