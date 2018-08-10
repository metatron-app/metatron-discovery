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

export class InclusionFilter extends Filter {

  // 선택 값(목록) 정보
  public valueList: any[];

  // 목록 값(목록) 정보
  public candidateValues: any[];

  // UI 에 표시될 선택표시 유형 추가 (Optional)
  public selector: InclusionSelectorType = InclusionSelectorType.SINGLE_LIST;

  // User-Defined 타입인 경우 정의된 값 정보 (Optional)
  public definedValues: string[];

  // InclusionFilter 값을 선택하기전 수행 필터 정보 (Optional)
  public preFilters: AdvancedFilter[];

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

export class Candidate {
  public name: string;
  public count: number;
  public isDefinedValue: boolean = false;
  // 눈표시 여부
  public isShow: boolean = false;
}

export enum InclusionSelectorType {
  SINGLE_LIST = <any>'SINGLE_LIST',
  SINGLE_COMBO = <any>'SINGLE_COMBO',
  MULTI_LIST = <any>'MULTI_LIST',
  MULTI_COMBO = <any>'MULTI_COMBO',
  USER_DEFINED = <any>'USER_DEFINED'
}

