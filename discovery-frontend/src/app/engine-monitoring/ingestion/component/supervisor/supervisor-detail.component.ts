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
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {EngineService} from "../../../service/engine.service";
import {ActivatedRoute} from "@angular/router";
import {Engine} from "../../../../domain/engine-monitoring/engine";
import {Modal} from "../../../../common/domain/modal";
import {Alert} from "../../../../common/util/alert.util";
import {Location} from "@angular/common";
import * as _ from 'lodash';
import {Task, TaskType} from "../../../../domain/engine-monitoring/task";
import {EngineMonitoringUtil} from "../../../util/engine-monitoring.util";

declare let echarts: any;
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

  @ViewChild('lag') private _lagChartElmRef: ElementRef;

  public supervisorId;
  public supervisorPayload: any = {};

  public dataSource;
  public task: Task = new Task();

  private _lagChart: any;

  public isShowLagDuration: boolean;
  public selectedLagDuration: string = '1HOUR';
  public showConfirm: boolean = false;
  public confirmModal: Modal;

  public isShowTaskPopup: boolean;

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

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    if (!_.isNil(this._lagChart)) {
      this._lagChart.resize();
    }
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
    return EngineMonitoringUtil.getDurationLabel(duration);
  }

  public getTypeTranslate(taskType: TaskType): string {
    return EngineMonitoringUtil.getTaskTypeTranslate(taskType);
  }

  public showTaskPopup(taskId: string) {
    this.engineService.getTaskById(taskId).then((data) => {
      this.task = data;
      this.isShowTaskPopup = true;
    }).catch((error) => {
      this.commonExceptionHandler(error);
    });
  }

  public goToTask(taskId: string) {
    this.router.navigate(['/management/engine-monitoring/ingestion/task', taskId]).then();
  }

  private _getSupervisorDetail(): void {
    this.engineService.getSupervisorStatus(this.supervisorId).then((data) => {
      this.supervisorPayload = data.payload;
      this.dataSource = this.supervisorPayload.dataSource;
      this._getSupervisorLag();
    })
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

    this.engineService.getMonitoringData(queryParam).then((data) => {
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
            top: 30,
            bottom: 0,
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
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Value',
            axisName: 'Value',
            axisLine: {
              lineStyle: {
                color: '#f2f1f8'
              }
            }
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
      if (_.isNil(this._lagChart)) {
        this._lagChart = echarts.init(this._lagChartElmRef.nativeElement, 'exntu');
      }
      this._lagChart.setOption(chartOps, false);
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
