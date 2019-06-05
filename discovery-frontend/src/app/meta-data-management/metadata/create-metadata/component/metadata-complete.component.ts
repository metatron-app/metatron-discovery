import {Input} from "@angular/core";

export class MetadataCompleteComponent {

  @Input() readonly createData;

  isEnableExploreDataSearch: boolean;



  onChangeExlploreDataSearch(): void {
    this.isEnableExploreDataSearch = !this.isEnableExploreDataSearch;
  }

  private _initExploreDataSearch(): void {
    // default
    this.isEnableExploreDataSearch = true;
  }

  private _initCreateMetaDataInfo(checkedTableList) {
    checkedTableList.reduce((result, table) => {

      return result;
    }, []);
  }
}
