/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AbstractComponent} from "../../common/component/abstract.component";
import {Component, ElementRef, EventEmitter, Injector, Output} from "@angular/core";
import {ExploreDataModelService} from "./service/explore-data-model.service";
import {ExploreDataConstant} from "../constant/explore-data-constant";

@Component({
  selector: 'component-explore-search',
  templateUrl: 'explore-data-search.component.html',
})
export class ExploreDataSearchComponent extends AbstractComponent {

  protected readonly rangeList = [
    {name: 'All', value: ExploreDataConstant.SearchRange.ALL},
    {name: 'Data Name', value: ExploreDataConstant.SearchRange.DATA_NAME},
    {name: 'Description', value: ExploreDataConstant.SearchRange.DESCRIPTION},
    {name: 'Creator', value: ExploreDataConstant.SearchRange.CREATOR},
  ];

  // data
  protected searchKeyword: string = this.exploreDataModelService.searchKeyword;
  protected selectedSearchRange = this.exploreDataModelService.selectedSearchRange;

  protected isShowSelectBoxList: boolean;

  @Output() readonly changedSearch = new EventEmitter();

  // 생성자
  constructor(private exploreDataModelService: ExploreDataModelService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  ngOnDestroy() {
    super.ngOnDestroy();
    this.exploreDataModelService.initialSearchData();
  }

  protected onChangeShowSelectBoxList(): void {
    this.isShowSelectBoxList = !this.isShowSelectBoxList;
  }

  protected onChangeSearchRange(range, event: MouseEvent): void {
    // prevent event bubbling
    event.stopImmediatePropagation();
    if (this.selectedSearchRange.value !== range.value) {
      this.selectedSearchRange = range;
      this.exploreDataModelService.selectedSearchRange = range;
      this.closeSelectBoxList();
      this._changedSearch();
    }
  }

  protected onChangeSearchKeyword(value: string): void {
    this.searchKeyword = value;
    this.exploreDataModelService.searchKeyword = value;
    this._changedSearch();
  }

  protected closeSelectBoxList(): void {
    if (this.isShowSelectBoxList === true) {
      this.isShowSelectBoxList = undefined;
    }
  }

  private _changedSearch(): void {
    this.changedSearch.emit();
  }
}
