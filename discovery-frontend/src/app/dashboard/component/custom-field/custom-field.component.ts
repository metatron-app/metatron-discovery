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
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {StringUtil} from '@common/util/string.util';
import {Modal} from '@common/domain/modal';
import {Alert} from '@common/util/alert.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {ConfirmModalComponent} from '@common/component/modal/confirm/confirm.component';
import {CommonCode} from '@domain/code/common-code';
import {Field, FieldRole} from '@domain/datasource/datasource';
import {BoardDataSource} from '@domain/dashboard/dashboard';
import {CustomField} from '@domain/workbook/configurations/field/custom-field';
import {DashboardService} from '../../service/dashboard.service';
import {DashboardUtil} from '../../util/dashboard.util';

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

  protected expressionStringDelimiter = '#';

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
  public pageSize = 8;

  // 현재 페이지
  public currentPage = 1;

  // 마지막 페이지
  public lastPage = 0;

  // 컬럼 이름
  public columnName: string;

  public oriColumnName: string = '';

  public isOrdering = false;

  public orderingMode = 'DATA';

  /*** 계산식 필드 , 가상 컬럼***/
  // 함수목록
  public calculationFunctions: CommonCode[];

  // 카테고리 목록
  public calculationCategory: CommonCode[];
  // 카테고리 목록
  public oriCalculationCategory: CommonCode[];
  // 카테고리 목록
  public selCalculationCategory: CommonCode[];

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
  public pagedFields: any[];

  public orderingFields: any[] = [];

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
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public ngAfterViewInit() {

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
      this._$calculationInput.text( '' );
      this.setColumnName();
    }

    this.setAutoComplete();
    this._$calculationInput.trigger('focus');
    this._$calculationInput.attr('placeholder', this.translateService.instant('msg.board.custom.ui.content.placeholder'));

    // 계산식 에디터 변경 감지
    this._$calculationInput.on('input', () => {
      this.calValidButtonCheck();
      this.isCalFuncSuccess = null;
    });

    this.safelyDetectChanges();
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
    $('div.ddp-ui-dropdown').addClass('ddp-selected');
  } // function - setSearchText

  public setSelectedCategory(selectedCategory:CommonCode) {
    this.selectedCategory = selectedCategory;
    $('div.ddp-ui-dropdown').addClass('ddp-selected');
  }

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

    this.selCalculationCategory = _.cloneDeep(this.calculationCategory).sort((c1, c2) => {
      if (c2.commonCode === 'ETC' || c1.commonCode === 'all') {
        return -1;
      }
      if (c1.commonCode === 'ETC' || c2.commonCode === 'all') {
        return 1;
      }
      return c1.commonCode > c2.commonCode ? 1 : -1;
    });

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
    this.orderingFields = [];
    this.orderingFields = this.orderingFields.concat(this.fields).concat(this.customFields);

    if (this.orderingMode !== 'DATA') {
      this.orderingFields = this.orderingFields.sort((a:Field, b:Field) => {
        if (this.orderingMode === 'AZ') {
          return a.name > b.name ? 1 : -1;
        } else {
          return a.name < b.name ? 1 : -1;
        }
      })
    }

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
    if (this.orderingFields.hasOwnProperty('length')) {
      // 총사이즈
      const totalFieldsSize:number = this.orderingFields.length;
      // 마지막 페이지 계산
      this.lastPage = Math.ceil( totalFieldsSize / this.pageSize );

      start = ( page - 1 ) * this.pageSize;
      end = start + this.pageSize;

      this.pagedFields = this.orderingFields.slice(start, end);   // 현재 페이지에 맞게 데이터 자르기
    }
  } // function - setFieldPage

  public setOrdering(ordering: string) {
    this.orderingMode = ordering;
    this.setFieldPage(1);
  } // function - setOrdering

  // 자동완성 필터리스트 셋팅
  public setFilters() {
    this.filters = [];
    this.filters = this.filters.concat(this.fields).concat(this.customFields);
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
          matcher: this.matcherCallback, // Find matched string for autocompletion
          filter: this.filterCallback, // Find matched list for query
          sorter: this.sorterCallback, // Sort result
          highlighter: this.highlighterCallback, // Display highlight format
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

    // Check if data is function or field
    if (data.commonCode) {
      return '<span >' + value + '( <span id="focusElement"></span> )</span>';
    } else {
      const color = (data.role === FieldRole.DIMENSION)?'#5fd7a5':'#439fe5';
      const userDefinedPrefix = (data.type === 'user_expr')?'user_defined.':'';
      return '<span style="color:' + color + '">[' + userDefinedPrefix + ((value.startsWith('['))?value.substring(1):value) + ']</span>';
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

  /**
   * override default filter callback of atwho function
   * @param query query string
   * @param data
   * @param searchKey search key field name
   */
  public filterCallback(query, data, searchKey) {
    let item;
    const _results = [];

    if(query.startsWith('['))
      query = query.substring(1);

    if(query.startsWith('user_defined.'))
      query = query.substring(13);

    for (let i = 0, len = data.length; i < len; i++) {
      item = data[i];
      if (~String(item[searchKey]).toLowerCase().indexOf(query.toLowerCase())) {
        _results.push(item);
      }
    }
    return _results;
  }

  /**
   * override default matcher callback of atwho function
   * @param flag
   * @param subtext
   * @param shouldStartWithSpace
   * @param acceptSpaceBar
   */
  public matcherCallback(flag, subtext, shouldStartWithSpace, acceptSpaceBar) {
    flag = flag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

    if (shouldStartWithSpace) {
      flag = '(?:^|\\s+)' + flag;
    }
    const _a = decodeURI('%C3%80');
    const _y = decodeURI('%C3%BF');
    const space = acceptSpaceBar ? '\ ' :  '';

    // 앞에 대괄호 오는 케이스 추가
    const regexp = new RegExp(flag + '(\\[?[A-Za-z' + _a + '-' + _y + '0-9_' + space + '\'\.]*)$|' + flag + '([^\\x00-\\xff]*)$', 'gi');
    const match = regexp.exec(subtext);

    if (match) {
      return match[2] ? match[2] : match[1];
    } else {
      return null;
    }
  }

  /**
   * override default sorter callback of atwho function
   * @param query
   * @param items
   * @param searchKey
   */
  public sorterCallback(query, items, searchKey) {
    if (!query) {
      return items;
    }
    const _results = [];
    if(query.startsWith('['))
      query = query.substring(1);

    if(query.startsWith('user_defined.'))
      query = query.substring(13);

    let item;
    for (let i = 0, len = items.length; i < len; i++) {
      item = items[i];
      item.atwho_order = String(item[searchKey]).toLowerCase().indexOf(query.toLowerCase());
      if (item.atwho_order > -1) {
        _results.push(item);
      }
    }
    return _results.sort((a, b) => {
      return a.atwho_order - b.atwho_order;
    });
  }

  /**
   * override default highlighter callback of atwho function
   * @param li
   * @param query
   */
  public highlighterCallback(li, query) {

    if (!query) {
      return li;
    }

    if(query.startsWith('['))
      query = query.substring(1);

    if(query.startsWith('user_defined.'))
      query = query.substring(13);

    const regexp = new RegExp('>\\s*([^\<]*?)(' + query.replace('+', '\\+') + ')([^\<]*)\\s*<', 'ig');
    return li.replace(regexp, (_str, $1, $2, $3) => {
      return '> ' + $1 + '<strong>' + $2 + '</strong>' + $3 + ' <';
    });
  }

  // 함수 셋
  public setCalculationFunction() {
    // 카테고리에 전체를 추가
    this.addAllCategory(this.oriCalculationCategory);


    this.loadingShow();
    this.dashboardService.getCalculationFunction().then((result) => {

      // 펑션 데이터 셋팅
      if (result != null) {
        this.calculationFunctions = result;

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
    if ('S' !== this.isCalFuncSuccess || !this.columnName || '' === this.columnName.trim() || this.isReservedFieldName(this.columnName)) {
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
    this.insertAtCursor('<span>' + functionItem.commonValue + '( <span id="focusElement"></span> )</span>');

    // 검증 버튼 활성화
    this.calValidButtonCheck();
    event.stopPropagation();
    event.preventDefault();
  }

  // 컬럼 클릭
  public selectColumn(column: Field|CustomField) {
    const color = (column.role === FieldRole.DIMENSION)?'#5fd7a5':'#439fe5';

    let inserColumn = '<span style="color: ' + color + '">';
    if (column.ref) {
      inserColumn += '[' + column.ref + '.' + column.name + '] <span id="focusElement"></span>';
    } else if(column.type === 'user_expr'){
      inserColumn += '[user_defined.' + column.name + '] <span id="focusElement"></span>';
    } else {
      inserColumn += '[' + column.name + '] <span id="focusElement"></span>';
    }

    inserColumn += '</span>';
    this.insertAtCursor(inserColumn);

    // 검증 버튼 활성화
    this.calValidButtonCheck();
  } // function - selectColumn

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
  } // function - insertAtCursor

  // 계산식 버튼 활성화 여부
  public calValidButtonCheck() {
    this.validButtonDisabled = !(this._$calculationInput.text().hasOwnProperty(length) && this._$calculationInput.text().length > 0);
  }

  // 검증
  public calculationValidation() {

    if (this._$calculationInput.text().hasOwnProperty(length) && this._$calculationInput.text().length > 0) {
      let expr = this._$calculationInput.text();
      expr = expr.replace(/[[\]]/g, '"');
      expr = expr.replace(/" *"\d"/g, (text) => {
        return '"[' + text.substring(text.indexOf('"', 1) + 1, text.lastIndexOf('"')) + ']'
      });
      expr = StringUtil.trim(expr);

      const cloneDs:BoardDataSource = _.cloneDeep( this.dataSource );
      if( !this.isNullOrUndefined(cloneDs.engineName) ) {
        cloneDs.name = cloneDs.engineName;
      }
      const param = { expr, dataSource: DashboardUtil.convertBoardDataSourceSpecToServer(cloneDs), userFields: this.customFields };
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
        customField.dataSource = this.dataSource.engineName ? this.dataSource.engineName : this.dataSource.name;
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
   * @param field Element of field list. Its type is Field or CustomField.
   */
  public findNameForIcon(field:any) {
    if(field.type === 'user_expr'){
      if(field.isTimestamp)
        return 'TIMESTAMP';

      // If field is user-defined field, the type of field is Long or String
      return (field.role === FieldRole.DIMENSION)?'LONG':'STRING';
    }else{
      if (field.type === 'USER_DEFINED' || field.type === 'TEXT' ) {
        return 'STRING'
      }

      if (field.type === 'LONG' || field.type === 'INTEGER' || field.type === 'DOUBLE' || field.type === 'CALCULATED') {
        return 'LONG'
      }

      if (field.logicalType) {
        return field.logicalType
      }
    }
  }

  public isReservedFieldName(name: string): boolean {
    return name === 'count' || name === '__time' || name === 'timestamp';
  }

  public getDescription(commonCode: CommonCode): string {
    return this.translateService.currentLang === 'ko' ? commonCode.description : commonCode.descriptionEn;
  }

  public getSyntaxHtml(commonCode: CommonCode): string {
    let html = '<span class="ddp-ui-det-title">Syntax</span>';
    const syntaxList: string[] = _.split(commonCode.syntax, this.expressionStringDelimiter);
    html += syntaxList[0];
    if (syntaxList.length > 1) {
      for( let num: number = 1 ; num < syntaxList.length ; num++ ) {
        html += '<br/>';
        html += syntaxList[num];
      }
    }

    if (StringUtil.isEmpty(commonCode.param)) {
      return html;
    } else {
      const paramList: string[] = _.split((this.translateService.currentLang === 'ko' ? commonCode.param : commonCode.paramEn), this.expressionStringDelimiter);
      html += '<ul class="ddp-list-det">';
      for( let num: number = 0, nMax = paramList.length; num < nMax; num++ ) {
        html += '<li>';
        html += paramList[num];
        html += '</li>';
      }
      html += '</ul>';
      return html;
    }
  }

  public getExampleHtml(commonCode: CommonCode): string {
    let html = '<span class="ddp-ui-det-title">Example</span>';
    const exampleList: string[] = _.split((this.translateService.currentLang === 'ko' ? commonCode.example : commonCode.exampleEn), this.expressionStringDelimiter);
    for( let num: number = 0, nMax = exampleList.length ; num < nMax ; num++ ) {
      html += '<div class="ddp-txt-list">';
      html += exampleList[num];
      html += '</div>';
    }
    return html;
  }

  public clickCategory($event) {
    const $targetElm = $( $event.target ).parent();

    if (!$targetElm.hasClass( 'ddp-selected' )) {
      $targetElm.addClass( 'ddp-selected' );
    } else {
      $targetElm.removeClass( 'ddp-selected' );
    }

  }

  public clickFunction($event) {
    const $targetElm = $( $event.target ).parent();

    $targetElm.parent().parent().parent().find('li').removeClass( 'ddp-selected' );
    $targetElm.addClass( 'ddp-selected' );

  }

  public checkCategory(calFunction:any[]): string {
    return calFunction.filter(item=> item['commonValue'].toLowerCase().indexOf(this.calFuncSearchText.toLowerCase()) !== -1).length > 0 ? 'block' : 'none';
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
  DIMENSION = 'DIMENSION',
  MEASURE = 'MEASURE',
  PARAMETER = 'PARAMETER'
}
