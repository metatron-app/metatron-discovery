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
import {Task, TaskStatus, TaskType} from "../../../../domain/engine-monitoring/task";
import {Alert} from "../../../../common/util/alert.util";
import {Location} from "@angular/common";
import * as _ from "lodash";
import {Engine} from "../../../../domain/engine-monitoring/engine";

declare let echarts: any;
declare let moment: any;

@Component({
  selector: 'app-detail-task',
  templateUrl: './task-detail.component.html',
  styles: ['.ddp-ui-datadetail.type-detail .ddp-wrap-log .ddp-box-log {overflow: auto; white-space: pre-wrap;}',
          '.ddp-ui-datadetail.type-detail .ddp-box-log-option .ddp-dl-option dd .ddp-box-status {visibility: hidden;}']
})
export class TaskDetailComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(private _location: Location,
              protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  // scroll elements
  @ViewChild('scrollElf')
  private _scrollElements: ElementRef;

  @ViewChild('row') private _rowChartElmRef: ElementRef;

  public showShutdownConfirm: boolean = false;

  public task: Task = new Task();
  public taskLog: string;

  public processed: any;
  public unparseable: any;
  public thrownaway: any;

  public isShowRowDuration: boolean;
  public selectedRowDuration: string = '1HOUR';

  public rowData: any;

  private _taskId: string;
  private _rowChart: any;

  public ngOnInit() {
    this.loadingShow();
    this.activatedRoute.params.subscribe((params) => {
      this._taskId = params['taskId'];
    });

    this._getTaskDetail();
    this._getTaskLog(-8192);

    super.ngOnInit();
    this.loadingHide();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();

    sessionStorage.removeItem('IS_LOCATION_BACK_TASK_LIST');
  }

  /**
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    if (!_.isNil(this._rowChart)) {
      this._rowChart.resize();
    }
  }

  public prevTaskList(): void {
    if ('TRUE' === sessionStorage.getItem('IS_LOCATION_BACK_TASK_LIST')) {
      this._location.back();
    } else {
      this.router.navigate(['//management/engine-monitoring/ingestion/task']);
    }
  }

  public refreshLog(): void {
    this._getTaskLog(-8192);
  }

  public confirmShutdownTaskOpen(): void {
    this.showShutdownConfirm = true;
  }

  public shutdownTask(): void {
    this.showShutdownConfirm = false;
    this.engineService.shutdownTaskById(this._taskId).then((data) => {
      if (data) {
        this._getTaskDetail();
      } else {
        Alert.error(this.translateService.instant('msg.engine.monitoring.ingestion.task.shutdown.confirm.fail'));
      }
    })
  }

  public changeRowDuration(duration:string) {
    this.isShowRowDuration = false;
    this.loadingShow();
    this.selectedRowDuration = duration;
    const fromDate = this._getFromDate(duration);
    this._getTaskRow(fromDate);
    setTimeout(() => {
      this.loadingHide();
    }, 300);
  }

  public getStatusClass(taskStatus: TaskStatus): string {
    if (TaskStatus.PENDING === taskStatus) {
      return 'ddp-pending';
    } else if (TaskStatus.WAITING === taskStatus) {
      return 'ddp-waiting';
    } else if (TaskStatus.RUNNING === taskStatus) {
      return 'ddp-running';
    } else if (TaskStatus.SUCCESS === taskStatus) {
      return 'ddp-success';
    } else if (TaskStatus.FAILED === taskStatus) {
      return 'ddp-fail';
    } else {
      return '';
    }
  }

  public getTypeTranslate(taskType: TaskType): string {
    if (TaskType.INDEX === taskType) {
      return 'index';
    } else if (TaskType.KAFKA === taskType) {
      return 'kafka';
    } else if (TaskType.HADOOP === taskType) {
      return 'hadoop';
    } else {
      return '';
    }
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

  public logScrollDown() {
    this._scrollElements.nativeElement.scrollTop = this._scrollElements.nativeElement.scrollHeight;
  }

  public changeRowCheckbox(event: MouseEvent) {
    const value = $(event.target).val();
    if (value === 'All') {
      if ($(event.target).is(':checked')) {
        $('input[name="row"]').prop('checked', 'checked');
      } else {
        $('input[name="row"]').prop('checked', '');
      }
    } else {
      if ($(event.target).is(':checked')) {
        if ($('input[name="row"]:checked').length === 3) {
          $('input[name="row"]').prop('checked', 'checked');
        }
      } else {
        $('input[value="All"]').prop('checked', '');
      }
    }

    this._getTaskRow();
  }

  public logNewWindow() {
    const popUrl = '/api/monitoring/ingestion/task/'+this._taskId+'/log';
    window.open(popUrl, '_blank');
  }

  public get isCompletedTask(): boolean {
    return this.task.status != TaskStatus.SUCCESS && this.task.status != TaskStatus.FAILED;
  }

  public get isKafkaTask(): boolean {
    return TaskType.KAFKA === this.task.type;
  }

  private _getTaskDetail(): void {
    this.engineService.getTaskById(this._taskId).then((data) => {
      this.task = data;
      if (TaskType.KAFKA === this.task.type) {
        this._getTaskRow();
      }
    }).catch((error) => {
      this.commonExceptionHandler(error);
    });
  }

  private _getTaskLog(offset?: number): void {
    this.engineService.getTaskLogById(this._taskId, offset).then((data) => {
      this.taskLog = data;
      // detect changes
      this.safelyDetectChanges();
      // scroll to bottom
      this._scrollElements.nativeElement.scrollTop = this._scrollElements.nativeElement.scrollHeight;
    }).catch((error) => {
      this.commonExceptionHandler(error);
    });
  }

  private _getTaskRow(fromDate?:string): void {
    if (_.isNil(fromDate)) {
      fromDate = this._getFromDate('1HOUR');
    }
    const queryParam: any =
      {
        monitoringTarget : {
          metric: Engine.MonitoringTarget.TASK_ROW,
          taskId: this._taskId
        },
        fromDate: fromDate,
        toDate: moment().utc().format('YYYY-MM-DDTHH:mm:ss')
      };

    this.engineService.getMonitoringData(queryParam).then((data) => {
      this.rowData = data;
      this.processed = data.processed[data.processed.length - 1];
      this.unparseable = data.unparseable[data.unparseable.length - 1];
      this.thrownaway = data.thrownaway[data.thrownaway.length - 1];
      const series = [];
      if (!_.isNil(this._rowChart)) {
        this._rowChart.clear();
      }
      $('input[name="row"]:checked').each(function(){
        if ($(this).val() === 'Processed') {
          series.push({
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
          });
        } else if ($(this).val() === 'Unparseable') {
          series.push({
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
          });
        } else if ($(this).val() === 'ThrownAway') {
          series.push({
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
          });
        }

      });
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
        series: series
      };

      if (series.length > 0) {
        if (_.isNil(this._rowChart)) {
          this._rowChart = echarts.init(this._rowChartElmRef.nativeElement, 'exntu');
        }
        this._rowChart.setOption(chartOps, false);
      }
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
