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

import {AbstractComponent} from '../../common/component/abstract.component';
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {isUndefined, isNullOrUndefined} from 'util';
import {MetadataService} from './service/metadata.service';
import {Metadata, SourceType} from '../../domain/meta-data-management/metadata';
import {DeleteModalComponent} from '../../common/component/modal/delete/delete.component';
import {Modal} from '../../common/domain/modal';
import {Alert} from '../../common/util/alert.util';
import {CatalogService} from '../catalog/service/catalog.service';
import * as _ from 'lodash';
import {StorageService} from '../../data-storage/service/storage.service';
import {ActivatedRoute} from "@angular/router";
import {CreateMetadataMainComponent} from "./create-metadata/create-metadata-main.component";

declare let $;

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
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
  public catalogSearchText: string;

  public selectedMetadata: SelectedMetadata;
  public metadatas: Metadata[];

  public sourceTypeList: any = [];
  public sourceType: string;

  public tagsList: any = [];
  public tag: string;

  public selectedCatalogId: string;
  public catalogs: any;

  public selectedContentSort: Order = new Order();

  // Unclassified 선택 여부
  public isUnclassifiedSelected: boolean = false;

  public tagDefaultIndex: number;
  public typeDefaultIndex: number;

  /**
   * Metadata SourceType Enum
   */
  public readonly METADATA_SOURCE_TYPE = SourceType;

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
    // Init
    super.ngOnInit();

    this._initView();

    this.subscriptions.push(
      // Get query param from url
      this._activatedRoute.queryParams.subscribe((params) => {

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

          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
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


      })
    );


  }

  public ngOnDestroy() {
    super.ngOnDestroy();
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

    // if (getMetadataList !== false) {
    //   this.getMetadataInCatalog();
    // }
  }

  /**
   * Open create meta data popup
   */
  public createNewMetadata() {
    this._selectDatatypeComponent.init();

  }

  /**
   * 하위 데이터 불러오기
   * @param event
   * @param catalog
   */
  public getChildren(event, catalog) {
    event.stopImmediatePropagation();
    if (!this.catalogSearchText) {
      if (catalog.hasChild) {
        catalog.isOpen = !catalog.isOpen;
        this.showChildren(catalog);
      }
    } else {
      catalog.isOpen = !catalog.isOpen;
    }
  }

  /**
   * 정렬 버튼 클릭
   * @param {string} key
   */
  public onClickSort(key: string): void {

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== key ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = key;

    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }

    // 페이지 초기화 후 재조회
    this.reloadPage();
  }

  /**
   * Unclassified 메탸데이터 불러오기
   */
  public getUnclassifiedMetadata() {
    this.selectedCatalogId = '__EMPTY';
    this._refreshSelectedCatalog();
    this.isUnclassifiedSelected = true;
    this.getMetadataList();
  }

  getMetadataType(metadata: Metadata): string {
    switch (metadata.sourceType) {
      case SourceType.ENGINE:
        return this.translateService.instant('msg.comm.th.ds');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.STAGEDB:
        return this.translateService.instant('msg.storage.li.hive');
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

    }).catch((error) => {
      this.loadingHide();

    });
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
    }).catch((error) => {
      this.loadingHide();
    });
  }


  /**
   * 메타데이터 디테일 페이지로 점프
   * @param metadata
   */
  public onClickMetadataDetail(metadata) {
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
    this.metadataService.deleteMetaData(this.selectedMetadata.id).then((result) => {
      Alert.success(
        this.translateService.instant('msg.metadata.alert.md-deleted', {value: this.selectedMetadata.name}));
      if (this.page.page > 0 && this.metadatas.length === 1) {
        this.page.page = this.page.page - 1;
      }
      this.reloadPage(false);
    }).catch((error) => {
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

  /**
   * 코드 테이블 이름 검색
   * @param {KeyboardEvent} event
   */
  public onCatalogSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._catalogSearchText(event.target['value']);
  }

  // /**
  //  * 코드 테이블 이름 초기화 후 검색
  //  */
  // public onCatalogSearchTextInit(): void {
  //   // this._catalogSearchText('');
  //   this.catalogSearchText = '';
  //   this.refreshFilter(,true);
  // }

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
      ]
      : [
        {label: 'All', value: ''},
        {label: this.translateService.instant('msg.comm.th.ds'), value: SourceType.ENGINE},
        {label: this.translateService.instant('msg.storage.li.db'), value: SourceType.JDBC},
      ];

    this.sourceType = '';
    this.listSearchText = '';

    // 정렬 초기화
    this.selectedContentSort = new Order();
    this.selectedContentSort.key = 'createdTime';
    this.selectedContentSort.sort = 'desc';

    this.tagsList = [{name: 'All', id: ''}];
    this.tagDefaultIndex = 0;
    this.typeDefaultIndex = 0;
    this.tag = '';

    // 카달로그를 다시 불러오기
    // if (getCatalogList !== false) {
    //   this.getCatalogList();
    // }

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
   * 검색어로 카달로그 이름 검색
   * @param {string} keyword
   * @private
   */
  private _catalogSearchText(keyword: string): void {
    // key word
    this.catalogSearchText = keyword;
    // 페이지 초기화 후 재조회
    this._searchCatalog();

  }

  /**
   * 검색어로 카달로그 검색
   * @private
   */
  private _searchCatalog() {
    this.catalogService.getCatalogs(this._getCatalogParams()).then((result) => {
      if (result) {
        this._setCatalogHierarchies(result).then((result1) => {
          this.catalogs = [];
          result1.forEach((item, index) => {
            item.forEach((item1) => {
              if (!item1.hasOwnProperty('parentId')) {
                this.catalogs.push(item1);
              } else {
                let list = result1[index - 1].map((catalog) => {
                  return catalog.id;
                });
                if (!this.catalogs[list.indexOf(item1.parentId)].children) {
                  this.catalogs[list.indexOf(item1.parentId)].children = [];
                }
                this.catalogs[list.indexOf(item1.parentId)].hasChild = true;
                this.catalogs[list.indexOf(item1.parentId)].children.push(item1);
                this.catalogs[list.indexOf(item1.parentId)].isOpen = true;
              }
            });

          });
          this.catalogs = _.sortBy(this.catalogs, o => o.name);
          this.catalogs.forEach((item, index) => {
            if (item.children) {
              item.children = _.sortBy(item.children, o => o.name);
            }
          });
        });
        this.metadatas = [];
        this.isUnclassifiedSelected = false;
      }
    }).catch((error) => {

    });
  }

  /**
   * 검색어를 html tag로 감싸다
   * @param name
   * @returns string
   * @private
   */
  private _surroundSearchTextWithTag(name): any {
    return name.replace(new RegExp(this.catalogSearchText, 'gi'),
      `<span class="ddp-txt-search">${this.catalogSearchText}</span>`);
  }

  /**
   * 검색 후 트리구조로 만들기
   * @param results
   * @returns promise object
   * @private
   */
  private _setCatalogHierarchies(results): Promise<any> {
    return new Promise((resolve, reject) => {
      this.catalogs = [];

      results.forEach((result) => {
        result['hierarchies'].forEach((hierarchy, index) => {

          if (!this.catalogs[index]) {
            this.catalogs.push([]);
          }
          if (this.catalogs[index !== 0 ? index - 1 : 0].length > 0) {
            let list = this.catalogs[index].map((c) => {
              return c.id;
            });
            if (list.indexOf(hierarchy.id) === -1) {
              if (index !== 0) {
                this.catalogs[index].push({
                  parentId: result['hierarchies'][index - 1].id,
                  id: hierarchy.id,
                  name: this._surroundSearchTextWithTag(hierarchy.name),
                  hasChild: hierarchy.hasChild,
                });
              } else {

                this.catalogs[index].push({
                  id: hierarchy.id,
                  name: this._surroundSearchTextWithTag(hierarchy.name),
                  hasChild: hierarchy.hasChild,
                });
              }
            }
          } else {
            this.catalogs[index].push(
              {id: hierarchy.id, name: this._surroundSearchTextWithTag(hierarchy.name), hasChild: hierarchy.hasChild});
          }
        });
      });
      resolve(this.catalogs);
    });
  }

  /**
   * get params for meta data list
   * @returns object
   * @private
   */
  private _getCatalogParams(): Object {

    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort,
    };

    // 검색어
    if (!isUndefined(this.catalogSearchText) && this.catalogSearchText.trim() !== '') {
      params['nameContains'] = this.catalogSearchText.trim();
    }

    return params;
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
      pseudoParam : (new Date()).getTime()
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

    // // 카달로그
    // if (this.selectedCatalogId !== null && !isUndefined(this.selectedCatalogId)) {
    //   params['catalogId'] = this.selectedCatalogId;
    // }

    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

    return params;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

class Order {
  key: string = 'logicalName';
  sort: string = 'asc';
}

class SelectedMetadata {
  id: string;
  name: string;
}
