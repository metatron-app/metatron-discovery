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

import { AbstractComponent } from '../../common/component/abstract.component';
import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectDatatypeComponent } from './create-metadata/select-datatype.component';
import { isUndefined } from 'util';
import { MetadataService } from './service/metadata.service';
import { Metadata, SourceType } from '../../domain/meta-data-management/metadata';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { Modal } from '../../common/domain/modal';
import { Alert } from '../../common/util/alert.util';
import { CatalogService } from '../catalog/service/catalog.service';
declare let $;
import * as _ from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html'
})
export class MetadataComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(SelectDatatypeComponent)
  private _selectDatatypeComponent: SelectDatatypeComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  // 리스트, 카달로그 검색어
  public listSearchText : string;
  public catalogSearchText : string;

  public selectedMetadata : SelectedMetadata;
  public metadatas : Metadata[];

  public sourceTypeList : any = [];
  public sourceType: string;

  public tagsList : any = [];
  public tag : string;

  public selectedCatalogId : string;
  public catalogs : any;

  public selectedContentSort: Order = new Order();

  // Unclassified 선택 여부
  public isUnclassifiedSelected : boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected metadataService : MetadataService,
              protected catalogService : CatalogService,
              public sanitizer: DomSanitizer,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();

    this.init();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public init() {
    this._initView();
  }
  /**
   * When data type list is changed
   * @param event
   */
  public onSourceTypeListChange(event) {
    this.sourceType = event.value;
    this.getMetadataListPageInit();
  }

  /**
   * When tags list is changed
   * @param event
   */
  public onTagsListChange(event) {

    'All' === event.name ? this.tag = '' : this.tag = event.name;
    this.getMetadataListPageInit();
  }

  /**
   * Refresh filter
   */
  public refreshFilter() {
    this._initView();

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
  public getChildren(event,catalog) {
    event.stopImmediatePropagation();
    if(!this.catalogSearchText) {
      if(catalog.hasChild) {
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
    // 정렬 정보 저장
    this.selectedContentSort.key = key;
    // 정렬 key와 일치하면
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
    this.getMetadataListPageInit();
  }

  /**
   * 페이지 초기화 후 컬럼 사전 리스트 재조회
   */
  public getMetadataListPageInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this.getMetadataList();
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
    this.metadataService.getMetaDataList(this._getMetadataParams()).then((result) => {

      this.pageResult.number === 0 && (this.metadatas = []);
      // page 객체
      this.pageResult = result.page;
      // 코드 테이블 리스트
      this.metadatas = result['_embedded'] ? this.metadatas.concat(result['_embedded'].metadatas) : [];
      // 로딩 hide
      this.loadingHide();

    }).catch((error) => {
      this.loadingHide();
    })

  }

  /**
   * 카달로그 리스트 조회 (처음 한번)
   * 트리구조로 카달로그 목록을 불러온다.
   */
  public getCatalogList() {
    this.loadingShow();
    this.catalogService.getTreeCatalogs('ROOT',).then((result) => {
      this.loadingHide();
      if(result.length > 0) {
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

    })
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
    })
  }

  /**
   * 더보기 버튼 클릭
   */
  public onClickGetMoreList() {
    // page 증가
    this.pageResult.number++;
    // 리스트 조회
    this.getMetadataList();
  }

  /**
   * 더 조회할 컨텐츠가 있는지
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages -1);
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
    this.selectedMetadata = {id : metadata.id, name : metadata.name};
    this.deleteModalComponent.init(modal);
  }

  /**
   * 삭제 확인
   */
  public deleteMetadata() {
    this.metadataService.deleteMetaData(this.selectedMetadata.id).then((result) => {
      Alert.success(this.translateService.instant('msg.metadata.alert.md-deleted', { value : this.selectedMetadata.name }));
      this.getMetadataListPageInit();
    }).catch((error) => {
      Alert.fail(this.translateService.instant('msg.metadata.alert.md-delete.fail'));
    })

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
    this.catalogService.getMetadataInCatalog(this.selectedCatalogId, this._getMetadataParams())
      .then((result) => {
        // 전달 받은 page number가 0 이면 컬럼 사전 리스트 초기화
        this.pageResult.number === 0 && (this.metadatas = []);
        // page 객체
        this.pageResult = result.page;
        // 컬럼 사전 리스트
        this.metadatas = result['_embedded'] ? this.metadatas.concat(result['_embedded']['metadatas']) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 코드 테이블 이름 검색
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    event.keyCode === 13 && this._searchText(event.target['value']);
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

  public getMetadataTags() {
    this.metadataService.getMetadataTags().then((result) => {
      this.tagsList = this.tagsList.concat(result);

    })
  }

  /**
   * Get Name and description of metada
   * @param metadata
   * @returns {string}
   */
  public getTooltipValue(metadata) : string {

    let result = metadata.name;
    if (metadata.description) {
      result += ` - ${metadata.description}`;
    }
    return result
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * ui init
   * @param getCatalogList 카달로그 리스트 다시 불러올지 여부
   * @private
   */
  private _initView() {

    this.sourceTypeList = [
      {label : 'All', value : ''},
      {label : 'Datasource', value : SourceType.ENGINE},
      {label : 'Hive', value : SourceType.JDBC},
      {label : 'Staging DB', value : SourceType.STAGING},

    ];

    this.sourceType = '';
    this.listSearchText = '';
    this.tag = '';

    // 정렬 초기화
    this.selectedContentSort = new Order();
    // page 초기화
    this.pageResult.size = 15;
    this.pageResult.number = 0;
    this.selectedContentSort.key = 'createdTime';
    this.selectedContentSort.sort = 'desc';
    this.tagsList = [{name : 'All', id : ''}];

    // 카달로그를 다시 불러오기
    // if (getCatalogList !== false) {
    //   this.getCatalogList();
    // }

    this.getMetadataList();
    this.getMetadataTags();
  }

  /**
   *  선택된 카달로그 모두 해제
   */
  private _refreshSelectedCatalog() {
    this.catalogs.forEach((catalog) => {
      catalog.selected = false;
      if(catalog.children) {
        catalog.children.forEach((child) => {
          child.selected = false;
          if(child.children) {
            child.children.forEach((last) => {
              last.selected = false;
            });
          }
        })
      }
    })
  }

  /**
   * 검색어로 카달로그 이름 검색
   * @param {string} keyword
   * @private
   */
  private _searchText(keyword: string): void {
    // key word
    this.listSearchText = keyword;
    // 페이지 초기화 후 재조회
    this.getMetadataListPageInit();
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
      if(result) {
        this._setCatalogHierarchies(result).then((result1) => {
          this.catalogs = [];
          result1.forEach((item,index) => {
            item.forEach((item1) =>{
              if(!item1.hasOwnProperty('parentId')) {
                this.catalogs.push(item1)
              } else {
                let list = result1[index-1].map((catalog) => {
                  return catalog.id
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
          this.catalogs =_.sortBy(this.catalogs, o => o.name)
          this.catalogs.forEach((item,index) => {
            if (item.children) {
              item.children =_.sortBy(item.children, o => o.name)
            }
          })
        });
        this.metadatas = [];
        this.isUnclassifiedSelected = false;
      }
    }).catch((error) => {

    })
  }

  /**
   * 검색어를 html tag로 감싸다
   * @param name
   * @returns string
   * @private
   */
  private _surroundSearchTextWithTag(name) : any {
    return name.replace( new RegExp(this.catalogSearchText, "gi"),`<span class="ddp-txt-search">${this.catalogSearchText}</span>`)
  }

  /**
   * 검색 후 트리구조로 만들기
   * @param results
   * @returns promise object
   * @private
   */
  private _setCatalogHierarchies(results) : Promise<any> {
    return new Promise((resolve, reject)=> {
      this.catalogs = [];

      results.forEach((result) => {
        result['hierarchies'].forEach((hierarchy,index) => {

          if(!this.catalogs[index]) {
            this.catalogs.push([]);
          }
          if (this.catalogs[index !== 0 ? index-1 : 0].length > 0) {
            let list = this.catalogs[index].map((c)=> {return c.id});
            if(list.indexOf(hierarchy.id) === -1){
              if(index !== 0 ) {
                this.catalogs[index].push({parentId : result['hierarchies'][index-1].id, id : hierarchy.id, name : this._surroundSearchTextWithTag(hierarchy.name), hasChild : hierarchy.hasChild })
              } else {

                this.catalogs[index].push({id : hierarchy.id, name : this._surroundSearchTextWithTag(hierarchy.name), hasChild : hierarchy.hasChild })
              }
            }
          } else {
            this.catalogs[index].push({id : hierarchy.id, name : this._surroundSearchTextWithTag(hierarchy.name), hasChild : hierarchy.hasChild })
          }
        })
      });
      resolve(this.catalogs);
    })
  }

  /**
   * get params for meta data list
   * @returns object
   * @private
   */
  private _getCatalogParams() : Object {

    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
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
  private _getMetadataParams() : Object {

    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
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
  id: string ;
  name: string ;
}
