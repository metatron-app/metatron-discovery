

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

import {UIChartDataLabelDisplayType, UIPosition, DataLabelPosition} from '../define/common';
/**
 * Data Label
 */
export interface UIChartDataLabel {

  ////////////////////////////////////////////
  // 서버 스펙
  ////////////////////////////////////////////

  // 표시 레이블 선택
  displayTypes?: UIChartDataLabelDisplayType[];

  // 표시 위치, 결합차트일때 막대부분 표시위치
  pos?: DataLabelPosition;

  // 결합차트일때 라인부분 표시위치
  secondaryPos?: DataLabelPosition;

  // treemp차트일때 가로 정렬
  hAlign?: UIPosition;

  // treemp차트일때 세로 정렬
  vAlign?: UIPosition;

  // 회전 여부
  enableRotation?: boolean;

  // 텍스트 색상
  textColor?: string;

  // 텍스트 배경 색상
  textBackgroundColor?: string;

  // 텍스트 아웃라인 색상
  textOutlineColor?: string;

  // 텍스트 정렬
  textAlign?: UIPosition;

  // 기본 ValueFormat 사용 여부
  useDefaultFormat?: boolean;

  // pie - 차트 시리즈 바깥쪽에 표시
  showOutside?: boolean;

  ////////////////////////////////////////////
  // UI 스펙
  ////////////////////////////////////////////

  // 측정값 데이터 표시여부
  showValue?: boolean;

  // 미리보기 리스트
  previewList?: object[];
}
