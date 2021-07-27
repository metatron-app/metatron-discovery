import {AbstractService} from "@common/service/abstract.service";
import {Injectable, Injector} from "@angular/core";
import {CommonUtil} from "@common/util/common.util";

@Injectable()
export class OrganizationService extends AbstractService{

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // groups api 경로
  private path = 'organizations';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected injector: Injector) {
    super(injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 조직 리스트
   * @param param
   * @param projection
   */
  public getOrganizationList(param: any, projection: string = 'forListView'): Promise<any> {

    // URL
    let url: string = this.API_URL + this.path;

    if(param){
      url += '?' + CommonUtil.objectToUrlString(param);
    }
    return this.get(url + `&projection=${projection}`);
  }

  /**
   * 조직 상세정보 조회
   * @param orgCode
   * @param projection
   */
  public getOrganizationDetail(orgCode: string, projection: string = 'forDetailView'): Promise<any> {
    // URL
    const url: string = this.API_URL + this.path + `/${orgCode}`;
    return this.get(url + `?projection=${projection}`);
  }

  /**
   * 조직 내 멤버 조회
   * @param orgCode
   * @param pageParam
   * @param type
   */
  public getOrganizationUsers(orgCode: string, pageParam: {size: number, page: number}): Promise<any>{

    // URL
    let url: string = this.API_URL + this.path + '/' + orgCode + `/members?&type=USER`;

    if(pageParam){
      url +=  '&' + CommonUtil.objectToUrlString(pageParam);
    }

    return this.get(url);
  }

  /**
   * 조직 내 그룹 조회
   * @param orgCode
   * @param pageParam
   * @param type
   */
  public getOrganizationGroups(orgCode: string, pageParam: {size:number, page:number}, type: string = 'GROUP'): Promise<any>{
    // URL
    let url: string = this.API_URL + this.path + '/' + orgCode + `/members?type=${type}`;

    if(pageParam){
      url +=  '&' + CommonUtil.objectToUrlString(pageParam);
    }

    return this.get(url);
  }

  /**
   * 조직 이름 중복 체크
   * @param orgName
   */
  public getResultDuplicatedOrgName(orgName: string): Promise<any>{
    return this.post(this.API_URL + this.path + `/name/${orgName}/duplicated`, null);
  }

  /**
   * 조직 코드 중복 체크
   * @param orgCode
   */
  public getResultDuplicatedOrgCode(orgCode: string): Promise<any>{
    return this.post(this.API_URL + this.path + `/code/${orgCode}/duplicated`, null);
  }


  /**
   * 조직 생성
   * @param data 조직 데이터
   */
  public createOrganization(data: any): Promise<any>{
    // URL
    const url: string = this.API_URL + this.path;
    return this.post(url, data);
  }

  /**
   * 조직 정보 업데이트
   * @param data
   */
  public updateOrganization(orgCode: string, params: any): Promise<any>{
    // URL
    const url: string = this.API_URL + this.path + `/${orgCode}`;
    return this.put(url, params);
  }

  /**
   * 조직 멤버 및 그룹 업데이트
   * @param data
   */
  public addRemoveOrgMember(orgCode: string, data: any): Promise<any>{
    // URL
    const url: string = this.API_URL + this.path + `/${orgCode}/members`;
    return this.patch(url, data);
  }
  /**
   * 조직 삭제
   * @param orgCode
   */
  public deleteOrganization(orgCode: string): Promise<void> {
    return this.delete(this.API_URL + this.path + `/${orgCode}`);
  }
}
