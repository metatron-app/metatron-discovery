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

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;

import java.util.List;

public class InFunc {

  private static final String FUNC_NAME = "in";

  String field;

  boolean isNumeric;

  List<String> values;

  public InFunc() {
    // Empty Constructor
  }

  public InFunc(String field, List<String> values) {
    this.field = field;
    if(CollectionUtils.isEmpty(values)) {
      throw new IllegalArgumentException("Value list required.");
    }
    this.values = values;
  }

  public InFunc(String field, String... values) {
    this(field, Lists.newArrayList(values));
  }

  public String toExpression() {
    StringBuilder sb = new StringBuilder();
    sb.append(FUNC_NAME).append("(");
    sb.append(field);

    for(String value : values) {
      sb.append(", '").append(value).append("'");
    }
    sb.append(")");

    return sb.toString();
  }
}
