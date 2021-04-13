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

import { BrushType, ImageFormat, Orient } from './common';
import { ItemStyleSet } from './style';

/**
 * Toolbox
 */
export interface Toolbox {

  // 표시여부
  show?: boolean;

  // 표시 방향
  orient?: Orient;

  // 툴 버튼 사이즈
  itemSize?: number;

  // 툴 버튼 간격
  itemGap?: number;

  // 툴 버튼에 기능명 표시여부
  showTitle?: boolean;

  // 툴 박스 기능
  feature?: any;

  // 툴 버튼 아이콘 스타일
  iconStyle?: ItemStyleSet;

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
  width?: number;

  // 높이
  height?: number;
}

/**
 * 툴 박스 기능
 */
export interface ToolboxFeature {

  // 차트 이미지 저장 툴
  saveAsImage?: SaveAsImage;

  // 차트 속성 원복
  restore?: FeatureItem;

  // 테이블 데이터 보기 툴
  dataView?: DataView;

  // 확대/축소 툴
  dataZoom?: DataZoom;

  // 시리즈 변형 툴
  magicType?: MagicType;

  // 브러쉬 툴
  brush?: Brush;
}


/**
 * 차트 이미지 저장 툴
 */
export interface FeatureItem {

  // 표시여부
  show?: boolean;

  // 기능별 타이틀
  title?: string | FeatureItemTitle;

  // 툴버튼 아이콘
  icon?: string;

  // 툴버튼 아이콘 스타일
  iconStyle?: ItemStyleSet;
}

/**
 * 기능별 타이틀
 */
export interface FeatureItemTitle {

  zoom?: string;

  back?: string;

  line?: string;

  bar?: string;

  stack?: string;

  tiled?: string;

  rect?: string;

  polygon?: string;

  lineX?: string;

  lineY?: string;

  keep?: string;

  clear?: string;
}

/**
 * 차트 이미지 저장 툴
 */
export interface SaveAsImage extends FeatureItem {

  // 이미지 포맷
  type?: ImageFormat;

  name?: string;

  backgroundColor?: string;

  excludeComponents?: string[];

  pixelRatio?: number;
}

export interface DataView extends FeatureItem {

  readOnly?: boolean;

  optionToContent?: any;

  contentToOption?: any;

  lang?: string[];

  backgroundColor?: string;

  textareaColor?: string;

  textareaBorderColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;
}

export interface DataZoom extends FeatureItem {

  xAxisIndex?: any;

  iyAxisIndexcon?: any;
}

export interface MagicType extends FeatureItem {

  // 기능 타입
  type?: string[];
}

export interface Brush extends FeatureItem {

  // 브러쉬 타입
  type?: BrushType[];

}



