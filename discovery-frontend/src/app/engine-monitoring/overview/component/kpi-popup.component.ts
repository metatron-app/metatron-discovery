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
import * as _ from "lodash";
import {CommonUtil} from "../../../common/util/common.util";
import {EngineMonitoringUtil} from "../../util/engine-monitoring.util";
import {TimezoneService} from "../../../data-storage/service/timezone.service";

declare let echarts: any;
declare let moment: any;

@Component({
  selector: 'kpi-popup',
  templateUrl: './kpi-popup.component.html',
  styles: ['.ddp-box-meta {top:80px;}', '.ddp-box-meta .ddp-pop-top {padding-top:40px; padding-bottom:40px}'
    , '.ddp-box-meta .ddp-pop-top .ddp-ui-title {padding-top:0px;}', '.ddp-box-meta .ddp-pop-top .ddp-label-title {font-size:22px;}'
    , '.ddp-detail-contents .ddp-view-datadetail .ddp-wrap-graph {padding:20px;}']
})
export class KpiPopupComponent extends AbstractPopupComponent implements OnInit, OnDestroy, AfterViewInit {

  public isShow: boolean;
  public isShowIntervalList: boolean;
  public selectedTab: string;
  public selectedMonitoringTarget: Engine.MonitoringTarget;
  public selectedDuration: string;
  public chartEmpty: boolean;

  public queryList: any[];

  @ViewChild('chart') private _chartElmRef: ElementRef;

  private _fromDate;
  private _chart: any;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private engineService: EngineService,
              private timezoneService: TimezoneService) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    this.selectedTab = '';
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
    if (!_.isNil(this._chart)) {
      this._chart.resize();
    }
  }

  public show(monitoringTarget: Engine.MonitoringTarget, selectedDuration) {
    this.selectedMonitoringTarget = monitoringTarget;
    this.setDate(selectedDuration);
    this.isShow = true;
  }

  public selfHide() {
    if (!_.isNil(this._chart)) {
      this._chart.clear();
      this._chart = undefined;
    }
    this.chartEmpty = undefined;
    this.selectedTab = '';
    this.isShow = false;
  }

  public setDate(duration:string) {
    this.selectedDuration = duration;
    if ('1HOUR' === duration) {
      this._fromDate = moment().subtract(1, 'hours').utc().format();
    } else if ('7DAYS' === duration) {
      this._fromDate = moment().subtract(7, 'days').utc().format();
    } else if ('30DAYS' === duration) {
      this._fromDate = moment().subtract(30, 'days').utc().format();
    } else {
      this._fromDate = moment().subtract(1, 'days').utc().format();
    }
    this._getData();
  }

  public selectTab(tab:string) {
    this.selectedTab = tab;
    this._getData();
  }

  public convertLabel(monitoringTarget: Engine.MonitoringTarget) {
    if (monitoringTarget === Engine.MonitoringTarget.MEM) {
      return 'Usage Memory';
    } else if (monitoringTarget === Engine.MonitoringTarget.GC_COUNT) {
      return 'GC Count';
    } else if (monitoringTarget === Engine.MonitoringTarget.QUERY_TIME) {
      return 'Avg Query Time';
    } else if (monitoringTarget === Engine.MonitoringTarget.QUERY_COUNT) {
      return 'Query Count';
    }
  }

  public getDurationLabel() {
    return EngineMonitoringUtil.getDurationLabel(this.selectedDuration);
  }

  public get getTimezone(): string {
    return this.timezoneService.getBrowserTimezone().utc;
  }

  private _getData() {
    const queryParam: any =
      {
        monitoringTarget : {
          metric: this.selectedMonitoringTarget,
          service: this.selectedTab
        },
        fromDate: this._fromDate,
        toDate: moment().utc().format()
      };

    this.loadingShow();
    this.engineService.getMonitoringData(queryParam).then((data) => {
      this.chartEmpty = undefined;
      this.loadingHide();
      const series = [];
      if (this.selectedMonitoringTarget === Engine.MonitoringTarget.MEM) {
        series.push({
          type: 'line',
          name: 'maxMem',
          data: data.maxMem,
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
        });
        series.push({
          type: 'line',
          name: 'usedMem',
          data: data.usedMem,
          connectNulls: true,
          showAllSymbol: true,
          symbol: 'none',
          sampling: 'max',
          itemStyle: {
            normal: {
              color: '#00dba2'
            }
          },
          smooth: true
        });
      } else {
        series.push({
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
        });
      }
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
            top: 20,
            bottom: 5,
            left: 5,
            right: 20,
            containLabel: true
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: data.time,
            name: 'SECOND(event_time)',
            axisName: 'SECOND(event_time)',
            axisLine: {
              lineStyle: {
                color: '#f2f1f8'
              }
            },
            axisLabel: {
              formatter: function(value) {
                return EngineMonitoringUtil.convertLocalTime(value);
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Count',
            axisName: 'Count',
            axisLine: {
              lineStyle: {
                color: '#f2f1f8'
              }
            },
            axisLabel: {
              formatter: function(value) {
                return value;
              }
            }
          }
        ],
        series: series
      };
      if (this.selectedMonitoringTarget === Engine.MonitoringTarget.MEM) {
        chartOps.tooltip.formatter = ((params): any => {
          return EngineMonitoringUtil.convertLocalTime(params[0].axisValue) + '<br/>' + params[0].marker + params[0].seriesName + ' : ' + CommonUtil.formatBytes(params[0].data, 2)
            + '<br/>' + params[1].marker + params[1].seriesName + ' : ' + CommonUtil.formatBytes(params[1].data, 2);
        });
        chartOps.yAxis[0].axisLabel.formatter = ((value): any => {
          return CommonUtil.formatBytes(value, 2);
        });
      }
      if (_.isNil(this._chart)) {
        this._chart = echarts.init(this._chartElmRef.nativeElement);
      }
      this._chart.setOption(chartOps, false);
    }).catch(() => {
      this.chartEmpty = true;
      this.loadingHide();
    });

    if (this.selectedMonitoringTarget === Engine.MonitoringTarget.QUERY_TIME) {
      this._getQueryList();
    }

  }

  private _getQueryList() {
    const param = {
      key: 'value',
      sort: 'desc',
      service: ['broker'],
      startedTimeFrom: this._fromDate,
      startedTimeTo: moment().utc().format(),
      limit: '3'
    }
    // if search keyword not empty
    this.engineService.getQueryList(param).then((data) => {
      this.queryList = data;
    })
  }

}
