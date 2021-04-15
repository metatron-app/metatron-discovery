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

export class Group extends AbstractHistoryEntity {
  // group id
  public id: string;
  // group name
  public name: string;
  // group desc
  public description: string;
  // group predefined
  public predefined: boolean;
  // group member count
  public memberCount: number;
  // group member list
  public members: any[];
  // 읽기 전용 - API Only
  public readOnly: boolean;
  // 권한 이름 목록
  public roleNames: string[] = [];

  public contexts: string;
}
