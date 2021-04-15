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

import {ByTimeUnit, TimeUnit} from '../field/timestamp-field';
import {Filter} from './filter';
import {Field} from '@domain/datasource/datasource';

export class TimeFilter extends Filter {
  public discontinuous?: boolean;
  public timeUnit?: TimeUnit;
  public byTimeUnit?: ByTimeUnit;

  // For UI - Start
  public clzField: Field;

  public constructor(field: Field) {
    super();
    this.clzField = field;
    this.discontinuous = false;

    this.field = field.name;
    this.ref = field.ref;
    this.dataSource = field.dataSource;
    // this.ui.masterDsId = field.uiMasterDsId;
    // this.ui.dsId = field.dsId;

    (-1 < field.filteringSeq) && (this.ui.filteringSeq = field.filteringSeq + 1);
    (field.filteringOptions) && (this.ui.filteringOptions = field.filteringOptions);
  }

  public toServerSpec() {
    return {
      type: this.type,
      field: this.field,
      discontinuous: this.discontinuous,
      timeUnit: this.timeUnit,
      byTimeUnit: this.byTimeUnit,
    };
  }
}
