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

import {NgModule} from '@angular/core';
import {CommonModule} from '@common/common.module';
import {JobDetailComponent} from './component/job-detail/job-detail.component';
import {LogEditorComponent} from '../component/log-editor/log-editor.component';
import {WorkbenchEditorModule} from '../../../workbench/workbench.editor.module';

@NgModule({
  imports: [
    CommonModule,
    WorkbenchEditorModule
  ],
  // view 클래스 정의
  declarations: [
    JobDetailComponent,
    LogEditorComponent
  ],
  // 외부로 공개 선언
  exports: [JobDetailComponent],
  providers: []
})
export class JobLogModule {
}
