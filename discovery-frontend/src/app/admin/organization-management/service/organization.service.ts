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
   * 조직 생성
   * @param data 조직 데이터
   */
  public createOrganization(data: any): Promise<any>{

    // URL
    const url: string = this.API_URL + this.path;

    return this.post(url, data);
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
}
