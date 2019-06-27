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

import { Filter } from './filter';
import { AdvancedFilter } from './advanced-filter';
import { DIRECTION } from '../sort';

export class InclusionFilter extends Filter {

  // Selected Item List
  public valueList: any[];

  // Add the type to be displayed in the UI (Optional)
  public selector: InclusionSelectorType = InclusionSelectorType.SINGLE_LIST;

  // About list value (list)
  public candidateValues: any[];

  // Information defined for User-Defined type (Optional)
  public definedValues: string[];

  // Perform filter before selecting InclusionFilter value (Optional)
  public preFilters: AdvancedFilter[];

  // Sort condition (Optional, for UI)
  public sort:InclusionItemSort;

  // Only show selected item (Optional, for UI)
  public showSelectedItem:boolean;

  constructor(field: string, valueList: string[] = []) {
    super();
    this.type = 'include';
    this.field = field;
    this.valueList = valueList;
  }

  // forUI
  public selectionRange: string = 'SINGLE';
  public selectionComponent: string = 'COMBO';
  public customValue: string = '';
  public searchText: string = '';
  public pageNum: number = 0;
}

export class InclusionItemSort {
  public by:InclusionSortBy;
  public direction:DIRECTION;

  constructor( by:InclusionSortBy, direction:DIRECTION ) {
    this.by = by;
    this.direction = direction;
  }
}

export class Candidate {
  public name: string;
  public count: number;
  public isDefinedValue: boolean = false;
  public isShow: boolean = false;   // Whether icon is displayed
  public isTemporary: boolean = false;
}

export enum InclusionSortBy {
  COUNT = <any>'COUNT',
  TEXT = <any>'TEXT',
  NUMERIC = <any>'NUMERIC',
  DATE = <any>'DATE'
}

export enum InclusionSelectorType {
  SINGLE_LIST = <any>'SINGLE_LIST',
  SINGLE_COMBO = <any>'SINGLE_COMBO',
  MULTI_LIST = <any>'MULTI_LIST',
  MULTI_COMBO = <any>'MULTI_COMBO',
  USER_DEFINED = <any>'USER_DEFINED'
}

