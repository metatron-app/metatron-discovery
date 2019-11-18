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

/**
 * Created by juheeko on 20/10/2017.
 */
import { Component, ElementRef, EventEmitter, HostListener, Injector, Output, ViewChild } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { Field, FieldNameAlias, FieldRole, FieldValueAlias, LogicalType } from '../../domain/datasource/datasource';
import { StringUtil } from '../../common/util/string.util';
import { PopupValueAliasComponent } from '../page-pivot/popup-value-alias.component';
import { Alert } from '../../common/util/alert.util';
import { DatasourceAliasService } from '../../datasource/service/datasource-alias.service';
import { BoardDataSource } from '../../domain/dashboard/dashboard';
import * as _ from 'lodash';
import { isNullOrUndefined, isString } from 'util';
import {Type} from '../../shared/datasource-metadata/domain/type';

@Component({
  selector: 'page-data-context',
  templateUrl: './page-data-context.component.html'
})
export class PageDataContextComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // alias for value popup
  @ViewChild(PopupValueAliasComponent)
  private popupValueAlias: PopupValueAliasComponent;

  @ViewChild('fieldDetailLayer')
  private _contextLayer: ElementRef;

  // 데이터 조회를 위한 MetaDatasource 정보
  private _metatDatasource: BoardDataSource;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 필드 데이터
  public selectedField: Field;

  // editingField Alias 임시저장용
  public editingFieldAlias: string;

  // 화면 처리를 위한 T/F
  public isShowLayer: boolean = false;        // 현재 컴포넌트의 화면 표시 여부
  public fix2DepthContext: boolean = false;   // 2Depth 컨텍스트 메뉴 고정여부

  // Column Detail 팝업열기
  @Output()
  public openColumnDetailEvent: EventEmitter<Field> = new EventEmitter();

  // custom field 팝업열기
  @Output()
  public openCustomFieldEvent: EventEmitter<Field> = new EventEmitter();

  // custom field 삭제하기
  @Output()
  public deleteCustomFieldEvent: EventEmitter<Field> = new EventEmitter();

  @Output('changeAlias')
  public changeAliasEvent: EventEmitter<Field> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private aliasService: DatasourceAliasService,
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
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * context menu 클릭시
   */
  @HostListener('click', ['$event'])
  public clickListener() {
    if (!this.fix2DepthContext) {
      // 기본 이벤트 제거
      event.stopPropagation();

      // 메뉴창 닫기
      this.isShowLayer = false;
    }
  }

  /**
   * data 패널의 context menu init
   * @param {Field} field 필드값
   * @param {BoardDataSource} dataSource
   * @param {any} $targetElm : jQuery Element
   * @param {boolean} isRightSide
   * @returns {boolean} true : show, false: hide
   */
  public init(field: Field, dataSource: BoardDataSource, $targetElm: any, isRightSide: boolean = false): boolean {

    // 같은 필드 데이터이면 표시여부 토글
    if (this.selectedField === field) {
      this.isShowLayer = !this.isShowLayer;
      if (!this.isShowLayer) {
        return false;
      }
    }

    this._metatDatasource = dataSource;

    if (field.nameAlias) {
      this.editingFieldAlias = field.nameAlias.nameAlias;
    } else {
      field = this._initializeFieldForNameAlias(field);
      this.editingFieldAlias = '';
    }

    // 레이어 표시
    this.isShowLayer = true;

    // 필드 데이터 설정
    this.selectedField = field;

    // 변경 갱신
    this.changeDetect.detectChanges();

    // 위치 설정 - Start
    const $fieldDetailLayer: JQuery = $(this._contextLayer.nativeElement);
    const $leftOffset = $targetElm.offset().left;
    const $topOffset = $targetElm.offset().top;
    const $morePopHeight = $fieldDetailLayer.prop('scrollHeight');

    let leftPosAdjustValue: number = 20;
    if (isRightSide) {
      leftPosAdjustValue = 240;
      $fieldDetailLayer.find('.ddp-ui-layer-sub').css('left', '-80%');
    }
    // 하위영역이 context menu가 나올공간이 충분할떄
    if (this.$window.height() / 2 > $topOffset) {
      $fieldDetailLayer.css({
        left: $leftOffset - leftPosAdjustValue - this.$window.scrollLeft(),
        top: $topOffset + 19
      });
    }

    // 하위영역이 context menu가 나올공간보다 적을때
    if (this.$window.height() / 2 <= $topOffset) {
      $fieldDetailLayer.css({
        left: $leftOffset - leftPosAdjustValue - this.$window.scrollLeft(),
        top: $topOffset - $morePopHeight - 10
      });
    }
    // 위치 설정 - End

    return true;
  } // function - init

  /**
   * 사용자 정의 필드 Expresion 표현형태로 치환
   * @param expr
   * @returns {string}
   */
  public unescapeCustomColumnExpr(expr: string) {
    return StringUtil.unescapeCustomColumnExpr(expr);
  }

  /**
   * edit condition 클릭시 팝업 열기
   * @param selectedField
   */
  public customFieldEmit(selectedField: Field) {

    // 상위 컴포넌트로 noti
    this.openCustomFieldEvent.emit(selectedField);
  }

  /**
   * 해당 필드를 삭제시 (custom field인 경우)
   */
  public deleteCustomField() {
    this.deleteCustomFieldEvent.emit(this.selectedField);
  }

  /**
   * 컬럼 상세 팝업 열기
   * @param field
   */
  public columDetail(field: Field): void {
    this.openColumnDetailEvent.emit(field);
  }

  /**
   * value alias 팝업 show
   */
  public showAliasValue(field: Field) {
    this.popupValueAlias.init(field, this._metatDatasource, field.valueAlias);
  } // function - showAliasValue


  /**
   * Alias for this chart: 적용
   * @param event
   */
  public onAliasApply(event: Event): void {

    // 이벤트 캔슬
    event.stopPropagation();

    this.fix2DepthContext = false;

    // validation
    if( isNullOrUndefined( this.editingFieldAlias ) || '' === this.editingFieldAlias.trim() ) {
      Alert.info(this.translateService.instant('msg.page.alert.chart.alias.empty.warn'));
      this.editingFieldAlias = null;
      return;
    }

    if (this.editingFieldAlias && this.editingFieldAlias.trim().length > 50) {
      Alert.info(this.translateService.instant('msg.page.alert.chart.title.maxlength.warn'));
      this.editingFieldAlias = null;
      return;
    }

    if( this.editingFieldAlias.toLowerCase() === this.selectedField.name.toLowerCase() ) {
      Alert.info(this.translateService.instant('msg.page.alert.chart.alias.dupfield.warn'));
      this.editingFieldAlias = null;
      return;
    }

    // 중복체크
    // let duppIndex: number = _.findIndex(_.concat(this.pivot.columns, this.pivot.rows, this.pivot.aggregations),(item) => {
    //   return item.alias == this.editingFieldAlias;
    // });

    // 중복이면 알림 후 중단
    // if( duppIndex > -1 ) {
    //   Alert.info(this.translateService.instant('msg.page.alert.chart.alias.dupp.warn'));
    //   return;
    // }

    // 값이 없다면 Reset 처리
    if (this.editingFieldAlias.trim() == '') {
      this.onAliasReset(null);
      return;
    }

    // 값 적용
    this.selectedField.nameAlias.nameAlias = this.editingFieldAlias;

    // 이벤트 발생
    this._changeAlias(this.editingFieldAlias);
  } // function - onAliasApply

  /**
   * Alias for this chart: 취소
   * @param event
   */
  public onAliasReset(event: Event): void {

    // 이벤트 캔슬
    (event) && ( event.stopPropagation() );

    // 값 적용
    this.selectedField.nameAlias.nameAlias = this.selectedField.name;
    this.editingFieldAlias = '';
    this.fix2DepthContext = false;

    // console.info('>>>>>> this.selectedField.nameAlias', this.selectedField.nameAlias);
    // console.info('>>>>>> this.selectedField', this.selectedField);

    // 이벤트 발생
    this._changeAlias(this.editingFieldAlias);
  } // function - onAliasReset

  /**
   * 값 별칭 변경에 대한 처리
   * @param {FieldValueAlias} valueAlias
   */
  public changeValueAlias(valueAlias: FieldValueAlias) {
    this.selectedField.valueAlias = valueAlias;
    this.changeAliasEvent.emit(this.selectedField);
  } // function - changeValueAlias

  /**
   * 값 별칭 허용 여부
   * @param {Field} field
   * @return {boolean}
   */
  public isAllowValueAlias(field: Field): boolean {
    return field.role === FieldRole.DIMENSION && field.logicalType === LogicalType.STRING
      && field.type !== 'user_expr' && isString(this.selectedField.nameAlias.dashBoardId);
  } // function - isAllowValueAlias

  /**
   * 별칭 허용 여부
   * @param {Field} field
   * @return {boolean}
   */
  public isAllowNameAlias(field: Field): boolean {
    return field.type !== 'user_expr' && isString(this.selectedField.nameAlias.dashBoardId);
  } // function - isAllowNameAlias

  /**
   * Get metaData logical type name
   * @return {string}
   */
  public getMetaDataLogicalTypeName():string {
    let name:string = '';
    let metaData = this.selectedField.uiMetaData;
    if( metaData ) {
      switch( metaData.type ) {
        case Type.Logical.LNT :
          name = 'LATITUDE';
          break;
        case Type.Logical.LNG :
          name = 'LONGITUDE';
          break;
        default :
          if (metaData.type) {
            name = metaData.type.toString();
          }
      }
    }
    return name;
  } // function - getMetaDataLogicalTypeName

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 별칭 변경
   * @param {string} nameAlias
   * @private
   */
  private _changeAlias(nameAlias: string) {

    const param: FieldNameAlias = _.cloneDeep(this.selectedField.nameAlias);
    param.nameAlias = nameAlias;

    this.loadingShow();
    if (param.id) {
      if ('' === param.nameAlias) {
        // 삭제
        this.aliasService.deleteAliases(param.id).then(() => this._setResponse());
      } else {
        // 수정
        this.aliasService.updateAliases(param.id, param).then(item => this._setResponse(<FieldNameAlias>item));
      }
    } else {
      // 생성
      this.aliasService.createAliases(param).then(item => this._setResponse(<FieldNameAlias>item));
    }

  } // function - _changeAlias

  /**
   * 요청 결과를 처리한다.
   * @param {FieldNameAlias} item
   * @private
   */
  private _setResponse(item?: FieldNameAlias) {
    let field: Field = _.cloneDeep(this.selectedField);
    if (item) {
      field.nameAlias = item;
      this.selectedField.nameAlias = item;
    } else {
      delete field.nameAlias;
      this.selectedField = this._initializeFieldForNameAlias(field);
    }
    this.changeAliasEvent.emit(field);
    this.changeDetect.markForCheck();
    this.loadingHide();
  } // function - _setResponse

  /**
   * 초기 NameAlias 를 위한 필드 설정
   * @param {Field} field
   * @return {Field}
   * @private
   */
  private _initializeFieldForNameAlias(field: Field): Field {
    const nameAlias: FieldNameAlias = new FieldNameAlias();
    nameAlias.dataSourceId = field.dsId;    // dataSourceId 가 설정되어 있지 않으면 Alias를 설정할 수 있는 필드가 아님
    nameAlias.dashBoardId = field.boardId;  // dashBoardId 가 설정되어 있지 않으면 Alias를 설정할 수 있는 필드가 아님
    nameAlias.fieldName = field.name;
    nameAlias.nameAlias = field.name;
    field.nameAlias = nameAlias;
    return field;
  } // function - _initializeFieldForNameAlias
}
