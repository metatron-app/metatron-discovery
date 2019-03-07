/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */
package app.metatron.discovery.query.druid.funtions;

import com.google.common.collect.Lists;

import java.util.List;

public class ConcatFunc {

  private static final String FUNC_NAME = "concat";

  List<String> strs;

  public ConcatFunc() {
  }

  public ConcatFunc(String... strs) {
    this.strs = Lists.newArrayList(strs);
  }

  public String toExpression() {
    StringBuilder sb = new StringBuilder();
    sb.append(FUNC_NAME).append("(");
    boolean isFirst = true;
    for (String str : strs) {
      if (isFirst) {
        isFirst = false;
      } else {
        sb.append(",");
      }
      sb.append("'").append(str).append("' ");
    }
    sb.append(")");

    return sb.toString();
  }

}
