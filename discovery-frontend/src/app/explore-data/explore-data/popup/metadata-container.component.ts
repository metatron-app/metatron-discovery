import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {Metadata} from "../../../domain/meta-data-management/metadata";
import {AbstractPopupComponent} from "../../../common/component/abstract-popup.component";
import * as $ from "jquery";
import {RecentQueriesComponent} from "./recent-queries.component";
import {CommonUtil} from "../../../common/util/common.util";
import {SYSTEM_PERMISSION} from "../../../common/permission/permission";
import {WorkspaceUsesComponent} from "./workspace-uses.component";

@Component({
  selector: 'explore-metadata-container',
  templateUrl: './metadata-container.component.html',
  entryComponents: [RecentQueriesComponent]
})
export class MetadataContainerComponent extends AbstractPopupComponent implements OnInit {

  @Input()
  public metadata: Metadata;

  @ViewChild(WorkspaceUsesComponent)
  workspaceUsesComp: WorkspaceUsesComponent;

  @Output()
  public closeMetadataContainer = new EventEmitter();

  public selectedTab: number = 0;

  public tabs: MetadataTab[];

  public isShowInfo: boolean = false;

  public infoList: MetadataInformation[];

  constructor(
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }


  ngOnInit() {

    this._initView();

  }




  private _initView() {

    // remove outer scroll
    $('body').removeClass('body-hidden').addClass('body-hidden');

    this.tabs = [
      {id: 0, label: this.translateService.instant('msg.explore.ui.detail.tab.overview'), value: 'Overview'},
      {id: 1, label: this.translateService.instant('msg.explore.ui.detail.tab.columns'), value: 'Columns'},
      {id: 2, label: this.translateService.instant('msg.explore.ui.detail.tab.sample'), value: 'Sample data'},
    ];

    this._setMetadataInformation(this.metadata);
  }


  private _setMetadataInformation(metadata: Metadata) {
    this.infoList = [];
  }

  /**
   * When X button is clicked
   */
  public onClickCloseBtn() {
    this.closeMetadataContainer.emit();
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
    this.router.navigate(['management/metadata/metadata', this.metadata.id]).then();
  }


  /**
   * Returns True is current user is manager
   */
  public isManager() {
    let cookiePermission: string = CommonUtil.getCurrentPermissionString();
    return (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_DATASOURCE.toString())) || (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_METADATA.toString()));
  }

  public onClickCreatedBy() {
    this.workspaceUsesComp.init({});
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
