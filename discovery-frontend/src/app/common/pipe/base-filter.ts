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
 * Created by LDL on 2017. 7. 7..
 */
import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'baseFilter',
  pure: false
})
@Injectable()
export class BaseFilter implements PipeTransform {
  transform(items: any[], args: any[]): any[] {

    // 빈배열일 경우 그냥리턴
    if (items == null || items.length === 0) {
      return items;
    }

    // 필터링할 텍스트가 all일 경우 전체 리턴(임시 코드)
    if (args.length > 1 && args[1] === 'all') {
      return items;
    }

    // 필터링할 텍스트
    const filterText = args[1];

    // 필터링할 오브젝트의 키
    let filterKey = null;

    // 필터링할 텍스트를 포함이 아닌 제외할 경우
    let isExcept = false;

    // string array
    if (args.length === 1) {
      if (typeof args[0] === 'string') {

        return items.filter(item => {
          return (item.toLowerCase) ? item.toLowerCase().includes(args[0].toLowerCase()) : false;
        });
      }
      return items;
      // key가 있는 오브젝트
    } else if (args.length === 2) {
      filterKey = args[0];

      if (typeof filterText === 'string') {
        return items.filter(item => item[filterKey].toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
      } else if (typeof filterText === 'boolean') {
        return items.filter(item => item[filterKey] === filterText);
      }

      // 포함되지 않는 오프젝트
    } else if (args.length === 3) {
      filterKey = args[0];
      isExcept = args[2];
      // 해당 키를 제외할 경우
      if (isExcept) {

        // 오브젝트 배열일경우
        if (filterKey) {
          return items.filter(item => item[filterKey].indexOf(filterText) === -1);

          // 일반 배열일경우
        } else {
          return items.filter(item => item.indexOf(filterText) === -1);
        }

      } else {
        // 오브젝트 배열일경우
        if (filterKey) {
          return items.filter(item => item[filterKey].indexOf(filterText) !== -1);

          // 일반 배열일경우
        } else {
          return items.filter(item => item.indexOf(filterText) !== -1);
        }
      }
    } else {
      return items;
    }

  }
}
