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

import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
//import { Dataset, DsType, Field, ImportType, RsType } from '../../domain/data-preparation/dataset';
import { PrDataset, DsType, Field, ImportType, RsType } from '../../domain/data-preparation/pr-dataset';
import { GridComponent } from '../../common/component/grid/grid.component';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { Alert } from '../../common/util/alert.util';
import { GridOption } from '../../common/component/grid/grid.option';
import { Modal } from '../../common/domain/modal';
import { PreparationAlert } from '../util/preparation-alert.util';
import { header, SlickGridHeader } from '../../common/component/grid/grid.header';
import { DatasetService } from './service/dataset.service';
import { DataflowService } from '../dataflow/service/dataflow.service';
import { StringUtil } from '../../common/util/string.util';
import { ActivatedRoute } from '@angular/router';
//import { Dataflow } from '../../domain/data-preparation/dataflow';
import { PrDataflow } from '../../domain/data-preparation/pr-dataflow';
import { CreateSnapshotPopup } from '../component/create-snapshot-popup.component';
import { SnapshotLoadingComponent } from '../component/snapshot-loading.component';
import { PreparationCommonUtil } from "../util/preparation-common.util";

import { isNull, isNullOrUndefined, isUndefined } from "util";
import * as pixelWidth from 'string-pixel-width';

declare let moment: any;

@Component({
  selector: 'app-dataset-detail',
  templateUrl: './dataset-detail.component.html'
})

