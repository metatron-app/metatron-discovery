/**
 * Created by Dolkkok on 2017. 7. 18..
 */

import {
  AfterViewInit, Component, ElementRef, Injector, OnInit, OnDestroy, HostListener,
  ViewChild, Input
} from '@angular/core';
import { BaseChart } from '../../base-chart';
import {BaseOption} from "../../option/base-option";
import {ChartType, ShelveType, ShelveFieldType} from "../../option/define/common";
import {Pivot} from "../../../../../domain/workbook/configurations/pivot";
import {DatasourceService} from '../../../../../datasource/service/datasource.service';
import {SearchQueryRequest} from "../../../../../domain/datasource/data/search-query-request";
import {PageWidget} from "../../../../../domain/dashboard/widget/page-widget";
import {FormatOptionConverter} from '../../../../../common/component/chart/option/converter/format-option-converter';

import * as _ from 'lodash';
import { UIOption, ColorRange } from '../../option/ui-option';
import {
  ChartColorList,
  ColorRangeType
} from '../../option/define/common';
// import * as ol from '../../../../../../../node_modules/ol';
import * as ol from 'openlayers';
import * as h3 from 'h3-js';

import { OptionGenerator } from '../../../../../common/component/chart/option/util/option-generator';
import UI = OptionGenerator.UI;


export class Map {
  public show: boolean;
}

