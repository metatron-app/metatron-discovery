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

import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import * as _ from "lodash";
import {StringUtil} from "../../../common/util/string.util";
import {ExploreDataConstant} from "../../constant/explore-data-constant";

@Component({
  selector: 'component-explore-banner',
  templateUrl: 'explore-banner.component.html'
})
export class ExploreBannerComponent extends AbstractComponent {

  // class
  @Input() readonly bannerClass: string;
  @Input() readonly iconClass: ExploreDataConstant.Metadata.TypeIconClass;
  @Input() readonly isMain:boolean = false;
  // data
  @Input() readonly title: string;
  @Input() readonly description: string;
  @Input() readonly tagList;
  // event
  @Output() readonly clickedBanner = new EventEmitter();
  @Output() readonly clickedTag = new EventEmitter();

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  onClickBanner() {
    this.clickedBanner.emit();
  }

  onClickTag(tag) {
    event.stopImmediatePropagation();
    this.clickedTag.emit(tag);
  }

  get isEnableTag(): boolean {
    return !_.isNil(this.tagList) && this.tagList.length !== 0;
  }

  get isEnableDescription(): boolean {
    return this.description && StringUtil.isNotEmpty(this.description);
  }
}
