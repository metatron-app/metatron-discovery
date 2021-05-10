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

import {Component, ElementRef, Injector, Input} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';

@Component({
  selector: 'component-metadata-type-box-tag',
  templateUrl: 'metadata-type-box-tag.component.html'
})
export class MetadataTypeBoxTagComponent extends AbstractComponent {

  @Input() readonly metadata: Metadata;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  getMetadataTypeIcon(): string {
    switch (this.metadata.sourceType) {
      case SourceType.ENGINE:
        return 'ddp-datasource';
      case SourceType.JDBC:
        return 'ddp-hive';
      case SourceType.STAGEDB:
        return 'ddp-stagingdb';
    }
  }

  getMetadataType(): string {
    switch (this.metadata.sourceType) {
      case SourceType.ENGINE:
        return this.translateService.instant('msg.comm.th.ds');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.STAGEDB:
        return this.translateService.instant('msg.storage.li.hive');
    }
  }
}
