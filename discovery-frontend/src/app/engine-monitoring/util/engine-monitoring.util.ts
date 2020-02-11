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
import * as _ from 'lodash';
import {Engine} from "../../domain/engine-monitoring/engine";
import {TaskStatus, TaskType} from "../../domain/engine-monitoring/task";

declare const moment: any;

export class EngineMonitoringUtil {

  public static convertLocalTime(date: string, format?: string) {
    if (_.isNil(format)) {
      format =  'YYYY-MM-DD HH:mm';
    }
    return moment.utc(date).local().format(format)
  }

  public static tooltipFormatter(params) {
    return this.convertLocalTime(params[0].axisValue) + '<br/>' + params[0].marker + params[0].seriesName + ' : ' + params[0].value;
  }

  /**
   * Create labels with five node types.
   *  - broker, coordinator, historical, overlord, middleManager
   */
  public static convertTypeLabel(type: Engine.NodeType) {
    switch (type) {
      case Engine.NodeType.BROKER:
        return this._toCamelCase(type);
      case Engine.NodeType.COORDINATOR:
        return this._toCamelCase(type);
      case Engine.NodeType.HISTORICAL:
        return this._toCamelCase(type);
      case Engine.NodeType.OVERLORD:
        return this._toCamelCase(type);
      case Engine.NodeType.MIDDLE_MANAGER:
        return this._toCamelCase(type);
      default:
        return type;
    }
  }

  public static getDurationLabel(duration:string) {
    if ('1DAY' === duration) {
      return 'Last 1 day';
    } else if ('7DAYS' === duration) {
      return 'Last 7 days';
    } else if ('30DAYS' === duration) {
      return 'Last 30 days';
    } else {
      return 'Last 1 hour';
    }
  }

  public static getTaskStatusClass(taskStatus: TaskStatus): string {
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

  public static getTaskTypeTranslate(taskType: TaskType): string {
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

  public static highlightSearchText(name, searchText): string {
    if (_.isNil(searchText) || searchText.trim() === '') {
      return name;
    } else {
      return name.replace(new RegExp('(' + searchText + ')'), '<span class="ddp-txt-search type-search">$1</span>');
    }
  } // function - highlightSearchText

  /**
   * Utility function to change only the first letter to uppercase
   */
  private static _toCamelCase(type: Engine.NodeType) {

    if (_.isNil(type)) {
      return '';
    }

    if (type.length === 0) {
      return type;
    }

    return `${type.charAt(0).toLocaleUpperCase()}${type.substring(1, type.length)}`;
  }

}
