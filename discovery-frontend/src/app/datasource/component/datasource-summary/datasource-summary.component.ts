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
  Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output
} from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import {Datasource, FieldFormatType, FieldRole, Status} from '../../../domain/datasource/datasource';
import { DatasourceService } from '../../service/datasource.service';
import { MomentDatePipe } from '../../../common/pipe/moment.date.pipe';
import { MetadataService } from '../../../meta-data-management/metadata/service/metadata.service';
import { Metadata } from '../../../domain/meta-data-management/metadata';

@Component({
  selector: 'app-datasource-summary',
  templateUrl: './datasource-summary.component.html',
  providers: [MomentDatePipe]
})
export class DatasourceSummaryComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터 소스 아이디
  private datasourceId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('hasHeader')
  set setHasHeader(hasHeader: boolean) {
    this.hasHeader = hasHeader;
  }

  // 메타데이터이름 show/hide 여부
  @Input()
  public showMetadataName: boolean = true;

  // 변경 이벤트
  @Output('close')
  public closeEvent = new EventEmitter();

  public datasource: Datasource;
  public metadata: Metadata;

  public hasHeader: boolean = true;
  public isShowDataPreview: boolean = false;
  public isEnabled: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private metadataService: MetadataService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  @Input('datasource')
  public set setDatasource(datasourceId: string) {
    if (this.datasourceId !== datasourceId) {
      this.datasourceId = datasourceId;

      this.loadingShow();
      this.datasource = undefined;
      this.metadata = undefined;
      this.datasourceService.getDatasourceSummary(this.datasourceId)
        .then((datasource) => {
          this.datasource = datasource;
          this.isEnabled = Status.ENABLED === datasource.status;
          // field loop
          this.datasource.fields.forEach((field, index, object) => {
            //  if current time in fields, hide
            if (field.role === FieldRole.TIMESTAMP && field.format &&  field.format.type === FieldFormatType.TEMPORARY_TIME) {
              object.splice(index, 1);
            }
          });

          this.metadataService.getMetadataForDataSource(datasource.id)
            .then(result => {
              if (result && 0 < result.length) {
                this.metadata = result[0];
                this.datasource.uiMetaData = this.metadata;
              }
              this.loadingHide();
              this.changeDetect.detectChanges();
            })
            .catch(err => this.commonExceptionHandler(err));
        })
        .catch(err => this.commonExceptionHandler(err));
    }
  }

  public getIconClass(itemType: string): string {
    let result = '';
    switch (itemType.toUpperCase()) {
      case 'TIMESTAMP':
        result = 'ddp-icon-type-calen';
        break;
      case 'BOOLEAN':
        result = 'ddp-icon-type-tf';
        break;
      case 'TEXT':
      case 'DIMENSION':
      case 'STRING':
        result = 'ddp-icon-type-ab';
        break;
      case 'USER_DEFINED':
        result = 'ddp-icon-type-ab';
        break;
      case 'INT':
      case 'INTEGER':
      case 'LONG':
        result = 'ddp-icon-type-int';
        break;
      case 'DOUBLE':
        result = 'ddp-icon-type-float';
        break;
      case 'CALCULATED':
        result = 'ddp-icon-type-sharp';
        break;
      case 'LNG':
      case 'LATITUDE':
        result = 'ddp-icon-type-latitude';
        break;
      case 'LNT':
      case 'LONGITUDE':
        result = 'ddp-icon-type-longitude';
        break;
      case 'GEO_POINT':
        result = 'ddp-icon-type-point';
        break;
      case 'GEO_LINE':
        result = 'ddp-icon-type-line';
        break;
      case 'GEO_POLYGON':
        result = 'ddp-icon-type-polygon';
        break;
      default:
        console.error('정의되지 않은 아이콘 타입입니다.', itemType);
        break;
    }
    return result;
  }

  public closeBtn() {
    this.closeEvent.emit(this.datasource);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
