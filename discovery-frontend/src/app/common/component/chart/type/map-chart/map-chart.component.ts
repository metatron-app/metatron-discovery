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
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {BaseChart, ChartSelectInfo} from '../../base-chart';
import {Pivot} from '../../../../../domain/workbook/configurations/pivot';
import {UIMapOption} from '../../option/ui-option/map/ui-map-chart';
import {
  HeatmapColorList,
  MapBy,
  MapGeometryType,
  MapLayerStyle,
  MapLayerType,
  MapLineStyle,
  MapSymbolType,
  MapThickness,
  SelectionColor,
} from '../../option/define/map/map-common';
import {ColorRange} from '../../option/ui-option/ui-color';
import {
  ChartColorList,
  ChartSelectMode,
  ChartType,
  EventType,
  ShelveFieldType,
  UIPosition,
} from '../../option/define/common';
import {UISymbolLayer} from '../../option/ui-option/map/ui-symbol-layer';
import {UIChartColorByDimension, UIChartZoom, UILayers, UIOption,} from '../../option/ui-option';
import * as _ from 'lodash';
import {BaseOption} from '../../option/base-option';
import {FormatOptionConverter} from '../../option/converter/format-option-converter';
import {UILineLayer} from '../../option/ui-option/map/ui-line-layer';
import {Field as AbstractField, Field,} from '../../../../../domain/workbook/configurations/field/field';
import {Shelf} from '../../../../../domain/workbook/configurations/shelf/shelf';
import {LogicalType} from '../../../../../domain/datasource/datasource';
import {GeoField} from '../../../../../domain/workbook/configurations/field/geo-field';
import {TooltipOptionConverter} from '../../option/converter/tooltip-option-converter';
import {ChartUtil} from '../../option/util/chart-util';
import {isNullOrUndefined, isUndefined} from 'util';
import {UIHeatmapLayer} from '../../option/ui-option/map/ui-heatmap-layer';
import {UIPolygonLayer} from '../../option/ui-option/map/ui-polygon-layer';
import {UITileLayer} from '../../option/ui-option/map/ui-tile-layer';
import {ColorOptionConverter} from '../../option/converter/color-option-converter';
import {CommonConstant} from "../../../../constant/common.constant";

declare let ol;

@Component({
  selector: 'map-chart',
  templateUrl: 'map-chart.component.html'
})
export class MapChartComponent extends BaseChart implements AfterViewInit {

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

  // Feature icon element
  @ViewChild('feature')
  private featureEl: ElementRef;

  private _propMapConf = sessionStorage.getItem(CommonConstant.PROP_MAP_CONFIG);
  private _customMapLayers: { name: string, layer: any, isDefault: boolean }[] = [];

  @Input('needToRemoveMapLayer')
  set removeAllLayer(isChartShow: boolean) {
    if (isChartShow == false) {
      if (this.olmap) {
        this.layerMap.forEach(item => this.olmap.removeLayer(item.layerValue));
        this.layerMap = [];
        this.olmap.removeLayer(this.osmLayer);
        this.olmap.removeLayer(this.cartoDarkLayer);
        this.olmap.removeLayer(this.cartoPositronLayer);
        this._customMapLayers.forEach(item => this.olmap.removeLayer(item.layer));
      }
    }
  }

  // previous zoom size
  private preZoomSize: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Map Object
  public olmap: any = undefined;

