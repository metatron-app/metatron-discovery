import {AbstractComponent} from "@common/component/abstract.component";
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Organization} from "@domain/organization/organization";
import {ActivatedRoute} from "@angular/router";
import {OrganizationService} from "../../../service/organization.service";
import {Alert} from "@common/util/alert.util";
import {Location} from '@angular/common';
import {Modal} from "@common/domain/modal";
import {ConfirmModalComponent} from "@common/component/modal/confirm/confirm.component";
import {OrganizationMember} from "@domain/organization/organization-member";
import {Role} from "@domain/user/role/role";
import {UpdateOrganizationManagementListComponent} from "../update-list/update-organization-management-list.component";
import {UpdateContainerOrganizationManagementComponent} from "../update-list/update-container-organization-management.component";
import {OrganizationGroup} from "@domain/organization/organization-group";


@Component({
  selector: 'app-detail-organization-list',
  templateUrl: 'detail-organization-management-list.component.html'
})
export class DetailOrganizationManagementListComponent extends AbstractComponent implements OnInit, OnDestroy{

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 조직 코드
  private _orgCode: string;

  // 공통 팝업 모달
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 조직 데이터
  public orgData: Organization = new Organization();

  // 조직 이름 수정
  public editName: string;
  // 조직 설명 수정
  public editDesc: string;
  // 조직 코드 수정
  public editCode: string;
  // 조직 이름 수정 플래그
  public editNameFlg: boolean;
  // 조직 코드 수정 플래그
  public editCodeFlg: boolean;
  // 조직 설명 수정 플래그
  public editDescFlg: boolean;

  public role: Role = new Role();
  public members: OrganizationMember[] = [];
  public groups: OrganizationGroup[] = [];

  public defaultTab: number;
  public isSetMemberGroupOpen: boolean = false;

  public simplifiedMemberList = [];
  public simplifiedGroupList = [];


  public isMembersDropdownOpen: boolean = false;
  public isGroupsDropdownOpen: boolean = false;

  @ViewChild(UpdateOrganizationManagementListComponent)
  public updateOrganizationComponent: UpdateOrganizationManagementListComponent;

