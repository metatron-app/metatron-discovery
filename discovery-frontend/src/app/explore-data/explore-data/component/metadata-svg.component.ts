import {Component, Input} from "@angular/core";
import {ExploreDataConstant} from "../../constant/explore-data-constant";

@Component({
  selector: 'component-metadata-svg',
  templateUrl: 'metadata-svg.component.html'
})
export class MetadataSvgComponent {

  @Input() readonly iconClass: ExploreDataConstant.Metadata.TypeIconClass;

  readonly METADATA_TYPE = ExploreDataConstant.Metadata.TypeIconClass;

  constructor() {
  }
}
