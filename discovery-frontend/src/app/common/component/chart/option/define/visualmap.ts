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

import {Orient, Position, SymbolType} from './common';
import { SymbolStyle, TextStyle } from './style';

/**
 * 데이터 수치를 기준으로 색상 설정
 */
export interface Visualmap {
  // common, continuous
  type?: VisualMapType;

  // 최소값
  min?: number;

  // 최대값
  max?: number;

  range?: number[];

  calculable?: boolean;

  realTime?: boolean;

  inverse?: number;

  precision?: number;

  itemWidth?: number;

  itemHeight?: number | string;

  // 정렬 위치
  align?: Position;

  text?: string[];

  textGap?: number[];

  // 표시여부
  show?: boolean;

  dimension?: number;

  seriesIndex?: any;

  hoverLink?: boolean;

  // 활성화 범위에 속하는 데이터 스타일
  inRange?: SymbolStyle;

  // 활서화 범위에 속하지 않는 데이터 스타일
  outOfRange?: SymbolStyle;

  // 범위 컨트롤러 속성
  controller?: VisualMapController;

  // 캔버스 레이어 z-index레벨 수치
  zlevel?: number;

  // zlevel 레벨안에서 z-index 수치
  z?: number;

  // 차트내부에서 절대위치 수치(left)
  left?: number | string;

  // 차트내부에서 절대위치 수치(top)
  top?: number | string;

  // 차트내부에서 절대위치 수치(right)
  right?: number;

  // 차트내부에서 절대위치 수치(bottom)
  bottom?: number;

  // 표현 방향
  orient?: Orient;

  // 상 하 좌 우 여백
  padding?: number| number[];

  // 배경색상
  backgroundColor?: string;

  // 외곽선 색상
  borderColor?: string;

  // 외곽선 너비
  borderWidth?: number;

  // 색상 리스트
  color?: string[];

  // 텍스트 스타일
  textStyle?: TextStyle;

  // 텍스트
  formatter?: any;

  // piecewise

  splitNumber?: boolean;

  pieces?: PiecewisePieces[];

  categories?: boolean;

  minOpen?: boolean;

  maxOpen?: string;

  selectedMode?: boolean;

  showLabel?: number;

  itemGap?: boolean;

  itemSymbol?: number;
}

/**
 * 데이터 수치를 기준으로 색상 설정(범위 단계 설정)
 */
export interface PiecewiseVisualmap extends Visualmap{

  splitNumber?: boolean;

  pieces?: PiecewisePieces[];

  categories?: boolean;

  minOpen?: boolean;

  maxOpen?: string;

  selectedMode?: boolean;

  showLabel?: number;

  itemGap?: boolean;

  itemSymbol?: number;

}

/**
 * visualMap이 piecewise 타입일때 pieces 설정
 */
export interface PiecewisePieces {
  min : number;
  max : number;
  symbol: SymbolType;
}

export interface VisualMapController {
  inRange?: SymbolStyle;

  outOfRange?: SymbolStyle;
}

export enum VisualMapType {
  CONTINUOUS = 'continuous',
  PIECEWISE = 'piecewise'
}
