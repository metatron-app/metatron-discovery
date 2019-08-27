import {Component, ElementRef, Injector, Input} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {SourceType} from "../../../domain/meta-data-management/metadata";

@Component({
  selector: 'component-explore-data-user-card',
  templateUrl: 'explore-data-user-card.component.html'
})
export class ExploreDataUserCardComponent extends AbstractComponent {
  @Input() readonly topUser;
  @Input() readonly sourceType: SourceType;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
