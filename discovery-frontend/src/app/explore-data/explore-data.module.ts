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
import {ExploreBannerComponent} from "./explore-data/component/explore-banner.component";
import {ExploreCardComponent} from "./explore-data/component/explore-card.component";
import {CodeTableService} from "../meta-data-management/code-table/service/code-table.service";
import {ExploreDataMainComponent} from "./explore-data/explore-data-main.component";
import {CatalogFolderComponent} from "./explore-data/component/catalog-folder.component";
import {ExploreDataListComponent} from "./explore-data/explore-data-list.component";
import {CatalogService} from "../meta-data-management/catalog/service/catalog.service";
import {MetadataSvgComponent} from "./explore-data/component/metadata-svg.component";
import {ExploreDataSearchComponent} from "./explore-data/explore-data-search.component";
import {ExploreDataModelService} from "./explore-data/service/explore-data-model.service";
import {ExploreDataLnbComponent} from "./explore-data/explore-data-lnb.component";
import {ConstantService} from "../shared/datasource-metadata/service/constant.service";
import {CheckBoxFilterComponent} from "./explore-data/component/check-box-filter.component";
import {MetadataTypeBoxTagComponent} from "./explore-data/component/metadata-type-box-tag.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', redirectTo: 'view', pathMatch: 'full' },
      {path: 'view', component: ExploreDataComponent},
      {path: 'favorite/data', component: FavoriteDataComponent},
      {path: 'favorite/creator', component: FavoriteCreatorComponent}
    ]),
  ],
  declarations: [
    MetadataSvgComponent,
    CheckBoxFilterComponent,
    ExploreBannerComponent,
    ExploreCardComponent,
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
    ExploreDataListComponent,
    ExploreDataSearchComponent,
    ExploreDataLnbComponent,
    MetadataTypeBoxTagComponent
  ],
  providers: [
    MetadataService,
    CatalogService,
    DatasourceService,
    TimezoneService,
    CodeTableService,
    ExploreDataModelService,
    ConstantService
  ],
})
export class ExploreDataModule {
  constructor(private broadCaster: EventBroadcaster) {
    this.broadCaster.broadcast('ENTER_LAYOUT_MODULE');
  }
}
