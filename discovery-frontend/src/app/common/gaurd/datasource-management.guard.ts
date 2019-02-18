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

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../user/service/user.service';
import { SYSTEM_PERMISSION } from 'app/common/permission/permission';
import { CommonUtil } from '../util/common.util';

@Injectable()
export class DatasourceManagementGuard implements CanActivate {
  constructor(private userService:UserService) {}

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // 로그인 사용자 판별 후 권한 체크
    if (this.userService.isLoggedIn()) {
      return CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_DATASOURCE);
    } else {
      return false;
    }
  }
}
