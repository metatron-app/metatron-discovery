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
import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
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

@Component({
  selector: 'map-layer-option',
  templateUrl: './map-layer-option.component.html'
})
export class MapLayerOptionComponent extends BaseOptionComponent {

  // current layer index (0-2)
  @Input('index')
  public index: number;

  @Input('data')
  public data: Object[];

  @Input('uiOption')
  public set setUiOption(uiOption: UIMapOption) {

    this.uiOption = uiOption;

    // set ranges for view
    this.rangesViewList = this.setRangeViewByDecimal(this.uiOption.layers[this.index].color['ranges']);

    // set min / max by decimal format
    if (this.uiOption.valueFormat && undefined !== this.uiOption.valueFormat.decimal) {
      this.minValue = FormatOptionConverter.getDecimalValue(this.uiOption.minValue, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep);
      this.maxValue = FormatOptionConverter.getDecimalValue(this.uiOption.maxValue, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep);
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

  public measureList: Field[];

  public dimensionList: Field[];

  // range list for view
  public rangesViewList = [];

  public availableRangeValue: string;

  // min / max
  public minValue: string;
  public maxValue: string;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /**
   * all layers - change layer name
   */
  public changeLayerName(name : string) {

    this.uiOption.layers[this.index].name = name;

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * symbol layer - change layer type
   * @param {MapLayerType} layerType
   */
  public changeSymbolLayerType(layerType : MapLayerType) {

    if (this.uiOption.layers[this.index].type === layerType) return;

    // deep copy layer type
    let cloneLayerType = _.cloneDeep(this.uiOption.layers[this.index].type);

    // change layer type
    this.uiOption.layers[this.index].type = layerType;

    // init color, legend
    this.initOptionSymbolLayer();

    // change color type by layer type
    if (MapLayerType.HEATMAP === layerType) {
      this.uiOption.layers[this.index].color.by = MapBy.MEASURE;
      this.uiOption.layers[this.index].color.schema = 'HC1';
      if( isNullOrUndefined(this.uiOption.layers[this.index]['blur']) ) {
        this.uiOption.layers[this.index]['blur'] = 20;
      }
      this.uiOption.layers[this.index]['radius'] = 20;

      // when measure doesn't exist, hide/disable legend
      if (!this.measureList || 0 === this.measureList.length) {
        // this.uiOption.legend.showName = false;
        this.uiOption.legend.auto = false;
      } else {
        this.uiOption.layers[this.index].color.column = this.measureList[0]['name'];
      }

      // remove measure aggregation type in shelf
      this.removeAggregationType();

    } else if (MapLayerType.SYMBOL === layerType) {
      // set color by shelf
      this.uiOption.layers[this.index] = this.setColorByShelf(false);

      // add color by dimension list
      if (this.dimensionList.length > 0 && -1 === _.findIndex(this.colorByList, ( item ) => { return item.value === MapBy.DIMENSION; })) {
        this.colorByList.splice(1, 0, {name : this.translateService.instant('msg.page.li.color.dimension'), value : MapBy.DIMENSION});
      }

      // remove measure aggregation type in shelf
      this.removeAggregationType();

    } else if (MapLayerType.TILE === layerType) {
      // set color by shelf
      this.uiOption.layers[this.index] = this.setColorByShelf(true);
      this.uiOption.layers[this.index]['radius'] = 20;

      // remove color by dimension list
      _.remove(this.colorByList, ( item ) => { return item.value === MapBy.DIMENSION; });

      // if( isNullOrUndefined(this.uiOption.layers[this.index]['coverage']) ) {
      //   this.uiOption.layers[this.index]['coverage'] = 0.9;
      // }

      // add measure aggregation type in shelf
      this.addAggregationType();
    }

    // set measure, dimension list by layer type
    this.setMeasureDimensions(this.shelf, true);

    if ((MapLayerType.TILE === cloneLayerType || MapLayerType.TILE === layerType) && cloneLayerType !== layerType) {

      // call search api (for precision setting)
      this.applyLayers({type : EventType.CHANGE_PIVOT});
      return;
    }

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * symbol layer - change symbol type
   * @param {SymbolType} symbolType
   */
  public changeSymbolType(symbolType: MapSymbolType) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).symbol = symbolType;

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
    this.uiOption.layers[index].color.transparency = slider.from;
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
      this.uiOption.layers[index].color.transparency = inputValue;
      this.applyLayers();
    }
  }

  /**
   * symbol, polygon layer - toggle outline
   * @param {MapOutline} outline
   */
  public toggleOutline(outline: MapOutline) {

    if (outline) {
      outline = null;
    } else outline = <any>{color : '#4f4f4f', thickness : MapThickness.NORMAL};

    if (MapLayerType.SYMBOL === this.uiOption.layers[this.index].type) {
      (<UISymbolLayer>this.uiOption.layers[this.index]).outline = outline;

    } else if (MapLayerType.POLYGON === this.uiOption.layers[this.index].type) {
      (<UIPolygonLayer>this.uiOption.layers[this.index]).outline = outline;
    }

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - change thickness
   * @param {MapThickness} thickness
   */
  public changeThick(thickness: MapThickness) {

    if (MapLayerType.SYMBOL === this.uiOption.layers[this.index].type) {
      (<UISymbolLayer>this.uiOption.layers[this.index]).outline.thickness = thickness;

    } else if (MapLayerType.POLYGON === this.uiOption.layers[this.index].type) {
      (<UIPolygonLayer>this.uiOption.layers[this.index]).outline.thickness = thickness;
    }

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - clustering
   */
  public isEnableClustering() {
    (<UISymbolLayer>this.uiOption.layers[this.index]).clustering = !(<UISymbolLayer>this.uiOption.layers[this.index]).clustering;
    this.applyLayers();
  }

  public changeClustering(obj: any, $event: any, index: number) {
    this.uiOption.layers[index]['coverage']= $event.from;
    this.applyLayers();
  }

  public changeClusteringText($event: any, index: number) {
    let inputValue = parseFloat($event.target.value);
    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = (<UISymbolLayer>this.uiOption.layers[index])['coverage'];
      return;
    } else {
      (<UISymbolLayer>this.uiOption.layers[index])['coverage'] = inputValue;
      this.applyLayers();
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
  public changeColorBy(data: Object) {

    if (this.uiOption.layers[this.index].color.by === data['value']) return;

    // init color ranges
    this.uiOption.layers[this.index].color.ranges = undefined;
    // hide custom color
    this.uiOption.layers[this.index].color['settingUseFl'] = false;

    this.uiOption.layers[this.index].color.by = data['value'];

    this.uiOption.layers[this.index].color.aggregationType = undefined;

    // set schema by color type
    if (MapBy.DIMENSION === data['value']) {
      this.uiOption.layers[this.index].color.schema = 'SC1';

      // only set column when dimension column exsists
      if (this.dimensionList && this.dimensionList.length > 0) {
        this.uiOption.layers[this.index].color.column = this.dimensionList[0]['name'];
      } else {
        this.uiOption.layers[this.index].color.column = '';
      }

    } else if (MapBy.MEASURE === data['value']) {
      this.uiOption.layers[this.index].color.schema = 'VC1';

      // only set column when measure column exsists
      if (this.measureList && this.measureList.length > 0) {
        this.uiOption.layers[this.index].color.column = this.measureList[0]['name'];
        this.uiOption.layers[this.index].color.aggregationType = this.measureList[0]['aggregationType'];

      } else {
        this.uiOption.layers[this.index].color.column = '';
      }

      const colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[this.index].color['schema']]);

      // not heatmap => set ranges
      if (MapLayerType.HEATMAP !== this.uiOption.layers[this.index].type && MapBy.MEASURE === this.uiOption.layers[this.index].color.by) {
        this.uiOption.layers[this.index].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[0], colorList, this.index, this.shelf.layers[this.index], []);
      }

    } else if (MapBy.NONE === data['value']) {
      this.uiOption.layers[this.index].color.schema = '#6344ad';
      this.uiOption.layers[this.index].color.column = '';
    }

    this.applyLayers();
  }

  /**
   * all layers - change color column (color by dimension, measure)
   * @param {Object} data
   */
  public changeColorColumn(data: Field) {

    if (this.uiOption.layers[this.index].color.column === data.name && (!data.aggregationType || (data.aggregationType && this.uiOption.layers[this.index].color.aggregationType === data.aggregationType))) return;

    this.uiOption.layers[this.index].color.column = data.name;

    // measure
    if ('measure' === data.type) {
      this.uiOption.layers[this.index].color.aggregationType = data.aggregationType;
      this.uiOption.layers[this.index].color.granularity = null;
      // init ranges
      const colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[this.index].color['schema']]);
      this.uiOption.layers[this.index].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[0], colorList, this.index, this.shelf.layers[this.index], []);
    // granularity
    } else {
      if (data.format) this.uiOption.layers[this.index].color.granularity = data.format.unit.toString();
      this.uiOption.layers[this.index].color.aggregationType = null;
    }

    this.applyLayers();
  }

  /**
   * line layer - stroke by
   * @param {Object} data
   */
  public changeStrokeBy(data: Object) {

    (<UILineLayer>this.uiOption.layers[this.index]).thickness.by = data['value'];

    (<UILineLayer>this.uiOption.layers[this.index]).thickness.aggregationType = undefined;

    if (MapBy.MEASURE === data['value']) {

      // only set column when measure column exsists
      if (this.measureList && this.measureList.length > 0) {
        (<UILineLayer>this.uiOption.layers[this.index]).thickness.column = this.measureList[0]['name'];
        (<UILineLayer>this.uiOption.layers[this.index]).thickness.aggregationType = this.measureList[0]['aggregationType'];
      } else {
        (<UILineLayer>this.uiOption.layers[this.index]).thickness.column = '';
      }
    } else if (MapBy.NONE === data['value']) {
      (<UILineLayer>this.uiOption.layers[this.index]).thickness.column = '';
    }

    this.applyLayers();
  }

  /**
   * line layer - stroke column
   * @param {Object} data
   */
  public changeStrokeColumn(data: Object) {

    (<UILineLayer>this.uiOption.layers[this.index]).thickness.column = data['name'];
    (<UILineLayer>this.uiOption.layers[this.index]).thickness.aggregationType = data['aggregationType'];

    this.applyLayers();
  }

  /**
   * line layer - stroke maxValue
   * @param {number} maxValue
   */
  public changeThickMaxValue(event: any) {

    const inputValue = parseFloat(event.target.value);

    if (_.isEmpty(inputValue.toString()) || isNaN(inputValue)) {

      event.target.value = (<UILineLayer>this.uiOption.layers[this.index]).thickness.maxValue;
      return;
    } else {

      (<UILineLayer>this.uiOption.layers[this.index]).thickness.maxValue = inputValue;
      this.applyLayers();
    }
  }

  /**
   * symbol layer - change size by
   * @param {Object} data
   */
  public changeSizeBy(data: Object) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).size.by = data['value'];

    // set column when size by is measure
    if (MapBy.MEASURE === data['value']) {

      if (this.measureList && this.measureList.length > 0) {
        (<UISymbolLayer>this.uiOption.layers[this.index]).size.column = this.measureList[0]['name'];
      } else {
        (<UISymbolLayer>this.uiOption.layers[this.index]).size.column = '';
      }
    } else {
      (<UISymbolLayer>this.uiOption.layers[this.index]).size.column = '';
    }

    this.applyLayers();
  }

  /**
   * symbol layer - change size column
   * @param {Object} data
   */
  public changeSizeColumn(data: Field) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).size.column = data.name;

    this.applyLayers();
  }

  /**
   * color by none - change color
   * @param {string} colorCode
   */
  public changeByNoneColor(colorCode: string) {

    this.uiOption.layers[this.index].color.schema = colorCode;

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
    (<UIHeatmapLayer>this.uiOption.layers[index]).radius = slider.from;
    this.applyLayers();
  }
  public changeRadiusText($event: any, index: number) {
    let inputValue = parseFloat($event.target.value);
    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      $event.target.value = this.uiOption.layers[index]['radius'];
      return;
    } else {
      (<UIHeatmapLayer>this.uiOption.layers[index]).radius = inputValue;
      this.applyLayers();
    }
  }

  /**
   * hexagon layer - change radius
   * @param obj
   * @param slider
   */
  public changeHexagonRadius(obj: any, slider: any) {

    (<UITileLayer>this.uiOption.layers[this.index]).radius = slider.from;
    this.applyLayers({});
  }

  /**
   * hexgon layer - change radius text
   * @param event
   */
  public changeHexagonRadiusText(event: any) {

    let inputValue = parseFloat(event.target.value);

    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (<UITileLayer>this.uiOption.layers[this.index]).radius;
      return;
    } else {
      // when they are not same
      if ((<UITileLayer>this.uiOption.layers[this.index]).radius !== inputValue) {
        (<UITileLayer>this.uiOption.layers[this.index]).radius = inputValue;
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
  public changeColor(data: any) {

    this.uiOption.layers[this.index].color.schema = data.colorNum;

    const colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[this.index].color['schema']]);

    // not heatmap => set ranges
    if (MapLayerType.HEATMAP !== this.uiOption.layers[this.index].type && MapBy.MEASURE === this.uiOption.layers[this.index].color.by) {
      this.uiOption.layers[this.index].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[0], colorList, this.index, this.shelf.layers[this.index], []);
    // heatmap => init ranges
    } else {
      this.uiOption.layers[this.index].color.ranges = undefined;
    }

    this.applyLayers();
  }

  /**
   * find same color index in color list (heatmap, dimension)
   * @param {Object[]} colorList
   * @returns {any}
   */
  public findColorIndex(colorList: Object[]) {
    if (this.colorTemplate) {
      let obj = _.find(colorList, {colorNum : this.uiOption.layers[this.index].color.schema});
      if (obj) return obj['index'];
      return 1;
    }
    return 1;
  }

  /**
   * find same color index in color list (measure)
   * @returns {any}
   */
  public findMeasureColorIndex() {
    if (this.colorTemplate) {
      let obj = _.find(this.colorTemplate.measureColorList, {colorNum : this.uiOption.layers[this.index].color.schema});

      if (obj) {
        return obj['index'];
      } else {
        return _.find(this.colorTemplate.measureReverseColorList, {colorNum : this.uiOption.layers[this.index].color.schema})['index'];
      }
    }
    return 1;
  }

  /**
   * line layer - change line style
   */
  public changeLineStyle(lineStyle: MapLineStyle) {

    (<UILineLayer>this.uiOption.layers[this.index]).lineStyle = lineStyle;

    this.applyLayers();
  }

  /**
   * symbol, polygon layer - change outline
   * @param {string} colorCode
   */
  public changeOutlineColor(colorCode: string) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).outline.color = colorCode;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range (by none)
   */
  public changeNoneRadiusRange(obj: any, slider: any) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).size.radiusRange[0] = slider.from;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range text (by none)
   * @param event
   * @param {number} index
   */
  public changeNoneRadiusRangeText(event: any) {

    let inputValue = parseFloat(event.target.value);

    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (<UISymbolLayer>this.uiOption.layers[this.index]).size.radiusRange[0];
      return;
    } else {
      (<UISymbolLayer>this.uiOption.layers[this.index]).size.radiusRange[0] = inputValue;
      this.applyLayers();
    }
  }

  /**
   * symbol layer - change radius range (by measure)
   */
  public changeMeasureRadiusRange(obj: any, slider: any) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).size.radiusRange[0] = slider.from;

    this.applyLayers();
  }

  /**
   * symbol layer - change radius range text (by measure)
   */
  public changeMeasureRadiusRangeText(event: any, index: number) {

    let inputValue = parseFloat(event.target.value);

    if( _.isEmpty(inputValue.toString()) || isNaN(inputValue) || inputValue > 100 || inputValue < 0) {
      event.target.value = (<UISymbolLayer>this.uiOption.layers[this.index]).size.radiusRange[index];
      return;
    } else {

      // from
      if (0 === index) {
        (<UISymbolLayer>this.uiOption.layers[this.index]).size.radiusRange[index] = inputValue;

        // to
      } else if (1 === index) {
        (<UISymbolLayer>this.uiOption.layers[this.index]).size.radiusRange[index] = inputValue;
      }

      this.applyLayers();
    }
  }

  /**
   * 사용자 색상설정 show
   */
  public changeColorRange() {
    // color setting show / hide 값 반대로 설정
    this.uiOption.layers[this.index].color.settingUseFl = !this.uiOption.layers[this.index].color.settingUseFl;

    let colorOption = this.uiOption.layers[this.uiOption.layerNum].color;

    // custom user color is show, set ranges
    const ranges = this.uiOption.layers[this.index].color.settingUseFl ? colorOption.ranges : [];

    this.uiOption.layers[this.index].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[0], <any>ChartColorList[colorOption.schema], this.index, this.shelf.layers[this.index], ranges);

    this.applyLayers();
  }

  /**
   * change range min input
   * @param range
   * @param {number} index
   */
  public changeRangeMinInput(range: any, index: number): void {

    // 색상 범위리스트
    let rangeList = this.uiOption.layers[this.index].color.ranges;

    if (!range.gt || isNaN(FormatOptionConverter.getNumberValue(range.gt))) {
      // set original value
      range.gt = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMin, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = _.cloneDeep(this.uiOption.minValue);
    const uiMaxValue = _.cloneDeep(this.uiOption.maxValue);

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
  public addNewRange(index: number) {

    const optionMinValue = _.cloneDeep(this.uiOption.minValue);

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[this.index].color.ranges;

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
  public colorPaletteSelected(colorCode: string, item?: any) {

    if (this.uiOption.layers[this.index].color.by == MapBy.MEASURE) {

      const index = this.rangesViewList.indexOf(item);
      // 선택된 색상으로 설정
      this.uiOption.layers[this.index].color.ranges[index].color = colorCode;
    }

    this.applyLayers();
  }

  /**
   * remove selected color range
   */
  public removeColorRange(range: ColorRange, index: number) {

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[this.index].color.ranges;

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
   * TOOD range max 입력값 수정시
   * @param range
   * @param index
   */
  public changeRangeMaxInput(range: any, index: number): void {

    // 색상 범위리스트
    let rangeList = this.uiOption.layers[this.index].color.ranges;

    if (!range.lte || isNaN(FormatOptionConverter.getNumberValue(range.lte))) {

      // set original value
      range.lte = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMax, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = _.cloneDeep(this.uiOption.minValue);

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

    this.applyLayers();
  }

  /**
   * equalize custom color range
   */
  public equalColorRange(): void {

    // 색상 범위리스트
    const rangeList = this.uiOption.layers[this.index].color.ranges;

    let colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[this.index].color['schema']]);

    // rangeList에서의 색상을 색상리스트에 설정
    rangeList.reverse().forEach((item, index) => {

      colorList[index] = item.color;
    });

    // set color ranges
    this.uiOption.layers[this.index].color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.uiOption, this.data[0], colorList, this.index, this.shelf.layers[this.index], rangeList);

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
    _.each(this.rangesViewList, (item) => {
      if (item['minInputShow']) delete item['minInputShow'];
      if (item['maxInputShow']) delete item['maxInputShow'];
    });

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
    _.each(this.rangesViewList, (item) => {
      if (item['minInputShow']) delete item['minInputShow'];
      if (item['maxInputShow']) delete item['maxInputShow'];
    });

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
    this.byList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE}];
    this.colorByList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE}];

    // when dimension exists, not hexagon layer, set dimension type
    if (this.dimensionList.length > 0 && MapLayerType.TILE !== this.uiOption.layers[this.index].type) {
      this.colorByList.push({name : this.translateService.instant('msg.page.li.color.dimension'), value : MapBy.DIMENSION});
    }

    // when measure exists, set measure type
    if (this.measureList.length > 0) {
      this.byList.push({name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE});
      this.colorByList.push({name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE});
    }
  }

  /**
   * set dimension, measure list
   * @param {GeoField[]} layers
   */
  private setMeasureDimensions(shelf: Shelf, measureFl?: boolean) {

    let layers = _.cloneDeep(shelf.layers[this.index]);

    const getShelveReturnField = ((shelve: any, typeList: ShelveFieldType[]): AbstractField[] => {
      const resultList: AbstractField[] = [];
      shelve.map((item) => {
        if ((_.eq(item.type, typeList[0]) || _.eq(item.type, typeList[1])) && (item.field && ('user_expr' === item.field.type || item.field.logicalType && -1 == item.field.logicalType.indexOf('GEO'))) ) {
          item['alias'] = ChartUtil.getAlias(item);
          resultList.push(item);
        }
      });
      return resultList;
    });

    if (measureFl) {
      this.measureList = getShelveReturnField(layers, [ShelveFieldType.MEASURE, ShelveFieldType.CALCULATED]);
      return;
    }

    this.measureList = getShelveReturnField(layers, [ShelveFieldType.MEASURE, ShelveFieldType.CALCULATED]);
    this.dimensionList = getShelveReturnField(layers, [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP]);
  }

  /**
   * remove aggregation type (hexagon, line, polygon)
   */
  private removeAggregationType() {
    // add aggregation type in current layer
    let layer = this.shelf.layers[this.uiOption.layerNum];

    // remove duplicate measure list
    let uniMeasureList = _.uniqBy(layer, 'name');

    for (const item of uniMeasureList) {

      if (item.type === 'measure') {
        delete item.aggregationType;
        item.field.pivot = _.uniq(item.field.pivot);
      }
    }

    this.shelf.layers[this.uiOption.layerNum] = uniMeasureList;
  }

  /**
   * add aggregation type (point, heatmap)
   */
  private addAggregationType() {
    // add aggregation type in current layer
    let layer = this.shelf.layers[this.uiOption.layerNum];

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
  private setColorByShelf(aggregationFl: boolean): UILayers {

    let shelf: GeoField[] = this.shelf.layers[this.index];

    let preference = this.checkFieldPreference(shelf);

    const isNone = preference['isNone'];
    const isMeasure = preference['isMeasure'];
    const isDimension = preference['isDimension'];

    let layer: UILayers = this.uiOption.layers[this.index];

    ///////////////////////////
    // Color by None
    ///////////////////////////
    if( isNone ) {
      layer.color.by = MapBy.NONE;
      layer.color.schema = _.eq(layer.type, MapLayerType.HEATMAP) ? 'HC1' : '#6344ad';
      layer.color.column = null;
      layer.color.aggregationType = null;
    }
    ///////////////////////////
    // Color by Measure
    ///////////////////////////
    // remove not isDimension => exceptional case select dimension and remove dimension
    else if( isMeasure ) {
      layer.color.by = MapBy.MEASURE;
      layer.color.schema = _.eq(layer.type, MapLayerType.HEATMAP) ? 'HC1' : 'VC1';
      layer.color.column = this.measureList[0]['name'];
      if (aggregationFl) layer.color.aggregationType = this.measureList[0]['aggregationType'];
      else layer.color.aggregationType = null;
    }
    ///////////////////////////
    // Color by Dimension
    ///////////////////////////
    // hexagon && isDimension => init as none
    else if ( MapLayerType.TILE === layer.type && isDimension ) {
      layer.color.by = MapBy.NONE;
      layer.color.schema = '#6344ad';
      layer.color.column = null;
      layer.color.aggregationType = null;
    }
    else if( isDimension ) {
      layer.color.by = MapBy.DIMENSION;
      layer.color.schema = 'SC1';
      layer.color.column = this.dimensionList[0]['name'];
      layer.color.aggregationType = null;
      if (this.dimensionList[0]['format']) layer.color.granularity = this.dimensionList[0]['format']['unit'].toString();
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
  private initOptionSymbolLayer() {

    // init color ranges
    this.uiOption.layers[this.index].color.ranges = undefined;
    // hide custom color
    this.uiOption.layers[this.index].color['settingUseFl'] = false;

    // init disable legend
    this.uiOption.legend.auto = true;
  }
}