  @ViewChild(UpdateContainerOrganizationManagementComponent)
  public updateContainerOrganizationComponent: UpdateContainerOrganizationManagementComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private activatedRoute: ActivatedRoute,
              protected element: ElementRef,
              private organizationService: OrganizationService,
              private _location: Location,
              protected injector: Injector) {
    super(element, injector);
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();

    // url orgCode 받아오기
    this.activatedRoute.params.subscribe((params) => {
      // orgCode
      this._orgCode = params['orgCode'];
      // ui init
      this._initView();
      // organization 상세 조회
      this._getOrgDetail(this._orgCode, true);
    });
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Open / close member drop down
   */
  public openMembersDropdown() {
    this.isMembersDropdownOpen ? this.isMembersDropdownOpen = false : this.isMembersDropdownOpen = true;
  }

  /**
   * Open / close group drop down
   */
  public openGroupsDropdown() {
    this.isGroupsDropdownOpen ? this.isGroupsDropdownOpen = false : this.isGroupsDropdownOpen = true;
  }

  /**
   * Open edit popup
   * @param type {string} members or groups
   */
  public openEditPopup(type: string) {

    if (type === 'members') {
      this.defaultTab = 0;
      this.isSetMemberGroupOpen = true;

    } else if (type === 'groups') {
      this.defaultTab = 1;

      this.isSetMemberGroupOpen = true;
    }
  }

  /**
   * Close set member and group popup
   */
  public closeSetMemberGroupPopup() {
    this.isSetMemberGroupOpen = false;
  }

  /**
   * Get members without first index
   */
  public filteredMembers() {
    return this.members.filter((item, index) => {
      if (index !== 0) {
        return item;
      }
    })
  }

  /**
   * Get groups without first index
   */
  public filteredGroups() {
    return this.groups.filter((item, index) => {
      if (index !== 0) {
        return item;
      }
    })
  }

  /**
   * 그룹 상세화면으로 들어가기
   * @param {string} groupId
   */
  public onClickLinkGroup(groupId: string): void {
    // 쿠키에 현재 url 저장
    this._savePrevRouterUrl();
    // 그룹 상세화면으로 이동
    this.router.navigate(['/admin/user/groups', groupId]);
  }

  public updateDetail() {
    this.isSetMemberGroupOpen = false;
    this._getMembersInOrg(this.orgData.code);
  }
  /**
   * 그룹 삭제
   */
  public deleteOrganization(): void{
    // 로딩 show
    this.loadingShow();

    this.organizationService.deleteOrganization(this.orgData.code).then(() => {
      // alert
      Alert.success(this.translateService.instant('msg.organization.alert.delete'));
      // loading hide
      this.loadingHide();
      // 기존에 저장된 route 삭제
      this.cookieService.delete('PREV_ROUTER_URL');

      // 그룹 관리 목록으로 돌아가기
      this._location.back();
    }).catch((error) => {
      // alert
      Alert.error(error);
      // 로딩 hide
      this.loadingHide();
    });
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 조직 목록으로 돌아가기
   */
  public onClickPrevOrgList(): void{
    const url = this.cookieService.get('PREV_ROUTER_URL');
    if(url) {
      this.cookieService.delete('PREV_ROUTER_URL');
      this.router.navigate([url]).then();
    } else {
      this._location.back();
    }
  }

  /**
   * 조직 삭제 클릭
   * @param orgCode
   */
  public onClickDeleteOrganization(): void{

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.organization.ui.delete.title');
    modal.description = this.translateService.instant('msg.organization.ui.delete.description');
    modal.btnName = this.translateService.instant('msg.organization.ui.delete.btn');

    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView() {
    this.orgData = new Organization();
  }

  private _getOrgDetail(orgCode: string, firstFlg: boolean = false): void{
    // 로딩 show
    this.loadingShow();
    // 상세정보 조회
    this.organizationService.getOrganizationDetail(orgCode).then((result) => {
      // organization 데이터
      this.orgData = result;
      // 최조 조회인지 확인
      firstFlg ? this._getMembersInOrg(orgCode) : this.loadingHide();
    }).catch((error) => {
      // alert
      Alert.error(error);
      // loading hide
      this.loadingHide();
    })
  }

  private _getMembersInOrg(orgCode: string): void{
    // 로딩 show
    this.loadingShow();

    const pageParam = {size: 10000, page: 0};

    // 멤버 유저 정보 조회
    this.organizationService.getOrganizationUsers(orgCode, pageParam).then((result) => {
      // 사용자 목록 초기화
      this.members = [];
      // 사용자 데이터 수 초기화
      this.orgData.userCount = 0;

      if(result.content){
        // 사용자 데이터
        this.members = result.content;
        // 사용자 데이터 수 변경
        this.orgData.userCount = result.content.length;
        this.simplifiedMemberList = [];

        this.members.map((item) => {
          this.simplifiedMemberList.push({
            directoryId: item.memberId,
            directoryName: item.profile.fullName,
            type: item.type
          });
        })
      } else {
        this.members = [];
        this.simplifiedMemberList = [];
      }
    }).catch((error) => {
      this.commonExceptionHandler(error);

      // loading hide
      this.loadingHide();

    });

    // 멤버 그룹 정보 조회
    this.organizationService.getOrganizationGroups(orgCode, pageParam).then((result) => {
      // 그룹 목록 초기화
      this.groups = [];
      // 그룹 목록 초기화
      this.orgData.groupCount = 0;
      this.simplifiedGroupList = [];

      if(result.content){
        // 그룹 데이터
        this.groups = result.content;
        // 그룹 데이터 수 변경
        this.orgData.groupCount = result.content.lenth;

        this.groups.map((item) => {
          this.simplifiedGroupList.push({
            directoryId: item.memberId,
            directoryName: item.profile.name,
            type: item.type
          });
        })
      } else {
        this.groups = [];
        this.simplifiedGroupList = [];
      }
    }).catch((error) => {
      this.commonExceptionHandler(error);
      // loading hide
      this.loadingHide();
    });

    this.loadingHide();
  }

  /**
   * 현재 url을 쿠키서비스에 저장
   * @private
   */
  private _savePrevRouterUrl(): void {
    this.cookieService.set('PREV_ROUTER_URL', this.router.url);
  }
}
