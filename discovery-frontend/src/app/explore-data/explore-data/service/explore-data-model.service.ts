import {Injectable} from "@angular/core";
import {ExploreDataConstant} from "../../constant/explore-data-constant";
import {Catalog} from "../../../domain/catalog/catalog";

@Injectable()
export class ExploreDataModelService {

  // search
  searchKeyword: string;
  selectedSearchRange = {name: 'All', value: ExploreDataConstant.SearchRange.ALL};
  // lnb
  selectedLnbTab: ExploreDataConstant.LnbTab = ExploreDataConstant.LnbTab.CATALOG;
  selectedCatalog: Catalog.Tree;
  selectedTag;


  initialSearchData() {
    this.searchKeyword = undefined;
    this.selectedSearchRange = {name: 'All', value: ExploreDataConstant.SearchRange.ALL};
  }

  initialLnbData() {

  }
}
