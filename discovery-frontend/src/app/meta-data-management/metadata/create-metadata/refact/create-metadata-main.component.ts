import {AbstractComponent} from "../../../../common/component/abstract.component";
import {Component, ElementRef, Injector} from "@angular/core";
import {MetadataConstant} from "../../../metadata.constant";
import {StorageService} from "../../../../data-storage/service/storage.service";
import {MetadataEntity} from "../../metadata.entity";
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
    // TODO
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
