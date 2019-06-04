import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Input,
  OnInit, Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import {RecentQueriesComponent} from "./recent-queries.component";
import {Metadata} from "../../../domain/meta-data-management/metadata";

@Component({
  selector: 'explore-metadata-overview',
  templateUrl: './metadata-overview.component.html',
})
export class MetadataOverviewComponent implements OnInit {

  @ViewChild('recentQueriesContainer', {read: ViewContainerRef})
  recentQueriesContainer: ViewContainerRef;

  @Input()
  public metadataId: string;

  public metadata : Metadata;

  public isShowMoreCatalogs: boolean = false;

  @Output()
  public openRecentQuery = new EventEmitter();

  constructor(private _metadataService: MetadataService,
              private _resolver: ComponentFactoryResolver) {

  }

  ngOnInit() {
    if (this.metadataId) {
      this.getMetadataDetail(this.metadataId);
    }
  }


  getMetadataDetail(metadataId: string) {
    this._metadataService.getDetailMetaData(metadataId)
      .then((result) => {
        this.metadata = result;
      })
  }

  onClickSeeAllRecentQueries() {
    this.openRecentQuery.emit();
  }




}


