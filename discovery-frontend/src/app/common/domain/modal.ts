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

export class Modal {
  public name: string;
  public description: string;
  public subDescription?: string;
  public btnName: string;
  public btnCancel?: string;
  public isShowCancel: boolean = true;
  public isScroll: boolean = false;
  public data?: any;
  public afterConfirm?: (confirmData?: Modal) => void;
}

export class Log {
  public title: string;
  public subTitle: string[];
  public data: string;
  public isShowCopy: boolean = false;
}
