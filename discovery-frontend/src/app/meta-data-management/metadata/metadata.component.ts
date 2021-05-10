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

import {AbstractComponent} from '@common/component/abstract.component';
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {isNullOrUndefined, isUndefined} from 'util';
import {MetadataService} from './service/metadata.service';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {Modal} from '@common/domain/modal';
import {Alert} from '@common/util/alert.util';
import {CatalogService} from '../catalog/service/catalog.service';
import * as _ from 'lodash';
import {StorageService} from '../../data-storage/service/storage.service';
import {ActivatedRoute} from '@angular/router';
import {CreateMetadataMainComponent} from './create-metadata/create-metadata-main.component';
import {Subscription} from 'rxjs';
import {StringUtil} from '@common/util/string.util';

@Component({
  selector: 'app-metadata',
  styleUrls: ['./metadata.component.css'],
  templateUrl: './metadata.component.html'
})
export class MetadataComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(CreateMetadataMainComponent)
  private _selectDatatypeComponent: CreateMetadataMainComponent;

  // 검색 파라메터
  private _searchParams: { [key: string]: string };
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  // 리스트, 카달로그 검색어
  public listSearchText: string;

  public selectedMetadata: SelectedMetadata;
  public metadatas: Metadata[];

  public sourceTypeList: any = [];
  public sourceType: string;

  public tagsList: any = [];
  public tag: string;

  public selectedCatalogId: string;
  public catalogs: any;

  // Unclassified 선택 여부
  public isUnclassifiedSelected: boolean = false;

  public tagDefaultIndex: number;
  public typeDefaultIndex: number;

  /**
   * Metadata SourceType Enum
   */
  public readonly METADATA_SOURCE_TYPE = SourceType;

  // sort
  readonly sortList = [
    {name: this.translateService.instant('msg.comm.ui.sort.name.asc'), value: 'name,asc'},
    {name: this.translateService.instant('msg.comm.ui.sort.name.desc'), value: 'name,desc'},
    {name: this.translateService.instant('msg.comm.ui.sort.updated.asc'), value: 'modifiedTime,asc'},
    {name: this.translateService.instant('msg.comm.ui.sort.updated.desc'), value: 'modifiedTime,desc'},
  ];
  selectedSort;

  private _paginationSubscription$: Subscription;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    protected injector: Injector,
    protected metadataService: MetadataService,
    protected catalogService: CatalogService,
    private _activatedRoute: ActivatedRoute) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    this._initView();
    // Get query param from url
    this._paginationSubscription$ = this._activatedRoute.queryParams.subscribe((params) => {

      if (!_.isEmpty(params)) {

        if (!isNullOrUndefined(params['size'])) {
          this.page.size = params['size'];
        }

        if (!isNullOrUndefined(params['page'])) {
          this.page.page = params['page'];
        }

        if (!isNullOrUndefined(params['nameContains'])) {
          this.listSearchText = params['nameContains'];
        }

        if (!isNullOrUndefined(params['sourceType'])) {
          this.sourceType = params['sourceType'];
          this.typeDefaultIndex = this.sourceTypeList.findIndex((item) => {
            return item.value.toString() === this.sourceType;
          });
        }

        if (!_.isNil(params['sort'])) {
          this.selectedSort = this.sortList.find(sort => sort.value === params['sort']);
        }
      }

      // first fetch metadata tag list
      this.getMetadataTags()
        .then((result) => {
          this.tagsList = this.tagsList.concat(result);
          if (!isNullOrUndefined(params['tag'])) {
            this.tag = params['tag'];
            this.tagDefaultIndex = this.tagsList.findIndex((item) => {
              return item.name === this.tag;
            });
          } else {
            this.tagDefaultIndex = 0;
          }
          this.getMetadataList();
        })
        .catch(error => {
          console.error(error);
          this.getMetadataList();
        })
    });
  }

  public ngOnDestroy() {
    if (!_.isNil(this._paginationSubscription$)) {
      this._paginationSubscription$.unsubscribe();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * After metadata creation
   */
  // Todo : doesn't refresh
  public onCreateEmit() {
    this.reloadPage();
  }

  /**
   * When data type list is changed
   * @param event
   */
  public onSourceTypeListChange(event) {
    this.sourceType = event.value;
    this.reloadPage();
  }

  /**
   * When tags list is changed
   * @param event
   */
  public onTagsListChange(event) {

    'All' === event.name ? this.tag = '' : this.tag = event.name;
    this.reloadPage();
  }

  /**
   * Refresh filter
   */
  public refreshFilter() {
    this._initView();
    this.reloadPage();
  }

  /**
   * Open create meta data popup
   */
  public createNewMetadata() {
    this._selectDatatypeComponent.init();
  }

  getMetadataCreator(creator: string) {
    if (this.isNotEmptySearchKeyword()) {
      return creator.replace(this.listSearchText, `<span class="ddp-txt-search type-search">${this.listSearchText}</span>`);
    } else {
      return creator;
    }
  }

  getMetadataDescription(description: string) {
    if (this.isNotEmptySearchKeyword()) {
      return '-' + description.replace(this.listSearchText, `<span class="ddp-txt-search type-search">${this.listSearchText}</span>`);
    } else {
      return '-' + description;
    }
  }

  getMetadataName(name: string) {
    if (this.isNotEmptySearchKeyword()) {
      return name.replace(this.listSearchText, `<span class="ddp-txt-search type-search">${this.listSearchText}</span>`);
    } else {
      return name;
    }
  }

  getMetadataType(metadata: Metadata): string {
    switch (metadata.sourceType) {
      case SourceType.ENGINE:
        return this.translateService.instant('msg.comm.th.ds');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.STAGEDB:
        return this.translateService.instant('msg.storage.li.hive');
      case SourceType.ETC:
        return this.translateService.instant('msg.storage.li.etc');
    }
  }

  getMetadataTypeIcon(metadata: Metadata): string {
    switch (metadata.sourceType) {
      case SourceType.ENGINE:
        return 'ddp-datasource';
      case SourceType.JDBC:
        return 'ddp-hive';
      case SourceType.STAGEDB:
        return 'ddp-stagingdb';
      case SourceType.ETC:
        return 'ddp-etc';
    }
  }

  /**
   * 컨텐츠 총 갯수
   * @returns {number}
   */
  public get getTotalContentsCount(): number {
    return this.pageResult.totalElements;
  }

  /**
   * 메타 데이터 리스트 조회
   */
  public getMetadataList() {

    this.loadingShow();

    this.metadatas = [];
    const params = this._getMetadataParams();

    this.metadataService.getMetaDataList(params).then((result) => {

      this._searchParams = params;

      this.pageResult = result.page;

      // 코드 테이블 리스트
      this.metadatas = result['_embedded'] ? this.metadatas.concat(result['_embedded'].metadatas) : [];

      // 로딩 hide
      this.loadingHide();

    }).catch((error) => {
      this.commonExceptionHandler(error);
      this.loadingHide();
    });

  }

  /**
   * 카달로그 리스트 조회 (처음 한번)
   * 트리구조로 카달로그 목록을 불러온다.
   */
  public getCatalogList() {
    this.loadingShow();
    this.catalogService.getTreeCatalogs('ROOT').then((result) => {
      this.loadingHide();
      if (result.length > 0) {
        this.catalogs = result;

        // if catalog exists, the first catalog on the list is selected and gets metadata in that catalog
        this.selectedCatalogId = this.catalogs[0].id;
        this.catalogs[0].selected = true;
        this.getMetadataInCatalog();

      } else {

        // if no catalog exists, get unclassified metadata list
        this.catalogs = [];
        this.isUnclassifiedSelected = true;
        this.selectedCatalogId = '__EMPTY';
        this.getMetadataList();
      }

    }).catch((_error) => {
      this.loadingHide();

    });
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

  isNotEmptySearchKeyword(): boolean {
    return StringUtil.isNotEmpty(this.listSearchText);
  }

  /**
   * 하위 데이터 불러오기
   * @param catalog
   */
  public showChildren(catalog) {
    this.loadingShow();
    this.catalogService.getTreeCatalogs(catalog.id).then((result) => {
      this.loadingHide();
      catalog.children = result;
    }).catch((_error) => {
      this.loadingHide();
    });
  }


  /**
   * 메타데이터 디테일 페이지로 점프
   * @param metadata
   */
  public onClickMetadataDetail(metadata) {
    this.metadataService.metadataDetailSelectedTab = 'information';
    this.router.navigate(['management/metadata/metadata', metadata.id]);
  }

  /**
   * 삭제 팝업 오픈
   * @param event
   * @param metadata
   */
  public confirmDelete(event, metadata) {
    event.stopImmediatePropagation();
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.metadata.md.ui.delete.header');
    modal.description = metadata.name;
    this.selectedMetadata = {id: metadata.id, name: metadata.name};
    this.deleteModalComponent.init(modal);
  }

  /**
   * 삭제 확인
   */
  public deleteMetadata() {
    this.metadataService.deleteMetaData(this.selectedMetadata.id).then((_result) => {
      Alert.success(
        this.translateService.instant('msg.metadata.alert.md-deleted', {value: this.selectedMetadata.name}));
      if (this.page.page > 0 && this.metadatas.length === 1) {
        this.page.page = this.page.page - 1;
      }
      this.reloadPage(false);
    }).catch((_error) => {
      Alert.fail(this.translateService.instant('msg.metadata.alert.md-delete.fail'));
    });

    // 다시 페이지  로드
  }

  /**
   * 카달로그 내 메타데이터 불러오기
   * @param catalog
   */
  public setSelectedCatalog(catalog) {
    this.isUnclassifiedSelected = false;
    this._refreshSelectedCatalog();
    // this.refreshFilter();
    catalog.selected = true;
    this.selectedCatalogId = catalog.id;
    this.getMetadataInCatalog();
  }

  /**
   * 선택된 카달로그에 포함된 메타데이터 불러오기
   */
  public getMetadataInCatalog() {

    this.loadingShow();

    this.metadatas = [];

    const params = this._getMetadataParams();

    this.catalogService.getMetadataInCatalog(this.selectedCatalogId, params).then((result) => {

      this._searchParams = params;

      // page 객체
      this.pageResult = result.page;

      // 컬럼 사전 리스트
      this.metadatas = result['_embedded'] ? this.metadatas.concat(result['_embedded']['metadatas']) : [];

      // 로딩 hide
      this.loadingHide();
    }).catch((error) => {

      this.commonExceptionHandler(error);
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 코드 테이블 이름 검색
   */
  public onSearchText(): void {
    this._searchText(this.listSearchText);
  }

  /**
   * 코드 테이블 이름 초기화 후 검색
   */
  public onSearchTextInit(): void {
    this._searchText('');
  }

  public getMetadataTags(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.metadataService.getMetadataTags()
        .then(resolve)
        .catch(reject);
    })
  }

  /**
   * Get Name and description of metada
   * @param metadata
   * @returns {string}
   */
  public getTooltipValue(metadata): string {

    let result = metadata.name;
    if (metadata.description) {
      result += ` - ${metadata.description}`;
    }
    return result;
  }


  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      // 워크스페이스 조회
      this.reloadPage(false);
    }
  } // function - changePage

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getMetadataParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage

  createdMetadata(metadataId?: string) {
    if (_.isNil(metadataId)) {
      this.reloadPage(true);
    } else {  // if exist metadataId, go to detail page
      this.router.navigate(['management/metadata/metadata', metadataId]).then();
    }
  }

  changeSort(sort) {
    this.selectedSort = sort;
    this.reloadPage();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * ui init
   * @private
   */
  private _initView() {
    this.sourceTypeList = StorageService.isEnableStageDB
      ? [
        {label: 'All', value: ''},
        {label: this.translateService.instant('msg.comm.th.ds'), value: SourceType.ENGINE},
        {label: this.translateService.instant('msg.storage.li.db'), value: SourceType.JDBC},
        {label: this.translateService.instant('msg.storage.li.hive'), value: SourceType.STAGING},
        {label: this.translateService.instant('msg.storage.li.etc'), value: SourceType.ETC},
      ]
      : [
        {label: 'All', value: ''},
        {label: this.translateService.instant('msg.comm.th.ds'), value: SourceType.ENGINE},
        {label: this.translateService.instant('msg.storage.li.db'), value: SourceType.JDBC},
        {label: this.translateService.instant('msg.storage.li.etc'), value: SourceType.ETC},
      ];

    this.sourceType = '';
    this.listSearchText = '';


    this.tagsList = [{name: 'All', id: ''}];
    this.tagDefaultIndex = 0;
    this.typeDefaultIndex = 0;
    this.tag = '';

    // 카달로그를 다시 불러오기
    // if (getCatalogList !== false) {
    //   this.getCatalogList();
    // }

    // 정렬 초기화
    this.selectedSort = this.sortList[3];
  }

  /**
   *  선택된 카달로그 모두 해제
   */
  private _refreshSelectedCatalog() {
    this.catalogs.forEach((catalog) => {
      catalog.selected = false;
      if (catalog.children) {
        catalog.children.forEach((child) => {
          child.selected = false;
          if (child.children) {
            child.children.forEach((last) => {
              last.selected = false;
            });
          }
        });
      }
    });
  }

  /**
   * 검색어로 카달로그 이름 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.listSearchText = keyword;

    this.reloadPage();
  }

  /**
   * get params for meta data list
   * @returns object
   * @private
   */
  private _getMetadataParams(): any {

    const params = {
      page: this.page.page,
      size: this.page.size,
      sort: this.selectedSort.value,
      pseudoParam: (new Date()).getTime()
    };

    // 검색어
    if (!isUndefined(this.listSearchText) && this.listSearchText.trim() !== '') {
      params['nameContains'] = this.listSearchText.trim();
    }

    // 데이터타입
    if (!isUndefined(this.sourceType) && this.sourceType.trim() !== '') {
      params['sourceType'] = this.sourceType.trim();
    }

    // 태그
    if (!isUndefined(this.tag) && this.tag.trim() !== '') {
      params['tag'] = this.tag.trim();
    }

    return params;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

class SelectedMetadata {
  id: string;
  name: string;
}
