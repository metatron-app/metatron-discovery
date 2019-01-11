/*
 *
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

import { Injectable, Injector } from '@angular/core';
import { TranslateService } from 'ng2-translate';

@Injectable()
export class SchemaConfigService {

  private _translateService: TranslateService;

  public timeZoneList: TimeZoneObject[];

  constructor(protected injector: Injector) {
    this._translateService = injector.get(TranslateService);
  }


  private _setTimeZoneList(): void {
    this.timeZoneList = [
      {utc: '+00:00', city: '', country: '', tz: ''}
    ];
  }
}

interface TimeZoneObject {
  utc: string;
  city: string;
  country: string;
  tz: string;
  code?: string;
  label?: string;
}
