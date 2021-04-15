import {Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {MetadataService} from '../service/metadata.service';
import {ActivatedRoute} from '@angular/router';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';
import {MetadataModelService} from '../service/metadata.model.service';
import {CommonUtil} from '@common/util/common.util';
import {Alert} from '@common/util/alert.util';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {Modal} from '@common/domain/modal';

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

  constructor(
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

    // initialize input
    this.editName = this.metadata.name;
    this.editDescription = this.metadata.description;

    // subscribe metadata change
    this.subscriptions.push(
      this.metadataModelService.metadataChanged.subscribe((metadata) => {
        this.metadata = metadata;
        this.editName = metadata.name;
        this.editDescription = metadata.description;
      })
    );

    // if editDescription is undefined
    if (this.editDescription === undefined) {
      this.editDescription = '';
    }
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

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
    this.router.navigate(['management/metadata/metadata']).then();
  }

  public get isEngineSource() {
    return this.metadata.sourceType === SourceType.ENGINE;
  }

  public onMoreButtonClicked() {
    this.more = !this.more;
  }

  public onClickEditName() {
    event.stopImmediatePropagation();
    this.editNameFlag = true;
  }

  public onClickEditDescription() {
    event.stopImmediatePropagation();
    this.editDescriptionFlag = true;
  }

  public onClickUpdateName() {
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
    this.metadataService.updateMetadata(this.metadata.id, {name: this.editName.trim()})
      .then(() => {
        Alert.success(this.translateService.instant('msg.metadata.metadata.detail.ui.alert.metadata.modified'));
        this.metadata.name = this.editName;
        this.metadataModelService.setMetadata(this.metadata);
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  public onClickUpdateDescription() {
    event.stopImmediatePropagation();
    // deactivate edit mode
    this.editDescriptionFlag = false;
    this.loadingShow();
    // Check text length
    if (CommonUtil.getByte(this.editDescription.trim()) > 450) {
      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      this.loadingHide();
      return;
    }

    // update the data in DB
    this.metadataService.updateMetadata(this.metadata.id, {description: this.editDescription.trim()})
      .then(() => {
        Alert.success(this.translateService.instant('msg.metadata.metadata.detail.ui.alert.metadata.modified'));
        this.metadata.description = this.editDescription;
        this.metadataModelService.setMetadata(this.metadata);
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }
}
