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
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {EngineService} from "../../../service/engine.service";
import {ActivatedRoute} from "@angular/router";
import {Engine} from "../../../../domain/engine-monitoring/engine";
import {Modal} from "../../../../common/domain/modal";
import {Alert} from "../../../../common/util/alert.util";
import {Location} from "@angular/common";
import * as _ from 'lodash';

declare let echarts: any;
declare let $: any;
declare let moment: any;

@Component({
  selector: 'app-detail-supervisor',
  templateUrl: './supervisor-detail.component.html',
  styles: ['.ddp-data-form .ddp-btn-buttons3:first-of-type {margin-right: 10px;}']
})
export class SupervisorDetailComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(private _location: Location,
              protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  @ViewChild('row') private _rowChartElmRef: ElementRef;
  @ViewChild('lag') private _lagChartElmRef: ElementRef;

  public supervisorId;
  public supervisorPayload: any = {};

  public taskId;
  public dataSource;

  public processed: any;
  public unparseable: any;
  public thrownaway: any;

  public isShowRowDuration: boolean;
  public isShowLagDuration: boolean;
  public selectedRowDuration: string = '1HOUR';
  public selectedLagDuration: string = '1HOUR';
  public showConfirm: boolean = false;
  public confirmModal: Modal;

  public ngOnInit() {
    this.loadingShow();
    this.activatedRoute.params.subscribe((params) => {
      this.supervisorId = params['supervisorId'];
    });

    this._getSupervisorDetail();

    super.ngOnInit();
    this.loadingHide();

  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public prevSupervisorList(): void {
    this._location.back();
  }

  public confirmOpen(confirmType): void {
    this.confirmModal = new Modal();
    this.confirmModal.data = confirmType;
    if (this.confirmModal.data === 'SHUTDOWN') {
      this.confirmModal.name = this.translateService.instant('msg.engine.monitoring.ingestion.supervisor.shutdown.confirm');
      this.confirmModal.btnName = this.translateService.instant('msg.engine.monitoring.ingestion.shutdown');
    } else if (this.confirmModal.data === 'RESET') {
      this.confirmModal.name = this.translateService.instant('msg.engine.monitoring.ingestion.supervisor.reset.confirm');
      this.confirmModal.btnName = this.translateService.instant('msg.engine.monitoring.ingestion.reset');
    }
    this.showConfirm = true;
  }

  public confirmDone(): void {
    if (this.confirmModal.data === 'SHUTDOWN') {
      this.engineService.shutdownSupervisorById(this.supervisorId).then((data) => {
        if (data) {
          this._getSupervisorDetail();
        } else {
          Alert.error(this.translateService.instant('msg.engine.monitoring.ingestion.supervisor.shutdown.confirm.fail'));
        }
      });
    } else if (this.confirmModal.data === 'RESET') {
      this.engineService.resetSupervisorById(this.supervisorId).then((data) => {
        if (data) {
          this._getSupervisorDetail();
        } else {
          Alert.error(this.translateService.instant('msg.engine.monitoring.ingestion.supervisor.reset.confirm.fail'));
        }
      });
    }
    this.showConfirm = false;
  }

  public changeRowDuration(duration:string) {
    this.isShowRowDuration = false;
    this.loadingShow();
    this.selectedRowDuration = duration;
    const fromDate = this._getFromDate(duration);
    this._getSupervisorRow(fromDate);
    setTimeout(() => {
      this.loadingHide();
    }, 300);
  }

  public changeLagDuration(duration:string) {
    this.isShowLagDuration = false;
    this.loadingShow();
    this.selectedLagDuration = duration;
    const fromDate = this._getFromDate(duration);
    this._getSupervisorLag(fromDate);
    setTimeout(() => {
      this.loadingHide();
    }, 300);
  }

  public getDurationLabel(duration:string) {
    if ('1DAY' === duration) {
      return 'Last 1 day';
    } else if ('7DAYS' === duration) {
      return 'Last 7 days';
    } else if ('30DAYS' === duration) {
      return 'Last 30 days';
    } else {
      return 'Last 1 hour';
    }
  }

  private _getSupervisorDetail(): void {
    this.engineService.getSupervisorStatus(this.supervisorId).then((data) => {
      this.supervisorPayload = data.payload;
      this.taskId = this.supervisorPayload.activeTasks[0].id;
      this.dataSource = this.supervisorPayload.dataSource;
      this._getSupervisorRow();
      this._getSupervisorLag();
    })
  }

  private _getSupervisorRow(fromDate?:string): void {
    if (_.isNil(fromDate)) {
      fromDate = this._getFromDate('1HOUR');
    }
    const queryParam: any =
    {
      monitoringTarget : {
        taskId: this.taskId
      },
      fromDate: fromDate,
      toDate: moment().utc().format('YYYY-MM-DDTHH:mm:ss')
    };

    this.engineService.getSupervisorRows(queryParam).then((data) => {
      this.processed = data.processed[data.processed.length - 1];
      this.unparseable = data.unparseable[data.unparseable.length - 1];
      this.thrownaway = data.thrownaway[data.thrownaway.length - 1];
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
            name: 'Row',
            axisName: 'Row'
          }
        ],
        series: [
          {
            type: 'line',
            name: 'Processed',
            data: data.processed,
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
          },
          {
            type: 'line',
            name: 'Unparseable',
            data: data.unparseable,
            connectNulls: true,
            showAllSymbol: true,
            symbol: 'none',
            sampling: 'max',
            itemStyle: {
              normal: {
                color: '#f2f1f8'
              }
            },
            smooth: true
          },
          {
            type: 'line',
            name: 'ThrownAway',
            data: data.thrownaway,
            connectNulls: true,
            showAllSymbol: true,
            symbol: 'none',
            sampling: 'max',
            itemStyle: {
              normal: {
                color: '#666eb2'
              }
            },
            smooth: true
          }
        ]
      };
      const chartobj = echarts.init(this._rowChartElmRef.nativeElement, 'exntu');
      chartobj.setOption(chartOps, false);
    });

}

  private _getSupervisorLag(fromDate?:string): void {
    if (_.isNil(fromDate)) {
      fromDate = this._getFromDate('1HOUR');
    }
    const queryParam: any =
      {
        monitoringTarget : {
          metric: Engine.MonitoringTarget.SUPERVISOR_LAG,
          datasource: this.dataSource
        },
        fromDate: fromDate,
        toDate: moment().utc().format('YYYY-MM-DDTHH:mm:ss')
      };

    this.engineService.getMonitoringStream(queryParam).then((data) => {
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
            name: 'Value',
            axisName: 'Value'
          }
        ],
        series: [
          {
            type: 'line',
            name: 'LAG',
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
      const chartobj = echarts.init(this._lagChartElmRef.nativeElement, 'exntu');
      chartobj.setOption(chartOps, false);
    });
  }

  private _getFromDate(duration:string) {
    if ('1DAY' === duration) {
      return moment().subtract(1, 'days').utc().format('YYYY-MM-DDTHH:mm:ss');
    } else if ('7DAYS' === duration) {
      return moment().subtract(7, 'days').utc().format('YYYY-MM-DDTHH:mm:ss');
    } else if ('30DAYS' === duration) {
      return moment().subtract(30, 'days').utc().format('YYYY-MM-DDTHH:mm:ss');
    } else {
      return moment().subtract(1, 'hours').utc().format('YYYY-MM-DDTHH:mm:ss');
    }
  }

}
