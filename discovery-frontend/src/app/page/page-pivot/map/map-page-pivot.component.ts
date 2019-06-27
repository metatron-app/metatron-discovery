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

import {Component, ElementRef, EventEmitter, Injector, Input, Output} from '@angular/core';
import {Pivot} from '../../../domain/workbook/configurations/pivot';
import {Field, FieldPivot, FieldRole, LogicalType} from '../../../domain/datasource/datasource';
import {
  ChartType,
  EventType,
  ShelveFieldType,
  UIFormatCurrencyType,
  UIFormatNumericAliasType,
  UIFormatType
} from '../../../common/component/chart/option/define/common';

import * as _ from 'lodash';
import {UIMapOption} from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import {TimestampField} from '../../../domain/workbook/configurations/field/timestamp-field';
import {DimensionField} from '../../../domain/workbook/configurations/field/dimension-field';
import {MeasureField} from '../../../domain/workbook/configurations/field/measure-field';
import {PagePivotComponent} from '../page-pivot.component';
import {Shelf} from '../../../domain/workbook/configurations/shelf/shelf';
import {Field as AbstractField} from '../../../domain/workbook/configurations/field/field';
import * as $ from "jquery";
import {MapLayerType} from '../../../common/component/chart/option/define/map/map-common';
import {UIOption} from '../../../common/component/chart/option/ui-option';
import {Alert} from '../../../common/util/alert.util';
import {ChartUtil} from '../../../common/component/chart/option/util/chart-util';
import {OptionGenerator} from "../../../common/component/chart/option/util/option-generator";
import {isNullOrUndefined} from "util";
import {CommonConstant} from "../../../common/constant/common.constant";
import {TooltipOptionConverter} from "../../../common/component/chart/option/converter/tooltip-option-converter";

@Component({
  selector: 'map-page-pivot',
  templateUrl: './map-page-pivot.component.html'
})
export class MapPagePivotComponent extends PagePivotComponent {

  public shelf: Shelf;

  public uiOption: UIMapOption;

  @Input('pageDimensions')
  public pageDimensions: Field[];

  // geo type from datasource fields
  @Input('geoType')
  public geoType: LogicalType;

  @Input('uiOption')
  public set setUIOption(uiOption: UIMapOption) {

    if (!uiOption.layerNum) uiOption.layerNum = 0;

    this.uiOption = uiOption;
  }

  @Input('pivot')
  set setPivot(pivot: Pivot) {

    this.pivot = pivot;
  }

  // layer에 따라서 해당 index에 설정하기
  @Input('shelf')
  set setShelf(shelf: Shelf) {

    this.shelf = shelf;

    this.changeShelf();
  }

  // Pivot 정보가 바뀐 경우
  @Output('changeShelf')
  public changeShelfEvent: EventEmitter<any> = new EventEmitter();

  @Output('changeLayer')
  public changeLayerEvent: EventEmitter<any> = new EventEmitter();

  @Output('removeAnalysisLayer')
  public removeAnalysisLayerEvent: EventEmitter<any> = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
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
   * map pivot validation check
   * @param targetField
   * @param currentMapLayer
   * @param pageDimensions
   * @returns {boolean}
   */
  public mapPivotValidationPass(targetField, currentMapLayer, pageDimensions): boolean {

    // validation pass
    let returnValue: boolean = true;

    let diffDataSourceFl: boolean = false;

    // 같은 선반에 동일한 필드가 있을경우
    let cnt: number = 0;
    currentMapLayer.forEach((item) => {
      if (item.field.dsId == targetField.field.dsId && item.field.name == targetField.field.name) {
        cnt++;
      }
      if (cnt > 1) {
        returnValue = false;
        return;
      }
    });

    // prevent other datasource is set on the same shelf
    currentMapLayer.forEach((item) => {
      if ('user_expr' !== targetField.subType && 'user_expr' !== item.field.type
        && item.field.dataSource != targetField.field.dataSource) {
        diffDataSourceFl = true;
        return;
      }
    });

    // find geo type from custom fields
    let geoFields = [];
    for (const item of _.cloneDeep(pageDimensions)) {
      if (item.logicalType && -1 !== item.logicalType.toString().indexOf('GEO')) {
        geoFields.push(ChartUtil.getAlias(item));
      }
    }

    // if custom field is geo type
    for (const alias of geoFields) {
      if (targetField.expr && -1 !== targetField.expr.indexOf(alias)) {
        Alert.warning(this.translateService.instant('msg.storage.ui.list.geo.block.custom.field.geo'));
        returnValue = false;
        return;
      }
    }

    // if other datasource is selected on the same shelf
    if (diffDataSourceFl) {
      Alert.warning(this.translateService.instant('msg.page.layer.multi.datasource.same.shelf'));
      returnValue = false;
      return;
    }

    // if custom field is aggregated true
    if ('user_expr' === targetField.subType && true === targetField.aggregated) {
      Alert.warning(this.translateService.instant('msg.storage.ui.list.geo.block.custom.field.agg.function'));
      returnValue = false;
      return;
    }

    return returnValue;
  }

