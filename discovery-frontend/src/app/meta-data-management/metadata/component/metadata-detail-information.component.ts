import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {MetadataService} from '../service/metadata.service';
import {ActivatedRoute} from '@angular/router';
import {MetadataModelService} from '../service/metadata.model.service';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';
import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';
import {Datasource} from '@domain/datasource/datasource';
import {CatalogService} from '../../catalog/service/catalog.service';
import {isUndefined} from 'util';
import {StringUtil} from '@common/util/string.util';
import {Modal} from '@common/domain/modal';

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
  public descriptionChangeText: string = '';
  public isShowMetadataGuide: boolean = true;

  public metadata: Metadata;
  public sourceType = SourceType;
  public statusClass = '';
  public dataType;

  public showTags: boolean = false;
  public isAddTag: boolean = false;
  public tagFlag: boolean = false;
  public tagValue: string = '';
  public tagsList: any = [];
  public popularityTagList: { id: string, name: string, count: number }[] = [];

  public showCatalogs: boolean = false;
  public isSearchCatalog: boolean = false;
  public catalogSearchText: string = '';
  public searchCatalogList: { id: string, name: string, count: number, hierarchies: { id: string, name: string }[] }[] = [];
  public popularityCatalogList: { id: string, name: string, count: number, hierarchies: { id: string, name: string }[] }[] = [];

  get dataSource(): Datasource{
    return <Datasource>this.metadata.source.source;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Constructor
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    protected element: ElementRef,
    protected metadataService: MetadataService,
    protected activatedRoute: ActivatedRoute,
    private metadataModelService: MetadataModelService,
    protected catalogService: CatalogService,
    protected injector: Injector) {
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
    this._getPopularityCatalogs();

    // initialize textarea text
    this.descriptionChangeText = (this.metadata.description) ? this.metadata.description : '';

    this.subscriptions.push(
      this.metadataModelService.metadataChanged.subscribe((metadata) => {
        this.metadata = metadata;
        this.descriptionChangeText = metadata.description;
      })
    );

    if (this.descriptionChangeText === undefined) {
      this.descriptionChangeText = '';
    }
    /**
     *  if sourceType is datasource(ENGINE), set css class according to status
     *  if sourceType is not datasource(ENGINE) hide <tr></tr>
     */
    if (this.metadata.sourceType === this.sourceType.ENGINE && this.metadata.source.source !== undefined) {
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
        if (this.metadata.source.source !== undefined) {
          if (this.metadata.source.source.implementor === 'MYSQL') {
            this.dataType = 'Database(' + 'MySQL' + ')';
          } else if (this.metadata.source.source.implementor === 'HIVE') {
            this.dataType = 'Database(' + 'Hive' + ')';
          } else {
            this.dataType = 'Database';
          }
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

  public onCancelEditDescription(): void {
    const $descInput = $(this._descInput.nativeElement);
    $descInput.val(this.descriptionChangeText);
    this.isEditDescription = false;
  }

  public onUpdateSourceDescriptionClicked(): void {
    this.loadingShow();
    // Check text length
    const $descInput = $(this._descInput.nativeElement);
    const inputVal = $descInput.val() as string;
    if (CommonUtil.getByte(inputVal.trim()) > 2000) {
      Alert.warning(this.translateService.instant('msg.alert.edit.description.len'));
      $descInput.trigger('focus');
      this.loadingHide();
      return;
    }

    // deactivate edit mode
    this.isEditDescription = !this.isEditDescription;
    this.descriptionChangeText = inputVal;

    // update the data in DB
    this.metadataService.updateMetadata(this.metadata.id, {description: inputVal.trim()})
      .then(() => {
        Alert.success(this.translateService.instant('msg.metadata.metadata.detail.ui.alert.metadata.modified'));
        this.metadata.description = this.descriptionChangeText;
        this.metadataModelService.setMetadata(this.metadata);
        this.loadingHide();
      })
      .catch((error) => this.commonExceptionHandler(error));
  }

  public onClickGoToDatasourceButton() {

    const modal: Modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.name');
    modal.description = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.description');
    modal.btnName = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.btn');
    modal.afterConfirm = () => this.router.navigate(['/management/storage/datasource/', this.metadata.source.source.id]).then()

    CommonUtil.confirm(modal);
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
    this.metadataService.getPopularityTags({scope: 'DOMAIN', domainType: 'METADATA', size: 10}).then(result => {
      this.popularityTagList = (result && result._embedded && result._embedded.tagCountDToes) ? result._embedded.tagCountDToes : [];
      this.safelyDetectChanges();
    });
  }

  public getTagName(tagName: string): string {
    // if empty search keyword
    if (StringUtil.isEmpty(tagName)) {
      return tagName;
    } else {
      return tagName.replace(this.tagValue, `<span class="ddp-txt-search">${this.tagValue}</span>`);
    }
  }

  get filteredTagsList() {
    const list = [];
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
      console.log('error -> ', err);
    });
  }

  public addTag() {
    this.showTags = false;
    const idx = this.metadataModelService.getMetadata().tags.map((item) => {
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
        $('.ddp-tag-default input').trigger('blur');
      }).catch((err) => {
        console.log('error -> ', err);
        this.tagFlag = false;
        $('.ddp-tag-default input').trigger('blur');
      });
    }
  }

  public setTagValue(tag) {
    this.tagValue = tag;
    this.addTag();
  }

  public tagClickOutsideEvent() {
    this.tagValue = '';
    this.showTags = false;
  }

  public showSearchCatalog(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.showTags = false;
    this.catalogSearchText = '';
    this.searchCatalogList = [];
    this.isSearchCatalog = true;
    this.safelyDetectChanges();
  }

  public getCatalogHierarchyName(hierarchyName: string): string {
    // if empty search keyword
    if (StringUtil.isEmpty(hierarchyName)) {
      return hierarchyName;
    } else {
      return hierarchyName.replace(this.catalogSearchText, `<span class="ddp-txt-search">${this.catalogSearchText}</span>`);
    }
  }

  public isExistCatalog(item: { id: string, name: string, count: number, hierarchies: { id: string, name: string }[] }) {
    if (this.metadata.catalogs) {
      return this.metadata.catalogs.some(catalog => catalog.id === item.id);
    } else {
      return false;
    }
  }

  public selectCatalog(item) {
    this.loadingShow();
    if ((this.metadata.catalogs as [any]).some(catalog => catalog.id === item.id)) {
      Alert.error(this.translateService.instant('msg.metadata.metadata.detail.ui.alert.catalog.already.included'));
      this.loadingHide();
    } else {
      this.showCatalogs = false;
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

      if ('' === this.catalogSearchText) {
        this.searchCatalogList = [];
        this.safelyDetectChanges();
      } else {
        // fetch data from api
        this.catalogService.getCatalogs(this._getCatalogParams()).then((result) => {
          // if any catalog is included
          // if ((this.metadata.catalogs as [any]).length > 0) {
          //   let contained = true;
          //   // check if catalog is already in list
          //   result = (result as [any]).filter(catalogFromAPi => {
          //     contained = true;
          //     (this.metadata.catalogs as [any]).forEach(catalog => {
          //       if (catalog.name === catalogFromAPi.name) {
          //         contained = false;
          //       }
          //     });
          //     return contained;
          //   });
          // }
          this.searchCatalogList = result;
          this.safelyDetectChanges();
        });
      }
    }
  }


  private _getPopularityCatalogs() {
    this.catalogService.getPopularityCatalogs({size: 10}).then(result => {
      this.popularityCatalogList = (result && result._embedded && result._embedded.catalogCountDToes) ? result._embedded.catalogCountDToes : [];
      this.safelyDetectChanges();
    });
  }

  private _getCatalogParams(): object {
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
