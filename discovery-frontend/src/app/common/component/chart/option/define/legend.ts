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
import {TextStyle} from './style';

export interface Legend {

  // 표시여부
  show?: boolean;

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

  // 너비
  width?: number | string;

  // 높이
  height?: number;

  // 표시 방향
  orient?: Orient;

  // 정렬 위치
  align?: Position;

  // 상 하 좌 우 여백
  padding?: number | number[];

  // 항목간 간격
  itemGap?: number;

  // 범례 항목 너비
  itemWidth?: number;

  // 범례 항목 높이
  itemHeight?: number;

  // 선택모드 허용 여부
  selectedMode?: boolean;

  inactiveColor?: string;

  selected?: object;

  // 텍스트 스타일
  textStyle?: TextStyle;

  // 툴팁 속성
  tooltip?: any;

  // 범례 항목 데이터
  data?: string[];

  pageItems?: number;

  // 범례 항목과 시리즈 항목의 이름이 모두 일치해야하는지 여부
  seriesSync?: boolean;

  // 범례 심볼 형태
  symbol?: SymbolType;

  // 범례 항목에 맵핑되는 색상
  color?: string[];
}
