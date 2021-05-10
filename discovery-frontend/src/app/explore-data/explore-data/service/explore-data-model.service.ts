import {Injectable} from '@angular/core';
import {Catalog} from '@domain/catalog/catalog';
import {ExploreDataConstant} from '../../constant/explore-data-constant';

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
    this.searchKeyword = '';
    this.selectedSearchRange = {name: 'All', value: ExploreDataConstant.SearchRange.ALL};
  }

  initialLnbData() {
    this.selectedLnbTab = ExploreDataConstant.LnbTab.CATALOG;
    this.initialSelectedCatalog();
    this.initialSelectedTag();
  }

  initialSelectedCatalog() {
    this.selectedCatalog = undefined;
  }

  initialSelectedTag() {
    this.selectedTag = undefined;
  }

  initializeAll() {
    this.searchKeyword = '';
    this.selectedTag = undefined;
    this.selectedCatalog = undefined;
  }
}
