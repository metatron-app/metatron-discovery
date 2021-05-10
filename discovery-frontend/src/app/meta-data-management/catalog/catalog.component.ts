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
import {isUndefined} from 'util';
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {Modal} from '@common/domain/modal';
import {AbstractComponent} from '@common/component/abstract.component';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {CatalogService} from './service/catalog.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
})
export class CatalogComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('catalogInput')
  private catalogInput: ElementRef;

  @ViewChild('newCatalogName')
  private newCatalogName: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  @ViewChild('searchInput')
  public searchInput: ElementRef;

  public catalogs: Catalog[];
  public metadatas: any;

  public selectedContentSort: Order = new Order();

  public selectedCatalog: Catalog;

  public searchText: string;

  public catalogPath: any = [{name: 'Root', id: 'ROOT'}];

  public currentRoot: any = {name: 'Root', id: 'ROOT'};

  public isCreateCatalog: boolean = false;

  public isEditCatalogName: boolean = false;

  public isCatalogPaging: boolean = false;

  public inProcess: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(
    protected element: ElementRef,
    protected catalogService: CatalogService,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();

    this.initView();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public searchCatalog() {
    this.loadingShow();
    this.catalogService.getCatalogs(this._getCatalogParams()).then((result) => {
      this.loadingHide();
      this.catalogs = result;
    }).catch((error) => {
      this.loadingHide();
      Alert.error(error);
    });
  }

  /**
   * 새로운 카타로그를 만들수 있는지 확인 (3depth 까지만 가능)
   */
  public isCreateAllowed() {

    if (this.isCreateCatalog) {
      return true;
    } else return this.catalogPath.length === 4;
  }

  /**
   * 루트 폴더인지 확인
   */
  public isRoot() {
    if (this.isCreateCatalog) {
      return true;
    } else {
      return this.catalogPath.length !== 1;
    }
  }

  /**
   * 카달로그 리스트 불러오기 (페이징 없음)
   */
  public getCatalogList() {
    this.loadingShow();
    this.catalogService.getTreeCatalogs(this.currentRoot.id).then((result: Catalog[]) => {
      this.loadingHide();
      this.selectedCatalog = new Catalog();
      this.catalogs = result;
      // this.getMetadataInCatalog();
    }).catch((error) => {
      Alert.error(error);
      this.loadingHide();
    });
  }

  /**
   * > 클릭시 (하위 메타데이터 불러오가)
   * @param catalog
   */
  public catalogDetail(catalog) {
    if (catalog.editing) {
      return;
    }

    if (!this.deleteModalComponent.isShow) {
      if (!this.isEditCatalogName) {
        this.currentRoot = {name: catalog.name, id: catalog.id};
        this.catalogPath.push(this.currentRoot);

        if (this.searchText) {
          this.searchCatalog();
        } else {
          this.getCatalogList();
        }
      }
    }
  }

  /**
   * Rename catalog 카타로그 이름 수정
   * @param catalog
   * @param index
   */
  public updateCatalog(catalog, index) {
    if (!isUndefined(this.catalogInput.nativeElement.value) && this.catalogInput.nativeElement.value.trim() !== '') {

      const idx = this.catalogs.map((catalogItem, catalogIdx) => {
        if (catalogIdx !== index) {
          return catalogItem.name;
        }
      }).indexOf(this.catalogInput.nativeElement.value);
      if (idx === -1) {
        this.catalogService.updateCatalog(catalog.id, this.catalogInput.nativeElement.value).then(() => {
          this.initView();
        }).catch((error) => {
          Alert.error(error);
        });
      } else {
        Alert.warning(this.translateService.instant('msg.catalog.alert.catalog.already.exists'));
        return;
      }
    } else {
      catalog.editing = false;
    }
  } // function - updateCatalog

  /**
   * new catalog 버튼 클릭시 새로운 카타로그를 만들수 있는 input box show
   */
  public createCatalog() {
    if (this.catalogPath.length === 4 || this.isCreateCatalog) {
      return;
    } else {
      this.isCreateCatalog = true;
    }
  }

  /**
   * 뒤로 가기 버튼 클릭 시
   */
  public goBack() {

    // If is creating just close create input
    if (this.isCreateCatalog) {
      this.isCreateCatalog = !this.isCreateCatalog;
    } else {

      if (this.catalogPath.length > 1) {

        const ids = [];
        this.catalogPath.forEach((item) => {
          ids.push(item.id);
        });

        const currentRootId = ids.indexOf(this.currentRoot.id);

        this.currentRoot = this.catalogPath[currentRootId - 1];
        this.catalogPath.splice(currentRootId, 1);

        if (this.searchText) {
          this.searchCatalog();
        } else {
          this.getCatalogList();
        }

      }

    }

  }

  /**
   * 메타데이터 삭제 모달 오픈
   */
  public confirmDelete(event, catalog) {
    event.stopImmediatePropagation();
    this.selectedCatalog = _.cloneDeep(catalog);
    this.getMetadataInCatalog().then((result) => {
      const modal = new Modal();
      modal.name = `${this.translateService.instant('msg.metadata.catalog.delete.header', {catalogName: catalog.name})}`;
      if (result.length > 0) {
        modal.name += ' ' + this.translateService.instant('msg.metadata.catalog.delete.header-plural');
      }

      // 데이터가 1개 ~ 3개일때
      if (result.length > 1 && result.length < 4) {
        this.metadatas = `${result.join(', ')}`;
      }
      // 데이터가 3개 이상일 때
      else if (result.length > 3) {
        this.metadatas = `${result.splice(0, 3).join(', ')} ...`;
      }

      modal.description = `${this.metadatas}`;
      this.deleteModalComponent.init(modal);
    });
  } // function - confirmDelete

  public closeDelete() {
    this.metadatas = [];
    this.selectedCatalog = new Catalog();
  }

  public getMetadataInCatalog(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.catalogService.getMetadataInCatalog(this.selectedCatalog.id, this._getMetadataParams()).then((result) => {
        this.pageResult.number === 0 && (this.metadatas = []);
        // page 객체
        this.pageResult = result.page;
        // 컬럼 사전 리스트
        this.metadatas = result['_embedded'] ? this.metadatas.concat(result['_embedded']['metadatas']) : [];
        this.metadatas = this.metadatas.map((item) => {
          return item.name;
        });
        resolve(this.metadatas);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * 메타데이터 삭제 완료 (모달에서 확인 클릭시)
   */
  public deleteCatalog() {
    this.loadingShow();
    const deletedName = this.selectedCatalog.name;
    this.catalogService.deleteCatalog(this.selectedCatalog.id).then(() => {
      Alert.success(`‘${deletedName}' is deleted.`);
      this.loadingHide();
      this.initView();
    }).catch((error) => {
      this.loadingHide();
      Alert.error(error);
    });
  }

  /**
   * 메타데이터 이름 수정 버튼 클릭시
   * @param catalog
   */
  public editCatalog(catalog) {
    catalog.editing = true;
    this.safelyDetectChanges();
    this.catalogInput.nativeElement.value = catalog.name; // 현재 값 적용
    this.catalogInput.nativeElement.focus();

    this.selectedCatalog = new Catalog();
    this.isEditCatalogName = true;

    setTimeout(() => {
      this.catalogInput.nativeElement.value = catalog.name;
    });

  }

  /**
   * 새로운 카타로그 생성 API 호출
   */
  public createCatalogDone() {
    if (!isUndefined(this.newCatalogName.nativeElement.value) && this.newCatalogName.nativeElement.value.trim() !== '') {

      const params = {name: this.newCatalogName.nativeElement.value};
      this.currentRoot.id !== 'ROOT' ? params['parentId'] = this.currentRoot.id : null;
      if (this.inProcess === false) {
        this.inProcess = true;
        this.catalogService.createCatalog(params).then((result) => {
          this.initView();
          this.inProcess = false;
          Alert.success(this.translateService.instant('msg.catalog.alert.catalog.create.success', {value: result.name}));
        }).catch((error) => {
          if (error && error.message) {
            Alert.warning(error.message);
          }
          this.inProcess = false;
        });
      }
    } else {
      this.inProcess = false;
      Alert.warning('Check catalog name');
    }
  }

  /**
   * 엔터키로 카다로그 생성 시
   */
  public createCatalogByKeypress(event) {
    if (event.keyCode === 13) {
      this.createCatalogDone();
    }
  }

  /**
   * Cancel editing 수정 취소
   * @param catalog
   */
  public cancelEditing(catalog) {
    catalog.editing = false;
    this.isEditCatalogName = false;
  } // function - cancelEditing

  /**
   * 페이지 초기화 후 컬럼 사전 리스트 재조회
   */
  public getCategoryListPageInit(): void {
    // 페이지 초기화
    this.pageResult.number = 0;
    // 재조회
    this.searchCatalog();
  }

  /**
   * ui init
   */
  public initView() {

    this.isEditCatalogName = false;
    this.isCreateCatalog = false;
    this.isCatalogPaging = false;
    this.selectedCatalog = new Catalog();
    this.catalogs = [];
    this.metadatas = [];

    // 정렬 초기화
    this.selectedContentSort = new Order();
    // page 초기화
    this.pageResult.size = 5;
    this.pageResult.number = 0;
    this.searchText = '';
    this.selectedContentSort.key = 'createdTime';
    this.selectedContentSort.sort = 'desc';

    this.getCatalogList();
    // this.getMetadataInCatalog();
  }

  public refreshFilter() {
    // 정렬
    this.selectedContentSort = new Order();
    // 검색조건 초기화
    this.searchText = '';
    // 페이지 초기화
    this.pageResult.number = 0;
    this.searchCatalog();

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * get params for meta data list
   * @returns object
   * @private
   */
  private _getMetadataParams(): object {

    return {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort,
    };
  }

  private _getCatalogParams(): object {
    const params = {
      size: this.pageResult.size,
      page: this.pageResult.number,
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort,
    };

    // 검색어
    if (!isUndefined(this.searchText) && this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }

    params['parentId'] = this.currentRoot.id;
    return params;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

class Order {
  key: string = 'createdTime';
  sort: string = 'asc';
}

class Catalog {
  name: string;
  id: string;
  countOfChild?: number;
  editing?: boolean;
}

