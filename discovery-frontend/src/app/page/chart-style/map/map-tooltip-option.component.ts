import { Component, ElementRef, Injector, Input } from '@angular/core';
import { TooltipOptionComponent } from '../tooltip-option.component';
import { UIOption } from '../../../common/component/chart/option/ui-option';
import { FormatOptionConverter } from '../../../common/component/chart/option/converter/format-option-converter';
import { UIChartDataLabelDisplayType } from '../../../common/component/chart/option/define/common';
import * as _ from 'lodash';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { Field } from '../../../domain/workbook/configurations/field/field';
import { Field as AbstractField } from '../../../domain/datasource/datasource';

@Component({
  selector: 'map-tooltip-option',
  templateUrl: './map-tooltip-option.component.html'
})
export class MapTooltipOptionComponent extends TooltipOptionComponent {

  // column list
  public columns: Field[];

  // search input
  public searchText: string;

  // filtered fields
  public fields: AbstractField[];

  // original fields
  public originalFields: AbstractField[];

  // add column show / hide
  public addColumnShowFl: boolean = false;

  @Input('fields')
  public set setFields(fields: AbstractField[]) {

    let deepFields = _.cloneDeep(fields);

    // if it's not custom field, exclude geo data
    deepFields = deepFields.filter((item) => {
      return 'user_expr' == item.type || -1 == item.logicalType.toString().indexOf('GEO');
    });

    this.originalFields = deepFields;

    this.fields = deepFields;
  }

  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    if( !uiOption.toolTip ) {
      uiOption.toolTip = {};
    }

    // init displayTypes
    if (!uiOption.toolTip.displayTypes) {
      uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);
    }

    // Set
    this.uiOption = uiOption;
  }

  @Input('pivot')
  public set setPivot(pivot: Pivot) {

    if (!pivot || !pivot.columns) return;

    this.columns = _.cloneDeep(pivot.columns);

    // sync columns, fields data
    this.columns.map((item) => {

      if(item.field) {
        item['logicalType'] = item.field.logicalType;
        item['type'] = item.field.type;
      }
    });

    // if it's not custom field, exclude geo data
    this.columns = this.columns.filter((item) => {
      return 'user_expr' == item.type || -1 == item['logicalType'].toString().indexOf('GEO');
    });

    if (!this.uiOption.toolTip.displayColumns) this.uiOption.toolTip.displayColumns = [];

    // when displayColumns are empty, set displayColumns
    if (!this.uiOption.toolTip.displayColumns || 0 == this.uiOption.toolTip.displayColumns.length) {
      this.uiOption.toolTip.displayColumns = this.setDisplayColumns(this.columns);

    // when displayColumns are not empty, set columns by displayColumns
    } else {

      this.columns = this.setColumns(this.uiOption.toolTip.displayColumns);
    }
  }

  /**
   * return pivot name as string array
   * @param {Field[]} mapPivot
   * @returns {string[]}
   */
  private setDisplayColumns(mapPivot: Field[]): string[] {

    if (!mapPivot || 0 == mapPivot.length) return [];

    let returnList: string[] = [];

    mapPivot.forEach((item) => {

      returnList.push(item.name);
    });

    return returnList;
  }

  /**
   * return columns matching with string array
   * @param {string[]} columns
   * @returns {Field[]}
   */
  private setColumns(columns: string[]): Field[] {

    let fields: Field[] = [];

    let field: Field;
    columns.forEach((name) => {

      field = <any> _.find(this.originalFields, {'name' : name});

      if (field) fields.push(field);
    });

    return fields;
  }

  // constructor
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /**
   * toogle tooltip
   * @param displayType
   * @param typeIndex
   */
  public toggleDisplayType(displayType: UIChartDataLabelDisplayType, typeIndex: number): void {

    // initialize
    if( !this.uiOption.toolTip.displayTypes ) {
      this.uiOption.toolTip.displayTypes = [];
    }

    // if they are checked, remove them
    let isFind = false;
    _.each(this.uiOption.toolTip.displayTypes, (type, index) => {
      if( _.eq(type, displayType) ) {
        isFind = true;
        this.uiOption.toolTip.displayTypes[index] = null;
      }
    });

    // if they are not checked, add them
    if( !isFind ) {
      this.uiOption.toolTip.displayTypes[typeIndex] = displayType;
    }

    // set uiOption
    this.apply();
  }

  /**
   * search column
   */
  public returnSearchFields(): AbstractField[] {

    if (_.isEmpty(_.trim(this.searchText))) {

      this.fields = _.cloneDeep(this.originalFields);

      return this.fields;
    }

    this.fields = this.fields.filter((item) => {

      if (-1 !== item.name.indexOf(_.trim(this.searchText))) {
        return item;
      }
    });

    return this.fields;
  }

  /**
   * init search column
   */
  public initSearchFields(): void {

    this.searchText = '';

    this.fields = _.cloneDeep(this.originalFields);
  }

  /**
   * delete selected field
   */
  public deleteSelectedField(index: number): void {

    // delete field
    this.columns.splice(index, 1);

    // set name list in displaycolumn
    this.uiOption.toolTip.displayColumns = this.setDisplayColumns(this.columns);

    // set uiOption
    this.apply();
  }

  /**
   * toggle add column
   */
  public toggleAddColumn(): void {

    event.stopPropagation();

    this.addColumnShowFl = !this.addColumnShowFl;
  }

  /**
   * set selected columns
   */
  public addColumn(item: Field): void {

    event.stopPropagation();

    const index = _.findIndex(this.columns, {'name': item.name});

    // if it's duplicate value
    if (-1 !== index) return;

    this.columns.push(item);

    // set name list in displaycolumn
    this.uiOption.toolTip.displayColumns = this.setDisplayColumns(this.columns);

    // set uiOption
    this.apply();
  }
}
