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

import {CommonModule} from "../common/common.module";
import {RouterModule} from "@angular/router";
import {EventBroadcaster} from "../common/event/event.broadcaster";
import {NgModule} from "@angular/core";
import {FavoriteDataComponent} from "./favorite/favorite-data.component";
import {FavoriteCreatorComponent} from "./favorite/favorite-creator.component";
import {ExploreDataComponent} from "./explore-data/explore-data.component";
import {MetadataContainerComponent} from "./explore-data/popup/metadata-container.component";
import {MetadataColumnsComponent} from "./explore-data/popup/metadata-columns.component";
import {MetadataOverviewComponent} from "./explore-data/popup/metadata-overview.component";
import {MetadataSampleDataComponent} from "./explore-data/popup/metadata-sample-data.component";
import {RecentQueriesComponent} from "./explore-data/popup/recent-queries.component";
import {WorkspaceUsesComponent} from "./explore-data/popup/workspace-uses.component";
import {MetadataService} from "../meta-data-management/metadata/service/metadata.service";
import {DatasourceService} from "../datasource/service/datasource.service";
import {TimezoneService} from "../data-storage/service/timezone.service";
import {BannerComponent} from "./explore-data/component/banner.component";
import {CardComponent} from "./explore-data/component/card.component";
import {CodeTableService} from "../meta-data-management/code-table/service/code-table.service";
import {ExploreDataMainComponent} from "./explore-data/explore-data-main.component";
import {CatalogFolderComponent} from "./explore-data/component/catalog-folder.component";
import {ExploreCatalogMainComponent} from "./explore-data/explore-catalog-main.component";
import {CatalogService} from "../meta-data-management/catalog/service/catalog.service";
import {PopularityLayerComponent} from "./explore-data/component/popularity-layer.component";
import {MetadataTypeBoxTagComponent} from "./explore-data/component/metadata-type-box-tag.component";
import {ConstantService} from "../shared/datasource-metadata/service/constant.service";
import {MetadataModelService} from "../meta-data-management/metadata/service/metadata.model.service";
import {ExploreDataInformationComponent} from "./explore-data/component/explore-data-information.component";
import {ExploreDataUserCardComponent} from "./explore-data/component/explore-data-user-card.component";
import {LogicalNameLayerComponent} from "./explore-data/component/logical-name-layer.component";
import {CreateWorkbenchModule} from "../workbench/component/create-workbench/refactoring/create-workbench.module";
import {DatetimeValidPopupComponent} from "../shared/datasource-metadata/component/datetime-valid-popup.component";
import {FieldConfigService} from "../data-storage/service/field-config.service";
import {DatasourceMetadataSharedModule} from "../shared/datasource-metadata/datasource-metadata-shared.module";
import {ExploreCatalogLayerComponent} from "./explore-data/component/explore-catalog-layer.component";
import {CreateWorkbookModule} from "../workbook/component/create-workbook/refactoring/create-workbook.module";
import {ConfirmRefModalComponent} from "../common/component/modal/confirm/confirm-ref.component";

@NgModule({
  imports: [
    CommonModule,
    CreateWorkbenchModule,
    CreateWorkbookModule,
    DatasourceMetadataSharedModule,
    RouterModule.forChild([
      {path: '', redirectTo: 'view', pathMatch: 'full' },
      {path: 'view', component: ExploreDataComponent},
      {path: 'favorite/data', component: FavoriteDataComponent},
      {path: 'favorite/creator', component: FavoriteCreatorComponent}
    ]),
  ],
  declarations: [
    ConfirmRefModalComponent,
    ExploreDataInformationComponent,
    ExploreDataUserCardComponent,
    MetadataTypeBoxTagComponent,
    PopularityLayerComponent,
    LogicalNameLayerComponent,
    BannerComponent,
    CardComponent,
    CatalogFolderComponent,
    ExploreDataComponent,
    FavoriteDataComponent,
    FavoriteCreatorComponent,
    MetadataContainerComponent,
    MetadataColumnsComponent,
    MetadataOverviewComponent,
    MetadataSampleDataComponent,
    RecentQueriesComponent,
    WorkspaceUsesComponent,
    ExploreDataMainComponent,
    ExploreCatalogMainComponent,
    ExploreCatalogLayerComponent,
  ],
  providers: [
    MetadataService,
    CatalogService,
    DatasourceService,
    TimezoneService,
    CodeTableService,
    ConstantService,
    MetadataModelService
  ],
})
export class ExploreDataModule {
  constructor(private broadCaster: EventBroadcaster) {
    this.broadCaster.broadcast('ENTER_LAYOUT_MODULE');
  }
}
