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

import {UIChartColorByCell, UIOption} from '../ui-option';
import {
  AnnotationPosition,
  FontSize,
  GridViewType,
  Operator,
  UIFontStyle,
  UIOrient,
  UIPosition
} from '../define/common';

/**
 * 그리드차트 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UIGridChart extends UIOption {

  ////////////////////////////////////////////
  // 서버 스펙
  ////////////////////////////////////////////

  color?: UIChartColorByCell;

  // 차트 표현 타입 (피봇, 원본)
  dataType?: GridViewType;

  // 'PIVOT' 모드일때, 측정값 표현 방식
  measureLayout?: UIOrient;

  // 헤더 스타일
  headerStyle?: ValueStyle;

  // 본문 스타일
  contentStyle?: ValueStyle;

  // grid 설명 추가
  annotation?: Annotation;

  // 연산행
  totalValueStyle?: TotalValueStyle;

  // 부분 연산행
  subTotalValueStyle?: TotalValueStyle;

  // 연산열
  showCalculatedColumnStyle?: TotalValueStyle;

  // 부분 연산열
  subTotalColumnStyle?: TotalValueStyle;

  ////////////////////////////////////////////
  // UI 스펙
  ////////////////////////////////////////////
  gridColumnWidth?: any;

}

export interface ValueStyle {

  // 헤더 보이기 여부
  showHeader?: boolean;

  // 세로정렬
  vAlign?: UIPosition;

  // 가로정렬
  hAlign?: UIPosition;

  // 폰트사이즈
  fontSize?: FontSize;

  // 폰트 스타일
  fontStyles?: Array<UIFontStyle>;

  // 배경색상
  backgroundColor?: string;

  // 글자색상
  fontColor?: string;
}

/**
 * grid 라벨 (설명추가)
 */
export interface Annotation {

  // 설명입력값
  label?: string;

  // annotation 위치
  pos?: AnnotationPosition;
}

/**
 * grid 연산행
 */
export interface TotalValueStyle {

  // 레이블
  label?: string;

  // 연산자
  aggregationType?: Operator;

  // 가로정렬
  hAlign?: UIPosition;

  // 세로정렬
  vAlign?: UIPosition;

  // 폰트사이즈
  fontSize?: FontSize;

  // 폰트 스타일
  fontStyles?: Array<UIFontStyle>;

  // 배경색상
  backgroundColor?: string;

  // 글자색상
  fontColor?: string;
}
