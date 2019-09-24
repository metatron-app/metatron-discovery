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
import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {EngineService} from "../../service/engine.service";
import {Engine} from "../../../domain/engine-monitoring/engine";
import * as _ from 'lodash';

@Component({
  selector: 'druid-cluster-information',
  templateUrl: './druid-cluster-information.component.html'
})
export class DruidClusterInformationComponent extends AbstractPopupComponent implements OnInit, OnDestroy, AfterViewInit {

  public isShow: boolean;

  public monitorings: Engine.Monitoring[] = [];
  public configs: any;
  public configKeys: any;

  public selectTab: string;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public show() {
    this._selfShow();
  }

  public selfHide() {
    this.isShow = false;
  }

  public getServerInformation(name) {
    const monitoring = this.monitorings.find(item => item.type === name);
    return _.isNil(monitoring) ? '' : monitoring.hostname + ' (' + monitoring.port + ')';
  }

  public changeTab(name) {
    this._getConfig(name);
  }

  private _selfShow() {
    this._getConfig('common');
    this.isShow = true;
  }

  private _getConfig(name) {
    this.selectTab = name;
    this.engineService.getInformation(name)
      .then(result => {
        this.monitorings = result.cluster;
        this.configs = result.configs;
        this.configKeys = Object.keys(this.configs).sort();
      });
  }
}
