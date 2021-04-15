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

import {Dashboard} from '../dashboard';

export abstract class Widget {

  public id: string;
  public type: string;
  public name: string;
  public engineName: string;
  public description: string;
  public dashBoard: Dashboard;

  public configuration: WidgetConfiguration;

} // Class - Widget

export abstract class WidgetConfiguration {

  public type: string;    // 삭제 시 API 호출에 오류가 발생하여 남겨둠

} // Class - WidgetConfiguration
