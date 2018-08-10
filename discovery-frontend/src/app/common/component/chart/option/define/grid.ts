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


export interface Grid {

  /**
   * 표시여부
   * @default false
   */
  show?: boolean;

  /**
   * 캔버스 레이어 z-index레벨 수치
   * @default 0
   */
  zlevel?: number;

  /**
   * zlevel 레벨안에서 z-index 수치
   * @default 2
   */
  z?: number;

  /**
   * 차트내부에서 절대위치 수치(left)
   * @default 10%
   */
  left?: number | string;

  /**
   * 차트내부에서 절대위치 수치(top)
   * @default 60
   */
  top?: number | string;


  /**
   * 차트내부에서 절대위치 수치(right)
   * @default '10%'
   */
  right?: number | string;

  /**
   * 차트내부에서 절대위치 수치(bottom)
   * @default 60
   */
  bottom?: number | string;

  /**
   * 너비
   * @default auto
   */
  width?: number | string;

  /**
   * 높이
   * @default auto
   */
  height?: number | string;

  /**
   * 축 이름/라벨 영역을 그리드 영역에 포함히는지 여부
   * @default false
   */
  containLabel?: boolean;

  // 배경 색상
  /**
   * 표시여부
   * @default false
   */
  backgroundColor?: string;

  /**
   * 외곽선 색상
   * @default #ccc'
   */
  borderColor?: string;

  /**
   * 외곽선 너비
   * @default 1
   */
  borderWidth?: number;

  /**
   * 음영 수치
   * @default 0
   */
  shadowBlur?: number;

  /**
   * 음영 색상
   * @default color
   */
  shadowColor?: string;

  /**
   * 음영이 비치는 가로 위치
   * @default 0
   */
  shadowOffsetX?: number;

  /**
   * 음영이 비치는 세로 위치
   * @default 0
   */
  shadowOffsetY?: number;

  /**
   * 툴팁 속성
   * @default {}
   */
  tooltip?: any;

  /**
   * 위치(본 속성은 명시만 해주는 부분이기때문에 실제 위치는 top, left, right, bottom 으로 지정)
   */
  location?: Position;
}
