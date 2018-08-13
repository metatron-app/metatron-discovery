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

import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { Alert } from '../../../common/util/alert.util';
import { FilteringOptions, FilteringOptionType } from '../../../domain/workbook/configurations/filter/filter';
import { ConfirmModalComponent } from '../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../common/domain/modal';

@Component({
  selector: 'edit-filter-data-source',
  templateUrl: './edit-filter-data-source.component.html'
})
export class EditFilterDataSourceComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // source id
  private _sourceId: string;
  // 컬럼 목록 원본
  private _columnList: any[];
  // 기존에 필터링 설정된 목록
  private _originFilteringColumnList: any[];

  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 필터링된 컬럼 목록
  public filteredColumnList: any[];
  // 필터링 롤 타입 목록
  public roleTypeFilterList: any[] = [
    { label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL' },
    { label: this.translateService.instant('msg.comm.name.dim'), value: 'DIMENSION' },
    { label: this.translateService.instant('msg.comm.name.mea'), value: 'MEASURE' },
  ];
  // 선택한 필터링 role 타입 목록
  public selectedRoleTypeFilter: any;
  // 필터링 role 타입 목록 show flag
  public isShowRoleTypeFilterList: boolean;
  // 필터링 타입 목록
  public typeFilterList: any[] = [
    { label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL' },
    { label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING' },
    { label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN' },
    { label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER', measure: true },
    { label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE', measure: true  },
    { label: this.translateService.instant('msg.storage.ui.list.timestamp'), value: 'TIMESTAMP' },
    { label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT' },
    { label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG' }
  ];
  // 선택한 필터링 타입
  public selectedTypeFilter: any;
  // 필터링 타입 목록 show flag
  public isShowTypeFilterList: boolean;
  // 필터설정된 컬럼 목록만 보기 flag
  public isShowOnlyFilterColumnList: boolean;
  // 검색어
  public searchTextKeyword: string;
  // component show flag
  public isShowComponent: boolean;
  // 이 데이터소스가 LINKED형 인지
  public isLinkedType: boolean;


  @Output()
  public updatedSchema: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _dataSourceService: DatasourceService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * init
   * @param {string} sourceId
   * @param columnList
   * @param {boolean} isLinkedType
   */
  public init(sourceId: string, columnList: any, isLinkedType: boolean): void {
    // ui init
    this._initView();
    // source id
    this._sourceId = sourceId;
    // Measure 가 아닌 컬럼 목록만 복사
    // TODO 만약 TIMESTAMP로 지정된 컬럼도 filteringOptions 설정이 가능하도록 변경해달라고 하면 주석 해제할 것
    // this._columnList = _.cloneDeep(_.filter(columnList, column => column.role !== 'MEASURE'));
    this._columnList = _.cloneDeep(_.filter(columnList, column => column.role === 'DIMENSION'));
    // 기존에 필터링 설정된 목록
    this._originFilteringColumnList = _.cloneDeep(_.filter(this._columnList, column => column.filtering));
    // 이 데이터소스가 연결형인지
    this.isLinkedType = isLinkedType;
    // 필터링된 목록 갱신
    this._updateFilteredColumnList();
  }

  /**
   * 검색어 검색
   * @param {string} text
   */
  public searchText(text: string): void {
    this.searchTextKeyword = text;
    // 필터링된 목록 갱신
    this._updateFilteredColumnList();
  }

  /**
   * 현재 컬럼이 필터가 설정된 상태인지
   * @param column
   * @returns {boolean}
   */
  public isEnableColumnFiltering(column: any): boolean {
    return column.filtering;
  }

  /**
   * 현재 컬럼에 필터 옵션이 있다면
   * @param column
   * @returns {boolean}
   */
  public isEnableColumnFilteringOptions(column: any): boolean {
    return column.filteringOptions;
  }

  /**
   * 현재 컬럼의 타입 label
   * @param {string} type
   * @param typeList
   * @returns {string}
   */
  public getColumnTypeLabel(type:string, typeList: any): string {
    return typeList[_.findIndex(typeList, item => item['value'] === type)].label;
  }

  /**
   * 컬럼 목록 업데이트
   */
  public updateColumnList(): void {
    // 로딩 show
    this.loadingShow();
    // 필드 업데이트
    this._dataSourceService.updateDatasourceFields(this._sourceId, this._getUpdateFieldParams())
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        // 로딩 hide
        this.loadingHide();
        // 변경 emit
        this.updatedSchema.emit();
        // close
        this.onClickCancel();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * cancel 버튼 클릭 이벤트
   */
  public onClickCancel(): void {
    this.isShowComponent = false;
  }

  /**
   * done 버튼 클릭 이벤트
   */
  public onClickDone(): void {
    // 만약 데이터소스 타입이 linked 형일 경우 확인팝업 출력
    this.isLinkedType ? this._openConfirmModal() : this.updateColumnList();
  }

  /**
   * 검색어 검색 이벤트
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 &&  this.searchText(event.target['value']);
  }

  /**
   * 롤 타입 필터링 변경 이벤트
   * @param type
   */
  public onChangeRoleTypeFilter(type: any): void {
    if (this.selectedRoleTypeFilter !== type) {
      // 롤 타입 필터링 변경
      this.selectedRoleTypeFilter = type;
      // 컬럼 목록 갱신
      this._updateFilteredColumnList();
    }
  }

  /**
   * 타입 필터링 변경 이벤트
   * @param type
   */
  public onChangeTypeFilter(type: any): void {
    if (this.selectedTypeFilter !== type) {
      // 타입 필털이 변경
      this.selectedTypeFilter = type;
      // 컬럼 목록 갱신
      this._updateFilteredColumnList();
    }
  }

  /**
   * 필터링
   */
  public onChangeShowFilter(): void {
    this.isShowOnlyFilterColumnList = !this.isShowOnlyFilterColumnList;
    // 컬럼 목록 갱신
    this._updateFilteredColumnList();
  }

  /**
   * 현재 컬럼에 필터 설정 및 해제
   * @param column
   */
  public onClickSetColumnFiltering(column: any): void {
    // TODO 만약 TIMESTAMP로 지정된 컬럼도 filteringOptions 설정이 가능하도록 변경해달라고 하면 주석 해제할 것
    // if (column.role !== 'TIMESTAMP') {
      // 현재 변경된 필터가 설정된 상태라면 제거
      if (this.isEnableColumnFiltering(column)) {
        const seq = column.filteringSeq;
        // 필터설정 제거
        delete column.filtering;
        delete column.filteringSeq;
        delete column.filteringOptions;
        // 현재 변경된 필터가 해제된 상태라면 나머지 필터링된 컬럼 갱신
        this._resortFilteringColumnList(seq);
        // 만약 현재 필터링 컬럼만 보기가 활성화 상태라면 목록 갱신
        this.isShowOnlyFilterColumnList && this._updateFilteredColumnList();
      } else {
        // 필터링 부여
        column.filtering = true;
        // seq 부여
        column.filteringSeq = _.filter(this._columnList, item => item.filtering).length - 1;
      }
    // }
  }

  /**
   * 현재 컬럼에 필터 option 설정 및 해제
   * @param column
   */
  public onClickSetColumnFilteringOptions(column: any): void {
    // 컬럼에 filtering이 설정 되어있는 경우에만 작동
    if (this.isEnableColumnFiltering(column)) {
      // 컬럼에 filteringOptions가 설정되어 있는경우
      if (this.isEnableColumnFilteringOptions(column)) {
        delete column.filteringOptions;
      } else {
        // 없을 경우 새 options 설정
        column.filteringOptions = new FilteringOptions();
        column.filteringOptions.type = column.logicalType === 'TIMESTAMP' ? FilteringOptionType.INTERVAL : FilteringOptionType.INCLUSION;
        column.filteringOptions.defaultSelector = column.logicalType === 'TIMESTAMP' ? 'RELATIVE' : 'SINGLE_LIST';
        column.filteringOptions.allowSelectors = column.logicalType === 'TIMESTAMP' ? ['RELATIVE'] : ['SINGLE_LIST']
      }
    }
  }




  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // 선택된 필터링 타입
    this.selectedTypeFilter = this.typeFilterList[0];
    this.selectedRoleTypeFilter = this.roleTypeFilterList[0];
    // search
    this.searchTextKeyword = '';
    // 필터 목록만 보기
    this.isShowOnlyFilterColumnList = false;
    // show flag
    this.isShowComponent = true;
  }

  /**
   * 확인 모달 오픈
   * @private
   */
  private _openConfirmModal(): void {
    const modal = new Modal();
    modal.name = this.isLinkedType ? this.translateService.instant('msg.storage.ui.essential.filter.save.title') : this.translateService.instant('msg.storage.ui.recommendation.filter.save.title');
    modal.description = this.translateService.instant('msg.storage.ui.ingestion.desc');
    modal.btnName = this.translateService.instant('msg.storage.btn.re.ingestion');
    this._confirmModalComponent.init(modal);
  }

  /**
   * 필터링된 컬럼 목록 갱신
   * @private
   */
  private _updateFilteredColumnList(): void {
    let resultList: any = this._columnList;
    // role
    if (this.selectedRoleTypeFilter.value !== 'ALL') {
      resultList = _.filter(resultList, column => 'DIMENSION' === this.selectedRoleTypeFilter.value && 'TIMESTAMP' === column.role ? column : this.selectedRoleTypeFilter.value === column.role);
    }
    // type
    if (this.selectedTypeFilter.value !== 'ALL') {
      resultList = _.filter(resultList, column => this.selectedTypeFilter.value === column.logicalType);
    }
    // search
    if (this.searchTextKeyword !== '') {
      resultList = _.filter(resultList, column => column.name.toUpperCase().includes(this.searchTextKeyword.toUpperCase().trim()));
    }
    // 필터설정된 컬람만 보기
    if (this.isShowOnlyFilterColumnList) {
      resultList = _.filter(resultList, column => column.filtering);
    }
    this.filteredColumnList = resultList;
  }

  /**
   * 필터링 설정된 컬럼 갱신
   * @param {number} seq
   * @private
   */
  private _resortFilteringColumnList(seq: number): void {
    _.forEach(_.filter(this._columnList, column => column.filtering && column.filteringSeq > seq), (column) => {
      column.filteringSeq--;
    });
  }

  /**
   * 변경에 사용될 필드
   * @returns {any}
   * @private
   */
  private _getUpdateFieldParams(): any {
    const result = [];
    const filteringList = _.filter(this._columnList, column => column.filtering);
    // add
    _.forEach(filteringList, (column) =>{
      // 필터링으로 설정된 컬럼이 origin 필터링 컬럼 목록에 있는지 확인
      const temp = _.find(this._originFilteringColumnList, originColumn => originColumn.id === column.id);
      // origin 필터링 컬럼 목록에 없거나 설정된 필터링옵션이 서로 다른경우
      if (!temp || ((temp.filteringOptions && !column.filteringOptions) || (!temp.filteringOptions && column.filteringOptions))) {
        column['op'] = 'replace';
        result.push(column);
      }
    });
    // remove
    _.forEach(this._originFilteringColumnList, (originColumn) => {
      // 필터링 설정된 목록에 없다면 추가
      if (_.every(filteringList, column => column.id!== originColumn.id)) {
        originColumn['op'] = 'replace';
        originColumn['filtering'] = false;
        result.push(originColumn);
      }
    });
    return result;
  }
}
