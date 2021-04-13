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

import {
  AxisType, SymbolType, TriggerAction, Position, FontWeight, FontStyle
} from './common';
import { DataStyle, LabelStyle, LineStyleSet, TextStyle } from './style';

/**
 * 차트 축
 */
export interface Axis {

  // 표시여부
  show?: boolean;

  // 맵핑되는 그리드 인덱스
  gridIndex?: number;

  // 그리드 기준으로 축이 표시되는 위
  position?: Position;

  // 그리드와 벌어지는 간격
  offset?: number;

  // 축 타입 (category, value, log)
  type?: AxisType;

  // 축 타이틀
  name?: string;

  // 현재 축 타이틀(name의 값으로 표시여부가 정해지기 때문에 본 속성에 저장)
  axisName?: string;

  // 축 타이틀 위치
  nameLocation?: Position;

  // 축 타이틀 텍스트 스타일
  nameTextStyle?: TextStyle;

  // 축 타이틀과 그리드가 벌어지는 간격
  nameGap?: number;

  // 축 타이틀 회전 수치
  nameRotate?: number;

  // 축 라벨 단위가 그리드 안쪽으로 위치하는지 여부
  inverse?: boolean;

  // 최대값/최소값 기준으로 축 영역을 확장/축소
  boundaryGap?: string[] | boolean;

  // 축 최소값
  min?: number | string;

  // 축 최대값
  max?: number | string;

  // 축 시작점을 0으로 강제 할지, 수치기준으로 자동 설정할지 여부
  scale?: boolean;

  // 축을 나누는 구분선의 개수 설정
  splitNumber?: number;

  // 축 단위 최소간격
  minInterval?: number;

  // 축 단위 간격
  interval?: number;

  // log 적용시 대수단위
  logBase?: number;

  // 이벤트 동작 여부
  silent?: boolean;

  // 마우스 이벤트 동작시 해당정보를 넘겨주는지 여부
  triggerEvent?: boolean;

  // 축 라인
  axisLine?: AxisLine;

  // 축 단위 눈금
  axisTick?: AxisTick;

  // 축 단위 라벨
  axisLabel?: AxisLabel;

  // 축 구분선 표시여부
  splitLine?: SplitLine;

  // 축 구분선으로 나눠진 영역의 속성
  splitArea?: SplitArea;

  // 축을 구성하는 데이터
  data?: string[];

  // 축을 구성하는 origin 데이터
  originData?: string[];

  // 그리드 영역에서 마우스 위치에 표시되는축 정보 가이드 속성
  axisPointer?: AxisPointer;

  // 캔버스 레이어 z-index레벨 수치
  zlevel?: number;

  // zlevel 레벨안에서 z-index 수치
  z?: number;
}

/**
 * radar 차트 축
 */
export interface Radar {

  // 캔버스 레이어 z-index레벨 수치
  zlevel?: number;

  // zlevel 레벨안에서 z-index 수치
  z?: number;

  // 화면성에서 중심점 위치
  center?: number[];

  // 화면기준으로 반경 수치(레이더 크기)
  radius?: number | string;

  // 시작점 기울기 수치
  startAngle?: number;

  // 레이더의 이름
  name?: RadarName;

  // 축 타이틀과 그리드가 벌어지는 간격
  nameGap?: number;

  // 축을 나누는 구분선의 개수 설정
  splitNumber?: number;

  //
  shape?: SymbolType;

  // 축 시작점을 0으로 강제 할지, 수치기준으로 자동 설정할지 여부
  scale?: boolean;

  // 이벤트 동작 여부
  silent?: boolean;

  // 마우스 이벤트 동작시 해당정보를 넘겨주는지 여부
  triggerEvent?: boolean;

  // 축 라인
  axisLine?: AxisLine;

  // 축 라인
  axisTick?: AxisTick;

  // 축 단위라벨
  axisLabel?: AxisLabel;

  // 축 구분선 표시여부
  splitLine?: SplitLine;

  // 축 구분선으로 나눠진 영역의 속성
  splitArea?: SplitArea;

