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

import { Position } from './common';
import { TextStyle } from './style';

export interface Title {

  // 표시여부
  show?: boolean;

  // 이름
  text?: string;

  link?: string;

  target?: string;

  // 텍스트 스타일
  textStyle?: TextStyle;

  // 이름 정렬
  textAlign?: Position;

  textBaseLine?: Position;

  // 서브타이틀 이름
  subText?: string;

  subLink?: string;

  subTarget?: string;

  // 서브타이틀 텍스트 스타일
  subtextStyle?: TextStyle;

  // 상 하 좌 우 여백
  padding?: number| number[];

  itemGap?: number;

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

  // 배경색상
  backgroundColor?: string;

  // 외곽선 색상
  borderColor?: string;

  // 외곽선 너비
  borderWidth?: string;

  // 음영 수치
  shadowBlur?: number;

  // 음영 색상
  shadowColor?: string;

  // 음영이 비치는 가로 위치
  shadowOffsetX?: number;

  // 음영아 비치는 세로 위치
  shadowOffsetY?: number;
}
