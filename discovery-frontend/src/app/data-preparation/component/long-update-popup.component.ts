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
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import {AbstractComponent} from "../../common/component/abstract.component";
import {Dataset, DsType} from "../../domain/data-preparation/dataset";
import {DataflowService} from "../dataflow/service/dataflow.service";
import {DatasetService} from "../dataset/service/dataset.service";
import {DataflowModelService} from "../dataflow/service/dataflow.model.service";
import {PreparationAlert} from "../util/preparation-alert.util";
import {RadioSelectDatasetComponent} from "./radio-select-dataset.component";


@Component({
  selector: 'long-update-popup',
  templateUrl: './long-update-popup.component.html'
})
export class LongUpdatePopupComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public doneEvent = new EventEmitter();

  @Input()
  public dataflowId : string; // 현재 데이터플로우 아이디

  @Input()
  public isRadio : boolean = false;

  @Input()
  public title : string;

  @Input()
  public originalDatasetList: Dataset[] = []; // 현재 데이터플로우에 추가되어 있는 모든 데이터셋 정보


  @Input()
  public selectedDatasetId : string; // 미리보기를 위해 화면에 선택된 데이터셋

  public originalDatasetId : string;


  public datasets: Dataset[] = []; // 화면에 보여지는 데이터셋 리스트 imported 만 빼서 저장하자

  @ViewChild(RadioSelectDatasetComponent)
  public radioSelectDatasetComponent : RadioSelectDatasetComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 정렬
  public selectedContentSort: Order = new Order();

  public isCheckAll: boolean = false;

  public searchText: string = '';
  public searchType: string = 'IMPORTED';

  public isShow : boolean = false;


  get countSelected() {

    return this.datasets.filter((obj) => {
      return obj.selected
    }).length ;
  }

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
    this.originalDatasetId = this.selectedDatasetId;
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
   * 화면 닫기
   */
  public close() {
    this.closeEvent.emit();
    this.datasets = [];
    this.page.page = 0;
  } // function - close


  /**
   * 화면 초기화
   */
  public init() {

    // if (this.dataflowModelService.getDatasetsFromDataflow().length !== 0 ) {
    //   this.originalDatasetList = this.dataflowModelService.getDatasetsFromDataflow();
    //   this.dataflowModelService.setDatasetsFromDataflow([]);
    // }
    //
    // // 데이터플로우에 이미 추가된 데이터셋이 있다면 imported 만 clonedOriginalDatasetList에 넣는다.
    // if (this.originalDatasetList.length > 0 ) {
    //   this.originalDatasetList.forEach((item) => {
    //     if (item.dsType === DsType.IMPORTED ) {
    //       this.clonedOriginalDatasetList.push(item.dsId)
    //     }
    //   });
    // }
    //
    // this.selectedDatasets = [];
    //
    this._initViewPage();
  } // function - init

  /**
   * 다음 단계로 이동
   */
  public done() {

    let param = {oldDsId:this.originalDatasetId, newDsId : this.radioSelectDatasetComponent.getSelectedDataset()};
    if (this.title === 'Replace dataset') {
      param['type'] === 'imported';
    } else if (this.title === 'Change input dataset') {
      param['type'] === 'wrangled';
    }
    this.doneEvent.emit(param);
  } // function - next

  public sortEvent(data) {
    this.page = data;
    this.getDatasets();

  }


  /**
   * 검색 조회 - 키보드 이벤트
   * @param {KeyboardEvent} event
   */
  public searchEventPressKey(event: KeyboardEvent) {
    ( 13 === event.keyCode ) && ( this.searchEvent() );
  } // function - searchEventPressKey


  /**
   * 검색 조회
   */
  public searchEvent() {
    // 검색어 설정
    this.searchText = this._inputSearch.nativeElement.value;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasets();
  } // function - searchEvent


  /**
   * 검색어 리셋
   */
  public resetSearchText(isClear: boolean) {
    if (isClear) {
      this._inputSearch.nativeElement.value = '';
    } else {
      // 검색어 설정
      this._inputSearch.nativeElement.value = this.searchText;
    }
  } // function - resetSearchText


  /**
   * 데이터셋 요약 페이지 닫았을 때 발생 이벤트
   */
  public onCloseSummary() {

    this.selectedDatasetId = '';
    this.safelyDetectChanges();
  } // function - onCloseSummary


  /**
   *  새로운 데이터셋 만들기
   */
  public createDataset() {

    // 데이터셋 생성 페이지로 이동
    this.router.navigate(['/management/datapreparation/dataset']);
    sessionStorage.setItem('DATAFLOW_ID',this.dataflowId);
    this.dataflowModelService.setDatasetsFromDataflow(this.originalDatasetList)


  } // function - createDataset

  /**
   * 데이터셋 목록 불러오기
   */
  public getDatasets() {
    this.loadingShow();

    // const dslist = this.selectedDatasets.map((ds) => {return ds.dsId;});

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

          if (item.dsId === this.selectedDatasetId ) {
            // 데이터플로우에서 선택된 데이터셋이면 origin = true, selected = true;
            item.selected = true;
            item.origin = true;
          } else{
            item.selected = false;
            item.origin = false;
          }

        });


        if (sessionStorage.getItem('DATASET_ID')) {
          this.selectedDatasetId = sessionStorage.getItem('DATASET_ID');
          this.datasets.filter((item) => {
            if (item.dsId === this.selectedDatasetId) {
              item.selected = true;
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
