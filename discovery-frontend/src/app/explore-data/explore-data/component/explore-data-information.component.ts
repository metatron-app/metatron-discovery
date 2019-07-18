import {AbstractComponent} from "../../../common/component/abstract.component";
import {Component, ElementRef, Injector, Input} from "@angular/core";
import {MetadataSource, MetadataSourceType} from "../../../domain/meta-data-management/metadata-source";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {StorageService} from "../../../data-storage/service/storage.service";
import {Dataconnection} from "../../../domain/dataconnection/dataconnection";
import {Datasource} from "../../../domain/datasource/datasource";
import * as _ from 'lodash';

@Component({
  selector: 'component-explore-data-information',
  templateUrl: 'explore-data-information.component.html'
})
export class ExploreDataInformationComponent extends AbstractComponent {


  @Input() readonly source: MetadataSource;
  @Input() readonly sourceType: MetadataSourceType;

  private readonly _authenticationTypeList = this.constant.getAuthenticationTypeFilters();
  private readonly _connectionTypeList = StorageService.connectionTypeList;

  isShowInformation: boolean;

  constructor(private constant: ConstantService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  isDatasourceType(): boolean {
    return this.sourceType === MetadataSourceType.ENGINE;
  }

  isDatabaseType(): boolean {
    return this.sourceType === MetadataSourceType.JDBC;
  }

  isStagingDbType(): boolean {
    return this.sourceType === MetadataSourceType.STAGEDB;
  }

  isNotEmptyIngestion(): boolean {
    return !_.isNil((this.source.source as Datasource).ingestion);
  }

  getDataRangeLabel(): string {
    // data range 가 있다면
    if ((this.source.source as Datasource).ingestion.intervals) {
      return (this.source.source as Datasource).ingestion.intervals[0].split('/').join(' ~ ').replace(/T/g, ' ');
    }
    return this.translateService.instant('msg.storage.ui.set.false');
  }

  getMetadataType(): string {
    if (this.isDatasourceType()) {
      return this.translateService.instant('msg.comm.th.ds') + ` (${this.getConvertedSourceTypeLabel()})`;
    } else if (this.isDatabaseType()) {
      return this.translateService.instant('msg.storage.li.db') + ` (${this.getConvertedConnectionTypeLabel()})`;
    } else if (this.isStagingDbType()) {
      return this.translateService.instant('msg.storage.li.hive');
    }
  }

  getConvertedSourceTypeLabel(): string {
    return (this.source.source as Datasource).srcType.toString();
  }

  getConvertedConnectionTypeLabel(): string {
    return this._connectionTypeList.find(type => type.implementor === (this.source.source as Dataconnection).implementor).name;
  }

  getConvertedAuthenticationTypeLabel(): string {
    return this._authenticationTypeList.find(type => type.value === (this.source.source as Dataconnection).authenticationType).label;
  }

  onChangeShowInformation(): void {
    this.isShowInformation = !this.isShowInformation;
  }

  closeInformation(): void {
    if (this.isShowInformation === true) {
      this.isShowInformation = undefined;
    }
  }
}
