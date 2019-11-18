/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, ElementRef, Injector, Input} from '@angular/core';
import {UIChartDataLabelDisplayType} from '../../../common/component/chart/option/define/common';
import * as _ from 'lodash';
import {ChartUtil} from '../../../common/component/chart/option/util/chart-util';
import {Field} from '../../../domain/workbook/configurations/field/field';
import {TooltipOptionComponent} from '../tooltip-option.component';
import {UIMapOption} from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import {Shelf} from '../../../domain/workbook/configurations/shelf/shelf';
import {TooltipOptionConverter} from '../../../common/component/chart/option/converter/tooltip-option-converter';

@Component({
  selector: 'map-tooltip-option',
  templateUrl: './map-tooltip-option.component.html'
})
export class MapTooltipOptionComponent extends TooltipOptionComponent {

  // selected layer item list
  public selectedLayerItems: Field[] = [];

  // unselected layer item list
  public unselectedLayerItems: Field[] = [];

  // origin unselected layer item list
  public originUnselectedLayerItems: Field[] = [];

  // search input
  public searchText: string;

  // add column show / hide
  public addColumnShowFl: boolean = false;

  public uiOption: UIMapOption;

  @Input('uiOption')
  public set setUiOption(uiOption: UIMapOption) {
    if (!uiOption.toolTip) {
      uiOption.toolTip = {};
    }
    // Set
    this.uiOption = uiOption;
  }

  public shelf: Shelf;

  @Input('shelf')
  public set setShelf(shelf: Shelf) {

    if (!shelf || !shelf.layers || !shelf.layers[this.uiOption.layerNum]) return;

    let layerItems = [];
    // 공간연산 사용 여부
    if (!_.isUndefined(this.uiOption.analysis) && !_.isUndefined(this.uiOption.analysis['use']) && this.uiOption.analysis['use'] === true) {
      // layerItems = _.cloneDeep(shelf.layers[this.uiOption.layerNum].fields);
      let tempFields = shelf.layers[this.uiOption.layerNum].fields;
      for (let fieldIndex = 0; tempFields.length > fieldIndex; fieldIndex++) {
        // 공간연산에 사용된 aggregationType으로 tooltip 설정
        if (tempFields[fieldIndex].name == this.uiOption.analysis.operation.aggregation.column) {
          if (_.isUndefined(this.uiOption.analysis.operation.aggregation.type) && tempFields[fieldIndex].isCustomField == true) {
            // 공간연산에 설정된 default 값인 count 를 사용 할 경우, Measure 에 중첩된 count 이름 값이 있을 경우 전부 삭제 후 한개만 등록
            layerItems = [];
            layerItems.push(tempFields[fieldIndex]);
            break;
          } else if (_.isUndefined(tempFields[fieldIndex].isCustomField)
            || (!_.isUndefined(tempFields[fieldIndex].isCustomField) && tempFields[fieldIndex].isCustomField == false)) {
            layerItems.push(tempFields[fieldIndex]);
          }
        }
      }
    } else {
      for (let layerIndex = 0; this.uiOption.layers.length > layerIndex; layerIndex++) {
        if (shelf && !_.isUndefined(shelf.layers[layerIndex])) {
          shelf.layers[layerIndex].fields.forEach((field) => {
            layerItems.push(field);
          });
        }
      }
    }

    // set alias
    for (const item of layerItems) {
      item['alias'] = ChartUtil.getAlias(item);
    }

    // return shelf list except geo dimension
    let uniqList = TooltipOptionConverter.returnTooltipDataValue(layerItems);

    // tooltip option panel이 첫번째로 열렸는지 여부
    if (_.isUndefined(this.uiOption.toolTip['isFirstOpenTooltipOption'])
      || !_.isUndefined(this.uiOption.toolTip['isFirstOpenTooltipOption']) && this.uiOption.toolTip['isFirstOpenTooltipOption']) {
      this.uiOption.toolTip['isFirstOpenTooltipOption'] = false;
      // set displayColumns
      this.uiOption.toolTip.displayColumns = ChartUtil.returnNameFromField(uniqList);
    }

    this.selectedLayerItems = [];
    this.unselectedLayerItems = [];

    // 선반에는 있지만 displayColumns에 없으면 => unselected list에 설정
    _.each(uniqList, (field) => {

      let alias = ChartUtil.getAlias(field);

      // selected list
      if (-1 !== this.uiOption.toolTip.displayColumns.indexOf(alias)) {

        this.selectedLayerItems.push(field);
        // unselected list
      } else {
        this.unselectedLayerItems.push(field);
      }
    });
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

      field = <any>_.find(this.selectedLayerItems, (field) => {
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
    if (!this.uiOption.toolTip.displayTypes) {
      this.uiOption.toolTip.displayTypes = [];
    }

    // if they are checked, remove them
    let isFind = false;
    _.each(this.uiOption.toolTip.displayTypes, (type, index) => {
      if (_.eq(type, displayType)) {
        isFind = true;
        this.uiOption.toolTip.displayTypes[index] = null;
      }
    });

    // if they are not checked, add them
    if (!isFind) {
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

      this.unselectedLayerItems = _.cloneDeep(this.originUnselectedLayerItems);

      return this.unselectedLayerItems
    }

    this.unselectedLayerItems = this.unselectedLayerItems.filter((item) => {

      if (-1 !== item.name.indexOf(_.trim(this.searchText))) {
        return item;
      }
    });

    return this.unselectedLayerItems
  }

  /**
   * init search column
   */
  public initSearchFields(): void {

    event.stopPropagation();

    this.searchText = '';

    this.unselectedLayerItems = _.cloneDeep(this.originUnselectedLayerItems);
  }

  /**
   * delete selected field
   */
  public deleteSelectedField(index: number): void {

    // delete field
    const deleteField = this.selectedLayerItems.splice(index, 1);

    // set unselected field
    if (deleteField && deleteField.length > 0) {

      this.unselectedLayerItems.push(deleteField[0]);
      this.originUnselectedLayerItems = _.cloneDeep(this.unselectedLayerItems);
    }

    // set name list in displaycolumn
    this.uiOption.toolTip.displayColumns = ChartUtil.returnNameFromField(this.selectedLayerItems);

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
    const index = _.findIndex(this.selectedLayerItems, (field) => {
      return _.eq(alias, ChartUtil.getAggregationAlias(field));
    });

    // if it's duplicate value
    if (-1 !== index) return;

    this.selectedLayerItems.push(item);

    // remove in unselectedLayerItems
    const removeIndex = _.findIndex(this.unselectedLayerItems, (field) => {
      return _.eq(alias, ChartUtil.getAggregationAlias(field));
    });
    this.unselectedLayerItems.splice(removeIndex, 1);
    this.originUnselectedLayerItems = _.cloneDeep(this.unselectedLayerItems);


    // set name list in displaycolumn
    this.uiOption.toolTip.displayColumns = ChartUtil.returnNameFromField(this.selectedLayerItems);

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

  /**
   * return data value name
   * @param item
   * @returns {string}
   */
  public returnDataValueName(item) {
    return ChartUtil.getAlias(item);
  }
}
