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

import { BrushMode, BrushType, ThrottleType } from './common';
import { DataStyle, SymbolStyle } from './style';
export interface Brush {

  toolbox?: string[];

  // 브러시와 연동되는 그리드 영역
  brushLink?: string[] | string;

  // 브러쉬와 연동되는 시리즈
  seriesIndex?: string | number | string[] | number[];

  geoIndex?: number;

  // 맵핑되는 X축 인덱스
  xAxisIndex?: number;

  // 맵핑되는 Y축 인덱스
  yAxisIndex?: number;

  // 브러쉬 타입
  brushType?: BrushType;

  // 브러쉬 모드
  brushMode?: BrushMode;

  // 마우스 드래그를 통해 그려진 브러쉬의 위치 이동가능 여부
  transformable?: boolean;

  // 브러쉬 스타일
  brushStyle?: DataStyle;

  throttleType?: ThrottleType;

  throttleDelay?: number;

  // 브러쉬 외 영역을 클릭하면 그려진 브러쉬 영역 삭제여부
  removeOnClick?: boolean;

  // 브러쉬 영역에 포함되는 데이터 스타일
  inBrush?: SymbolStyle;

  // 브러쉬 영역에 포함되지 않는 데이터 스타일
  outOfBrush?: SymbolStyle;

  // z-index 수치
  z?: number;
}
