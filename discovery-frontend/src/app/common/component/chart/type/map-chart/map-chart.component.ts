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
  public data: Map = new Map()

  public mouseX = 0;
  public mouseY = 0;
  public property = 0;


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
    protected injector: Injector ) {

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
    console.log(this.uiOption);
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

    if(this.uiOption.map === 'POSITRON') {
      layer = this.cartoPositronLayer;
    } else if(this.uiOption.map === 'DARK') {
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
      document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '84px';
    }
    this.olmap.updateSize();

    let element = document.getElementById('popup');
    let content = document.getElementById('popup-contents');
    let popup = new ol.Overlay({
      element: element,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [-50, -100]
    });
    this.olmap.addOverlay(popup);

    this.olmap.on('pointermove', function(evt) {

      let feature = this.forEachFeatureAtPixel(evt.pixel,
        (f) => {
          return f;
        });

      if(feature) {
        let coords = feature.getGeometry().getCoordinates();

        let pointerX = coords[0].toFixed(4);
        let pointerY = coords[1].toFixed(4);
        let property = feature.getProperties().amt;


        content.innerHTML =
            '<div class="ddp-ui-tooltip-info ddp-map-tooltip" style="display:block; position:absolute; top:0; left:0; z-index:99999;">' +
            '<span class="ddp-txt-tooltip">' +
            '<span class="ddp-label"><em class="ddp-icon-mapview1-w"></em> Region</span>' +
            '<table class="ddp-table-info">' +
            '<colgroup><col width="70px"><col width="*"></colgroup>' +
            '<tbody><tr><th>Geo info</th><td>'+ pointerX + ', ' + pointerY + '</td></tr>' +
            '<tr><th>Amt</th><td>' + property + '</td></tr></tbody></table>' +
            '</span>' +
            '</div>';

        popup.setPosition(coords);

      } else {
        popup.setPosition(undefined);
      }

    });

    const zoomslider = new ol.control.ZoomSlider();
    this.olmap.addControl(zoomslider);

    this.mapVaild = true;
  }

  /**
   * map style function
   */
  public mapStyleFunction = () => {

    let styleOption = this.uiOption;

    return function(feature, resolution) {

      let layerType = styleOption.layers[0].type;
      let symbolType = styleOption.layers[0].symbol;
      let outlineType = styleOption.layers[0].outline.thickness;
      let featureColor = styleOption.layers[0].color.schema;
      let outlineColor = styleOption.layers[0].outline.color;
      let featureColorType = styleOption.layers[0].color.by;
      let featureSizeType = styleOption.layers[0].size.by;

      let outlineWidth = 0.00000001;
      if(outlineType === 'THIN')  {
        outlineWidth = 1;
      } else if(outlineType === 'NORMAL') {
        outlineWidth = 2;
      } else if(outlineType === 'THICK') {
        outlineWidth = 3;
      }

      let featureSize = 5;
      if(featureSizeType === 'MEASURE') {
        featureSize = parseInt(feature.get(styleOption.layers[0].size.column)) / 10000;
      }

      if(featureColorType === 'MEASURE') {
        let colorList = ChartColorList[featureColor['colorNum']];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      } else if(featureColorType === 'DIMENSION') {
        let colorList = ChartColorList[featureColor['colorNum']];
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
          width: 1
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
                color: 'black',
                width: 1
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            if(outlineWidth > 0) {
              style.setStroke();
            }
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
                color: 'black',
                width: 1
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
                color: 'black',
                width: 1
              }),
              fill: new ol.style.Fill({
                color: featureColor
              })
            });
            break;
        }
      }

      return style;
    }
  }

  public clusterStyleFunction = () => {

    let styleOption = this.uiOption;

    return function (feature, resolution) {
      let layerType = (<any>window).uiOption.layers[0].type;
      let symbolType = (<any>window).uiOption.layers[0].symbol;
      let outlineType = (<any>window).uiOption.layers[0].outline.thickness;
      let featureColor = (<any>window).uiOption.layers[0].color.schema;
      let outlineColor = (<any>window).uiOption.layers[0].outline.color;
      let featureColorType = (<any>window).uiOption.layers[0].color.by;

      let outlineWidth = 0.00000001;
      if(outlineType === 'THIN')  {
        outlineWidth = 1;
      } else if(outlineType === 'NORMAL') {
        outlineWidth = 2;
      } else if(outlineType === 'THICK') {
        outlineWidth = 3;
      }

      if(featureColorType === 'MEASURE') {
        let colorList = ChartColorList[featureColor.colorNum];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      } else if(featureColorType === 'DIMENSION') {
        let colorList = ChartColorList[featureColor.colorNum];
        featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
      }

      let size = feature.get('features').length;

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

  /**
   * 차트에 설정된 옵션으로 차트를 그린다.
   * - 각 차트에서 ride
   * @param isKeepRange: 현재 스크롤 위치를 기억해야 할 경우
   */
  public draw(isKeepRange?: boolean): void {
    console.log('=== map component draw ===');
    (<any>window).uiOption = this.uiOption;

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
      style: this.mapStyleFunction(),
      opacity: this.uiOption.layers[0].color.transparency / 100
    });

    let clusterLayer = new ol.layer.Vector({
      source: source,
      style: this.clusterStyleFunction(),
      opacity: this.uiOption.layers[0].color.transparency / 100
    });

    let heatmapLayer = new ol.layer.Heatmap({
      source: source,
      style: this.clusterStyleFunction(),
      opacity: this.uiOption.layers[0].color.transparency / 100,
      blur: this.uiOption.layers[0].color.blur,
      radius: this.uiOption.layers[0].color.radius
    });

    let hexagonLayer = new ol.layer.Vector({
      source: hexagonSource,
      style: this.mapStyleFunction(),
      opacity: this.uiOption.layers[0].color.transparency / 100
    });

    let features = [];
    let hexagonFeatures = [];
    // let features = (new ol.format.GeoJSON()).readFeatures(this.data[0]);

    for(let i=0;i<this.data[0]["features"].length;i++) {
      let feature = new ol.Feature({
        geometry: new ol.geom.Point([this.data[0]["features"][i].properties["gis.lon"], this.data[0]["features"][i].properties["gis.lat"]])
      })

      // Convert a lat/lng point to a hexagon index at resolution 7
      let h3Index = h3.geoToH3((this.data[0]["features"][i].properties["gis.lat"]), (this.data[0]["features"][i].properties["gis.lon"]), this.uiOption.layers[0].color.resolution);

      // Get the center of the hexagon
      let hexCenterCoordinates = h3.h3ToGeo(h3Index);

      // Get the vertices of the hexagon
      let hexBoundary = h3.h3ToGeoBoundary(h3Index, true);

      // let hexagonFeature = (new ol.format.GeoJSON()).readFeature(hexBoundary);

      let hexagonFeature = new ol.Feature({
        geometry: new ol.geom.Polygon([hexBoundary])
      })

      hexagonFeatures[i] = hexagonFeature;

      feature.setProperties(this.data[0]["features"][i].properties);
      features[i] = feature;
    }

    hexagonSource.addFeatures(hexagonFeatures);

    source.addFeatures(features);

    let clusterSource = new ol.source.Cluster({
      distance: 10,
      source: source
    });

    symbolLayer.setSource(source);
    clusterLayer.setSource(clusterSource);

    if(!this.mapVaild) {
      this.createMap();

      this.olmap.addLayer(symbolLayer);
      this.olmap.addLayer(clusterLayer);
      this.olmap.addLayer(heatmapLayer);
      this.olmap.addLayer(hexagonLayer);

      if(this.uiOption.layers[0].type === "symbol") {
        if(this.uiOption.layers[0].clustering) {
          symbolLayer.setVisible(false);
          clusterLayer.setVisible(true);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
        } else {
          symbolLayer.setVisible(true);
          clusterLayer.setVisible(false);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
        }
      } else if(this.uiOption.layers[0].type === "heatmap") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(true);
        hexagonLayer.setVisible(false);
      } else if(this.uiOption.layers[0].type === "tile") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(true);
      }

      this.olmap.getView().fit(source.getExtent());

    } else {

      this.olmap.getLayers().getArray()[1] = symbolLayer;
      this.olmap.getLayers().getArray()[2] = clusterLayer;
      this.olmap.getLayers().getArray()[3] = heatmapLayer;
      this.olmap.getLayers().getArray()[4] = hexagonLayer;

      symbolLayer.setStyle(this.mapStyleFunction());
      symbolLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      clusterLayer.setStyle(this.clusterStyleFunction());
      clusterLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      heatmapLayer.setBlur(this.uiOption.layers[0].color.blur);
      heatmapLayer.setRadius(this.uiOption.layers[0].color.radius);
      heatmapLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      hexagonLayer.setStyle(this.mapStyleFunction());
      hexagonLayer.setOpacity(this.uiOption.layers[0].color.transparency / 100);

      if(this.uiOption.layers[0].type === "symbol") {
        if(this.uiOption.layers[0].clustering) {
          symbolLayer.setVisible(false);
          clusterLayer.setVisible(true);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
        } else {
          symbolLayer.setVisible(true);
          clusterLayer.setVisible(false);
          heatmapLayer.setVisible(false);
          hexagonLayer.setVisible(false);
        }
      } else if(this.uiOption.layers[0].type === "heatmap") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(true);
        hexagonLayer.setVisible(false);
      } else if(this.uiOption.layers[0].type === "tile") {
        symbolLayer.setVisible(false);
        clusterLayer.setVisible(false);
        heatmapLayer.setVisible(false);
        hexagonLayer.setVisible(true);
      }

      if(this.uiOption.map === 'OSM') {
        this.olmap.getLayers().getArray()[0] = this.osmLayer;
      } else if(this.uiOption.map === 'POSITRON') {
        this.olmap.getLayers().getArray()[0] = this.cartoPositronLayer;
      } else if(this.uiOption.map === 'DARK') {
        this.olmap.getLayers().getArray()[0] = this.cartoDarkLayer;
      }

      this.olmap.updateSize();
    }

    // 차트 반영
    this.apply();

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
    // 초기화를 하는경우
    // externalFilters가 true인 경우 - 다른차트에서 selection필터를 설정시 적용되는 차트를 그리는경우 차트 초기화
    // if ((this.isUpdateRedraw && initFl) || this.params.externalFilters) {
    //   this.createMap();
    // }
    //
    // // Apply!
    // // chart.setOption(option, notMerge, lazyUpdate);
    // const source = new ol.source.Vector();
    // const layer = new ol.layer.Vector({
    //   source: source,
    //   style: this.createStyle()
    // });
    //
    // this.olmap.addLayer(layer);
    //
    // // GetFeature request 생성
    // var featureRequest = new ol.format.WFS().writeGetFeature({
    //   srsName: 'EPSG:4326',
    //   featureNS: 'http://map.discovery.metatron.app',
    //   featurePrefix: 'metatron',
    //   featureTypes: ['real_price'],
    //   outputFormat: 'application/json',
    //   // filter: this.creteFilter('like', 'py', '40*')
    //   // filter: this.creteFilter('equalTo', 'py', '40.42')
    //   // filter: this.creteFilter('notEqualTo', 'py', '40.42')
    //   // filter: this.creteFilter('greaterThan', 'py', 40)
    //   filter: this.creteFilter('lessThan', 'py', 50)
    //   // filter: this.creteFilter('bbox','the_geom', [127.12729586618846, 37.53434930078757, 126.98919428842967, 37.46516976587546])
    //   // filter: ol.format.filter.and(
    //   //     ol.format.filter.like('py', '40*')
    //   // )
    // });
    //
    // let mapchart = this.olmap;
    // // geoserver로 데이터 요청, response data -> features 추가
    // fetch('/geoserver/wfs', {
    //   method: 'POST',
    //   body: new XMLSerializer().serializeToString(featureRequest)
    // }).then(function(response) {
    //   return response.json();
    // }).then(function(json) {
    //   let features = new ol.format.GeoJSON().readFeatures(json);
    //   source.addFeatures(features);
    //   mapchart.getView().fit(source.getExtent());
    // });
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
    console.log('map resize');
    document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '84px';
    this.olmap.updateSize();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
