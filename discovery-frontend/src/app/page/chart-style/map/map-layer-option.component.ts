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
  AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Injector, Input, Output,
  ViewChild
} from '@angular/core';
import { UIMapOption } from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import {
  MapBy,
  MapLayerType,
  MapLineStyle,
  MapSymbolType,
  MapThickness
} from '../../../common/component/chart/option/define/map/map-common';
import * as _ from 'lodash';
import {
  ChartColorList,
  ColorRangeType,
  EventType,
  ShelveFieldType,
  SymbolType
} from '../../../common/component/chart/option/define/common';
import { UISymbolLayer } from '../../../common/component/chart/option/ui-option/map/ui-symbol-layer';
import { MapOutline } from '../../../common/component/chart/option/ui-option/map/ui-outline';
import { UIPolygonLayer } from '../../../common/component/chart/option/ui-option/map/ui-polygon-layer';
import { UILineLayer } from '../../../common/component/chart/option/ui-option/map/ui-line-layer';
import { UIHeatmapLayer } from '../../../common/component/chart/option/ui-option/map/ui-heatmap-layer';
import { UITileLayer } from '../../../common/component/chart/option/ui-option/map/ui-tile-layer';
import { BaseOptionComponent } from '../base-option.component';
import { ColorTemplateComponent } from '../../../common/component/color-picker/color-template.component';
import { Field as AbstractField, Field } from '../../../domain/workbook/configurations/field/field';
import { Shelf } from '../../../domain/workbook/configurations/shelf/shelf';
import { isNullOrUndefined } from 'util';
import { AggregationType } from '../../../domain/workbook/configurations/field/measure-field';
import { ChartUtil } from '../../../common/component/chart/option/util/chart-util';
import { UILayers } from '../../../common/component/chart/option/ui-option/map/ui-layers';
import { GeoField } from '../../../domain/workbook/configurations/field/geo-field';
import { ColorRange } from '../../../common/component/chart/option/ui-option/ui-color';
import { FormatOptionConverter } from '../../../common/component/chart/option/converter/format-option-converter';
import { ColorOptionConverter } from '../../../common/component/chart/option/converter/color-option-converter';
import { OptionGenerator } from '../../../common/component/chart/option/util/option-generator';
import UI = OptionGenerator.UI;
import {MapChartComponent} from "../../../common/component/chart/type/map-chart/map-chart.component";

@Component({
  selector: 'map-layer-option',
  templateUrl: './map-layer-option.component.html'
})
export class MapLayerOptionComponent extends BaseOptionComponent implements AfterViewChecked {

  // current layer index (0-1)
  public index: number = 0;

  @Input('data')
  public data: Object[];

  public rnbMenu: string;

  public ngAfterViewChecked() {
    this.changeDetect.detectChanges();
  }

  @Input('rnbMenu')
  public set setRnbMenu( rnbMenu: string ) {
    this.rnbMenu = rnbMenu;
    this.getLayerIndex();
    if( this.fieldList.length > 0){
      this.initColorList();
    }
  }

  @Input('uiOption')
  public set setUiOption(uiOption: UIMapOption) {

    this.uiOption = uiOption;

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
  }

  // color template popup
  @ViewChild('colorTemplate')
  public colorTemplate: ColorTemplateComponent;

  // set z index
  @Output()
  public setZIndex: EventEmitter<boolean> = new EventEmitter();

  public shelf: Shelf;

  public uiOption: UIMapOption;

  // symbol layer - type list
  public symbolLayerTypes = [{name : this.translateService.instant('msg.page.layer.map.type.point'), value: MapLayerType.SYMBOL},
                             {name : this.translateService.instant('msg.page.layer.map.type.heatmap'), value: MapLayerType.HEATMAP},
                             {name : this.translateService.instant('msg.page.layer.map.type.tile'), value: MapLayerType.TILE}];

  // symbol layer - symbol list
  public symbolLayerSymbols = [{name : this.translateService.instant('msg.page.layer.map.point.circle'), value : MapSymbolType.CIRCLE},
                               {name : this.translateService.instant('msg.page.layer.map.point.square'), value : MapSymbolType.SQUARE},
                               {name : this.translateService.instant('msg.page.layer.map.point.triangle'), value : MapSymbolType.TRIANGLE}];

  // outline - thickness
  public thicknessList = [{value : MapThickness.THIN}, {value : MapThickness.NORMAL}, {value : MapThickness.THICK}];


  // line - storke by, symbol - size by
  public byList = [];

  // all layers - color by
  public colorByList = [];

  // line layer - thickness
  public lineStyleList = [{name : this.translateService.instant('msg.page.layer.map.line.type.solid'), value: MapLineStyle.SOLID},
                          {name : this.translateService.instant('msg.page.layer.map.line.type.dotted'), value: MapLineStyle.DOTTED},
                          {name : this.translateService.instant('msg.page.layer.map.line.type.dashed'), value: MapLineStyle.DASHED}];

  // show / hide setting for color picker
  public colorListFlag: boolean = false;

  // dimension, measure List
  public fieldList = [];

  // range list for view
  public rangesViewList = [];

  public availableRangeValue: string;

  // min / max
  public minValue: string;
  public maxValue: string;

