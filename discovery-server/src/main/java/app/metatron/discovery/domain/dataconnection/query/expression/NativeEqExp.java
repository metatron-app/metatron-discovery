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

package app.metatron.discovery.domain.dataconnection.query.expression;

import org.apache.commons.lang3.StringUtils;

public class NativeEqExp implements NativeExp {
  /**
   * Column name.
   */
  private String columnName;

  /**
   * Compared value.
   */
  private Object value;

  /**
   * @param columnName the column name
   * @param value      the value
   */
  public NativeEqExp(String columnName, Object value) {
    if (StringUtils.isBlank(columnName))
      throw new IllegalStateException("columnName is null!");
    if (value == null)
      throw new IllegalStateException("value is null!");

    this.columnName = columnName;
    this.value = value;
  }

  @Override
  public String toSQL(String implementor) {
    if(value instanceof String){
      return NativeProjection.getQuotedColumnName(implementor, columnName) + " = '" + value + "'";
    } else {
      return NativeProjection.getQuotedColumnName(implementor, columnName) + " = " + value + "";
    }
  }

}
