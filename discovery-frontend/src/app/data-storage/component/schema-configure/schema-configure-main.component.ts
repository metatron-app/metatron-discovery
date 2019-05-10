import {AbstractComponent} from "../../../common/component/abstract.component";
import {Component, ElementRef, Injector, ViewChild} from "@angular/core";
import {ConstantService} from "../../../shared/datasource-metadata/service/constant.service";
import * as _ from 'lodash';
import {EventBroadcaster} from "../../../common/event/event.broadcaster";
import {SchemaConfigureFilterComponent} from "./schema-configure-filter.component";
import {DataStorageConstant} from "../../constant/data-storage-constant";
import {SchemaConfigureFieldListComponent} from "./schema-configure-field-list.component";

@Component({
  selector: 'schema-configure-main',
  templateUrl: 'schema-configure-main.component.html'
})
export class SchemaConfigureMainComponent extends AbstractComponent {

  @ViewChild(SchemaConfigureFilterComponent)
  private readonly _filterComponent: SchemaConfigureFilterComponent;

  @ViewChild(SchemaConfigureFieldListComponent)
  private readonly _fieldListComponent: SchemaConfigureFieldListComponent;

  constructor(private constant: ConstantService,
              private broadCaster: EventBroadcaster,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // remove broadcast
  }

  public init(fieldList): void {
    // init field list
    // this.fieldList = _.cloneDeep(fieldList);
    this._fieldListComponent.init(fieldList);
    this._filterComponent.init(fieldList);
  }

  public getConfigureData() {
    return {
      searchKeyword: this._filterComponent.searchKeyword,
      selectedRoleFilter: this._filterComponent.selectedRoleFilter,
      selectedTypeFilter: this._filterComponent.selectedTypeFilter,

    }
  }

  public initLoadedConfigureData(data): void {
    // set filter
    this._filterComponent.initSelectedFilter(data.searchKeyword, data.selectedRoleFilter, data.selectedTypeFilter);
    // set list

    // set selected field

    // set timestamp
  }
}
