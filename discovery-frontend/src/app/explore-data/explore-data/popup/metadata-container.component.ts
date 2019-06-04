import {
  Component, ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {Metadata} from "../../../domain/meta-data-management/metadata";
import {AbstractPopupComponent} from "../../../common/component/abstract-popup.component";
import * as $ from "jquery";
import {RecentQueriesComponent} from "./recent-queries.component";
import {CommonUtil} from "../../../common/util/common.util";
import {SYSTEM_PERMISSION} from "../../../common/permission/permission";

@Component({
  selector: 'explore-metadata-container',
  templateUrl: './metadata-container.component.html',
  entryComponents: [RecentQueriesComponent]
})
export class MetadataContainerComponent extends AbstractPopupComponent implements OnInit {

  @Input()
  public metadata: Metadata;

  @Output()
  public closeMetadataContainer = new EventEmitter();

  @ViewChild('recentQueriesContainer', {read: ViewContainerRef})
  recentQueriesContainer: ViewContainerRef;

  public selectedTab: number = 0;

  public tabs: MetadataTab[];

  public isShowInfo: boolean = false;

  public infoList: MetadataInformation[];

  constructor(
    protected element: ElementRef,
    protected injector: Injector, private _resolver: ComponentFactoryResolver) {
    super(element, injector);
  }


  ngOnInit() {

    this._initView();

  }




  private _initView() {

    // remove outer scroll
    $('body').removeClass('body-hidden').addClass('body-hidden');

    this.tabs = [
      {id: 0, label: 'Overview', value: 'Overview'},
      {id: 1, label: 'Columns', value: 'Columns'},
      {id: 2, label: 'Sample data', value: 'Sample data'},
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

  public onOpenRecentQuery() {

    this.recentQueriesContainer.clear();

    const factory = this._resolver.resolveComponentFactory(RecentQueriesComponent);

    const componentRef = this.recentQueriesContainer.createComponent(factory);

    componentRef.instance.datasourceId = '';

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
