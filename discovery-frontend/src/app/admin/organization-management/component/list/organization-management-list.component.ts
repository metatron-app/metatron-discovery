import {AbstractComponent} from "@common/component/abstract.component";
import {Component, ElementRef, Injector, OnInit, ViewChild} from "@angular/core";
import {PeriodData} from "@common/value/period.data.value";
import {PeriodComponent} from "@common/component/period/period.component";
import {ActivatedRoute} from "@angular/router";
import {OrganizationService} from "../../service/organization.service";
import {Alert} from "@common/util/alert.util";
import {Organization} from "@domain/organization/organization";
import {CreateOrganizationManagementListComponent} from "./create-list/create-organization-management-list.component";
import {Modal} from "@common/domain/modal";
import {ConfirmModalComponent} from "@common/component/modal/confirm/confirm.component";

declare let moment: any;

@Component({
  selector: 'app-organization-list',
  templateUrl: 'organization-management-list.component.html'
})
export class OrganizationManagementListComponent extends AbstractComponent implements OnInit{

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 공통 팝업 모달
  @ViewChild(ConfirmModalComponent)
  private _confirmModalComponent: ConfirmModalComponent;

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

  // 조직 생성 팝
  @ViewChild(CreateOrganizationManagementListComponent)
  public createOrgPopup: CreateOrganizationManagementListComponent;
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
        ( this.isNullOrUndefined(size)) || (this.page.size = size);

        const page = params['page'];
        ( this.isNullOrUndefined(page)) || (this.page.page = page);

        const sort = params['sort'];
        if (! this.isNullOrUndefined(sort)) {
          const sortInfo = decodeURIComponent(sort).split(',');
          this.selectedContentSort.key = sortInfo[0];
          this.selectedContentSort.sort = sortInfo[1];
        }

        // 검색어
        const searchText = params['nameContains'];
        ( this.isNullOrUndefined(searchText)) || (this.searchKeyword = searchText);

        this.selectedDate = new PeriodData();
        this.selectedDate.type = 'ALL';
        const from = params['from'];
        const to = params['to'];
        if (!this.isNullOrUndefined(from) && !this.isNullOrUndefined(to)) {
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


  /**
   * 그룹 생성 팝업 show
   */
  public onClickCreateModal() {

    // 모달 show
    this.createOrgPopup.init();
  }

  public onOpenDeleteOrganization(orgCode: string): void{
    //event stop
    event.stopPropagation();

    const modal = new Modal();
    modal.data = 'DELETE';
    modal.name = this.translateService.instant('msg.organization.ui.delete.title');
    modal.description = this.translateService.instant('msg.organization.ui.delete.description');
    modal.btnName = this.translateService.instant('msg.organization.ui.delete.btn');

    // 삭제할 조직 코드 저장
    modal['orgCode'] = orgCode;
    // 팝업 창 오픈
    this._confirmModalComponent.init(modal);
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
   * 조직 이름으로 검색
   * @param event
   */
  public onSearchText(event: KeyboardEvent): void {
    (13 === event.keyCode) && (this._searchText(event.target['value']));
  }

  /**
   * 조직 검색 초기화
   */
  public onSearchTextInit(): void{
    this._searchText('');
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

  /**
   * 모달 확인
   * @param modal
   */
  public confirmEvent(modal): void{
    modal.data === 'DELETE' ? this._deleteOrganization(modal.orgCode) : null; // 여기 null 부분에 나중에 업데이트 추가
  }


  public showDetailOrganization(organization: Organization){
    // 기존에 저장된 route 삭제
    this.cookieService.delete('PREV_ROUTER_URL');
    this.router.navigate(['/admin/organization/list', organization.code], {queryParams: this._searchParams});

  }

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

  private _deleteOrganization(orgCode: string): void{

    // 로딩 show
    this.loadingShow();
    this.organizationService.deleteOrganization(orgCode).then(() => {
      Alert.success(this.translateService.instant('msg.organization.alert.delete'));

      if(this.page.page > 0 && this.orgList.length === 1){
        this.page.page -= 1;
      }

      // 페이지 새로고침
      this.reloadPage(false);
    }).catch((error) => {
      // alert
      Alert.error(error);
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 검색어로 조직 검색
   * @param keyword
   * @private
   */
  private _searchText(keyword: string): void{
    // key word
    this.searchKeyword = keyword;
    // 재조회
    this.reloadPage();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _getOrganizationList(): void {
    // 로딩 show
    this.loadingShow();

    this.orgList = [];

    // organization 리스트 조회
    const params = this._getOrgParams();
    this.organizationService.getOrganizationList(params).then((result) => {

      // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다
      if (this.page.page > 0 &&
        this.isNullOrUndefined(result) ||
        (this.isNullOrUndefined(result) && result['content'].length === 0))
      {
        this.page.page = result.page.number - 1;
        this._getOrganizationList();
      }

      // 검색 파라메터 정보 저장
      this._searchParams = params;

      // 페이지
      this.pageResult = result.page;

      this.orgList = this.orgList.concat(result.content);

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
