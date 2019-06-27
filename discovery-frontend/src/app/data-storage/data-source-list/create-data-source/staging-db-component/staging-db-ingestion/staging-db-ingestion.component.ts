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
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '../../../../../common/component/abstract-popup.component';
import {DatasourceInfo} from '../../../../../domain/datasource/datasource';
import {IngestionSettingComponent} from '../../../component/ingestion-setting.component';
import {DataStorageConstant} from "../../../../constant/data-storage-constant";

/**
 * Creating datasource with StagingDB - ingestion step
 */
@Component({
  selector: 'staging-db-ingestion',
  templateUrl: './staging-db-ingestion.component.html'
})
export class StagingDbIngestionComponent extends AbstractPopupComponent implements OnInit, OnDestroy, OnChanges {

  // datasource data
  @Input('sourceData')
  private _sourceData: DatasourceInfo;

  @ViewChild(IngestionSettingComponent)
  private _ingestionSettingComponent: IngestionSettingComponent;

  @Input('step')
  private _step: string;

  @Output('stepChange')
  private _stepChange: EventEmitter<string> = new EventEmitter();


  // Constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * scroll event
   */
  public onWindowScroll() {
    if (this._ingestionSettingComponent.isShowPartitionValidResult) {
      this._ingestionSettingComponent.isShowPartitionValidResult = false;
    }
  }


  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * ngOnChanges
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // if changed source Data
    if (changes._sourceData) {
      this._ingestionSettingComponent.init(
        this._sourceData,
        'STAGING',
        this._sourceData.schemaData.selectedTimestampType === DataStorageConstant.Datasource.TimestampType.CURRENT ? null :  this._sourceData.schemaData.selectedTimestampField,
        this._sourceData.schemaData.isChangedTimestampField
      );
      // remove changed flag
      delete this._sourceData.schemaData.isChangedTimestampField;
    }
  }

  /**
   * Changed page
   * @param {string} step
   */
  public onChangedPage(step: string): void {
    this._step = step === 'NEXT' ? 'staging-db-complete' : 'staging-db-configure-schema';
    this._stepChange.emit(this._step);
  }

  /**
   * Step change click event
   * @param {string} route
   */
  public onClickPageChange(route: string): void {
    route === 'PREV' ? this._ingestionSettingComponent.onClickPrev() : this._ingestionSettingComponent.onClickNext();
  }
}
