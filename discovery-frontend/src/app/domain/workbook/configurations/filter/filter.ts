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

export abstract class Filter {

  /**
   * 멀티 데이터 소스 사용 필터링 필드를 가지고 있는 데이터소스 엔진명 지정
   *
   */
  public dataSource: string;

  /**
   *  필터링 대상 필드명
   */
  public field: string;

  /**
   * 필드 참조 대상(데이터소스 ID, CustomField Name)
   */
  public ref: string;

  /**
   * 필터 타입
   */
  public type: string;

  // for UI
  public ui: {
    // masterDsId?:string;                // 필드의 마스터 데이터소스 아이디 ( 조인된 데이터소스의 필드의 경우 )
    // dsId?: string;                     // 필드의 데이터소스 아이디
    filteringSeq?: number,                // 필수/추천 필터의 순서
    filteringOptions?: FilteringOptions,   // 필터링 옵션
    importanceType?: string,              // 중요도 타입 general, recommended, essential, timestamp
    widgetId?: string,
  };

  protected constructor() {
    this.ui = {};
    this.ui.importanceType = 'general';
  }
}

/**
 * 필터링 옵션 구조체
 */
export class FilteringOptions {
  public allowSelectors: string[] = [];
  public defaultSelector: string;
  public type: FilteringOptionType;
}

/**
 * 필터링 옵션 타입 열거형
 */
export enum FilteringOptionType {
  INCLUSION = 'INCLUSION',
  // TODO INTERVAL 추후 지울것
  INTERVAL = 'INTERVAL',
  TIME = 'TIME'
}

