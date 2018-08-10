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
 * Created by juheeko on 19/10/2017.
 */

export class GroupConstant {

  // 시스템 관리자
  public SYSTEM_ADMIN      = 'SYSTEM_ADMIN';
  // 데이터 관리자
  public SYSTEM_SUPERVISOR = 'SYSTEM_SUPERVISOR';
  // 일반 사용자
  public SYSTEM_USER       = 'SYSTEM_USER';
}

/*
 * 사용자 관리 constant
 */

export class UserManagementConstant {

  // Group (Role)
  public static GROUP: GroupConstant = new GroupConstant();
}
