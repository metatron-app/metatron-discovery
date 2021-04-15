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


import {Metadata} from './metadata';

export class DataCreator {

  public username: string;
  public creator: { id: string, username: string, fullName: string, email: string, imageUrl: string, createdTime: Date, modifiedTime: Date, lastAccessTime: Date };
  public count: number;
  public favorite: boolean = false;
  public dataList: Metadata[];
  public followerList: { id: string, username: string, email: string, fullName: string, imageUrl: string, createdTime: Date, modifiedTime: Date }[];
}
