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

import { UIOption } from '../ui-option';
import {
  LabelLayoutType, FontSize, LabelSecondaryIndicatorType,
  LabelSecondaryIndicatorPeriod, LabelSecondaryIndicatorMarkType, LabelStyle
} from '../define/common';

/**
 * KPI차트 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UILabelChart extends UIOption {

  // Label Chart 표현 레이아웃 (가로 방향/세로 방향)
  layout?: LabelLayoutType;

  // Font Size (작게/보통/크게)
  fontSize?: FontSize;

  // Label 차트 표현 스타일
  chartStyle?: LabelStyle;

  // 지표 제목 표시 여부, 기본값 true
  showLabel?: boolean;

  // 양수 음수 색상표시
  positiveNegativeColor?: UILabelPositiveNegativeColor;

  // 시리즈별 그래픽 아이콘 지정
  icons?: UILabelIcon[];

  // 시리즈별 설명 추가
  annotations?: UILabelAnnotation[];

  // 보조 지표
  secondaryIndicators?: UILabelSecondaryIndicator[];

  // 시리즈
  series?: UILabelChartSeries[];
}

export interface UILabelChartSeries {

  // 시리즈 이름
  name?: string;
}

export interface UILabelPositiveNegativeColor {

  positiveColor?: string;

  negativeColor?: string;
}

export interface UILabelIcon {

  // 대상 시리즈 명, Null 이면 전체
  seriesName?: string;

  // 아이콘 타입 코드
  iconType?: string;

  // UI 스펙
  show?: boolean;
}

export interface UILabelAnnotation {

  // 대상 시리즈 명, Null 이면 전체
  seriesName?: string;

  // 추가할 설명
  description?: string;

  // UI 스펙
  show?: boolean;
}

export interface UILabelSecondaryIndicator {

  // 대상 시리즈 명, Null 이면 전체
  seriesName?: string;

  // 지표 유형 (비교기간 대비/목표치 대비)
  indicatorType?: LabelSecondaryIndicatorType;

  // 비교 기간 대비 선택시, 비교 기간
  rangeUnit?: LabelSecondaryIndicatorPeriod;

  // 목표치 대비 선택시, 목표치
  targetValue?: number;

  // 표시 형식
  mark?: LabelSecondaryIndicatorMarkType;

  // 강조 여부
  emphasized?: boolean;

  // UI 스펙
  show?: boolean;
}
