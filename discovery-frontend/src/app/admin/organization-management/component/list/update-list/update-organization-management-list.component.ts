import {AbstractComponent} from "@common/component/abstract.component";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import * as $ from "jquery";
import * as _ from "lodash";
import {isUndefined} from "util";
import {User} from "@domain/user/user";
import {MembersService} from "../../../../user-management/service/members.service";

@Component({
  selector: 'app-update-organization-list',
  templateUrl: './update-organization-management-list.component.html'
})
export class UpdateOrganizationManagementListComponent extends AbstractComponent implements OnInit, OnDestroy{


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 현재 보고있는 탭 member(0) or group (1)
  @Input()
  public defaultTab: number;

  @Input()
  public searchPlaceholder: string;

  // 전체 리스트
  @Input()
  public allList: any = [];

  // 사용자 검색 키워드
  public searchKeyword: string;

  // 선택된 리스트
  public selectedItems: any = [];

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  @Output()
  public getMembersOutput = new EventEmitter();

  @Output()
  public getGroupsOutput = new EventEmitter();

  @Output()
  public checkEvent = new EventEmitter();

  public headers: any;


  // 선택된 페이지 넘버
  private _selectedPage: number;
  private _selectedPageSize: number;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=;-=-=-=-=-=-=
 | Constructor
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(public membersService: MembersService,
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

  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public init(data: any) {

    this._initView();

    // 현재 탭
    this.defaultTab = data.defaultTab;

    // 디비에 저장된 선택된 데이터
    this.selectedItems = data.selectedItems;

    // 모든 데이터
    this.allList = data.allData;

    // 컬럼 이름 배열
    this.headers = data.headers;

    this.pageResult = data.pageResult;

    // this.header 개수에 맞춰서 col 추가
    $(`.table-colgroup`).children().remove();
    for (let idx = 0, nMax = this.headers.length; idx < nMax; idx++) {
      const col = document.createElement('col');
      col.width = this.headers[idx].width;
      $('.table-colgroup').append('<col width=' + col.width + '>');
    }

  }


  public _initView(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 15;
    this._selectedPage = 0;
    this._selectedPageSize = 15;

  }


  /**
   * 체크박스 선택 여부
   * @param item
   * return {boolean}
   */
  public isSelected(item): boolean {
    return _.findIndex(this.selectedItems, {directoryId: item.directoryId}) !== -1;
  }

  /**
   * 전체 체크
   */
  public checkAll() {
    event.preventDefault();
    this.isCheckAll() ? this._deleteAll() : this._addAll();
  }

  /**
   * 전체 체크 여부
   * return {boolean}
   */
  public isCheckAll(): boolean {
    if (this.allList.length !== 0) {
      for (let index = 0, nMax = this.allList.length; index < nMax; index++) {
        // 조회된 멤버 목록 중 선택목록에 하나라도 없다면 false
        if (_.findIndex(this.selectedItems, {directoryId: this.allList[index].directoryId}) === -1) {
          return false;
        }
      }
      return true;
    } else {
      // 조회된 멤버 목록이 없다면 false
      return false;
    }
  }


  /**
   * 체크박스 하나씩 선택
   */
  public checkItem(item: any) {
    event.preventDefault();
    // 선택된 멤버에 있는경우 체크 해제


    const index = _.findIndex(this.selectedItems, {directoryId: item.directoryId});
    // index === -1 ? this._addSelectedMember(item) : this._deleteSelectedMember(index);

    if (index === -1) {
      isUndefined(item.imageUrl) ? delete item.imageUrl : null;
      this._addSelectedMember(item)
    } else {
      this._deleteSelectedMember(index);
    }

  }

  /**
   * 선택한 멤버를 선택된 멤버리스트에 추가
   * @param item
   */
  public addSelectedItem(item) {
    const index = _.findIndex(this.selectedItems, {directoryId: item.directoryId});
    if (index === -1) {
      isUndefined(item.imageUrl) ? delete item.imageUrl : null;
      this._addSelectedMember(item);
    }
  }

  /**
   * 멤버 이름 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
  }

  /**
   * 멤버 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  /**
   * 현재 선택된 멤버 리스트가 더 존재하는지 여부
   * @returns {boolean}
   */
  public isLoadMoreSelectedItems(): boolean {
    return (this._selectedPage + 1) * this._selectedPageSize < this.selectedItems.length;
  }

  /**
   * 현재 선택된 멤버 리스트 더 가져오기
   */
  public onClickLoadMoreSelectedItems(): void {
    // 페이지 넘버 증가
    this._selectedPage += 1;
  }

  /**
   * 현재 선택된 멤버 리스트가 더 존재하는지 여부
   * @returns {boolean}
   */
  public isLoadMoreItems(): boolean {
    return this.pageResult.number < this.pageResult.totalPages - 1;
  }

  /**
   * 현재 선택된 멤버 리스트 더 가져오기
   */
  public onClickLoadMoreItems(): void {
    // 페이지 넘버 증가
    this.pageResult.number += 1;

    if (this.defaultTab === 0) {
      // 멤버 리스트 조회
      this.getMembersOutput.emit({isInitial: false, params: this._getParam()});
    } else {
      this.getGroupsOutput.emit({isInitial: false, params: this._getParam()});

    }

  }

  /**
   * 사용자 프로필 이미지
   * @returns {string}
   */
  public getUserImage(user: User): string {
    return user.hasOwnProperty('imageUrl')
      ? '/api/images/load/url?url=' + user.imageUrl + '/thumbnail'
      : '/assets/images/img_photo.png';
  }


  /**
   * 현재 선택된 멤버 리스트
   * @returns {User[]}
   */
  public getSelectedList() {
    return this.selectedItems.slice(0, (this._selectedPage + 1) * this._selectedPageSize);
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 검색어로 멤버 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.searchKeyword = keyword;
    // 페이지 초기화
    this.pageResult.number = 0;
    // 멤버 리스트 초기화
    this.allList = [];
    // 재조회

    if (this.defaultTab === 0) {
      this.getMembersOutput.emit({isInitial: true, params: this._getParam()});
    } else {
      this.getGroupsOutput.emit({isInitial: true, params: this._getParam()});
    }

  }

  /**
   * params
   * @returns {Object}
   * @private
   */
  private _getParam(): object {
    const param = {
      size: this.pageResult.size,
      page: this.pageResult.number
    };
    // search
    if (!isUndefined(this.searchKeyword) && this.searchKeyword.trim() !== '') {
      param['nameContains'] = this.searchKeyword.trim();
    }
    return param;
  }

  /**
   * 선택된 아이템 selectedItems 에서 추가
   * @param item
   * @private
   */
  private _addSelectedMember(item): void {
    // this.selectedItems.push(item);
    this.checkEvent.emit({item: item});
  }

  /**
   * 선택된 아이템 selectedItems 에서 제거
   * @param {number} index
   * @private
   */
  private _deleteSelectedMember(index: number): void {
    // this.selectedItems.splice(index, 1);
    this.checkEvent.emit({index: index});
  }


  /**
   * 현재 보이고 있는 멤버들 선택한 멤버리스트에서 제거
   * @private
   */
  private _deleteAll(): void {
    // 선택된 멤버에 현재 멤버 리스트 제거
    this.allList.forEach((member) => {
      this._deleteSelectedMember(member);
    });
  }

  /**
   * 현재 보이고 있는 멤버들 선택한 멤버리스트에 추가
   * @private
   */
  private _addAll(): void {
    // 선택된 멤버에 현재 멤버 리스트 추가
    this.allList.forEach((item) => {
      this.addSelectedItem(item);
    });
  }

}
