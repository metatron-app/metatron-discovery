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
  Injector, Input,
  OnDestroy,
  OnInit, Output
} from '@angular/core';
import {AbstractComponent} from "../../common/component/abstract.component";
import {EngineService} from "../service/engine.service";
import * as _ from "lodash";
import {Alert} from "../../common/util/alert.util";

declare let moment: any;

@Component({
  selector: 'app-rule-datasource',
  templateUrl: './datasource-rule.component.html',
  styles: ['.ddp-pop-schema .ddp-form-table {min-height: 100%}',
          '.ddp-icon-new {display: none;}',
          '.type-add .ddp-icon-new {display: inline-block;}']
})
export class DatasourceRuleComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  private ruleTypeList: any[] = ['loadForever', 'loadByPeriod', 'loadByInterval', 'dropForever', 'dropByPeriod', 'dropByInterval']

  @Input('datasourceId')
  public datasourceId: string;

  @Input('datasourceRule')
  public datasourceRule: any[];
  public datasourceCopyRule: any[];

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

  public open() {
    this.datasourceCopyRule = _.cloneDeep(this.datasourceRule);
    this.datasourceCopyRule.forEach(rule => {
      rule['selectBox'] = false;
      rule['durationString'] = '';
    });

    this.isShow = true;
  }

  public close() {
    this.isShow = false;
  }

  public done() {
    if (this._isEnableDone()) {
      const paramRule = _.cloneDeep(this.datasourceCopyRule);
      paramRule.forEach(rule => {
        delete rule['selectBox'];
        delete rule['durationString'];
      });
      this.engineService.setDatasourceRule(this.datasourceId, paramRule).then(() => {
        this.changeEvent.emit();
        this.close();
      });
    }
  }

  public onClickRule(type, rule) {
    rule.type = type;
    if (!_.isNil(rule['tieredReplicants'])) {
      delete rule['tieredReplicants'];
    }

    if (type.indexOf('Period') > -1 && !_.isNil(rule['interval'])) {
      rule['period'] = rule['interval'];
      delete rule['interval'];
    }
    if (type.indexOf('Interval') > -1 && !_.isNil(rule['period'])) {
      rule['interval'] = rule['period'];
      delete rule['period'];
    }
    if (type.indexOf('Forever') > -1) {
      if (!_.isNil(rule['interval'])) {
        delete rule['interval'];
      }
      if (!_.isNil(rule['period'])) {
        delete rule['period'];
      }
    }
  }

  public addRule() {
    this.datasourceCopyRule.push({selectBox : false, durationString : '', isNew : true});
  }

  public deleteRule(idx) {
    this.datasourceCopyRule.splice(idx, 1);
  }

  public onChangedDuration(text, rule) {
    rule.durationString = '';
    if (rule.type.indexOf('Period') > -1) {
      rule['period'] = text;
      if (rule['period'] === moment.duration(rule['period']).toISOString()) {
        rule.durationString = moment.duration(rule['period']).locale("en").humanize();
      }
    } else if (rule.type.indexOf('Interval') > -1) {
      rule['interval'] = text;
      if (text.split('/').length == 2) {
        if (moment.duration(moment(text.split('/')[1]).diff(text.split('/')[0])).asMilliseconds() > 0) {
          rule.durationString = moment.duration(moment(text.split('/')[1]).diff(text.split('/')[0])).locale("en").humanize();
        }
      }
    }
  }

  private _isEnableDone(): boolean {
    let result = true;
    for (let idx=0; idx<this.datasourceCopyRule.length; idx++) {
      const rule = this.datasourceCopyRule[idx];
      if (_.isNil(rule.type)) {
        Alert.warning(this.translateService.instant('msg.engine.monitoring.alert.ds.retention.type'));
        result = false;
        break;
      }
      if (rule.type.indexOf('Period') > -1) {
        if (!_.isNil(rule['period'])) {
          if (rule['period'] != moment.duration(rule['period']).toISOString()) {
            setTimeout(() => {
              $('input.ddp-input-typebasic')[idx].focus();
            }, 400);
            Alert.warning(this.translateService.instant('msg.engine.monitoring.alert.ds.retention.period'));
            result = false;
            break;
          }
        }
      } else if (rule.type.indexOf('Interval') > -1) {
        const interval = rule['interval'];
        if (interval.split('/').length == 2) {
          if (moment.duration(moment(interval.split('/')[1]).diff(interval.split('/')[0])).asMilliseconds() > 0) {
            continue;
          }
        }
        setTimeout(() => {
          $('input.ddp-input-typebasic')[idx].focus();
        }, 400);
        Alert.warning(this.translateService.instant('msg.engine.monitoring.alert.ds.retention.interval'));
        result = false;
        break;
      }
    }
    return result;
  }

}
