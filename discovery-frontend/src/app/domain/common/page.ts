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

import { CommonConstant } from '@common/constant/common.constant';

/**
 * 페이지 파라미터용
 */
export class Page {
  public page: number = 0;
  public size: number = CommonConstant.API_CONSTANT.PAGE_SIZE;
  public sort: string = CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC;
  public column: string = '';
}

/**
 * 페이징 결과가 필요한 도메인에 상속받아서 사용
 */
export class PageResult {
  public number: number;
  public size: number;
  public totalElements: number;
  public totalPages: number;
}
