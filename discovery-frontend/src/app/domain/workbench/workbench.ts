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

import {Book} from '../workspace/book';
import {Dataconnection} from '../dataconnection/dataconnection';

/**
 * Created by LDL on 2017. 7. 10..
 */
export class Workbench extends Book {
  public configuration: any;
  public pages: any[];
  public dataSources: any[];

  public globalVar: any;
  public queryEditors: any[];
  public dataConnection: Dataconnection = new Dataconnection();
  public name: string = '';
  public id: string = '';
  public folderId: string;

  public valid: boolean;

  // for UI
  public selectDataconnection: Dataconnection;
}

export class QueryEditor {
  public name: string;
  public order: number;
  public numRows: number;
  public query: string;
  public workbenchId: string;
  public webSocketId: string;
  public editorId: string;
  public workbench: string;
}
