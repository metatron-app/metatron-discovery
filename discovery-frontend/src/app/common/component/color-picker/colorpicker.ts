
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

export class ColorPicker {

  // 프리셋 색상
  color: string;

  // alpha기능 설정여부
  showAlpha: boolean;

  // 색상 포멧
  preferredFormat: string;

  // input값 설정여부
  showInput: boolean;

  // palette show / hide
  showPalette: boolean;

  // 색상 초기값 show / hide
  showInitial: boolean;

  // 색상 코드리스트
  palette: string[][];

  // 사용자 정의 색상 show / hide
  showUserColor: boolean;

  // clickoutside시 change이벤트 발생여부
  clickoutFiresChange: boolean;
}
