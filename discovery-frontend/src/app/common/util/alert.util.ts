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

import { CommonUtil } from './common.util';
import { Modal } from '../domain/modal';

declare let toastr;

// jquery toastr를 이용한 Alert

export class Alert {

  public static ERROR_NAME: string;
  public static MORE_BTN_DESC: string;
  public static CLOSE_BTN: string;

  private static _setDefaultOpts() {
    toastr.options = {
      closeButton: true,
      onlyShowNewest: true,
      newestOnTop: false,
      escapeHtml: true,
      positionClass: 'toast-top-center',
      showMethod: 'slideDown',
      showEasing: 'linear',
      hideMethod: 'slideUp',
      showDuration: 300,
      hideDuration: 300,
      timeOut: 3000,
      onCustomAction:null
    };
  } // function - _setDefaultOpts

  /**
   * Information Alert
   * @param {string} message
   */
  public static info(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.info(message, 'Information');
    }, Math.random() * 1000);
  } // function - info

  /**
   * Success Alert
   * @param {string} message
   */
  public static success(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.success(message, 'Success');
    }, Math.random() * 1000);
  } // function - success

  /**
   * Warning Alert
   * @param {string} message
   */
  public static warning(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.warning(message, 'Warning');
    }, Math.random() * 1000);
  } // function - warning

  /**
   * Fail Alert
   * @param {string} message
   */
  public static fail(message:string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.warning(message, 'Failed');
    }, Math.random() * 1000);
  } // function - fail

  /**
   * Error Alert
   * @param {string} message
   */
  public static error(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.error(message, 'Error');
    }, Math.random() * 1000);
  } // function - error

  /**
   * Error Alert
   * @param {string} message
   * @param {string} detailMsg
   */
  public static errorDetail(message: string, detailMsg: string): void {
    this._setDefaultOpts();
    toastr.options.escapeHtml = false;
    toastr.options.onCustomAction = () => {
      const modal = new Modal();
      modal.name = this.ERROR_NAME;
      modal.description = detailMsg;
      modal.isShowCancel = false;
      modal.isScroll = true;
      modal.btnName = this.CLOSE_BTN;
      CommonUtil.confirm(modal);
    };
    setTimeout(() => {
      toastr.error(message + `<br/><a class="toast-custom-action-button" href="javascript:" >` + this.MORE_BTN_DESC + `</a>`, 'Error');
    }, Math.random() * 1000);
  } // function - error

}
