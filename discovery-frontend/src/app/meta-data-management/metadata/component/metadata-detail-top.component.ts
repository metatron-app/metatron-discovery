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

@Component(
  {
    selector: 'app-metadata-management-metadata-detail-top',
    templateUrl: './metadata-detail-top.component.html'
  }
)
export class MetadataDetailTopComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public more: boolean = false;
  public metadata: Metadata;
  public editDescriptionFlag: boolean = false;
  public editNameFlag: boolean = false;
  public editDescription: string;
  public editName: string;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Methods
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Go back
   */
  public goBack() {
    this._location.back();
  } // function - goBack

  public onMoreButtonClicked() {
    this.more = !this.more;
  }

  public onClickEditName() {
    event.stopImmediatePropagation();
    if (this.metadata.sourceType == SourceType.ENGINE){
      this.editNameFlag = true;
    }

  }

  public onClickEditDescription() {
    event.stopImmediatePropagation();
    if (this.metadata.sourceType == SourceType.ENGINE){
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
        Alert.success(this.translateService.instant('msg.storage.alert.dsource.update.success'));
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Constructor
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
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
