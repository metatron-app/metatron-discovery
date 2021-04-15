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

import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Metadata} from '@domain/meta-data-management/metadata';
import {ExploreDataConstant} from '../../constant/explore-data-constant';

@Component({
  selector: 'component-explore-banner',
  templateUrl: 'explore-banner.component.html'
})
export class ExploreBannerComponent extends AbstractComponent implements OnInit {

  // class
  @Input() readonly bannerClass: string;
  @Input() readonly iconClass: ExploreDataConstant.Metadata.TypeIconClass;
  @Input() readonly isMain: boolean = false;
  // data
  @Input() readonly metadata: Metadata;
  // event
  @Output() readonly clickedBanner = new EventEmitter();
  @Output() readonly clickedTag = new EventEmitter();

  extraTagNumber: number = 0;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.metadata.tags) {
      if (this.metadata.tags.length > 0 && this.metadata.tags.length !== 1) {
        this.extraTagNumber = this.metadata.tags.length - 1;
      } else {
        this.extraTagNumber = 0;
      }
    }
  }

  onClickBanner() {
    this.clickedBanner.emit();
  }

  //
  // onClickTag(tag) {
  //   event.stopImmediatePropagation();
  //   this.clickedTag.emit(tag);
  // }
  //
  // get isEnableTag(): boolean {
  //   return !_.isNil(this.metadata.tagList) && this.metadata.tagList.length !== 0;
  // }
  //
  // get isEnableDescription(): boolean {
  //   return this.metadata.description && StringUtil.isNotEmpty(this.metadata.description);
  // }
}
