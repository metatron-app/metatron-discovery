import {Component, ElementRef, Injector, Input} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";

@Component({
  selector: 'component-explore-catalog-layer',
  templateUrl: 'explore-catalog-layer.component.html'
})
export class ExploreCatalogLayerComponent extends AbstractComponent {

  @Input() readonly catalogList;

  isShowLayerPopup: boolean;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  openLayerPopup(): void {
    this.isShowLayerPopup = true;
  }

  closePopup(): void {
    if (this.isShowLayerPopup === true) {
      this.isShowLayerPopup = undefined;
    }
  }
}