  // 공간연산
  @ViewChild(MapChartComponent)
  public mapChartCompnent: MapChartComponent;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /**
   * all layers - change layer name
   */
  public changeLayerName(name : string, layerIndex : number) {

    this.uiOption.layers[layerIndex].name = name;

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * symbol layer - change layer type
   * @param {MapLayerType} layerType
   */
  public changeSymbolLayerType(layerType : MapLayerType, layerIndex : number) {

    if (this.uiOption.layers[layerIndex].type === layerType) return;

    // deep copy layer type
    let cloneLayerType = _.cloneDeep(this.uiOption.layers[layerIndex].type);

    let dimensionList = this.fieldList[layerIndex].dimensionList;
    let measureList = this.fieldList[layerIndex].measureList;

    let layer : UILayers = this.uiOption.layers[layerIndex];

    // 기존 레이어 타입 설정 셋팅
    const preLayerType : MapLayerType = cloneLayerType;
    let cloneLayer = _.cloneDeep( layer );
    if (MapLayerType.HEATMAP === preLayerType) {
      layer.heatMapRadius = cloneLayer.heatMapRadius;
      layer.color.heatMapSchema = cloneLayer.color.schema;
      layer.color.heatMapTransparency = cloneLayer.color.transparency;
    } else if (MapLayerType.SYMBOL === preLayerType) {
      layer.color.symbolSchema = cloneLayer.color.schema;
      layer.color.symbolTransparency = cloneLayer.color.transparency;
    } else if (MapLayerType.TILE === preLayerType) {
      layer.tileRadius = cloneLayer.tileRadius;
      layer.color.tileSchema = cloneLayer.color.schema;
      layer.color.tranTransparency = cloneLayer.color.transparency;
    } else if (MapLayerType.POLYGON === preLayerType) {
      layer.color.polygonSchema = cloneLayer.color.schema;
      layer.color.tranTransparency = cloneLayer.color.transparency;
    }

    // change layer type
    this.uiOption.layers[layerIndex].type = layerType;

    // init color, legend
    this.initOptionSymbolLayer(layerIndex);

    // change color type by layer type
    if (MapLayerType.HEATMAP === layerType) {

      layer = this.setColorByShelf(false, layerIndex);
      if( isNullOrUndefined(layer.color.heatMapTransparency) ) {
        layer.color.heatMapTransparency = 10;
      }
      layer.color.transparency = layer.color.heatMapTransparency;
      if( isNullOrUndefined(layer['blur']) ) {
        layer['blur'] = 20;
      }
      if( isNullOrUndefined(layer.heatMapRadius) ) {
        layer.heatMapRadius = 20;
      }
      layer['radius'] = layer.heatMapRadius;

      measureList = this.fieldList[layerIndex]['measureList'];

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
      if( isNullOrUndefined(layer.color.symbolTransparency) ) {
        layer.color.symbolTransparency = 10;
      }
      layer.color.transparency = layer.color.symbolTransparency;

      // add color by dimension list
      if (dimensionList.length > 0 && -1 === _.findIndex(this.colorByList, ( item ) => { return item.value === MapBy.DIMENSION; })) {
        this.colorByList.splice(1, 0, {name : this.translateService.instant('msg.page.li.color.dimension'), value : MapBy.DIMENSION});
      }

      // remove measure aggregation type in shelf
      this.removeAggregationType();

    } else if (MapLayerType.TILE === layerType) {
      // set color by shelf
      layer = this.setColorByShelf(true, layerIndex);
      if( isNullOrUndefined(layer.color.tranTransparency) ) {
        layer.color.tranTransparency = 10;
      }
      layer.color.transparency = layer.color.tranTransparency;
      if( isNullOrUndefined(layer.tileRadius) ) {
        layer.tileRadius = 20;
      }
      layer['radius'] = layer.tileRadius;

      // remove color by dimension list
      _.remove(this.colorByList, ( item ) => { return item.value === MapBy.DIMENSION; });

      // if( isNullOrUndefined(this.uiOption.layers[this.index]['coverage']) ) {
      //   this.uiOption.layers[this.index]['coverage'] = 0.9;
      // }

      // add measure aggregation type in shelf
      this.addAggregationType();
    }

    // set measure, dimension list by layer type
    this.setMeasureDimensions(this.shelf);

    // apply layer ui option
    this.applyLayers({type : EventType.MAP_CHANGE_OPTION});
  }

  /**
   * symbol layer - change symbol type
   * @param {SymbolType} symbolType
   */
  public changeSymbolType(symbolType: MapSymbolType, layerIndex : number) {

    (<UISymbolLayer>this.uiOption.layers[layerIndex]).symbol = symbolType;

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * all layers - change transparency
   * @param obj
   * @param slider
   * @param {number} index
   */
  public changeTransparency(obj: any, slider: any, index: number) {

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
    }
    this.applyLayers();
  }

  /**
   * all layers - change transparency
   * @param $event
   * @param {number} index
   */
  public changeTransparencyText($event: any, index: number) {

    let inputValue = parseFloat($event.target.value);

    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
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
      }
      this.applyLayers();
    }
  }

  /**
   * symbol, polygon layer - toggle outline
   * @param {MapOutline} outline
   */
  public toggleOutline(outline: MapOutline, layerIndex : number) {

    if (outline) {
      outline = null;
    } else outline = <any>{color : '#4f4f4f', thickness : MapThickness.NORMAL};

    if (MapLayerType.SYMBOL === this.uiOption.layers[layerIndex].type) {
      (<UISymbolLayer>this.uiOption.layers[layerIndex]).outline = outline;

    } else if (MapLayerType.POLYGON === this.uiOption.layers[layerIndex].type) {
      (<UIPolygonLayer>this.uiOption.layers[layerIndex]).outline = outline;
    }

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - change thickness
   * @param {MapThickness} thickness
   */
  public changeThick(thickness: MapThickness, layerIndex : number) {

    if (MapLayerType.SYMBOL === this.uiOption.layers[layerIndex].type) {
      (<UISymbolLayer>this.uiOption.layers[layerIndex]).outline.thickness = thickness;

    } else if (MapLayerType.POLYGON === this.uiOption.layers[layerIndex].type) {
      (<UIPolygonLayer>this.uiOption.layers[layerIndex]).outline.thickness = thickness;
    }

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - clustering
   */
  public isEnableClustering(layerIndex : number) {
    (<UISymbolLayer>this.uiOption.layers[layerIndex]).clustering = !(<UISymbolLayer>this.uiOption.layers[layerIndex]).clustering;
    this.applyLayers({type : EventType.MAP_CHANGE_OPTION});
  }

  public changeClustering(obj: any, $event: any, index: number) {
    this.uiOption.layers[index]['coverage']= $event.from;
    (<UIMapOption>this.uiOption).layers[index]['changeCoverage'] = true;
    this.applyLayers({type : EventType.MAP_CHANGE_OPTION});
  }

  public changeClusteringText($event: any, index: number) {
    let inputValue = parseFloat($event.target.value);
    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = (<UISymbolLayer>this.uiOption.layers[index])['coverage'];
      return;
    } else {
      (<UISymbolLayer>this.uiOption.layers[index])['coverage'] = inputValue;
      (<UIMapOption>this.uiOption).layers[index]['changeCoverage'] = true;
      this.applyLayers({type : EventType.MAP_CHANGE_OPTION});
    }
  }

  /**
   * return default index in list
   * @param {Object[]} list
   * @param {string} key
   * @param value
   * @returns {number}
   */
  public findIndex(list: Object[], key: string, value: any, optionalKey?: string, optionalValue?: any) {

    if (optionalKey && optionalValue) {
      return _.findIndex(list, {[key] : value, [optionalKey]: optionalValue});
    }
    return _.findIndex(list, {[key] : value});
  }

  /**
   * all layers - set color by
   * @param {Object} data
   */
  public changeColorBy(data: Object, layerIndex : number) {

    if (this.uiOption.layers[layerIndex].color.by === data['value']) return;

    // init color ranges
    this.uiOption.layers[layerIndex].color.ranges = undefined;
    // hide custom color
    this.uiOption.layers[layerIndex].color['settingUseFl'] = false;

    this.uiOption.layers[layerIndex].color.by = data['value'];

    this.uiOption.layers[layerIndex].color.aggregationType = undefined;

    let dimensionList = this.fieldList[layerIndex].dimensionList;
    let measureList = this.fieldList[layerIndex].measureList;

    // set schema by color type
    if (MapBy.DIMENSION === data['value']) {
      this.uiOption.layers[layerIndex].color.schema = 'SC1';

      // only set column when dimension column exsists
      if (dimensionList && dimensionList.length > 0) {
        this.uiOption.layers[layerIndex].color.column = dimensionList[0]['name'];
      } else {
        this.uiOption.layers[layerIndex].color.column = '';
      }

    } else if (MapBy.MEASURE === data['value']) {
      this.uiOption.layers[layerIndex].color.schema = 'VC1';

      // only set column when measure column exsists
      if (measureList && measureList.length > 0) {
        this.uiOption.layers[layerIndex].color.column = measureList[0]['name'];
        this.uiOption.layers[layerIndex].color.aggregationType = measureList[0]['aggregationType'];

      } else {
        this.uiOption.layers[layerIndex].color.column = '';
      }

      const colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[layerIndex].color['schema']]);

      // not heatmap => set ranges
      if (MapLayerType.HEATMAP !== this.uiOption.layers[layerIndex].type && MapBy.MEASURE === this.uiOption.layers[layerIndex].color.by) {

        // 공간연산 사용 여부
        if(!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] == true ) {
          // 비교 레이어 영역 설정 여부
          if(!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] == true) {
            this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum']+1)], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
          } else {
            this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[this.uiOption.analysis['layerNum']], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
          }
        } else {
          this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[layerIndex], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
        }
      }

    } else if (MapBy.NONE === data['value']) {
      this.uiOption.layers[layerIndex].color.schema = '#6344ad';
      this.uiOption.layers[layerIndex].color.column = '';
    }

    this.applyLayers();
  }

  /**
   * all layers - change color column (color by dimension, measure)
   * @param {Object} data
   */
  public changeColorColumn(data: Field, layerIndex : number) {

    if (this.uiOption.layers[layerIndex].color.column === data.name && (!data.aggregationType || (data.aggregationType && this.uiOption.layers[layerIndex].color.aggregationType === data.aggregationType))) return;

    this.uiOption.layers[layerIndex].color.column = data.name;

    // measure
    if ('measure' === data.type) {
      this.uiOption.layers[layerIndex].color.aggregationType = data.aggregationType;
      this.uiOption.layers[layerIndex].color.granularity = null;
      // init ranges
      const colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[layerIndex].color['schema']]);

      // 공간연산 사용 여부
      if(!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] == true ) {
        // 비교 레이어 영역 설정 여부
        if(!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] == true) {
          // map chart 일 경우 aggregation type 변경시 min/max 재설정 필요
          this.uiOption['layers'][this.uiOption['layerNum']]['isColorOptionChanged'] = true;
          this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum']+1)], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
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

    this.applyLayers();
  }

  /**
   * line layer - stroke by
   * @param {Object} data
   */
  public changeStrokeBy(data: Object, layerIndex : number) {

    (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.by = data['value'];

    (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.aggregationType = undefined;

    if (MapBy.MEASURE === data['value']) {

      let measureList = this.fieldList[layerIndex].measureList;

      // only set column when measure column exsists
      if (measureList && measureList.length > 0) {
        (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.column = measureList[0]['name'];
        (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.aggregationType = measureList[0]['aggregationType'];
      } else {
        (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.column = '';
      }
    } else if (MapBy.NONE === data['value']) {
      (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.column = '';
    }

    this.applyLayers();
  }

  /**
   * line layer - stroke column
   * @param {Object} data
   */
  public changeStrokeColumn(data: Object, layerIndex : number) {

    (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.column = data['name'];
    (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.aggregationType = data['aggregationType'];

    this.applyLayers();
  }

  /**
   * line layer - stroke maxValue
   * @param {number} maxValue
   */
  public changeThickMaxValue(event: any, layerIndex : number) {

    const inputValue = parseFloat(event.target.value);

    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue)) {

      event.target.value = (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.maxValue;
      return;
    } else {

      (<UILineLayer>this.uiOption.layers[layerIndex]).thickness.maxValue = inputValue;
      this.applyLayers();
    }
  }

  /**
   * symbol layer - change size by
   * @param {Object} data
   */
  public changeSizeBy(data: Object, layerIndex : number) {

    (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.by = data['value'];

    // set column when size by is measure
    if (MapBy.MEASURE === data['value']) {

      let measureList = this.fieldList[layerIndex].measureList;

      if (measureList && measureList.length > 0) {
        (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.column = measureList[0]['name'];
      } else {
        (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.column = '';
      }
    } else {
      (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.column = '';
    }

    this.applyLayers();
  }

  /**
   * symbol layer - change size column
   * @param {Object} data
   */
  public changeSizeColumn(data: Field, layerIndex : number) {

    (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.column = data.name;

    this.applyLayers();
  }

  /**
   * color by none - change color
   * @param {string} colorCode
   */
  public changeByNoneColor(colorCode: string, layerIndex : number) {

    let layerType = this.uiOption.layers[layerIndex].type;
    if (MapLayerType.HEATMAP === layerType) {
      this.uiOption.layers[layerIndex].color['heatMapSchema'] = colorCode;
    } else if (MapLayerType.SYMBOL === layerType) {
      this.uiOption.layers[layerIndex].color['symbolSchema'] = colorCode;
    } else if (MapLayerType.TILE === layerType) {
      this.uiOption.layers[layerIndex].color['tileSchema'] = colorCode;
    } else if (MapLayerType.POLYGON === layerType) {
      this.uiOption.layers[layerIndex].color['polygonSchema'] = colorCode;
    }

    this.uiOption.layers[layerIndex].color.schema = colorCode;

    this.applyLayers();
  }

  /**
   * heatmap layer - change blurs
   * @param obj
   * @param slider
   * @param {number} index
   */
  public changeBlur(obj: any, slider: any, index: number) {
    (<UIHeatmapLayer>this.uiOption.layers[index]).blur = slider.from;
    this.applyLayers();
  }
  public changeBlurText($event: any, index: number) {

    let inputValue = parseFloat($event.target.value);
    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = this.uiOption.layers[index]['blur'];
      return;
    } else {
      (<UIHeatmapLayer>this.uiOption.layers[index]).blur = inputValue;
      this.applyLayers();
    }
  }

  /**
   * heatmap layer - change radius
   * @param obj
   * @param slider
   */
  public changeRadius(obj: any, slider: any, index: number) {
    let heatMapLayer = (<UIHeatmapLayer>this.uiOption.layers[index]);
    heatMapLayer.heatMapRadius = slider.from;
    heatMapLayer.radius = heatMapLayer.heatMapRadius;
    this.applyLayers();
  }
  public changeRadiusText($event: any, index: number) {
    let inputValue = parseFloat($event.target.value);
    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = this.uiOption.layers[index]['radius'];
      return;
    } else {
      let heatMapLayer = (<UIHeatmapLayer>this.uiOption.layers[index]);
      heatMapLayer.heatMapRadius = inputValue;
      heatMapLayer.radius = heatMapLayer.heatMapRadius;
      this.applyLayers();
    }
  }

  /**
   * hexagon layer - change radius
   * @param obj
   * @param slider
   */
  public changeHexagonRadius(obj: any, slider: any, layerIndex : number) {
    let tileLayer = (<UITileLayer>this.uiOption.layers[layerIndex]);
    tileLayer.tileRadius = slider.from;
    tileLayer.radius = tileLayer.tileRadius;
    (<UIMapOption>this.uiOption).layers[layerIndex]['changeTileRadius'] = true;
    this.applyLayers({});
  }

  /**
   * hexgon layer - change radius text
   * @param event
   */
  public changeHexagonRadiusText(event: any, layerIndex : number) {

    let inputValue = parseFloat(event.target.value);

    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (<UITileLayer>this.uiOption.layers[layerIndex]).radius;
      return;
    } else {
      // when they are not same
      let tileLayer = (<UITileLayer>this.uiOption.layers[layerIndex]);
      if (tileLayer.radius !== inputValue) {
        tileLayer.tileRadius = inputValue;
        tileLayer.radius = tileLayer.tileRadius;
        (<UIMapOption>this.uiOption).layers[layerIndex]['changeTileRadius'] = true;
        this.applyLayers({});
      }
    }
  }

  /**
   * tile(hexagon) layer - change coverage
   * @param obj
   * @param slider
   */
  public changeCoverage(obj: any, slider: any, index: number) {
    (<UITileLayer>this.uiOption.layers[index]).coverage = slider.from;
    // this.uiOption.layers[index]['coverage'] = slider.from;
    this.applyLayers();
  }
  public changeCoverageText($event: any, index: number) {
    let inputValue = parseFloat($event.target.value);
    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 1 || inputValue < 0) {
      $event.target.value = this.uiOption.layers[index]['coverage'];
      return;
    } else {
      (<UITileLayer>this.uiOption.layers[index]).coverage = inputValue;
      this.applyLayers();
    }
  }

  /**
   * change color
   * @param data
   */
  public changeColor(data: any, layerIndex : number) {

    let layerType = this.uiOption.layers[layerIndex].type;
    if (MapLayerType.HEATMAP === layerType) {
      this.uiOption.layers[layerIndex].color['heatMapSchema'] = data.colorNum;
    } else if (MapLayerType.SYMBOL === layerType) {
      this.uiOption.layers[layerIndex].color['symbolSchema'] = data.colorNum;
    } else if (MapLayerType.TILE === layerType) {
      this.uiOption.layers[layerIndex].color['tileSchema'] = data.colorNum;
    } else if (MapLayerType.POLYGON === layerType) {
      this.uiOption.layers[layerIndex].color['polygonSchema'] = data.colorNum;
    }
    this.uiOption.layers[layerIndex].color.schema = data.colorNum;

    const colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[layerIndex].color['schema']]);

    // not heatmap => set ranges
    if (MapLayerType.HEATMAP !== this.uiOption.layers[layerIndex].type && MapBy.MEASURE === this.uiOption.layers[layerIndex].color.by) {

      // 공간연산 사용 여부
      if(!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] == true ) {
        // 비교 레이어 영역 설정 여부
        if(!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] == true) {
          this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum']+1)], colorList, layerIndex, this.shelf.layers[layerIndex].fields, []);
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
   * @returns {any}
   */
  public findColorIndex(colorList: Object[], layerIndex : number) {
    if (this.colorTemplate) {
      let obj = _.find(colorList, {colorNum : this.uiOption.layers[layerIndex].color.schema});
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
  public findMeasureColorIndex(layerIndex : number) {
    if (this.colorTemplate) {
      let obj = _.find(this.colorTemplate.measureColorList, {colorNum : this.uiOption.layers[layerIndex].color.schema});

      if (obj) {
        return obj['index'];
      } else {
        return _.find(this.colorTemplate.measureReverseColorList, {colorNum : this.uiOption.layers[layerIndex].color.schema})['index'];
      }
    }
    return 1;
  }

  /**
   * line layer - change line style
   */
  public changeLineStyle(lineStyle: MapLineStyle, layerIndex : number) {

    (<UILineLayer>this.uiOption.layers[layerIndex]).lineStyle = lineStyle;

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - change outline
   * @param {string} colorCode
   */
  public changeOutlineColor(colorCode: string, layerIndex : number) {

    (<UISymbolLayer>this.uiOption.layers[layerIndex]).outline.color = colorCode;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range (by none)
   */
  public changeNoneRadiusRange(obj: any, slider: any, layerIndex : number) {

    (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.radiusRange[0] = slider.from;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range text (by none)
   * @param event
   * @param {number} index
   */
  public changeNoneRadiusRangeText(event: any, layerIndex : number) {

    let inputValue = parseFloat(event.target.value);

    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.radiusRange[0];
      return;
    } else {
      (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.radiusRange[0] = inputValue;
      this.applyLayers();
    }
  }

  /**
   * symbol layer - change radius range (by measure)
   */
  public changeMeasureRadiusRange(obj: any, slider: any, layerIndex : number) {

    (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.radiusRange[0] = slider.from;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range text (by measure)
   */
  public changeMeasureRadiusRangeText(event: any, index: number, layerIndex : number) {

    let inputValue = parseFloat(event.target.value);

    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.radiusRange[index];
      return;
    } else {

      // from
      if (0 === index) {
        (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.radiusRange[index] = inputValue;

        // to
      } else if (1 === index) {
        (<UISymbolLayer>this.uiOption.layers[layerIndex]).size.radiusRange[index] = inputValue;
      }

      this.applyLayers();
    }
  }

  /**
   * 사용자 색상설정 show
   */
  public changeColorRange(layerIndex : number) {
    // color setting show / hide 값 반대로 설정
    this.uiOption.layers[layerIndex].color.settingUseFl = !this.uiOption.layers[layerIndex].color.settingUseFl;

    let colorOption = this.uiOption.layers[layerIndex].color;

    // custom user color is show, set ranges
    const ranges = this.uiOption.layers[layerIndex].color.settingUseFl ? colorOption.ranges : [];

    // 공간연산 사용 여부
    if(!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] == true ) {
      // 비교 레이어 영역 설정 여부
      if(!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] == true) {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum']+1)], <any>ChartColorList[colorOption.schema], layerIndex, this.shelf.layers[layerIndex].fields, ranges);
      } else {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[this.uiOption.analysis['layerNum']], <any>ChartColorList[colorOption.schema], layerIndex, this.shelf.layers[layerIndex].fields, ranges);
      }
    } else {
      this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[layerIndex], <any>ChartColorList[colorOption.schema], layerIndex, this.shelf.layers[layerIndex].fields, ranges);
    }

    this.applyLayers();
  }

  /**
   * change range min input
   * @param range
   * @param {number} index
   */
  public changeRangeMinInput(range: any, index: number, layerIndex : number): void {

    // 색상 범위리스트
    let rangeList = this.uiOption.layers[layerIndex].color.ranges;

    if (!range.gt || isNaN(FormatOptionConverter.getNumberValue(range.gt)) || this.isNumberRegex(range.gt) == false) {
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
    let minValue = rangeList[index + 1] ? rangeList[index + 1].gt ? rangeList[index + 1].gt : uiMinValue :
      rangeList[index].gt ? rangeList[index].gt : rangeList[index].lte;
    let maxValue = range.lte;

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

    this.applyLayers();
  }


  /**
   * TOOD range max 입력값 수정시
   * @param range
   * @param index
   */
  public changeRangeMaxInput(range: any, index: number, layerIndex : number): void {

    // 색상 범위리스트
    let rangeList = this.uiOption.layers[layerIndex].color.ranges;

    if (!range.lte || isNaN(FormatOptionConverter.getNumberValue(range.lte)) || this.isNumberRegex(range.lte) == false) {

      // set original value
      range.lte = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMax, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = _.cloneDeep(this.uiOption.layers[layerIndex].color.minValue);

    // 하위 fixMin값
    const lowerfixMin = rangeList[index + 1] ?(rangeList[index + 1].fixMin) ? rangeList[index + 1].fixMin : rangeList[index + 1].fixMax : null;

    // 최소값인경우
    if (!rangeList[index + 1]) {

      // 사용가능범위인경우
      if (uiMinValue < range.lte && rangeList[index - 1].fixMin > range.lte) {

        range.fixMax = range.lte;
        rangeList[index-1].gt = range.lte;
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
    if (0 == index) {

      returnString += ': ' + currentRnage.fixMin;

    // case min value
    } else if (rangeList.length - 1 == index) {

      returnString += ': ' + currentRnage.fixMax;
    }
    else {

      // 하위값이 있는경우 하위값의 min값이 있는경우 min값으로 설정 없는경우 최소값 설정
      let availableMin = !rangeList[index + 1] ? null : rangeList[index + 1].fixMin ? rangeList[index + 1].fixMin : rangeList[index + 1].fixMax;
      let availableMax = currentRnage.fixMax;

      if (null !== availableMin) returnString += ': ' + availableMin.toString() + ' ~ ';
      if (null !== availableMax) returnString += availableMax.toString();
    }

    this.availableRangeValue = returnString;
  }

  /**
   * click new color range
   */
  public addNewRange(index: number, layerIndex : number) {

    this.removeInputRangeShowStatus();

    const optionMinValue = _.cloneDeep(this.uiOption.layers[layerIndex].color.minValue);

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[layerIndex].color.ranges;

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = Number(optionMinValue) >= 0 ? 0 : Math.floor(Number(optionMinValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

    // 최대값
    let maxValue = rangeList[index - 1].gt;
    let minValue = rangeList[index].gt ? rangeList[index].gt : uiMinValue;

    // 현재 단계의 최소값 설정
    minValue = minValue + (maxValue - minValue) / 2;

    const formatMinValue =  Math.floor(Number(minValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);
    const formatMaxValue =  Math.floor(Number(maxValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

    // 하위단계의 최대값 현재 최소값으로 변경
    rangeList[index].lte = formatMinValue;
    rangeList[index].fixMax = formatMinValue;

    let currentColor = rangeList[index].color;

    // 새로운 범위값 추가
    rangeList.splice(index, 0, UI.Range.colorRange(ColorRangeType.SECTION, currentColor, formatMinValue, formatMaxValue, formatMinValue, formatMaxValue));

    this.applyLayers();
  }

  /**
   * when color palette color is changed
   */
  public colorPaletteSelected(layerIndex : number, colorCode: string, item?: any) {

    if (this.uiOption.layers[layerIndex].color.by == MapBy.MEASURE) {

      const index = this.rangesViewList.indexOf(item);
      // 선택된 색상으로 설정
      this.uiOption.layers[layerIndex].color.ranges[index].color = colorCode;
    }

    this.applyLayers();
  }

  /**
   * remove selected color range
   */
  public removeColorRange(range: ColorRange, index: number, layerIndex :number) {

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[layerIndex].color.ranges;

    // rangeList가 1개 남은경우 삭제불가
    if (1 == rangeList.length) return;

    let upperValue = rangeList[index - 1] ? rangeList[index - 1] : null;
    let lowerValue = rangeList[index + 1] ? rangeList[index + 1] : null;

    // 상위, 하위값 둘다있는경우
    if (upperValue && lowerValue) {
      // 상위범위 최대값
      let upperMaxValue = rangeList[index - 1].lte ? rangeList[index - 1].lte : rangeList[index - 1].gt;
      // 하위범위 최소값
      let lowerMinValue = rangeList[index + 1].gt ? rangeList[index + 1].gt : rangeList[index + 1].lte;

      // 삭제시 상위 최소값, 하위 최대값 자동변경값
      let autoChangeValue = Math.floor(Number((upperMaxValue + lowerMinValue) / 2) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);


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
  public equalColorRange(layerIndex : number): void {

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[layerIndex].color.ranges;

    let colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[layerIndex].color['schema']]);

    // rangeList에서의 색상을 색상리스트에 설정
    rangeList.reverse().forEach((item, index) => {

      colorList[index] = item.color;
    });

    // 공간연산 사용 여부
    if(!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] == true ) {
      // 비교 레이어 영역 설정 여부
      if(!_.isUndefined(this.uiOption.analysis['includeCompareLayer']) && this.uiOption.analysis['includeCompareLayer'] == true) {
        this.uiOption.layers[layerIndex].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[(this.uiOption.analysis['layerNum']+1)], colorList, layerIndex, this.shelf.layers[layerIndex].fields, rangeList);
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
   * @param {Object} drawChartParam - call api or not
   */
  private applyLayers(drawChartParam?: Object) {

    this.uiOption = <UIMapOption>_.extend({}, this.uiOption, {
      layers: this.uiOption.layers
    });

    this.update(drawChartParam);
  }

  /**
   * set by type list by dimension, measure count
   * @param {Shelf} shelf
   */
  private setByType(shelf: Shelf) {

    // set dimension, measure list
    this.setMeasureDimensions(shelf);

    // init list
    this.initColorList();

  }

  /**
   * set dimension, measure list
   * @param {GeoField[]} layers
   */
  private setMeasureDimensions(shelf: Shelf) {

    // nothing left when remove a map-layer
    if(shelf.layers[this.index] == null) return;

    this.fieldList = [];
    let tempObj : object = {};
    let measureList: Field[];
    let dimensionList: Field[];

    for(let index=0; index < shelf.layers.length; index++) {

      let layers = _.cloneDeep(shelf.layers[index].fields);

      const getShelveReturnField = ((shelve: any, typeList: ShelveFieldType[]): AbstractField[] => {
        const resultList: AbstractField[] = [];

        let uiOption = this.uiOption;
        let analysisCountAlias : string;
        let isUndefinedAggregationType : boolean = false;
        if( !_.isUndefined(uiOption['analysis']) && !_.isUndefined(uiOption['analysis']['use']) && uiOption['analysis']['use'] ) {
          if( uiOption['analysis']['operation']['choropleth'] ) {
            analysisCountAlias = uiOption['analysis']['operation']['aggregation']['column'];
            (_.isUndefined(uiOption['analysis']['operation']['aggregation']['type']) ? isUndefinedAggregationType = true : isUndefinedAggregationType = false );
          }
        }

        shelve.map((item) => {
          if( !_.isUndefined(analysisCountAlias) && _.eq(item.type, typeList[0]) && _.eq(item.type, ShelveFieldType.MEASURE) ){
            if( (!_.isUndefined(item['isCustomField']) && item['isCustomField'] ) || ( !isUndefinedAggregationType && analysisCountAlias == item.name) ){
              item['alias'] = ChartUtil.getAlias(item);
              resultList.push(item);
            }
          } else {
            if ((_.eq(item.type, typeList[0]) || _.eq(item.type, typeList[1])) && (item.field && ('user_expr' === item.field.type || item.field.logicalType && -1 == item.field.logicalType.indexOf('GEO'))) ) {
              item['alias'] = ChartUtil.getAlias(item);
              resultList.push(item);
            }
          }
        });
        return resultList;
      });

      measureList = getShelveReturnField(layers, [ShelveFieldType.MEASURE, ShelveFieldType.CALCULATED]);
      dimensionList = getShelveReturnField(layers, [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP]);
      tempObj = {
          'measureList'    : measureList,
          'dimensionList'  : dimensionList
      };
      this.fieldList.push(tempObj);

    }

  }

  /**
   * init color list
   */
  private initColorList() {
    // init list
    this.byList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE}];
    this.colorByList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE}];

    // when dimension exists, not hexagon layer, set dimension type
    if (this.fieldList[this.index].dimensionList.length > 0 && MapLayerType.TILE !== this.uiOption.layers[this.index].type) {
      this.colorByList.push({name : this.translateService.instant('msg.page.li.color.dimension'), value : MapBy.DIMENSION});
    }

    // when measure exists, set measure type
    if (this.fieldList[this.index].measureList.length > 0) {
      this.byList.push({name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE});
      this.colorByList.push({name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE});
    }
  }

  /**
   * remove aggregation type (hexagon, line, polygon)
   */
  private removeAggregationType() {
    // add aggregation type in current layer
    let layer = this.shelf.layers[this.index].fields;

    // remove duplicate measure list
    let uniMeasureList = _.uniqBy(layer, 'name');

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
    let layer = this.shelf.layers[this.index].fields;

    for (const item of layer) {
      if (item.type === 'measure') {
        item.aggregationType = AggregationType.SUM;
      }
    }
  }

  /**
   * set color by shelf
   * @param {boolean} aggregationFl use aggregation type
   * @returns {UILayers}
   */
  private setColorByShelf(aggregationFl: boolean, layerIndex : number): UILayers {

    let shelf: GeoField[] = this.shelf.layers[layerIndex].fields;

    let preference = this.checkFieldPreference(shelf);

    const isNone = preference['isNone'];
    const isMeasure = preference['isMeasure'];
    const isDimension = preference['isDimension'];

    let layer: UILayers = this.uiOption.layers[layerIndex];
    let layerType = layer.type;

    let dimensionList = this.fieldList[layerIndex].dimensionList;
    let measureList = this.fieldList[layerIndex].measureList;

    ///////////////////////////
    // Color by None
    ///////////////////////////
    if( isNone ) {
      layer.color.by = MapBy.NONE;
      if( layerType == MapLayerType.HEATMAP ){
        (_.isUndefined(layer.color.heatMapSchema) || layer.color.heatMapSchema.indexOf('HC') == -1 ? layer.color.heatMapSchema = 'HC1' : layer.color.heatMapSchema);
        layer.color.schema = layer.color.heatMapSchema;
      } else if (layerType == MapLayerType.SYMBOL) {
        (_.isUndefined(layer.color.symbolSchema) || layer.color.symbolSchema.indexOf('#') == -1 ? layer.color.symbolSchema = '#6344ad' : layer.color.symbolSchema);
        layer.color.schema = layer.color.symbolSchema;
      } else if (layerType == MapLayerType.TILE) {
        (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('#') == -1 ? layer.color.tileSchema = '#6344ad' : layer.color.tileSchema);
        layer.color.schema = layer.color.tileSchema;
      } else if (layerType == MapLayerType.POLYGON) {
        (_.isUndefined(layer.color.polygonSchema) || layer.color.polygonSchema.indexOf('#') == -1 ? layer.color.polygonSchema = '#6344ad' : layer.color.polygonSchema);
        layer.color.schema = layer.color.polygonSchema;
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
    else if( isMeasure ) {
      layer.color.by = MapBy.MEASURE;
      if( layerType == MapLayerType.HEATMAP ){
        (_.isUndefined(layer.color.heatMapSchema) || layer.color.heatMapSchema.indexOf('HC') == -1 ? layer.color.heatMapSchema = 'HC1' : layer.color.heatMapSchema);
        layer.color.schema = layer.color.heatMapSchema;
      } else if (layerType == MapLayerType.SYMBOL) {
        (_.isUndefined(layer.color.symbolSchema) || layer.color.symbolSchema.indexOf('VC') == -1 ? layer.color.symbolSchema = 'VC1' : layer.color.symbolSchema);
        layer.color.schema = layer.color.symbolSchema;
      } else if (layerType == MapLayerType.TILE) {
        (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('VC') == -1 ? layer.color.tileSchema = 'VC1' : layer.color.tileSchema);
        layer.color.schema = layer.color.tileSchema;
      } else if (layerType == MapLayerType.POLYGON) {
        (_.isUndefined(layer.color.polygonSchema) || layer.color.polygonSchema.indexOf('VC') == -1 ? layer.color.polygonSchema = 'VC1' : layer.color.polygonSchema);
        layer.color.schema = layer.color.polygonSchema;
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
    else if ( MapLayerType.TILE === layerType && isDimension ) {
      layer.color.by = MapBy.NONE;
      (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('#') == -1 ? layer.color.tileSchema = '#6344ad' : layer.color.tileSchema);
      layer.color.schema = layer.color.tileSchema;
      layer.color.column = null;
      layer.color.aggregationType = null;
    } else if( isDimension ) {
      layer.color.by = MapBy.DIMENSION;
      if (layerType == MapLayerType.SYMBOL) {
        (_.isUndefined(layer.color.symbolSchema) || layer.color.symbolSchema.indexOf('SC') == -1 ? layer.color.symbolSchema = 'SC1' : layer.color.symbolSchema);
        layer.color.schema = layer.color.symbolSchema;
      } else if (layerType == MapLayerType.TILE) {
        (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('SC') == -1 ? layer.color.tileSchema = 'SC1' : layer.color.tileSchema);
        layer.color.schema = layer.color.tileSchema;
      } else if (layerType == MapLayerType.POLYGON) {
        (_.isUndefined(layer.color.polygonSchema) || layer.color.polygonSchema.indexOf('SC') == -1 ? layer.color.polygonSchema = 'SC1' : layer.color.polygonSchema);
        layer.color.schema = layer.color.polygonSchema;
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
   * @returns {Object}
   */
  private checkFieldPreference(layers: GeoField[]): Object {

    // Find field
    let isNone: boolean = true;
    let isDimension: boolean = false;
    let isMeasure: boolean = false;
    _.each(layers, (field) => {
      if( 'user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') == -1) ) {
        isNone = false;
      }
      // when logical type is not geo, type is dimension
      if( ('user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') == -1)) && _.eq(field.type, ShelveFieldType.DIMENSION) ) {
        isDimension = true;
      }
      if( _.eq(field.type, ShelveFieldType.MEASURE) ) {
        isMeasure = true;
      }
    });

    return {isNone: isNone, isDimension: isDimension, isMeasure: isMeasure};
  }

  /**
   * set ranges for view
   * @param {ColorRange[]} ranges
   * @returns {any}
   */
  private setRangeViewByDecimal(ranges: ColorRange[]) {

    if (!ranges || 0 == ranges.length) return;
    // decimal null check
    const decimal = this.uiOption.valueFormat!=null?this.uiOption.valueFormat.decimal:0;
    // decimal null check
    const commaUseFl = this.uiOption.valueFormat!=null?this.uiOption.valueFormat.useThousandsSep:false;

    let returnList: any = _.cloneDeep(ranges);

    for (const item of returnList) {
      item['fixMax'] = null == item.fixMax ? null : <any>FormatOptionConverter.getDecimalValue(item.fixMax, decimal, commaUseFl);
      item['fixMin'] = null == item.fixMin ? null : <any>FormatOptionConverter.getDecimalValue(item.fixMin, decimal, commaUseFl);
      item['gt']     = null == item.gt ? null :<any>FormatOptionConverter.getDecimalValue(item.gt, decimal, commaUseFl);
      item['lte']    = null == item.lte ? null : <any>FormatOptionConverter.getDecimalValue(item.lte, decimal, commaUseFl);
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
    range.gt     = null == range.gt ? null : FormatOptionConverter.getNumberValue(range.gt);
    range.lte    = null == range.lte ? null : FormatOptionConverter.getNumberValue(range.lte);
    return range;
  }

  /**
   * symbol layer - init ui options when change symbol layer type
   */
  private initOptionSymbolLayer(layerIndex : number) {

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
    ( this.rnbMenu.indexOf('1') != -1 ? this.index = 0 : this.index = (Number(this.rnbMenu.split('mapLayer')[1]) -1));
  }

  /**
   * 공간연산 / 비교 레이어 영역
   */
  public analysisVisibilityBtn() {
    this.uiOption['analysis']['includeCompareLayer'] = !this.uiOption['analysis']['includeCompareLayer'];
    this.applyLayers({type : EventType.MAP_CHANGE_OPTION});
  }

  /**
   * number validation regex
   * @param value
   */
  private isNumberRegex(value: any): boolean {
    // comma 빼기
    if( value.indexOf(',') != -1) {
      value = value.replace(/,/g, '');
    }
    return Number( value ) !== NaN;
  }

  private removeInputRangeShowStatus() {
    // hide other range preview
    _.each(this.rangesViewList, (item) => {
      if (item['minInputShow']) delete item['minInputShow'];
      if (item['maxInputShow']) delete item['maxInputShow'];
    });
    if(!_.isUndefined(this.uiOption.layers[this.index].color.ranges) && this.uiOption.layers[this.index].color.ranges.length > 0) {
      this.uiOption.layers[this.index].color.ranges.forEach( (uiItem) => {
        if (uiItem['minInputShow']) delete uiItem['minInputShow'];
        if (uiItem['maxInputShow']) delete uiItem['maxInputShow'];
      });
    }
  }

}
