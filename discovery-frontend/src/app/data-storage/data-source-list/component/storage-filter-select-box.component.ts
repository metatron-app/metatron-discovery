import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";

@Component({
  selector: 'storage-filter-select-box',
  templateUrl: 'storage-filter-select-box.component.html',
  host: {
    '(document:click)': 'onClickHost($event)',
  },
})
export class StorageFilterSelectBoxComponent extends AbstractComponent {

  @Output('changedFilter')
  private _changedFilter: EventEmitter<any> = new EventEmitter();

  @Input()
  public filterList: any;

  @Input()
  public selectedFilter: any;

  // select list show/hide flag
  public isListShow: boolean;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * 컴포넌트 내부  host 클릭이벤트 처리
   * @param event
   */
  public onClickHost(event: MouseEvent) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // close
      this.isListShow = false;
    }
  }

  public onChangedFilter(filter: any): void {
    // change filter
    this.selectedFilter = filter;
    // event emit
    this._changedFilter.emit(filter);
  }
}
