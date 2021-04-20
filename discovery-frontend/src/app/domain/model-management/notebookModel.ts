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

export class NotebookModel extends AbstractHistoryEntity {

  public id: string;
  public name: string;
  public description: string;
  public notebookPath: string;
  public statusType: string;
  public subscribeType: string;
  public histories: History[];
  public notebook: Notebook[];

  // ui 에서만 사용
  public selected: boolean = false;
}

export class History extends AbstractHistoryEntity {
  public elapsedTime: number;
  public errorLog: string;
  public success: boolean;
}

export class Notebook extends AbstractHistoryEntity {
  public dsId: string;
  public dsName: string;
  public dsType: string;
  public favorite: boolean;
  public id: string;
  public kernelType: string;
}
