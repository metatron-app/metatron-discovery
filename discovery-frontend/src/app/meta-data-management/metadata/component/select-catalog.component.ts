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

import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { CatalogService } from '../../catalog/service/catalog.service';
import { Alert } from '../../../common/util/alert.util';
import { Modal } from '../../../common/domain/modal';
import { DeleteModalComponent } from '../../../common/component/modal/delete/delete.component';
import { MetadataService } from '../service/metadata.service';
import { MetadataModelService } from '../service/metadata.model.service';
import { isUndefined } from 'util';
import * as _ from 'lodash';

@Component({
  selector: 'app-select-catalog',
  templateUrl: './select-catalog.component.html'
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

  // 화면 show/hide
  public showFlag : boolean = false;

  public catalogs : any;
  public metadatas : any;

  // 선택된 카타로그 한개
  public selectedCatalog : Catalog;

  public isCreateCatalog : boolean = false;

  public isEditCatalogName : boolean = false;

  // 현재 보고있는 root
  public currentRoot :any =  {name : 'Root', id : 'ROOT'};

  // 뒤로가기를 하기 위한 path 저장
  public catalogPath : any = [{name : 'Root', id : 'ROOT'}];

  public selectedContentSort: Order = new Order();

  public inProcess : boolean = false;

  @ViewChild('catalogInput')
  private catalogInput: ElementRef;

  @ViewChild('newCatalogName')
  private newCatalogName : ElementRef;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected catalogService : CatalogService,
              protected metadataService : MetadataService,
              protected metadataModelService : MetadataModelService,
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
   * 팝업 초기화
   * @param isClose 팝업을 닫을때인지 ?
   */
  public init(isClose?:boolean) {

    if(!isClose) {
      this.showFlag = true;
      this.currentRoot = {name : 'Root', id : 'ROOT'};
      this.catalogPath = [{name : 'Root', id : 'ROOT'}];

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
   * 새로운 카타로그를 만들수 있는지 확인 (3depth 까지만 가능)
   */
  public isCreateAllowed() {
    if (this.isCreateCatalog) {
      return true;
    } else return this.catalogPath.length === 4;
  }

  /**
   * new catalog 버튼 클릭시 새로운 카타로그를 만들수 있는 input box show
   */
  public createCatalog() {
    if (this.catalogPath.length === 4) {
      return;
    }
    this.isCreateCatalog = true;
  }

  /**
   * 새로운 카타로그 생성 API 호출
   */
  public createCatalogDone() {
    if(!isUndefined(this.newCatalogName.nativeElement.value) && this.newCatalogName.nativeElement.value.trim() !== '') {

      let params = {name : this.newCatalogName.nativeElement.value};
      this.currentRoot.id  !== 'ROOT' ? params['parentId'] = this.currentRoot.id : null;
      if (this.inProcess === false) {
        this.inProcess = true;
        this.catalogService.createCatalog(params).then(() => {
          this.init(true);
          this.inProcess = false;
        }).catch((error) => {
          this.inProcess = false;
          Alert.warning(error);
        })
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
   * 루트 폴더인지 확인
   */
  public isRoot() {
    if(this.isCreateCatalog) {
      return true;
    } else {
      return this.catalogPath.length !== 1;
    }
  }

  /**
   * 뒤로 가기 버튼 클릭 시
   */
  public goBack() {

    this.isCreateCatalog ? this.isCreateCatalog = false : null;

    if (this.catalogPath.length > 1) {

      let ids = this.catalogPath.map((item) => {
        return item.id;
      });

      let currentRootId = ids.indexOf(this.currentRoot.id);

      this.currentRoot = this.catalogPath[currentRootId-1];
      this.catalogPath.splice(currentRootId,1);
      this.getCatalogList();

    }

  }

  /**
   * Rename catalog 카타로그 이름 수정
   * @param catalog
   * @param index
   */
  public updateCatalog(catalog,index) {
    if (!isUndefined(this.catalogInput.nativeElement.value) && this.catalogInput.nativeElement.value.trim() !== '') {

      let idx = this.catalogs.map((catalog,idx) => {
        if(idx !== index) {
          return catalog.name
        }
      }).indexOf(this.catalogInput.nativeElement.value);
      if(idx === -1) {
        this.catalogService.updateCatalog(catalog.id, this.catalogInput.nativeElement.value).then(() => {
          this.init(true);
          this.getMetadataDetail();
        }).catch((error) => {
          Alert.error(error);
        })
      } else {
        Alert.warning('Catalog already exists');
        return;
      }
    } else {
      catalog.editing = false;
    }
  } // function - updateCatalog

  /**
   * Cancel editing 수정 취소
   * @param catalog
   */
  public cancelEditing(catalog) {

    if (catalog.editing) {
      catalog.editing = false;
      this.selectedCatalog = new Catalog();
    }

  } // function - cancelEditing

  /**
   * 카타로그 Add 버튼 클릭 시
   */
  public addCatalog() {
    if (isUndefined(this.selectedCatalog.name)) {
      return;
    } else {
      let metadata = this.metadataModelService.getMetadata();
      let idx = metadata.catalogs.map((item) => {
        return item.id
      }).indexOf(this.selectedCatalog.id);
      if (idx === -1) {
        this.catalogPath.push({name : this.selectedCatalog.name, id : this.selectedCatalog.id});
        this.metadataService.linkMetadataWithCatalog(metadata.id,this.selectedCatalog.id).then(()=> {
          this.showFlag = false;
          Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
          this.getMetadataDetail();
          this.init(true);
        }).catch((error) => {
          Alert.error(error);
        })
      } else {
        this.showFlag = false;
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this.init(true);
      }


    }
  }

  /**
   * 메타데이터 reload
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
    })
  } // function - getMetadataDetail

  /**
   * 카타로그 선택
   * @param catalog
   */
  public selectCatalog(catalog) {
    if (!catalog.editing) {
      this.selectedCatalog = _.cloneDeep(catalog);
    }
  }

  /**
   * > 클릭시 (하위 메타데이터 불러오가)
   * @param catalog
   */
  public catalogDetail(catalog) {
      this.currentRoot = {name : catalog.name, id : catalog.id};
      this.catalogPath.push(this.currentRoot);
      this.getCatalogList();
  }

  public getMetadataInCatalog() : Promise<any> {
    return new Promise<any>((resolve,reject) => {
      this.catalogService.getMetadataInCatalog(this.selectedCatalog.id,this._getMetadataParams()).then((result) => {
        this.pageResult.number === 0 && (this.metadatas = []);
        // page 객체
        this.pageResult = result.page;
        // 컬럼 사전 리스트
        this.metadatas = result['_embedded'] ? this.metadatas.concat(result['_embedded']['metadatas']) : [];
        this.metadatas = this.metadatas.map((item) => {
          return item.name
        });
        resolve(this.metadatas);
      }).catch((error)=> {
        reject(error)
      })
    })
  }

  /**
   * 메타데이터 리스트 불러오기
   */
  public getCatalogList() {
    this.loadingShow();
    this.catalogService.getTreeCatalogs(this.currentRoot.id).then((result) => {
      this.loadingHide();
      this.selectedCatalog = new Catalog();
      this.catalogs = result;

      if(this.currentRoot.id === 'ROOT') {
        this.metadatas = [];
      }
      // this.getMetadataInCatalog();
    }).catch((error) => {
      Alert.error(error);
      this.loadingHide();
    })
  }

  /**
   * 하위 메타데이터 불러오기
   * @param catalogId
   */
  public showChildren(catalogId: string) {
    this.catalogService.getTreeCatalogs(catalogId).then((result) => {
      console.info('하위 --> ', result);
    }).catch((error) => {
      Alert.error(error);
    });
  }

  /**
   * 메타데이터 이름 수정 버튼 클릭시
   * @param catalog
   */
  public editCatalog(catalog) {
    catalog.editing = true;
    this.selectedCatalog = new Catalog();
    this.isEditCatalogName = true;
  }

  /**
   * 메타데이터 삭제 모달 오픈
   */
  public confirmDelete(catalog) {
    this.selectedCatalog = _.cloneDeep(catalog);
    this.getMetadataInCatalog().then((result) => {
      const modal = new Modal();
      modal.name = `${this.translateService.instant('msg.metadata.catalog.delete.header',{catalogName : catalog.name})}`;
      if (result.length > 0) {
        modal.name += ' ' + this.translateService.instant('msg.metadata.catalog.delete.header-plural');
      }

      // 데이터가 1개 ~ 3개일때
      if (result.length > 1 && result.length < 4) {
        this.metadatas =`${result.join(', ')}`;
      }
      // 데이터가 3개 이상일 때
      else if (result.length > 3) {
        this.metadatas =`${result.splice(0,3).join(', ')} ...`;
      }

      modal.btnName = this.translateService.instant('msg.comm.ui.del');
      modal.description = `${this.metadatas}`;
      this.deleteModalComponent.init(modal);
    });
  } // function - confirmDelete

  /**
   * 메타데이터 삭제 완료 (모달에서 확인 클릭시)
   */
  public deleteCatalog() {
    this.loadingShow();
    let deletedName = this.selectedCatalog.name;
    this.catalogService.deleteCatalog(this.selectedCatalog.id).then(() => {
      Alert.success(`‘${deletedName}' is deleted.`);
      this.loadingHide();
      this.init();
      this.getMetadataDetail();
    }).catch((error) => {
      this.loadingHide();
      Alert.error(error);
    })
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
  private _getMetadataParams() : Object {

    return {
      size: 15,
      page: 0,
      sort: 'createdTime,desc'
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
