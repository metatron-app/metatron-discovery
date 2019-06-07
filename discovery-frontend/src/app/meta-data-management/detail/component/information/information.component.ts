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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild, ViewChildren} from '@angular/core';
import * as _ from 'lodash';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {InputComponent} from '../../../../common/component/input/input.component';
import {MetadataService} from '../../../metadata/service/metadata.service';
import {MetadataModelService} from '../../../metadata/service/metadata.model.service';
import {Alert} from '../../../../common/util/alert.util';
import {Metadata, SourceType} from '../../../../domain/meta-data-management/metadata';
import {MetadataSourceType} from "../../../../domain/meta-data-management/metadata-source";
import {StorageService} from "../../../../data-storage/service/storage.service";

@Component({
  selector: 'app-metadata-detail-information',
  templateUrl: './information.component.html'
})
export class InformationComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('metadataDesc')
  private metadataDesc: ElementRef;

  @ViewChildren(InputComponent)
  private tagInput: InputComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isDescEdit: boolean = false;
  public editingDesc: string;
  public desc: string;
  public isAddTag: boolean = false;

  public tagFlag: boolean = false; // only call attach tag API one at a time

  public tagValue: string = '';
  public tagsList: any = [];

  @Output()
  public openAddCataglog = new EventEmitter();

  @Input()
  public isNameEdit: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    protected metadataService: MetadataService,
    protected storageService: StorageService,
    public metadataModelService: MetadataModelService,
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

    this.getMetadataTags();

  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  get filteredTagsList() {
    let list = [];
    if (this.tagsList.length > 0 && '' !== this.tagValue) {
      this.tagsList.forEach((tag) => {
        if (tag.name.indexOf(this.tagValue) !== -1) {
          list.push(tag.name);
        }
      });
    }
    return list;
  }

  /**
   * Catalog popup open
   */
  public addCatalog() {
    this.openAddCataglog.emit();
  } // function - addCatalog

  isDatabaseTypeMetadata(): boolean {
    return Metadata.isSourceTypeIsJdbc(this.metadataModelService.getMetadata().sourceType)
  }

  getMetadataType(): string {
    switch (this.metadataModelService.getMetadata().sourceType) {
      case SourceType.ENGINE:
        return this.translateService.instant('msg.comm.th.ds');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.STAGEDB:
        return this.translateService.instant('msg.storage.li.hive');
    }
  }

  getMetadataDatabaseTypeToString(): string {
    return this.storageService.findConnectionType(this.metadataModelService.getMetadata().source.source.implementor).name || this.metadataModelService.getMetadata().source.source.implementor.toString();
  }

  /**
   * Get metadata tags
   */
  public getMetadataTags() {
    this.metadataService.getMetadataTags().then((result) => {
      if (result) {
        this.tagsList = result;
      } else {
        this.tagsList = [];
      }
    }).catch((error) => {
      console.error(error);
    });
  } // function - getMetadataTags

  /**
   * Tag 삭제
   * @param tag
   */
  public deleteTag(tag) {
    this.metadataService.deleteTagFromMetadata(this.metadataModelService.getMetadata().id, [ tag.name ]).then(() => {
      this.getMetadataDetail();
    }).catch((err) => {
      console.info('error -> ', err);
    });
  }

  /**
   * Tag 추가
   */
  public addTag() {

    let idx = this.metadataModelService.getMetadata().tags.map((item) => {
      return item.name;
    }).indexOf(this.tagValue);

    if (this.tagValue === '' || idx !== -1) {
      return;
    }
    if (!this.tagFlag) {
      this.tagFlag = true;
      this.metadataService.addTagToMetadata(this.metadataModelService.getMetadata().id, [ this.tagValue ]).then(() => {
        this.tagValue = '';
        this.isAddTag = false;
        this.getMetadataDetail();
        this.tagFlag = false;
      }).catch((err) => {
        console.info('error -> ', err);
        this.tagFlag = false;
      });
    }
  } // function - addTag

  /**
   * Click outside event handler (tag input)
   */
  public tagClickOutsideEvent() {
    this.tagValue = '';
  } // function - tagClickOutsideEvent

  /**
   * 태그 리스트에서 선택된 값을 인풋에 입력
   * @param tag
   */
  public setTagValue(tag) {
    this.tagValue = tag;
  } // function - setTagValue

  /**
   * 페이지명 에디터 모드 해제
   */
  public onDescEditCancel(): void {

    // 에디트 모드가 아니라면 중지
    if (!this.isDescEdit) {
      return;
    }

    // 이름 원복
    this.editingDesc = this.desc;

    // 에디트 모드 변경
    this.isDescEdit = !this.isDescEdit;

  } // function - onDescEditCancel

  /**
   * 이름 변경 완료후
   */
  public onDescChange(): void {

    this.loadingShow();

    // Edit 상태 종료
    this.isDescEdit = false;

    // Set
    this.editingDesc ? this.desc = this.editingDesc.trim() : this.desc = '';

    this.metadataService.updateMetadata(this.metadataModelService.getMetadata().id, { description: this.desc }).then((result) => {
      this.loadingHide();
      if (result) {
        this.getMetadataDetail();
      }
    }).catch((error) => {
      this.loadingHide();
      Alert.warning(error);
    });
  } // function - onDescChange

  /**
   * 이름 에디터 모드로 변경
   * @param $event
   */
  public onDescEdit($event: Event): void {

    $event.stopPropagation();

    this.isDescEdit = !this.isDescEdit;
    this.editingDesc = this.metadataModelService.getMetadata().description;
    this.changeDetect.detectChanges();
    this.metadataDesc.nativeElement.focus();
  }

  /**
   * Metadata에 연결된 카타로그를 지운다
   * @param catalogId
   */
  public deleteCatalogFromMetadata(catalogId) {
    this.metadataService.deleteCatalogLinkFromMetadata(this.metadataModelService.getMetadata().id, catalogId).then(() => {
      this.getMetadataDetail();
    }).catch((error) => {
      Alert.error(error);
    });
  }

  /**
   * Metadata 정보 갱신
   */
  public getMetadataDetail() {
    this.loadingShow();
    this.metadataService.getDetailMetaData(this.metadataModelService.getMetadata().id).then((result) => {
      this.loadingHide();
      if (result) {
        this.metadataModelService.setMetadata(result);
        this.getMetadataTags();
      }
    }).catch((error) => {
      Alert.error(error);
      this.loadingHide();
    });
  }

  /**
   * Get description with line break
   * @param {string} description
   * @returns {any}
   */
  public getDescription(description: string) {
    if (_.isNil(description)) {
      return;
    }
    if (description === '') {
      return this.translateService.instant('msg.metadata.ui.no.description');
    }
    return description.replace(/\r\n|\n/gi, '<br>');
  }

  public gotoDatasource() {
    const metadata = this.metadataModelService.getMetadata();
    const datasourceId = metadata.source.source.id;
    if (_.isNil(datasourceId)) {
      return;
    }
    this.router.navigate([ `/management/storage/datasource/${datasourceId}` ]);
  }

  public isSourceTypeDatasource() {
    return !_.isNil(this.metadataModelService.getMetadata().source.source);
  }

  public isMetadataSourceTypeIsEngine() {
    return Metadata.isSourceTypeIsEngine(this.metadataModelService.getMetadata().sourceType);
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

