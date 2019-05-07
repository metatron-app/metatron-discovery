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
import {Injectable, Injector} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FileUploader} from 'ng2-file-upload';
import {CommonConstant} from '../constant/common.constant';
import {CookieConstant} from 'app/common/constant/cookie.constant';
import {CookieService} from 'ng2-cookies';

declare const html2canvas: any;

@Injectable()
export class ImageService {

  private uploader: FileUploader;

  private _http: HttpClient;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private cookieService: CookieService,
              protected injector: Injector) {
    this._http = injector.get(HttpClient);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * blob 데이터 가져오기
   * @param element
   * @returns {Promise<any>}
   */
  public getBlob(element: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let $element;
      if (typeof element === 'string') {
        $element = $(element);
      } else if (typeof element === 'object') {
        $element = element;
      }

      if (!$element || $element.length === 0) {
        reject('element not found.');
      }

      setTimeout(() => {
        html2canvas($element.get(0), {useCORS: true, allowTaint: true, logging: false}).then((result) => {
          const dataUrl = result.toDataURL('image/jpeg');
          const byteString = atob(dataUrl.split(',')[1]);

          const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i = i + 1) {
            ia[i] = byteString.charCodeAt(i);
          }

          console.info( '>>>>>>> mimeString' );

          const blobData = new Blob([ab], {'type': mimeString});

          console.info( '>>>>>>> blobData' );

          resolve(blobData);
        }).catch(err => reject(err));
      }, 500);

    });
  } // function - getBlob

  /**
   * base64 데이터 가져오기
   * @param element 혹은 selector
   * @returns {Promise<any>}
   */
  public getBase64(element: any): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      let $element;
      if (typeof element === 'string') {
        $element = $(element);
      } else if (typeof element === 'object') {
        $element = element;
      }

      if (!$element || $element.length === 0) {
        reject('element not found.');
      }

      html2canvas($element.get(0), {useCORS: true, allowTaint: true, logging: false}).then((result) => {
        const dataUrl = result.toDataURL('image/jpeg');
        resolve(dataUrl);
      }).catch(err => reject(err));

    });

  } // function - getBase64

  /**
   * element를 이미지로 변환한 후 다운로드받기
   * @param element
   * @param {string} fileName
   */
  public downloadElementImage(element: any, fileName: string) {
    let $element;
    if (typeof element === 'string') {
      $element = $(element);
    } else if (typeof element === 'object') {
      $element = element;
    }

    if (!$element || $element.length === 0) {
      throw new Error('element not found.');
    }

    setTimeout(() => {

      const agent = navigator.userAgent.toLowerCase();
      if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
        // is IE
        this.getBlob(element).then((data) => {
          window.navigator.msSaveBlob(data, fileName);
        });
      } else {
        // Other browser
        this.getBase64(element).then((data) => {

          // a 태그 만들기
          const link = document.createElement('a');
          // 해당 태그에 url 설정
          link.href = data;

          // 파일 이름 설정
          link.download = fileName;

          // 해당 차트 링크를 설정
          document.body.appendChild(link);

          // 다운로드 trigger
          link.click();

          // 해당 링크 제거
          document.body.removeChild(link);
        });
      }
    }, 500);
  } // function - downloadFromElement


  /**
   * 이미지 URL로 부터 파일 다운로드
   * @param {string} url
   * @returns {Promise<any>}
   * @private
   */
  public downloadImageFromUrl(url: string): Promise<any> {

    const imgUrl: string = '/api/images/load/url?url=' + url;

    // 헤더
    const headers = new HttpHeaders({
      'Accept': 'image/webp,image/apng,image/*,*/*;',
      'Content-Type': 'application/octet-binary',
      'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)
        + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
    });
    return this._http.get(imgUrl, {headers: headers, responseType: 'blob'}).toPromise();
  } // function - downloadImageFromUrl

  /**
   * 이미지 업로드
   * @param {string} fileName
   * @param blobData
   * @param {string} itemId
   * @param {string} domain
   * @param {number} thumbnailSize
   * @returns {Promise<any>}
   */
  public uploadImage(fileName: string, blobData: any, itemId: string, domain: string, thumbnailSize: number = 100): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      const url: string = CommonConstant.API_CONSTANT.API_URL + `images/upload?itemId=${itemId}&domain=${domain}&thumbnailSize=${thumbnailSize}`;
      const options = {
        url,
        headers: [{
          name: 'Accept',
          value: 'application/json, text/plain, */*',
        }]
      };

      this.uploader = new FileUploader(options);
      this.uploader.onBeforeUploadItem = (item) => {
        item.method = 'POST';
      };

      // 이미지 업로드 성공
      this.uploader.onSuccessItem = (item, response, status, headers) => {
        if (typeof response === 'string') {
          resolve(JSON.parse(response));
        } else {
          resolve(response);
        }
      };

      // 이미지 업로드 실패
      this.uploader.onErrorItem = (item, response, status, headers) => {
        if (typeof response === 'string') {
          reject(JSON.parse(response));
        } else {
          reject(response);
        }

      };

      blobData['name'] = fileName;
      this.uploader.addToQueue([blobData]);
      this.uploader.uploadAll();
    });
  } // function - uploadImage

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
