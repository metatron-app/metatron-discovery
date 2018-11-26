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

import { DataSourceListFilter } from './datasourceListFilter';

export class DatasourceCriterion {
  // key
  public criterionKey: CriterionKey;
  // type
  public criterionType: CriterionType;
  // name
  public criterionName: string;
  // sub criterion
  public subCriteria: DatasourceCriterion[];
  // filters
  public filters: DataSourceListFilter[];
  // is enable search
  public searchable: boolean;
}

export enum CriterionKey {
  STATUS = <any>'STATUS',
  PUBLISH = <any>'PUBLISH',
  CREATOR = <any>'CREATOR',
  DATETIME = <any>'DATETIME',
  CONNECTION_TYPE = <any>'CONNECTION_TYPE',
  DATASOURCE_TYPE = <any>'DATASOURCE_TYPE',
  SOURCE_TYPE = <any>'SOURCE_TYPE',
  MORE = <any>'MORE',
  CONTAINS_TEXT = <any>'CONTAINS_TEXT',
  CREATED_TIME = <any>'CREATED_TIME',
  MODIFIED_TIME = <any>'MODIFIED_TIME'
}

export enum CriterionType {
  CHECKBOX = <any>'CHECKBOX',
  RADIO = <any>'RADIO',
  DATETIME = <any>'DATETIME',
  RANGE_DATETIME = <any>'RANGE_DATETIME',
  TEXT = <any>'TEXT'
}
