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
import {UserProfile} from '../user/user-profile';
import {Dashboard} from '../dashboard/dashboard';

export class Workbook extends Book {
  public configuration: any;
  public pages: any[];
  public dataSources: any[];
  // public workBookType: string;
}

export class WorkbookDefaultProjections extends Workbook {
  public createdBy: UserProfile;
  public modifiedBy: UserProfile;
  public folderId: string;
  public workspaceId: string;
}

export class WorkbookDetailProjections extends Workbook {
  public dashBoards: Dashboard[];
  public countOfComments: number;
  public dataSource: any[];
  public workspaceId: string;
}
