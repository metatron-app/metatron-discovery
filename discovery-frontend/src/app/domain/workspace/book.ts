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

/**
 * Created by LDL on 2017. 6. 29..
 */
import {AbstractHistoryEntity} from '../common/abstract-history-entity';
import {ImplementorType} from '../dataconnection/dataconnection';

/**
 * Created by LDL on 2017. 6. 16..
 */

export class Book extends AbstractHistoryEntity {
  public id: string;
  public type: string;
  public name: string;
  public description: string;
  public favorite: boolean;
  public tag: string;
  public workspace: any;
  public folderId: string;
  public contents: Contents;

  public kernelType: string;
  public dsName: string;

  // UI용 체크박스
  public checked: boolean;
  public edit: boolean;
}

export class Contents {
  public dataSource: number;
  public dashboard: number;
  public connType: ImplementorType;
  public connName: string;
  public connValid: boolean;
}

// 네비게이션 북 트리용
export class BookTree {
  public name: string;
  public id: string;
  public type: string;

  public books: BookTree[];
  public dashBoards: BookTree[];
  public hierarchies: any[];
}
