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

import * as _ from 'lodash';
import { UIOption } from '../../option/ui-option';

import {
  ChartColorList
} from '../../option/define/common';
// import * as ol from '../../../../../../../node_modules/ol';
import * as ol from 'openlayers';
import * as h3 from 'h3-js';

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
  public data2: any;
  public data3: any;

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
    // return true;
    return (pivot !== undefined) && ((pivot.columns.length > 0) || (pivot.rows.length > 0) || (pivot.aggregations.length > 0));
  }

  public onMoveEnd(evt) {
    let map = evt.map;
    let extent = map.getView().calculateExtent(map.getSize());
    console.info(extent);
  }

  public attribution(): string {
    // return this.uiOption.licenseNotation;
    return '© OpenStreetMap contributer';
  }

  public osmLayer = new ol.layer.Tile({
      source: new ol.source.OSM({
        attributions: [new ol.Attribution({
          html: this.attribution()
        })]
      })
  });

  public cartoPositronLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url:'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        attributions: [new ol.Attribution({
          html: this.attribution()
        })]
      })
  });

  public cartoDarkLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url:'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        attributions: [new ol.Attribution({
          html: this.attribution()
        })]
      })
  });

  /**
   * create map
   */
  public createMap(): void {

    let layer = this.osmLayer;

    if(this.uiOption.map === 'Positron') {
      layer = this.cartoPositronLayer;
    } else if(this.uiOption.map === 'Dark') {
      layer = this.cartoDarkLayer;
    }

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


    if(document.getElementsByClassName("ddp-ui-chart-contents").length > 0) {
      let layerNum = 1;
      for(let column of this.pivot.columns) {
        if(column["layerNum"] > layerNum) {
          layerNum = column["layerNum"];
        }
      }

      if(layerNum === 1) {
        document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '104px';
      } else if(layerNum === 2) {
        document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '149px';
      } else if(layerNum === 3) {
        document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '194px';
      }

      document.getElementsByClassName("ddp-ui-chart-area")[0]["style"].padding = '0 0 0 0';
    }
    this.olmap.updateSize();

    const zoomslider = new ol.control.ZoomSlider();
    this.olmap.addControl(zoomslider);

    this.mapVaild = true;
  }


  /**
   * map style function
   */
  public mapStyleFunction = (layerNum) => {

    let styleOption = this.uiOption;
    let styleData = this.data;

    return function(feature, resolution) {

      let layerType = styleOption.layers[layerNum].type;
      let symbolType = styleOption.layers[layerNum].symbol;
      let outlineType = styleOption.layers[layerNum].outline.thickness;
      let lineDashType = styleOption.layers[layerNum].outline.lineDash;
      let featureColor = styleOption.layers[layerNum].color.schema;
      let outlineColor = styleOption.layers[layerNum].outline.color;
      let featureColorType = styleOption.layers[layerNum].color.by;
      let featureSizeType = styleOption.layers[layerNum].size.by;

      let outlineWidth = 0.00000001;
      if(outlineType === 'THIN')  {
        outlineWidth = 1;
      } else if(outlineType === 'NORMAL') {
        outlineWidth = 2;
      } else if(outlineType === 'THICK') {
        outlineWidth = 3;
      }

      let lineDash = [1];
      if(lineDashType === 'DOT') {
        lineDash = [4,4];
      }

      let featureSize = 5;
      if(featureSizeType === 'MEASURE') {
        featureSize = parseInt(feature.get(styleOption.layers[layerNum].size.column)) / (styleData[0].valueRange.maxValue / 30);
      }

      if(featureColorType === 'MEASURE') {
        let colorList = ChartColorList[featureColor];
        let avgNum = styleData[0].valueRange.maxValue / colorList.length;

        for(let i=0;i<colorList.length;i++) {
          if(feature.getProperties()[styleOption.fieldMeasureList[0].aggregationType + '(' + styleOption.fieldMeasureList[0].name + ')'] <= avgNum * (i+1) &&
            feature.getProperties()[styleOption.fieldMeasureList[0].aggregationType + '(' + styleOption.fieldMeasureList[0].name + ')'] >= avgNum * (i)) {
            featureColor = colorList[i];
          }
        }

        // featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      } else if(featureColorType === 'DIMENSION') {
        let colorList = ChartColorList[featureColor];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      }

      let style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: featureColor
            })
        }),
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 2
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
      } else if(layerType === 'line') {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: featureColor,
            width: 2,
            lineDash: lineDash
          })
        });
      } else if(layerType === 'polygon') {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: outlineColor,
            width: outlineWidth
          }),
          fill: new ol.style.Fill({
            color: featureColor
          })
        });
      } else if(layerType === 'tile') {
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
  public hexagonStyleFunction = (layerNum) => {

    let styleOption = this.uiOption;
    let styleData = this.data;

    return function(feature, resolution) {

      let outlineType = styleOption.layers[layerNum].outline.thickness;
      let featureColor = styleOption.layers[layerNum].color.schema;
      let outlineColor = styleOption.layers[layerNum].outline.color;
      let featureColorType = styleOption.layers[layerNum].color.by;
      let featureSizeType = styleOption.layers[layerNum].size.by;

      if(featureColorType === 'MEASURE') {
        let colorList = ChartColorList[featureColor];
        let avgNum = styleData[0].valueRange.maxValue / colorList.length;

        for(let i=0;i<colorList.length;i++) {
          if(feature.getProperties()[styleOption.fieldMeasureList[0].aggregationType + '(' + styleOption.fieldMeasureList[0].name + ')'] <= avgNum * (i+1) &&
            feature.getProperties()[styleOption.fieldMeasureList[0].aggregationType + '(' + styleOption.fieldMeasureList[0].name + ')'] >= avgNum * (i)) {
            featureColor = colorList[i];
          }
        }

        // featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      } else if(featureColorType === 'DIMENSION') {
        let colorList = ChartColorList[featureColor];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      }

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
          var geometry = feature.getGeometry();
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
          text: labelText,
          font: '12px Calibri,sans-serif',
          overflow: true,
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        })
      });
      return labelStyle;
    }
  }

  public clusterStyleFunction = (layerNum) => {

    let styleOption = this.uiOption;

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
        let colorList = ChartColorList[featureColor];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      } else if(featureColorType === 'DIMENSION') {
        let colorList = ChartColorList[featureColor];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      }

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

      if(layerType === 'symbol') {
        switch (symbolType) {
          case 'CIRCLE' :
            style = new ol.style.Style({
              image: new ol.style.Circle({
                  radius: size,
                  fill: new ol.style.Fill({
                      color: featureColor
                  }),
                  stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth})
              })
            });
            break;
          case 'SQUARE' :
            style = new ol.style.Style({
              image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: featureColor}),
                stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
                points: 4,
                radius: size,
                angle: Math.PI / 4
              })
            });
            break;
          case 'TRIANGLE' :
            style = new ol.style.Style({
              image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: featureColor}),
                stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
                points: 3,
                radius: size,
                rotation: Math.PI / 4,
                angle: 0
              })
            });
            break;
        }
      }

      return style;
    }
  }

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


  public getCenterOfExtent(Extent) {
    var X = Extent[0] + (Extent[2]-Extent[0])/2;
    var Y = Extent[1] + (Extent[3]-Extent[1])/2;
    return [X, Y];
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

    let symbolLayer = new ol.layer.Vector({
      source: source,
      style: this.mapStyleFunction(0),
      opacity: this.uiOption.layers[0].color.transparency / 100
    });

    let clusterLayer = new ol.layer.Vector({
      source: source,
      style: this.clusterStyleFunction(0),
      opacity: this.uiOption.layers[0].color.transparency / 100
    });

    let featureColor = this.uiOption.layers[0].color.schema;
    let colorList = ChartColorList[featureColor];

    let heatmapLayer = new ol.layer.Heatmap({
      source: source,
      style: this.clusterStyleFunction(0),
      opacity: this.uiOption.layers[0].color.transparency / 100,
      blur: this.uiOption.layers[0].color.blur,
      radius: this.uiOption.layers[0].color.radius,
      gradient: colorList
    });

    let hexagonLayer = new ol.layer.Vector({
      source: hexagonSource,
      style: this.hexagonStyleFunction(0),
      opacity: this.uiOption.layers[0].color.transparency / 100
    });

    let textLayer = new ol.layer.Vector({
      source: source,
      style: this.textStyleFunction()
    });

    let features = [];
    let hexagonFeatures = (new ol.format.GeoJSON()).readFeatures(this.data[0]);;
    // let features = (new ol.format.GeoJSON()).readFeatures(this.data[0]);
    let h3Indexs = [];

    let field = this.pivot.columns[0];
    let geomType = field.field.logicalType.toString();

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
      }

      if(this.uiOption.fieldMeasureList.length > 0) {
        //히트맵 weight 설정
        feature.set('weight', feature.getProperties()[this.uiOption.fieldMeasureList[0].aggregationType + '(' + this.uiOption.fieldMeasureList[0].name + ')'] / this.data[0].valueRange.maxValue);
      }

      features[i] = feature;

    }

    hexagonSource.addFeatures(hexagonFeatures);
    source.addFeatures(features);

    let clusterSource = new ol.source.Cluster({
      distance: 10,
      source: source
    });

    symbolLayer.setSource(source);
    hexagonLayer.setSource(hexagonSource);
    textLayer.setSource(source);

    if(geomType === "GEO_POINT") {
      clusterLayer.setSource(clusterSource);
    }

    if(!this.mapVaild) {
      this.createMap();

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
      } else if(this.uiOption.layers[0].type === "polygon") {
        symbolLayer.setVisible(true);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(false );
        textLayer.setVisible(false);
      }

      this.olmap.getView().fit(source.getExtent());

    } else {

      this.olmap.getLayers().getArray()[1] = symbolLayer;
      this.olmap.getLayers().getArray()[2] = clusterLayer;
      this.olmap.getLayers().getArray()[3] = heatmapLayer;
      this.olmap.getLayers().getArray()[4] = hexagonLayer;
      // this.olmap.getLayers().getArray()[5] = textLayer;

      symbolLayer.setStyle(this.mapStyleFunction(0));
      symbolLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      clusterLayer.setStyle(this.clusterStyleFunction(0));
      clusterLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      heatmapLayer.setBlur(this.uiOption.layers[0].color.blur);
      heatmapLayer.setRadius(this.uiOption.layers[0].color.radius);
      heatmapLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      hexagonLayer.setStyle(this.hexagonStyleFunction(0));
      hexagonLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

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
      } else if(this.uiOption.layers[0].type === "polygon") {
        symbolLayer.setVisible(true);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(false);
        textLayer.setVisible(false);
      }

      if(this.uiOption.map === 'OpenStreetMap') {
        this.olmap.getLayers().getArray()[0] = this.osmLayer;
      } else if(this.uiOption.map === 'Positron') {
        this.olmap.getLayers().getArray()[0] = this.cartoPositronLayer;
      } else if(this.uiOption.map === 'Dark') {
        this.olmap.getLayers().getArray()[0] = this.cartoDarkLayer;
      }

      this.olmap.updateSize();

      this.drawSecondLayer(this.data2);
    }

    this.tooltipRender();

    // 차트 반영
    this.apply();

    // 완료
    this.drawFinished.emit();
  }

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

        if(geomType === 'Point') {
          coords = feature.getGeometry().getCoordinates();
        } else {
          let extent = feature.getGeometry().getExtent();
          coords = ol.extent.getCenter(extent);
        }

        pointerX = coords[0].toFixed(4);
        pointerY = coords[1].toFixed(4);

        let tooltipHtml = '<div class="ddp-ui-tooltip-info ddp-map-tooltip" style="display:block; position:absolute; top:0; left:0; z-index:99999;">' +
        '<span class="ddp-txt-tooltip">';

        //Layer Name (LAYER_NAME)
        // if(tooltipOption.toolTip.displayTypes[17] !== null) {
          tooltipHtml = tooltipHtml + '<span class="ddp-label"><em class="ddp-icon-mapview1-w"></em> ' + tooltipOption.layers[0].name + '</span>';
        // }

        tooltipHtml = tooltipHtml + '<table class="ddp-table-info"><colgroup><col width="70px"><col width="*"></colgroup><tbody>';

        //Coordinates info (LOCATION_INFO)
        // if(tooltipOption.toolTip.displayTypes[18] !== null) {
          '<tr><th>Geo info</th><td>'+ pointerX + ', ' + pointerY + '</td></tr>';
        // }

        //Properties (DATA_VALUE)
        // if(tooltipOption.toolTip.displayTypes[19] !== null) {
          for(var key in feature.getProperties()) {
            let tooltipVal = feature.get(key);

            if (key !== 'geometry' && key !== 'weight') {
              if (key === 'features') {
                tooltipHtml = tooltipHtml + '<tr><th>' + key + '</th><td>' + feature.get(key).length + '</td></tr>';
              } else {
                if(typeof(tooltipVal) === "number") {
                  tooltipVal = tooltipVal.toFixed(tooltipOption.valueFormat.decimal);
                }
                tooltipHtml = tooltipHtml + '<tr><th>' + key + '</th><td>' + tooltipVal + '</td></tr>';
              }
            }
          }
        // }

        tooltipHtml = tooltipHtml + '</tbody></table></span></div>';

        content.innerHTML = tooltipHtml;
        popup.setPosition(coords);

      } else {
        popup.setPosition(undefined);
      }
    });
  }

  /**
   * 차트에 설정된 옵션으로 차트를 그린다.
   * - 각 차트에서 ride
   * @param isKeepRange: 현재 스크롤 위치를 기억해야 할 경우
   */
  public drawSecondLayer(data: any): void {
    if(this.data2 === undefined) {
      return;
    }

    console.log('=== map component draw2 ===');
    // console.log(this.data2);
    (<any>window).uiOption = this.uiOption;
    // (<any>window).styleData = this.data2;

    ////////////////////////////////////////////////////////
    // 업데이트
    ////////////////////////////////////////////////////////

    // 엘리먼트 반영
    this.changeDetect.detectChanges();

    let source = new ol.source.Vector();
    let hexagonSource = new ol.source.Vector();

    let symbolLayer = new ol.layer.Vector({
      source: source,
      style: this.mapStyleFunction(1),
      opacity: this.uiOption.layers[1].color.transparency / 100
    });

    let clusterLayer = new ol.layer.Vector({
      source: source,
      style: this.clusterStyleFunction(1),
      opacity: this.uiOption.layers[1].color.transparency / 100
    });

    let featureColor = this.uiOption.layers[1].color.schema;
    let colorList = ChartColorList[featureColor];

    let heatmapLayer = new ol.layer.Heatmap({
      source: source,
      style: this.clusterStyleFunction(1),
      opacity: this.uiOption.layers[1].color.transparency / 100,
      blur: this.uiOption.layers[1].color.blur,
      radius: this.uiOption.layers[1].color.radius,
      gradient: colorList
    });

    let hexagonLayer = new ol.layer.Vector({
      source: hexagonSource,
      style: this.hexagonStyleFunction(1),
      opacity: this.uiOption.layers[1].color.transparency / 100
    });

    let textLayer = new ol.layer.Vector({
      source: source,
      style: this.textStyleFunction()
    });

    let features = [];
    let hexagonFeatures = (new ol.format.GeoJSON()).readFeatures(data[0]);;
    // let features = (new ol.format.GeoJSON()).readFeatures(this.data[0]);
    let h3Indexs = [];

    let field;
    for(let column of this.pivot.columns) {
      if(column["layerNum"] === 2) {
        field = column;
        break;
      }
    }

    let geomType = field.field.logicalType.toString();

    for(let i=0;i<data[0]["features"].length;i++) {

      let feature = new ol.Feature();
      feature = (new ol.format.GeoJSON()).readFeature(data[0].features[i]);

      if(geomType === "GEO_POINT") {

        let featureCenter = feature.getGeometry().getCoordinates();

        if(featureCenter.length === 1) {
          let extent = feature.getGeometry().getExtent();
          featureCenter = ol.extent.getCenter(extent);
          feature.setGeometry(new ol.geom.Point(featureCenter));
        }
      }

      if(this.uiOption.fieldMeasureList.length > 0) {
        //히트맵 weight 설정
        feature.set('weight', feature.getProperties()[this.uiOption.fieldMeasureList[0].aggregationType + '(' + this.uiOption.fieldMeasureList[0].name + ')'] / this.data[0].valueRange.maxValue);
      }

      features[i] = feature;

    }

    hexagonSource.addFeatures(hexagonFeatures);
    source.addFeatures(features);

    let clusterSource = new ol.source.Cluster({
      distance: 10,
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
        // this.uiOption.layers[0].type = "symbol";
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
      } else if(this.uiOption.layers[1].type === "polygon") {
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

      symbolLayer.setStyle(this.mapStyleFunction(1));
      symbolLayer.setOpacity(this.uiOption.layers[1].color.transparency / 100);

      clusterLayer.setStyle(this.clusterStyleFunction(1));
      clusterLayer.setOpacity(this.uiOption.layers[1].color.transparency / 100);

      heatmapLayer.setBlur(this.uiOption.layers[1].color.blur);
      heatmapLayer.setRadius(this.uiOption.layers[1].color.radius);
      heatmapLayer.setOpacity(this.uiOption.layers[1].color.transparency / 100);

      hexagonLayer.setStyle(this.hexagonStyleFunction(1));
      hexagonLayer.setOpacity(this.uiOption.layers[1].color.transparency / 100);

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
      } else if(this.uiOption.layers[1].type === "polygon") {
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
    this.apply();

    // 완료
    this.drawFinished.emit();
  }

  /**
   * 차트에 설정된 옵션으로 차트를 그린다.
   * - 각 차트에서 ride
   * @param isKeepRange: 현재 스크롤 위치를 기억해야 할 경우
   */
  public drawThirdLayer(data: any): void {
    if(this.data2 === undefined) {
      return;
    }

    console.log('=== map component draw3 ===');
    // console.log(this.data2);
    (<any>window).uiOption = this.uiOption;
    // (<any>window).styleData = this.data2;

    ////////////////////////////////////////////////////////
    // 업데이트
    ////////////////////////////////////////////////////////

    // 엘리먼트 반영
    this.changeDetect.detectChanges();

    let source = new ol.source.Vector();
    let hexagonSource = new ol.source.Vector();

    let symbolLayer = new ol.layer.Vector({
      source: source,
      style: this.mapStyleFunction(2),
      opacity: this.uiOption.layers[2].color.transparency / 100
    });

    let clusterLayer = new ol.layer.Vector({
      source: source,
      style: this.clusterStyleFunction(2),
      opacity: this.uiOption.layers[2].color.transparency / 100
    });

    let featureColor = this.uiOption.layers[2].color.schema;
    let colorList = ChartColorList[featureColor];

    let heatmapLayer = new ol.layer.Heatmap({
      source: source,
      style: this.clusterStyleFunction(2),
      opacity: this.uiOption.layers[2].color.transparency / 100,
      blur: this.uiOption.layers[2].color.blur,
      radius: this.uiOption.layers[2].color.radius,
      gradient: colorList
    });

    let hexagonLayer = new ol.layer.Vector({
      source: hexagonSource,
      style: this.hexagonStyleFunction(2),
      opacity: this.uiOption.layers[2].color.transparency / 100
    });

    let textLayer = new ol.layer.Vector({
      source: source,
      style: this.textStyleFunction()
    });

    let features = [];
    let hexagonFeatures = (new ol.format.GeoJSON()).readFeatures(data[0]);;
    // let features = (new ol.format.GeoJSON()).readFeatures(this.data[0]);
    let h3Indexs = [];

    let field;
    for(let column of this.pivot.columns) {
      if(column["layerNum"] === 3) {
        field = column;
        break;
      }
    }

    let geomType = field.field.logicalType.toString();

    for(let i=0;i<data[0]["features"].length;i++) {

      let feature = new ol.Feature();
      feature = (new ol.format.GeoJSON()).readFeature(data[0].features[i]);

      if(geomType === "GEO_POINT") {

        let featureCenter = feature.getGeometry().getCoordinates();

        if(featureCenter.length === 1) {
          let extent = feature.getGeometry().getExtent();
          featureCenter = ol.extent.getCenter(extent);
          feature.setGeometry(new ol.geom.Point(featureCenter));
        }
      }

      if(this.uiOption.fieldMeasureList.length > 0) {
        //히트맵 weight 설정
        feature.set('weight', feature.getProperties()[this.uiOption.fieldMeasureList[0].aggregationType + '(' + this.uiOption.fieldMeasureList[0].name + ')'] / this.data[0].valueRange.maxValue);
      }

      features[i] = feature;

    }

    hexagonSource.addFeatures(hexagonFeatures);
    source.addFeatures(features);

    let clusterSource = new ol.source.Cluster({
      distance: 10,
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
        // this.uiOption.layers[0].type = "symbol";
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
      } else if(this.uiOption.layers[2].type === "polygon") {
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

      symbolLayer.setStyle(this.mapStyleFunction(2));
      symbolLayer.setOpacity(this.uiOption.layers[2].color.transparency / 100);

      clusterLayer.setStyle(this.clusterStyleFunction(2));
      clusterLayer.setOpacity(this.uiOption.layers[2].color.transparency / 100);

      heatmapLayer.setBlur(this.uiOption.layers[2].color.blur);
      heatmapLayer.setRadius(this.uiOption.layers[2].color.radius);
      heatmapLayer.setOpacity(this.uiOption.layers[2].color.transparency / 100);

      hexagonLayer.setStyle(this.hexagonStyleFunction(2));
      hexagonLayer.setOpacity(this.uiOption.layers[2].color.transparency / 100);

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
      } else if(this.uiOption.layers[2].type === "polygon") {
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
    this.apply();

    // 완료
    this.drawFinished.emit();
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
      this.data2 = undefined;
    }

    // 완료
    this.drawFinished.emit();
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
      this.data2 = undefined;
    }

    // 완료
    this.drawFinished.emit();
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
    // secondLayerQuery.dataSource = this.widget.configuration.dataSource;

    let thirdLayerQuery: SearchQueryRequest = _.clone(this.query);
    // thirdLayerQuery.dataSource = this.widget.configuration.dataSource;

    let layers2 = [];
    let layers3 = [];

    if(secondLayerQuery) {
      for(let column of this.pivot.columns) {
        if(column["layerNum"] === 2) {
          let layer = {
            type: column.type,
            name: column.name,
            alias: column.alias,
            ref: null,
            format: null,
            dataSource: column.field.dataSource
          }

          layer.dataSource = column.field.dataSource;

          // this.widget.configuration.dataSource.engineName = column.field.dataSource;
          // this.widget.configuration.dataSource.name = column.field.dataSource;
          // this.widget.configuration.dataSource.id = column.field.dsId;

          secondLayerQuery.dataSource.engineName = column.field.dataSource;
          secondLayerQuery.dataSource.name = column.field.dataSource;
          secondLayerQuery.dataSource.id = column.field.dsId;

          if(column.field.logicalType.toString().substring(0,3) === 'GEO') {
            layer.format = {
              type : "geo"
            }
          }

          if(column.field.logicalType.toString() === 'GEO_POINT') {
            layer.format = {
              type: "geo_hash",
              method: "h3",
              precision: 8       // Precision 적용 (1~12) jjh123
            }
          }

          layers2.push(layer);
        } else if(column["layerNum"] === 3) {
          let layer = {
            type: column.type,
            name: column.name,
            alias: column.alias,
            ref: null,
            format: null,
            dataSource: column.field.dataSource
          }

          thirdLayerQuery.dataSource.engineName = column.field.dataSource;
          thirdLayerQuery.dataSource.name = column.field.dataSource;
          thirdLayerQuery.dataSource.id = column.field.dsId;

          if(column.field.logicalType.toString().substring(0,3) === 'GEO') {
            layer.format = {
              type : "geo"
            }
          }

          if(column.field.logicalType.toString() === 'GEO_POINT') {
            layer.format = {
              type: "geo_hash",
              method: "h3",
              precision: 8       // Precision 적용 (1~12) jjh123
            }
          }

          layers3.push(layer);
        }
      }

      for(let aggregation of this.pivot.aggregations) {
        if(aggregation["layerNum"] === 2) {
          let layer = {
            type: aggregation.type,
            name: aggregation.name,
            alias: aggregation.alias,
            ref: null,
            aggregationType: aggregation.aggregationType,
            dataSource: aggregation.field.dataSource
          }

          layers2.push(layer);

        } else if(aggregation["layerNum"] === 3) {
          let layer = {
            type: aggregation.type,
            name: aggregation.name,
            alias: aggregation.alias,
            ref: null,
            aggregationType: aggregation.aggregationType,
            dataSource: aggregation.field.dataSource
          }

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

      if(this.data2 === undefined && secondLayerVaild) {
        this.datasourceService.searchQuery(secondLayerQuery).then(
          (data) => {

            console.log(data);
            this.data2 = data;
            console.log(this.mapVaild);
            this.drawSecondLayer(data);
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
      } else {
        // this.drawSecondLayer(this.data2);
        this.data2 = undefined;
      }

      if(this.data3 === undefined && thirdLayerVaild) {
        this.datasourceService.searchQuery(thirdLayerQuery).then(
          (data) => {

            console.log(data);
            this.data3 = data;
            this.drawThirdLayer(data);
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
      } else {
        this.data3 = undefined;
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

    if(layerNum === 1) {
      document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '104px';
    } else if(layerNum === 2) {
      document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '149px';
    } else if(layerNum === 3) {
      document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '194px';
    }

    document.getElementsByClassName("ddp-ui-chart-area")[0]["style"].padding = '0 0 0 0';
    this.olmap.updateSize();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
