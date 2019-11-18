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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {EngineService} from "../../../service/engine.service";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";

@Component({
  selector: 'app-detail-worker',
  templateUrl: './worker-detail.component.html'
})
export class WorkerDetailComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(private _location: Location,
              protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  public worker: any;
  private _host: string;

  public ngOnInit() {
    this.loadingShow();
    this.activatedRoute.params.subscribe((params) => {
      this._host = params['host'];
    });

    this._getWorkerDetail();

    super.ngOnInit();
    this.loadingHide();

  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public prevWorkerList(): void {
    this._location.back();
  }

  public getCapacityPercent(): string {
    return Math.round(this.worker.currCapacityUsed*100/this.worker.worker.capacity) +'%';
  }

  private _getWorkerDetail(): void {
    this.engineService.getWorkerList().then((data) => {
      const workerList = data.filter(item => item.worker.host === this._host);
      this.worker = workerList.length == 1 ? workerList[0] : {};
    })
  }

}
