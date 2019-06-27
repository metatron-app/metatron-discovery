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

import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {Alert} from '../../../../common/util/alert.util';
import {Candidate, InclusionFilter} from '../../../../domain/workbook/configurations/filter/inclusion-filter';
import {isNullOrUndefined} from 'util';
import {Dashboard} from "../../../../domain/dashboard/dashboard";
import {DatasourceService} from "../../../../datasource/service/datasource.service";

@Component({
  selector: 'component-filter-multi-select',
  templateUrl: './filter-multi-select.component.html',
  host: {'(document:click)': 'onClickHost($event)'}
})
export class FilterMultiSelectComponent extends AbstractComponent implements OnInit {

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

  @Input('array')
  set setArray(array: Candidate[]) {
    this.array = array;
  }

  // 선택된 리스트 객체
  @Input('selectedArray')
  public selectedArray: Candidate[];

  // 화면에 표시하기 위한 모델의 키
  @Input()
  public viewKey: string;

  // 기본 메시지
  @Input()
  public unselectedMessage = this.translateService.instant('msg.comm.ui.list.all');

  // 비활성화 여부
  @Input()
  public disabled = false;

  // 외부에서 리스트를 조절하고 싶을 경우
  @Input()
  public isShowSelectListForOutSide = true;

  // 어디에서 사용하는지 여부 기본은 필터 패널
  @Input()
  public viewType = 'widget';

  @Input()
  public isShowAll = true;

  // 모형 모드 ( 기능은 동작하지 않고, 형태만 표시한다 )
  @Input('mockup')
  public isMockup?: boolean = false;

  @Input('filter')
  public filter: InclusionFilter;

  @Input('dashboard')
  public dashboard: Dashboard;

  // 변경 이벤트
  @Output() public onSelected = new EventEmitter();

  // 옵션 표시 변경 이벤트
  @Output() public changeDisplayOptions = new EventEmitter();

  // 페이지 호출 이벤트
  @Output() public onLoadPage = new EventEmitter<number>();

  // 보여줄 문자열
  public viewText: string;

  // 리스트 객체
  public array: Candidate[];

  // 셀렉트 리스트 show/hide 플래그
  public isShowSelectList = false;

  // 검색어
  public searchText: string = '';

  // 페이지 번호
  public pageNum: number = 0;

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

    // array check
    (isNullOrUndefined(this.selectedArray)) && (this.selectedArray = []);

    this.updateView(this.selectedArray);
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Returns whether Item is selected.
   * @param targetItem
   */
  public isSelectedItem(targetItem: any) {
    return this.selectedArray && this.selectedArray.some(item => item.name === targetItem.name);
  } // function - isSelectedItem

  /**
   * Returns whether all item selected
   */
  public get isSelectedAll() {
    return this.selectedArray && this.selectedArray.length > 0 && this.selectedArray.length === this.array.length;
  } // function - isSelectedAll

  /**
   * 아이템 선택
   * @param item
   * @param $event
   */
  public selected(item: any, $event: any) {

    // 모형 모드일 때는 기능 동작을 하지 않는다
    if (this.isMockup) {
      Alert.info(this.translateService.instant('msg.board.alert.not-select-editmode'));
      return;
    }

    if (this.isSelectedItem(item)) {
      const idx = this.selectedArray.findIndex(arrItem => arrItem.name === item.name);
      this.selectedArray.splice(idx, 1);
    } else {
      this.selectedArray.push(item);
    }

    this.updateView(this.selectedArray);
  } // function selected

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
      this.selectedArray = [];
    } else {
      this.selectedArray = [];
      this.array.forEach(item => this.selectedArray.push(item));
    }

    this.updateView(this.selectedArray);
  } // function - checkAll

  /**
   * 외부영역 클릭
   * @param {MouseEvent} event
   */
  public onClickHost(event: MouseEvent) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isShowSelectList && this.array && this.array.length) {
        this.onSelected.emit(this.selectedArray);
      }
      // 팝업창 닫기
      this.isShowSelectList = false;
      this.changeDisplayOptions.emit(this.isShowSelectList);
    }
  } // function - onClickHost

  /**
   * 셀렉트 박스 토글 클릭
   */
  public toggleSelectList() {
    this._setViewListPosition();
    this.isShowSelectList = !this.isShowSelectList;
    if (!this.isShowSelectList) {
      this.onSelected.emit(this.selectedArray);
    }
    this.changeDisplayOptions.emit(this.isShowSelectList);
  } // function - toggleSelectList


  /**
   * 값 초기화
   * @param valueList
   */
  public reset(valueList: any) {
    this.selectedArray = (valueList == null || valueList.length === 0) ? [] : valueList;
    this.updateView(this.selectedArray);
  } // function - reset

  /**
   * update combo-box label
   * @param selectedArray
   */
  public updateView(selectedArray: any) {
    if (selectedArray == null || selectedArray.length === 0) {
      this.viewText = this.unselectedMessage;
    } else if (selectedArray.length === this.array.length) {
      this.viewText = this.translateService.instant('msg.comm.ui.list.all');
    } else {
      this.viewText = selectedArray.map(item => item.name).join(',');
    }
  } // function - updateView

  /**
   * 리스트 닫기
   */
  public closeList() {
    this.isShowSelectList = false;
    this.onSelected.emit(this.selectedArray);
    this.changeDisplayOptions.emit(this.isShowSelectList);
  } // function - closeList

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

            this.array.push(candidate);
          }
        });

        this.safelyDetectChanges();
      }

      this.loadingHide();
    }).catch((error) => {
      this.commonExceptionHandler(error);
    });
  }

  public setViewListPosition() {
    this._setViewListPosition();
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
      $ddpOffSetEl.find('.ddp-drop').css({
        top: $dropboxTop.top,
        left: $dropboxTop.left,
        width: $dropboxWidth
      });
    }
  } // function - _setViewListPosition

  private existCandidate(name : string) : boolean {
    const filteredCandidates = this.array.filter(candidate => candidate.name === name);
    if(filteredCandidates != null && filteredCandidates.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
