import {
  Component, ComponentFactoryResolver, ComponentRef,
  Input, OnDestroy,
  OnInit,
  ViewChild, ViewContainerRef,
} from '@angular/core';
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import {RecentQueriesComponent} from "./recent-queries.component";
import {Metadata} from "../../../domain/meta-data-management/metadata";
import * as _ from 'lodash';

@Component({
  selector: 'explore-metadata-overview',
  templateUrl: './metadata-overview.component.html',
  entryComponents: [RecentQueriesComponent]
})
export class MetadataOverviewComponent implements OnInit, OnDestroy {

  @ViewChild('component_recent_queries', {read: ViewContainerRef}) entry: ViewContainerRef;
  entryRef: ComponentRef<RecentQueriesComponent>;

  @Input()
  public metadataId: string;

  public metadata : Metadata;

  public isShowMoreCatalogs: boolean = false;

  constructor(private _metadataService: MetadataService,
              private resolver: ComponentFactoryResolver) {

  }

  ngOnInit(): void {
    if (this.metadataId) {
      this.getMetadataDetail(this.metadataId);
    }
  }

  ngOnDestroy(): void {
    if (!_.isNil(this.entryRef)) {
      this.entryRef.destroy();
    }
  }


  getMetadataDetail(metadataId: string) {
    this._metadataService.getDetailMetaData(metadataId)
      .then((result) => {
        this.metadata = result;
      })
  }

  onClickSeeAllRecentQueries() {
    this.entry.clear();
    this.entryRef = this.entry.createComponent(this.resolver.resolveComponentFactory(RecentQueriesComponent));
    this.entryRef.instance.init();
  }
}


