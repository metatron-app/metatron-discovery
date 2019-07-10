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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import {Metadata} from "../../domain/meta-data-management/metadata";
import * as _ from 'lodash';
import {CatalogService} from "../../meta-data-management/catalog/service/catalog.service";
import {ExploreDataListComponent} from "./explore-data-list.component";

@Component({
  selector: 'app-exploredata-view',
  templateUrl: './explore-data.component.html',
})
export class ExploreDataComponent extends AbstractComponent implements OnInit, OnDestroy {
  
  @ViewChild(ExploreDataListComponent)
  private readonly _exploreDataListComponent: ExploreDataListComponent;

  selectedMetadata: Metadata;
  // data
  mode: ExploreMode = ExploreMode.MAIN;
  sourceTypeCount: number = 0;
  stagingTypeCount: number = 0;
  databaseTypeCount: number = 0;

  // enum
  readonly EXPLORE_MODE = ExploreMode;

  // 생성자
  constructor(private metadataService: MetadataService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  // Init
  public ngOnInit() {
    super.ngOnInit();

    const init = async () => {
      this.loadingShow();
      await this._setMetadataSourceTypeCount();
    };
    init().catch(error => this.commonExceptionHandler(error));
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    $( '.ddp-layout-contents' ).addClass( 'ddp-layout-meta' )
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
    $( '.ddp-layout-contents' ).removeClass( 'ddp-layout-meta' )
  }

  @HostListener('window:scroll')
  onScrolled() {
    if($(window).scrollTop() > 0){
      $('.ddp-layout-contents').addClass('ddp-scroll');
    }
    else if($(window).scrollTop() === 0) {
      $('.ddp-layout-contents').removeClass('ddp-scroll');
    }
  }

  goToExploreMain() {
    this.mode = ExploreMode.MAIN;
  }

  onChangedSearch(): void {
    this._setExploreListMode();
    this._exploreDataListComponent.initMetadataList();
  }

  onChangedLnbData(): void {
    this._setExploreListMode();
    this._exploreDataListComponent.initMetadataList();
  }

  onClickMetadata(metadata: Metadata) {
    this.selectedMetadata = metadata
  }

  onCloseMetadataContainer() {
    this.selectedMetadata = null;
  }

  private async _setMetadataSourceTypeCount() {
    const result: {ENGINE: number, JDBC: number, STAGEDB: number} = await this.metadataService.getMetadataSourceTypeCount();
    if (!_.isNil(result.ENGINE)) {
      this.sourceTypeCount = result.ENGINE;
    }
    if (!_.isNil(result.JDBC)) {
      this.databaseTypeCount = result.JDBC;
    }
    if (!_.isNil(result.STAGEDB)) {
      this.stagingTypeCount = result.STAGEDB;
    }
  }

  private _setExploreListMode() {
    // if MAIN component
    if (this.mode === ExploreMode.MAIN) {
      this.mode = ExploreMode.LIST;
      this.safelyDetectChanges();
    }
  }
}

enum ExploreMode {
  MAIN = 'MAIN',
  LIST = 'LIST'
}
