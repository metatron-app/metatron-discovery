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

import {AfterViewInit, Component, ElementRef, HostListener, Injector, ViewChild,} from '@angular/core';
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
  ShelveFieldType,
  UIChartDataLabelDisplayType,
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
import {isNullOrUndefined} from 'util';
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
  private _customMapLayers: { name: string, layer: any, isDefault : boolean }[] = [];

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

  // Feature layer
  public featureLayer = undefined;

  // Cluster layer
  public clusterLayer = undefined;

  // Symbol layer
  public symbolLayer = undefined;

  // Heatmap layer
  public heatmapLayer = undefined;

  // Hexagon layer
  public hexagonLayer = undefined;

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
    if (this._propMapConf) {
      const objConf = JSON.parse(this._propMapConf);
      if( objConf.baseMaps ) {
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
            isDefault : ( objConf.defaultBaseMap === item.name )
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
        if (scope.tooltipLayer) scope.tooltipLayer.setPosition(undefined);
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
   * Pivot Valid Check
   * @param pivot
   */
  public isValid(pivot: Pivot, shelf: Shelf): boolean {

    if (!shelf) return false;

    let valid: boolean = false;
    let layers: Field[] = shelf.layers[this.getUiMapOption().layerNum];

    if (shelf.layers) {
      for (let layer of layers) {
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

    ////////////////////////////////////////////////////////
    // Valid Check
    ////////////////////////////////////////////////////////

    if (!this.isValid(this.pivot, this.shelf)) {
      // No Data 이벤트 발생
      this.data.show = false;
      this.noData.emit();
      return;
    }

    // Test!
    // if( this.data[0].features && this.data[0].features.length > 500 ) {
    //   this.data[0].features = this.data[0].features.splice(0, 500);
    // }
    // this.data[0].features = [this.data[0].features[0]];

    ////////////////////////////////////////////////////////
    // Get geo type
    ////////////////////////////////////////////////////////

    // Get geo type
    let field = null;
    _.each(this.shelf.layers[this.getUiMapOption().layerNum], (fieldTemp) => {
      if (fieldTemp.field.logicalType && fieldTemp.field.logicalType.toString().indexOf('GEO') != -1) {
        field = fieldTemp;
        return false;
      }
    });
    let geomType = field.field.logicalType.toString();

    ////////////////////////////////////////////////////////
    // set min / max
    ////////////////////////////////////////////////////////
    this.setMinMax();

    ////////////////////////////////////////////////////////
    // Check option (spec)
    ////////////////////////////////////////////////////////

    this.checkOption(geomType);

    ////////////////////////////////////////////////////////
    // Creation map & layer
    ////////////////////////////////////////////////////////

    // 엘리먼트 반영
    this.changeDetect.detectChanges();

    // Show data
    this.data.show = true;

    // Is map creation
    let isMapCreation: boolean = this.createMap();

    // Soruce
    let source = new ol.source.Vector({crossOrigin: 'anonymous'});

    // Hexagon Soruce
    let hexagonSource = new ol.source.Vector({crossOrigin: 'anonymous'});

    // Line & Polygon Source
    let emptySource = new ol.source.Vector();

    // Creation feature
    this.createFeature(source, hexagonSource, geomType);

    // Cluster source
    let clusterSource = new ol.source.Cluster({
      distance: this.getUiMapOption().layers[this.getUiMapOption().layerNum]['coverage'],
      source: source,
      crossOrigin: 'anonymous'
    });

    // Creation layer
    this.createLayer(source, clusterSource, hexagonSource, emptySource, isMapCreation, geomType);

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

    let layerNum = (<UIMapOption>this.uiOption).layerNum ? (<UIMapOption>this.uiOption).layerNum : 0;

    let shelve: any = !this.shelf ? [] : _.cloneDeep(this.shelf.layers[layerNum]);

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

    let layerNum = (<UIMapOption>this.uiOption).layerNum ? (<UIMapOption>this.uiOption).layerNum : 0;

    let shelve: any = !this.shelf ? [] : _.cloneDeep(this.shelf.layers[layerNum]);

    // 선반값에서 해당 타입에 해당하는값만 field값으로 리턴
    const getShelveReturnField = ((shelve: any, typeList: ShelveFieldType[]): AbstractField[] => {
      const resultList: AbstractField[] = [];
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
    if( 0 < this._customMapLayers.length ) {
      layer = this._customMapLayers.find(item => item.isDefault );
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

    // Is map creation
    if (this.olmap) {

      // Change map style
      this.olmap.removeLayer(this.osmLayer);
      this.olmap.removeLayer(this.cartoDarkLayer);
      this.olmap.removeLayer(this.cartoPositronLayer);
      this.olmap.removeLayer(this.featureLayer);
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
  private createLayer(source: any, clusterSource: any, hexagonSource: any, emptySource: any, isMapCreation: boolean, geomType: LogicalType): void {

    ////////////////////////////////////////////////////////
    // Create layer
    ////////////////////////////////////////////////////////
    for (let num: number = 0; num < this.getUiMapOption().layers.length; num++) {

      // Layer
      let layer: UILayers = this.getUiMapOption().layers[num];

      ////////////////////////////////////////////////////////
      // Point(Cluster) layer
      ////////////////////////////////////////////////////////
      if (_.eq(layer.type, MapLayerType.SYMBOL)) {

        let symbolLayer: UISymbolLayer = <UISymbolLayer>layer;

        //////////////////////////
        // Cluster layer
        //////////////////////////
        if (symbolLayer.clustering) {

          // Create
          if (!this.clusterLayer) {
            this.clusterLayer = new ol.layer.Vector({
              source: _.eq(geomType, LogicalType.GEO_POINT) ? clusterSource : emptySource,
              style: _.eq(geomType, LogicalType.GEO_POINT) ? this.clusterStyleFunction(0, this.data) : new ol.style.Style()
            });
          }

          // Set source
          this.clusterLayer.setSource(_.eq(geomType, LogicalType.GEO_POINT) ? clusterSource : emptySource);
          this.featureLayer = this.clusterLayer;

          // Init
          if (isMapCreation && this.getUiMapOption().showMapLayer) {
            // Add layer
            this.olmap.addLayer(this.clusterLayer);
          } else {
            if (this.getUiMapOption().showMapLayer) {
              // Add layer
              if (this.olmap.getLayers().getLength() == 1) {
                this.olmap.addLayer(this.clusterLayer);
              }

              // Set style
              this.clusterLayer.setStyle(_.eq(geomType, LogicalType.GEO_POINT) ? this.clusterStyleFunction(0, this.data) : new ol.style.Style());
            } else {
              // Remove layer
              this.olmap.removeLayer(this.clusterLayer);
            }
          }
        }
        //////////////////////////
        // Point layer
        //////////////////////////
        else {

          // Create
          if (!this.symbolLayer) {
            this.symbolLayer = new ol.layer.Vector({
              source: _.eq(geomType, LogicalType.GEO_POINT) ? source : emptySource,
              style: _.eq(geomType, LogicalType.GEO_POINT) ? this.clusterStyleFunction(0, this.data) : new ol.style.Style()
            });
          }

          // Set source
          this.symbolLayer.setSource(_.eq(geomType, LogicalType.GEO_POINT) ? source : emptySource);
          this.featureLayer = this.symbolLayer;

          // Init
          if (isMapCreation && this.getUiMapOption().showMapLayer) {
            // Add layer
            this.olmap.addLayer(this.symbolLayer);
          } else {
            if (this.getUiMapOption().showMapLayer) {
              // Add layer
              if (this.olmap.getLayers().getLength() == 1) {
                this.olmap.addLayer(this.symbolLayer);
              }

              // Set style
              this.symbolLayer.setStyle(_.eq(geomType, LogicalType.GEO_POINT) ? this.clusterStyleFunction(0, this.data) : new ol.style.Style());
            } else {
              // Remove layer
              this.olmap.removeLayer(this.symbolLayer);
            }
          }
        }
      }
      ////////////////////////////////////////////////////////
      // Line, Polygon layer
      ////////////////////////////////////////////////////////
      if (_.eq(layer.type, MapLayerType.LINE)
        || _.eq(layer.type, MapLayerType.POLYGON)) {

        // Create
        if (!this.symbolLayer) {
          this.symbolLayer = new ol.layer.Vector({
            source: source,
            style: this.mapStyleFunction(0, this.data)
          });
        }

        // Set source
        this.symbolLayer.setSource(source);
        this.featureLayer = this.symbolLayer;

        // Init
        if (isMapCreation && this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(this.symbolLayer);
        } else {
          if (this.getUiMapOption().showMapLayer) {
            // Add layer
            if (this.olmap.getLayers().getLength() == 1) {
              this.olmap.addLayer(this.symbolLayer);
            }

            // Set style
            this.symbolLayer.setStyle(this.mapStyleFunction(0, this.data));
          } else {
            // Remove layer
            this.olmap.removeLayer(this.symbolLayer);
          }
        }
      }
      ////////////////////////////////////////////////////////
      // Heatmap layer
      ////////////////////////////////////////////////////////
      else if (_.eq(layer.type, MapLayerType.HEATMAP)) {

        let heatmapLayer: UIHeatmapLayer = <UIHeatmapLayer>layer;

        // Create
        if (!this.heatmapLayer) {
          this.heatmapLayer = new ol.layer.Heatmap({
            source: _.eq(geomType, LogicalType.GEO_POINT) ? source : emptySource,
            // Style
            gradient: HeatmapColorList[heatmapLayer.color.schema],
            opacity: 1 - (heatmapLayer.color.transparency * 0.01),
            radius: heatmapLayer.radius,
            blur: heatmapLayer.blur * 0.7
          });
        }

        this.heatmapLayer.setSource(_.eq(geomType, LogicalType.GEO_POINT) ? source : emptySource);
        this.featureLayer = this.heatmapLayer;

        // Init
        if (isMapCreation && this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(this.heatmapLayer);
        } else {
          if (this.getUiMapOption().showMapLayer) {
            // Add layer
            if (this.olmap.getLayers().getLength() == 1) {
              this.olmap.addLayer(this.heatmapLayer);
            }

            // Set style
            this.heatmapLayer.setGradient(HeatmapColorList[heatmapLayer.color.schema]);
            this.heatmapLayer.setOpacity(1 - (heatmapLayer.color.transparency * 0.01));
            this.heatmapLayer.setRadius(heatmapLayer.radius);
            this.heatmapLayer.setBlur(heatmapLayer.blur * 0.7);
            if (!_.eq(geomType, LogicalType.GEO_POINT)) {
              // Set style
              this.symbolLayer.setStyle(new ol.style.Style());
            }
          } else {
            // Remove layer
            this.olmap.removeLayer(this.heatmapLayer);
          }
        }
      }
      ////////////////////////////////////////////////////////
      // Hexgon layer
      ////////////////////////////////////////////////////////
      else if (_.eq(layer.type, MapLayerType.TILE)) {

        // Create
        if (!this.hexagonLayer) {
          this.hexagonLayer = new ol.layer.Vector({
            source: _.eq(geomType, LogicalType.GEO_POINT) ? hexagonSource : emptySource,
            style: _.eq(geomType, LogicalType.GEO_POINT) ? this.hexagonStyleFunction(0, this.data) : new ol.style.Style()
          });
        }

        // Set source
        this.hexagonLayer.setSource(_.eq(geomType, LogicalType.GEO_POINT) ? hexagonSource : emptySource);
        this.featureLayer = this.hexagonLayer;

        // Init
        if (isMapCreation && this.getUiMapOption().showMapLayer) {
          // Add layer
          this.olmap.addLayer(this.hexagonLayer);
        } else {
          if (this.getUiMapOption().showMapLayer) {
            // Add layer
            if (this.olmap.getLayers().getLength() == 1) {
              this.olmap.addLayer(this.hexagonLayer);
            }

            // Set style
            this.hexagonLayer.setStyle(_.eq(geomType, LogicalType.GEO_POINT) ? this.hexagonStyleFunction(0, this.data) : new ol.style.Style());
          } else {
            // Remove layer
            this.olmap.removeLayer(this.hexagonLayer);
          }
        }
      }
    }

    // Map data place fit
    if (this.drawByType) {
      this.olmap.getView().fit(source.getExtent());

      // set saved data zoom
    } else {
      if (this.uiOption.chartZooms && this.uiOption.chartZooms.length > 0) {
        this.olmap.getView().setCenter([this.uiOption.chartZooms[0].startValue, this.uiOption.chartZooms[0].endValue]);
        this.olmap.getView().setZoom(this.uiOption.chartZooms[0].count);
      }
    }
  }

  /**
   * Creation feature
   */
  private createFeature(source, hexagonSource, geomType): void {

    ////////////////////////////////////////////////////////
    // Generate feature
    ////////////////////////////////////////////////////////

    // Feature list
    let features = [];

    // Data interate
    for (let i = 0; i < this.data[0]["features"].length; i++) {

      let feature = new ol.Feature();
      feature = (new ol.format.GeoJSON()).readFeature(this.data[0].features[i]);

      if (_.eq(geomType, LogicalType.GEO_POINT)) {
        let featureCenter = feature.getGeometry().getCoordinates();

        if (featureCenter.length === 1) {
          let extent = feature.getGeometry().getExtent();
          featureCenter = ol.extent.getCenter(extent);
          feature.setGeometry(new ol.geom.Point(featureCenter));
        }

        if (this.uiOption.fieldMeasureList.length > 0) {

          const alias = ChartUtil.getFieldAlias(this.getUiMapOption().layers[0].color.column, this.shelf.layers[0], this.getUiMapOption().layers[0].color.aggregationType);

          //히트맵 weight 설정
          if (this.data[0].valueRange[alias]) {
            feature.set('weight', feature.getProperties()[alias] / this.data[0].valueRange[alias].maxValue);
          }
        }
      }
      feature.set('layerNum', 0);
      features[i] = feature;
    }

    source.addFeatures(features);

    ////////////////////////////////////////////////////////
    // Generate hexagon feature
    ////////////////////////////////////////////////////////

    let hexagonFeatures = (new ol.format.GeoJSON()).readFeatures(this.data[0]);

    for (let feature of hexagonFeatures) {
      feature.set('layerNum', 0);
    }

    hexagonSource.addFeatures(hexagonFeatures);
  }

  /**
   * map style function
   */
  private mapStyleFunction = (layerNum, data, selectMode?: ChartSelectMode) => {

    let scope: any = this;
    let styleOption: UIMapOption = this.getUiMapOption();
    let styleLayer: UILayers = styleOption.layers[layerNum];
    let styleData = data[layerNum];

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
      let alias = ChartUtil.getFieldAlias(styleLayer.color.column, scope.shelf.layers[styleOption.layerNum], styleLayer.color.aggregationType)

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
      if (_.eq(layerType, MapLayerType.POLYGON)) {
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
          const lineAlias = ChartUtil.getFieldAlias(lineLayer.thickness.column, scope.shelf.layers[styleOption.layerNum], lineLayer.thickness.aggregationType);

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
      } else if (_.eq(layerType, MapLayerType.POLYGON)) {
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
  }

  /**
   * Cluster style function
   */
  private clusterStyleFunction = (layerNum, data, selectMode?: ChartSelectMode) => {

    let scope: any = this;
    let styleOption: UIMapOption = this.getUiMapOption();
    let styleLayer: UILayers = styleOption.layers[layerNum];
    let styleData = data[layerNum];

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
      let alias = ChartUtil.getFieldAlias(styleLayer.color.column, scope.shelf.layers[styleOption.layerNum], styleLayer.color.aggregationType);

      ////////////////////////////////////////////////////////
      // Cluster size
      ////////////////////////////////////////////////////////

      let size: number = 0;
      let features = feature.get('features');

      // Only cluster on
      if (features) {
        size = features.length;
      }

      // Only cluster off
      if (_.isUndefined(features)) {
        size = 1;
        features = [feature];
      }

      ////////////////////////////////////////////////////////
      // Point Style
      ////////////////////////////////////////////////////////
      if (size <= 1) {

        let feature = features[0];

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

        ////////////////////////////////////////////////////////
        // Size
        ////////////////////////////////////////////////////////

        let featureSize = 5;
        try {
          if (_.eq(featureSizeType, MapBy.MEASURE)) {
            featureSize = parseInt(feature.get(ChartUtil.getFieldAlias((<UISymbolLayer>styleLayer).size.column, scope.shelf.layers[styleOption.layerNum]))) / (styleData.valueRange[ChartUtil.getFieldAlias((<UISymbolLayer>styleLayer).size.column, scope.shelf.layers[styleOption.layerNum])].maxValue / 30);
            if (featureSize < 5) {
              featureSize = 5;
            }
          }
        } catch (error) {
        }

        let lineThickness = 2;
        try {
          if (_.eq(featureSizeType, MapBy.MEASURE)) {
            lineThickness = parseInt(feature.get(ChartUtil.getFieldAlias((<UISymbolLayer>styleLayer).size.column, scope.shelf.layers[styleOption.layerNum]))) / (styleData.valueRange[ChartUtil.getFieldAlias((<UISymbolLayer>styleLayer).size.column, scope.shelf.layers[styleOption.layerNum])].maxValue / lineMaxVal);
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
  private hexagonStyleFunction = (layerNum, data, selectMode?: ChartSelectMode) => {

    let scope: any = this;
    let styleOption: UIMapOption = this.getUiMapOption();
    let styleLayer: UILayers = styleOption.layers[layerNum];
    let styleData = data[layerNum];
    let alias = ChartUtil.getFieldAlias(styleLayer.color.column, scope.shelf.layers[styleOption.layerNum], styleLayer.color.aggregationType);

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
   * Create tooltip
   */
  private createTooltip(): void {

    ////////////////////////////////////////////////////////
    // Heatmap => not set tooltip
    ////////////////////////////////////////////////////////

    if (MapLayerType.HEATMAP === this.getUiMapOption().layers[this.getUiMapOption().layerNum].type) {
      return;
    }

    ////////////////////////////////////////////////////////
    // Create tooltip layer
    ////////////////////////////////////////////////////////

    if (!this.tooltipLayer) {

      // Create
      this.tooltipLayer = new ol.Overlay({
        element: this.tooltipEl.nativeElement,
        positioning: 'top-center',
        stopEvent: false
      });

      // Add
      this.olmap.addOverlay(this.tooltipLayer);
    }

    // set tooltip position
    if (this.uiOption.toolTip) {

      let yOffset = 20;

      if (MapLayerType.LINE === this.getUiMapOption().layers[this.getUiMapOption().layerNum].type) {
        yOffset = 50;
      }

      let offset = [-92, -yOffset];
      let displayTypeList = _.filter(_.cloneDeep(this.uiOption.toolTip.displayTypes), (item) => {
        if (!_.isEmpty(item) && item !== UIChartDataLabelDisplayType.DATA_VALUE) return item
      });

      let columnList = [];
      // set columnList when data value is checked
      if (-1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.DATA_VALUE)) {
        columnList = this.uiOption.toolTip.displayColumns;
      }

      let addYOffset = 37 * (displayTypeList.length) + 40 * (columnList.length);

      offset[1] = -(yOffset + addYOffset);

      this.tooltipLayer.setOffset(offset);
    }

    ////////////////////////////////////////////////////////
    // Add event
    ////////////////////////////////////////////////////////

    this.olmap.un('pointermove', this.tooltipFunction);
    this.olmap.on('pointermove', this.tooltipFunction);
    this.olmap.on('moveend', this.zoomFunction);
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

    let scope = this;

    // heatmap => no tooltip
    if (MapLayerType.HEATMAP === this.getUiMapOption().layers[this.getUiMapOption().layerNum].type) {
      return;
    }

    // Get feature
    let feature = this.olmap.forEachFeatureAtPixel(event.pixel, (feature) => {
      return feature;
    });

    // Featrue check
    if (!feature) {

      // Disable tooltip
      this.tooltipInfo.enable = false;
      this.tooltipLayer.setPosition(undefined);

      // remove z-index for tooltip
      if (!this.isPage) $(document).find('.ddp-ui-dash-contents').removeClass('ddp-tooltip');
      else $(document).find('.ddp-view-chart-contents').removeClass('ddp-tooltip');
      return;
    }

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


    // Layer num
    this.tooltipInfo.num = _.cloneDeep(feature.get('layerNum')) + 1;

    // Layer name
    if (this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[17] !== null) {
      this.tooltipInfo.name = this.getUiMapOption().layers[feature.get('layerNum')].name;
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
    let pointerX = coords[0].toFixed(4);
    let pointerY = coords[1].toFixed(4);

    if (_.eq(this.tooltipInfo.geometryType, String(MapGeometryType.POINT)) || _.eq(this.tooltipInfo.geometryType, String(MapGeometryType.LINE))) {
      coords = feature.getGeometry().getCoordinates();
    } else {
      let extent = feature.getGeometry().getExtent();
      coords = ol.extent.getCenter(extent);
    }

    this.tooltipInfo.coords = [];

    if (this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[18] !== null) {

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
    // Field info (Data Value)
    ////////////////////////////////////////////////////////

    this.tooltipInfo.fields = [];

    // Properties (DATA_VALUE)
    if (this.getUiMapOption().toolTip.displayTypes != undefined && this.getUiMapOption().toolTip.displayTypes[19] !== null) {

      let aggregationKeys: any[] = [];
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

      // Enable tooltip
    } else this.tooltipInfo.enable = true;

    // Element apply
    this.changeDetect.detectChanges();

    if (_.eq(this.tooltipInfo.geometryType, String(MapGeometryType.LINE))) {
      let extent = feature.getGeometry().getExtent();
      coords = ol.extent.getCenter(extent);
      this.tooltipLayer.setPosition(coords);
    } else {
      this.tooltipLayer.setPosition(coords);
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
  private createLegend(): void {

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
    // Legend info
    ////////////////////////////////////////////////////////

    this.legendInfo.layer = [];

    for (let num: number = 0; num < this.getUiMapOption().layers.length; num++) {

      ////////////////////////////////////////////////////////
      // Layer info
      ////////////////////////////////////////////////////////

      let legendInfo: any = {};

      // Layer
      let layer: UILayers = this.getUiMapOption().layers[num];

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
        legendInfo.radiusColumn = 'By ' + ChartUtil.getFieldAlias((<UISymbolLayer>layer).size.column, this.shelf.layers[num]);
      }

      ////////////////////////////////////////////////////////
      // Color by dimension
      ////////////////////////////////////////////////////////
      if (_.eq(layer.color.by, MapBy.DIMENSION)) {

        // Layer column
        legendInfo.column = 'By ' + ChartUtil.getFieldAlias(layer.color.column, this.shelf.layers[num], layer.color.aggregationType);

        if (layer.color.ranges) {
          _.each(layer.color.ranges, (range) => {
            let colorInfo: any = {};
            colorInfo.color = range.color;
            colorInfo.column = range['column'];
            legendInfo.color.push(colorInfo);
          });
        } else {
          if (!_.eq(layer.color.column, MapBy.NONE)) {
            const ranges = this.setDimensionColorRange(layer, this.data[num], this.getColorList(layer), []);
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
        legendInfo.column = 'By ' + ChartUtil.getFieldAlias(layer.color.column, this.shelf.layers[this.getUiMapOption().layerNum], layer.color.aggregationType);

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

          if (this.data[num].valueRange && this.data[num].valueRange[ChartUtil.getFieldAlias(layer.color.column, this.shelf.layers[this.getUiMapOption().layerNum], layer.color.aggregationType)]) {

            const ranges = ColorOptionConverter.setMapMeasureColorRange(this.getUiMapOption(), this.data[num], this.getColorList(layer), num, this.shelf.layers[num]);

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
        _.each(this.shelf.layers[this.getUiMapOption().layerNum], (field) => {
          if ('user_expr' === field.field.type || (field.field.logicalType && field.field.logicalType.toString().indexOf('GEO') != -1)) {
            colorInfo.column = field.alias;
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

    let featuresGroup = _.groupBy(featureList, ChartUtil.getFieldAlias(layer.color.column, this.shelf.layers[this.getUiMapOption().layerNum], layer.color.aggregationType));
    _.each(Object.keys(featuresGroup), (column, index) => {
      let color = colorList[index % colorList.length];
      rangeList.push({column: column, color: color});
    });

    return rangeList;
  }

  /**
   * Check UI Option (Spec) => Shelf add & remove
   */
  private checkOption(geomType: LogicalType): void {

    let option: UIMapOption = this.getUiMapOption();
    let layer: UILayers = option.layers[option.layerNum];
    let shelf: GeoField[] = _.cloneDeep(this.shelf.layers[option.layerNum]);

    ////////////////////////////////////////////////////////
    // Set geo type
    ////////////////////////////////////////////////////////

    let layerType: MapLayerType = layer.type;

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

    // Option panel change cancle
    if (!this.drawByType || String(this.drawByType) == "") {
      return;
    }

    ////////////////////////////////////////////////////////
    // Add pivot(shelf) check
    ////////////////////////////////////////////////////////

    // ////////////////////////////////////////////////////////
    // // Alias
    // ////////////////////////////////////////////////////////
    // _.each(option.layers, (layer) => {
    //   ////////////////////////////////////////////////////////
    //   // Symbol
    //   ////////////////////////////////////////////////////////
    //   if( _.eq(layer.type, MapLayerType.SYMBOL) ) {
    //     // Symbol layer
    //     let symbolLayer: UISymbolLayer = <UISymbolLayer>layer;
    //     ///////////////////////////
    //     // Color
    //     ///////////////////////////
    //     if( _.eq(layer.color.by, MapBy.MEASURE) || _.eq(layer.color.by, MapBy.DIMENSION) ) {
    //       let column: string = layer.color.column;
    //       let name: string = layer.color.name;
    //       _.each(this.shelf.layers, (shelf) => {
    //         _.each(shelf, (field) => {
    //           if( _.eq(name, field['name']) ) {
    //             layer.color.column = this.getAlias(field);
    //           }
    //         });
    //       });
    //     }
    //     ///////////////////////////
    //     // Size
    //     ///////////////////////////
    //     if( _.eq(symbolLayer.size.by, MapBy.MEASURE) ) {
    //       let column: string = symbolLayer.size.column;
    //       let name: string = symbolLayer.size.name;
    //       _.each(this.shelf.layers, (shelf) => {
    //         _.each(shelf, (field) => {
    //           if( _.eq(name, field['name']) ) {
    //             symbolLayer.size.column = this.getAlias(field);
    //           }
    //         });
    //       });
    //     }
    //   }
    //   ////////////////////////////////////////////////////////
    //   // Line
    //   ////////////////////////////////////////////////////////
    //   else if( _.eq(layer.type, MapLayerType.LINE) ) {
    //
    //   }
    //   ////////////////////////////////////////////////////////
    //   // Polygon
    //   ////////////////////////////////////////////////////////
    //   else if( _.eq(layer.type, MapLayerType.POLYGON) ) {
    //
    //   }
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
    });

    ////////////////////////////////////////////////////////
    // Color
    ////////////////////////////////////////////////////////

    // init custom user color setting
    layer.color.ranges = undefined;
    layer.color['settingUseFl'] = false;

    ///////////////////////////
    // Color by None
    ///////////////////////////
    if (isNone) {
      layer.color.by = MapBy.NONE;
      layer.color.schema = _.eq(layer.type, MapLayerType.HEATMAP) ? 'HC1' : '#6344ad';
      layer.color.column = null;
      layer.color.aggregationType = null;
    }
    ///////////////////////////
    // Color by Measure
    ///////////////////////////
    // remove not isDimension => exceptional case select dimension and remove dimension
    else if (isMeasure) {
      layer.color.by = MapBy.MEASURE;
      layer.color.schema = _.eq(layer.type, MapLayerType.HEATMAP) ? 'HC1' : 'VC1';
      layer.color.column = this.uiOption.fieldMeasureList[0]['name'];
      layer.color.aggregationType = this.uiOption.fieldMeasureList[0]['aggregationType'];
      layer.color.ranges = ColorOptionConverter.setMapMeasureColorRange(this.getUiMapOption(), this.data[0], this.getColorList(layer), this.getUiMapOption().layerNum, this.shelf.layers[this.getUiMapOption().layerNum]);
    }
    ///////////////////////////
    // Color by Dimension
    ///////////////////////////
    // hexagon && isDimension => init as none
    else if (MapLayerType.TILE === layer.type && isDimension) {
      layer.color.by = MapBy.NONE;
      layer.color.schema = '#6344ad';
      layer.color.column = null;
      layer.color.aggregationType = null;
    } else if (isDimension) {
      layer.color.by = MapBy.DIMENSION;
      layer.color.schema = 'SC1';
      layer.color.column = this.uiOption.fielDimensionList[0]['name'];
      layer.color.aggregationType = null;
      if (this.uiOption.fielDimensionList[0]['format']) layer.color.granularity = this.uiOption.fielDimensionList[0]['format']['unit'].toString();
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
        symbolLayer.size.column = this.uiOption.fieldMeasureList[0]['name'];
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
      if (!this.uiOption.fieldMeasureList || this.uiOption.fieldMeasureList.length === 0) {
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
    if (!this.uiOption.toolTip.displayColumns) this.uiOption.toolTip.displayColumns = [];

    let fields = TooltipOptionConverter.returnTooltipDataValue(shelf);
    this.uiOption.toolTip.displayColumns = ChartUtil.returnNameFromField(fields);
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
    // save current chartzoom
    this.uiOption.chartZooms = this.additionalSaveDataZoomRange();

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
      let dimensionLayer = this.originShelf.layers[(<UIMapOption>this.uiOption).layerNum].filter((item) => {
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

    if (!selectMode || selectData.length > 0) {
      switch (this.getUiMapOption().layers[layerNum].type) {

        // symbol layer => use cluster style func
        case MapLayerType.SYMBOL:

          // clustering
          if ((<UISymbolLayer>this.getUiMapOption().layers[layerNum]).clustering) {
            this.clusterLayer.setStyle(this.clusterStyleFunction(0, this.data, selectMode));

            // point
          } else {
            this.symbolLayer.setStyle(this.clusterStyleFunction(0, this.data, selectMode));
          }
          break;
        // hexagon(tile) layer => use hexagon style func
        case MapLayerType.TILE:
          this.hexagonLayer.setStyle(this.hexagonStyleFunction(0, this.data, selectMode));
          break;
        // line, polygon layer => use map style func
        case MapLayerType.LINE:
        case MapLayerType.POLYGON:
          this.symbolLayer.setStyle(this.mapStyleFunction(0, this.data, selectMode));
          break;
      }
    }
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

    let layer: UILayers = this.getUiMapOption().layers[this.getUiMapOption().layerNum];
    let shelf: GeoField[] = _.cloneDeep(this.shelf.layers[this.getUiMapOption().layerNum]);

    if (!_.isEmpty(layer.color.column) && this.uiOption.valueFormat && undefined !== this.uiOption.valueFormat.decimal && this.data && this.data.length > 0) {

      let alias = ChartUtil.getFieldAlias(layer.color.column, shelf, layer.color.aggregationType);

      let valueRange = _.cloneDeep(this.data[0]['valueRange'][alias]);
      if (valueRange) {
        this.uiOption.minValue = valueRange.minValue;
        this.uiOption.maxValue = valueRange.maxValue;
      }
    }
  }
}
