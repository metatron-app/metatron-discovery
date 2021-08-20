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
import {Group} from './group';

/**
 * Created by LDL on 2017. 6. 16..
 */

export class User extends AbstractHistoryEntity {
  public id: string;
  public username: string;
  public password: string;
  public fullName: string;
  public email: string;
  public tel: string;
  public status: Status;
  public statusMessage: string;
  public imageUrl: string;

  public orgCodes?: string[];

  // TODO Role -> Group 으로 변경해야되는지 확인 필요
  public groups: Group[];
  // 추가 / 삭제 액션 여부 (추가(add), 삭제(remove))
  public op: Action;

  public roleNames: string[] = [];

  /**
   * for UI
   */
  public confirmPassword: string;

  public statusShowFl?: boolean;
}

export enum Status {
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED',
  REQUESTED = 'REQUESTED',
  ACTIVATED = 'ACTIVATED',
  INITIAL = 'INITIAL'
}

/**
 * 추가 / 삭제 액션
 */
export enum Action {
  add = 'ADD',
  remove = 'REMOVE'
}
