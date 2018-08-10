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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.common.exception.BadRequestException;

@JsonTypeName("bound")
public class BoundFilter extends Filter {

  Number min;

  Number max;

  public BoundFilter() {
    // Empty Constructor
  }

  @JsonCreator
  public BoundFilter(@JsonProperty("field") String field,
                     @JsonProperty("ref") String ref,
                     @JsonProperty("min") Number min,
                     @JsonProperty("max") Number max) {
    super(field, ref);
    if(min == null && max == null) {
      throw new BadRequestException("'min' or 'max' required.");
    }

    if(min != null && max != null && min.doubleValue() > max.doubleValue()) {
      throw new BadRequestException("'max' a must be greater than 'min'");
    }

    this.min = min;
    this.max = max;
  }

  public String toExpr() {
    StringBuilder sb = new StringBuilder();

    if(min == null) {
      sb.append(super.getColumn()).append("<=").append(max);
    } else if(max == null) {
      sb.append(super.getColumn()).append(">=").append(min);
    } else {
      sb.append("between(").append(super.getColumn()).append(",")
        .append(min).append(",").append(max).append(")");
    }

    return sb.toString();
  }

  @Override
  public boolean compare(Filter filter) {
    if(!(filter instanceof BoundFilter)) {
      return false;
    }

    if(min == ((BoundFilter) filter).getMin() && max == ((BoundFilter) filter).getMax()) {
      return true;
    }

    return false;
  }

  public Number getMin() {
    return min;
  }

  public Number getMax() {
    return max;
  }
}
