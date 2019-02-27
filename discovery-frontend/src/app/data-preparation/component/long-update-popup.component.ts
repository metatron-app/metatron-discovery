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
import {PrDataset} from "../../domain/data-preparation/pr-dataset";
import {DataflowService} from "../dataflow/service/dataflow.service";
import {DatasetService} from "../dataset/service/dataset.service";
import {PreparationAlert} from "../util/preparation-alert.util";
import {RadioSelectDatasetComponent} from "./radio-select-dataset.component";
import { PopupService } from '../../common/service/popup.service';
import { SubscribeArg } from '../../common/domain/subscribe-arg';
import { Subscription } from 'rxjs/Subscription';
import {isNullOrUndefined} from "util";

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

  public swappingDatasetId : string;

  private popupSubscription: Subscription;

  private firstLoadCompleted: boolean = false;

  @Output()
  public closeEvent = new EventEmitter();

  @Output()
  public doneEvent = new EventEmitter();

  @Output()
  public addEvent = new EventEmitter();


  @Input()
  public dataflowId : string; // 현재 데이터플로우 아이디

  @Input()
  public isRadio : boolean = false;

  @Input()
  public popType : string = '';

  public title : string;
  public layoutType: string ='ADD'; // 새로운 데이터셋 추가 ADD, 기존 데이터셋 치환 SWAP

  @Input()
  //public originalDatasetList: Dataset[] = []; // 현재 데이터플로우에 추가되어 있는 모든 데이터셋 정보
  public originalDatasetList: PrDataset[] = []; // 현재 데이터플로우에 추가되어 있는 모든 데이터셋 정보


  @Input()
  public selectedDatasetId : string; // 미리보기를 위해 화면에 선택된 데이터셋
  public originalDatasetId : string;
  public datasets: PrDataset[] = []; // 화면에 보여지는 데이터셋 리스트 imported 만 빼서 저장하자


  // public clonedOriginalDatasetList : any [] = []; // 현재 데이터플로우에 추가되어있는 imported datasets
  public isCheckAllDisabled : boolean = false;
  public selectedDatasets : PrDataset[]; // 선택된 데이터셋 리스트


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

  // popup status
  public step: string;

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
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private dataflowService: DataflowService,
              private datasetService : DatasetService,
              private popupService: PopupService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();

    this.popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {
      this.step = data.name;
      if (this.step === 'complete-dataset-create') {

        if(data.hasOwnProperty('data') && data.data !== null) {
          this.selectedDatasetId = data.data;
          if(this.layoutType == 'SWAP') {
            this.swappingDatasetId = data.data;
          }
        }
        $('.ddp-ui-gridbody').scrollTop(0);
        this._initViewPage()
      }
    });

    if(this.isRadio) {
      // 기존 데이터셋 치환 SWAP
      this.layoutType = 'SWAP';
      this.originalDatasetId = this.selectedDatasetId;
    }else {
      // 새로운 데이터셋 추가 ADD
      this.layoutType = 'ADD';
    }
    this.selectedDatasetId = '';

    if(this.popType == 'add') {
      this.title = this.translateService.instant('msg.dp.btn.add.ds');
    } else if(this.popType == 'imported') {
      this.title = this.translateService.instant('msg.dp.ui.swap.dataset');
    } else if(this.popType == 'wrangled') {
      this.title = this.translateService.instant('msg.dp.ui.change.input.dataset');
    }
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
    this._initViewPage();
  } // function - init

  /**
   * 다음 단계로 이동
   */
  public done() {
    if(this.layoutType == 'ADD') {
      // 선택된 데이터셋이 없으면 X
      if (isNullOrUndefined(this.selectedDatasets) || this.selectedDatasets.length === 0 ) {
        return
      }
      let datasetLists: string[] =  [];
      this.selectedDatasets.forEach((ds) => {
        datasetLists.push(ds.dsId);
      });
      this.addEvent.emit(datasetLists);
    }else if(this.layoutType == 'SWAP') {
      let param = {oldDsId:this.originalDatasetId, newDsId : this.swappingDatasetId};
      param['type'] = this.popType;
      this.doneEvent.emit(param);
    }

  } // function - next


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

    // 상세정보 화면 초기화
    this.selectedDatasetId = '';

    // 선택된 checkbox  항목 초기화
    this.selectedDatasets = [];

    // 선택된 radio 항목 초기화
    this.swappingDatasetId = '';
    // this.firstLoadCompleted = false;

    // 데이터소스 리스트 조회
    this.getDatasets();
  } // function - searchEvent


  /**
   * Clear search text
   * @param isClear
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

    // 데이터셋 생성 팝업 생성
    this.step = 'select-datatype';

  } // function - createDataset

  /**
   * Retrieve dataset list
   */
  private getDatasets() {

    this.loadingShow();

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

        if(this.layoutType == 'ADD') {

          const dslist = this.originalDatasetList.map((ds) => {return ds.dsId;});
          // 데이터플로우에 이미 추가된 데이터셋이라면 selected, origin 을 true 로 준다.
          this.datasets.forEach((item) => {
            if (dslist.indexOf(item.dsId) > -1) {
              // item.selected = true;
              item.origin = true;
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
        }

        if (this.layoutType == 'SWAP') {
          // 데이터 플로우에 이미 추가된 데이터셋이라면 selected, origin 을 true 로 준다.
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

          // SWAP (radio button) mode : radio button 이 check 되지 않은 상태에서 부모화면에서 선택한 데이터셋이 load 된 경우, 이 항목의 radio button 을 check 한다
          if(this.firstLoadCompleted == false && (this.swappingDatasetId == undefined || this.swappingDatasetId == '')) {
            for(let i: number =0; i < this.datasets.length; i = i +1) {
              if(this.originalDatasetId == this.datasets[i].dsId) {
                this.swappingDatasetId = this.datasets[i].dsId;
                this.firstLoadCompleted = true;
                break;
              }
            }
          }
        }

        // 총페이지 수
        this.page.page += 1;

      }).catch((error)=> {
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
    // 검색어 초기화
    this.searchText  = '';

    // 선택된 checkbox  항목 초기화
    this.selectedDatasets = [];

    // radio all check false
    this.isCheckAll = false;

    // 정렬
    this.selectedContentSort = new Order();
    this.selectedContentSort.key = 'modifiedTime';
    this.selectedContentSort.sort = 'desc';

    // page 설정
    this.page.page = 0;
    this.page.size = 15;
    this.page.sort = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;

    this.getDatasets();
  } // function - initViewPage



  /**
   * 정렬 정보 변경
   * @param {string} column
   */
  public changeOrder(column: string) {

    // 선택된 radio 항목 초기화
    this.swappingDatasetId = '';
    // this.firstLoadCompleted = false;

    // 상세화면 초기화(close)
    this.selectedDatasetId = '';
    // checkbox 선택 항목 초기화
    this.selectedDatasets = [];


    // page sort 초기화
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

    this.getDatasets();

    // this.sortEvent.emit(this.page);
  } // function - changeOrder

  /**
   * 데이터 셋 선택
   * @param dataset
   */
  public selectDataset(dataset : any) {

    // 지금 보고있는 데이터면 show 해제
    if (dataset.dsId === this.selectedDatasetId) {
      this.selectedDatasetId = '';
    } else {
      // 데이터 아이디 저장
      this.selectedDatasetId = dataset.dsId;
    }
  } // function - selectDataset

  /**
   *  라디오 버튼 선택
   */
  public radioCheck(event,item) {
    event.stopPropagation();
    this.swappingDatasetId = item.dsId;
  } // function - check

  /**
   * 체크박스 전체 선택
   */
  public checkAll() {

    const currentCheck: boolean = this.isCheckAll;
    this.isCheckAll = !currentCheck;

    this.datasets = this.datasets.map((obj) => {
      if(obj.origin == true) {
        obj.selected = false; //  obj.selected = true or false
      }else{
        obj.selected = this.isCheckAll; //  obj.selected = true or false
      }
      return obj;
    });

    this.selectedDatasets = [];
    if(this.datasets !== null && this.datasets !== undefined) {
      for(let i: number =0; i < this.datasets.length; i = i + 1) {
        if(this.datasets[i].hasOwnProperty('selected') && this.datasets[i]['selected'] == true) {
          this.selectedDatasets.push(this.datasets[i]);
        }
      }
    }
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
    this.selectedDatasets = [];
    let originDatasetsCount: number = 0;

    if(this.datasets !== null && this.datasets !== undefined) {
      for(let i: number =0; i < this.datasets.length; i = i + 1) {
        if(this.datasets[i].hasOwnProperty('origin') && this.datasets[i]['origin'] == true) {
          originDatasetsCount ++;
        }else if(this.datasets[i].hasOwnProperty('selected') && this.datasets[i]['selected'] == true) {
          this.selectedDatasets.push(this.datasets[i]);
        }
      }
    }

    const num = this.datasets.filter((data) => {
      return data.selected;
    }).length;

    this.datasets.length === (num + originDatasetsCount) ? this.isCheckAll = true : this.isCheckAll = false;

  } // function - check

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


}

class Order {
  key: string = 'seq';
  sort: string = 'default';
}