  // OSM Layer
  public osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
      attributions: this.attribution(),
      crossOrigin: 'anonymous'
    })
  });

  public cartoPositronLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      attributions: this.attribution(),
      crossOrigin: 'anonymous'
    })
  });

  // Carto Dark Layer
  public cartoDarkLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      attributions: this.attribution(),
      crossOrigin: 'anonymous'
    })
  });

  public layerMap: any = [];

  // Tooltip layer
  public tooltipLayer = undefined;

  // Tooltip info
  public tooltipInfo = {
    enable: false,
    geometryType: String(MapGeometryType.POINT),
    num: 1,
    name: null,
    title: 'Geo info',
    coords: [],
    fields: []
  };

  // Legend info
  public legendInfo = {
    enable: true,
    position: String(UIPosition.RIGHT_BOTTOM),
    layer: [
      // {
      //   name: 'Layer 1',
      //   type: MapLayerType.SYMBOL,
      //   pointType: MapSymbolType.CIRCLE,
      //   color: [{
      //     color: '#FFFFFF',
      //     column: 'gis'
      //   }]
      // }
    ],
    // click legend (show / hide)
    showFl: true
  };

  // 화면을 다시 그려줄 경우
  @Output('changeDraw')
  public changeDrawEvent: EventEmitter<any> = new EventEmitter();

  // 화면을 다시 그려줄 경우
  @Output('shelf')
  public shelfEvent: EventEmitter<any> = new EventEmitter();

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
    (this.layerMap) && (this.layerMap.forEach(item => item.layerValue.setSource(undefined)));
    (this.osmLayer) && (this.osmLayer.setSource(undefined));
    (this.cartoPositronLayer) && (this.cartoPositronLayer.setSource(undefined));
    (this.cartoDarkLayer) && (this.cartoDarkLayer.setSource(undefined));
    (this._customMapLayers) && (this._customMapLayers.forEach(item => item.layer.setSource(undefined)));

    if (this.olmap) {
      this.olmap.getLayers().getArray().forEach((layer) => {
        if ('function' === typeof layer.setSource) {
          layer.setSource(undefined);
        }
        this.olmap.removeLayer(layer);
      });
      this.olmap.getOverlays().forEach((overlay) => this.olmap.removeOverlay(overlay));
      this.olmap.getControls().forEach((control) => this.olmap.removeControl(control));
      this.olmap.setTarget(null);
      this.olmap = undefined;
    }
  } // function - ngOnDestroy

  // After View Init
  public ngAfterViewInit(): void {
    this.chart = this.area;
    if (this._propMapConf) {
      const objConf = JSON.parse(this._propMapConf);
      if (objConf.baseMaps) {
        this._customMapLayers
          = objConf.baseMaps.map(item => {
          return {
            name: item.name,
            layer: new ol.layer.Tile({
              source: new ol.source.XYZ({
                url: item.url,
                attributions: this.attribution(),
                crossOrigin: 'anonymous'
              })
            }),
            isDefault: (objConf.defaultBaseMap === item.name)
          }
        });
      }
    }
  }

  // After Content Init
  public ngAfterContentInit(): void {

    // Area
    this.$area = $(this.area.nativeElement);

    // when cursor moves to another chart, hide tooltip
    let scope = this;
    $(this.area.nativeElement).on({
      mouseleave: function () {
        if (!_.isUndefined(scope.tooltipLayer) && scope.tooltipLayer.length > 0) {
          scope.tooltipLayer.setPosition(undefined);
        }
      }
    });

    // Feature icon element
    let canvas = this.featureEl.nativeElement;
    canvas.width = 30;
    canvas.height = 20;
    let context = canvas.getContext('2d');
    context.fillStyle = '#7E94DE';
    this.roundRect(context, 0, 0, canvas.width, canvas.height, 4, true, false);
  }

  private roundRect(context, x, y, width, height, radius, fill, stroke): void {

    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    context.beginPath();
    context.moveTo(x + radius.tl, y);
    context.lineTo(x + width - radius.tr, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    context.lineTo(x + width, y + height - radius.br);
    context.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    context.lineTo(x + radius.bl, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    context.lineTo(x, y + radius.tl);
    context.quadraticCurveTo(x, y, x + radius.tl, y);
    context.closePath();
    if (fill) {
      context.fill();
    }
    if (stroke) {
      context.stroke();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Shelf Valid Check
   * 선반 전체 부분을 체크
   * @param pivot
   */
  public isValid(pivot: Pivot, shelf: Shelf): boolean {

    if (!shelf) return false;

    let valid: boolean = false;

    if (shelf.layers) {

      for (let index: number = 0; index < shelf.layers.length; index++) {
        let fields: Field[] = shelf.layers[index].fields;
        for (let layer of fields) {
          if (layer.field && layer.field.logicalType && -1 !== layer.field.logicalType.toString().indexOf('GEO')) {
            valid = true;
          }
        }
      }
    }
    return valid;
  }

  /**
   * Shelf current field Valid Check
   * 현재 선반의 필드를 체크
   * @param pivot
   * @param shelf
   * @returns {boolean}
   */
  public isCurrentShelfValid(shelf: Shelf): boolean {

    if (!shelf) return false;

    let valid: boolean = false;

    let fields: Field[] = shelf.layers[this.getUiMapOption().layerNum].fields;

    if (fields) {
      for (let layer of fields) {
        if (layer.field && layer.field.logicalType && -1 !== layer.field.logicalType.toString().indexOf('GEO')) {
          valid = true;
        }
      }
    }
    return valid;
  }

  /**
   * Map chart draw
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    // analysis
    if (!_.isUndefined(this.getUiMapOption().analysis) && !_.isUndefined(this.getUiMapOption().analysis['use']) && this.getUiMapOption().analysis['use'] == true
      && this.getUiMapOption().layerNum == this.getUiMapOption().layers.length - 1) {
      this.drawAnalysis();
      return;
    }

    ////////////////////////////////////////////////////////
    // Valid Check
    ////////////////////////////////////////////////////////
    if (!this.isValid(this.pivot, this.shelf)) {
      // No Data 이벤트 발생
      this.data.show = false;
      this.noData.emit();
      return;
    }

    if (!this.isCurrentShelfValid(this.shelf)) {
      this.removeLayer(this.getUiMapOption().layerNum);
    }

    ////////////////////////////////////////////////////////
    // set min / max
    ////////////////////////////////////////////////////////
    this.setMinMax();

    ////////////////////////////////////////////////////////
    // Check option (spec)
    ////////////////////////////////////////////////////////

    this.checkOption(this.getUiMapOption());

    ////////////////////////////////////////////////////////
    // Creation map & layer
    ////////////////////////////////////////////////////////

    // 엘리먼트 반영
    this.changeDetect.detectChanges();

    // Show data
    this.data.show = true;

    // reset legend data
    this.legendInfo.layer = [];

    // Is map creation
    let isMapCreation: boolean = this.createMap();

    for (let layerIndex = 0; layerIndex < this.getUiMapOption().layers.length; layerIndex++) {

      // Source
      let source = new ol.source.Vector({crossOrigin: 'anonymous'});

      // Line & Polygon Source
      let emptySource = new ol.source.Vector();

      // 데이터가 없는경우 dummy data 추가
      if (this.data.length != this.getUiMapOption().layers.length && !this.isGeoFieldCheck(this.shelf.layers, layerIndex)) {
        if (layerIndex == 0) {
          this.data = _.concat({features: []}, this.data[0]);
        }
      }

      // Creation feature
      this.createFeature(source, layerIndex);

      // Creation layer
      this.createLayer(source, emptySource, isMapCreation, layerIndex);

      // Creation legend
      this.createLegend(layerIndex);
    }

    // Creation tooltip and Zoom
    this.createMapOverLayEvent();

    // Chart resize
    if( this.drawByType != null || !_.isEmpty(this.drawByType) )
      this.olmap.updateSize();
    ////////////////////////////////////////////////////////
    // Apply
    ////////////////////////////////////////////////////////

    // 완료
    this.drawFinished.emit();

    ////////////////////////////////////////////////////////
    // add Selection event
    ////////////////////////////////////////////////////////

    if (!this.isPage) {
      this.selection();
    }
  }

  /**
   * Get map UI option
   */
  public getUiMapOption(): UIMapOption {
    return <UIMapOption>this.uiOption;
  }

  public resize(): void {
    this.onResize(null);
  }

  /**
   * fold / unfold legend (dashboard)
   */
  public changeFoldLegend() {

    if (!this.isPage) {
      this.legendInfo.showFl = !this.legendInfo.showFl;
    }
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

    // heatmap => no selection filter
    if (MapLayerType.HEATMAP === this.getUiMapOption().layers[this.getUiMapOption().layerNum].type) {
      return;
    }

    this.addChartSelectEventListener();
    // this.addChartMultiSelectEventListener();
  }

  /**
   * map - single feature selection filter
   */
  public addChartSelectEventListener() {
    this.olmap.on('singleclick', this.mapSelectionListener);
  }

  /**
   * map - multi features selection filter
   */
  public addChartMultiSelectEventListener() {

  }

  /**
   * 차트 Resize
   *
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    if (this.olmap) {
      this.olmap.updateSize();

      // TODO change minZoom
      // let minZoom = this.getMinZoom();
      //
      // if (this.olmap.getView().getMinZoom() !== minZoom) {
      //   this.olmap.getView().setMinZoom(minZoom);
      // }
    }
  }

  /**
   * 차트가 그려진 후 UI에 필요한 옵션 설정 - 차원값 리스트
   *
   * @param shelve
   */
  protected setDimensionList(): UIOption {
    let shelve: any = [];
    for (let layerIndex = 0; this.getUiMapOption().layers.length > layerIndex; layerIndex++) {
      if (this.shelf && !_.isUndefined(this.shelf.layers[layerIndex])) {
        this.shelf.layers[layerIndex].fields.forEach((field) => {
          shelve.push(field);
        });
      }
    }
    // undefined shelf layer can be existed because of adding removing layers
    if (shelve == null) return;
    // 선반값에서 해당 타입에 해당하는값만 name string값으로 리턴
    const getShelveReturnString = ((shelve: any, typeList: ShelveFieldType[]): string[] => {
      const resultList: string[] = [];
      shelve.map((item) => {
        if ((_.eq(item.type, typeList[0]) || _.eq(item.type, typeList[1])) && (item.field && item.field.logicalType && -1 == item.field.logicalType.indexOf('GEO'))) {
          resultList.push(item.name);
        }
      });
      return resultList;
    });

    // 색상지정 기준 필드리스트 설정, 기본 필드 설정
    this.uiOption.fieldList = getShelveReturnString(shelve, [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP]);
    if (this.uiOption.color) {
      // targetField 설정
      const targetField = (<UIChartColorByDimension>this.uiOption.color).targetField;
      // targetField가 있을때
      if (!_.isEmpty(targetField)) {
        if (this.uiOption.fieldList.indexOf(targetField) < 0) (<UIChartColorByDimension>this.uiOption.color).targetField = _.last(this.uiOption.fieldList);
        // targetField가 없을때
      } else {
        // 마지막 필드를 타겟필드로 잡기
        (<UIChartColorByDimension>this.uiOption.color).targetField = _.last(this.uiOption.fieldList);
      }
    }
    return this.uiOption;
  }

  /**
   * 차트가 그려진 후 UI에 필요한 옵션 설정 - 측정값 리스트
   *
   * @param shelve
   */
  protected setMeasureList(): UIOption {
    let shelve: any = [];
    for (let layerIndex = 0; this.getUiMapOption().layers.length > layerIndex; layerIndex++) {
      if (this.shelf && !_.isUndefined(this.shelf.layers[layerIndex])) {
        this.shelf.layers[layerIndex].fields.forEach((field) => {
          shelve.push(field);
        });
      }
    }
    // 선반값에서 해당 타입에 해당하는값만 field값으로 리턴
    const getShelveReturnField = ((shelve: any, typeList: ShelveFieldType[]): AbstractField[] => {
      let resultList: AbstractField[] = [];
      shelve.map((item) => {
        if ((_.eq(item.type, typeList[0]) || _.eq(item.type, typeList[1])) && (item.field && ('user_expr' === item.field.type || item.field.logicalType && -1 == item.field.logicalType.indexOf('GEO')))) {
          resultList.push(item);
        }
      });
      return resultList;
    });
    // 색상지정 기준 필드리스트 설정(measure list)
    this.uiOption.fieldMeasureList = getShelveReturnField(shelve, [ShelveFieldType.MEASURE, ShelveFieldType.CALCULATED]);
    // 색상지정 기준 필드리스트 설정(dimension list)
    this.uiOption.fielDimensionList = getShelveReturnField(shelve, [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP]);
    return this.uiOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Map chart creation
   */
  private createMap(): boolean {

    ////////////////////////////////////////////////////////
    // Set attribution
    ////////////////////////////////////////////////////////
    this.osmLayer.getSource().setAttributions(this.attribution());
    this.cartoPositronLayer.getSource().setAttributions(this.attribution());
    this.cartoDarkLayer.getSource().setAttributions(this.attribution());

    ////////////////////////////////////////////////////////
    // Map style
    ////////////////////////////////////////////////////////
    // Light (Default)
    let layer;
    if (0 < this._customMapLayers.length) {
      layer = this._customMapLayers.find(item => item.isDefault);
    }

    switch (this.getUiMapOption().style) {
      case MapLayerStyle.LIGHT.toString() :
        // Light
        layer = this.cartoPositronLayer;
        break;
      case MapLayerStyle.DARK.toString() :
        // Dark
        layer = this.cartoDarkLayer;
        break;
      case MapLayerStyle.COLORED.toString() :
        // Colored
        layer = this.osmLayer;
        break;
      default :
        // Custom layer
        const customLayer = this._customMapLayers.find(item => this.getUiMapOption().style === item.name);
        if (customLayer) {
          layer = customLayer.layer;
        }
    }

    ////////////////////////////////////////////////////////
    // Map creation
    ////////////////////////////////////////////////////////

    // if map is created before, delete all
    if (this.olmap) {

      this.layerMap.forEach(item => this.olmap.removeLayer(item.layerValue));
      this.layerMap = [];

      // // z index reset
      // this.layerMap.forEach( item => {
      //   item.layerValue.setZIndex(0);
      // });

      // Change map style (remove all layer)
      this.olmap.removeLayer(this.osmLayer);
      this.olmap.removeLayer(this.cartoDarkLayer);
      this.olmap.removeLayer(this.cartoPositronLayer);

      this._customMapLayers.forEach(item => this.olmap.removeLayer(item.layer));
      this.olmap.addLayer(layer);
      return false;
    }

    // Map object initialize
    this.olmap = new ol.Map({
      view: new ol.View({
        center: [126, 37],
        zoom: 6,
        // zoom: this.getMinZoom(),
        projection: 'EPSG:4326',
        maxZoom: 20,
        minZoom: 3,
        // minZoom: this.getMinZoom()
        //extent: [-7435794.111581946, -8766409.899970295, 8688138.383006273, 9314310.518718438]
      }),
      layers: [layer],
      target: this.$area[0]
    });
    this.olmap.un('moveend');
    this.olmap.on('moveend', this.zoomFunction);

    for (let i = 0; i < document.getElementsByClassName('ol-attribution').length; i++) {
      let element = document.getElementsByClassName('ol-attribution')[i] as HTMLElement;
      element.style.right = "auto";
      element.style.left = ".5em";
    }

    // Chart resize
    this.olmap.updateSize();

    // Zoom slider
    const zoomslider = new ol.control.ZoomSlider();
    this.olmap.addControl(zoomslider);

    // Is map creation
    return true;
  }

  /**
   * Creation map layer
   */
  private createLayer(source: any, emptySource: any, isMapCreation: boolean, layerIndex: number): void {
    ////////////////////////////////////////////////////////
    // Create layer
    ////////////////////////////////////////////////////////
    // Layer
    let layer: UILayers = this.getUiMapOption().layers[layerIndex];
    ////////////////////////////////////////////////////////
    // Cluster & Point layer
    ////////////////////////////////////////////////////////
    let field = null;
    _.each(this.shelf.layers[layerIndex].fields, (fieldTemp) => {
      if (fieldTemp.field.logicalType && fieldTemp.field.logicalType.toString().indexOf('GEO') != -1) {
        field = fieldTemp;
        return false;
      }
    });
    let isLogicalType = false;
    if (field != null && field.field != null && field.field.logicalType != null) {
      isLogicalType = true;
      let geomType = field.field.logicalType.toString();

      if (_.eq(layer.type, MapLayerType.SYMBOL)) {
        /** 화면에서 하는 cluster */
          // let symbolLayer: UISymbolLayer = <UISymbolLayer>layer;
          //////////////////////////
          // Cluster layer
          //////////////////////////
          // if (symbolLayer.clustering) {
          //   // Create
          //   let clusterLayer = new ol.layer.Vector({
          //     source: _.eq(geomType, LogicalType.GEO_POINT) ? clusterSource : emptySource,
          //     style: _.eq(geomType, LogicalType.GEO_POINT) ? this.clusterStyleFunction(layerIndex, this.data) : new ol.style.Style()
          //   });
          //   // this.clusterLayer.setSource(_.eq(geomType, LogicalType.GEO_POINT) ? clusterSource : emptySource);
          //   clusterLayer.setSource(_.eq(geomType, LogicalType.GEO_POINT) ? clusterSource : emptySource);
          //   // set z index (the default value is 0 and higher would be 1)
          //   // this.clusterLayer.setZIndex(this.getUiMapOption().layerNum == num? 1 : 0);
          //   clusterLayer.setZIndex(5);
          //   this.layerMap.push({id: layerIndex, layerValue: clusterLayer});
          //   // Init
          //   if (isMapCreation && this.getUiMapOption().showMapLayer) {
          //     // Add layer
          //     this.olmap.addLayer(clusterLayer);
          //   } else {
          //     if (this.getUiMapOption().showMapLayer) {
          //
          //       // Add layer
          //       this.olmap.addLayer(clusterLayer);
          //       // Set style
          //       clusterLayer.setStyle(_.eq(geomType, LogicalType.GEO_POINT) ? this.clusterStyleFunction(layerIndex, this.data) : new ol.style.Style());
          //     } else {
          //       // Remove layer
          //       this.olmap.removeLayer(clusterLayer);
          //     }
          //   }
          // } else {
          //////////////////////////
          // Point layer
          //////////////////////////
          // Create
        let symbolLayer = new ol.layer.Vector({
            source: _.eq(geomType, LogicalType.GEO_POINT) ? source : emptySource,
            style: _.eq(geomType, LogicalType.GEO_POINT) ? this.clusterStyleFunction(layerIndex, this.data) : new ol.style.Style()
          });
        // set z index (the default value is 0 and higher would be 1)
        // this.symbolLayer.setZIndex(this.getUiMapOption().layerNum == num? 1 : 0);
        symbolLayer.setZIndex(4);
        this.layerMap.push({id: layerIndex, layerValue: symbolLayer});
        // Init
        if (isMapCreation && this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(symbolLayer);
        } else {
          if (this.getUiMapOption().showMapLayer) {
            // Add layer
            this.olmap.addLayer(symbolLayer);
          } else {
            // Remove layer
            this.olmap.removeLayer(symbolLayer);
          }
        }
      } else if (_.eq(layer.type, MapLayerType.LINE) || _.eq(layer.type, MapLayerType.POLYGON)) {
        ////////////////////////////////////////////////////////
        // Line, Polygon layer
        ////////////////////////////////////////////////////////
        // Create
        let symbolLayer = new ol.layer.Vector({
          source: source,
          style: this.mapStyleFunction(layerIndex, this.data)
        });
        // set z index (the default value is 0 and higher would be 1)
        // this.symbolLayer.setZIndex(this.getUiMapOption().layerNum == num? 1 : 0);
        symbolLayer.setZIndex(3);
        this.layerMap.push({id: layerIndex, layerValue: symbolLayer});
        // Init
        if (isMapCreation && this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(symbolLayer);
        } else {
          if (this.getUiMapOption().showMapLayer) {
            // Add layer
            this.olmap.addLayer(symbolLayer);
          } else {
            // Remove layer
            this.olmap.removeLayer(symbolLayer);
          }
        }
      } else if (_.eq(layer.type, MapLayerType.HEATMAP)) {
        ////////////////////////////////////////////////////////
        // Heatmap layer
        ////////////////////////////////////////////////////////
        let getHeatMapLayerValue: UIHeatmapLayer = <UIHeatmapLayer>layer;
        // Create
        let heatmapLayer = new ol.layer.Heatmap({
          source: _.eq(geomType, LogicalType.GEO_POINT) ? source : emptySource,
          // Style
          gradient: HeatmapColorList[getHeatMapLayerValue.color.schema],
          opacity: 1 - (getHeatMapLayerValue.color.transparency * 0.01),
          radius: getHeatMapLayerValue.radius,
          blur: getHeatMapLayerValue.blur * 0.7
        });
        // set z index (the default value is 0 and higher would be 1)
        // this.heatmapLayer.setZIndex(this.getUiMapOption().layerNum == num? 1 : 0);
        heatmapLayer.setZIndex(0);
        this.layerMap.push({id: layerIndex, layerValue: heatmapLayer});
        // Init
        if (isMapCreation && this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(heatmapLayer);
        } else {
          if (this.getUiMapOption().showMapLayer) {
            // Add layer
            this.olmap.addLayer(heatmapLayer);
            // Set style
            if (isUndefined(HeatmapColorList[getHeatMapLayerValue.color.schema])) {
              heatmapLayer.setGradient(HeatmapColorList['HC1']);
            } else {
              heatmapLayer.setGradient(HeatmapColorList[getHeatMapLayerValue.color.schema]);
            }
            heatmapLayer.setOpacity(1 - (getHeatMapLayerValue.color.transparency * 0.01));
            heatmapLayer.setRadius(getHeatMapLayerValue.radius);
            heatmapLayer.setBlur(getHeatMapLayerValue.blur * 0.7);
          } else {
            // Remove layer
            this.olmap.removeLayer(heatmapLayer);
          }
        }
      } else if (_.eq(layer.type, MapLayerType.TILE)) {
        ////////////////////////////////////////////////////////
        // Hexgon layer
        ////////////////////////////////////////////////////////
        // Create
        let hexagonLayer = new ol.layer.Vector({
          source: _.eq(geomType, LogicalType.GEO_POINT) ? source : emptySource,
          style: _.eq(geomType, LogicalType.GEO_POINT) ? this.hexagonStyleFunction(layerIndex, this.data) : new ol.style.Style()
        });
        // set z index (the default value is 0 and higher would be 1)
        // this.hexagonLayer.setZIndex(this.getUiMapOption().layerNum == num? 1 : 0);
        hexagonLayer.setZIndex(1);
        this.layerMap.push({id: layerIndex, layerValue: hexagonLayer});
        // Init
        if (isMapCreation && this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(hexagonLayer);
        } else {
          if (this.getUiMapOption().showMapLayer) {
            // Add layer
            this.olmap.addLayer(hexagonLayer);
          } else {
            // Remove layer
            this.olmap.removeLayer(hexagonLayer);
          }
        }
      }
    }
    this.changeDetect.detectChanges();

    // Map data place fit
    if ((this.drawByType == EventType.CHANGE_PIVOT && isLogicalType && this.shelf.layers[layerIndex].fields[this.shelf.layers[layerIndex].fields.length - 1].field.logicalType != null) && 'Infinity'.indexOf(source.getExtent()[0]) == -1 &&
      (_.isUndefined(this.uiOption['layers'][layerIndex]['changeCoverage']) || this.uiOption['layers'][layerIndex]['changeCoverage'])) {
      this.olmap.getView().fit(source.getExtent());
    } else {
      // set saved data zoom
      if (this.uiOption.chartZooms && this.uiOption.chartZooms.length > 0) {
        this.olmap.getView().setCenter([this.uiOption.chartZooms[0].startValue, this.uiOption.chartZooms[0].endValue]);
        this.olmap.getView().setZoom(this.uiOption.chartZooms[0].count);
      }
    }
  }

  /**
   * Creation feature
   */
  private createFeature(source, layerIndex): void {

    let data = this.data[layerIndex];

    ////////////////////////////////////////////////////////
    // Generate feature
    ////////////////////////////////////////////////////////
    // Feature list
    let features = [];
    let field = null;
    _.each(this.shelf.layers[layerIndex].fields, (fieldTemp) => {
      if (fieldTemp != null && fieldTemp.field.logicalType && fieldTemp.field.logicalType.toString().indexOf('GEO') != -1) {
        field = fieldTemp;
        return false;
      }
    });
    if (field != null && field.field != null && field.field.logicalType != null) {
      let geomType = field.field.logicalType.toString();
      ////////////////////////////////////////////////////////
      // set field list
      ////////////////////////////////////////////////////////
      let shelf: GeoField[] = _.cloneDeep(this.shelf.layers[layerIndex].fields);
      this.checkFieldList(shelf);
      // Data set
      for (let i = 0; i < data.features.length; i++) {
        // geo type
        if (data.features[i].geometry.type.toString().toLowerCase().indexOf('point') != -1) {
          // point
          let pointFeature = (new ol.format.GeoJSON()).readFeature(data.features[i]);
          if (_.eq(geomType, LogicalType.GEO_POINT)) {
            let featureCenter = pointFeature.getGeometry().getCoordinates();
            if (featureCenter.length === 1) {
              let extent = pointFeature.getGeometry().getExtent();
              featureCenter = ol.extent.getCenter(extent);
              pointFeature.setGeometry(new ol.geom.Point(featureCenter));
            }
            if (this.uiOption.fieldMeasureList.length > 0) {
              const alias = ChartUtil.getFieldAlias(this.getUiMapOption().layers[layerIndex].color.column, this.shelf.layers[layerIndex].fields, this.getUiMapOption().layers[layerIndex].color.aggregationType);
              //히트맵 weight 설정
              if (data.valueRange[alias]) {
                pointFeature.set('weight', pointFeature.getProperties()[alias] / data.valueRange[alias].maxValue);
              }
            }
          }
          pointFeature.set('layerNum', layerIndex);
          pointFeature.set('isClustering', this.getUiMapOption().layers[layerIndex]['clustering']);
          features[i] = pointFeature;
          source.addFeature(features[i]);
        } else if (data.features[i].geometry.type.toString().toLowerCase().indexOf('polygon') != -1) {
          // polygon
          let polygonFeature = (new ol.format.GeoJSON()).readFeature(data.features[i]);
          polygonFeature.set('layerNum', layerIndex);
          features[i] = polygonFeature;
          source.addFeature(features[i]);
        } else if (data != null && data.features[i] != null && data.features[i].geometry != null && data.features[i].geometry.type.toString().toLowerCase().indexOf('line') != -1) {
          let line = new ol.geom.LineString(data.features[i].geometry.coordinates);
          let lineFeature = new ol.Feature({geometry: line});
          if (!_.isNull(this.getUiMapOption().layers[layerIndex].color.column)) {
            const alias = ChartUtil.getFieldAlias(this.getUiMapOption().layers[layerIndex].color.column, this.shelf.layers[layerIndex].fields, this.getUiMapOption().layers[layerIndex].color.aggregationType);
            lineFeature.set(alias, data.features[i].properties[alias]);
          }
          lineFeature.set('layerNum', layerIndex);
          features.push(lineFeature);
          source.addFeature(lineFeature);
        }
      } // end - features for
    }
  }

  /**
   * map style function
   */
  private mapStyleFunction = (layerNum, data, selectMode?: ChartSelectMode, dataIndex?: number) => {
    let scope: any = this;
    let styleOption: UIMapOption = this.getUiMapOption();
    let styleLayer: UILayers = styleOption.layers[layerNum];
    let styleData = !_.isUndefined(this.getUiMapOption().analysis) && this.getUiMapOption().analysis['use'] === true ? data[dataIndex] : data[layerNum];
    return function (feature, resolution) {

      ////////////////////////////////////////////////////////
      // Style options
      ////////////////////////////////////////////////////////

      let layerType = styleLayer.type;
      let featureColor = styleLayer.color.schema;
      let featureColorType = styleLayer.color.by;
      let symbolType = null;
      let outlineType = null;
      let lineDashType = null;
      let lineMaxVal = 1; //styleLayer.size.max;
      let outlineColor = null;
      let featureSizeType = null;
      let featureThicknessType = null;
      let alias = ChartUtil.getFieldAlias(styleLayer.color.column, scope.shelf.layers[layerNum], styleLayer.color.aggregationType);

      if (!_.isUndefined(styleOption['analysis']) && !_.isUndefined(styleOption['analysis']['use']) && styleOption['analysis']['use']) {
        if (!_.isUndefined(styleOption['analysis']['operation']['aggregation']) && !_.isUndefined(styleOption['analysis']['operation']['aggregation']['column'])
          && styleOption['analysis']['operation']['aggregation']['column'] == 'count') {
          alias = styleOption['analysis']['operation']['aggregation']['column'];
        } else {
          if (!_.isUndefined(styleLayer.color.aggregationType)) {
            alias = styleLayer.color.aggregationType + "(" + alias + ")";
          }
        }
      }

      // Symbol type
      if (_.eq(layerType, MapLayerType.SYMBOL)) {
        let symbolLayer: UISymbolLayer = <UISymbolLayer>styleLayer;
        symbolType = symbolLayer.symbol;
        outlineType = symbolLayer.outline ? symbolLayer.outline.thickness : null;
        outlineColor = symbolLayer.outline ? symbolLayer.outline.color : null;
        featureSizeType = symbolLayer.size.by;
      }

      // Line type
      if (_.eq(layerType, MapLayerType.LINE)) {
        let lineLayer: UILineLayer = <UILineLayer>styleLayer;
        lineDashType = lineLayer.lineStyle;
        featureThicknessType = lineLayer.thickness.by;
        lineMaxVal = lineLayer.thickness.maxValue;
      }

      // Polygon type
      if (_.eq(layerType, MapLayerType.POLYGON) || _.eq(layerType, MapLayerType.MULTIPOLYGON)) {
        let polygonLayer: UIPolygonLayer = <UIPolygonLayer>styleLayer;
        outlineType = polygonLayer.outline ? polygonLayer.outline.thickness : null;
        outlineColor = polygonLayer.outline ? polygonLayer.outline.color : null;
      }


      ////////////////////////////////////////////////////////
      // Color
      ////////////////////////////////////////////////////////

      if (_.eq(featureColorType, MapBy.MEASURE)) {
        if (styleLayer.color['ranges']) {
          for (let range of styleLayer.color['ranges']) {
            let rangeMax = range.fixMax;
            let rangeMin = range.fixMin;

            if (rangeMax === null) {

              // if feature value is bigger than max value, set max color
              if (feature.getProperties()[alias] > rangeMin) {
                featureColor = range.color;
              }

            } else {
              if (rangeMin === null) {
                let minValue = styleData.valueRange[alias].minValue;

                if (minValue >= 0) {
                  rangeMin = 0;
                  // when minValue is negative, set minValue to range min
                } else {
                  rangeMin = minValue;
                }
              }

              if (feature.getProperties()[alias] >= rangeMin &&
                feature.getProperties()[alias] <= rangeMax) {
                featureColor = range.color;
              }
            }
          }
        } else {
          const ranges = ColorOptionConverter.setMapMeasureColorRange(styleOption, styleData, scope.getColorList(styleLayer), layerNum, scope.shelf.layers[layerNum]);

          // set decimal value
          const formatValue = ((value) => {
            return parseFloat((Number(value) * (Math.pow(10, styleOption.valueFormat.decimal)) / Math.pow(10, styleOption.valueFormat.decimal)).toFixed(styleOption.valueFormat.decimal));
          });

          for (let range of ranges) {
            let rangeMax = range.fixMax;
            let rangeMin = range.fixMin;

            if (rangeMax === null) {

              // if feature value is bigger than max value, set max color
              if (feature.getProperties()[alias] > rangeMin) {
                featureColor = range.color;
              }

            } else {
              if (rangeMin === null) {
                let minValue = styleData.valueRange[alias].minValue;

                if (minValue >= 0) {
                  rangeMin = 0;
                  // when minValue is negative, set minValue to range min
                } else {
                  rangeMin = minValue;
                }
              }

              let value = formatValue(feature.getProperties()[alias]);

              if ((rangeMin == 0 && rangeMin == value) || (value >= rangeMin && value <= rangeMax)) {
                featureColor = range.color;
              }
            }
          }
        }


      } else if (_.eq(featureColorType, MapBy.DIMENSION)) {

        // Get dimension color
        const ranges = scope.setDimensionColorRange(styleLayer, styleData, scope.getColorList(styleLayer), []);
        _.each(ranges, (range) => {
          if (_.eq(feature.getProperties()[alias], range.column)) {
            featureColor = range.color;
            return false;
          }
        });
      } else if (_.eq(featureColorType, MapBy.NONE)) {
        featureColor = styleLayer.color.schema;
      }

      featureColor = scope.hexToRgbA(featureColor, 1 - (styleLayer.color.transparency * 0.01));

      ////////////////////////////////////////////////////////
      // Outline
      ////////////////////////////////////////////////////////

      let outlineWidth = 0.00000001;
      if (_.eq(outlineType, MapThickness.THIN)) {
        outlineWidth = 1;
      } else if (_.eq(outlineType, MapThickness.NORMAL)) {
        outlineWidth = 2;
      } else if (_.eq(outlineType, MapThickness.THICK)) {
        outlineWidth = 3;
      }

      let lineDash = [1];
      if (_.eq(lineDashType, MapLineStyle.DOTTED)) {
        lineDash = [3, 3];
      } else if (_.eq(lineDashType, MapLineStyle.DASHED)) {
        lineDash = [4, 8];
      }

      ////////////////////////////////////////////////////////
      // Line
      ////////////////////////////////////////////////////////

      let lineThickness = 2;

      if (_.eq(layerType, MapLayerType.LINE)) {
        try {
          let lineLayer: UILineLayer = <UILineLayer>styleLayer;
          const lineAlias = ChartUtil.getFieldAlias(lineLayer.thickness.column, scope.shelf.layers[layerNum], lineLayer.thickness.aggregationType);

          if (!_.eq(lineLayer.thickness.column, "NONE") && _.eq(featureThicknessType, MapBy.MEASURE)) {
            lineThickness = parseInt(feature.get(lineAlias)) / (styleData.valueRange[lineAlias].maxValue / lineMaxVal);
            if (lineThickness < 1) {
              lineThickness = 1;
            } else if (lineThickness > lineMaxVal) {
              lineThickness = lineMaxVal;
            }
          }
        } catch (error) {
        }
      }

      ////////////////////////////////////////////////////////
      // Selection filter
      ////////////////////////////////////////////////////////

      let filterFl: boolean = false;

      // set selection filter
      filterFl = scope.setFeatureSelectionMode(scope, feature);

      // when select mode or filter param exists, set feature selection style
      if ((filterFl || selectMode) && ChartSelectMode.ADD !== feature.getProperties()['selection']) {

        outlineWidth = 2;

        // when style is dark
        if (MapLayerStyle.DARK.toString() === styleOption.style) {
          featureColor = SelectionColor.FEATURE_DARK.toString();
          outlineColor = SelectionColor.OUTLINE_DARK.toString();

          // when style is colored, light
        } else {
          featureColor = SelectionColor.FEATURE_LIGHT.toString();
          outlineColor = SelectionColor.OUTLINE_LIGHT.toString();
        }
      }

      ////////////////////////////////////////////////////////
      // Creation style
      ////////////////////////////////////////////////////////

      let style = new ol.style.Style();

      if (_.eq(layerType, MapLayerType.LINE)) {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: featureColor,
            width: lineThickness,
            lineDash: lineDash
          })
        });
      } else if (_.eq(layerType, MapLayerType.POLYGON) || _.eq(layerType, MapLayerType.MULTIPOLYGON)) {
        style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: outlineColor,
            width: outlineWidth
          }),
          fill: new ol.style.Fill({
            color: featureColor
          })
        });
      }
      return style;
    }
  };

  /**
   * Cluster style function
   */
  private clusterStyleFunction = (layerNum, data, selectMode?: ChartSelectMode, dataIndex?: number) => {
    let scope: any = this;
    let styleOption: UIMapOption = this.getUiMapOption();
    let styleLayer: UILayers = styleOption.layers[layerNum];
    let styleData = !_.isUndefined(this.getUiMapOption().analysis) && this.getUiMapOption().analysis['use'] === true ? data[dataIndex] : data[layerNum];
    return function (feature, resolution) {
      ////////////////////////////////////////////////////////
      // Style options
      ////////////////////////////////////////////////////////
      let symbolLayer: UISymbolLayer = <UISymbolLayer>styleLayer;
      let layerType = styleLayer.type;
      let featureColor = styleLayer.color.schema;
      let featureColorType = styleLayer.color.by;
      let symbolType = symbolLayer.symbol;
      let outlineType = symbolLayer.outline ? symbolLayer.outline.thickness : null;
      let outlineColor = symbolLayer.outline ? symbolLayer.outline.color : null;
      let lineMaxVal = 1; //styleLayer.size.max;
      let featureSizeType = symbolLayer.size.by;
      let style = null;
      let alias = ChartUtil.getFieldAlias(styleLayer.color.column, scope.shelf.layers[layerNum].fields, styleLayer.color.aggregationType);
      ////////////////////////////////////////////////////////
      // Cluster size
      ////////////////////////////////////////////////////////
      let size: number = 0;
      let isClustering: boolean = false;

      if (!_.isUndefined(feature.getProperties()) && !_.isUndefined(feature.getProperties()['isClustering']) && !_.isUndefined(feature.getProperties().count)
        && feature.getProperties()['isClustering'] == true) {
        isClustering = true;
        size = feature.getProperties().count;
      }

      if (isClustering == false || size <= 1) {
        ////////////////////////////////////////////////////////
        // Color
        ////////////////////////////////////////////////////////
        if (_.eq(featureColorType, MapBy.MEASURE)) {
          if (styleLayer.color['ranges']) {
            for (let range of styleLayer.color['ranges']) {
              let rangeMax = range.fixMax;
              let rangeMin = range.fixMin;

              if (rangeMax === null) {
                // if feature value is bigger than max value, set max color
                if (feature.getProperties()[alias] > rangeMin) {
                  featureColor = range.color;
                }
              } else {
                if (rangeMin === null) {
                  // let minValue = styleData.valueRange[alias].minValue;
                  let minValue = 0;
                  if (styleData.valueRange[alias]) {
                    minValue = styleData.valueRange[alias].minValue;
                  }
                  if (minValue >= 0) {
                    rangeMin = 0;
                    // when minValue is negative, set minValue to range min
                  } else {
                    rangeMin = minValue;
                  }
                }
                if (feature.getProperties()[alias] >= rangeMin &&
                  feature.getProperties()[alias] <= rangeMax) {
                  featureColor = range.color;
                }
              }
            }
          } else {
            const ranges = ColorOptionConverter.setMapMeasureColorRange(styleOption, styleData, scope.getColorList(styleLayer), layerNum, scope.shelf.layers[layerNum].fields);
            // set decimal value
            const formatValue = ((value) => {
              return parseFloat((Number(value) * (Math.pow(10, styleOption.valueFormat.decimal)) / Math.pow(10, styleOption.valueFormat.decimal)).toFixed(styleOption.valueFormat.decimal));
            });
            for (let range of ranges) {
              let rangeMax = range.fixMax;
              let rangeMin = range.fixMin;
              if (rangeMax === null) {
                // if feature value is bigger than max value, set max color
                if (feature.getProperties()[alias] > rangeMin) {
                  featureColor = range.color;
                }
              } else {
                if (rangeMin === null) {
                  let minValue = styleData.valueRange[alias].minValue;

                  if (minValue >= 0) {
                    rangeMin = 0;
                    // when minValue is negative, set minValue to range min
                  } else {
                    rangeMin = minValue;
                  }
                }

                let value = formatValue(feature.getProperties()[alias]);

                if ((rangeMin == 0 && rangeMin == value) || (value >= rangeMin && value <= rangeMax)) {
                  featureColor = range.color;
                }
              }
            }
          }
        } else if (_.eq(featureColorType, MapBy.DIMENSION)) {
          // Get dimension color
          const ranges = scope.setDimensionColorRange(styleLayer, styleData, scope.getColorList(styleLayer), []);
          _.each(ranges, (range) => {
            if (_.eq(feature.getProperties()[alias], range.column)) {
              featureColor = range.color;
              return false;
            }
          });
        } else if (_.eq(featureColorType, MapBy.NONE)) {
          featureColor = styleLayer.color.schema;
        }
        featureColor = scope.hexToRgbA(featureColor, 1 - (styleLayer.color.transparency * 0.01));
        ////////////////////////////////////////////////////////
        // Outline
        ////////////////////////////////////////////////////////
        let outlineWidth = 0.00000001;
        if (_.eq(outlineType, MapThickness.THIN)) {
          outlineWidth = 1;
        } else if (_.eq(outlineType, MapThickness.NORMAL)) {
          outlineWidth = 2;
        } else if (_.eq(outlineType, MapThickness.THICK)) {
          outlineWidth = 3;
        }
        ////////////////////////////////////////////////////////
        // Size
        ////////////////////////////////////////////////////////
        let featureSize = 5;
        try {
          if (_.eq(featureSizeType, MapBy.MEASURE)) {
            featureSize = parseInt(feature.get(ChartUtil.getFieldAlias((<UISymbolLayer>styleLayer).size.column, scope.shelf.layers[layerNum].fields))) / (styleData.valueRange[ChartUtil.getFieldAlias((<UISymbolLayer>styleLayer).size.column, scope.shelf.layers[layerNum].fields)].maxValue / 30);
            if (featureSize < 5) {
              featureSize = 5;
            }
          }
        } catch (error) {
        }
        let lineThickness = 2;
        try {
          if (_.eq(featureSizeType, MapBy.MEASURE)) {
            lineThickness = parseInt(feature.get(ChartUtil.getFieldAlias((<UISymbolLayer>styleLayer).size.column, scope.shelf.layers[layerNum].fields))) / (styleData.valueRange[ChartUtil.getFieldAlias((<UISymbolLayer>styleLayer).size.column, scope.shelf.layers[layerNum].fields)].maxValue / lineMaxVal);
            if (lineThickness < 1) {
              lineThickness = 1;
            }
          }
        } catch (error) {
        }
        ////////////////////////////////////////////////////////
        // Selection filter
        ////////////////////////////////////////////////////////

        let filterFl: boolean = false;

        // set selection filter
        filterFl = scope.setFeatureSelectionMode(scope, feature);

        // when select mode or filter param exists, set feature selection style
        if ((filterFl || selectMode) && ChartSelectMode.ADD !== feature.getProperties()['selection']) {

          outlineWidth = 2;

          // when style is dark
          if (MapLayerStyle.DARK.toString() === styleOption.style) {
            featureColor = SelectionColor.FEATURE_DARK.toString();
            outlineColor = SelectionColor.OUTLINE_DARK.toString();

            // when style is colored, light
          } else {
            featureColor = SelectionColor.FEATURE_LIGHT.toString();
            outlineColor = SelectionColor.OUTLINE_LIGHT.toString();
          }
        }
        ////////////////////////////////////////////////////////
        // Creation style
        ////////////////////////////////////////////////////////
        style = new ol.style.Style({
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

        switch (symbolType) {
          case MapSymbolType.CIRCLE :
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
          case MapSymbolType.SQUARE :
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
          case MapSymbolType.TRIANGLE :
            style = new ol.style.Style({
              image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: featureColor}),
                points: 3,
                radius: featureSize,
                rotation: Math.PI / 4,
                angle: -28,
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
          case MapSymbolType.PIN :
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
          case MapSymbolType.PLAIN :
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
          case MapSymbolType.USER :
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
      }
      ////////////////////////////////////////////////////////
      // Cluster Style
      ////////////////////////////////////////////////////////
      else {

        // ////////////////////////////////////////////////////////
        // // Color
        // ////////////////////////////////////////////////////////
        //
        // if( _.eq(featureColorType, MapBy.MEASURE) ) {
        //
        //   if(styleData.valueRange) {
        //     let colorList = ChartColorList[featureColor];
        //     let avgNum = styleData.valueRange[scope.getFieldAlias(styleLayer.color.column)].maxValue / colorList.length;
        //
        //     let featurePropVal = 0;
        //
        //     if(feature.getProperties()["features"]) {
        //       for(let clusterFeature of feature.getProperties()["features"]) {
        //         featurePropVal = featurePropVal + clusterFeature.getProperties()[scope.getFieldAlias(styleLayer.color.column)];
        //       }
        //       featurePropVal = featurePropVal / feature.getProperties()["features"].length;
        //     }
        //
        //     for(let i=0;i<colorList.length;i++) {
        //       if(featurePropVal <= avgNum * (i+1) &&
        //         featurePropVal >= avgNum * (i)) {
        //         featureColor = colorList[i];
        //       }
        //     }
        //   }
        //
        //   // if(styleOption.layers[layerNum].color['customMode'] === 'SECTION') {
        //   //   for(let range of styleOption.layers[layerNum].color['ranges']) {
        //   //     let rangeMax = range.fixMax;
        //   //     let rangeMin = range.fixMin;
        //   //
        //   //     if(rangeMax === null) {
        //   //       rangeMax = rangeMin + 1;
        //   //     } // else if(rangeMin === null) {
        //   //       // rangeMin = 0;
        //   //     // }
        //   //
        //   //     let featurePropVal = 0;
        //   //
        //   //     for(let clusterFeature of feature.getFeatures()["features"]) {
        //   //       featurePropVal = featurePropVal + clusterFeature.getProperties()[styleOption.layers[scope.getFieldAlias(layerNum].color.column)];
        //   //     }
        //   //     featurePropVal = featurePropVal / feature.getFeatures()["features"].length;
        //   //
        //   //     if( featurePropVal > rangeMin &&  featurePropVal < rangeMax) {
        //   //       featureColor = range.color;
        //   //     } else if (rangeMin === null && featurePropVal < rangeMax) {
        //   //       featureColor = range.color;
        //   //     }
        //   //   }
        //   // }
        // }
        // else if( _.eq(featureColorType, MapBy.DIMENSION) ) {
        //   let colorList = ChartColorList[featureColor];
        //   featureColor = colorList[Math.floor(Math.random() * (colorList.length-1)) + 1];
        // }
        // else if( _.eq(featureColorType, MapBy.NONE) ) {
        //   featureColor = styleLayer.color.schema;
        // }

        //featureColor = _.eq(featureColorType, MapBy.NONE) && styleLayer.color.schema ? styleLayer.color.schema : '#6344ad';
        featureColor = '#7E94DE';
        //featureColor = scope.hexToRgbA(featureColor, styleLayer.color.transparency * 0.01);

        // ////////////////////////////////////////////////////////
        // // Outline
        // ////////////////////////////////////////////////////////
        //
        // let outlineWidth = 0.00000001;
        // if( _.eq(outlineType, MapThickness.THIN) )  {
        //   outlineWidth = 1;
        // }
        // else if( _.eq(outlineType, MapThickness.NORMAL) ) {
        //   outlineWidth = 2;
        // }
        // else if( _.eq(outlineType, MapThickness.THICK) ) {
        //   outlineWidth = 3;
        // }

        ////////////////////////////////////////////////////////
        // Creation style
        ////////////////////////////////////////////////////////

        // style = new ol.style.Style({
        //   image: new ol.style.Circle({
        //     radius: 15,
        //     fill: new ol.style.Fill({
        //       color: featureColor
        //     })
        //   }),
        //   text: new ol.style.Text({ // 클러스터링 되는 갯수 라벨링
        //     text: size.toString(), // 클러스터링 갯수
        //     fill: new ol.style.Fill({
        //       color: '#fff'
        //     })
        //   })
        // });
        let canvas = scope.featureEl.nativeElement;

        style = new ol.style.Style({
          image: new ol.style.Icon({
            img: canvas,
            imgSize: [canvas.width, canvas.height],
            opacity: 0.85
          })
          , text: new ol.style.Text({ // 클러스터링 되는 갯수 라벨링
            text: size.toString(), // 클러스터링 갯수
            fill: new ol.style.Fill({
              color: '#fff'
            }),
            font: '10px sans-serif'
          })
        });
      }

      return style;
    }
  }

  /**
   * Hexagon style function
   */
  private hexagonStyleFunction = (layerNum, data, selectMode?: ChartSelectMode, dataIndex?: number) => {

    let scope: any = this;
    let styleOption: UIMapOption = this.getUiMapOption();
    let styleLayer: UILayers = styleOption.layers[layerNum];
    let alias = ChartUtil.getFieldAlias(styleLayer.color.column, scope.shelf.layers[layerNum].fields, styleLayer.color.aggregationType);
    let styleData = !_.isUndefined(this.getUiMapOption().analysis) && this.getUiMapOption().analysis['use'] === true ? data[dataIndex] : data[layerNum];


    return function (feature, resolution) {

      ////////////////////////////////////////////////////////
      // Style options
      ////////////////////////////////////////////////////////

      let layerType = styleLayer.type;
      let featureColor = styleLayer.color.schema;
      let featureColorType = styleLayer.color.by;
      let symbolType = null;
      let outlineType = null;
      let lineDashType = null;
      let lineMaxVal = 1; //styleLayer.size.max;
      let outlineColor = 'black';
      let featureSizeType = null;
      let outlineWidth = 1;

      ////////////////////////////////////////////////////////
      // Color
      ////////////////////////////////////////////////////////

      if (_.eq(featureColorType, MapBy.MEASURE)) {
        if (styleLayer.color['ranges']) {
          for (let range of styleLayer.color['ranges']) {
            let rangeMax = range.fixMax;
            let rangeMin = range.fixMin;

            if (rangeMax === null) {

              // if feature value is bigger than max value, set max color
              if (feature.getProperties()[alias] > rangeMin) {
                featureColor = range.color;
              }

            } else {
              if (rangeMin === null) {
                let minValue = styleData.valueRange[alias].minValue;

                if (minValue >= 0) {
                  rangeMin = 0;
                  // when minValue is negative, set minValue to range min
                } else {
                  rangeMin = minValue;
                }
              }

              if (feature.getProperties()[alias] >= rangeMin &&
                feature.getProperties()[alias] <= rangeMax) {
                featureColor = range.color;
              }
            }
          }
        } else {
          const ranges = ColorOptionConverter.setMapMeasureColorRange(styleOption, styleData, scope.getColorList(styleLayer), layerNum, scope.shelf.layers[layerNum].fields);
          // set decimal value
          const formatValue = ((value) => {
            return parseFloat((Number(value) * (Math.pow(10, styleOption.valueFormat.decimal)) / Math.pow(10, styleOption.valueFormat.decimal)).toFixed(styleOption.valueFormat.decimal));
          });

          for (let range of ranges) {
            let rangeMax = range.fixMax;
            let rangeMin = range.fixMin;

            if (rangeMax === null) {

              // if feature value is bigger than max value, set max color
              if (feature.getProperties()[alias] > rangeMin) {
                featureColor = range.color;
              }

            } else {
              if (rangeMin === null) {
                let minValue = styleData.valueRange[alias].minValue;

                if (minValue >= 0) {
                  rangeMin = 0;
                  // when minValue is negative, set minValue to range min
                } else {
                  rangeMin = minValue;
                }
              }

              let value = formatValue(feature.getProperties()[alias]);

              if ((rangeMin == 0 && rangeMin == value) || (value >= rangeMin && value <= rangeMax)) {
                featureColor = range.color;
              }
            }
          }
        }
      } else if (_.eq(featureColorType, MapBy.DIMENSION)) {

        // Get dimension color
        const ranges = scope.setDimensionColorRange(styleLayer, styleData, scope.getColorList(styleLayer), []);
        _.each(ranges, (range) => {
          if (_.eq(feature.getProperties()[alias], range.column)) {
            featureColor = range.color;
            return false;
          }
        });
      } else if (_.eq(featureColorType, MapBy.NONE)) {
        featureColor = styleLayer.color.schema;
      }

      featureColor = scope.hexToRgbA(featureColor, 1 - (styleLayer.color.transparency * 0.01));

      ////////////////////////////////////////////////////////
      // Selection filter
      ////////////////////////////////////////////////////////

      let filterFl: boolean = false;

      // set selection filter
      filterFl = scope.setFeatureSelectionMode(scope, feature);

      // when select mode or filter param exists, set feature selection style
      if ((filterFl || selectMode) && ChartSelectMode.ADD !== feature.getProperties()['selection']) {

        outlineWidth = 2;

        // when style is dark
        if (MapLayerStyle.DARK.toString() === styleOption.style) {
          featureColor = SelectionColor.FEATURE_DARK.toString();
          outlineColor = SelectionColor.OUTLINE_DARK.toString();

          // when style is colored, light
        } else {
          featureColor = SelectionColor.FEATURE_LIGHT.toString();
          outlineColor = SelectionColor.OUTLINE_LIGHT.toString();
        }
      }

      ////////////////////////////////////////////////////////
      // Creation style
      ////////////////////////////////////////////////////////

      let style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: featureColor,
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
   * return lincense
   */
  private attribution(): any {

    if (this.getUiMapOption()) {
      return this.getUiMapOption().licenseNotation;
    } else {
      return "© OpenStreetMap contributors";
    }
  }

  /**
   * Create event
   */
  private createMapOverLayEvent(): void {
    // tooltip 지우기
    this.olmap.getOverlays().forEach((overlay) => {
      this.olmap.removeOverlay(overlay);
    });

    ////////////////////////////////////////////////////////
    // Create tooltip layer
    ////////////////////////////////////////////////////////
    this.tooltipLayer = [];
    for (let layerIndex = 0; this.getUiMapOption().layers.length > layerIndex; layerIndex++) {
      // do not create tooltip for HEATMAP
      if (MapLayerType.HEATMAP !== this.getUiMapOption().layers[layerIndex].type) {
        // Create
        this.tooltipLayer = new ol.Overlay({
          element: this.tooltipEl.nativeElement,
          positioning: 'top-center',
          stopEvent: false,
          id: 'layerId' + (layerIndex + 1)
        });
        this.olmap.addOverlay(this.tooltipLayer);
      }
    }
    ////////////////////////////////////////////////////////
    // Add event
    ////////////////////////////////////////////////////////
    if (!_.isNull(this.olmap.frameState_)) {
      this.preZoomSize = Math.round(this.olmap.frameState_.viewState.zoom);
    }
    this.olmap.un('pointermove', this.tooltipFunction);
    this.olmap.on('pointermove', this.tooltipFunction);
    // this.olmap.on('click', this.zoomFunction);
    // this.olmap.on('pointermove', function(event) {
    //
    //   if (event.dragging) {
    //     return;
    //   }
    //
    //   // let pixel = this.olmap.getEventPixel(event.originalEvent);
    //
    // });
  }

  /**
   * Tooltip mouse move event callback
   * @param event
   */
  private tooltipFunction = (event) => {
    // tooltip 타입 설정
    let tooltipTypeToShow = null;
    // Get feature
    let feature = this.olmap.forEachFeatureAtPixel(event.pixel, (feature) => {
      return feature;
    });
    // let featureByEvent = event.map.forEachFeatureAtPixel(event.pixel, (feature) => {
    //   return feature;
    // });
    // console.log(featureByEvent);
    // console.log(this.olmap.getFeaturesAtPixel(event.pixel));
    // console.log(this.olmap.hasFeatureAtPixel(event.pixel));

    // feature check (if no features hide tooltip)
    if (!feature
      ||
      (!_.isUndefined(feature.getProperties())
        // clustering의 경우 tooltip 안보이게 함
        && !_.isUndefined(feature.getProperties()['isClustering'])
        && feature.getProperties()['isClustering'] == true
        && !_.isUndefined(feature.getProperties()['count'])
        && feature.getProperties()['count'] > 1)
      ||
      (!_.isUndefined(feature.getProperties()['layerNum'])
        // 비교레이어 영역 layer에 마우스 오버시 tooltip 안보이게 함
        && feature.getProperties()['layerNum'] == -5)) {
      // Disable tooltip
      this.tooltipInfo.enable = false;
      if (!_.isUndefined(this.tooltipLayer) && this.tooltipLayer.length > 0) {
        this.tooltipLayer.setPosition(undefined);
      }
      // remove z-index for tooltip
      if (!this.isPage) $(document).find('.ddp-ui-dash-contents').removeClass('ddp-tooltip');
      else $(document).find('.ddp-view-chart-contents').removeClass('ddp-tooltip');
      return;
    }

    // get tooltip number from feature
    let toolTipLayerNum = _.cloneDeep(!isNullOrUndefined(feature.getProperties().layerNum) ? feature.getProperties().layerNum : !isNullOrUndefined(feature.getProperties().features[0].get('layerNum')) ? feature.getProperties().features[0].get('layerNum') : 0);

    // do not set tooltip for HEATMAP
    if (!_.isUndefined(this.getUiMapOption().layers[toolTipLayerNum]) && !_.isUndefined(this.getUiMapOption().layers[toolTipLayerNum].type)
      && this.getUiMapOption().layers[toolTipLayerNum].type !== MapLayerType.HEATMAP) {

      // set z-index for tooltip
      if (!this.isPage) $(document).find('.ddp-ui-dash-contents').addClass('ddp-tooltip');
      else $(document).find('.ddp-view-chart-contents').addClass('ddp-tooltip');

      ////////////////////////////////////////////////////////
      // Layer num & name
      ////////////////////////////////////////////////////////
      // Cluster check
      let features = feature.get('features');
      if (!isNullOrUndefined(features)) {
        if (features.length > 1) {
          return;
        }
        feature = features[0];
      }
      if (tooltipTypeToShow == null || this.getUiMapOption().layers[toolTipLayerNum].type == MapLayerType.SYMBOL) {
        // Layer num & name
        if (this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[17] !== null) {
          tooltipTypeToShow = this.getUiMapOption().layers[toolTipLayerNum].type;
          this.tooltipInfo.num = toolTipLayerNum + 1;
          this.tooltipInfo.name = this.getUiMapOption().layers[toolTipLayerNum].name;

        } else {
          this.tooltipInfo.name = null;
        }

        ////////////////////////////////////////////////////////
        // Geometry Type
        ////////////////////////////////////////////////////////
        this.tooltipInfo.geometryType = feature.getGeometry().getType();

        ////////////////////////////////////////////////////////
        // Coordinates (Geo Info)
        ////////////////////////////////////////////////////////
        let coords = [0, 0];
        let extent = feature.getGeometry().getExtent();
        coords = ol.extent.getCenter(extent);

        this.tooltipInfo.coords = [];

        if (this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[18] !== null) {

          // Line Type
          if (_.eq(this.tooltipInfo.geometryType, String(MapGeometryType.LINE))) {
            this.tooltipInfo.coords[0] = coords[0];
            this.tooltipInfo.coords[coords.length - 1] = coords[coords.length - 1];
          } else {
            // Other
            this.tooltipInfo.coords[0] = coords[0].toFixed(4) + ', ' + coords[1].toFixed(4);
          }
        }

        ////////////////////////////////////////////////////////
        // Field info (Data Value)
        ////////////////////////////////////////////////////////

        this.tooltipInfo.fields = [];
        let layerFieldList = [];

        // Properties (DATA_VALUE)
        if (this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[19] !== null) {
          let aggregationKeys: any[] = [];
          // layer 에 올라간 field 값 조회
          let layerItems = [];
          let itemIndex = 0;
          let customField = {};
          if (!_.isUndefined(this.getUiMapOption().analysis) && !_.isUndefined(this.getUiMapOption().analysis['use']) && this.getUiMapOption().analysis['use'] === true) {
            // 공간연산 실행 시
            layerItems = _.cloneDeep(
              !_.isUndefined(this.shelf.layers[this.getUiMapOption().layerNum].fields) && this.shelf.layers[this.getUiMapOption().layerNum].fields.length > 0
              ? this.shelf.layers[this.getUiMapOption().layerNum].fields : []
            );
          } else {
            this.shelf.layers[toolTipLayerNum].fields.forEach((field) => {
              layerItems.push(field);
            });
          }
          // layer 에 올란간 dimension 와 measure list 조회
          layerFieldList = TooltipOptionConverter.returnTooltipDataValue(layerItems);
          // set tooltip displayColumns
          this.uiOption.toolTip.displayColumns = ChartUtil.returnNameFromField(layerFieldList);


          for (let key in feature.getProperties()) {
            _.each(this.getUiMapOption().toolTip.displayColumns, (field, idx) => {
              if (_.eq(field, key)) {
                aggregationKeys.push({idx: idx, key: key});
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
                if (typeof (tooltipVal) === "number") {
                  tooltipVal = FormatOptionConverter.getFormatValue(tooltipVal, this.getUiMapOption().valueFormat);
                }
                field.name = aggregationKey.key;
                field.value = tooltipVal;
              }
              this.tooltipInfo.fields.push(field);
            }
          });
        }

        ////////////////////////////////////////////////////////
        // Apply
        ////////////////////////////////////////////////////////

        // if required values are empty, enable false
        if (null === this.tooltipInfo.name && 0 === this.tooltipInfo.coords.length && 0 === this.tooltipInfo.fields.length) {
          this.tooltipInfo.enable = false;
        } else {
          // Enable tooltip
          this.tooltipInfo.enable = true;
        }

        // Element apply
        this.safelyDetectChanges();
        // // Element apply
        // this.changeDetect.detectChanges();

        ////////////////////////////////////////////////////////
        // set tooltip position
        ////////////////////////////////////////////////////////
        if (this.uiOption.toolTip) {
          // tooltip 에 보여질 정보 길이 설정 (해당 수에 따라 tooltip의 height가 변동 됨)
          let yOffset = -80;

          // tooltip info 에 보여줄 양에 따라 height 구하기
          let sizeOfToolTipHeight = [];
          if(!_.isUndefined(this.tooltipInfo.fields) && this.tooltipInfo.fields.length > 0) {
            // column 이름은 있는데, column value가 없을 경우 사이즈 다를 수 있음
            this.tooltipInfo.fields.forEach( (field) => {
              if(field['name'] != null && !_.isUndefined(field['name'])) {
                sizeOfToolTipHeight.push(field['name']);
              }
              if(field['value'] != null && !_.isUndefined(field['value'])) {
                sizeOfToolTipHeight.push(field['value']);
              }
            });
          }
          if (sizeOfToolTipHeight.length > 0) {
            // height 계산
            yOffset = yOffset - (25 * (sizeOfToolTipHeight.length/1.2));
          }
          let offset = [-92, yOffset];
          this.tooltipLayer.setOffset(offset);
        }
        let toShowCoords = event.coordinate;
        if (_.eq(this.tooltipInfo.geometryType, String(MapGeometryType.LINE))) {
          // line 일 경우 tooltip coordinator 위치를 살짝 위로 설정
          toShowCoords[toShowCoords.length - 1] = toShowCoords[toShowCoords.length - 1] + 0.0018;
          this.tooltipLayer.setPosition(toShowCoords);
        } else {
          this.tooltipLayer.setPosition(toShowCoords);
        }
      }
    }
  };

  /**
   * create drag interaction (for selection filter)
   */
  private createInteraction(): void {

    // drag style
    var dragBoxInteraction = new ol.interaction.DragBox({
      condition: ol.events.condition.shiftKeyOnly,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'yellow',
          width: 2
        })
      })
    });

    // TODO need to move on addChartMultiSelectEventListener
    dragBoxInteraction.on('boxend', function (event) {

      const format = new ol.format.GeoJSON();
      const geom = event.target.getGeometry();

      // event.target.getMap().getView()

      var feature = new ol.Feature({
        geometry: geom
      });

    });

    this.olmap.getInteractions().extend([dragBoxInteraction]);
  }

  /**
   * Create legend
   */
  private createLegend(layerIndex: number): void {

    ////////////////////////////////////////////////////////
    // Enable check
    ////////////////////////////////////////////////////////
    if (!this.getUiMapOption().legend.auto) {
      this.legendInfo.enable = false;
      return;
    }

    if (!this.uiOption.legend.showName) {
      this.legendInfo.enable = false;
      return;
    }

    ////////////////////////////////////////////////////////
    // Legend position
    ////////////////////////////////////////////////////////
    this.legendInfo.position = String(this.getUiMapOption().legend.pos);

    ////////////////////////////////////////////////////////
    // Layer info
    ////////////////////////////////////////////////////////
    let legendInfo: any = {};

    // Layer
    let layer: UILayers = this.getUiMapOption().layers[layerIndex];

    // 공간연산을 하게 되면 data 값이 uiOption 또는 layer의 index가 다르기 때문에 아래와 같이 dataIndex 변환
    let dataIndex: number = layerIndex;
    if (_.isUndefined(this.getUiMapOption().analysis && this.getUiMapOption().analysis['use'] === true)) {
      dataIndex = this.data.length > -1 ? this.data.length : 0;
    }

    // Layer name
    legendInfo.name = layer.name;

    // when layer type is symbol, layer symbol exists, set point type by symbols
    if (MapLayerType.SYMBOL === layer.type && (<UISymbolLayer>layer).symbol) {
      legendInfo.pointType = (<UISymbolLayer>layer).symbol.toString();
      // set circle by default
    } else {
      legendInfo.pointType = MapSymbolType.CIRCLE.toString();
    }

    // Color data
    legendInfo.color = [];

    // convert symbol, tile to point, hexagon
    let layerType = MapLayerType.SYMBOL === layer.type ? 'Point' : MapLayerType.TILE === layer.type ? 'Hexagon' : layer.type.toString();

    // Layer color type
    legendInfo.type = _.startCase(layerType) + ' Color';

    ////////////////////////////////////////////////////////
    // Size by measure (Symbol layer only)
    ////////////////////////////////////////////////////////

    if (MapLayerType.SYMBOL === layer.type && _.eq((<UISymbolLayer>layer).size.by, MapBy.MEASURE)) {
      legendInfo.radiusColumn = 'By ' + ChartUtil.getFieldAlias((<UISymbolLayer>layer).size.column, this.shelf.layers[layerIndex].fields);
    }

    ////////////////////////////////////////////////////////
    // Color by dimension
    ////////////////////////////////////////////////////////
    if (_.eq(layer.color.by, MapBy.DIMENSION)) {

      // Layer column
      legendInfo.column = 'By ' + ChartUtil.getFieldAlias(layer.color.column, this.shelf.layers[layerIndex].fields, layer.color.aggregationType);

      if (layer.color.ranges) {
        _.each(layer.color.ranges, (range) => {
          let colorInfo: any = {};
          colorInfo.color = range.color;
          colorInfo.column = range['column'];
          legendInfo.color.push(colorInfo);
        });
      } else {
        if (!_.eq(layer.color.column, MapBy.NONE)) {
          const ranges = this.setDimensionColorRange(layer, this.data[dataIndex], this.getColorList(layer), []);
          _.each(ranges, (range) => {
            let colorInfo: any = {};
            colorInfo.color = range.color;
            colorInfo.column = range['column'];
            legendInfo.color.push(colorInfo);
          });
        } else {
          _.each(this.getUiMapOption().fieldList, (field) => {
            let colorInfo: any = {};
            colorInfo.color = "#602663";
            colorInfo.column = field;
            legendInfo.color.push(colorInfo);
          });
        }
      }
    }
    ////////////////////////////////////////////////////////
    // Color by measure
    ////////////////////////////////////////////////////////
    else if (_.eq(layer.color.by, MapBy.MEASURE)) {

      // Layer column
      legendInfo.column = 'By ' + ChartUtil.getFieldAlias(layer.color.column, this.shelf.layers[layerIndex].fields, layer.color.aggregationType);

      if (layer.color.ranges) {
        _.each(layer.color.ranges, (range, index) => {
          let minVal: number = range.fixMin;
          let maxVal: number = range.fixMax;

          if (minVal === null) minVal = maxVal;
          if (maxVal === null) maxVal = minVal;

          let colorInfo: any = {};
          colorInfo.color = range.color;
          if (index == 0) {
            colorInfo.column = ' ＞ ' + FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat);
          } else if (index == layer.color.ranges.length - 1) {
            colorInfo.column = ' ≤ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
          } else {
            colorInfo.column = FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat)
              + ' ~ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
          }
          legendInfo.color.push(colorInfo);
        });
      } else {

        if (this.data[dataIndex].valueRange && this.data[dataIndex].valueRange[ChartUtil.getFieldAlias(layer.color.column, this.shelf.layers[layerIndex].fields, layer.color.aggregationType)]) {

          const ranges = ColorOptionConverter.setMapMeasureColorRange(this.getUiMapOption(), this.data[dataIndex], this.getColorList(layer), layerIndex, this.shelf.layers[layerIndex].fields);

          _.each(ranges, (range, index) => {
            let minVal: number = range.fixMin;
            let maxVal: number = range.fixMax;

            if (minVal === null) minVal = maxVal;
            if (maxVal === null) maxVal = minVal;

            let colorInfo: any = {};
            colorInfo.color = range.color;
            if (index == 0) {
              colorInfo.column = ' ＞ ' + FormatOptionConverter.getFormatValue(minVal, this.getUiMapOption().valueFormat);
            } else if (index == ranges.length - 1) {
              colorInfo.column = ' ≤ ' + FormatOptionConverter.getFormatValue(maxVal, this.getUiMapOption().valueFormat);
            } else {
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
    else if (_.eq(layer.color.by, MapBy.NONE)) {

      let colorInfo: any = {};
      colorInfo.color = layer.color.schema;
      // set heatmap color
      if (_.eq(layer.type, MapLayerType.HEATMAP)) {
        colorInfo.color = HeatmapColorList[layer.color.schema][(HeatmapColorList[layer.color.schema].length - 1)];
      }
      _.each(this.shelf.layers[layerIndex].fields, (field) => {
        if ('user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') != -1)) {
          colorInfo.column = (isUndefined(field.alias) ? field.fieldAlias : field.alias);
          return false;
        }
      });
      legendInfo.color.push(colorInfo);

    }
    ////////////////////////////////////////////////////////
    // Error
    ////////////////////////////////////////////////////////
    else {
      return;
    }

    this.legendInfo.layer.push(legendInfo);

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

    let featuresGroup = _.groupBy(featureList, ChartUtil.getFieldAlias(layer.color.column, this.shelf.layers[this.getUiMapOption().layerNum].fields, layer.color.aggregationType));
    _.each(Object.keys(featuresGroup), (column, index) => {
      let color = colorList[index % colorList.length];
      rangeList.push({column: column, color: color});
    });

    return rangeList;
  }

  /**
   * Check UI Option (Spec) => Shelf add & remove
   */
  private checkOption(uiOption: UIMapOption): void {

    for (let index: number = 0; index < this.shelf.layers.length; index++) {

      let isAnalysisUse: boolean = false;
      let analysisAggrColumn: string;
      if (!_.isUndefined(this.uiOption['analysis']) && !_.isUndefined(this.uiOption['analysis']['use']) && this.uiOption['analysis']['use']) {
        isAnalysisUse = this.uiOption['analysis']['use'];
        analysisAggrColumn = this.uiOption['analysis']['operation']['aggregation']['column'];
        if (index != this.shelf.layers.length - 1) {
          continue;
        }
      }

      let layer: UILayers = uiOption.layers[index];
      let shelf: GeoField[] = _.cloneDeep(this.shelf.layers[index].fields);

      ////////////////////////////////////////////////////////
      // Set geo type
      ////////////////////////////////////////////////////////

      let layerType: MapLayerType = layer.type;

      let field = null;
      _.each(this.shelf.layers[index].fields, (fieldTemp) => {
        if (fieldTemp != null && fieldTemp.field.logicalType && fieldTemp.field.logicalType.toString().indexOf('GEO') != -1) {
          field = fieldTemp;
          return false;
        }
      });

      // Option panel change cancel, not current shelf change
      if (!this.drawByType || String(this.drawByType) == "" || (EventType.CHANGE_PIVOT == this.drawByType && uiOption.layerNum != index)
        || isNullOrUndefined(field)) {
        continue;
      }

      let geomType = field.field.logicalType.toString();

      // Set layer type
      if (_.eq(geomType, LogicalType.GEO_LINE) && !_.eq(layerType, MapLayerType.LINE)) {
        let lineLayer: UILineLayer = <UILineLayer>layer;
        lineLayer.type = MapLayerType.LINE;
        lineLayer.thickness = {
          by: MapBy.NONE,
          column: "NONE",
          maxValue: 10
        };
      } else if (_.eq(geomType, LogicalType.GEO_POLYGON) && !_.eq(layerType, MapLayerType.POLYGON)) {
        let polygonLayer: UIPolygonLayer = <UIPolygonLayer>layer;
        polygonLayer.type = MapLayerType.POLYGON;
        polygonLayer.outline
      }

      ////////////////////////////////////////////////////////
      // Cluster check
      ////////////////////////////////////////////////////////

      if (_.eq(layerType, MapLayerType.SYMBOL)) {

        let symbolLayer: UISymbolLayer = <UISymbolLayer>layer;
        if (_.isUndefined(symbolLayer.clustering) || symbolLayer.clustering == null) {
          symbolLayer.clustering = true;
        }
      }

      ////////////////////////////////////////////////////////
      // Add pivot(shelf) check
      ////////////////////////////////////////////////////////

      // ////////////////////////////////////////////////////////
      // // Alias
      // ////////////////////////////////////////////////////////
      // _.each(uiOption.layers, (layer) => {
      ////////////////////////////////////////////////////////
      // Symbol
      ////////////////////////////////////////////////////////
      // if( _.eq(layer.type, MapLayerType.SYMBOL) ) {
      // Symbol layer
      // let symbolLayer: UISymbolLayer = <UISymbolLayer>layer;
      // ///////////////////////////
      // // Color
      // ///////////////////////////
      // if( _.eq(layer.color.by, MapBy.MEASURE) || _.eq(layer.color.by, MapBy.DIMENSION) ) {
      // if( _.eq(layer.color.by, MapBy.MEASURE) ) {
      //   let column: string = layer.color.column;
      //   // _.each(this.shelf.layers, (shelf) => {
      //     _.each(shelf, (field) => {
      //       if( _.eq(column, field['name']) ) {
      //         layer.color.column = ChartUtil.getAlias(field);
      //       }
      //     });
      //   // });
      // }
      // ///////////////////////////
      // // Size
      // ///////////////////////////
      // if( _.eq(symbolLayer.size.by, MapBy.MEASURE) ) {
      //   let column: string = symbolLayer.size.column;
      //   _.each(this.shelf.layers, (shelf) => {
      //     _.each(shelf, (field) => {
      //       if( _.eq(column, field['name']) ) {
      //         symbolLayer.size.column = ChartUtil.getAlias(field);
      //       }
      //     });
      //   });
      // }
      // }
      // ////////////////////////////////////////////////////////
      // // Line
      // ////////////////////////////////////////////////////////
      // else if( _.eq(layer.type, MapLayerType.LINE) ) {
      //
      // }
      // ////////////////////////////////////////////////////////
      // // Polygon
      // ////////////////////////////////////////////////////////
      // else if( _.eq(layer.type, MapLayerType.POLYGON) ) {
      //
      // }
      // });
      // ////////////////////////////////////////////////////////
      // // Tooltip
      // ////////////////////////////////////////////////////////
      // _.each(option.toolTip.displayColumns, (column) => {
      //
      // });
      // ////////////////////////////////////////////////////////
      // // //End Alias
      // ////////////////////////////////////////////////////////

      // Find field
      let isNone: boolean = true;
      let isDimension: boolean = false;
      let isMeasure: boolean = false;
      _.each(shelf, (field) => {
        // analysis aggregation이 count 일 경우
        if (isAnalysisUse && !_.isUndefined(field['isCustomField']) && field.alias == 'count') {
          isNone = false;
          isDimension = false;
          isMeasure = true;
        } else {
          if ('user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') == -1)) {
            isNone = false;
          }
          // when logical type is not geo, type is dimension
          if (('user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') == -1)) && _.eq(field.type, ShelveFieldType.DIMENSION)) {
            isDimension = true;
          }
          if (_.eq(field.type, ShelveFieldType.MEASURE)) {
            isMeasure = true;
          }
        }
      });

      ////////////////////////////////////////////////////////
      // set field list
      ////////////////////////////////////////////////////////
      this.checkFieldList(shelf);

      ////////////////////////////////////////////////////////
      // Color
      ////////////////////////////////////////////////////////

      // init custom user color setting
      if (!isAnalysisUse) {
        layer.color.ranges = undefined;
        layer.color['settingUseFl'] = false;
      }

      ///////////////////////////
      // Color by None
      ///////////////////////////
      if (isNone) {
        layer.color.by = MapBy.NONE;
        if (layerType == MapLayerType.HEATMAP) {
          (_.isUndefined(layer.color.heatMapSchema) || layer.color.heatMapSchema.indexOf('HC') == -1 ? layer.color.heatMapSchema = 'HC1' : layer.color.heatMapSchema);
          layer.color.schema = layer.color.heatMapSchema;
        } else if (layerType == MapLayerType.SYMBOL) {
          (_.isUndefined(layer.color.symbolSchema) || layer.color.symbolSchema.indexOf('#') == -1 ? layer.color.symbolSchema = '#6344ad' : layer.color.symbolSchema);
          layer.color.schema = layer.color.symbolSchema;
        } else if (layerType == MapLayerType.TILE) {
          (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('#') == -1 ? layer.color.tileSchema = '#6344ad' : layer.color.tileSchema);
          layer.color.schema = layer.color.tileSchema;
        } else if (layerType == MapLayerType.POLYGON) {
          (_.isUndefined(layer.color.tileSchema) || layer.color.polygonSchema.indexOf('#') == -1 ? layer.color.polygonSchema = '#6344ad' : layer.color.polygonSchema);
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
      else if (isMeasure) {
        layer.color.by = MapBy.MEASURE;
        if (layerType == MapLayerType.HEATMAP) {
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
        layer.color.column = uiOption.fieldMeasureList[0]['name'];
        layer.color.aggregationType = uiOption.fieldMeasureList[0]['aggregationType'];
        if (isAnalysisUse) {
          uiOption.fieldMeasureList.forEach((item) => {
            if (item.name == analysisAggrColumn) {
              layer.color.column = item.name;
              layer.color.aggregationType = item.aggregationType;
            }
          });
        }
        if (isAnalysisUse) {
          let dataIndex = 0;
          (this.data.length > 1 ? dataIndex = this.data.length - 1 : dataIndex = 0);
          layer.color.ranges = ColorOptionConverter.setMapMeasureColorRange(uiOption, this.data[dataIndex], this.getColorList(layer), index, shelf);
        } else {
          layer.color.ranges = ColorOptionConverter.setMapMeasureColorRange(uiOption, this.data[index], this.getColorList(layer), index, shelf);
        }

      }
      ///////////////////////////
      // Color by Dimension
      ///////////////////////////
      // hexagon && isDimension => init as none
      else if (MapLayerType.TILE === layer.type && isDimension) {
        layer.color.by = MapBy.NONE;
        (_.isUndefined(layer.color.tileSchema) || layer.color.tileSchema.indexOf('#') == -1 ? layer.color.tileSchema = '#6344ad' : layer.color.tileSchema);
        layer.color.column = null;
        layer.color.aggregationType = null;
      } else if (isDimension) {
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
        layer.color.column = uiOption.fielDimensionList[0]['name'];
        layer.color.aggregationType = null;
        if (uiOption.fielDimensionList[0]['format']) layer.color.granularity = uiOption.fielDimensionList[0]['format']['unit'].toString();
      }

      ////////////////////////////////////////////////////////
      // Symbol
      ////////////////////////////////////////////////////////
      if (_.eq(layer.type, MapLayerType.SYMBOL)) {

        // Symbol layer
        let symbolLayer: UISymbolLayer = <UISymbolLayer>layer;

        ////////////////////////////////////////////////////////
        // Size
        ////////////////////////////////////////////////////////

        ///////////////////////////
        // Size by None
        ///////////////////////////
        if (isNone || !isMeasure) {
          symbolLayer.size.by = MapBy.NONE;
        }
        ///////////////////////////
        // Size by Measure
        ///////////////////////////
        else if (isMeasure) {
          symbolLayer.size.by = MapBy.MEASURE;
          symbolLayer.size.column = uiOption.fieldMeasureList[0]['name'];
        }
      }
      ////////////////////////////////////////////////////////
      // Heatmap
      ////////////////////////////////////////////////////////
      else if (_.eq(layer.type, MapLayerType.HEATMAP)) {

        ///////////////////////////
        // Legend
        ///////////////////////////
        // when measure doesn't exist, hide/disable legend
        if (!uiOption.fieldMeasureList || uiOption.fieldMeasureList.length === 0) {
          this.uiOption.legend.auto = false;
          this.uiOption.legend.showName = false;
        } else {
          this.uiOption.legend.auto = true;
        }
      }
      ////////////////////////////////////////////////////////
      // Hexagon
      ////////////////////////////////////////////////////////
      else if (_.eq(layer.type, MapLayerType.TILE)) {

        // Hexagon layer
        let hexagonLayer: UITileLayer = <UITileLayer>layer;
      }
      ////////////////////////////////////////////////////////
      // Line
      ////////////////////////////////////////////////////////
      else if (_.eq(layer.type, MapLayerType.LINE)) {

        // line layer
        let lineLayer: UILineLayer = <UILineLayer>layer;

        ///////////////////////////
        // Thickness by None
        ///////////////////////////
        if (isNone || !isMeasure) {
          lineLayer.thickness.by = MapBy.NONE;
        }
        ///////////////////////////
        // Thickness by Measure
        ///////////////////////////
        else if (isMeasure) {
          lineLayer.thickness.by = MapBy.MEASURE;
          lineLayer.thickness.column = this.uiOption.fieldMeasureList[0]['name'];
        }
      }
      ////////////////////////////////////////////////////////
      // Polygon
      ////////////////////////////////////////////////////////
      else if (_.eq(layer.type, MapLayerType.POLYGON)) {

      }

      ////////////////////////////////////////////////////////
      // Tooltip
      ////////////////////////////////////////////////////////
      if (!uiOption.toolTip.displayColumns) uiOption.toolTip.displayColumns = [];

      if (!isAnalysisUse) {
        let fields = TooltipOptionConverter.returnTooltipDataValue(shelf);
        this.uiOption.toolTip.displayColumns = ChartUtil.returnNameFromField(fields);
      }
    }
  }

  /**
   * Return alpha color
   * @param hex
   * @param alpha
   */
  private hexToRgbA(hex, alpha): string {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    } else {
      return 'rgba(255,255,255,1)';
    }
  }

  /**
   * when data zoom ends
   * @param event
   */
  private zoomFunction = (event) => {

    const that = this;
    // save current chart zoom
    this.uiOption.chartZooms = this.additionalSaveDataZoomRange();

    let mapUIOption = (<UIMapOption>this.uiOption);
    // zoom size
    mapUIOption.zoomSize = Math.round(event.frameState.viewState.zoom);

    if ((_.isUndefined(mapUIOption.lowerCorner) && _.isUndefined(mapUIOption.upperCorner)) || that.preZoomSize == 0) {
      this.preZoomSize = mapUIOption.zoomSize;
      this.setUiExtent(event);
      return;
    }

    let preLowerCorner = mapUIOption.lowerCorner.split(' ');
    let preUpperCorner = mapUIOption.upperCorner.split(' ');
    let currentMapExtent = this.olmap.getView().calculateExtent(event.map.getSize());

    // 이전 좌표 및 줌 레벨이 다를 경우에만 다시 호출
    if ((Number(preLowerCorner[0]).toFixed(10) != currentMapExtent[0].toFixed(10) && Number(preLowerCorner[1]).toFixed(10) != currentMapExtent[1].toFixed(10)
      && Number(preUpperCorner[0]).toFixed(10) != currentMapExtent[2].toFixed(10) && Number(preUpperCorner[1]).toFixed(10) != currentMapExtent[3].toFixed(10))
      || (that.preZoomSize != mapUIOption.zoomSize)) {

      let isAllChangeCoverage: boolean = false;
      mapUIOption.layers.forEach((layer) => {
        if (!_.isUndefined(layer['changeCoverage']) && layer['changeCoverage'] == true) {
          isAllChangeCoverage = true;
        }
      });

      // map ui lat, lng
      this.setUiExtent(event);
      if (mapUIOption.upperCorner.indexOf('NaN') != -1 || mapUIOption.lowerCorner.indexOf('NaN') != -1 || isAllChangeCoverage) {
        // coverage value reset
        mapUIOption.layers.forEach((layer) => {
          if (isAllChangeCoverage && !_.isUndefined(layer['changeCoverage'])) {
            layer['changeCoverage'] = false;
          }
        });
        return;
      }

      this.changeDrawEvent.emit();
    }

    // TODO selection (drag end)
    if (!this.isPage) {

    }
  }

  /**
   * set map data zoom setting
   * @returns {UIChartZoom[]}
   */
  private additionalSaveDataZoomRange(): UIChartZoom[] {

    let resultList: UIChartZoom[] = [];

    let center = this.olmap.getView().getCenter();

    resultList.push({startValue: center[0], endValue: center[1], count: this.olmap.getView().getZoom()});

    return resultList;
  }

  private getMinZoom() {
    let width = this.area.nativeElement.clientWidth;

    return Math.ceil(Math.LOG2E * Math.log(width / 256));
  }

  /**
   * Get color list
   * @param layer
   */
  private getColorList(layer: UILayers): any[] {

    let colorList = [];
    if (_.eq(layer.type, MapLayerType.HEATMAP)) {
      colorList = HeatmapColorList[layer.color.schema];
    } else {
      colorList = ChartColorList[layer.color.schema];
    }
    return colorList;
  }

  /**
   * map single selection
   * @param event
   */
  private mapSelectionListener = (event) => {

    let scope: any = this;

    let selectMode: ChartSelectMode;
    // selection filter data
    let selectData = [];
    // all unselected
    let noneDataCnt: boolean = true;
    // layer number
    let layerNum = 0;

    let feature = this.olmap.forEachFeatureAtPixel(event.pixel, (feature) => {
      return feature;
    });

    // when feature exists
    if (feature) {
      // Cluster check
      let features = feature.get('features');
      if (!isNullOrUndefined(features)) {
        if (features.length > 1) {
          return;
        }
        feature = features[0];
      }

      // set feature layerNum
      layerNum = feature.getProperties()['layerNum'];

      // set select mode
      if (feature.getProperties()['selection']) {
        selectMode = ChartSelectMode.SUBTRACT;
      } else {
        selectMode = ChartSelectMode.ADD;
      }

      // get dimensions (except geo) from layer shelf
      let dimensionLayer = this.originShelf.layers[(<UIMapOption>this.uiOption).layerNum].fields.filter((item) => {
        if ('dimension' === item.type && ('user_expr' == item.field.type || (item.field.logicalType && -1 == item.field.logicalType.toString().indexOf('GEO')))) {
          return item;
        }
      });

      // remove others except dimension values
      let properties = _.cloneDeep(feature.getProperties());
      delete properties['geometry'];
      delete properties['layerNum'];

      // set data for seleciton filter
      for (const item of dimensionLayer) {
        for (const key in properties) {

          let alias = ChartUtil.getAlias(item);
          if (alias === key) {

            const dataValue = properties[key];

            // when it's add mode
            if (ChartSelectMode.ADD === selectMode) {
              feature.set('selection', selectMode);

              // set data count
              if (item['data'] && -1 !== item['data'].indexOf(dataValue)) {
                item['dataCnt'][dataValue] = ++item['dataCnt'][dataValue];
              } else {

                if (!item['dataCnt']) item['dataCnt'] = {};
                item['dataCnt'][dataValue] = 1;
              }

              item['data'] = [dataValue];

              selectData.push(_.cloneDeep(item));

              // when it's substract mode
            } else {
              feature.unset('selection');

              item['dataCnt'][dataValue]--;

              // when dataCnt is 0, remove selection filter
              if (0 == item['dataCnt'][dataValue]) {
                item['data'] = [dataValue];
                selectData.push(_.cloneDeep(item));
              }
            }
          }
        }
      }

      // when dataCnt is false (when dataCnt is not zero)
      for (const item of selectData) {
        if (item['dataCnt']) {
          for (const key in item['dataCnt']) {
            if (0 < item['dataCnt'][key]) {
              noneDataCnt = false;
              break;
            }
          }
        }
      }
      // clear all selection filters
    } else {
      selectMode = ChartSelectMode.CLEAR;
    }

    // when select data exists, or clear mode
    if (ChartSelectMode.CLEAR === selectMode || (selectData && selectData.length > 0)) {
      // emit event
      this.chartSelectInfo.emit(new ChartSelectInfo(selectMode, selectData, this.params));
    }

    // when last feature is sbustracted, dataCnt is 0 in all of layers => not set selectMode
    if (ChartSelectMode.CLEAR === selectMode || (ChartSelectMode.SUBTRACT === selectMode && noneDataCnt)) {
      selectMode = undefined;
    }

    // TODO check this
    // if (!selectMode || selectData.length > 0) {
    //   switch (this.getUiMapOption().layers[layerNum].type) {
    //     // symbol layer => use cluster style func
    //     case MapLayerType.SYMBOL:
    //       // clustering
    //       if ((<UISymbolLayer>this.getUiMapOption().layers[layerNum]).clustering) {
    //         // this.clusterLayer.setStyle(this.clusterStyleFunction(0, this.data, selectMode));
    //         this.clusterLayer.setStyle(this.clusterStyleFunction(this.getUiMapOption().layerNum, this.data, selectMode));
    //       } else {
    //         // point
    //         // this.symbolLayer.setStyle(this.clusterStyleFunction(0, this.data, selectMode));
    //         this.symbolLayer.setStyle(this.clusterStyleFunction(this.getUiMapOption().layerNum, this.data, selectMode));
    //       }
    //       break;
    //     // hexagon(tile) layer => use hexagon style func
    //     case MapLayerType.TILE:
    //       // this.hexagonLayer.setStyle(this.hexagonStyleFunction(0, this.data, selectMode));
    //       this.hexagonLayer.setStyle(this.hexagonStyleFunction(this.getUiMapOption().layerNum, this.data, selectMode));
    //       break;
    //     // line, polygon layer => use map style func
    //     case MapLayerType.LINE:
    //     case MapLayerType.POLYGON:
    //       // this.symbolLayer.setStyle(this.mapStyleFunction(0, this.data, selectMode));
    //       this.symbolLayer.setStyle(this.mapStyleFunction(this.getUiMapOption().layerNum, this.data, selectMode));
    //       break;
    //   }
    // }
  }

  /**
   * set selection mode to feature
   * @param scope
   * @param feature
   * @returns {boolean}
   */
  private setFeatureSelectionMode(scope: any, feature): boolean {

    let filterFl: boolean = false;

    if (scope.widgetDrawParam
      && scope.widgetDrawParam.selectFilterListList
      && scope.widgetDrawParam.selectFilterListList.length > 0) {

      _.each(scope.widgetDrawParam.selectFilterListList, (filter) => {
        _.each(filter.data, (data) => {

          // find feature by selected properties
          let properties = feature.getProperties();

          // set selection filter select mode
          if (properties[filter.alias] === data) {
            feature.set('selection', ChartSelectMode.ADD);
          }
        });
      });

      // selection filter exists
      filterFl = true;
    }

    return filterFl;
  }

  /**
   * set uiOption min / max value
   */
  private setMinMax() {

    if (this.shelf.layers.length == 0) {
      return;
    }

    for (let idx = 0; idx < this.shelf.layers.length; idx++) {
      let uiOption = this.getUiMapOption();
      let layer: UILayers = uiOption.layers[idx];
      let shelf: GeoField[] = _.cloneDeep(this.shelf.layers[idx].fields);

      let isAnalysisUse: boolean = false;
      if (!_.isUndefined(uiOption['analysis']) && !_.isUndefined(uiOption['analysis']['use']) && uiOption['analysis']['use']) {
        isAnalysisUse = true;
      }

      let valueRange;
      if (isAnalysisUse) {

        if (idx != this.shelf.layers.length - 1) {
          continue;
        }

        let alias;
        if (_.isUndefined(layer.color.aggregationType)) {
          alias = layer.color.column;
        } else {
          alias = layer.color.aggregationType + "(" + layer.color.column + ")";
        }

        valueRange = _.cloneDeep(this.data[uiOption.analysis['layerNum']]['valueRange'][alias]);

        if (valueRange) {
          layer.color.minValue = valueRange.minValue;
          layer.color.maxValue = valueRange.maxValue;
        }

      } else {

        let alias = ChartUtil.getFieldAlias(layer.color.column, shelf, layer.color.aggregationType);
        // symbol 타입 , cluster 사용일 경우
        if (layer.type == MapLayerType.SYMBOL && layer['clustering']) {
          alias = 'count';
        }

        if (_.isUndefined(this.data[this.getUiMapOption().layerNum])) {
          continue;
        }
        valueRange = _.cloneDeep(this.data[this.getUiMapOption().layerNum]['valueRange'][alias]);

        if (valueRange) {
          // layer type 이 변경될 경우 변경, 아닐경우 최대 최소 값으로 변경
          if (this.drawByType == EventType.MAP_CHANGE_OPTION || this.drawByType == EventType.CHANGE_PIVOT) {
            layer.color.minValue = valueRange.minValue;
            layer.color.maxValue = valueRange.maxValue;
          } else {
            (_.isUndefined(layer.color.minValue) || layer.color.minValue > valueRange.minValue ? layer.color.minValue = valueRange.minValue : layer.color.minValue);
            (_.isUndefined(layer.color.maxValue) || layer.color.maxValue < valueRange.maxValue ? layer.color.maxValue = valueRange.maxValue : layer.color.maxValue);
          }
        }
      }

      // _.each(shelf, (field) => {
      //   if (_.eq(field.type, ShelveFieldType.MEASURE)) {
      //     if( !_.isUndefined(layer.color.ranges) ) {
      //       if( isAnalysisUse ){
      //         layer.color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.getUiMapOption(), this.data[uiOption.analysis['layerNum']], this.getColorList(layer), idx, shelf);
      //       } else {
      //         layer.color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.getUiMapOption(), this.data[idx], this.getColorList(layer), idx, shelf);
      //       }
      //     }
      //   }
      // });

    }
  }

  // public selectedLayer(selectedIndex:number) {
  //   this.layerMap.forEach( item => {
  //     item.layerValue.setZIndex(0);
  //     if( item['id'] == selectedIndex ) {
  //       item.layerValue.setZIndex(1);
  //     }
  //   });
  //   this.changeDetect.detectChanges();
  // }

  /**
   * check field list
   * @param shelf
   */
  private checkFieldList(shelf: any) {
    // 선반값에서 해당 타입에 해당하는값만 field값으로 리턴
    const getShelveReturnField = ((shelf: any, typeList: ShelveFieldType[]): AbstractField[] => {

      let uiOption = this.uiOption;
      let analysisCountAlias: string;
      if (!_.isUndefined(uiOption['analysis']) && !_.isUndefined(uiOption['analysis']['use']) && uiOption['analysis']['use']) {
        if (!_.isUndefined(uiOption['analysis']['operation']['aggregation']) && !_.isUndefined(uiOption['analysis']['operation']['aggregation']['column'])
          && uiOption['analysis']['operation']['aggregation']['column'] == 'count') {
          analysisCountAlias = uiOption['analysis']['operation']['aggregation']['column'];
        }
      }

      const resultList: AbstractField[] = [];
      shelf.map((item) => {
        if (!_.isUndefined(analysisCountAlias) && analysisCountAlias == item.alias) {
          resultList.push(item);
        } else {
          if ((_.eq(item.type, typeList[0]) || _.eq(item.type, typeList[1])) && (item.field && ('user_expr' === item.field.type || item.field.logicalType && -1 == item.field.logicalType.indexOf('GEO')))) {
            resultList.push(item);
          }
        }
      });
      return resultList;
    });
    // 색상지정 기준 필드리스트 설정(measure list)
    this.uiOption.fieldMeasureList = getShelveReturnField(shelf, [ShelveFieldType.MEASURE, ShelveFieldType.CALCULATED]);
    // 색상지정 기준 필드리스트 설정(dimension list)
    this.uiOption.fielDimensionList = getShelveReturnField(shelf, [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP]);
  }

  /**
   * remove layer
   * @param layerNumber
   */
  private removeLayer(layerNumber: number) {
    if (this.getUiMapOption().layers.length < (layerNumber + 1)) {
      return;
    }
    this.layerMap.forEach((item, index) => {
      if (layerNumber == index) {
        this.olmap.removeLayer(item.layerValue)
      }
    });
    this.layerMap.splice(layerNumber, 1);
  }

  /**
   * current map ui lat, lng setting
   */
  private setUiExtent(event) {
    let mapUIOption = (<UIMapOption>this.uiOption);
    if (event) {
      let map = event.map;
      let mapExtent = map.getView().calculateExtent(map.getSize());

      // projection 값 체크
      mapExtent = new ol.proj.transformExtent(mapExtent, new ol.proj.get('EPSG:4326'), new ol.proj.get('EPSG:3857'));

      let bottomLeft = new ol.proj.toLonLat(new ol.extent.getBottomLeft(mapExtent));
      let topRight = new ol.proj.toLonLat(new ol.extent.getTopRight(mapExtent));

      // console.info('left : ', this.wrapLon(bottomLeft[0]), ' bottom : ', bottomLeft[1]);
      // console.info('right : ', this.wrapLon(topRight[0]), ' top : ', topRight[1]);

      // EPSG 타입 확인
      // 우측 상단
      mapUIOption.upperCorner = this.wrapLon(topRight[0]) + ' ' + topRight[1];
      // mapUIOption.upperCorner = mapExtent[2] + ' ' + mapExtent[3]; // EPSG 4326 좌표
      // 좌측 하단
      mapUIOption.lowerCorner = this.wrapLon(bottomLeft[0]) + ' ' + bottomLeft[1];
      // mapUIOption.lowerCorner = mapExtent[0] + ' ' + bottomLeft[1];  // EPSG 4326 좌표
    }
  }

  /**
   * extent to lng
   * @param value
   * @returns {number}
   */
  private wrapLon(value) {
    let lon = Math.floor((value + 180) / 360);
    return value - (lon * 360);
  }

  /**
   * geo field check
   * @param layers
   * @param index
   * @returns {boolean}
   */
  private isGeoFieldCheck(layers: any, index): boolean {

    let valid: boolean = false;

    let fields: Field[] = layers[index].fields;

    if (fields) {
      for (let layer of fields) {
        if (layer.field && layer.field.logicalType && -1 !== layer.field.logicalType.toString().indexOf('GEO')) {
          valid = true;
        }
      }
    }
    return valid;
  }

  /**
   * analysis를 위한 map draw
   */
  private drawAnalysis() {

    this.loadingShow();

    this.setMinMax();

    this.checkOption(this.getUiMapOption());

    let isMapCreation: boolean = this.createMap();

    // reset legend data
    this.legendInfo.layer = [];

    for (let dataIndex = 0; dataIndex < this.data.length; dataIndex++) {

      let dataType = _.isUndefined(this.data[dataIndex]['features']) || this.data[dataIndex]['features'].length <= 0 ? null : this.data[dataIndex]['features'][0]['geometry']['type'].toString().toLowerCase();

      if (dataType == 'polygon' && this.getUiMapOption().analysis.includeCompareLayer == true && dataIndex == 0) {
        this.includeCompareLayer(dataIndex, isMapCreation);
      } else {
        // Source
        let source = new ol.source.Vector({crossOrigin: 'anonymous'});
        // Creation feature
        this.createAnalysisFeature(source, dataIndex);
        // Creation layer
        this.createAnalysisLayer(source, isMapCreation, dataIndex);
      }
    }

    // Creation tooltip and Zoom
    this.createMapOverLayEvent();

    // create legend
    this.createLegend(this.getUiMapOption().layerNum);

    // Chart resize
    if( this.drawByType != null || !_.isEmpty(this.drawByType) )
      this.olmap.updateSize();

    this.loadingHide();
    // 완료
    this.drawFinished.emit();

  }

  /**
   * analysis Feature
   */
  private createAnalysisFeature(source, dataIndex): void {
    let data = this.data[dataIndex];
    ////////////////////////////////////////////////////////
    // Generate feature
    ////////////////////////////////////////////////////////
    // Feature list
    let features = [];

    // data 에서 geometry 값을 uiOption에 변경 여부
    let isChangedType: boolean = false;

    // Data set
    for (let i = 0; i < data.features.length; i++) {

      // data 에서 geometry 값을 추출, uiOption type에 적용
      if (!isChangedType) {
        this.getUiMapOption().layers[this.getUiMapOption().layerNum].type = data.features[i].geometry.type.toString().toLowerCase() == 'point' ? 'symbol' : data.features[i].geometry.type.toString().toLowerCase();
        isChangedType = true;
      }

      // geo type
      if (data.features[i].geometry.type.toString().toLowerCase().indexOf('point') != -1) {
        // point
        let pointFeature = (new ol.format.GeoJSON()).readFeature(data.features[i]);
        pointFeature.set('layerNum', this.getUiMapOption().layerNum);
        pointFeature.set('isClustering', this.getUiMapOption().layers[this.getUiMapOption().layerNum]['clustering']);
        features[i] = pointFeature;
        source.addFeature(features[i]);
      } else if (data.features[i].geometry.type.toString().toLowerCase().indexOf('polygon') != -1 || data.features[i].geometry.type.toString().toLowerCase().indexOf('multipolygon') != -1) {
        // polygon
        let polygonFeature = (new ol.format.GeoJSON()).readFeature(data.features[i]);
        polygonFeature.set('layerNum', this.getUiMapOption().layerNum);
        features[i] = polygonFeature;
        source.addFeature(features[i]);
      } else if (data != null && data.features[i] != null && data.features[i].geometry != null && data.features[i].geometry.type.toString().toLowerCase().indexOf('line') != -1) {
        let line = new ol.geom.LineString(data.features[i].geometry.coordinates);
        let lineFeature = new ol.Feature({geometry: line});
        if (!_.isNull(this.getUiMapOption().layers[this.getUiMapOption().layerNum].color.column)) {
          const alias = ChartUtil.getFieldAlias(this.getUiMapOption().layers[this.getUiMapOption().layerNum].color.column, this.shelf.layers[this.getUiMapOption().layerNum].fields, this.getUiMapOption().layers[this.getUiMapOption().layerNum].color.aggregationType);
          lineFeature.set(alias, data.features[i].properties[alias]);
        }
        lineFeature.set('layerNum', this.getUiMapOption().layerNum);
        features.push(lineFeature);
        source.addFeature(lineFeature);
      }
    } // end - features for
  }

  /**
   * analysis Layer
   */
  private createAnalysisLayer(source: any, isMapCreation: boolean, dataIndex: number): void {
    ////////////////////////////////////////////////////////
    // Create layer
    ////////////////////////////////////////////////////////
    // Layer
    let layer: UILayers = this.getUiMapOption().layers[this.getUiMapOption().layerNum];

    if (_.eq(layer.type, MapLayerType.SYMBOL)) {
      //////////////////////////
      // Point layer
      //////////////////////////
      // Create
      let symbolLayer = new ol.layer.Vector({
        source: source,
        style: this.clusterStyleFunction(this.getUiMapOption().layerNum, this.data, null, dataIndex)
      });
      symbolLayer.setZIndex(4);
      this.layerMap.push({id: this.getUiMapOption().layerNum, layerValue: symbolLayer});
      // Init
      if (isMapCreation && this.getUiMapOption().showMapLayer) {
        // Add layer
        this.olmap.addLayer(symbolLayer);
      } else {
        if (this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(symbolLayer);
          // Set style
          symbolLayer.setStyle(this.clusterStyleFunction(this.getUiMapOption().layerNum, this.data, null, dataIndex));
        } else {
          // Remove layer
          this.olmap.removeLayer(symbolLayer);
        }
      }
    } else if (_.eq(layer.type, MapLayerType.LINE) || _.eq(layer.type, MapLayerType.POLYGON) || _.eq(layer.type, MapLayerType.MULTIPOLYGON)) {
      ////////////////////////////////////////////////////////
      // Line, Polygon layer
      ////////////////////////////////////////////////////////
      // Create
      let symbolLayer = new ol.layer.Vector({
        source: source,
        style: this.mapStyleFunction(this.getUiMapOption().layerNum, this.data, null, dataIndex)
      });
      symbolLayer.setZIndex(3);
      this.layerMap.push({id: this.getUiMapOption().layerNum, layerValue: symbolLayer});
      // Init
      if (isMapCreation && this.getUiMapOption().showMapLayer) {
        // Add layer
        this.olmap.addLayer(symbolLayer);
      } else {
        if (this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(symbolLayer);
        } else {
          // Remove layer
          this.olmap.removeLayer(symbolLayer);
        }
      }
    } else if (_.eq(layer.type, MapLayerType.HEATMAP)) {
      ////////////////////////////////////////////////////////
      // Heatmap layer
      ////////////////////////////////////////////////////////
      let getHeatMapLayerValue: UIHeatmapLayer = <UIHeatmapLayer>layer;
      // Create
      let heatmapLayer = new ol.layer.Heatmap({
        source: source,
        // Style
        gradient: HeatmapColorList[getHeatMapLayerValue.color.schema],
        opacity: 1 - (getHeatMapLayerValue.color.transparency * 0.01),
        radius: getHeatMapLayerValue.radius,
        blur: getHeatMapLayerValue.blur * 0.7
      });
      heatmapLayer.setZIndex(0);
      this.layerMap.push({id: this.getUiMapOption().layerNum, layerValue: heatmapLayer});
      // Init
      if (isMapCreation && this.getUiMapOption().showMapLayer) {
        // Add layer
        this.olmap.addLayer(heatmapLayer);
      } else {
        if (this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(heatmapLayer);
          // Set style
          if (isUndefined(HeatmapColorList[getHeatMapLayerValue.color.schema])) {
            heatmapLayer.setGradient(HeatmapColorList['HC1']);
          } else {
            heatmapLayer.setGradient(HeatmapColorList[getHeatMapLayerValue.color.schema]);
          }
          heatmapLayer.setOpacity(1 - (getHeatMapLayerValue.color.transparency * 0.01));
          heatmapLayer.setRadius(getHeatMapLayerValue.radius);
          heatmapLayer.setBlur(getHeatMapLayerValue.blur * 0.7);
        } else {
          // Remove layer
          this.olmap.removeLayer(heatmapLayer);
        }
      }
    } else if (_.eq(layer.type, MapLayerType.TILE)) {
      ////////////////////////////////////////////////////////
      // Hexgon layer
      ////////////////////////////////////////////////////////
      // Create
      let hexagonLayer = new ol.layer.Vector({
        source: source,
        style: this.hexagonStyleFunction(this.getUiMapOption().layerNum, this.data, null, dataIndex)
      });
      hexagonLayer.setZIndex(1);
      this.layerMap.push({id: this.getUiMapOption().layerNum, layerValue: hexagonLayer});
      // Init
      if (isMapCreation && this.getUiMapOption().showMapLayer) {
        // Add layer
        this.olmap.addLayer(hexagonLayer);
      } else {
        if (this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(hexagonLayer);
        } else {
          // Remove layer
          this.olmap.removeLayer(hexagonLayer);
        }
      }
    }
    this.changeDetect.detectChanges();

    // Map data place fit
    if (this.drawByType == EventType.CHANGE_PIVOT && 'Infinity'.indexOf(source.getExtent()[0]) == -1 &&
      (_.isUndefined(this.uiOption['layers'][this.getUiMapOption().layerNum]['changeCoverage']) || this.uiOption['layers'][this.getUiMapOption().layerNum]['changeCoverage'])) {
      this.olmap.getView().fit(source.getExtent());
    } else {
      // set saved data zoom
      if (this.uiOption.chartZooms && this.uiOption.chartZooms.length > 0) {
        this.olmap.getView().setCenter([this.uiOption.chartZooms[0].startValue, this.uiOption.chartZooms[0].endValue]);
        this.olmap.getView().setZoom(this.uiOption.chartZooms[0].count);
      }
    }
  }


  private includeCompareLayer(dataIndex, isMapCreation) {
    // Source
    let source = new ol.source.Vector({crossOrigin: 'anonymous'});

    let data = this.data[dataIndex];

    let features = [];

    for (let i = 0; i < data.features.length; i++) {
      // polygon
      let polygonFeature = (new ol.format.GeoJSON()).readFeature(data.features[i]);
      polygonFeature.set('layerNum', -5);
      features[i] = polygonFeature;
      source.addFeature(features[i]);
    } // end - features for

    let style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 2,
        lineDash: [3, 3]
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,0,255,0.1)'
      })
    });

    // Create
    let symbolLayer = new ol.layer.Vector({
      source: source,
      style: style
    });
    symbolLayer.setZIndex(3);
    this.layerMap.push({id: this.getUiMapOption().layerNum, layerValue: symbolLayer});
    // Init
    if (isMapCreation && this.getUiMapOption().showMapLayer) {
      // Add layer
      this.olmap.addLayer(symbolLayer);
    } else {
      if (this.getUiMapOption().showMapLayer) {
        // Add layer
        this.olmap.addLayer(symbolLayer);
      } else {
        // Remove layer
        this.olmap.removeLayer(symbolLayer);
      }
    }
  }

}
