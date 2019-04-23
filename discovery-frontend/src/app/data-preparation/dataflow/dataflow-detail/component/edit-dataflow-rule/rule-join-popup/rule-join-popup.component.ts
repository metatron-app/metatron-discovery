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

import * as $ from 'jquery';
import { AbstractPopupComponent } from '../../../../../../common/component/abstract-popup.component';
import {
  AfterViewInit, Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { GridComponent } from '../../../../../../common/component/grid/grid.component';
import { PrDataset, DsType, Field } from '../../../../../../domain/data-preparation/pr-dataset';
import { PopupService } from '../../../../../../common/service/popup.service';
import { DataflowService } from '../../../../service/dataflow.service';
import { DatasetService } from '../../../../../dataset/service/dataset.service';
import { Alert } from '../../../../../../common/util/alert.util';
import { PreparationAlert } from '../../../../../util/preparation-alert.util';
import { StringUtil } from '../../../../../../common/util/string.util';
import { header, SlickGridHeader } from '../../../../../../common/component/grid/grid.header';
import { GridOption } from '../../../../../../common/component/grid/grid.option';
import { isNull, isNullOrUndefined } from 'util';

class JoinInfo {
  public leftJoinKey: string;
  public rightJoinKey: string;
}

@Component({
  selector: 'app-rule-join-popup',
  templateUrl: './rule-join-popup.component.html',
})
export class RuleJoinPopupComponent extends AbstractPopupComponent implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('leftGrid')
  public leftGrid: GridComponent;  // 조인 대상 원본 데이터 그리드

  @ViewChild('rightGrid')
  public rightGrid: GridComponent; // 조인할 데이터 그리드

  @ViewChild('previewGrid')
  public previewGrid: GridComponent; // 미리보기용 데이터 그리드

  // selected column list
  public leftSelCols: string[] = [];
  public rightSelCols: string[] = [];

  // wrangled / imported dataset
  public dsType: string = '';


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public dfId:string;

  @Input()
  public serverSyncIndex: string;

  @Output() // 조인 팝업을 닫을때 사용하는 eventemitter
  public joinComplete = new EventEmitter();

  @Input('existingDataSet')
  //public leftDataset: Dataset;            // 기존 데이터
  public leftDataset: PrDataset;            // 기존 데이터

  @Input()
  //public rightDataset: Dataset;   // 조인하게될 선택된 데이터 셋
  public rightDataset: PrDataset;   // 조인하게될 선택된 데이터 셋

  @Input()
  public editRuleStr: string;

  // 표시 형식 플래그
  public viewModeforLeft: string = 'grid';    // viewMode for existing data : grid / table
  public viewModeforRight: string = 'grid';   // view mode for Join : gird/ table

  public isDatasetListShow: boolean = false;  // 조인할 데이터셋 리스트 show/hide
  public searchText: string = '';             // 데이터셋 검색

  public leftJoinKeySearchText: string = '';
  public rightJoinKeySearchText: string = '';

  // 조인 정보
  public leftJoinKey: string = '';       // 기준 테이블의 조인 컬럼이름
  public rightJoinKey: string = '';      // 대상 테이블의 조인 컬럼이름
  public joinList: JoinInfo[] = []; // 조인 정보 목록
  public selectedJoinType: string = 'LEFT';  // 선택된 조인 형식

  // 조인키 컬럼 리스트
  public isLeftDatasetShow: boolean = false;  // 왼쪽 데이터셋 컬럼리스트
  public isRightDatasetShow: boolean = false; // 오른쪽 데이터셋 컬럼리스트

  public isShowPreview: boolean = false; // 미리보기 결과 표시 여부

  public isDatatypesShow: boolean = false;

  public numberOfColumns: number;
  public numberOfRows: number;
  public numberOfBytes: number = 0;
  public dataTypesList: any[] = [];

  // 편집인지 생성인지
  public joinButtonText: string = 'Join';

  // 전체 선택 기능 for grid & table
  public leftCheckAll: boolean = true;
  public rightCheckAll: boolean = false;

  // 데이터셋 리스트 - selectbox 에서 사용할 리스트
  //public datasets: Dataset[] = [];
  public datasets: PrDataset[] = [];

  // Show/hide datasets only in this flow
  public isChecked: boolean = true;

  // Flag for mouse movement and keyboard navigation
  public flag: boolean = false;

  // 데이터셋츠 필터링 된 리스트
  get filteredDatasetsForJoin() {

    // 리스트
    let list = this.datasets;

    const nameDupMap: any = {};

    list.forEach((dataaset) => {
      const nameCnt = (nameDupMap[dataaset.dsName]) ? nameDupMap[dataaset.dsName] : 0;
      dataaset.nameCnt = nameCnt + 1;
      nameDupMap[dataaset.dsName] = nameCnt + 1;
    });

    // 검색어가 있는지 체크
    const isSearchTextEmpty = StringUtil.isNotEmpty(this.searchText);

    // 검색어가 있다면
    if (isSearchTextEmpty) {
      list = list.filter((dataset) => {
        return dataset.dsName.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
      });
    }

    // OnlyShow
    if (this.isChecked) {
      list = list.filter((dataset) => {
        return dataset.isCurrentDataflow;
      });
    } else {
      list = list.filter((dataset) => {
        return !dataset.isCurrentDataflow;
      });
    }
    return list;
  } // get - filteredDatasets

  get filteredLeftKeyList() {
    let leftkeyList = this.leftSelCols;
    // 검색어가 있는지 체크
    const isLeftKeySearchTextEmpty = StringUtil.isNotEmpty(this.leftJoinKeySearchText);

    // 검색어가 있다면
    if (isLeftKeySearchTextEmpty) {
      leftkeyList = leftkeyList.filter((item) => {
        return item.toLowerCase().indexOf(this.leftJoinKeySearchText.toLowerCase()) > -1;
      });
    }
    return leftkeyList;
  }

  get filteredRightKeyList() {
    let rightkeyList = this.rightSelCols;
    // 검색어가 있는지 체크
    const isRightKeySearchTextEmpty = StringUtil.isNotEmpty(this.rightJoinKeySearchText);

    // 검색어가 있다면
    if (isRightKeySearchTextEmpty) {
      rightkeyList = rightkeyList.filter((item) => {
        return item.toLowerCase().indexOf(this.rightJoinKeySearchText.toLowerCase()) > -1;
      });
    }
    return rightkeyList;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected popupService: PopupService,
              protected dataflowService: DataflowService,
              protected datasetService: DatasetService,
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


    if (this.rightDataset.dsId !== '') { // 편집모드
      this.joinButtonText = this.rightDataset.joinButtonText;
      this.editVersionRightDataset(this.rightDataset);
    } else { // 처음생성할때
      //this.rightDataset = new Dataset();
      this.rightDataset = new PrDataset();
    }
    this.getDatasets();
  }

  public ngAfterViewInit() {

    if(this.rightDataset.dsId === '') {  // 처음생성할때

      this.updateGrid(this.leftDataset.gridData, this.leftGrid).then(() => {
        this.setLeftCheckAll(true);   // Default가 전체체크
      });

    } else { // 편집모드

      this.leftSelCols = this.rightDataset.leftSelectCol;
      this.updateGrid(this.leftDataset.gridData, this.leftGrid).then(() => {
        if (this.leftDataset.gridData.fields.length === this.rightDataset.leftSelectCol.length) {
          this.setLeftCheckAll(true);   // Default가 전체체크
        } else {
          this.rightDataset.leftSelectCol.forEach(colName => this.leftGrid.columnSelection(colName));
        }
      });
    }

  } // function - ngAfterViewInit

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Returns size
   * @return {string[]}
   */
  public getSize() {
    let size = 0;
    if(true==Number.isInteger(this.numberOfBytes)) {
      size = this.numberOfBytes;
    }
    return this.formatBytes(size,1).split(" ");
  }

  /**
   * Returns number of columns
   * @return {string}
   */
  public getColumns() {
    let cols = '0';
    if(true==Number.isInteger(this.numberOfColumns)) {
      cols = new Intl.NumberFormat().format(this.numberOfColumns);
    }
    return cols;
  }

  /**
   * Returns number of rows
   * @return {string}
   */
  public getRows() {
    let rows = '0';
    if(true==Number.isInteger(this.numberOfRows)) {
      rows = new Intl.NumberFormat().format(this.numberOfRows);
    }
    return rows;
  }


  /**
   * 왼쪽 그리드 헤더 클릭 이벤트 핸들러
   * @param {object} event
   */
  public leftGridHeaderClickHandler(event: { id: string, isSelect: boolean }) {
    this.leftCheckAll = this.gridHeaderClickHandler(event, this.leftSelCols, this.leftDataset, this.leftCheckAll);
  } // function - leftGridHeaderClickHandler

  /**
   * 왼쪽 테이블 클릭 이벤트 핸들러
   * @param {string} columnId
   */
  public leftTableClickHandler(columnId: string) {
    this.leftCheckAll = this.gridHeaderClickHandler(
      {
        id: columnId,
        isSelect: !( -1 < this.leftSelCols.indexOf(columnId) )
      },
      this.leftSelCols, this.leftDataset, this.leftCheckAll
    );
  } // function - leftTableClickHandler

  /**
   * 오른쪽 그리드 헤더 클릭 이벤트 핸들러
   * @param {object} event
   */
  public rightGridHeaderClickHandler(event: { id: string, isSelect: boolean }) {
    this.rightCheckAll = this.gridHeaderClickHandler(event, this.rightSelCols, this.rightDataset, this.rightCheckAll);
  } // function - rightGridHeaderClickHandler

  /**
   * 오른쪽 테이블 클릭 이벤트 핸들러
   * @param {string} columnId
   */
  public rightTableClickHandler(columnId: string) {
    this.rightCheckAll = this.gridHeaderClickHandler(
      {
        id: columnId,
        isSelect: !( -1 < this.rightSelCols.indexOf(columnId) )
      },
      this.rightSelCols, this.rightDataset, this.rightCheckAll
    );
  } // function - rightTableClickHandler

  /**
   * 왼쪽 select All 체크박스 선택시
   * @param {boolean} force 강제 설정 값
   */
  public setLeftCheckAll(force?: boolean) {

    // 체크 상태 변경
    if ('undefined' === typeof force) {
      this.leftCheckAll = !this.leftCheckAll;
    } else {
      this.leftCheckAll = force;
    }

    this.leftSelCols = this.leftCheckAll ? this.leftDataset.gridData.fields.map(field => field.name) : [];

    if ('grid' === this.viewModeforLeft) {
      if (this.leftCheckAll) {
        this.leftGrid.columnAllSelection();
      } else {
        this.leftGrid.columnAllUnSelection();
      }
    }
  } // function - setLeftCheckAll

  /**
   * 오른쪽 select All 체크박스 선택시
   */
  public setRightCheckAll(force?: boolean) {

    // 체크 상태 변경
    if ('undefined' === typeof force) {
      this.rightCheckAll = !this.rightCheckAll;
    } else {
      this.rightCheckAll = force;
    }

    this.rightSelCols = this.rightCheckAll ? this.rightDataset.gridData.fields.map(field => field.name) : [];

    if ('grid' === this.viewModeforRight) {
      if (this.rightCheckAll) {
        this.rightGrid.columnAllSelection();
      } else {
        this.rightGrid.columnAllUnSelection();
      }
    }
  } // function - rightCheckAllEventHandler

  /**
   * join key 정보를 목록에 추가한다
   */
  public addJoinKeys() {

    if (this.selectedJoinType === '' || this.leftJoinKey === '' || this.rightJoinKey === '') {
      return;
    }
    // 정보 등록
    const info = new JoinInfo();
    info.leftJoinKey = this.leftJoinKey;
    info.rightJoinKey = this.rightJoinKey;
    const found = this.joinList.find(elem => (elem.leftJoinKey === info.leftJoinKey && elem.rightJoinKey === info.rightJoinKey));
    if (undefined === found) {
      this.joinList.push(info);
    } else {
      Alert.warning(this.translateService.instant('msg.dp.ui.join.key.error'));
    }

    // this.previewJoinResult();   // 조인 결과 미리보기
  } // function - addToJoinKeys

  /**
   * 특정 인덱스의 정보를 목록에 제거한다.
   * @param {number} index
   */
  public removeJoinInfo(index: number) {
    if (index > -1) {
      this.joinList.splice(index, 1);
      if (0 === this.joinList.length) {
        this.selectedJoinType = '';
      }
    }
  } // function - removeJoinInfo

  /**
   * 선택된 조인 형식을 저장한다.
   * @param {string} joinType
   */
  public selectJoinType(joinType: string) {
    this.selectedJoinType = joinType;
  } // function - selectJoinType

  /**
   * 왼쪽 데이터 영역 표시 변경
   * @param viewMode
   */
  public toggleViewModeforLeft(viewMode) {
    this.viewModeforLeft = viewMode;
    if ('grid' === this.viewModeforLeft) {
      this.updateGrid(this.leftDataset.gridData, this.leftGrid).then(() => {
        this.leftSelCols.forEach(colName => this.leftGrid.columnSelection(colName));
      });
    }
  } // function - toggleViewModeforLeft

  /**
   * 오른쪽 그리드 표시 변경
   * @param viewMode
   */
  public toggleViewModeforRight(viewMode) {
    this.viewModeforRight = viewMode;
    if ('grid' === this.viewModeforRight) {
      this.updateGrid(this.rightDataset.gridData, this.rightGrid).then(() => {
        this.rightSelCols.forEach(colName => this.rightGrid.columnSelection(colName));
      });
    }
  } // function - toggleViewModeforRight

  /**
   * 오른쪽 데이터셋 셀렉트박스 show/hide
   * @param event
   */
  public showDatasetList(event) {
    event.stopImmediatePropagation();
    this.isDatasetListShow = true;
    setTimeout(() => $('.ddp-input-search').trigger('focus'));
  } // function - showDatasetList

  /**
   * Check if left has right as upstream
   * @param leftDsId
   * @param rightDsId
   * @param upstreams
   * @return {boolean}
   */
  public notUpstream(leftDsId, rightDsId, upstreams) {
    let ret = true;

    let list = [leftDsId];
    while( 0<list.length ) {
      let pop = list.shift();
      if( pop === rightDsId ) {
        ret = false;
        break;
      }
      for(let us of upstreams ) {
        if( us.dsId === pop ) {
          if( false==list.includes( us.dsId ) ) {
            list.push( us.upstreamDsId );
          }
        }
      }
    }

    return ret;
  }

  /**
   * Get dataset list for right
   */
  public getDatasets() {

    this.loadingShow();

    // 페이징처리 없음
    this.page.size = 10000;

    let params = {
      dsName : '',
      sort : 'modifiedTime,desc',
      dsType : this.dsType,
      page: this.page.page,
      size: this.page.size,
    };

    this.datasetService.getDatasets(params)
      .then((data) => {

        // data 에서 dsType 이 wrangled 안것만 가지고 온다 ( 자기 자신은 제외 - existing data )
        this.datasets = this.datasets.concat(data['_embedded'].preparationdatasets).filter((item) => {
          return item.dsType === DsType.WRANGLED && item.dsId !== this.leftDataset.dsId;
        });

        // 처음엔 selected = false
        this.datasets.map((item) => {
          item.selected = false;
        });

        this.dataflowService.getUpstreams(this.dfId)
          .then((upstreams) => {
            let upstreamList = upstreams.filter((upstream) => {
              if (upstream.dfId === this.dfId) {
                return true;
              }
            });

            // 현재 플로우에 들어있는 dataset 인지 확인
            this.datasets = this.datasets.map((obj) => {
              obj.isCurrentDataflow = false;
              if (obj.dataflows.length !== 0) {
                for(let _df of obj.dataflows) {
                  if(_df.dfId === this.dfId) {
                    if( true == this.notUpstream( this.leftDataset.dsId, obj.dsId, upstreamList ) ) {
                      obj.isCurrentDataflow = true;
                    }
                  }
                }
              }
              return obj;
            });

            this.loadingHide();
          })
          .catch((error) => {
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
          });
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  } // function - getDatasets

  /**
   * right dataset List 선택 이벤트 핸들러
   * @param event
   * @param dataset
   */
  public selectDataset(event, dataset) {
    event.stopImmediatePropagation();
    this.loadingShow();

    // 초기화 check상태 & 선택 된 columns
    this.rightSelCols = [];
    this.joinList = []; // 조인리스트 초기화
    this.selectedJoinType = 'LEFT';
    this.rightCheckAll = false; // 전체 체크 해제
    this.rightDataset = dataset; // 클릭된 데이터셋을 this.rightDataset에 넣는다

    setTimeout(() => this.isDatasetListShow = false); // 셀렉트 박스 닫힘);

    this.dataflowService.getDatasetWrangledData(this.rightDataset.dsId)
      .then((result) => {
        const gridData = this.getGridDataFromGridResponse(result.gridResponse);

        // 데이터 미리보기
        const data = gridData.data.slice(0, 100);
        this.rightDataset.data = JSON.stringify(data);
        this.rightDataset.gridData = gridData;

        this.updateGrid(this.rightDataset.gridData, this.rightGrid);

        // 조인키 넣기
        this.setJoinKeys();
        this.loadingHide();
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });

    this.initSelectedCommand(this.filteredDatasetsForJoin);
  } // function - selectDataset

  /**
   * 조인 편집하려고 들어오면 원래 있던 값들을 다시 넣어준다
   * @param dataset
   */
  public editVersionRightDataset(dataset) {
    this.loadingShow();

    // dataset 이름이 없어서 넣어준다
    this.dataflowService.getDataset(dataset.dsId).then((data) => {
      this.rightDataset.dsName = data.dsName;
    });

    this.dataflowService.getDatasetWrangledData(dataset.dsId)
      .then((result) => {
        this.loadingHide();
        console.info('result', result);
        const gridData = this.getGridDataFromGridResponse(result.gridResponse);

        // 데이터 그리드 미리보기
        const data = gridData.data.slice(0, 100);
        this.rightDataset.data = JSON.stringify(data);
        this.rightDataset.gridData = gridData;

        // 조인키를 넣어 준다
        this.rightJoinKey = '';
        this.rightJoinKey = '';
        this.leftJoinKey = '';

        // 선택됐었던 column list 초기화
        this.rightSelCols = [];
        this.rightSelCols = this.rightDataset.rightSelectCol;

        this.updateGrid(this.rightDataset.gridData, this.rightGrid).then(() => {
          if (this.rightDataset.gridData.fields.length === this.rightDataset.rightSelectCol.length) {
            this.setRightCheckAll(true);   // Default가 전체체크
          } else {
            this.rightDataset.rightSelectCol.forEach(colName => this.rightGrid.columnSelection(colName));
          }
        });

        // 조인 타입 입력
        this.selectedJoinType = this.rightDataset.selectedJoinType.toUpperCase();

        // 조인키가 하나 이상이라면
        if (this.rightDataset.joinRuleList) {
          this.joinList = this.rightDataset.joinRuleList;
        }

      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });

  } // function - selectDataset

  /**
   * 팝업 닫기
   */
  public closeJoin() {
    this.joinComplete.emit({ event: 'ruleJoinComplete' });
  } // function - closeJoin

  /**
   * 조인 룰 적용
   */
  public applyJoinRule() {

    const ruleStr = this.generateRuleString();
    if (!ruleStr[0]) {
      Alert.error(ruleStr[1]);
      return;
    }

    // 이벤트
    if (this.joinButtonText !== 'Join') { // 편집
      const rule = {
        command: 'join',
        op: 'UPDATE',
        ruleString: ruleStr[1] ,
        ruleIdx : this.serverSyncIndex,
        uiRuleString: ruleStr[2]
      };
      this.joinComplete.emit({ event: 'ruleJoinComplete', ruleInfo: rule });
    } else { // 생성
      const rule = {
        command: 'join',
        op: 'APPEND',
        ruleString: ruleStr[1],
        uiRuleString: ruleStr[2]
      };
      this.joinComplete.emit(
        { event: 'ruleJoinComplete',
          ruleInfo: rule,
          ruleIdx : this.serverSyncIndex
        });
    }


  } // function - applyJoinRule

  /**
   * 조인키 왼쪽 selectbox show/hide
   */
  public showLeftDataset(event) {
    event.stopImmediatePropagation();
    this.isLeftDatasetShow = true;
    this.isRightDatasetShow = false;
  } // function - showLeftDataset

  /**
   * 조인키 오른쪽 selectbox show/hide
   */
  public showRightDataset(event) {
    event.stopImmediatePropagation();
    this.isRightDatasetShow = true;
    this.isLeftDatasetShow = false;
  } // function - showRightDataset

  /**
   * 조인키 왼쪽 selectbox 선택시
   */
  public onLeftJoinKeySelected(event, key) {
    event.stopImmediatePropagation();
    if (key === 'Empty') {
      return;
    }
    this.leftJoinKey = key;
    for (let field of this.rightDataset.gridData.fields) {
      if (field.name && key === field.name) {
        this.rightJoinKey = key;
        break;
      }
    }
    setTimeout(() => this.isLeftDatasetShow = false);
  } // function - onLeftJoinKeySelected

  /**
   * 조인키 오른쪽 selectbox 선택시
   */
  public onRightJoinKeySelected(event, key) {
    event.stopImmediatePropagation();
    if (key === 'Empty') {
      return;
    }
    this.rightJoinKey = key;
    this.isRightDatasetShow = false;
  } // function - onRightJoinKeySelected

  public showTypeList(event) {
    if (event.target.tagName !== 'A') { // Not sure if this is a good idea..
      this.isDatatypesShow = !this.isDatatypesShow;
    }
  }


  /**
   * API의 gridResponse 를 통해서 UI 상의 그리드데이터를 얻는다
   * @param gridResponse 매트릭스 정보
   * @returns 그리드 데이터
   */
  private getGridDataFromGridResponse(gridResponse: any) {
    var colCnt = gridResponse.colCnt;
    var colNames = gridResponse.colNames;
    var colTypes = gridResponse.colDescs;

    const gridData = {
      data: [],
      fields: []
    };

    for(var idx=0;idx<colCnt;idx++) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for(var idx=0;idx<colCnt;idx++) {
        obj[ colNames[idx] ] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - getGridDataFromGridResponse

  /**
   * 룰 문자열을 생성한다.
   */
  public generateRuleString(): [boolean, string, Object] {
    if (0 === this.leftSelCols.length) {
      return [false, this.translateService.instant('msg.dp.alert.sel.left.col'), null];
    }
    if (0 === this.rightSelCols.length) {
      return [false, this.translateService.instant('msg.dp.alert.sel.right.col'), null];
    }
    if ('' === this.selectedJoinType) {
      return [false, this.translateService.instant('msg.dp.alert.sel.join.type'), null];
    }
    if (0 === this.joinList.length) {
      return [false, this.translateService.instant('msg.dp.alert.sel.join.key'), null];
    }
    for(let joinKey of this.joinList) {
      if( false==this.leftSelCols.includes(joinKey.leftJoinKey) ) {
        return [false, this.translateService.instant('msg.dp.alert.left.joinkey.error', {leftJoinKey : joinKey.leftJoinKey}), null];
      }
      if( false==this.rightSelCols.includes(joinKey.rightJoinKey) ) {
        return [false, this.translateService.instant('msg.dp.alert.right.joinkey.error', {rightJoinKey : joinKey.rightJoinKey}), null];
      }
    }

    const conditions = this.joinList.map((joinInfo) => {
      return ('`' + joinInfo.leftJoinKey + '`') + '=' + ('`' + joinInfo.rightJoinKey + '`')
    }).join(' && ');

    let ruleStr: string = '';
    ruleStr += `join leftSelectCol: ${this.getColumnNamesInArray(this.leftSelCols, '', '`').toString()}`;
    ruleStr += ` rightSelectCol: ${this.getColumnNamesInArray(this.rightSelCols, '', '`').toString()}`;
    ruleStr += ' condition: ' + conditions + ' joinType: \'' + this.selectedJoinType.toLowerCase() + '\' dataset2: \'' + this.rightDataset.dsId + '\'';

    const uiRuleString = {
      name :'join',
      isBuilder: true,
      leftJoinKey:this.getColumnNamesInArray(this.joinList,'leftJoinKey'),
      rightJoinKey:this.getColumnNamesInArray(this.joinList,'rightJoinKey'),
      joinType: this.selectedJoinType,
      dataset2 : this.rightDataset.dsId,
      rightCol: this.getColumnNamesInArray(this.rightSelCols, ''),
      leftCol:this.getColumnNamesInArray(this.leftSelCols, '')
    };

    return [true, ruleStr, uiRuleString];
  } // function - generateRuleString

  /**
   * 조인 결과를 미리 확인한다.
   */
  public previewJoinResult() {

    if (this.joinList.length === 0) {
      return;
    }
    this.isShowPreview = true;
    // 기능이 동학하지 않아 임시 주석 처리함 -> 프리뷰 API 확인 후 주석 풀어서 기능 체크해야 함
    this.loadingShow();
    const ruleStr = this.generateRuleString();
    if (!ruleStr[0]) {
      Alert.warning(ruleStr[1]);
      this.isShowPreview = false;
      this.loadingHide();
      return;
    }

    const rule = { command: 'join', op: 'PREVIEW', ruleString: ruleStr[1] , ruleIdx : this.serverSyncIndex};
    this.dataflowService.applyRules(this.leftDataset.dsId, rule)
      .then((data) => {
        this.loadingHide();

        if (data.errorMsg) {
          Alert.warning(this.translateService.instant('msg.dp.alert.apply.rule.fail'));
        } else {
          // 그리드 정보 (columns, rows, bytes etc)
          this.numberOfColumns = data['gridResponse'].colCnt;
          this.numberOfRows = data['gridResponse'].rows.length;
          this.numberOfBytes = 0;


          const gridData = this.getGridDataFromGridResponse(data.gridResponse);
          this._summaryGridInfo(gridData);

          this.updateGrid(gridData, this.previewGrid);
        }
      })
      .catch((error) => {
        this.isShowPreview = false;

        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  } // function - previewJoinResult


  /**
   * 그리드 요약 정보 설정
   * @param {GridData} gridData
   * @private
   */
  private _summaryGridInfo(gridData: any) {

    // init type list
    this.dataTypesList = [];

    if (!isNullOrUndefined(gridData.fields)) {
      const tempMap: Map<string, number> = new Map();
      gridData.fields.forEach((item) => {
        if (tempMap.get(item.type) > -1) {
          const temp = tempMap.get(item.type) + 1;
          tempMap.set(item.type, temp);
        } else {
          tempMap.set(item.type, 1);
        }
      });

      tempMap.forEach((value: number, key: string) => {
        this.dataTypesList.push({label : key, value : value < 2 ? `${value} column` : `${value} columns`});
      });
    }

  } // function - _summaryGridInfo




  /**
   * 그리드 갱신
   * @param {any} data 데이터셋
   * @param {GridComponent} targetGrid 변경 대상 그리드
   */
  public updateGrid(data: any, targetGrid: GridComponent) {
    return new Promise((resolve) => {
      // 헤더정보 생성
      const headers: header[] = data.fields.map(
        (field: Field) => {
          return new SlickGridHeader()
            .Id(field.name)
            .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + field.name + '</span>')
            .Field(field.name)
            .Behavior('select')
            .Selectable(false)
            .CssClass('cell-selection')
            .Width(10 * (field.name.length) + 20)
            .MinWidth(100)
            .CannotTriggerInsert(true)
            .Resizable(true)
            .Unselectable(false)
            .Sortable(false)
            .Formatter((function (scope) {
              return function (row, cell, value, columnDef, dataContext) {
                if (isNull(value) && columnDef.select) {
                  return '<div style=\'background-color:#d6d9f1; position:absolute; top:0; left:0; right:0; bottom:0px; line-height:30px; padding:0 10px; font-style: italic ; color:#b8bac2;\'>' + '(null)' + '</div>';
                } else if (isNull(value) && !columnDef.select) {
                  return '<div  style=\'color:#b8bac2; font-style: italic ;line-height:30px;\'>' + '(null)' + '</div>';
                } else if (!isNull(value) && columnDef.select) {
                  return '<div style=\'background-color:#d6d9f1; position:absolute; top:0; left:0; right:0; bottom:0px; line-height:30px; padding:0 10px;\'>' + value + '</div>';
                } else if (columnDef.id === '_idProperty_') {
                  return '<div style=\'line-height:30px;\'>' + '&middot;' + '</div>';
                } else {
                  return value;
                }
              };
            })(this))
            .build();
        }
      );

      let rows: any[] = data.data;

      let list = [];

      data.fields.filter((item) => { // 타입이 array or map인 경우에 리스트에 이름을 뺸다.
        if( item.type === 'MAP' || item.type == 'ARRAY' ) {
          list.push(item.name);
        }
      });

      if (data.data.length > 0 && !data.data[0].hasOwnProperty('id')) {
        list.filter((item) => {
          rows = rows.map((row: any, idx: number) => {
            row.id = idx;
            isNull(row[item]) ? null : row[item] = JSON.stringify(row[item]);
            return row;
          });
        })
      }

      if (this.isShowPreview) {
        setTimeout(() => {
          targetGrid.create(headers, rows, new GridOption()
            .SyncColumnCellResize(true)
            .RowHeight(32)
            .NullCellStyleActivate(true)
            .EnableColumnReorder(false)
            .build()
          );
          resolve();
        }, 100);
      } else {
        setTimeout(() => {
          targetGrid.create(headers, rows, new GridOption()
            .EnableHeaderClick(true)
            .SyncColumnCellResize(true)
            .EnableColumnReorder(false)
            .NullCellStyleActivate(true)
            .RowHeight(32)
            .build()
          );
          resolve();
        }, 100);
      }
    });
  } // function - updateGrid


  /**
   * Select box for commands - navigate with keyboard
   * @param event 이벤트
   * @param currentList 현재 사용하는 리스트
   * @param method
   */
  public navigateWithKeyboardShortList(event, currentList, method) {

    // set scroll height
    let height = 25;

    // open select box when arrow up/ arrow down is pressed
    if(event.keyCode === 38 || event.keyCode === 40) {
      switch(method) {
        case 'right' :
          !this.isDatasetListShow ? this.isDatasetListShow = true : null;
          break;
        case 'joinLeft' :
          !this.isLeftDatasetShow ? this.isLeftDatasetShow = true: null;
          break;
        case 'joinRight' :
          !this.isRightDatasetShow ? this.isRightDatasetShow = true: null;
          break;
      }
    }

    // when there is no element in the list
    if(currentList.length === 0){
      return;
    }

    // this.commandList 에 마지막 인덱스
    let lastIndex = currentList.length-1;

    // command List 에서 selected 된 index 를 찾는다
    const idx = currentList.findIndex((command) => {
      if (command.selected) {
        return command;
      }
    });
    // when Arrow up is pressed
    if (event.keyCode === 38) {

      // 선택된게 없다
      if ( idx === -1) {

        // 리스트에 마지막 인덱스를 selected 로 바꾼다
        currentList[lastIndex].selected = true;

        // 스크롤을 마지막으로 보낸다
        $('.ddp-list-selectbox2').scrollTop(lastIndex*height);

        // 리스트에서 가장 첫번쨰가 선택되어 있는데 arrow up 을 누르면 리스트에 마지막으로 보낸다
      } else if (idx === 0) {

        currentList[0].selected = false;
        currentList[lastIndex].selected = true;


        // 스크롤을 마지막으로 보낸다
        $('.ddp-list-selectbox2').scrollTop(lastIndex*height);

      } else {
        currentList[idx].selected = false;
        currentList[idx-1].selected = true;
        $('.ddp-list-selectbox2').scrollTop((idx-1)*height);
      }

      // when Arrow down is pressed
    } else if (event.keyCode === 40) {

      // 리스트에 첫번째 인텍스를 selected 로 바꾼다
      if ( idx === -1) {
        currentList[0].selected = true;

        // 리스트에서 가장 마지막이 선택되어 있는데 arrow down 을 누르면 다시 리스트 0번째로 이동한다
      }  else if (idx === lastIndex) {

        currentList[0].selected = true;
        currentList[lastIndex].selected = false;
        $('.ddp-list-selectbox2').scrollTop(0);

      } else {
        currentList[idx].selected = false;
        currentList[idx+1].selected = true;
        $('.ddp-list-selectbox2').scrollTop((idx+1)*height);

      }

    }

    // enter
    if (event.keyCode === 13) {

      // selected 된 index 를 찾는다
      const idx = currentList.findIndex((command) => {
        if (command.selected) {
          return command;
        }
      });

      // 선택된게 없는데 엔터를 눌렀을때
      if (idx === -1) {
        return;
      } else {
        switch(method) {
          case 'right' :
            this.selectDataset(event, currentList[idx]);
            break;
          case 'joinLeft' :
            break;
          case 'joinRight' :
            break;
        }
      }
      // 스크롤, command select 초기화
      this.initSelectedCommand(currentList);
    }
  }

  /**
   * change commandList selected -> false (초기화)
   */
  public initSelectedCommand(list) {
    list.forEach((item) => {
      return item.selected = false;
    });
  } // function - initSelectedCommand

  /**
   * nestlist, typelist, patternlist,movelist, quotelist 에서 mouseover 일때 Selected = true
   * @param event
   * @param list
   * @param index
   */
  public listMouseOverAndOut(event,list, index) {

    if (!this.flag) {
      if (event.type === 'mouseover') {
        list[index].selected = true;

      } else if (event.type === 'mouseout') {
        this.initSelectedCommand(list);
      }
    }

  } // function - listMouseOver

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
   * 왼쪽 그리드 헤더 클릭 이벤트 핸들러
   * @param {object} event
   * @param {string[]} selectCols
   * @param {Dataset} dataset
   * @param {boolean} checkAll
   */
  //private gridHeaderClickHandler(event: { id: string, isSelect: boolean }, selectCols: string[], dataset: Dataset, checkAll: boolean) {
  private gridHeaderClickHandler(event: { id: string, isSelect: boolean }, selectCols: string[], dataset: PrDataset, checkAll: boolean) {

    // 선택 결과에 따라 선택 항목을 재조정한다
    const colIdx = selectCols.indexOf(event.id);
    if (event.isSelect) {
      ( -1 === colIdx ) && ( selectCols.push(event.id) );
    } else {
      ( -1 < colIdx ) && ( selectCols.splice(colIdx, 1) );
    }

    // Check All 여부
    checkAll = (dataset.gridData.fields.length === selectCols.length);

    return checkAll;

  } // function - gridHeaderClickHandler

  /**
   * 조인 키 설정
   */
  private setJoinKeys() {
    // 오른쪽 데이터셋을 바꿨을 때 left 의 첫번째 field를 넣고, right는 왼쪽과 동일한 field를 넣는데, 같은게 없으면 Empty 로 넣는다
    this.leftJoinKey = this.leftSelCols[0];
    const tempField = this.rightSelCols.filter(field => ( this.leftJoinKey === field ));

    if (tempField.length !== 0) {
      this.rightJoinKey = tempField[0];
    } else {
      this.leftJoinKey = '';
      this.rightJoinKey = '';
    }

  } // function - setJoinKeys


  /**
   *
   * @param fields
   * @param label
   * @param wrapChar
   */
  protected getColumnNamesInArray(fields: any, label:string, wrapChar?:string) :string[] {
    return fields.map((item) => {
      if (label !== '' && wrapChar) {
        return wrapChar + item[label] + wrapChar
      }

      if (label !== '' && !wrapChar) {
        return item[label]
      }

      if (label === '' && wrapChar) {
        return wrapChar + item + wrapChar
      }

      if (label === '' && !wrapChar) {
        return item
      }

    });
  }
}
