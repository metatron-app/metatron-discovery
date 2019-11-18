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

/**
 * Simple utility pipe to use when searching in collections
 *
 * e.g )
 *  <li *ngFor="let user of users | filter:{ name: searchKey }:false">
 *    ...
 *  </li>
 */
@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], filter: { [key: string]: any }, isAnd: boolean): any {

    if (!(filter && Array.isArray(items))) {
      return items;
    }

    const filterKeys = Object.keys(filter);
    if (isAnd) {
      return items.filter(item => {
        filterKeys.reduce((memo, keyName) => (memo &&
          new RegExp(filter[keyName], 'gi').test(item[keyName])) ||
          filter[keyName] === '', true);
      });
    }

    return items.filter(item => {
      return filterKeys.some((keyName) => {
        return new RegExp(filter[keyName], 'gi').test(item[keyName]) ||
          filter[keyName] === '';
      });
    });

  }
}
