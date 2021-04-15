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

import {PageResult} from '../common/page';

export namespace Engine {

  export enum NodeType {
    ALL = 'ALL',
    BROKER = 'broker',
    COORDINATOR = 'coordinator',
    HISTORICAL = 'historical',
    OVERLORD = 'overlord',
    MIDDLE_MANAGER = 'middleManager'
  }

  export class Monitoring {
    id: string;
    type: NodeType;
    hostname: string;
    port: string;
    status: boolean;
    errorMessage: string;
    errorTime: string;
    errorDuration: string;

    ////////////////////////////////////////////////////////////////////////////
    // Value to be used only on View
    ////////////////////////////////////////////////////////////////////////////

    public static ofEmpty() {
      return new Monitoring();
    }
  }

  export namespace Cluster {

    export enum Code {
      NORMAL = 'normal',
      WARN = 'warn',
      ERROR = 'error'
    }

    export class Status {
      coordinator: Code;
      historical: Code;
      middleManager: Code;
      broker: Code;
      overlord: Code;
    }
  }

  export namespace Result {

    // tslint:disable-next-line:no-shadowed-variable
    export class Monitoring {
      _embedded: {
        monitorings: Engine.Monitoring[];
      };
      page: PageResult;
    }

    export class Health extends Cluster.Status {
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  // Value to be used only on View
  ////////////////////////////////////////////////////////////////////////////

  export type MonitoringRouterParams = { 'type': Engine.ContentType, 'group': any };

  export enum ContentType {
    OVERVIEW = 'overview',
    INGESTION = 'ingestion',
    QUERY = 'query',
    DATASOURCE = 'datasource'
  }

  export class Constant {
    public static readonly ROUTE_PREFIX = 'management/engine-monitoring/';
  }

  export class Content {

    constructor(private value: ContentType) {
    }

    private static readonly overview = new Content(ContentType.OVERVIEW);
    private static readonly ingestion = new Content(ContentType.INGESTION);
    private static readonly query = new Content(ContentType.QUERY);
    private static readonly datasource = new Content(ContentType.DATASOURCE);

    public toString() {
      return this.value;
    }

    public isOverview() {
      return this.value === Content.overview.toString();
    }

    public isIngestion() {
      return this.value === Content.ingestion.toString();
    }

    public isQuery() {
      return this.value === Content.query.toString();
    }

    public isDatasource() {
      return this.value === Content.datasource.toString();
    }
  }

  export enum MonitoringStatus {
    ALL = 'ALL',
    OK = 'OK',
    ERROR = 'ERROR'
  }

  export enum TableSortDirection {
    NONE = '',
    DESC = 'desc',
    ASC = 'asc'
  }

  export enum ViewMode {
    GRID = 'grid',
    CARD = 'card'
  }

  export enum IngestionContentType {
    TASK = 'task',
    SUPERVISOR = 'supervisor',
    REMOTE_WORKER = 'worker'
  }

  export enum MonitoringTarget {
    MEM = 'MEM',
    GC_COUNT = 'GC_COUNT',
    GC_CPU = 'GC_CPU',
    QUERY_TIME = 'QUERY_TIME',
    QUERY_COUNT = 'QUERY_COUNT',
    SUPERVISOR_LAG = 'SUPERVISOR_LAG',
    TASK_ROW = 'TASK_ROW'
  }
}
