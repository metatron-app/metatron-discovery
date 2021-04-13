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

import {Injectable} from '@angular/core';
import {FileLikeObject, FileUploader} from 'ng2-file-upload';
import {Alert} from '../util/alert.util';

@Injectable()
export class FileService {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private uploader: FileUploader;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor() {

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public uploadFile() {
    return new Promise<any>((resolve, _reject) => {

      // const url = CommonConstant.API_CONSTANT.API_URL + ``;
      // const options = {
      //   url,
      //   headers: [{
      //     name: 'Accept',
      //     value: 'application/json, text/plain, */*',
      //   },
      //     {
      //       name: 'Authorization',
      //       // value: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      //     }]
      // };

      // this.uploader = new FileUploader(options);

      // method
      this.uploader.onBeforeUploadItem = (item) => {
        item.method = 'POST';
      };

      // 파일 형식을 지원하지 않을 때
      this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, _filter: any, _options: any) => {
        Alert.error(item.name + '이 파일은 지원하지 않는 형식의 파일입니다.');
      };

      // 이미지 업로드 성공
      this.uploader.onSuccessItem = (item, response, status, headers) => {
        const success = true;
        resolve({success, item, response, status, headers});
      };

      // 이미지 업로드 실패
      this.uploader.onErrorItem = (item, response, status, headers) => {
        resolve({item, response, status, headers});
      };


    });
  }
}
