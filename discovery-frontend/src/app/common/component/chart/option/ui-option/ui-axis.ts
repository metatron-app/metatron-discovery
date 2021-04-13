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

import {AxisLabelRotate, AxisLabelType, ChartAxisGridType, ChartAxisLabelType} from '../define/common';
import {UIChartFormat} from './ui-format';

/**
 * Axis
 */
export interface UIChartAxis {

  // 축명 보이기 여부 (default true)
  showName?: boolean;

  // 사용자 정의 축 라벨
  // 이전명 => forceName
  customName?: string;

  // 축 레이블 보이기 여부 (default true)
  // 이전명 => showMark
  showLabel?: boolean;

  // 축 레이블 설정
  label?: UIChartAxisLabel;

  // 축 눈금 관련 옵션
  grid?: UIChartAxisGrid;

  // 기준선 (Base Line)
  baseline?: number | string;

  // 배경색
  background?: Background;

  ////////////////////////////////////////////
  // UI 스펙
  ////////////////////////////////////////////

  mode?: AxisLabelType;

  // 축 이름
  name?: string;

  // 기본 축 이름
  defaultName?: string;

  // 축의 numeric dimension 설정값
  axisOption?: AxisOption;

  // 비활성여부 (보조축 표시여부에서 사용)
  disabled?: boolean;

}

export interface Background {

  // 색상
  color?: string;

  // 투명도
  transparency?: number;
}

export interface UIChartAxisGrid {

  // 타입
  type?: ChartAxisGridType;

  // 축범위 자동설정 여부
  autoScaled: boolean;

  // 최소값
  min?: number | string;

  // 최대값
  max?: number | string;

  // 눈금단위
  unit?: number;
}

export interface ChartAxisGridForText extends UIChartAxisGrid {

  // 축 표시 최소값
  labelRotation?: number;

  // 축 표시 최대값
  labelMaxLength?: number;

  // 축 눈금 간격
  interval?: number;
}

export interface UIChartAxisGridNumeric extends UIChartAxisGrid {

  // 축 표시 최소값
  min?: number;

  // 축 표시 최대값
  max?: number;

  // 축 눈금 간격
  interval?: number;
}

export interface UIChartAxisLabel {
  type?: ChartAxisLabelType;
}

export interface UIChartAxisLabelValue extends UIChartAxisLabel {

  // 차트내 기본 Value Format 사용, Default true
  useDefault?: boolean;

  // Value Format 지정, useDefault false 일 경우 지정 필요
  format?: UIChartFormat;
}

export interface UIChartAxisLabelCategory extends UIChartAxisLabel {

  // 레이블 회전 각도 (0~360)
  // 이전명 => mark: AxisLabelMark
  rotation?: AxisLabelRotate;

  // 레이블 최대 길이 지정
  maxLength?: number;

  // 몇개마다 표시할지 지정
  showEvery?: number;
}

/**
 * numeric dimension 설정
 */
export interface AxisOption {

  // 최소값
  min: number;
  // 최대값
  max: number;
  // 데이터를 나타내는 간격
  interval: number;

  auto: true;
  type: string;

  // 축의 origin 시작값
  originMin: number;

  // 축의 origin 종료값
  originMax: number;

  // axis config 설정여부
  showFl: boolean;

  // 변경 타입
  changeType?: string;
}
