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

package app.metatron.discovery.domain.workbook.configurations.filter;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("expr")
public class ExpressionFilter extends Filter {

  String expr;

  public ExpressionFilter() {
    // Empty Constructor
  }

  public ExpressionFilter(String expr) {
    this.expr = expr;
  }

  @Override
  public boolean compare(Filter filter) {
    if(!(filter instanceof ExpressionFilter)) {
      return false;
    }

    if(expr != null && expr.equals(((ExpressionFilter) filter).getExpr())) {
      return true;
    }

    return false;
  }

  public String getExpr() {
    return expr;
  }

  public void setExpr(String expr) {
    this.expr = expr;
  }
}
