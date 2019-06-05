import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {MetadataConstant} from "../../../metadata.constant";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {MetadataEntity} from "../../metadata.entity";
import {MetadataService} from "../../service/metadata.service";
import {StringUtil} from "../../../../common/util/string.util";
import {Metadata} from "../../../../domain/meta-data-management/metadata";
import * as _ from 'lodash';

@Component({
  selector: 'create-metadata-db-complete',
  templateUrl: 'create-metadata-db-complete.component.html'
})
export class CreateMetadataDbCompleteComponent extends AbstractComponent {

  @Input() readonly createData: MetadataEntity.CreateData;

  @Output() readonly changeStep: EventEmitter<MetadataConstant.CreateStep> = new EventEmitter();
  @Output() readonly cancel = new EventEmitter();
  @Output() readonly complete = new EventEmitter();

  metadataList: {originName: string, name: string, description: string, isErrorName: boolean, errorMessage: string}[];


  // constructor
  constructor(private metadataService: MetadataService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.createData.isNotEmptyCompleteInfo()) {
      // make metadata list
      this.createData.schemaInfo.checkedTableList.reduce((result, table) => {

        return result;
      }, []);
    } else {

    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onComplete(): void {
    if (this._checkNameInMetadataList()) {
      this._checkDuplicatedMetadataNameFromServerAndCreateMetadata();
    }
  }

  isErrorMetadataName(metadata): boolean {
    return metadata.isErrorName === true;
  }

  isEnableURL(): boolean {
    return !_.isNil(this.getUrl());
  }

  isRequiredSid(): boolean {
    return !_.isNil(this.getSid());
  }

  isRequireDatabase(): boolean {
    return !_.isNil(this.getDatabase());
  }

  isRequireCatalog(): boolean {
    return !_.isNil(this.getCatalog());
  }

  getDataType() {
    return this._getConnection().implementor;
  }

  getHost() {
    return this._getConnection().hostname
  }

  getPort() {
    return this._getConnection().port;
  }

  getUrl() {
    return this._getConnection().url;
  }

  getDatabase() {
    return this._getConnection().database;
  }

  getSid() {
    return this._getConnection().sid;
  }

  getCatalog() {
    return this._getConnection().catalog;
  }

  getSchema() {
    return this.createData.schemaInfo.selectedSchema;
  }

  changeToPrevStep(): void {
    this.changeStep.emit(MetadataConstant.CreateStep.DB_SELECT);
  }

  private _getConnection() {
    return this.createData.connectionInfo.connection;
  }

  private _getMetadataNameList(): string[] {
    return this.metadataList.map(metadata => metadata.name);
  }

  private _checkMetadataList() {
    // if empty metadata name
    this.metadataList.reduce((result, metadata) => {

      return result;
    }, {})
  }

  private _checkNameInMetadataList(): boolean {
    let result: boolean = true;
    this.metadataList.forEach(metadata => {
      if (StringUtil.isEmpty(metadata.name)) {
        result = false;
        metadata.isErrorName = true;
        metadata.errorMessage = '빈 메타데이터 명은 허용되지 않습니다';
      } else if (metadata.name.length > 150) {
        result = false;
        metadata.isErrorName = true;
        metadata.errorMessage = '1자 ~ 150자 이내의 메타데이터 명으로 작성해주세요';
      } else if (Metadata.isDisableMetadataNameCharacter(metadata.name)) {
        result = false;
        metadata.isErrorName = true;
        metadata.errorMessage = '메타데이터명에 사용할 수 없는 문자열이 있습니다';
      } else if (this.metadataList.filter(data => metadata.name.trim().toUpperCase() === data.name.trim().toUpperCase()).length > 1) {
        result = false;
        metadata.isErrorName = true;
        metadata.errorMessage = '동일한 메타데이터명은 사용할 수 없습니다';
      }
    });
    return result;
  }

  private _createMetadata() {
    this.loadingShow();
  }

  private _checkDuplicatedMetadataNameFromServerAndCreateMetadata() {
    this.loadingShow();
    this.metadataService.getDuplicatedMetadataNameList(this._getMetadataNameList())
      .then(result => {
        if (_.isNil(result) || result.length === 0) {
          this._createMetadata();
        } else {
          // set name error
          result.forEach(name => {
            const metadata = this.metadataList.find(metadata => metadata.name === name);
            metadata.isErrorName = true;
            metadata.errorMessage = '동일한 메타데이터명은 사용할 수 없습니다';
          });
          // loading hide
          this.loadingHide();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }
}
