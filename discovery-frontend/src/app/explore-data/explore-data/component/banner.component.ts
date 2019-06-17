import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";

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
  // option
  @Input() readonly isEnableDescription: boolean;
  @Input() readonly isEnableTag: boolean;
  // event
  @Output() readonly clickedBanner = new EventEmitter();
  @Output() readonly clickedTag = new EventEmitter();

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  onClickBanner() {
    // TODO check bubbling
    this.clickedBanner.emit();
  }

  onClickTag(tag) {
    // TODO check bubbling
    this.clickedTag.emit(tag);
  }
}
