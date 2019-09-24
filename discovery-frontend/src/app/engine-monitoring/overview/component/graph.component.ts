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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {EngineService} from "../../service/engine.service";
import {Engine} from "../../../domain/engine-monitoring/engine";

declare let echarts: any;
declare let $: any;
declare let moment: any;

@Component({
  selector: '[overview-graph-view]',
  templateUrl: './graph.component.html'
})
export class GraphComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('gcCPU') private _gcCpuChartElmRef: ElementRef;
  @ViewChild('usageMemory') private _usageMemoryChartElmRef: ElementRef;
  @ViewChild('gcCount') private _gcCountChartElmRef: ElementRef;
  @ViewChild('avgQueryTime') private _avgQueryTimeChartElmRef: ElementRef;

  public gcCpu:string = '';
  public heapMemory:string = '';
  public queryCount:number = 0;
  public runningTaskCount:number = 0;
  public datasourceCount:number = 0;

  constructor(private _datasourceSvc: DatasourceService,
              private _engineSvc: EngineService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
    this._getUsageMemory();
    this._getGcCount();
    this._getAvgQueryTime();
    this._getRunningTasks();
    this._getDatasourceList();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * get Usage Memory
   * @private
   */
  private _getUsageMemory() {
    this._engineSvc.getMemory().then((data) => {
      const seriesData = data.map( item => {
        ( 'useMem' === item.name ) && ( this.heapMemory = item.percentage.toFixed(0) + '%' );
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
      const chartObj = echarts.init(this._usageMemoryChartElmRef.nativeElement, 'exntu');
      chartObj.setOption(chartOpts, false);
    });
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
        fromDate: moment().subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss'),
        toDate: moment().format('YYYY-MM-DDTHH:mm:ss')
      };

    this._engineSvc.getMonitoringData(queryParam).then((data) => {
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
            smooth: true
          }
        ]
      };
      const chartobj = echarts.init(this._gcCountChartElmRef.nativeElement, 'exntu');
      chartobj.setOption(chartOps, false);
    });

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
        fromDate: moment().subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss'),
        toDate: moment().format('YYYY-MM-DDTHH:mm:ss')
      };

    this._engineSvc.getMonitoringData(queryParam).then((data) => {
      this.queryCount = data.total_count;
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
            smooth: true
          }
        ]
      };
      const chartobj = echarts.init(this._avgQueryTimeChartElmRef.nativeElement, 'exntu');
      chartobj.setOption(chartOps, false);
    });
  } // function - _getAvgQueryTime

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
   * get Datasource List
   * @private
   */
  private _getDatasourceList() {
    this._engineSvc.getDatasourceList().then( result => {
      if( result ) {
       this.datasourceCount = result.length;
      }
    });
  } // function - _getDatasourceList
}
