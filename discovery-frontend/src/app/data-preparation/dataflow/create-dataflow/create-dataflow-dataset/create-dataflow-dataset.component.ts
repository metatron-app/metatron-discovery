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
  Component, ElementRef, Injector, Input, OnChanges, OnDestroy, OnInit, SimpleChanges,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../common/service/popup.service';
import { DataflowService } from '../../service/dataflow.service';
import { Dataflow } from '../../../../domain/data-preparation/dataflow';
import { Dataset } from '../../../../domain/data-preparation/dataset';
import { isUndefined } from 'util';
import { Alert } from '../../../../common/util/alert.util';
import { PreparationAlert } from '../../../util/preparation-alert.util';
import { CreateModalComponent } from '../../../../common/component/modal/create/create.component';
import { Modal } from '../../../../common/domain/modal';

@Component({
  selector: 'app-create-dataflow-dataset',
  templateUrl: './create-dataflow-dataset.component.html',
})
export class CreateDataflowDatasetComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(CreateModalComponent)
  public createModalComponent: CreateModalComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public dataflow: Dataflow;

  public datasets: Dataset[] = [];

  // 전체선택 여부
  public isCheckAll: boolean = false;

  // filters
  public searchText: string = '';
  public searchDsType: string = 'IMPORTED';
  public searchImportType: string = '';

  public typeFilter: any[];

  // type default 선택값
  public defaultIndex = 0;

  // protected -> public
  public selectedContentSort: Order = new Order();


  get countSelected() {

    return this.datasets.filter((obj) => {
      return obj.selected
    }).length ;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private dataflowService: DataflowService,
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
    this.getDatasets();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.dataflow.datasets = [];
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 타입필터가 선택되었을 때 처리
  public onSelected($event) {

    const filter = $event;
    this.searchDsType = filter.dsType;
    this.searchImportType = filter.importType;

    this.getDatasets();
  }


  // 다음으로 넘어가기
  public next() {
    if (this.dataflow.datasets.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.please.sel.ds'));
      return;
    }

    this.popupService.notiPopup({
      name: 'create-name',
      data: null
    });
  }

  // 창을 닫는다
  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }

  // next 버튼 비활성화
  public validateAddSelection() {

    const selectedCnt = this.datasets.filter((dataset) => {
      return dataset.selected;
    }).length;

    return selectedCnt === 0;

  }

  // 데이터 셋 검색
  public searchDatasets(event : KeyboardEvent) {

    if(13 === event.keyCode) {

      this.isCheckAll = false;
      this.page.page = 0;
      this.getDatasets();

    } else if (27 === event.keyCode) {
      this.searchText = '';
      this.isCheckAll = false;
      this.page.page = 0;
      this.getDatasets();
    }

  }

  public isInitDatasets(isInit?:boolean) {

    if (isInit) {
      this.searchText = '';
      this.isCheckAll = false;
      this.page.page = 0;
      this.getDatasets();
    } else {
      this.getDatasets();
    }

  }

  // 데이터셋 목록 가져오기
  public getDatasets() {
    const checkedList = [];
    this.dataflow.datasets.map((item) => {
      checkedList.push(item.dsId);
    });

    this.loadingShow();

    this.dataflowService.getDatasets(this.searchText, this.page, 'listing', this.searchDsType, this.searchImportType)
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

        const list = data['_embedded'].preparationdatasets.map((obj) => {
          if (this.dataflow.datasets.length > 0) {
            obj.selected = this.datasets.map((ds) => {return ds.dsId;}).indexOf(obj.dsId) > -1;
          } else {
            obj.selected = false;
          }

          if (isUndefined(obj.importType)) obj.importType = '';

          return obj;
        });

        this.datasets = this.datasets.concat(list);

        this.datasets.forEach((item) => {
          item.selected = checkedList.indexOf(item.dsId) > -1;
        });

        if (0 !== this.datasets.length) {  // 데이터셋이 하나라도 있을때
          const allTicked = this.datasets.filter((data) => {
            return data.selected;
          }).length;
          this.datasets.length === allTicked ? this.isCheckAll = true : this.isCheckAll = false;
        }
        // 총페이지 수
        this.page.page += 1;
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }


  // 체크박스 전체 선택
  public checkAll() {
    this.isCheckAll = !this.isCheckAll;
    this.datasets = this.datasets.map((obj) => {
      obj.selected = this.isCheckAll; //  obj.selected = true or false
      return obj;
    });

    this.datasets.filter((item) => { // this.datasets을 돌면서 selected 인건 this.dataflow.datasets에 push하고 빠지는건 splice한다
      const index = this.dataflow.datasets.map((ds) => {return ds.dsId;}).indexOf(item.dsId);
      if (index === -1 && item.selected) { // selected이고 list에 없다면
        this.dataflow.datasets.push(item);
      } else  if (!item.selected && index > -1){
        this.dataflow.datasets.splice(index, 1);
      }
    });
  }

  // 체크 박스 한개씩 선택
  public check(item) {

    item.selected = !item.selected;
    if (item.selected) {
      this.dataflow.datasets.push(item);
    } else {
      const idx = this.dataflow.datasets.map((ds) => {return ds.dsId;}).indexOf(item.dsId);
      if (idx > -1) {
        this.dataflow.datasets.splice(idx, 1);
      }
    }

    const num = this.datasets.filter((data) => {
      return data.selected;
    }).length;

    this.datasets.length === num ? this.isCheckAll = true : this.isCheckAll = false;

  }

  // 체크박스 부분선택 여부
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

  }

  /** 정렬 */
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


  // 데이터셋 생성으로 이동
  public createDatasetPopup(event) {
    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.dp.ui.create-ds.title');
    modal.description = this.translateService.instant('msg.dp.ui.create-ds.sub.title');

    this.createModalComponent.init(modal);
  }

  // 데이터셋 생성으로 이동
  public openCreateDataset() {

    this.router.navigate(['/management/datapreparation/dataset/new']);

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
        viewKey : '전체',
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
  }

}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
