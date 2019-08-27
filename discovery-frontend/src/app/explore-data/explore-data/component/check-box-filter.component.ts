import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import * as _ from 'lodash';

@Component({
  selector: 'component-check-filter',
  templateUrl: 'check-box-filter.component.html'
})
export class CheckBoxFilterComponent extends AbstractComponent {

  @Input() readonly filterName: string;
  @Input() readonly filterList;
  @Input() readonly selectedFilters = [];

  isShowFilterList: boolean;

  @Output() readonly changedFilter = new EventEmitter();

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  isEmptySelectedFilters(): boolean {
    return _.isNil(this.selectedFilters) || this.selectedFilters.length === 0;
  }

  isCheckedFilter(filter): boolean {
    return this._findFilterIndexInSelectedFilters(filter) !== -1;
  }

  getSelectedFilters(): string {
    if (this.isEmptySelectedFilters()) {
      return this.translateService.instant('msg.comm.ui.list.all');
    } else {
      return this.selectedFilters.map(filter => filter.label).join(', ');
    }
  }

  closeFilterList(): void {
    if (this.isShowFilterList === true) {
      this.isShowFilterList = undefined;
    }
  }

  onChangeShowFilterList(): void {
    if (this.isShowFilterList === true) {
      this.isShowFilterList = undefined;
    } else {
      this.isShowFilterList = true;
    }
  }

  onChangeSelectedFilter(filter): void {
    // prevent event
    event.preventDefault();
    event.stopPropagation();
    if (this.isCheckedFilter(filter)) {
      this.selectedFilters.splice(this._findFilterIndexInSelectedFilters(filter), 1);
    } else {
      this.selectedFilters.push(filter);
    }
  }

  private _findFilterIndexInSelectedFilters(filter): number {
    return this.selectedFilters.findIndex(selectedFilter => selectedFilter.value === filter.value);
  }
}
