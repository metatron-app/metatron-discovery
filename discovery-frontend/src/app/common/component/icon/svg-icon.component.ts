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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit} from "@angular/core";
import {AbstractComponent} from "../abstract.component";

@Component({
  selector: 'svg-icon-component',
  templateUrl: 'svg-icon.component.html',
})
export class SvgIconComponent extends AbstractComponent implements OnInit, OnDestroy {

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
  public name: string;

  @Input()
  public isBlackAndWhite?: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public getCss() : string {
    if (this.name === 'HIVE') {
      return this.isBlackAndWhite ? 'icon-db-hive-b' : 'icon-db-hive';
    }

    if (this.name === 'MYSQL') {
      return this.isBlackAndWhite ? 'icon-db-mysql-b' : 'icon-db-mysql';
    }

    if (this.name === 'PRESTO') {
      return this.isBlackAndWhite ? 'icon-db-presto-b' : 'icon-db-presto';
    }

    if (this.name === 'TIBERO') {
      return this.isBlackAndWhite ? 'icon-db-tibero-b' : 'icon-db-tibero';
    }

    if (this.name === 'POSTGRE') {
      return this.isBlackAndWhite ? 'icon-db-post-b' : 'icon-db-post';
    }

    if (this.name === 'ORACLE') {
      return this.isBlackAndWhite ? 'icon-db-oracle-b' : 'icon-db-oracle';
    }

    if (this.name === 'PHOENIX') {
      return this.isBlackAndWhite ? 'icon-db-phoenix-b' : 'icon-db-phoenix';
    }

    if (this.name === 'CSV') {
      return this.isBlackAndWhite? 'icon-file-csv-b': 'icon-file-csv';
    }

    if (this.name === 'JSON') {
      return this.isBlackAndWhite ? 'icon-file-json-b' : 'icon-file-json';
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
