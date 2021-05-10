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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Workspace} from '@domain/workspace/workspace';
import {RoleSet, RoleSetScope} from 'app/domain/user/role/roleSet';
import {PermissionService} from '../../../user/service/permission.service';
import {PermissionSchemaComponent} from './permission-schema.component';
import {PermissionSchemaChangeComponent} from './permission-schema-change.component';
import {WorkspaceService} from '../../service/workspace.service';

@Component({
  selector: 'app-workspace-permission-schema-set',
  templateUrl: './workspace-permission-schema-set.component.html',
})
export class WorkspacePermissionSchemaSetComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(PermissionSchemaChangeComponent)
  private _permissionSchemaChangeComp: PermissionSchemaChangeComponent;

  @ViewChild(PermissionSchemaComponent)
  private _permSchemaComp: PermissionSchemaComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public afterUpdate: EventEmitter<RoleSet> = new EventEmitter();

  // 컴포넌트 화면 표시 여부
  public isShow: boolean = false;

  // 현재 워크스페이스의 메인 RoleSet??
  public roleSet: RoleSet;

  // 워크스페이스 정보
  public workspace: Workspace;

  // 퍼미션 수정 가능 여부
  public isEditMode: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Component
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
              protected permissionService: PermissionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public init(initialData: Workspace) {
    $('body').removeClass('body-hidden').addClass('body-hidden');
    this.isShow = true;
    this.workspace = initialData;
    const wsRoleSet: RoleSet = this.workspace.roleSets[0];
    if (wsRoleSet) {
      // 기존에 등록된 RoleSet이 워크스페이스에 있는 경우 - 일반적인 경우
      this.loadingShow();
      // 룰셋 상세 조회
      this.permissionService.getRolesetDetail(wsRoleSet.id).then((result: RoleSet) => {
        this.roleSet = result;
        this.roleSet.scope = wsRoleSet.scope;   // Detail 에서 scope 정보가 없기 때문에 목록에서 나오는 값을 넣어준다.
        // Custom 여부는 어떻게 확인할 수 있는가??
        this.isEditMode = (RoleSetScope.PRIVATE === wsRoleSet.scope);
        this.loadingHide();
      });
    } else {
      // 기존에 등록된 RoleSet이 워크스페이스에 없는 경우 - 이전 버전에서 워크스페이스가 생성된 경우
      this.loadingShow();
      this.roleSet = new RoleSet();
      this.changeDetect.markForCheck();
      setTimeout(() => {
        // 롤셋 생성
        this._permSchemaComp.setRoleSets().then((result) => {
          // 롤셋 - 워크스페이스 연결
          this.workspaceService.updateWorkspace(
            this.workspace.id,
            {roleSets: ['/api/rolesets/' + result.id]} as any
          ).then(() => {
            // 룰셋 상세 조회
            this.permissionService.getRolesetDetail(result.id)
              .then((roleSetResult: RoleSet) => {
                this.roleSet = roleSetResult;
                this.roleSet.scope = RoleSetScope.PRIVATE;
                this.isEditMode = true;
                this.loadingHide();
              });
          }); // end of - updateWorkspace
        }); // end of - setRoleSets
      }, 500);
    }
  } // function - init

  /**
   * 컴포넌트 닫기
   */
  public close() {
    $('body').removeClass('body-hidden');
    this.isShow = false;
  } // function - close

  /**
   * 퍼미션 설정 완료 및 컴포넌트 닫기
   */
  public done() {
    this.loadingShow();
    this._permSchemaComp.setRoleSets().then((result) => {
      this.loadingHide();
      this.afterUpdate.emit(result);
      this.close();
    });
  } // function - done

  /**
   * 퍼미션 스키마 변경 컴포넌트 열기
   */
  public openChangePermissionSchema() {
    this._permissionSchemaChangeComp.init(this.workspace, this.roleSet);
  } // function - openChangePermissionSchema

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
