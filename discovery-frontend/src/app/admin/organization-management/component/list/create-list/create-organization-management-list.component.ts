import {AbstractComponent} from "@common/component/abstract.component";
import {Component, ElementRef, EventEmitter, Injector, Output} from "@angular/core";
import {StringUtil} from "@common/util/string.util";
import {OrganizationService} from "../../../service/organization.service";
import {Alert} from "@common/util/alert.util";
import {CommonUtil} from "@common/util/common.util";

@Component({
  selector: 'app-create-organization-list',
  templateUrl: 'create-organization-management-list.component.html'
})
export class CreateOrganizationManagementListComponent extends AbstractComponent{

  // 조직 이름
  public orgName: string;
  // 조직 코드
  public orgCode: string;
  // 조직 설명
  public orgDesc: string;

  // name valid message
  public nameValidMsg: string;
  // code valid message
  public codeValidMsg: string;
  // description valid message
  public descValidMsg: string;

  // name valid result
  public isValidName: boolean;
  // code valid result
  public isValidCode: boolean;
  // description valid result
  public isValidDesc: boolean;

  //show flag
  public isShowPopup: boolean;

  @Output()
  public readonly createComplete: EventEmitter<any> = new EventEmitter();

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector,
              private organizationService: OrganizationService) {
    super(element, injector);
  }

  /**
   * init
   */
  public init(): void{
    this.orgName = undefined;
    this.orgCode = undefined;
    this.orgDesc = undefined;
    this.nameValidMsg = undefined;
    this.codeValidMsg = undefined;
    this.descValidMsg = undefined;
    this.isValidName = undefined;
    this.isValidCode = undefined;
    this.isValidDesc = undefined;
    this.isShowPopup = true;
  }

  /**
   * close
   */
  public createCancel(): void{
    this.isShowPopup = undefined;
  }

  /**
   * done
   */
  public createDone(): void {
    // // 로딩 show
    // this.loadingShow();
    //
    // this.organizationService.createOrganization(this._getCreateOrgParams()).then(()=>{
    //   // alert
    //   Alert.success('조직 생성 성공');
    //   // 로딩 hide
    //   this.loadingHide();
    //
    //   this.isShowPopup = false;
    //   this.createComplete.emit();
    // }).catch(error => this.commonExceptionHandler(error));

    if(this.isValidName && this.isValidCode &&
      (StringUtil.isEmpty(this.orgDesc) ? true : this.isValidDesc)){
      // 로딩 show
      this.loadingShow();

      this.organizationService.createOrganization(this._getCreateOrgParams()).then(()=>{
        // alert
        Alert.success('조직 생성 성공');
        // 로딩 hide
        this.loadingHide();

        this.isShowPopup = false;
        this.createComplete.emit();
      }).catch(error => this.commonExceptionHandler(error));

    }
  }

  /**
   * name validation
   */
  public nameValidation(): void{
    // 조직 이름이 비어 있다면
    if (StringUtil.isEmpty(this.orgName)){
      this.isValidName = false;
      this.nameValidMsg = this.translateService.instant('msg.groups.alert.name.empty');
      return;
    }
    if (CommonUtil.getByte(this.orgName.trim()) > 150) {
      this.isValidName = false;
      this.nameValidMsg = this.translateService.instant('msg.groups.alert.name.len');
      return;
    }
    this.isValidName = true;
  }


  public codeValidation(): void{
    // 코드 길이 체크
    if (StringUtil.isNotEmpty(this.orgCode) && CommonUtil.getByte(this.orgCode.trim()) > 20) {
      this.isValidDesc = undefined;
      // ***************
      this.descValidMsg = '이 부분 20바이트로 alert 수정해야함!!!';
      return;
    }
    this.isValidCode = true;
  }

  public descValidation(): void{
    // 설명 길이 체크
    if (StringUtil.isNotEmpty(this.orgDesc) && CommonUtil.getByte(this.orgDesc.trim()) > 900) {
      this.isValidDesc = undefined;
      // ***************
      this.descValidMsg = '이 부분 900바이트로 alert 수정해야함!!!';
      return;
    }
    this.isValidDesc = true;
  }

  private _getCreateOrgParams(): object {
    const result = {
      code: this.orgName.trim()
    };
    // 이름이 있는 경우
    if(StringUtil.isNotEmpty(this.orgName)){
      result['name'] = this.orgName.trim();
    }
    // 설명이 있는 경우
    if(StringUtil.isNotEmpty(this.orgDesc)){
      result['description'] = this.orgDesc.trim();
    }

    return result;
  }
}
