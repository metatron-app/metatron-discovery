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
import {MetadataDataCreatorDataListComponent} from "../explore-data/popup/metadata-data-creator-data-list.component";
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import {MetadataContainerComponent} from "../explore-data/popup/metadata-container.component";
import {Metadata, SourceType} from "../../domain/meta-data-management/metadata";
import {ConfirmRefModalComponent} from "../../common/component/modal/confirm/confirm-ref.component";
import {Modal} from "../../common/domain/modal";

@Component({
  selector: 'app-exploredata-favorite-creatore',
  templateUrl: './favorite-creator.component.html',
  entryComponents: [MetadataDataCreatorDataListComponent, MetadataContainerComponent, ConfirmRefModalComponent],
})
export class FavoriteCreatorComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('component_data_creator_data_list', {read: ViewContainerRef}) dataCreatorDataListEntry: ViewContainerRef;
  dataCreatorDataListEntryRef: ComponentRef<MetadataDataCreatorDataListComponent>;

  @ViewChild('component_metadata_detail', {read: ViewContainerRef}) readonly metadataContainerEntry: ViewContainerRef;
  metadataContainerEntryRef: ComponentRef<MetadataContainerComponent>;

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    private metadataService: MetadataService,
    private resolver: ComponentFactoryResolver,
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

  async onClickCreatorCard(creator: string) {
    this.loadingShow();
    const result = await this.metadataService.getMetaDataList({creatorContains: creator}).catch(e => this.commonExceptionHandler(e));

    if (result !== undefined && result) {
      if (result['_embedded']) {
        this.dataCreatorDataListEntryRef = this.dataCreatorDataListEntry.createComponent(this.resolver.resolveComponentFactory(MetadataDataCreatorDataListComponent));
        this.dataCreatorDataListEntryRef.instance.metadataList = result['_embedded']['metadatas'];
        this.dataCreatorDataListEntryRef.instance.creator = creator;
        this.dataCreatorDataListEntryRef.instance.pageResult = result['page'];

        this.dataCreatorDataListEntryRef.instance.closedPopup.subscribe(() => {
          // close
          this.dataCreatorDataListEntryRef.destroy();
        });

        this.dataCreatorDataListEntryRef.instance.clickedMetadata.subscribe((metadata) => {
          this._showConfirmComponent().then(() => this.onClickMetadata(metadata));
        })
      }
    }

    this.loadingHide();
  }

  onClickMetadata(metadata: Metadata) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    // declare variables needed for metadata-container(modal) component
    let metadataDetail;
    let recentlyQueriesForDatabase;
    let topUserList;
    let recentlyUpdatedList;
    let recentlyUsedList;

    // get datas...
    const getRecentlyQueriesForDatabase = async (sourcetype: SourceType) => {
      if (sourcetype === SourceType.STAGEDB) {
        recentlyQueriesForDatabase = await this.metadataService.getRecentlyQueriesInMetadataDetailForDatabase(metadataDetail.source.id, this.page.page, this.page.size, this.page.sort)
          .catch(error => this.commonExceptionHandler(error));
      } else {
        if (metadataDetail.source.source != undefined) {
          recentlyQueriesForDatabase = await this.metadataService.getRecentlyQueriesInMetadataDetailForDatabase(metadataDetail.source.source.id, this.page.page, this.page.size, this.page.sort)
            .catch(error => this.commonExceptionHandler(error));
        } else {
          recentlyQueriesForDatabase = await this.metadataService.getRecentlyQueriesInMetadataDetailForDatabase(metadataDetail.source.id, this.page.page, this.page.size, this.page.sort)
            .catch(error => this.commonExceptionHandler(error));
        }
      }
    };

    const getTopUser = async () => {
      topUserList = await this.metadataService.getTopUserInMetadataDetail(metadata.id).catch(error => this.commonExceptionHandler(error));
      topUserList = topUserList === undefined ? [] : topUserList;
    };

    const getRecentlyUpdatedList = async () => {
      recentlyUpdatedList = await this.metadataService.getRecentlyUpdatedInMetadataDetail(metadata.id).catch(error => this.commonExceptionHandler(error));
    };

    const getRecentlyUsedList = async () => {
      recentlyUsedList = await this.metadataService.getRecentlyUsedInMetadataDetail(metadata.id, {sort: 'modifiedTime', size: 5, page: 0}).catch(error => this.commonExceptionHandler(error));
    };

    this.metadataService.getDetailMetaData(metadata.id).then(async (result) => {
      this.loadingShow();
      metadataDetail = result;

      await getTopUser();
      await getRecentlyUpdatedList();

      if (metadata.sourceType === SourceType.ENGINE) {
        await getRecentlyUsedList();

        this.metadataContainerEntryRef = this.metadataContainerEntry.createComponent(this.resolver.resolveComponentFactory(MetadataContainerComponent));
        this.metadataContainerEntryRef.instance.metadataDetailData = metadataDetail;
        this.metadataContainerEntryRef.instance.topUserList = topUserList;
        this.metadataContainerEntryRef.instance.recentlyUpdatedList = recentlyUpdatedList;
        if (recentlyUsedList !== undefined && recentlyUsedList['_embedded'] !== undefined) {
          this.metadataContainerEntryRef.instance.recentlyUsedDashboardList = recentlyUsedList['_embedded']['dashboards'];
        }

        this.metadataContainerEntryRef.instance.metadataId = metadata.id;
      } else if (metadata.sourceType === SourceType.JDBC || metadata.sourceType === SourceType.STAGEDB) {
        await getRecentlyQueriesForDatabase(metadata.sourceType);
        this.metadataContainerEntryRef = this.metadataContainerEntry.createComponent(this.resolver.resolveComponentFactory(MetadataContainerComponent));
        this.metadataContainerEntryRef.instance.metadataDetailData = metadataDetail;
        this.metadataContainerEntryRef.instance.topUserList = topUserList;
        this.metadataContainerEntryRef.instance.recentlyUpdatedList = recentlyUpdatedList;
        if (recentlyQueriesForDatabase['_embedded']) {
          this.metadataContainerEntryRef.instance.recentlyQueriesForDataBase = recentlyQueriesForDatabase['_embedded']['queryhistories'];
        }
        this.metadataContainerEntryRef.instance.metadataId = metadata.id;
      }
      this.dataCreatorDataListEntryRef.destroy();
      this.loadingHide();
      // close modal event listener
      this.metadataContainerEntryRef.instance.closedPopup.subscribe(() => {
        this.metadataContainerEntryRef.destroy();
      });
      // toggle favorite in modal listener
      this.metadataContainerEntryRef.instance.onToggleFavorite.subscribe((_) => {
        // modal is shown in list screen
        this.dataCreatorDataListEntryRef.instance.setMetadataList(this.dataCreatorDataListEntryRef.instance.getMetadataListParams()).then();
        // modal is shown in main screen
      });

    }).catch(error => {console.log(error); this.commonExceptionHandler(error)});
  }

  onClickFavoriteInCard() {
    event.stopPropagation();
    event.stopImmediatePropagation();
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
