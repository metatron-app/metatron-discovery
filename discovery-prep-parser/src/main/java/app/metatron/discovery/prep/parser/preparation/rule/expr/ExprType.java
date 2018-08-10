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

package app.metatron.discovery.prep.parser.preparation.rule.expr;

import org.apache.commons.lang3.StringUtils;

public enum ExprType {
  DOUBLE, LONG, STRING, BOOLEAN, TIMESTAMP;

  public static ExprType bestEffortOf(String name) {
    if (StringUtils.isEmpty(name)) {
      return STRING;
    }
    switch (name.toUpperCase()) {
      case "FLOAT":
      case "DOUBLE":
        return DOUBLE;
      case "BYTE":
      case "SHORT":
      case "INT":
      case "INTEGER":
      case "LONG":
      case "BIGINT":
        return LONG;
      case "BOOLEAN":
        return BOOLEAN;
      case "TIMESTAMP":
      case "DATETIME":
        return TIMESTAMP;
      default:
        return STRING;
    }
  }
}
