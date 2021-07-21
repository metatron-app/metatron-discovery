import {AbstractComponent} from "@common/component/abstract.component";
import {Component, ElementRef, Injector, OnInit, ViewChild} from "@angular/core";
import {PeriodData} from "@common/value/period.data.value";
import {PeriodComponent} from "@common/component/period/period.component";
import {ActivatedRoute} from "@angular/router";
import {isNullOrUndefined} from "util";
import {OrganizationService} from "../../service/organization.service";
import {Alert} from "@common/util/alert.util";
import {Organization} from "@domain/organization/organization";

declare let moment: any;

@Component({
  selector: 'app-organization-list',
  templateUrl: 'organization-management.-list.component.html'
})
export class OrganizationManagementListComponent extends AbstractComponent implements OnInit{

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 삭제확인 팝업
  // @ViewChild(ConfirmModalComponent)
  // private deleteConfirmPopup: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 조직 리스트
  public orgList: Organization[] = [];

  // 검색 키워드
  public searchKeyword: string = '';

  // date
  public selectedDate : PeriodData;

  // 검색 파라메터
  private _searchParams: { [key: string]: string };

  public initialPeriodData:PeriodData;

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  // 정렬
  public selectedContentSort: Order = new Order();


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private organizationService: OrganizationService) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Override Method
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui init
    this._initView();

    // 파라메터 조회
    this.subscriptions.push(
      this.activatedRoute.queryParams.subscribe(params => {


        const size = params['size'];
        (isNullOrUndefined(size)) || (this.page.size = size);

        const page = params['page'];
        (isNullOrUndefined(page)) || (this.page.page = page);

        const sort = params['sort'];
        if (!isNullOrUndefined(sort)) {
          const sortInfo = decodeURIComponent(sort).split(',');
          this.selectedContentSort.key = sortInfo[0];
          this.selectedContentSort.sort = sortInfo[1];
        }

        // 검색어
        const searchText = params['nameContains'];
        (isNullOrUndefined(searchText)) || (this.searchKeyword = searchText);

        this.selectedDate = new PeriodData();
        this.selectedDate.type = 'ALL';
        const from = params['from'];
        const to = params['to'];
        if (!isNullOrUndefined(from) && !isNullOrUndefined(to)) {
          this.selectedDate.startDate = from;
          this.selectedDate.endDate = to;

          this.selectedDate.startDateStr = decodeURIComponent(from);
          this.selectedDate.endDateStr = decodeURIComponent(to);
          this.selectedDate.type = params['type'];
          this.initialPeriodData = this.selectedDate;
          this.safelyDetectChanges();
        }

        // Organization 리스트 조회
        this._getOrganizationList();
      })
    );

  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터 모두 초기화
   */
  public initFilters() {
    // create date 초기화
    this.selectedDate = null;
    // 검색조건 초기화
    this.searchKeyword = '';
    // 페이지 초기화
    this.pageResult.number = 0;
    // sort 초기화
    this.selectedContentSort = new Order();
    // date 필터 created update 설정 default created로 설정
    this.periodComponent.selectedDate = 'CREATED';
    // date 필터 init
    this.periodComponent.setAll();
  }


  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getOrgParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage

  public isDefaultOrganization(item: Organization){
    if(item.id.includes('ID_ORG_DEFAULT')){
      return true;
    }
    return false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 가입 요청일자 변경시
   */
  public onChangeDate(data: PeriodData) {
    // 선택한 날짜
    this.selectedDate = data;
    // group 리스트 조회
    this.reloadPage();
  }

  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      // 재조회
      this.reloadPage(false);
    }
  } // function - changePag




  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * ui 초기화
   * @private
   */
  private _initView():void {
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 20;
    // search text
    this.searchKeyword = '';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _getOrganizationList(): void {
    // 로딩 show
    this.loadingShow();

    // this.orgList = [];

    // organization 리스트 조회
    const params = this._getOrgParams();
    this.organizationService.getOrganizationList(params).then((result) => {

      // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다
      if (this.page.page > 0 &&
        isNullOrUndefined(result['content']) ||
        (!isNullOrUndefined(result['content']) && result['content'].length === 0))
      {
        this.page.page = result.page.number - 1;
        this._getOrganizationList();
      }

      // 검색 파라메터 정보 저장
      this._searchParams = params;

      // 페이지
      this.pageResult = result.page;

      this.orgList = result.content;

      // 로딩 hide
      this.loadingHide();
    }).catch((error) => {
      Alert.error(error);
      // 로딩 hide
      this.loadingHide();
    })


  }

  /**
   * 그룹 리스트 조회에 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getOrgParams(): any {
    const params = {
      size: this.page.size,
      page: this.page.page,
      pseudoParam : (new Date()).getTime()
    };
    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }
    // 검색어
    if (this.searchKeyword.trim() !== '') {
      params['nameContains'] = this.searchKeyword.trim();
    }
    // date
    params['type'] = 'ALL';
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = 'CREATED';
      params['type'] = this.selectedDate.type;
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }

    return params;
  }
}





class Order {
  key: string = 'name';
  sort: string = 'asc';
}
