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
  ElementRef, HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {AbstractComponent} from "../../common/component/abstract.component";
import {EngineService} from "../service/engine.service";
import {CommonUtil} from "../../common/util/common.util";
import {EngineMonitoringUtil} from "../util/engine-monitoring.util";
import * as _ from "lodash";

declare let echarts: any;
declare let moment: any;

@Component({
  selector: 'app-detail-datasource',
  templateUrl: './datasource-detail.component.html',
  styles: ['.ddp-ui-info-detail .wrap-data-detail .wrap-info-table.type-left {min-width:330px;}']
})
export class DatasourceDetailComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(private _location: Location,
              protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  public datasource: any
  public datasourceRule: any[];
  public datasourceStatus: any;
  public datasourceIntervals: any;
  public intervalStatus: any;
  public shardKey: any[];

  public datasourceIntervalKey: any[];

  private _datasourceName: string;
  private _histogramChart: any

  @ViewChild('histogram')
  private histogram: ElementRef;

  public ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this._datasourceName = params['datasource'];
    });

    this._getDatasourceDetail();

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
  protected onResize(event) {
    if (!_.isNil(this._histogramChart)) {
      this._histogramChart.resize();
    }
  }

  public prevDatasourceList(): void {
    this._location.back();
  }

  public getDatasourceStatusLabel(datasource): string {
    if (datasource.num_segments === datasource.num_available_segments) {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.fully');
    } else {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.partially') + ' (' + (Math.floor((datasource.num_available_segments / datasource.num_segments) * 1000) / 10).toFixed(1) + '%)';
    }
  }

  public convertSize(size) {
    return CommonUtil.formatBytes(size, 2);
  }

  public getInterval(interval: string) {
    this.engineService.getDatasourceIntervalStatus(this._datasourceName, interval.replace('/', '_')).then((data) => {
      this.intervalStatus = data[interval];
      this.shardKey = Object.keys(this.intervalStatus);
    });
  }

  public getObjectKey(object) {
    return Object.keys(object)[0];
  }

  public getObjectString(object) {
    return JSON.stringify(object);
  }

  public getRetentionDuration(rule) {
    if (rule.type.indexOf('Period') > -1) {
      return rule.period + ' (' + moment.duration(rule.period).locale("en").humanize() + ')' ;
    } else if (rule.type.indexOf('Interval') > -1) {
      return rule.interval + ' (' + this.getDurationLabel(rule.interval.split('/')[0], rule.interval.split('/')[1]) + ')';
    } else {
      return '';
    }
  }

  public getRetientionTier(rule) {
    if (rule.type.indexOf('load') > -1) {
      return rule.tieredReplicants[Object.keys(rule.tieredReplicants)[0]] + ' in ' + Object.keys(rule.tieredReplicants)[0];
    } else {
      return '';
    }
  }

  public getDurationLabel(startDate, endDate) {
    return moment.duration(moment(startDate).diff(moment(endDate))).locale("en").humanize();
  }

  private _getDatasourceDetail(): void {
    this.loadingShow();
    this.engineService.getDatasourceDetail(this._datasourceName).then((data) => {
      this.datasource = data.datasource;
      this.datasourceRule = data.datasourceRule;
      this.datasourceStatus = data.datasourceStatus;
      this.datasourceIntervals = data.datasourceIntervals;
      this.datasourceIntervalKey = Object.keys(this.datasourceIntervals);
      this._getHistogramChart();
      this.getInterval(this.datasourceIntervalKey[0]);
      this.loadingHide();
    }).catch((error) => this.commonExceptionHandler(error));
  }

  private _getShardCount(shardIdx) {
    return this.datasourceIntervals[this.datasourceIntervalKey[shardIdx]].count;
  }

  private _getHistogramChart() {

    this.changeDetect.detectChanges();

    // 차트
    if (_.isNil(this._histogramChart)) {
      this._histogramChart = echarts.init(this.histogram.nativeElement);
    }

    const barOption = {
        backgroundColor: '#ffffff',
        color: ['#c1cef1'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          formatter: (params) => {
            return params[0].axisValue + '<br/>' + CommonUtil.formatBytes(params[0].data, 2)
              + ' in ' + this._getShardCount(params[0].dataIndex) + ' shards';
          },
          confine: true
        },
        grid: {
          left: 20,
          top: 5,
          right: 5,
          bottom: 0,
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: [],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            show: false,
            splitNumber: 3,
            splitLine: { show: false },
            axisLabel: { show: false }
          }
        ],
        series: [
          {
            type: 'bar',
            barWidth: '70%',
            itemStyle: { normal: { color: '#c1cef1' }, emphasis : {color : '#666eb2'}},
            data: []
          }
        ]
      };

    barOption.xAxis[0].data = this.datasourceIntervalKey.map((item) => {
      return item.substring(0,10);
    });

    barOption.series[0].data = Object.keys(this.datasourceIntervals).map(key => this.datasourceIntervals[key]).map((item) => {
      return item.size;
    });

    // chart
    this._histogramChart.setOption(barOption, false);
  }

}
