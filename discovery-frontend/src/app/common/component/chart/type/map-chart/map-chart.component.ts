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
import { UIMapOption } from '../../option/ui-option/map/ui-map-chart';
import { MapType } from '../../option/define/map/map-common';

@Component({
  selector: 'map-chart',
  templateUrl: 'map-chart.component.html'
})
export class MapChartComponent extends BaseChart implements AfterViewInit{

  @ViewChild('mapArea')
  private area: ElementRef;

  public olmap: ol.Map = undefined;

  private $area: any;

  public osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
      attributions: [new ol.Attribution({
        html: this.attribution()
      })]
    })
  });

  public attribution(): string {
    return '© OpenStreetMap contributer';
  }

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


  // 생성자
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector) {

    super(elementRef, injector);
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

  public isValid(pivot: Pivot): boolean {
    // return true;
    return (pivot !== undefined) && ((pivot.columns.length > 0) || (pivot.rows.length > 0) || (pivot.aggregations.length > 0));
  }

  public draw(isKeepRange?: boolean): void {

    this.createMap();

    let source = new ol.source.Vector();

    let symbolLayer = new ol.layer.Vector({
      source: source,
      opacity: (<UIMapOption>this.uiOption).layers[0].color.transparency / 100
    });

    symbolLayer.setSource(source);

    this.olmap.addLayer(symbolLayer);
  }

  public createMap(): void {

    let layer = this.osmLayer;

    if((<UIMapOption>this.uiOption).map === MapType.OSM) {
      layer = this.cartoPositronLayer;
    } else if((<UIMapOption>this.uiOption).map === MapType.OSM) {
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
      document.getElementsByClassName("ddp-ui-chart-contents")[0]["style"].top = '104px';
      document.getElementsByClassName("ddp-ui-chart-area")[0]["style"].padding = '0 0 0 0';
    }
    this.olmap.updateSize();

    const zoomslider = new ol.control.ZoomSlider();
    this.olmap.addControl(zoomslider);
  }
}
