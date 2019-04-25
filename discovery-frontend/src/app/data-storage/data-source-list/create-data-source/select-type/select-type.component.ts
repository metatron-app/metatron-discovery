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

import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {AbstractPopupComponent} from '../../../../common/component/abstract-popup.component';
import {StorageService} from "../../../service/storage.service";
import {ConnectionType, DatasourceInfo, DataSourceType, SourceType} from "../../../../domain/datasource/datasource";

@Component({
  selector: 'select-type',
  templateUrl: './select-type.component.html'
})
export class SelectTypeComponent extends AbstractPopupComponent implements OnInit {

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  @Input('sourceData')
  private _sourceData: DatasourceInfo;

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }


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

  /**
   * 생성할 데이터 타입 선택
   * @param {string} selectType
   */
  public selectType(selectType: string) {
    switch (selectType) {
      case 'file':
        this._sourceData.type = SourceType.FILE;
        this.step = 'file-upload';
        break;
      case 'database':
        this._sourceData.type = SourceType.JDBC;
        this.step = 'db-data-connection';
        break;
      case 'staging':
        if (this.isEnableStageDB()) {
          this._sourceData.type = SourceType.HIVE;
          this.step = 'staging-db-select';
        }
        break;
      case 'druid':
        this._sourceData.type = SourceType.IMPORT;
        this.step = 'druid-select';
        break;
      case 'snapshot':
        this._sourceData.type = SourceType.SNAPSHOT;
        this.step = 'snapshot-select';
        break;
    }
    this._sourceData.connType = ConnectionType.ENGINE;
    this._sourceData.dsType = DataSourceType.MASTER;
    this.stepChange.emit(this.step);
  }

  /**
   * Check enable stageDB
   * @return {boolean}
   */
  public isEnableStageDB(): boolean {
    return StorageService.isEnableStageDB;
  }
}
