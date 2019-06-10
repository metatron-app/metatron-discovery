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

import {AbstractHistoryEntity} from '../common/abstract-history-entity';
import {MetadataSource} from './metadata-source';
import {MetadataColumn} from './metadata-column';
import * as _ from 'lodash';

export class Metadata extends AbstractHistoryEntity {

  public id: string;
  public description: string;
  public name: string;
  public sourceType: SourceType;
  public source: MetadataSource;
  public catalogs: any;
  public tags: any;
  public popularity: number;
  public columns: MetadataColumn[];

  public static isSourceTypeIsEngine(sourceType: SourceType) {
    return _.negate(_.isNil)(sourceType)
      && sourceType === SourceType.ENGINE;
  }

  public static isSourceTypeIsStaging(sourceType: SourceType) {
    return _.negate(_.isNil)(sourceType)
      && sourceType === SourceType.STAGING;
  }

  public static isSourceTypeIsJdbc(sourceType: SourceType) {
    return _.negate(_.isNil)(sourceType)
      && sourceType === SourceType.JDBC;
  }

  public static isDisableMetadataNameCharacter(name: string) {
    return (/^[!@#$%^*+=()~`\{\}\[\]\-\_\;\:\'\"\,\.\/\?\<\>\|\&\\]+$/gi).test(name);
  }
}

export enum SourceType {
  ENGINE = <any>'ENGINE',
  STAGING = <any>'STAGEDB',
  STAGEDB = <any>'STAGEDB',
  JDBC = <any>'JDBC'
}
