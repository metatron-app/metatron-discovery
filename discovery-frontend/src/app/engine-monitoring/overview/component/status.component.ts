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
import {Engine} from '../../../domain/engine-monitoring/engine';
import * as _ from "lodash";
import {CommonUtil} from "../../../common/util/common.util";

declare let moment: any;

@Component({
  selector: '[overview-status-view]',
  templateUrl: './status.component.html'
})
export class StatusComponent extends AbstractComponent implements OnInit, OnDestroy {

  @Input()
  public clusterStatus: Engine.Cluster.Status;

  @Input()
  public monitorings: Engine.Monitoring[];

  @Input()
  public clusterSize: any;

  @Input()
  public duration: string;

  @Output('changeValue')
  private readonly changeEvent: EventEmitter<string> = new EventEmitter();

  public currentDate: string;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    this.currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    this.changeDetect.detectChanges();
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public getServerInformation(name) {
    const monitoring = this.monitorings.find(item => item.type === name);
    return _.isNil(monitoring) ? '' : monitoring.hostname + ' (' + monitoring.port + ')';
  }

  public getClusterSize(): string {
    if (_.isNil(this.clusterSize)){
      return '';
    } else {
      $('.ddp-wrap-hover-layout .ddp-data-bar').css('width', Math.round(this.clusterSize.currSize/this.clusterSize.maxSize*100) +'%');
      return CommonUtil.formatBytes(this.clusterSize.currSize, 0) + ' / ' + CommonUtil.formatBytes(this.clusterSize.maxSize, 0);
    }
  }

  public changeStatus(type?:string) {
    if (!_.isNil(type)) {
      this.duration = type;
    }
    this.changeEvent.emit(this.duration);
  }

}
