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

import {
  Component, ComponentFactoryResolver,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import {ActivatedRoute} from "@angular/router";
import * as _ from "lodash";
import {StringUtil} from "../../common/util/string.util";
import {ExploreDataConstant} from "../constant/explore-data-constant";
import {DataCreator} from "../../domain/meta-data-management/data-creator";

@Component({
  selector: 'app-favorite-creator',
  templateUrl: './data-creator.component.html',
})
export class DataCreatorComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  myFavoriteCreatorList: DataCreator[] = [];

  // search
  searchRange = {name: 'All', value: ExploreDataConstant.SearchRange.ALL};
  searchedKeyword: string = '';

  selectedSort = 'modifiedTime, desc';

  searchParams: { [key: string]: string };



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    private metadataService: MetadataService,
    private resolver: ComponentFactoryResolver,
    private activatedRoute: ActivatedRoute,
    protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
      const paramKeys = Object.keys(params);
      const isExistSearchParams = paramKeys.length > 0;
      const searchParams = {};
      // if exist search param in URL
      if (isExistSearchParams) {
        paramKeys.forEach((key) => {
          if (key === 'size') {
            this.page.size = params['size'];
          } else if (key === 'page') {
            this.page.page = params['page'];
          } else if (key === 'sort') {
            this.selectedSort = params['sort'].split(',');
          }
        });
        // TODO 추후 criterion component로 이동
        delete searchParams['pseudoParam'];
        // init criterion search param
      }

      this.getCreatorList(this.getMyFavoriteCreatorListParams()).then();

      // set datasource list
    }));
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Used to set new get parameters for search or sorting or filtering
   * @param {boolean} isFirstPage
   */
  reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this.searchParams = this.getMyFavoriteCreatorListParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this.searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage

  getMyFavoriteCreatorListParams() {
    let params;
    params = {
      page: this.page.page,
      size: this.page.size,
      sort: this.selectedSort,
    };

    // if not empty search keyword
    if (StringUtil.isNotEmpty(this.searchedKeyword)) {
      params[this.searchRange.value] = this.searchedKeyword.trim();
    }
    return params;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  onClickCreatorCard(username: string) {
    this.router.navigate(['exploredata/favorite/creator', username]).then();
  }

  async getCreatorList(params) {
    this.loadingShow();
    const result = await this.metadataService.getCreatorList({size: 20, page: 0, projection: 'forListView', sort: 'modifiedTime,desc'}).catch((e) => this.commonExceptionHandler(e));

    if (!_.isNil(result)) {
      // add ddp-scroll class to layout
      this.pageResult = result.page;
      // set metadata list
      if (result) {
        this.myFavoriteCreatorList = result;
        console.log(this.myFavoriteCreatorList);
      } else {
        this.myFavoriteCreatorList = [];
      }
      this.loadingHide();
    }
  }


  onClickFavoriteInCard(selectedCreator: any) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.metadataService.toggleCreatorFavorite(selectedCreator.creator.id, selectedCreator.favorite).then().catch(e => this.commonExceptionHandler(e));
    const index = this.myFavoriteCreatorList.findIndex(creator => {
      return creator.creator.id = selectedCreator.creator.id;
    });

    if (index !== -1) {
      this.myFavoriteCreatorList[index].favorite = !this.myFavoriteCreatorList[index].favorite;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
