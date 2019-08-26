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

@Component({
  selector: 'explore-metadata-overview',
  templateUrl: './metadata-overview.component.html',
  entryComponents: [RecentQueriesComponent]
})
export class MetadataOverviewComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('component_recent_queries', {read: ViewContainerRef}) entry: ViewContainerRef;

  entryRef: ComponentRef<RecentQueriesComponent>;

  @Input() readonly metadataId: string;
  @Input() readonly metadata : Metadata;
  @Input() readonly topUserList;
  @Input() readonly recentlyUpdatedList;
  @Input() readonly recentlyQueriesForDataSource;
  @Input() readonly recentlyQueriesForDataBase;

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

  isShowQueryMoreContents(): boolean {
  // TODO query 가 4건 이상
    return true;
  }

  onClickSeeAllRecentDashboards(): void {

  }

  onClickSeeAllRecentQueries(): void {
    this.entryRef = this.entry.createComponent(this.resolver.resolveComponentFactory(RecentQueriesComponent));
    if (this.isDatasourceTypeMetadata()) {
      this.entryRef.instance.recentlyQueriesForDataSource = this.recentlyQueriesForDataSource;
    } else if (this.isDatabaseTypeMetadata() || this.isStagingTypeMetadata()) {
      this.entryRef.instance.recentlyQueriesForDataBase = this.recentlyQueriesForDataBase;
    }
    this.entryRef.instance.init();
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


