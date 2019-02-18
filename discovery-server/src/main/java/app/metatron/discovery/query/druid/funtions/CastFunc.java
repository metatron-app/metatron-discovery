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

package app.metatron.discovery.query.druid.funtions;

public class CastFunc {

  private static final String FUNC_NAME = "cast";

  String fieldName;

  CastType type;

  public CastFunc() {
  }

  public CastFunc(String fieldName, CastType type) {
    this.fieldName = fieldName;
    this.type = type;
  }

  public String toExpression() {
    StringBuilder sb = new StringBuilder();
    sb.append(FUNC_NAME).append("(\"");
    sb.append(fieldName).append("\", '");
    sb.append(type.name());
    sb.append("')");

    return sb.toString();
  }

  public enum CastType {
    STRING, LONG, FLOAT, DOUBLE
  }
}
