import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import * as _ from "lodash";
import {StringUtil} from "../../../common/util/string.util";

@Component({
  selector: 'component-banner',
  templateUrl: 'banner.component.html'
})
export class BannerComponent extends AbstractComponent {

  // class
  @Input() readonly bannerClass: string;
  @Input() readonly iconClass: string;
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

  isEnableTag(): boolean {
    return !_.isNil(this.tagList) && this.tagList.length !== 0;
  }

  isEnableDescription(): boolean {
    return StringUtil.isNotEmpty(this.description);
  }
}
