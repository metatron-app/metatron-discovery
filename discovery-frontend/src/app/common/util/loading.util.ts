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

import * as $ from 'jquery';

export class Loading {

  // 로딩 element
  public static $loading: any;

  constructor() {
    Loading.$loading = $('.ddp-loading');
  }

  /*
  * 로딩 표시
  */
  public static show() {
    (!this.$loading || 0 === this.$loading.length) && (this.$loading = $('.ddp-loading'));
    this.$loading.show();
  }

  /*
  * 로딩 숨김
  * */
  public static hide() {
    (!this.$loading || 0 === this.$loading.length) && (this.$loading = $('.ddp-loading'));
    this.$loading.hide();
  }

  /**
   * 로딩 표시 여부
   */
  public static isVisible(): boolean {
    (!this.$loading || 0 === this.$loading.length) && (this.$loading = $('.ddp-loading'));
    return this.$loading.is(':visible');
  } // func - isVisible

}
