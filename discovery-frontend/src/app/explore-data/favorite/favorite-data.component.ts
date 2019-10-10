/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Component, ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {ActivatedRoute} from "@angular/router";
import * as _ from "lodash";
import {StringUtil} from "../../common/util/string.util";
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import {Metadata, SourceType} from "../../domain/meta-data-management/metadata";
import {CommonUtil} from "../../common/util/common.util";
import {ExploreDataConstant} from "../constant/explore-data-constant";
import {SortOption} from "../explore-data/service/explore-data-util.service";
import {CreateWorkbenchContainerComponent} from "../../workbench/component/create-workbench/refactoring/create-workbench-container.component";
import {CreateWorkbookComponent} from "../../workbook/component/create-workbook/refactoring/create-workbook.component";
import {ConfirmRefModalComponent} from "../../common/component/modal/confirm/confirm-ref.component";
import {Modal} from "../../common/domain/modal";
import {CookieConstant} from "../../common/constant/cookie.constant";
import {Alert} from "../../common/util/alert.util";

@Component({
  selector: 'app-exploredata-favorite-data',
  templateUrl: './favorite-data.component.html',
  entryComponents: [CreateWorkbenchContainerComponent, CreateWorkbookComponent, ConfirmRefModalComponent]
})
export class FavoriteDataComponent extends AbstractComponent implements OnInit, OnDestroy {


  @ViewChild('component_create_workbench', {read: ViewContainerRef}) readonly createWorkbenchEntry: ViewContainerRef;
  createWorkbenchEntryRef: ComponentRef<CreateWorkbenchContainerComponent>;

  @ViewChild('component_create_workbook', {read: ViewContainerRef}) readonly createWorkbookEntry: ViewContainerRef;
  createWorkbookEntryRef: ComponentRef<CreateWorkbookComponent>;

  @ViewChild('component_confirm', {read: ViewContainerRef}) readonly confirmModalEntry: ViewContainerRef;
  confirmModalEntryRef: ComponentRef<ConfirmRefModalComponent>;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // metadata list
  metadataList: Metadata[] = [];

  // search
  searchRange = {name: 'All', value: ExploreDataConstant.SearchRange.ALL};
  searchedKeyword: string = '';

  // sort
  selectedSort = 'name, asc';

  public sortOptions = {
    // TODO: popularity is not implemented yet
    // popularity: new SortOption('popularity'),
    modifiedTime: new SortOption('modifiedTime'),
    name: new SortOption('name', 'asc'),
  };

  // filter
  selectedSourceTypeFilter = 'ALL';
  sourceTypeList = [
    {label: 'All', value: ''},
    {label: this.translateService.instant('msg.comm.th.ds'), value: SourceType.ENGINE},
    {label: this.translateService.instant('msg.storage.li.db'), value: SourceType.JDBC},
    {label: this.translateService.instant('msg.storage.li.hive'), value: SourceType.STAGING},
  ];

  // more button
  showMoreFlag = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    private activatedRoute: ActivatedRoute,
    private resolver: ComponentFactoryResolver,
    private metadataService: MetadataService,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
      const paramKeys = Object.keys(params);
      const isExistSearchParams = paramKeys.length > 0;
      const searchParams = {};
      // if exist search param in URL
      if (isExistSearchParams) {
        paramKeys.forEach((key) => {
          if (key === 'size') {
            this.page.size = params['size'];
          } else if (key === 'page') {
            this.page.page = params['page'];
          } else if (key === 'sort') {
            const sortParam = params['sort'].split(',');
          } else if (key === 'containsText') {
            this.searchedKeyword = params['containsText'];
          } else {
            searchParams[key] = params[key].split(',');
          }
        });
        // TODO 추후 criterion component로 이동
        delete searchParams['pseudoParam'];
        // init criterion search param
      }

      this._setMetadataList(this._getMetadataListParams()).then();

