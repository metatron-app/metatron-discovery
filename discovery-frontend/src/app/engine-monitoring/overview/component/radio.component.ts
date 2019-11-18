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
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {CommonUtil} from '../../../common/util/common.util';
import {Engine} from '../../../domain/engine-monitoring/engine';

@Component({
  selector: '[overview-radio]',
  templateUrl: './radio.component.html',
  host: { '[class.ddp-wrap-edit3]': 'true' }
})
export class RadioComponent extends AbstractComponent implements OnInit, OnDestroy {

  public readonly UUID = CommonUtil.getUUID();
  public readonly RADIO_BUTTON_NAME_PREFIX = 'overview-radio-button';
  public readonly MONITORING_STATUS = Engine.MonitoringStatus;

  @Input()
  public selectedMonitoringStatus: Engine.MonitoringStatus = this.MONITORING_STATUS.ALL;

  @Output('changeValue')
  private readonly changeEvent: EventEmitter<Engine.MonitoringStatus> = new EventEmitter();

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

  public selectType(btnType: Engine.MonitoringStatus) {
    this.changeEvent.emit(btnType);
  }
}
