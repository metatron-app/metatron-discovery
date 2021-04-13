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

import {UIOption} from '../ui-option';
import {BarMarkType, LineMarkType} from '../define/common';

/**
 * 컴바인차트 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UICombineChart extends UIOption {

  // Bar Chart 표시 방식
  barMarkType: BarMarkType;

  // Line Chart 표시 방식
  lineMarkType: LineMarkType;
}


