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
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {EngineService} from "../../service/engine.service";
import {Engine} from "../../../domain/engine-monitoring/engine";
import {CommonUtil} from "../../../common/util/common.util";
import * as _ from "lodash";

declare let echarts: any;

@Component({
  selector: 'node-information',
  templateUrl: './node-information.component.html',
  styles: ['.ddp-box-meta {top:80px;}', '.ddp-box-meta .ddp-pop-top {padding-top:40px; padding-bottom:40px}'
    , '.ddp-box-meta .ddp-pop-top .ddp-ui-title {padding-top:0px;}', '.ddp-box-meta .ddp-pop-top .ddp-label-title {font-size:22px;}'
    , '.ddp-detail-contents .ddp-view-datadetail .ddp-wrap-graph {padding:20px;}']
})
export class NodeInformationComponent extends AbstractPopupComponent implements OnInit, OnDestroy, AfterViewInit {

  public isShow: boolean;
  public monitoring: Engine.Monitoring = new Engine.Monitoring();

  @ViewChild('gcCount') private _gcCountChartElmRef: ElementRef;
  @ViewChild('memory') private _memoryChartElmRef: ElementRef;

  private _gcCountChart: any;
  private _memoryChart: any;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    if (!_.isNil(this._gcCountChart)) {
      this._gcCountChart.resize();
    }
    if (!_.isNil(this._memoryChart)) {
      this._memoryChart.resize();
    }
  }

  public show(monitoring: Engine.Monitoring) {
    this.monitoring = monitoring;
    this._selfShow();
  }

  public selfHide() {
    this.isShow = false;
  }

  /**
   * Create labels with five node types.
   *  - broker, coordinator, historical, overlord, middleManager
   */
  public convertTypeLabel(type: Engine.NodeType) {
    switch (type) {
      case Engine.NodeType.BROKER:
        return this._toCamelCase(type);
      case Engine.NodeType.COORDINATOR:
        return this._toCamelCase(type);
      case Engine.NodeType.HISTORICAL:
        return this._toCamelCase(type);
      case Engine.NodeType.OVERLORD:
        return this._toCamelCase(type);
      case Engine.NodeType.MIDDLE_MANAGER:
        return this._toCamelCase(type);
      default:
        return type;
    }
  }

  private _selfShow() {
    this._getGcCount();
    this._getMemory();
    this.isShow = true;
  }

  private _getGcCount() {
    const queryParam: any =
      {
        monitoringTarget : {
          metric: Engine.MonitoringTarget.GC_COUNT,
          host: this.monitoring.hostname+":"+this.monitoring.port
        }
      };

    this.engineService.getMonitoringData(queryParam).then((data) => {
      const chartOps: any = {
        type: 'line',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        grid: [
          {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }
        ],
        xAxis: [
          {
            type: 'category',
            show: false,
            data: data.time,
            name: 'SECOND(event_time)',
            axisName: 'SECOND(event_time)'
          }
        ],
        yAxis: [
          {
            type: 'value',
            show: false,
            name: 'Count',
            axisName: 'Count'
          }
        ],
        series: [
          {
            type: 'line',
            name: 'Count',
            data: data.value,
            connectNulls: true,
            showAllSymbol: true,
            symbol: 'none',
            sampling: 'max',
            itemStyle: {
              normal: {
                color: '#2eaaaf'
              }
            },
            smooth: true
          }
        ]
      };
      if (_.isNil(this._gcCountChart)) {
        this._gcCountChart = echarts.init(this._gcCountChartElmRef.nativeElement, 'exntu');
      }
      this._gcCountChart.setOption(chartOps, false);
    });
  }

  private _getMemory() {
    const queryParam: any =
      {
        monitoringTarget : {
          metric: Engine.MonitoringTarget.MEM,
          host: this.monitoring.hostname+":"+this.monitoring.port
        }
      };

    this.engineService.getMonitoringData(queryParam).then((data) => {
      const chartOps: any = {
        type: 'line',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          }
        },
        grid: [
          {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }
        ],
        xAxis: [
          {
            type: 'category',
            show: false,
            data: data.time,
            name: 'SECOND(event_time)',
            axisName: 'SECOND(event_time)'
          }
        ],
        yAxis: [
          {
            type: 'value',
            show: false,
            name: 'Count',
            axisName: 'Count'
          }
        ],
        series: [
          {
            type: 'line',
            name: 'Max',
            data: data.maxMem,
            connectNulls: true,
            showAllSymbol: true,
            symbol: 'none',
            sampling: 'max',
            itemStyle: {
              normal: {
                color: '#dc494f'
              }
            },
            smooth: true
          },
          {
            type: 'line',
            name: 'Used',
            data: data.usedMem,
            connectNulls: true,
            showAllSymbol: true,
            symbol: 'none',
            sampling: 'max',
            itemStyle: {
              normal: {
                color: '#2eaaaf'
              }
            },
            smooth: true
          }
        ]
      };
      chartOps.tooltip.formatter = ((params): any => {
        return params[0].axisValue + '<br/>' + params[0].marker + params[0].seriesName + ' : ' + CommonUtil.formatBytes(params[0].data, 2)
          + '<br/>' + params[1].marker + params[1].seriesName + ' : ' + CommonUtil.formatBytes(params[1].data, 2);
      });
      if (_.isNil(this._memoryChart)) {
        this._memoryChart = echarts.init(this._memoryChartElmRef.nativeElement, 'exntu');
      }
      this._memoryChart.setOption(chartOps, false);
    });
  }

  /**
   * Utility function to change only the first letter to uppercase
   */
  private _toCamelCase(type: Engine.NodeType) {

    if (_.isNil(type)) {
      return '';
    }

    if (type.length === 0) {
      return type;
    }

    return `${type.charAt(0).toLocaleUpperCase()}${type.substring(1, type.length)}`;
  }
}
