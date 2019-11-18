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
import {LocalStorageConstant} from "../../../common/constant/local-storage.constant";
import {EngineMonitoringData} from "../../../common/value/engine-monitoring.data.value";

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

  public engineMonitoringData: EngineMonitoringData = new EngineMonitoringData();

  @Output('changeValue')
  private readonly changeEvent: EventEmitter<string> = new EventEmitter();

  public isShowIntervalList: boolean;
  public currentDate: string;
  public labelRefresh: string;

  private _interval: any;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    this._loadEngineMonitoringDataFromLocalStorage();
    this.changeDuration();
    this._setRefresh();
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

  public changeDuration(type?:string) {
    if (!_.isNil(type)) {
      this.engineMonitoringData.duration = type;
      this._setEngineMonitoringDataToLocalStorage();
    }
    this._setCurrentDate();
    this.changeEvent.emit(this.engineMonitoringData.duration);
  }

  public changeRefresh(interval:number) {
    this._setRefresh(interval);
    this.isShowIntervalList = false;
  }

  private _setCurrentDate() {
    this.currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
  }

  private _loadEngineMonitoringDataFromLocalStorage() {
    const localEngineMonitoringData = CommonUtil.getLocalStorage(LocalStorageConstant.KEY.ENGINE_MONITORING);
    if (!_.isNil(localEngineMonitoringData)) {
      this.engineMonitoringData = JSON.parse(localEngineMonitoringData);
    }
  }

  private _setRefresh(refresh?:number) {
    if (!_.isNil(refresh)) {
      this.engineMonitoringData.refresh = refresh;
      this._setEngineMonitoringDataToLocalStorage();
      this._clearInterval();
    }

    if (this.engineMonitoringData.refresh != 0) {
      this._interval = setInterval(() => {
        this.changeDuration();
      }, this.engineMonitoringData.refresh * 1000);
    }

    this._setLabelRefresh();
  }

  private _clearInterval() {
    if (!_.isNil(this._interval)) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
  }

  private _setLabelRefresh() {
    if (this.engineMonitoringData.refresh == 5) {
      this.labelRefresh = '5s';
    } else if (this.engineMonitoringData.refresh == 10) {
      this.labelRefresh = '10s';
    } else if (this.engineMonitoringData.refresh == 30) {
      this.labelRefresh = '30s';
    } else if (this.engineMonitoringData.refresh == 60) {
      this.labelRefresh = '1m';
    } else {
      this.labelRefresh = 'Off';
    }
  }

  private _setEngineMonitoringDataToLocalStorage() {
    CommonUtil.setLocalStorage(LocalStorageConstant.KEY.ENGINE_MONITORING, JSON.stringify(this.engineMonitoringData));
  }

}
