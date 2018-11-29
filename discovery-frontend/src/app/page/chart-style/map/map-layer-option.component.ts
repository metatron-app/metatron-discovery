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
import { UIMapOption } from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import {
  MapBy,
  MapLayerType,
  MapLineStyle,
  MapSymbolType,
  MapThickness
} from '../../../common/component/chart/option/define/map/map-common';
import * as _ from 'lodash';
import { ShelveFieldType, SymbolType } from '../../../common/component/chart/option/define/common';
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
import {isNullOrUndefined} from "util";
import {Alert} from "../../../common/util/alert.util";
import { ChartUtil } from '../../../common/component/chart/option/util/chart-util';
import { AggregationType } from '../../../domain/workbook/configurations/field/measure-field';

@Component({
  selector: 'map-layer-option',
  templateUrl: './map-layer-option.component.html'
})
export class MapLayerOptionComponent extends BaseOptionComponent {

  // current layer index (0-2)
  @Input('index')
  public index: number;

  @Input('uiOption')
  public set setUiOption(uiOption: UIMapOption) {

    // TODO temporary code before setting uiOption in map component
    // if((<UISymbolLayer>uiOption.layers[this.index]).size && !(<UISymbolLayer>uiOption.layers[this.index]).size.radiusRange) {
    //
    //   if (MapBy.NONE === (<UISymbolLayer>uiOption.layers[this.index]).size.by) {
    //     (<UISymbolLayer>uiOption.layers[this.index]).size.radiusRange = [10];
    //   } else if (MapBy.MEASURE === (<UISymbolLayer>uiOption.layers[this.index]).size.by) {
    //
    //     (<UISymbolLayer>uiOption.layers[this.index]).size.radiusRange = [10, 100];
    //   }
    // }

    this.uiOption = uiOption;
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

  // color - transparency
  public transparencyList = [{name : this.translateService.instant('msg.page.layer.map.color.transparency.none'), value : 0},
                             {name : '20%', value : 20}, {name : '40%', value : 40}, {name : '60%', value : 60},
                             {name : '80%', value : 80}, {name : '100%', value : 100}];

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

    // deep copy layer type
    let cloneLayerType = _.cloneDeep(this.uiOption.layers[this.index].type);

    // change layer type
    this.uiOption.layers[this.index].type = layerType;

    // change color type by layer type
    if (MapLayerType.HEATMAP === layerType) {
      this.uiOption.layers[this.index].color.schema = 'HC1';
      if( isNullOrUndefined(this.uiOption.layers[this.index]['blur']) ) {
        this.uiOption.layers[this.index]['blur'] = 20;
      }
      this.uiOption.layers[this.index]['radius'] = 20;

      // remove measure aggregation type in shelf
      this.removeAggregationType();

    } else if (MapLayerType.SYMBOL === layerType) {
      this.uiOption.layers[this.index].color.by = MapBy.NONE;
      this.uiOption.layers[this.index].color.schema = '#6344ad';

      // remove measure aggregation type in shelf
      this.removeAggregationType();

    } else if (MapLayerType.TILE === layerType) {
      this.uiOption.layers[this.index].color.by = MapBy.NONE;
      this.uiOption.layers[this.index].color.schema = '#6344ad';
      this.uiOption.layers[this.index]['radius'] = 20;

      // if( isNullOrUndefined(this.uiOption.layers[this.index]['coverage']) ) {
      //   this.uiOption.layers[this.index]['coverage'] = 0.9;
      // }

      // add measure aggregation type in shelf
      this.addAggregationType();

      // call search api (for precision setting)
      this.applyLayers({});
      return;
    }

    if (cloneLayerType)
    // apply layer ui option
    this.applyLayers({});
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
   * @param {Object} data
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

    if( _.isEmpty(inputValue.toString()) || inputValue > 100 || inputValue < -1) {
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
   * return default index in list
   * @param {Object[]} list
   * @param {string} key
   * @param value
   * @returns {number}
   */
  public findIndex(list: Object[], key: string, value: any) {
    return _.findIndex(list, {[key] : value});
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

      // only set column when dimension column exsists
      if (this.uiOption.fielDimensionList && this.uiOption.fielDimensionList.length > 0) {
        this.uiOption.layers[this.index].color.column = this.uiOption.fielDimensionList[0]['name'];
      } else {
        this.uiOption.layers[this.index].color.column = '';
      }

    } else if (MapBy.MEASURE === data['value']) {
      this.uiOption.layers[this.index].color.schema = 'VC1';

      // only set column when measure column exsists
      if (this.uiOption.fieldMeasureList && this.uiOption.fieldMeasureList.length > 0) {
        this.uiOption.layers[this.index].color.column = this.uiOption.fieldMeasureList[0]['name'];
      } else {
        this.uiOption.layers[this.index].color.column = '';
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

    this.uiOption.layers[this.index].color.column = data.name;

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

    // set column when size by is measure
    if (MapBy.MEASURE === data['value']) {

      if (this.uiOption.fieldMeasureList && this.uiOption.fieldMeasureList.length > 0) {
        (<UISymbolLayer>this.uiOption.layers[this.index]).size.column = this.uiOption.fieldMeasureList[0]['name'];
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
   */
  public changeBlur(obj: any, slider: any, index: number) {
    (<UIHeatmapLayer>this.uiOption.layers[index]).blur = slider.from;
    this.applyLayers();
  }
  public changeBlurText($event: any, index: number) {

    let inputValue = parseFloat($event.target.value);
    if( _.isEmpty(inputValue.toString()) || inputValue > 100 || inputValue < -1) {
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
    if( _.isEmpty(inputValue.toString()) || inputValue > 100 || inputValue < -1) {
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
   * @param {number} index
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

    if( _.isEmpty(inputValue.toString()) || inputValue > 100 || inputValue < -1) {
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
    if( _.isEmpty(inputValue.toString()) || inputValue > 1 || inputValue < 0) {
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

    if( _.isEmpty(inputValue.toString()) || inputValue > 100 || inputValue < -1) {
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

    if( _.isEmpty(inputValue.toString()) || inputValue > 100 || inputValue < -1) {
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

    const getShelveReturnField = ((shelve: any, typeList: ShelveFieldType[]): AbstractField[] => {
      const resultList: AbstractField[] = [];
      shelve.map((item) => {
        if ((_.eq(item.type, typeList[0]) || _.eq(item.type, typeList[1])) && (item.field && item.field.logicalType && -1 == item.field.logicalType.indexOf('GEO')) ) {
          resultList.push(item);
        }
      });
      return resultList;
    });

    let measureList = getShelveReturnField(shelf.layers[this.uiOption.layerNum], [ShelveFieldType.MEASURE, ShelveFieldType.CALCULATED]);

    let dimensionList = getShelveReturnField(shelf.layers[this.uiOption.layerNum], [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP]);

    // init list
    this.byList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE}]
    this.colorByList = [{name : this.translateService.instant('msg.page.layer.map.stroke.none'), value : MapBy.NONE}];

    // when dimension exists, not hexagon layer, set dimension type
    if (dimensionList.length > 0 && MapLayerType.TILE !== this.uiOption.layers[this.index].type) {
      this.colorByList.push({name : this.translateService.instant('msg.page.li.color.dimension'), value : MapBy.DIMENSION});
    }

    // when measure exists, set measure type
    if (measureList.length > 0) {
      this.byList.push({name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE});
      this.colorByList.push({name : this.translateService.instant('msg.page.layer.map.stroke.measure'), value : MapBy.MEASURE});

    }
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
}