      // set datasource list
    }));
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Reload page for new query params.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._getMetadataListParams(), replaceUrl: true}
    ).then();
  } // function - reloadPage

  private _getMetadataListParams() {
    let params;
    params = {
      page: this.page.page,
      size: this.page.size,
      sort: this.selectedSort,
    };

    // if not empty search keyword
    if (StringUtil.isNotEmpty(this.searchedKeyword)) {
      params[this.searchRange.value] = this.searchedKeyword.trim();
    }

    // if sourceType is selected
    if (this.selectedSourceTypeFilter !== 'ALL') {
      params['sourceType'] = this.selectedSourceTypeFilter;
    }
    return params;
  }

  getTotalElementsGuide() {
    if (this.isNotEmptySearchKeyword()) {
      return this.translateService.instant('msg.explore.ui.list.content.total.searched', {
        totalElements: this.getTotalElements(),
        searchedKeyword: this.searchedKeyword.trim()
      });
    } else {
      return this.translateService.instant('msg.explore.ui.list.content.total', {totalElements: this.getTotalElements()});
    }
  }

  getTotalElements(): string {
    return CommonUtil.numberWithCommas(this.pageResult.totalElements);
  }

  getMetadataName(name: string) {
    if (this.isNotEmptySearchKeyword() && (this.searchRange.value === ExploreDataConstant.SearchRange.ALL || this.searchRange.value === ExploreDataConstant.SearchRange.DATA_NAME)) {
      return name.replace(this.searchedKeyword, `<span class="ddp-txt-search type-search">${this.searchedKeyword}</span>`);
    } else {
      return name;
    }
  }

  getMetadataDescription(description: string) {
    if (this.isNotEmptySearchKeyword() && (this.searchRange.value === ExploreDataConstant.SearchRange.ALL || this.searchRange.value === ExploreDataConstant.SearchRange.DESCRIPTION)) {
      return '-' + description.replace(this.searchedKeyword, `<span class="ddp-txt-search type-search">${this.searchedKeyword}</span>`);
    } else {
      return '-' + description;
    }
  }

  getMetadataCreator(creator: string) {
    if (this.isNotEmptySearchKeyword() && (this.searchRange.value === ExploreDataConstant.SearchRange.ALL || this.searchRange.value === ExploreDataConstant.SearchRange.CREATOR)) {
      return creator.replace(this.searchedKeyword, `<span class="ddp-txt-search type-search">${this.searchedKeyword}</span>`);
    } else {
      return creator;
    }
  }

  getTooltipValue(metadata): string {
    let result = metadata.name;
    if (metadata.description) {
      result += ` - ${metadata.description}`;
    }
    return result;
  }

  private async _setMetadataList(params) {
    this.loadingShow();
    const result = await this.metadataService.getMetaDataList(params).catch((e) => this.commonExceptionHandler(e));

    if (!_.isNil(result)) {
      // add ddp-scroll class to layout
      this.pageResult = result.page;
      // set metadata list
      if (result._embedded) {
        this.metadataList = result._embedded.metadatas;
      } else {
        this.metadataList = [];
      }

      this.loadingHide();
    }
  }

  /**
   * Search connection keypress event
   * @param {string} keyword
   */
  public onChangedSearchKeyword(keyword: string): void {
    // set search keyword
    this.searchedKeyword = keyword;
    // reload page
    this.reloadPage(true);
  }

  /**
   * More connection click event
   */
  changePage(data: { page: number, size: number }): void {
    // if more metadata list
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;

      this.reloadPage(false);
    }
  }

  /**
   * Sort column clicked
   * @param type
   */
  public toggleSortOption(type: string) {
    // Initialize every column's option except selected column
    Object.keys(this.sortOptions).forEach(key => {
      if (key !== type) {
        this.sortOptions[key].option = 'default';
      }
    });
    if (this.sortOptions[type].option === 'none') {
      this.sortOptions[type].option = 'desc';
    } else if (this.sortOptions[type].option === 'asc') {
      this.sortOptions[type].option = 'desc';
    } else {
      this.sortOptions[type].option = 'asc';
    }

    this.selectedSort = type + ',' + this.sortOptions[type].option;
    this.reloadPage();
  }

  public toggleMoreButton() {
    this.showMoreFlag = !this.showMoreFlag;
  }

  public onSelectSourceType(event) {
    this.selectedSourceTypeFilter = event.value;
    this.reloadPage();
  }

  public onClickEditData(metadataId: string) {
    Alert.error('aa');
    // this.router.navigate(['management/metadata/metadata', metadataId]).then();
  }

  async onClickCreateWorkbench(metadata: Metadata) {
    if (Metadata.isSourceTypeIsJdbc(metadata.sourceType)) {
      const metadataDetail = await this.metadataService.getDetailMetaData(metadata.id).catch(e => this.commonExceptionHandler(e));
      this._showConfirmComponent().then(() => this._showCreateWorkbenchComponent(metadataDetail));
    }
  }

  async onClickCreateWorkbook(metadata: Metadata) {
    if (Metadata.isSourceTypeIsEngine(metadata.sourceType)) {
      const metadataDetail = await this.metadataService.getDetailMetaData(metadata.id).catch(e => this.commonExceptionHandler(e));
      this._showConfirmComponent().then(() => this._showCreateWorkbookComponent(metadataDetail));
    }
  }

  isNotEmptySearchKeyword(): boolean {
    return StringUtil.isNotEmpty(this.searchedKeyword);
  }

  isEmptyMetadataList(): boolean {
    return _.isNil(this.metadataList) || this.metadataList.length === 0;
  }

  isEnableTag(metadata: Metadata): boolean {
    return !Metadata.isEmptyTags(metadata);
  }

  isExistMoreTags(metadata: Metadata): boolean {
    return metadata.tags.length > 1;
  }

  isEnableDescription(metadata: Metadata): boolean {
    return StringUtil.isNotEmpty(metadata.description);
  }

  /**
   * Returns True is current user is manager
   */
  public isShowEditData(metadata: Metadata): boolean {
    return Metadata.isSourceTypeIsStaging(metadata.sourceType);
  }

  isShowCreateWorkbench(metadata: Metadata): boolean {
    return Metadata.isSourceTypeIsJdbc(metadata.sourceType);
  }

  isShowCreateWorkbook(metadata: Metadata): boolean {
    return Metadata.isSourceTypeIsEngine(metadata.sourceType);
  }

  private _showConfirmComponent() {
    return new Promise((resolve, reject) => {
      // show confirm modal
      this.confirmModalEntryRef = this.confirmModalEntry.createComponent(this.resolver.resolveComponentFactory(ConfirmRefModalComponent));
      const modal: Modal = new Modal();

      modal.name = this.translateService.instant('msg.explore.ui.confirm.title');
      modal.description = this.translateService.instant('msg.explore.ui.confirm.description');
      modal.btnName = this.translateService.instant('msg.explore.btn.confirm.done');
      this.confirmModalEntryRef.instance.init(modal);
      this.confirmModalEntryRef.instance.cancelEvent.subscribe(() => {
        // destroy confirm component
        this.confirmModalEntryRef.destroy();
      });
      this.confirmModalEntryRef.instance.confirmEvent.subscribe((result) => {
        // destroy confirm component
        this.confirmModalEntryRef.destroy();
        resolve(result);
      });
    });
  }

  private async _showCreateWorkbookComponent(metadata: Metadata) {

    this.createWorkbookEntryRef = this.createWorkbookEntry.createComponent(this.resolver.resolveComponentFactory(CreateWorkbookComponent));

    const metadataDetail = await this.metadataService.getDetailMetaData(metadata.id).catch(e => this.commonExceptionHandler(e));

    const workspace = JSON.parse(this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE));
    // set data in component
    this.createWorkbookEntryRef.instance.setWorkspaceId(workspace.id);
    this.createWorkbookEntryRef.instance.setSourceId(metadataDetail.source.source.id);
    this.createWorkbookEntryRef.instance.accessFromExplore();
    this.createWorkbookEntryRef.instance.closedPopup.subscribe(() => {
      this.createWorkbookEntryRef.destroy();
    });
    this.createWorkbookEntryRef.instance.completedPopup.subscribe((workbookId: string) => {
      if (_.isNil(workbookId)) {
        // link to workspace
        this.router.navigateByUrl('/workspace').then();
      } else {
        // link to workspace
        this.router.navigateByUrl('/workbook/' + workbookId).then();
      }
    });
  }

   private async _showCreateWorkbenchComponent(metadata: Metadata) {
    this.createWorkbenchEntryRef = this.createWorkbenchEntry.createComponent(this.resolver.resolveComponentFactory(CreateWorkbenchContainerComponent));

    const metadataDetail = await this.metadataService.getDetailMetaData(metadata.id).catch(e => this.commonExceptionHandler(e));

    const workspace = JSON.parse(this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE));

    // set data in component
    this.createWorkbenchEntryRef.instance.setWorkspaceId(workspace.id);
    this.createWorkbenchEntryRef.instance.setConnectionInModel(metadataDetail.source.source);
    this.createWorkbenchEntryRef.instance.setSchemaName(metadataDetail.source.schema);
    this.createWorkbenchEntryRef.instance.setTableName(metadataDetail.source.table);
    this.createWorkbenchEntryRef.instance.accessFromExplore();
    this.createWorkbenchEntryRef.instance.closedPopup.subscribe(() => {
      this.createWorkbenchEntryRef.destroy();
    });
    this.createWorkbenchEntryRef.instance.completedPopup.subscribe((workbenchId: string) => {
      if (_.isNil(workbenchId)) {
        // link to workspace
        this.router.navigateByUrl('/workspace').then();
      } else {
        // link to workspace
        this.router.navigateByUrl('/workbench/' + workbenchId).then();
      }
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
