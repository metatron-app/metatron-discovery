import {AbstractComponent} from "@common/component/abstract.component";
import {Component, ElementRef, Injector, OnInit} from "@angular/core";
import * as _ from "lodash";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-organization-management',
  templateUrl: './organization-management.component.html'
})
export class OrganizationManagementComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 탭 리스트
  private tabList = [{ id: 'list' }];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선택된 탭 아이디
  public tabId: string = 'list';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Constructor
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute) {

    super(elementRef, injector);

    // pathVariable
    this.activatedRoute.params.subscribe((params) => {

      // tabId가 tabList에 없는경우
      if (-1 === _.findIndex(this.tabList, { id: params['tabId'] })) {

        // members페이지로 redirect
        this.router.navigateByUrl('/admin/organization/list').then();
      }

      // 탭 아이디를 설정
      this.tabId = params['tabId'];
    });
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 해당 tab으로 이동
   * @param tabId 탭 아이디
   */
  public gotoTab(tabId: string) {

    // 선택된 탭 아이디 설정
    this.tabId = tabId;

    // 페이지 이동
    this.router.navigateByUrl('/admin/organization/' + tabId).then();

  }
}
