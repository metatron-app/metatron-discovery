import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {Metadata} from "../../../domain/meta-data-management/metadata";
import * as $ from "jquery";
import {CommonUtil} from "../../../common/util/common.util";
import {SYSTEM_PERMISSION} from "../../../common/permission/permission";
import {WorkspaceUsesComponent} from "./workspace-uses.component";
import {AbstractComponent} from "../../../common/component/abstract.component";

@Component({
  selector: 'explore-metadata-container',
  templateUrl: './metadata-container.component.html',
})
export class MetadataContainerComponent extends AbstractComponent {

  @Input()
  public metadata: Metadata;

  @ViewChild(WorkspaceUsesComponent)
  workspaceUsesComp: WorkspaceUsesComponent;

  @Output() readonly closeMetadataContainer = new EventEmitter();

  public selectedTab: number = 0;

  public tabs: MetadataTab[];

  public isShowInfo: boolean = false;

  public infoList: MetadataInformation[];

  private _$body = $('body');

  constructor(
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }


  ngOnInit() {
    this.removeBodyScrollHidden();
    this._initView();
  }

  ngOnDestroy() {
    this.addBodyScrollHidden();
  }


  private _initView() {
    // remove outer scroll
    this._$body.addClass('body-hidden');

    this.tabs = [
      {id: 0, label: this.translateService.instant('msg.explore.ui.detail.tab.overview'), value: 'Overview'},
      {id: 1, label: this.translateService.instant('msg.explore.ui.detail.tab.columns'), value: 'Columns'},
      {id: 2, label: this.translateService.instant('msg.explore.ui.detail.tab.sample'), value: 'Sample data'},
    ];
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
  public isManagerAuth() {
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
