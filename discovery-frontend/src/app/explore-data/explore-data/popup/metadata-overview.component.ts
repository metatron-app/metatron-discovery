import {ClipboardService} from 'ngx-clipboard';
import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {Metadata} from '@domain/meta-data-management/metadata';
import {RecentQueriesComponent} from './recent-queries.component';
import {DashboardUtil} from "../../../dashboard/util/dashboard.util";

@Component({
  selector: 'explore-metadata-overview',
  templateUrl: './metadata-overview.component.html',
  entryComponents: [RecentQueriesComponent],
  preserveWhitespaces: false
})
export class MetadataOverviewComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('component_recent_queries', {read: ViewContainerRef}) entry: ViewContainerRef;

  entryRef: ComponentRef<RecentQueriesComponent>;

  @Input() readonly metadataId: string;
  @Input() readonly metadata: Metadata;
  @Input() readonly topUserList = [];
  @Input() readonly recentlyUpdatedList = [];
  @Input() readonly recentlyQueriesForDataBase = [];
  @Input() readonly recentlyUsedDashboardList = [];

  @Output() clickedTopUser = new EventEmitter();

  // Dashboard util for get dashboard image
  public dashboardUtil: DashboardUtil = new DashboardUtil();


  public isShowMoreCatalogs: boolean = false;

  constructor(
    private clipboardService: ClipboardService,
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
    // open in new tab
    window.open(popUrl, '_blank');
  }

  async onClickUser(username: string) {
    this.clickedTopUser.emit(username);
  }

  /**
   * copy clipboard
   */
  public copyToClipboard(query: string) {
    this.clipboardService.copyFromContent(query);
    // alert
    Alert.success(this.translateService.instant('msg.storage.alert.clipboard.copy'));
  }

}


