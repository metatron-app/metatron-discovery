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
 * Created by LDL on 2017. 6. 13..
 */

/*
 * API CONSTANT
 */

import { CookieService } from 'ng2-cookies';
import { TranslateService } from '@ngx-translate/core';

class APIConstant {

  // API URL PREFIX
  public API_URL = '/api/';

  // API URL PREFIX
  public API_INTEGRATOR_URL = '/integrator/';

  // URL
  public URL: string = window.location.protocol + '//' + window.location.host;

  // BASE URL
  public BASE_URL = '/app/v2/';

  // API FULL URL PREFIX
  public API_FULL_URL: string = URL + '/api/';

  // API URL PREFIX
  public OAUTH_URL = '/oauth/';

  // API FULL URL PREFIX
  public OAUTH_FULL_URL: string = URL + '/oauth/';

  // API TIMEOUT 시간
  public TIMEOUT = 5000;

  // Page Size
  public PAGE_SIZE = 20;
  
  // Page Sort
  public PAGE_SORT_MODIFIED_TIME_DESC = 'modifiedTime,desc';

}

/*
 * COMMON CONSTANT SUMMARY
 */

export class CommonConstant {

  // API CONSTANT
  public static API_CONSTANT: APIConstant = new APIConstant();

  public static stomp: any;

  public static websocketId: string = '';

  public static cookieService: CookieService = new CookieService();

  public static COL_NAME_CURRENT_DATETIME:string = 'current_datetime';

  public static PROP_MAP_CONFIG:string = 'METATRON_PROP_MAP_CONFIG';

  public static MAP_ANALYSIS_LAYER_NAME:string = 'SpatialAnalysisLayer';

}
