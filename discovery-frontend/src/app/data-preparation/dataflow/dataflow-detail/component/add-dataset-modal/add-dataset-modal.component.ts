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
  Component, OnInit, ElementRef, Injector, EventEmitter, Output, OnDestroy, OnChanges, Input,
  HostListener
} from '@angular/core';
import * as _ from 'lodash';
import { AbstractComponent } from '../../../../../common/component/abstract.component';
//import { Dataflow } from '../../../../../domain/data-preparation/dataflow';
import { PrDataflow } from '../../../../../domain/data-preparation/pr-dataflow';
//import { Dataset, DsType } from '../../../../../domain/data-preparation/dataset';
import { PrDataset, DsType } from '../../../../../domain/data-preparation/pr-dataset';
import { PreparationAlert } from '../../../../util/preparation-alert.util';
import { Alert } from '../../../../../common/util/alert.util';
import { DataflowService } from '../../../service/dataflow.service';
import {PreparationCommonUtil} from "../../../../util/preparation-common.util";

@Component({
  selector: 'app-add-dataset-modal',
  templateUrl: './add-dataset-modal.component.html'
})
export class AddDatasetModalComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public datasetComplete = new EventEmitter();

  // 넘어온 데이터
  @Input()
  public dataflow: PrDataflow;

  // 선택된 데이터셋 리스트 (wrangled datasets도 포함된 리스트. 서버에 보내는 용)
  public selectedDatasets: PrDataset[] = [];

  // 화면상에 체크 된 데이터셋들 유지해야해서 갖고 있는다
  public tempDatasets: PrDataset[] = [];

  // 화면에 보여지는 리스트 - wrangled dataset은 배제
  public datasets: PrDataset[] = [];

  // 전체선택 여부
  public isCheckAll: boolean = false;

  // Sorting
  public selectedContentSort: Order = new Order();

  // filters
  public searchText: string = '';
  public searchDsType: string = 'IMPORTED';
  public searchImportType: string = 'HIVE';
  public typeFilter: any[];

  public prepCommonUtil = PreparationCommonUtil;

  // esc 창 닫힘
  @HostListener('document:keydown.escape', ['$event'])
  public onKeydownHandler(event: KeyboardEvent) {
    event.keyCode === 27 ? this.close(true) : null;
  }

  // 선택된 데이터셋 수
  get countSelected() {

    // selectedDatasets에 wrangled는 빼고 계산
    let num = this.datasets.filter((item) => {
      return item.dsType === DsType.IMPORTED && item.origin === true
    }).length;

    // wrangled가 빠진 num + 현재 선택된 데이터셋을 더한다
    return this.datasets.filter((obj) => {
      return obj.origin === false && obj.selected;
    }).length + num;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataflowService: DataflowService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    this.page.sort = 'modifiedTime,desc';

    this.initViewPage();
    this.getDatasets();
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  public ngOnChanges() {
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터셋 검색
  public searchDatasets(event: KeyboardEvent) {

    // enter
    if(13 === event.keyCode) {

      // 전체 선택 해제
      this.isCheckAll = false;

      // paging 초기화
      this.page.page = 0;

      // 데이터셋 목록 조회
      this.getDatasets();

    // esc
    } else if (27 === event.keyCode) {

      // 전체 선택 해제
      this.isCheckAll = false;

      // 검색어 초기화
      this.searchText = '';

      // 페이징 초기화
      this.page.page = 0;

      // 데이터셋 목록 조회
      this.getDatasets();
    }
  }

  // 데이터셋 목록 초기화
  public isInitDatasets(isInit?:boolean) {

    // 초기화 여부
    if (isInit) {

      // 검색어 초기화
      this.searchText = '';

      // 전체 선택 초기화
      this.isCheckAll = false;

      // 페이징 초기화
      this.page.page = 0;

      // 데이터셋 목록 조회
      this.getDatasets();

      // 초기화 필요하지 않을때 (페이징)
    } else {

      // 데이터셋 목록 조회
      this.getDatasets();
    }

  }

  // 데이터셋 목록 조회
  public getDatasets() {

    const checkedList = [];

    // 화면에서 선택된 것들을 checkedList에 넣는다
    this.tempDatasets.map((item) => {
      if (item.selected){
        checkedList.push(item.dsId);
      }
    });

    // selectedDataset에서 wrangled는 배제하고
    this.selectedDatasets.filter((item) => {
      return item.dsType === DsType.IMPORTED;
    }).filter((data) => {
      if (!(checkedList.indexOf(data.dsId) > -1)) { //checklist에 없는것만 push 한다
        checkedList.push(data.dsId);
      }
    });

    const dslist = this.selectedDatasets.map((ds) => {return ds.dsId;});

    this.loadingShow();
    // 데이터 셋 리스트 조회
    this.dataflowService.getDatasets(this.searchText, this.page, 'listing', this.searchDsType, this.searchImportType)
      .then((data) => {
        this.loadingHide();

        if (this.page.page === 0) {
          // 첫번째 페이지이면 초기화
          this.datasets = [];
        }

        // 페이징
        this.pageResult = data['page'];

        // 정렬
        const sorting = this.page.sort.split(',');
        this.selectedContentSort.key = sorting[0];
        this.selectedContentSort.sort = sorting[1];

        // origin은 selected = true처리
        const datasetList = data['_embedded'].preparationdatasets.filter((obj) => {
          obj.selected = dslist.indexOf(obj.dsId) > -1;
          obj.selected ? obj.origin = true : obj.origin = false;
          return obj;
        });

        this.datasets = this.datasets.concat(datasetList);

        // checkList에 들어있는 dataset들도 check
        this.datasets.forEach((item) => {
          item.selected = checkedList.indexOf(item.dsId) > -1;
        });

        // 전체 선택인지 확인
        const allTicked = this.datasets.filter((data) => {
          return data.selected;
        }).length;
        this.datasets.length === allTicked ? this.isCheckAll = true : this.isCheckAll = false;

        // 총페이지 수
        this.page.page += 1;

      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }

  // 창 닫기
  public close(isCancel?:boolean) {
    if (!isCancel) {
      this.datasetComplete.emit({value:'datasetComplete',isCancel:false}); // 추가하는 경우
    } else {
      this.datasetComplete.emit({value:'datasetComplete',isCancel:isCancel}); // 아무 작업하지 않고 취소하는경우
    }
  }

  // 완료 버튼 클릭
  public updateDatasets() {

    const count = this.tempDatasets.filter((obj) => {
      return obj.origin === false && obj.selected;
    }).length;

    // 원본데이터를 변경하기보단 클론해서 사용한다
    const selectedDatasetsCloned = _.cloneDeep(this.selectedDatasets);
    if (count > 0) {
      this.tempDatasets.map((item) => {
        if (item.origin === false && item.selected) {
          selectedDatasetsCloned.push(item);
        }
      });

      const params = { dsIds : selectedDatasetsCloned.map((ds) => { return ds.dsId; }) };

      this.loadingShow();
      this.dataflowService.updateDataSets(this.dataflow.dfId, params)
        .then((data) => {
          this.loadingHide();
          Alert.success(this.translateService.instant('msg.dp.alert.add.ds.success'));
          this.close();
        })
        .catch((error) => {
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    } else {
      return;
    }

  }

  // 타입필터가 선택되었을 때 처리
  public onSelected($event) {

    // 정렬 초기화
    this.selectedContentSort.sort = 'desc';
    this.selectedContentSort.key = 'modifiedTime';

    const filter = $event;
    this.searchDsType = filter.dsType;
    this.searchImportType = filter.importType;

  }

  // 전체 체크
  public checkAll() {
    this.isCheckAll = !this.isCheckAll;

    this.datasets = this.datasets.map((obj) => {
      obj.selected = this.isCheckAll;
      return obj;
    });

    this.datasets.filter((item) => { // this.datasets을 돌면서 selected 인건 this.dataflow.datasets에 push하고 빠지는건 splice한다
      const index = this.tempDatasets.map((ds) => {return ds.dsId;}).indexOf(item.dsId);
      if (index === -1 && item.selected) { // selected이고 list에 없다면
        this.tempDatasets.push(item);
      } else  if (!item.selected && index > -1){
        this.tempDatasets.splice(index, 1);
      }
    });

  }

  // 하나씩 체크
  public check(item) {
    item.selected = !item.selected;

    if (item.selected) {
      this.tempDatasets.push(item);
    } else {
      const idx = this.tempDatasets.map((ds) => {return ds.dsId;}).indexOf(item.dsId);
      if (idx > -1) {
        this.tempDatasets.splice(idx, 1);
      }
    }

    const num = this.datasets.filter((data) => {
      return data.selected;
    }).length;

    this.datasets.length === num ? this.isCheckAll = true : this.isCheckAll = false;

  }

  // 체크박스 부분선택 여부
  public partialChecked() {

    if (this.datasets.length === 0) {
      this.isCheckAll = false;
      return false;
    }

    const isCheckAll = this.datasets.every((item) => {
      return item.selected;
    });

    if (isCheckAll) {
      this.isCheckAll = true;
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

  }

  public validateAddSelection() {

    const selectedCnt = this.datasets.filter((dataset) => {
      return dataset.origin === false && dataset.selected;
    }).length;

    return selectedCnt === 0;
  }

  public changeOrder(column: string) {

    this.page.page = 0;

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;

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

    this.page.sort = column + ',' + this.selectedContentSort.sort;

    // 데이터소스 리스트 조회
    this.getDatasets();

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private initViewPage() {

    this.typeFilter = [
      {
        viewKey : 'All',
        dsType : '',
        importType : ''
      },
      {
        viewKey : 'WRANGLED',
        dsType : 'WRANGLED',
        importType : ''
      },
      {
        viewKey : 'IMPORTED(FILE)',
        dsType : 'IMPORTED',
        importType : 'FILE'
      },
      {
        viewKey : 'IMPORTED(DB)',
        dsType : 'IMPORTED',
        importType : 'DB'
      }
    ];

    if (this.dataflow['_embedded'] && this.dataflow['_embedded'].datasets) { // dataset이 넘어온게 무조건 있다
      this.selectedDatasets = this.dataflow['_embedded'].datasets; // 넘어온 데이터셋을 selectedDatasets에 보낼껀데 이건 서버에 보내는 것이다
      this.selectedDatasets.map((item)=> {
        item.selected = true;
        item.origin = true;
      });
    }
  }
}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
