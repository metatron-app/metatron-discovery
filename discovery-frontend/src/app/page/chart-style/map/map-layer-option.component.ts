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
import { Component, ElementRef, Injector, Input, ViewChild } from '@angular/core';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { UIMapOption } from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import {
  MapBy,
  MapLayerType,
  MapSymbolType,
  MapThickness
} from '../../../common/component/chart/option/define/map/map-common';
import * as _ from 'lodash';
import { SymbolType } from '../../../common/component/chart/option/define/common';
import { UISymbolLayer } from '../../../common/component/chart/option/ui-option/map/ui-symbol-layer';
import { MapOutline } from '../../../common/component/chart/option/ui-option/map/ui-outline';
import { UIPolygonLayer } from '../../../common/component/chart/option/ui-option/map/ui-polygon-layer';
import { UILineLayer } from '../../../common/component/chart/option/ui-option/map/ui-line-layer';
import { UIHeatmapLayer } from '../../../common/component/chart/option/ui-option/map/ui-heatmap-layer';
import { UITileLayer } from '../../../common/component/chart/option/ui-option/map/ui-tile-layer';
import { BaseOptionComponent } from '../base-option.component';
import { ColorTemplateComponent } from '../../../common/component/color-picker/color-template.component';

@Component({
  selector: 'map-layer-option',
  templateUrl: './map-layer-option.component.html'
})
export class MapLayerOptionComponent extends BaseOptionComponent {

  // current layer index (0-2)
  @Input('index')
  public index: number;

  public uiOption: UIMapOption;

  @Input('uiOption')
  public set setUiOption(uiOption: UIMapOption) {

    this.uiOption = uiOption;
  }

  // 선반데이터
  @Input('pivot')
  public pivot: Pivot;

  // color template popup
  @ViewChild('colorTemplate')
  public colorTemplate: ColorTemplateComponent;

  // symbol layer - type list
  public symbolLayerTypes = [{name : this.translateService.instant('msg.page.layer.map.type.point'), value: MapLayerType.SYMBOL},
                             {name : this.translateService.instant('msg.page.layer.map.type.heatmap'), value: MapLayerType.HEATMAP},
                             {name : this.translateService.instant('msg.page.layer.map.type.tile'), value: MapLayerType.TILE}];

  // symbol layer - symbol list
  public symbolLayerSymbols = [{name : this.translateService.instant('msg.page.layer.map.point.circle'), value : MapSymbolType.CIRCLE},
                               {name : this.translateService.instant('msg.page.layer.map.point.square'), value : MapSymbolType.SQUARE},
                               {name : this.translateService.instant('msg.page.layer.map.point.triangle'), value : MapSymbolType.TRIANGLE},
                               {name : this.translateService.instant('msg.page.layer.map.point.pin'), value : MapSymbolType.PIN},
                               {name : this.translateService.instant('msg.page.layer.map.point.plain'), value : MapSymbolType.PLAIN},
                               {name : this.translateService.instant('msg.page.layer.map.point.people'), value : MapSymbolType.USER}];

  // color - transparency
  public transparencyList = [{name : this.translateService.instant('msg.page.layer.map.color.transparency.none'), value : 0},
                             {name : '20%', value : 20}, {name : '40%', value : 40}, {name : '60%', value : 60},
                             {name : '80%', value : 80}, {name : '100%', value : 100}];

  // outline - thickness
  public thicknessList = [{value : MapThickness.THIN}, {value : MapThickness.NORMAL}, {value : MapThickness.THICK}];


