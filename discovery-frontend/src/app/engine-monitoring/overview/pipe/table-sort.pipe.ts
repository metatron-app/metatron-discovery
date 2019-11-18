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

import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'tableSort'
})
export class TableSortPipe implements PipeTransform {

  transform(list: Array<Object>, property: string, direction: string = 'asc'): Array<Object> {

    // Check if is not null
    if (!list || !property || !direction) return list;

    list = _.cloneDeep(list);

    return list.sort((a: Object, b: Object) => {
      if (direction == 'desc') {
        return a[ property ] > b[ property ] ? -1 : a[ property ] < b[ property ] ? 1 : 0;
      } else {
        return a[ property ] < b[ property ] ? -1 : a[ property ] > b[ property ] ? 1 : 0;
      }
    })
  }

}
