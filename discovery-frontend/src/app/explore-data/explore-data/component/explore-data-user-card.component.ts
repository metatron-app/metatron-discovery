import {Component, ElementRef, Injector, Input} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";

@Component({
  selector: 'component-explore-data-user-card',
  templateUrl: 'explore-data-user-card.component.html'
})
export class ExploreDataUserCardComponent extends AbstractComponent {

  @Input() readonly userName: string;
  @Input() readonly dateTime: string;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


}
