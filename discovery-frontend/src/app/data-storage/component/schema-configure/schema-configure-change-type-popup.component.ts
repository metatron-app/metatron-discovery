import {Component, ElementRef, Injector} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {Field} from "../../../domain/datasource/datasource";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import {Type} from "../../../shared/datasource-metadata/domain/type";
import * as _ from 'lodash';

@Component({
  selector: 'schema-configure-change-type-popup',
  templateUrl: 'schema-configure-change-type-popup.component.html'
})
export class SchemaConfigureChangeTypePopupComponent extends AbstractComponent {

  private _dataList;

  public readonly roleList = this.constant.getRoleTypeFiltersExceptAll();
  public selectedRole;
  public typeList = this.constant.getTypeFiltersInDimension();
  public selectedType;

  private _fieldList;
  private _checkedFieldList;

  public isShowPopup: boolean;

  public isExistCreatedFieldInCheckedFieldList: boolean;
  public isExistTimestampFieldInCheckedFieldList: boolean;

  constructor(private broadCaster: EventBroadcaster,
              private constant: ConstantService,
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
        // set exist created field in checked field list
        this.isExistCreatedFieldInCheckedFieldList = this._checkedFieldList.some(field => Field.isCreatedField(field));
        // set exist timestamp field in checked field list
        this.isExistTimestampFieldInCheckedFieldList = this._checkedFieldList.some(field => Field.isTimestampTypeField(field));
      }),
      // changed data list
      this.broadCaster.on(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_DATA_LIST).subscribe((dataList) => {
        this._dataList = _.cloneDeep(dataList);
      })
    );
  }

  public openPopup(): void {
    this.isShowPopup = true;
  }

  public closePopup(): void {
    this.isShowPopup = false;
  }

  public changeFieldList(): void {
    // set change field
    this._checkedFieldList.forEach(field => {

      Field.setUndoCheckField(field);
    });
    // changed field list
    this._changedFieldList();
    // close popup
    this.closePopup();
  }

  private _changeTypeList(): void {
    if (this.selectedRole.value === Type.Role.DIMENSION) {

    } else if (this.selectedRole.value === Type.Role.MEASURE) {
      this.typeList = this.constant.getTypeFiltersInMeasure();
    }
  }

  private _changedFieldList(): void {
    this.broadCaster.broadcast(DataStorageConstant.Datasource.BroadcastKey.DATASOURCE_CHANGED_FIELD_LIST, this._fieldList);
  }

  private _initView(): void {

  }
}
