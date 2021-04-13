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

import { GraphLayoutType, SeriesType, SymbolType } from './common';
import { Tooltip } from './tooltip';
import { ItemStyleSet, LabelLine, LabelStyleSet, LineStyleSet, TextStyleSet } from './style';

export class Series {

  // 시리즈 타입
  type?: SeriesType;

  // 시리즈 명
  name?: string;

  coordinateSystem?: string;

  // 맵핑되는 X축 인덱스
  xAxisIndex?: number;

  // 맵핑되는 Y축 인덱스
  yAxisIndex?: number;

  // 많은양의 데이터인지 여부(scatter)
  large?: boolean;

  // 클러스터링이 되는 심볼개수(scatter)
  largeThreshold?: number;

  // 심볼 타입
  symbol?: SymbolType | string;

  // 심볼 사이즈
  symbolSize?: number;

  // 심볼 회전
  symbolRotate?: number;

  symbolOffset?: number[];

  // 심볼 표시여부
  showSymbol?: boolean;

  // 전체 심볼 표시여부
  showAllSymbol?: boolean;

  // 마우스 오버 애니매이션
  hoverAnimation?: boolean;

  legendHoverLink?: boolean;

  // 스택모드 표현시 그룹명
  stack?: string;

  cursor?: string;

  // 유효 데이터 사이에 null 값이 있을 경우 이음처리 여부
  connectNulls?: boolean;

  clipOverflow?: boolean;

  step?: boolean;

  // 수치값 라벨 스타일
  label?: LabelStyleSet;

  // 라벨라인 스타일
  labelLine?: LabelLine;

  // 해당 시리즈 항목의 스타일
  itemStyle?: ItemStyleSet;

  // 라인 스타일
  lineStyle?: LineStyleSet;

  // 영역 스타일
  areaStyle?: ItemStyleSet;

  // 라인 스타일
  textStyle?: TextStyleSet;

  // 부드러운 곡선라이 처리 여부
  smooth?: boolean;

  smoothMonotone?: string;

  // 데이터가 많을시 대표데이터 표시 기준
  sampling?: string;

  dimensions?: string[];

  encode?: object;

  // 시리즈를 구성하는 데이터
  data?: any[];

  // 데이터에 속석을 부여하지 않은 순수 수치 데이터
  originData?: any[];

  // 기준점 속성
  markPoint?: any;

  // 기준선 속성
  markLine?: any;

  // 기준영역 속성
  markArea?: any;

  // 캔버스 레이어 z-index레벨 수치
  zlevel?: number;

  // zlevel 레벨안에서 z-index 수치
  z?: number;

  // 이벤트 동작 여부
  silent?: boolean;

  // 애니매이션 여부
  animation?: boolean;

  animationThreshold?: number;

  animationDuration?: number;

  animationEasing?: string;

  animationDelay?: number;

  animationDurationUpdate?: number;

  animationEasingUpdate?: string;

  animationDelayUpdate?: number;

  tooltip?: Tooltip;

  barWidth?: number;

  barMaxWidth?: number;

  barMinHeight?: number;

  barGap?: number;

  barCategoryGap?: number;

  radius?: string | string[];

  center?: string | string[];

  selectedMode?: boolean;

  size?: number | number[] | string[];

  autoSize?: any;

  sizeRange?: number[];

  rotationRange?: number[];

  rotationStep?: number;

  shape?: SymbolType;

  leafDepth?: number;

  levels?: any[];

  width?: number | string;

  height?: number | string;

  layout?: GraphLayoutType;

  roam?: boolean;

  links?: any[];

  force?: any;

  focusNodeAdjacency?: boolean;

  edgeSymbol?: string[];

  edgeLabel?: LabelStyleSet;

  categories?: any[];

  // 선택한 데이터가 존재하는지 여부
  existSelectData?: boolean;

  // 위치
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;

  // UI에서 사용하기위한 데이터
  uiData?: any;
}
