import {
  Component, ComponentFactoryResolver, ComponentRef, ElementRef, Injector,
  Input, OnDestroy,
  OnInit,
  ViewChild, ViewContainerRef,
} from '@angular/core';
import {RecentQueriesComponent} from "./recent-queries.component";
import {Metadata} from "../../../domain/meta-data-management/metadata";
import {Alert} from "../../../common/util/alert.util";
import {ClipboardService} from "ngx-clipboard";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {DashboardUtil} from "../../../dashboard/util/dashboard.util";
import {MetadataDataCreatorDataListComponent} from "./metadata-data-creator-data-list.component";
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";

@Component({
  selector: 'explore-metadata-overview',
  templateUrl: './metadata-overview.component.html',
  entryComponents: [RecentQueriesComponent, MetadataDataCreatorDataListComponent],
  preserveWhitespaces: false
})
export class MetadataOverviewComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('component_recent_queries', {read: ViewContainerRef}) entry: ViewContainerRef;
  @ViewChild('component_datacreator_data_list', {read: ViewContainerRef}) dataCreatorDataListEntry: ViewContainerRef;

  entryRef: ComponentRef<RecentQueriesComponent>;
  dataCreatorDataListEntryRef: ComponentRef<MetadataDataCreatorDataListComponent>;

  @Input() readonly metadataId: string;
  @Input() readonly metadata : Metadata;
  @Input() readonly topUserList = [];
  @Input() readonly recentlyUpdatedList = [];
  @Input() readonly recentlyQueriesForDataBase = [];
  @Input() readonly recentlyUsedDashboardList = [];

  public isShowMoreCatalogs: boolean = false;

  // Dashboard util for get dashboard image
  private dashboardUtil: DashboardUtil = new DashboardUtil();

  constructor(
    private clipboardService: ClipboardService,
    private metadataService: MetadataService,
    protected element: ElementRef,
    protected injector: Injector,
    private resolver: ComponentFactoryResolver) {
    super(element, injector);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  isDatasourceTypeMetadata(): boolean {
    return Metadata.isSourceTypeIsEngine(this.metadata.sourceType);
  }

  isDatabaseTypeMetadata(): boolean {
    return Metadata.isSourceTypeIsJdbc(this.metadata.sourceType);
  }

  isStagingTypeMetadata(): boolean {
    return Metadata.isSourceTypeIsStaging(this.metadata.sourceType);
  }

  isShowDashboardMoreContents(): boolean {
    // TODO dashborad 가 4건 이상
    return true;
  }

  onClickSeeAllRecentDashboards(): void {

  }

  onClickSeeAllRecentQueries(): void {
    this.entryRef = this.entry.createComponent(this.resolver.resolveComponentFactory(RecentQueriesComponent));
    this.entryRef.instance.recentlyQueriesForDataBase = this.recentlyQueriesForDataBase;
    this.entryRef.instance.init();
  }

  onDashboardClicked(recentlyUsedDashboard: any) {
    if (!recentlyUsedDashboard.hasPermission) {
      return
    }

    const popUrl = `workbook/${recentlyUsedDashboard.workbook.id}/${recentlyUsedDashboard.id}`;
    //open in new tab
    window.open(popUrl, '_blank');
  }

  async onClickUser(creator: string) {
    this.loadingShow();
    const result = await this.metadataService.getMetaDataList({creatorContains: creator, size: 100}).catch(e => this.commonExceptionHandler(e));

    if (result !== undefined && result) {
      if (result['_embedded']) {
        this.dataCreatorDataListEntryRef = this.dataCreatorDataListEntry.createComponent(this.resolver.resolveComponentFactory(MetadataDataCreatorDataListComponent));
        this.dataCreatorDataListEntryRef.instance.metadataList = result['_embedded']['metadatas'];
        this.dataCreatorDataListEntryRef.instance.creator = creator;
      }
    }

    this.loadingHide();
    this.dataCreatorDataListEntryRef.instance.closedPopup.subscribe(() => {
      // close
      this.dataCreatorDataListEntryRef.destroy();
    });
  }

  /**
   * copy clipboard
   */
  public copyToClipboard(query: string) {
    this.clipboardService.copyFromContent( query );
    // alert
    Alert.success(this.translateService.instant('msg.storage.alert.clipboard.copy'));
  }
}


