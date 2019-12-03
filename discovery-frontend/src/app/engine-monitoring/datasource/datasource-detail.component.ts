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
import * as _ from "lodash";
import {DeleteModalComponent} from "../../common/component/modal/delete/delete.component";
import {Alert} from "../../common/util/alert.util";
import {Modal} from "../../common/domain/modal";
import {DatasourceRuleComponent} from "./datasource-rule.component";
import {DatasourceColumnComponent} from "./datasource-column.component";

declare let echarts: any;
declare let moment: any;

@Component({
  selector: 'app-detail-datasource',
  templateUrl: './datasource-detail.component.html',
  styles: ['.ddp-ui-info-detail .wrap-data-detail .wrap-info-table.type-left {min-width:330px;}'
          , '.ddp-ui-info-detail table.ddp-table-detail tbody tr td .ddp-txt-status {font-size:12px; font-weight:bold;}'
          , '.ddp-ui-info-detail table.ddp-table-detail tbody tr td .ddp-txt-status.type-partially {color:#ffba00;}'
          , '.ddp-ui-info-detail table.ddp-table-detail tbody tr td .ddp-txt-status.type-fully {color:#10bf83;}'
          , '.ddp-ui-info-detail table.ddp-table-detail tbody tr td .ddp-txt-status.type-actively {color:#3F72C1;}']
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

  public showDisable: boolean;
  public datasource: any;
  public datasourceRule: any[];
  public datasourceDefaultRule: any[];
  public datasourceStatus: any;
  public datasourceIntervals: any;
  public intervalStatus: any;
  public shardKey: any[];
  public datasourceIntervalKey: any[];
  public selectedInterval: any;

  private _datasourceName: string;
  private _histogramChart: any;

  @ViewChild(DeleteModalComponent)
  private disableModalComponent: DeleteModalComponent;

  @ViewChild(DatasourceRuleComponent)
  private datasourceRuleComponent: DatasourceRuleComponent;

  @ViewChild(DatasourceColumnComponent)
  private datasourceColumnComponent: DatasourceColumnComponent;

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
    const datasourceStatus = this.getDatasourceStatus(datasource);
    if (datasourceStatus === 'actively') {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.indexing');
    } else if (datasourceStatus === 'fully') {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.fully');
    } else {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.partially') + ' (' + (Math.floor((datasource.num_available_segments / datasource.num_segments) * 1000) / 10).toFixed(1) + '%)';
    }
  }

  public getDatasourceStatus(datasource): string {
    if (datasource.status < 0) {
      return 'actively';
    } else if (datasource.num_segments === datasource.num_available_segments) {
      return 'fully';
    } else {
      return 'partially';
    }
  }

  public convertSize(size) {
    return CommonUtil.formatBytes(size, 2);
  }

  public onClickInterval(interval: string) {
    this.engineService.getDatasourceIntervalStatus(this._datasourceName, interval.replace('/', '_')).then((data) => {
      this.selectedInterval = interval;
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

  public getRetentionTier(rule) {
    if (rule.type.indexOf('load') > -1) {
      return rule.tieredReplicants[Object.keys(rule.tieredReplicants)[0]] + ' in ' + Object.keys(rule.tieredReplicants)[0];
    } else {
      return '';
    }
  }

  public getDurationLabel(startDate, endDate) {
    return moment.duration(moment(startDate).diff(moment(endDate))).locale("en").humanize();
  }

  public disableDatasource(): void {
    // 로딩 show
    this.loadingShow();
    this.engineService.disableDatasource(this._datasourceName)
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.engine.monitoring.alert.ds.disable.success'));
        // 로딩 hide
        this.loadingHide();
        // 뒤로가기
        this.prevDatasourceList();
      })
      .catch((error) => {
        // alert
        Alert.warning(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  public disableModalOpen() {
    // 모달 오픈
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.engine.monitoring.ui.ds.disable.title');
    modal.description = this.translateService.instant('msg.engine.monitoring.ui.ds.disable.description');
    modal.btnName = this.translateService.instant('msg.engine.monitoring.btn.ds.disable');
    this.disableModalComponent.init(modal);
  }

  public openRule() {
    this.datasourceRuleComponent.open();
  }

  public openColumn(dimensions, metrics) {
    this.datasourceColumnComponent.open(dimensions, metrics);
  }

  public onChangedRetention() {
    this.engineService.getDatasourceRule(this._datasourceName).then((data) => {
      this.datasourceRule = data;
    });
  }

  private _getDatasourceDetail(): void {
    this.loadingShow();
    this.engineService.getDatasourceDetail(this._datasourceName).then((data) => {
      this.datasource = data.datasource;
      this.datasourceRule = data.datasourceRule;
      this.datasourceDefaultRule = data.datasourceDefaultRule;
      this.datasourceStatus = data.datasourceStatus;
      this.datasourceIntervals = data.datasourceIntervals;
      this.datasourceIntervalKey = Object.keys(this.datasourceIntervals);
      this._getHistogramChart();
      this.onClickInterval(this.datasourceIntervalKey[0]);
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
    this._histogramChart.off('click');
    this._histogramChart.on('click', (params) => {
      if (params != null) {
        $('.ddp-table-form.ddp-table-type2.type-cursor tr')[params.dataIndex].scrollIntoView({ behavior: 'smooth' });
        this.onClickInterval(this.datasourceIntervalKey[params.dataIndex]);
      }
    });
  }

}
