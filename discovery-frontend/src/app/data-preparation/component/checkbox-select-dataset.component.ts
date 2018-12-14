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

import { Component, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import {AbstractComponent} from "../../common/component/abstract.component";
//import {Dataset, DsType} from "../../domain/data-preparation/dataset";
import {PrDataset, DsType} from "../../domain/data-preparation/pr-dataset";
import {DataflowService} from "../dataflow/service/dataflow.service";
import {DatasetService} from "../dataset/service/dataset.service";
import {DataflowModelService} from "../dataflow/service/dataflow.model.service";
import {PreparationAlert} from "../util/preparation-alert.util";
import {PreparationCommonUtil} from "../util/preparation-common.util";

@Component({
  selector: 'checkbox-select-dataset',
  templateUrl: './checkbox-select-dataset.component.html'
})
export class CheckboxSelectDatasetComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  //public originalDatasetList: Dataset[] = []; // 현재 데이터플로우에 추가되어 있는 모든 데이터셋 정보
  public originalDatasetList: PrDataset[] = []; // 현재 데이터플로우에 추가되어 있는 모든 데이터셋 정보
  public clonedOriginalDatasetList : any [] = []; // 현재 데이터플로우에 추가되어있는 imported datasets
  //public datasets: Dataset[] = []; // 화면에 보여지는 데이터셋 리스트
  public datasets: PrDataset[] = []; // 화면에 보여지는 데이터셋 리스트
  public selectedDatasetId: string = ''; // 선택된 데이터셋 아이디
  //public selectedDatasets : Dataset[]; // 선택된 데이터셋 리스트
  public selectedDatasets : PrDataset[]; // 선택된 데이터셋 리스트
  public isCheckAllDisabled : boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 정렬
  public selectedContentSort: Order = new Order();

  public isCheckAll: boolean = false;

  public searchText: string = '';
  public searchType: string = 'IMPORTED';

  public isShow : boolean = false;

  public prepCommonUtil = PreparationCommonUtil;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Input Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private dataflowService: DataflowService,
              private datasetService : DatasetService,
              private dataflowModelService : DataflowModelService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
    this.init();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 화면 초기화
   */
  public init() {

    if (this.dataflowModelService.getDatasetsFromDataflow().length !== 0 ) {
      this.originalDatasetList = this.dataflowModelService.getDatasetsFromDataflow();
      this.dataflowModelService.setDatasetsFromDataflow([]);
    }

    // 데이터플로우에 이미 추가된 데이터셋이 있다면 imported 만 clonedOriginalDatasetList에 넣는다.
    if (this.originalDatasetList.length > 0 ) {
      this.originalDatasetList.forEach((item) => {
        if (item.dsType === DsType.IMPORTED ) {
          this.clonedOriginalDatasetList.push(item.dsId)
        }
      });
    }

    this.selectedDatasets = [];
    this._initViewPage();
  } // function - init





  /**
   * 정렬 정보 변경
   * @param {string} column
   */
  public changeOrder(column: string) {

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = column;

    if (this.selectedContentSort.key === column) {
      // asc, desc, default
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }

    // 페이지 초기화
    this.page.page = 0;

    this.page.sort = column + ',' + this.selectedContentSort.sort;

    // 데이터셋 리스트 조회
    this.getDatasets();
  } // function - changeOrder


  /**
   * 데이터 셋 선택
   * @param dataset
   */
  public selectDataset(dataset : any) {

    // 지금 보고있는 데이터면 show 해제
    if (dataset.dsId === this.selectedDatasetId) {
      this.selectedDatasetId = '';
      return;
    }

    // 데이터 아이디 저장
    this.selectedDatasetId = dataset.dsId;

  } // function - selectDataset


  /**
   * 데이터셋 요약 페이지 닫았을 때 발생 이벤트
   */
  public onCloseSummary() {
    this.selectedDatasetId = '';
  } // function - onCloseSummary


  /**
   * 더보기 버튼 클릭
   */
  public getMoreList() {
    // 더 보여줄 데이터가 있다면
    if (this.page.page < this.pageResult.totalPages) {
      // 데이터셋 조회
      this.getDatasets();
    }
  } // function - getMoreList


  /**
   * 체크박스 전체 선택
   */
  public checkAll() {

    this.isCheckAll = !this.isCheckAll;
    this.datasets = this.datasets.map((obj) => {
      obj.selected = this.isCheckAll; //  obj.selected = true or false
      return obj;
    });

    this.datasets.filter((item) => { // this.datasets을 돌면서 selected 인건 this.dataflow.datasets에 push하고 빠지는건 splice한다
      const index = this.selectedDatasets.map((ds) => {return ds.dsId;}).indexOf(item.dsId);
      if (index === -1 && item.selected) { // selected이고 list에 없다면
        this.selectedDatasets.push(item);
      } else  if (!item.selected && index > -1){
        this.selectedDatasets.splice(index, 1);
      }
    });
  } // function - checkAll


  /**
   * 체크박스 선택
   */
  public check(event,item) {
    event.stopImmediatePropagation();

    if (item.origin) {
      return;
    }

    item.selected = !item.selected;
    if (item.selected) {
      this.selectedDatasets.push(item);
    } else {
      const idx = this.selectedDatasets.map((ds) => {return ds.dsId;}).indexOf(item.dsId);
      if (idx > -1) {
        this.selectedDatasets.splice(idx, 1);
      }
    }

    const num = this.datasets.filter((data) => {
      return data.selected;
    }).length;

    this.datasets.length === num ? this.isCheckAll = true : this.isCheckAll = false;

  } // function - check


  /**
   * 체크박스 부분선택 여부
   */
  public partialChecked() {

    const isCheckAll = this.datasets.every((item) => {
      return item.selected;
    });

    if (isCheckAll) {
      return false;
    }

    const unChecked = this.datasets.every((item) => {
      return item.selected === false;
    });

    if (unChecked) {
      return false;
    }

    this.isCheckAll = false;

    return true;

  } // function - partialChecked


  /**
   * 데이터셋 목록 불러오기
   */
  public getDatasets() {
    this.loadingShow();

    const dslist = this.selectedDatasets.map((ds) => {return ds.dsId;});

    this.dataflowService.getDatasets(this.searchText, this.page, 'listing', this.searchType, '')
      .then((data) => {
        this.loadingHide();
        this.pageResult = data['page'];
        const sorting = this.page.sort.split(',');
        this.selectedContentSort.key = sorting[0];
        this.selectedContentSort.sort = sorting[1];

        if (this.page.page === 0) {
          // 첫번째 페이지이면 초기화
          this.datasets = [];
        }

        this.datasets = this.datasets.concat(data['_embedded'].preparationdatasets);

        // 데이터플로우에 이미 추가된 데이터셋이라면 selected, origin 을 true 로 준다.
        this.datasets.forEach((item) => {
          if (this.clonedOriginalDatasetList.indexOf(item.dsId) > -1 ) {
            item.selected = true;
            item.origin = true;
          } else if (dslist.indexOf(item.dsId) > -1) {
            item.selected = true;
          } else{
            item.selected = false;
            item.origin = false;
          }

        });

        this.isCheckAllDisabled = this.datasets.every((item) => {
          return item.origin
        });

        if (0 !== this.datasets.length) {  // 데이터셋이 하나라도 있을때
          const allTicked = this.datasets.filter((data) => {
            return data.selected;
          }).length;
          this.datasets.length === allTicked ? this.isCheckAll = true : this.isCheckAll = false;
        }

        if (sessionStorage.getItem('DATASET_ID')) {
          this.selectedDatasetId = sessionStorage.getItem('DATASET_ID');
          this.datasets.filter((item) => {
            if (item.dsId === this.selectedDatasetId) {
              item.selected = true;
              this.selectedDatasets.push(item);
            }
          });
          sessionStorage.removeItem('DATASET_ID');
          this.datasetService.dataflowId = undefined;
        }

        // 총페이지 수
        this.page.page += 1;
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  } // function - getDatasets
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Init
   * @private
   */
  private _initViewPage() {
    // 모델 초기화
    this.selectedDatasetId = '';

    // 정렬
    this.selectedContentSort = new Order();
    this.selectedContentSort.key = 'modifiedTime';
    this.selectedContentSort.sort = 'desc';

    // page 설정
    this.page.page = 0;
    this.page.size = 15;

    this.getDatasets();
  } // function - initViewPage


}

class Order {
  key: string = 'seq';
  sort: string = 'default';
}
