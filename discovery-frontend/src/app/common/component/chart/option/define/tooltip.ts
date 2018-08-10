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

import { AxisPointer } from './axis';
import { TriggerAction, TriggerType } from './common';
import { TextStyle } from './style';

export interface Tooltip {

  // 표시여부
  show?: boolean;

  // 툴팁 표현 기준
  trigger?: TriggerType;

  // 그리드 영역에서 마우스 위치에 표시되는 축 정보 속성
  axisPointer?: AxisPointer;

  // 표시여부 = show
  showContent?: boolean;

  // 마우스 커서가 그리드 영역에 있을 경우에 툴팁 항시 표시 여부
  alwaysShowContent?: boolean;

  // 툴팁이 표시되는 마우스 액션
  triggerOn?: TriggerAction;

  // 툴팁이 보여지는 소요시간
  showDelay?: number;

  // 툴팁이 사라지는 소요시간
  hideDelay?: number;

  // 마우스 커서가 툴팁 영역에 들어갈 경우 툴팁 항시 표시 여부
  enterable?: boolean;

  confine?: boolean;

  transitionDuration?: number;

  // 툴팁이 표현되는 고정 위치치
  psition?: any;

  // 툴팁 내용
  formatter?: any;

  // 배경 색상
  backgroundColor?: string;

  // 외곽선 색상
  borderColor?: string;

  // 외과선 너비
  borderWidth?: number;

  // 상 하 좌 우 여백
  padding?: number| number[];

  // 텍스트 스타일
  textStyle?: TextStyle;

  // 별도 css style
  extraCssText?: string;
}
