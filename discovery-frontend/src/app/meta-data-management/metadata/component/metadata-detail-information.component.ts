import {Component, ElementRef, Injector, Input, OnDestroy, OnInit} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataService} from "../service/metadata.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MetadataModelService} from "../service/metadata.model.service";
import {Metadata, SourceType} from "../../../domain/meta-data-management/metadata";
import {DatasourceService} from "../../../datasource/service/datasource.service";
import {Alert} from "../../../common/util/alert.util";
import {CommonUtil} from "../../../common/util/common.util";
import {Datasource} from "../../../domain/datasource/datasource";

@Component(
  {
    selector: 'app-metadata-management-metadata-detail-information',
    templateUrl: './metadata-detail-information.component.html'
  }
)
export class MetadataDetailInformationComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isEditDescription: boolean = false;
  public descriptionChangeText: string;

  public metadata: Metadata;
  public sourceType = SourceType;
  public statusClass = '';
  public dataType;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Constructor
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    protected element: ElementRef,
    protected metadataService: MetadataService,
    protected activatedRoute: ActivatedRoute,
    private metadataModelService: MetadataModelService,
    private datasourceService: DatasourceService,
    protected injector: Injector,) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
    // get chosen metadata from metadataModelService
    this.metadata = this.metadataModelService.getMetadata();

    // initialize textarea text
    this.descriptionChangeText = this.metadata.description;

   /**
    *  if sourceType is datasource(ENGINE), set css class according to status
    *  if sourceType is not datasource(ENGINE) hide <tr></tr>
    */
    if (this.metadata.sourceType === this.sourceType.ENGINE) {
      this.statusClass = 'ddp-data-status ' +  'ddp-' + ((this.metadata.source.source) as Datasource).status.toString().toLowerCase();
    }
    
    switch (this.metadata.sourceType) {
      case SourceType.STAGEDB:
        this.dataType = 'Staging DB';
        break;
      case SourceType.ENGINE:
        this.dataType = 'Datasource';
        break;
      case SourceType.JDBC:
        if (this.metadata.source.source.implementor == "MYSQL") {
          this.dataType = 'Database(' + 'MySQL' + ')';
        } else if (this.metadata.source.source.implementor == "HIVE") {
          this.dataType = 'Database(' + 'Hive' + ')';
        } else {
          this.dataType = 'Database';
        }
        break;
      default:
        this.dataType = 'unclassifed';
        break;
    }
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public toggleEditDescriptionFlag(): void {
    this.isEditDescription = !this.isEditDescription;
  }

  public onUpdateSourceDescriptionClicked(): void {
    this.loadingShow();
    // Check text length
    if (CommonUtil.getByte(this.descriptionChangeText.trim()) > 450) {
      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      return;
    }

    // deactivate edit mode
    this.isEditDescription = !this.isEditDescription;

    // update the data in DB
    this.datasourceService.updateDatasource(this.metadata.source.source.id, {description: this.descriptionChangeText.trim()})
      .then(() => {
        Alert.success(this.translateService.instant('msg.storage.alert.dsource.update.success'));
        this.metadata.description = this.descriptionChangeText;
        this.metadataModelService.setMetadata(this.metadata);
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  public onClickGoToDatasourceButton() {
    this.router.navigate(['/management/storage/datasource/', this.metadata.source.source.id]).then();
  }
}
