/*
 *
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

import {AbstractComponent} from "../../../common/component/abstract.component";
import {Component, ElementRef, EventEmitter, Injector, Output} from "@angular/core";
import {MetadataConstant} from "../../metadata.constant";
import {StorageService} from "../../../data-storage/service/storage.service";
import {MetadataEntity} from "../metadata.entity";
import * as _ from 'lodash';

@Component({
  selector: 'create-metadata-main',
  templateUrl: 'create-metadata-main.component.html'
})
export class CreateMetadataMainComponent extends AbstractComponent {

  step: MetadataConstant.CreateStep;

  // data bus
  createData: MetadataEntity.CreateData;

  // enum
  readonly CREATE_STEP = MetadataConstant.CreateStep;

  @Output() readonly createdComplete = new EventEmitter();

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Init
   * @param {MetadataEntity.CreateData} createData
   */
  init(createData?: MetadataEntity.CreateData) {
    this.step = MetadataConstant.CreateStep.TYPE;
    this.createData = _.isNil(createData) ? new MetadataEntity.CreateData() : createData;
  }

  /**
   * Change step
   * @param {MetadataConstant.CreateStep} step
   */
  changeStep(step:  MetadataConstant.CreateStep) {
    this.step = step;
  }

  cancelCreate() {
    // step initial
    this.step = undefined;
    // data initial
    this.createData = undefined;
  }

  createCompleted() {
    // cancel create
    this.cancelCreate();
    this.createdComplete.emit();
  }

  onSelectCreateType(step: MetadataConstant.CreateStep): void {
    if (step === MetadataConstant.CreateStep.DB_CONNECTION) {
      this.changeStep(step);
    } else if (step === MetadataConstant.CreateStep.STAGING_SELECT && this.isEnableStageDB()) {
      this.changeStep(step);
    }
  }


  isEnableStageDB(): boolean {
    return StorageService.isEnableStageDB;
  }
}
