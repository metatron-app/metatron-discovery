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
import {Task, TaskStatus, TaskType} from "../../../../domain/engine-monitoring/task";
import {Alert} from "../../../../common/util/alert.util";
import {Location} from "@angular/common";

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

  public showShutdownConfirm: boolean = false;

  public task: Task = new Task();
  public taskLog: string;
  private _taskId: string;

  public ngOnInit() {
    this.loadingShow();
    this.activatedRoute.params.subscribe((params) => {
      this._taskId = params['taskId'];
    });

    this._getTaskDetail();

    super.ngOnInit();
    this.loadingHide();

  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public prevTaskList(): void {
    this._location.back();
  }

  public refreshTask(): void {
    this._getTaskDetail();
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

  public get isCompletedTask(): boolean {
    return this.task.status != TaskStatus.SUCCESS && this.task.status != TaskStatus.FAILED;
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

  private _getTaskDetail(): void {
    this.engineService.getTaskById(this._taskId).then((data) => {
      this.task = data;
      this.engineService.getTaskLogById(this._taskId).then((data) => {
        this.taskLog = data;
        // detect changes
        this.safelyDetectChanges();
        // scroll to bottom
        this._scrollElements.nativeElement.scrollTop = this._scrollElements.nativeElement.scrollHeight;
      }).catch((error) => {
        this.commonExceptionHandler(error);
      });
    })
  }

}
