import {
  Component, ComponentFactoryResolver,
  ElementRef, EventEmitter,
  Injector, Output,
  ViewChild,
} from '@angular/core';
import {Metadata} from "../../../domain/meta-data-management/metadata";
import {CommonUtil} from "../../../common/util/common.util";
import {SYSTEM_PERMISSION} from "../../../common/permission/permission";
import {WorkspaceUsesComponent} from "./workspace-uses.component";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import * as _ from 'lodash';

@Component({
  selector: 'explore-metadata-container',
  templateUrl: './metadata-container.component.html',
  // entryComponents: [CreateWorkbenchComponent]
})
export class MetadataContainerComponent extends AbstractComponent {

  metadataId: string;
  metadataDetailData: Metadata;

  @Output() readonly closedPopup = new EventEmitter();

  // @ViewChild('component_create_workbench', {read: ViewContainerRef}) readonly entry: ViewContainerRef;
  //
  // entryRef: ComponentRef<CreateWorkbenchComponent>;

  @ViewChild(WorkspaceUsesComponent)
  workspaceUsesComp: WorkspaceUsesComponent;

  public selectedTab: number = 0;

  public tabs: MetadataTab[] = [
    {id: 0, label: this.translateService.instant('msg.explore.ui.detail.tab.overview'), value: 'Overview'},
    {id: 1, label: this.translateService.instant('msg.explore.ui.detail.tab.columns'), value: 'Columns'},
    {id: 2, label: this.translateService.instant('msg.explore.ui.detail.tab.sample'), value: 'Sample data'},
  ];

  public isShowInfo: boolean = false;

  public infoList: MetadataInformation[];

  constructor(private resolver: ComponentFactoryResolver,
              private metadataService: MetadataService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  ngOnInit() {
    this.addBodyScrollHidden();
  }

  ngOnDestroy() {
    this.removeBodyScrollHidden();
  }

  initial(metadataId: string): void {
    this.metadataId = metadataId;
    this._setMetadataDetail(this.metadataId);
  }

  isExistMetadata(): boolean {
    return !_.isNil(this.metadataDetailData);
  }

  /**
   * When X button is clicked
   */
  public onClickCloseBtn() {
    this.closedPopup.emit();
  }


  /**
   * When i icon is clicked
   */
  public onClickInfo() {
    this.isShowInfo = true;
  }


  /**
   * When tab is clicked
   * @param tab
   */
  public onClickTab(tab: MetadataTab) {
    this.selectedTab = tab.id;
  }

  /**
   * Move to management > metadata detail
   */
  public onClickEditData() {
    this.router.navigate(['management/metadata/metadata', this.metadataId]).then();
  }

  // onClickCreateWorkbench(): void {
  //   this.entry.clear();
  //   this.entryRef = this.entry.createComponent(this.resolver.resolveComponentFactory(CreateWorkbenchComponent));
  //   this.entryRef.instance.init();
  // }


  /**
   * Returns True is current user is manager
   */
  public isManagerAuth() {
    let cookiePermission: string = CommonUtil.getCurrentPermissionString();
    return (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_DATASOURCE.toString())) || (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_METADATA.toString()));
  }

  public onClickCreatedBy() {
    this.workspaceUsesComp.init({});
  }

  private _setMetadataDetail(metadataId: string) {
    this.loadingShow();
    this.metadataService.getDetailMetaData(metadataId)
      .then((result) => {
        this.loadingHide();
        this.metadataDetailData = result;
      })
      .catch(error => this.commonExceptionHandler(error));
  }

}

class MetadataTab {
  id: number;
  label: string;
  value: string;
}

class MetadataInformation {
  label: string;
  value: string;
}
