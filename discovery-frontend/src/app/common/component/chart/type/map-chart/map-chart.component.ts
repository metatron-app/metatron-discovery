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

import { AfterViewInit, Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { BaseChart } from '../../base-chart';
import { Pivot } from '../../../../../domain/workbook/configurations/pivot';
import * as ol from 'openlayers';
import * as h3 from 'h3-js';
import { UIMapOption } from '../../option/ui-option/map/ui-map-chart';
import {
  MapBy, MapGeometryType,
  MapLayerType,
  MapLineStyle,
  MapType,
} from '../../option/define/map/map-common';
import {ColorRange} from '../../option/ui-option/ui-color';
import {OptionGenerator} from '../../option/util/option-generator';
import UI = OptionGenerator.UI;
import {
  ChartColorList,
  ChartType,
  ColorRangeType, UIPosition,
} from '../../option/define/common';
import {UISymbolLayer} from '../../option/ui-option/map/ui-symbol-layer';
import {UILayers, UIOption} from '../../option/ui-option';
import * as _ from 'lodash';
import {BaseOption} from '../../option/base-option';
import {FormatOptionConverter} from '../../option/converter/format-option-converter';
import {UILineLayer} from '../../option/ui-option/map/ui-line-layer';

@Component({
  selector: 'map-chart',
  templateUrl: 'map-chart.component.html'
})
export class MapChartComponent extends BaseChart implements AfterViewInit{

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Map element
  @ViewChild('mapArea')
  private area: ElementRef;
  private $area: any;

  // Tooltip element
  @ViewChild('tooltip')
  private tooltipEl: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Map Object
  public olmap: ol.Map = undefined;

  // OSM Layer
  public osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
      attributions: [new ol.Attribution({
        html: this.attribution()
      })]
    })
  });

  // Carto Layer
  public cartoPositronLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url:'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      attributions: [new ol.Attribution({
        html: this.attribution()
      })]
    })
  });

  // Carto Dark Layer
  public cartoDarkLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url:'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      attributions: [new ol.Attribution({
        html: this.attribution()
      })]
    })
  });

  // Symbol layer
  public symbolLayer = undefined;

  // Tooltip layer
  public tooltipLayer = undefined;

  // Tooltip info
  public tooltipInfo = {
    enable: false,
    geometryType: String(MapGeometryType.POINT),
    num: 1,
    name: 'Layer 1',
    title: 'Geo info',
    coords: [],
    fields: []
  };

  // Legend info
  public legendInfo = {
    enable: true,
    position: String(UIPosition.RIGHT_BOTTOM),
    layer: [
      // type: MapLayerType.SYMBOL,
      // num: 1,
      // name: 'Layer 1',
      // title: 'Geo info',
      // coords: [],
      // fields: []
    ]
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  // 생성자
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Component initialize
  public ngOnInit() {
    super.ngOnInit();
  } // function - ngOnInit

  // Component destory
  public ngOnDestroy() {
    super.ngOnDestroy();

  } // function - ngOnDestroy

  // After View Init
  public ngAfterViewInit(): void {

    this.chart = this.area;
  }

  // After Content Init
  public ngAfterContentInit(): void {

    // Area
    this.$area = $(this.area.nativeElement);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Pivot Valid Check
   * @param pivot
   */
  public isValid(pivot: Pivot): boolean {
    // return true;
    return (pivot !== undefined) && ((pivot.columns.length > 0) || (pivot.rows.length > 0) || (pivot.aggregations.length > 0));
  }

  /**
   * Map chart draw
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    ////////////////////////////////////////////////////////
    // Valid Check
    ////////////////////////////////////////////////////////

    if( !this.isValid(this.pivot) ) {
      // No Data 이벤트 발생
      this.data.show = false;
      this.noData.emit();
      return;
    }

    // Test!
    if( this.data[0].features && this.data[0].features.length > 10 ) {
      this.data[0].features = this.data[0].features.splice(0, 10);
    }
    // this.data[0].features = [this.data[0].features[0]];

    ////////////////////////////////////////////////////////
    // Creation map & layer
    ////////////////////////////////////////////////////////

    // 엘리먼트 반영
    this.changeDetect.detectChanges();

    // Show data
    this.data.show = true;

    // Soruce
    let source = new ol.source.Vector();

    // Creation map object
    this.createMap();

    // Creation feature
    this.createFeature(source);

    // Creation layer
    this.createLayer(source);

    // Chart resize
    this.olmap.updateSize();

    // Creation tooltip
    this.createTooltip();

    // Creation legend
    this.createLegend();

    ////////////////////////////////////////////////////////
    // Apply
    ////////////////////////////////////////////////////////

    // 완료
    this.drawFinished.emit();
  }

  /**
   * Get map UI option
   */
  public getUiMapOption(): UIMapOption {
    return <UIMapOption>this.uiOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트에 옵션 반영
   * - Echart기반 차트가 아닐경우 Override 필요
   * @param initFl 차트 초기화 여부
   */
  protected apply(initFl: boolean = true): void {

  }

  /**
   * 차트의 기본 옵션을 생성한다.
   * - 각 차트에서 Override
   */
  protected initOption(): BaseOption {

    return {
      type: ChartType.MAP,
      series: []
    };
  }

  /**
   * 시리즈 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeries(): BaseOption {
    return this.chartOption;
  }

  /**
   * 셀렉션 이벤트를 등록한다.
   * - 필요시 각 차트에서 Override
   */
  protected selection(): void {
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Map chart creation
   */
  private createMap(): void {

    // Street layer
    let layer = this.cartoPositronLayer;

    // Map object initialize
    if( !this.olmap ) {
      this.olmap = new ol.Map({
        view: new ol.View({
          center: [126, 37],
          zoom: 6,
          projection: 'EPSG:4326',
          maxZoom: 20
        }),
        layers: [layer],
        target: this.$area[0]
      });
    }

    for(let i=0;i<document.getElementsByClassName('ol-attribution').length;i++) {
      let element = document.getElementsByClassName('ol-attribution')[i] as HTMLElement;
      element.style.right = "auto";
      element.style.left = ".5em";
    }

    // Chart resize
    this.olmap.updateSize();

    // Zoom slider
    const zoomslider = new ol.control.ZoomSlider();
    this.olmap.addControl(zoomslider);
  }

  /**
   * Creation map layer
   */
  private createLayer(source): void {

    ////////////////////////////////////////////////////////
    // Set attribution
    ////////////////////////////////////////////////////////

    this.osmLayer.getSource().setAttributions(this.attribution());
    this.cartoPositronLayer.getSource().setAttributions(this.attribution());
    this.cartoDarkLayer.getSource().setAttributions(this.attribution());

    ////////////////////////////////////////////////////////
    // Create layer
    ////////////////////////////////////////////////////////
    for( let num: number = 0 ; num < this.getUiMapOption().layers.length ; num++ ) {

      // Layer
      let layer: UILayers = this.getUiMapOption().layers[num];

      ////////////////////////////////////////////////////////
      // Symbol(Point, Line, Polygon) layer
      ////////////////////////////////////////////////////////
      if( _.eq(layer.type, MapLayerType.SYMBOL)
        || _.eq(layer.type, MapLayerType.LINE)
        || _.eq(layer.type, MapLayerType.POLYGON) ) {

        // Create
        if( !this.symbolLayer ) {
          this.symbolLayer = new ol.layer.Vector({
            source: source,
            style: this.mapStyleFunction(0, this.data)
            //opacity: this.getUiMapOption().layers[0].color.transparency / 100
          });

          // Set source
          this.symbolLayer.setSource(source);

          // Add layer
          this.olmap.addLayer(this.symbolLayer);
        }
      }
      ////////////////////////////////////////////////////////
      // Heatmap layer
      ////////////////////////////////////////////////////////
      else if( _.eq(layer.type, MapLayerType.HEATMAP) ) {

      }
      ////////////////////////////////////////////////////////
      // Tile layer
      ////////////////////////////////////////////////////////
      else if( _.eq(layer.type, MapLayerType.TILE) ) {

      }
    }

    // Fit
    this.olmap.getView().fit(source.getExtent());
  }

  /**
   * Creation feature
   */
  private createFeature(source): void {

    ////////////////////////////////////////////////////////
    // Feature info
    ////////////////////////////////////////////////////////

    let field = this.pivot.columns[0];
    let geomType = field.field.logicalType.toString();

    ////////////////////////////////////////////////////////
    // Generate feature
    ////////////////////////////////////////////////////////

    // Feature list
    let features = [];

    // Data interate
    for(let i=0;i<this.data[0]["features"].length;i++) {

      let feature = new ol.Feature();
      feature = (new ol.format.GeoJSON()).readFeature(this.data[0].features[i]);

      if(geomType === "GEO_POINT") {
        let featureCenter = feature.getGeometry().getCoordinates();

        if(featureCenter.length === 1) {
          let extent = feature.getGeometry().getExtent();
          featureCenter = ol.extent.getCenter(extent);
          feature.setGeometry(new ol.geom.Point(featureCenter));
        }

        if(this.uiOption.fieldMeasureList.length > 0) {
          //히트맵 weight 설정
          if(this.data[0].valueRange[this.getUiMapOption().layers[0].color.column]) {
            feature.set('weight', feature.getProperties()[this.getUiMapOption().layers[0].color.column] / this.data[0].valueRange[this.getUiMapOption().layers[0].color.column].maxValue);
          }
        }
      }
      feature.set('layerNum', 1);
      features[i] = feature;
    }

    source.addFeatures(features);
  }

  /**
   * map style function
   */
  private mapStyleFunction = (layerNum, data) => {

    let styleOption: UIMapOption = this.getUiMapOption();
    let styleData = data[layerNum];

    function hexToRgbA(hex, alpha): string{
      var c;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length === 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
      } else {
        return 'rgba(255,255,255,1)';
      }
    }

    function setColorRange(uiOption, data, colorList: any, colorAlterList = []): ColorRange[] {

      // return value
      let rangeList = [];

      let rowsListLength = data.features.length;

      let gridRowsListLength = data.features.length;


      // colAlterList가 있는경우 해당 리스트로 설정, 없을시에는 colorList 설정
      let colorListLength = colorAlterList.length > 0 ? colorAlterList.length - 1 : colorList.length - 1;

      // less than 0, set minValue
      const minValue = data.valueRange[uiOption.layers[layerNum].color.column].minValue >= 0 ? 0 : _.cloneDeep(data.valueRange[uiOption.layers[0].color.column].minValue);

      // 차이값 설정 (최대값, 최소값은 값을 그대로 표현해주므로 length보다 2개 작은값으로 빼주어야함)
      const addValue = (data.valueRange[uiOption.layers[layerNum].color.column].maxValue - minValue) / colorListLength;

      let maxValue = _.cloneDeep(data.valueRange[uiOption.layers[layerNum].color.column].maxValue);

      let shape;
      // if ((<UIScatterChart>uiOption).pointShape) {
      //   shape = (<UIScatterChart>uiOption).pointShape.toString().toLowerCase();
      // }

      // set decimal value
      const formatValue = ((value) => {
        return parseFloat((Number(value) * (Math.pow(10, uiOption.valueFormat.decimal)) / Math.pow(10, uiOption.valueFormat.decimal)).toFixed(uiOption.valueFormat.decimal));
      });

      // decimal min value
      let formatMinValue = formatValue(data.valueRange[uiOption.layers[layerNum].color.column].minValue);
      // decimal max value
      let formatMaxValue = formatValue(data.valueRange[uiOption.layers[layerNum].color.column].maxValue);

      // set ranges
      for (let index = colorListLength; index >= 0; index--) {

        let color = colorList[index];

        // set the biggest value in min(gt)
        // if (index === 0) {
        //
        //   rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, formatMaxValue, null, formatMaxValue, null, shape));
        //
        // } else {
        // if it's the last value, set null in min(gt)
        let min = 0 == index ? null : formatValue(maxValue - addValue);

        // if value if lower than minValue, set it as minValue
        if (min < data.valueRange.minValue && min < 0) min = _.cloneDeep(formatMinValue);

        rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, min, formatValue(maxValue), min, formatValue(maxValue), shape));

        maxValue = min;
        // }
      }

      return rangeList;
    }

    return function(feature, resolution) {

      ////////////////////////////////////////////////////////
      // Style options
      ////////////////////////////////////////////////////////

      let layerType = styleOption.layers[layerNum].type;
      let featureColor = styleOption.layers[layerNum].color.schema;
      let featureColorType = styleOption.layers[layerNum].color.by;
      let symbolType = null;
      let outlineType = null;
      let lineDashType = null;
      let lineMaxVal = null;
      let outlineColor = null;
      let featureSizeType = null;

      // Symbol type
      if( _.eq(layerType, MapLayerType.SYMBOL) ) {
        let styleLayer: UISymbolLayer = <UISymbolLayer> styleOption.layers[layerNum];
        symbolType = styleLayer.symbol;
        outlineType = styleLayer.outline.thickness;
        outlineColor = styleLayer.outline.color;
        featureSizeType = styleLayer.size.by;
      }

      // Symbol type
      if( _.eq(layerType, MapLayerType.LINE) ) {
        let styleLayer: UILineLayer = <UILineLayer> styleOption.layers[layerNum];
        lineDashType = styleLayer.lineStyle;
      }


      //lineMaxVal = styleLayer.size.max;
      lineMaxVal = 1;


      ////////////////////////////////////////////////////////
      // Color
      ////////////////////////////////////////////////////////

      if( _.eq(layerType, MapLayerType.SYMBOL) && _.eq(featureColorType, MapBy.MEASURE)) {
        if(styleOption.layers[layerNum].color['ranges']) {
          for(let range of styleOption.layers[layerNum].color['ranges']) {
            let rangeMax = range.fixMax;
            let rangeMin = range.fixMin;

            if(rangeMax === null) {
              rangeMax = rangeMin + 1;
            } else if(rangeMin === null) {
              rangeMin = rangeMax;
            }

            if(rangeMax === rangeMin) {
              rangeMin = rangeMax - 1;
            }

            if( feature.getProperties()[styleOption.layers[layerNum].color.column] > rangeMin &&
              feature.getProperties()[styleOption.layers[layerNum].color.column] <= rangeMax) {
              featureColor = range.color;
            }
          }
        } else {
          const ranges = setColorRange(styleOption, styleData, ChartColorList[styleOption.layers[layerNum].color['schema']]);

          for(let range of ranges) {
            let rangeMax = range.fixMax;
            let rangeMin = range.fixMin;

            if(rangeMax === null) {
              rangeMax = rangeMin + 1;
            } else if(rangeMin === null) {
              rangeMin = rangeMax;
            }

            if(rangeMax === rangeMin) {
              rangeMin = rangeMax - 1;
            }

            if( feature.getProperties()[styleOption.layers[layerNum].color.column] > rangeMin &&
              feature.getProperties()[styleOption.layers[layerNum].color.column] <= rangeMax) {
              featureColor = range.color;
            }
          }
        }


      } else if( _.eq(featureColorType, MapBy.DIMENSION) ) {
        let colorList = ChartColorList[featureColor];
        featureColor = colorList[(parseInt(feature.getId().substring(26)) % colorList.length) - 1];
      } else if( _.eq(featureColorType, MapBy.NONE) ) {
        featureColor = styleOption.layers[layerNum].color.schema;
      }

      featureColor = hexToRgbA(featureColor, styleOption.layers[layerNum].color.transparency * 0.01);

      ////////////////////////////////////////////////////////
      // Outline
      ////////////////////////////////////////////////////////

      let outlineWidth = 0.00000001;
      if(outlineType === 'THIN')  {
        outlineWidth = 1;
      } else if(outlineType === 'NORMAL') {
        outlineWidth = 2;
      } else if(outlineType === 'THICK') {
        outlineWidth = 3;
      }

      let lineDash = [1];
      if( _.eq(lineDashType, MapLineStyle.DOTTED) ) {
        lineDash = [3,3];
      }
      else if( _.eq(lineDashType, MapLineStyle.DASHED) ) {
        lineDash = [4,8];
      }

      ////////////////////////////////////////////////////////
      // Size
      ////////////////////////////////////////////////////////

      let featureSize = 5;
      if( _.eq(layerType, MapLayerType.SYMBOL) && featureSizeType === 'MEASURE') {
        featureSize = parseInt(feature.get((<UISymbolLayer>styleOption.layers[layerNum]).size.column)) / (styleData.valueRange[(<UISymbolLayer>styleOption.layers[layerNum]).size.column].maxValue / 30);
        if(featureSize < 2) {
          featureSize = 2;
        }
      }

      let lineThickness = 2;
      if( _.eq(layerType, MapLayerType.SYMBOL) && featureSizeType === 'MEASURE') {
        lineThickness = parseInt(feature.get((<UISymbolLayer>styleOption.layers[layerNum]).size.column)) / (styleData.valueRange[(<UISymbolLayer>styleOption.layers[layerNum]).size.column].maxValue / lineMaxVal);
        if(lineThickness < 1) {
          lineThickness = 1;
        }
      }

      ////////////////////////////////////////////////////////
      // Creation style
      ////////////////////////////////////////////////////////

      let style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 4,
          fill: new ol.style.Fill({
            color: featureColor
          })
        }),
        stroke: new ol.style.Stroke({
          color: featureColor,
          width: lineThickness
        }),
        fill: new ol.style.Fill({
          color: featureColor
        })
      });

      if( _.eq(layerType, MapLayerType.SYMBOL) ) {
        switch (symbolType) {
          case 'CIRCLE' :
            style = new ol.style.Style({
              image: new ol.style.Circle({
                radius: featureSize,
                fill: new ol.style.Fill({
                  color: featureColor
                }),
                stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth})
              }),
              stroke: new ol.style.Stroke({
                color: outlineColor,
                width: outlineWidth
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            break;
          case 'SQUARE' :
            style = new ol.style.Style({
              image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: featureColor}),
                points: 4,
                radius: featureSize,
                angle: Math.PI / 4,
                stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth})
              }),
              stroke: new ol.style.Stroke({
                color: outlineColor,
                width: outlineWidth
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            break;
          case 'TRIANGLE' :
            style = new ol.style.Style({
              image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: featureColor}),
                points: 3,
                radius: featureSize,
                rotation: Math.PI / 4,
                angle: 0,
                stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth})
              }),
              stroke: new ol.style.Stroke({
                color: outlineColor,
                width: outlineWidth
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            break;
          case 'PIN' :
            style = new ol.style.Style({
              image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
                color: featureColor,
                crossOrigin: 'anonymous',
                scale: featureSize * 0.1,
                src: '../../../../../../assets/images/ic_pin.png'
              })),
              stroke: new ol.style.Stroke({
                color: outlineColor,
                width: outlineWidth
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            break;
          case 'PLANE' :
            style = new ol.style.Style({
              image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
                color: featureColor,
                crossOrigin: 'anonymous',
                scale: featureSize * 0.1,
                src: '../../../../../../assets/images/ic_map_airport.png'
              })),
              stroke: new ol.style.Stroke({
                color: outlineColor,
                width: outlineWidth
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            break;
          case 'USER' :
            style = new ol.style.Style({
              image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
                color: featureColor,
                crossOrigin: 'anonymous',
                scale: featureSize * 0.1,
                src: '../../../../../../assets/images/ic_map_human.png'
              })),
              stroke: new ol.style.Stroke({
                color: outlineColor,
                width: outlineWidth
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            break;
          default :
            style = new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: outlineColor,
                width: outlineWidth
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            break;
        }
      } else if( _.eq(layerType, MapLayerType.LINE) ) {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: featureColor,
            width: lineThickness,
            lineDash: lineDash
          })
        });
      } else if( _.eq(layerType, MapLayerType.POLYGON) ) {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: outlineColor,
            width: outlineWidth
          }),
          fill: new ol.style.Fill({
            color: featureColor
          })
        });
      } else if( _.eq(layerType, MapLayerType.TILE) ) {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: outlineColor,
            width: 1
          }),
          fill: new ol.style.Fill({
            color: featureColor
          })
        });
      }
      return style;
    }
  }

  /**
   * return lincense
   */
  private attribution(): string {
    return '© OpenStreetMap contributer';
  }

  /**
   * Create tooltip
   */
  private createTooltip(): void {

    let element = document.getElementById('popup');

    ////////////////////////////////////////////////////////
    // Create tooltip layer
    ////////////////////////////////////////////////////////

    if( !this.tooltipLayer ) {

      // Create
      this.tooltipLayer = new ol.Overlay({
        element: this.tooltipEl.nativeElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [-50, -100]
      });

      // Add
      this.olmap.addOverlay(this.tooltipLayer);
    }

    ////////////////////////////////////////////////////////
    // Add event
    ////////////////////////////////////////////////////////

    this.olmap.un('pointermove', this.tooltipFunction);
    this.olmap.on('pointermove', this.tooltipFunction);
  }

  /**
   * Tooltip mouse move event callback
   * @param event
   */
  private tooltipFunction = (event) => {

    // Get feature
    let feature = this.olmap.forEachFeatureAtPixel(event.pixel, (feature) => {
      return feature;
    });

    // Featrue check
    if( !feature ) {

      // Disable tooltip
      this.tooltipInfo.enable = false;
      this.tooltipLayer.setPosition(undefined);
      return;
    }

    ////////////////////////////////////////////////////////
    // Layer num & name
    ////////////////////////////////////////////////////////

    // Layer num
    this.tooltipInfo.num = feature.get('layerNum');

    // Layer name
    if(this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[17] !== null) {
      this.tooltipInfo.name = this.getUiMapOption().layers[this.tooltipInfo.num-1].name;
    }

    ////////////////////////////////////////////////////////
    // Geometry Type
    ////////////////////////////////////////////////////////

    this.tooltipInfo.geometryType = feature.getGeometry().getType();

    ////////////////////////////////////////////////////////
    // Coordinates
    ////////////////////////////////////////////////////////

    let coords = [0,0];
    let pointerX = coords[0].toFixed(4);
    let pointerY = coords[1].toFixed(4);

    if( _.eq(this.tooltipInfo.geometryType, String(MapGeometryType.POINT)) || _.eq(this.tooltipInfo.geometryType, String(MapGeometryType.LINE)) ) {
      coords = feature.getGeometry().getCoordinates();
    } else {
      let extent = feature.getGeometry().getExtent();
      coords = ol.extent.getCenter(extent);
    }

    this.tooltipInfo.coords = [];

    if(this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[18] !== null) {
      // Line Type
      if (_.eq(this.tooltipInfo.geometryType, String(MapGeometryType.LINE))) {
        this.tooltipInfo.coords[0] = coords[0];
        this.tooltipInfo.coords[coords.length - 1] = coords[coords.length - 1];
      }
      // Other
      else {
        this.tooltipInfo.coords[0] = coords[0].toFixed(4) + ', ' + coords[1].toFixed(4);
      }
    }

    ////////////////////////////////////////////////////////
    // Field info
    ////////////////////////////////////////////////////////

    // Properties (DATA_VALUE)
    if(this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[19] !== null) {

      let aggregationKeys: any[] = [];
      for( let key in feature.getProperties()) {
        _.each(this.getUiMapOption().toolTip.displayColumns, (field, idx) => {
          if( _.eq(field, key) ) {
            aggregationKeys.push({ idx: idx, key: key });
            return false;
          }
        });
      }

      _.each(_.orderBy(aggregationKeys, ['idx']), (aggregationKey) => {
        let tooltipVal = feature.get(aggregationKey.key);
        if (aggregationKey.key !== 'geometry' && aggregationKey.key !== 'weight' && aggregationKey.key !== 'layerNum') {
          let field = {
            name: '',
            value: ''
          };
          if (aggregationKey.key === 'features') {
            field.name = aggregationKey.key;
            field.value = feature.get(aggregationKey.key).length;
          } else {
            if( typeof(tooltipVal) === "number" ) {
              tooltipVal = FormatOptionConverter.getFormatValue(tooltipVal, this.getUiMapOption().valueFormat);
            }
            field.name = aggregationKey.key;
            field.value = tooltipVal;
          }
        }
      });
    }

    ////////////////////////////////////////////////////////
    // Apply
    ////////////////////////////////////////////////////////

    // Enable tooltip
    this.tooltipInfo.enable = true;

    if( _.eq(this.tooltipInfo.geometryType, String(MapGeometryType.LINE)) ) {
      let extent = feature.getGeometry().getExtent();
      coords = ol.extent.getCenter(extent);
      this.tooltipLayer.setPosition(coords);
    } else {
      this.tooltipLayer.setPosition(coords);
    }
  };

  /**
   * Create legend
   */
  private createLegend(): void {

    ////////////////////////////////////////////////////////
    // Enable check
    ////////////////////////////////////////////////////////

    if( !this.getUiMapOption().legend.auto ) {
      this.legendInfo.enable = false;
      return;
    }

    if( !this.uiOption.legend.showName ) {
      this.legendInfo.enable = false;
      return;
    }

    ////////////////////////////////////////////////////////
    // Legend position
    ////////////////////////////////////////////////////////

    this.legendInfo.position = String(this.getUiMapOption().legend.pos);

    ////////////////////////////////////////////////////////
    // Legend info
    ////////////////////////////////////////////////////////

    this.legendInfo.layer = [];

    for( let num: number = 0 ; num < this.getUiMapOption().layers.length ; num++ ) {

      ////////////////////////////////////////////////////////
      // Layer info
      ////////////////////////////////////////////////////////

      let legendInfo: any = {};

      // Layer
      let layer: UILayers = this.getUiMapOption().layers[num];

      // Layer name
      legendInfo.name = layer.name;

      ////////////////////////////////////////////////////////
      // Color by dimension
      ////////////////////////////////////////////////////////
      if( _.eq(layer.color.by, MapBy.DIMENSION) ) {

        // Layer type
        legendInfo.type = layer.type;

        // Color data
        legendInfo.color = [];

        if( layer.color.ranges ) {
          _.each(layer.color.ranges, (range) => {
            let colorInfo: any = {};
            colorInfo.color = range.color;
            colorInfo.column = "???";
            legendInfo.color.push(colorInfo);
          });
        }
        else {
          if( layer.color.column !== 'NONE') {
            const ranges = this.setDimensionColorRange(layer, this.data[num], ChartColorList[layer.color.schema], []);
            _.each(ranges, (range) => {
              let colorInfo: any = {};
              colorInfo.color = range.color;
              colorInfo.column = "???";
              legendInfo.color.push(colorInfo);
            });
          }
          else {
            _.each(this.getUiMapOption().fieldList, (field) => {
              let colorInfo: any = {};
              //colorInfo.color = "";
              colorInfo.column = field;
              legendInfo.color.push(colorInfo);
            });
          }
        }
      }
      ////////////////////////////////////////////////////////
      // Color by measure
      ////////////////////////////////////////////////////////
      else if( _.eq(layer.color.by, MapBy.MEASURE) ) {

        // Layer type
        legendInfo.type = String(layer.type).charAt(0).toUpperCase() + String(layer.type).slice(1) + ' Color';

        // Layer column
        legendInfo.column = 'By ' + layer.color.column;

        if( layer.color.ranges ) {
          _.each(layer.color.ranges, (range, index) => {
            let minVal: number = range.fixMin;
            let maxVal: number = range.fixMax;

            if(minVal === null) minVal = maxVal;
            if(maxVal === null) maxVal = minVal;

            let colorInfo: any = {};
            colorInfo.color = range.color;
            if( index == 0 ) {
              colorInfo.column = ' ＞ ' + FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat);
            }
            else if( index ==layer.color.ranges.length - 1 ) {
              colorInfo.column = ' ≤ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
            }
            else {
              colorInfo.column = FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat)
                + ' ~ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
            }
            legendInfo.color.push(colorInfo);
          });
        }
        else {

          if(this.data[num].valueRange && this.data[num].valueRange[layer.color.column]) {
            const ranges = this.setLayerColorRange(this.getUiMapOption(), this.data[num], ChartColorList[layer.color.schema], num, []);
            _.each(ranges, (range, index) => {
              let minVal: number = range.fixMin;
              let maxVal: number = range.fixMax;

              if(minVal === null) minVal = maxVal;
              if(maxVal === null) maxVal = minVal;

              let colorInfo: any = {};
              colorInfo.color = range.color;
              if( index == 0 ) {
                colorInfo.column = ' ＞ ' + FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat);
              }
              else if( index ==layer.color.ranges.length - 1 ) {
                colorInfo.column = ' ≤ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
              }
              else {
                colorInfo.column = FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat)
                  + ' ~ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
              }
              legendInfo.color.push(colorInfo);
            });
          }

          // if(this.getUiMapOption().layers[i].color["customMode"]) {
          //   legendHtml = '<div class="ddp-ui-layer">' +
          //     '<span class="ddp-label">' + this.getUiMapOption().layers[i].name + '</span>' +
          //     '<span class="ddp-data">' + this.getUiMapOption().layers[i].type + ' by ' + this.getUiMapOption().layers[i].color.column + '</span>' +
          //     '<ul class="ddp-list-remark">';
          //
          //   if(this.getUiMapOption().layers[i].color["customMode"] === 'SECTION') {
          //     let rangesLength = this.getUiMapOption().layers[i].color["ranges"].length;
          //     this.getUiMapOption().layers[i].color["ranges"][0]["isMax"] = true;
          //     this.getUiMapOption().layers[i].color["ranges"][rangesLength-1]["isMin"] = true;
          //
          //     for(let range of this.getUiMapOption().layers[i].color["ranges"]) {
          //
          //       let minVal = range.fixMin;
          //       let maxVal = range.fixMax;
          //
          //       if(minVal === null) minVal = 0;
          //       if(maxVal === null) maxVal = minVal;
          //
          //       legendHtml = legendHtml + '<li><em class="ddp-bg-remark-r" style="background-color:' + range.color + '"></em>';
          //       if (range["isMax"]) {
          //         legendHtml = legendHtml + ' ＞ ' + FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat);
          //       } else if (range["isMin"]) {
          //         legendHtml = legendHtml + ' ≤ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
          //       } else {
          //         legendHtml = legendHtml + FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat) + ' ~ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
          //       }
          //       legendHtml = legendHtml + '</li>';
          //     }
          //   }
          // }
        }
      }
      ////////////////////////////////////////////////////////
      // None
      ////////////////////////////////////////////////////////
      else if( _.eq(layer.color.by, MapBy.NONE) ) {

        // Layer type
        legendInfo.type = layer.type+ ' Color';

        _.each(this.getUiMapOption().fielDimensionList, (field, index) => {
          let colorInfo: any = {};
          colorInfo.color = layer.color.schema;
          colorInfo.column = field.alias;
          legendInfo.color.push(colorInfo);
        });
      }
      ////////////////////////////////////////////////////////
      // Error
      ////////////////////////////////////////////////////////
      else {
        return;
      }

      this.legendInfo.layer.push(legendInfo);
    }

    ////////////////////////////////////////////////////////
    // Apply
    ////////////////////////////////////////////////////////

    this.legendInfo.enable = true;
  }

  /**
   * return ranges of color by dimension
   * @returns {any}
   */
  private setDimensionColorRange(layer: UILayers, data: any, colorList: any, colorAlterList = []): ColorRange[] {

    let rangeList = [];
    let featureList = [];
    _.each(data.features, (feature) => {
      featureList.push(feature.properties)
    });

    let featuresGroup = _.groupBy(featureList, layer.color.column);
    _.each(Object.keys(featuresGroup), (column) => {
      let color = colorList[featuresGroup[column].length % colorList.length];
      rangeList.push({column: column, color: color});
    });

    return rangeList;
  }

  /**
   * return ranges of color by measure
   * @returns {any}
   */
  private setLayerColorRange(uiOption: UIMapOption, data: any, colorList: any, layerIndex: number, colorAlterList = []): ColorRange[] {

    // return value
    let rangeList = [];

    let rowsListLength = data.features.length;

    let gridRowsListLength = data.features.length;

    // colAlterList가 있는경우 해당 리스트로 설정, 없을시에는 colorList 설정
    let colorListLength = colorAlterList.length > 0 ? colorAlterList.length - 1 : colorList.length - 1;

    // less than 0, set minValue
    const minValue = data.valueRange[uiOption.layers[layerIndex].color.column].minValue >= 0 ? 0 : _.cloneDeep(data.valueRange[uiOption.layers[layerIndex].color.column].minValue);

    // 차이값 설정 (최대값, 최소값은 값을 그대로 표현해주므로 length보다 2개 작은값으로 빼주어야함)
    const addValue = (data.valueRange[uiOption.layers[layerIndex].color.column].maxValue - minValue) / (colorListLength + 1);

    let maxValue = _.cloneDeep(data.valueRange[uiOption.layers[layerIndex].color.column].maxValue);

    let shape;

    // set decimal value
    const formatValue = ((value) => {
      return parseFloat((Number(value) * (Math.pow(10, uiOption.valueFormat.decimal)) / Math.pow(10, uiOption.valueFormat.decimal)).toFixed(uiOption.valueFormat.decimal));
    });

    // decimal min value
    let formatMinValue = formatValue(data.valueRange[uiOption.layers[layerIndex].color.column].minValue);
    // decimal max value
    let formatMaxValue = formatValue(data.valueRange[uiOption.layers[layerIndex].color.column].maxValue);

    // set ranges
    for (let index = colorListLength; index >= 0; index--) {

      let color = colorList[index];

      let min = 0 == index ? null : formatValue(maxValue - addValue);

      // if value if lower than minValue, set it as minValue
      if (min < data.valueRange.minValue && min < 0) min = _.cloneDeep(formatMinValue);

      rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, min, formatValue(maxValue), min, formatValue(maxValue), shape));

      maxValue = min;
      // }
    }

    return rangeList;
  }
}
