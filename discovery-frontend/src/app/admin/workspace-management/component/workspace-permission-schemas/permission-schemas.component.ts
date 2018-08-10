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

import { AbstractComponent } from '../../../../common/component/abstract.component';
import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PeriodComponent } from '../../../../common/component/period/period.component';
import { PeriodData } from '../../../../common/value/period.data.value';
import { ConfirmModalComponent } from '../../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../../common/domain/modal';
import { PermissionService } from '../../../../user/service/permission.service';
import { RoleSet, RoleSetScope } from '../../../../domain/user/role/roleSet';
import { Alert } from '../../../../common/util/alert.util';
import { CreatePermissionSchemaComponent } from './create-permission-schema.component';
import { Page } from '../../../../domain/common/page';

declare let moment: any;

@Component({
  selector: 'app-permission-schemas',
  templateUrl: './permission-schemas.component.html'
})
export class PermissionSchemasComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 공통 확인 팝업
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  @ViewChild(CreatePermissionSchemaComponent)
  private _createPermissionSchemaComp:CreatePermissionSchemaComponent;

  // date
  private _filterDate: PeriodData;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // RoleSet 목록
  public roleSetList: RoleSet[] = [];

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  // 검색 키워드
  public searchText: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private permissionService: PermissionService,
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
    // ui 초기화
    this._initView();
    // 퍼미션 스키마 조회
    this._getRoleSetList();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터 모두 초기화
   */
  public initFilters() {
    // create date 초기화
    this._filterDate = null;
    // date 필터 created update 설정 default created로 설정
    this.periodComponent.selectedDate = 'CREATED';
    // 검색조건 초기화
    this.searchText = '';
    // 페이지 초기화
    this.pageResult.number = 0;
    // date 필터 init
    this.periodComponent.setAll();
  }

  /**
   * modal 이벤트 후 핸들러
   * @param {Modal} modal
   */
  public confirmHandler(modal: Modal): void {
    modal.data === 'CLONE' ? this._clonePermissionSchema(modal['schemaId']) : this._deletePermissionSchema(modal['schemaId']);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 스키마 리스트 초기화 후 재조회
   */
  public getPermissionSchemaInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 스키마 리스트 초기화
    this.roleSetList = [];
    // 스키마 리스트 조회
    this._getRoleSetList();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 더 조회할 컨텐츠가 있는지 여부
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 퍼미션 스키마 상세 페이지 오픈
   * @param {RoleSet} roleSet
   */
  public onClickDetailPermissionSchema(roleSet: RoleSet): void {
    this.router.navigate(['/admin/workspaces/permission', roleSet.id]).then();
  }

  /**
   * 퍼미션 스키마 생성 클릭
   */
  public onClickCreatePermissionSchema(): void {
    this._createPermissionSchemaComp.init();
  } // function - onClickCreatePermissionSchema

  /**
   * 퍼미션 스키마 삭제 클릭
   * @param {RoleSet} roleSet
   */
  public onClickDeletePermissionSchema(roleSet: RoleSet): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    // 연관 워크스페이스 목록 조회

    this.loadingShow();
    const param = new Page();
    param.page = 0;
    param.size = 1000;
    param.sort = 'name,asc';
    this.permissionService.getWorkspacesByRoleSet(roleSet.id, param).then(result => {
      const modal = new Modal();
      if (result && result['_embedded'] && result['_embedded']['workspaces']) {
        modal.subDescription = result['_embedded']['workspaces'].map( item => item.name ).join( ',' );
      }

      modal.data = 'DELETE';
      modal.name = '정말 삭제하시겠습니까?';
      modal.description = `삭제를 선택하면 다음 ${roleSet.linkedWorkspaces ? roleSet.linkedWorkspaces : 0}개의 워크스페이스에 Default schema가 적용됩니다`;
      modal.btnName = '스키마 삭제';
      // schema id
      modal['schemaId'] = roleSet.id;
      // 팝업 창 오픈
      this._confirmModalComponent.init(modal);

      this.loadingHide();
    }).catch((error) => this.commonExceptionHandler(error));
  } // function - onClickDeletePermissionSchema

  /**
   * 퍼미션 스키마 복제 클릭
   * @param {RoleSet} roleSet
   */
  public onClickClonePermissionSchema(roleSet: RoleSet): void {
    // 이벤트 전파 stop
    event.stopImmediatePropagation();
    const modal = new Modal();
    modal.data = 'CLONE';
    modal.name = `\'${roleSet.name}\' 스키마를 복제하시겠습니까?`;
    modal.btnName = '스키마 복제';
    // schema id
    modal['schemaId'] = roleSet.id;

    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /**
   * 필터링 켈린더 선택
   * @param event
   */
  public onFilterDate(event): void {
    // 선택한 날짜
    this._filterDate = event;
    // permission 리스트 재조회
    this.getPermissionSchemaInit();
  }

  /**
   * 더보기 버튼 클릭
   */
  public onClickMoreContents(): void {
    // 페이지 넘버 증가
    this.pageResult.number += 1;
    // 퍼미션 스키마 조회
    this._getRoleSetList();
  }

  /**
   * 스키마 이름 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
  }

  /**
   * 스키마 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 목록 정렬 필터링
   * @param {string} key
   */
  public onFilterSort(key: string): void {
    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== key ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = key;

    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }
    // 퍼미션 스키마 재조회
    this.getPermissionSchemaInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   * @private
   */
  private _initView(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 20;
    // search text
    this.searchText = '';
  }

  /**
   * 검색어로 멤버 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchText = keyword;
    // 퍼미션 스키마 재조회
    this.getPermissionSchemaInit();
  }

  /**
   * 퍼미션 스키마 복사
   * @param {string} schemaId
   * @private
   */
  private _clonePermissionSchema(schemaId: string): void {
    // 로딩 show
    this.loadingShow();
    // 퍼미션 스키마 복사
    this.permissionService.copyRoleset(schemaId)
      .then((result) => {
        // alert
        Alert.success(`'${result.name}' 스키마가 생성되었습니다`);
        // 재조회
        this.getPermissionSchemaInit();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /**
   * 퍼미션 스키마 삭제
   * @param {string} schemaId
   * @private
   */
  private _deletePermissionSchema(schemaId: string): void {
    // 로딩 show
    this.loadingShow();
    // 퍼미션 스키마 삭제
    this.permissionService.deleteRoleset(schemaId)
      .then(() => {
        // alert
        Alert.success('스키마가 삭제되었습니다');
        // 재조회
        this.getPermissionSchemaInit();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 퍼미션 스키마 목록 조회
   * @private
   */
  private _getRoleSetList(): void {
    this.loadingShow();
    this.permissionService.getRolesets(this._getPermissionSchemaParams())
      .then((result) => {
        // 페이지
        this.pageResult = result.page;
        // 데이터 있다면
        if (result._embedded) {
          this.roleSetList = this.roleSetList.length === 0 ? result._embedded.roleSets : this.roleSetList.concat(result._embedded.roleSets);
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  } // function - _getRoleSetList

  /**
   * 퍼미션 목록 조회시 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getPermissionSchemaParams(): object {
    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      scope : RoleSetScope.PUBLIC
    };
    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }
    // 검색어
    if (this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }

    // date
    if (this._filterDate && this._filterDate.type !== 'ALL') {
      params['searchDateBy'] = 'CREATED';
      if (this._filterDate.startDateStr) {
        params['from'] = moment(this._filterDate.startDateStr).subtract(9, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z';
      }
      params['to'] = moment(this._filterDate.endDateStr).subtract(9, 'hours').format('YYYY-MM-DDTHH:mm:ss.sss') + 'Z';
    }

    return params;
  } // function - _getPermissionSchemaParams

}

class Order {
  key: string = 'name';
  sort: string = 'asc';
}
