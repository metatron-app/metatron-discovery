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

export namespace DataStorageConstant {
  export namespace Datasource {
    export enum BroadcastKey {
      DATASOURCE_CREATED_FIELD = 'DATASOURCE_CREATED_FIELD',
      DATASOURCE_CHANGED_SELECTED_FIELD = 'DATASOURCE_CHANGED_SELECTED_FIELD',
      // list
      DATASOURCE_CHANGED_FIELD_LIST = 'DATASOURCE_CHANGED_FIELD_LIST',
      DATASOURCE_CHANGED_CHECKED_FIELD_LIST = 'DATASOURCE_CHANGED_CHECKED_FIELD_LIST',
      // filter
      DATASOURCE_CHANGED_FIELD_LIST_FILTER = 'DATASOURCE_CHANGED_FIELD_LIST_FILTER',
    }

    export enum FilterKey {
      ROLE = 'ROLE',
      TYPE = 'TYPE',
      SEARCH = 'SEARCH',
    }

    export enum TimestampType {
      CURRENT = 'CURRENT',
      FIELD = 'FIELD'
    }
  }
}
