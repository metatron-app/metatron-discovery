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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import { AbstractComponent } from '@common/component/abstract.component';
import { PrDatasetHive, PrDatasetJdbc, PrDatasetFile } from '@domain/data-preparation/pr-dataset';

@Component({
  selector: 'app-create-dataset',
  templateUrl: './create-dataset.component.html',
})
export class CreateDatasetComponent extends AbstractComponent implements  OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public step: string;

  public datasetFile: PrDatasetFile;
  public datasetFiles: any;
  public datasetHive: PrDatasetHive;
  public datasetJdbc: PrDatasetJdbc;

  public type: string; // File or staging db

  @Input()
  public isFromDatasetList: boolean = true; // 데이터셋 리스트 화면에서 진입했는지 여부
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);

    this.datasetFile = new PrDatasetFile();
    this.datasetFiles = [];
    this.datasetHive = new PrDatasetHive();
    this.datasetJdbc = new PrDatasetJdbc();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 팝업끼리 관리하는 모델들 초기화
  public init() {
    this.datasetFile = new PrDatasetFile();
    this.datasetFiles = [];
    this.datasetHive = new PrDatasetHive();
    this.datasetJdbc = new PrDatasetJdbc();
  }

  // set type for creating dataset
  public setCreateType(type) {
    this.type = type;
  }

}
