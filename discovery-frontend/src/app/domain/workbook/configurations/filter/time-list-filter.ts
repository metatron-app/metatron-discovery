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
import {TimeFilter} from './time-filter';
import {Field} from '@domain/datasource/datasource';

export class TimeListFilter extends TimeFilter {

  public valueList: string[];
  public candidateValues: string[];

  constructor(field: Field) {
    super(field);
    this.type = 'time_list';
  }

  public toServerSpec() {
    const spec = super.toServerSpec();
    return _.merge(spec, {
      valueList: this.valueList,
      candidateValues: this.candidateValues
    });
  } // function - toServerSpec
}
