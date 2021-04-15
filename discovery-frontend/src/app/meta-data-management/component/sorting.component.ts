import {AbstractComponent} from '@common/component/abstract.component';
import {Component, ElementRef, EventEmitter, Injector, Input, Output} from '@angular/core';

@Component({
  selector: 'component-sorting',
  templateUrl: 'sorting.component.html'
})
export class SortingComponent extends AbstractComponent {

  @Input()
  readonly sortList;

  @Input()
  selectedSort;

  @Output()
  readonly changedSort = new EventEmitter();

  isShowLayer: boolean;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  isSelectedSort(sort): boolean {
    return sort.value === this.selectedSort.value;
  }


  closeLayer() {
    if (this.isShowLayer === true) {
      this.isShowLayer = undefined;
    }
  }

  changeLayerState() {
    this.isShowLayer = !this.isShowLayer;
  }

  changeSort(sort, event: MouseEvent) {
    // prevent event bubbling
    event.stopImmediatePropagation();
    // change sort
    this.selectedSort = sort;
    // output sort
    this.changedSort.emit(sort);
  }
}
