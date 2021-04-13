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
  name: 'baseSort',
})
@Injectable()
export class BaseSort implements PipeTransform {
  transform(items: any[], args: any[]): any[] {

    if (items == null || items.length < 2 || args.length < 2) {
      return items;
    }

    // 정렬할 키
    const filterKey = args[0];
    // 정렬 방식
    const orderType = args[1] === 'desc' ? 'desc' : 'asc';

    if (args[1] === '' || args[1] === 'default') {
      return items;
    }

    let result;

    if (orderType === 'desc') {
      result = items.sort((a, b) => {
        let first = a;
        let second = b;
        if (filterKey) {
          first = first[filterKey];
          second = second[filterKey];
        }
        let comparison = 0;

        if (first < second) {
          comparison = 1;
        } else if (second < first) {
          comparison = -1;
        }

        return comparison;

      });
    } else {
      result = items.sort((a, b) => {
        let first = a;
        let second = b;
        if (filterKey) {
          first = first[filterKey];
          second = second[filterKey];
        }
        let comparison = 0;

        if (first > second) {
          comparison = 1;
        } else if (second > first) {
          comparison = -1;
        }

        return comparison;
      });
    }
    return result;
  }
}
