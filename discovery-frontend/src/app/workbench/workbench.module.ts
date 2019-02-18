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

import { CommonModule } from '../common/common.module';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { WorkbenchShareModule } from './workbench-share.module';
import { WorkbenchComponent } from './workbench.component';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { WorkbenchService } from './service/workbench.service';
import { DataStorageModule } from '../data-storage/data-storage.module';
import { DatasourceService } from '../datasource/service/datasource.service';
import { WidgetService } from '../dashboard/service/widget.service';
import { PageShareModule } from '../page/page-share.module';
import { StompService } from '@stomp/ng2-stompjs';
import { DataconnectionService } from '../dataconnection/service/dataconnection.service';
import { WorkbenchEditorModule } from './workbench.editor.module';
import {AnalysisPredictionService} from "../page/component/analysis/service/analysis.prediction.service";
import { DetailWorkbenchSchemaBrowserComponent } from './component/detail-workbench/detail-workbench-schema-browser/detail-workbench-schema-browser.component';
import { CodemirrorComponent } from '../workbench/component/editor-workbench/codemirror.component';
import { MetadataService } from '../meta-data-management/metadata/service/metadata.service';
import { CanDeactivateGuard } from '../common/gaurd/can.deactivate.guard';
import {SaveAsHiveTableComponent} from "./component/save-as-hive-table/save-as-hive-table.component";

// 라우트
const workbenchRoutes: Routes = [
  { path: ':id', component: WorkbenchComponent, canDeactivate:[CanDeactivateGuard] },
  { path: ':id/schemabrowser', component: DetailWorkbenchSchemaBrowserComponent}
];

@NgModule({
  // 모듈
  imports: [
    CommonModule,
    WorkbenchShareModule,
    WorkbenchEditorModule,
    SplitPaneModule,
    DataStorageModule,
    PageShareModule,
    RouterModule.forChild(workbenchRoutes),
  ],
  // 컴포넌트
  declarations: [
    WorkbenchComponent,
    CodemirrorComponent,
    SaveAsHiveTableComponent
  ],
  // 서비스
  providers: [
    WorkbenchService,
    DatasourceService,
    WidgetService,
    StompService,
    DataconnectionService,
    AnalysisPredictionService,
    MetadataService
  ]
})
export class WorkbenchModule {
}
