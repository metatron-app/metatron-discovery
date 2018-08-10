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

import { DomainType } from '../entity/domain-type.enum';
import { UserProfile } from '../user/user-profile';
import { AbstractHistoryEntity } from '../common/abstract-history-entity';

export class Comment extends AbstractHistoryEntity{
  public id: number;
  public contents: string;
  public domainType: DomainType;
  public domainId: string;
  public createdBy: UserProfile;
  public modifiedBy: UserProfile;

  // UI
  public isEdit: boolean = false;
  public modifyContents: string;
  public isNew: boolean = false;
}

export class Comments {
  public comments: Comment[];
}
