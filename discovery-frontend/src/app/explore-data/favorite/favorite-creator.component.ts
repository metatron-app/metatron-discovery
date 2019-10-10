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

@Component({
  selector: 'app-exploredata-favorite-creatore',
  templateUrl: './favorite-creator.component.html',
  entryComponents: [MetadataDataCreatorDataListComponent],
})
export class FavoriteCreatorComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('component_datacreator_data_list', {read: ViewContainerRef}) dataCreatorDataListEntry: ViewContainerRef;

  dataCreatorDataListEntryRef: ComponentRef<MetadataDataCreatorDataListComponent>;

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
    const result = await this.metadataService.getMetaDataList({creatorContains: creator, size: 100}).catch(e => this.commonExceptionHandler(e));

    if (result !== undefined && result) {
      if (result['_embedded']) {
        this.dataCreatorDataListEntryRef = this.dataCreatorDataListEntry.createComponent(this.resolver.resolveComponentFactory(MetadataDataCreatorDataListComponent));
        this.dataCreatorDataListEntryRef.instance.metadataList = result['_embedded']['metadatas'];
        this.dataCreatorDataListEntryRef.instance.creator = creator;
      }
    }

    this.loadingHide();
    this.dataCreatorDataListEntryRef.instance.closedPopup.subscribe(() => {
      // close
      this.dataCreatorDataListEntryRef.destroy();
    });
  }

  onClickFavoriteInCard() {
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
