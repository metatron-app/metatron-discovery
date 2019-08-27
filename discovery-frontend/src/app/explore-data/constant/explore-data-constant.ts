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

export namespace ExploreDataConstant {
  export namespace Metadata {
    export enum TypeIconClass {
      DATASOURCE = 'type-datasource',
      DATABASE = 'type-database',
      STAGING_DB = 'type-stagingdb',
      DATA_SET = 'type-dataset',
    }
  }

  export enum SearchRange {
    ALL = 'keyword',
    DATA_NAME = 'nameContains',
    DESCRIPTION = 'descContains',
    CREATOR = 'creatorContains',
  }

  export enum LnbTab {
    CATALOG = 'CATALOG',
    TAG = 'TAG'
  }

  export enum BroadCastKey {
    EXPLORE_INITIAL = 'EXPLORE_INITIAL',
  }
}
