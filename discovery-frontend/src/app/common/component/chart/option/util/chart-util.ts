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
      const alias: string = field['fieldAlias'] ? field['fieldAlias'] : ( field['logicalName'] ? field['logicalName'] : field['name'] );
      fieldName = field.aggregationType ? field.aggregationType + `(${alias})` : `${alias}`;
    }
    return fieldName;
  }
}
