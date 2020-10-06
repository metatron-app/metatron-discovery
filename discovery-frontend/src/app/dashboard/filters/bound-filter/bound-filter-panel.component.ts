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
  Component,
  ElementRef,
  Injector,
  Input,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { SubscribeArg } from '../../../common/domain/subscribe-arg';
import { Filter } from '../../../domain/workbook/configurations/filter/filter';
import { PopupService } from '../../../common/service/popup.service';
import { BoundFilter } from '../../../domain/workbook/configurations/filter/bound-filter';
import { AbstractFilterPanelComponent } from '../abstract-filter-panel.component';
import * as _ from 'lodash';
import { Field } from '../../../domain/datasource/datasource';
import { BoundFilterComponent } from './bound-filter.component';

@Component({
  selector: 'bound-filter-panel',
  templateUrl: './bound-filter-panel.component.html'
})
export class BoundFilterPanelComponent extends AbstractFilterPanelComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(BoundFilterComponent)
  private _boundFilterComp: BoundFilterComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 필터
  public filter: BoundFilter;

  public isNewFilter:boolean = false;

  @Input('filter')
  public originalFilter: BoundFilter;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              protected datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    const filterChanges: SimpleChange = changes.originalFilter;
    if (filterChanges) {
      const currFilter: BoundFilter = _.cloneDeep(filterChanges.currentValue);

      this.setPanelData(currFilter);    // 패널에서 사용하는 데이터 설정

      (this.dataSource) && (this._candidate(currFilter)); // 후보값 조회

    }
  } // function - ngOnChanges

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {

    if( this.originalFilter['isNew'] ) {
      this.isNewFilter = true;
      this.safelyDetectChanges();
      delete this.originalFilter['isNew'];
      setTimeout( () => {
        this.isNewFilter = false;
        this.safelyDetectChanges();
      }, 1500 );
    }

    // 위젯에서 필터를 업데이트 popup은 아니지만 동일한 기능이 필요해서 popupService를 사용
    const popupSubscribe = this.popupService.filterView$.subscribe((data: SubscribeArg) => {

      // 페이지에서 호출했는데 대시보드인경우 처리 하지 않음
      if (data.type === 'page' && this.isDashboardMode) return;

      const filter: Filter = data.data;

      if ('remove-filter' === data.name && this.filter.ui.importanceType === 'general') {
        // 필터 패널의 필터가 변경되었는데 내가 아닐 경우
        if (filter.field !== this.filter.field) {
          this._candidate(this.filter, 'reset');
        }
      } else if ('reset-general-filter' === data.name) {
        //  필수 필터가 변경된 경우 일반필터 초기화 (bound필터는 일반필터만 존재함)
        this._candidate(this.filter, 'reset');
      }
    });

    this.subscriptions.push(popupSubscribe);

  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public getMeasureTypeIconClass = Field.getMeasureTypeIconClass;

  /**
   * 값 초기화 (서버에 마지막으로 저장된 값)
   */
  public resetFilter() {
    this.filter = _.cloneDeep(this.originalFilter);
    this.safelyDetectChanges();
    this.updateFilterEvent.emit(this.filter);
  } // function - resetFilter

  /**
   * 상세메뉴 온오프
   */
  public toggleDetailMenu() {
    this.isShowDetailMenu = !this.isShowDetailMenu;
  } // function resetFilter

  /**
   * 값 적용
   */
  public applyValue() {
    this.updateFilterEvent.emit(this._boundFilterComp.getData());
  } // function - applyValue

  /**
   * 필터 삭제
   * @param {Filter} filter
   */
  public deleteFilter(filter: Filter) {
    this.deleteFilterEvent.emit(filter);
  } // function - deleteFilter

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터 값 조회
   * @param {BoundFilter} filter
   * @param {string} type
   * @private
   */
  private _candidate(filter: BoundFilter, type?: string) {
    if (filter && this.dashboard && this.field) {
      // 후보군 API
      this.loadingShow();
      this.datasourceService.getCandidateForFilter(filter, this.dashboard, this.getFiltersParam(filter), this.field)
        .then((result) => {
          if (result && result.hasOwnProperty('maxValue')) {
            if ((filter.min === Number.MIN_SAFE_INTEGER && filter.max === Number.MAX_SAFE_INTEGER) || type === 'reset') {
              filter.min = result.minValue;
              filter.max = result.maxValue;
            }
            filter.maxValue = result.maxValue;
            filter.minValue = result.minValue;
          } else {
            filter.min = null;
            filter.max = null;
            filter.maxValue = null;
            filter.minValue = null;
          }

          this.filter = filter;
          this.isShowFilter = true;
          this.safelyDetectChanges();
          this._boundFilterComp.setFilter(this.filter);
          this.loadingHide();
        })
        .catch((error) => {
          this.commonExceptionHandler(error);
          // 위젯 화면 표시
          this.isShowFilter = true;
        });
    }
  } // function - _candidate

}
