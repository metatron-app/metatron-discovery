import {AbstractComponent} from "@common/component/abstract.component";
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  Injector,
  ElementRef,
  ViewChild
} from "@angular/core";
import * as _ from "lodash";
import {MembersService} from "../../../../user-management/service/members.service";
import {GroupsService} from "../../../../user-management/service/groups.service";
import {Alert} from "@common/util/alert.util";
import {UpdateOrganizationManagementListComponent} from "./update-organization-management-list.component";
import {OrganizationService} from "../../../service/organization.service";
import {RoleType} from "@domain/user/role/role";
import {Action} from "@domain/user/user";
import {Organization} from "@domain/organization/organization";

@Component({
  selector: 'app-update-container-organization',
  templateUrl: './update-container-organization-management.component.html'
})
export class UpdateContainerOrganizationManagementComponent extends AbstractComponent implements OnInit, OnDestroy{

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 탭 0 -  Members of 1 - Groups
  @Input()
  public defaultTab: number;

  @Input()
  public orgData: Organization;

  @Input()
  public members : any;
  public cloneMembers : any;

  @Input()
  public groups : any;
  public cloneGroups : any;

  @Output()
  public cancelEvent = new EventEmitter();

  @Output()
  public applyEvent = new EventEmitter();

  public searchPlaceholder: string;
  public allList: any = [];


  public flag: boolean = false;

  @ViewChild(UpdateOrganizationManagementListComponent)
  public updateOrganizationComponent: UpdateOrganizationManagementListComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private organizationService: OrganizationService,
              private membersService: MembersService,
              private groupsService: GroupsService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Override Method
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
    this.cloneMembers = _.cloneDeep(this.members);
    this.cloneGroups = _.cloneDeep(this.groups);
    this.init(this.defaultTab);

  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Cancel 클릭시
   */
  public close() {
    this.cloneMembers = [];
    this.cloneGroups = [];

    this.cancelEvent.emit();
  }

  /**
   * DONE 클릭 시
   */
  public done() {
    const result = [];
    if(this.flag === false){

      this.members.forEach((item) => {
        if(_.findIndex(this.cloneMembers,{directoryName : item.directoryName}) === -1) {
          result.push({type : RoleType.USER, memberId : item.directoryId, op : Action.remove});
        }
      });
      // 현재 리스트가 원본 리스트에 존재하는지 확인
      this.cloneMembers.forEach((member) => {
        // 없다면 추가
        if (_.findIndex(this.members, {directoryName: member.directoryName}) === -1) {
          result.push({type : RoleType.USER, memberId : member.directoryId, op : Action.add});
        } else { // 있다면 권한 변경인지 그대로인지 확인

        }
      });

      this.groups.forEach((item) => {
        if(_.findIndex(this.cloneGroups,{directoryName : item.directoryName}) === -1) {
          result.push({type : RoleType.GROUP, memberId : item.directoryId, op : Action.remove});
        }
      });
      // 현재 리스트가 원본 리스트에 존재하는지 확인
      this.cloneGroups.forEach((member) => {
        // 없다면 추가
        if (_.findIndex(this.groups, {directoryName: member.directoryName}) === -1) {
          result.push({type : RoleType.GROUP, memberId : member.directoryId, op : Action.add});
        } else { // 있다면 권한 변경인지 그대로인지 확인

        }
      });

      this.flag = true;
      this.organizationService.addRemoveOrgMember(this.orgData.code, result).then(() => {
        this.allList = [];
        this.cloneGroups = [];
        this.cloneMembers = [];
        this.flag = false;
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this.applyEvent.emit();
      }).catch((err) => {
        Alert.warning(err);
      });

    }
  }

  /**
   * 탭 클릭 시 전환
   * @param tabNo
   */
  public onTabClick(tabNo: number) {
    this.defaultTab = tabNo;
    this.updateOrganizationComponent.allList = [];
    this.init(this.defaultTab);
  }

