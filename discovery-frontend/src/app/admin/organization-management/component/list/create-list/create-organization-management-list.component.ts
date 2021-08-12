import {Component, ElementRef, EventEmitter, Injector, Output} from '@angular/core';
import {StringUtil} from '@common/util/string.util';
import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {OrganizationService} from '../../../service/organization.service';

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

  // show flag
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

    if(this.isValidName && this.isValidCode &&
      (StringUtil.isEmpty(this.orgDesc) ? true : this.isValidDesc)){
      // 로딩 show
      this.loadingShow();

      this.organizationService.createOrganization(this._getCreateOrgParams()).then(()=>{
        // alert
        Alert.success(this.translateService.instant('msg.organization.alert.name.create', {value: this.orgName.trim()}));
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
      this.nameValidMsg = this.translateService.instant('msg.organization.alert.name.empty');
      return;
    }
    if (CommonUtil.getByte(this.orgName.trim()) > 150) {
      this.isValidName = false;
      this.nameValidMsg = this.translateService.instant('msg.organization.alert.name.len');
      return;
    }
    this._checkDuplicatedOrgName(StringUtil.replaceURIEncodingInQueryString(this.orgName.trim()));
  }


  public codeValidation(): void{
    // 코드가 비어 있다면
    if(StringUtil.isEmpty(this.orgCode)){
      this.isValidCode = false;
      this.codeValidMsg = this.translateService.instant('msg.organization.alert.code.empty');
      return;
    }
    // 코드 길이 체크
    if (StringUtil.isNotEmpty(this.orgCode) && CommonUtil.getByte(this.orgCode.trim()) > 20) {
      this.isValidCode = false;
      this.codeValidMsg = this.translateService.instant('msg.organization.alert.code.len');
      return;
    }
    // 코드 공백 체크
    if (StringUtil.isNotEmpty(this.orgCode) && this.orgCode.trim().includes(' ')){
      this.isValidCode = false;
      this.codeValidMsg = this.translateService.instant('msg.organization.alert.code.blank');
      return;
    }
    this._checkDuplicatedOrgCode(StringUtil.replaceURIEncodingInQueryString(this.orgCode.trim()));
  }

  public descValidation(): void{
    // 설명 길이 체크
    if (StringUtil.isNotEmpty(this.orgDesc) && CommonUtil.getByte(this.orgDesc.trim()) > 900) {
      this.isValidDesc = false;
      this.descValidMsg = this.translateService.instant('msg.organization.alert.desc.len');
      return;
    }
    this.isValidDesc = true;
  }

  private _getCreateOrgParams(): object {
    const result = {
      code: this.orgCode.trim()
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

  /**
   * 조직 이름 중복 체크
   * @param orgName
   * @private
   */
  private _checkDuplicatedOrgName(orgName: string): void{
    this.organizationService.getResultDuplicatedOrgName(orgName).then((result: {duplicated: boolean}) => {
      // 이름 사용 가능한 여부
      this.isValidName = !result.duplicated;
      // 이름이 중복이라면
      if(result.duplicated){
        this.nameValidMsg = this.translateService.instant('msg.organization.alert.name.used');
      }
    }).catch(error => this.commonExceptionHandler(error));
  }

  private _checkDuplicatedOrgCode(orgCode: string): void{
    this.organizationService.getResultDuplicatedOrgCode(orgCode).then((result: {duplicated: boolean}) => {
      // 코드 사용 가능한 여부
      this.isValidCode = !result.duplicated;
      // 코드가 중복이라면
      if(result.duplicated){
        this.codeValidMsg = this.translateService.instant('msg.organization.alert.code.used');
      }
    }).catch(error => this.commonExceptionHandler(error));
  }
}
