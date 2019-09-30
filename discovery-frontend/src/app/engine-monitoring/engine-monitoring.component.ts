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
import {AbstractComponent} from '../common/component/abstract.component';
import {ActivatedRoute} from '@angular/router';
import {Engine} from '../domain/engine-monitoring/engine';

@Component({
  selector: 'engine-monitoring',
  templateUrl: './engine-monitoring.component.html'
})
export class EngineMonitoringComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  public isSelectedContent: Engine.Content;
  public selectedIngestionContentType: Engine.IngestionContentType;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute) {
    super(elementRef, injector);
  }

  public ngOnInit() {

    super.ngOnInit();

    this.subscriptions.push(
      this.activatedRoute.data.subscribe((params: Engine.MonitoringRouterParams) => {
        this.isSelectedContent = new Engine.Content(params.type);
        this.selectedIngestionContentType = params.group;
      })
    );
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }
}
