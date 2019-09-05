import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataService} from "../service/metadata.service";
import {ActivatedRoute} from "@angular/router";
import {MetadataModelService} from "../service/metadata.model.service";
import {Metadata, SourceType} from "../../../domain/meta-data-management/metadata";
import {Alert} from "../../../common/util/alert.util";
import {CommonUtil} from "../../../common/util/common.util";
import {Datasource} from "../../../domain/datasource/datasource";
import {CatalogService} from "../../catalog/service/catalog.service";
import {isUndefined} from "util";

@Component(
  {
    selector: 'app-metadata-management-metadata-detail-information',
    templateUrl: './metadata-detail-information.component.html',
  }
)
export class MetadataDetailInformationComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('descInput')
  private _descInput: ElementRef;

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

  public isAddTag: boolean = false;
  public tagFlag: boolean = false;
  public tagValue: string = '';
  public tagsList: any = [];

  public catalogSearchText: string = '';
  public searchCatalogList: any[] = [];
  public isSearchCatalog: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Constructor
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    protected element: ElementRef,
    protected metadataService: MetadataService,
    protected activatedRoute: ActivatedRoute,
    private metadataModelService: MetadataModelService,
    protected catalogService: CatalogService,
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
    this._getMetadataTags();

    // initialize textarea text
    this.descriptionChangeText = this.metadata.description;

    /**
     *  if sourceType is datasource(ENGINE), set css class according to status
     *  if sourceType is not datasource(ENGINE) hide <tr></tr>
     */
    if (this.metadata.sourceType === this.sourceType.ENGINE) {
      this.statusClass = 'ddp-data-status ' + 'ddp-' + ((this.metadata.source.source) as Datasource).status.toString().toLowerCase();
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
      $(this._descInput.nativeElement).trigger('focus');
      this.loadingHide();
      return;
    }

    // deactivate edit mode
    this.isEditDescription = !this.isEditDescription;

    // update the data in DB
    this.metadataService.updateMetadata(this.metadata.id, {description: this.descriptionChangeText.trim()})
      .then(() => {
        Alert.success(this.translateService.instant('msg.metadata.metadata.detail.ui.alert.metadata.modified'));
        this.metadata.description = this.descriptionChangeText;
        this.metadataModelService.setMetadata(this.metadata);
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  public onClickGoToDatasourceButton() {
    this.router.navigate(['/management/storage/datasource/', this.metadata.source.source.id]).then();
  }

  private _getMetadataTags() {
    this.metadataService.getMetadataTags().then((result) => {
      if (result) {
        this.tagsList = result;
      } else {
        this.tagsList = [];
      }
      this.safelyDetectChanges();
    }).catch((error) => {
      console.error(error);
    });
  }

  get filteredTagsList() {
    let list = [];
    if (this.tagsList.length > 0 && '' !== this.tagValue) {
      this.tagsList.forEach((tag) => {
        if (tag.name.indexOf(this.tagValue) !== -1) {
          list.push(tag.name);
        }
      });
    }
    return list;
  }

  public deleteTag(tag) {
    this.metadataService.deleteTagFromMetadata(this.metadataModelService.getMetadata().id, [tag.name]).then(() => {
      this._getMetadataDetail();
    }).catch((err) => {
      console.info('error -> ', err);
    });
  }

  public addTag() {

    let idx = this.metadataModelService.getMetadata().tags.map((item) => {
      return item.name;
    }).indexOf(this.tagValue);

    if (this.tagValue === '' || idx !== -1) {
      return;
    }
    if (!this.tagFlag) {
      this.tagFlag = true;
      this.metadataService.addTagToMetadata(this.metadataModelService.getMetadata().id, [this.tagValue]).then(() => {
        this.tagValue = '';
        this.isAddTag = false;
        this._getMetadataDetail();
        this._getMetadataTags();
        this.tagFlag = false;
      }).catch((err) => {
        console.info('error -> ', err);
        this.tagFlag = false;
      });
    }
  }

  public setTagValue(tag) {
    this.tagValue = tag;
    this.addTag();
  }

  public tagClickOutsideEvent() {
    this.tagValue = '';
  }

  public showSearchCatalog(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.catalogSearchText = '';
    this.isSearchCatalog = true;
  }

  public selectCatalog(item) {
    this.loadingShow();
    if ((this.metadata.catalogs as [any]).some((catalog) => {
      return catalog.name === item.name;
    })) {
      Alert.error(this.translateService.instant('msg.metadata.metadata.detail.ui.alert.catalog.already.included'));
      this.loadingHide();
    } else {
      this.metadataService.linkMetadataWithCatalog(this.metadata.id, item.id).then(() => {
        this.isSearchCatalog = false;
        this.catalogSearchText = '';
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this._getMetadataDetail();
      }).catch((error) => {
        Alert.error(error);
      });
    }
  }
  public deleteCatalogFromMetadata(catalogId) {
    this.metadataService.deleteCatalogLinkFromMetadata(this.metadata.id, catalogId).then(() => {
      this._getMetadataDetail();
    }).catch((error) => {
      Alert.error(error);
    });
  }

  public changeInputCatalog(inputVal) {
    if (this.catalogSearchText !== inputVal) {
      this.catalogSearchText = inputVal;
      this.safelyDetectChanges();

      // fetch data from api
      this.catalogService.getCatalogs(this._getCatalogParams()).then((result) => {
        // if any catalog is included
        if ((this.metadata.catalogs as [any]).length > 0) {
          let contained = true;
          // check if catalog is already in list
          result = (result as [any]).filter(catalogFromAPi => {
            contained = true;
            (this.metadata.catalogs as [any]).forEach(catalog => {
              if (catalog.name === catalogFromAPi.name) {
                contained = false;
              }
            });
            return contained;
          });
        }
        this.searchCatalogList = result;
      });
    }
  }

  private _getCatalogParams(): Object {
    const params = {size: 1000000, page: 0};
    if (!isUndefined(this.catalogSearchText) && this.catalogSearchText.trim() !== '') {
      params['nameContains'] = this.catalogSearchText.trim();
    }
    return params;
  }

  private _getMetadataDetail() {
    this.loadingShow();
    this.metadataService.getDetailMetaData(this.metadata.id).then((result) => {
      if (result) {
        this.metadata = result;
        this.metadataModelService.setMetadata(result);
      }
      this.loadingHide();
    }).catch(() => {
      this.loadingHide();
    });
  }

}
