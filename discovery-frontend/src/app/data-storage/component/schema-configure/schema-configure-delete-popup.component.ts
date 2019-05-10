import {Component, ElementRef, Injector} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {Field} from "../../../domain/datasource/datasource";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import * as _ from 'lodash';

@Component({
  selector: 'schema-configure-delete-popup',
  templateUrl: 'schema-configure-delete-popup.component.html'
})
export class SchemaConfigureDeletePopupComponent extends AbstractComponent {

  private _fieldList;
  private _checkedFieldList;

  public isShowPopup: boolean;

  constructor(private broadCaster: EventBroadcaster,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subscriptions.push(
      // changed field list
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST).subscribe((fieldList: Field[]) => {
        this._fieldList = _.cloneDeep(fieldList);
        // change checked field list
        this._checkedFieldList = this._fieldList.filter(field => Field.isCheckedField(field));
      })
    );
  }

  public openPopup(): void {
    this.isShowPopup = true;
  }

  public closePopup(): void {
    this.isShowPopup = false;
  }

  public deleteFieldList(): void {
    // set remove field
    this._checkedFieldList.forEach(field => {
      Field.setRemoveField(field);
      Field.setUndoCheckField(field);
    });
    // changed field list
    this._changedFieldList();
    // close popup
    this.closePopup();
  }

  private _changedFieldList(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST, this._fieldList);
  }
}
