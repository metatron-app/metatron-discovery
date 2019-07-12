import {AbstractComponent} from "../../../common/component/abstract.component";
import {Component, ElementRef, Injector} from "@angular/core";

@Component({
  selector: 'component-explore-data-information',
  templateUrl: 'explore-data-information.component.html'
})
export class ExploreDataInformationComponent extends AbstractComponent {

  isShowInformation: boolean;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  onChangeShowInformation(): void {
    this.isShowInformation = !this.isShowInformation;
  }

  closeInformation(): void {
    if (this.isShowInformation === true) {
      this.isShowInformation = undefined;
    }
  }
}
