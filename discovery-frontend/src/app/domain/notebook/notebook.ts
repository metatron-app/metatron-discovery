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
import {Datasource} from '../datasource/datasource';

export class NoteBook extends Book {
  public refId: string;
  public connector: any;

  // 노트북에서 사용하는 변수 - 시작
  public id: string;
  public name: string;
  public type: string;
  public description: string; // R or PYTHON
  public kernelType: string;
  public dsType: string;
  public dsId: string;
  public dsName: string;
  public hostname: string;
  public port: string;
  public url: string;
  public datasource: Datasource;

  // datasource 생성시 경로 변수수
  public path: string;
  // 노트북에서 사용하는 변수 - 끝

  public workspace: string;
  public folderId: string;
}
