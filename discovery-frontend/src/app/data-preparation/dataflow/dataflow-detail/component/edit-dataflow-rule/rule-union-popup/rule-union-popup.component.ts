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

import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractPopupComponent } from '../../../../../../common/component/abstract-popup.component';
import { PrDataset, DsType } from '../../../../../../domain/data-preparation/pr-dataset';
import { PopupService } from '../../../../../../common/service/popup.service';
import { DataflowService } from '../../../../service/dataflow.service';
import { Alert } from '../../../../../../common/util/alert.util';
import { PreparationAlert } from '../../../../../util/preparation-alert.util';
import * as _ from 'lodash';

class Field {
  public name: string;
  public type: string;
  public seq?: number;
  public unionType?: string;
  public selected?: boolean;
} // Structure - Field

@Component({
  selector: 'app-rule-union-popup',
  templateUrl: './rule-union-popup.component.html',
})
export class RuleUnionPopupComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private maxCntFields: number = 0;    // Union 대상 데이터셋 최대 필드 수
  public isValidUnionState: boolean = true;  // Union 가능 상태인지 여부

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Input Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input() // 기존 데이터 (마스터 데이터 - 오른쪽 컬럼 첫번째로 나와야 한다)
  //public masterDataset: Dataset;
  public masterDataset: PrDataset;

  @Input() // 해당 데이터플로우 정보 필요
  public dfId: string;

  @Input()
  public serverSyncIndex: string;

  @Input()
  public editRuleStr?: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Output Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output() // 유니온 팝업을 닫을때 사용하는 eventemitter
  public unionComplete = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Result column rename
  public editResultColumnName: string;

  public datasets: PrDataset[] = [];        // 전체 데이터 셋
  public unionDatasets: PrDataset[] = [];   // 유니온 될 데이터 셋
  public resultFields: Field[] = [];        // 유니온 된 결과 컬럼 목록

  public isAddDatasetsModal: boolean = false;    // Add datasets popup show/hide

  // Union 결과 - 필드 배열
  public fieldMatrix: Field[][] = [];

  //public editInfo: Dataset[] = [];
  public editInfo: PrDataset[] = [];

  public isUpdate: boolean = false; // 수정 모드 여

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected popupService: PopupService,
              protected dataflowService: DataflowService,
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

    // 초기 데이터 설정
    this.datasets = [this.masterDataset];   // masterdataset 을 를 datasets 리스트에 추가
    this.resultFields = this.masterDataset.gridData.fields;   // 일단 result 에 마스터 넣어둔다
    this.maxCntFields = this.resultFields.length; // 최소 길이가 결과와는 동일해야 하므로..

    // 수정 정보가 있을 경우 설정해줌
    if (this.editRuleStr) {
      this.isUpdate = true;

      const jsonRuleString = JSON.parse(this.editRuleStr);
      let dsIdList: string[] = jsonRuleString.dsId;
      let dsNameList: string[] = jsonRuleString.dsName;

      const dsInfoList: PrDataset[] = dsIdList.map((dsId: string, index: number) => {
        const ds = new PrDataset();
        ds.dsId = dsId;
        ds.dsType = DsType.WRANGLED;
        ds.dsName = dsNameList[index];
        return ds;
      });

      this.editInfo = dsInfoList;
      this.unionDatasets = this.unionDatasets.concat(dsInfoList);
    }

    this.convertDataToUiType();   // 화면 형식에 맞게 데이터 변환

  } // function - ngOnInit

  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 유니온 팝업 닫기
   */
  public close() {
    this.unionComplete.emit('ruleUnionComplete');
  } // function - close

  /**
   * 유니온 룰 적용
   */
  public applyRule() {
    if (!this.isValidUnionState) {
      Alert.warning(this.translateService.instant('msg.dp.alert.same.type.apply'));
      return;
    }
    const ruleStr = this.generateRuleString();
    if (!ruleStr[0]) {
      Alert.error(ruleStr[1]);
      return;
    }

    const rule = {
      command: 'union',
      op: 'APPEND',
      ruleString: ruleStr[1],
      ruleIdx : this.serverSyncIndex,
      uiRuleString:ruleStr[2]
    };
    if (this.editRuleStr) {
      // for edit
      rule.op = 'UPDATE';
    }
    this.unionComplete.emit({ event: 'ruleUnionComplete', ruleInfo: rule });
  } // function - applyRule

  /**
   * 데이터셋 추가 팝업 열기
   */
  public openPopup() {
    this.isAddDatasetsModal = true;
  } // function - openPopup

  /**
   * 데이터셋 추가 팝업 닫기
   * @param data
   */
  public selectedDatasets(data) {
    if (null != data) {
      this.unionDatasets = data;
      this.datasets = _.union([this.masterDataset], this.unionDatasets);
      this.convertDataToUiType();
    }
    this.isAddDatasetsModal = false;
  } // function - selectedDatasets

  /**
   * dataset 하나 지우기
   */
  //public deleteDataset(dsItem: Dataset) {
  public deleteDataset(dsItem: PrDataset) {
    this.unionDatasets = this.unionDatasets.filter(ds => ds.dsId !== dsItem.dsId);
    this.datasets = [this.masterDataset].concat(this.unionDatasets);
    this.convertDataToUiType();
  } // function - deleteDataset

  /**
   * 유효하지 않은 Row 여부
   * @param {Field[]} fieldList
   * @returns {boolean}
   */
  public isDisableFieldRow(fieldList: Field[]): boolean {
    return ( fieldList.length
      === fieldList.filter(item => item.unionType === 'INCORRECT').length );
  } // function - getClassFieldRow

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 룰 문자열을 생성한다.
   */
  private generateRuleString(): [boolean, string, Object] {
    if (0 === this.resultFields.length) {
      return [false, this.translateService.instant('msp.dp.alert.no.union.result'), null];
    }
    if (0 === this.unionDatasets.length) {
      return [false, this.translateService.instant('msg.dp.alert.no.data.union'), null];
    }

    let ruleStr: string = 'union masterCol: ' + this.getColumnNamesInArray(this.resultFields,'name', '`').toString()
      + ' dataset2: ';

    // 유니온 가능한 dataset id 만 필요하기 때문에 ...
    let list = this.unionDatasets.filter((item) => {
      return item.validCount === item.gridData.fields.length;
    });

    ruleStr += this.getColumnNamesInArray(list, 'dsId', "'").toString();

    const uiRuleString = {
      name: 'union',
      dsId: this.getColumnNamesInArray(list, 'dsId'),
      dsName: this.getColumnNamesInArray(list, 'dsName'),
      isBuilder: true
    };

    return [true, ruleStr, uiRuleString];
  } // function - generateRuleString

  /**
   * 서버상의 데이터를 UI 형식에 맞게 변경
   */
  private convertDataToUiType() {
    this.fieldMatrix = [];
    if (0 < this.unionDatasets.length) {
      // 작업 스택
      const promises = [];

      // 데이터 초기화
      this.unionDatasets.forEach(dsInfo => {
        if (DsType.WRANGLED === dsInfo.dsType) {
          dsInfo.validCount = 0;
          promises.push(this.getDataset(dsInfo));
        }
      });

      this.loadingShow();

      //Promise.all(promises).then((res: Dataset[]) => {
      Promise.all(promises).then((res: PrDataset[]) => {
        // 최대 필드수 및 ds별 필드 목록 측정
        let colFields: Field[][] = [];       // maxCols
        this.maxCntFields = this.resultFields.length; // 최소 길이가 결과와는 동일해야 하므로..
        res.forEach(dsInfo => {
          colFields.push(dsInfo.gridData.fields);
          this.maxCntFields = (this.maxCntFields > dsInfo.gridData.fields.length ) ? this.maxCntFields : dsInfo.gridData.fields.length;
        });

        // 데이터 초기 설정
        this.isValidUnionState = true;

        // Row 별 필드 재배열
        for (let rowIdx = 0; rowIdx < this.maxCntFields; rowIdx++) {
          // 결과 필드 설정
          let resultField: Field;
          if (rowIdx < this.resultFields.length) {
            resultField = this.resultFields[rowIdx];
          } else {
            this.isValidUnionState = false;
            resultField = { name: 'NONE', type: 'NONE' };
          }

          // 각 데이터셋별 필드 일치 여부 판별
          let rowFields: Field[] = [];
          colFields.forEach((dsFields: Field[], dsIdx: number) => {
            if (rowIdx >= dsFields.length) {
              rowFields.push({ name: '', type: '', unionType: 'LACK' });
            } else {
              let dsFieldInRow: Field = dsFields[rowIdx];
              if ('NONE' === resultField.type) {
                rowFields.push({
                  name: ( dsFieldInRow.name ) ? dsFieldInRow.name : '',
                  type: '',
                  unionType: 'DROPPED'
                });
              } else {
                if (dsFieldInRow.name === resultField.name && dsFieldInRow.type === resultField.type) {
                  dsFieldInRow.unionType = 'CORRECT';
                  this.unionDatasets[dsIdx].validCount = this.unionDatasets[dsIdx].validCount + 1;
                } else {
                  dsFieldInRow.unionType = 'INCORRECT';
                  this.isValidUnionState = false;
                }
                rowFields.push(dsFieldInRow);
              } // end if - fieldType is not 'NONE'
            }
          });
          this.fieldMatrix.push(rowFields);

        } // end for - maxCntFields
        this.loadingHide();
      }); // - Promise.all
    } // end if - unionDatasets
  } // function - convertDataToUiType

  private getGridDataFromGridResponse(gridResponse: any) {
    let colCnt = gridResponse.colCnt;
    let colNames = gridResponse.colNames;
    let colTypes = gridResponse.colDescs;

    const gridData = {
      data: [],
      fields: []
    };

    for(let idx=0;idx<colCnt;idx++) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for(let idx=0;idx<colCnt;idx++) {
        obj[ colNames[idx] ] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - getGridDataFromGridResponse

  /**
   * 데이터 셋 조회
   * @param {PrDataset} dsInfo 데이터셋
   * @returns {Promise<PrDataset>} callback 콜백
   */
  private getDataset(dsInfo: PrDataset): Promise<PrDataset> {
    return new Promise((resolve) => {
      if (dsInfo.gridData) {
        resolve(dsInfo);
      } else {
        this.loadingShow();
        this.dataflowService.getDatasetWrangledData(dsInfo.dsId)
          .then((result) => {
            this.loadingHide();
            const griddata = this.getGridDataFromGridResponse(result['gridResponse']);
            const data = griddata.data.slice(0, 100);
            dsInfo.data = JSON.stringify(data);
            dsInfo.gridData = griddata;
            resolve(dsInfo);
          })
          .catch((error) => {
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
          });
      } // end if - dsInfo not exist griddata
    });

  } // function - getDataset


  /**
   *
   * @param fields
   * @param label
   * @param wrapChar
   */
  protected getColumnNamesInArray(fields: any, label:string, wrapChar?:string) :string[] {
    return fields.map((item) => {
      if (wrapChar) {
        return wrapChar + item[label] + wrapChar
      } else {
        return label === '' ? item.name : item[label]
      }
    });
  }

}
