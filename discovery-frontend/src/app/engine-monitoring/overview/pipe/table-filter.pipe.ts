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

@Pipe({
  name: 'tableFilter'
})
export class TableFilterPipe implements PipeTransform {

  transform(items: any[], filter: { [ key: string ]: any }): any {

    if (!(filter && Array.isArray(items))) {
      return items;
    }

    if (filter[ 'status' ] === 'ALL' && filter[ 'hostname' ] === '' && filter[ 'type' ].indexOf('ALL') > -1) {
      return items;
    }

    if (filter[ 'status' ] === 'ALL') {
      if (filter[ 'hostname' ] === '') {
        return items.filter(monitoring => filter[ 'type' ].indexOf(monitoring.type) > -1);
      } else {
        return items.filter(monitoring => monitoring.hostname.indexOf(filter[ 'hostname' ]) > -1)
          .filter(monitoring => filter[ 'type' ].indexOf(monitoring.type) > -1);
      }
    }

    if (filter[ 'type' ].indexOf('ALL') > -1) {
      if (filter[ 'hostname' ] === '') {
        return items.filter(monitoring => monitoring.status === (filter[ 'status' ] === 'OK'))
      } else {
        return items.filter(monitoring => monitoring.hostname.indexOf(filter[ 'hostname' ]) > -1)
          .filter(monitoring => monitoring.status === (filter[ 'status' ] === 'OK'))
      }
    }

    if (filter[ 'hostname' ] === '') {
      if (filter[ 'status' ] === 'ALL') {
        return items.filter(monitoring => filter[ 'type' ].indexOf(monitoring.type) > -1);
      } else {
        return items.filter(monitoring => monitoring.status === (filter[ 'status' ] === 'OK'))
          .filter(monitoring => filter[ 'type' ].indexOf(monitoring.type) > -1);
      }
    }

    return items
      .filter(monitoring => monitoring.hostname.indexOf(filter[ 'hostname' ]) > -1)
      .filter(monitoring => monitoring.status === (filter[ 'status' ] === 'OK'))
      .filter(monitoring => filter[ 'type' ].indexOf(monitoring.type) > -1);
  }
}
