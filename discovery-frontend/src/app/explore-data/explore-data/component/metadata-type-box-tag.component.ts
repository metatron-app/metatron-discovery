import {Component, ElementRef, Injector, Input} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {Metadata, SourceType} from "../../../domain/meta-data-management/metadata";

@Component({
  selector: 'component-metadata-type-box-tag',
  templateUrl: 'metadata-type-box-tag.component.html'
})
export class MetadataTypeBoxTagComponent extends AbstractComponent {

  @Input() readonly metadata: Metadata;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  getMetadataTypeIcon(): string {
    switch (this.metadata.sourceType) {
      case SourceType.ENGINE:
        return 'ddp-datasource';
      case SourceType.JDBC:
        return 'ddp-hive';
      case SourceType.STAGEDB:
        return 'ddp-stagingdb';
    }
  }

  getMetadataType(): string {
    switch (this.metadata.sourceType) {
      case SourceType.ENGINE:
        return this.translateService.instant('msg.comm.th.ds');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.STAGEDB:
        return this.translateService.instant('msg.storage.li.hive');
    }
  }
}
