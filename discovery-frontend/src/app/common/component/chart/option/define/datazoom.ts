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

/**
 * Created by Dolkkok on 2017. 7. 17..
 */

import { Orient } from './common';
import { DataStyle, TextStyle } from './style';
export interface DataZoom {
  // common
  type?: DataZoomType;

  // 표시여부 - slider만 해당하지만 원활한 show/hide를 위해 공통속성에 할당
  show?: boolean;

  // 맵핑되는 X축 인덱스
  xAxisIndex?: number;

  // 맵핑되는 Y축 인덱스
  yAxisIndex?: number;

  radiusAxisIndex?: number;

  angleAxisIndex?: number;

  // 현재 영역 데이터만 표현 할지 모든 데이터를 표현할지 모드 설정
  filterMode?: FilterMode;

  // 화면 영역의 시작(%)
  start?: number;

  // 화면 영역의 종료(%)
  end?: number;

  // 화면 영역의 시작(index)
  startValue?: any;

  // 화면 영역의 종료(index)
  endValue?: any;

  minSpan?: number;

  maxSpan?: number;

  minValueSpan?: any;

  maxValueSpan?: any;

  // 표시 방향
  orient?: Orient;

  // 확대 불가능 여부
  zoomLock?: boolean;

  throttle?: number;

  // 캔버스 레이어 z-index레벨 수치
  zlevel ?: number;

  // zlevel 레벨안에서 z-index 수치
  z ?: number;

  // 차트내부에서 절대위치 수치(left)
  left?: number | string;

  // 차트내부에서 절대위치 수치(top)
  top?: number | string;

  // 차트내부에서 절대위치 수치(right)
  right?: number;

  // 차트내부에서 절대위치 수치(bottom)
  bottom?: number;
}

export interface SliderDataZoom extends DataZoom {

  // 미니맵 배경색상
  backgroundColor?: string;

  // 미니맵 데이터 영역의 색상
  dataBackground?: DataBackground;

  // 미니맵 현재 영역의 색상
  filterColor?: string;

  // 미니맵 외곽선 색상
  borderColor?: string;

  // 미니맵 조절 핸들 아이콘
  handleIcon?: string;

  // 미니맵 조절 핸들 사이즈
  handleSize?: number;

  // 미니맵 조절 핸들 스타일
  handleStyle?: DataStyle;

  labelPrecision?: number;

  labelFormatter?: any;

  showDetail?: boolean;

  showDataShadow?: string;

  realtime?: boolean;

  // 텍스트 스타일
  textStyle?: TextStyle;
}

export interface InsideDataZoom extends DataZoom {

  // 비활성화 여부
  disabled?: boolean;

  // 마우스 휠 동작시 확대 여부
  zoomOnMouseWheel?: boolean;

  // 마우스 이동시 화면 이동 여부
  moveOnMouseMove?: boolean;

  preventDefaultMouseMove?: boolean;

}

export interface DataBackground {
  lineStyle?: DataStyle;

  areaStyle?: DataStyle;
}

/**
 * dataZoom 타입 - 미니맵(slider), 내부 스크롤
 */
export enum DataZoomType {
  INSIDE = 'inside',
  SLIDER = 'slider'
}

/**
 *
 */
export enum FilterMode {
  FILTER = 'filter',
  WEAKFILTER = 'weakfilter',
  EMPTY = 'empty',
  NONE = 'none'
}