@Component({
  selector: 'map-chart',
  templateUrl: 'map-chart.component.html'
})
export class MapChartComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('mapArea')
  private area: ElementRef;
  private $area: any;

  public olmap: ol.Map = undefined;
  public mapVaild: boolean = false;
  public mapVaildSecondLayer: boolean = false;
  public mapVaildThirdLayer: boolean = false;
  public data: Map = new Map();
  public mouseX = 0;
  public mouseY = 0;
  public property = 0;

  @Input()
  public widget: PageWidget;

  public query: SearchQueryRequest;
  @Input("query")
  public set setQuery(query: SearchQueryRequest) {
    this.query = query;
  }

  public secondLayerQuery: SearchQueryRequest;
  public thirdLayerQuery: SearchQueryRequest;


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private datasourceService: DatasourceService ) {

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

    // init top
    if (document.getElementsByClassName("ddp-ui-chart-contents") && document.getElementsByClassName("ddp-ui-chart-contents").length > 0) {
      document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '';
    }

    // Destory
    super.ngOnDestroy();
  }

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
   * 선반정보를 기반으로 차트를 그릴수 있는지 여부를 체크
   * - 반드시 각 차트에서 Override
   */
  public isValid(pivot: Pivot): boolean {

    let mapVaild: boolean = false;
    if(pivot !== undefined) {
      for(let column of pivot.columns) {
        if(column.field && column.field.logicalType && column.field.logicalType.toString().indexOf("GEO") === 0) {
          mapVaild = true;
        }
      }
    }

    return mapVaild;
  }

  public onMoveEnd(evt) {
    let map = evt.map;
    let extent = map.getView().calculateExtent(map.getSize());
    console.info(extent);
  }

  //set basemap license
  public attribution(): any {
    return [new ol.Attribution({
      html: this.uiOption.licenseNotation
    })];
    // return '© OpenStreetMap contributer';
  }

  // Colored basemap layer
  public osmLayer = new ol.layer.Tile({
      source: new ol.source.OSM()
  });

  // Light basemap layer
  public cartoPositronLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url:'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
      })
  });

  // Dark basemap layer
  public cartoDarkLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url:'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      })
  });

  /**
   * create map
   */
  public createMap(): void {

    let layer = this.cartoPositronLayer;

    if( !this.uiOption.toolTip ) {
      this.uiOption.toolTip = {};
    }

    // init displayTypes
    if (!this.uiOption.toolTip.displayTypes) {
      this.uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(this.uiOption.type);
    }

    // select basemap
    if(this.uiOption.map === 'Light') {
      layer = this.cartoPositronLayer;
    } else if(this.uiOption.map === 'Dark') {
      layer = this.cartoDarkLayer;
    }

    let drawFinished = this.drawFinished;
    // layer.getSource().on('tileloadend', function(event) {
    //   drawFinished.emit();
    // });
    // layer.on('render', function(event) {
    //   drawFinished.emit();
    // });

    // map object init
    this.olmap = new ol.Map({
      view: new ol.View({
        center: [126, 37], // 초기 지도 center좌표
        zoom: 6, // 초기 줌레벨
        projection: 'EPSG:4326', // 좌표계 고정
        maxZoom: 20, // 최대줌레벨
        minZoom: 4 // 최소줌레벨 - 해상도별로 지도를 보여주는 영역이 달라서 확인 필요..
      }),
      layers: [layer],
      target: this.$area[0]
    });

    // map license 위치 이동 오른쪽 하단 -> 왼쪽 하단
    for(let i=0;i<document.getElementsByClassName('ol-attribution').length;i++) {
      let element = document.getElementsByClassName('ol-attribution')[i] as HTMLElement;
      element.style.right = "auto";
      element.style.left = ".5em";
    }

    // canvas size 변경되었을때 찌그러진 지도 펴기
    this.olmap.updateSize();

    // 지도 왼쪽 상단 줌/아웃 버튼
    const zoomslider = new ol.control.ZoomSlider();
    this.olmap.addControl(zoomslider);

    //지도 생성 체크
    this.mapVaild = true;
  }


  /**
   * map style function
   */
  public mapStyleFunction = (layerNum, data) => {

    let styleOption = this.uiOption;
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

    //measure 기준 color range 계산
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

      let layerType = styleOption.layers[layerNum].type;  // Type : symbol, line, polygon
      let symbolType = styleOption.layers[layerNum].symbol; // Symbol Type : CIRCLE, SQUARE, TRIANGLE, PIN, PLANE, USER
      let outlineType = styleOption.layers[layerNum].outline.thickness; // 외곽선 굵기
      let lineDashType = styleOption.layers[layerNum].pathType; // 라인 Type : 실선, 점선, 파선
      let lineMaxVal = styleOption.layers[layerNum].thickness.maxValue; // 라인 최대 굵기
      let featureColor = styleOption.layers[layerNum].color.schema; // 색상 코드
      let outlineColor = styleOption.layers[layerNum].outline.color; // 외곽선 색상
      let featureColorType = styleOption.layers[layerNum].color.by; // 색상 기준 : None, Dimension, Measure
      let featureSizeType = styleOption.layers[layerNum].size.by; // 크기 기준 :  None, Dimension, Measure

      //최소값 지정하여 선이 없는 것 처럼 보이게 하려고..
      let outlineWidth = 0.00000001;
      if(outlineType === 'THIN')  {
        outlineWidth = 1;
      } else if(outlineType === 'NORMAL') {
        outlineWidth = 2;
      } else if(outlineType === 'THICK') {
        outlineWidth = 3;
      }

      let lineDash = [1];
      if(lineDashType === 'DOT') { // 점선
        lineDash = [3,3];
      } else if(lineDashType === 'DASH') { // 파선
        lineDash = [4,8];
      }

      let featureSize = 5;
      if(styleOption.layers[layerNum].size.column && featureSizeType === 'MEASURE') { // Measure 기준 크기 계산 min 2, max 30
        featureSize = parseInt(feature.get(styleOption.layers[layerNum].size.column)) / (styleData.valueRange[styleOption.layers[layerNum].size.column].maxValue / 30);
        if(featureSize < 2) {
          featureSize = 2;
        }
      }

      let lineThickness = 2;
      if(styleOption.layers[layerNum].thickness.column != 'NONE' && featureSizeType === 'MEASURE') { // Measure 기준 굵기 계산 min 1, max lineMaxVal
        lineThickness = parseInt(feature.get(styleOption.layers[layerNum].thickness.column)) / (styleData.valueRange[styleOption.layers[layerNum].thickness.column].maxValue / lineMaxVal);
        if(lineThickness < 1) {
          lineThickness = 1;
        }
      }

      // feature 객체 (symbol, line, polygon) 의 색상 지정
      if(styleOption.layers[layerNum].color.column && featureColorType === 'MEASURE') {
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

      } else if(featureColorType === 'DIMENSION') {
        let colorList = ChartColorList[featureColor];
        featureColor = colorList[(parseInt(feature.getId().substring(26)) % colorList.length) - 1];
      } else if(featureColorType === 'NONE') {
        featureColor = styleOption.layers[layerNum].color.schema;
      }

      // color code hex -> rgba transparency 적용
      featureColor = hexToRgbA(featureColor, styleOption.layers[layerNum].color.transparency * 0.01);

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

      if(layerType === 'symbol') {
        switch (symbolType) {
          case 'CIRCLE' :
            style = new ol.style.Style({
              image: new ol.style.Circle({
                  radius: featureSize, // 심볼 크기
                  fill: new ol.style.Fill({
                      color: featureColor // 심볼 색상
                  }),
                  stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}) // 심볼 외곽선
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
                points: 4, // 사각형
                radius: featureSize,
                angle: Math.PI / 4, // 각도
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
                points: 3, // 삼각형
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
      } else if(layerType === 'line') { // 라인 스타일
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: featureColor,
            width: lineThickness,
            lineDash: lineDash
          })
        });
      } else if(layerType === 'polygon') { // 폴리곤 스타일
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: outlineColor,
            width: outlineWidth
          }),
          fill: new ol.style.Fill({
            color: featureColor
          })
        });
      } else if(layerType === 'tile') { // 헥사곤 스타일 -> hexagonStyleFunction 이 있어서 필요 없음?
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
   * hexagon map style function
   */
  public hexagonStyleFunction = (layerNum, data) => {

    let styleData = data[layerNum];
    let styleOption = this.uiOption;

    function hexToRgbA(hex, alpha): string{
      var c;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
          c= hex.substring(1).split('');
          if(c.length== 3){
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
      const minValue = data.valueRange[uiOption.layers[layerNum].color.column].minValue >= 0 ? 0 : _.cloneDeep(data.valueRange[uiOption.layers[layerNum].color.column].minValue);

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

      let outlineType = styleOption.layers[layerNum].outline.thickness;
      let featureColor = styleOption.layers[layerNum].color.schema;
      let outlineColor = styleOption.layers[layerNum].outline.color;
      let featureColorType = styleOption.layers[layerNum].color.by;
      let featureSizeType = styleOption.layers[layerNum].size.by;

      if(featureColorType === 'MEASURE') {
          if(styleOption.layers[layerNum].color['ranges']) {
            for(let range of styleOption.layers[layerNum].color['ranges']) {
              let rangeMax = range.fixMax;
              let rangeMin = range.fixMin;

              if(rangeMax === null) {
                rangeMax = rangeMin + 1;
              } else if(rangeMin === null) {
                rangeMin = rangeMax;
              }

              if( feature.getProperties()[styleOption.layers[layerNum].color.column] > rangeMin &&  feature.getProperties()[styleOption.layers[layerNum].color.column] <= rangeMax) {
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

              if( feature.getProperties()[styleOption.layers[layerNum].color.column] > rangeMin &&
              feature.getProperties()[styleOption.layers[layerNum].color.column] <= rangeMax) {
                featureColor = range.color;
              }
            }
          }
      } else if(featureColorType === 'DIMENSION') {
        let colorList = ChartColorList[featureColor];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      }

      featureColor = hexToRgbA(featureColor, styleOption.layers[layerNum].color.transparency * 0.01);

      let style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 1
        }),
        fill: new ol.style.Fill({
          color: featureColor
        })
      });

      return style;
    }
  }

  /**
   * text map style function
   */
  public textStyleFunction = () => {

    let styleOption = this.uiOption;
    let styleData = this.data;

    return function(feature, resolution) {

      let labelText = "";
      for(var key in feature.getProperties()) {
        if (key !== 'geometry') {
          labelText = labelText + feature.get(key) + "\n";
        }
      }

      let labelStyle = new ol.style.Style({
        geometry: function(feature) {
          var geometry = feature.getGeometry(); // 라벨의 위치
          if (geometry.getType() == 'MultiPolygon') {
            // Only render label for the widest polygon of a multipolygon
            var polygons = geometry.getPolygons();
            var widest = 0;
            for (var i = 0, ii = polygons.length; i < ii; ++i) {
              var polygon = polygons[i];
              var width = ol.extent.getWidth(polygon.getExtent());
              if (width > widest) {
                widest = width;
                geometry = polygon;
              }
            }
          }
          return geometry;
        },
        text: new ol.style.Text({
          text: labelText, // 라벨값
          font: '12px Calibri,sans-serif', // 라벨 폰트
          overflow: true,
          fill: new ol.style.Fill({
            color: '#000' // 라벨 색상
          }),
          stroke: new ol.style.Stroke({
            color: '#fff', // 라벨 외곽선
            width: 3
          })
        })
      });
      return labelStyle;
    }
  }

  public clusterStyleFunction = (layerNum, data) => {

    let styleOption = this.uiOption;
    let styleData = data[layerNum];

    function hexToRgbA(hex, alpha): string{
      var c;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
          c= hex.substring(1).split('');
          if(c.length== 3){
              c= [c[0], c[0], c[1], c[1], c[2], c[2]];
          }
          c= '0x'+c.join('');
          return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
      } else {
        return 'rgba(255,255,255,1)';
      }
    }

    return function (feature, resolution) {
      let layerType = (<any>window).uiOption.layers[layerNum].type;
      let symbolType = (<any>window).uiOption.layers[layerNum].symbol;
      let outlineType = (<any>window).uiOption.layers[layerNum].outline.thickness;
      let featureColor = (<any>window).uiOption.layers[layerNum].color.schema;
      let outlineColor = (<any>window).uiOption.layers[layerNum].outline.color;
      let featureColorType = (<any>window).uiOption.layers[layerNum].color.by;

      let outlineWidth = 0.00000001;
      if(outlineType === 'THIN')  {
        outlineWidth = 1;
      } else if(outlineType === 'NORMAL') {
        outlineWidth = 2;
      } else if(outlineType === 'THICK') {
        outlineWidth = 3;
      }

      if(featureColorType === 'MEASURE') {

        if(styleData.valueRange) {
          let colorList = ChartColorList[featureColor];
          let avgNum = styleData.valueRange[styleOption.layers[layerNum].color.column].maxValue / colorList.length;

          let featurePropVal = 0;

          if(feature.getProperties()["features"]) {
            for(let clusterFeature of feature.getProperties()["features"]) {
              featurePropVal = featurePropVal + clusterFeature.getProperties()[styleOption.layers[layerNum].color.column];
            }
            featurePropVal = featurePropVal / feature.getProperties()["features"].length;
          }

          for(let i=0;i<colorList.length;i++) {
            if(featurePropVal <= avgNum * (i+1) &&
              featurePropVal >= avgNum * (i)) {
              featureColor = colorList[i];
            }
          }
        }

        if(styleOption.layers[layerNum].color['customMode'] === 'SECTION') {
          for(let range of styleOption.layers[layerNum].color['ranges']) {
            let rangeMax = range.fixMax;
            let rangeMin = range.fixMin;

            if(rangeMax === null) {
              rangeMax = rangeMin + 1;
            } else if(rangeMin === null) {
              rangeMin = 0;
            }

            let featurePropVal = 0;

            for(let clusterFeature of feature.getFeatures()["features"]) {
              featurePropVal = featurePropVal + clusterFeature.getProperties()[styleOption.layers[layerNum].color.column];
            }
            featurePropVal = featurePropVal / feature.getFeatures()["features"].length;

            if( featurePropVal > rangeMin &&  featurePropVal < rangeMax) {
              featureColor = range.color;
            }

          }
        }
      }
      else if(featureColorType === 'DIMENSION') {
        let colorList = ChartColorList[featureColor];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      } else if(featureColorType === 'NONE') {
        featureColor = styleOption.layers[layerNum].color.schema;
      }

      featureColor = hexToRgbA(featureColor, styleOption.layers[layerNum].color.transparency * 0.01);

      let size = 0;

      if(feature.get('features')) {
        size = feature.get('features').length;
      }

      let style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: size,
            fill: new ol.style.Fill({
                color: 'blue'
            })
        })
      });

      // 클러스터링은 symbol의 CIRCLE, SQUARE, TRIANGLE 만 지원
      if(layerType === 'symbol') {
        switch (symbolType) {
          case 'CIRCLE' :
            style = new ol.style.Style({
              image: new ol.style.Circle({
                  radius: 15,
                  fill: new ol.style.Fill({
                      color: featureColor
                  }),
                  stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth})
              }),
              text: new ol.style.Text({ // 클러스터링 되는 갯수 라벨링
                text: size.toString(), // 클러스터링 갯수
                fill: new ol.style.Fill({
                  color: '#fff'
                })
              })
            });
            break;
          case 'SQUARE' :
            style = new ol.style.Style({
              image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: featureColor}),
                stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
                points: 4,
                radius: 15,
                angle: Math.PI / 4
              }),
              text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                  color: '#fff'
                })
              })
            });
            break;
          case 'TRIANGLE' :
            style = new ol.style.Style({
              image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: featureColor}),
                stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
                points: 3,
                radius: 15,
                rotation: Math.PI / 4,
                angle: 0
              }),
              text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                  color: '#fff'
                })
              })
            });
            break;
        }
      }

      return style;
    }
  }

  //공간 필터 생성 - 현재 사용 안함
  public creteFilter(filterNm?:string, propertyNm?:string, literals?:any) {

    let f = ol.format.filter;
    let filter = null;

    switch (filterNm)  {
      case 'bbox' :
        filter = f.bbox(propertyNm, literals);
        break;
      case 'equalTo' :
        filter = f.equalTo(propertyNm, literals);
        break;
      case 'notEqualTo' :
        filter = f.notEqualTo(propertyNm, literals);
        break;
      case 'like' :
        filter = f.like(propertyNm, literals);
        break;
      // case 'between' :
      //   filter = f.between(propertyNm, literals);
      //   break;
      case 'greaterThan' :
        filter = f.greaterThan(propertyNm, literals);
        break;
      case 'lessThan' :
        filter = f.lessThan(propertyNm, literals);
        break;
      // case 'intersect' :
      //   filter = f.intersect(propertyNm, literals);
      //   break;
      // case 'within' :
      //   filter = f.within(propertyNm, literals);
      //   break;
    }

    return filter;

  }

  /**
   * return center coords of extent
   * @returns {any}
   */
  public getCenterOfExtent(Extent) {
    var X = Extent[0] + (Extent[2]-Extent[0])/2;
    var Y = Extent[1] + (Extent[3]-Extent[1])/2;
    return [X, Y];
  }


  /**
   * return ranges of color by measure
   * @returns {any}
   */
  public setColorRange(uiOption, data, colorList: any, layerIndex: number, colorAlterList = []): ColorRange[] {

    // return value
    let rangeList = [];

    let rowsListLength = data.features.length;

    let gridRowsListLength = data.features.length;

    // colAlterList가 있는경우 해당 리스트로 설정, 없을시에는 colorList 설정
    let colorListLength = colorAlterList.length > 0 ? colorAlterList.length - 1 : colorList.length - 1;

    // less than 0, set minValue
    const minValue = data.valueRange[uiOption.layers[layerIndex].color.column].minValue >= 0 ? 0 : _.cloneDeep(data.valueRange[uiOption.layers[layerIndex].color.column].minValue);

    // 차이값 설정 (최대값, 최소값은 값을 그대로 표현해주므로 length보다 2개 작은값으로 빼주어야함)
    const addValue = (data.valueRange[uiOption.layers[layerIndex].color.column].maxValue - minValue) / colorListLength;

    let maxValue = _.cloneDeep(data.valueRange[uiOption.layers[layerIndex].color.column].maxValue);

    let shape;
    // if ((<UIScatterChart>uiOption).pointShape) {
    //   shape = (<UIScatterChart>uiOption).pointShape.toString().toLowerCase();
    // }

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

      // set the biggest value in min(gt)
      // if (index == 0) {
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

  /**
   * 차트에 설정된 옵션으로 차트를 그린다.
   * - 각 차트에서 ride
   * @param isKeepRange: 현재 스크롤 위치를 기억해야 할 경우
   */
  public draw(isKeepRange?: boolean): void {
    console.log('=== map component draw ===');
    (<any>window).uiOption = this.uiOption;
    (<any>window).styleData = this.data;

    ////////////////////////////////////////////////////////
    // Valid 체크
    ////////////////////////////////////////////////////////

    if( !this.isValid(this.pivot) ) {
      // No Data 이벤트 발생
      this.data.show = false;
      this.noData.emit();
      return;
    }

    ////////////////////////////////////////////////////////
    // series
    ////////////////////////////////////////////////////////

    // 차트 시리즈 정보를 변환
    // this.chartOption = this.convertSeries();

    // console.info(this.chartOption);

    ////////////////////////////////////////////////////////
    // 업데이트
    ////////////////////////////////////////////////////////

    console.info(this.uiOption);
    this.data.show = true;

    // 엘리먼트 반영
    this.changeDetect.detectChanges();


    let source = new ol.source.Vector();
    let hexagonSource = new ol.source.Vector();

    //symbol, line, polygon 레이어 공용
    let symbolLayer = new ol.layer.Vector({
      source: source,
      style: this.mapStyleFunction(0, this.data),
      // opacity: this.uiOption.layers[0].color.transparency / 100
    });

    //symbol cluster 레이어
    let clusterLayer = new ol.layer.Vector({
      source: source,
      style: this.clusterStyleFunction(0, this.data),
      // opacity: this.uiOption.layers[0].color.transparency / 100
    });

    let featureColor = this.uiOption.layers[0].color.schema;
    let colorList = ChartColorList[featureColor];

    //사용자 색상일때 colorList 생성 - 히트맵에서 사용
    if(this.uiOption.layers[0].color["customMode"] === "SECTION") {
      colorList = [];
      for(let range of this.uiOption.layers[0].color["ranges"]) {
        colorList.push(range.color);
      }
      colorList = colorList.reverse();
    }

    // heatmap layer
    let heatmapLayer = new ol.layer.Heatmap({
      source: source,
      // style: this.clusterStyleFunction(0, this.data),
      opacity: this.uiOption.layers[0].color.transparency / 100, //투명도
      blur: this.uiOption.layers[0].blur, //흐림
      radius: this.uiOption.layers[0].radius, //반경
      gradient: colorList //gradation color list
    });

    // hexagon tile layer
    let hexagonLayer = new ol.layer.Vector({
      source: hexagonSource,
      style: this.hexagonStyleFunction(0, this.data),
      // opacity: this.uiOption.layers[0].color.transparency / 100
    });

    // label layer
    let textLayer = new ol.layer.Vector({
      source: source,
      style: this.textStyleFunction()
    });

    let features = [];
    let hexagonFeatures = (new ol.format.GeoJSON()).readFeatures(this.data[0]);
    // let features = (new ol.format.GeoJSON()).readFeatures(this.data[0]);

    let field = this.pivot.columns[0];
    let geomType = field.field.logicalType.toString();

    // Server Data를 openlayer feature 객체로 변환
    for(let i=0;i<this.data[0]["features"].length;i++) {

      let feature = new ol.Feature();
      feature = (new ol.format.GeoJSON()).readFeature(this.data[0].features[i]);

      // 지도 타입이 심볼인데 데이터가 Polygon일 경우 Point로 변환
      if(geomType === "GEO_POINT") {
        let featureCenter = feature.getGeometry().getCoordinates();

        if(featureCenter.length === 1) {
          let extent = feature.getGeometry().getExtent();
          featureCenter = ol.extent.getCenter(extent);
          feature.setGeometry(new ol.geom.Point(featureCenter));
        }

        if(this.uiOption.fieldMeasureList.length > 0) {
          //히트맵 weight 설정
          if(this.data[0].valueRange[this.uiOption.layers[0].color.column]) {
            feature.set('weight', feature.getProperties()[this.uiOption.layers[0].color.column] / this.data[0].valueRange[this.uiOption.layers[0].color.column].maxValue);
          }
        }
      }
      feature.set('layerNum', 1); //feature 별로 선반 번호 부여
      features[i] = feature;
    }

    for(let feature of hexagonFeatures) {
      feature.set('layerNum', 1);
    }

    hexagonSource.addFeatures(hexagonFeatures);
    source.addFeatures(features);

    let clusterSource = new ol.source.Cluster({
      distance: 30, // 클러스터링 반경 px단위
      source: source
    });

    symbolLayer.setSource(source);
    hexagonLayer.setSource(hexagonSource);
    textLayer.setSource(source);

    if(geomType === "GEO_POINT") {
      clusterLayer.setSource(clusterSource);
    }

    // ol.Map 지도 객체가 없을떄
    if(!this.mapVaild) {
      this.createMap();

      this.osmLayer.getSource().setAttributions(this.attribution());
      this.cartoPositronLayer.getSource().setAttributions(this.attribution());
      this.cartoDarkLayer.getSource().setAttributions(this.attribution());

      this.olmap.addLayer(symbolLayer);
      this.olmap.addLayer(clusterLayer);
      this.olmap.addLayer(heatmapLayer);
      this.olmap.addLayer(hexagonLayer);
      // this.olmap.addLayer(textLayer);


      if(geomType === "GEO_POINT") {
        // this.uiOption.layers[0].type = "symbol";
      } else if(geomType === "GEO_LINE") {
        this.uiOption.layers[0].type = "line";
      } else if(geomType === "GEO_POLYGON") {
        this.uiOption.layers[0].type = "polygon";
      }

      if(geomType !== "GEO_POINT") {
        clusterLayer.setSource(new ol.source.Vector());
        heatmapLayer.setSource(new ol.source.Vector());
        hexagonLayer.setSource(new ol.source.Vector());

        clusterLayer.setStyle(new ol.style.Style());
        heatmapLayer.setStyle(new ol.style.Style());
        hexagonLayer.setStyle(new ol.style.Style());
      }

      //option panel에서 선택한 타입에 따라 layer visible 적용
      if(this.uiOption.layers[0].type === "symbol") {
        if(this.uiOption.layers[0].clustering) {
          symbolLayer.setVisible(false);
          clusterLayer.setVisible(true);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        } else {
          symbolLayer.setVisible(true);
          clusterLayer.setVisible(false);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        }
      } else if(this.uiOption.layers[0].type === "heatmap") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(true);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[0].type === "tile") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(true);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[0].type === "polygon" || this.uiOption.layers[0].type === "line") {
        symbolLayer.setVisible(true);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      }

      //지도 생성후 데이터의 영역으로 지도 이동
      this.olmap.getView().fit(source.getExtent());

    } else {
      // 지도 라이센스 표기
      this.osmLayer.getSource().setAttributions(this.attribution());
      this.cartoPositronLayer.getSource().setAttributions(this.attribution());
      this.cartoDarkLayer.getSource().setAttributions(this.attribution());


      this.olmap.getLayers().getArray()[1] = symbolLayer;
      this.olmap.getLayers().getArray()[2] = clusterLayer;
      this.olmap.getLayers().getArray()[3] = heatmapLayer;
      this.olmap.getLayers().getArray()[4] = hexagonLayer;
      // this.olmap.getLayers().getArray()[5] = textLayer;

      symbolLayer.setStyle(this.mapStyleFunction(0, this.data));
      // symbolLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      clusterLayer.setStyle(this.clusterStyleFunction(0, this.data));
      // clusterLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      heatmapLayer.setBlur(this.uiOption.layers[0].blur);
      heatmapLayer.setRadius(this.uiOption.layers[0].radius);
      heatmapLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      hexagonLayer.setStyle(this.hexagonStyleFunction(0, this.data));
      // hexagonLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      if(this.uiOption.layers[0].type === "symbol") {
        if(this.uiOption.layers[0].clustering) {
          symbolLayer.setVisible(false);
          clusterLayer.setVisible(true);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        } else {
          symbolLayer.setVisible(true);
          clusterLayer.setVisible(false);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        }
      } else if(this.uiOption.layers[0].type === "heatmap") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(true);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[0].type === "tile") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(true);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[0].type === "polygon" || this.uiOption.layers[0].type === "line") {
        symbolLayer.setVisible(true);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      }

      //show basemap
      this.osmLayer.setVisible(this.uiOption.showMapLayer);
      this.cartoPositronLayer.setVisible(this.uiOption.showMapLayer);
      this.cartoDarkLayer.setVisible(this.uiOption.showMapLayer);

      //choose basemap
      if(this.uiOption.map === 'Light') {
        this.olmap.getLayers().getArray()[0] = this.cartoPositronLayer;
      } else if(this.uiOption.map === 'Dark') {
        this.olmap.getLayers().getArray()[0] = this.cartoDarkLayer;
      } else {
        this.olmap.getLayers().getArray()[0] = this.osmLayer;
      }

      this.olmap.updateSize();

      this.drawSecondLayer(this.data);
      this.drawThirdLayer(this.data);
    }

    //tooltip 생성
    this.tooltipRender();
    //legend 생성
    this.legendRender();

    // 차트 반영
    this.apply();

    // 완료
    this.drawFinished.emit();
  }

  /**
   * 차트에 범례를 그린다.
   */
  public legendRender(): void {

    if( !this.uiOption.legend.auto ) {
      for(let i=0;i<document.getElementsByClassName('ddp-layout-remark').length;i++) {
        let element = document.getElementsByClassName('ddp-layout-remark')[i] as HTMLElement;
        element.style.display = "none";
      }
      return;
    }

    if(document.getElementsByClassName('ddp-layout-remark').length > 0) {
      for(let i=0;i<document.getElementsByClassName('ddp-layout-remark').length;i++) {
        let element = document.getElementsByClassName('ddp-layout-remark')[i] as HTMLElement;
        element.style.display = "block";

        if(this.uiOption.legend.pos.toString() === "RIGHT_BOTTOM") {
          element.style.left = '';
          element.style.top = '';
          element.style.right = '20px';
          element.style.bottom = '20px';
        } else if(this.uiOption.legend.pos.toString() === "RIGHT_TOP") {
          element.style.left = '';
          element.style.top = '20px';
          element.style.right = '20px';
          element.style.bottom = '';
        }
        // else if(this.uiOption.legend.pos.toString() === "LEFT_BOTTOM") {
        //   element.style.left = '20px';
        //   element.style.top = '';
        //   element.style.right = '';
        //   element.style.bottom = '20px';
        // } else if(this.uiOption.legend.pos.toString() === "LEFT_TOP") {
        //   element.style.left = '20px';
        //   element.style.top = '20px';
        //   element.style.right = '';
        //   element.style.bottom = '';
        // }
        let legendHtmlAll = '';
        let legendHtml = '';

        if(!this.uiOption["layerCnt"]) this.uiOption["layerCnt"] = 1;

        for(let i=0;i<this.uiOption["layerCnt"];i++) {
          if(this.data[i]) {
            if(this.uiOption.layers[i].color["by"] === 'DIMENSION') {
              legendHtml = '<div class="ddp-ui-layer">' +
                  '<span class="ddp-label">' + this.uiOption.layers[i].name + '</span>' +
                  '<span class="ddp-data">'+ this.uiOption.layers[i].type +'</span>' +
                  '<ul class="ddp-list-remark">';

              for(let field of this.uiOption.fieldList) {
                legendHtml = legendHtml + '<li><em class="ddp-bg-remark-r" style="background-color:#602663"></em>' + field + '</li>';
              }

              legendHtml = legendHtml + '</ul></div>';
            } else if(this.uiOption.layers[i].color["by"] === 'MEASURE') {
              legendHtml = '<div class="ddp-ui-layer">' +
                  '<span class="ddp-label">' + this.uiOption.layers[i].name + '</span>' +
                  '<span class="ddp-data">' + this.uiOption.layers[i].type.charAt(0).toUpperCase() + this.uiOption.layers[i].type.slice(1) + ' Color</span>' +
                  '<span class="ddp-data">' + 'By ' + this.uiOption.layers[i].color.column + '</span>' +
                  '<ul class="ddp-list-remark">';

                  if(this.uiOption.layers[i].color["ranges"]) {
                    for(let range of this.uiOption.layers[i].color["ranges"]) {

                      let minVal = range.fixMin;
                      let maxVal = range.fixMax;

                      if(minVal === null) minVal = maxVal;
                      if(maxVal === null) maxVal = minVal;

                      legendHtml = legendHtml + '<li><em class="ddp-bg-remark-r" style="background-color:' + range.color + '"></em>' + FormatOptionConverter.getFormatValue(minVal, this.uiOption.valueFormat) + ' ~ ' + FormatOptionConverter.getFormatValue(maxVal, this.uiOption.valueFormat) + '</li>';
                    }
                  } else {
                    const ranges = this.setColorRange(this.uiOption, this.data[i], ChartColorList[this.uiOption.layers[i].color['schema']], i, []);

                    for(let range of ranges) {

                      let minVal = range.fixMin;
                      let maxVal = range.fixMax;

                      if(minVal === null) minVal = maxVal;
                      if(maxVal === null) maxVal = minVal;

                      legendHtml = legendHtml + '<li><em class="ddp-bg-remark-r" style="background-color:' + range.color + '"></em>' + FormatOptionConverter.getFormatValue(minVal, this.uiOption.valueFormat) + ' ~ ' + FormatOptionConverter.getFormatValue(maxVal, this.uiOption.valueFormat) + '</li>';
                    }
                  }

              if(this.uiOption.layers[i].color["customMode"]) {
                legendHtml = '<div class="ddp-ui-layer">' +
                    '<span class="ddp-label">' + this.uiOption.layers[i].name + '</span>' +
                    '<span class="ddp-data">' + this.uiOption.layers[i].type + ' by ' + this.uiOption.layers[i].color.column + '</span>' +
                    '<ul class="ddp-list-remark">';

                if(this.uiOption.layers[i].color["customMode"] === 'SECTION') {
                  for(let range of this.uiOption.layers[i].color["ranges"]) {

                    let minVal = range.fixMin;
                    let maxVal = range.fixMax;

                    if(minVal === null) minVal = 0;
                    if(maxVal === null) maxVal = minVal;

                    legendHtml = legendHtml + '<li><em class="ddp-bg-remark-r" style="background-color:' + range.color + '"></em>' + FormatOptionConverter.getFormatValue(minVal, this.uiOption.valueFormat) + ' ~ ' + FormatOptionConverter.getFormatValue(maxVal, this.uiOption.valueFormat) + '</li>';
                  }
                }
              }

            } else if(this.uiOption.layers[i].color["by"] === 'NONE') {
              legendHtml = '<div class="ddp-ui-layer">' +
                  '<span class="ddp-label">' + this.uiOption.layers[i].name + '</span>' +
                  '<span class="ddp-data">' + this.uiOption.layers[i].type + ' Color</span>' +
                  '<ul class="ddp-list-remark">';

              for(let field of this.uiOption.fielDimensionList) {
                if(field["layerNum"] === i+1) {
                  legendHtml = legendHtml + '<li><em class="ddp-bg-remark-r" style="background-color:' + this.uiOption.layers[i].color["schema"] + '"></em>' + field["alias"] + '</li>';
                }
              }

              legendHtml = legendHtml + '</ul></div>';
            }

            legendHtml = legendHtml + '</ul></div>';
            legendHtmlAll = legendHtml + legendHtmlAll;
          }
        }

        element.innerHTML = legendHtmlAll;

      }
    }
  }

  /**
   * 차트에 툴팁을 그린다.
   */
  public tooltipRender(): void {
    let element = document.getElementById('popup');
    let content = document.getElementById('popup-contents');
    let popup = new ol.Overlay({
      element: element,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [-50, -100]
    });
    this.olmap.addOverlay(popup);

    let tooltipOption = this.uiOption;
    let pivot = this.pivot;

    //지도위에서 마우스 포인터 이동 event
    this.olmap.on('pointermove', function(evt) {

      let feature = this.forEachFeatureAtPixel(evt.pixel,
        (f) => {
          return f;
        });

      if(feature) {

        let geomType = feature.getGeometry().getType();
        let coords = [0,0];
        let pointerX = coords[0].toFixed(4);
        let pointerY = coords[1].toFixed(4);

        if(geomType === 'Point' || geomType === 'LineString') {
          coords = feature.getGeometry().getCoordinates();
        } else {
          let extent = feature.getGeometry().getExtent();
          coords = ol.extent.getCenter(extent);
        }

        let geoInfo;
        if(geomType === 'LineString') {
          geoInfo = '<tr><th>Geo info</th><td>'+ coords[0] + '</td></tr>' + '<tr><th></th><td>'+ coords[coords.length-1] +'</td></tr>';
        } else {
          geoInfo = '<tr><th>Geo info</th><td>'+ coords[0].toFixed(4) + ', ' +coords[1].toFixed(4) + '</td></tr>';
        }

        let tooltipHtml = '<div class="ddp-ui-tooltip-info ddp-map-tooltip" style="display:block; position:absolute; top:0; left:0; z-index:99999;">' +
        '<span class="ddp-txt-tooltip">';

        //Layer Name (LAYER_NAME)
        if(tooltipOption.toolTip["displayTypes"] != undefined && tooltipOption.toolTip.displayTypes[17] !== null) {
          if(feature.get('layerNum') === 1) {
            tooltipHtml = tooltipHtml + '<span class="ddp-label"><em class="ddp-icon-mapview1-w"></em> ' + tooltipOption.layers[0].name + '</span>';
          } else if(feature.get('layerNum') === 2) {
            tooltipHtml = tooltipHtml + '<span class="ddp-label"><em class="ddp-icon-mapview2-w"></em> ' + tooltipOption.layers[1].name + '</span>';
          } else if(feature.get('layerNum') === 3) {
            tooltipHtml = tooltipHtml + '<span class="ddp-label"><em class="ddp-icon-mapview3-w"></em> ' + tooltipOption.layers[2].name + '</span>';
          }

        }

        tooltipHtml = tooltipHtml + '<table class="ddp-table-info"><colgroup><col width="70px"><col width="*"></colgroup><tbody>';

        //Coordinates info (LOCATION_INFO)
        if(tooltipOption.toolTip["displayTypes"] != undefined && tooltipOption.toolTip.displayTypes[18] !== null) {
          tooltipHtml = tooltipHtml + geoInfo;
        }

        //Properties (DATA_VALUE)
        if(tooltipOption.toolTip["displayTypes"] != undefined && tooltipOption.toolTip.displayTypes[19] !== null) {
          for(var key in feature.getProperties()) {

            // Show check
            let isAggregation: boolean = false;
            //_.each(pivot.aggregations, (field) => {
            _.each(tooltipOption.toolTip["displayColumns"], (field) => {
              if( _.eq(field, key) ) {
                isAggregation = true;
                return false;
              }
            });
            if( !isAggregation ) {
              continue;
            }

            let tooltipVal = feature.get(key);

            if (key !== 'geometry' && key !== 'weight' && key !== 'layerNum') {
              if (key === 'features') {
                tooltipHtml = tooltipHtml + '<tr><th>' + key + '</th><td>' + feature.get(key).length + '</td></tr>';
              } else {
                if(typeof(tooltipVal) === "number") {
                  tooltipVal = FormatOptionConverter.getFormatValue(tooltipVal, tooltipOption.valueFormat);
                }
                tooltipHtml = tooltipHtml + '<tr><th>' + key + '</th><td>' + tooltipVal + '</td></tr>';
              }
            }
          }
        }

        tooltipHtml = tooltipHtml + '</tbody></table></span></div>';

        content.innerHTML = tooltipHtml;

        if(geomType === 'LineString') {
          let extent = feature.getGeometry().getExtent();
          coords = ol.extent.getCenter(extent);
          popup.setPosition(coords);
        } else {
          popup.setPosition(coords);
        }

      } else {
        popup.setPosition(undefined);
      }
    });
  }

  /**
   * 차트에 설정된 옵션으로 차트를 그린다. 선반 2번째 레이어
   */
  public drawSecondLayer(data: any): void {
    if(this.data[1] === undefined) {
      return;
    }

    if(this.olmap.getLayers().getArray().length > 6) {
      this.olmap.getLayers().getArray()[5].setVisible(true);
      this.olmap.getLayers().getArray()[6].setVisible(true);
      this.olmap.getLayers().getArray()[7].setVisible(true);
      this.olmap.getLayers().getArray()[8].setVisible(true);
    }

    console.log('=== map component draw2 ===');

    let source = new ol.source.Vector();
    let hexagonSource = new ol.source.Vector();

    let symbolLayer = new ol.layer.Vector({
      source: source,
      style: this.mapStyleFunction(1, this.data),
      opacity: this.uiOption.layers[1].color.transparency / 100
    });

    let clusterLayer = new ol.layer.Vector({
      source: source,
      style: this.clusterStyleFunction(1, this.data),
      opacity: this.uiOption.layers[1].color.transparency / 100
    });

    let featureColor = this.uiOption.layers[1].color.schema;
    let colorList = ChartColorList[featureColor];

    if(this.uiOption.layers[1].color["customMode"] === "SECTION") {
      colorList = [];
      for(let range of this.uiOption.layers[1].color["ranges"]) {
        colorList.push(range.color);
      }
      colorList = colorList.reverse();
    }

    let heatmapLayer = new ol.layer.Heatmap({
      source: source,
      style: this.clusterStyleFunction(1, this.data),
      opacity: this.uiOption.layers[1].color.transparency / 100,
      blur: this.uiOption.layers[1].blur,
      radius: this.uiOption.layers[1].radius,
      gradient: colorList
    });

    let hexagonLayer = new ol.layer.Vector({
      source: hexagonSource,
      style: this.hexagonStyleFunction(1, this.data),
      opacity: this.uiOption.layers[1].color.transparency / 100
    });

    let textLayer = new ol.layer.Vector({
      source: source,
      style: this.textStyleFunction()
    });

    let features = [];
    let hexagonFeatures = (new ol.format.GeoJSON()).readFeatures(data[1]);;
    // let features = (new ol.format.GeoJSON()).readFeatures(this.data[0]);


    let field;
    for(let column of this.pivot.columns) {
      if(column["layerNum"] === 2) {
        field = column;
        break;
      }
    }

    let geomType = field.field.logicalType.toString();

    for(let i=0;i<data[1]["features"].length;i++) {

      let feature = new ol.Feature();
      feature = (new ol.format.GeoJSON()).readFeature(data[1].features[i]);

      if(geomType === "GEO_POINT") {

        let featureCenter = feature.getGeometry().getCoordinates();

        if(featureCenter.length === 1) {
          let extent = feature.getGeometry().getExtent();
          featureCenter = ol.extent.getCenter(extent);
          feature.setGeometry(new ol.geom.Point(featureCenter));
        }

        if(this.uiOption.fieldMeasureList.length > 0) {
          //히트맵 weight 설정
          if(this.data[1].valueRange[this.uiOption.layers[1].color.column]) {
            feature.set('weight', feature.getProperties()[this.uiOption.fieldMeasureList[0].alias] / this.data[1].valueRange[this.uiOption.layers[1].color.column].maxValue);
          }
        }
      }

      feature.set('layerNum', 2);

      features[i] = feature;

    }

    for(let feature of hexagonFeatures) {
      feature.set('layerNum', 2);
    }

    hexagonSource.addFeatures(hexagonFeatures);
    source.addFeatures(features);

    let clusterSource = new ol.source.Cluster({
      distance: 30,
      source: source
    });

    symbolLayer.setSource(source);
    hexagonLayer.setSource(hexagonSource);
    textLayer.setSource(source);

    if(geomType === "GEO_POINT") {
      clusterLayer.setSource(clusterSource);
    }

    if(!this.mapVaildSecondLayer) {

      this.olmap.addLayer(symbolLayer);
      this.olmap.addLayer(clusterLayer);
      this.olmap.addLayer(heatmapLayer);
      this.olmap.addLayer(hexagonLayer);
      // this.olmap.addLayer(textLayer);

      if(geomType === "GEO_POINT") {
        this.uiOption.layers[1].type = "symbol";
      } else if(geomType === "GEO_LINE") {
        this.uiOption.layers[1].type = "line";
      } else if(geomType === "GEO_POLYGON") {
        this.uiOption.layers[1].type = "polygon";
      }

      if(geomType !== "GEO_POINT") {
        clusterLayer.setSource(new ol.source.Vector());
        heatmapLayer.setSource(new ol.source.Vector());
        hexagonLayer.setSource(new ol.source.Vector());

        clusterLayer.setStyle(new ol.style.Style());
        heatmapLayer.setStyle(new ol.style.Style());
        hexagonLayer.setStyle(new ol.style.Style());
      }

      if(this.uiOption.layers[1].type === "symbol") {
        if(this.uiOption.layers[1].clustering) {
          symbolLayer.setVisible(false);
          clusterLayer.setVisible(true);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        } else {
          symbolLayer.setVisible(true);
          clusterLayer.setVisible(false);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        }
      } else if(this.uiOption.layers[1].type === "heatmap") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(true);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[1].type === "tile") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(true);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[1].type === "polygon" || this.uiOption.layers[1].type === "line") {
        symbolLayer.setVisible(true);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(false );
        textLayer.setVisible(false);
      }

      this.olmap.getView().fit(source.getExtent());
      this.mapVaildSecondLayer = !this.mapVaildSecondLayer;
    } else {

      this.olmap.getLayers().getArray()[5] = symbolLayer;
      this.olmap.getLayers().getArray()[6] = clusterLayer;
      this.olmap.getLayers().getArray()[7] = heatmapLayer;
      this.olmap.getLayers().getArray()[8] = hexagonLayer;
      // this.olmap.getLayers().getArray()[10] = textLayer;

      symbolLayer.setStyle(this.mapStyleFunction(1, this.data));
      // symbolLayer.setOpacity(this.uiOption.layers[1].color.transparency / 100);

      clusterLayer.setStyle(this.clusterStyleFunction(1, this.data));
      // clusterLayer.setOpacity(this.uiOption.layers[1].color.transparency / 100);

      heatmapLayer.setBlur(this.uiOption.layers[1].blur);
      heatmapLayer.setRadius(this.uiOption.layers[1].radius);
      heatmapLayer.setOpacity(this.uiOption.layers[1].color.transparency / 100);

      hexagonLayer.setStyle(this.hexagonStyleFunction(1, this.data));
      // hexagonLayer.setOpacity(this.uiOption.layers[1].color.transparency / 100);

      if(this.uiOption.layers[1].type === "symbol") {
        if(this.uiOption.layers[1].clustering) {
          symbolLayer.setVisible(false);
          clusterLayer.setVisible(true);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        } else {
          symbolLayer.setVisible(true);
          clusterLayer.setVisible(false);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        }
      } else if(this.uiOption.layers[1].type === "heatmap") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(true);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[1].type === "tile") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(true);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[1].type === "polygon" || this.uiOption.layers[1].type === "line") {
        symbolLayer.setVisible(true);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      }

      this.olmap.updateSize();
    }

    // this.tooltipRender();

    // 차트 반영
    // this.apply();

    //tooltip 생성
    this.tooltipRender();
    //legend 생성
    this.legendRender();

    // 완료
    // this.drawFinished.emit();
  }

  /**
   * 차트에 설정된 옵션으로 차트를 그린다. 선반 3번째 레이어
   */
  public drawThirdLayer(data: any): void {
    if(this.data[2] === undefined) {
      return;
    }

    if(this.olmap.getLayers().getArray().length > 10) {
      this.olmap.getLayers().getArray()[9].setVisible(true);
      this.olmap.getLayers().getArray()[10].setVisible(true);
      this.olmap.getLayers().getArray()[11].setVisible(true);
      this.olmap.getLayers().getArray()[12].setVisible(true);
    }

    console.log('=== map component draw3 ===');

    let source = new ol.source.Vector();
    let hexagonSource = new ol.source.Vector();

    let symbolLayer = new ol.layer.Vector({
      source: source,
      style: this.mapStyleFunction(2, this.data),
      opacity: this.uiOption.layers[2].color.transparency / 100
    });

    let clusterLayer = new ol.layer.Vector({
      source: source,
      style: this.clusterStyleFunction(2, this.data),
      opacity: this.uiOption.layers[2].color.transparency / 100
    });

    let featureColor = this.uiOption.layers[2].color.schema;
    let colorList = ChartColorList[featureColor];

    if(this.uiOption.layers[2].color["customMode"] === "SECTION") {
      colorList = [];
      for(let range of this.uiOption.layers[2].color["ranges"]) {
        colorList.push(range.color);
      }
      colorList = colorList.reverse();
    }

    let heatmapLayer = new ol.layer.Heatmap({
      source: source,
      style: this.clusterStyleFunction(2, this.data),
      opacity: this.uiOption.layers[2].color.transparency / 100,
      blur: this.uiOption.layers[2].blur,
      radius: this.uiOption.layers[2].radius,
      gradient: colorList
    });

    let hexagonLayer = new ol.layer.Vector({
      source: hexagonSource,
      style: this.hexagonStyleFunction(2, this.data),
      opacity: this.uiOption.layers[2].color.transparency / 100
    });

    let textLayer = new ol.layer.Vector({
      source: source,
      style: this.textStyleFunction()
    });

    let features = [];
    let hexagonFeatures = (new ol.format.GeoJSON()).readFeatures(data[2]);;
    // let features = (new ol.format.GeoJSON()).readFeatures(this.data[0]);


    let field;
    for(let column of this.pivot.columns) {
      if(column["layerNum"] === 3) {
        field = column;
        break;
      }
    }

    let geomType = field.field.logicalType.toString();

    for(let i=0;i<data[2]["features"].length;i++) {

      let feature = new ol.Feature();
      feature = (new ol.format.GeoJSON()).readFeature(data[2].features[i]);

      if(geomType === "GEO_POINT") {

        let featureCenter = feature.getGeometry().getCoordinates();

        if(featureCenter.length === 1) {
          let extent = feature.getGeometry().getExtent();
          featureCenter = ol.extent.getCenter(extent);
          feature.setGeometry(new ol.geom.Point(featureCenter));
        }

        if(this.uiOption.fieldMeasureList.length > 0) {
          //히트맵 weight 설정
          if(this.data[2].valueRange[this.uiOption.layers[2].color.column]) {
            feature.set('weight', feature.getProperties()[this.uiOption.fieldMeasureList[0].alias] / this.data[2].valueRange[this.uiOption.layers[2].color.column].maxValue);
          }
        }
      }

      feature.set('layerNum', 3);

      features[i] = feature;

    }

    for(let feature of hexagonFeatures) {
      feature.set('layerNum', 3);
    }

    hexagonSource.addFeatures(hexagonFeatures);
    source.addFeatures(features);

    let clusterSource = new ol.source.Cluster({
      distance: 30,
      source: source
    });

    symbolLayer.setSource(source);
    hexagonLayer.setSource(hexagonSource);
    textLayer.setSource(source);

    if(geomType === "GEO_POINT") {
      clusterLayer.setSource(clusterSource);
    }

    if(!this.mapVaildSecondLayer) {

      this.olmap.addLayer(symbolLayer);
      this.olmap.addLayer(clusterLayer);
      this.olmap.addLayer(heatmapLayer);
      this.olmap.addLayer(hexagonLayer);
      // this.olmap.addLayer(textLayer);

      if(geomType === "GEO_POINT") {
        this.uiOption.layers[2].type = "symbol";
      } else if(geomType === "GEO_LINE") {
        this.uiOption.layers[2].type = "line";
      } else if(geomType === "GEO_POLYGON") {
        this.uiOption.layers[2].type = "polygon";
      }

      if(geomType !== "GEO_POINT") {
        clusterLayer.setSource(new ol.source.Vector());
        heatmapLayer.setSource(new ol.source.Vector());
        hexagonLayer.setSource(new ol.source.Vector());

        clusterLayer.setStyle(new ol.style.Style());
        heatmapLayer.setStyle(new ol.style.Style());
        hexagonLayer.setStyle(new ol.style.Style());
      }

      if(this.uiOption.layers[2].type === "symbol") {
        if(this.uiOption.layers[2].clustering) {
          symbolLayer.setVisible(false);
          clusterLayer.setVisible(true);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        } else {
          symbolLayer.setVisible(true);
          clusterLayer.setVisible(false);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        }
      } else if(this.uiOption.layers[2].type === "heatmap") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(true);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[2].type === "tile") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(true);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[2].type === "polygon" || this.uiOption.layers[2].type === "line") {
        symbolLayer.setVisible(true);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(false );
        textLayer.setVisible(false);
      }

      this.olmap.getView().fit(source.getExtent());
      this.mapVaildSecondLayer = !this.mapVaildSecondLayer;
    } else {

      this.olmap.getLayers().getArray()[9] = symbolLayer;
      this.olmap.getLayers().getArray()[10] = clusterLayer;
      this.olmap.getLayers().getArray()[11] = heatmapLayer;
      this.olmap.getLayers().getArray()[12] = hexagonLayer;
      // this.olmap.getLayers().getArray()[10] = textLayer;

      symbolLayer.setStyle(this.mapStyleFunction(2, this.data));
      // symbolLayer.setOpacity(this.uiOption.layers[2].color.transparency / 100);

      clusterLayer.setStyle(this.clusterStyleFunction(2, this.data));
      // clusterLayer.setOpacity(this.uiOption.layers[2].color.transparency / 100);

      heatmapLayer.setBlur(this.uiOption.layers[2].blur);
      heatmapLayer.setRadius(this.uiOption.layers[2].radius);
      heatmapLayer.setOpacity(this.uiOption.layers[2].color.transparency / 100);

      hexagonLayer.setStyle(this.hexagonStyleFunction(2, this.data));
      // hexagonLayer.setOpacity(this.uiOption.layers[2].color.transparency / 100);

      if(this.uiOption.layers[2].type === "symbol") {
        if(this.uiOption.layers[2].clustering) {
          symbolLayer.setVisible(false);
          clusterLayer.setVisible(true);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        } else {
          symbolLayer.setVisible(true);
          clusterLayer.setVisible(false);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
          textLayer.setVisible(false);
        }
      } else if(this.uiOption.layers[2].type === "heatmap") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(true);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[2].type === "tile") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(true);
        textLayer.setVisible(false);
      } else if(this.uiOption.layers[2].type === "polygon" || this.uiOption.layers[2].type === "line") {
        symbolLayer.setVisible(true);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      }

      this.olmap.updateSize();
    }

    // this.tooltipRender();

    // 차트 반영
    // this.apply();

    //tooltip 생성
    this.tooltipRender();
    //legend 생성
    this.legendRender();

    // 완료
    // this.drawFinished.emit();
  }

  /**
   * 두번째 레이어를 제거한다.
   */
  public removeSecondLayer(): void {

    ////////////////////////////////////////////////////////
    // 업데이트
    ////////////////////////////////////////////////////////

    if(this.olmap.getLayers().getArray().length > 6) {
      this.olmap.getLayers().getArray()[5].setVisible(false);
      this.olmap.getLayers().getArray()[6].setVisible(false);
      this.olmap.getLayers().getArray()[7].setVisible(false);
      this.olmap.getLayers().getArray()[8].setVisible(false);
      this.data[1] = undefined;
    }

    // 완료
    // this.drawFinished.emit();
  }

  /**
   * 세번째 레이어를 제거한다.
   */
  public removeThirdLayer(): void {

    ////////////////////////////////////////////////////////
    // 업데이트
    ////////////////////////////////////////////////////////

    if(this.olmap.getLayers().getArray().length > 10) {
      this.olmap.getLayers().getArray()[9].setVisible(false);
      this.olmap.getLayers().getArray()[10].setVisible(false);
      this.olmap.getLayers().getArray()[11].setVisible(false);
      this.olmap.getLayers().getArray()[12].setVisible(false);
      this.data[2] = undefined;
    }

    // 완료
    // this.drawFinished.emit();
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

    let secondLayerQuery: SearchQueryRequest = _.clone(this.query);
    let thirdLayerQuery: SearchQueryRequest = _.clone(this.query);


    if(!this.secondLayerQuery) {
      this.secondLayerQuery = secondLayerQuery;
      this.secondLayerQuery.pivot = null;
    }

    if(!this.thirdLayerQuery) {
      this.thirdLayerQuery = thirdLayerQuery;
      this.thirdLayerQuery.pivot = null;
    }

    let layers2 = [];
    let layers3 = [];


    if(this.uiOption["layerCnt"] > 1) {
      for(let column of this.pivot.columns) {

        let layer = {
          type: column.type,
          name: column.name,
          alias: column.alias,
          ref: null,
          format: null,
          dataSource: column.field.dataSource
        }

        if(column.field.logicalType.toString().substring(0,3) === 'GEO') {
          layer.format = {
            type : "geo"
          }
        }

        // 2번째 레이어 search query 생성
        if(column["layerNum"] === 2) {
          if(column.field.logicalType.toString() === 'GEO_POINT') {
            for(let aggregation of this.pivot.aggregations) {
              if(aggregation["layerNum"] === 2) {
                layer.format = {
                  type: "geo_hash",
                  method: "h3",
                  precision: this.uiOption.layers[1].coverage
                }
              }

              if(this.uiOption.layers[1]["viewRawData"]) {
                layer.format = {
                  type : "geo"
                }
              }
            }
          }

          secondLayerQuery.dataSource.engineName = column.field.dataSource;
          secondLayerQuery.dataSource.name = column.field.dataSource;
          secondLayerQuery.dataSource.id = column.field.dsId;

          layers2.push(layer);
        }
        // 3번쨰 레이어 search query 생성
        if(column["layerNum"] === 3) {
          if(column.field.logicalType.toString() === 'GEO_POINT') {
            for(let aggregation of this.pivot.aggregations) {
              if(aggregation["layerNum"] === 3) {
                layer.format = {
                  type: "geo_hash",
                  method: "h3",
                  precision: this.uiOption.layers[2].coverage
                }

                if(this.uiOption.layers[2]["viewRawData"]) {
                  layer.format = {
                    type : "geo"
                  }
                }
              }
            }
          }

          thirdLayerQuery.dataSource.engineName = column.field.dataSource;
          thirdLayerQuery.dataSource.name = column.field.dataSource;
          thirdLayerQuery.dataSource.id = column.field.dsId;

          layers3.push(layer);
        }
      }

      for(let aggregation of this.pivot.aggregations) {
        let layer = {
          type: aggregation.type,
          name: aggregation.name,
          alias: aggregation.alias,
          ref: null,
          aggregationType: aggregation.aggregationType,
          dataSource: aggregation.field.dataSource
        }

        if(aggregation["layerNum"] === 2) {
          layers2.push(layer);
        } else if(aggregation["layerNum"] === 3) {
          layers3.push(layer);
        }
      }

      secondLayerQuery.shelf = {
        type: 'geo',
        layers: [layers2]
      };

      thirdLayerQuery.shelf = {
        type: 'geo',
        layers: [layers3]
      };

      let secondLayerVaild: boolean = false;
      let thirdLayerVaild: boolean = false;
      for(let column of this.pivot.columns) {
        if(column["layerNum"] === 2 && column.field["logicalType"].toString().indexOf("GEO") > -1) {
          secondLayerVaild = true;
        }
        else if(column["layerNum"] === 3 && column.field["logicalType"].toString().indexOf("GEO") > -1) {
          thirdLayerVaild = true;
        }
      }

      // 2번째 선반에 필드 없으면 2번째 레이어 삭제
      if(!secondLayerVaild) {
       this.removeSecondLayer();
      }

      // 3번째 선반에 필드 없으면 3번째 레이어 삭제
      if(!thirdLayerVaild) {
       this.removeThirdLayer();
      }

      //서버에서 데이터를 가지고와 2번째 레이어 생성
      if(this.data[1] === undefined && secondLayerVaild) {
        // if(secondLayerQuery["pivot"] !== this.secondLayerQuery["pivot"]) {
          this.datasourceService.searchQuery(secondLayerQuery).then(
            (data) => {

              this.data[1] = data[0];
              this.drawSecondLayer(this.data);
              // if (this.params.successCallback) {
              //   this.params.successCallback();
              // }
            }
          ).catch((reason) => {
            console.error('Search Query Error =>', reason);
            // this.isChartShow = false;

            // 변경사항 반영
            // this.changeDetect.detectChanges();
            // this.loadingHide();
          });
        // } else {
        //   this.drawSecondLayer(this.data);
        // }

        this.secondLayerQuery = secondLayerQuery;
      }

      //서버에서 데이터를 가지고와 3번째 레이어 생성
      if(this.data[2] === undefined && thirdLayerVaild) {
        // if(thirdLayerQuery["pivot"] !== this.thirdLayerQuery["pivot"]) {
          this.datasourceService.searchQuery(thirdLayerQuery).then(
            (data) => {

              this.data[2] = data[0];
              this.drawThirdLayer(this.data);
              // if (this.params.successCallback) {
              //   this.params.successCallback();
              // }
            }
          ).catch((reason) => {
            console.error('Search Query Error =>', reason);
            // this.isChartShow = false;

            // 변경사항 반영
            // this.changeDetect.detectChanges();
            // this.loadingHide();
          });
        // } else {
        //   this.drawThirdLayer(this.data);
        // }

        this.thirdLayerQuery = thirdLayerQuery;
      }
    } else {
      let secondLayerVaild: boolean = false;
      for(let column of this.pivot.columns) {
        if(column["layerNum"] === 2) {
          secondLayerVaild = true;
        }
      }

      if(!secondLayerVaild) {
       this.removeSecondLayer();
      }

      let thirdLayerVaild: boolean = false;
      for(let column of this.pivot.columns) {
        if(column["layerNum"] === 3) {
          thirdLayerVaild = true;
        }
      }

      if(!thirdLayerVaild) {
       this.removeThirdLayer();
      }
    }

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
    this.addChartSelectEventListener();
    this.addChartMultiSelectEventListener();
  }

  /**
   * 차트 Resize
   *
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    let layerNum = 1;
    for(let column of this.pivot.columns) {
      if(column["layerNum"] > layerNum) {
        layerNum = column["layerNum"];
      }
    }

    document.getElementsByClassName("ddp-ui-chart-area")[0]["style"].padding = '0 0 0 0';
    this.olmap.updateSize();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
