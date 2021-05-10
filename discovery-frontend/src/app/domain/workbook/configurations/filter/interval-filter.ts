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

import {Filter} from './filter';
import {ByTimeUnit, GranularityType, TimeUnit} from '../field/timestamp-field';

export class IntervalFilter extends Filter {
  /**
   * 기간을 설정하는 방식 정의 (범위, 최근)
   */
  public selector: IntervalSelectorType = IntervalSelectorType.RANGE;

  /**
   * 다중 시간 범위를 설정시, selector 가 'RANGE' 인 경우 해당
   */
  public intervals: string[];

  /**
   * From, selector 가 'RANGE' 인 경우 해당
   */
  public startDate: string;

  /**
   * To, selector 가 'RANGE' 인 경우 해당
   */
  public endDate: string;

  /**
   * 반복 Rule 설정, selector 가 'RANGE' 인 경우 해당
   */
  public rrule: string;

  /**
   * selector 가 'RELATIVE' 인 경우 해당 - 입력 형식
   */
  public relInputType: IntervalRelativeInputType;

  /**
   * selector 가 'RELATIVE' 인 경우 해당 - 시점 형식
   */
  public timeType: IntervalRelativeTimeType;

  /**
   * selector 가 'RELATIVE' 및 'All'의 Candidate 인 경우 해당 - 기간 형식
   */
  public timeUnit: TimeUnit;
  public byTimeUnit: ByTimeUnit;

  /**
   * selector 가 'RELATIVE' 인 경우 해당 - 입력 값
   */
  public relValue: number;

  /**
   * 시간 범위 설정시 사용한 시간 포맷
   */
  public format: string;

  // Locale locale;
  public locale: any;

  // 선택 값(목록) 정보
  public valueList: any[];

  // 목록 값(목록) 정보
  public candidateValues: any[];

  // 불연속 여부
  public discontinuous: boolean;

  // Granularity
  public granularity: GranularityType;

  // for UI
  public maxTime: Date;
  public minTime: Date;
  public timeUnitUI: any;
  public intervalsUI: any;
  public isCurrentTime: boolean = false;

  constructor(field: string) {
    super();
    this.type = 'interval';
    this.field = field;
  }

}

/**
 * 설정 타입 (기간설정 - RANGE, 최근 기간 설정 - RELATIVE)
 */
export enum IntervalSelectorType {
  ALL = 'ALL',
  RANGE = 'RANGE',
  RELATIVE = 'RELATIVE'
}

/**
 * 기준 시간 설정시 시간 단위
 */
export enum IntervalTimeUnit {
  YEARS = 'YEARS',
  QUARTERS = 'QUARTERS',
  MONTHS = 'MONTHS',
  WEEKS = 'WEEKS',
  DAYS = 'DAYS',
  HOURS = 'HOURS',
  MINUTES = 'MINUTES',
  SECONDS = 'SECONDS'
}

/**
 * Relative 입력 형식
 */
export enum IntervalRelativeInputType {
  BUTTON = 'BUTTON',
  INPUT = 'INPUT'
}

/**
 * Relative 시점 형식
 */
export enum IntervalRelativeTimeType {
  LAST = 'LAST',
  CURRENT = 'CURRENT',
  NEXT = 'NEXT'
}