export class DatasetDetailComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  @ViewChild(CreateSnapshotPopup)
  private createSnapshotPopup : CreateSnapshotPopup;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public dataset: any;

  public fields : Field[];

  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  // dataset option layer show/hide
  public isDatasetOptionShow: boolean = false;

  // 사용된 dataset layer show/hide
  public isDatasetNameEditMode: boolean = false;

  // dataset option layer show/hide
  public isDatasetDescEditMode: boolean = false;

  // delete selected dataset
  public selectedDatasetId: string;

  // number of columns in wrangled dataSet
  public wrangledDatasetColumn: number;

  // number of columns in imported dataSet
  public importedDatasetColumn: any;

  // container for dataset name & description - edit
  public datasetName: string = '';
  public datasetDesc: string = '';

  public datasetId : string ='';

  public datasetInformationList : DatasetInformation[] ;
  // public datasetInformationList : object[] ;
  public interval : any;

  public isSelectDataflowOpen: boolean = false;

  public dfStr : string;

  @ViewChild('dsName')
  private dsName: ElementRef;
  @ViewChild('dsDesc')
  private dsDesc: ElementRef;

  @ViewChild(SnapshotLoadingComponent)
  public snapshotLoadingComponent : SnapshotLoadingComponent;

  public prepCommonUtil = PreparationCommonUtil;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasetService: DatasetService,
              private dataflowService: DataflowService,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();

    // Router에서 파라미터 전달 받기
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.datasetId = params['id'];
        this._getPreviewData();
        this.interval = setInterval(()=> {this._getPreviewData();},3000);
      }
    });
  }

  public ngOnDestroy() {
    clearInterval(this.interval);
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public snapshotCreateFinish(data) {
    this.snapshotLoadingComponent.init(data);
  }

  /** 데이터셋 리스트로 돌아간다 */
  public close() {
    clearInterval(this.interval);
    this.router.navigate(['/management/datapreparation/dataset']);
  } // function - close

  /**
   * 데이터셋 옵션 레이어 toggle (우측상단)
   */
  public showOption(event) {
    this.isDatasetOptionShow = !this.isDatasetOptionShow;
    event.stopImmediatePropagation();
  }

  /**
   * 옵션 레이어 숨기기(우측상단)
   */
  public hideOption() {
    this.isDatasetOptionShow = false;
  }

  /**
   * 삭제 확인창 표시
   * @param event
   * @param dataset
   */
  public confirmDelete(event, dataset) {

    event.stopPropagation();
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.comm.ui.del.description');
    modal.description = this.translateService.instant('msg.dp.alert.ds.del.sub.description');
    this.selectedDatasetId = dataset.dsId;
    this.deleteModalComponent.init(modal);

  } // function - confirmDelete

  /**
   * 데이터 셋 삭제
   */
  public deleteDataset() {
    this.loadingShow();
    this.datasetService.deleteChainDataset(this.selectedDatasetId).then(() => {
      Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
      this.loadingHide();
      this.close();
    }).catch(() => {
      Alert.error(this.translateService.instant('msg.comm.alert.delete.fail'));
      this.loadingHide();
    });
  } // function - deleteDataset

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
      dsId: this.dataset.dsId,
      dsName: this.datasetName,
      dsDesc: this.datasetDesc
    };
    this.loadingShow();
    this.datasetService.updateDataset(newDataset)
      //.then((dataset: Dataset) => {
      .then((dataset: PrDataset) => {
        this.isDatasetNameEditMode = false;
        this.isDatasetDescEditMode = false;
        this.dataset = dataset;
        this.datasetName = dataset.dsName;
        this.datasetDesc = dataset.dsDesc;
        this.dsName.nativeElement.blur();
        this.dsDesc.nativeElement.blur();
        this.loadingHide();
        this._getPreviewData();
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  } // function - updateDataset

  /**
   * 데이터셋 이름을 실제 db와 같게 set
   */
  public setDatasetName() {
    this.isDatasetNameEditMode = false;
    if (this.datasetName !== this.dataset.dsName) {
      this.datasetName = this.dataset.dsName;
    }

  }

  /**
   * 데이터셋 설명을 실제 db와 같게 set
   */
  public setDatasetDescription() {
    this.isDatasetDescEditMode = false;
    if (this.datasetDesc !== this.dataset.dsDesc) {
      this.datasetDesc = this.dataset.dsDesc;
    }
  }

  /**
   * 데이터셋 이름 편집 인풋 활성화/비활성화
   */
  public onDatasetNameEdit($event) {
    $event.stopPropagation();
    this.isDatasetNameEditMode = !this.isDatasetNameEditMode;

    if (this.isDatasetDescEditMode) {
      this.isDatasetDescEditMode = false;
    }

    if (this.datasetDesc !== this.dataset.dsDesc) {
      this.datasetDesc = this.dataset.dsDesc;
    }

    this.changeDetect.detectChanges();
    this.dsName.nativeElement.focus();
  }

  /**
   * 데이터셋 설명 편집 인풋 활성화/비활성화
   */
  public onDatasetDescEdit($event) {
    $event.stopPropagation();
    this.isDatasetDescEditMode = !this.isDatasetDescEditMode;

    if (this.isDatasetNameEditMode) {
      this.isDatasetNameEditMode = false;
    }

    if (this.datasetName !== this.dataset.dsName) {
      this.datasetName = this.dataset.dsName;
    }

    this.changeDetect.detectChanges();
    this.dsDesc.nativeElement.focus();
  }

  /** get total bytes */
  public get getTotalBytes() {
  /*
    if( this.dataset['importType'] && this.dataset['importType']===ImportType.HIVE &&
      this.dataset['rsType'] && this.dataset['rsType']!==RsType.TABLE ) {
      return this.translateService.instant('msg.dp.alert.rstype.no.table');
    } else if( this.dataset['importType'] && this.dataset['importType']===ImportType.DB ) {
      return this.translateService.instant('msg.dp.alert.importtype.db');
      */
    if( this.dataset.importType===ImportType.STAGING_DB &&
      this.dataset.rsType!==RsType.TABLE ) {
      return this.translateService.instant('msg.dp.alert.rstype.no.table');
    } else if( this.dataset.importType===ImportType.DATABASE ) {
      return this.translateService.instant('msg.dp.alert.importtype.db');
    } else {
      let size = 0;
      if(true==Number.isInteger(this.dataset.totalBytes)) {
        size = this.dataset.totalBytes;
      }
      return this._formatBytes(size,1);
    }
  }

  // /** 엑섹인지 여 */
  // public isExcel(ds:any) {
  //   if( ds.importType && ds.importType === 'FILE' ) {
  //     if( ds.custom ) {
  //       let customJson = JSON.parse(ds.custom);
  //       //if( customJson.fileType && customJson.fileType==='EXCEL') {
  //       if( customJson.sheet ) {
  //         return true;
  //       }
  //     }
  //   }
  //   return false;
  // }

  /** get row count */
  public getRows() {
    let rows = '0';
    if(true==Number.isInteger(this.dataset.totalLines)) {
      if (this.dataset.totalLines === -1) {
        rows = '(counting)';
      } else {
        rows = new Intl.NumberFormat().format(this.dataset.totalLines);
        if (rows === '0' || rows === '1') {
          rows = rows + ' row';
        } else {
          rows = rows + ' rows';
        }
        clearInterval(this.interval);
      }
    }
    return rows;
  }

  public get getHost() {
    //if( this.dataset['importType'] && this.dataset['importType']===ImportType.DB && !isNullOrUndefined(this.dataset.connectionInfo['hostname'])) {
    if( this.dataset.importType===ImportType.DATABASE && !isNullOrUndefined(this.dataset.connectionInfo['hostname'])) {
      //return 'host from '+this.dataset['dcId'];
      return this.dataset.connectionInfo['hostname'];
    }
    return null;
  }

  public get getPort() {
    //if( this.dataset['importType'] && this.dataset['importType']===ImportType.DB && !isNullOrUndefined(this.dataset.connectionInfo['port'])) {
    if( this.dataset.importType===ImportType.DATABASE && !isNullOrUndefined(this.dataset.connectionInfo['port'])) {
      //return 'port from '+this.dataset['dcId'];
      return this.dataset.connectionInfo['port'];
    }
    return null;
  }

  public get getDatabase() {
    return this.dataset.dbName;
  /*
    if( this.dataset['importType'] && this.dataset['importType']!==ImportType.FILE ) {
      let custom = JSON.parse( this.dataset.custom );
      if( custom['databaseName'] ) {
        return custom['databaseName'];
      }
    }
    return null;
    */
  }

  public get getTableOrSql() {
  /*
    if( this.dataset['importType'] && this.dataset['importType']===ImportType.FILE ) {
      return null;
    }

    if(this.getPort !== null && this.getHost !== null) {
      return this.dataset['tableName'];
    } else {
      return this.dataset['queryStmt'];
    }
    */
    if( this.dataset.importType===ImportType.DATABASE || this.dataset.importType===ImportType.STAGING_DB ) {
      if(this.getPort !== null && this.getHost !== null) {
        return this.dataset.tblName;
      } else {
        return this.dataset.queryStmt;
      }
    }
    return null;
  }

  /**
   * 해당 데이터 플로우로 이동
   * @param dataset
   */
  public navigateToDataflow(dataset) {
    this._savePrevRouterUrl();
    this.router.navigate(['/management/datapreparation/dataflow', dataset.dfId]);

  }

  /**
   * Create new dataflow and add this dataset into that flow
   */
  public createNewFlow() {

    let today = moment();
    //let param = new Dataflow();
    let param = new PrDataflow();
    param.datasets = [this.dataset['_links'].self.href];
    param.dfName = `${this.dataset.dsName}_${today.format('MM')}${today.format('DD')}_${today.format('HH')}${today.format('mm')}`  ;
    this.loadingShow();
    this.dataflowService.createDataflow(param).then((result) => {
      this.loadingHide();
      if (result.dfId) {
        this.router.navigate(['/management/datapreparation/dataflow', result.dfId]);
        this.cookieService.set('FIND_WRANGLED',this.datasetId);
        Alert.success(this.translateService.instant('msg.dp.alert.create-df.success',{value:result.dfName}));
      }
    }).catch((error)=>{
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    })
  }

  /**
   * Add this dataset into existing dataflow
   */
  public addToExistingFlow() {

    // open popup
    this.isSelectDataflowOpen = true;

    if (this.dataset.dataflows.length > 0) {
      this.dfStr = this.dataset.dataflows.map((item) => {
        return item.dfId
      }).join(',')
    }

  }


  public closeSelectDataflow() {
    // close popup
    this.isSelectDataflowOpen = false;
  }


  /**
   * 데이터셋 information을 타입별로 정리
   * @param dataset
   */
  public getDatasetInformationList(dataset) {
    this.datasetInformationList = [];
    if (dataset.dsType === DsType.WRANGLED) {
      this.datasetInformationList = [{ name : this.translateService.instant('msg.comm.th.type') , value : dataset.dsType },
        {name : this.translateService.instant('msg.dp.th.summary'), value : `${this.getRows()} / ${this.importedDatasetColumn } ${this.importedDatasetColumn === '1' || this.importedDatasetColumn === '0' ? 'column': 'columns'}` }
      ]
    //}  else if (dataset.importType === ImportType.FILE) {
    }  else if (dataset.importType === ImportType.UPLOAD || dataset.importType === ImportType.URI) {
      let filepath : string = dataset.importType === ImportType.UPLOAD? dataset.filenameBeforeUpload : dataset.storedUri;

      //this.datasetInformationList = [{ name : this.translateService.instant('msg.comm.th.type') , value : `${dataset.importType} (${this.getDatasetType(dataset.importType, dataset.filename)})`},
      this.datasetInformationList = [{ name : this.translateService.instant('msg.comm.th.type') , value : `${this.prepCommonUtil.getImportType(dataset.importType)} (${this.getDatasetType(dataset.importType, filepath)})`},
        //{name : this.translateService.instant('msg.dp.th.file'), value : `${filepath}` },
        {name : this.translateService.instant('msg.dp.th.file'), value : `${filepath}` },
      ];

      //if (this.getDatasetType(dataset.importType, dataset.filename) === 'EXCEL') {
      if (this.getDatasetType(dataset.importType, filepath) === 'EXCEL') {
        this.datasetInformationList.push({name : this.translateService.instant('msg.dp.th.sheet'), value : this.getSheetName() })
      }

      this.datasetInformationList.push({name : this.translateService.instant('msg.comm.detail.size'), value : this.getTotalBytes },
        {name : this.translateService.instant('msg.dp.th.summary'), value : `${this.getRows()} / ${this.importedDatasetColumn } ${this.importedDatasetColumn === '1' || this.importedDatasetColumn === '0' ? 'column': 'columns'}`})

    //} else if (dataset.importType === 'HIVE') {
    } else if (dataset.importType === 'DATABASE' || dataset.importType === 'STAGING_DB') {
      this.datasetInformationList = [
        //{ name : this.translateService.instant('msg.comm.th.type') , value : `${dataset.importType === 'HIVE' ? 'Staging DB' : 'DB'}` },
        { name : this.translateService.instant('msg.comm.th.type') , value : `${dataset.importType === 'STAGING_DB' ? 'Staging DB' : 'DB'}` },
        { name : `${this.translateService.instant('msg.lineage.ui.list.search.table')}/${this.translateService.instant('msg.lineage.ui.list.search.sql')}`, value : `${this.getTableOrSql}` },
        { name : this.translateService.instant('msg.comm.detail.size') , value : this.getTotalBytes },
        { name : this.translateService.instant('msg.dp.th.summary'), value : `${this.getRows()} / ${this.importedDatasetColumn } ${this.importedDatasetColumn === '1' || this.importedDatasetColumn === '0' ? 'column': 'columns'}` }
      ];
    } else {
      //this.datasetInformationList.push({ name : this.translateService.instant('msg.comm.th.type') , value : `${dataset.importType === 'HIVE' ? 'Staging DB' : 'DB'}` });
      this.datasetInformationList.push({ name : this.translateService.instant('msg.comm.th.type') , value : `${dataset.importType === 'STAGING_DB' ? 'Staging DB' : 'DB'}` });
      if(this.getHost) this.datasetInformationList.push({ name : this.translateService.instant('msg.comm.th.host'), value : this.getHost });
      if(this.getPort) this.datasetInformationList.push({ name : this.translateService.instant('msg.comm.th.port'), value : this.getPort });
      if(this.getDatabase) this.datasetInformationList.push({ name : this.translateService.instant('msg.dp.th.database'), value : this.getDatabase });
      this.datasetInformationList.push({ name : this.translateService.instant('msg.dp.th.table')+'/'+this.translateService.instant('msg.lineage.ui.list.search.sql'), value : `${this.getPort !== null && this.getHost !== null ? dataset.tableName : dataset.queryStmt}` });
      this.datasetInformationList.push({ name : this.translateService.instant('msg.dp.th.summary'), value : `${this.getRows()} / ${this.importedDatasetColumn } ${this.importedDatasetColumn === '1' || this.importedDatasetColumn === '0' ? 'column': 'columns'}` });
    }
  }

  public getDatasetType(type: ImportType, fileName : string) : string {

    let result = '';
    //if (type === ImportType.FILE) {
    if (type === ImportType.UPLOAD) {
      let extension = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName)[1];
      if(extension.toUpperCase() === 'XLSX' || extension.toUpperCase() === 'XLS') {
        result =  'EXCEL'
      } else if (extension.toUpperCase() === 'CSV' || extension.toUpperCase() === 'TXT') {
        result =  'CSV'
      } else if (extension.toUpperCase() === 'JSON') {
        result =  'JSON'
      }
    }
    return result;
  }

  /**
   * get names of sheet
   */
  public getSheetName() : string {

    let result = "N/A";
    /*
    if (this.dataset.custom) {
      let customJson = JSON.parse(this.dataset.custom);
      result = customJson.sheet ? customJson.sheet : "N/A";
    }
    */
    if(this.dataset.sheetName) {
      result = this.dataset.sheetName;
    }
    return result;

  }

  /**
   * Create snapshot (only wrangled)
   */
  public createSnapshot() {
    this.createSnapshotPopup.init({id : this.dataset.dsId , name : this.dataset.dsName, fields : this.fields});
  } // function - createSnapshot

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터셋 아이디 저장
   */
  private _savePrevRouterUrl(): void {
    this.cookieService.set('SELECTED_DATASET_ID', this.dataset.dsId);
    this.cookieService.set('SELECTED_DATASET_TYPE', this.dataset.dsType);
  }

  private _formatBytes(a,b) { // a=크기 , b=소숫점자릿
    if(0==a) return "0 Bytes";
    let c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));
    return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
  }

  /**
   * 데이터셋 미리보기 정리
   */
  private _getPreviewData() {
    this.datasetService.getDataPreview(this.datasetId).then((result) => {
      this.dataset = result;
      this.setDatasetName();
      this.setDatasetDescription();

      if (this.dataset['dataflows'] && this.dataset['dataflows']) {
        this.dataset.dataflows = this.dataset['dataflows'];
      } else {
        this.dataset.dataflows = [];
      }

      if (result.dsType === DsType.WRANGLED) { // always show grid when wrangled
        this.datasetService.getDatasetWrangledData(result.dsId).then((wrangledDataset) => {
          if (wrangledDataset.errorMsg) {
            Alert.error(wrangledDataset.errorMsg);
          } else {
            if (wrangledDataset.gridResponse) {
              this.dataset.gridResponse = wrangledDataset.gridResponse;
              this.importedDatasetColumn = wrangledDataset.gridResponse.colCnt; // number of columns in wrangled dataSet
              const gridData = this._getGridDataFromGridResponse(wrangledDataset.gridResponse);
              this.fields = gridData.fields;
              this.getDatasetInformationList(this.dataset);
              this._updateGrid(gridData);
              this.loadingHide();
            }
          }

        })
          .catch((error) => {

            clearInterval(this.interval);
            let prep_error = this.dataprepExceptionHandler(error);
            PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
          });
      } else {
        if (result.gridResponse) {
          this.importedDatasetColumn = result.gridResponse.colCnt;
          const gridData = this._getGridDataFromGridResponse(result.gridResponse);
          this.getDatasetInformationList(this.dataset);
          this._updateGrid(gridData);
        } else {
          this.datasetService.getImportedPreviewReload(this.dataset.dsId).then((preview: any) => {
            if(!isUndefined(preview['gridResponse'])) {
              result.gridResponse = preview['gridResponse'];
              this.importedDatasetColumn = result.gridResponse.colCnt;
              const gridData = this._getGridDataFromGridResponse(result.gridResponse);
              this.getDatasetInformationList(this.dataset);
              this._updateGrid(gridData);
            }
          }).catch((error) => {
            clearInterval(this.interval);
            let prep_error = this.dataprepExceptionHandler(error);
            PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
          });
        }
      }
    })
      .catch((error) => {
        clearInterval(this.interval);
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });

  } // function - getPreviewData

  /**
   * API의 gridResponse 를 통해서 UI 상의 그리드데이터를 얻는다
   * @param gridResponse 매트릭스 정보
   * @returns 그리드 데이터
   */
  private _getGridDataFromGridResponse(gridResponse: any) {
    let colCnt = gridResponse.colCnt;
    let colNames = gridResponse.colNames;
    let colTypes = gridResponse.colDescs;

    const gridData = {
      data: [],
      fields: []
    };

    for ( let idx = 0; idx < colCnt; idx++ ) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for ( let idx = 0;idx < colCnt; idx++ ) {
        obj[ colNames[idx] ] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - getGridDataFromGridResponse

  /**
   * 그리드 갱신
   * @param {any} data 데이터셋
   */
  private _updateGrid(data: any) {
    const maxDataLen: any = {};
    const fields: Field[] = data.fields;

    let rows: any[] = data.data;

    if( 0 === fields.length || 0 === rows.length ) {
      return;
    }

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
        .Width(headerWidth > maxDataLen[field.name] ? headerWidth : maxDataLen[field.name])
        .MinWidth(100)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(false)
        .ColumnType(field.type)
        .Formatter(( row, cell, value, columnDef ) => {
          const colDescs = (this.dataset.gridResponse && this.dataset.gridResponse.colDescs) ? this.dataset.gridResponse.colDescs[cell] : {};
          value = PreparationCommonUtil.setFieldFormatter(value, columnDef.columnType, colDescs);
          if (isNull(value)) {
            return '<div style=\'position:absolute; top:0; left:0; right:0; bottom:0; line-height:30px; padding:0 10px; font-style: italic ; color:#b8bac2;\'>' + '(null)' + '</div>';
          } else {
            return value;
          }
        }).build();
    });

    setTimeout(() => {
      if (!isNullOrUndefined(this.gridComponent)) {
        this.gridComponent.create(headers, rows, new GridOption()
          .SyncColumnCellResize(true)
          .EnableColumnReorder(false)
          .RowHeight(32)
          .NullCellStyleActivate(true)
          .build()
        )
      }
    },400);
  } // function - updateGrid


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}

class DatasetInformation {
  name: string;
  value: any;
}
