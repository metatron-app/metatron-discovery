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

import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'fileSize'
})

@Injectable()
export class FileSizePipe implements PipeTransform {

  private units = [
    'bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB'
  ];

  transform(bytes: number = 0, precision: number = 2): string {
    if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) return '?';

    let unit = 0;
    let bytesArg = bytes;
    let precisionArg = precision;
    while (bytesArg >= 1024) {
      bytesArg /= 1024;
      unit += 1;
    }

    if (unit === 0) precisionArg = 0;
    return bytesArg.toFixed(+precisionArg) + ' ' + this.units[unit];
  }

}
