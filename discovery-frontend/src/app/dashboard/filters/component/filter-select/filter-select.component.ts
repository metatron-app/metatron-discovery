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

import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractComponent } from '../../../../common/component/abstract.component';
import { Alert } from '../../../../common/util/alert.util';
import {
  Candidate,
  InclusionFilter,
  InclusionSelectorType
} from '../../../../domain/workbook/configurations/filter/inclusion-filter';
import {isNullOrUndefined} from "util";
import {FilterUtil} from "../../../util/filter.util";
import {DatasourceService} from "../../../../datasource/service/datasource.service";
import {Dashboard} from "../../../../domain/dashboard/dashboard";
import * as _ from 'lodash';

@Component({
  selector: 'component-filter-select',
  templateUrl: './filter-select.component.html',
  host: { '(document:click)': 'onClickHost($event)' }
})
export class FilterSelectComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('ddpOffSet')
  private ddpOffSet: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 문자열
  public isStringArray = false;

  @Input('array')
  set setArray(array: Candidate[]) {
    this.candidateList = array;
  }

  // 서버와 통신 후 인덱스를 지정해야 하는 경우
  @Input('defaultIndex')
  set setDefaultIndex(index: number) {
    if(this.isSelectorTypeSingle()) {
      this.defaultIndex = index;
      this.selectedItems.push(this.candidateList[this.defaultIndex]);
    }
  }

  // 기본 메시지
  @Input()
  public unselectedMessage = this.translateService.instant( 'msg.comm.ui.list.all' );

  // 비활성화 여부
  @Input()
  public disabled = false;
  // 선택 아이템
  @Input()
  public selectedItems: Candidate[];

  // 셀렉트 리스트 show/hide 플래그
  public isShowSelectList = false;
  // 외부에서 리스트를 조절하고 싶을 경우
  @Input()
  public isShowSelectListForOutSide = true;
  // All 표시 여부
  @Input()
  public isShowAll = true;
  // 화면에 표시하기 위한 모델의 키
  @Input()
  public viewKey: string;
  // 셀렉트박스를 위로 할 것인지 여부(기본: down)
  @Input()
  public isUpSelect = false;
  // 어디에서 사용하는지 여부 기본은 필터 패널
  @Input()
  public viewType = 'widget';

  // 모형 모드 ( 기능은 동작하지 않고, 형태만 표시한다 )
  @Input('mockup')
  public isMockup?: boolean = false;

  @Input('filter')
  public filter: InclusionFilter;

  @Input('dashboard')
  public dashboard: Dashboard;

  // 단일 데이터 선택 이벤트
  @Output() public onSelected = new EventEmitter();

  // ALL 데이터 선택 이벤트
  @Output() public onCheckAll = new EventEmitter();

  // 옵션 표시 변경 이벤트
  @Output() public changeDisplayOptions = new EventEmitter<boolean>();

  // 페이지 호출 이벤트
  @Output() public onLoadPage = new EventEmitter<number>();

  // 리스트 객체
  public candidateList: Candidate[];
  // 검색어
  public searchText: string = '';
  // 기본 선택 인덱스
  public defaultIndex = -1;
  // 페이지 번호
  public pageNum: number = 0;

  public pageCandidateList: Candidate[] = [];
  public currentPage = 1;
  public lastPage = 1;
  public pageSize = 10;
  public totalCount = 0;

  public viewText: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected datasourceService: DatasourceService) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();

    (isNullOrUndefined(this.selectedItems)) && (this.selectedItems = []);

    if (this.candidateList != null && this.candidateList.length > 0) {
      if (typeof this.candidateList[0] === 'string') {
        this.isStringArray = true;
      }
    }

    if(this.isSelectorTypeSingle()) {
      if (this.defaultIndex > -1) {
        this.selectedItems.push(this.candidateList[this.defaultIndex]);
      }
    }

    this.updateView();
    this.setCandidatePage(1, true);
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * All Item 선택
   */
  public selectAllItem() {
    // 모형 모드일 때는 기능 동작을 하지 않는다
    if( this.isMockup ) {
      Alert.info(this.translateService.instant('msg.board.alert.not-select-editmode'));
      return;
    }

    this.selectedItems = [];

    if( this.isSelectorTypeSingle() ) {
      this.onCheckAll.emit('all');
      this.isShowSelectList = false;
      this.changeDisplayOptions.emit(this.isShowSelectList);
    }
  } // function - selectAllItem

  /**
   * 아이템 선택
   * @param {Candidate} item
   */
  public selectCandidateItem(item: Candidate) {
    // 모형 모드일 때는 기능 동작을 하지 않는다
    if( this.isMockup ) {
      Alert.info(this.translateService.instant('msg.board.alert.not-select-editmode'));
      return;
    }

    // 선택 변수에 저장
    if(this.isSelectorTypeSingle()) {
      this.selectedItems = [];
      this.selectedItems.push(item);

      this.onSelected.emit(item);

      this.isShowSelectList = false;
      this.changeDisplayOptions.emit(this.isShowSelectList);
    } else if(this.isSelectorTypeMulti()) {
      if (this.isSelectedItem(item)) {
        const idx = this.selectedItems.findIndex(arrItem => arrItem.name === item.name);
        this.selectedItems.splice(idx, 1);
      } else {
        this.selectedItems.push(item);
      }
    }

    this.updateView();

  } // function - selectCandidateItem

  /**
   * 마우스 아웃처리
   * @param {MouseEvent} event
   */
  public onClickHost(event:MouseEvent) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      if(this.isSelectorTypeMulti()) {
        if (this.isShowSelectList && this.candidateList && this.candidateList.length) {
          this.onSelected.emit(this.selectedItems);
        }
      }

      this.isShowSelectList = false;
      this.changeDisplayOptions.emit(this.isShowSelectList);

    }
  } // function onClickHost

  /**
   * 셀렉트박스 클릭 토클 이벤트
   */
  public toggleSelectList(event?:MouseEvent) {
    if( event ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    this._setViewListPosition();
    this.isShowSelectList = !this.isShowSelectList;

    if(this.isSelectorTypeMulti()) {
      if (!this.isShowSelectList) {
        this.onSelected.emit(this.selectedItems);
      }
    }

    this.changeDisplayOptions.emit(this.isShowSelectList);

  } // function toggleSelectList

  public setViewListPosition() {
    this._setViewListPosition();
  }

  /**
   * 값 초기화
   * @param {any} valueList
   */
  public reset(valueList: any) {
    if (valueList == null || valueList.length === 0) {
      this.selectedItems = [];
    } else {
      if(this.isSelectorTypeSingle()) {
        this.selectedItems.push(valueList[0]);
      } else if(this.isSelectorTypeMulti()) {
        this.selectedItems = valueList;
      }
    }

    this.changeDetect.detectChanges();
  } // function reset

  /**
   * 리스트 닫기
   */
  public closeList() {
    this.isShowSelectList = false;

    if(this.isSelectorTypeMulti()) {
      this.onSelected.emit(this.selectedItems);
    }

    this.changeDisplayOptions.emit(this.isShowSelectList);
  } // function closeList

  /**
   * 스크롤 시 이벤트 ( 다음페이지 조회 호출 )
   */
  public onScroll() {
    this.onLoadPage.emit(this.pageNum++);
  } // function - onScroll


  public candidateFromSearchText() {
    this.loadingShow();
    this.datasourceService.getCandidateForFilter(
      this.filter, this.dashboard, [], null, null, this.searchText).then((resultCandidates) => {
      if(resultCandidates && resultCandidates.length > 0) {
        resultCandidates.forEach((resultCandidate) => {
          if(this.existCandidate(resultCandidate.field) === false) {
            let candidate = new Candidate();
            candidate.count = resultCandidate.count;
            candidate.name = resultCandidate.field;
            candidate.isTemporary = true;

            this.candidateList.push(candidate);
          }
        });

        this.setCandidatePage(1, true);
      }

      this.isShowSelectList = true;
      this.safelyDetectChanges();

      this.loadingHide();
    }).catch((error) => {
      this.commonExceptionHandler(error);
    });
  }

  public setCandidatePage(page: number, isInitial: boolean = false) {
    if (isInitial) {
      this.pageCandidateList = [];
      this.currentPage = 1;
      this.lastPage = 1;
      this.totalCount = 0;
    }

    // 더이상 페이지가 없을 경우 리턴
    if (page <= 0) return;
    if (this.lastPage < page) return;

    this.currentPage = page;
    let start = 0;
    let end = 0;

    // 필드 페이징
    if (this.candidateList && 0 < this.candidateList.length) {

      let pagedList: Candidate[] = _.cloneDeep(this.candidateList);

      if (this.filter.showSelectedItem) {
        pagedList = pagedList.filter(item => {
          return -1 < this.selectedItems.findIndex(val => val.name === item.name);
        });
      }

      // 검색 적용
      if ('' !== this.searchText) {
        pagedList = pagedList.filter(item => {
          return ( item.name ) ? -1 < item.name.toLowerCase().indexOf(this.searchText.toLowerCase()) : false;
        });
      }

      // 총사이즈
      this.totalCount = pagedList.length;

      // 마지막 페이지 계산
      this.lastPage = (this.totalCount % this.pageSize === 0) ? (this.totalCount / this.pageSize) : Math.floor(this.totalCount / this.pageSize) + 1;
      (1 > this.lastPage) && (this.lastPage = 1);

      start = (page * this.pageSize) - this.pageSize;
      end = page * this.pageSize;
      if (end > this.totalCount) {
        end = this.totalCount;
      }
      // 현재 페이지에 맞게 데이터 자르기
      this.pageCandidateList = pagedList.slice(start, end);
    }
  }

  public deselectCandidate() {
    this.selectedItems = [];
    this.filter.showSelectedItem = false;
    this.setCandidatePage(1, true);
    this.selectAllItem();
    this.updateView();
  }

  /**
   * update combo-box label
   * @param selectedArray
   */
  public updateView(items?: any) {
    let selectedItems = this.selectedItems;

    if(items) {
      selectedItems = items;
    }

    if (selectedItems == null || selectedItems.length === 0) {
      this.viewText = this.unselectedMessage;
    } else if (selectedItems.length === this.candidateList.length) {
      this.viewText = this.translateService.instant('msg.comm.ui.list.all');
    } else {
      this.viewText = selectedItems.map(item => item.name).join(',');
    }
  } // function - updateView

  /**
   * 전체선택
   * @param $event
   */
  public checkAll($event?) {
    // 모형 모드일 때는 기능 동작을 하지 않는다
    if (this.isMockup) {
      Alert.info(this.translateService.instant('msg.board.alert.not-select-editmode'));
      return;
    }

    if (this.isSelectedAll) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [];
      this.candidateList.forEach(item => this.selectedItems.push(item));
    }

    this.updateView();
  } // function - checkAll

  /**
   * Returns whether all item selected
   */
  public get isSelectedAll() {
    return this.selectedItems && this.selectedItems.length > 0 && this.selectedItems.length === this.candidateList.length;
  } // function - isSelectedAll

  /**
   * Returns whether Item is selected.
   * @param targetItem
   */
  public isSelectedItem(targetItem: any) {
    return this.selectedItems && this.selectedItems.some(item => item.name === targetItem.name);
  } // function - isSelectedItem

  public isSelectorTypeSingle() : boolean {
    return (<InclusionFilter>this.filter).selector === InclusionSelectorType.SINGLE_COMBO;
  }

  public isSelectorTypeMulti() : boolean {
    return (<InclusionFilter>this.filter).selector === InclusionSelectorType.MULTI_COMBO;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 위젯에서 클릭시 리스트 위치 설정
   */
  private _setViewListPosition() {
    if (this.viewType === 'widget') {
      const $ddpOffSetEl = $(this.ddpOffSet.nativeElement);
      const $dropboxTop = $ddpOffSetEl.offset();
      const $dropboxWidth = $ddpOffSetEl.width();
      $ddpOffSetEl.find('.ddp-wrap-popup2').css({
        top : $dropboxTop.top + 30,
        left : $dropboxTop.left,
        width : $dropboxWidth  + 30
      });
    }
  }// function _setViewListPosition

  private existCandidate(name : string) : boolean {
    const filteredCandidates = this.candidateList.filter(candidate => candidate.name === name);
    if(filteredCandidates != null && filteredCandidates.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
