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

import {UIOrient} from '../define/common';

/**
 * ChartZoom
 */
export interface UIChartZoom {

  // 미니맵 시작점(%)
  start?: number;

  // 미니맵 종료점(%)
  end?: number;

  // 미니맵 시작점(수치)
  startValue?: number;

  // 미니맵 종료점(수치)
  endValue?: number;

  // ???
  count?: number;

  // 미니맵 방향
  orient?: UIOrient;

  // 활성화 여부
  auto?: boolean;
}
