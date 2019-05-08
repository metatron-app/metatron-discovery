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

  public svgArrIcons: any = [
    {name: 'HIVE', class: {a: 'icon-db-hive-b', b: 'icon-db-hive'}},
    {name: 'MYSQL', class: {a: 'icon-db-mysql-b', b: 'icon-db-mysql'}},
    {name: 'PRESTO', class: {a: 'icon-db-presto-b', b: 'icon-db-presto'}},
    {name: 'TIBERO', class: {a: 'icon-db-tibero-b', b: 'icon-db-tibero'}},
    {name: 'POSTGRESQL', class: {a: 'icon-db-post-b', b: 'icon-db-post'}},
    {name: 'ORACLE', class: {a: 'icon-db-oracle-b', b: 'icon-db-oracle'}},
    {name: 'PHOENIX', class: {a: 'icon-db-phoenix-b', b: 'icon-db-phoenix'}},
    {name: 'CSV', class: {a: 'icon-file-csv-b', b: 'icon-file-csv-b'}},
    {name: 'TXT', class: {a: 'icon-file-txt-b', b: 'icon-file-txt-b'}},
    {name: 'EXCEL', class: {a: 'icon-file-xls', b: 'icon-file-xls'}},
    {name: 'JSON', class: {a: 'icon-file-json-b', b: 'icon-file-json-b'}},
    {name: 'WRANGLED', class:{a:'icon-file-dataset', b: 'icon-file-dataset'}},
    {name: 'DRUID', class:{a:'icon-db-druid', b: 'icon-db-druid'}},
    {name: 'MSSQL', class:{a:'icon-db-mssql', b: 'icon-db-mssql-b'}},
    {name: 'icon-db-custom', class: {a: 'icon-db-custom', b: 'icon-db-custom'}},
    {name: 'icon-db-druid', class: {a: 'icon-db-druid', b: 'icon-db-druid'}},
    {name: 'icon-db-hive', class: {a: 'icon-db-hive', b: 'icon-db-hive'}},
    {name: 'icon-db-mysql', class: {a: 'icon-db-mysql', b: 'icon-db-mysql'}},
    {name: 'icon-db-oracle', class: {a: 'icon-db-oracle', b: 'icon-db-oracle'}},
    {name: 'icon-db-phoenix', class: {a: 'icon-db-phoenix', b: 'icon-db-phoenix'}},
    {name: 'icon-db-post', class: {a: 'icon-db-post', b: 'icon-db-post'}},
    {name: 'icon-db-presto', class: {a: 'icon-db-presto', b: 'icon-db-presto'}},
    {name: 'icon-db-rds', class: {a: 'icon-db-rds', b: 'icon-db-rds'}},
    {name: 'icon-db-tibero', class: {a: 'icon-db-tibero', b: 'icon-db-tibero'}},
    {name: 'icon-db', class: {a: 'icon-db', b: 'icon-db'}},
    {name: 'icon-db-hdfs-b', class: {a: 'icon-db-hdfs-b', b: 'icon-db-hdfs-b'}},
    {name: 'icon-db-post', class: {a: 'icon-db-post', b: 'icon-db-post'}},
    {name: 'icon-db-hive-b', class: {a: 'icon-db-hive-b', b: 'icon-db-hive-b'}},
    {name: 'icon-db-local-b', class: {a: 'icon-db-local-b', b: 'icon-db-local-b'}},
    {name: 'icon-db-oracle-b', class: {a: 'icon-db-oracle-b', b: 'icon-db-oracle-b'}},
    {name: 'icon-db-presto-b', class: {a: 'icon-db-presto-b', b: 'icon-db-presto-b'}},
    {name: 'icon-db-staging-b', class: {a: 'icon-db-staging-b', b: 'icon-db-staging-b'}},
    {name: 'icon-file-csv-b', class: {a: 'icon-file-csv-b', b: 'icon-file-csv-b'}},
    {name: 'icon-file-json-b', class: {a: 'icon-file-json-b', b: 'icon-file-json-b'}},
    {name: 'icon-file-txt-b', class: {a: 'icon-file-txt-b', b: 'icon-file-txt-b'}},
    {name: 'icon-file-xml-b', class: {a: 'icon-file-xml-b', b: 'icon-file-xml-b'}},
    {name: 'icon-file-xls', class: {a: 'icon-file-xls', b: 'icon-file-xls'}},
    {name: 'icon-file-xlsx', class: {a: 'icon-file-xlsx', b: 'icon-file-xlsx'}},
    {name: 'icon-file-b', class: {a: 'icon-file-b', b: 'icon-file-b'}},
    {name: 'icon-dataset-another-focus', class: {a: 'icon-dataset-another-focus', b: 'icon-dataset-another-focus'}},
    {name: 'icon-dataset-another', class: {a: 'icon-dataset-another', b: 'icon-dataset-another'}},
    {name: 'icon-dataset-wrangled-delete', class: {a: 'icon-dataset-wrangled-delete', b: 'icon-dataset-wrangled-delete'}},
    {name: 'icon-dataset-wrangled-fous', class: {a: 'icon-dataset-wrangled-fous', b: 'icon-dataset-wrangled-fous'}},
    {name: 'icon-dataset-wrangled-fous', class: {a: 'icon-dataset-wrangled-fous', b: 'icon-dataset-wrangled-fous'}},
    {name: 'icon-dataset-wangled', class: {a: 'icon-dataset-wangled', b: 'icon-dataset-wangled'}},
    {name: 'icon-dataset-wrangled-fous', class: {a: 'icon-dataset-wrangled-fous', b: 'icon-dataset-wrangled-fous'}},
    {name: 'icon-chart-custom-focus', class: {a: 'icon-chart-custom-focus', b: 'icon-chart-custom-focus'}},
    {name: 'icon-chart-custom', class: {a: 'icon-chart-custom', b: 'icon-chart-custom'}},
    {name: 'icon-chart-druid-focus', class: {a: 'icon-chart-druid-focus', b: 'icon-chart-druid-focus'}},
    {name: 'icon-chart-druid', class: {a: 'icon-chart-druid', b: 'icon-chart-druid'}},
    {name: 'icon-chart-hive-focus', class: {a: 'icon-chart-hive-focus', b: 'icon-chart-hive-focus'}},
    {name: 'icon-chart-hive', class: {a: 'icon-chart-hive', b: 'icon-chart-hive'}},
    {name: 'icon-chart-mysql-focus', class: {a: 'icon-chart-mysql-focus', b: 'icon-chart-mysql-focus'}},
    {name: 'icon-chart-mysql', class: {a: 'icon-chart-mysql', b: 'icon-chart-mysql'}},
    {name: 'icon-chart-oracle-focus', class: {a: 'icon-chart-oracle-focus', b: 'icon-chart-oracle-focus'}},
    {name: 'icon-dataset-wrangled-fous', class: {a: 'icon-dataset-wrangled-fous', b: 'icon-dataset-wrangled-fous'}},
    {name: 'icon-chart-oracle', class: {a: 'icon-chart-oracle', b: 'icon-chart-oracle'}},
    {name: 'icon-chart-phoenix-focus', class: {a: 'icon-chart-phoenix-focus', b: 'icon-chart-phoenix-focus'}},
    {name: 'icon-chart-phoenix', class: {a: 'icon-chart-phoenix', b: 'icon-chart-phoenix'}},
    {name: 'icon-chart-post-focus', class: {a: 'icon-chart-post-focus', b: 'icon-chart-post-focus'}},
    {name: 'icon-dataset-wrangled-fous', class: {a: 'icon-dataset-wrangled-fous', b: 'icon-dataset-wrangled-fous'}},
    {name: 'icon-chart-post', class: {a: 'icon-chart-post', b: 'icon-chart-post'}},
    {name: 'icon-chart-presto-focus', class: {a: 'icon-chart-presto-focus', b: 'icon-chart-presto-focus'}},
    {name: 'icon-chart-rds-focus', class: {a: 'icon-chart-rds-focus', b: 'icon-chart-rds-focus'}},
    {name: 'icon-chart-rds', class: {a: 'icon-chart-rds', b: 'icon-chart-rds'}},
    {name: 'icon-chart-tibero-focus', class: {a: 'icon-chart-tibero-focus', b: 'icon-chart-tibero-focus'}},
    {name: 'icon-chart-tibero', class: {a: 'icon-chart-tibero', b: 'icon-chart-tibero'}},
    {name: 'icon-chart-tibero-focus', class: {a: 'icon-chart-tibero-focus', b: 'icon-chart-tibero-focus'}},
    {name: 'icon-chart-db-focus', class: {a: 'icon-chart-db-focus', b: 'icon-chart-db-focus'}},
    {name: 'icon-chart-db', class: {a: 'icon-chart-db', b: 'icon-chart-db'}},
    {name: 'icon-chart-file type-csv-focus', class: {a: 'icon-chart-file type-csv-focus', b: 'icon-chart-file type-csv-focus'}},
    {name: 'icon-chart-file type-csv', class: {a: 'icon-chart-file type-csv', b: 'icon-chart-file type-csv'}},
    {name: 'icon-chart-file type-file-focus', class: {a: 'icon-chart-file type-file-focus', b: 'icon-chart-file type-file-focus'}},
    {name: 'icon-chart-file type-file', class: {a: 'icon-chart-file type-file', b: 'icon-chart-file type-file'}},
    {name: 'icon-chart-file type-json-focus', class: {a: 'icon-chart-file type-json-focus', b: 'icon-chart-file type-json-focus'}},
    {name: 'icon-chart-file type-json', class: {a: 'icon-chart-file type-json', b: 'icon-chart-file type-json'}},
    {name: 'icon-chart-file type-txt-focus', class: {a: 'icon-chart-file type-txt-focus', b: 'icon-chart-file type-txt-focus'}},
    {name: 'icon-chart-file type-txt', class: {a: 'icon-chart-file type-txt', b: 'icon-chart-file type-txt'}},
    {name: 'icon-chart-file type-xls-focus', class: {a: 'icon-chart-file type-xls-focus', b: 'icon-chart-file type-xls-focus'}},
    {name: 'icon-chart-file type-xls', class: {a: 'icon-chart-file type-xls', b: 'icon-chart-file type-xls'}},
    {name: 'icon-chart-file type-xlsx-focus', class: {a: 'icon-chart-file type-xlsx-focus', b: 'icon-chart-file type-xlsx-focus'}},
    {name: 'icon-chart-file type-xlsx', class: {a: 'icon-chart-file type-xlsx', b: 'icon-chart-file type-xlsx'}},
    {name: 'icon-chart-file type-xml-focus', class: {a: 'icon-chart-file type-xml-focus', b: 'icon-chart-file type-xml-focus'}},
    {name: 'icon-chart-file type-xml', class: {a: 'icon-chart-file type-xml', b: 'icon-chart-file type-xml'}},
  ];

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
    let className = '';
    for (let i = 0; i < this.svgArrIcons.length; i = i + 1) {
      if (this.name === this.svgArrIcons[i].name) {
        className = this.isBlackAndWhite ? this.svgArrIcons[i].class.a : this.svgArrIcons[i].class.b;
        break;
      }
    }
    return className;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
