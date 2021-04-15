import * as _ from 'lodash';
import {Subject} from 'rxjs';
import {Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: 'component-check-filter',
  templateUrl: 'check-box-filter.component.html'
})
export class CheckBoxFilterComponent extends AbstractComponent implements OnInit {
  @Input() readonly filterName: string;
  @Input() readonly filterList;
  @Input() readonly selectedFilters = [];
  @Input() filterFlags: Subject<{}>;

  isShowFilterList: boolean;

  @Output() readonly changedFilter = new EventEmitter();

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.filterFlags.subscribe((flags) => {
      this.isShowFilterList = flags[FilterTypes.DATA_TYPE];
    });
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
      this.isShowFilterList = false;
    }
  }

  onChangeShowFilterList(): void {
    event.stopPropagation();
    event.stopImmediatePropagation();
    const filterFlags = {};

    // make flag false except source type flag
    Object.keys(FilterTypes).forEach((key) => {
      if (key === FilterTypes.DATA_TYPE) {
        filterFlags[key] = !this.isShowFilterList;
      } else {
        filterFlags[key] = false;
      }
    });

    this.filterFlags.next(filterFlags);
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
    this.changedFilter.emit(this.selectedFilters);
  }

  private _findFilterIndexInSelectedFilters(filter): number {
    return this.selectedFilters.findIndex(selectedFilter => selectedFilter.value === filter.value);
  }
}

enum FilterTypes {
  DATA_TYPE = 'DATA_TYPE',
  UPDATED_TIME = 'UPDATED_TIME'
}
