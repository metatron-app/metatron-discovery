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

import { GraphicAction, GraphicType } from './common';
import { GraphicStyle } from './style';
export interface Graphic {

  // 그려지는 그래픽 객체의 타입
  type?: GraphicType;

  // 해당 그래픽 객체의 ID
  id?: string;

  $action?: GraphicAction;

  // 차트내부에서 절대위치 수치(left)
  left?: number | string;

  // 차트내부에서 절대위치 수치(right)
  right?: number;

  // 차트내부에서 절대위치 수치(top)
  top?: number | string;

  // 차트내부에서 절대위치 수치(bottom)
  bottom?: number;

  children?: Graphic[];

  bounding?: string;

  // zlevel 레벨안에서 z-index 수치
  z?: number;

  // 캔버스 레이어 z-index레벨 수치
  zlevel?: number;

  // 이벤트 동작 여부
  silent?: boolean;

  invisible?: boolean;

  cursor?: string;

  // 드래그 허용 여부
  draggable?: boolean;

  progressive?: boolean;

  // 스타일
  style?: GraphicStyle;

  onclick?: any;

  onmouseover?: any;

  onmouseout?: any;

  onmousemove?: any;

  onmousewheel?: any;

  onmousedown?: any;

  onmouseup?: any;

  ondrag?: any;

  ondragstart?: any;

  ondragend?: any;

  ondragenter?: any;

  ondragleave?: any;

  ondragover?: any;

  ondrop?: any;
}
