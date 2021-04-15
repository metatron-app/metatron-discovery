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

export class LineageHistory extends AbstractHistoryEntity {
  public id: string;
  public name: string;
  public type: EntityType;
  public graph: any;
  public entities: LineageEntity[];
  public edges: LineageEdge[];
  public histories: History[];
  public from: string;
  public to: string;
  // ui에서 사용
  public selectedShapeId: string;
  public selectedShapeName: string;
  public selectedShapeType: string;
  public isSelectedColumn: boolean;
  public selectedSubColumnId: string;
}

export class SearchLineage extends AbstractHistoryEntity {
  public type: string;
  public name: string;
  public databaseName: string;
  public tableName: string;
  public dataLineageId: string;
  public selectTableLineage: SearchTableLineage;
  public selectSqlLineage: SearchSqlLineage;
}

export class SearchTableLineage extends AbstractHistoryEntity {
  // public cluster : string;
  public fieldName: string;
  public fieldType: string;
  public comment: string;
  public databaseName: string;
  public type: TableType;
  public tableName: string;
}

export enum TableType {
  TABLE = 'TABLE',
  COLUMN = 'COLUMN'
}

export class SearchSqlLineage extends AbstractHistoryEntity {
  public id: string;
  public sourceDataBaseName: string;
  public sourceTableName: string;
  public sourceFieldName: string;
  public targetDataBaseName: string;
  public targetTableName: string;
  public targetFieldName: string;
  public timestamp: Date;
  public cluster: string;
  public currentDatabase: string;
  public predicate: boolean;
  public predicateStr: string;
  public pruning: boolean;
  public sqlQuery: string;
  public sqlType: string;
}

export class LineageDownload extends AbstractHistoryEntity {
  public fromConnection: string;
  public fromType: EntityType;
  public fromEntity: string;
  public fromColumn: string;
  public toConnection: string;
  public toType: EntityType;
  public toEntity: string;
  public toColumn: string;
}

export enum ShapeType {
  EDGE = 'EDGE',
  NODE = 'NODE'
}

export enum EntityType {
  QUERY = 'QUERY',
  SQL = 'SQL',
  TABLE = 'TABLE',
  COLUMN = 'COLUMN',
  FILE = 'FILE',
  WORKFLOW = 'WORKFLOW',
  ADD = 'ADD'
}

export enum ColumnType {
  MEASURE = 'MEASURE',
  DIMENSION = 'DIMENSION',
}

export class LineageTableColumn {
  name: string;
  type: string;
  isSelect: boolean = false;
}

export class LineageTableColumnDetail {
  columnName: string;
  columnType: string;
  scheme: string;
  table: string;
  comment: string;
}

export class LineageShape {
  public shapeId: string;
  public shapeType: ShapeType;
  public isSelect: boolean = false;
}

export class LineageTableInformation {
  column1: string;
  column2: string;
  column3: string;
}

export class LineageEntity extends LineageShape {
  public type: string;
  public name: string = '';
  public sqlString: string = '';
  public databaseName: string = '';
  public tableName: string = '';
  public dataLineageId: string = '';
  public columns: LineageTableColumn[] = [];
  public allColumns: LineageTableColumnDetail[] = [];
  public detailed: LineageTableInformation[] = [];
  public storage: LineageTableInformation[] = [];
  public predicates: string[] = [];
  // ui에서 사용
  public graph: any;
  public xPos: number;
  public yPos: number;
  public timestamp: Date;
}

export class LineageEdge extends LineageShape {
  public fromTable: string;
  public fromColumn: string;
  public path: string;
  public toTable: string;
  public toColumn: string;
  public isPredicated: boolean = false;
  public predicate: string;
}
