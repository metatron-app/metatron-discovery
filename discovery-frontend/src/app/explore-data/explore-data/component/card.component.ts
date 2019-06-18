import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import * as _ from "lodash";
import {StringUtil} from "../../../common/util/string.util";

@Component({
  selector: 'component-card',
  templateUrl: 'card.component.html'
})
export class CardComponent extends AbstractComponent {

  // class
  @Input() readonly imageClass: string;
  // data
  @Input() readonly title: string;
  @Input() readonly description: string;
  @Input() readonly tagList;
  @Input() readonly popularity: number;
  @Input() readonly creator: string;
  // event
  @Output() readonly clickedCard = new EventEmitter();
  @Output() readonly clickedTag = new EventEmitter();

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  onClickCard() {
    this.clickedCard.emit();
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

  isEnablePopularity(): boolean {
    return !_.isNil(this.popularity);
  }
}
