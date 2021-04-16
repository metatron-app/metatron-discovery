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

import * as _ from 'lodash';
import {Field} from '@domain/workbook/configurations/field/field';
import {GeoField} from '@domain/workbook/configurations/field/geo-field';
import {ChartType} from '../define/common';

export class ChartUtil {

  /**
   * Get aggregation filed alias
   * @param field
   */
  public static getAggregationAlias(field: any): string {
    let fieldName: string = !_.isEmpty(field.alias) ? field.alias : field.name;
    if (field['alias'] && field['alias'] !== field.name) {
      fieldName = field['alias'];
    } else {
      // aggregation type과 함께 alias 설정
      const alias: string = field['fieldAlias'] ? field['fieldAlias'] : (field['logicalName'] ? field['logicalName'] : field['name']);
      fieldName = field.aggregationType ? field.aggregationType + `(${alias})` : `${alias}`;
    }
    return fieldName;
  }

  /**
   * return name from fields
   * @param {Field[]} fields
   * @returns {string[]}
   */
  public static returnNameFromField(fields: Field[]): string[] {
    if (!fields || 0 === fields.length) return [];
    const returnList: string[] = [];
    fields.forEach((item) => {
      returnList.push(ChartUtil.getAggregationAlias(item));
    });
    return returnList;
  }

  /**
   * Get field alias
   * @param field
   */
  public static getAlias(field): string {

    let alias1: string = field['name'];
    let alias2: string = field['fieldAlias'] ? field['fieldAlias'] : '';
    const alias3: string = field['pivotAlias'] ? field['pivotAlias'] : '';
    if (field.aggregationType && field.aggregationType !== '') {
      alias1 = field.aggregationType + '(' + alias1 + ')';
      alias2 = alias2 ? field.aggregationType + '(' + alias2 + ')' : '';
    } else if (field.format && field.format.unit && field.format.unit !== '') {
      alias1 = field.format.unit + '(' + alias1 + ')';
      alias2 = alias2 ? field.format.unit + '(' + alias2 + ')' : '';
    }
    return alias3 ? alias3 : alias2 ? alias2 : alias1;
  }

  /**
   * get field name to alias
   * @param {string} name
   * @param layers
   * @param aggregationType
   * @returns {string}
   */
  public static getFieldAlias(name: string, layers: GeoField[], aggregationType?: string): string {

    let alias: string = name;
    _.each(layers, (field) => {
      if (_.eq(name, field['name']) && (!aggregationType || (aggregationType && _.eq(aggregationType, field['aggregationType'])))) {
        alias = ChartUtil.getAlias(field);
        return false;
      }
    });
    return alias;
  }

  /**
   * check using limit option
   * @param type
   */
  public static isUsingLimitOption(type: ChartType) {
    return ChartType.NETWORK !== type && ChartType.SANKEY !== type && ChartType.GAUGE !== type && ChartType.TREEMAP !== type;
  } // function - isUsingLimitOption
}
