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

import {EventBroadcaster} from '../common/event/event.broadcaster';
import {NgModule} from '@angular/core';
import {MetaDataManagementComponent} from './meta-data-management.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {ColumnDictionaryComponent} from './column-dictionary/column-dictionary.component';
import {DetailColumnDictionaryComponent} from './column-dictionary/detail-column-dictionary/detail-column-dictionary.component';
import {CreateColumnDictionaryComponent} from './column-dictionary/create-column-dictionary/create-column-dictionary.component';
import {CodeTableComponent} from './code-table/code-table.component';
import {DetailCodeTableComponent} from './code-table/detail-code-table/detail-code-table.component';
import {CreateCodeTableComponent} from './code-table/create-code-table/create-code-table.component';
import {CodeTableService} from './code-table/service/code-table.service';
import {ColumnDictionaryService} from './column-dictionary/service/column-dictionary.service';
import {LinkedColumnDictionaryComponent} from './component/linked-column-dictionary/linked-column-dictionary.component';
import {LinkedMetadataComponent} from './component/linked-metadata-columns/linked-metadata.component';
import {ChooseCodeTableComponent} from './component/choose-code-table/choose-code-table.component';
import {MetadataComponent} from './metadata/metadata.component';
import {MetadataService} from './metadata/service/metadata.service';
import {MetadataDetailComponent} from './metadata/metadata-detail.component';
import {SelectCatalogComponent} from './metadata/component/select-catalog.component';
import {SelectDatatypeComponent} from './metadata/create-metadata/select-datatype.component';
import {CompleteCreateMetadataComponent} from './metadata/create-metadata/complete-create-metadata.component';
import {DatasourceService} from '../datasource/service/datasource.service';
import {DatasourceShareModule} from '../datasource/datasource-share.module';
import {DsSelectDatasourceComponent} from './metadata/create-metadata/ds-select-datasource.component';
import {MetadataModelService} from './metadata/service/metadata.model.service';
import {HiveSetConnectionComponent} from './metadata/create-metadata/hive-set-connection.component';
import {DataconnectionService} from '../dataconnection/service/dataconnection.service';
import {StagingSelectSchemaComponent} from './metadata/create-metadata/staging-select-schema.component';
import {CatalogService} from './catalog/service/catalog.service';
import {HiveSelectSchemaComponent} from './metadata/create-metadata/hive-select-schema.component';
import {ChooseColumnDictionaryComponent} from './component/choose-column-dictionary/choose-column-dictionary.component';
import {CatalogComponent} from './catalog/catalog.component';
import {MetadataManagementGuard} from '../common/gaurd/metadata-management.guard';
import {DetailModule} from './detail/detail.module';
import {DatasourceMetadataSharedModule} from '../shared/datasource-metadata/datasource-metadata-shared.module';

@NgModule({
  imports: [
    CommonModule,
    DetailModule,
    DatasourceShareModule,
    DatasourceMetadataSharedModule,
    RouterModule.forChild([
      {path: '', component: MetaDataManagementComponent, canActivate: [MetadataManagementGuard]},
      {path: ':tabId', component: MetaDataManagementComponent, canActivate: [MetadataManagementGuard]},
      {path: 'metadata/:metadataId', component: MetadataDetailComponent, canActivate: [MetadataManagementGuard]},
      {
        path: 'column-dictionary/:dictionaryId',
        component: DetailColumnDictionaryComponent,
        canActivate: [MetadataManagementGuard],
      },
      {path: 'code-table/:codeTableId', component: DetailCodeTableComponent, canActivate: [MetadataManagementGuard]},
    ]),
  ],
  declarations: [
    // 메타데이터 매니지먼트
    MetaDataManagementComponent,
    // 메타데이터
    MetadataComponent,
    MetadataDetailComponent,
    // 메타데이터 생성
    SelectDatatypeComponent,
    // 메타데이터 생성 - 데이터소스
    DsSelectDatasourceComponent,
    // 메타데이터 생성 - HIVE
    HiveSetConnectionComponent,
    HiveSelectSchemaComponent,
    // 메타데이터 생성 - StagingDB
    StagingSelectSchemaComponent,
    // 메타데이터 생성 - 공통
    CompleteCreateMetadataComponent,
    // 컬럼 사전
    ColumnDictionaryComponent,
    DetailColumnDictionaryComponent,
    CreateColumnDictionaryComponent,
    // 코드 테이블
    CodeTableComponent,
    DetailCodeTableComponent,
    CreateCodeTableComponent,
    // 연결된 컬럼 사전 목록
    LinkedColumnDictionaryComponent,
    // 연결된 메타데이터 목록
    LinkedMetadataComponent,
    // 코드 테이블 선택 컴포넌트
    ChooseCodeTableComponent,
    // 컬럼 사전 선택 텀포넌트
    ChooseColumnDictionaryComponent,

    SelectCatalogComponent,
    CatalogComponent,
  ],
  providers: [
    // 코드 테이블 서비스
    CodeTableService,
    // 컬럼 사전 서비스
    ColumnDictionaryService,
    // 메타데이터 서비스
    MetadataService,
    // 데이터소스 서비스
    DatasourceService,
    // 데이터 커넥션 서비스
    DataconnectionService,
    // 매니지먼트 가드
    MetadataManagementGuard,
    MetadataModelService,
    CatalogService,
  ],
})
export class MetaDataManagementModule {
  constructor(private broadCaster: EventBroadcaster) {
    this.broadCaster.broadcast('ENTER_LAYOUT_MODULE');
  }
}