  /**
   * 화면 최초 진입시 실행. 어떤 Tab 인지에 따라 달라진다.
   * @param tabNo - ( 0 : member, 1 : group)
   */
  public init(tabNo){
    this.allList = [];
    if (tabNo === 0) {
      this.getMemberList(false);
    } else {
      this.getGroupList(false);
    }
  }

  public getMemberList(data): void {
    // 로딩 show
    this.loadingShow();

    if(data.isInitial === true){
      this.allList = [];
    }

    // member 리스트 조회
    this.membersService.getRequestedUser(data.params ? data.params : this.getParams())
      .then((result) => {
        // 페이지
        this.pageResult = result.page;
        this.searchPlaceholder = 'msg.groups.ui.update.search.ph';
        // 로딩 hide
        this.loadingHide();
        // 사용자 리스트 가져오기
        if (result._embedded) {
          this.allList = this.allList.length === 0 ? result._embedded.users : this.allList.concat(result._embedded.users);

          const simplifiedList = [];
          this.allList.map((item) => {
            simplifiedList.push({directoryId : item.username, directoryName : item.fullName, type : 'USER', imageUrl : item.imageUrl});

            // imageurl이 있으면 넣어준다.
            this.cloneMembers.forEach((memberData) => {
              if (memberData.directoryId === item.id && item.imageUrl) {
                memberData.imageUrl = item.imageUrl;
              }
            });
          });

          this.updateOrganizationComponent.init({allData : simplifiedList, defaultTab : this.defaultTab, selectedItems : this.cloneMembers, headers : this.getHeaders(), pageResult :this.pageResult});
        }
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 그룹 리스트 조회
   * @param data - set-member-group.component 에서 데이터를 보낸다면 ..
   */
  public getGroupList(data): void {
    // 로딩 show
    this.loadingShow();


    if(data.isInitial === true) {
      this.allList = [];
    }

    // group 리스트 조회
    this.groupsService.getGroupList(data.params ? data.params : this.getParams())
      .then((result) => {
        // 페이지
        this.pageResult = result.page;
        this.searchPlaceholder = 'msg.mem.ui.update.search.ph';
        // 데이터 있다면
        if (result._embedded) {
          // 그룹 리스트 가져오기
          this.allList = this.allList.length === 0 ? result._embedded.groups : this.allList.concat(result._embedded.groups);

          const simplifiedList = [];
          this.allList.map((item) => {
            simplifiedList.push({directoryId : item.id, directoryName : item.name, type : 'GROUP'});
          });

          this.updateOrganizationComponent.init({allData : simplifiedList, defaultTab : this.defaultTab, selectedItems : this.cloneGroups, headers : this.getHeaders(), pageResult :this.pageResult});
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // alert
        Alert.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  public checkEvent(data) {
    if (this.defaultTab === 0 ) {
      if (data.hasOwnProperty('index')) {
        this.cloneMembers.splice(data.index,1);
      } else {
        this.cloneMembers.push(data.item);
      }
    } else {
      if (data.hasOwnProperty('index')) {
        this.cloneGroups.splice(data.index,1);
      } else {
        this.cloneGroups.push(data.item);
      }
    }
  }


  /**
   * Get default params
   * 처음 화면을 열었을때 기본값을 설정한다
   */
  public getParams() : any {
    return { size: 15, page: 0 }
  }

  /**
   * Get Column name for each array
   * 배열에 따라 컬럼 수와 이름이 다르다.
   */
  public getHeaders() : any {

    let returnValue;
    if (this.defaultTab === 0) {
      returnValue = [
        { name: this.translateService.instant('msg.groups.th.update.fullname'), key: 'directoryName', width: '*' },
        { name: this.translateService.instant('msg.groups.th.update.username'), key: 'directoryId', width: '40%' },
        { name: '', key: '', width: '50px' }
      ]
    } else {
      returnValue = [
        { name: this.translateService.instant('msg.approval.th.group'), key: 'directoryName', width: '*' },
        { name: '', key: '', width: '50px' },
      ];
    }
    return returnValue
  }
}
