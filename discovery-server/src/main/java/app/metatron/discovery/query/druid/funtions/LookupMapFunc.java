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

import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Created by kyungtaak on 2017. 4. 27..
 */
public class LookupMapFunc {

  private static final String FUNC_NAME = "lookupMap";

  private static final String PARAM_REPLACE_MISSING_VALUE = "replaceMissingValueWith";
  private static final String PARAM_RETAIN_MISSING_VALUE = "retainMissingValue";

  String column;

  Map<String, String> map;

  Boolean retainMissingValue;

  String replaceMissingValueWith;

  public LookupMapFunc() {
  }

  public LookupMapFunc(String column, Map<String, String> map, Boolean retainMissingValue, String replaceMissingValueWith) {
    this.column = column;
    this.map = map;
    this.retainMissingValue = retainMissingValue;
    this.replaceMissingValueWith = replaceMissingValueWith;
  }

  public String toExpression() {
    StringBuilder sb = new StringBuilder();
    sb.append(FUNC_NAME).append("(");
    sb.append("'").append(GlobalObjectMapper.writeValueAsString(map)).append("'").append(",");
    sb.append(column).append(",");
    sb.append(PARAM_RETAIN_MISSING_VALUE).append("='").append(retainMissingValue).append("'");

    if (replaceMissingValueWith != null) {
      sb.append(",").append(PARAM_REPLACE_MISSING_VALUE).append("='").append(replaceMissingValueWith).append("'");
    }

    sb.append(")");

    return sb.toString();
  }

}
