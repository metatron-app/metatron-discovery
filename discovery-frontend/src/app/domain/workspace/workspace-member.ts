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

import {DirectoryProfile} from '../user/directory-profile';
import {Workspace} from './workspace';

/**
 * Created by LDL on 2017. 7. 14..
 */
export class WorkspaceMember {
  public id: number;
  public memberName: string;
  public role: string;
  public workspace: Workspace;

  // Write Only
  public memberId: string;
  public memberType: MemberType;
}

export class WorkspaceMemberProjection {
  public id: string;
  public role: string;
  public member: DirectoryProfile;
}

export class WorkspaceMemberProjections {
  public members: WorkspaceMemberProjection[];
}

export enum MemberType {
  GROUP = 'GROUP',
  USER = 'USER',
}
