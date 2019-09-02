import {Component, ElementRef, Injector, OnDestroy, OnInit} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataService} from "../service/metadata.service";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {Metadata, SourceType} from "../../../domain/meta-data-management/metadata";
import {MetadataModelService} from "../service/metadata.model.service";
import {CommonUtil} from "../../../common/util/common.util";
import {Alert} from "../../../common/util/alert.util";
import {DatasourceService} from "../../../datasource/service/datasource.service";
import {Modal} from "../../../common/domain/modal";

@Component(
  {
    selector: 'app-metadata-management-metadata-detail-top',
    templateUrl: './metadata-detail-top.component.html'
  }
)
export class MetadataDetailTopComponent extends AbstractComponent implements OnInit, OnDestroy {

  public more: boolean = false;
  public metadata: Metadata;
  public editDescriptionFlag: boolean = false;
  public editNameFlag: boolean = false;
  public editDescription: string;
  public editName: string;

  public deleteMetadata() {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.comm.ui.del.description');
    modal.btnName = this.translateService.instant('msg.comm.btn.del');
    modal.afterConfirm = () => {
      this.loadingShow();
      this.metadataService.deleteMetaData(this.metadata.id)
        .then(() => {
          Alert.success(this.translateService.instant('msg.comm.alert.delete.success'));
          this.loadingHide();
          this.goBack();
        })
        .catch((error) => this.commonExceptionHandler(error));
    };
    CommonUtil.confirm(modal);
  }

  public goBack() {
    this._location.back();
  }

  public get isEngineSource() {
    return this.metadata.sourceType == SourceType.ENGINE;
  }

  public onMoreButtonClicked() {
    this.more = !this.more;
  }

  public onClickEditName() {
    event.stopImmediatePropagation();
    if (this.isEngineSource) {
      this.editNameFlag = true;
    }
  }

  public onClickEditDescription() {
    event.stopImmediatePropagation();
    if (this.isEngineSource) {
      this.editDescriptionFlag = true;
    }

  }

  public onClickUpdateEditingName() {
    event.stopImmediatePropagation();
    this.loadingShow();
    // Check text length
    if (CommonUtil.getByte(this.editName.trim()) > 450) {
      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      return;
    }

    // deactivate edit mode
    this.editNameFlag = false;

    // update the data in DB
    this.datasourceService.updateDatasource(this.metadata.source.source.id, {name: this.editName.trim()})
      .then(() => {
        Alert.success(this.translateService.instant('msg.metadata.metadata.detail.ui.alert.metadata.modified'));
        this.metadata.name = this.editName;
        this.metadataModelService.setMetadata(this.metadata);
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  public onClickUpdateEditingDescription() {
    event.stopImmediatePropagation();
    event.stopImmediatePropagation();
    this.loadingShow();
    // Check text length
    if (CommonUtil.getByte(this.editDescription.trim()) > 450) {
      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      return;
    }

    // deactivate edit mode
    this.editDescriptionFlag = false;

    // update the data in DB
    this.datasourceService.updateDatasource(this.metadata.source.source.id, {description: this.editDescription.trim()})
      .then(() => {
        Alert.success(this.translateService.instant('msg.storage.alert.dsource.update.success'));
        this.metadata.description = this.editDescription;
        this.metadataModelService.setMetadata(this.metadata);
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  constructor(
    private _location: Location,
    protected element: ElementRef,
    protected metadataService: MetadataService,
    protected metadataModelService: MetadataModelService,
    protected activatedRoute: ActivatedRoute,
    protected datasourceService: DatasourceService,
    protected injector: Injector,) {
    super(element, injector);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.metadata = this.metadataModelService.getMetadata();
    this.editName = this.metadata.name;
    this.editDescription = this.metadata.description;
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }
}
