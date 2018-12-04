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

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // 도메인 (쿠키에서 사용)
  baseHref: '/app/v2/',
  // SAML 사용 여부
  samlUrl:'http://adsso.airtel.com/adfs/services/trust',
  integrator : {
    workflow : 'http://localhost:4300/app/v2/management/integrator/workflow',
    monitoring : 'http://localhost:4300/app/v2/management/integrator/monitoring',
    dependencies : 'http://localhost:4300/app/v2/management/integrator/dependencies'
  }
};
