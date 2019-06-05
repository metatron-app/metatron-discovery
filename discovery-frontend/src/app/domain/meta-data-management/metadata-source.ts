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

import { AbstractHistoryEntity } from '../common/abstract-history-entity';
import {Datasource} from '../datasource/datasource';
import {Dataconnection} from '../dataconnection/dataconnection';

export class MetadataSource extends AbstractHistoryEntity {
  // id
  public id: string;
  // metadata source type
  public type : MetadataSourceType;
  // metadata source id
  public sourceId: string;
  // metadata source name
  public name: string;
  // metadata source schema
  public schema: string;
  // metadata source table
  public table: string;
  // metadata source detail
  public sourceInfo: string;
  // Datasource
  public source: Datasource | Dataconnection;
}

export enum MetadataSourceType {
  ENGINE = <any>'ENGINE',
  STAGING = <any>'STAGING',
  STAGEDB = <any>'STAGEDB',
  JDBC = <any>'JDBC',
  DASHBOARD = <any>'DASHBOARD'
}
