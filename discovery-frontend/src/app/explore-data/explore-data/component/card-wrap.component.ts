import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {StringUtil} from "../../../common/util/string.util";
import * as _ from 'lodash';

@Component({
  selector: 'component-wrap-card',
  templateUrl: 'card-wrap.component.html'
})
export class CardWrapComponent extends AbstractComponent {

  // data
  @Input() readonly title: string;
  @Input() readonly cardList;
  @Input() readonly wrapClass: string;
  @Input() readonly listWrapClass: string;
  // option
  @Input() readonly isEnableMoreContent: boolean;
  // event
  @Output() readonly clickedCard = new EventEmitter();

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  isEnableTag(card): boolean {
    return !_.isNil(card.tags) && card.tags.length !== 0;
  }

  isEnableDescription(card): boolean {
    return StringUtil.isNotEmpty(card.description);
  }

  onClickCard(card) {
    this.clickedCard.emit(card);
  }
}
