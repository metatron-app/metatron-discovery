/*
 *
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

import { CriterionKey } from './listCriterion';

export class ListFilter {

  constructor(filterKey: any, filterName: any, filterValue: any) {
    this.filterKey = filterKey;
    this.filterName = filterName;
    this.filterValue = filterValue;
  }

  // key
  public filterKey: string;
  // name
  public filterName: string;
  // value
  public filterValue: string;
  // sub key
  public filterSubKey: string;
  // sub value
  public filterSubValue: string;
  // criterion Key
  public criterionKey: CriterionKey;
}
