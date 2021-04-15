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
 *  고급분석 - 예측선에서 사용하는 슬라이더 컴포넌트 VO
 */
export class RangeSliderResult {
  min: any;            // MIN value
  max: any;            // MAX value
  from: number;        // FROM value (left or single handle)
  fromPercent: number; // FROM value in percents
  fromValue: number;   // FROM index in values array (if used)
  to: number;          // TO value (right handle in double type)
  toPercent: number;   // TO value in percents
  toValue: number;     // TO index in values array (if used)
  currentElement: JQuery // 현재 element
  currentIndex: number; // 현재 인스턴스의 index
}
