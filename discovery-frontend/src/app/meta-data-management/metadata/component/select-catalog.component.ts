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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {CatalogService} from '../../catalog/service/catalog.service';
import {Alert} from '@common/util/alert.util';
import {Modal} from '@common/domain/modal';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {MetadataService} from '../service/metadata.service';
import {MetadataModelService} from '../service/metadata.model.service';
import {isUndefined} from 'util';
import * as _ from 'lodash';

@Component({
  selector: 'app-select-catalog',
  templateUrl: './select-catalog.component.html',
})
export class SelectCatalogComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  // screen show/hide
  public showFlag: boolean = false;

  public catalogs: any;
  public metadatas: any;

  // selected cataglog
  public selectedCatalog: Catalog;

  public isCreateCatalog: boolean = false;

  public isEditCatalogName: boolean = false;

  // current root
  public currentRoot: any = {name: 'Root', id: 'ROOT'};

  // save path to go back
  public catalogPath: any = [{name: 'Root', id: 'ROOT'}];

  public selectedContentSort: Order = new Order();

  public inProcess: boolean = false;

  @ViewChild('catalogInput')
  private catalogInput: ElementRef;

  @ViewChild('newCatalogName')
  private newCatalogName: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(
    protected element: ElementRef,
    protected catalogService: CatalogService,
    protected metadataService: MetadataService,
    protected metadataModelService: MetadataModelService,
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
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * initialize popup
   * @param isClose: close or open popup flag
   */
  public init(isClose?: boolean) {

    if (!isClose) {
      this.showFlag = true;
      this.currentRoot = {name: 'Root', id: 'ROOT'};
      this.catalogPath = [{name: 'Root', id: 'ROOT'}];

      // 정렬 초기화
      this.selectedContentSort = new Order();
      // page 초기화
      this.selectedContentSort.key = 'createdTime';
      this.selectedContentSort.sort = 'desc';
    }
    this.isCreateCatalog = false;
    this.isEditCatalogName = false;
    this.selectedCatalog = new Catalog();
    this.catalogs = [];
    this.metadatas = [];

    this.getCatalogList();
  }

  /**
   * Check if create new catalog is possible (upto 3 depth is possible)
   */
  public isCreateAllowed() {
    if (this.isCreateCatalog) {
      return true;
    } else return this.catalogPath.length === 4;
  }

  /**
   * if new catalog button clicked, show input box to make new catalog
   */
  public createCatalog() {
    if (this.catalogPath.length === 4) {
      return;
    }
    this.isCreateCatalog = true;
  }

  /**
   * Call api to make new catalog
   */
  public createCatalogDone() {
    if (!isUndefined(this.newCatalogName.nativeElement.value) && this.newCatalogName.nativeElement.value.trim() !==
      '') {

      const params = {name: this.newCatalogName.nativeElement.value};
      this.currentRoot.id !== 'ROOT' ? params['parentId'] = this.currentRoot.id : null;
      if (this.inProcess === false) {
        this.inProcess = true;
        this.catalogService.createCatalog(params).then(() => {
          this.init(true);
          this.inProcess = false;
        }).catch((error) => {
          this.inProcess = false;
          Alert.warning(error);
        });
      }
    } else {
      Alert.warning('Check catalog name');
    }
  }

  public createCatalogByKeypress(event) {
    if (event.keyCode === 13) {
      this.createCatalogDone();
    }
  }

  /**
   * Check if root folder
   */
  public isRoot() {
    if (this.isCreateCatalog) {
      return true;
    } else {
      return this.catalogPath.length !== 1;
    }
  }

  /**
   * When back button is clicked
   */
  public goBack() {

    this.isCreateCatalog ? this.isCreateCatalog = false : null;

    if (this.catalogPath.length > 1) {

      const ids = this.catalogPath.map((item) => {
        return item.id;
      });

      const currentRootId = ids.indexOf(this.currentRoot.id);

      this.currentRoot = this.catalogPath[currentRootId - 1];
      this.catalogPath.splice(currentRootId, 1);
      this.getCatalogList();

    }

  }

  /**
   * Rename catalog
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
          this.init(true);
          this.getMetadataDetail();
        }).catch((error) => {
          Alert.error(error);
        });
      } else {
        Alert.warning('Catalog already exists');
        return;
      }
    } else {
      catalog.editing = false;
    }
  } // function - updateCatalog

  /**
   * Cancel editing
   * @param catalog
   */
  public cancelEditing(catalog) {

    if (catalog.editing) {
      catalog.editing = false;
      this.selectedCatalog = new Catalog();
    }

  } // function - cancelEditing

  /**
   * When catalog add button is clicked
   */
  public addCatalog() {
    if (isUndefined(this.selectedCatalog.name)) {
      return;
    } else {
      const metadata = this.metadataModelService.getMetadata();
      const idx = metadata.catalogs.map((item) => {
        return item.id;
      }).indexOf(this.selectedCatalog.id);
      if (idx === -1) {
        this.catalogPath.push({name: this.selectedCatalog.name, id: this.selectedCatalog.id});
        this.metadataService.linkMetadataWithCatalog(metadata.id, this.selectedCatalog.id).then(() => {
          this.showFlag = false;
          Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
          this.getMetadataDetail();
          this.init(true);
        }).catch((error) => {
          Alert.error(error);
        });
      } else {
        this.showFlag = false;
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this.init(true);
      }

    }
  }

  /**
   * Metadata reload
   */
  public getMetadataDetail() {
    this.loadingShow();
    this.metadataService.getDetailMetaData(this.metadataModelService.getMetadata().id).then((result) => {
      this.loadingHide();
      if (result) {
        this.metadataModelService.setMetadata(result);
      }
    }).catch((error) => {
      Alert.error(error);
      this.loadingHide();
    });
  } // function - getMetadataDetail

  /**
   * Select Catalog
   * @param catalog
   */
  public selectCatalog(catalog) {
    if (!catalog.editing) {
      this.selectedCatalog = _.cloneDeep(catalog);
    }
  }

  /**
   * When '>' clicked load child metadata
   * @param catalog
   */
  public catalogDetail(catalog) {
    this.currentRoot = {name: catalog.name, id: catalog.id};
    this.catalogPath.push(this.currentRoot);
    this.getCatalogList();
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
   * Load Metadata List
   */
  public getCatalogList() {
    this.loadingShow();
    this.catalogService.getTreeCatalogs(this.currentRoot.id).then((result) => {
      this.loadingHide();
      this.selectedCatalog = new Catalog();
      this.catalogs = result;

      if (this.currentRoot.id === 'ROOT') {
        this.metadatas = [];
      }
      // this.getMetadataInCatalog();
    }).catch((error) => {
      Alert.error(error);
      this.loadingHide();
    });
  }

  /**
   * Load child metadata
   * @param catalogId
   */
  public showChildren(catalogId: string) {
    this.catalogService.getTreeCatalogs(catalogId).then((result) => {
      console.log('하위 --> ', result);
    }).catch((error) => {
      Alert.error(error);
    });
  }

  /**
   * When edit metadata's name button clicked
   * @param catalog
   */
  public editCatalog(catalog) {
    catalog.editing = true;
    this.selectedCatalog = new Catalog();
    this.isEditCatalogName = true;
  }

  /**
   * Show delete metadata modal
   */
  public confirmDelete(catalog) {
    this.selectedCatalog = _.cloneDeep(catalog);
    this.getMetadataInCatalog().then((result) => {
      const modal = new Modal();
      modal.name = `${this.translateService.instant('msg.metadata.catalog.delete.header',
        {catalogName: catalog.name})}`;
      if (result.length > 0) {
        modal.name += ' ' + this.translateService.instant('msg.metadata.catalog.delete.header-plural');
      }

      // if data count is 1 ~ 3
      if (result.length > 1 && result.length < 4) {
        this.metadatas = `${result.join(', ')}`;
      }
      // if data count is more than 3
      else if (result.length > 3) {
        this.metadatas = `${result.splice(0, 3).join(', ')} ...`;
      }

      modal.btnName = this.translateService.instant('msg.comm.ui.del');
      modal.description = `${this.metadatas}`;
      this.deleteModalComponent.init(modal);
    });
  } // function - confirmDelete

  /**
   * Delete metadata complete ( when confirm button clicked in modal )
   */
  public deleteCatalog() {
    this.loadingShow();
    const deletedName = this.selectedCatalog.name;
    this.catalogService.deleteCatalog(this.selectedCatalog.id).then(() => {
      Alert.success(`‘${deletedName}' is deleted.`);
      this.loadingHide();
      this.init();
      this.getMetadataDetail();
    }).catch((error) => {
      this.loadingHide();
      Alert.error(error);
    });
  }

  public closeDelete() {
    this.metadatas = [];
    this.selectedCatalog = new Catalog();
  }

  /**
   * get params for meta data list
   * @returns object
   * @private
   */
  private _getMetadataParams(): object {

    return {
      size: 15,
      page: 0,
      sort: 'createdTime,desc',
    };
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    | Protected Method
    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}

class Catalog {
  name: string;
  id: string;
}

class Order {
  key: string = 'logicalName';
  sort: string = 'asc';
}
