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
  Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';
import { AbstractComponent } from '../../common/component/abstract.component';
import { GridComponent } from '../../common/component/grid/grid.component';
import { DatasetService } from '../dataset/service/dataset.service';
import { PrDataset, Field } from '../../domain/data-preparation/pr-dataset';
import { header, SlickGridHeader } from '../../common/component/grid/grid.header';
import { isNull, isUndefined, isNullOrUndefined } from 'util';
import { GridOption } from '../../common/component/grid/grid.option';
import * as pixelWidth from 'string-pixel-width';
declare let moment : any;

@Component({
  selector: 'app-dataset-summary',
  templateUrl: './dataset-summary.component.html',
  providers: [MomentDatePipe]
})
export class DatasetSummaryComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private selectedDatasetId : string;

  private _timeOut: any;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(GridComponent)
  public gridComponent: GridComponent;

  @Output('close')
  public closeEvent = new EventEmitter();

  @Input()
  public datasetId : string;

  public dataset : PrDataset;

  public isRequested: boolean = false;

  public interval ;

  public dsInformationList : DsInfo[];

  public clearGrid: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private datasetService : DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.clearExistingTimeout();
    super.ngOnDestroy();
  }

  ngOnChanges(changes : SimpleChanges) {

    if (this.selectedDatasetId !== changes['datasetId'].currentValue) {
      this.selectedDatasetId = changes['datasetId'].currentValue;
      this.dataset = new PrDataset();
      this.getDatasetInfo();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * Get dataset information
   */
  public getDatasetInfo() {
    this.loadingShow();
    if (!this.isRequested) {
      this.isRequested = true;
      this.datasetService.getDatasetDetail(this.selectedDatasetId).then((data: PrDataset) => {
        this.loadingHide();
        this.isRequested = false;

        if (data) {
          this.dataset = data;
          if (data.gridResponse) {
            this.clearGrid = false;
            this._setGridData(data.gridResponse);
          } else {
            this.clearGrid = true;
          }
          this.changeDetect.detectChanges();
          this._setDsInformationList(this.dataset);

          this.clearExistingTimeout();
          // FIXME : Used recursive instead of interval. Which is better?
          if (this.dataset.totalLines === -1) {
            this._timeOut = setTimeout(() => {
              this.getDatasetInfo();
            }, 3000)
          }
        } else {
          this.datasetFetchFail();
        }

      }).catch(() => {
        this.datasetFetchFail();
      })
    }
    this.clearExistingTimeout();
    this.loadingHide();
  } // function - getDatasetInfo


  /**
   * What happens when dataset detail fetch fails
   */
  public datasetFetchFail() {
    this.loadingHide();
    this.clearExistingTimeout();

    this.dataset = new PrDataset();
    this.isRequested = false;
    this.clearGrid = true;
    this._setDsInformationList();
  }


  /** get rows */
  public get getRows() {
    let rows = '0 row(s)';

    if(!isNullOrUndefined(this.dataset.totalLines) && Number.isInteger(this.dataset.totalLines)) {
      if (this.dataset.totalLines === -1) {
        rows = '(counting)';
      } else {
        rows = new Intl.NumberFormat().format(this.dataset.totalLines) + ' row(s)';
      }
    }
    return rows;
  }



  /**
   * close popup
   */
  public closeBtn() {
    this.clearExistingTimeout();
    this.closeEvent.emit();
  } // function - closeBtn


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * get format of bytes
   * @param val 크기
   * @param decimalPoint 소수점 자릿
   */
  private _formatBytes(val, decimalPoint) {
    if ( -1 === val ) return "0 Bytes";
    let c=1024,d=decimalPoint||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(val)/Math.log(c));
    return parseFloat((val/Math.pow(c,f)).toFixed(d))+" "+e[f]
  } // function - _formatBytes


  /**
   * 그리드 데이터 가공
   * @param data
   * */
  private _setGridData(data: any) {
    this._updateGrid(this._getGridDataFromGridResponse(data));
  } // function - _setGridData

  /**
   * 데이터 미리보기
   * @param data
   * */
  private _updateGrid(data: any) {

    const maxDataLen: any = {};
    let fields: Field[] = data.fields;
    let rows: any[] = data.data.splice(0,50); // preview는 50 rows 까지만

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
          return function (row, cell, value) {
            if (isNull(value)) {
              return '<div style=\'position:absolute; top:0; left:0; right:0; bottom:0px; line-height:30px; padding:0 10px; font-style: italic ; color:#b8bac2;\'>' + '(null)' + '</div>';
            } else {
              return value;
            }
          };
        })(this))
        .build();
    });

    setTimeout(() => {
      this.gridComponent.create(headers, rows, new GridOption()
        .EnableHeaderClick(false)
        .SyncColumnCellResize(true)
        .NullCellStyleActivate(true)
        .RowHeight(32)
        .NullCellStyleActivate(true)
        .build()
      );
    })
  } // function - _updateGrid


  /**
   * 그리드를 그릴수 있는 구조로 변경
   * @param gridResponse
   * @return
   */
  private _getGridDataFromGridResponse(gridResponse: any) {
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
  } // function - _getGridDataFromGridResponse


  /**
   * Clear timeout
   */
  private clearExistingTimeout() {
    if (!isNullOrUndefined(this._timeOut)) {
      clearTimeout(this._timeOut);
      this._timeOut = undefined;
    }
  }

  /**
   * Set dataset information into list
   * @param dataset
   * @private
   */
  private _setDsInformationList(dataset? : PrDataset) {

    this.dsInformationList = [];

    if (dataset) { // 서버에러나면 데이터셋 정보가 없을 수 있음
      this.dsInformationList.push({label : this.translateService.instant('msg.comm.detail.created')
        , value : moment.utc(dataset.createdTime).format('YYYY-MM-DD HH:mm')});

      if (dataset.dcType !== 'JDBC') {
        this.dsInformationList.push({label : this.translateService.instant('msg.comm.detail.size')
          , value : this._getTotalBytes(dataset.totalBytes)});
      }

      this.dsInformationList.push({label : this.translateService.instant('msg.comm.detail.rows')
        , value : this.getRows });
    }

  }


  /**
   * get total bytes
   * @param bytes
   */
  private _getTotalBytes(bytes) {

    let size = -1;
    if(!isNullOrUndefined(bytes) && Number.isInteger(bytes)) {
      size = bytes;
    }
    return this._formatBytes(size,1);
  }

}


class DsInfo {
  label: string;
  value: string;
}
