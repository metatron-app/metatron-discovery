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
 * File Name   : date.util
 *
 * Description : Date related utility component
 *
 * Developer   : wonjune
 *
 * Date        : 2017. 7. 7.
 */

export class DateUtil {

  /** 작성일자 체크 */
  isNewTagCheck(time) {
    const createdTime = new Date(time);
    const current = new Date();
    const btMs = current.getTime() - createdTime.getTime();
    const btDay = btMs / (1000 * 60 * 60 * 24);

    return btDay > 0 && btDay < 1;
  }

}
