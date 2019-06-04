import {Component, ElementRef, Injector, Input, OnInit} from '@angular/core';
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import {MetadataColumn} from "../../../domain/meta-data-management/metadata-column";
import {AbstractPopupComponent} from "../../../common/component/abstract-popup.component";

@Component({
  selector: 'explore-metadata-columns',
  templateUrl: './metadata-columns.component.html',
})
export class MetadataColumnsComponent extends AbstractPopupComponent implements OnInit {

  @Input()
  metadataId: string;

  columns: MetadataColumn[];


  constructor(protected element: ElementRef,
              protected injector: Injector,
              private _metadataService: MetadataService) {
    super(element,injector);
  }


  ngOnInit() {
    if (this.metadataId) {
      this._getColumns(this.metadataId);
    }
  }


  /**
   * Fetch column list
   * @param id
   * @private
   */
  private _getColumns(id: string) {
    this._metadataService.getColumnSchemaListInMetaData(id).then((result) => {

      // remove item with name == 'current_datetime'
      this.columns = result.filter((item) => {
        return item.name !== 'current_datetime'
      });

    })
  }

}
