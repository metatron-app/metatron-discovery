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

import { Widget, WidgetConfiguration } from './widget';
import { Filter } from '../../workbook/configurations/filter/filter';
import { Dashboard } from '../dashboard';

export class FilterWidget extends Widget {

  public configuration:FilterWidgetConfiguration;

  public parent?: FilterWidget; // for UI

  constructor(filter: Filter, dashboard:Dashboard) {
    super();
    // this.id = filter.type + '_' + filter.field;
    this.name = filter.field;
    this.type = 'filter';
    this.configuration = new FilterWidgetConfiguration(filter);
    this.dashBoard = dashboard;
  }

  public getConfiguration(): FilterWidgetConfiguration {
    return this.configuration as FilterWidgetConfiguration;
  }

} // Class - FilterWidget

export class FilterWidgetConfiguration extends WidgetConfiguration {
  public filter: Filter;

  constructor(filter: Filter) {
    super();
    this.type = 'filter';
    this.filter = filter;
  }

} // Class - FilterWidgetConfiguration
