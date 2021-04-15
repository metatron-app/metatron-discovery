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

import * as _ from 'lodash';
import {Component, ElementRef, Injector, OnDestroy, OnInit,} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {StringUtil} from '@common/util/string.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {DataCreator} from '@domain/meta-data-management/data-creator';
import {MetadataService} from '../../meta-data-management/metadata/service/metadata.service';
import {ExploreDataConstant} from '../constant/explore-data-constant';

@Component({
  selector: 'app-favorite-creator',
  templateUrl: './data-creator.component.html',
})
export class DataCreatorComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  dataCreatorList: DataCreator[] = [];

  // search
  searchRange = {name: 'DATA_NAME', value: ExploreDataConstant.SearchRange.DATA_NAME};
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
            // this.selectedSort = params['sort'].split(',');
          }
        });
        // TODO 추후 criterion component로 이동
        delete searchParams['pseudoParam'];
        // init criterion search param
      }

      this.getCreatorList(this.getDataCreatorListParams()).then();

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
    this.searchParams = this.getDataCreatorListParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this.searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage

  async getCreatorList(params) {
    this.loadingShow();
    const result = await this.metadataService.getCreatorList(params).catch((e) => this.commonExceptionHandler(e));

    if (!_.isNil(result)) {
      // add ddp-scroll class to layout
      this.pageResult = result.page;
      // set metadata list
      if (result) {
        this.dataCreatorList = result;
      } else {
        this.dataCreatorList = [];
      }
      this.loadingHide();
    }
  }

  getDataCreatorListParams() {
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

  /**
   * Search connection keypress event
   * @param {string} keyword
   */
  public onChangedSearchKeyword(keyword: string): void {
    // set search keyword
    this.searchedKeyword = keyword;
    // reload page
    this.reloadPage(true);
  }

  onClickFavoriteInCard(selectedCreator: any) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.metadataService.toggleCreatorFavorite(selectedCreator.creator.id, selectedCreator.favorite).then().catch(e => this.commonExceptionHandler(e));
    const index = this.dataCreatorList.findIndex(creator => {
      return creator.creator.id === selectedCreator.creator.id;
    });

    if (index !== -1) {
      this.dataCreatorList[index].favorite = !this.dataCreatorList[index].favorite;
    }
  }

  public getUserImage(userInfo): string {
    if (userInfo && userInfo.hasOwnProperty('imageUrl')) {
      return '/api/images/load/url?url=' + userInfo.imageUrl + '/thumbnail';
    } else {
      return this.defaultPhotoSrc;
    }
  } // function - getUserImage
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
