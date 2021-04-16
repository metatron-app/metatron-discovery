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

import {Pivot} from '@domain/workbook/configurations/pivot';
import {Limit} from '@domain/workbook/configurations/limit';
import {Filter} from '@domain/workbook/configurations/filter/filter';
import {UserDefinedField} from '@domain/workbook/configurations/field/user-defined-field';
import {SeriesType} from '@common/component/chart/option/define/common';
import {TimeUnit} from '@domain/workbook/configurations/field/timestamp-field';
import {BoardDataSource} from '@domain/dashboard/dashboard';

export class Analysis {

  // 데이터 소스
  dataSource: BoardDataSource;

  // 글로벌 필터
  filters: Filter[];

  // 피벗 데이터
  pivot: Pivot;

  userFields: UserDefinedField[] = [];

  limits: Limit;

  resultFormat?: any;

  metaQuery: false;

  preview: false;

  // Embedded Analysis 관련 설정안에서 사용할 analysis 데이터
  analysis: AnalysisConfig;

  // map chart analysis spatial
  type?: string;

  mainLayer?: string;

  compareLayer?: string;

  operation?: Operation;

}

// ----------------------------------------------------------------------
// 서버 소스를 참고해서 만든 vo class
// ----------------------------------------------------------------------

/**
 * Embedded Analysis 관련 설정안에서 사용할 analysis 데이터
 */
export class AnalysisConfig {

  type: string = 'prediction';

  /**
   *  표시할 시리즈 타입
   *    - UI 스펙이라 Search 시 필요하지 않음
   */
  seriesTypes: SeriesType[] = [];

  /**
   * 예측 기간
   *  - 서버 VO는 예측 기간 값이 integer 이지만 화면에서 사용하기 위해서 문자열 타입까지 사용할 수 있도록 수정
   */
  interval: number | string;

  /**
   * 예측 기간 단위 (시간일 경우, Optional)
   *
   *  - 예측 시간 단위 (현재는 continuous type 만 지정 가능)
   */
  timeUnit: TimeUnit;

  /**
   * Forecast 설정
   */
  forecast: Forecast;

  /**
   * Confidence 설정
   */
  confidence: Confidence;

}

export class Forecast {

  /**
   * 분석 관련 파라미터
   */
  parameters: HyperParameter[] = [];

  /**
   * 예측선 표시 관련 스타일 정의
   */
  style: Style;

}

export class HyperParameter {

  /**
   * 대상 Measure 필드명 (alias)
   */
  field: string;

  /**
   * alpha
   *  - 서버 VO는 알파 값이 integer 이지만 화면에서 사용하기 위해서 문자열 타입까지 사용할 수 있도록 수정
   */
  alpha: number | string = '';

  /**
   * Beta
   *  - 서버 VO는 베타 값이 integer 이지만 화면에서 사용하기 위해서 문자열 타입까지 사용할 수 있도록 수정
   */
  beta: number | string = '';

  /**
   * Gamma
   *  - 서버 VO는 감마 값이 integer 이지만 화면에서 사용하기 위해서 문자열 타입까지 사용할 수 있도록 수정
   */
  gamma: number | string = '';

  /**
   * Trend 반영 여부
   */
  showTrend: boolean;

  /**
   * Seasonal 반영 여부
   */
  showSeasonal: boolean;

  /**
   * 파마미터 값을 곱할지(multiplicative) 여부 (기본값은 덧셈 - additive)
   *
   *  - isMultiple: boolean;
   */
  multiple: boolean = false;

  /**
   * period
   */
  period: number;

  // ---------------------------------------------------
  // UI 에서 사용하는 값
  //  - 체크 박스에 사용할 값
  // ---------------------------------------------------

  isAuto: boolean = true;

  isAlphaDisabled: boolean = true;

  isAlphaSelected: boolean = false;

  isBetaDisabled: boolean = true;

  isBetaSelected: boolean = false;

  isGammaDisabled: boolean = true;

  isGammaSelected: boolean = false;

  isPeriodSelected: boolean = false;

}

export class Confidence {

  /**
   * 신뢰구간
   */
  confidenceInterval: number;

  /**
   * 신뢰 구간 표시 관련 스타일 정의
   */
  style: Style;

}

export class Style {

  /**
   * 표시 색상
   */
  color: string = '';

  /**
   * 라인 표시 방식
   */
  lineStyle: LineStyle;

  /**
   * 라인 두께
   */
  lineThickness: number;

  /**
   * 투명도
   *  @Min(0)
   *  @Max(100)
   */
  transparency: number;

  // ---------------------------------------------------
  // UI 에서 사용하는 값 ( 서버로 보내야되는데 어떤 vo에
  // 넣어야 하는지 몰라서 우선 스타일에 추가
  // ---------------------------------------------------

  lineType: string;

  // 예측선내부에서 색상변경
  predictColorUseFl: boolean;
}

export class LineStyle {

  /**
   * 대상 Measure 필드명 (alias)
   */
  field: string;

  /**
   * alpha
   */
  alpha: number;

  /**
   * Beta
   */
  beta: number;

  /**
   * Gamma
   */
  gamma: number;

  /**
   * Trend 반영 여부
   */
  showTrend: boolean;

  /**
   * Seasonal 반영 여부
   */
  showSeasonal: boolean;

  /**
   * 파마미터 값을 곱할지(multiplicative) 여부 (기본값은 덧셈 - additive)
   *
   * isMultiple: boolean;
   */
  multiple: boolean;

}

/**
 * map chart analysis option
 */
export class Operation {

  type: string;
  distance: number;

}
