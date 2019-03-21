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

public class NativeLikeExp implements NativeExp{
  private String columnName;
  private String value;
  private boolean caseInsensitive = false;

  public NativeLikeExp(String columnName, String value){
    this.columnName = columnName;
    this.value = value;
  }

  public NativeLikeExp(String columnName, String value, boolean caseInsensitive){
    this.columnName = columnName;
    this.value = value;
    this.caseInsensitive = caseInsensitive;
  }

  @Override
  public String toSQL(String implementor) {
    if(caseInsensitive){
      return "LOWER(" + NativeProjection.getQuotedColumnName(implementor, columnName) + ") LIKE '%" + value.toLowerCase() + "%'";
    } else {
      return NativeProjection.getQuotedColumnName(implementor, columnName) + " LIKE '%" + value + "%'";
    }
  }
}
