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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {Engine} from "../../../domain/engine-monitoring/engine";

@Component({
  selector: 'node-tooltip',
  templateUrl: './node-tooltip.component.html'
})
export class NodeTooltipComponent extends AbstractComponent implements OnInit, OnDestroy {

  public isShow: boolean;
  public left: string;
  public top: string;

  public monitoring: Engine.Monitoring = new Engine.Monitoring();

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
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
    this.isShow = false;
  }

  public setEngineMonitoring(engineMonitoring: Engine.Monitoring, left: number, top: number) {
    this.monitoring = engineMonitoring;
    this.left = left + 'px';
    this.top = top + 'px';
    this.isShow = true;
  }

}
