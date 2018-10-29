

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

import {UIChartDataLabelDisplayType, UIPosition, DataLabelPosition} from "../define/common";
/**
 * Data Label
 */
export interface UIChartTooltip {

  ////////////////////////////////////////////
  // 서버 스펙
  ////////////////////////////////////////////

  // 표시 레이블 선택
  displayTypes?: UIChartDataLabelDisplayType[];

  // 기본 ValueFormat 사용 여부
  useDefaultFormat?: boolean;

  // columns in tooltip (using in mapview)
  displayColumns?: string[];

  ////////////////////////////////////////////
  // UI 스펙
  ////////////////////////////////////////////

  // 미리보기 리스트
  previewList?: Object[];

}
