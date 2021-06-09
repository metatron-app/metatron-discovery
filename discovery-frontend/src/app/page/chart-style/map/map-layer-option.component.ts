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
import {AfterViewChecked, Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from '@angular/core';
import {UIMapOption} from '@common/component/chart/option/ui-option/map/ui-map-chart';
import {
  MapBy,
  MapLayerType,
  MapLineStyle,
  MapSymbolType,
  MapThickness
} from '@common/component/chart/option/define/map/map-common';
import * as _ from 'lodash';
import {ChartColorList, ColorRangeType, EventType, ShelveFieldType} from '@common/component/chart/option/define/common';
import {UISymbolLayer} from '@common/component/chart/option/ui-option/map/ui-symbol-layer';
import {MapOutline} from '@common/component/chart/option/ui-option/map/ui-outline';
import {UIPolygonLayer} from '@common/component/chart/option/ui-option/map/ui-polygon-layer';
import {UILineLayer} from '@common/component/chart/option/ui-option/map/ui-line-layer';
import {UIHeatmapLayer} from '@common/component/chart/option/ui-option/map/ui-heatmap-layer';
import {UITileLayer} from '@common/component/chart/option/ui-option/map/ui-tile-layer';
import {BaseOptionComponent} from '../base-option.component';
import {ColorTemplateComponent} from '../../component/color/color-template.component';
import {Field as AbstractField, Field} from '../../../domain/workbook/configurations/field/field';
import {Shelf} from '@domain/workbook/configurations/shelf/shelf';
import {AggregationType} from '@domain/workbook/configurations/field/measure-field';
import {ChartUtil} from '@common/component/chart/option/util/chart-util';
import {UILayers} from '@common/component/chart/option/ui-option/map/ui-layers';
import {GeoField} from '@domain/workbook/configurations/field/geo-field';
import {ColorRange} from '@common/component/chart/option/ui-option/ui-color';
import {FormatOptionConverter} from '@common/component/chart/option/converter/format-option-converter';
import {ColorOptionConverter} from '@common/component/chart/option/converter/color-option-converter';
import {OptionGenerator} from '@common/component/chart/option/util/option-generator';
import {MapChartComponent} from '@common/component/chart/type/map-chart/map-chart.component';
import {FieldRole, LogicalType} from '@domain/datasource/datasource';
import UI = OptionGenerator.UI;

@Component({
  selector: 'map-layer-option',
  templateUrl: './map-layer-option.component.html',
  styles: ['.sys-inverted {transform: scaleX(-1);}']
})
export class MapLayerOptionComponent extends BaseOptionComponent implements AfterViewChecked {

  @Input('rnbMenu')
  public set setRnbMenu(rnbMenu: string) {
    this.rnbMenu = rnbMenu;
    this.getLayerIndex();
  }

  @Input('uiOption')
  public set setUiOption(uiOption: UIMapOption) {

    this.uiOption = uiOption;

    this.setClusterOption();

    // set ranges for view
    this.rangesViewList = this.setRangeViewByDecimal(this.uiOption.layers[this.index].color['ranges']);

    // set min / max by decimal format
    if (this.uiOption.valueFormat && undefined !== this.uiOption.valueFormat.decimal) {
      this.minValue = FormatOptionConverter.getDecimalValue(this.uiOption.layers[this.index].color.minValue, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep);
      this.maxValue = FormatOptionConverter.getDecimalValue(this.uiOption.layers[this.index].color.maxValue, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep);
    }
  }

  @Input('shelf')
  public set setShelf(shelf: Shelf) {

    // set by type list by dimension, measure count
    this.setByType(shelf);

    this.shelf = shelf;

    this.setPointOption();

    this.changeDetect.detectChanges();
  }

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  // current layer index (0-1)
  public index: number = 0;

  @Input('data')
  public data: object[];

  public rnbMenu: string;

  // color template popup
  @ViewChild('colorTemplate')
  public colorTemplate: ColorTemplateComponent;

  // set z index
  @Output()
  public setZIndex: EventEmitter<boolean> = new EventEmitter();

  public shelf: Shelf;

  public uiOption: UIMapOption;

  // symbol layer - type list
  public symbolLayerTypes = [{
    name: this.translateService.instant('msg.page.layer.map.type.point'),
    value: MapLayerType.SYMBOL
  },
    {name: this.translateService.instant('msg.page.layer.map.type.heatmap'), value: MapLayerType.HEATMAP},
    {name: this.translateService.instant('msg.page.layer.map.type.tile'), value: MapLayerType.TILE},
    {name: this.translateService.instant('msg.page.layer.map.type.cluster'), value: MapLayerType.CLUSTER}];

  // symbol layer - symbol list
  public symbolLayerSymbols = [{
    name: this.translateService.instant('msg.page.layer.map.point.circle'),
    value: MapSymbolType.CIRCLE
  },
    {name: this.translateService.instant('msg.page.layer.map.point.square'), value: MapSymbolType.SQUARE},
    {name: this.translateService.instant('msg.page.layer.map.point.triangle'), value: MapSymbolType.TRIANGLE}];

  // outline - thickness
  public thicknessList = [{value: MapThickness.THIN}, {value: MapThickness.NORMAL}, {value: MapThickness.THICK}];


  // line layer - thickness
  public lineStyleList = [{
    name: this.translateService.instant('msg.page.layer.map.line.type.solid'),
    value: MapLineStyle.SOLID
  },
    {name: this.translateService.instant('msg.page.layer.map.line.type.dotted'), value: MapLineStyle.DOTTED},
    {name: this.translateService.instant('msg.page.layer.map.line.type.dashed'), value: MapLineStyle.DASHED}];

  // show / hide setting for color picker
  public colorListFlag: boolean = false;

  // dimension, measure List
  public fieldList = [];
  public fieldMeasureList = [];

  // range list for view
  public rangesViewList = [];

  public availableRangeValue: string;

  // min / max
  public minValue: string;
  public maxValue: string;

  // 공간연산
  @ViewChild(MapChartComponent)
  public mapChartCompnent: MapChartComponent;

  public ngAfterViewChecked() {
    this.changeDetect.detectChanges();
  }

  /**
   * all layers - change layer name
   */
  public changeLayerName(name: string, layerIndex: number) {

    this.uiOption.layers[layerIndex].name = name;

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * symbol layer - change layer type
   * @param {MapLayerType} layerType
   * @param layerIndex
   */
  public changeSymbolLayerType(layerType: MapLayerType, layerIndex: number) {

    if (this.uiOption.layers[layerIndex].type === layerType) return;

    let measureList = [];
    let layer: UILayers = this.uiOption.layers[layerIndex];

    // 기존 레이어 타입 설정 셋팅
    const preLayerType: MapLayerType = _.cloneDeep(this.uiOption.layers[layerIndex].type);
    const cloneLayer = _.cloneDeep(this.uiOption.layers[layerIndex]);
    if (MapLayerType.HEATMAP === preLayerType) {
      layer.heatMapRadius = cloneLayer.heatMapRadius;
      layer.color.heatMapSchema = cloneLayer.color.schema;
      layer.color.heatMapTransparency = cloneLayer.color.transparency;
    } else if (MapLayerType.SYMBOL === preLayerType) {
      layer.color.symbolSchema = cloneLayer.color.schema;
      layer.color.symbolTransparency = cloneLayer.color.transparency;
      layer.symbolPointType = (cloneLayer as UISymbolLayer).symbol;
      layer.symbolOutline = (cloneLayer as UISymbolLayer).outline;
      layer['symbolPointRadiusFrom'] = (cloneLayer as UISymbolLayer)['pointRadiusFrom'];
      layer['symbolPointRadiusTo'] = (cloneLayer as UISymbolLayer)['pointRadiusTo'];
      layer.color['symbolSettingUseFl'] = (cloneLayer as UISymbolLayer).color.settingUseFl;
      layer.color['symbolRanges'] = (cloneLayer as UISymbolLayer).color.ranges;
      layer.color['symbolChangeRange'] = (cloneLayer as UISymbolLayer).color.changeRange;
      layer.color['symbolColumn'] = (cloneLayer as UISymbolLayer).color.column;
    } else if (MapLayerType.TILE === preLayerType) {
      layer.tileRadius = cloneLayer.tileRadius;
      layer.color.tileSchema = cloneLayer.color.schema;
      layer.color.tranTransparency = cloneLayer.color.transparency;
      layer.color['tileSettingUseFl'] = (cloneLayer as UISymbolLayer).color.settingUseFl;
      layer.color['tileRanges'] = (cloneLayer as UISymbolLayer).color.ranges;
      layer.color['tileChangeRange'] = (cloneLayer as UISymbolLayer).color.changeRange;
      layer.color['tileColumn'] = (cloneLayer as UISymbolLayer).color.column;
    } else if (MapLayerType.POLYGON === preLayerType) {
      layer.color.polygonSchema = cloneLayer.color.schema;
      layer.color.tranTransparency = cloneLayer.color.transparency;
    } else if (MapLayerType.CLUSTER === preLayerType) {
      layer.color.clusterSchema = cloneLayer.color.schema;
      layer.color.clusterTransparency = cloneLayer.color.transparency;
      layer.clusterPointType = (cloneLayer as UISymbolLayer).symbol;
      layer.clusterOutline = (cloneLayer as UISymbolLayer).outline;
      layer.color['clusterSettingUseFl'] = (cloneLayer as UISymbolLayer).color.settingUseFl;
      layer.color['clusterRanges'] = (cloneLayer as UISymbolLayer).color.ranges;
      layer.color['clusterChangeRange'] = (cloneLayer as UISymbolLayer).color.changeRange;
    }

    delete this.uiOption.layers[layerIndex].noneColor;
    delete this.uiOption.layers[layerIndex].dimensionColor
    delete this.uiOption.layers[layerIndex].measureColor

    // change layer type
    this.uiOption.layers[layerIndex].type = layerType;

    // cluster 설정 (cluster 경우 point 타입에서 cluster on / off 기능으로 구현됨)
    this.uiOption.layers[layerIndex]['clustering'] = (layerType === MapLayerType.CLUSTER);

    // init color, legend
    this.initOptionSymbolLayer(layerIndex);
    this.setMeasureDimensions(this.shelf);

    // change color type by layer type
    if (MapLayerType.HEATMAP === layerType) {

      layer = this.setColorByShelf(false, layerIndex);
      if (this.isNullOrUndefined(layer.color.heatMapTransparency)) {
        layer.color.heatMapTransparency = 10;
      }
      layer.color.transparency = layer.color.heatMapTransparency;
      if (this.isNullOrUndefined(layer['blur'])) {
        layer['blur'] = 20;
      }
      if (this.isNullOrUndefined(layer.heatMapRadius)) {
        layer.heatMapRadius = 20;
      }
      layer['radius'] = layer.heatMapRadius;

      measureList = this.findFieldList(this.fieldList[layerIndex], ShelveFieldType.MEASURE.toString());

      // when measure doesn't exist, hide/disable legend
      if (!measureList || 0 === measureList.length) {
        // this.uiOption.legend.showName = false;
        this.uiOption.legend.auto = false;
      } else {
        layer.color.column = measureList[0]['name'];
      }

      // remove measure aggregation type in shelf
      this.removeAggregationType();

    } else if (MapLayerType.SYMBOL === layerType) {
      // set color by shelf
      layer = this.setColorByShelf(false, layerIndex);
      if (this.isNullOrUndefined(layer.color.symbolTransparency)) {
        layer.color.symbolTransparency = 50;
      }
      layer.color.transparency = layer.color.symbolTransparency;
      if (this.isNullOrUndefined(layer.symbolPointType)) {
        layer.symbolPointType = MapSymbolType.CIRCLE;
      }
      (layer as UISymbolLayer).symbol = layer.symbolPointType;
      if (this.isNullOrUndefined(layer.symbolOutline)) {
        layer.symbolOutline = null;
      }
      (layer as UISymbolLayer).outline = layer.symbolOutline;
      (layer as UISymbolLayer)['pointRadiusFrom'] = layer['symbolPointRadiusFrom'];
      (layer as UISymbolLayer)['pointRadiusTo'] = layer['symbolPointRadiusTo'];
      (layer as UISymbolLayer).color.settingUseFl = layer.color['symbolSettingUseFl'];
      (layer as UISymbolLayer).color.ranges = layer.color['symbolRanges'];
      (layer as UISymbolLayer).color.changeRange = layer.color['symbolChangeRange'];
      (layer as UISymbolLayer).color.column = layer.color['symbolColumn'];

      console.log('color.by2...', (layer as UISymbolLayer).color);

      this.rangesViewList = this.setRangeViewByDecimal(layer.color.ranges);

      // remove measure aggregation type in shelf
      this.removeAggregationType();

    } else if (MapLayerType.CLUSTER === layerType) {
      // set color by shelf
      layer = this.setColorByShelf(false, layerIndex);
      if (this.isNullOrUndefined(layer.color.clusterTransparency)) {
        layer.color.clusterTransparency = 10;
      }
      layer.color.transparency = layer.color.clusterTransparency;
      if (this.isNullOrUndefined(layer.clusterPointType)) {
        layer.clusterPointType = MapSymbolType.CIRCLE;
      }
      (layer as UISymbolLayer).symbol = layer.clusterPointType;
      if (this.isNullOrUndefined(layer.clusterOutline)) {
        layer.clusterOutline = null;
      }
      (layer as UISymbolLayer).outline = layer.clusterOutline;

      layer.color.settingUseFl = layer.color['clusterSettingUseFl'];
      layer.color.ranges = layer.color['clusterRanges'];
      layer.color.changeRange = layer.color['clusterChangeRange'];
      this.rangesViewList = this.setRangeViewByDecimal(layer.color.ranges);

      // remove measure aggregation type in shelf
      this.removeAggregationType();

    } else if (MapLayerType.TILE === layerType) {
      // set color by shelf
      layer = this.setColorByShelf(true, layerIndex);
      if (this.isNullOrUndefined(layer.color.tranTransparency)) {
        layer.color.tranTransparency = 10;
      }
      layer.color.transparency = layer.color.tranTransparency;
      if (this.isNullOrUndefined(layer.tileRadius)) {
        layer.tileRadius = 20;
      }
      layer['radius'] = layer.tileRadius;
      layer.color.settingUseFl = layer.color['tileSettingUseFl'];
      layer.color.ranges = layer.color['tileRanges'];
      layer.color.changeRange = layer.color['tileChangeRange'];
      layer.color.column = layer.color['tileColumn'];

      this.rangesViewList = this.setRangeViewByDecimal(layer.color.ranges);

      // if( this.isNullOrUndefined(this.uiOption.layers[this.index]['coverage']) ) {
      //   this.uiOption.layers[this.index]['coverage'] = 0.9;
      // }

      // add measure aggregation type in shelf
      this.addAggregationType();
    }

    // // set measure, dimension list by layer type
    this.setMeasureDimensions(this.shelf);

    this.setPointOption();

    // apply layer ui option
    this.applyLayers({type: EventType.MAP_CHANGE_OPTION});
  }

  /**
   * symbol layer - change symbol type
   * @param {SymbolType} symbolType
   * @param layerIndex
   */
  public changeSymbolType(symbolType: MapSymbolType, layerIndex: number) {

    (this.uiOption.layers[layerIndex] as UISymbolLayer).symbol = symbolType;

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * all layers - change transparency
   * @param _obj
   * @param slider
   * @param {number} index
   */
  public changeTransparency(_obj: any, slider: any, index: number) {

    const layer = this.uiOption.layers[index];
    if (MapLayerType.HEATMAP === layer.type) {
      layer.color.heatMapTransparency = slider.from;
      layer.color.transparency = layer.color.heatMapTransparency;
    } else if (MapLayerType.SYMBOL === layer.type) {
      layer.color.symbolTransparency = slider.from;
      layer.color.transparency = layer.color.symbolTransparency;
    } else if (MapLayerType.TILE === layer.type) {
      layer.color.tranTransparency = slider.from;
      layer.color.transparency = layer.color.tranTransparency;
    } else if (MapLayerType.POLYGON === layer.type) {
      layer.color.tranTransparency = slider.from;
      layer.color.transparency = layer.color.tranTransparency;
    } else if (MapLayerType.CLUSTER === layer.type) {
      layer.color.clusterTransparency = slider.from;
      layer.color.transparency = layer.color.clusterTransparency;
    }
    this.applyLayers();
  }

  /**
   * all layers - change transparency
   * @param $event
   * @param {number} index
   */
  public changeTransparencyText($event: any, index: number) {

    const inputValue = parseFloat($event.target.value);

    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = this.uiOption.layers[index].color.transparency;
      return;
    } else {
      const layer = this.uiOption.layers[index];
      if (MapLayerType.HEATMAP === layer.type) {
        layer.color.heatMapTransparency = inputValue;
        layer.color.transparency = layer.color.heatMapTransparency;
      } else if (MapLayerType.SYMBOL === layer.type) {
        layer.color.symbolTransparency = inputValue;
        layer.color.transparency = layer.color.symbolTransparency;
      } else if (MapLayerType.TILE === layer.type) {
        layer.color.tranTransparency = inputValue;
        layer.color.transparency = layer.color.tranTransparency;
      } else if (MapLayerType.POLYGON === layer.type) {
        layer.color.tranTransparency = inputValue;
        layer.color.transparency = layer.color.tranTransparency;
      } else if (MapLayerType.CLUSTER === layer.type) {
        layer.color.clusterTransparency = inputValue;
        layer.color.transparency = layer.color.clusterTransparency;
      }
      this.applyLayers();
    }
  }

  /**
   * symbol, polygon layer - toggle outline
   * @param {MapOutline} outline
   * @param {number} layerIndex
   */
  public toggleOutline(outline: MapOutline, layerIndex: number) {

    if (outline) {
      outline = null;
    } else {
      outline = ({color: '#4f4f4f', thickness: MapThickness.NORMAL} as any);
    }

    if (MapLayerType.SYMBOL === this.uiOption.layers[layerIndex].type || MapLayerType.CLUSTER === this.uiOption.layers[layerIndex].type) {
      (this.uiOption.layers[layerIndex] as UISymbolLayer).outline = outline;
    } else if (MapLayerType.POLYGON === this.uiOption.layers[layerIndex].type) {
      (this.uiOption.layers[layerIndex] as UIPolygonLayer).outline = outline;
    }

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - change thickness
   * @param {MapThickness} thickness
   * @param {number} layerIndex
   */
  public changeThick(thickness: MapThickness, layerIndex: number) {

    if (MapLayerType.SYMBOL === this.uiOption.layers[layerIndex].type || MapLayerType.CLUSTER === this.uiOption.layers[layerIndex].type) {
      (this.uiOption.layers[layerIndex] as UISymbolLayer).outline.thickness = thickness;

    } else if (MapLayerType.POLYGON === this.uiOption.layers[layerIndex].type) {
      (this.uiOption.layers[layerIndex] as UIPolygonLayer).outline.thickness = thickness;
    }

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - clustering
   */
  public isEnableClustering(layerIndex: number) {
    (this.uiOption.layers[layerIndex] as UISymbolLayer).clustering = !(this.uiOption.layers[layerIndex] as UISymbolLayer).clustering;
    this.applyLayers({type: EventType.MAP_CHANGE_OPTION});
  }

  public changeClustering(_obj: any, $event: any, index: number) {
    this.uiOption.layers[index]['coverage'] = $event.from;
    (this.uiOption as UIMapOption).layers[index]['changeCoverage'] = true;
    this.applyLayers({type: EventType.MAP_CHANGE_OPTION});
  }

  public changeClusteringText($event: any, index: number) {
    const inputValue = parseFloat($event.target.value);
    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = (this.uiOption.layers[index] as UISymbolLayer)['coverage'];
      return;
    } else {
      (this.uiOption.layers[index] as UISymbolLayer)['coverage'] = inputValue;
      (this.uiOption as UIMapOption).layers[index]['changeCoverage'] = true;
      this.applyLayers({type: EventType.MAP_CHANGE_OPTION});
    }
  }

  /**
   * change point size
   */
  public changePointSize(_obj: any, $event: any, index: number, isSingle: boolean) {
    (this.uiOption as UIMapOption).layers[index]['isChangePointRadius'] = true;
    this.uiOption['isChangeStyle'] = true;

    const fromValue = parseFloat($event.from);
    if (isSingle) {
      this.uiOption.layers[index]['pointRadiusFrom'] = fromValue;
      this.uiOption.layers[index].pointRadius = fromValue;
      delete this.uiOption.layers[index]['pointRadiusTo'];
    } else {
      const toValue = parseFloat($event.to);
      this.uiOption.layers[index]['pointRadiusFrom'] = fromValue;
      this.uiOption.layers[index]['pointRadiusTo'] = toValue;
    }
    this.applyLayers();
  }

  public changePointSizeText($event: any, index: number, sizeValue: string) {
    const inputValue = $event.target.value;
    // number check
    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue)) {
      $event.target.value = this.uiOption.layers[index][sizeValue];
      return;
    }
    // validation
    if (!this.isNullOrUndefined(this.uiOption.layers[index]['pointRadiusTo'])) {
      if (sizeValue === 'pointRadiusFrom' && inputValue > this.uiOption.layers[index]['pointRadiusTo']) {
        $event.target.value = this.uiOption.layers[index][sizeValue];
        return;
      } else if (sizeValue === 'pointRadiusTo' && inputValue < this.uiOption.layers[index]['pointRadiusFrom']) {
        $event.target.value = this.uiOption.layers[index][sizeValue];
        return;
      }
    }
    const value = parseFloat(inputValue);
    this.uiOption.layers[index][sizeValue] = value;
    if (sizeValue === 'pointRadiusFrom') {
      this.uiOption.layers[index].pointRadius = value;
    }
    (this.uiOption as UIMapOption).layers[index]['isChangePointRadius'] = true;
    this.uiOption['isChangeStyle'] = true;
    this.applyLayers();
  }

  /**
   * return default index in list
   * @param {Object[]} list
   * @param {string} key
   * @param value
   * @param type
   * @param optionalKey
   * @param optionalValue
   * @returns {number}
   */
  public findIndex(list: object[], key: string, value: any, type: string, optionalKey?: string, optionalValue?: any) {

    if (!_.isUndefined(list) && list.length === 1) return list.length - 1;

    const fieldType: string = 'type';
    // aggregationType 있는경우
    if (optionalKey && optionalValue) {
      return _.findIndex(list, {[key]: value, [optionalKey]: optionalValue, [fieldType]: ShelveFieldType.MEASURE});
    }

    let index = this.index;
    if (this.uiOption.layers.length === 1) index = 0;

    let standardType = this.uiOption.layers[index].color.by;
    if (type === 'thickness') {
      standardType = (this.uiOption.layers[index] as UILineLayer).thickness.by;
    } else if (type === 'size') {
      standardType = (this.uiOption.layers[index] as UISymbolLayer).size.by;
    }

    // cluster 타입일 경우
    if (this.uiOption.layers[index].type === MapLayerType.CLUSTER) {
      if (standardType === MapBy.MEASURE) {
        return 1;
      } else {
        return 0;
      }
    }

    switch (standardType) {
      case MapBy.NONE :
        return _.findIndex(list, {[key]: value});
      case MapBy.DIMENSION :
        return _.findIndex(list, {[key]: value, [fieldType]: ShelveFieldType.DIMENSION});
      case MapBy.MEASURE :
        return _.findIndex(list, {[key]: value, [fieldType]: ShelveFieldType.MEASURE});
      default :
        return _.findIndex(list, {[key]: value});
    }

  }

  /**
   * return same type field list
   * @param list
   * @param fieldTypeValue
   * @param isDefaultValue
   * @returns {T[]}
   */
  public findFieldList(list: object[], fieldTypeValue: string, isDefaultValue?: boolean) {
    const fieldType: string = 'type';

    if (isDefaultValue) {
      const resultFieldList: any = _.filter(list, {[fieldType]: fieldTypeValue});
      resultFieldList.unshift({
        name: this.translateService.instant('msg.page.layer.map.stroke.none'),
        alias: this.translateService.instant('msg.page.layer.map.stroke.none'),
        value: MapBy.NONE
      });
      return resultFieldList;
    }

    return _.filter(list, {[fieldType]: fieldTypeValue});
  }

  /**
   * all layers - set color by
   * @param {Object} data
   * @param layerIndex
   */
  public changeColorBy(data: Field, layerIndex: number) {

    if (this.uiOption.layers[layerIndex].color.column === data.name) return;

    // init color ranges
    this.uiOption.layers[layerIndex].color.ranges = undefined;
    // hide custom color
    this.uiOption.layers[layerIndex].color['settingUseFl'] = false;

    switch (data.type) {
      case 'none' :
        this.uiOption.layers[layerIndex].color.by = MapBy.NONE;
        break;
      case 'dimension' :
        this.uiOption.layers[layerIndex].color.by = MapBy.DIMENSION;
        break;
      case 'measure' :
        this.uiOption.layers[layerIndex].color.by = MapBy.MEASURE;
        break;
      default :
        this.uiOption.layers[layerIndex].color.by = MapBy.NONE;
        break;
    }

    this.uiOption.layers[layerIndex].color.aggregationType = undefined;

    const dimensionList = this.findFieldList(this.fieldList[layerIndex], ShelveFieldType.DIMENSION.toString());
    const measureList = this.findFieldList(this.fieldList[layerIndex], ShelveFieldType.MEASURE.toString());

    // set schema by color type
    if ('dimension' === data.type) {
      this.uiOption.layers[layerIndex].color.schema = 'SC1';

      // only set column when dimension column exsists
      if (dimensionList && dimensionList.length > 0) {
        this.uiOption.layers[layerIndex].color.column = dimensionList[0]['name'];
      } else {
        this.uiOption.layers[layerIndex].color.column = '';
      }

    } else if ('measure' === data.type) {
      this.uiOption.layers[layerIndex].color.schema = 'VC1';

      // only set column when measure column exsists
      if (measureList && measureList.length > 0) {
        this.uiOption.layers[layerIndex].color.column = measureList[0]['name'];
        this.uiOption.layers[layerIndex].color.aggregationType = measureList[0]['aggregationType'];

      } else {
        this.uiOption.layers[layerIndex].color.column = '';
      }

      const colorList = _.cloneDeep(ChartColorList[this.uiOption.layers[layerIndex].color['schema']]) as any;

      // not heatmap => set ranges
      if (MapLayerType.HEATMAP !== this.uiOption.layers[layerIndex].type && MapBy.MEASURE === this.uiOption.layers[layerIndex].color.by) {

        // 공간연산 사용 여부
        if (!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] === true) {
          // 비교 레이어 영역 설정 여부
          if (!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] === true) {
            this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum'] + 1)], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
          } else {
            this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[this.uiOption.analysis['layerNum']], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
          }
        } else {
          this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[layerIndex], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
        }
      }

    } else {
      this.uiOption.layers[layerIndex].color.schema = '#6344ad';
      this.uiOption.layers[layerIndex].color.column = '';
    }

    this.changeColorColumn(data, layerIndex);

  }

  /**
   * all layers - change color column (color by dimension, measure)
   * @param {Object} data
   * @param layerIndex
   */
  public changeColorColumn(data: Field, layerIndex: number) {

    // if (this.uiOption.layers[layerIndex].color.column === data.name && ((this.uiOption.layers[layerIndex].color.by == MapBy.MEASURE && !data.aggregationType) || (data.aggregationType && this.uiOption.layers[layerIndex].color.aggregationType === data.aggregationType))) return;

    this.uiOption.layers[layerIndex].color.column = data.name;

    // measure
    if ('measure' === data.type) {
      this.uiOption.layers[layerIndex].color.aggregationType = data.aggregationType;
      this.uiOption.layers[layerIndex].color.granularity = null;
      // init ranges
      const colorList = _.cloneDeep(ChartColorList[this.uiOption.layers[layerIndex].color['schema']]) as any;

      // 공간연산 사용 여부
      if (!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] === true) {
        // 비교 레이어 영역 설정 여부
        if (!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] === true) {
          // map chart 일 경우 aggregation type 변경시 min/max 재설정 필요
          this.uiOption['layers'][this.uiOption['layerNum']]['isColorOptionChanged'] = true;
          this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum'] + 1)], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
        } else {
          this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[this.uiOption.analysis['layerNum']], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
        }
      } else {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[layerIndex], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
      }

    } else {
      // granularity
      if (data.format) this.uiOption.layers[layerIndex].color.granularity = data.format.unit.toString();
      this.uiOption.layers[layerIndex].color.aggregationType = null;
    }

    this.uiOption.layers[layerIndex]['isColorOptionChanged'] = true;
    this.applyLayers();
  }

  /**
   * line layer - stroke by
   * @param {Object} data
   * @param layerIndex
   */
  public changeStrokeBy(data: Field, layerIndex: number) {

    switch (data.type) {
      case 'none' :
        (this.uiOption.layers[layerIndex] as UILineLayer).thickness.by = MapBy.NONE;
        break;
      case 'dimension' :
        (this.uiOption.layers[layerIndex] as UILineLayer).thickness.by = MapBy.DIMENSION;
        break;
      case 'measure' :
        (this.uiOption.layers[layerIndex] as UILineLayer).thickness.by = MapBy.MEASURE;
        break;
      default :
        (this.uiOption.layers[layerIndex] as UILineLayer).thickness.by = MapBy.NONE;
        break;
    }

    (this.uiOption.layers[layerIndex] as UILineLayer).thickness.aggregationType = undefined;

    if ('measure' === data.type) {

      const measureList = this.findFieldList(this.fieldList[layerIndex], ShelveFieldType.MEASURE.toString());

      // only set column when measure column exsists
      if (measureList && measureList.length > 0) {
        (this.uiOption.layers[layerIndex] as UILineLayer).thickness.column = measureList[0]['name'];
        (this.uiOption.layers[layerIndex] as UILineLayer).thickness.aggregationType = measureList[0]['aggregationType'];
      } else {
        (this.uiOption.layers[layerIndex] as UILineLayer).thickness.column = '';
      }
    } else if (MapBy.NONE === data['value']) {
      (this.uiOption.layers[layerIndex] as UILineLayer).thickness.column = '';
    }

    this.changeStrokeColumn(data, layerIndex);
  }

  /**
   * line layer - stroke column
   * @param {Object} data
   * @param layerIndex
   */
  public changeStrokeColumn(data: Field, layerIndex: number) {

    (this.uiOption.layers[layerIndex] as UILineLayer).thickness.column = data.name;
    (this.uiOption.layers[layerIndex] as UILineLayer).thickness.aggregationType = data.aggregationType;

    this.applyLayers();
  }

  /**
   * line layer - stroke maxValue
   * @param event
   * @param layerIndex
   */
  public changeThickMaxValue(event: any, layerIndex: number) {

    const inputValue = parseFloat(event.target.value);

    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue)) {

      event.target.value = (this.uiOption.layers[layerIndex] as UILineLayer).thickness.maxValue;
      return;
    } else {

      (this.uiOption.layers[layerIndex] as UILineLayer).thickness.maxValue = inputValue;
      this.applyLayers();
    }
  }

  /**
   * symbol layer - change size by
   * @param {Object} data
   * @param layerIndex
   */
  public changeSizeBy(data: Field, layerIndex: number) {

    this.resetPointRadius(layerIndex);
    this.setMinMaxMeasureValue(this.shelf, data, this.data, layerIndex, false);

    switch (data.type) {
      case 'none' :
        (this.uiOption.layers[layerIndex] as UISymbolLayer).size.by = MapBy.NONE;
        break;
      case 'dimension' :
        (this.uiOption.layers[layerIndex] as UISymbolLayer).size.by = MapBy.DIMENSION;
        break;
      case 'measure' :
        (this.uiOption.layers[layerIndex] as UISymbolLayer).size.by = MapBy.MEASURE;
        this.setPointOption();
        this.setMinMaxMeasureValue(this.shelf, data, this.data, layerIndex, true);
        break;
      default :
        (this.uiOption.layers[layerIndex] as UISymbolLayer).size.by = MapBy.NONE;
        break;
    }

    // set column when size by is measure
    if ('measure' === data.type) {

      const measureList = this.findFieldList(this.fieldList[layerIndex], ShelveFieldType.MEASURE.toString());

      if (measureList && measureList.length > 0) {
        (this.uiOption.layers[layerIndex] as UISymbolLayer).size.column = measureList[0]['name'];
      } else {
        (this.uiOption.layers[layerIndex] as UISymbolLayer).size.column = '';
      }
    } else {
      (this.uiOption.layers[layerIndex] as UISymbolLayer).size.column = '';
    }

    this.changeSizeColumn(data, layerIndex);

  }

  /**
   * symbol layer - change size column
   * @param {Object} data
   * @param layerIndex
   */
  public changeSizeColumn(data: Field, layerIndex: number) {

    (this.uiOption.layers[layerIndex] as UISymbolLayer).size.column = data.name;

    this.applyLayers();
  }

  /**
   * color by none - change color
   * @param {string} colorCode
   * @param layerIndex
   */
  public changeByNoneColor(colorCode: string, layerIndex: number) {

    const layerType = this.uiOption.layers[layerIndex].type;
    if (MapLayerType.HEATMAP === layerType) {
      this.uiOption.layers[layerIndex].color['heatMapSchema'] = colorCode;
    } else if (MapLayerType.SYMBOL === layerType) {
      this.uiOption.layers[layerIndex].color['symbolSchema'] = colorCode;
    } else if (MapLayerType.TILE === layerType) {
      this.uiOption.layers[layerIndex].color['tileSchema'] = colorCode;
    } else if (MapLayerType.POLYGON === layerType) {
      this.uiOption.layers[layerIndex].color['polygonSchema'] = colorCode;
    } else if (MapLayerType.CLUSTER === layerType) {
      this.uiOption.layers[layerIndex].color['clusterSchema'] = colorCode;
    }

    this.uiOption.layers[layerIndex].color.schema = colorCode;
    this.uiOption.layers[layerIndex].noneColor = _.cloneDeep(colorCode);

    this.applyLayers();
  }

  /**
   * heatmap layer - change blurs
   * @param _obj
   * @param slider
   * @param {number} index
   */
  public changeBlur(_obj: any, slider: any, index: number) {
    (this.uiOption.layers[index] as UIHeatmapLayer).blur = slider.from;
    this.applyLayers();
  }

  public changeBlurText($event: any, index: number) {

    const inputValue = parseFloat($event.target.value);
    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = this.uiOption.layers[index]['blur'];
      return;
    } else {
      (this.uiOption.layers[index] as UIHeatmapLayer).blur = inputValue;
      this.applyLayers();
    }
  }

  /**
   * heatmap layer - change radius
   * @param _obj
   * @param slider
   * @param index
   */
  public changeRadius(_obj: any, slider: any, index: number) {
    const heatMapLayer = (this.uiOption.layers[index] as UIHeatmapLayer);
    heatMapLayer.heatMapRadius = slider.from;
    heatMapLayer.radius = heatMapLayer.heatMapRadius;
    this.applyLayers();
  }

  public changeRadiusText($event: any, index: number) {
    const inputValue = parseFloat($event.target.value);
    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = this.uiOption.layers[index]['radius'];
      return;
    } else {
      const heatMapLayer = (this.uiOption.layers[index] as UIHeatmapLayer);
      heatMapLayer.heatMapRadius = inputValue;
      heatMapLayer.radius = heatMapLayer.heatMapRadius;
      this.applyLayers();
    }
  }

  /**
   * hexagon layer - change radius
   * @param _obj
   * @param slider
   * @param layerIndex
   */
  public changeHexagonRadius(_obj: any, slider: any, layerIndex: number) {
    const tileLayer = (this.uiOption.layers[layerIndex] as UITileLayer);
    tileLayer.tileRadius = slider.from;
    tileLayer.radius = tileLayer.tileRadius;
    (this.uiOption as UIMapOption).layers[layerIndex]['changeTileRadius'] = true;
    this.applyLayers({});
  }

  /**
   * hexgon layer - change radius text
   * @param event
   * @param layerIndex
   */
  public changeHexagonRadiusText(event: any, layerIndex: number) {

    const inputValue = parseFloat(event.target.value);

    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (this.uiOption.layers[layerIndex] as UITileLayer).radius;
      return;
    } else {
      // when they are not same
      const tileLayer = (this.uiOption.layers[layerIndex] as UITileLayer);
      if (tileLayer.radius !== inputValue) {
        tileLayer.tileRadius = inputValue;
        tileLayer.radius = tileLayer.tileRadius;
        (this.uiOption as UIMapOption).layers[layerIndex]['changeTileRadius'] = true;
        this.applyLayers({});
      }
    }
  }

  /**
   * tile(hexagon) layer - change coverage
   * @param _obj
   * @param slider
   * @param index
   */
  public changeCoverage(_obj: any, slider: any, index: number) {
    (this.uiOption.layers[index] as UITileLayer).coverage = slider.from;
    // this.uiOption.layers[index]['coverage'] = slider.from;
    this.applyLayers();
  }

  public changeCoverageText($event: any, index: number) {
    const inputValue = parseFloat($event.target.value);
    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 1 || inputValue < 0) {
      $event.target.value = this.uiOption.layers[index]['coverage'];
      return;
    } else {
      (this.uiOption.layers[index] as UITileLayer).coverage = inputValue;
      this.applyLayers();
    }
  }

  /**
   * change color
   * @param data
   * @param layerIndex
   */
  public changeColor(data: any, layerIndex: number) {
    const layerType = this.uiOption.layers[layerIndex].type;
    if (MapLayerType.HEATMAP === layerType) {
      this.uiOption.layers[layerIndex].color['heatMapSchema'] = data.colorNum;
    } else if (MapLayerType.SYMBOL === layerType) {
      this.uiOption.layers[layerIndex].color['symbolSchema'] = data.colorNum;
    } else if (MapLayerType.TILE === layerType) {
      this.uiOption.layers[layerIndex].color['tileSchema'] = data.colorNum;
    } else if (MapLayerType.POLYGON === layerType) {
      this.uiOption.layers[layerIndex].color['polygonSchema'] = data.colorNum;
    } else if (MapLayerType.CLUSTER === layerType) {
      this.uiOption.layers[layerIndex].color['clusterSchema'] = data.colorNum;
    }
    this.uiOption.layers[layerIndex].color.schema = data.colorNum;

    let isDimension: boolean = false;
    let isMeasure: boolean = false;
    _.each(this.shelf.layers[layerIndex].fields, (field) => {
      // when logical type is not geo, type is dimension
      if (('user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') === -1)) && _.eq(field.type, ShelveFieldType.DIMENSION)) {
        isDimension = true;
      }
      if (_.eq(field.type, ShelveFieldType.MEASURE)) {
        isMeasure = true;
      }
    });

    if (isDimension) {
      this.uiOption.layers[layerIndex].dimensionColor = _.cloneDeep(data.colorNum);
    }
    if (isMeasure) {
      this.uiOption.layers[layerIndex].measureColor = _.cloneDeep(data.colorNum);
    }

    const colorList = _.cloneDeep(ChartColorList[this.uiOption.layers[layerIndex].color['schema']]) as any;

    // not heatmap => set ranges
    if (MapLayerType.HEATMAP !== this.uiOption.layers[layerIndex].type && MapBy.MEASURE === this.uiOption.layers[layerIndex].color.by) {

      // 공간연산 사용 여부
      if (!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] === true) {
        // 비교 레이어 영역 설정 여부
        if (!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] === true) {
          this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum'] + 1)], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
        } else {
          this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[this.uiOption.analysis['layerNum']], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
        }
      } else {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[layerIndex], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
      }

      // heatmap => init ranges
    } else {
      this.uiOption.layers[layerIndex].color.ranges = undefined;
    }

    this.applyLayers();
  }

  /**
   * find same color index in color list (heatmap, dimension)
   * @param {Object[]} colorList
   * @param layerIndex
   * @returns {any}
   */
  public findColorIndex(colorList: object[], layerIndex: number) {
    if (this.colorTemplate) {
      const obj = _.find(colorList, {colorNum: this.uiOption.layers[layerIndex].color.schema});
      if (obj) {
        // this.changeDetect.detectChanges();
        return obj['index'];
      }
      return 1;
    }
    return 1;
  }

  /**
   * find same color index in color list (measure)
   * @returns {any}
   */
  public findMeasureColorIndex(layerIndex: number) {

    if (this.colorTemplate) {
      let colorList: object[] = [];
      // measure color list 합치기
      colorList = colorList.concat(this.colorTemplate.measureColorList);
      colorList = colorList.concat(this.colorTemplate.measureReverseColorList);

      // 컬러리스트에서 같은 코드값을 가지는경우
      for (const item of colorList) {

        // 코드값이 같은경우
        if (this.uiOption.layers[layerIndex].color.schema.endsWith(item['colorNum'])) {

          return item['index'];
        }
      }
    }

    return 1;
  }

  public isChartColorInverted(layerIndex: number) {
    return this.uiOption.layers[layerIndex].color.schema.indexOf('R') === 0;
  }

  /**
   * line layer - change line style
   */
  public changeLineStyle(lineStyle: MapLineStyle, layerIndex: number) {

    (this.uiOption.layers[layerIndex] as UILineLayer).lineStyle = lineStyle;

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - change outline
   * @param {string} colorCode
   * @param {number} layerIndex
   */
  public changeOutlineColor(colorCode: string, layerIndex: number) {

    (this.uiOption.layers[layerIndex] as UISymbolLayer).outline.color = colorCode;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range (by none)
   */
  public changeNoneRadiusRange(_obj: any, slider: any, layerIndex: number) {

    (this.uiOption.layers[layerIndex] as UISymbolLayer).size.radiusRange[0] = slider.from;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range text (by none)
   * @param event
   * @param {number} layerIndex
   */
  public changeNoneRadiusRangeText(event: any, layerIndex: number) {

    const inputValue = parseFloat(event.target.value);

    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (this.uiOption.layers[layerIndex] as UISymbolLayer).size.radiusRange[0];
      return;
    } else {
      (this.uiOption.layers[layerIndex] as UISymbolLayer).size.radiusRange[0] = inputValue;
      this.applyLayers();
    }
  }

  /**
   * symbol layer - change radius range (by measure)
   */
  public changeMeasureRadiusRange(_obj: any, slider: any, layerIndex: number) {

    (this.uiOption.layers[layerIndex] as UISymbolLayer).size.radiusRange[0] = slider.from;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range text (by measure)
   */
  public changeMeasureRadiusRangeText(event: any, index: number, layerIndex: number) {

    const inputValue = parseFloat(event.target.value);

    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (this.uiOption.layers[layerIndex] as UISymbolLayer).size.radiusRange[index];
      return;
    } else {

      // from
      if (0 === index) {
        (this.uiOption.layers[layerIndex] as UISymbolLayer).size.radiusRange[index] = inputValue;

        // to
      } else if (1 === index) {
        (this.uiOption.layers[layerIndex] as UISymbolLayer).size.radiusRange[index] = inputValue;
      }

      this.applyLayers();
    }
  }

  /**
   * 사용자 색상설정 show
   */
  public changeColorRange(layerIndex: number) {
    // color setting show / hide 값 반대로 설정
    this.uiOption.layers[layerIndex].color.settingUseFl = !this.uiOption.layers[layerIndex].color.settingUseFl;

    const colorOption = this.uiOption.layers[layerIndex].color;

    // custom user color is show, set ranges
    const ranges = this.uiOption.layers[layerIndex].color.settingUseFl ? colorOption.ranges : [];

    // 공간연산 사용 여부
    if (!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] === true) {
      // 비교 레이어 영역 설정 여부
      if (!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] === true) {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum'] + 1)], ChartColorList[colorOption.schema] as any, layerIndex, this.shelf.layers[layerIndex].fields, ranges);
      } else {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[this.uiOption.analysis['layerNum']], ChartColorList[colorOption.schema] as any, layerIndex, this.shelf.layers[layerIndex].fields, ranges);
      }
    } else {
      this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[layerIndex], ChartColorList[colorOption.schema] as any, layerIndex, this.shelf.layers[layerIndex].fields, ranges);
    }

    this.applyLayers();
  }

  /**
   * change range min input
   * @param range
   * @param {number} index
   * @param layerIndex
   */
  public changeRangeMinInput(range: any, index: number, layerIndex: number): void {

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[layerIndex].color.ranges;

    if (!range.gt || isNaN(FormatOptionConverter.getNumberValue(range.gt)) || this.isNumberRegex(range.gt) === false) {
      // set original value
      range.gt = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMin, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = _.cloneDeep(this.uiOption.layers[layerIndex].color.minValue);
    const uiMaxValue = _.cloneDeep(this.uiOption.layers[layerIndex].color.maxValue);

    // 입력가능 최소 / 최대범위 구하기
    const minValue = rangeList[index + 1] ? rangeList[index + 1].gt ? rangeList[index + 1].gt : uiMinValue :
      rangeList[index].gt ? rangeList[index].gt : rangeList[index].lte;
    const maxValue = range.lte;

    // 최대값인경우 (변경불가)
    if (!rangeList[index - 1]) {

      // 최대값보다 큰거나 하위의 최대값보다 값이 작은경우
      if (uiMaxValue < range.gt || rangeList[index + 1].fixMax > range.gt) {
        range.gt = range.fixMin;
      } else {
        range.fixMin = range.gt;
      }
    }
    // 최소값이 입력가능범위를 벗어나는경우
    else if (minValue > range.gt || maxValue < range.gt) {

      // 기존값으로 리턴
      range.gt = range.fixMin;
    } else {
      range.fixMin = range.gt;
    }

    // 하위의 최대값에 같은값 입력
    if (rangeList[index + 1]) {

      rangeList[index + 1].lte = range.gt;
      rangeList[index + 1].fixMax = range.gt;
    }

    // set changed range in list
    rangeList[index] = range;
    this.uiOption.layers[layerIndex].color.ranges = rangeList;
    this.uiOption.layers[layerIndex].color.changeRange = false;

    this.applyLayers();
  }


  /**
   * TOOD range max 입력값 수정시
   * @param range
   * @param index
   * @param layerIndex
   */
  public changeRangeMaxInput(range: any, index: number, layerIndex: number): void {

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[layerIndex].color.ranges;

    if (!range.lte || isNaN(FormatOptionConverter.getNumberValue(range.lte)) || this.isNumberRegex(range.lte) === false) {

      // set original value
      range.lte = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMax, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = _.cloneDeep(this.uiOption.layers[layerIndex].color.minValue);

    // 하위 fixMin값
    const lowerfixMin = rangeList[index + 1] ? (rangeList[index + 1].fixMin) ? rangeList[index + 1].fixMin : rangeList[index + 1].fixMax : null;

    // 최소값인경우
    if (!rangeList[index + 1]) {

      // 사용가능범위인경우
      if (uiMinValue < range.lte && rangeList[index - 1].fixMin > range.lte) {

        range.fixMax = range.lte;
        rangeList[index - 1].gt = range.lte;
      } else {
        // 기존값으로 리턴
        range.lte = range.fixMax;
      }
    }
    // 최대값이 입력가능범위를 벗어나는경우
    else if (range.fixMax < range.lte || (lowerfixMin > range.lte)) {

      // 기존값으로 리턴
      range.lte = range.fixMax;
    } else {
      range.fixMax = range.lte;
    }

    // 상위의 최대값에 같은값 입력
    if (rangeList[index - 1]) {
      rangeList[index - 1].fixMin = range.lte;
      rangeList[index - 1].gt = range.lte;
    }

    // 최소값이 현재 최대값보다 큰경우 최소값과 하위 최대값 변경
    if (null != range.fixMin && rangeList[index + 1] && range.fixMin > range.fixMax) {
      range.gt = range.fixMax;
      rangeList[index + 1].lte = range.fixMax;
      rangeList[index + 1].fixMax = range.fixMax;
    }

    // set changed range in list
    rangeList[index] = range;
    this.uiOption.layers[layerIndex].color.ranges = rangeList;
    this.uiOption.layers[layerIndex].color.changeRange = false;

    this.applyLayers();
  }

  /**
   * return available value range
   */
  public availableRange(currentRnage: any, index: number): void {

    // color range list
    const rangeList = this.rangesViewList;

    let returnString: string = '';

    // case max value
    if (0 === index) {

      returnString += ': ' + currentRnage.fixMin;

      // case min value
    } else if (rangeList.length - 1 === index) {

      returnString += ': ' + currentRnage.fixMax;
    } else {

      // 하위값이 있는경우 하위값의 min값이 있는경우 min값으로 설정 없는경우 최소값 설정
      const availableMin = !rangeList[index + 1] ? null : rangeList[index + 1].fixMin ? rangeList[index + 1].fixMin : rangeList[index + 1].fixMax;
      const availableMax = currentRnage.fixMax;

      if (null !== availableMin) returnString += ': ' + availableMin.toString() + ' ~ ';
      if (null !== availableMax) returnString += availableMax.toString();
    }

    this.availableRangeValue = returnString;
  }

  /**
   * click new color range
   */
  public addNewRange(index: number, layerIndex: number) {

    this.removeInputRangeShowStatus();

    const optionMinValue = _.cloneDeep(this.uiOption.layers[layerIndex].color.minValue);

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[layerIndex].color.ranges;

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = Number(optionMinValue) >= 0 ? 0 : Math.floor(Number(optionMinValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

    // 최대값
    const maxValue = rangeList[index - 1].gt;
    let minValue = rangeList[index].gt ? rangeList[index].gt : uiMinValue;

    // 현재 단계의 최소값 설정
    minValue = minValue + (maxValue - minValue) / 2;

    const formatMinValue = Math.floor(Number(minValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);
    const formatMaxValue = Math.floor(Number(maxValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

    // 하위단계의 최대값 현재 최소값으로 변경
    rangeList[index].lte = formatMinValue;
    rangeList[index].fixMax = formatMinValue;

    const currentColor = rangeList[index].color;

    // 새로운 범위값 추가
    rangeList.splice(index, 0, UI.Range.colorRange(ColorRangeType.SECTION, currentColor, formatMinValue, formatMaxValue, formatMinValue, formatMaxValue));

    this.applyLayers();
  }

  /**
   * when color palette color is changed
   */
  public colorPaletteSelected(layerIndex: number, colorCode: string, item?: any) {

    if (this.uiOption.layers[layerIndex].color.by === MapBy.MEASURE) {

      const index = this.rangesViewList.indexOf(item);
      // 선택된 색상으로 설정
      this.uiOption.layers[layerIndex].color.ranges[index].color = colorCode;
    }

    this.applyLayers();
  }

  /**
   * remove selected color range
   */
  public removeColorRange(_range: ColorRange, index: number, layerIndex: number) {

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[layerIndex].color.ranges;

    // rangeList가 1개 남은경우 삭제불가
    if (1 === rangeList.length) return;

    const upperValue = rangeList[index - 1] ? rangeList[index - 1] : null;
    const lowerValue = rangeList[index + 1] ? rangeList[index + 1] : null;

    // 상위, 하위값 둘다있는경우
    if (upperValue && lowerValue) {
      // 상위범위 최대값
      const upperMaxValue = rangeList[index - 1].lte ? rangeList[index - 1].lte : rangeList[index - 1].gt;
      // 하위범위 최소값
      const lowerMinValue = rangeList[index + 1].gt ? rangeList[index + 1].gt : rangeList[index + 1].lte;

      // 삭제시 상위 최소값, 하위 최대값 자동변경값
      const autoChangeValue = Math.floor(Number((upperMaxValue + lowerMinValue) / 2) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

      // 삭제된 상위값 최소값 변경
      rangeList[index - 1].gt = autoChangeValue;
      rangeList[index - 1].fixMin = autoChangeValue;
      // 삭제된 하위값 최대값 변경
      rangeList[index + 1].lte = autoChangeValue;
      rangeList[index + 1].fixMax = autoChangeValue;
    }

    // 리스트에서 선택된 컬러범위 제거
    rangeList.splice(index, 1);

    this.applyLayers();
  }

  /**
   * equalize custom color range
   */
  public equalColorRange(layerIndex: number): void {

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[layerIndex].color.ranges;

    const colorList = _.cloneDeep(ChartColorList[this.uiOption.layers[layerIndex].color['schema']]) as any;

    // rangeList에서의 색상을 색상리스트에 설정
    rangeList.reverse().forEach((item, index) => {

      colorList[index] = item.color;
    });

    // 공간연산 사용 여부
    if (!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] === true) {
      // 비교 레이어 영역 설정 여부
      if (!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] === true) {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum'] + 1)], colorList, layerIndex, this.shelf.layers[layerIndex].fields, rangeList);
      } else {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[this.uiOption.analysis['layerNum']], colorList, layerIndex, this.shelf.layers[layerIndex].fields, rangeList);
      }
    } else {
      this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[layerIndex], colorList, layerIndex, this.shelf.layers[layerIndex].fields, rangeList);
    }

    this.applyLayers();
  }

  /**
   * toggle color palette
   * @param {boolean} colorListFlag
   */
  public toggleColorPalette(colorListFlag: boolean) {

    this.colorListFlag = colorListFlag;

    // emit
    this.setZIndex.emit(this.colorListFlag);
  }

  /**
   * show / hide color min range span
   */
  public showMinInputColorRange(item, inputShow: boolean, minElement, index?: number) {

    event.stopPropagation();

    // hide other range preview
    this.removeInputRangeShowStatus();

    item.minInputShow = inputShow;

    if (undefined !== index) {
      // show input box
      this.changeDetect.detectChanges();
      this.availableRange(item, index);
      $(minElement).trigger('focus');
    }
  }

  /**
   * show / hide color max range span
   */
  public showMaxInputColorRange(item, inputShow: boolean, maxElement, index?: number) {

    event.stopPropagation();

    // hide other range preview
    this.removeInputRangeShowStatus();

    item.maxInputShow = inputShow;

    if (undefined !== index) {

      // show input box
      this.changeDetect.detectChanges();
      this.availableRange(item, index);
      $(maxElement).trigger('focus');
    }
  }

  /**
   * apply layer ui option
   * @param {object} drawChartParam - call api or not
   */
  private applyLayers(drawChartParam?: object) {

    this.uiOption = (_.extend({}, this.uiOption, {
      layers: this.uiOption.layers
    }) as UIMapOption);

    this.update(drawChartParam);
  }

  /**
   * set by type list by dimension, measure count
   * @param {Shelf} shelf
   */
  private setByType(shelf: Shelf) {

    // set dimension, measure list
    this.setMeasureDimensions(shelf);

  }

  /**
   * set dimension, measure list
   * @param {Shelf} shelf
   */
  private setMeasureDimensions(shelf: Shelf) {

    // nothing left when remove a map-layer
    if (shelf.layers[this.index] == null) return;

    this.fieldList = [];
    let tempList = [];

    for (let index = 0, nMax = shelf.layers.length; index < nMax; index++) {

      const layers = _.cloneDeep(shelf.layers[index].fields);

      const getShelveReturnField = ((shelve: any, _typeList?: ShelveFieldType[]): AbstractField[] => {
        const resultList: any[] = [];
        resultList.push({
          name: this.translateService.instant('msg.page.layer.map.stroke.none'),
          alias: this.translateService.instant('msg.page.layer.map.stroke.none'),
          value: MapBy.NONE
        });

        const uiOption = this.uiOption;
        let analysisCountAlias: string;
        let analysisUse: boolean = false;
        let useChoropleth: boolean = false;
        let isUndefinedAggregationType: boolean = false;
        if (!_.isUndefined(uiOption['analysis']) && !_.isUndefined(uiOption['analysis']['use']) && uiOption['analysis']['use']) {
          analysisUse = true;
          if (uiOption['analysis']['operation']['choropleth']) {
            useChoropleth = true;
            analysisCountAlias = uiOption['analysis']['operation']['aggregation']['column'];
            (_.isUndefined(uiOption['analysis']['operation']['aggregation']['type']) ? isUndefinedAggregationType = true : isUndefinedAggregationType = false);
          }
        }

        shelve.map((item) => {
          if (analysisUse) {
            if (!_.isUndefined(analysisCountAlias) && _.eq(item.type, ShelveFieldType.MEASURE)) {
              if ((!_.isUndefined(item['isCustomField']) && item['isCustomField']) || (!isUndefinedAggregationType && analysisCountAlias === item.name)) {
                item['alias'] = ChartUtil.getAlias(item);
                resultList.push(item);
              }
            } else {
              if (!useChoropleth && item.field && ('user_expr' === item.field.type || item.field.logicalType && -1 === item.field.logicalType.indexOf('GEO'))) {
                item['alias'] = ChartUtil.getAlias(item);
                resultList.push(item);
              }
            }
          } else {
            if (item.field && ('user_expr' === item.field.type || item.field.logicalType && -1 === item.field.logicalType.indexOf('GEO'))) {
              item['alias'] = ChartUtil.getAlias(item);
              resultList.push(item);
            }
          }
        });
        return resultList;
      });

      // point cluster 형태의 경우만
      const symbolList: any[] = [];
      const layerOption = this.uiOption.layers[this.index];
      if (layerOption.type === MapLayerType.CLUSTER && layerOption['clustering']) {
        symbolList.push({
          name: this.translateService.instant('msg.page.layer.map.stroke.none'),
          alias: this.translateService.instant('msg.page.layer.map.stroke.none'),
          value: MapBy.NONE
        });

        // 이미 변수가 선언이 되어 있어 강제로 변경
        const defaultObject: any = {
          aggregationType: null,
          alias: 'count',
          type: 'measure',
          subRole: 'measure',
          name: 'count',
          isCustomField: true,
          field: {
            role: FieldRole.MEASURE,
            logicalType: LogicalType.INTEGER
          }
        };

        symbolList.push(defaultObject);
        this.fieldList.push(symbolList);
        this.fieldMeasureList = symbolList;
        continue;
      }

      tempList = getShelveReturnField(layers);
      this.fieldList.push(tempList);
      this.fieldMeasureList = this.findFieldList(this.fieldList[this.index], 'measure', true);

    }

  }

  /**
   * remove aggregation type (hexagon, line, polygon)
   */
  private removeAggregationType() {
    // add aggregation type in current layer
    const layer = this.shelf.layers[this.index].fields;

    // remove duplicate measure list
    const uniMeasureList = _.uniqBy(layer, 'name');

    for (const item of uniMeasureList) {

      if (item.type === 'measure') {
        delete item.aggregationType;
        item.field.pivot = _.uniq(item.field.pivot);
      }
    }

    this.shelf.layers[this.index].fields = uniMeasureList;
  }

  /**
   * add aggregation type (point, heatmap)
   */
  private addAggregationType() {
    // add aggregation type in current layer
    const layer = this.shelf.layers[this.index].fields;

    for (const item of layer) {
      if (item.type === 'measure') {
        item.aggregationType = AggregationType.SUM;
      }
    }
  }

  /**
   * set color by shelf
   * @param {boolean} aggregationFl use aggregation type
   * @param {number} layerIndex
   * @returns {UILayers}
   */
  private setColorByShelf(aggregationFl: boolean, layerIndex: number): UILayers {

    const shelf: GeoField[] = this.shelf.layers[layerIndex].fields;

    const preference = this.checkFieldPreference(shelf, layerIndex);

    const isNone = preference['isNone'];
    const isMeasure = preference['isMeasure'];
    const isDimension = preference['isDimension'];

    const layer: UILayers = this.uiOption.layers[layerIndex];
    const layerType = layer.type;

    const dimensionList = this.findFieldList(this.fieldList[layerIndex], ShelveFieldType.DIMENSION.toString());
    const measureList = this.findFieldList(this.fieldList[layerIndex], ShelveFieldType.MEASURE.toString());


    ///////////////////////////
    // Color by None
    ///////////////////////////
    if (isNone) {
      layer.color.by = MapBy.NONE;
      if (layerType === MapLayerType.HEATMAP) {
        (_.isUndefined(layer.color.heatMapSchema) || layer.color.heatMapSchema.indexOf('HC') === -1 ? layer.color.heatMapSchema = 'HC1' : layer.color.heatMapSchema);
        layer.color.schema = layer.color.heatMapSchema;
      } else if (layerType === MapLayerType.SYMBOL) {
        (_.isUndefined(layer.color.symbolSchema) || layer.color.symbolSchema.indexOf('#') === -1 ? layer.color.symbolSchema = '#6344ad' : layer.color.symbolSchema);
        layer.color.schema = layer.color.symbolSchema;
      } else if (layerType === MapLayerType.TILE) {
        (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('#') === -1 ? layer.color.tileSchema = '#6344ad' : layer.color.tileSchema);
        layer.color.schema = layer.color.tileSchema;
      } else if (layerType === MapLayerType.POLYGON) {
        (_.isUndefined(layer.color.polygonSchema) || layer.color.polygonSchema.indexOf('#') === -1 ? layer.color.polygonSchema = '#6344ad' : layer.color.polygonSchema);
        layer.color.schema = layer.color.polygonSchema;
      } else if (layerType === MapLayerType.CLUSTER) {
        (_.isUndefined(layer.color.clusterSchema) || layer.color.clusterSchema.indexOf('#') === -1 ? layer.color.clusterSchema = '#6344ad' : layer.color.clusterSchema);
        layer.color.schema = layer.color.clusterSchema;
      } else {
        layer.color.schema = '#6344ad';
      }
      layer.color.column = null;
      layer.color.aggregationType = null;
    }
      ///////////////////////////
      // Color by Measure
      ///////////////////////////
    // remove not isDimension => exceptional case select dimension and remove dimension
    else if (isMeasure) {
      layer.color.by = MapBy.MEASURE;
      if (layerType === MapLayerType.HEATMAP) {
        (_.isUndefined(layer.color.heatMapSchema) || layer.color.heatMapSchema.indexOf('HC') === -1 ? layer.color.heatMapSchema = 'HC1' : layer.color.heatMapSchema);
        layer.color.schema = layer.color.heatMapSchema;
      } else if (layerType === MapLayerType.SYMBOL) {
        (_.isUndefined(layer.color.symbolSchema) || layer.color.symbolSchema.indexOf('VC') === -1 ? layer.color.symbolSchema = 'VC1' : layer.color.symbolSchema);
        layer.color.schema = layer.color.symbolSchema;
      } else if (layerType === MapLayerType.TILE) {
        (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('VC') === -1 ? layer.color.tileSchema = 'VC1' : layer.color.tileSchema);
        layer.color.schema = layer.color.tileSchema;
      } else if (layerType === MapLayerType.POLYGON) {
        (_.isUndefined(layer.color.polygonSchema) || layer.color.polygonSchema.indexOf('VC') === -1 ? layer.color.polygonSchema = 'VC1' : layer.color.polygonSchema);
        layer.color.schema = layer.color.polygonSchema;
      } else if (layerType === MapLayerType.CLUSTER) {
        (_.isUndefined(layer.color.clusterSchema) || layer.color.clusterSchema.indexOf('VC') === -1 ? layer.color.clusterSchema = 'VC1' : layer.color.clusterSchema);
        layer.color.schema = layer.color.clusterSchema;
      } else {
        layer.color.schema = 'VC1';
      }
      layer.color.column = measureList[0]['name'];
      if (aggregationFl) layer.color.aggregationType = measureList[0]['aggregationType'];
      else layer.color.aggregationType = null;
    }
      ///////////////////////////
      // Color by Dimension
      ///////////////////////////
    // hexagon && isDimension => init as none
    else if (MapLayerType.TILE === layerType && isDimension) {
      layer.color.by = MapBy.NONE;
      (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('#') === -1 ? layer.color.tileSchema = '#6344ad' : layer.color.tileSchema);
      layer.color.schema = layer.color.tileSchema;
      layer.color.column = null;
      layer.color.aggregationType = null;
    } else if (isDimension) {
      layer.color.by = MapBy.DIMENSION;
      if (layerType === MapLayerType.SYMBOL) {
        (_.isUndefined(layer.color.symbolSchema) || layer.color.symbolSchema.indexOf('SC') === -1 ? layer.color.symbolSchema = 'SC1' : layer.color.symbolSchema);
        layer.color.schema = layer.color.symbolSchema;
      } else if (layerType === MapLayerType.TILE) {
        (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('SC') === -1 ? layer.color.tileSchema = 'SC1' : layer.color.tileSchema);
        layer.color.schema = layer.color.tileSchema;
      } else if (layerType === MapLayerType.POLYGON) {
        (_.isUndefined(layer.color.polygonSchema) || layer.color.polygonSchema.indexOf('SC') === -1 ? layer.color.polygonSchema = 'SC1' : layer.color.polygonSchema);
        layer.color.schema = layer.color.polygonSchema;
      } else if (layerType === MapLayerType.CLUSTER) {
        (_.isUndefined(layer.color.clusterSchema) || layer.color.clusterSchema.indexOf('SC') === -1 ? layer.color.clusterSchema = 'SC1' : layer.color.clusterSchema);
        layer.color.schema = layer.color.clusterSchema;
      } else {
        layer.color.schema = 'SC1';
      }
      layer.color.column = dimensionList[0]['name'];
      layer.color.aggregationType = null;
      if (dimensionList[0]['format']) layer.color.granularity = dimensionList[0]['format']['unit'].toString();
    }

    return layer;
  }

  /**
   * find preference by shelf
   * @param {UILayers[]} layers
   * @param layerIndex
   * @returns {object}
   */
  private checkFieldPreference(layers: GeoField[], layerIndex: number): object {

    // Find field
    let isNone: boolean = true;
    let isDimension: boolean = false;
    let isMeasure: boolean = false;
    _.each(layers, (field) => {
      if ('user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') === -1)) {
        isNone = false;
      }
      // when logical type is not geo, type is dimension
      if (('user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') === -1)) && _.eq(field.type, ShelveFieldType.DIMENSION)) {
        isDimension = true;
      }
      if (_.eq(field.type, ShelveFieldType.MEASURE)) {
        isMeasure = true;
      }
    });

    if (this.uiOption.layers[layerIndex].type === MapLayerType.CLUSTER) {
      isMeasure = true;
      isNone = false;
      isDimension = false;
    }

    return {isNone: isNone, isDimension: isDimension, isMeasure: isMeasure};
  }

  /**
   * set ranges for view
   * @param {ColorRange[]} ranges
   * @returns {any}
   */
  private setRangeViewByDecimal(ranges: ColorRange[]) {

    if (!ranges || 0 === ranges.length) return;
    // decimal null check
    const decimal = this.uiOption.valueFormat != null ? this.uiOption.valueFormat.decimal : 0;
    // decimal null check
    const commaUseFl = this.uiOption.valueFormat != null ? this.uiOption.valueFormat.useThousandsSep : false;

    const returnList: any = _.cloneDeep(ranges);

    for (const item of returnList) {
      item['fixMax'] = null == item.fixMax ? null : FormatOptionConverter.getDecimalValue(item.fixMax, decimal, commaUseFl) as any;
      item['fixMin'] = null == item.fixMin ? null : FormatOptionConverter.getDecimalValue(item.fixMin, decimal, commaUseFl) as any;
      item['gt'] = null == item.gt ? null : FormatOptionConverter.getDecimalValue(item.gt, decimal, commaUseFl) as any;
      item['lte'] = null == item.lte ? null : FormatOptionConverter.getDecimalValue(item.lte, decimal, commaUseFl) as any;
    }

    return returnList;
  }

  /**
   * parse string to float
   * @param range
   * @returns {any}
   */
  private parseStrFloat(range: any): any {

    range.fixMax = null == range.fixMax ? null : FormatOptionConverter.getNumberValue(range.fixMax);
    range.fixMin = null == range.fixMin ? null : FormatOptionConverter.getNumberValue(range.fixMin);
    range.gt = null == range.gt ? null : FormatOptionConverter.getNumberValue(range.gt);
    range.lte = null == range.lte ? null : FormatOptionConverter.getNumberValue(range.lte);
    return range;
  }

  /**
   * symbol layer - init ui options when change symbol layer type
   */
  private initOptionSymbolLayer(layerIndex: number) {

    // init color ranges
    this.uiOption.layers[layerIndex].color.ranges = undefined;
    // hide custom color
    this.uiOption.layers[layerIndex].color['settingUseFl'] = false;

    // init disable legend
    this.uiOption.legend.auto = true;
  }

  /**
   * get layer index
   */
  private getLayerIndex() {
    (this.rnbMenu.indexOf('1') !== -1 ? this.index = 0 : this.index = (Number(this.rnbMenu.split('mapLayer')[1]) - 1));
  }

  /**
   * 공간연산 / 비교 레이어 영역
   */
  public analysisVisibilityBtn() {
    this.uiOption['analysis']['includeCompareLayer'] = !this.uiOption['analysis']['includeCompareLayer'];
    this.applyLayers({type: EventType.MAP_CHANGE_OPTION});
  }

  /**
   * number validation regex
   * @param value
   */
  private isNumberRegex(value: any): boolean {
    // comma 빼기
    if (value.indexOf(',') !== -1) {
      value = value.replace(/,/g, '');
    }
    return !isNaN(Number(value));
  }

  private removeInputRangeShowStatus() {
    // hide other range preview
    _.each(this.rangesViewList, (item) => {
      if (item['minInputShow']) delete item['minInputShow'];
      if (item['maxInputShow']) delete item['maxInputShow'];
    });
    if (!_.isUndefined(this.uiOption.layers[this.index].color.ranges) && this.uiOption.layers[this.index].color.ranges.length > 0) {
      this.uiOption.layers[this.index].color.ranges.forEach((uiItem) => {
        if (uiItem['minInputShow']) delete uiItem['minInputShow'];
        if (uiItem['maxInputShow']) delete uiItem['maxInputShow'];
      });
    }
  }

  /**
   * cluster type 설정
   */
  private setClusterOption() {
    if (!_.isUndefined(this.uiOption) && !_.isUndefined(this.uiOption['layers']) && this.uiOption['layers'].length > 0) {
      for (let layerIndex = 0; this.uiOption['layers'].length > layerIndex; layerIndex++) {
        // type 관련 설정
        if (this.uiOption['layers'][layerIndex]['type'] === MapLayerType.SYMBOL
          && !_.isUndefined(this.uiOption['layers'][layerIndex]['clustering'])
          && this.uiOption['layers'][layerIndex]['clustering']) {
          this.uiOption['layers'][layerIndex]['type'] = MapLayerType.CLUSTER;
        }
      }
    }
  }

  /**
   * 크기반경 설정
   */
  private setPointOption() {
    if (!_.isUndefined(this.uiOption) && !_.isUndefined(this.uiOption['layers']) && this.uiOption['layers'].length > 0) {
      for (let layerIndex = 0; this.uiOption['layers'].length > layerIndex; layerIndex++) {
        // 크기 반경 관련 설정
        if (this.uiOption['layers'][layerIndex]['type'] === MapLayerType.SYMBOL) {
          // 크기 설정
          if (this.isNullOrUndefined(this.uiOption.layers[layerIndex]['pointRadiusFrom'])) {
            // default size of points are 5 pixel
            this.uiOption.layers[layerIndex]['pointRadiusFrom'] = 5;
            this.uiOption.layers[layerIndex].pointRadius = 5;
          }
          const hasMeasure = this.shelf.layers[layerIndex].fields.find((field) => {
            return field.type === 'measure';
          });
          // Measure 값이 없을 경우
          if (this.shelf['layers'][layerIndex].fields.length <= 1
            || (this.shelf['layers'][layerIndex].fields.length > 1
              && this.isNullOrUndefined(this.uiOption.layers[layerIndex]['pointRadiusTo'])
              && this.isNullOrUndefined(hasMeasure))) {
            delete this.uiOption.layers[layerIndex]['needToCalPointRadius'];
            delete this.uiOption.layers[layerIndex]['pointRadiusTo'];
            delete this.uiOption.layers[layerIndex]['pointRadiusCal'];
            this.uiOption.layers[layerIndex].pointRadius = this.uiOption.layers[layerIndex]['pointRadiusFrom'];
          } else if (this.shelf['layers'][layerIndex].fields.length > 1 && hasMeasure) {
            if (this.isNullOrUndefined(this.uiOption.layers[layerIndex]['pointRadiusTo'])) {
              if (this.uiOption.layers[layerIndex]['pointRadiusFrom'] < 100) {
                this.uiOption.layers[layerIndex]['pointRadiusTo'] = 20;
              } else {
                this.uiOption.layers[layerIndex]['pointRadiusTo'] = 200;
              }
            }
            this.uiOption.layers[layerIndex]['needToCalPointRadius'] = true;
            this.setMinMaxMeasureValue(this.shelf, hasMeasure, this.data, layerIndex, false);
          }
        } else {
          this.resetPointRadius(layerIndex);
        }
      }
    }
  }

  private resetPointRadius(layerIndex: number) {
    this.uiOption.layers[layerIndex].pointRadius = 5;
    this.uiOption.layers[layerIndex]['pointRadiusFrom'] = 5;
    delete this.uiOption.layers[layerIndex]['needToCalPointRadius'];
    delete this.uiOption.layers[layerIndex]['pointRadiusTo'];
    delete this.uiOption.layers[layerIndex]['pointRadiusCal'];
  }

  private setMinMaxMeasureValue(shelf: Shelf, selectedField: Field, data: any, layerIndex: number, isSet: boolean) {
    if (isSet) {
      let alias: string = null;
      shelf.layers.forEach((layer) => {
        layer.fields.forEach((field) => {
          if (field.field.id === selectedField.field.id) {
            alias = selectedField.field.name;
          }
        });
      });
      let minValue = 0;
      let maxValue = 0;
      // 공간연산으로 인한 data index 설정
      const dataIndex = !this.isNullOrUndefined(this.uiOption.analysis) && this.uiOption.analysis.use === true ? this.uiOption.analysis.layerNum : layerIndex;
      if (!_.isUndefined(data[dataIndex].valueRange) && !_.isUndefined(data[dataIndex].valueRange[alias])) {
        // less than 0, set minValue
        minValue = _.cloneDeep(data[dataIndex].valueRange[alias].minValue);
        maxValue = _.cloneDeep(data[dataIndex].valueRange[alias].maxValue);
      }
      this.uiOption.layers[layerIndex]['size'].min = minValue;
      this.uiOption.layers[layerIndex]['size'].max = maxValue;
    } else {
      delete this.uiOption.layers[layerIndex]['size'].min;
      delete this.uiOption.layers[layerIndex]['size'].max;
    }
  }

}
