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

import * as _ from 'lodash';
import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {StringUtil} from '@common/util/string.util';
import {CommonUtil} from '@common/util/common.util';
import {Modal} from '@common/domain/modal';
import {CookieConstant} from '@common/constant/cookie.constant';
import {AbstractComponent} from '@common/component/abstract.component';
import {ConfirmRefModalComponent} from '@common/component/modal/confirm/confirm-ref.component';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';
import {ExploreDataConstant} from '../../constant/explore-data-constant';
import {MetadataService} from '../../../meta-data-management/metadata/service/metadata.service';
import {CreateWorkbookComponent} from '../../../workbook/component/create-workbook/refactoring/create-workbook.component';
import {CreateWorkbenchContainerComponent} from '../../../workbench/component/create-workbench/refactoring/create-workbench-container.component';
import {ExploreDataUtilService, SortOption} from '../service/explore-data-util.service';

@Component({
  selector: 'app-explore-data-creator-data-list-popup',
  templateUrl: './metadata-data-creator-data-list.component.html',
  entryComponents: [CreateWorkbenchContainerComponent, CreateWorkbookComponent, ConfirmRefModalComponent]
})
export class MetadataDataCreatorDataListComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('component_create_workbench', {read: ViewContainerRef}) readonly createWorkbenchEntry: ViewContainerRef;
  createWorkbenchEntryRef: ComponentRef<CreateWorkbenchContainerComponent>;

  @ViewChild('component_create_workbook', {read: ViewContainerRef}) readonly createWorkbookEntry: ViewContainerRef;
  createWorkbookEntryRef: ComponentRef<CreateWorkbookComponent>;

  @ViewChild('component_confirm', {read: ViewContainerRef}) readonly confirmModalEntry: ViewContainerRef;
  confirmModalEntryRef: ComponentRef<ConfirmRefModalComponent>;

  @Output() readonly closedPopup = new EventEmitter();
  @Output() readonly clickedMetadata = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  metadataList: Metadata[] = [];
  creator;
  searchRange = {name: 'DATA_NAME', value: ExploreDataConstant.SearchRange.DATA_NAME};

  // filter
  selectedSourceTypeFilter = 'ALL';

  sourceTypeList = [
    {label: 'All', value: ''},
    {label: this.translateService.instant('msg.comm.th.ds'), value: SourceType.ENGINE},
    {label: this.translateService.instant('msg.storage.li.db'), value: SourceType.JDBC},
    {label: this.translateService.instant('msg.storage.li.hive'), value: SourceType.STAGING},
  ];

  // search
  searchedKeyword = '';

  // sort
  selectedSort = 'name, asc';

  sortOptions = {
    modifiedTime: new SortOption('modifiedTime'),
    name: new SortOption('name', 'asc'),
  };
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    private resolver: ComponentFactoryResolver,
    private metadataService: MetadataService,
    public exploreDataUtilService: ExploreDataUtilService,
    protected injector: Injector) {
    super(element, injector);
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

  getMetadataListParams() {
    const params = {
      size: this.page.size,
      page: this.page.page,
      creatorContains: this.creator
    };

    // if not empty search keyword
    if (StringUtil.isNotEmpty(this.searchedKeyword)) {
      params[this.searchRange.value] = this.searchedKeyword.trim();
      // params['nameContains'] = this.searchedKeyword.trim();
      // params['descContains'] = this.searchedKeyword.trim();
    }

    // if sourceType is selected
    if (this.selectedSourceTypeFilter !== 'ALL') {
      params['sourceType'] = this.selectedSourceTypeFilter;
    }

    return params;
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

  public async setMetadataList(params) {
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

    this.setMetadataList(this.getMetadataListParams()).then();
  }

  /**
   * More connection click event
   */
  changePage(data: { page: number, size: number }): void {
    // if more metadata list
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      this.setMetadataList(this.getMetadataListParams()).then();
    }
  }

  public onSelectSourceType(event) {
    // set selected filter
    this.selectedSourceTypeFilter = event.value;
    this.setMetadataList(this.getMetadataListParams()).then();
  }

  /**
   * When X button is clicked
   */
  public onClickCloseBtn() {
    this.closedPopup.emit();
  }

  onClickMetadata(metadata: Metadata) {
    this.clickedMetadata.emit(metadata);
  }

  public onClickEditData(metadataId: string) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    // Alert.error('aa');
    this.router.navigate(['management/metadata/metadata', metadataId]).then();
  }

  async onClickCreateWorkbench(metadata: Metadata) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    if (Metadata.isSourceTypeIsJdbc(metadata.sourceType)) {
      const metadataDetail = await this.metadataService.getDetailMetaData(metadata.id).catch(e => this.commonExceptionHandler(e));
      this._showConfirmComponent().then(() => this._showCreateWorkbenchComponent(metadataDetail));
    }
  }

  async onClickCreateWorkbook(metadata: Metadata) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    if (Metadata.isSourceTypeIsEngine(metadata.sourceType)) {
      const metadataDetail = await this.metadataService.getDetailMetaData(metadata.id).catch(e => this.commonExceptionHandler(e));
      this._showConfirmComponent().then(() => this._showCreateWorkbookComponent(metadataDetail));
    }
  }

  onClickFavoriteInUserName() {
    event.stopImmediatePropagation();
    event.stopPropagation();
  };

  onClickFavoriteInList(selectedMetadata: Metadata) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    this.metadataService.toggleMetadataFavorite(selectedMetadata.id, selectedMetadata.favorite).catch((e) => this.commonExceptionHandler(e));

    const index = this.metadataList.findIndex((metadata) => {
      return metadata.id === selectedMetadata.id;
    });

    this.metadataList[index].favorite = !this.metadataList[index].favorite;
  };

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
    return new Promise((resolve, _reject) => {
      // show confirm modal
      this.confirmModalEntryRef = this.confirmModalEntry.createComponent(this.resolver.resolveComponentFactory(ConfirmRefModalComponent));
      const modal: Modal = new Modal();

      modal.name = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.name');
      modal.description = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.description');
      modal.btnName = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.btn');
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

  private async _showCreateWorkbenchComponent(metadataDetail: Metadata) {
    if (metadataDetail.source.source !== undefined) {
      this.createWorkbenchEntryRef = this.createWorkbenchEntry.createComponent(this.resolver.resolveComponentFactory(CreateWorkbenchContainerComponent));

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
    } else {
      Alert.error(this.translateService.instant('msg.explore.alert.error.cannot.make.workbench'))
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