  /**
   * 선반에 있는 필드 중 선반용 필드가 아닌 것들을 변환
   * @param targetField
   * @param targetContainer
   * @param addPivotFl pivot 리스트 추가 여부 (false pivot 리스트 추가하지 않음, true pivot 리스트 추가)
   */
  public convertField(targetField: Field, targetContainer: string, addPivotFl: boolean = true) {

    // 선반에 올린것 표시
    let shelf;
    // animation에 사용할 선반 element 설정
    let shelfElement: JQuery;

    let fieldPivot: FieldPivot;

    if (targetContainer === 'layer0') {
      shelf = this.shelf.layers[0].fields;
      shelfElement = this.$element.find('#layer0');
      fieldPivot = FieldPivot.MAP_LAYER0;
      this.uiOption.layerNum = 0;
    } else if (targetContainer === 'layer1') {
      shelf = this.shelf.layers[1].fields;
      shelfElement = this.$element.find('#layer1');
      fieldPivot = FieldPivot.MAP_LAYER1;
      this.uiOption.layerNum = 1;
    }
    // else if (targetContainer === 'layer2') {
    //   shelf = this.shelf.layers[2].fields;
    //   shelfElement = this.$element.find('#layer2');
    //   fieldPivot = FieldPivot.MAP_LAYER2;
    // }

    let currentMapLayer = this.shelf.layers[this.uiOption.layerNum].fields;
    // check is different database on the same shelf (do not need to loop because database checking)
    if (!isNullOrUndefined(currentMapLayer) && !isNullOrUndefined(currentMapLayer[0]) && !isNullOrUndefined(currentMapLayer[0]['field'])
      && targetField.dataSource != currentMapLayer[0].field.dataSource) {
      this.shelf.layers[this.uiOption.layerNum].fields = this.shelf.layers[this.uiOption.layerNum].fields.filter((field) => {
        return (field.name != targetField.name && field.ref != targetField.ref)
      });
      Alert.warning(this.translateService.instant('msg.page.layer.multi.datasource.same.shelf'));
      return;
    }

    // change logical type
    if (targetField.logicalType == LogicalType.GEO_LINE) {
      this.uiOption.layers[this.uiOption.layerNum].type = MapLayerType.LINE;
    } else if (targetField.logicalType == LogicalType.GEO_POLYGON) {
      this.uiOption.layers[this.uiOption.layerNum].type = MapLayerType.POLYGON;
    } else if (targetField.logicalType == LogicalType.GEO_POINT) {
      if (!_.isUndefined(this.uiOption.layers[this.uiOption.layerNum]['clustering']) && this.uiOption.layers[this.uiOption.layerNum]['clustering']) {
        this.uiOption.layers[this.uiOption.layerNum].type = MapLayerType.CLUSTER;
      } else {
        this.uiOption.layers[this.uiOption.layerNum].type = MapLayerType.SYMBOL;
      }
    }

    const idx = shelf.findIndex((field) => {
      return field.name === targetField.name && targetField.role === field.role;
    });

    if (idx > -1) {
      let field;

      // timestamp biType이거나, biType이 dimension이면서 logicalType이 timestamp인 경우
      if (targetField.role === FieldRole.TIMESTAMP ||
        (targetField.role === FieldRole.DIMENSION && targetField.logicalType === LogicalType.TIMESTAMP)) {

        // 타입필드로 설정
        const timeField = new TimestampField();
        field = timeField;
      } else if (targetField.role === FieldRole.DIMENSION) {
        field = new DimensionField();
      } else if (targetField.role === FieldRole.MEASURE) {

        // default로 aggregationType은 SUM으로 설정
        field = new MeasureField();
        field.aggregated = targetField.aggregated;
      }
      field.name = targetField.name;
      field.subType = targetField.type;
      field.subRole = targetField.role;
      field.expr = targetField.expr;
      field.field = targetField;

      if (targetField.name !== targetField.alias
        && (!targetField.nameAlias || targetField.nameAlias.nameAlias !== targetField.alias)) {
        field.alias = targetField.alias;
      }
      (targetField.nameAlias) && (field.fieldAlias = targetField.nameAlias.nameAlias);
      field.granularity = targetField.granularity;
      field.segGranularity = targetField.segGranularity;
      if (!_.isUndefined(targetField.ref)) {
        field.ref = targetField.ref;
      } else if (targetField.type == 'user_expr') {
        field.ref = 'user_defined';
      }

      shelf[idx] = field;

      // map pivot validation check
      if (!this.mapPivotValidationPass(field, shelf, _.cloneDeep(this.pageDimensions))) {
        shelf.splice(idx, 1);
        return;
      }

      // 현재 드래그된 필드
      this.dragField = field;

      let shelves = this.shelf.layers[this.uiOption.layerNum].fields;

      // remove duplicate list
      let duplicateFl = this.distinctPivotItems(shelves, field, idx, shelf, targetContainer);

      // if map layer type is point or heatmap, remove duplicate list
      duplicateFl = this.distinctMeasure(shelves, field, idx);

      // 선반의 dimension / measure값의 중복된값 제거, measure aggtype 설정
      if (!duplicateFl) {

        // distinctPivotItem에서 설정된 타입 targetField에 설정
        targetField.format = shelf[idx].format;

        targetField.pivot = targetField.pivot ? targetField.pivot : [];

        if (addPivotFl) targetField.pivot.push(fieldPivot);
        field.currentPivot = fieldPivot;

        // Measure일 경우
        if (field instanceof MeasureField) {
          // Format 적용
          field.format = {
            type: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.type) ? String(UIFormatType.NUMBER) : this.uiOption.valueFormat.type,
            sign: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.sign) ? String(UIFormatCurrencyType.KRW) : this.uiOption.valueFormat.sign,
            decimal: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.decimal) ? 2 : this.uiOption.valueFormat.decimal,
            useThousandsSep: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.useThousandsSep) ? true : this.uiOption.valueFormat.useThousandsSep,
            abbr: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.abbr) ? String(UIFormatNumericAliasType.NONE) : this.uiOption.valueFormat.abbr,
            customSymbol: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.customSymbol)
              ? null
              : this.uiOption.valueFormat.customSymbol
          }
        }

        // point, heatmap, line, polygon => no aggregation / hexagon => set aggregation
        if (MapLayerType.TILE !== this.uiOption.layers[this.uiOption.layerNum].type) {
          delete field.aggregationType;
        }
      }

      // 선반 정보 변경시 (선반피봇팅 조건 이미 설정하였으므로 true)
      this.changePivot(EventType.CHANGE_PIVOT);

      // 선반 total width 설정, 애니메이션 여부 설정
      if (shelfElement) this.onShelveAnimation();
    }

    // template 에서 생성한 경우 추가된 선반필드는 적용이 되지 않음 그래서 처리
    if (!_.isUndefined(this.editFieldLayerDirective)) {
      this.editFieldLayerDirective.exclude = '.ddp-icon-layer';
    }
  }

  /**
   * Datasource Field의 선반 위치정보 수정
   * @param targetField
   * @param targetContainer
   */
  public changeFieldPivot(targetField: Field, targetContainer: string, pivotField: AbstractField): void {

    targetField.pivot = targetField.pivot ? targetField.pivot : [];

    let shelf;
    let fieldPivot: FieldPivot;

    // animation에 사용할 선반 element 설정
    let shelfElement: JQuery;

    if (targetContainer === 'layer0') {
      shelf = this.shelf.layers[0].fields;
      shelfElement = this.$element.find('#layer0');
      fieldPivot = FieldPivot.MAP_LAYER0;
      this.uiOption.layerNum = 0;
    } else if (targetContainer === 'layer1') {
      shelf = this.shelf.layers[1].fields;
      shelfElement = this.$element.find('#layer1');
      fieldPivot = FieldPivot.MAP_LAYER1;
      this.uiOption.layerNum = 1;
    }
    // else if (targetContainer === 'layer2') {
    //   shelf = this.shelf.layers[2].fields;
    //   shelfElement = this.$element.find('#layer2');
    //   fieldPivot = FieldPivot.MAP_LAYER2;
    // }

    // 선반의 위치가 다른선반으로 이동시에만 설정
    if (pivotField.currentPivot !== fieldPivot) {

      // 다른 선반으로 이동 시, 데이터 소스가 다를 경우 제거
      if (shelf.length > 0) {
        let targetDsId: string = '';
        shelf.forEach((item) => {
          if (item.field.logicalType == LogicalType.GEO_POINT || item.field.logicalType == LogicalType.GEO_LINE || item.field.logicalType == LogicalType.GEO_POLYGON) {
            targetDsId = item.field.dsId;
          }
        });
        shelf = _.remove(shelf, function (item) {
          return item['field']['dsId'] != targetDsId;
        });
      }

      // 타임스탬프일때
      if (targetField.role === FieldRole.TIMESTAMP ||
        (targetField.role === FieldRole.DIMENSION && targetField.logicalType === LogicalType.TIMESTAMP)) {

        const timestampIndex = shelf.findIndex((field) => {
          return field.name === targetField.name && targetField.role === field.field.role && targetField.granularity === field.granularity && -1 !== targetField.format['type'].indexOf('time');
        });

        // 같은 timestamp의 다른타입이 한선반에 들어간경우
        if (-1 !== timestampIndex) {

          // 그리드를 제외한 같은선반에 timestamp가 2개이상 들어가지 못하게 설정
          let duplicateFieldFl = this.deleteDuplicatedField(targetField, timestampIndex, targetContainer);

          // 중복이 아닐때에만 해당 선반에 추가
          if (!duplicateFieldFl) {
            // 기존의 피봇값 제거
            targetField.pivot.splice(targetField.pivot.indexOf(pivotField.currentPivot), 1);
            // 이동된 피봇의값을 추가
            targetField.pivot.push(fieldPivot);
            // 현재피봇값 변경
            pivotField.currentPivot = fieldPivot;
          }
        }
      } else {
        // 타임스탬프가 아닐때

        // 기존의 피봇값 제거
        targetField.pivot.splice(targetField.pivot.indexOf(pivotField.currentPivot), 1);
        // 이동된 피봇의값을 추가
        targetField.pivot.push(fieldPivot);
        // 현재피봇값 변경
        pivotField.currentPivot = fieldPivot;
      }
    }

    // 선반 정보 변경시 (선반피봇팅 조건 이미 설정하였으므로 true)
    this.changePivot(EventType.CHANGE_PIVOT);

    // 선반 total width 설정, 애니메이션 여부 설정
    if (shelfElement) this.onShelveAnimation();
  }

  /**
   * 선반정보 변경시
   */
  public changePivot(eventType?: EventType) {

    // set layer alias
    this.shelf.layers[this.uiOption.layerNum].fields = this.shelf.layers[this.uiOption.layerNum].fields.map(this.checkAlias);

    // 크기 반경
    this.setPointOption();

    // emit
    this.changeShelfEvent.emit({shelf: this.shelf, eventType: eventType});
  }

  /**
   * map chart - add layer
   */
  public addLayer(index: number): void {
    if (this.shelf.layers.length >= 2
      || isNullOrUndefined(this.shelf.layers[0]) || isNullOrUndefined(this.shelf.layers[0].fields) || this.shelf.layers[0].fields.length <= 0) {
      Alert.warning('Please select GEO dimension one or more');
      return;
    } else {

      let layers = {
        name: '',
        ref: '',
        // view : {
        //   "type": "hash",
        //   "method": "h3",
        //   "precision": 5
        // },
        fields: []
      };

      // add empty layer
      this.shelf.layers.push(layers);

      // set current layer number
      this.uiOption.layerNum = this.shelf.layers.length - 1;

      // set layer alias
      this.shelf.layers[this.uiOption.layerNum].fields = this.shelf.layers[this.uiOption.layerNum].fields.map(this.checkAlias);

      // layer 생성 (page.component에서 uiOption 전체를 생성함, layer만 추가 하기, 추가 layer 생성하기 위해서 0번째를 복사)
      let addUiOptionLayer = OptionGenerator.initUiOption(this.uiOption)['layers'][0];

      // layer name setting
      addUiOptionLayer.name = this.uiOption.layers[index].name == ('Layer' + (index + 1)) ? 'Layer' + (index + 2) : 'Layer' + (index + 1);

      this.uiOption.layers.push(addUiOptionLayer);

      // emit
      this.changeLayerEvent.emit(this.shelf);
    }
  }

  /**
   * map chart - remove layer
   */
  public removeLayer(index: number): void {

    if (this.shelf.layers.length <= 1 || (!_.isUndefined(this.uiOption['analysis']) && this.uiOption.analysis['use'] == true)) {
      return;
    }

    // remove layer
    this.shelf.layers.splice(index, 1);

    // 필드의 선반정보 제거
    for (let idx = 0; idx < this.shelf.layers.length; idx++) {
      let item = this.shelf.layers[idx].fields;
      for (let idx2 = 0; idx2 < item.length; idx2++) {
        item[idx2].field.pivot.splice(item[idx2].field.pivot.indexOf(index), 1);
      }
    }

    // set current layer number
    this.uiOption.layerNum = this.shelf.layers.length - 1;
    // set layer alias
    this.shelf.layers[this.uiOption.layerNum].fields = this.shelf.layers[this.uiOption.layerNum].fields.map(this.checkAlias);
    // uiOption layer 제거
    this.uiOption.layers.splice(index, 1);
    // emit
    this.changeShelfEvent.emit({shelf: this.shelf});
    // remove 일경우 재적용
    this.changePivot(EventType.CHANGE_PIVOT);
  }

  /**
   * show guide or not
   * @returns {boolean}
   */
  public isGuide(): boolean {

    // before selecting chart, return false
    if (this.chartType == '') {
      return false;
    }

    // when geo dimension on shelf, hide guide
    for (let field of this.shelf.layers[this.uiOption.layerNum].fields) {
      if (field && field.field && field.field.logicalType && -1 !== field.field.logicalType.toString().indexOf("GEO")) {
        return false;
      }
    }

    return true;
  }

  /**
   * toggle shelf context menu
   * @param event
   * @param field
   */
  public openFieldSetting(event, field) {

    event.stopPropagation();

    // toggle editing Field
    if (this.editingField === field) {
      this.editingField = null;
      return;
    }

    this.editingField = field;

    // 모든선반에서 같은 field aggregation Type 설정
    let shelves = this.shelf.layers[this.uiOption.layerNum].fields;

    // set field setting
    this.fieldSetting(shelves);
  }

  /**
   * emit change shelf
   */
  public changeShelf(eventType?: EventType) {
    this.changeShelfEvent.emit({shelf: this.shelf, eventType: eventType});
  }

  /**
   * set shelf guide
   * @param {string} type
   * @returns {boolean}
   */
  public getMapGuideText(index: number, type?: string): boolean {

    if (!this.shelf.layers) return;

    let layers = this.shelf.layers[index];

    let returnValue: boolean;

    if ('geo' === type) {
      returnValue = true;

      // hide when there is geo dimension
      layers.fields.forEach((item) => {
        if (item.field && item.field.logicalType && -1 !== item.field.logicalType.toString().indexOf('GEO')) {
          return returnValue = false;
        }
      });
    } else {
      returnValue = false;

      // show when there is geo dimension
      layers.fields.forEach((item) => {
        if (item.field && item.field.logicalType && -1 !== item.field.logicalType.toString().indexOf('GEO')) {
          return returnValue = true;
        }
      });
    }

    return returnValue;
  }

  /**
   * 아이템의 길이가 선반 길이보다 긴경우 prev / next 버튼 show설정
   */
  public onShelveAnimation() {

    if (!this.changeDetect['destroyed']) {
      // 선반의 아이템들이 나오게 설정
      this.changeDetect.detectChanges();
    }

    let element = this.$element.find('#layer' + this.uiOption.layerNum).find('.ddp-wrap-default');

    let scope = this;

    // 선반의 길이에따라 animation 설정
    element.each(function () {

      // animation total width 설정
      let totalWidth = scope.getShelveTotalWidth($(this));

      // total width 설정 (드래그시 아래로 떨어지는걸 방지하기위해서 drag item width인 150을 더해주기)
      $(this).css('width', totalWidth + 150);

      // prev / next 버튼 show / hide 설정
      if (totalWidth > $(this).parent('.ddp-ui-drag-slide-in').width()) {

        $(this).parent().parent().addClass('ddp-slide');
        $(this).parent().parent().css('padding-right', '10px');
      }
      if (totalWidth <= $(this).parent('.ddp-ui-drag-slide-in').width()) {

        $(this).parent().parent().removeClass('ddp-slide');
        $(this).parent().parent().removeAttr('padding-right');

        // ddp-wrap-default margin-left 제거
        $(this).css('margin-left', '0px');
      }
    })
  }

  /**
   * animation 이전버튼에 마우스 오버시
   */
  public mouseOverPrev(event: any) {

    // 애니메이션 동작설정 true
    this.animationPause = false;

    let scope = this;

    const $wrapDefault = $(event.currentTarget.parentElement.parentElement).find('.ddp-wrap-default');

    // 선반에 animation 설정
    $wrapDefault.animate({marginLeft: 0}, {
      duration: 1500, step: function () {

        if (scope.animationPause) {
          $(this).stop();
        }
      }
    });
  }

  /**
   * animation 다음버튼에 마우스 오버시
   */
  public mouseOverNext(event: any) {

    // 애니메이션 동작설정 true
    this.animationPause = false;

    let scope = this;

    const $currentShelve = $(event.currentTarget.parentElement.parentElement);

    const $wrapDefault = $(event.currentTarget.parentElement.parentElement).find('.ddp-wrap-default');

    let totalWidth = this.getShelveTotalWidth($currentShelve);

    // animation width 설정
    let moveWidth = totalWidth - $currentShelve.find('.ddp-ui-drag-slide-in').width();

    // 선반에 animation 설정
    $wrapDefault.animate({marginLeft: -moveWidth - 40}, {
      // $wrapDefault.animate({ marginLeft: -moveWidth - 80 }, {
      duration: 1500, step: function () {

        if (scope.animationPause) {
          $(this).stop();
        }
      }
    });

  }

  /**
   * 페이지에서 필드 추가 할때
   * @param {Field} targetField
   * @param {string} targetContainer
   */
  public addField(targetField: Field, targetContainer: string, pivotField: AbstractField) {
    let shelf;

    if (targetContainer === 'layer') {
      shelf = this.shelf.layers[this.uiOption.layerNum];
    } else {
      console.info('정의되지 않은 drop', targetContainer);
      return;
    }

    targetContainer = 'layer' + this.uiOption.layerNum;

    if (targetField) {
      shelf.fields.push(targetField);
      this.convertField(targetField, targetContainer);
    }
  }

  /**
   * block custom field => true (block), false(not block) - temporary code
   * @param {Field} targetField
   * @returns {boolean}
   */
  public blockCustomField(targetField: Field, uiOption: UIOption) {

    // when chart is map, target field is custom field
    if (ChartType.MAP === uiOption.type && 'user_expr' === targetField.type) {
      return true;
    }

    return false;
  }

  /**
   * 해당 선반에서 중복데이터일때
   * @param field 필드값
   * @param idx   필드 index
   * @param targetContainer 현재 선택된 선반
   */
  protected deleteDuplicatedField(field: any, idx: number, targetContainer: string): boolean {

    // 열선반에서 해당 선반 중복시 제거
    if (this.checkDuplicatedField(this.shelf.layers[this.uiOption.layerNum].fields, field).length > 1) {

      // 선반에서 해당 아이템 제거
      this.shelf.layers[this.uiOption.layerNum].fields.splice(idx, 1);
      return true;
    }

    return false;
  }

  /**
   * remove the measure having same name
   * @param {Field[]} shelves
   * @param field
   * @param {number} idx
   * @param {Field[]} shelf
   * @param {string} targetContainer
   * @returns {boolean}
   */
  private distinctMeasure(shelf: AbstractField[], field: any, idx: number): boolean {

    const duplicateList = [];

    shelf.forEach((item) => {

      if (item.name === field.name) {

        duplicateList.push(item);
      }
    });

    // duplicate list exists
    if (String(ShelveFieldType.MEASURE) === field.type && duplicateList.length > 1) {

      // symbol, heatmap => no aggregation type
      if (MapLayerType.SYMBOL === this.uiOption.layers[this.uiOption.layerNum].type ||
        MapLayerType.CLUSTER === this.uiOption.layers[this.uiOption.layerNum].type ||
        MapLayerType.HEATMAP === this.uiOption.layers[this.uiOption.layerNum].type) {

        shelf.splice(idx, 1);
        return true;
      }
    }

    return false;
  }

  /**
   * layer 변경
   * @param index
   */
  public selectedLayer(index: number) {
    if (this.uiOption.layerNum != index
      && (_.isUndefined(this.uiOption.analysis) || (!_.isUndefined(this.uiOption.analysis) && this.uiOption['analysis']['use'] == false))) {
      this.uiOption.layerNum = index;
      // this.selectLayerEvent.emit(index);
    }
  }

  /**
   * 공간연산 버튼 클릭시
   */
  public spatialAnalysisBtnClicked(value) {

    this.uiOption = value;

    let layers = {
      name: CommonConstant.MAP_ANALYSIS_LAYER_NAME,
      ref: '',
      fields: _.cloneDeep(this.shelf.layers[this.uiOption.analysis.layerNum].fields)
    };

    // add empty layer
    this.shelf.layers.push(layers);

    // layer 생성 (page.component에서 uiOption 전체를 생성함, layer만 추가 하기, 추가 layer 생성하기 위해서 0번째를 복사)
    let addUiOptionLayer = OptionGenerator.initUiOption(this.uiOption)['layers'][0];
    // layer name setting
    addUiOptionLayer.name = CommonConstant.MAP_ANALYSIS_LAYER_NAME;

    this.uiOption.layers.push(addUiOptionLayer);
    // 0 ~ 1 은 multi-layer, 그래서 공간연산 layer 값은 2
    this.uiOption.layerNum = this.uiOption.layers.length - 1;

    // 공간연산에서 choropleth 를 활성화 했을 경우
    // 커스텀 하게 default 값 count 정보 설정
    if (this.uiOption['analysis']['operation']['choropleth'] == true) {
      let field: MeasureField = new MeasureField();
      // 이미 변수가 선언이 되어 있어 강제로 변경
      field.aggregationType = null;
      field.alias = 'count';
      field.type = 'measure';
      field.subRole = 'measure';
      field.name = 'count';
      field.isCustomField = true;
      field.field = new Field();
      field.field.logicalType = LogicalType.INTEGER;
      this.uiOption.toolTip['isFirstOpenTooltipOption'] = true;

      // 공간연산 실행 시 layer의 field에 해당 값 적용
      let uiOption = this.uiOption;
      this.shelf.layers.forEach((layer) => {
        if (layer.name === CommonConstant.MAP_ANALYSIS_LAYER_NAME) {
          layer.fields.push(_.cloneDeep(field));
          layer.fields.forEach((field) => {
            if (uiOption['analysis']['operation']['aggregation']['column'] == field.name && !(!_.isUndefined(field.isCustomField) && field.isCustomField == true)) {
              field.aggregationType = uiOption['analysis']['operation']['aggregation']['type'];
            }
          });
        }
      });
    }
    this.setPointOption();
  }

  /**
   * delete analysis 옵션
   */
  public removeAnalysis() {
    // Map Chart spatial analysis delete
    if (!_.isUndefined(this.uiOption.analysis) && this.uiOption['analysis']['use'] == true) {
      this.shelf.layers.pop();
      this.uiOption.layers.pop();
      this.uiOption.layerNum = this.uiOption.layers.length - 1;
      this.uiOption['analysis']['use'] = false;
      delete this.uiOption.analysis.operation;
      delete this.uiOption.analysis.mainLayer;
      delete this.uiOption.analysis.compareLayer;
      delete this.uiOption.analysis.type;

      // Tooltip setting
      let layerItems = [];
      // 공간연산 사용 여부
      for (let layerIndex = 0; this.uiOption.layers.length > layerIndex; layerIndex++) {
        if (this.shelf && !_.isUndefined(this.shelf.layers[layerIndex])) {
          this.shelf.layers[layerIndex].fields.forEach((field) => {
            layerItems.push(field);
          });
        }
      }
      // set alias
      for (const item of layerItems) {
        item['alias'] = ChartUtil.getAlias(item);
      }
      // return shelf list except geo dimension
      let uniqList = TooltipOptionConverter.returnTooltipDataValue(layerItems);
      // tooltip option panel이 첫번째로 열렸는지 여부
      this.uiOption.toolTip['isFirstOpenTooltipOption'] = true;
      this.uiOption.toolTip.displayColumns = ChartUtil.returnNameFromField(uniqList);

      // emit
      this.removeAnalysisLayerEvent.emit(this.shelf);
    }
  }

  /**
   * 크기반경 설정
   */
  private setPointOption() {
    if (!_.isUndefined(this.uiOption) && !_.isUndefined(this.uiOption['layers']) && this.uiOption['layers'].length > 0) {
      for (let layerIndex = 0; this.uiOption['layers'].length > layerIndex; layerIndex++) {
        // 크기 반경 관련 설정
        if (this.uiOption['layers'][layerIndex]['type'] == MapLayerType.SYMBOL) {
          // 크기 설정
          if (isNullOrUndefined(this.uiOption.layers[layerIndex]['pointRadiusFrom'])) {
            // default size of points are 5 pixel
            this.uiOption.layers[layerIndex]['pointRadiusFrom'] = 5;
            this.uiOption.layers[layerIndex].pointRadius = 5;
          }
          let hasMeasure = this.shelf.layers[layerIndex].fields.find((field) => {
            return field.type == 'measure';
          });
          // Measure 값이 없을 경우
          if (this.shelf['layers'][layerIndex].fields.length <= 1
            || (this.shelf['layers'][layerIndex].fields.length > 1
              && isNullOrUndefined(this.uiOption.layers[layerIndex]['pointRadiusTo'])
              && isNullOrUndefined(hasMeasure))) {
            delete this.uiOption.layers[layerIndex]['needToCalPointRadius'];
            delete this.uiOption.layers[layerIndex]['pointRadiusTo'];
            delete this.uiOption.layers[layerIndex]['pointRadiusCal'];
            this.uiOption.layers[layerIndex].pointRadius = this.uiOption.layers[layerIndex]['pointRadiusFrom'];
          } else if (this.shelf['layers'][layerIndex].fields.length > 1 && hasMeasure) {
            if (isNullOrUndefined(this.uiOption.layers[layerIndex]['pointRadiusTo'])) {
              if (this.uiOption.layers[layerIndex]['pointRadiusFrom'] < 100) {
                this.uiOption.layers[layerIndex]['pointRadiusTo'] = 20;
              } else {
                this.uiOption.layers[layerIndex]['pointRadiusTo'] = 200;
              }
            }
            this.uiOption.layers[layerIndex]['needToCalPointRadius'] = true;
          }
        }
      }
    }
  }





}
