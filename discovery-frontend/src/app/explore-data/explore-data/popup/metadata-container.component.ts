import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Injector,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {Metadata} from "../../../domain/meta-data-management/metadata";
import {CommonUtil} from "../../../common/util/common.util";
import {SYSTEM_PERMISSION} from "../../../common/permission/permission";
import {WorkspaceUsesComponent} from "./workspace-uses.component";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import * as _ from 'lodash';
import {CreateWorkbenchContainerComponent} from "../../../workbench/component/create-workbench/refactoring/create-workbench-container.component";
import {CookieConstant} from "../../../common/constant/cookie.constant";
import {CreateWorkbookComponent} from "../../../workbook/component/create-workbook/refactoring/create-workbook.component";

@Component({
  selector: 'explore-metadata-container',
  templateUrl: './metadata-container.component.html',
  entryComponents: [CreateWorkbenchContainerComponent, CreateWorkbookComponent]
})
export class MetadataContainerComponent extends AbstractComponent {

  metadataId: string;
  metadataDetailData: Metadata;

  @Output() readonly closedPopup = new EventEmitter();

  @ViewChild('component_create_workbench', {read: ViewContainerRef}) readonly createWorkbenchEntry: ViewContainerRef;
  createWorkbenchEntryRef: ComponentRef<CreateWorkbenchContainerComponent>;

  @ViewChild('component_create_workbook', {read: ViewContainerRef}) readonly createWorkbookEntry: ViewContainerRef;
  createWorkbookEntryRef: ComponentRef<CreateWorkbookComponent>;

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

  onClickCreateWorkbench(): void {
    if (this.isShowCreateWorkbench()) {
      this.createWorkbenchEntryRef = this.createWorkbenchEntry.createComponent(this.resolver.resolveComponentFactory(CreateWorkbenchContainerComponent));
      const workspace = JSON.parse(this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE));
      // set data in component
      this.createWorkbenchEntryRef.instance.setWorkspaceId(workspace.id);
      this.createWorkbenchEntryRef.instance.setConnectionInModel(this.metadataDetailData.source.source);
      this.createWorkbenchEntryRef.instance.setSchemaName(this.metadataDetailData.source.schema);
      this.createWorkbenchEntryRef.instance.setTableName(this.metadataDetailData.source.table);
      this.createWorkbenchEntryRef.instance.accessFromExplore();
      this.createWorkbenchEntryRef.instance.closedPopup.subscribe(() => {
        this.createWorkbenchEntryRef.destroy();
      });
      this.createWorkbenchEntryRef.instance.completedPopup.subscribe((workbenchId: string) => {
        if (_.isNil(workbenchId)) {
          // link to workspace
          this.router.navigateByUrl('/workspace').then();
        } else {
          // link to workspace
          this.router.navigateByUrl('/workbench/' + workbenchId).then();
        }
      });
    }
  }

  onClickCreateWorkbook(): void {
    if (this.isShowCreateWorkbook()) {
      this.createWorkbookEntryRef = this.createWorkbookEntry.createComponent(this.resolver.resolveComponentFactory(CreateWorkbookComponent));
      const workspace = JSON.parse(this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE));
      // set data in component
      this.createWorkbookEntryRef.instance.setWorkspaceId(workspace.id);
      this.createWorkbookEntryRef.instance.setSourceId(this.metadataDetailData.source.source.id);
      this.createWorkbookEntryRef.instance.accessFromExplore();
      this.createWorkbookEntryRef.instance.closedPopup.subscribe(() => {
        this.createWorkbookEntryRef.destroy();
      });
      this.createWorkbookEntryRef.instance.completedPopup.subscribe((workbookId: string) => {
        if (_.isNil(workbookId)) {
          // link to workspace
          this.router.navigateByUrl('/workspace').then();
        } else {
          // link to workspace
          this.router.navigateByUrl('/workbook/' + workbookId).then();
        }
      });
    }
  }

  /**
   * Returns True is current user is manager
   */
  public isManagerAuth() {
    let cookiePermission: string = CommonUtil.getCurrentPermissionString();
    return (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_DATASOURCE.toString())) || (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_METADATA.toString()));
  }

  isShowCreateWorkbench(): boolean {
    return Metadata.isSourceTypeIsJdbc(this.metadataDetailData.sourceType);
  }

  isShowCreateWorkbook(): boolean {
    return Metadata.isSourceTypeIsEngine(this.metadataDetailData.sourceType);
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
