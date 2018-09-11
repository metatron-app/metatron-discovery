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
import { AbstractPopupComponent } from '../../../../../../../common/component/abstract-popup.component';
import { Dataset } from '../../../../../../../domain/data-preparation/dataset';
import { Dataflow } from '../../../../../../../domain/data-preparation/dataflow';
import { PopupService } from '../../../../../../../common/service/popup.service';
import { DataflowService } from '../../../../../service/dataflow.service';
import { Alert } from '../../../../../../../common/util/alert.util';
import { PreparationAlert } from '../../../../../../util/preparation-alert.util';


@Component({
  selector: 'app-union-add-datasets',
  templateUrl: './union-add-datasets.component.html',
})
export class UnionAddDatasetsComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private searchDsType: string = 'WRANGLED';
  private searchImportType: string = '';
  public isCheckAll: boolean = false;
  public searchText: string = '';
  public selectedContentSort: Order = new Order();
  @Input()
  public isUpdate: boolean ; //수정 모드 여부


  public datasets: Dataset[] = [];        // 화면에 보여지는 데이터셋 리스트

  public tempDatasets: Dataset[] = [];     // 화면상에 체크 된 데이터셋들 유지해야해서 갖고 있는다

  private originalDsIds: string[] = [];    // existingDatasets안에 ids 모음

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Input Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input() // 현재 데이터플로우를 확인하기 위한 데이터
  public dfId: string;

  @Input() // 받아오는 기존 데이터
  public existingDatasets: Dataset[];

  @Input()
  public editInfo: Dataset[];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Output Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output() // 유니온 팝업을 닫을때 사용하는 eventemitter
  public complete = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public typeFilter: any[] = [
    { viewKey: '전체', dsType: '', importType: '' },
    { viewKey: 'WRANGLED', dsType: 'WRANGLED', importType: '' }
  ];

  // 선택된 데이터셋 수
  get countSelected() {

    let num = this.datasets.filter((item) => {
      return item.origin
    }).length;

    return this.datasets.filter((obj) => {
      return obj.selected && obj.origin === false;
    }).length + num;
  }

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
    this.page.sort = 'modifiedTime,desc';

    this.isUpdate ? this.checkEditInfo() : null;
    this.getDatasets();
  }

  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 수정 정보 세팅
   */
  public checkEditInfo() {
    let ids = this.editInfo.map((ds) => {return ds.dsId;});

    this.existingDatasets = this.existingDatasets.filter((item) => {
      if (ids.indexOf(item.dsId) === -1) {
        return item
      }
    });

    this.editInfo.forEach((item) => {
      item.selected = true;
      item.origin = false;
    });

    this.editInfo.map((item) => {
      this.tempDatasets.push(item);
    })

  }

  /**
   * 유니온 팝업 닫기
   */
  public close() {
    this.complete.emit(null);
  } // function - close

  /**
   * 유니온 룰 적용
   */
  public applyRule() {

    const selectedCnt = this.datasets.filter(item => item.origin === false && item.selected).length;

    if (0 === selectedCnt) {
      // Alert.error(this.translateService.instant('msg.dp.alert.no.added.ds'));
      return;
    }

    this.existingDatasets = [];
    this.existingDatasets = this.datasets.filter((ds) => {
      return ds.selected && ds.origin === false;
    });
    this.complete.emit(this.existingDatasets);

  } // function - applyRule

  /**
   * 전체 선택 이벤트 핸들러
   */
  public checkAllEventHandler() {
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
  } // function - checkAllEventHandler

  /**
   * 체크박스 이벤트 핸들러
   * @param item
   */
  public checkEventHandler(item) {
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
  } // function - checkEventHandler

  /**
   * 체크박스 부분선택 여부
   * @returns {boolean}
   */
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

  } // function - partialChecked

  /**
   * 타입필터가 선택되었을 때 처리
   * @param $event
   */
  public onTypeSelected($event) {
    const filter = $event;
    this.searchDsType = filter.dsType;
    this.searchImportType = filter.importType;
  } // function - onTypeSelected

  /**
   * 추가하기에 유효하지 않는 상태인지 확인한다
   * @returns {boolean}
   */
  public checkInvalidStateAdd() {
    return ( 0 === this.datasets.filter(item => item.origin === false && item.selected).length );
  } // function - validateAddSelection

  /**
   * 정렬 변경
   */
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

  // 데아터셋 검색
  public searchDatasets(event :KeyboardEvent) {

    // enter 키로 검색시
    if(13 === event.keyCode) {
      // 데이터셋 목록 조회
      this.getDatasets();

      // esc 키
    } else if (27 === event.keyCode) {

      // 검색어 초기화
      this.searchText = '';

      // 데이터셋 목록 조회
      this.getDatasets();
    }
  }


  /**
   * 데이터 셋 리스트 불러오기
   */
  public getDatasets() {

    this.page.size = 10000;


    const checkedList = [];

    // 화면에서 선택된 것들을 checkedList에 넣는다
    this.tempDatasets.map((item) => {
      if (item.origin === false && item.selected){
        checkedList.push(item.dsId);
      }
    });

    // 이미 선택된 데이터셋에 대한 아이디 목록을 정리한다
    this.originalDsIds = this.existingDatasets.map(ds => ds.dsId);
    this.datasets = [];

    this.loadingShow();

    // 데이터셋 목록을 불러온다
    this.dataflowService.getDatasets(this.searchText, this.page, 'listing', this.searchDsType, this.searchImportType).then((data) => {
      this.loadingHide();

      // sorting
      const sorting = this.page.sort.split(',');
      this.selectedContentSort.key = sorting[0];
      this.selectedContentSort.sort = sorting[1];

      if (data && data['_embedded'] && data['_embedded'].preparationdatasets) {

        this.datasets = data['_embedded'].preparationdatasets.filter((ds: Dataset) => {

          if (ds.dataflows.length !== 0) {
            if (ds.dataflows[0].dfId === this.dfId) {
              if (this.originalDsIds.indexOf(ds.dsId) > -1) {
                ds.selected = true;
                ds.origin = true;
              } else {
                ds.selected = false;
                ds.origin = false;
              }
              return ds;
            }
          }
        });

        const dfId = this.dfId;
        this.loadingShow();
        this.dataflowService.getUpstreams(dfId, this.isUpdate)
          .then((upstreams) => {
            this.loadingHide();
            let upstreamList = upstreams.filter((upstream) => {
              if (upstream.dfId === dfId) {
                return true;
              }
            });

            this.datasets = this.datasets.filter((obj) => {
              if (obj.dataflows.length !== 0) {
                for(let _df of obj.dataflows) {
                  if(_df.dfId === dfId) {
                    for(let originalDsId of this.originalDsIds) {
                      if( false == this.notUpstream( originalDsId, obj.dsId, upstreamList ) ) {
                        obj.selected = true;
                        obj.origin = true;
                        return true;
                        // 목록에서 제외 대신에 dim 처리
                        // return false;
                      }
                    }
                    return true;
                  }
                }
              }
              return false;
            });

          })
          .catch((error) => {
            this.loadingHide();
            let prep_error = this.dataprepExceptionHandler(error);
            PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
          });

        // checkList에 들어있는 dataset들도 check
        this.datasets.forEach((item) => {
          item.selected = checkedList.indexOf(item.dsId) > -1;
        });

        // 전체 선택인지 확인
        const allTicked = this.datasets.filter((data) => {
          return data.selected;
        }).length;
        this.datasets.length === allTicked ? this.isCheckAll = true : this.isCheckAll = false;

      } else {
        this.loadingHide();
      }

    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  } // function - getDatasets

}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
