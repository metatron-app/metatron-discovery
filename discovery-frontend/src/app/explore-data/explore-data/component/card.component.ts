import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";

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
  // option
  @Input() readonly isEnableDescription: boolean;
  @Input() readonly isEnableTag: boolean;
  @Input() readonly isEnablePopularity: boolean;
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
}