  // line - storke by, symbol - size by
  public byList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE},
                   {name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE}];

  // all layers - color by
  public colorByList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE},
                        {name : this.translateService.instant('msg.page.li.color.dimension'), value : MapBy.DIMENSION},
                        {name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE}];

  // show / hide setting for color picker
  public colorListFlag: boolean = false;

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

    // change layer type
    this.uiOption.layers[this.index].type = layerType;

    // change color type by layer type
    if (MapLayerType.HEATMAP === layerType) {
      (<UIHeatmapLayer>this.uiOption.layers[this.index]).color.schema = 'HC1';
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
   * @param {number} transparency
   */
  public changeTransparency(data: Object) {

    this.uiOption.layers[this.index].color.transparency = data['value'];

    // apply layer ui option
    this.applyLayers();
  }

  /**
   * symbol layer - toggle view raw data
   * @param {boolean} viewRawData
   */
  public toggleViewRawData(viewRawData: boolean) {

    this.uiOption.layers[this.index].viewRawData = viewRawData;

    // apply layer ui option
    this.applyLayers();
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
   * all layers - return default transparency index
   * @returns {number}
   */
  public findTransparencyIndex() {
    return _.findIndex(this.transparencyList, {value : this.uiOption.layers[this.index].color.transparency});
  }

  /**
   * line layer - return default stroke by index
   * @returns {number}
   */
  public findStrokeByIndex() {
    return _.findIndex(this.byList, {value : (<UILineLayer>this.uiOption.layers[this.index]).thickness.by});
  }

  /**
   * symbol layer - return default size by index
   * @returns {number}
   */
  public findSymbolSizeByIndex() {
    return _.findIndex(this.byList, {value : (<UISymbolLayer>this.uiOption.layers[this.index]).size.by});
  }

  /**
   * all layers - return default color by index
   * @returns {number}
   */
  public findColorByIndex() {
    return _.findIndex(this.colorByList, {value : this.uiOption.layers[this.index].color.by});
  }

  /**
   * all layers - set color by
   * @param {Object} data
   */
  public changeColorBy(data: Object) {

    this.uiOption.layers[this.index].color.by = data['value'];

    // set schema by color type
    if (MapBy.DIMENSION === data['value']) {
      this.uiOption.layers[this.index].color.schema = 'SC1';
    } else if (MapBy.MEASURE === data['value']) {
      this.uiOption.layers[this.index].color.schema = 'VC1';
    } else if (MapBy.NONE === data['value']) {
      this.uiOption.layers[this.index].color.schema = '#6344ad';
    }

    this.applyLayers();
  }

  /**
   * line layer - stroke by
   * @param {Object} data
   */
  public changeStrokeBy(data: Object) {

    (<UILineLayer>this.uiOption.layers[this.index]).thickness.by = data['value'];

    this.applyLayers();
  }

  /**
   * line layer - stroke maxValue
   * @param {number} maxValue
   */
  public changeThickMaxValue(maxValue: number) {

    (<UILineLayer>this.uiOption.layers[this.index]).thickness.maxValue = maxValue;

    this.applyLayers();
  }

  /**
   * symbol layer - change size by
   * @param {Object} data
   */
  public changeSizeBy(data: Object) {

    (<UISymbolLayer>this.uiOption.layers[this.index]).size.by = data['value'];

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
   */
  public changeBlur(obj: any, slider: any) {

    (<UIHeatmapLayer>this.uiOption.layers[this.index]).blur = slider.from;

    this.applyLayers();
  }

  /**
   * heatmap layer - change radius
   * @param obj
   * @param slider
   */
  public changeRadius(obj: any, slider: any) {

    (<UIHeatmapLayer>this.uiOption.layers[this.index]).radius = slider.from;

    this.applyLayers();
  }

  /**
   * tile(hexagon) layer - change coverage
   * @param obj
   * @param slider
   */
  public changeCoverage(obj: any, slider: any) {

    (<UITileLayer>this.uiOption.layers[this.index]).coverage = slider.from;

    this.applyLayers();
  }

  /**
   * change color
   * @param data
   */
  public changeColor(data: any) {

    this.uiOption.layers[this.index].color.schema = data.colorNum;

    this.applyLayers();
  }

  /**
   * find same color index in color list (heatmap)
   * @returns {number}
   */
  public findHeatmapColorIndex() {
    if (this.colorTemplate) {
      return _.find(this.colorTemplate.mapHeatmapColorList, {colorNum : this.uiOption.layers[this.index].color.schema})['index'];
    }
    return 1;
  }

  /**
   * find same color index in color list (dimension)
   * @returns {number}
   */
  public findDimensionColorIndex() {
    if (this.colorTemplate) {
      return _.find(this.colorTemplate.defaultColorList, {colorNum : this.uiOption.layers[this.index].color.schema})['index'];
    }
    return 1;
  }

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
   * apply layer ui option
   */
  private applyLayers() {

    this.uiOption = <UIMapOption>_.extend({}, this.uiOption, {
      layers: this.uiOption.layers
    });

    this.update();
  }
}
