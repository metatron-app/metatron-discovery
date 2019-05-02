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

import * as _ from 'lodash';
import {
  AfterViewInit, Component, ElementRef, EventEmitter, Injector, Input, OnDestroy,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';
import { CommonCode } from '../../../domain/code/common-code';
import {ConnectionType, Field, FieldRole} from '../../../domain/datasource/datasource';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { Alert } from '../../../common/util/alert.util';
import { BoardDataSource } from '../../../domain/dashboard/dashboard';
import { StringUtil } from '../../../common/util/string.util';
import { ConfirmModalComponent } from '../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../common/domain/modal';
import { CustomField } from '../../../domain/workbook/configurations/field/custom-field';
import { DashboardUtil } from '../../util/dashboard.util';
import { isNullOrUndefined } from "util";

declare let $: any;

@Component({
  selector: 'app-custom-field',
  templateUrl: './custom-field.component.html'
})
export class CustomFieldComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // custom field 모두 적용 확인 팝업
  @ViewChild(ConfirmModalComponent)
  private confirmModalComponent: ConfirmModalComponent;

  private _$calculationInput: JQuery;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('calculationInput')
  public calculationInput: ElementRef;

  /*** 공통 ***/

  @Input()
  public fields: Field[] = [];

  @Input()
  public dataSource: BoardDataSource;

  @Input()
  public customFields: CustomField[] = [];

  @Input()
  public customField: CustomField;

  // dimension / measure / parameter 구분값
  @Input()
  public selectedColumnType: ColumnType;

  // 팝업창 닫기
  @Output()
  public close = new EventEmitter();
  @Output()
  public updateColumn = new EventEmitter();

  // 팝업 on/off
  public isShow = false;

  //
  public isEditMode = false;

  // 탭 enum
  public columnType = ColumnType;

  // 필드 페이지 사이
  public pageSize = 13;

  // 현재 페이지
  public currentPage = 1;

  // 마지막 페이지
  public lastPage = 0;

  // 컬럼 이름
  public columnName: string;

  public oriColumnName: string = '';


  /*** 계산식 필드 , 가상 컬럼***/

    // 함수목록
  public calculationFunctions: CommonCode[];

  // 카테고리 목록
  public calculationCategory: CommonCode[];
  // 카테고리 목록
  public oriCalculationCategory: CommonCode[];

  // 카테고리 인덱스
  public categoryDefaultIndex: number = -1;

  // 선택 카테고리
  public selectedCategory: CommonCode;

  // 선택 함수
  public selectedFunction: CommonCode;

  // 카테고리 설명
  public categoryDescription: CommonCode = new CommonCode();

  // 펑션 검색
  public calFuncSearchText: string = '';

  // 펑션 성공 실패 (F, S, null)
  public isCalFuncSuccess: string;

  // 필터리스트 (컬럼 + 함수)
  public filters: any[];

  // 페이징된 필드
  public pagedFields: Field[];

  // 자동완성 엘리먼트
  public autocompletor: any;

  // 벨리데이션버튼 활성여부
  public validButtonDisabled = true;

  public expr: string = '';

  /*** Parameter ***/

    // 파라미터 선택한 컬럼
  public selectedParamColumn: Field;

  // 기본 값
  public defaultParamValue = 0;

  // 최소값
  public minPramValue = 0;

  // 최대값
  public maxPramValue = 0;

  // aggregated
  public aggregated: boolean = false;


  public DashboardUtil = DashboardUtil;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dashboardService: DashboardService,
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

    this._$calculationInput = $('#calculationInput');

    // 초기
    this.calculationFunctions = [];
    this.oriCalculationCategory = [];
    this.selectedCategory = new CommonCode();

    // 컬럼
    this.setFieldPage(1);
    // 필터셋팅
    this.setFilters();
    // 함수 및 자동완성 셋
    this.setCalculationFunction();

    // 수정모드
    if (this.customField) {
      this.isEditMode = true;
      this.columnName = this.customField.name;
      this.oriColumnName = this.customField.name;

      if (this.customField.role === FieldRole.DIMENSION) this.selectedColumnType = ColumnType.DIMENSION;
      else if (this.customField.role === FieldRole.MEASURE) this.selectedColumnType = ColumnType.MEASURE;
      else this.selectedColumnType = ColumnType.PARAMETER;

      this._$calculationInput.text(StringUtil.unescapeCustomColumnExpr(this.customField.expr));
      this.calValidButtonCheck();
    } else {
      this.setColumnName();
    }
  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }


  public ngAfterViewInit() {
    this.setAutoComplete();
    this._$calculationInput.trigger('focus');
    this._$calculationInput.attr('placeholder', this.translateService.instant('msg.board.custom.ui.content.placeholder'));

    // 계산식 에디터 변경 감지
    this._$calculationInput.bind('input', () => {
      this.calValidButtonCheck();
      this.isCalFuncSuccess = null;
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 검색어 설정
   * @param {string} srchText
   */
  public setSearchText(srchText:string) {
    this.calFuncSearchText = srchText;
  } // function - setSearchText

  // 카테고리에 카테고리별 함수 추가
  public setFunctionsInCategory(init: boolean = false) {
    // 초기 한번 펑션 삽입 설정
    if (init) {
      if (this.oriCalculationCategory.length > 0) {
        this.oriCalculationCategory.forEach((category) => {
          category['calculationFunctions'] = _.filter(this.calculationFunctions, { commonCode: category.commonCode });
        });
      }
    }

    // 타입에 따라 필터링
    if (this.selectedColumnType === ColumnType.DIMENSION) {
      this.calculationCategory = this.oriCalculationCategory.filter((item) => {
        return item.commonCode !== 'AGGREGATION' && item.commonCode !== 'WINDOW';
      });
    } else {
      this.calculationCategory = this.oriCalculationCategory;
    }

  }

  // 카테고리에 전체 추가
  public addAllCategory(oriCalculationCategory: CommonCode[]) {
    const allCategory = new CommonCode();
    allCategory.commonCode = 'all';
    allCategory.commonCodeNm = 'ALL';

    oriCalculationCategory.push(allCategory);
    this.selectedCategory = allCategory;
  }

  // 마우스 오버시 리버시 함수 설명처리
  public setCalculationDesciption(category: CommonCode, flag: boolean) {
    if (flag) {
      this.categoryDescription = category;
    } else if (!flag && this.selectedFunction != null) {
      this.categoryDescription = this.selectedFunction;
    } else {
      this.categoryDescription = new CommonCode();
    }
  }

  // 선택한 함수
  public selectedCalculationFunction(functionItem: CommonCode) {
    this.selectedFunction = functionItem;
  }

  // 페이징처리
  public setFieldPage(page: number, type?: string) {

    // 더이상 페이지가 없을 경우 리턴
    if (type === 'prev') {
      if (page <= 0) return;
    } else if (type === 'next') {
      if (this.lastPage < page) return;
    }

    this.currentPage = page;
    let start = 0;
    let end = 0;
    // 필드 페이징
    if (this.fields.hasOwnProperty('length')) {
      // 총사이즈
      const totalFieldsSize:number = this.fields.length;
      // 마지막 페이지 계산
      this.lastPage = Math.ceil( totalFieldsSize / this.pageSize );

      start = ( page - 1 ) * this.pageSize;
      end = start + this.pageSize;

      this.pagedFields = this.fields.slice(start, end);   // 현재 페이지에 맞게 데이터 자르기
    }
  } // function - setFieldPage

  // 자동완성 필터리스트 셋팅
  public setFilters() {
    this.filters = this.fields;
    // 타입에 따라 필터링
    if (this.selectedColumnType === ColumnType.DIMENSION) {
      this.filters = this.filters.concat(this.calculationFunctions.filter((item) => {
        return item.commonCode !== 'AGGREGATION' && item.commonCode !== 'WINDOW';
      }));
    } else {
      this.filters = this.filters.concat(this.calculationFunctions);
    }

  }

  // 자동완성
  public setAutoComplete() {

    if (this._$calculationInput.hasOwnProperty('length') && this.filters && this.calculationFunctions) {
      this.autocompletor = $('#calculationInput').atwho({
        at: '',
        data: this.filters,
        limit: 100,
        minLen: 2,
        acceptSpaceBar: true,
        displayTpl: '<li><a href="javascript:"><em class="${class}"></em>${name}</a></li>',
        callbacks: {
          beforeInsert: this.beforeInsertCallback,
          afterInsert: this.afterInsertCallback
        }
      });
      $('.atwho-view').hide();
    }
  }

  // 자동완성 삽입
  // noinspection JSMethodCanBeStatic
  public beforeInsertCallback(value: string, $li: any) {
    const data = $li.data().itemData;

    // ddp 앞뒤 공백 제거
    // 시작 문자가 대괄호일 경우 [ 제거
    if (data.commonCode) {
      return '<span >' + value + '( <span id="focusElement"></span> )</span>';
    } else {

      let color = '#439fe5';
      if (data.role === FieldRole.DIMENSION) {
        color = '#5fd7a5';
      }

      if (value.hasOwnProperty('indexOf') && value.indexOf('[') === 0) {
        return '<span style="color:' + color + '">[' + value.substring(1) + ']</span>';
      } else {
        return '<span style="color:' + color + '">[' + value + ']</span>';
      }

    }
  }

  // 자동완성 삽입후
  // noinspection JSMethodCanBeStatic
  public afterInsertCallback() {

    const sel = window.getSelection();
    const range = document.createRange();

    const focusElement = document.getElementById('focusElement');
    if (focusElement) {
      // 포커스 엘리먼트가 있으면 선택한다
      range.selectNode(focusElement);
      // 컨텐츠span을 제거후
      range.deleteContents();
      sel.removeAllRanges();
      // range를 갱신한다.
      sel.addRange(range);
    }
  }

  // 함수 셋
  public setCalculationFunction() {
    // 카테고리에 전체를 추가
    this.addAllCategory(this.oriCalculationCategory);


    this.loadingShow();
    this.dashboardService.getCalculationFunction().then((result) => {

      // 펑션 데이터 셋팅
      if (result.hasOwnProperty('_embedded') && result['_embedded'].hasOwnProperty('commonCodes')) {
        this.calculationFunctions = result['_embedded']['commonCodes'];

        // 검색 키를 맞춰줘야 하기 때문에 name추가
        this.calculationFunctions.forEach((item) => {
          item['name'] = item.commonValue;

        });

        // 중복제거하여 카테고리 생성
        this.oriCalculationCategory = _.cloneDeep(this.oriCalculationCategory.concat(_.uniqBy(this.calculationFunctions, 'commonCode')));
        this.categoryDefaultIndex = 0;
      } else {
        this.calculationFunctions = [];
        this.oriCalculationCategory = [];
      }
      // 카테고리에 펑션데이터 삽입 (목록 그리기용도)
      this.setFunctionsInCategory(true);
      // 자동완성 필터 리스트 셋팅
      this.setFilters();
      // 자동완성 셋팅
      this.setAutoComplete();
      this.loadingHide();
    }).catch(() => {
      this.loadingHide();
    });
  }

  // 계산식필드 컬럼 선택
  public selecteParamColumn(column: Field) {
    this.selectedParamColumn = column;
    this.maxPramValue = 10;
    this.minPramValue = 5;
    this.defaultParamValue = 7;
  }


  // 컬럼 적용
  public done() {

    // callFuncSuccess가 아닐때 columnName이 없을때 return
    if ('S' !== this.isCalFuncSuccess || !this.columnName || '' == this.columnName.trim()) {
      return;
    }

    // validation
    if (this.columnName.trim().length > 50) {
      Alert.warning(this.translateService.instant('msg.board.custom.alert.column.length', { length: 50 }));
      return;
    }

    if (this.existColumnName(this.columnName)) {
      if (!this.isEditMode) {
        // 생성모드 일 경우 중복안됨
        Alert.warning(this.translateService.instant('msg.board.custom.alert.column.overlap'));
        return;
      } else if (this.isEditMode && this.columnName !== this.oriColumnName) {
        // 수정모드일 경우 컬럼명이 중복이 되는데 중복된 컬럼명이 다른 컬럼이라면 실패 내 컬럼명이라면 통과
        Alert.warning(this.translateService.instant('msg.board.custom.alert.column.overlap'));
        return;
      }
    }

    // 수정모드일때
    if (this.isEditMode) {
      // aggregated 타입이 변경되는경우
      if (this.customField.aggregated !== this.aggregated) {

        // 팝업창으로 변경여부 확인 팝업 show
        this.setCustomFielNotiPopup();
        return;
      }
    }

    // customfield data 설정
    this.setCustomFieldData();
  }

  // 함수 클릭
  public selectFunction(functionItem: CommonCode) {
    let insertFunction = '<span>';
    insertFunction += functionItem.commonValue + '( <span id="focusElement"></span>';
    insertFunction += ' )</span>';
    this.insertAtCursor(insertFunction);

    // 검증 버튼 활성화
    this.calValidButtonCheck();
  }

  // 컬럼 클릭
  public selecteColumn(column: Field) {
    let color = '#439fe5';
    if (column.role === FieldRole.DIMENSION) {
      color = '#5fd7a5';
    }
    let inserColumn = '<span style="color: ' + color + '">';
    if (column.ref) {
      inserColumn += '[' + column.ref + '.' + column.name + '] <span id="focusElement"></span>';
    } else {
      inserColumn += '[' + column.name + '] <span id="focusElement"></span>';
    }

    inserColumn += '</span>';
    this.insertAtCursor(inserColumn);

    // 검증 버튼 활성화
    this.calValidButtonCheck();
  }

  // 커서가 위치한 곳에 텍스트를 넣는다.
  public insertAtCursor(innerHtml) {
    this._$calculationInput.trigger( 'focus' );
    let sel;
    let range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);

        const newSapn = document.createElement('span');
        newSapn.innerHTML = innerHtml;
        range.insertNode(newSapn);
      }
    }

    const focusElement = document.getElementById('focusElement');
    if (focusElement) {
      // 포커스 엘리먼트가 있으면 선택한다
      range.selectNode(focusElement);
      // 컨텐츠span을 제거후
      range.deleteContents();
      sel.removeAllRanges();
      // range를 갱신한다.
      sel.addRange(range);
    }
  }

  // 계산식 버튼 활성화 여부
  public calValidButtonCheck() {
    this.validButtonDisabled = !(this._$calculationInput.text().hasOwnProperty(length) && this._$calculationInput.text().length > 0);
  }

  // 검증
  public calculationValidation() {

    if (this._$calculationInput.text().hasOwnProperty(length) && this._$calculationInput.text().length > 0) {
      let expr = this._$calculationInput.text();
      expr = expr.replace(/[[\]]/g, '"');
      expr = StringUtil.trim(expr);

      const cloneDs:BoardDataSource = _.cloneDeep( this.dataSource );
      if( ConnectionType.LINK.toString() === cloneDs.connType && !isNullOrUndefined(cloneDs.engineName) ) {
        cloneDs.name = cloneDs.engineName;
      }
      const param = { expr, dataSource: DashboardUtil.convertBoardDataSourceSpecToServer(cloneDs) };
      this.dashboardService.validate(param).then((result: any) => {
        this.aggregated = result.aggregated;
        this.isCalFuncSuccess = 'S';
        this.expr = expr;

      }).catch(() => {
        this.isCalFuncSuccess = 'F';
        this.expr = '';
      });
    }
  }

  public existColumnName(columnName: string) {

    let idx = _.findIndex(this.fields, { name: columnName });
    if (idx > -1) return true;

    idx = _.findIndex(this.customFields, { name: columnName });
    return (idx > -1);
  }

  /**
   * customfield data 설정
   */
  public setCustomFieldData() {

    if (this.selectedColumnType === ColumnType.DIMENSION || this.selectedColumnType === ColumnType.MEASURE) {
      if (!this.isCalFuncSuccess || this.isCalFuncSuccess === 'F') {
        // Alert.warning('계산식을 검증해 주세요.');
        return;
      }
      let customField: CustomField;
      if(this.isEditMode) {
        customField = this.customField;
        customField.oriColumnName = this.oriColumnName;
      } else {
        customField = new CustomField();
        customField.role = (this.selectedColumnType === ColumnType.MEASURE) ? FieldRole.MEASURE : FieldRole.DIMENSION;
        customField.dataSource = this.dataSource.engineName;
      }

      customField.alias = this.columnName;
      customField.name = this.columnName;
      customField.expr = StringUtil.trim(this.expr);
      customField.aggregated = this.aggregated;
      this.updateColumn.emit({ customField, isEdit: this.isEditMode });

    } else if (this.selectedColumnType === ColumnType.PARAMETER) {

      if (this.defaultParamValue == null) {
        Alert.warning('기본값를 입력해주세요');
        return;
      }

      if (this.minPramValue == null) {
        Alert.warning('최소값를 입력해주세요');
        return;
      }

      if (this.maxPramValue == null) {
        Alert.warning('최대값을 입력해주세요');
        return;
      }

      Alert.warning('파라미터는 작업 중입니다.');
      return;
    } else {
      return;
    }
  }


  /**
   * Returns name for finding icon class
   * @param type
   * @param logicalType
   */
  public findNameForIcon(type: string, logicalType?: string) {

    if (type === 'USER_DEFINED' || type === 'TEXT' ) {
      return 'STRING'
    }

    if (type === 'LONG' || type === 'INTEGER' || type === 'DOUBLE' || type === 'CALCULATED') {
      return 'LONG'
    }

    if (logicalType) {
      return logicalType
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private setColumnName() {
    if (this.selectedColumnType === ColumnType.DIMENSION) {
      let index = 1;
      let columnName = '';
      while (index > 0) {
        columnName = 'DIMENSION_' + index;
        if (!this.existColumnName(columnName)) {
          this.columnName = columnName;
          index = -1;
        }
        index++;
      }
    } else if (this.selectedColumnType === ColumnType.MEASURE) {
      let index = 1;
      let columnName = '';
      while (index > 0) {
        columnName = 'MEASURE_' + index;
        if (!this.existColumnName(columnName)) {
          this.columnName = columnName;
          index = -1;
        }
        index++;
      }
    }
  }

  /**
   * custmo field 적용확인 팝업 show
   */
  private setCustomFielNotiPopup() {

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.custom.filter.popup.change.aggregation.title');
    modal.description = this.translateService.instant('msg.custom.filter.popup.change.aggregation.description');
    modal.isShowCancel = true;
    modal.btnName = this.translateService.instant('msg.comm.ui.continue');
    modal.data = {
      type: 'applyAllCustomField'
    };

    this.confirmModalComponent.init(modal);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}


enum ColumnType {
  DIMENSION = <any>'DIMENSION',
  MEASURE = <any>'MEASURE',
  PARAMETER = <any>'PARAMETER'
}
