import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import * as _ from "lodash";

@Component({
  selector: 'component-catalog-folder',
  templateUrl: 'catalog-folder.component.html'
})
export class CatalogFolderComponent extends AbstractComponent {

  isOpened;

  @Input() readonly searchKeyword: string;

  // event
  @Output() readonly clickedCatalog = new EventEmitter();
  @Output() readonly clickedDepth = new EventEmitter();

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  onChangeFolderOpen() {

  }

  onClickDepth() {
    this.clickedDepth.emit();
  }

  onClickCatalog(tag) {
    event.stopImmediatePropagation();
    this.clickedCatalog.emit(tag);
  }
}
