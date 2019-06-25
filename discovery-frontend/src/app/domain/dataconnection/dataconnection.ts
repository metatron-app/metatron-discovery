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

// app.metatron.discovery.domain.dataconnection
export class Dataconnection extends AbstractHistoryEntity {
  public id: string;
  public name: string;
  public connectionInformation:JdbcDialect;
  public description: string;
  public type: string;
  public hostname: string;
  public port: number;
  public options: string;
  public username: string;
  public password: string;
  public sid:string;
  public url: string;
  public connectUrl: string;
  public implementor: ImplementorType;
  public newDataConnection: string;
  public database: string;
  public connectionDatabase: string;
  public catalog: string;
  public dbname: string;
  // properties
  public properties: any;
  public supportSaveAsHiveTable: boolean;

  public dataSources: any[];
  public workbenches: any[];

  public authenticationType:any; // detail-workbench-dataconnection-info 에서 오류 발생으로 임시 추가함

  // workbench 일경우 추가됨
  public published: boolean;
  public workspaces: any[];

  public linkedWorkspaces: number;

  // for UI
  public num:number;
}

// app.metatron.discovery.extension.dataconnection.jdbc.dialect
export interface JdbcDialect {
  scope: Scope;
  name: string;
  implementor: ImplementorType;
  inputSpec: InputSpec;
  iconResource1: string;
  iconResource2: string;
  iconResource3: string;
  iconResource4: string;
}

export class InputSpec {
  implementor: InputMandatory;
  authenticationType: InputMandatory;
  options: InputMandatory;
  database: InputMandatory;
  sid: InputMandatory;
  catalog: InputMandatory;
  username: InputMandatory;
  password: InputMandatory;

  public static isRequiredSid(inputSpec: InputSpec) {
    return inputSpec.sid === InputMandatory.MANDATORY;
  }

  public static isRequireDatabase(inputSpec: InputSpec): boolean {
    return inputSpec.database === InputMandatory.MANDATORY;
  }

  public static isRequireCatalog(inputSpec: InputSpec): boolean {
    return inputSpec.catalog === InputMandatory.MANDATORY;
  }
}

export enum ImplementorType {
  H2 = <any>'H2',
  MYSQL = <any>'MYSQL',
  ORACLE = <any>'ORACLE',
  TIBERO = <any>'TIBERO',
  HIVE = <any>'HIVE',
  HAWQ = <any>'HAWQ',
  POSTGRESQL = <any>'POSTGRESQL',
  MSSQL = <any>'MSSQL',
  PRESTO = <any>'PRESTO',
  PHOENIX = <any>'PHOENIX',
  NVACCEL = <any>'NVACCEL',
  STAGE = <any>'STAGE',
  DRUID = <any>'DRUID',
  FILE = <any>'FILE',
  NONE = <any>'NONE'
}


export enum InputMandatory {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
  NONE = 'NONE'
}

export enum Scope {
  EMBEDDED = 'EMBEDDED',
  EXTENSION = 'EXTENSION'
}

export enum AuthenticationType {
  USERINFO = <any>'USERINFO',
  MANUAL = <any>'MANUAL',
  DIALOG = <any>'DIALOG'
}