  // radar를 구성하는 항목
  indicator?: Indicator[];
}

/**
 * 레이더의 이름
 */
export interface RadarName {

  // show / hide
  show?: boolean;

  // 폰트 사이즈
  fontSize?: number;
}

/**
 * 축 라인
 */
export interface AxisLine {

  // 표시여부
  show?: boolean;

  // 라인 스타일
  lineStyle?: LineStyleSet;
}

/**
 * 축 단위 눈금
 */
export interface AxisTick {

  // 표시여부
  show?: boolean;

  alignWithLabel?: boolean;

  // 축 단위 간격
  interval?: number;

  // grid 영역 안쪽에 표시
  inside?: boolean;

  length?: number;

  // 라인 스타일
  lineStyle?: LineStyleSet;
}

/**
 * 축 단위 라벨
 */
export interface AxisLabel {

  // 표시여부
  show?: boolean;

  // 라벨 표시 간격
  interval?: number;

  // grid 영역 안쪽에 표시
  inside?: boolean;

  // 라벨 회전
  rotate?: number;

  //
  margin?: number;

  // 라벨 표시 형식
  formatter?: any;

  // 최소수치 라벨 표시 여부
  showMinLabel?: boolean;

  // 최대수치 라벨 표시 여부
  showMaxLabel?: boolean;

  // 폰트 스타일
  fontStyle?: FontStyle;

  // 폰트 굵기설정
  fontWeight?: FontWeight;

  // 폰트 종류
  fontFamily?: string;

  // 폰트 사이즈
  fontSize?: number;

  color?: string;
}

/**
 * 축 구분선
 */
export interface SplitLine {

  // 표시여부
  show?: boolean;

  // 축 단위 간격
  interval?: number;

  // 라인 스타일
  lineStyle?: DataStyle;
}

/**
 * 축 단위 구분 영역
 */
export interface SplitArea {

  // 표시여부
  show?: boolean;

  // 구분영역이 생성되는 단위
  interval?: any;

  // 영역 스타일
  areaStyle?: DataStyle;
}

/**
 * 그리드 영역에서 마우스 위치에 표시되는 축 정보 가이드 속성
 */
export interface AxisPointer {

  // 표시여부
  show?: boolean;

  // 가이드 정보 타입 (라인, 음영, 교차라인)
  type?: AxisPointerType;

  // 마우스 snap
  snap?: boolean;

  // zlevel 레벨안에서 z-index 수치
  z?: number;

  // 해당하는 축 단위라벨 강조 스타일
  label?: LabelStyle;

  // 라인타입 가이드 스타일
  lineStyle?: DataStyle;

  // 음영타입 가이드 스타일
  shadowStyle?: DataStyle;

  // 교차라인 음영 가이드 스타일
  crossStyle?: DataStyle;

  // 툴팁 트리거 여부
  triggerTooltip?: boolean;

  //
  value?: number;

  //
  status?: boolean;

  //
  handle?: AxisPointerHandle;

  // 가이드가 트리거되는 이벤트
  triggerOn?: TriggerAction;
}

/**
 * 가이드 위치 조절 가능한 핸들
 */
interface AxisPointerHandle {

  // 표시여부
  show?: boolean;

  // 핸들 아이콘
  icon?: string;

  // 핸들 사이즈
  size?: number;

  //
  margin?: number;

  // 핸들 색상
  color?: string;

  //
  throttle?: number;

  // 핸들 음영 수치
  shadowBlur?: number;

  // 핸들 음영 색상
  shadowColor?: string;

  // 음영이 비치는 가로 위치
  shadowOffsetX?: number;

  // 음영이 비치는 세로 위치
  shadowOffsetY?: number;
}

/**
 * radar를 구성하는 항목
 */
export interface Indicator {

  // indicator 이름
  name?: string;

  // 최대값
  max?: number;

  // 최소값
  min?: number;
}

/**
 * 축 정보 가이드 타입
 */
export enum AxisPointerType {
  LINE = 'line',
  SHADOW = 'shadow',
  CROSS = 'cross'
}



