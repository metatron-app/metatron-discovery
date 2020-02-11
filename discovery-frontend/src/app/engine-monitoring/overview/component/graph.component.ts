/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Component,
  ElementRef, EventEmitter,
  HostListener,
  Injector,
  OnDestroy,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {EngineService} from "../../service/engine.service";
import {Engine} from "../../../domain/engine-monitoring/engine";
import * as _ from 'lodash';
import {EngineMonitoringUtil} from "../../util/engine-monitoring.util";

declare let echarts: any;
declare let moment: any;

@Component({
  selector: '[overview-graph-view]',
  templateUrl: './graph.component.html',
  styles: ['.type-memory .ddp-btn-link-go {z-index:2}', '.ddp-wrap-line-graph .ddp-data-empty {position:relative; top:-10px}']
})
export class GraphComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('gcCPU') private _gcCpuChartElmRef: ElementRef;
  @ViewChild('usageMemory') private _usageMemoryChartElmRef: ElementRef;
  @ViewChild('gcCount') private _gcCountChartElmRef: ElementRef;
  @ViewChild('avgQueryTime') private _avgQueryTimeChartElmRef: ElementRef;

  @Output('changeValue')
  private readonly changeEvent: EventEmitter<Engine.MonitoringTarget> = new EventEmitter();

  public monitoringTarget = Engine.MonitoringTarget;

  public heapMemory:string = '';
  public queryCount:number = 0;
  public runningTaskCount:number = 0;
  public datasourceCount:number = 0;
  public segmentCount:number = 0;

  public duration:string;
  public fromDate:string;

  public memoryEmpty:boolean;
  public gcCountEmpty:boolean;
  public avgQueryTimeEmpty:boolean;

  private _memoryChart: any;
  private _gcCountChart: any;
  private _avgQueryTimeChart: any;

  constructor(private _datasourceSvc: DatasourceService,
              private _engineSvc: EngineService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
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
    if (!_.isNil(this._avgQueryTimeChart)) {
      this._avgQueryTimeChart.resize();
    }
  }

  public setDate(duration:string) {
    this.duration = duration;
    if ('1HOUR' === duration) {
      this.fromDate = moment().subtract(1, 'hours').utc().format();
    } else if ('7DAYS' === duration) {
      this.fromDate = moment().subtract(7, 'days').utc().format();
    } else if ('30DAYS' === duration) {
      this.fromDate = moment().subtract(30, 'days').utc().format();
    } else {
      this.fromDate = moment().subtract(1, 'days').utc().format();
    }
    this._init();
  }

  public showKpiChart(monitoringTarget:Engine.MonitoringTarget) {
    this.changeEvent.emit(monitoringTarget);
  }

  private _init() {
    this.loadingShow();
    this._getUsageMemory();
    this._getGcCount();
    this._getAvgQueryTime();
    this._getQueryCounts();
    this._getRunningTasks();
    this._getDatasourceCount();
    this._getSegmentCount();
    setTimeout(() => {
      this.loadingHide();
    }, 500);
  }

  /**
   * get Usage Memory
   * @private
   */
  private _getUsageMemory() {
    const queryParam: any =
      {
        fromDate: this.fromDate,
        toDate: moment().format('YYYY-MM-DDTHH:mm:ss')
      };

    this._engineSvc.getMemory(queryParam).then((data) => {
      this.memoryEmpty = undefined;
      const seriesData = data.map( item => {
        ( 'useMem' === item.name ) && ( this.heapMemory = (typeof item.percentage === "number") ? item.percentage.toFixed(0) + '%' : '0%');
        item['itemStyle'] = {
          normal:{ color: 'useMem' === item.name ? '#f0f4ff' : '#314673' }
        }
        return item;
      })
      const chartOpts: any = {
        type: 'pie',
        legend: {
          show: false,
          seriesSync: false,
          left: 'left',
          symbol: 'circle',
          width: '100%',
          itemGap: 20,
          pageItems: 5,
          textStyle: {
            fontSize: 13,
            fontFamily: 'SpoqaHanSans'
          }
        },
        'series': [
          {
            type: 'pie',
            name: 'AVG(value)',
            radius: ['60%', '68%'],
            center: ['50%', '55%'],
            data: seriesData,
            hoverAnimation: false
          }
        ],
        label: { normal: { show: false } }
      };
      if (_.isNil(this._memoryChart)) {
        this._memoryChart = echarts.init(this._usageMemoryChartElmRef.nativeElement, 'exntu');
      }
      this._memoryChart.setOption(chartOpts, false);
    }).catch(() => this.memoryEmpty = true);
  } // function - _getUsageMemory

  /**
   * get Gc Count
   * @private
   */
  private _getGcCount() {
    const queryParam: any =
      {
        monitoringTarget: {
          metric: Engine.MonitoringTarget.GC_COUNT
        },
        fromDate: this.fromDate,
        toDate: moment().utc().format()
      };

    this._engineSvc.getMonitoringData(queryParam).then((data) => {
      this.gcCountEmpty = undefined;
      const chartOps: any = {
        type: 'line',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          formatter: (params) => {
            return EngineMonitoringUtil.tooltipFormatter(params);
          }
        },
        grid: [
          {
            top: 3,
            bottom: 10,
            left: 20,
            right: 20
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
            name: 'GC Count',
            axisName: 'GC Count'
          }
        ],
        series: [
          {
            type: 'line',
            name: 'GC Count',
            data: data.value,
            connectNulls: true,
            showAllSymbol: true,
            symbol: 'none',
            sampling: 'max',
            itemStyle: {
              normal: {
                color: '#72d9a7'
              }
            },
            smooth: false
          }
        ]
      };
      if (_.isNil(this._gcCountChart)) {
        this._gcCountChart = echarts.init(this._gcCountChartElmRef.nativeElement, 'exntu');
      }
      this._gcCountChart.setOption(chartOps, false);
    }).catch(() => this.gcCountEmpty = true);

  } // function - _getGcCount

  /**
   * get Avg Query Time
   * @private
   */
  private _getAvgQueryTime() {
    const queryParam: any =
      {
        monitoringTarget : {
          metric: Engine.MonitoringTarget.QUERY_TIME,
          includeCount: true
        },
        fromDate: this.fromDate,
        toDate: moment().utc().format()
      };

    this._engineSvc.getMonitoringData(queryParam).then((data) => {
      this.avgQueryTimeEmpty = undefined;
      const chartOps: any = {
        type: 'line',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          formatter: (params) => {
            return EngineMonitoringUtil.tooltipFormatter(params);
          }
        },
        grid: [
          {
            top: 3,
            bottom: 10,
            left: 20,
            right: 20
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
            name: 'Avg Query Time',
            axisName: 'Avg Query Time'
          }
        ],
        series: [
          {
            type: 'line',
            name: 'Avg Query Time',
            data: data.avg_value,
            connectNulls: true,
            showAllSymbol: true,
            symbol: 'none',
            sampling: 'max',
            itemStyle: {
              normal: {
                color: '#2eaaaf'
              }
            },
            smooth: false
          }
        ]
      };
      if (_.isNil(this._avgQueryTimeChart)) {
        this._avgQueryTimeChart = echarts.init(this._avgQueryTimeChartElmRef.nativeElement, 'exntu');
      }
      this._avgQueryTimeChart.setOption(chartOps, false);
    }).catch(() => this.avgQueryTimeEmpty = true);
  } // function - _getAvgQueryTime

  /**
   * get Query Counts
   * @private
   */
  private _getQueryCounts() {
    const queryParam: any =
      {
        monitoringTarget : {
          metric: Engine.MonitoringTarget.QUERY_COUNT,
          includeCount: true
        },
        fromDate: this.fromDate,
        toDate: moment().utc().format()
      };
    this._engineSvc.getMonitoringData(queryParam).then((data) => {
      this.queryCount = data.total_count;
    });
  } // function - _getQueryCounts

  /**
   * get Running Tasks
   * @private
   */
  private _getRunningTasks() {
    this._engineSvc.getRunningTasks().then( result => {
      if( result ) {
        this.runningTaskCount = result.length;
      }
    });
  } // function - _getRunningTasks

  /**
   * get Datasource Count
   * @private
   */
  private _getDatasourceCount() {
    this._engineSvc.getDatasourceCount().then( result => {
      this.datasourceCount = result;
    });
  } // function - _getDatasourceCount

  /**
   * get Segment Count
   * @private
   */
  private _getSegmentCount() {
    this._engineSvc.getSegmentCount().then( result => {
      this.segmentCount = result[0].count;
    });
  } // function - _getSegmentCount

}
