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
import {Location} from '@angular/common';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DeleteModalComponent} from '../../common/component/modal/delete/delete.component';
import {Modal} from '../../common/domain/modal';
import {Alert} from '../../common/util/alert.util';
import {StringUtil} from '../../common/util/string.util';
import {MetadataService} from './service/metadata.service';
import {ActivatedRoute} from '@angular/router';
import {MetadataModelService} from './service/metadata.model.service';
import {SelectCatalogComponent} from './component/select-catalog.component';
import {ChooseCodeTableComponent} from '../component/choose-code-table/choose-code-table.component';
import {ColumnSchemaComponent} from '../detail/component/column-schema/column-schema.component';
import {ChooseColumnDictionaryComponent} from '../component/choose-column-dictionary/choose-column-dictionary.component';
import {ColumnDictionary} from '../../domain/meta-data-management/column-dictionary';
import {CodeTable} from '../../domain/meta-data-management/code-table';
import {Metadata, SourceType} from '../../domain/meta-data-management/metadata';

@Component({
  selector: 'app-metadata-detail',
  templateUrl: './metadata-detail.component.html',
})
export class MetadataDetailComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('metadataName')
  private metadataName: ElementRef;

  @ViewChild('metadataDesc')
  private metadataDesc: ElementRef;

  @ViewChild(SelectCatalogComponent)
  private _selectCatalogComponent: SelectCatalogComponent;

  // 코드 테이블 선택 컴포넌트
  @ViewChild(ChooseCodeTableComponent)
  private _chooseCodeTableComp: ChooseCodeTableComponent;

  @ViewChild(ColumnSchemaComponent)
  private _detailColumnSchemaComp: ColumnSchemaComponent;

  // 컬럼사전 선택 컴포넌트
  @ViewChild(ChooseColumnDictionaryComponent)
  private _chooseColumnDictionaryComp: ChooseColumnDictionaryComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  public tab: string = 'information';

  public isContextMenuShow: boolean = false;

  public selectedMetadataId: string;

  // 이름 에디팅여부
  public isNameEdit: boolean = false;
  public isDescEdit: boolean = false;

  // 에디팅중인 이름
  public editingName: string;

  public name: string;
  public desc: string;

  /**
   * Metadata SourceType Enum
   */
  public readonly METADATA_SOURCE_TYPE = SourceType;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    private _location: Location,
    protected element: ElementRef,
    protected metadataService: MetadataService,
    protected activatedRoute: ActivatedRoute,
    protected injector: Injector,
    public metadataModelService: MetadataModelService) {
    super(element, injector);

    // path variable
    this.activatedRoute.params.subscribe((params) => {

      this.selectedMetadataId = params['metadataId'];

      this.getMetadataDetail();
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Go back
   */
  public goBack() {
    this._location.back();
  } // function - goBack

  /**
   * Get metadata detail information
   */
  public getMetadataDetail() {
    this.loadingShow();
    this.metadataService.getDetailMetaData(this.selectedMetadataId).then((result) => {
      this.loadingHide();
      if (result) {
        this.metadataModelService.setMetadata(result);
      }
    }).catch(() => {
      this.loadingHide();
    });
  } // function - getMetadataDetail

  /**
   * context menu show/hide
   */
  public showContextMenu(event) {
    event.stopImmediatePropagation();
    this.isContextMenuShow = !this.isContextMenuShow;
  } // function - showContextMenu

  /**
   * 메타데이터 삭제 모달 오픈
   */
  public confirmDelete(event) {
    event.stopImmediatePropagation();
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.metadata.md.ui.delete.header');
    modal.description = this.metadataModelService.getMetadata().name;
    this.deleteModalComponent.init(modal);
  } // function - confirmDelete

  /**
   * 메타데이터 삭제
   */
  public deleteMetadata() {
    this.loadingShow();
    this.metadataService.deleteMetaData(this.selectedMetadataId).then(() => {
      this.loadingHide();
      Alert.success(`‘${this.metadataModelService.getMetadata().name}' is deleted.`);
      this.goBack();
    }).catch(() => {
      this.loadingHide();
      Alert.fail('Failed to delete metadata');
    });
  } // function - deleteMetadata

  /**
   * 이름 에디터 모드로 변경
   */
  public onNameEdit(): void {

    this.isNameEdit = true;
    this.editingName = this.metadataModelService.getMetadata().name;

  } // function - onNameEdit

  /**
   * 이름 변경 완료후
   */
  public onNameChange(): void {

    // Edit 상태 종료
    this.isNameEdit = false;

    // Validation
    if (StringUtil.isEmpty(this.editingName.trim())) {

      Alert.warning(this.translateService.instant('msg.metadata.ui.name.ph'));
      return;
    }

    // Set
    this.name = this.editingName.trim();

    // TODO : server 호출
    this.metadataService.updateMetadata(this.selectedMetadataId, {name: this.name}).then((result: Metadata) => {
      this.metadataModelService.updateMetadataName(result.name);
    }).catch((error) => {
      console.info(error);
      Alert.error('Failed to modify metadata name');
    });
  } // function - onNameChange

  /**
   * 이름 에디터 모드 해제
   * */
  public onNameEditCancel(): void {

    // 에디트 모드가 아니라면 중지
    if (!this.isNameEdit) {
      return;
    }

    // 이름 원복
    this.editingName = this.name;

    // 에디트 모드 변경
    this.isNameEdit = !this.isNameEdit;
  } // function - onNameEditCancel

  /**
   * Open catalog popup
   */
  public openCatalog() {
    this._selectCatalogComponent.init();
  }

  /**
   * Open code table popup
   * @param {{name: string, codeTable: CodeTable}} data
   */
  public openCodeTable(data: { name: string, codeTable: CodeTable }) {
    this._chooseCodeTableComp.init(data.name, data.codeTable);
  }

  /**
   * Open dictionary popup
   * @param {{name: string, dictionary: ColumnDictionary}} data
   */
  public openDictionary(data: { name: string, dictionary: ColumnDictionary }) {
    this._chooseColumnDictionaryComp.init(data.name, data.dictionary);
  }

  public codeTableCompleteEvent(data) {
    this._detailColumnSchemaComp.onChangedCodeTable(data);
  }

  public dictionaryCompleteEvent(data) {
    this._detailColumnSchemaComp.onChangedColumnDictionary(data);
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

