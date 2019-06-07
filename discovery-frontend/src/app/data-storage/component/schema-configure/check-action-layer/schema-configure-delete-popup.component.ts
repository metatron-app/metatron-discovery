import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {EventBroadcaster} from "../../../../common/event/event.broadcaster";
import {Field} from "../../../../domain/datasource/datasource";
import {DataStorageConstant} from "../../../constant/data-storage-constant";

@Component({
  selector: 'schema-configure-delete-popup',
  templateUrl: 'schema-configure-delete-popup.component.html'
})
export class SchemaConfigureDeletePopupComponent extends AbstractComponent {

  @Input('checkedFieldList')
  private readonly _checkedFieldList;

  @Output()
  public readonly removedFieldListEvent = new EventEmitter();

  public isShowPopup: boolean;

  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Open popup
   */
  public openPopup(): void {
    this.isShowPopup = true;
  }

  /**
   * Close popup
   */
  public closePopup(): void {
    this.isShowPopup = false;
  }

  /**
   * Delete checked field list
   */
  public deleteCheckedFieldList(): void {
    // set remove field
    this._checkedFieldList.forEach(field => {
      Field.setRemoveField(field);
      Field.setUndoCheckField(field);
    });
    // emit
    this.removedFieldListEvent.emit();
    // close popup
    this.closePopup();
  }
}
