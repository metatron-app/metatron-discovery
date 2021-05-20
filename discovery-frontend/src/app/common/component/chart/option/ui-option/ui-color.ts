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

import {CellColorTarget, ChartColorType, ChartGradientType, ColorCustomMode, ColorRangeType} from '../define/common';

/**
 * color
 */
export interface UIChartColor {
  // 섹상명
  schema: string;
  // 차트 색상 타입
  type: ChartColorType;
  // 색상 대상 (셀/텍스트)
  colorTarget?: CellColorTarget;
}

/**
 * color by Dimension
 */
export interface UIChartColorByDimension extends UIChartColor {

  // 색상의 기준이 되는 행/열 필드명
  targetField: string;

  // show / hide 설정
  showFl?: boolean;

  // gauge차트에서의 사용자 지정색상 리스트
  mapping?: object;

  /////////////////////////////////
  //// 서버에 미정의된 옵션
  /////////////////////////////////

  // gauge차트에서의 사용자 지정색상 mapping을 array로 변경한 값
  mappingArray?: object[];

  // color setting 사용여부
  settingUseFl?: boolean;
}

/**
 * color by Series
 */
export interface UIChartColorBySeries extends UIChartColor {

  // 사용자 지정색상 리스트
  mapping?: object;

  /////////////////////////////////
  //// 서버에 미정의된 옵션
  /////////////////////////////////

  // color setting 사용여부
  settingUseFl?: boolean;

  // mapping을 array로 변경한 값
  mappingArray?: object[];

}

/**
 * color by Value
 */
export interface UIChartColorByValue extends UIChartColor {

  // 자동으로 설정되는 사용자 지정범위 색상 리스트
  ranges?: ColorRange[];

  // color range 타입
  customMode?: ColorCustomMode;

  /////////////////////////////////
  //// 서버에 미정의된 옵션
  /////////////////////////////////

  // 그래디언트 모드(순차/대비)
  mode?: ChartGradientType;
}

/**
 * color by Value
 */
export interface UIChartColorGradationByValue extends UIChartColor {

  // 자동으로 설정되는 사용자 지정범위 색상 리스트
  ranges?: ColorGradationRange[];

  // color range 타입
  customMode?: ColorCustomMode;

  /////////////////////////////////
  //// 서버에 미정의된 옵션
  /////////////////////////////////

  // visualMap용 gradation 저장값
  visualGradations?: object[];
}

/**
 * color by Cell
 */
export interface UIChartColorByCell extends UIChartColor {

  // 섹상명
  schema: string;

  // 자동으로 설정되는 사용자 지정범위 색상 리스트
  ranges?: ColorRange[];

  // color range 타입
  customMode?: ColorCustomMode;

  /////////////////////////////////
  //// 서버에 미정의된 옵션
  /////////////////////////////////

  // 색상 대상 (셀/텍스트)
  colorTarget?: CellColorTarget;
}

/**
 * color by Cell
 */
export interface UIChartColorGradationByCell extends UIChartColor {

  // 섹상명
  schema: string;

  // 자동으로 설정되는 사용자 지정범위 색상 리스트
  ranges?: ColorGradationRange[];

  // color range 타입
  customMode?: ColorCustomMode;

  /////////////////////////////////
  //// 서버에 미정의된 옵션
  /////////////////////////////////

  // 색상 대상 (셀/텍스트)
  colorTarget?: CellColorTarget;

  // visualMap용 gradation 저장값
  visualGradations?: object[];
}

/**
 * ColorRange
 */
export interface ColorRange {

  type?: ColorRangeType;

  // 범위내 변경값 시작 수치
  gt: number;

  // 범위내 변경값 종료 수치
  lte: number;

  // 범위 시작 수치
  fixMin: number;

  // 범위 종료 수치
  fixMax: number;

  // 범위 색상
  color: string;

  // symbol
  symbol: string;

}

/**
 * color gradation range
 */
export interface ColorGradationRange {

  type?: ColorRangeType;

  color?: string;

  // 위치값
  pos?: number;

  // slider pos에 대한 value값
  value?: number;

  // slider id값
  index?: string;
}
