import { Component, ElementRef, Injector, Input } from '@angular/core';
import { TooltipOptionComponent } from '../tooltip-option.component';
import { UIOption } from '../../../common/component/chart/option/ui-option';
import { FormatOptionConverter } from '../../../common/component/chart/option/converter/format-option-converter';
import { UIChartDataLabelDisplayType } from '../../../common/component/chart/option/define/common';
import * as _ from 'lodash';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { Field } from '../../../domain/workbook/configurations/field/field';
import { Field as AbstractField } from '../../../domain/datasource/datasource';
import {ChartUtil} from '../../../common/component/chart/option/util/chart-util';

@Component({
  selector: 'map-tooltip-option',
  templateUrl: './map-tooltip-option.component.html'
})
export class MapTooltipOptionComponent extends TooltipOptionComponent {

  // selected column list
  public selectedColumns: Field[] = [];

  // unselected column list
  public unselectedColumns: Field[] = [];

  // origin unselected column list
  public originUnselectedColumns: Field[] = [];

  // search input
  public searchText: string;

  // add column show / hide
  public addColumnShowFl: boolean = false;

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

    this.selectedColumns = _.cloneDeep(pivot.columns.concat(pivot.aggregations));

    // sync columns, fields data
    this.selectedColumns.map((item) => {

      if(item.field && item.field.logicalType) {
        item['logicalType'] = item.field.logicalType;
        item['type'] = item.field.type;
      }
    });

    // if it's not custom field, exclude geo data
    this.selectedColumns = this.selectedColumns.filter((item) => {
      return item['logicalType'] && ('user_expr' == item.type || -1 == item['logicalType'].toString().indexOf('GEO'));
    });

    // remove the columns having same name
    this.selectedColumns = _.uniqBy(this.selectedColumns, 'name');

    if (!this.uiOption.toolTip.displayColumns) this.uiOption.toolTip.displayColumns = [];

    // when displayColumns are empty, set displayColumns
    if (!this.uiOption.toolTip.displayColumns || 0 == this.uiOption.toolTip.displayColumns.length) {

      this.uiOption.toolTip.displayColumns = this.setDisplayColumns(this.selectedColumns);
    // when displayColumns are not empty, set columns by displayColumns
    } else {

      let originSelectedColumns = _.cloneDeep(this.selectedColumns);

      this.selectedColumns = this.setColumns(this.uiOption.toolTip.displayColumns);

      // set removed columns to unselectedColumns
      this.unselectedColumns = <any>_.filter(originSelectedColumns, (item) => {
        if (-1 == _.findIndex(this.selectedColumns, item)) return item;
      });
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

      returnList.push( ChartUtil.getAggregationAlias(item) );
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
    columns.forEach((alias) => {

      field = <any> _.find(this.selectedColumns, (field) => {
        return _.eq(alias, ChartUtil.getAggregationAlias(field));
      });

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
  public toggleDisplayType(displayType: string, typeIndex: number): void {

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
      this.uiOption.toolTip.displayTypes[typeIndex] = UIChartDataLabelDisplayType[displayType];
    }

    // set uiOption
    this.apply();
  }

  /**
   * search column
   */
  public returnSearchFields(): Field[] {

    if (_.isEmpty(_.trim(this.searchText))) {

      this.unselectedColumns = _.cloneDeep(this.originUnselectedColumns);

      return this.unselectedColumns;
    }

    this.unselectedColumns = this.unselectedColumns.filter((item) => {

      if (-1 !== item.name.indexOf(_.trim(this.searchText))) {
        return item;
      }
    });

    return this.unselectedColumns;
  }

  /**
   * init search column
   */
  public initSearchFields(): void {

    event.stopPropagation();

    this.searchText = '';

    this.unselectedColumns = _.cloneDeep(this.originUnselectedColumns);
  }

  /**
   * delete selected field
   */
  public deleteSelectedField(index: number): void {

    // delete field
    const deleteField = this.selectedColumns.splice(index, 1);

    // set unselected field
    if (deleteField && deleteField.length > 0) {

      this.unselectedColumns.push(deleteField[0]);
      this.originUnselectedColumns = _.cloneDeep(this.unselectedColumns);
    }

    // set name list in displaycolumn
    this.uiOption.toolTip.displayColumns = this.setDisplayColumns(this.selectedColumns);

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

    let alias = ChartUtil.getAggregationAlias(item);
    const index = _.findIndex(this.selectedColumns, (field) => {
      return _.eq(alias, ChartUtil.getAggregationAlias(field));
    });

    // if it's duplicate value
    if (-1 !== index) return;

    this.selectedColumns.push(item);

    // remove in unselectedColumns
    const removeIndex = _.findIndex(this.unselectedColumns, (field) => {
      return _.eq(alias, ChartUtil.getAggregationAlias(field));
    });
    this.unselectedColumns.splice(removeIndex, 1);
    this.originUnselectedColumns = _.cloneDeep(this.unselectedColumns);


    // set name list in displaycolumn
    this.uiOption.toolTip.displayColumns = this.setDisplayColumns(this.selectedColumns);

    // set uiOption
    this.apply();
  }

  /**
   * return tooltip type boolean value
   * @returns {boolean}
   */
  public returnMapTooltip(tooltipType: string): boolean {

    if (this.uiOption.toolTip.displayTypes &&
        -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType[tooltipType])) {

      return true;
    }

    return false;
  }
}
