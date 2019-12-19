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
  ElementRef, EventEmitter,
  Injector,
  OnDestroy,
  OnInit, Output
} from '@angular/core';
import {AbstractComponent} from "../../common/component/abstract.component";
import {EngineService} from "../service/engine.service";
import * as _ from "lodash";
import {StringUtil} from "../../common/util/string.util";

@Component({
  selector: 'app-column-datasource',
  templateUrl: './datasource-column.component.html',
  styles: ['.ddp-ui-flex-popup.type-scheme .ddp-pop-contents {height:663px;}']
})
export class DatasourceColumnComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  public dimensions: string[];
  public metrics: string[];

  public totalColumns: any[] = [];
  public columns: any[] = [];

  public totalCount = 0;

  public showRole: string;
  public isShow: boolean;

  @Output('changeRetention') public changeEvent: EventEmitter<any> = new EventEmitter();

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public open(dimensions, metrics) {
    this.totalColumns = [];
    this.dimensions = dimensions.split(',');
    this.metrics = metrics.split(',');
    this.dimensions.forEach(dimension => {
      if (StringUtil.isNotEmpty(dimension)) {
        this.totalColumns.push({value: dimension, type: 'dimension'});
      }
    });
    this.metrics.forEach(metric => {
      if (StringUtil.isNotEmpty(metric)) {
        this.totalColumns.push({value: metric, type: 'metric'});
      }
    });

    this.columns = _.cloneDeep(this.totalColumns);

    this.totalCount = (dimensions === '' ? 0 : this.dimensions.length) + (metrics === '' ? 0 : this.metrics.length);

    this.isShow = true;
  }

  public close() {
    this.isShow = false;
  }

  public onChangeRole(role) {
    if (role === 'dimension') {

    } else if (role === 'metric') {

    }
  }

  public getColumnTypeLabel(type) {
    if (type === 'dimension') {
      return this.translateService.instant('msg.comm.name.dim');
    } else if (type === 'metric') {
      return this.translateService.instant('msg.comm.name.mea');
    }
  }

}
