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

import { UIOption } from '../ui-option';
import {BarMarkType, UIOrient, DataUnit} from '../define/common';
/**
 * 바차트 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UIBarChart extends UIOption {

  // 차트 유형 : 그래프 내 시리즈 표현 방식(병렬/중첩)
  mark?: BarMarkType;

  // 차트 유형 : 그래프 표현 방향(가로/세로)
  align: UIOrient;

  // 차트 데이터 표현 타입
  unitType?: DataUnit;
}
