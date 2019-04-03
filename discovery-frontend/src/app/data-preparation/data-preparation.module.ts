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

import { NgModule } from '@angular/core';
import { DataPreparationComponent } from './data-preparation.component';
import { DataPreparationGuard } from './data-preparation.guard';
import { RouterModule, Routes } from '@angular/router';
import { DataPreparationService } from './service/data-preparation.service';
import { CommonModule } from '../common/common.module';
import { DataflowComponent } from './dataflow/dataflow.component';
import { DatasetComponent } from './dataset/dataset.component';
import { DataSnapshotComponent } from './data-snapshot/data-snapshot.component';
import { DataflowService } from './dataflow/service/dataflow.service';
import { CreateDatasetComponent } from './dataset/create-dataset/create-dataset.component';
import { CreateDatasetDataTypeComponent } from './dataset/create-dataset/create-dataset-datatype.component';
import { CreateDatasetSelectfileComponent } from './dataset/create-dataset/create-dataset-selectfile.component';
import { CreateDatasetSelectsheetComponent } from './dataset/create-dataset/create-dataset-selectsheet.component';
import { CreateDatasetSelecturlComponent } from './dataset/create-dataset/create-dataset-selecturl.component';
import { CreateDatasetStagingSelectdataComponent } from './dataset/create-dataset/create-dataset-staging-selectdata.component';
import { DatasetService } from './dataset/service/dataset.service';
import { FileModule } from '../common/file.module';
import { CreateDatasetDbSelectComponent } from './dataset/create-dataset/create-dataset-db-select.component';
import { CreateDatasetDbQueryComponent } from './dataset/create-dataset/create-dataset-db-query.component';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { WorkbenchEditorModule } from '../workbench/workbench.editor.module';
import { DataflowDetailComponent } from './dataflow/dataflow-detail/dataflow-detail.component';
import { RuleJoinPopupComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/rule-join-popup/rule-join-popup.component';
import { RuleUnionPopupComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/rule-union-popup/rule-union-popup.component';
import { UnionAddDatasetsComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/rule-union-popup/union-add-datasets/union-add-datasets.component';
import { DatasetDetailComponent } from './dataset/dataset-detail.component';
import { DatasetInfoPopupComponent } from './dataflow/dataflow-detail/component/dataset-info-popup/dataset-info-popup.component';
import { CreateDatasetNameComponent } from './dataset/create-dataset/create-dataset-name.component';
import { RuleListComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/rule-list.component';
import { RuleContextMenuComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/rule-context-menu.component';
import { ExtendInputFormulaComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/extend-input-formula.component';
import { ScrollLoadingGridComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule-grid/scroll-loading-grid.component';
import { EditDataflowRule2Component } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-dataflow-rule-2.component';
import { EditRuleGridComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule-grid/edit-rule-grid.component';
import { CreateDataflowNameDescComponent } from './dataflow/create-dataflow-name-desc.component';
import { DatasetSummaryComponent } from './component/dataset-summary.component';
import { EditRuleHeaderComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-header.component';
import { EditRuleKeepComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-keep.component';
import { EditRuleDeleteComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-delete.component';
import { EditRuleDropComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-drop.component';
import { CreateSnapshotPopup } from './component/create-snapshot-popup.component';
import { SnapshotLoadingComponent } from './component/snapshot-loading.component';
import { RuleConditionInputComponent } from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/rule-condition-input.component";
import { RuleSuggestInputComponent } from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/rule-suggest-input.component";
import { EditRuleFieldComboComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-field-combo.component';
import { EditRuleDeriveComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-derive.component';
import { EditRuleSetComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-set.component';
import { EditRuleRenameComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-rename.component';
import { EditRuleReplaceComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-replace.component';
import { EditRuleMergeComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-merge.component';
import { EditRuleSortComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-sort.component';
import { EditRuleMoveComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-move.component';
import { EditRuleNestComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-nest.component';
import { EditRuleUnpivotComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-unpivot.component';
import { EditRuleCountpatternComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-countpattern.component';
import { EditRuleExtractComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-extract.component';
import { EditRuleSplitComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-split.component';
import { EditRuleFlattenComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-flatten.component';
import { EditRuleSetformatComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-setformat.component';
import { EditRuleUnnestComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-unnest.component';
import { EditRuleAggregateComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-aggregate.component';
import { EditRulePivotComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-pivot.component';
import { EditRuleSettypeComponent } from './dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-settype.component';
import { PrepSelectBoxComponent } from './util/prep-select-box.component';
import { PrepSelectBoxCustomComponent } from './util/prep-select-box-custom.component';
import { DataflowModelService } from "./dataflow/service/dataflow.model.service";
import {EditRuleWindowComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/edit-rule/edit-rule-window.component";
import {LongUpdatePopupComponent} from "./component/long-update-popup.component";
import {RadioSelectDatasetComponent} from "./component/radio-select-dataset.component";
import {AddDatasetDataflowComponent} from "./dataset/add-dataset-dataflow.component";
import {MultipleRenamePopupComponent} from "./dataflow/dataflow-detail/component/edit-dataflow-rule/multiple-rename-popup.component";
import {DataSourceCreateModule} from "../data-storage/data-source-list/create-data-source/data-source-create.module";
import {DataconnectionService} from "../dataconnection/service/dataconnection.service";
import {DataflowDetail2Component} from "./dataflow/dataflow-detail/dataflow-detail2.component";
import {DataStorageShareModule} from "../data-storage/data-storage-share.module";


const dataPreparationRoutes: Routes = [
  { path: '', component: DatasetComponent },
  { path: 'dataflow', component: DataflowComponent },
  { path: 'dataflow/:id', component: DataflowDetail2Component, canDeactivate: [DataPreparationGuard] },
  { path: 'dataflow/:dfId/rule/:dsId', component: EditDataflowRule2Component, canDeactivate: [DataPreparationGuard] },
  { path: 'dataset', component: DatasetComponent },
  { path: 'dataset/new', component: DatasetComponent },
  { path: 'dataset/:id', component: DatasetDetailComponent },
  { path: 'datasnapshot', component: DataSnapshotComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FileModule,
    RouterModule.forChild(dataPreparationRoutes),
    SplitPaneModule,
    WorkbenchEditorModule,
    DataSourceCreateModule,
    DataStorageShareModule
  ],
  declarations: [
    DataPreparationComponent,
    DataflowComponent,
    DatasetComponent,
    CreateDatasetComponent,
    CreateDatasetDataTypeComponent,
    CreateDatasetSelectfileComponent,
    CreateDatasetSelectsheetComponent,
    CreateDatasetSelecturlComponent,
    CreateDatasetStagingSelectdataComponent,
    DataSnapshotComponent,
    CreateDatasetDbSelectComponent,
    CreateDatasetDbQueryComponent,
    DatasetDetailComponent,
    DataflowDetailComponent,
    RuleJoinPopupComponent,
    RuleUnionPopupComponent,
    UnionAddDatasetsComponent,
    DatasetInfoPopupComponent,
    CreateDatasetNameComponent,
    RuleListComponent,
    RuleContextMenuComponent,
    ExtendInputFormulaComponent,
    EditRuleGridComponent,
    ScrollLoadingGridComponent,
    EditDataflowRule2Component,
    EditRuleFieldComboComponent,
    EditRuleHeaderComponent,
    EditRuleKeepComponent,
    EditRuleDeleteComponent,
    EditRuleDropComponent,
    EditRuleDeriveComponent,
    EditRuleSetComponent,
    EditRuleRenameComponent,
    EditRuleReplaceComponent,
    EditRuleMergeComponent,
    EditRuleSortComponent,
    EditRuleMoveComponent,
    EditRuleNestComponent,
    EditRuleUnpivotComponent,
    EditRuleSplitComponent,
    EditRuleExtractComponent,
    EditRuleCountpatternComponent,
    EditRuleAggregateComponent,
    EditRuleFlattenComponent,
    EditRuleSetformatComponent,
    EditRuleUnnestComponent,
    EditRulePivotComponent,
    EditRuleSettypeComponent,
    EditRuleWindowComponent,
    CreateDataflowNameDescComponent,
    DatasetSummaryComponent,
    CreateSnapshotPopup,
    SnapshotLoadingComponent,
    RuleConditionInputComponent,
    RuleSuggestInputComponent,
    PrepSelectBoxComponent,
    PrepSelectBoxCustomComponent,
    RadioSelectDatasetComponent,
    LongUpdatePopupComponent,
    AddDatasetDataflowComponent,
    MultipleRenamePopupComponent,
    DataflowDetail2Component
  ],
  providers: [
    DataconnectionService,
    DataPreparationService,
    DataflowService,
    DatasetService,
    DataPreparationGuard,
    DataflowModelService,
    DataconnectionService
  ],
  exports: [
  ]
})
export class DataPreparationModule { }
